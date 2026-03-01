import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const servicios = await prisma.servicio.findMany({
      orderBy: { serv_id: 'desc' }
    })
    return NextResponse.json(servicios)
  } catch (error) {
    console.error("Error al obtener servicios:", error)
    return NextResponse.json(
      { error: "Error al obtener servicios" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serv_nombre, serv_precio } = body

    if (!serv_nombre || !serv_precio) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      )
    }

    const nuevoServicio = await prisma.servicio.create({
      data: {
        serv_nombre,
        serv_precio: parseFloat(serv_precio),
        serv_tipo: "PLAN"
      }
    })

    return NextResponse.json(nuevoServicio)
  } catch (error) {
    console.error("Error al crear servicio:", error)
    return NextResponse.json(
      { error: "Error al crear servicio" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { serv_id, serv_nombre, serv_precio } = body

    if (!serv_id) {
      return NextResponse.json(
        { error: "ID de servicio requerido" },
        { status: 400 }
      )
    }

    const servicioActualizado = await prisma.servicio.update({
      where: { serv_id: parseInt(serv_id) },
      data: {
        serv_nombre,
        serv_precio: parseFloat(serv_precio)
      }
    })

    return NextResponse.json(servicioActualizado)
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    return NextResponse.json(
      { error: "Error al actualizar servicio" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "ID requerido" },
        { status: 400 }
      )
    }

    await prisma.servicio.delete({
      where: { serv_id: parseInt(id) }
    })

    return NextResponse.json({ message: "Servicio eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar servicio:", error)
    return NextResponse.json(
      { error: "Error al eliminar servicio" },
      { status: 500 }
    )
  }
}
