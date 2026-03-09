"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Trash2, ClipboardList, Truck } from "lucide-react"
import { toast } from 'react-toastify'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Product {
    id_producto: number
    nombre: string
    precio_compra: number
}

interface Provider {
    id_proveedor: number
    nombre: string
    ruc: string
}

interface PurchaseItem extends Product {
    cantidad: number
    precio_compra_actual: number
    subtotal: number
}

export default function PurchasesPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [providers, setProviders] = useState<Provider[]>([])
    const [cart, setCart] = useState<PurchaseItem[]>([])
    const [selectedProvider, setSelectedProvider] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [resProd, resProv] = await Promise.all([
                fetch("/api/productos"),
                fetch("/api/proveedores") // Need to create this API
            ])
            const dataProd = await resProd.json()
            const dataProv = await resProv.json()

            const parsedProducts = Array.isArray(dataProd) ? dataProd.map((p: any) => ({
                ...p,
                precio_compra: Number(p.precio_compra) || 0
            })) : []

            setProducts(parsedProducts)
            setProviders(Array.isArray(dataProv) ? dataProv : [])
        } catch (error) {
            console.error("Error fetching data:", error)
        }
    }

    const addToCart = (product: Product) => {
        const existingItem = cart.find(item => item.id_producto === product.id_producto)
        if (existingItem) {
            setCart(cart.map(item =>
                item.id_producto === product.id_producto
                    ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_compra_actual }
                    : item
            ))
        } else {
            setCart([...cart, { ...product, cantidad: 1, precio_compra_actual: product.precio_compra || 0, subtotal: product.precio_compra || 0 }])
        }
    }

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id_producto !== id))
    }

    const updateItem = (id: number, field: string, value: number) => {
        setCart(cart.map(item => {
            if (item.id_producto === id) {
                const updated = { ...item, [field]: value }
                updated.subtotal = updated.cantidad * updated.precio_compra_actual
                return updated
            }
            return item
        }))
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

    const finalizePurchase = async () => {
        if (cart.length === 0 || !selectedProvider) {
            toast.warning("Seleccione un proveedor y productos")
            return
        }

        try {
            setLoading(true)
            const res = await fetch("/api/compras", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_proveedor: parseInt(selectedProvider),
                    detalles: cart.map(item => ({
                        id_producto: item.id_producto,
                        cantidad: item.cantidad,
                        precio_compra: item.precio_compra_actual,
                        subtotal: item.subtotal
                    })),
                    total
                })
            })

            if (!res.ok) throw new Error("Error en la compra")

            toast.success("Compra registrada con éxito")
            setCart([])
            setSelectedProvider("")
        } catch (error) {
            toast.error("Error al registrar la compra")
        } finally {
            setLoading(false)
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-6">
                    <header className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <ClipboardList className="text-purple-400" /> Registro de Compras
                            </h1>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Selector de Proveedor y Búsqueda */}
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Truck className="h-4 w-4" /> Proveedor
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                        <SelectTrigger className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                                            <SelectValue placeholder="Seleccionar proveedor..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                            {Array.isArray(providers) && providers.map(p => (
                                                <SelectItem key={p.id_proveedor} value={p.id_proveedor.toString()}>{p.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                                <CardHeader>
                                    <CardTitle className="text-sm">Buscar Productos</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        placeholder="Filtrar catálogo..."
                                        className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                    <div className="max-h-[400px] overflow-auto space-y-2 pr-2">
                                        {products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                            <div key={p.id_producto} className="flex items-center justify-between p-2 rounded bg-slate-300/30 dark:bg-slate-700/30 border border-slate-300 dark:border-slate-600">
                                                <span className="text-sm truncate mr-2">{p.nombre}</span>
                                                <Button size="sm" variant="ghost" onClick={() => addToCart(p)} className="h-7 w-7 p-0 bg-blue-500/10 text-blue-400">
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Detalle de la Compra */}
                        <div className="lg:col-span-8">
                            <Card className="bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 min-h-[600px] flex flex-col">
                                <CardHeader className="border-b border-slate-300 dark:border-slate-700">
                                    <CardTitle>Productos a Ingresar</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1">
                                    <Table>
                                        <TableHeader className="bg-slate-300/30 dark:bg-slate-700/30">
                                            <TableRow className="border-slate-300 dark:border-slate-700">
                                                <TableHead>Producto</TableHead>
                                                <TableHead className="w-[120px]">Precio Compra</TableHead>
                                                <TableHead className="w-[100px]">Cantidad</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead className="w-[50px]"></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cart.map(item => (
                                                <TableRow key={item.id_producto} className="border-slate-300 dark:border-slate-700">
                                                    <TableCell className="font-medium">{item.nombre}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={item.precio_compra_actual}
                                                            onChange={e => updateItem(item.id_producto, 'precio_compra_actual', parseFloat(e.target.value))}
                                                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs h-8"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            value={item.cantidad}
                                                            onChange={e => updateItem(item.id_producto, 'cantidad', parseFloat(e.target.value))}
                                                            className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-xs h-8 text-center"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right text-purple-400 font-semibold">S/ {item.subtotal.toFixed(2)}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id_producto)} className="h-7 w-7 text-red-400">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                                <div className="p-6 border-t border-slate-300 dark:border-slate-700 bg-slate-100/30 dark:bg-slate-900/30">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium tracking-widest uppercase text-sm">Total de la Compra</span>
                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">S/ {total.toFixed(2)}</span>
                                    </div>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700 h-14 text-lg font-bold"
                                        disabled={loading || cart.length === 0}
                                        onClick={finalizePurchase}
                                    >
                                        {loading ? "PROCESANDO..." : "REGISTRAR ENTRADA A ALMACÉN"}
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
