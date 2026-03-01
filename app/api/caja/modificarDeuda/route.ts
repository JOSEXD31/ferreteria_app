import { NextResponse } from "next/server"
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id_deuda, estado, monto, saldo_pendiente, id_user, motivo } = body

    if (!id_deuda || !id_user || !motivo) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 })
    }

    const deudaAnterior = await prisma.deuda.findUnique({
      where: { id_deuda: Number(id_deuda) },
    })

    if (!deudaAnterior) {
      return NextResponse.json({ error: "Deuda no encontrada" }, { status: 404 })
    }

    const dataToUpdate: any = {}
    let descripcion = ""
    let detalle = ""

    if (estado) {
      dataToUpdate.estado = estado
      descripcion = "ANULACION DE DEUDA"
    }

    if (monto !== undefined || saldo_pendiente !== undefined) {
      dataToUpdate.monto = monto
      dataToUpdate.saldo_pendiente = saldo_pendiente
      descripcion = "MODIFICACION DE DEUDA"

      detalle += `Monto anterior: S/ ${Number(deudaAnterior.monto).toFixed(2)} → Nuevo monto: S/ ${Number(monto).toFixed(2)}\n`
      detalle += `Saldo pendiente anterior: S/ ${Number(deudaAnterior.saldo_pendiente).toFixed(2)} → Nuevo saldo pendiente: S/ ${Number(saldo_pendiente).toFixed(2)}\n`
    }

    detalle += `Motivo: ${motivo}`

    const deudaActualizada = await prisma.deuda.update({
      where: { id_deuda: Number(id_deuda) },
      data: dataToUpdate,
    })

    // Registrar historial de cambio
    await prisma.historial_cambios.create({
      data: {
        tabla: "deuda",
        id_cod: String(id_deuda),
        accion: "ACTUALIZACION",
        descripcion,
        detalle,
        id_usuario: Number(id_user),
      },
    })

    return NextResponse.json(
      { message: "Deuda actualizada correctamente", deuda: deudaActualizada },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error al modificar deuda:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
