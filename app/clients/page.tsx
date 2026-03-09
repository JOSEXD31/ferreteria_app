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
import { Plus, Search, User, Phone, MapPin, Mail, IdCard, Users, CreditCard, Edit, Trash2 } from "lucide-react"
import { toast } from 'react-toastify'

interface Client {
    id_cliente: number
    nombre: string
    dni_ruc: string
    telefono: string
    email: string
    direccion: string
    tipo_cliente: string // 'natural', 'juridica'
    estado: number
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingClient, setEditingClient] = useState<Client | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        dni_ruc: "",
        telefono: "",
        direccion: ""
    })

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        try {
            const res = await fetch("/api/cliente")
            const data = await res.json()
            setClients(data)
        } catch (error) {
            console.error("Error fetching clients:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateClient = async () => {
        try {
            const method = editingClient ? "PUT" : "POST"
            const body = editingClient ? { ...formData, id_cliente: editingClient.id_cliente } : formData

            const res = await fetch("/api/cliente", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                toast.success(editingClient ? "Cliente actualizado con éxito" : "Cliente registrado con éxito")
                setIsCreateModalOpen(false)
                fetchClients()
                resetForm()
            }
        } catch (error) {
            toast.error("Error al registrar cliente")
        }
    }

    const resetForm = () => {
        setEditingClient(null)
        setFormData({ nombre: "", dni_ruc: "", telefono: "", direccion: "" })
    }

    const handleEdit = (c: Client) => {
        setEditingClient(c)
        setFormData({
            nombre: c.nombre || "",
            dni_ruc: c.dni_ruc || "",
            telefono: c.telefono || "",
            direccion: c.direccion || ""
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de desactivar este cliente?")) return;
        try {
            const res = await fetch(`/api/cliente?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Cliente desactivado")
                fetchClients()
            } else {
                toast.error("Error al desactivar")
            }
        } catch (error) {
            toast.error("Error de conexión al eliminar")
        }
    }

    const filteredClients = clients.filter(c =>
        c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dni_ruc.includes(searchTerm)
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
                                <Users className="text-indigo-400" /> Directorio de Clientes
                            </h1>
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">Total Clientes</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{clients.length}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">Personas Naturales</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-indigo-400">{clients.filter(c => c.tipo_cliente === 'natural').length}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">Empresas (RUC)</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-indigo-400">{clients.filter(c => c.tipo_cliente === 'juridica').length}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase">Activos</div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-green-400">{clients.filter(c => c.estado === 1).length}</div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Listado de Clientes</CardTitle>
                                        <CardDescription>Base de datos centralizada de clientes y empresas</CardDescription>
                                    </div>
                                    <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                                        if (!open) resetForm();
                                        setIsCreateModalOpen(open);
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold">
                                                <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>{editingClient ? "Editar Cliente" : "Registro de Cliente"}</DialogTitle>
                                                <DialogDescription>{editingClient ? "Actualice la información del cliente" : "Ingrese la información fiscal y de contacto"}</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Documento (DNI/RUC)</Label>
                                                    <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono" placeholder="12345678" value={formData.dni_ruc} onChange={e => setFormData({ ...formData, dni_ruc: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Razón Social / Nombre Completo</Label>
                                                    <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Ej: Juan Pérez o Distribuidora SAC" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Teléfono</Label>
                                                    <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="987654321" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Dirección Fiscal/Domicilio</Label>
                                                    <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Calle ..., Ciudad" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancelar</Button>
                                                <Button onClick={handleCreateClient} className="bg-indigo-600 hover:bg-indigo-700">{editingClient ? "Guardar Cambios" : "Guardar Cliente"}</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                    <Input
                                        placeholder="Buscar por nombre, DNI o RUC..."
                                        className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-w-md"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-200/50 dark:bg-slate-800/50">
                                            <TableRow className="border-slate-200 dark:border-slate-800">
                                                <TableHead>Cliente / Razón Social</TableHead>
                                                <TableHead>Documento</TableHead>
                                                <TableHead>Contacto</TableHead>
                                                <TableHead>Ubicación</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando clientes...</TableCell></TableRow>
                                            ) : filteredClients.map(c => (
                                                <TableRow key={c.id_cliente} className="border-slate-200 dark:border-slate-800 hover:bg-slate-200/20 dark:bg-slate-800/20 group">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                                                {c.nombre.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-slate-800 dark:text-slate-200">{c.nombre}</div>
                                                                <Badge variant="outline" className="text-[10px] h-4 font-normal mt-0.5 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                                                                    {c.tipo_cliente === 'natural' ? 'Persona' : 'Empresa'}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-sm">{c.dni_ruc}</TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">{c.telefono}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-500">{c.email}</div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                                        {c.direccion}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8 text-indigo-400 hover:text-indigo-300">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id_cliente)} className="h-8 w-8 text-red-400 hover:text-red-300">
                                                                <Trash2 className="h-4 w-4" />
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
            </SidebarInset>
        </SidebarProvider>
    )
}
