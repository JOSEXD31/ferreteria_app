// app/api/ordenTrabajo/cantidad_tipo_dash/route.ts

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { subDays, startOfWeek, startOfMonth } from 'date-fns'

// 🎨 Colores fijos por tipo
const colorMap: Record<string, string> = {
  INSTALACION: '#10B981',     // verde esmeralda
  RECONEXION: '#3B82F6',      // azul
  CORTE: '#EF4444',           // rojo
  TRASLADO: '#F59E0B',   // amarillo
  'SIN INTERNET': '#8B5CF6',      // morado
  Otro: '#6B7280',            // gris
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'day'

  let fromDate = new Date()

  switch (filter) {
    case 'day':
      fromDate = subDays(new Date(), 1)
      break
    case 'week':
      fromDate = startOfWeek(new Date(), { weekStartsOn: 1 })
      break
    case 'month':
      fromDate = startOfMonth(new Date())
      break
    default:
      return new Response(JSON.stringify({ error: 'Invalid filter' }), { status: 400 })
  }

  const orders = await prisma.orden_trabajo.groupBy({
    by: ['tip_id'],
    where: {
      ord_fecha_creacion: {
        gte: fromDate,
      },
    },
    _count: true,
  })

  const tipos = await prisma.tipo_trabajo.findMany({
    where: {
      tip_id: {
        in: orders.map((o) => o.tip_id),
      },
    },
    select: {
      tip_id: true,
      tip_nombre: true,
    },
  })

  const result = orders.map((order) => {
    const tipo = tipos.find((t) => t.tip_id === order.tip_id)
    const nombre = tipo?.tip_nombre ?? 'Otro'
    return {
      type: nombre,
      count: order._count,
      color: colorMap[nombre] || colorMap['Otro'], 
    }
  })

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
