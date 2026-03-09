import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const pagos = await prisma.comprobante_pago.findMany({
      include: {
        tipo_comprobante: {},
        detalle_pago: true
      }
    })

    return NextResponse.json(pagos)
  } catch (error) {
    console.error("Error al obtener los pagos:", error)
    return NextResponse.json(
      { error: "Error al obtener los pagos" },
      { status: 500 }
    )
  }
}