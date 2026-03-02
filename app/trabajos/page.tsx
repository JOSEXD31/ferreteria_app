"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Search, Eye, Wrench, Clock, CheckCircle, AlertCircle, User, MapPin } from "lucide-react"
import { toast } from 'react-toastify'

interface Trabajo {
    id_trabajo: number
    descripcion: string
    fecha_inicio: string
    estado: string // 'pendiente', 'en_proceso', 'finalizado', 'cancelado'
    cliente?: { nombre: string, direccion: string }
    tecnico?: { nombre: string }
}

export default function TrabajosPage() {
    const [trabajos, setTrabajos] = useState<Trabajo[]>([])
    const [tecnicos, setTecnicos] = useState([])
    const [clientes, setClientes] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        descripcion: "",
        id_cliente: "",
        id_tecnico: "",
        fecha_inicio: "",
        estado: "pendiente"
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [resTrab, resTec, resCli] = await Promise.all([
                fetch("/api/trabajos"),
                fetch("/api/tecnicos"),
                fetch("/api/cliente")
            ])
            const dataTrab = await resTrab.json()
            const dataTec = await resTec.json()
            const dataCli = await resCli.json()
            setTrabajos(dataTrab)
            setTecnicos(dataTec)
            setClientes(dataCli)
        } catch (error) {
            console.error("Error fetching jobs data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            const res = await fetch("/api/trabajos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (!res.ok) throw new Error("Error al crear trabajo")
            toast.success("Trabajo programado con éxito")
            setIsCreateModalOpen(false)
            fetchData()
        } catch (error) {
            toast.error("Error al programar trabajo")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pendiente': return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">Pendiente</Badge>
            case 'en_proceso': return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/50">En Proceso</Badge>
            case 'finalizado': return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">Finalizado</Badge>
            default: return <Badge variant="outline">{status}</Badge>
        }
    }

    const filteredTrabajos = trabajos.filter(t => 
        t.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
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
                                <Wrench className="text-blue-400" /> Servicios y Trabajos Técnicos
                            </h1>
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Pendientes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{trabajos.filter(t => t.estado === 'pendiente').length}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <Wrench className="w-3 h-3" /> En Ejecución
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-blue-400">{trabajos.filter(t => t.estado === 'en_proceso').length}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <CheckCircle className="w-3 h-3" /> Completados hoy
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-400">{trabajos.filter(t => t.estado === 'finalizado').length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Listado de Servicios</CardTitle>
                                        <CardDescription>Control de instalaciones y reparaciones</CardDescription>
                                    </div>
                                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-blue-600 hover:bg-blue-700">
                                                <Plus className="w-4 h-4 mr-2" /> Programar Servicio
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-xl">
                                            <DialogHeader>
                                                <DialogTitle>Nueva Orden de Servicio</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Cliente</Label>
                                                    <Select onValueChange={v => setFormData({...formData, id_cliente: v})}>
                                                        <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                            <SelectValue placeholder="Seleccionar cliente..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                            {clientes.map((c: any) => (
                                                                <SelectItem key={c.id_cliente} value={c.id_cliente.toString()}>{c.nombre}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Técnico Asignado</Label>
                                                        <Select onValueChange={v => setFormData({...formData, id_tecnico: v})}>
                                                            <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                                <SelectValue placeholder="Seleccionar..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                                {tecnicos.map((t: any) => (
                                                                    <SelectItem key={t.id_tecnico} value={t.id_tecnico.toString()}>{t.nombre}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Fecha de Inicio</Label>
                                                        <Input type="datetime-local" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" onChange={e => setFormData({...formData, fecha_inicio: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Requerimiento / Descripción</Label>
                                                    <Textarea className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" rows={4} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                                                <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Guardar Orden</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                    <Input 
                                        placeholder="Buscar por descripción o cliente..." 
                                        className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-w-sm"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-200/50 dark:bg-slate-800/50">
                                            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-slate-200/50 dark:bg-slate-800/50">
                                                <TableHead>Servicio / Descripción</TableHead>
                                                <TableHead>Progreso</TableHead>
                                                <TableHead>Asignado a</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-500">Cargando trabajos...</TableCell></TableRow>
                                            ) : filteredTrabajos.map(t => (
                                                <TableRow key={t.id_trabajo} className="border-slate-200 dark:border-slate-800 hover:bg-slate-200/20 dark:bg-slate-800/20">
                                                    <TableCell className="max-w-[300px]">
                                                        <div className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.descripcion}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(t.fecha_inicio).toLocaleString()}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{getStatusBadge(t.estado)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400">
                                                                {t.tecnico?.nombre.charAt(0)}
                                                            </div>
                                                            <span className="text-sm">{t.tecnico?.nombre || 'Sin asignar'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{t.cliente?.nombre}</div>
                                                        <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                                            <MapPin className="w-2 h-2" /> {t.cliente?.direccion}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
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
            </SidebarInset>
        </SidebarProvider>
    )
}
