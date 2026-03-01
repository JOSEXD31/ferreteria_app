"use client"

import { useState } from "react"
import { format, subDays, startOfMonth } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Navbar } from "@/components/navarcobranza"
import { Button } from "@/components/ui/button"
import DetalleModal from "@/components/cobranza/detallereporte" // <- Nuevo componente

export default function ReportsPage() {
  const today = format(new Date(), "yyyy-MM-dd")

  const [desde, setDesde] = useState(today)
  const [hasta, setHasta] = useState(today)
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [rangoActivo, setRangoActivo] = useState<string | null>("hoy")

  const [reporte, setReporte] = useState<any>(null)
  const [cargando, setCargando] = useState(false)
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [detalleReporte, setDetalleReporte] = useState<any[]>([])

  const aplicarRango = (rango: "hoy" | "ayer" | "7dias" | "mes") => {
    setModoPersonalizado(false)
    setRangoActivo(rango)

    const hoy = new Date()
    let nuevoDesde = today
    let nuevoHasta = today

    if (rango === "hoy") {
      nuevoDesde = format(hoy, "yyyy-MM-dd")
      nuevoHasta = nuevoDesde
    } else if (rango === "ayer") {
      nuevoDesde = format(subDays(hoy, 1), "yyyy-MM-dd")
      nuevoHasta = nuevoDesde
    } else if (rango === "7dias") {
      nuevoDesde = format(subDays(hoy, 6), "yyyy-MM-dd")
      nuevoHasta = format(hoy, "yyyy-MM-dd")
    } else if (rango === "mes") {
      nuevoDesde = format(startOfMonth(hoy), "yyyy-MM-dd")
      nuevoHasta = format(hoy, "yyyy-MM-dd")
    }

    setDesde(nuevoDesde)
    setHasta(nuevoHasta)

    obtenerReporte(nuevoDesde, nuevoHasta) // Usar valores actualizados directamente
  }

  const obtenerReporte = async (desdeParam = desde, hastaParam = hasta) => {
    setCargando(true)
    setReporte(null)

    try {
      const res = await fetch("/api/caja/reportexfecha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desde: desdeParam, hasta: hastaParam }),
      })

      const data = await res.json()
      setReporte(data)
    } catch (err) {
      console.error("Error al obtener reporte:", err)
    } finally {
      setCargando(false)
    }
  }


  const abrirDetalle = async () => {
    try {
      const res = await fetch("/api/caja/reportexfechadet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desde, hasta }),
      })

      const data = await res.json()
      setDetalleReporte(data)
      setDetalleAbierto(true)
    } catch (err) {
      console.error("Error al obtener detalle:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900 text-gray-100">
          <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Cobranza</h1>
            </div>
            <Navbar />
          </header>

          <div className="p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl shadow-xl text-gray-200">
              <CardContent className="p-6 space-y-6">
                <h1 className="text-3xl font-bold">Reporte de Pagos</h1>

                <div className="flex gap-2 flex-wrap">
                  {["hoy", "ayer", "7dias", "mes"].map((r) => (
                    <Button
                      key={r}
                      variant="secondary"
                      onClick={() => aplicarRango(r as any)}
                      className={`text-gray-200 ${rangoActivo === r
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-700 hover:bg-gray-600"
                        }`}
                    >
                      {r === "hoy" && "Hoy"}
                      {r === "ayer" && "Ayer"}
                      {r === "7dias" && "Últimos 7 días"}
                      {r === "mes" && "Este mes"}
                    </Button>
                  ))}

                  <Button
                    variant="secondary"
                    onClick={() => {
                      setModoPersonalizado(true)
                      setRangoActivo(null)
                    }}
                    className={`text-gray-200 ${modoPersonalizado
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-700 hover:bg-gray-600"
                      }`}
                  >
                    Personalizado
                  </Button>
                </div>

                {modoPersonalizado && (
                  <div className="flex flex-wrap items-end gap-4">
                    <div className="flex flex-col">
                      <label className="text-sm mb-1">Desde</label>
                      <input
                        type="date"
                        className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
                        value={desde}
                        onChange={(e) => setDesde(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm mb-1">Hasta</label>
                      <input
                        type="date"
                        className="bg-gray-800 text-white border border-gray-600 px-3 py-2 rounded"
                        value={hasta}
                        onChange={(e) => setHasta(e.target.value)}
                      />
                    </div>
                    <Button onClick={() => obtenerReporte()} className="bg-blue-600 hover:bg-blue-700">
                      Generar
                    </Button>
                  </div>
                )}

                {cargando && <p className="text-gray-400">Cargando reporte...</p>}

                {reporte && (
                  <div className="mt-6 bg-gray-900/70 p-6 rounded-md shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div>
                      <h3 className="font-bold text-lg mb-2">Rango</h3>
                      <p><strong>Desde:</strong> {desde}</p>
                      <p><strong>Hasta:</strong> {hasta}</p>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">Resumen</h3>
                      <p><strong>Pagos:</strong> {reporte.cantidad_pagos}</p>
                      <p><strong>Total:</strong> <span className="text-green-400">S/ {Number(reporte.monto_total).toFixed(2)}</span></p>
                      <p><strong>Descuentos:</strong> <span className="text-red-400">S/ {Number(reporte.total_descuentos || 0).toFixed(2)}</span></p>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">Comprobantes</h3>
                      <p>Boletas: {reporte.boletas} <span className="text-gray-400 text-xs">→ S/ {Number(reporte.monto_boletas || 0).toFixed(2)}</span></p>
                      <p>Facturas: {reporte.facturas} <span className="text-gray-400 text-xs">→ S/ {Number(reporte.monto_facturas || 0).toFixed(2)}</span></p>
                      <p>Recibos: {reporte.recibos} <span className="text-gray-400 text-xs">→ S/ {Number(reporte.monto_recibos || 0).toFixed(2)}</span></p>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Medios de Pago</h3>
                      <p>Efectivo: {reporte.efectivo} <span className="text-gray-400 text-xs">→ S/ {Number(reporte.monto_efectivo || 0).toFixed(2)}</span></p>
                      <p>Yape: {reporte.yape} <span className="text-gray-400 text-xs">→ S/ {Number(reporte.monto_yape || 0).toFixed(2)}</span></p>
                      <p>Transferencia: {reporte.transferencia} <span className="text-gray-400 text-xs">→ S/ {Number(reporte.monto_transferencia || 0).toFixed(2)}</span></p>
                    </div>

                    <div className="col-span-full">
                      <Button onClick={abrirDetalle} className="bg-green-600 hover:bg-green-700">
                        Ver detallado
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal separado */}
        <DetalleModal
          abierto={detalleAbierto}
          onClose={() => setDetalleAbierto(false)}
          datos={detalleReporte}
        />


      </SidebarInset>
    </SidebarProvider>


  )
}
