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

export async function PUT(request) {
    try {
        const body = await request.json()
        const { id_usuario, nombre, usuario, password, rol } = body

        if (!id_usuario || !nombre || !rol) {
            return NextResponse.json(
                { success: false, message: "Faltan campos obligatorios" },
                { status: 400 }
            )
        }

        const dataToUpdate = {
            nombre,
            rol,
            ...(usuario && { usuario })
        }

        if (password && password.trim() !== '') {
            dataToUpdate.password = await bcrypt.hash(password, 10)
        }

        const usuarioActualizado = await prisma.usuario.update({
            where: { id_usuario: parseInt(id_usuario) },
            data: dataToUpdate,
        })

        return NextResponse.json({
            success: true,
            message: "Usuario actualizado correctamente",
            usuario: {
                id_usuario: usuarioActualizado.id_usuario,
                nombre: usuarioActualizado.nombre,
                rol: usuarioActualizado.rol,
            },
        })
    } catch (error) {
        console.error("Error al actualizar usuario:", error)
        return NextResponse.json(
            { success: false, message: "Error al actualizar el usuario" },
            { status: 500 }
        )
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { success: false, message: "ID de usuario es obligatorio" },
                { status: 400 }
            )
        }

        await prisma.usuario.update({
            where: { id_usuario: parseInt(id) },
            data: { estado: 0 },
        })

        return NextResponse.json({ success: true, message: "Usuario desactivado correctamente" })
    } catch (error) {
        console.error("Error al desactivar usuario:", error)
        return NextResponse.json(
            { success: false, message: "Error al desactivar el usuario" },
            { status: 500 }
        )
    }
}
