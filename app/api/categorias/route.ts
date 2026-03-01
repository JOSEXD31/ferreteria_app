import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      where: { estado: 1 },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(categorias)
  } catch (error) {
    console.error("Error fetching categories:", error)
    return NextResponse.json({ message: "Error al obtener categorías" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, descripcion } = body

    if (!nombre) {
      return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 })
    }

    const nuevaCategoria = await prisma.categoria.create({
      data: {
        nombre,
        descripcion,
        estado: 1,
      },
    })

    return NextResponse.json(nuevaCategoria, { status: 201 })
  } catch (error) {
    console.error("Error creating category:", error)
    return NextResponse.json({ message: "Error al crear categoría" }, { status: 500 })
  }
}
