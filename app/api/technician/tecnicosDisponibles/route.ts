import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tecnicos = await prisma.tecnico.findMany({
      where: {
        tec_estado: "Disponible"
      },
      include: {
        usuario: {
          select: {
            usu_nombre: true
          }
        }
      }
    })

    return NextResponse.json(tecnicos)
  } catch (error) {
    console.error("Error al obtener técnicos disponibles:", error)
    return NextResponse.json(
      { error: "Error al obtener técnicos disponibles" },
      { status: 500 }
    )
  }
}
