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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Eye, Phone, Mail, Wrench, User, Trash2 } from "lucide-react"
import { toast } from 'react-toastify'

interface Technician {
    id_tecnico: number
    nombre: string
    telefono: string
    especialidad: string
    estado: number
}

export default function TechniciansPage() {
    const [technicians, setTechnicians] = useState<Technician[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingTechnician, setEditingTechnician] = useState<Technician | null>(null)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        especialidad: "Técnico General",
    })

    useEffect(() => {
        fetchTechnicians()
    }, [])

    const fetchTechnicians = async () => {
        try {
            const res = await fetch("/api/tecnicos")
            const data = await res.json()
            setTechnicians(data)
        } catch (error) {
            console.error("Error fetching technicians:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTechnician = async () => {
        try {
            const method = editingTechnician ? "PUT" : "POST"
            const body = editingTechnician ? { ...formData, id_tecnico: editingTechnician.id_tecnico } : formData

            const res = await fetch("/api/tecnicos", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                setIsCreateModalOpen(false)
                fetchTechnicians()
                toast.success(editingTechnician ? "Técnico actualizado" : "Técnico registrado")
                resetForm()
            } else {
                toast.error("Error al guardar técnico")
            }
        } catch (error) {
            toast.error("Error de conexión al guardar")
        }
    }

    const resetForm = () => {
        setEditingTechnician(null)
        setFormData({ nombre: "", telefono: "", especialidad: "Técnico General" })
    }

    const handleEdit = (t: Technician) => {
        setEditingTechnician(t)
        setFormData({
            nombre: t.nombre || "",
            telefono: t.telefono || "",
            especialidad: t.especialidad || "Técnico General"
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de desactivar este técnico?")) return;
        try {
            const res = await fetch(`/api/tecnicos?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Técnico desactivado")
                fetchTechnicians()
            } else {
                toast.error("Error al desactivar")
            }
        } catch (error) {
            toast.error("Error de conexión al eliminar")
        }
    }

    const getStatusBadge = (estado: number) => {
        switch (estado) {
            case 1: return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Disponible</Badge>
            case 0: return <Badge className="bg-red-500/20 text-red-500 border-red-500/50">Inactivo</Badge>
            default: return <Badge variant="outline">Desconocido</Badge>
        }
    }

    const filteredTechnicians = technicians.filter(t =>
        t.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <User className="text-cyan-400" /> Personal Técnico
                            </h1>
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                <Input
                                    placeholder="Buscar técnico..."
                                    className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                                if (!open) resetForm();
                                setIsCreateModalOpen(open);
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                                        <Plus className="w-4 h-4 mr-2" /> Agregar Personal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>{editingTechnician ? "Editar Técnico" : "Registro de Técnico"}</DialogTitle>
                                        <DialogDescription>{editingTechnician ? "Modifique los datos del colaborador técnico" : "Ingrese los datos del nuevo colaborador técnico"}</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Nombre Completo <span className="text-red-400">*</span></Label>
                                            <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Teléfono</Label>
                                            <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Especialidad</Label>
                                            <Select value={formData.especialidad} onValueChange={v => setFormData({ ...formData, especialidad: v })}>
                                                <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                                                    <SelectValue placeholder="Seleccionar especialidad" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                    <SelectItem value="Electricista">Electricista</SelectItem>
                                                    <SelectItem value="Gasfitero">Gasfitero</SelectItem>
                                                    <SelectItem value="Albañil">Albañil</SelectItem>
                                                    <SelectItem value="Pintor">Pintor</SelectItem>
                                                    <SelectItem value="Técnico General">Técnico General</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancelar</Button>
                                        <Button onClick={handleCreateTechnician} className="bg-cyan-600 hover:bg-cyan-700">{editingTechnician ? "Guardar Cambios" : "Registrar"}</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 animate-pulse h-48"></Card>
                                ))
                            ) : filteredTechnicians.map(t => (
                                <Card key={t.id_tecnico} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 transition-colors">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-slate-200 dark:border-slate-800">
                                                    <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                                        {t.nombre.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{t.nombre}</h3>
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                                                        <Wrench className="w-3 h-3" /> {t.especialidad}
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(t.estado)}
                                        </div>

                                        <div className="space-y-2 text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> {t.telefono || "Teléfono no registrado"}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id_tecnico)} className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-red-400">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
