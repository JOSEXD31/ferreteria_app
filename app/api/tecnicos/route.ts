import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tecnicos = await prisma.tecnico.findMany({
      where: { estado: 1 },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(tecnicos)
  } catch (error) {
    console.error("Error fetching technicians:", error)
    return NextResponse.json({ message: "Error al obtener técnicos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, telefono, especialidad } = body

    if (!nombre) {
      return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 })
    }

    const nuevoTecnico = await prisma.tecnico.create({
      data: {
        nombre,
        telefono,
        especialidad,
        estado: 1,
      },
    })

    return NextResponse.json(nuevoTecnico, { status: 201 })
  } catch (error) {
    console.error("Error creating technician:", error)
    return NextResponse.json({ message: "Error al crear técnico" }, { status: 500 })
  }
}
