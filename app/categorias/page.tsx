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
import { Plus, Search, Edit, Trash2, Tags, Layers } from "lucide-react"
import { toast } from 'react-toastify'
import { Textarea } from "@/components/ui/textarea"
import { InventoryHeader } from "@/components/inventory-header"

interface Categoria {
    id_categoria: number
    nombre: string
    descripcion: string
    estado: number
}

export default function CategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null)

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: ""
    })

    useEffect(() => {
        fetchCategorias()
    }, [])

    const fetchCategorias = async () => {
        try {
            const res = await fetch("/api/categorias")
            const data = await res.json()
            setCategorias(data)
        } catch (error) {
            console.error("Error fetching categories:", error)
            toast.error("Error al cargar categorías")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateCategoria = async () => {
        if (!formData.nombre) {
            toast.warning("El nombre de la categoría es obligatorio")
            return
        }

        try {
            const method = editingCategoria ? "PUT" : "POST"
            const body = editingCategoria ? { ...formData, id_categoria: editingCategoria.id_categoria } : formData

            const res = await fetch("/api/categorias", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (res.ok) {
                toast.success(editingCategoria ? "Categoría actualizada" : "Categoría creada exitosamente")
                setIsCreateModalOpen(false)
                fetchCategorias()
                resetForm()
            } else {
                toast.error("Error al guardar categoría")
            }
        } catch (error) {
            toast.error("Error de conexión")
        }
    }

    const resetForm = () => {
        setEditingCategoria(null)
        setFormData({ nombre: "", descripcion: "" })
    }

    const handleEdit = (c: Categoria) => {
        setEditingCategoria(c)
        setFormData({
            nombre: c.nombre || "",
            descripcion: c.descripcion || ""
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de desactivar esta categoría? Aparecerá como no disponible en los selectores.")) return;
        try {
            const res = await fetch(`/api/categorias?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Categoría desactivada")
                fetchCategorias()
            } else {
                const errorData = await res.json()
                toast.error(errorData.message || "Error al desactivar")
            }
        } catch (error) {
            toast.error("Error de conexión al eliminar")
        }
    }

    const filteredCategorias = categorias.filter(c =>
        c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
                    <InventoryHeader />

                    <div className="p-6 flex-1">
                        <div className="max-w-6xl mx-auto space-y-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <Card className="bg-amber-600/10 border-amber-500/20 w-full md:w-auto flex-1">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/20 rounded-lg">
                                            <Tags className="h-6 w-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">Categorías Activas</p>
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{categorias.length}</h3>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl w-full mx-auto">
                                <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle>Listado de Categorías</CardTitle>
                                            <CardDescription>Clasificación de productos del inventario</CardDescription>
                                        </div>
                                        <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                                            if (!open) resetForm();
                                            setIsCreateModalOpen(open);
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-amber-600 hover:bg-amber-700 font-semibold text-slate-900 dark:text-white">
                                                    <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>{editingCategoria ? "Editar Categoría" : "Agregar Categoría"}</DialogTitle>
                                                    <DialogDescription>{editingCategoria ? "Modifique el nombre o descripción" : "Cree una nueva clasificación"}</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Nombre de Categoría <span className="text-red-400">*</span></Label>
                                                        <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Ej: Herramientas Eléctricas" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Descripción (Opcional)</Label>
                                                        <Textarea className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 resize-none" placeholder="Breve descripción de los productos que incluye" value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancelar</Button>
                                                    <Button onClick={handleCreateCategoria} className="bg-amber-600 hover:bg-amber-700 text-slate-900 dark:text-white">{editingCategoria ? "Guardar Cambios" : "Guardar Categoría"}</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <div className="relative mt-4 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar categoría..."
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
                                                <TableHead className="w-[30%]">Nombre</TableHead>
                                                <TableHead>Descripción</TableHead>
                                                <TableHead className="text-right w-[150px]">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="divide-y divide-slate-800 border-t border-slate-200 dark:border-slate-800">
                                            {loading ? (
                                                <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 dark:text-slate-500">Cargando categorías...</TableCell></TableRow>
                                            ) : filteredCategorias.length === 0 ? (
                                                <TableRow><TableCell colSpan={3} className="text-center py-10 text-slate-400 dark:text-slate-500">No se encontraron resultados</TableCell></TableRow>
                                            ) : filteredCategorias.map(c => (
                                                <TableRow key={c.id_categoria} className="hover:bg-slate-200/50 dark:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-800 group">
                                                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                                                        {c.nombre}
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-sm">
                                                        {c.descripcion || <span className="text-slate-600 italic">Sin descripción</span>}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(c)} className="h-8 w-8 text-amber-400 hover:text-amber-300">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id_categoria)} className="h-8 w-8 text-red-400 hover:text-red-300">
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
