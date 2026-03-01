import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tipo_comprobante = await prisma.tipo_comprobante.findMany({})

    return NextResponse.json(tipo_comprobante)
  } catch (error) {
    console.error("Error al obtener los tipos de comprobante:", error)
    return NextResponse.json(
      { error: "Error al obtener los tipos de comprobante" },
      { status: 500 }
    )
  }
}