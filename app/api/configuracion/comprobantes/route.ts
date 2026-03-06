import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 })
        }

        const comprobantes = await prisma.configuracion_comprobante.findMany({
            where: { activo: true }
        })
        return NextResponse.json(comprobantes)
    } catch (error) {
        console.error("Error fetching comprobantes config:", error)
        return NextResponse.json({ message: "Error al obtener configuración de comprobantes" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { id, nombre, aplica_igv, porcentaje_igv, serie, correlativo } = body

        if (!nombre) return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 })

        if (id) {
            const actualizado = await prisma.configuracion_comprobante.update({
                where: { id: parseInt(id.toString()) },
                data: {
                    nombre,
                    aplica_igv: Boolean(aplica_igv),
                    porcentaje_igv: parseFloat(porcentaje_igv?.toString() || "0"),
                    serie,
                    correlativo: parseInt(correlativo?.toString() || "1")
                }
            })
            return NextResponse.json(actualizado)
        } else {
            const nuevo = await prisma.configuracion_comprobante.create({
                data: {
                    nombre,
                    aplica_igv: Boolean(aplica_igv),
                    porcentaje_igv: parseFloat(porcentaje_igv?.toString() || "18"),
                    serie,
                    correlativo: parseInt(correlativo?.toString() || "1")
                }
            })
            return NextResponse.json(nuevo, { status: 201 })
        }
    } catch (error) {
        console.error("Error saving comprobante config:", error)
        return NextResponse.json({ message: "Error al guardar configuración" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) return NextResponse.json({ message: "ID requerido" }, { status: 400 })

        // Soft delete
        await prisma.configuracion_comprobante.update({
            where: { id: parseInt(id) },
            data: { activo: false }
        })
        return NextResponse.json({ message: "Comprobante eliminado" })
    } catch (error) {
        console.error("Error deleting comprobante config:", error)
        return NextResponse.json({ message: "Error al eliminar" }, { status: 500 })
    }
}

