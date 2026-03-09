"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Plus, Search, MapPin, Mail, Phone, Building2, ExternalLink, Edit, Trash2 } from "lucide-react"
import { toast } from 'react-toastify'
import { InventoryHeader } from "@/components/inventory-header"

interface Proveedor {
    id_proveedor: number
    ruc: string
    nombre: string
    telefono: string
    email: string
    direccion: string
    estado: number
}

export default function ProveedoresPage() {
    const [proveedores, setProveedores] = useState<Proveedor[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        ruc: "",
        telefono: "",
        email: "",
        direccion: ""
    })

    useEffect(() => {
        fetchProveedores()
    }, [])

    const fetchProveedores = async () => {
        try {
            const res = await fetch("/api/proveedores")
            const data = await res.json()
            setProveedores(data)
        } catch (error) {
            console.error("Error fetching proveedores:", error)
            toast.error("Error al cargar proveedores")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateProveedor = async () => {
        try {
            const method = editingProveedor ? "PUT" : "POST"
            const body = editingProveedor ? { ...formData, id_proveedor: editingProveedor.id_proveedor } : formData

            const res = await fetch("/api/proveedores", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                toast.success(editingProveedor ? "Proveedor actualizado con éxito" : "Proveedor registrado con éxito")
                setIsCreateModalOpen(false)
                fetchProveedores()
                resetForm()
            } else {
                toast.error("Error al guardar proveedor")
            }
        } catch (error) {
            toast.error("Error de red al guardar proveedor")
        }
    }

    const resetForm = () => {
        setEditingProveedor(null)
        setFormData({ nombre: "", ruc: "", telefono: "", email: "", direccion: "" })
    }

    const handleEdit = (p: Proveedor) => {
        setEditingProveedor(p)
        setFormData({
            nombre: p.nombre || "",
            ruc: p.ruc || "",
            telefono: p.telefono || "",
            email: p.email || "",
            direccion: p.direccion || ""
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de desactivar este proveedor?")) return;
        try {
            const res = await fetch(`/api/proveedores?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Proveedor desactivado")
                fetchProveedores()
            } else {
                toast.error("Error al desactivar")
            }
        } catch (error) {
            toast.error("Error de conexión al eliminar")
        }
    }

    const filteredProveedores = proveedores.filter(p =>
        p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ruc?.includes(searchTerm)
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
                    <InventoryHeader />

                    <div className="p-6 flex-1">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <Card className="bg-indigo-600/10 border-indigo-500/20 w-full md:w-auto flex-1">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-indigo-500/20 rounded-lg">
                                            <Building2 className="h-6 w-6 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">Total Proveedores</p>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{proveedores.length}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl w-full mx-auto">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle>Listado de Proveedores</CardTitle>
                                            <CardDescription>Base de datos centralizada de proveedores y distribuidores</CardDescription>
                                        </div>
                                        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                                            if (!open) resetForm();
                                            setIsCreateModalOpen(open);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-indigo-600 hover:bg-indigo-700 font-semibold">
                                                    <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{editingProveedor ? "Editar Proveedor" : "Registro de Proveedor"}</DialogTitle>
                                                    <DialogDescription>{editingProveedor ? "Actualice la información del proveedor" : "Ingrese la información de la empresa proveedora"}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>RUC / ID Comercial</Label>
                                                        <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono" placeholder="20123456789" value={formData.ruc} onChange={e => setFormData({ ...formData, ruc: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Razón Social / Nombre</Label>
                                                        <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Ej: Distribuidora SAC" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Teléfono</Label>
                                                            <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="987654321" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Email</Label>
                                                            <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="ventas@empresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Dirección Fiscal</Label>
                                                        <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Calle ..., Ciudad" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancelar</Button>
                                                    <Button onClick={handleCreateProveedor} className="bg-indigo-600 hover:bg-indigo-700">{editingProveedor ? "Guardar Cambios" : "Guardar Proveedor"}</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="relative mt-4 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar por RUC o empresa..."
                                            className="pl-10 bg-slate-50 dark:bg-slate-950/50 border-slate-300 dark:border-slate-700"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                                            <TableRow className="border-slate-200 dark:border-slate-800">
                                                <TableHead>Empresa</TableHead>
                                                <TableHead>Contacto</TableHead>
                                                <TableHead>Ubicación</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-slate-800 border-t border-slate-200 dark:border-slate-800">
                                            {loading ? (
                                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400 dark:text-slate-500">Cargando proveedores...</TableCell></TableRow>
                                            ) : filteredProveedores.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-400 dark:text-slate-500">No se encontraron resultados</TableCell></TableRow>
                                            ) : filteredProveedores.map(p => (
                                                <TableRow key={p.id_proveedor} className="hover:bg-slate-200/50 dark:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800 group">
                                                    <TableCell>
                                                        <div className="font-semibold text-slate-900 dark:text-white">{p.nombre}</div>
                                                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-mono">Doc: {p.ruc || 'S/N'}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1 text-sm text-slate-700 dark:text-slate-300">
                                                            <div className="flex items-center gap-2"><Phone className="h-3 w-3 text-emerald-400" /> {p.telefono || 'No registrado'}</div>
                                                            <div className="flex items-center gap-2"><Mail className="h-3 w-3 text-blue-400" /> {p.email || 'No registrado'}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm max-w-[200px] truncate">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-3 w-3 shrink-0" />
                                                            <span className="truncate">{p.direccion || 'Ubicación no especificada'}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8 text-indigo-400 hover:text-indigo-300">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id_proveedor)} className="h-8 w-8 text-red-400 hover:text-red-300">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
