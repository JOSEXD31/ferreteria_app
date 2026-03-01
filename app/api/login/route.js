import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request) {
  const body = await request.json()
  const { username, password, role } = body

  try {
    // Buscar usuario por nombre de usuario y rol (mapeado de la UI)
    const user = await prisma.usuario.findFirst({
      where: {
        usuario: username,
        rol: role,
        estado: 1,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 401 }
      )
    }

    // En un sistema real usarías bcrypt, pero si la DB es nueva 
    // y quieres probar sin hash, podrías comparar directo.
    // Sin embargo, mantendremos bcrypt por seguridad si el sistema lo usaba.
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Intento de compatibilidad si aún no se ha hasheado la contraseña en la DB
      if (password === user.password) {
        // Contraseña en texto plano coincide
      } else {
        return NextResponse.json(
          { success: false, message: "Contraseña incorrecta" },
          { status: 401 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id_usuario,
        name: user.nombre,
        role: user.rol,
      },
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json(
      { success: false, message: "Error del servidor" },
      { status: 500 }
    )
  }
}
