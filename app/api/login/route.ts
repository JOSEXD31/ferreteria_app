import { NextResponse } from "next/server"
import { prisma } from "../../..//lib/prisma"
import bcrypt from "bcryptjs"
import { encrypt } from "../../..//lib/auth"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  console.log("------------------------------------------")
  console.log("DEBUG LOGIN: Iniciando proceso de POST")
  console.log("DEBUG LOGIN: encrypt function type:", typeof encrypt)
  
  try {
    const body = await request.json()
    const { username, password, role } = body
    console.log("DEBUG LOGIN: Intento de login para:", { username, role })

    const user = await prisma.usuario.findFirst({
      where: {
        usuario: username,
        rol: role,
        estado: 1,
      },
    })

    if (!user) {
      console.log("DEBUG LOGIN: Usuario no encontrado")
      return NextResponse.json(
        { success: false, message: "Usuario no encontrado" },
        { status: 401 }
      )
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      if (password !== user.password) {
        console.log("DEBUG LOGIN: Password incorrecto")
        return NextResponse.json(
          { success: false, message: "Contraseña incorrecta" },
          { status: 401 }
        )
      }
    }

    console.log("DEBUG LOGIN: Password verificado, generando sesion...")

    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    if (typeof encrypt !== 'function') {
      throw new Error("La función 'encrypt' no se cargó correctamente: " + (typeof encrypt))
    }

    const session = await encrypt({
      id: user.id_usuario,
      name: user.nombre,
      role: user.rol,
      expires
    })

    console.log("DEBUG LOGIN: Sesion generada exitosamente")

    // Set the cookie
    const cookieStore = await cookies()
    cookieStore.set("session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id_usuario,
        name: user.nombre,
        role: user.rol,
      },
    })
  } catch (error) {
    console.error("DIAGNOSTICO LOGIN ERROR:", error)
    return NextResponse.json(
      { 
        success: false, 
        message: "Error del servidor", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
