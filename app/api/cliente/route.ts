import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  dni_ruc: z.string().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validation = clienteSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.error.format() }, { status: 400 })
    }

    const { nombre, dni_ruc, telefono, direccion } = validation.data

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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id_cliente, ...rest } = body

    if (!id_cliente) {
      return NextResponse.json({ error: "ID es obligatorio" }, { status: 400 })
    }

    const validation = clienteSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.error.format() }, { status: 400 })
    }

    const { nombre, dni_ruc, telefono, direccion } = validation.data

    const clienteActualizado = await prisma.cliente.update({
      where: { id_cliente: parseInt(id_cliente.toString()) },
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

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


