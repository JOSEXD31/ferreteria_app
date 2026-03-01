import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


const obtenerNombreMes = (fecha: Date): string => {
  const meses = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"
  ];
  const mes = fecha.getMonth(); // 0-11
  const anio = fecha.getFullYear();
  return `${meses[mes]} DE ${anio}`;
};

export async function POST(req: NextRequest) {
  try {
    const {
      descripcion,
      fecha_asignacion,
      prioridad,
      tec_id,
      per_id,
      num_con,
      tip_id,
      servicio_nuevo,
    } = await req.json();

    const fechaAsign = new Date(fecha_asignacion); 

    console.log("📅 Fecha original enviada:", fecha_asignacion);
    console.log("🕓 Fecha procesada (fechaAsign):", fechaAsign.toISOString());

    // Obtener tipo de trabajo
    const tipoTrabajo = await prisma.tipo_trabajo.findUnique({
      where: { tip_id: parseInt(tip_id) },
    });

    if (!tipoTrabajo) {
      return NextResponse.json({ error: "Tipo de trabajo no encontrado" }, { status: 400 });
    }

    const esCambioDePlan = tipoTrabajo.tip_nombre?.toUpperCase() === "CAMBIO DE PLAN";
    const esCorteVoluntario = tipoTrabajo.tip_nombre?.toUpperCase() === "CORTE VOLUNTARIO";

    // Obtener técnico
    let tecnicoAsignado = tec_id;
    if (esCambioDePlan) {
      const anyTec = await prisma.tecnico.findFirst();
      if (!anyTec) {
        return NextResponse.json({ error: "No hay técnicos disponibles" }, { status: 400 });
      }
      tecnicoAsignado = anyTec.tec_id;
    }

    // Crear la orden
    const orden = await prisma.orden_trabajo.create({
      data: {
        ord_descripcion: descripcion,
        ord_fecha_asignacion: fechaAsign,
        ord_fecha_finalizacion: esCambioDePlan ? fechaAsign : undefined,
        ord_estado: esCambioDePlan ? 3 : 1, // Finalizada si es cambio de plan, pendiente si no
        ord_prioridad: prioridad,
        tec_id: tecnicoAsignado,
        per_id: parseInt(per_id),
        num_con,
        tip_id: parseInt(tip_id),
      },
    });

    // Lógica adicional para CAMBIO DE PLAN
    if (esCambioDePlan) {
      try {
        const contrato = await prisma.contrato.findUnique({ where: { num_con } });
        if (!contrato) throw new Error("Contrato no encontrado");

        const servicioAnteriorId = contrato.id_serv!;
        const servicioNuevoId = parseInt(servicio_nuevo);

        const anoMes = `${fechaAsign.getFullYear()}-${String(fechaAsign.getMonth() + 1).padStart(2, "0")}`;
        const daysTotal = new Date(fechaAsign.getFullYear(), fechaAsign.getMonth() + 1, 0).getDate();
        const daysTranscurridos = fechaAsign.getDate();
        const daysRestantes = daysTotal - daysTranscurridos;

        const deudaExistente = await prisma.deuda.findFirst({
          where: { num_con, ano_mes: anoMes, estado: "ACTIVO" },
        });

        const servicioAnterior = await prisma.servicio.findUnique({ where: { serv_id: servicioAnteriorId } });
        const servicioNuevo = await prisma.servicio.findUnique({ where: { serv_id: servicioNuevoId } });
        if (!servicioAnterior || !servicioNuevo) throw new Error("Servicios no encontrados");

        const calcularMonto = (monto: number, dias: number): number => {
          const bruto = (monto / daysTotal) * dias;
          return Math.floor(bruto * 10) / 10; // Truncar a 1 decimal
        };

        const descripcionMes = obtenerNombreMes(fechaAsign);

        if (deudaExistente) {
          await prisma.deuda.update({
            where: { id_deuda: deudaExistente.id_deuda },
            data: {
              descripcion: `${servicioAnterior.serv_nombre} ${descripcionMes.toUpperCase()} x${daysTranscurridos} días`,
              monto: calcularMonto(Number(deudaExistente.monto), daysTranscurridos),
              saldo_pendiente: calcularMonto(Number(deudaExistente.monto), daysTranscurridos),
              obs: "POR CAMBIO DE PLAN"
            },
          });
        } else {
          await prisma.deuda.create({
            data: {
              num_con,
              id_servicio: servicioAnteriorId,
              ano_mes: anoMes,
              descripcion: `${servicioAnterior.serv_nombre} ${descripcionMes.toUpperCase()} x${daysTranscurridos} días`,
              monto: calcularMonto(Number(servicioAnterior.serv_precio), daysTranscurridos),
              saldo_pendiente: calcularMonto(Number(servicioAnterior.serv_precio), daysTranscurridos),
              estado: "ACTIVO",
              obs: "POR CAMBIO DE PLAN"
            },
          });
        }

        await prisma.deuda.create({
          data: {
            num_con,
            id_servicio: servicioNuevoId,
            ano_mes: anoMes,
            descripcion: `${servicioNuevo.serv_nombre} ${descripcionMes.toUpperCase()} x${daysRestantes} días`,
            monto: calcularMonto(Number(servicioNuevo.serv_precio), daysRestantes),
            saldo_pendiente: calcularMonto(Number(servicioNuevo.serv_precio), daysRestantes),
            estado: "ACTIVO",
            obs: "POR CAMBIO DE PLAN"
          },
        });

        await prisma.contrato.update({
          where: {
            num_con,
          },
          data: {
            id_serv: servicioNuevoId,
          }
        });
      } catch (deudaError) {
        console.error("⚠️ Error manejando deudas:", deudaError);
      }
    }


    // Lógica adicional para CORTE VOLUNTARIO
    if (esCorteVoluntario) {

      const fechadecorte = fecha_asignacion.toString().slice(0, 10);
      try {
        await prisma.$executeRawUnsafe(`
          CALL generar_deuda_x_corte('${fechadecorte}', '${num_con}');
        `);
      } catch (error) {
        console.error("⚠️ Error al ejecutar generar_deuda_x_corte:", error);
      }
    }

    return NextResponse.json({
      orden: {
        ...orden,
        ord_id: Number(orden.ord_id),
      },
    });

  } catch (error) {
    console.error("❌ Error general al crear orden:", error);
    return NextResponse.json({ error: "Error en el servidor" }, { status: 500 });
  }
}


// GET: Listar ordenes
export async function GET() {
  try {
    const ordenes = await prisma.orden_trabajo.findMany({
      include: {
        contrato: {
          include: {
            cliente: true,
          }
        },
        tipo_trabajo: true,
        tecnico: {
          include: {
            usuario: true,
          }
        },

      },
    });

    const result = ordenes.map((orden) => {
      const cliente = orden.contrato?.cliente;
      let clientName = "";

      if (cliente) {
        if (cliente.cli_tipo === "NATURAL") {
          clientName = `${cliente.cli_nombre} ${cliente.cli_apellido || ""}`.trim();
        } else if (cliente.cli_tipo === "JURIDICA") {
          clientName = cliente.cli_razonsoci || "";
        }
      }

      return {
        id: `${orden.ord_id}`,
        client: clientName,
        type: orden.tipo_trabajo.tip_nombre,
        status: getEstadoTexto(orden.ord_estado),
        priority: orden.ord_prioridad,
        technician: `${orden.tecnico.usuario.usu_nombre}`,
        createdDate: orden.ord_fecha_creacion
          ? orden.ord_fecha_creacion.toISOString().replace("T", " ").replace("Z", "")
          : "",
        scheduledDate: orden.ord_fecha_asignacion
          ? orden.ord_fecha_asignacion.toISOString().replace("T", " ").replace(":00.000Z", "")
          : "",

        description: orden.ord_descripcion || "",
        address: cliente?.cli_direccion || "",
        id_tec: orden.tec_id
      };
    });


    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener órdenes de trabajo:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Función opcional para traducir estado
function getEstadoTexto(estado?: number | null): string {
  switch (estado) {
    case 1:
      return "Pendiente";
    case 2:
      return "En proceso";
    case 3:
      return "Finalizado";
    case 4:
      return "Cancelada";
    default:
      return "Desconocido";
  }
}