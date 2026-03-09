import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { id_nodo, nombre, descripcion, coordenada, estado } = body

        const nodoEditado = await prisma.nodo.update({
            where: { id_nodo: Number(id_nodo) },
            data: {
                nombre: nombre ?? "",
                descripcion: descripcion ?? "",
                coordenada: coordenada ?? "",
                estado: estado ?? 1,
            },
        })

        return NextResponse.json(nodoEditado)
    } catch (error) {
        return NextResponse.json({ error: "Error al editar nodo" }, { status: 500 })
    }
}
