import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const cajas = await prisma.caja.findMany({
      orderBy: { fecha: "desc" }
    })
    return NextResponse.json(cajas)
  } catch (error) {
    console.error("Error al obtener las cajas:", error)
    return NextResponse.json({ error: "Error al obtener las cajas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { monto_inicial, total_ingresos, total_egresos, monto_final, id_usuario } = body

    const nuevaCaja = await prisma.caja.create({
      data: {
        fecha: new Date(),
        monto_inicial: parseFloat(monto_inicial) || 0,
        total_ingresos: parseFloat(total_ingresos) || 0,
        total_egresos: parseFloat(total_egresos) || 0,
        monto_final: parseFloat(monto_final) || 0,
        id_usuario: id_usuario ? parseInt(id_usuario) : null,
      }
    })

    return NextResponse.json(nuevaCaja, { status: 201 })
  } catch (error) {
    console.error("Error al registrar caja:", error)
    return NextResponse.json({ error: "Error al registrar la caja" }, { status: 500 })
  }
}