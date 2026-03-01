"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Trash2, ShoppingCart, UserPlus, CreditCard } from "lucide-react"
import { toast } from 'react-toastify'
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

interface Product {
    id_producto: number
    nombre: string
    precio_venta: number
    stock_actual: number
    unidad_medida?: { abreviatura: string }
}

interface CartItem extends Product {
    cantidad: number
    subtotal: number
}

export default function SalesPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/productos")
            const data = await res.json()
            setProducts(data)
        } catch (error) {
            console.error("Error fetching products:", error)
        }
    }

    const addToCart = (product: Product) => {
        if (product.stock_actual <= 0) {
            toast.error("Producto sin stock")
            return
        }

        const existingItem = cart.find(item => item.id_producto === product.id_producto)
        if (existingItem) {
            if (existingItem.cantidad >= product.stock_actual) {
                toast.warning("No hay más stock disponible")
                return
            }
            setCart(cart.map(item => 
                item.id_producto === product.id_producto 
                ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_venta }
                : item
            ))
        } else {
            setCart([...cart, { ...product, cantidad: 1, subtotal: product.precio_venta }])
        }
    }

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id_producto !== id))
    }

    const updateQuantity = (id: number, delta: number) => {
        setCart(cart.map(item => {
            if (item.id_producto === id) {
                const newQty = Math.max(1, item.cantidad + delta)
                if (newQty > item.stock_actual) return item
                return { ...item, cantidad: newQty, subtotal: newQty * item.precio_venta }
            }
            return item
        }))
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
    const igv = total * 0.18
    const subtotalGeneral = total - igv

    const finalizeSale = async () => {
        if (cart.length === 0) return

        try {
            setLoading(true)
            const res = await fetch("/api/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    detalles: cart.map(item => ({
                        id_producto: item.id_producto,
                        cantidad: item.cantidad,
                        precio_unitario: item.precio_venta,
                        subtotal: item.subtotal,
                        descripcion: item.nombre
                    })),
                    total,
                    igv,
                    subtotal: subtotalGeneral,
                    id_usuario: parseInt(localStorage.getItem("userId") || "0"),
                    tipo: "producto"
                })
            })

            if (!res.ok) throw new Error("Error en la venta")

            toast.success("Venta realizada con éxito")
            setCart([])
            fetchProducts()
        } catch (error) {
            toast.error("Error al procesar la venta")
        } finally {
            setLoading(false)
        }
    }

    const filteredProducts = products.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10)

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-slate-900 text-white flex flex-col">
                    <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <ShoppingCart className="text-blue-400" /> Punto de Venta (POS)
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-green-500 text-green-400">Caja Abierta</Badge>
                        </div>
                    </header>

                    <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                        {/* Selector de Productos */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            <Card className="bg-slate-800/50 border-slate-700">
                                <CardHeader className="pb-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input 
                                            placeholder="Buscar producto por nombre o código..." 
                                            className="pl-10 bg-slate-950 border-slate-700 text-white h-12"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                                        {filteredProducts.map(p => (
                                            <button 
                                                key={p.id_producto}
                                                onClick={() => addToCart(p)}
                                                className="flex flex-col p-3 rounded-xl bg-slate-700/30 border border-slate-600 hover:border-blue-500 transition-all text-left group"
                                            >
                                                <span className="text-sm font-medium text-slate-200 group-hover:text-white line-clamp-2 min-h-[2.5rem]">{p.nombre}</span>
                                                <div className="mt-3 flex justify-between items-end">
                                                    <span className="text-xs text-slate-400">{p.stock_actual} disp.</span>
                                                    <span className="text-lg font-bold text-blue-400">S/ {p.precio_venta}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-800/50 border-slate-700 flex-1 overflow-hidden flex flex-col">
                                <CardHeader className="py-3 border-b border-slate-700">
                                    <CardTitle className="text-sm uppercase tracking-wider text-slate-400">Detalle de la Venta</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 overflow-auto">
                                    <Table>
                                        <TableHeader className="sticky top-0 bg-slate-800">
                                            <TableRow className="border-slate-700">
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Precio</TableHead>
                                                <TableHead className="text-center">Cant.</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cart.map(item => (
                                                <TableRow key={item.id_producto} className="border-slate-700 hover:bg-slate-700/20">
                                                    <TableCell className="text-sm font-medium">{item.nombre}</TableCell>
                                                    <TableCell className="text-sm">S/ {item.precio_venta}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button onClick={() => updateQuantity(item.id_producto, -1)} className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-slate-600">-</button>
                                                            <span className="w-8 text-center">{item.cantidad}</span>
                                                            <button onClick={() => updateQuantity(item.id_producto, 1)} className="w-6 h-6 rounded flex items-center justify-center bg-slate-700 hover:bg-slate-600">+</button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">S/ {item.subtotal.toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id_producto)} className="h-8 w-8 text-red-400 hover:bg-red-500/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Panel de Pago */}
                        <div className="lg:col-span-4 flex flex-col gap-6">
                            <Card className="bg-slate-800 border-slate-700 shadow-2xl">
                                <CardHeader className="pb-4">
                                    <CardTitle>Completar Venta</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-700">
                                        <div className="flex justify-between text-slate-400">
                                            <span>Subtotal</span>
                                            <span>S/ {subtotalGeneral.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-400">
                                            <span>IGV (18%)</span>
                                            <span>S/ {igv.toFixed(2)}</span>
                                        </div>
                                        <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                                            <span className="text-lg font-medium">Total a Pagar</span>
                                            <span className="text-3xl font-bold text-blue-400">S/ {total.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-slate-400">Cliente (Opcional)</Label>
                                        <div className="flex gap-2">
                                            <Input placeholder="DNI o Nombre..." className="bg-slate-900 border-slate-700" />
                                            <Button variant="outline" size="icon" className="border-slate-700"><UserPlus className="h-4 w-4" /></Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="border-slate-700 h-12 flex flex-col gap-0">
                                            <span className="text-[10px] uppercase text-slate-500">Efectivo</span>
                                            <span>S/ {total.toFixed(2)}</span>
                                        </Button>
                                        <Button variant="outline" className="border-slate-700 h-12 flex flex-col gap-0 border-blue-500 text-blue-400 bg-blue-500/5">
                                            <span className="text-[10px] uppercase text-blue-500/50">Transferencia / QR</span>
                                            <span>S/ {total.toFixed(2)}</span>
                                        </Button>
                                    </div>

                                    <Button 
                                        onClick={finalizeSale}
                                        disabled={cart.length === 0 || loading}
                                        className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/20"
                                    >
                                        {loading ? "Procesando..." : "CONFIRMAR VENTA"}
                                        <CreditCard className="ml-2 h-6 w-6" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
