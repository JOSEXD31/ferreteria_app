"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Trash2, ShoppingCart, UserPlus, CreditCard } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Eye, Filter } from "lucide-react"
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
    const [clientes, setClientes] = useState<any[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [selectedClient, setSelectedClient] = useState<any>(null)
    const [clientSearch, setClientSearch] = useState("")
    const [showClientDropdown, setShowClientDropdown] = useState(false)
    const [isAddClientOpen, setIsAddClientOpen] = useState(false)
    const [newClientData, setNewClientData] = useState({ dni_ruc: "", nombre: "", telefono: "", direccion: "" })

    const [paymentType, setPaymentType] = useState<"Efectivo" | "Transferencia" | "Mixto">("Efectivo")
    const [montoEfectivo, setMontoEfectivo] = useState(0)
    const [montoTransferencia, setMontoTransferencia] = useState(0)

    // Historial y Cotizaciones States
    const [ventas, setVentas] = useState<any[]>([])
    const [cotizaciones, setCotizaciones] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState("pos")
    const [historyLoading, setHistoryLoading] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())

    useEffect(() => {
        fetchProducts()
        fetchVentas()
        fetchCotizaciones()
    }, [])

    const fetchCotizaciones = async () => {
        try {
            const res = await fetch("/api/cotizaciones")
            const data = await res.json()
            setCotizaciones(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching cotizaciones:", error)
        }
    }

    const fetchVentas = async () => {
        try {
            setHistoryLoading(true)
            const res = await fetch("/api/ventas")
            const data = await res.json()
            setVentas(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching sales history:", error)
        } finally {
            setHistoryLoading(false)
        }
    }

    const fetchProducts = async () => {
        try {
            const [resProd, resCli] = await Promise.all([
                fetch("/api/productos"),
                fetch("/api/cliente")
            ])
            const dataProd = await resProd.json()
            const dataCli = await resCli.json()

            const parsed = Array.isArray(dataProd) ? dataProd.map((p: any) => ({
                ...p,
                precio_venta: Number(p.precio_venta) || 0,
                stock_actual: Number(p.stock_actual) || 0
            })) : []
            setProducts(parsed)
            setClientes(Array.isArray(dataCli) ? dataCli : [])
        } catch (error) {
            console.error("Error fetching data:", error)
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

    const handleCreateClient = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch("/api/cliente", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newClientData)
            })
            if (!res.ok) throw new Error("Error al crear cliente")

            const newClient = await res.json()
            toast.success("Cliente agregado correctamente")

            // Format for selection
            const clientObj = Array.isArray(newClient) ? newClient[0] : newClient;

            await fetchProducts() // Refresh client list
            setSelectedClient(clientObj)
            setClientSearch(clientObj.nombre)
            setIsAddClientOpen(false)
            setNewClientData({ dni_ruc: "", nombre: "", telefono: "", direccion: "" })
        } catch (error) {
            toast.error("Error al registrar cliente")
        }
    }

    useEffect(() => {
        if (paymentType === "Efectivo") {
            setMontoEfectivo(total)
            setMontoTransferencia(0)
        } else if (paymentType === "Transferencia") {
            setMontoEfectivo(0)
            setMontoTransferencia(total)
        } else {
            // Keep user inputs for mixto unless total changes
            if (montoEfectivo + montoTransferencia !== total) {
                setMontoEfectivo(total)
                setMontoTransferencia(0)
            }
        }
    }, [paymentType, total])

    const finalizeSale = async () => {
        if (cart.length === 0) return

        if (paymentType === "Mixto" && (montoEfectivo + montoTransferencia !== total)) {
            toast.error("La suma de los montos debe ser igual al total")
            return
        }

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
                    id_cliente: selectedClient ? selectedClient.id_cliente : null,
                    tipo: "producto",
                    metodo_pago: paymentType,
                    monto_efectivo: montoEfectivo,
                    monto_transferencia: montoTransferencia
                })
            })

            if (!res.ok) throw new Error("Error en la venta")

            toast.success("Venta realizada con éxito")
            setCart([])
            setSelectedClient(null)
            setClientSearch("")
            fetchProducts()
            fetchVentas()
        } catch (error) {
            toast.error("Error al procesar la venta")
        } finally {
            setLoading(false)
        }
    }

    const createCotizacion = async () => {
        if (cart.length === 0) return

        try {
            setLoading(true)
            const res = await fetch("/api/cotizaciones", {
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
                    id_cliente: selectedClient ? selectedClient.id_cliente : null
                })
            })

            if (!res.ok) throw new Error("Error")
            toast.success("Cotización guardada con éxito")
            setCart([])
            setSelectedClient(null)
            setClientSearch("")
            fetchCotizaciones()
            setActiveTab("quotes_list")
        } catch (error) {
            toast.error("Error al guardar cotización")
        } finally {
            setLoading(false)
        }
    }

    const loadQuoteToPos = (c: any) => {
        setCart(c.detalles.map((d: any) => ({
            ...d.producto,
            id_producto: Number(d.id_producto || d.producto?.id_producto),
            nombre: d.producto?.nombre || d.descripcion,
            cantidad: Number(d.cantidad),
            subtotal: Number(d.subtotal),
            precio_venta: Number(d.precio_unitario),
            stock_actual: d.producto?.stock_actual || 999
        })))
        if (c.cliente) {
            setSelectedClient(c.cliente)
            setClientSearch(`${c.cliente.dni_ruc || c.cliente.documento || ''} - ${c.cliente.nombre}`)
        }
        setActiveTab("pos")
    }

    const printCotizacion = (c: any) => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const html = `
            <html>
            <head>
                <title>Cotización #${c.id_cotizacion}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; margin-bottom: 40px; }
                    .header h1 { margin: 0; color: #2563eb; }
                    .info { margin-bottom: 30px; display: flex; justify-content: space-between; gap: 20px; }
                    table { border-collapse: collapse; margin-top: 20px; width: 100%; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f8fafc; }
                    .totals { width: 300px; margin-left: auto; margin-top: 20px; }
                    .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
                    .totals .final { font-size: 1.2em; font-weight: bold; border-top: 2px solid #ddd; padding-top: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>SISTEMA FERRETERÍA</h1>
                    <h3>COTIZACIÓN DE PRODUCTOS</h3>
                </div>
                <div class="info">
                    <div>
                        <p><strong>N° Cotización:</strong> ${c.id_cotizacion.toString().padStart(6, '0')}</p>
                        <p><strong>Fecha:</strong> ${new Date(c.fecha).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p><strong>Cliente:</strong> ${c.cliente ? c.cliente.nombre : 'Consumidor Final'}</p>
                        <p><strong>DNI/RUC:</strong> ${c.cliente ? (c.cliente.dni_ruc || '') : ''}</p>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Descripción</th>
                            <th>Cant.</th>
                            <th>P. Unitario</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${c.detalles.map((d: any) => `
                            <tr>
                                <td>${d.descripcion}</td>
                                <td>${d.cantidad}</td>
                                <td>S/ ${Number(d.precio_unitario).toFixed(2)}</td>
                                <td>S/ ${Number(d.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals">
                    <div><span>Subtotal:</span> <span>S/ ${Number(c.subtotal).toFixed(2)}</span></div>
                    <div><span>IGV (18%):</span> <span>S/ ${Number(c.igv).toFixed(2)}</span></div>
                    <div class="final"><span>TOTAL:</span> <span>S/ ${Number(c.total).toFixed(2)}</span></div>
                </div>
                <p style="margin-top: 50px; text-align: center; color: #666; font-size: 0.9em;">
                    Esta cotización tiene una validez de 7 días.
                </p>
            </body>
            </html>
        `
        printWindow.document.write(html)
        printWindow.document.close()
        setTimeout(() => printWindow.print(), 250)
    }

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10)

    const filteredVentas = ventas.filter(v => {
        if (!date) return true;
        const vDate = new Date(v.fecha);
        return vDate.toDateString() === date.toDateString();
    });

    const filteredClients = clientes.filter(c => {
        const query = clientSearch.toLowerCase().trim();
        const docStr = c.dni_ruc ? String(c.dni_ruc).toLowerCase() : "";
        const nomStr = c.nombre ? String(c.nombre).toLowerCase() : "";

        return nomStr.includes(query) || docStr.includes(query);
    }).slice(0, 5)

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 w-full">
                            <div className="flex items-center gap-4">
                                <SidebarTrigger />
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <ShoppingCart className="text-blue-500" /> Ventas
                                </h1>
                                <Badge variant="outline" className="border-green-500 text-green-500 bg-green-50 dark:bg-green-500/10 hidden sm:flex">Caja Abierta</Badge>
                            </div>

                            <TabsList className="bg-transparent h-auto p-0 flex space-x-1 lg:space-x-2 mr-12 lg:mr-16 overflow-auto hide-scrollbar">
                                <TabsTrigger value="pos" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-slate-500 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-sm font-medium">
                                    Punto de Venta
                                </TabsTrigger>
                                <TabsTrigger value="quote" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-slate-500 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-sm font-medium">
                                    Nueva Cotización
                                </TabsTrigger>
                                <TabsTrigger value="quotes_list" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-slate-500 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-sm font-medium">
                                    Cotizaciones
                                </TabsTrigger>
                                <TabsTrigger value="history" className="data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-slate-500 px-3 py-2 md:px-4 md:py-2 rounded-lg transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 bg-transparent text-sm font-medium">
                                    Historial
                                </TabsTrigger>
                            </TabsList>
                        </header>

                        <main className="flex-1 p-6 h-full overflow-hidden flex flex-col">
                            <div className={activeTab === 'pos' || activeTab === 'quote' ? "flex-1 overflow-hidden mt-0 h-full grid grid-cols-1 lg:grid-cols-12 gap-6" : "hidden"}>
                                {/* Selector de Productos */}
                                <div className="lg:col-span-8 flex flex-col gap-6">
                                    <Card className="bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700">
                                        <CardHeader className="pb-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 dark:text-slate-400" />
                                                <Input
                                                    placeholder="Buscar producto por nombre o código..."
                                                    className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white h-12"
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
                                                        className="flex flex-col p-3 rounded-xl bg-slate-300/30 dark:bg-slate-700/30 border border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-all text-left group"
                                                    >
                                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem]">{p.nombre}</span>
                                                        <div className="mt-3 flex justify-between items-end">
                                                            <span className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400">{p.stock_actual} disp.</span>
                                                            <span className="text-lg font-bold text-blue-400">S/ {p.precio_venta}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 flex-1 overflow-hidden flex flex-col min-h-[300px]">
                                        <CardHeader className="py-3 border-b border-slate-300 dark:border-slate-700 shrink-0">
                                            <CardTitle className="text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 dark:text-slate-400">Detalle de la Venta</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 flex-1 overflow-auto">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                                                    <TableRow className="border-slate-300 dark:border-slate-700">
                                                        <TableHead>Producto</TableHead>
                                                        <TableHead>Precio</TableHead>
                                                        <TableHead className="text-center">Cant.</TableHead>
                                                        <TableHead className="text-right">Subtotal</TableHead>
                                                        <TableHead></TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {cart.map(item => (
                                                        <TableRow key={item.id_producto} className="border-slate-300 dark:border-slate-700 hover:bg-slate-300/20 dark:bg-slate-700/20">
                                                            <TableCell className="text-sm font-medium">{item.nombre}</TableCell>
                                                            <TableCell className="text-sm">S/ {item.precio_venta}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center justify-center gap-3">
                                                                    <button onClick={() => updateQuantity(item.id_producto, -1)} className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-600">-</button>
                                                                    <span className="w-8 text-center">{item.cantidad}</span>
                                                                    <button onClick={() => updateQuantity(item.id_producto, 1)} className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-600">+</button>
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
                                    <Card className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-2xl">
                                        <CardHeader className="pb-4">
                                            <CardTitle>Completar Venta</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700">
                                                <div className="flex justify-between text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                                    <span>Subtotal</span>
                                                    <span>S/ {subtotalGeneral.toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                                    <span>IGV (18%)</span>
                                                    <span>S/ {igv.toFixed(2)}</span>
                                                </div>
                                                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end">
                                                    <span className="text-lg font-medium">Total a Pagar</span>
                                                    <span className="text-3xl font-bold text-blue-400">S/ {total.toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 relative">
                                                <Label className="text-slate-400 dark:text-slate-500 dark:text-slate-400">Cliente (Opcional)</Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                        <Input
                                                            placeholder="Consumidor Final (Buscar DNI/Nombre...)"
                                                            className="pl-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                                            value={clientSearch}
                                                            onChange={(e) => {
                                                                setClientSearch(e.target.value)
                                                                setSelectedClient(null)
                                                                setShowClientDropdown(true)
                                                            }}
                                                            onFocus={() => setShowClientDropdown(true)}
                                                            onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                                                        />
                                                        {showClientDropdown && clientSearch && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg overflow-hidden z-50">
                                                                <button
                                                                    className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                                    onMouseDown={() => {
                                                                        setSelectedClient(null)
                                                                        setClientSearch("")
                                                                        setShowClientDropdown(false)
                                                                    }}
                                                                >
                                                                    Consumidor Final (Sin Cliente)
                                                                </button>
                                                                {filteredClients.map(c => (
                                                                    <button
                                                                        key={c.id_cliente}
                                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between"
                                                                        onMouseDown={() => {
                                                                            setSelectedClient(c)
                                                                            setClientSearch(`${c.dni_ruc} - ${c.nombre}`)
                                                                            setShowClientDropdown(false)
                                                                        }}
                                                                    >
                                                                        <span className="font-medium">{c.nombre}</span>
                                                                        <span className="text-slate-400 ml-2">{c.dni_ruc}</span>
                                                                    </button>
                                                                ))}
                                                                {filteredClients.length === 0 && (
                                                                    <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                                                        No se encontraron clientes.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="icon" className="shrink-0 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800"
                                                                onClick={() => {
                                                                    if (/^\d+$/.test(clientSearch)) {
                                                                        setNewClientData(prev => ({ ...prev, dni_ruc: clientSearch }))
                                                                    }
                                                                }}
                                                            >
                                                                <UserPlus className="h-4 w-4" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
                                                            </DialogHeader>
                                                            <form onSubmit={handleCreateClient} className="space-y-4 pt-4">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Documento (DNI/RUC)</Label>
                                                                        <Input required value={newClientData.dni_ruc} onChange={e => setNewClientData({ ...newClientData, dni_ruc: e.target.value })} placeholder="DNI o RUC" />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Nombre / Razón Social</Label>
                                                                        <Input required value={newClientData.nombre} onChange={e => setNewClientData({ ...newClientData, nombre: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <Label>Teléfono</Label>
                                                                        <Input value={newClientData.telefono} onChange={e => setNewClientData({ ...newClientData, telefono: e.target.value })} />
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <Label>Dirección</Label>
                                                                        <Input value={newClientData.direccion} onChange={e => setNewClientData({ ...newClientData, direccion: e.target.value })} />
                                                                    </div>
                                                                </div>
                                                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Registrar Cliente</Button>
                                                            </form>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </div>

                                            {activeTab === "pos" ? (
                                                <>
                                                    <div className="space-y-3">
                                                        <Label className="text-slate-400 dark:text-slate-500 dark:text-slate-400">Método de Pago</Label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setPaymentType("Efectivo")}
                                                                className={`border-slate-300 dark:border-slate-700 h-10 ${paymentType === 'Efectivo' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'text-slate-500 bg-transparent'}`}
                                                            >
                                                                Efectivo
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setPaymentType("Transferencia")}
                                                                className={`border-slate-300 dark:border-slate-700 h-10 ${paymentType === 'Transferencia' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'text-slate-500 bg-transparent'}`}
                                                            >
                                                                QR / Trans.
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setPaymentType("Mixto")}
                                                                className={`border-slate-300 dark:border-slate-700 h-10 ${paymentType === 'Mixto' ? 'border-blue-500 text-blue-400 bg-blue-500/5' : 'text-slate-500 bg-transparent'}`}
                                                            >
                                                                Mixto
                                                            </Button>
                                                        </div>

                                                        {paymentType === "Mixto" && (
                                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-slate-500">Monto Efectivo</Label>
                                                                    <Input
                                                                        type="number"
                                                                        step="0.10"
                                                                        value={montoEfectivo || ""}
                                                                        onChange={(e) => {
                                                                            const val = parseFloat(e.target.value) || 0
                                                                            setMontoEfectivo(val)
                                                                            setMontoTransferencia(Math.max(0, total - val))
                                                                        }}
                                                                        className="text-right bg-white dark:bg-slate-900"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-slate-500">Monto Transf. (Auto)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        readOnly
                                                                        value={montoTransferencia.toFixed(2)}
                                                                        className="text-right bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-medium"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        onClick={finalizeSale}
                                                        disabled={cart.length === 0 || loading || (paymentType === "Mixto" && Math.abs((montoEfectivo + montoTransferencia) - total) > 0.01)}
                                                        className="w-full h-16 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-900/20"
                                                    >
                                                        {loading ? "Procesando..." : "CONFIRMAR VENTA"}
                                                        <CreditCard className="ml-2 h-6 w-6" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button
                                                    onClick={createCotizacion}
                                                    disabled={cart.length === 0 || loading}
                                                    className="w-full h-16 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-900/20"
                                                >
                                                    {loading ? "Guardando..." : "GUARDAR COTIZACIÓN"}
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <TabsContent value="quotes_list" className="flex-1 mt-0 h-full data-[state=active]:flex flex-col overflow-hidden">
                                <Card className="flex-1 flex flex-col bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 overflow-hidden">
                                    <CardHeader className="pb-4 shrink-0">
                                        <CardTitle className="text-purple-600">Listado de Cotizaciones</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-auto p-0">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                                                <TableRow className="border-slate-300 dark:border-slate-700">
                                                    <TableHead>N°</TableHead>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Cliente</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="text-center">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cotizaciones.length === 0 ? (
                                                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">No hay cotizaciones registradas.</TableCell></TableRow>
                                                ) : (
                                                    cotizaciones.map((c) => (
                                                        <TableRow key={c.id_cotizacion} className="border-slate-300 dark:border-slate-700 hover:bg-slate-300/20 dark:bg-slate-700/20">
                                                            <TableCell className="font-medium">#{c.id_cotizacion}</TableCell>
                                                            <TableCell className="font-medium">{new Date(c.fecha).toLocaleString()}</TableCell>
                                                            <TableCell>{c.cliente?.nombre || 'Consumidor Final'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className={c.estado === 'pendiente' ? "border-yellow-500 text-yellow-600" : c.estado === 'procesada' ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                                                                    {String(c.estado).toUpperCase()}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-purple-500">S/ {c.total}</TableCell>
                                                            <TableCell className="text-center">
                                                                <div className="flex justify-center gap-2">
                                                                    <Button variant="outline" size="sm" onClick={() => printCotizacion(c)}>Imprimir</Button>
                                                                    {c.estado === 'pendiente' && (
                                                                        <Button variant="default" size="sm" onClick={() => loadQuoteToPos(c)} className="bg-green-600 hover:bg-green-700 text-white">Proceder Venta</Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history" className="flex-1 mt-0 h-full data-[state=active]:flex flex-col overflow-hidden">
                                <Card className="flex-1 flex flex-col bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 overflow-hidden">
                                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 shrink-0">
                                        <CardTitle>Historial de Ventas Registradas</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant={"outline"}
                                                        className={`w-[240px] justify-start text-left font-normal bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 ${!date && "text-muted-foreground"}`}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {date ? format(date, "PPP", { locale: es }) : <span>Filtrar por fecha</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="end">
                                                    <Calendar
                                                        mode="single"
                                                        selected={date}
                                                        onSelect={setDate}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            {date && (
                                                <Button variant="ghost" onClick={() => setDate(undefined)} className="text-slate-500">
                                                    Limpiar
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-auto p-0">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10">
                                                <TableRow className="border-slate-300 dark:border-slate-700">
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Cliente</TableHead>
                                                    <TableHead>Tipo</TableHead>
                                                    <TableHead className="text-right">Total</TableHead>
                                                    <TableHead className="text-center">Estado</TableHead>
                                                    <TableHead></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {historyLoading ? (
                                                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">Cargando...</TableCell></TableRow>
                                                ) : filteredVentas.length === 0 ? (
                                                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">No se encontraron ventas.</TableCell></TableRow>
                                                ) : (
                                                    filteredVentas.map((v) => (
                                                        <TableRow key={v.id_venta} className="border-slate-300 dark:border-slate-700 hover:bg-slate-300/20 dark:bg-slate-700/20">
                                                            <TableCell className="font-medium">{new Date(v.fecha).toLocaleString()}</TableCell>
                                                            <TableCell>{v.cliente?.nombre || 'Consumidor Final'}</TableCell>
                                                            <TableCell className="capitalize">{v.tipo}</TableCell>
                                                            <TableCell className="text-right font-medium text-blue-500">S/ {v.total}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="border-green-500 text-green-500">{v.estado}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-blue-500">
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </main>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
