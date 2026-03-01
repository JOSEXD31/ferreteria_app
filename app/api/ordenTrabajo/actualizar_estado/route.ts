import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { ord_id, estado } = await req.json();

    console.log("Actualizando orden:", ord_id, "Nuevo estado:", estado);

    // Convertimos a números enteros
    const ordIdParsed = parseInt(ord_id, 10);
    const estadoParsed = parseInt(estado, 10);

    if (estadoParsed === 3) {

      // Obtener la orden de trabajo actualizada
      const ordenTrabajo = await prisma.orden_trabajo.findUnique({
        where: { ord_id: ordIdParsed },
        include: {
          contrato: true, // Incluir el contrato asociado
          tipo_trabajo: true, // Incluir el tipo de trabajo asociado
        },
      });

      if (!ordenTrabajo) {
        return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 });
      }

      const { contrato, tipo_trabajo } = ordenTrabajo;



      // Comprobamos el tipo de trabajo para ejecutar lógica adicional
      if (tipo_trabajo.tip_nombre === "CORTE POR DEUDA") {
        // Ejecutar el procedimiento almacenado "generar_deuda_x_corte"
        await prisma.$executeRaw`CALL generar_deuda_x_corte(NOW(), ${contrato?.num_con})`;

        // Actualizar el estado del contrato a 0
        await prisma.contrato.update({
          where: { num_con: contrato?.num_con },
          data: { estado: 0 },
        });

        // Crear una deuda por reconexión
        await prisma.deuda.create({
          data: {
            ano_mes: "0000-00",
            descripcion: "RECONEXION",
            monto: 10,
            saldo_pendiente: 10,
            estado: "ACTIVO",
            num_con: contrato?.num_con!,
            obs: "POR CORTE",
          },
        });
      } else if (tipo_trabajo.tip_nombre === "CORTE VOLUNTARIO") {

        // Actualizar el estado del contrato a 0
        await prisma.contrato.update({
          where: { num_con: contrato?.num_con },
          data: { estado: 0 },
        });

        // Crear una deuda por reconexión solo
        await prisma.deuda.create({
          data: {
            ano_mes: "0000-00",
            descripcion: "RECONEXION",
            monto: 10,
            saldo_pendiente: 10,
            estado: "ACTIVO",
            num_con: contrato?.num_con!,
            obs: "POR CORTE VOLUNTARIO",
          },
        });
      } else if (tipo_trabajo.tip_nombre === "RECONEXION") {
        // Ejecutar el procedimiento almacenado "generar_deuda_x_reconexion"
        await prisma.$executeRaw`CALL generar_deuda_x_reconexion(NOW(), ${contrato?.num_con})`;
      } else if (tipo_trabajo.tip_nombre === "INSTALACION") {
        // Ejecutar el procedimiento almacenado "generar_deuda_x_instalacion"
        await prisma.$executeRaw`CALL generar_deuda_x_instalacion(NOW(), ${contrato?.num_con})`;
      }

function getLocalDate(offsetInHours = -5) {
  const now = new Date();
  const localTimestamp = now.getTime() + offsetInHours * 60 * 60 * 1000;
  return new Date(localTimestamp);
}

      // Actualizar estado de la orden de trabajo
      const ordenActualizada = await prisma.orden_trabajo.update({
        where: { ord_id: ordIdParsed },
        data: {
          ord_estado: estadoParsed,
          ord_fecha_finalizacion: getLocalDate(),
        },
      });
      return NextResponse.json({
        message: "Estado de la orden actualizado correctamente",
        orden: {
          ...ordenActualizada,
          ord_id: ordenActualizada.ord_id.toString(), // Convertir BigInt a string
        },
      });
    } else if (estadoParsed === 2) {
      // Actualizar estado de la orden de trabajo
      const ordenActualizada = await prisma.orden_trabajo.update({
        where: { ord_id: ordIdParsed },
        data: {
          ord_estado: estadoParsed,
        },
      });
      return NextResponse.json({
        message: "Estado de la orden actualizado correctamente",
        orden: {
          ...ordenActualizada,
          ord_id: ordenActualizada.ord_id.toString(), // Convertir BigInt a string
        },
      });
    }

  } catch (error) {
    console.error("Error al actualizar el estado de la orden:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
