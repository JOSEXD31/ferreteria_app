import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { rol, ord_id, descripcion, fecha_asignacion, prioridad, tec_id, per_id, cli_id, tip_id } = await req.json();

    if (rol !== "administrador" && rol !== "oficina") {
      return NextResponse.json({ error: "No autorizado para editar esta orden" }, { status: 403 });
    }

    const ordenActualizada = await prisma.orden_trabajo.update({
      where: { ord_id: parseInt(ord_id) },
      data: {
        ord_descripcion: descripcion,
        ord_fecha_asignacion: new Date(fecha_asignacion),
        ord_prioridad: prioridad,
        tec_id: tec_id,
        per_id: parseInt(per_id),
        cli_id: cli_id,
        tip_id: parseInt(tip_id),
      },
    });

    return NextResponse.json({
      message: "Orden actualizada correctamente",
      orden: ordenActualizada,
    });
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
