import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const ventas = await prisma.venta.findMany({
      include: {
        cliente: true,
        usuario: true,
        detalles: {
          include: {
            producto: true
          }
        },
      },
      orderBy: { fecha: "desc" },
    })
    return NextResponse.json(ventas)
  } catch (error) {
    console.error("Error fetching sales:", error)
    return NextResponse.json({ message: "Error al obtener ventas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      id_cliente,
      id_usuario,
      tipo,
      subtotal,
      igv,
      total,
      detalles,
      metodo_pago,
      tipo_comprobante,
      monto_efectivo,
      monto_transferencia
    } = body

    if (!detalles || detalles.length === 0) {
      return NextResponse.json({ message: "La venta debe tener al menos un producto" }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la venta
      const venta = await tx.venta.create({
        data: {
          id_cliente: id_cliente ? parseInt(id_cliente) : null,
          id_usuario: id_usuario ? parseInt(id_usuario) : null,
          tipo: tipo || "producto",
          subtotal: subtotal ? parseFloat(subtotal) : 0,
          igv: igv ? parseFloat(igv) : 0,
          total: total ? parseFloat(total) : 0,
          estado: "pagado",
          metodo_pago: metodo_pago ? metodo_pago.toLowerCase() : "efectivo",
          tipo_comprobante: tipo_comprobante ? tipo_comprobante.toLowerCase() : "ticket",
          monto_efectivo: monto_efectivo ? parseFloat(monto_efectivo) : (metodo_pago === 'Efectivo' ? parseFloat(total) : 0),
          monto_transferencia: monto_transferencia ? parseFloat(monto_transferencia) : (metodo_pago === 'Transferencia' ? parseFloat(total) : 0),
          detalles: {
            create: detalles.map((d: any) => ({
              id_producto: d.id_producto ? parseInt(d.id_producto) : null,
              descripcion: d.descripcion,
              cantidad: parseFloat(d.cantidad),
              precio_unitario: parseFloat(d.precio_unitario),
              subtotal: parseFloat(d.subtotal),
            }))
          }
        },
        include: {
          detalles: {
            include: {
              producto: true
            }
          },
          cliente: true,
          usuario: true
        }
      })

      // 2. Actualizar stock y registrar movimientos para cada detalle
      for (const d of venta.detalles) {
        if (d.id_producto) {
          // Actualizar stock
          await tx.producto.update({
            where: { id_producto: d.id_producto },
            data: {
              stock_actual: {
                decrement: d.cantidad
              }
            }
          })

          // Registrar movimiento
          await tx.movimiento_inventario.create({
            data: {
              id_producto: d.id_producto,
              tipo: "venta",
              cantidad: d.cantidad.mul(-1),
              precio_unitario: d.precio_unitario,
              referencia: `Venta ID: ${venta.id_venta}`,
            }
          })
        }
      }

      return venta
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating sale:", error)
    return NextResponse.json({ message: "Error al registrar la venta" }, { status: 500 })
  }
}
