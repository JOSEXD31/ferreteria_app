import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contratos = await prisma.contrato.findMany({
      where: {
        estado: 1, // solo contratos activos
        /*servicio: {
          serv_tipo: "PLAN", // solo servicios que son PLAN
        },*/
      },
      include: {
        servicio: true,
      },
    });

    // Agrupar por nombre de servicio
    const resumen = contratos.reduce((acc, contrato) => {
      const nombreServicio = contrato.servicio?.serv_nombre ?? "Servicio desconocido";

      if (!acc[nombreServicio]) {
        acc[nombreServicio] = 1;
      } else {
        acc[nombreServicio]++;
      }

      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(
      Object.entries(resumen).map(([servicio, cantidad], index) => ({
        type: servicio,
        count: cantidad,
      }))
    );

  } catch (error) {
    console.error("Error al obtener datos:", error);
    return NextResponse.json(
      { error: "Error al obtener datos" },
      { status: 500 }
    );
  }
}
