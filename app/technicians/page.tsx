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
    dni: string
    telefono: string
    email: string
    especialidad: string
    estado: string
}

export default function TechniciansPage() {
    const [technicians, setTechnicians] = useState<Technician[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    
    const [newTechnician, setNewTechnician] = useState({
        nombre: "",
        email: "",
        telefono: "",
        especialidad: "General",
        dni: "",
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
            const res = await fetch("/api/tecnicos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTechnician)
            })
            if (res.ok) {
                setIsCreateModalOpen(false)
                fetchTechnicians()
                toast.success("Técnico registrado")
                setNewTechnician({ nombre: "", email: "", telefono: "", especialidad: "General", dni: "" })
            }
        } catch (error) {
            toast.error("Error al registrar técnico")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "disponible": return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Disponible</Badge>
            case "ocupado": return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">En Trabajo</Badge>
            default: return <Badge variant="outline">{status}</Badge>
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
                <div className="min-h-screen bg-slate-950 text-white">
                    <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-xl">
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
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                <Input 
                                    placeholder="Buscar técnico..." 
                                    className="pl-10 bg-slate-900 border-slate-800"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                                        <Plus className="w-4 h-4 mr-2" /> Agregar Personal
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Registro de Técnico</DialogTitle>
                                        <DialogDescription>Ingrese los datos del nuevo colaborador técnico</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nombre Completo</Label>
                                                <Input className="bg-slate-800 border-slate-700" value={newTechnician.nombre} onChange={e => setNewTechnician({...newTechnician, nombre: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>DNI</Label>
                                                <Input className="bg-slate-800 border-slate-700" value={newTechnician.dni} onChange={e => setNewTechnician({...newTechnician, dni: e.target.value})} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Especialidad</Label>
                                            <Select onValueChange={v => setNewTechnician({...newTechnician, especialidad: v})}>
                                                <SelectTrigger className="bg-slate-800 border-slate-700">
                                                    <SelectValue placeholder="Seleccionar especialidad" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                    <SelectItem value="Electricista">Electricista</SelectItem>
                                                    <SelectItem value="Gasfitero">Gasfitero</SelectItem>
                                                    <SelectItem value="Albañil">Albañil</SelectItem>
                                                    <SelectItem value="Pintor">Pintor</SelectItem>
                                                    <SelectItem value="Técnico General">Técnico General</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Teléfono</Label>
                                                <Input className="bg-slate-800 border-slate-700" value={newTechnician.telefono} onChange={e => setNewTechnician({...newTechnician, telefono: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Email</Label>
                                                <Input className="bg-slate-800 border-slate-700" value={newTechnician.email} onChange={e => setNewTechnician({...newTechnician, email: e.target.value})} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                                        <Button onClick={handleCreateTechnician} className="bg-cyan-600 hover:bg-cyan-700">Registrar</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <Card key={i} className="bg-slate-900 border-slate-800 animate-pulse h-48"></Card>
                                ))
                            ) : filteredTechnicians.map(t => (
                                <Card key={t.id_tecnico} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 border-slate-800">
                                                    <AvatarFallback className="bg-slate-800 text-slate-400">
                                                        {t.nombre.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-bold text-slate-200">{t.nombre}</h3>
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Wrench className="w-3 h-3" /> {t.especialidad}
                                                    </div>
                                                </div>
                                            </div>
                                            {getStatusBadge(t.estado)}
                                        </div>
                                        
                                        <div className="space-y-2 text-sm text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3" /> {t.telefono}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3" /> {t.email}
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-400">
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
