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

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id_categoria, nombre, descripcion } = body

    if (!id_categoria || !nombre) {
      return NextResponse.json({ message: "ID y nombre son obligatorios" }, { status: 400 })
    }

    const categoriaActualizada = await prisma.categoria.update({
      where: { id_categoria: parseInt(id_categoria) },
      data: {
        nombre,
        descripcion,
      },
    })

    return NextResponse.json(categoriaActualizada, { status: 200 })
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json({ message: "Error al actualizar categoría" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: "ID de categoría es obligatorio" }, { status: 400 })
    }

    await prisma.categoria.update({
      where: { id_categoria: parseInt(id) },
      data: { estado: 0 },
    })

    return NextResponse.json({ message: "Categoría desactivada correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json({ message: "Error al desactivar categoría" }, { status: 500 })
  }
}
