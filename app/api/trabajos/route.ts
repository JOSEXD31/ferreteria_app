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
      id_tecnicos, // Array de IDs de técnicos
      materiales // Array de { id_producto, cantidad }
    } = body

    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear el trabajo y relacionar técnicos e insertar materiales
      const trabajo = await tx.trabajo.create({
        data: {
          id_cliente: id_cliente ? parseInt(id_cliente) : null,
          descripcion,
          fecha_inicio: fecha_inicio ? new Date(fecha_inicio) : new Date(),
          costo_mano_obra: costo_mano_obra ? parseFloat(costo_mano_obra) : 0,
          estado: "pendiente",
          tecnicos: {
            create: id_tecnicos?.map((id: number) => ({
              id_tecnico: parseInt(id.toString()),
              pago: 0 // Se puede asignar luego
            })) || []
          },
          materiales: {
            create: materiales?.map((m: any) => ({
              id_producto: parseInt(m.id_producto),
              cantidad: parseFloat(m.cantidad)
            })) || []
          }
        },
        include: {
          tecnicos: true,
          materiales: true
        }
      })

      // 2. Si hay materiales, deducir stock y registrar movimiento
      if (materiales && materiales.length > 0) {
        for (const m of materiales) {
          const id_producto = parseInt(m.id_producto);
          const cantidad = parseFloat(m.cantidad);

          // Actualizar stock
          await tx.producto.update({
            where: { id_producto },
            data: {
              stock_actual: {
                decrement: cantidad
              }
            }
          })

          // Obtener precio para el movimiento
          const producto = await tx.producto.findUnique({ where: { id_producto } })
          const precio_unitario = producto?.precio_compra || 0

          // Registrar movimiento
          await tx.movimiento_inventario.create({
            data: {
              id_producto,
              tipo: "uso_trabajo",
              cantidad: cantidad * -1,
              precio_unitario,
              referencia: `Uso en Trabajo ID: ${trabajo.id_trabajo}`,
            }
          })
        }
      }

      return trabajo
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ message: "Error al crear trabajo" }, { status: 500 })
  }
}
