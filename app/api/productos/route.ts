import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const productos = await prisma.producto.findMany({
      where: { estado: 1 },
      include: {
        categoria: true,
        unidad_medida: true,
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
    const body = await request.json()
    const { 
      codigo, 
      nombre, 
      descripcion, 
      id_categoria, 
      id_unidad, 
      precio_compra, 
      precio_venta, 
      stock_actual, 
      stock_minimo 
    } = body

    if (!nombre || !precio_venta) {
      return NextResponse.json({ message: "Nombre y precio de venta son obligatorios" }, { status: 400 })
    }

    const nuevoProducto = await prisma.producto.create({
      data: {
        codigo,
        nombre,
        descripcion,
        id_categoria: id_categoria ? parseInt(id_categoria) : null,
        id_unidad: id_unidad ? parseInt(id_unidad) : null,
        precio_compra: precio_compra ? parseFloat(precio_compra) : 0,
        precio_venta: parseFloat(precio_venta),
        stock_actual: stock_actual ? parseFloat(stock_actual) : 0,
        stock_minimo: stock_minimo ? parseFloat(stock_minimo) : 0,
        estado: 1,
      },
    })

    return NextResponse.json(nuevoProducto, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Error al crear producto" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { 
      id_producto,
      codigo, 
      nombre, 
      descripcion, 
      id_categoria, 
      id_unidad, 
      precio_compra, 
      precio_venta, 
      stock_actual, 
      stock_minimo 
    } = body

    if (!id_producto || !nombre || !precio_venta) {
      return NextResponse.json({ message: "ID, Nombre y precio de venta son obligatorios" }, { status: 400 })
    }

    const productoActualizado = await prisma.producto.update({
      where: { id_producto: parseInt(id_producto) },
      data: {
        codigo,
        nombre,
        descripcion,
        id_categoria: id_categoria ? parseInt(id_categoria) : null,
        id_unidad: id_unidad ? parseInt(id_unidad) : null,
        precio_compra: precio_compra ? parseFloat(precio_compra) : 0,
        precio_venta: parseFloat(precio_venta),
        stock_actual: stock_actual ? parseFloat(stock_actual) : 0,
        stock_minimo: stock_minimo ? parseFloat(stock_minimo) : 0,
      },
    })

    return NextResponse.json(productoActualizado, { status: 200 })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Error al actualizar producto" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
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
