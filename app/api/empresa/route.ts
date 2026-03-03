import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const empresa = await prisma.empresa.findFirst()

        if (!empresa) {
            // Return a default empty object or create one
            return NextResponse.json({
                id_empresa: 0,
                nombre: "Mi Empresa",
                ruc: "",
                direccion: "",
                telefono: "",
                email: "",
                logo_url: "/tufibra_logo.webp",
                moneda: "PEN",
                igv_porcentaje: 18.00,
                mensaje_ticket: ""
            })
        }

        return NextResponse.json(empresa)
    } catch (error) {
        console.error("Error fetching empresa:", error)
        return NextResponse.json({ message: "Error al obtener datos de empresa" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const {
            nombre,
            ruc,
            direccion,
            telefono,
            email,
            logo_url,
            moneda,
            igv_porcentaje,
            mensaje_ticket
        } = body

        if (!nombre) {
            return NextResponse.json({ message: "El nombre es obligatorio" }, { status: 400 })
        }

        // Check if an entry already exists
        const existing = await prisma.empresa.findFirst()

        if (existing) {
            const actualizada = await prisma.empresa.update({
                where: { id_empresa: existing.id_empresa },
                data: {
                    nombre,
                    ruc,
                    direccion,
                    telefono,
                    email,
                    logo_url,
                    moneda,
                    igv_porcentaje: igv_porcentaje ? parseFloat(igv_porcentaje) : 18.00,
                    mensaje_ticket
                }
            })
            return NextResponse.json(actualizada, { status: 200 })
        } else {
            const nueva = await prisma.empresa.create({
                data: {
                    nombre,
                    ruc,
                    direccion,
                    telefono,
                    email,
                    logo_url,
                    moneda: moneda || "PEN",
                    igv_porcentaje: igv_porcentaje ? parseFloat(igv_porcentaje) : 18.00,
                    mensaje_ticket
                }
            })
            return NextResponse.json(nueva, { status: 201 })
        }
    } catch (error) {
        console.error("Error saving empresa:", error)
        return NextResponse.json({ message: "Error al guardar datos de empresa" }, { status: 500 })
    }
}
