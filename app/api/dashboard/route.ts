import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { startOfDay, endOfDay, subDays, format } from "date-fns"
import { es } from "date-fns/locale"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 })
    }

    const today = new Date()
    const todayStart = startOfDay(today)
    const todayEnd = endOfDay(today)

    // 1. Métricas Rápidas
    const [totalClientes, ventasHoyResult, stockProductos, trabajosPendientes] = await Promise.all([
      prisma.cliente.count({ where: { estado: 1 } }),
      prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: { gte: todayStart, lte: todayEnd },
          estado: "pagado"
        }
      }),
      prisma.producto.findMany({
        where: { estado: 1 },
        select: { id_producto: true, nombre: true, stock_actual: true, stock_minimo: true }
      }),
      prisma.trabajo.count({
        where: { estado: { in: ["pendiente", "proceso"] } }
      })
    ])

    const ventasHoy = Number(ventasHoyResult._sum.total || 0)
    const stockBajo = stockProductos.filter(p => Number(p.stock_actual) <= Number(p.stock_minimo)).length

    // 2. Ventas por Categoría (Gráfico Torta)
    const ventasPorCategoria = await prisma.detalle_venta.findMany({
      where: { venta: { estado: "pagado" } },
      include: { producto: { include: { categoria: true } } }
    })

    const categoriaMap: Record<string, number> = {}
    ventasPorCategoria.forEach(detalle => {
      const catName = detalle.producto?.categoria?.nombre || "Sin Categoría"
      categoriaMap[catName] = (categoriaMap[catName] || 0) + Number(detalle.subtotal)
    })

    const ventasCategoriaData = Object.entries(categoriaMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)

    // 3. Tendencia de Ingresos (Últimos 7 días)
    const tendenciaIngresos = []
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i)
      const dayStart = startOfDay(day)
      const dayEnd = endOfDay(day)

      const sum = await prisma.venta.aggregate({
        _sum: { total: true },
        where: {
          fecha: { gte: dayStart, lte: dayEnd },
          estado: "pagado"
        }
      })

      tendenciaIngresos.push({
        date: format(day, "eee", { locale: es }), // Lun, Mar, etc.
        amount: Number(sum._sum.total || 0)
      })
    }

    // 4. Stock Crítico (Top 4)
    const stockTop = stockProductos
      .map(p => ({
        name: p.nombre,
        stock: Number(p.stock_actual)
      }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 4)

    return NextResponse.json({
      metrics: {
        totalClientes,
        ventasHoy,
        stockBajo,
        trabajosPendientes
      },
      ventasCategoria: ventasCategoriaData,
      tendenciaIngresos,
      stockTop
    })

  } catch (error) {
    console.error("Dashboard API Error:", error)
    return NextResponse.json({ message: "Error al cargar datos del dashboard" }, { status: 500 })
  }
}
