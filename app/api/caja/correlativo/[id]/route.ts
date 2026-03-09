import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const id = context.params.id;

  try {
    // Buscar tipo de comprobante
    const tipo = await prisma.tipo_comprobante.findUnique({
      where: { id_tipo: parseInt(id) },
    });

    if (!tipo || !tipo.tipo) {
      return NextResponse.json(
        { error: "Tipo de comprobante no encontrado" },
        { status: 404 }
      );
    }

    // Determinar serie según tipo
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

    // Buscar el último correlativo
    const ultimoComprobante = await prisma.comprobante_pago.findFirst({
      where: { serie },
      orderBy: { correlativo: "desc" },
    });

    const siguienteNumero = (ultimoComprobante?.correlativo ?? 0) + 1;

    return NextResponse.json({
      serie,
      numero: siguienteNumero.toString().padStart(8, "0"), // ej: 000124
    });
  } catch (error) {
    console.error("Error al obtener correlativo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
