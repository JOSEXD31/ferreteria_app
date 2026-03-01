"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, Calendar, Wrench, User } from "lucide-react"
import { toast } from 'react-toastify';

interface per_ofina {
  id: string
  name: string
  email: string
  phone: string
  specialization: string
  status: string
  location: string
  activeOrders: number
  completedOrders: number
  rating: number
  joinDate: string
  avatar?: string
}

export default function cajeroPage() {

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedCajero, setSelectedCajero] = useState<per_ofina | null>(null)
  const [newCajero, setnewCajero] = useState({
    name: "",
    email: "",
    phone: "",
    esp_id: "",
    dni: "",
  });


  //Carga de tecnicos
  const fetchcajero = async () => {
    try {
      const res = await fetch("/api/personal_oficina");
      if (!res.ok) {
        console.error("Error al obtener técnicos:", res.status);
        return;
      }

      const data = await res.json();
      setcajero(data);
      setFilteredcajero(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  useEffect(() => {
    fetchcajero();
  }, []);


  const handleCreateCajero = async () => {
    try {
      const res = await fetch("/api/personal_oficina", {
        method: "POST",
        body: JSON.stringify({
          ...newCajero,
          esp_id: parseInt(newCajero.esp_id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.error) {
        toast.error("Error:", data.error)
      } else {
        toast.success("Cliente creado correctamente");
        setIsCreateModalOpen(false);
        setnewCajero({
          name: "",
          email: "",
          phone: "",
          dni: "",
          esp_id: "",
        });
        await fetchcajero(); 
      }
    } catch (error) {
      toast.error("Error al crear el personal de oficina");
    }
  };

  const [cajero, setcajero] = useState<per_ofina[]>([]);
  const [filteredcajero, setFilteredcajero] = useState<per_ofina[]>([]);




  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return "bg-green-500"
      case "INHABILITADO":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }



  const handleEditCajero = () => {
    if (selectedCajero) {
      setcajero(cajero.map((tech) => (tech.id === selectedCajero.id ? selectedCajero : tech)))
      setIsEditModalOpen(false)
      setSelectedCajero(null)
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
              <h1 className="text-xl font-semibold text-white">Gestión de Personal de Oficina</h1>
              <p className="text-sm text-gray-300">Administra el equipo de cajeros</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Personales de Oficina</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona la información y estado de los cajeros
                    </CardDescription>
                  </div>
                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo Cajero
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Agregar Nuevo Personal de oficina</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Completa la información del nuevo cajero
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <Input
                              id="name"
                              value={newCajero.name}
                              onChange={(e) => setnewCajero({ ...newCajero, name: e.target.value.toUpperCase() })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Correo</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newCajero.email}
                              onChange={(e) => setnewCajero({ ...newCajero, email: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="phone">Celular</Label>
                            <Input
                              id="phone"
                              value={newCajero.phone}
                              onChange={(e) => setnewCajero({ ...newCajero, phone: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                              maxLength={9}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="dni">DNI</Label>
                            <Input
                              id="dni"
                              value={newCajero.dni}
                              onChange={(e) => setnewCajero({ ...newCajero, dni: e.target.value })}
                              className="bg-gray-700 border-gray-600"
                              maxLength={8}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 text-black">
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="hover:bg-gray-600 hover:text-white transition">
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateCajero}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 text-white hover:to-blue-700 transition"
                        >
                          Crear Cajero
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Técnico</TableHead>
                        <TableHead className="text-gray-200">Contacto</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredcajero.map((Cajero) => (
                        <TableRow key={Cajero.id} className="border-gray-700">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <User className="w-4 h-4 text-white" />

                              <div>
                                <p className="text-white font-medium">{Cajero.name}</p>
                                <p className="text-xs text-gray-400">{Cajero.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center text-sm text-gray-200">
                                <Mail className="w-3 h-3 mr-1" />
                                {Cajero.email}
                              </div>
                              <div className="flex items-center text-sm text-gray-200">
                                <Phone className="w-3 h-3 mr-1" />
                                {Cajero.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(Cajero.status)} text-white`}>
                              {Cajero.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCajero(Cajero)
                                  setIsViewModalOpen(true)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCajero(Cajero)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-gray-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de visualización */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Perfil del Personal de Oficina</DialogTitle>
              <DialogDescription className="text-gray-400">Información detallada del cajero</DialogDescription>
            </DialogHeader>
            {selectedCajero && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedCajero.name}</h3>
                    <p className="text-gray-400">{selectedCajero.id}</p>
                    <Badge className={`${getStatusColor(selectedCajero.status)} text-white mt-1`}>
                      {selectedCajero.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Contacto</Label>
                      <div className="space-y-2 mt-1">
                        <div className="flex items-center text-white">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedCajero.email}
                        </div>
                        <div className="flex items-center text-white">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedCajero.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-400">Fecha de Registro</Label>
                      <div className="flex items-center text-white mt-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {selectedCajero.joinDate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Técnico</DialogTitle>
              <DialogDescription className="text-gray-400">Modifica la información del técnico</DialogDescription>
            </DialogHeader>
            {selectedCajero && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nombre Completo</Label>
                    <Input
                      id="edit-name"
                      value={selectedCajero.name}
                      onChange={(e) => setSelectedCajero({ ...selectedCajero, name: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={selectedCajero.email}
                      onChange={(e) => setSelectedCajero({ ...selectedCajero, email: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Teléfono</Label>
                    <Input
                      id="edit-phone"
                      value={selectedCajero.phone}
                      onChange={(e) => setSelectedCajero({ ...selectedCajero, phone: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={selectedCajero.status}
                      onValueChange={(value) => setSelectedCajero({ ...selectedCajero, status: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Disponible">Disponible</SelectItem>
                        <SelectItem value="En Campo">En Campo</SelectItem>
                        <SelectItem value="Ocupado">Ocupado</SelectItem>
                        <SelectItem value="Descanso">Descanso</SelectItem>
                        <SelectItem value="Inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialization">Especialización</Label>
                    <Select
                      value={selectedCajero.specialization}
                      onValueChange={(value) => setSelectedCajero({ ...selectedCajero, specialization: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Fibra Óptica">Fibra Óptica</SelectItem>
                        <SelectItem value="Instalaciones">Instalaciones</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="Reparaciones">Reparaciones</SelectItem>
                        <SelectItem value="Cortes y Reconexiones">Cortes y Reconexiones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Zona de Trabajo</Label>
                    <Select
                      value={selectedCajero.location}
                      onValueChange={(value) => setSelectedCajero({ ...selectedCajero, location: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Zona Norte">Zona Norte</SelectItem>
                        <SelectItem value="Zona Sur">Zona Sur</SelectItem>
                        <SelectItem value="Zona Este">Zona Este</SelectItem>
                        <SelectItem value="Zona Oeste">Zona Oeste</SelectItem>
                        <SelectItem value="Zona Centro">Zona Centro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditCajero} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
