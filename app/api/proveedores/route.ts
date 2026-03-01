import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const proveedores = await prisma.proveedor.findMany({
            where: { estado: 1 },
            orderBy: { nombre: 'asc' }
        })
        return NextResponse.json(proveedores)
    } catch (error) {
        return NextResponse.json({ error: "Error al cargar proveedores" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { nombre, ruc, direccion, telefono, email } = body

        if (!nombre || !ruc) {
            return NextResponse.json({ error: "Nombre y RUC son requeridos" }, { status: 400 })
        }

        const nuevoProveedor = await prisma.proveedor.create({
            data: {
                nombre,
                ruc,
                direccion,
                telefono,
                email,
                estado: 1
            }
        })

        return NextResponse.json(nuevoProveedor)
    } catch (error) {
        return NextResponse.json({ error: "Error al crear proveedor" }, { status: 500 })
    }
}
