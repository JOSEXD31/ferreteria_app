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

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id_proveedor, nombre, ruc, direccion, telefono, email } = body

        if (!id_proveedor || !nombre || !ruc) {
            return NextResponse.json({ error: "ID, Nombre y RUC son requeridos" }, { status: 400 })
        }

        const proveedorActualizado = await prisma.proveedor.update({
            where: { id_proveedor: parseInt(id_proveedor) },
            data: {
                nombre,
                ruc,
                direccion,
                telefono,
                email
            }
        })

        return NextResponse.json(proveedorActualizado)
    } catch (error) {
        return NextResponse.json({ error: "Error al actualizar proveedor" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: "ID de proveedor requerido" }, { status: 400 })
        }

        await prisma.proveedor.update({
            where: { id_proveedor: parseInt(id) },
            data: { estado: 0 }
        })

        return NextResponse.json({ message: "Proveedor desactivado correctamente" })
    } catch (error) {
        return NextResponse.json({ error: "Error al desactivar proveedor" }, { status: 500 })
    }
}
