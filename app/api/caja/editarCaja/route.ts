import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id_caja, nombre, descripcion, coordenada, estado } = body

        const cajaEditada = await prisma.caja.update({
            where: { id_caja: Number(id_caja) },
            data: {
                nombre: nombre ?? "",
                descripcion: descripcion ?? "",
                coordenada: coordenada ?? "",
                estado: estado ?? 1,
            },
        })

        return NextResponse.json(cajaEditada)
    } catch (error) {
        return NextResponse.json({ error: "Error al editar caja" }, { status: 500 })
    }
}
