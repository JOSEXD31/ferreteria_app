import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
    })

    return NextResponse.json({ success: true, message: "Sesión cerrada exitosamente" })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      { success: false, message: "Error al cerrar sesión" },
      { status: 500 }
    )
  }
}
