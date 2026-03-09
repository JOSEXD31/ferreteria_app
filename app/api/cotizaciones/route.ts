import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { getSession } from "@/lib/auth"

const cotizacionSchema = z.object({
    id_cliente: z.union([z.number(), z.string(), z.null()]).optional().transform(v => typeof v === 'string' ? parseInt(v) : v),
    id_usuario: z.union([z.number(), z.string(), z.null()]).optional().transform(v => typeof v === 'string' ? parseInt(v) : v),
    subtotal: z.number(),
    igv: z.number(),
    total: z.number(),
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

        const cotizaciones = await prisma.cotizacion.findMany({
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
        return NextResponse.json(cotizaciones)
    } catch (error) {
        console.error("Error fetching cotizaciones:", error)
        return NextResponse.json({ message: "Error al obtener cotizaciones" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const validation = cotizacionSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json({ message: "Datos inválidos", errors: validation.error.format() }, { status: 400 })
        }

        const { id_cliente, id_usuario, subtotal, igv, total, detalles } = validation.data

        const result = await prisma.$transaction(async (tx) => {
            // 1. Buscar configuración para Cotización
            let serieFinal = null
            let correlativoFinal = null

            const configDoc = await tx.configuracion_comprobante.findFirst({
                where: {
                    nombre: { contains: "Cotizacion" },
                    activo: true
                }
            })

            if (configDoc) {
                serieFinal = configDoc.serie
                correlativoFinal = configDoc.correlativo

                // Incrementar correlativo
                await tx.configuracion_comprobante.update({
                    where: { id: configDoc.id },
                    data: { correlativo: { increment: 1 } }
                })
            }

            const cotizacion = await tx.cotizacion.create({
                data: {
                    id_cliente,
                    id_usuario,
                    subtotal,
                    igv,
                    total,
                    estado: "pendiente",
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
                    detalles: true
                }
            })
            return cotizacion
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error("Error creating cotizacion:", error)
        return NextResponse.json({ message: "Error al registrar la cotización" }, { status: 500 })
    }
}

