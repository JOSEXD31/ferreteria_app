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
import { Plus, Search, Edit, Trash2, Scale, Ruler } from "lucide-react"
import { toast } from 'react-toastify'
import { InventoryHeader } from "@/components/inventory-header"

interface UnidadMedida {
    id_unidad: number
    nombre: string
    abreviatura: string
}

export default function UnidadesMedidaPage() {
    const [unidades, setUnidades] = useState<UnidadMedida[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingUnidad, setEditingUnidad] = useState<UnidadMedida | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        abreviatura: ""
    })

    useEffect(() => {
        fetchUnidades()
    }, [])

    const fetchUnidades = async () => {
        try {
            const res = await fetch("/api/unidades")
            const data = await res.json()
            setUnidades(data)
        } catch (error) {
            console.error("Error fetching units:", error)
            toast.error("Error al cargar unidades de medida")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUnidad = async () => {
        if (!formData.nombre || !formData.abreviatura) {
            toast.warning("El nombre y la abreviatura son obligatorios")
            return
        }

        try {
            const method = editingUnidad ? "PUT" : "POST"
            const body = editingUnidad ? { ...formData, id_unidad: editingUnidad.id_unidad } : formData

            const res = await fetch("/api/unidades", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                toast.success(editingUnidad ? "Unidad actualizada" : "Unidad creada exitosamente")
                setIsCreateModalOpen(false)
                fetchUnidades()
                resetForm()
            } else {
                toast.error("Error al guardar unidad")
            }
        } catch (error) {
            toast.error("Error de conexión")
        }
    }

    const resetForm = () => {
        setEditingUnidad(null)
        setFormData({ nombre: "", abreviatura: "" })
    }

    const handleEdit = (u: UnidadMedida) => {
        setEditingUnidad(u)
        setFormData({
            nombre: u.nombre || "",
            abreviatura: u.abreviatura || ""
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar permanentemente esta unidad de medida?\nSolo podrá eliminarse si no está siendo usada por ningún producto.")) return;
        try {
            const res = await fetch(`/api/unidades?id=${id}`, { method: "DELETE" })
            const data = await res.json()
            if (res.ok) {
                toast.success("Unidad eliminada")
                fetchUnidades()
            } else {
                toast.error(data.message || "Error al eliminar")
            }
        } catch (error) {
            toast.error("Error de conexión al eliminar")
        }
    }

    const filteredUnidades = unidades.filter(u =>
        u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.abreviatura?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
                    <InventoryHeader />

                    <div className="p-6 flex-1">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <Card className="bg-emerald-600/10 border-emerald-500/20 w-full md:w-auto flex-1">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                                            <Ruler className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">Unidades Registradas</p>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{unidades.length}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl w-full mx-auto">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle>Listado de Unidades de Medida</CardTitle>
                                            <CardDescription>Gestión de métricas para productos del inventario</CardDescription>
                                        </div>
                                        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                                            if (!open) resetForm();
                                            setIsCreateModalOpen(open);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-emerald-600 hover:bg-emerald-700 font-semibold text-slate-900 dark:text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Nueva Unidad
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-sm">
                                                <DialogHeader>
                                                    <DialogTitle>{editingUnidad ? "Editar Unidad" : "Agregar Unidad de Medida"}</DialogTitle>
                                                    <DialogDescription>{editingUnidad ? "Modifique el nombre o abreviatura" : "Cree una nueva unidad de medida"}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Nombre de la Unidad <span className="text-red-400">*</span></Label>
                                                        <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Ej: Kilogramos, Metros, Unidades" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Abreviatura <span className="text-red-400">*</span></Label>
                                                        <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Ej: Kg, mt, und" value={formData.abreviatura} onChange={e => setFormData({ ...formData, abreviatura: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancelar</Button>
                                                    <Button onClick={handleCreateUnidad} className="bg-emerald-600 hover:bg-emerald-700 text-slate-900 dark:text-white">{editingUnidad ? "Guardar Cambios" : "Guardar Unidad"}</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="relative mt-4 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar unidad..."
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
                                                <TableHead>Nombre</TableHead>
                                                <TableHead className="w-[150px]">Abreviatura</TableHead>
                                                <TableHead className="text-right w-[150px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-slate-800 border-t border-slate-200 dark:border-slate-800">
                                            {loading ? (
                                                <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 dark:text-slate-500">Cargando unidades...</TableCell></TableRow>
                                            ) : filteredUnidades.length === 0 ? (
                                                <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 dark:text-slate-500">No se encontraron resultados</TableCell></TableRow>
                                            ) : filteredUnidades.map(u => (
                                                <TableRow key={u.id_unidad} className="hover:bg-slate-200/50 dark:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800 group">
                                                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                                                        {u.nombre}
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono bg-slate-200/20 dark:bg-slate-800/20">
                                                        {u.abreviatura}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(u)} className="h-8 w-8 text-emerald-400 hover:text-emerald-300">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id_unidad)} className="h-8 w-8 text-red-400 hover:text-red-300">
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
