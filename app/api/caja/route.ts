import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const caja = await prisma.caja.findMany({})

    return NextResponse.json(caja)
  } catch (error) {
    console.error("Error al obtener las cajas:", error)
    return NextResponse.json(
      { error: "Error al obtener las cajas" },
      { status: 500 }
    )
  }
}