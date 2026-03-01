import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tiposTrabajos = await prisma.tipo_trabajo.findMany()
    return NextResponse.json(tiposTrabajos)
  } catch (error) {
    console.error("Error al obtener los tipos de trabajos:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
