import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id_cotizacion = parseInt(params.id)
        const body = await request.json()
        const { estado } = body

        if (!estado) {
            return NextResponse.json({ message: "Falta el estado" }, { status: 400 })
        }

        const updated = await prisma.cotizacion.update({
            where: { id_cotizacion },
            data: { estado }
        })

        return NextResponse.json(updated, { status: 200 })
    } catch (error) {
        console.error("Error updating cotizacion:", error)
        return NextResponse.json({ message: "Error al actualizar la cotización" }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id_cotizacion = parseInt(params.id)

        const updated = await prisma.cotizacion.update({
            where: { id_cotizacion },
            data: { estado: "anulada" }
        })

        return NextResponse.json(updated, { status: 200 })
    } catch (error) {
        console.error("Error deleting cotizacion:", error)
        return NextResponse.json({ message: "Error al anular la cotización" }, { status: 500 })
    }
}
