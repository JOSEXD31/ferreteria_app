import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { estado: 1 },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, dni_ruc, telefono, direccion } = body

    if (!nombre) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 })
    }

    const nuevoCliente = await prisma.cliente.create({
      data: {
        nombre,
        dni_ruc,
        telefono,
        direccion,
        estado: 1
      },
    })

    return NextResponse.json(nuevoCliente, { status: 201 })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json({ error: "Error al crear cliente" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id_cliente, nombre, dni_ruc, telefono, direccion } = body

    if (!id_cliente || !nombre) {
      return NextResponse.json({ error: "ID y nombre son obligatorios" }, { status: 400 })
    }

    const clienteActualizado = await prisma.cliente.update({
      where: { id_cliente: parseInt(id_cliente) },
      data: {
        nombre,
        dni_ruc,
        telefono,
        direccion,
      },
    })

    return NextResponse.json(clienteActualizado, { status: 200 })
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json({ error: "Error al actualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: "ID de cliente es obligatorio" }, { status: 400 })
    }

    await prisma.cliente.update({
      where: { id_cliente: parseInt(id) },
      data: { estado: 0 },
    })

    return NextResponse.json({ message: "Cliente desactivado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error al desactivar cliente:", error)
    return NextResponse.json({ error: "Error al desactivar cliente" }, { status: 500 })
  }
}

