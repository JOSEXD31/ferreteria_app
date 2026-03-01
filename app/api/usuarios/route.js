import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id_usuario: true,
                nombre: true,
                usuario: true,
                rol: true,
                estado: true,
                fecha_creacion: true,
            },
            orderBy: {
                fecha_creacion: 'desc'
            }
        })
        return NextResponse.json(usuarios)
    } catch (error) {
        console.error("Error al obtener usuarios:", error)
        return NextResponse.json(
            { success: false, message: "Error al obtener usuarios" },
            { status: 500 }
        )
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const { nombre, usuario, password, rol } = body

        if (!nombre || !usuario || !password || !rol) {
            return NextResponse.json(
                { success: false, message: "Todos los campos son obligatorios" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const nuevoUsuario = await prisma.usuario.create({
            data: {
                nombre,
                usuario,
                password: hashedPassword,
                rol,
                estado: 1,
            },
        })

        return NextResponse.json({
            success: true,
            message: "Usuario creado correctamente",
            usuario: {
                id_usuario: nuevoUsuario.id_usuario,
                nombre: nuevoUsuario.nombre,
                usuario: nuevoUsuario.usuario,
                rol: nuevoUsuario.rol,
            },
        })
    } catch (error) {
        console.error("Error al crear usuario:", error)
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, message: "El nombre de usuario ya existe" },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { success: false, message: "Error al crear el usuario" },
            { status: 500 }
        )
    }
}
