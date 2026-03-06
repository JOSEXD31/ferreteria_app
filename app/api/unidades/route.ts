import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const unidadSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  abreviatura: z.string().min(1, "La abreviatura es obligatoria"),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const unidades = await prisma.unidad_medida.findMany({
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(unidades)
  } catch (error) {
    console.error("Error fetching units:", error)
    return NextResponse.json({ message: "Error al obtener unidades de medida" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validation = unidadSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ message: "Datos inválidos", errors: validation.error.format() }, { status: 400 })
    }

    const { nombre, abreviatura } = validation.data

    const nuevaUnidad = await prisma.unidad_medida.create({
      data: {
        nombre,
        abreviatura,
      },
    })

    return NextResponse.json(nuevaUnidad, { status: 201 })
  } catch (error) {
    console.error("Error creating unit:", error)
    return NextResponse.json({ message: "Error al crear unidad de medida" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id_unidad, ...rest } = body

    if (!id_unidad) {
      return NextResponse.json({ message: "ID es obligatorio" }, { status: 400 })
    }

    const validation = unidadSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ message: "Datos inválidos", errors: validation.error.format() }, { status: 400 })
    }

    const { nombre, abreviatura } = validation.data

    const unidadActualizada = await prisma.unidad_medida.update({
      where: { id_unidad: parseInt(id_unidad.toString()) },
      data: {
        nombre,
        abreviatura,
      },
    })

    return NextResponse.json(unidadActualizada, { status: 200 })
  } catch (error) {
    console.error("Error updating unit:", error)
    return NextResponse.json({ message: "Error al actualizar unidad de medida" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ message: "ID de unidad es obligatorio" }, { status: 400 })
    }

    await prisma.unidad_medida.delete({
      where: { id_unidad: parseInt(id) },
    })

    return NextResponse.json({ message: "Unidad eliminada correctamente" }, { status: 200 })
  } catch (error: any) {
    console.error("Error deleting unit:", error)
    if (error.code === 'P2003') {
      return NextResponse.json({ message: "No se puede eliminar la unidad porque está en uso por productos" }, { status: 400 })
    }
    return NextResponse.json({ message: "Error al eliminar unidad de medida" }, { status: 500 })
  }
}

