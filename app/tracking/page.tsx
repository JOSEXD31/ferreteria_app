"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Clock, CheckCircle, AlertCircle, User } from "lucide-react"

interface TrackingEvent {
  id: string
  timestamp: string
  status: string
  description: string
  location?: string
  technician?: string
}

interface OrderTracking {
  orderId: string
  client: string
  type: string
  currentStatus: string
  progress: number
  events: TrackingEvent[]
}

export default function TrackingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)

  const trackingData: OrderTracking[] = [
    {
      orderId: "OT-2024-001",
      client: "Juan Pérez",
      type: "Instalación",
      currentStatus: "En Progreso",
      progress: 60,
      events: [
        {
          id: "1",
          timestamp: "2024-01-15 08:00",
          status: "Creada",
          description: "Orden de trabajo creada en el sistema",
          technician: "Sistema",
        },
        {
          id: "2",
          timestamp: "2024-01-15 09:30",
          status: "Asignada",
          description: "Orden asignada al técnico Carlos López",
          technician: "Supervisor",
        },
        {
          id: "3",
          timestamp: "2024-01-16 10:00",
          status: "En Ruta",
          description: "Técnico en camino al sitio de instalación",
          location: "Calle Principal 123",
          technician: "Carlos López",
        },
        {
          id: "4",
          timestamp: "2024-01-16 11:15",
          status: "En Sitio",
          description: "Técnico llegó al sitio, iniciando instalación",
          location: "Calle Principal 123",
          technician: "Carlos López",
        },
        {
          id: "5",
          timestamp: "2024-01-16 14:30",
          status: "En Progreso",
          description: "Instalación de fibra óptica al 60% completada",
          location: "Calle Principal 123",
          technician: "Carlos López",
        },
      ],
    },
    {
      orderId: "OT-2024-002",
      client: "María García",
      type: "Reconexión",
      currentStatus: "Completada",
      progress: 100,
      events: [
        {
          id: "1",
          timestamp: "2024-01-14 09:00",
          status: "Creada",
          description: "Orden de reconexión creada",
          technician: "Sistema",
        },
        {
          id: "2",
          timestamp: "2024-01-14 10:00",
          status: "Asignada",
          description: "Asignada a Ana Martín",
          technician: "Supervisor",
        },
        {
          id: "3",
          timestamp: "2024-01-15 08:30",
          status: "En Ruta",
          description: "Técnico en camino",
          technician: "Ana Martín",
        },
        {
          id: "4",
          timestamp: "2024-01-15 09:45",
          status: "Completada",
          description: "Servicio reconectado exitosamente",
          location: "Avenida Central 456",
          technician: "Ana Martín",
        },
      ],
    },
  ]

  const filteredOrders = trackingData.filter(
    (order) =>
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Creada":
      case "Asignada":
        return <Clock className="w-4 h-4 text-blue-400" />
      case "En Ruta":
      case "En Sitio":
      case "En Progreso":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      case "Completada":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completada":
        return "bg-green-500"
      case "En Progreso":
        return "bg-blue-500"
      case "En Ruta":
        return "bg-yellow-500"
      case "Pendiente":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Seguimiento de Órdenes</h1>
              <p className="text-sm text-gray-300">Rastrea el progreso de las órdenes de trabajo en tiempo real</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Seguimiento en Tiempo Real</CardTitle>
                <CardDescription className="text-gray-400">
                  Monitorea el estado y progreso de todas las órdenes de trabajo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por ID de orden o cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Lista de órdenes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Órdenes Activas</h3>
                    {filteredOrders.map((order) => (
                      <Card
                        key={order.orderId}
                        className={`bg-gray-700/30 border-gray-600 cursor-pointer transition-all hover:bg-slate-700/50 ${
                          selectedOrder === order.orderId ? "ring-2 ring-cyan-500" : ""
                        }`}
                        onClick={() => setSelectedOrder(order.orderId)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-white">{order.orderId}</h4>
                              <p className="text-sm text-gray-400">
                                {order.client} - {order.type}
                              </p>
                            </div>
                            <Badge className={`${getStatusColor(order.currentStatus)} text-white`}>
                              {order.currentStatus}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progreso</span>
                              <span className="text-white">{order.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${order.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Detalles del seguimiento */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Historial de Eventos</h3>
                    {selectedOrder ? (
                      <Card className="bg-gray-700/30 border-gray-600">
                        <CardContent className="p-4">
                          {(() => {
                            const order = trackingData.find((o) => o.orderId === selectedOrder)
                            if (!order) return null

                            return (
                              <div className="space-y-4">
                                <div className="border-b border-gray-600 pb-3">
                                  <h4 className="font-semibold text-white">{order.orderId}</h4>
                                  <p className="text-sm text-gray-400">
                                    {order.client} - {order.type}
                                  </p>
                                </div>

                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                  {order.events.map((event, index) => (
                                    <div key={event.id} className="flex space-x-3">
                                      <div className="flex flex-col items-center">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600">
                                          {getStatusIcon(event.status)}
                                        </div>
                                        {index < order.events.length - 1 && (
                                          <div className="w-px h-8 bg-gray-600 mt-2"></div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <p className="text-sm font-medium text-white">{event.status}</p>
                                          <p className="text-xs text-gray-400">{event.timestamp}</p>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                                        {event.location && (
                                          <div className="flex items-center mt-2 text-xs text-gray-400">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {event.location}
                                          </div>
                                        )}
                                        {event.technician && (
                                          <div className="flex items-center mt-1 text-xs text-gray-400">
                                            <User className="w-3 h-3 mr-1" />
                                            {event.technician}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-gray-700/30 border-gray-600">
                        <CardContent className="p-8 text-center">
                          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-400">Selecciona una orden para ver su historial de seguimiento</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mapa de ubicaciones en tiempo real */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Ubicaciones en Tiempo Real</CardTitle>
                <CardDescription className="text-gray-400">Posición actual de los técnicos en campo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-white font-medium">Carlos López</span>
                        </div>
                        <Badge className="bg-blue-500 text-white">En Sitio</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">OT-2024-001 - Instalación</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        Calle Principal 123, Ciudad
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Última actualización: hace 5 min
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                          <span className="text-white font-medium">Ana Martín</span>
                        </div>
                        <Badge className="bg-yellow-500 text-white">En Ruta</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">OT-2024-005 - Mantenimiento</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        Dirección a Av. Norte 789
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        ETA: 15 minutos
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-700/30 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                          <span className="text-white font-medium">Luis Torres</span>
                        </div>
                        <Badge className="bg-gray-500 text-white">Disponible</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">Sin asignación activa</p>
                      <div className="flex items-center text-xs text-gray-400">
                        <MapPin className="w-3 h-3 mr-1" />
                        Oficina Central
                      </div>
                      <div className="flex items-center text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        Última actualización: hace 2 min
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
