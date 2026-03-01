import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const deudas = await prisma.deuda.findMany({
            include: {
                contrato: {
                    select: {
                        estado: true,
                    },
                },
            },
        })

        return NextResponse.json(deudas)
    } catch (error) {
        console.error("Error al obtener los deudas:", error)
        return NextResponse.json(
            { error: "Error al obtener los deudas" },
            { status: 500 }
        )
    }
}
