import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const especialidades = await prisma.especialidad.findMany()
    return NextResponse.json(especialidades)
  } catch (error) {
    console.error("Error al obtener especialidades:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
