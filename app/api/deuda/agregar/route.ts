import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { tipo, mes, ano, num_con, detalle, monto } = await req.json();

    if (!tipo) return NextResponse.json({ error: "Seleccione un tipo de deuda" }, { status: 400 });
    if (!num_con) return NextResponse.json({ error: "Falta el número de contrato" }, { status: 400 });

    let ano_mes = "0000-00";
    let descripcion = "";
    let montoFinal = 0;
    let saldo_pendiente = 0;
    let estado = "ACTIVO";
    let id_servicio: number | null = null;
    let obs = "";

    // Obtener contrato y servicio si existe
    const contrato = await prisma.contrato.findUnique({
      where: { num_con },
      include: { servicio: true },
    });

    // Validación RECONEXIÓN
    if (tipo === "RECONEXION") {
      descripcion = `RECONEXION ${mes}`;
      montoFinal = 10;
      saldo_pendiente = 10;
      obs = "MANUAL POR CORTE";
    }

    // Validación MENSUALIDAD
    else if (tipo === "MENSUALIDAD") {
      if (!mes) return NextResponse.json({ error: "Debe seleccionar el mes" }, { status: 400 });

      if (!contrato || !contrato.servicio) {
        return NextResponse.json({ error: "No se encontró servicio asociado al contrato" }, { status: 400 });
      }

      const currentYear = ano ? parseInt(ano) : new Date().getFullYear();

      const mesesMap: { [key: string]: string } = {
        "ENERO": "01",
        "FEBRERO": "02",
        "MARZO": "03",
        "ABRIL": "04",
        "MAYO": "05",
        "JUNIO": "06",
        "JULIO": "07",
        "AGOSTO": "08",
        "SEPTIEMBRE": "09",
        "OCTUBRE": "10",
        "NOVIEMBRE": "11",
        "DICIEMBRE": "12"
      };

      const mesNumerico = mesesMap[mes.toUpperCase()];

      if (!mesNumerico) {
        return NextResponse.json({ error: "Mes inválido" }, { status: 400 });
      }

      const mesFormato = `${currentYear}-${mesNumerico}`;
      ano_mes = mesFormato;

      // Validar duplicados
      const deudaExistente = await prisma.deuda.findFirst({
        where: {
          ano_mes,
          num_con,
          estado: {
            in: ["ACTIVO", "PAGADO", "RESTANTE"],
          },
        },
      });

      if (deudaExistente) {
        return NextResponse.json(
          { error: "Ya existe una deuda para ese mes y contrato" },
          { status: 400 }
        );
      }

      descripcion = `${contrato.servicio.serv_nombre} ${mes.toUpperCase()} DE ${currentYear}`;
      montoFinal = Number(contrato.servicio.serv_precio);
      saldo_pendiente = montoFinal;
      id_servicio = contrato.servicio.serv_id;
      obs = "MENSUALIDAD INDEPENDIENTE";
    }

    // Validación OTROS
    else if (tipo === "OTROS") {
      if (!detalle || !monto) {
        return NextResponse.json(
          { error: "Debe especificar detalle y monto para OTROS" },
          { status: 400 }
        );
      }
      descripcion = detalle;
      montoFinal = parseFloat(monto);
      saldo_pendiente = montoFinal;
      obs = "OTROS";
    }

    // Crear deuda
    const deuda = await prisma.deuda.create({
      data: {
        ano_mes,
        descripcion,
        monto: montoFinal,
        saldo_pendiente,
        estado,
        id_servicio,
        num_con,
        obs,
      },
    });

    return NextResponse.json({ deuda });
  } catch (error) {
    console.error("Error al registrar deuda:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
