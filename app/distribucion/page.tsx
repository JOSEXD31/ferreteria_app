"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Navbar } from "@/components/navarDistribucion"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, User, Building, UserIcon, MapPinIcon, BriefcaseIcon, PlusCircle, Map } from "lucide-react"
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';


type nodo = {
  id_nodo: number
  nombre: string
  descripcion: string
  coordenada: string
  estado: string
}


export default function ClientsPage() {

  const [nodos, setNodos] = useState<nodo[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [mostrarTabla, setMostrarTabla] = useState(false);




  const [newNodo, setnewNodo] = useState({
    nombre: "",
    descripcion: "",
    coordenada: "",
    num_cajas: "8",
  })

  //Carga de nodos

  const fetchNodos = async () => {
    try {
      const res = await fetch("/api/nodo")
      const data = await res.json()
      setNodos(data)
    } catch (err) {
      console.error("Error al cargar nodos:", err)
    }
  }

  useEffect(() => {
    fetchNodos()
  }, [])


  useEffect(() => {
    if (!nodos || nodos.length === 0) return;

    const L = require('leaflet');

    const map = L.map('map').setView([-34.6037, -58.3816], 5); // Ubicación inicial

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Icono personalizado
    const customIcon = L.icon({
      iconUrl: '/map_icon/mufa.webp',
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -32],
    });

    const group = L.featureGroup();

    nodos.forEach(nodo => {
      if (!nodo.coordenada || !nodo.coordenada.includes(',')) return;

      const [lat, lng] = nodo.coordenada.split(',').map(Number);
      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupContent = `
      <div style="font-family: sans-serif;">
        <strong>${nodo.nombre}</strong><br />
        <span>${nodo.descripcion}</span>
      </div>
    `;

      marker.bindPopup(popupContent);
      group.addLayer(marker);
    });

    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      map.remove(); // Limpieza del mapa al desmontar el componente
    };
  }, [nodos]);


  const creacion_nodo = async () => {
    try {
      const res = await fetch("/api/nodo/agregar", {
        method: "POST",
        body: JSON.stringify({ ...newNodo }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.error) {
        toast.error(data.error);
        return;
      }

      toast.success("Nodo añadido correctamente");
      setIsCreateModalOpen(false);
      setnewNodo({
        nombre: "",
        descripcion: "",
        coordenada: "",
        num_cajas: "8",
      });
      fetchNodos()

    } catch (error) {
      toast.error("Error inesperado al añadir el nodo");
      console.error("Error al añadir el nodo:", error);
    }
  };

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
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>

                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Nodo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Añadir Nuevo Nodo</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Ingresa la información del nodo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre del Nodo</Label>
                          <Input
                            id="nombre"
                            value={newNodo.nombre}
                            onChange={(e) => setnewNodo({ ...newNodo, nombre: e.target.value })}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="num_cajas">Numero de Cajas</Label>
                          <Select
                            value={newNodo.num_cajas}
                            onValueChange={(value) => setnewNodo({ ...newNodo, num_cajas: value })}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600">
                              <SelectValue placeholder="Seleccionar el numero de cajas" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              <SelectItem value="4">4 Cajas</SelectItem>
                              <SelectItem value="8">8 Cajas</SelectItem>
                              <SelectItem value="16">16 Cajas</SelectItem>
                              <SelectItem value="32">32 Cajas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripcion</Label>
                        <Input
                          id="descripcion"
                          type="text"
                          value={newNodo.descripcion}
                          onChange={(e) => setnewNodo({ ...newNodo, descripcion: e.target.value })}
                          className="bg-gray-700 border-gray-600"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="coordenada">Coordenada</Label>
                          <Input
                            id="coordenada"
                            type="text"
                            value={newNodo.coordenada}
                            onChange={(e) => setnewNodo({ ...newNodo, coordenada: e.target.value })}
                            className="bg-gray-700 border-gray-600"
                          />
                        </div>
                        <div className="space-y-2 flex items-end">
                          <Button
                            type="button"
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                            onClick={() => {
                              if (navigator.geolocation) {
                                navigator.geolocation.getCurrentPosition(
                                  (position) => {
                                    const coords = `${position.coords.latitude}, ${position.coords.longitude}`;
                                    setnewNodo({ ...newNodo, coordenada: coords });
                                  },
                                  (error) => {
                                    console.error("Error al obtener ubicación:", error);
                                    alert("No se pudo obtener la ubicación. Por favor, revisa los permisos del navegador.");
                                  },
                                  {
                                    enableHighAccuracy: true, // 🎯 Solicita mayor precisión
                                    timeout: 10000,           // Tiempo máximo de espera (en ms)
                                    maximumAge: 0             // No usar caché
                                  }
                                );

                              } else {
                                alert("La geolocalización no está soportada por este navegador.");
                              }
                            }}
                          >
                            <MapPin className="w-4 h-4 mr-2" />Obtener Coordenada Actual</Button>
                        </div>
                      </div>

                    </div>

                    <div className="flex justify-end space-x-2 text-black">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="hover:bg-gray-600 hover:text-white transition">
                        Cancelar
                      </Button>
                      <Button
                        onClick={creacion_nodo}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-white hover:to-blue-700 transition"
                      >
                        Añadir Caja
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div
                  id="map"
                  className="w-full h-[calc(100vh-300px)] min-h-[500px] rounded-md z-0"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
