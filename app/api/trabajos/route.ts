import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const trabajos = await prisma.trabajo.findMany({
      include: {
        cliente: true,
        materiales: {
          include: { producto: true }
        },
        tecnicos: {
          include: { tecnico: true }
        }
      },
      orderBy: { fecha_inicio: "desc" },
    })
    return NextResponse.json(trabajos)
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ message: "Error al obtener trabajos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      id_cliente, 
      descripcion, 
      fecha_inicio, 
      costo_mano_obra, 
      id_tecnicos // Array de IDs de técnicos
    } = body

    const result = await prisma.trabajo.create({
      data: {
        id_cliente: id_cliente ? parseInt(id_cliente) : null,
        descripcion,
        fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
        costo_mano_obra: costo_mano_obra ? parseFloat(costo_mano_obra) : 0,
        estado: "pendiente",
        tecnicos: {
          create: id_tecnicos?.map((id: number) => ({
            id_tecnico: id,
            pago: 0 // Se puede asignar luego
          })) || []
        }
      },
      include: {
        tecnicos: true
      }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ message: "Error al crear trabajo" }, { status: 500 })
  }
}
