import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const movimientos = await prisma.movimiento_inventario.findMany({
      include: {
        producto: true,
      },
      orderBy: { fecha: "desc" },
    })
    return NextResponse.json(movimientos)
  } catch (error) {
    console.error("Error fetching inventory movements:", error)
    return NextResponse.json({ message: "Error al obtener movimientos de inventario" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_producto, tipo, cantidad, precio_unitario, referencia } = body

    if (!id_producto || !tipo || !cantidad) {
      return NextResponse.json({ message: "Producto, tipo y cantidad son obligatorios" }, { status: 400 })
    }

    // Usamos una transacción para asegurar consistencia si los triggers no están activos
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el movimiento
      const nuevoMovimiento = await tx.movimiento_inventario.create({
        data: {
          id_producto: parseInt(id_producto),
          tipo,
          cantidad: parseFloat(cantidad),
          precio_unitario: precio_unitario ? parseFloat(precio_unitario) : null,
          referencia,
        },
      })

      // 2. Actualizar el stock del producto manualmente como respaldo
      const factor = (tipo === 'venta' || tipo === 'uso_trabajo') ? -1 : 1
      const stockChange = parseFloat(cantidad) * factor

      await tx.producto.update({
        where: { id_producto: parseInt(id_producto) },
        data: {
          stock_actual: {
            increment: stockChange
          }
        }
      })

      return nuevoMovimiento
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating inventory movement:", error)
    return NextResponse.json({ message: "Error al registrar movimiento de inventario" }, { status: 500 })
  }
}
