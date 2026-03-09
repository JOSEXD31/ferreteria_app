import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const compras = await prisma.compra.findMany({
      include: {
        proveedor: true,
        usuario: true,
        detalles: {
          include: {
            producto: true
          }
        },
      },
      orderBy: { fecha: "desc" },
    })
    return NextResponse.json(compras)
  } catch (error) {
    console.error("Error fetching purchases:", error)
    return NextResponse.json({ message: "Error al obtener compras" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_proveedor, id_usuario, subtotal, igv, total, detalles } = body

    if (!id_proveedor || !detalles || detalles.length === 0) {
      return NextResponse.json({ message: "Proveedor y detalles son obligatorios" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la compra
      const compra = await tx.compra.create({
        data: {
          id_proveedor: parseInt(id_proveedor),
          id_usuario: id_usuario ? parseInt(id_usuario) : null,
          subtotal: subtotal ? parseFloat(subtotal) : 0,
          igv: igv ? parseFloat(igv) : 0,
          total: total ? parseFloat(total) : 0,
          detalles: {
            create: detalles.map((d: any) => ({
              id_producto: parseInt(d.id_producto),
              cantidad: parseFloat(d.cantidad),
              precio_compra: parseFloat(d.precio_compra),
              subtotal: parseFloat(d.subtotal),
            }))
          }
        },
        include: {
          detalles: true
        }
      })

      // 2. Actualizar stock y registrar movimientos
      for (const d of compra.detalles) {
        // Actualizar stock
        await tx.producto.update({
          where: { id_producto: d.id_producto },
          data: {
            stock_actual: {
              increment: d.cantidad
            }
          }
        })

        // Registrar movimiento
        await tx.movimiento_inventario.create({
          data: {
            id_producto: d.id_producto,
            tipo: "compra",
            cantidad: d.cantidad,
            precio_unitario: d.precio_compra,
            referencia: `Compra ID: ${compra.id_compra}`,
          }
        })
      }

      return compra
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating purchase:", error)
    return NextResponse.json({ message: "Error al registrar la compra" }, { status: 500 })
  }
}
