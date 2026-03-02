import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const cotizaciones = await prisma.cotizacion.findMany({
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
        return NextResponse.json(cotizaciones)
    } catch (error) {
        console.error("Error fetching cotizaciones:", error)
        return NextResponse.json({ message: "Error al obtener cotizaciones" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id_cliente, id_usuario, subtotal, igv, total, detalles } = body

        if (!detalles || detalles.length === 0) {
            return NextResponse.json({ message: "La cotización debe tener al menos un producto" }, { status: 400 })
        }

        const cotizacion = await prisma.cotizacion.create({
            data: {
                id_cliente: id_cliente ? parseInt(id_cliente) : null,
                id_usuario: id_usuario ? parseInt(id_usuario) : null,
                subtotal: subtotal ? parseFloat(subtotal) : 0,
                igv: igv ? parseFloat(igv) : 0,
                total: total ? parseFloat(total) : 0,
                estado: "pendiente",
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
                detalles: true
            }
        })

        return NextResponse.json(cotizacion, { status: 201 })
    } catch (error) {
        console.error("Error creating cotizacion:", error)
        return NextResponse.json({ message: "Error al registrar la cotización" }, { status: 500 })
    }
}
