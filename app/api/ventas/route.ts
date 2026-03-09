import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const saleSchema = z.object({
  id_cliente: z.union([z.number(), z.string(), z.null()]).optional().transform(v => typeof v === 'string' ? parseInt(v) : v),
  id_usuario: z.union([z.number(), z.string(), z.null()]).optional().transform(v => typeof v === 'string' ? parseInt(v) : v),
  tipo: z.enum(["producto", "servicio"]).optional().default("producto"),
  subtotal: z.number(),
  igv: z.number(),
  total: z.number(),
  metodo_pago: z.preprocess((val) => typeof val === "string" ? val.toLowerCase() : val, z.enum(["efectivo", "transferencia", "mixto"])),
  tipo_comprobante: z.string(),
  monto_efectivo: z.number().optional().default(0),
  monto_transferencia: z.number().optional().default(0),
  detalles: z.array(z.object({
    id_producto: z.number(),
    descripcion: z.string(),
    cantidad: z.number(),
    precio_unitario: z.number(),
    subtotal: z.number(),
    unidad: z.string().optional().nullable(),
    factor: z.number().optional().default(1),
  }))
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const ventas = await prisma.venta.findMany({
      include: {
        cliente: true,
        usuario: true,
        configuracion_comprobante: true,
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
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const rawBody = await request.json()
    const validation = saleSchema.safeParse(rawBody)

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Datos de venta inválidos", 
        errors: validation.error.format() 
      }, { status: 400 })
    }

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
    } = validation.data

    const result = await prisma.$transaction(async (tx) => {

      // 1. Buscar configuración de comprobante si aplica
      let serieFinal = null
      let correlativoFinal = null
      
      const configDoc = await tx.configuracion_comprobante.findFirst({
        where: { 
          nombre: tipo_comprobante,
          activo: true 
        }
      })

      if (configDoc) {
        serieFinal = configDoc.serie
        correlativoFinal = configDoc.correlativo
        
        // Incrementar correlativo para el siguiente
        await tx.configuracion_comprobante.update({
          where: { id: configDoc.id },
          data: { correlativo: { increment: 1 } }
        })
      }

      // 1. Crear la venta
      const venta = await tx.venta.create({
        data: {
          id_cliente: id_cliente,
          id_usuario: id_usuario,
          tipo: (tipo || "producto") as any,
          subtotal: subtotal,
          igv: igv,
          total: total,
          estado: "pagado",
          metodo_pago: metodo_pago.toLowerCase() as any,
          tipo_comprobante: ["ticket", "boleta", "factura"].includes(tipo_comprobante.toLowerCase()) 
            ? tipo_comprobante.toLowerCase() as any 
            : "ticket",
          monto_efectivo: monto_efectivo,
          monto_transferencia: monto_transferencia,
          serie: serieFinal,
          correlativo: correlativoFinal,
          id_configuracion_comprobante: configDoc ? configDoc.id : null,
          porcentaje_igv: configDoc ? parseFloat(configDoc.porcentaje_igv.toString()) : 18,
          detalles: {
            create: detalles.map((d: any) => ({
              id_producto: d.id_producto,
              descripcion: d.descripcion,
               cantidad: d.cantidad,
               precio_unitario: d.precio_unitario,
               subtotal: d.subtotal,
               unidad: d.unidad,
               factor: d.factor,
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

      const detailsToProcess = [...venta.detalles]
      for (const d of detailsToProcess) {
        if (d.id_producto) {
          // Actualizar stock
          await tx.producto.update({
            where: { id_producto: d.id_producto },
            data: {
              stock_actual: {
                decrement: Number(d.cantidad || 0) * (d.factor ? Number(d.factor) : 1)
              }
            }
          })

          // Registrar movimiento
          await tx.movimiento_inventario.create({
            data: {
              id_producto: d.id_producto,
              tipo: "venta",
              cantidad: (Number(d.cantidad) * (d.factor ? Number(d.factor) : 1)) * -1,
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
    return NextResponse.json({ 
      message: "Error al registrar la venta",
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
