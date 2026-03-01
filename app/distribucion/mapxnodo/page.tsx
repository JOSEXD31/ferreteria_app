"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Navbar } from "@/components/navarDistribucion"
import 'leaflet/dist/leaflet.css'

type nodo = {
  id_nodo: number
  nombre: string
  descripcion: string
  coordenada: string
  estado: string
}

type caja = {
  id_caja: number
  nombre: string
  descripcion: string
  coordenada: string
  id_nodo: number
}

export default function ClientsPage() {
  const [nodos, setNodos] = useState<nodo[]>([])
  const [cajas, setCajas] = useState<caja[]>([])
  const [selectedNodos, setSelectedNodos] = useState<number[]>([]) // nodos seleccionados

  // Cargar nodos
  const fetchNodos = async () => {
    try {
      const res = await fetch("/api/nodo")
      const data = await res.json()
      const mapped = data.map((n: nodo) => ({
        ...n,
        nombre: n.nombre ?? "",
        descripcion: n.descripcion ?? "",
        coordenada: n.coordenada ?? "",
        estado: n.estado ?? ""
      }))
      setNodos(mapped)
      if (mapped.length > 0) {
        setSelectedNodos([mapped[0].id_nodo]) // activar el primer nodo por defecto
      }
    } catch (err) {
      console.error("Error al cargar nodos:", err)
    }
  }

  // Cargar cajas
  const fetchCajas = async () => {
    try {
      const res = await fetch("/api/caja")
      const data = await res.json()
      setCajas(data.map((c: caja) => ({
        ...c,
        nombre: c.nombre ?? "",
        descripcion: c.descripcion ?? "",
        coordenada: c.coordenada ?? "",
      })))
    } catch (err) {
      console.error("Error al cargar cajas:", err)
    }
  }

  useEffect(() => {
    fetchNodos()
    fetchCajas()
  }, [])

  useEffect(() => {
    if (!nodos || nodos.length === 0) return

    const L = require("leaflet")

    const map = L.map("map").setView([-34.6037, -58.3816], 5)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map)

    const nodoIcon = L.icon({
      iconUrl: "/map_icon/mufa.webp",
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -32],
    })

    const cajaIcon = (name: string) =>
      L.divIcon({
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;">
            <img src="/map_icon/caja.webp" style="width:32px;height:32px;" />
            <span style="color:white;font-size:12px;font-weight:bold;text-shadow:1px 1px 2px black;">
              ${name}
            </span>
          </div>
        `,
        className: "",
        iconAnchor: [16, 32],
      })

    const group = L.featureGroup()

    // Renderizar nodos seleccionados
    selectedNodos.forEach((idNodo) => {
      const nodo = nodos.find((n) => n.id_nodo === idNodo)
      if (!nodo || !nodo.coordenada.includes(",")) return

      const [lat, lng] = nodo.coordenada.split(",").map(Number)

      const marker = L.marker([lat, lng], { icon: nodoIcon }).addTo(map)

      marker.bindPopup(`
        <div style="font-family:sans-serif;">
          <strong>${nodo.nombre}</strong><br/>
          <span>${nodo.descripcion}</span>
        </div>
      `)

      group.addLayer(marker)

      // Renderizar cajas del nodo
      cajas
        .filter((c) => c.id_nodo === nodo.id_nodo && c.coordenada.includes(","))
        .forEach((caja) => {
          const [latC, lngC] = caja.coordenada.split(",").map(Number)
          const cajaMarker = L.marker([latC, lngC], { icon: cajaIcon(caja.nombre) }).addTo(map)
          group.addLayer(cajaMarker)
        })
    })

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [50, 50] })
    }

    return () => {
      map.remove()
    }
  }, [nodos, cajas, selectedNodos])

  // Manejar checkboxes
  const toggleNodo = (id: number) => {
    setSelectedNodos((prev) =>
      prev.includes(id) ? prev.filter((n) => n !== id) : [...prev, id]
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Distribución de la RED</h1>
            </div>
            <Navbar />
          </header>

          <div className="flex-1 space-y-6 p-6">
        

            {/* Mapa */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex flex-wrap gap-4">
                  {nodos.map((nodo) => (
                    <label key={nodo.id_nodo} className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        checked={selectedNodos.includes(nodo.id_nodo)}
                        onChange={() => toggleNodo(nodo.id_nodo)}
                      />
                      {nodo.nombre}
                    </label>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div id="map" className="w-full h-[calc(100vh-300px)] min-h-[500px] rounded-md z-0" />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
