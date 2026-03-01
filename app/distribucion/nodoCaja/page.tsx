"use client"
import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Eye, MapPin } from "lucide-react"
import { Navbar } from "@/components/navarDistribucion"

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

  // Estado para modales
  const [editNodo, setEditNodo] = useState<nodo | null>(null)
  const [showCajas, setShowCajas] = useState<nodo | null>(null)
  const [editCaja, setEditCaja] = useState<caja | null>(null)

  // Cargar nodos y cajas
  const fetchNodos = async () => {
    try {
      const res = await fetch("/api/nodo")
      const data = await res.json()
      setNodos(data.map((n: nodo) => ({
        ...n,
        nombre: n.nombre ?? "",
        descripcion: n.descripcion ?? "",
        coordenada: n.coordenada ?? "",
        estado: n.estado ?? ""
      })))
    } catch (err) {
      console.error("Error al cargar nodos:", err)
    }
  }

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

  // Obtener ubicación actual
  const getLocation = (callback: (coords: string) => void) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = `${pos.coords.latitude}, ${pos.coords.longitude}`
          callback(coords)
        },
        (err) => alert("Error al obtener ubicación"),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    } else {
      alert("La geolocalización no está soportada en este navegador.")
    }
  }

  // Guardar nodo editado
  const handleSaveNodo = async () => {
    if (!editNodo) return
    try {
      await fetch("/api/nodo/editar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editNodo),
      })
      fetchNodos()
      fetchCajas()
      setEditNodo(null)
    } catch (err) {
      console.error("Error al editar nodo:", err)
    }
  }

  // Guardar caja editada
  const handleSaveCaja = async () => {
    if (!editCaja) return
    try {
      await fetch("/api/caja/editarCaja", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCaja),
      })
      fetchNodos()
      fetchCajas()
      setEditCaja(null)
    } catch (err) {
      console.error("Error al editar caja:", err)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Distribución de la RED</h1>
            </div>
            <Navbar />
          </header>

          {/* GRID DE NODOS */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nodos.map((n) => (
              <Card
                key={n.id_nodo}
                className="bg-gray-800/50 border-gray-700 backdrop-blur-xl hover:shadow-lg hover:scale-105 transition-transform cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="text-white">{n.nombre}</CardTitle>
                  <CardDescription className="text-gray-400">{n.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setEditNodo(n)}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => setShowCajas(n)}
                  >
                    <Eye className="w-4 h-4 mr-1" /> Ver Cajas
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* MODAL EDITAR NODO */}
          <Dialog open={!!editNodo} onOpenChange={() => setEditNodo(null)}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-xl">
              <DialogHeader>
                <DialogTitle>Editar Nodo</DialogTitle>
                <DialogDescription>Modifica los campos del nodo</DialogDescription>
              </DialogHeader>
              {editNodo && (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={editNodo.nombre}
                      onChange={(e) => setEditNodo({ ...editNodo, nombre: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input
                      value={editNodo.descripcion}
                      onChange={(e) => setEditNodo({ ...editNodo, descripcion: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coordenada</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editNodo.coordenada}
                        onChange={(e) => setEditNodo({ ...editNodo, coordenada: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                      />
                      <Button
                        size="icon"
                        onClick={() => getLocation((c) => setEditNodo({ ...editNodo, coordenada: c }))}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button className="text-black" variant="outline" onClick={() => setEditNodo(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveNodo} className="bg-blue-600 hover:bg-blue-700">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* MODAL VER CAJAS */}
          <Dialog open={!!showCajas} onOpenChange={() => setShowCajas(null)}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl">
              <DialogHeader>
                <DialogTitle>Cajas de {showCajas?.nombre}</DialogTitle>
                <DialogDescription>Listado de cajas relacionadas</DialogDescription>
              </DialogHeader>

              {/* Tabla para pantallas grandes y pequeñas */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Nombre</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Descripción</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cajas
                      .filter((c) => c.id_nodo === showCajas?.id_nodo)
                      .map((c) => (
                        <tr key={c.id_caja} className="border-t border-gray-700">
                          <td className="px-4 py-2 text-sm text-white">{c.nombre}</td>
                          <td className="px-4 py-2 text-sm text-gray-400">{c.descripcion}</td>
                          <td className="px-4 py-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => setEditCaja(c)}
                            >
                              <Edit className="w-4 h-4 mr-1" /> Editar
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>


          {/* MODAL EDITAR CAJA */}
          <Dialog open={!!editCaja} onOpenChange={() => setEditCaja(null)}>
            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-xl">
              <DialogHeader>
                <DialogTitle>Editar Caja</DialogTitle>
                <DialogDescription>Modifica los datos de la caja</DialogDescription>
              </DialogHeader>
              {editCaja && (
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={editCaja.nombre}
                      onChange={(e) => setEditCaja({ ...editCaja, nombre: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Input
                      value={editCaja.descripcion}
                      onChange={(e) => setEditCaja({ ...editCaja, descripcion: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Coordenada</Label>
                    <div className="flex gap-2">
                      <Input
                        value={editCaja.coordenada}
                        onChange={(e) => setEditCaja({ ...editCaja, coordenada: e.target.value })}
                        className="bg-gray-700 border-gray-600"
                      />
                      <Button
                        size="icon"
                        onClick={() => getLocation((c) => setEditCaja({ ...editCaja, coordenada: c }))}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button className="text-black" variant="outline" onClick={() => setEditCaja(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveCaja} className="bg-blue-600 hover:bg-blue-700">
                  Guardar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
