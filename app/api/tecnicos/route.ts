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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id_tecnico, nombre, telefono, especialidad } = body

    if (!id_tecnico || !nombre) {
      return NextResponse.json({ message: "ID y nombre son obligatorios" }, { status: 400 })
    }

    const tecnicoActualizado = await prisma.tecnico.update({
      where: { id_tecnico: parseInt(id_tecnico) },
      data: {
        nombre,
        telefono,
        especialidad,
      },
    })

    return NextResponse.json(tecnicoActualizado, { status: 200 })
  } catch (error) {
    console.error("Error updating technician:", error)
    return NextResponse.json({ message: "Error al actualizar técnico" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: "ID de técnico es obligatorio" }, { status: 400 })
    }

    await prisma.tecnico.update({
      where: { id_tecnico: parseInt(id) },
      data: { estado: 0 },
    })

    return NextResponse.json({ message: "Técnico desactivado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting technician:", error)
    return NextResponse.json({ message: "Error al desactivar técnico" }, { status: 500 })
  }
}
