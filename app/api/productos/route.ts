import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const productoSchema = z.object({
  codigo: z.string().optional().nullable(),
  nombre: z.string().min(1, "El nombre es obligatorio"),
  descripcion: z.string().optional().nullable(),
  id_categoria: z.union([z.number(), z.string(), z.null()]).optional(),
  id_unidad: z.union([z.number(), z.string(), z.null()]).optional(),
  precio_compra: z.union([z.number(), z.string()]).optional().default(0),
  precio_venta: z.union([z.number(), z.string()]),
  stock_actual: z.union([z.number(), z.string()]).optional().default(0),
  stock_minimo: z.union([z.number(), z.string()]).optional().default(0),
  precios: z.array(z.object({
    id_unidad: z.union([z.number(), z.string()]),
    nombre: z.string(),
    factor: z.union([z.number(), z.string()]),
    precio: z.union([z.number(), z.string()]),
  })).optional().default([]),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const productos = await prisma.producto.findMany({
      where: { estado: 1 },
      include: {
        categoria: true,
        unidad_medida: true,
        precios: {
          include: {
            unidad_medida: true
          }
        }
      },
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(productos)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const validation = productoSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json({ message: "Datos inválidos", errors: validation.error.format() }, { status: 400 })
    }

    const data = validation.data

    const nuevoProducto = await prisma.producto.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        id_categoria: (data.id_categoria && data.id_categoria !== "") ? parseInt(data.id_categoria.toString()) : null,
        id_unidad: (data.id_unidad && data.id_unidad !== "") ? parseInt(data.id_unidad.toString()) : null,
        precio_compra: parseFloat(data.precio_compra.toString()),
        precio_venta: parseFloat(data.precio_venta.toString()),
        stock_actual: parseFloat(data.stock_actual.toString()),
        stock_minimo: parseFloat(data.stock_minimo.toString()),
        estado: 1,
        precios: {
          create: (data.precios || []).map((p: any) => ({
            id_unidad: parseInt(p.id_unidad.toString()),
            nombre: p.nombre,
            factor: parseFloat(p.factor.toString()),
            precio: parseFloat(p.precio.toString())
          }))
        }
      },
    })

    return NextResponse.json(nuevoProducto, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ 
      message: "Error al crear producto",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { id_producto, ...rest } = body

    if (!id_producto) {
      return NextResponse.json({ message: "ID de producto es obligatorio" }, { status: 400 })
    }

    const validation = productoSchema.safeParse(rest)
    if (!validation.success) {
      return NextResponse.json({ message: "Datos inválidos", errors: validation.error.format() }, { status: 400 })
    }

    const data = validation.data

    const productoActualizado = await prisma.producto.update({
      where: { id_producto: parseInt(id_producto.toString()) },
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        id_categoria: (data.id_categoria && data.id_categoria !== "") ? parseInt(data.id_categoria.toString()) : null,
        id_unidad: (data.id_unidad && data.id_unidad !== "") ? parseInt(data.id_unidad.toString()) : null,
        precio_compra: parseFloat(data.precio_compra.toString()),
        precio_venta: parseFloat(data.precio_venta.toString()),
        stock_actual: parseFloat(data.stock_actual.toString()),
        stock_minimo: parseFloat(data.stock_minimo.toString()),
        precios: {
          deleteMany: {},
          create: (data.precios || []).map((p: any) => ({
            id_unidad: parseInt(p.id_unidad.toString()),
            nombre: p.nombre,
            factor: parseFloat(p.factor.toString()),
            precio: parseFloat(p.precio.toString())
          }))
        }
      },
    })

    return NextResponse.json(productoActualizado, { status: 200 })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ 
      message: "Error al actualizar producto",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
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
      return NextResponse.json({ message: "ID de producto es obligatorio" }, { status: 400 })
    }

    await prisma.producto.update({
      where: { id_producto: parseInt(id) },
      data: { estado: 0 },
    })

    return NextResponse.json({ message: "Producto eliminado correctamente" }, { status: 200 })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Error al eliminar producto" }, { status: 500 })
  }
}

