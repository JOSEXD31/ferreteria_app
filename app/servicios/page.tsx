"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navarcobranza"
import { Plus, Search, Edit, Trash2, Settings, ListChecks } from "lucide-react"
import { toast } from 'react-toastify'
import { Badge } from "@/components/ui/badge"

interface Servicio {
    serv_id: number
    serv_nombre: string
    serv_precio: number
    serv_tipo: string
}

export default function ServiciosPage() {
    const [servicios, setServicios] = useState<Servicio[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingService, setEditingService] = useState<Servicio | null>(null)

    const [formData, setFormData] = useState({
        serv_nombre: "",
        serv_precio: ""
    })

    useEffect(() => {
        fetchServicios()
    }, [])

    const fetchServicios = async () => {
        try {
            const res = await fetch("/api/servicios")
            if (!res.ok) throw new Error("Error al cargar servicios")
            const data = await res.json()
            setServicios(data)
        } catch (error) {
            toast.error("Error al cargar los servicios")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            if (!formData.serv_nombre || !formData.serv_precio) {
                toast.warning("Complete todos los campos")
                return
            }

            const url = "/api/servicios"
            const method = editingService ? "PUT" : "POST"
            const body = editingService
                ? { ...formData, serv_id: editingService.serv_id }
                : formData

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (!res.ok) throw new Error("Error al guardar")

            toast.success(editingService ? "Servicio actualizado" : "Servicio creado")
            setIsModalOpen(false)
            fetchServicios()
            resetForm()
        } catch (error) {
            toast.error("Error al guardar el servicio")
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar este servicio?")) return

        try {
            const res = await fetch(`/api/servicios?id=${id}`, {
                method: "DELETE"
            })

            if (!res.ok) throw new Error("Error al eliminar")

            toast.success("Servicio eliminado")
            fetchServicios()
        } catch (error) {
            toast.error("Error al eliminar el servicio")
        }
    }

    const handleEdit = (servicio: Servicio) => {
        setEditingService(servicio)
        setFormData({
            serv_nombre: servicio.serv_nombre,
            serv_precio: servicio.serv_precio.toString()
        })
        setIsModalOpen(true)
    }

    const resetForm = () => {
        setEditingService(null)
        setFormData({ serv_nombre: "", serv_precio: "" })
    }

    const filteredServicios = servicios.filter(serv =>
        serv.serv_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
                    <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
                        <SidebarTrigger className="-ml-1 text-white" />
                        <div className="flex-1">
                            <h1 className="text-xl font-semibold text-white">Gestión de Servicios</h1>
                        </div>
                        <Navbar />
                    </header>

                    <div className="p-6">
                        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <ListChecks className="h-6 w-6" />
                                            Servicios y Planes
                                        </CardTitle>
                                        <CardDescription className="text-gray-400">
                                            Administra los planes y servicios disponibles
                                        </CardDescription>
                                    </div>

                                    <Dialog open={isModalOpen} onOpenChange={(open) => {
                                        setIsModalOpen(open)
                                        if (!open) resetForm()
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Nuevo Servicio
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-gray-800 border-gray-700 text-white">
                                            <DialogHeader>
                                                <DialogTitle>{editingService ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    {editingService ? "Modifica los datos del servicio" : "Ingresa los datos del nuevo servicio"}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="nombre">Nombre del Servicio</Label>
                                                    <Input
                                                        id="nombre"
                                                        value={formData.serv_nombre}
                                                        onChange={(e) => setFormData({ ...formData, serv_nombre: e.target.value })}
                                                        className="bg-gray-700 border-gray-600 text-white"
                                                        placeholder="Ej. Plan Fibra 100MB"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="precio">Costo Mensual (S/)</Label>
                                                    <Input
                                                        id="precio"
                                                        type="number"
                                                        step="0.01"
                                                        value={formData.serv_precio}
                                                        onChange={(e) => setFormData({ ...formData, serv_precio: e.target.value })}
                                                        className="bg-gray-700 border-gray-600 text-white"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setIsModalOpen(false)}
                                                    className="hover:bg-gray-700 hover:text-white"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    onClick={handleSubmit}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                >
                                                    Guardar
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar servicios..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-gray-700/50 border-gray-600 text-white max-w-sm"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-md border border-gray-700">
                                    <Table>
                                        <TableHeader className="bg-gray-800">
                                            <TableRow className="border-gray-700 hover:bg-gray-800">
                                                <TableHead className="text-gray-300">Nombre</TableHead>
                                                <TableHead className="text-gray-300">Tipo</TableHead>
                                                <TableHead className="text-gray-300 text-right">Precio</TableHead>
                                                <TableHead className="text-gray-300 text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                                                        Cargando servicios...
                                                    </TableCell>
                                                </TableRow>
                                            ) : filteredServicios.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                                                        No se encontraron servicios
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                filteredServicios.map((servicio) => (
                                                    <TableRow key={servicio.serv_id} className="border-gray-700 hover:bg-gray-700/50">
                                                        <TableCell className="text-gray-200 font-medium">
                                                            {servicio.serv_nombre}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                                                                {servicio.serv_tipo || "PLAN"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right text-green-400 font-semibold">
                                                            S/ {Number(servicio.serv_precio).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleEdit(servicio)}
                                                                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDelete(servicio.serv_id)}
                                                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
