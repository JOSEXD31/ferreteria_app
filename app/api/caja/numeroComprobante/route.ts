// /api/caja/correlativo/route.ts

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id_tipo");

  if (!id) {
    return NextResponse.json(
      { error: "Falta el parámetro id_tipo" },
      { status: 400 }
    );
  }

  try {
    const tipo = await prisma.tipo_comprobante.findUnique({
      where: { id_tipo: parseInt(id) },
    });

    if (!tipo || !tipo.tipo) {
      return NextResponse.json(
        { error: "Tipo de comprobante no encontrado" },
        { status: 404 }
      );
    }

    const tipoNombre = tipo.tipo.toUpperCase();
    let serie = "";

    switch (tipoNombre) {
      case "BOLETA":
        serie = "B001";
        break;
      case "FACTURA":
        serie = "F001";
        break;
      case "RECIBO":
        serie = "R001";
        break;
      case "GUIA DE REMISION":
        serie = "G001";
        break;
      default:
        return NextResponse.json(
          { error: "Tipo de comprobante no válido" },
          { status: 400 }
        );
    }

    const ultimoComprobante = await prisma.comprobante_pago.findFirst({
      where: { serie },
      orderBy: { correlativo: "desc" },
    });

    const siguienteNumero = (ultimoComprobante?.correlativo ?? 0) + 1;

    return NextResponse.json({
      serie,
      numero: siguienteNumero.toString().padStart(8, "0"),
    });
  } catch (error) {
    console.error("Error al obtener correlativo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
