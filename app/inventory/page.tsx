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
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Producto {
    id_producto: number
    codigo: string
    nombre: string
    descripcion: string
    precio_venta: number
    stock_actual: number
    stock_minimo: number
    categoria?: { nombre: string }
    unidad_medida?: { abreviatura: string }
}

export default function InventoryPage() {
    const [productos, setProductos] = useState<Producto[]>([])
    const [categorias, setCategorias] = useState([])
    const [unidades, setUnidades] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Producto | null>(null)

    const [formData, setFormData] = useState({
        codigo: "",
        nombre: "",
        descripcion: "",
        id_categoria: "",
        id_unidad: "",
        precio_compra: "",
        precio_venta: "",
        stock_actual: "",
        stock_minimo: ""
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [resProd, resCat, resUni] = await Promise.all([
                fetch("/api/productos"),
                fetch("/api/categorias"),
                fetch("/api/unidades")
            ])
            
            const [dataProd, dataCat, dataUni] = await Promise.all([
                resProd.json(),
                resCat.json(),
                resUni.json()
            ])
            
            setProductos(dataProd)
            setCategorias(dataCat)
            setUnidades(dataUni)
        } catch (error) {
            console.error("Error loading inventory data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        try {
            const method = editingProduct ? "PUT" : "POST"
            const body = editingProduct 
                ? { ...formData, id_producto: editingProduct.id_producto }
                : formData

            const res = await fetch("/api/productos", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })

            if (!res.ok) throw new Error("Error al guardar")

            setIsModalOpen(false)
            fetchData()
            resetForm()
        } catch (error) {
            console.error("Error saving product:", error)
        }
    }

    const resetForm = () => {
        setEditingProduct(null)
        setFormData({
            codigo: "",
            nombre: "",
            descripcion: "",
            id_categoria: "",
            id_unidad: "",
            precio_compra: "",
            precio_venta: "",
            stock_actual: "",
            stock_minimo: ""
        })
    }

    const filteredProductos = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
                    <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4 text-white">
                        <SidebarTrigger className="-ml-1" />
                        <h1 className="text-xl font-semibold">Almacén e Inventario</h1>
                    </header>

                    <div className="p-6">
                        <Card className="bg-slate-800/40 border-slate-700 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Package className="h-6 w-6 text-blue-400" />
                                            Catálogo de Productos
                                        </CardTitle>
                                        <CardDescription className="text-slate-400">
                                            Gestiona el stock, precios y categorías de tu ferretería
                                        </CardDescription>
                                    </div>

                                    <div className="flex gap-2">
                                        <Dialog open={isModalOpen} onOpenChange={(open) => {
                                            if (!open) resetForm()
                                            setIsModalOpen(open)
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Nuevo Producto
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                                                </DialogHeader>
                                                
                                                <div className="grid grid-cols-2 gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Código / SKU</Label>
                                                        <Input value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} className="bg-slate-700 border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Nombre del Producto</Label>
                                                        <Input value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="bg-slate-700 border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Categoría</Label>
                                                        <Select value={formData.id_categoria} onValueChange={v => setFormData({...formData, id_categoria: v})}>
                                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                                <SelectValue placeholder="Seleccionar..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                                {categorias.map((c: any) => (
                                                                    <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>{c.nombre}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Unidad de Medida</Label>
                                                        <Select value={formData.id_unidad} onValueChange={v => setFormData({...formData, id_unidad: v})}>
                                                            <SelectTrigger className="bg-slate-700 border-slate-600">
                                                                <SelectValue placeholder="Seleccionar..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                                {unidades.map((u: any) => (
                                                                    <SelectItem key={u.id_unidad} value={u.id_unidad.toString()}>{u.nombre} ({u.abreviatura})</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Precio Compra</Label>
                                                        <Input type="number" value={formData.precio_compra} onChange={e => setFormData({...formData, precio_compra: e.target.value})} className="bg-slate-700 border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Precio Venta</Label>
                                                        <Input type="number" value={formData.precio_venta} onChange={e => setFormData({...formData, precio_venta: e.target.value})} className="bg-slate-700 border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Stock Actual</Label>
                                                        <Input type="number" value={formData.stock_actual} onChange={e => setFormData({...formData, stock_actual: e.target.value})} className="bg-slate-700 border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Stock Mínimo</Label>
                                                        <Input type="number" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value})} className="bg-slate-700 border-slate-600" />
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                                    <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input 
                                        placeholder="Buscar por nombre o código..." 
                                        className="pl-10 bg-slate-900/50 border-slate-700 text-white max-w-md"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-700 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-900/80">
                                            <TableRow className="border-slate-700 hover:bg-slate-900/80">
                                                <TableHead className="text-slate-300">Código</TableHead>
                                                <TableHead className="text-slate-300">Producto</TableHead>
                                                <TableHead className="text-slate-300">Categoría</TableHead>
                                                <TableHead className="text-slate-300">Stock</TableHead>
                                                <TableHead className="text-slate-300">Precio Venta</TableHead>
                                                <TableHead className="text-slate-300 text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-slate-800/20">
                                            {loading ? (
                                                <TableRow><TableCell colSpan={6} className="text-center py-10 text-slate-400">Cargando inventario...</TableCell></TableRow>
                                            ) : filteredProductos.map(p => (
                                                <TableRow key={p.id_producto} className="border-slate-700 hover:bg-slate-700/30">
                                                    <TableCell className="text-slate-400 font-mono text-xs">{p.codigo || '---'}</TableCell>
                                                    <TableCell className="text-white font-medium">{p.nombre}</TableCell>
                                                    <TableCell><Badge variant="outline" className="text-xs">{p.categoria?.nombre || 'General'}</Badge></TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <span className={p.stock_actual <= p.stock_minimo ? "text-red-400 font-bold" : "text-green-400"}>
                                                                {p.stock_actual} {p.unidad_medida?.abreviatura}
                                                            </span>
                                                            {p.stock_actual <= p.stock_minimo && <AlertTriangle className="h-4 w-4 text-red-500" />}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-white font-semibold">S/ {Number(p.precio_venta).toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400"><Edit className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400"><Trash2 className="h-4 w-4" /></Button>
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
