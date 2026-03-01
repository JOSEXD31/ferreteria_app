import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const nodo = await prisma.nodo.findMany({})

    return NextResponse.json(nodo)
  } catch (error) {
    console.error("Error al obtener los nodos:", error)
    return NextResponse.json(
      { error: "Error al obtener los nodos" },
      { status: 500 }
    )
  }
}