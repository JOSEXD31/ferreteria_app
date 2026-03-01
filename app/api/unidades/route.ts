import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const unidades = await prisma.unidad_medida.findMany({
      orderBy: { nombre: "asc" },
    })
    return NextResponse.json(unidades)
  } catch (error) {
    console.error("Error fetching units:", error)
    return NextResponse.json({ message: "Error al obtener unidades de medida" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, abreviatura } = body

    if (!nombre || !abreviatura) {
      return NextResponse.json({ message: "Nombre y abreviatura son obligatorios" }, { status: 400 })
    }

    const nuevaUnidad = await prisma.unidad_medida.create({
      data: {
        nombre,
        abreviatura,
      },
    })

    return NextResponse.json(nuevaUnidad, { status: 201 })
  } catch (error) {
    console.error("Error creating unit:", error)
    return NextResponse.json({ message: "Error al crear unidad de medida" }, { status: 500 })
  }
}
