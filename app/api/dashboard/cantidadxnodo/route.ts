import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contratos = await prisma.contrato.findMany({
      where: { estado: 1 }, // Solo contratos activos
      include: {
        caja: {
          include: {
            nodo: true,
          },
        },
      },
    });

    // Agrupar por nodo
    const conteoPorNodo: Record<string, number> = {};

    contratos.forEach((contrato) => {
      const nodoNombre = contrato.caja?.nodo?.nombre || "Sin nodo";
      conteoPorNodo[nodoNombre] = (conteoPorNodo[nodoNombre] || 0) + 1;
    });

    const resultado = Object.entries(conteoPorNodo).map(([nodo, cantidad]) => ({
      nodo,
      cantidad,
    }));

    return NextResponse.json(resultado);
  } catch (error) {
    console.error("Error al obtener contratos por nodo:", error);
    return NextResponse.json(
      { error: "Error al obtener datos" },
      { status: 500 }
    );
  }
}
