"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
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
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, Truck, Tags, Scale } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { InventoryHeader } from "@/components/inventory-header"

interface Producto {
    id_producto: number
    codigo: string
    nombre: string
    descripcion: string
    precio_compra?: number
    precio_venta: number
    stock_actual: number
    stock_minimo: number
    id_categoria?: number
    id_unidad?: number
    categoria?: { nombre: string, id_categoria: number }
    unidad_medida?: { abreviatura: string, id_unidad: number }
    precios?: ProductoPrecio[]
}

interface ProductoPrecio {
    id_precio?: number
    nombre: string
    id_unidad: string
    factor: string
    precio: string
    unidad_medida?: { nombre: string, abreviatura: string }
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
        stock_minimo: "",
        precios: [] as ProductoPrecio[]
    })

    const [userRole, setUserRole] = useState("")

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await fetch("/api/auth/session")
                const data = await res.json()
                if (data.user) {
                    setUserRole(data.user.role)
                }
            } catch (error) {
                console.error("Auth check failed:", error)
            }
        }
        checkSession()
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

            toast.success(editingProduct ? "Producto actualizado con éxito" : "Producto creado con éxito")
            setIsModalOpen(false)
            fetchData()
            resetForm()
        } catch (error) {
            console.error("Error saving product:", error)
            toast.error("Error al guardar el producto")
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
            stock_minimo: "",
            precios: []
        })
    }

    const handleEdit = (producto: Producto) => {
        setEditingProduct(producto)
        setFormData({
            codigo: producto.codigo || "",
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            id_categoria: producto.id_categoria?.toString() || "",
            id_unidad: producto.id_unidad?.toString() || "",
            precio_compra: producto.precio_compra?.toString() || "0",
            precio_venta: producto.precio_venta?.toString() || "0",
            stock_actual: producto.stock_actual?.toString() || "0",
            stock_minimo: producto.stock_minimo?.toString() || "0",
            precios: (producto.precios || []).map(p => ({
                ...p,
                id_unidad: p.id_unidad.toString(),
                factor: p.factor.toString(),
                precio: p.precio.toString()
            }))
        })
        setIsModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de eliminar este producto?")) return;
        try {
            const res = await fetch(`/api/productos?id=${id}`, {
                method: "DELETE"
            })
            if (res.ok) {
                toast.success("Producto eliminado correctamente")
                fetchData()
            } else {
                toast.error("Error al eliminar el producto")
            }
        } catch (error) {
            console.error("Error deleting product:", error)
            toast.error("Error de conexión al eliminar")
        }
    }

    const filteredProductos = productos.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
                    <InventoryHeader />

                    <div className="p-6 flex-1">
                        <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                            <Package className="h-6 w-6 text-blue-400" />
                                            Catálogo de Productos
                                        </CardTitle>
                                        <CardDescription className="text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                            Gestiona el stock, precios y categorías de tu ferretería
                                        </CardDescription>
                                    </div>

                                    <div className="flex gap-2">
                                        <Dialog open={isModalOpen} onOpenChange={(open) => {
                                            if (!open) resetForm()
                                            setIsModalOpen(open)
                                        }}>
                                            <DialogTrigger asChild>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-slate-900 dark:text-white">
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Nuevo Producto
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>{editingProduct ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
                                                </DialogHeader>

                                                <div className="grid grid-cols-2 gap-4 py-4">
                                                    <div className="space-y-2">
                                                        <Label>Código / SKU</Label>
                                                        <Input value={formData.codigo} onChange={e => setFormData({ ...formData, codigo: e.target.value })} className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Nombre del Producto</Label>
                                                        <Input value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Categoría</Label>
                                                        <Select value={formData.id_categoria} onValueChange={v => setFormData({ ...formData, id_categoria: v })}>
                                                            <SelectTrigger className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                                                <SelectValue placeholder="Seleccionar..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                                {categorias.map((c: any) => (
                                                                    <SelectItem key={c.id_categoria} value={c.id_categoria.toString()}>{c.nombre}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Unidad de Medida</Label>
                                                        <Select value={formData.id_unidad} onValueChange={v => setFormData({ ...formData, id_unidad: v })}>
                                                            <SelectTrigger className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600">
                                                                <SelectValue placeholder="Seleccionar..." />
                                                            </SelectTrigger>
                                                            <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                                {unidades.map((u: any) => (
                                                                    <SelectItem key={u.id_unidad} value={u.id_unidad.toString()}>{u.nombre} ({u.abreviatura})</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Precio Compra</Label>
                                                        <Input type="number" value={formData.precio_compra} onChange={e => setFormData({ ...formData, precio_compra: e.target.value })} className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Precio Venta</Label>
                                                        <Input type="number" value={formData.precio_venta} onChange={e => setFormData({ ...formData, precio_venta: e.target.value })} className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Stock Actual</Label>
                                                        <Input type="number" value={formData.stock_actual} onChange={e => setFormData({ ...formData, stock_actual: e.target.value })} className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Stock Mínimo</Label>
                                                        <Input type="number" value={formData.stock_minimo} onChange={e => setFormData({ ...formData, stock_minimo: e.target.value })} className="bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600" />
                                                    </div>
                                                </div>

                                                <div className="mt-4 p-4 border rounded-lg border-slate-300 dark:border-slate-700 bg-slate-200/20 dark:bg-slate-800/20">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <h3 className="text-sm font-semibold flex items-center gap-2">
                                                            <Tags className="h-4 w-4" />
                                                            Precios Alternativos (Ej: Bobina, Caja)
                                                        </h3>
                                                        <div className="bg-blue-500/10 border border-blue-500/20 p-2 rounded text-[10px] text-blue-600 dark:text-blue-400 mb-3">
                                                            <strong>Importante:</strong> La unidad base del producto arriba debe ser la <strong>MENOR</strong> unidad (Ej: Metro, Gramo, Unidad). Las alternativas deben ser múltiplos (Ej: Bobina = 100 Metros).
                                                        </div>
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            size="sm" 
                                                            onClick={() => setFormData({
                                                                ...formData, 
                                                                precios: [...formData.precios, { nombre: "", id_unidad: "", factor: "1", precio: "0" }]
                                                            })}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" /> Agregar
                                                        </Button>
                                                    </div>
                                                    
                                                    {formData.precios.map((p, idx) => (
                                                        <div key={idx} className="grid grid-cols-4 gap-2 mb-2 items-end">
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Nombre (Ej: Bobina)</Label>
                                                                <Input 
                                                                    placeholder="Nombre" 
                                                                    value={p.nombre} 
                                                                    onChange={e => {
                                                                        const newPrecios = [...formData.precios]
                                                                        newPrecios[idx].nombre = e.target.value
                                                                        setFormData({ ...formData, precios: newPrecios })
                                                                    }}
                                                                    className="h-8 text-xs bg-slate-200 dark:bg-slate-700"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Unidad</Label>
                                                                <Select 
                                                                    value={p.id_unidad} 
                                                                    onValueChange={v => {
                                                                        const newPrecios = [...formData.precios]
                                                                        newPrecios[idx].id_unidad = v
                                                                        setFormData({ ...formData, precios: newPrecios })
                                                                    }}
                                                                >
                                                                    <SelectTrigger className="h-8 text-xs bg-slate-200 dark:bg-slate-700">
                                                                        <SelectValue placeholder="Unidad" />
                                                                    </SelectTrigger>
                                                                    <SelectContent className="bg-slate-100 dark:bg-slate-800">
                                                                        {unidades.map((u: any) => (
                                                                            <SelectItem key={u.id_unidad} value={u.id_unidad.toString()}>{u.abreviatura}</SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-[10px]">Factor (Mts en Bobina)</Label>
                                                                <Input 
                                                                    type="number" 
                                                                    value={p.factor} 
                                                                    onChange={e => {
                                                                        const newPrecios = [...formData.precios]
                                                                        newPrecios[idx].factor = e.target.value
                                                                        setFormData({ ...formData, precios: newPrecios })
                                                                    }}
                                                                    className="h-8 text-xs bg-slate-200 dark:bg-slate-700"
                                                                />
                                                            </div>
                                                            <div className="flex gap-1 items-center">
                                                                <div className="space-y-1 flex-1">
                                                                    <Label className="text-[10px]">Precio S/</Label>
                                                                    <Input 
                                                                        type="number" 
                                                                        value={p.precio} 
                                                                        onChange={e => {
                                                                            const newPrecios = [...formData.precios]
                                                                            newPrecios[idx].precio = e.target.value
                                                                            setFormData({ ...formData, precios: newPrecios })
                                                                        }}
                                                                        className="h-8 text-xs bg-slate-200 dark:bg-slate-700"
                                                                    />
                                                                </div>
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    size="icon" 
                                                                    onClick={() => {
                                                                        const newPrecios = formData.precios.filter((_, i) => i !== idx)
                                                                        setFormData({ ...formData, precios: newPrecios })
                                                                    }}
                                                                    className="h-8 w-8 text-red-400"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {formData.precios.length === 0 && (
                                                        <p className="text-center text-xs text-slate-500 py-2">No hay precios alternativos configurados.</p>
                                                    )}
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
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400 h-4 w-4" />
                                    <Input
                                        placeholder="Buscar por nombre o código..."
                                        className="pl-10 bg-slate-100/50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white max-w-md"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <div className="rounded-xl border border-slate-300 dark:border-slate-700 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-100/80 dark:bg-slate-900/80">
                                            <TableRow className="border-slate-300 dark:border-slate-700 hover:bg-slate-100/80 dark:bg-slate-900/80">
                                                <TableHead className="text-slate-700 dark:text-slate-300">Código</TableHead>
                                                <TableHead className="text-slate-700 dark:text-slate-300">Producto</TableHead>
                                                <TableHead className="text-slate-700 dark:text-slate-300">Categoría</TableHead>
                                                <TableHead className="text-slate-700 dark:text-slate-300">Stock</TableHead>
                                                <TableHead className="text-slate-700 dark:text-slate-300">Precio Venta</TableHead>
                                                <TableHead className="text-slate-700 dark:text-slate-300 text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="bg-slate-200/20 dark:bg-slate-800/20">
                                            {loading ? (
                                                <>
                                                    {[1, 2, 3, 4, 5].map((i) => (
                                                        <TableRow key={i} className="animate-pulse border-slate-300 dark:border-slate-700">
                                                            <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-16"></div></TableCell>
                                                            <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-32"></div></TableCell>
                                                            <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-20"></div></TableCell>
                                                            <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-24"></div></TableCell>
                                                            <TableCell><div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-20"></div></TableCell>
                                                            <TableCell className="text-right flex justify-end gap-1"><div className="h-8 w-8 bg-slate-100 dark:bg-slate-700 rounded-full"></div></TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            ) : filteredProductos.map(p => (
                                                <TableRow key={p.id_producto} className="border-slate-300 dark:border-slate-700 hover:bg-slate-300/30 dark:bg-slate-700/30">
                                                    <TableCell className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-mono text-xs">{p.codigo || '---'}</TableCell>
                                                    <TableCell className="text-slate-900 dark:text-white font-medium">{p.nombre}</TableCell>
                                                    <TableCell><Badge variant="outline" className="text-xs">{p.categoria?.nombre || 'General'}</Badge></TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {Number(p.stock_actual) <= Number(p.stock_minimo) ? (
                                                                <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-1 font-bold animate-pulse">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    {Number(p.stock_actual)} {p.unidad_medida?.abreviatura}
                                                                </Badge>
                                                            ) : (
                                                                <Badge className="bg-green-600 hover:bg-green-700 text-white font-medium">
                                                                    {Number(p.stock_actual)} {p.unidad_medida?.abreviatura}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-slate-900 dark:text-white font-semibold">S/ {Number(p.precio_venta).toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(p)} className="h-8 w-8 text-blue-400"><Edit className="h-4 w-4" /></Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id_producto)} className="h-8 w-8 text-red-400"><Trash2 className="h-4 w-4" /></Button>
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
