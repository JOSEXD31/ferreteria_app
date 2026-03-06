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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-toastify"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Eye, Filter, Printer } from "lucide-react"

interface Product {
    id_producto: number
    nombre: string
    precio_venta: number
    stock_actual: number
    unidad_medida?: { abreviatura: string }
    precios?: any[]
}

interface CartItem extends Product {
    cantidad: number
    subtotal: number
    unidad_seleccionada: string
    factor_seleccionado: number
    precio_unitario: number // The effective price for the selected unit
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

    const [selectedSaleDetail, setSelectedSaleDetail] = useState<any>(null)
    const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false)
    const [printFormat, setPrintFormat] = useState<"Ticket" | "A4">("Ticket")
    const [comprobantes, setComprobantes] = useState<any[]>([])
    const [selectedCompType, setSelectedCompType] = useState<any>(null)
    const [company, setCompany] = useState<any>({
        nombre: "SISTEMA FERRETERÍA",
        ruc: "10123456789",
        direccion: "Av. Principal 123, Ciudad",
        telefono: "(01) 456-7890",
        email: "ventas@sistema.com",
        mensaje_ticket: "¡GRACIAS POR SU PREFERENCIA!"
    })

    const [userRole, setUserRole] = useState("")
    const [userId, setUserId] = useState<number | null>(null)

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const res = await fetch("/api/auth/session")
                const data = await res.json()
                if (data.user) {
                    setUserRole(data.user.role)
                    setUserId(data.user.id)
                }
            } catch (error) {
                console.error("Auth check failed:", error)
            }
        }
        fetchSession()
        fetchProducts()
        fetchVentas()
        fetchCotizaciones()
        fetchCompany()
        fetchComprobantes()
    }, [])

    const fetchComprobantes = async () => {
        try {
            const res = await fetch("/api/configuracion/comprobantes")
            const data = await res.json()
            const list = Array.isArray(data) ? data : []
            setComprobantes(list)
            if (list.length > 0 && !selectedCompType) {
                setSelectedCompType(list[0])
            }
        } catch (error) {
            console.error("Error fetching comprobantes:", error)
        }
    }

    const fetchCompany = async () => {
        try {
            const res = await fetch("/api/empresa")
            const data = await res.json()
            if (data && !data.message) {
                setCompany(data)
            }
        } catch (error) {
            console.error("Error fetching company:", error)
        }
    }

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
                    ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precio_unitario }
                    : item
            ))
        } else {
            const newItem: CartItem = {
                ...product,
                cantidad: 1,
                precio_unitario: product.precio_venta,
                subtotal: product.precio_venta,
                unidad_seleccionada: product.unidad_medida?.abreviatura || "Und",
                factor_seleccionado: 1
            }
            setCart([...cart, newItem])
        }
    }

    const updateUnit = (id: number, unitName: string, factor: number, price: number) => {
        setCart(cart.map(item => {
            if (item.id_producto === id) {
                const newSubtotal = item.cantidad * price
                return { 
                    ...item, 
                    unidad_seleccionada: unitName, 
                    factor_seleccionado: factor, 
                    precio_unitario: price, 
                    subtotal: newSubtotal 
                }
            }
            return item
        }))
    }

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id_producto !== id))
    }

    const updateQuantity = (id: number, delta: number, directValue?: number) => {
        setCart(cart.map(item => {
            if (item.id_producto === id) {
                const newQty = directValue !== undefined ? directValue : item.cantidad + delta
                if (newQty < 1) return item
                // Stock check considering factor
                if (newQty * item.factor_seleccionado > item.stock_actual) {
                    toast.warning("Stock insuficiente para esta unidad")
                    return item
                }
                return { ...item, cantidad: newQty, subtotal: newQty * item.precio_unitario }
            }
            return item
        }))
    }

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0)
    
    // Dynamic Tax Calculation based on selected document type
    const igvRate = (Number(selectedCompType?.porcentaje_igv) || 18) / 100
    const applyTax = selectedCompType?.aplica_igv
    const igv = applyTax ? total * (igvRate / (1 + igvRate)) : 0
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
            const payload = {
                detalles: cart.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.cantidad,
                    precio_unitario: item.precio_unitario,
                    subtotal: item.subtotal,
                    descripcion: item.nombre,
                    unidad: item.unidad_seleccionada,
                    factor: item.factor_seleccionado
                })),
                total,
                igv,
                subtotal: subtotalGeneral,
                id_usuario: userId, // Changed from localStorage
                id_cliente: selectedClient ? selectedClient.id_cliente : null,
                tipo: "producto",
                metodo_pago: paymentType,
                tipo_comprobante: selectedCompType?.nombre || "ticket",
                monto_efectivo: montoEfectivo,
                monto_transferencia: montoTransferencia
            }

            const res = await fetch("/api/ventas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })

            if (!res.ok) throw new Error("Error en la venta")

            const ventaConfirmada = await res.json()
            toast.success("Venta realizada con éxito")

            // Print the physical document automatically
            if (printFormat === "Ticket") {
                printTicket(ventaConfirmada)
            } else {
                printA4(ventaConfirmada)
            }

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
                        precio_unitario: item.precio_unitario,
                        subtotal: item.subtotal,
                        descripcion: item.nombre,
                        unidad: item.unidad_seleccionada,
                        factor: item.factor_seleccionado
                    })),
                    total,
                    igv,
                    subtotal: subtotalGeneral,
                    porcentaje_igv: selectedCompType?.porcentaje_igv || 18,
                    id_usuario: userId,
                    id_cliente: selectedClient ? selectedClient.id_cliente : null
                })
            })

            if (!res.ok) throw new Error("Error")
            const cotizacionConfirmada = await res.json()
            toast.success("Cotización guardada con éxito")
            
            // Print automatically after saving
            if (printFormat === "Ticket") {
                printTicket(cotizacionConfirmada)
            } else {
                printA4(cotizacionConfirmada)
            }
            
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
        if (printFormat === "Ticket") {
            printTicket(c)
            return
        }
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const html = `
            <html>
            <head>
                <title>Cotización #${c.id_cotizacion}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-header { display: flex; gap: 20px; align-items: center; }
                    .company-logo { width: 80px; height: 80px; object-fit: contain; }
                    .company-info h1 { margin: 0; color: #1d4ed8; font-size: 28px; }
                    .company-info p { margin: 4px 0; color: #64748b; font-size: 14px; }
                    .doc-info { text-align: right; }
                    .doc-box { border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; background: #f8fafc; }
                    .doc-box h2 { margin: 0; color: #1d4ed8; font-size: 20px; }
                    .doc-box p { margin: 5px 0; font-weight: bold; font-size: 18px; }
                    
                    .client-info { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f1f5f9; padding: 20px; border-radius: 8px; }
                    .client-info div p { margin: 5px 0; font-size: 14px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background-color: #3b82f6; color: white; padding: 12px; text-align: left; text-transform: uppercase; font-size: 12px; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    
                    .totals-container { display: flex; justify-content: flex-end; }
                    .totals-table { width: 250px; }
                    .totals-table div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                    .totals-table .grand-total { border-bottom: none; font-size: 1.2em; font-weight: bold; color: #1d4ed8; padding-top: 15px; }
                    
                    .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-header">
                        ${company.logo_url ? `<img src="${company.logo_url}" class="company-logo" />` : ''}
                        <div class="company-info">
                            <h1>${company.nombre}</h1>
                            <p>RUC: ${company.ruc}</p>
                            <p>${company.direccion}</p>
                            <p>Tel: ${company.telefono} ${company.email ? `| Correo: ${company.email}` : ''}</p>
                        </div>
                    </div>
                    <div class="doc-info">
                        <div class="doc-box">
                            <h2>COTIZACIÓN</h2>
                            <p>N° ${c.serie && c.correlativo ? `${c.serie}-${c.correlativo.toString().padStart(6, '0')}` : `COT-${c.id_cotizacion.toString().padStart(6, '0')}`}</p>
                        </div>
                    </div>
                </div>

                <div class="client-info">
                    <div>
                        <p><strong>SEÑOR(ES):</strong> ${c.cliente ? c.cliente.nombre : 'CONSUMIDOR FINAL'}</p>
                        <p><strong>DNI/RUC:</strong> ${c.cliente?.dni_ruc || '---'}</p>
                        <p><strong>DIRECCIÓN:</strong> ${c.cliente?.direccion || '---'}</p>
                    </div>
                    <div>
                        <p><strong>FECHA DE EMISIÓN:</strong> ${new Date(c.fecha || Date.now()).toLocaleDateString()}</p>
                        <p><strong>VALIDEZ:</strong> 7 DÍAS</p>
                        <p><strong>MONEDA:</strong> SOLES (S/)</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 10%;">CANT.</th>
                            <th style="width: 60%;">DESCRIPCIÓN</th>
                            <th style="width: 15%; text-align: right;">P. UNIT</th>
                            <th style="width: 15%; text-align: right;">IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${c.detalles.map((d: any) => `
                            <tr>
                                <td>${d.cantidad} ${d.unidad || ''}</td>
                                <td>${d.descripcion}</td>
                                <td style="text-align: right;">S/ ${Number(d.precio_unitario).toFixed(2)}</td>
                                <td style="text-align: right;">S/ ${Number(d.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="totals-container">
                    <div class="totals-table">
                        <div><span>Subtotal:</span> <span>S/ ${Number(c.subtotal).toFixed(2)}</span></div>
                        <div><span>IGV (${Number(c.porcentaje_igv || 18)}%):</span> <span>S/ ${Number(c.igv || 0).toFixed(2)}</span></div>
                        <div class="grand-total"><span>TOTAL:</span> <span>S/ ${Number(c.total).toFixed(2)}</span></div>
                    </div>
                </div>
                <div class="footer">
                    <p>ESTA COTIZACIÓN ESTÁ SUJETA A DISPONIBILIDAD DE STOCK</p>
                    <p>ESTA COTIZACIÓN TIENE UNA VALIDEZ DE 7 DÍAS.</p>
                    <p><strong>¡GRACIAS POR SU PREFERENCIA!</strong></p>
                </div>
            </body>
            </html>
        `
        printWindow.document.write(html)
        printWindow.document.close()
        setTimeout(() => printWindow.print(), 250)
    }

    const printA4 = (v: any) => {
        const printWindow = window.open("", "_blank")
        if (!printWindow) return

        const esCotizacion = !!v.id_cotizacion && !v.id_venta
        const docNum = v.serie && v.correlativo 
            ? `${v.serie}-${v.correlativo.toString().padStart(6, '0')}` 
            : (esCotizacion ? "COT-" : "") + (v.id_venta || v.id_cotizacion || 0).toString().padStart(6, '0')
        
        // Use document type from the object, fallback to generic titles
        let headerTitle = "RECIBO DE VENTA"
        if (esCotizacion) {
            headerTitle = "COTIZACIÓN"
        } else if (v.tipo_comprobante) {
            headerTitle = v.tipo_comprobante.toUpperCase()
        }

        const html = `
            <html>
            <head>
                <title>${headerTitle} #${docNum}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
                    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-header { display: flex; gap: 20px; align-items: center; }
                    .company-logo { width: 80px; height: 80px; object-fit: contain; }
                    .company-info h1 { margin: 0; color: #1d4ed8; font-size: 28px; }
                    .company-info p { margin: 4px 0; color: #64748b; font-size: 14px; }
                    .doc-info { text-align: right; }
                    .doc-box { border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; background: #f8fafc; }
                    .doc-box h2 { margin: 0; color: #1d4ed8; font-size: 20px; }
                    .doc-box p { margin: 5px 0; font-weight: bold; font-size: 18px; }
                    
                    .client-info { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f1f5f9; padding: 20px; border-radius: 8px; }
                    .client-info div p { margin: 5px 0; font-size: 14px; }
                    
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background-color: #3b82f6; color: white; padding: 12px; text-align: left; text-transform: uppercase; font-size: 12px; }
                    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    
                    .totals-container { display: flex; justify-content: flex-end; }
                    .totals-table { width: 250px; }
                    .totals-table div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                    .totals-table .grand-total { border-bottom: none; font-size: 1.2em; font-weight: bold; color: #1d4ed8; padding-top: 15px; }
                    
                    .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; pt: 20px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-header">
                        ${company.logo_url ? `<img src="${company.logo_url}" class="company-logo" />` : ''}
                        <div class="company-info">
                            <h1>${company.nombre}</h1>
                            <p>RUC: ${company.ruc}</p>
                            <p>${company.direccion}</p>
                            <p>Tel: ${company.telefono} ${company.email ? `| Correo: ${company.email}` : ''}</p>
                        </div>
                    </div>
                    <div class="doc-info">
                        <div class="doc-box">
                            <h2>${headerTitle}</h2>
                            <p>N° ${docNum}</p>
                        </div>
                    </div>
                </div>

                <div class="client-info">
                    <div>
                        <p><strong>SEÑOR(ES):</strong> ${v.cliente ? v.cliente.nombre : 'CONSUMIDOR FINAL'}</p>
                        <p><strong>DNI/RUC:</strong> ${v.cliente?.dni_ruc || '---'}</p>
                        <p><strong>DIRECCIÓN:</strong> ${v.cliente?.direccion || '---'}</p>
                    </div>
                    <div>
                        <p><strong>FECHA DE EMISIÓN:</strong> ${new Date(v.fecha || Date.now()).toLocaleDateString()}</p>
                        <p><strong>FECHA DE VENCIMIENTO:</strong> ${new Date(v.fecha || Date.now()).toLocaleDateString()}</p>
                        <p><strong>MONEDA:</strong> SOLES (S/)</p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style="width: 10%;">CANT.</th>
                            <th style="width: 60%;">DESCRIPCIÓN</th>
                            <th style="width: 15%; text-align: right;">P. UNIT</th>
                            <th style="width: 15%; text-align: right;">IMPORTE</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(v.detalles || []).map((d: any) => `
                            <tr>
                                <td>${d.cantidad} ${d.unidad || d.producto?.unidad_medida?.abreviatura || ''}</td>
                                <td>${d.descripcion || (d.producto?.nombre) || ''}</td>
                                <td style="text-align: right;">${Number(d.precio_unitario || 0).toFixed(2)}</td>
                                <td style="text-align: right;">${Number(d.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-container">
                    <div class="totals-table">
                        ${Number(v.igv) > 0 ? `
                            <div><span>Op. Gravada:</span> <span>S/ ${Number(v.subtotal).toFixed(2)}</span></div>
                            <div><span>I.G.V. (${Number(v.porcentaje_igv || 18)}%):</span> <span>S/ ${Number(v.igv).toFixed(2)}</span></div>
                        ` : ''}
                        <div class="grand-total"><span>TOTAL:</span> <span>S/ ${Number(v.total || 0).toFixed(2)}</span></div>
                    </div>
                </div>

                <div class="footer">
                    <p>REPRESENTACIÓN IMPRESA DE UNA BOLETA DE VENTA ELECTRÓNICA</p>
                    <p>Consulte su documento en: consulta.sunat.gob.pe</p>
                    <p><strong>¡GRACIAS POR SU PREFERENCIA!</strong></p>
                </div>
            </body>
            </html>
        `
        printWindow.document.write(html)
        printWindow.document.close()
        setTimeout(() => {
            printWindow.print()
        }, 300)
    }

    const printTicket = (v: any) => {
        const printWindow = window.open("", "_blank", "width=400,height=600")
        if (!printWindow) return

        const esCotizacion = !!v.id_cotizacion && !v.id_venta
        const docNum = v.serie && v.correlativo 
            ? `${v.serie}-${v.correlativo.toString().padStart(6, '0')}` 
            : (esCotizacion ? "COT-" : "") + (v.id_venta || v.id_cotizacion || 0).toString().padStart(6, '0')
        
        const headerTitle = esCotizacion ? "COTIZACIÓN" : (v.tipo_comprobante?.toUpperCase() || "TICKET DE VENTA")

        const html = `
            <html>
            <head>
                <style>
                    body { 
                        font-family: 'Courier New', Courier, monospace; 
                        margin: 0; 
                        padding: 10px; 
                        width: 80mm; 
                        color: #000;
                        font-size: 13px;
                        font-weight: bold;
                        line-height: 1.2;
                    }
                    .text-center { text-align: center; }
                    .text-right { text-align: right; }
                    .bold { font-weight: 900; }
                    .border-t { border-top: 1px dashed #000; margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    .logo { max-width: 100px; max-height: 100px; display: block; margin: 0 auto 5px; }
                    .doc-header { font-size: 16px; margin-bottom: 5px; border: 1px solid #000; padding: 4px; }
                </style>
            </head>
            <body>
                <div class="text-center">
                    ${company.logo_url ? `<img src="${company.logo_url}" class="logo" />` : ''}
                    <div class="bold" style="font-size: 16px; text-transform: uppercase;">${company.nombre}</div>
                    <div style="font-size: 11px;">RUC: ${company.ruc}</div>
                    <div style="font-size: 11px;">${company.direccion}</div>
                    <div style="font-size: 11px;">TEL: ${company.telefono}</div>
                    <div class="border-t"></div>
                    <div class="doc-header bold">${headerTitle}</div>
                    <div class="bold" style="font-size: 14px;">N° ${docNum}</div>
                    <div class="border-t"></div>
                </div>

                <div style="font-size: 11px;">
                    <div>FECHA: ${new Date(v.fecha || Date.now()).toLocaleString()}</div>
                    <div>CLIENTE: ${v.cliente?.nombre || 'CONSUMIDOR FINAL'}</div>
                    <div>DNI/RUC: ${v.cliente?.dni_ruc || '---'}</div>
                </div>
                <div class="border-t"></div>

                <table>
                    <thead>
                        <tr class="bold">
                            <th align="left" style="font-size: 11px;">DESC.</th>
                            <th align="center" style="font-size: 11px;">CANT.</th>
                            <th align="right" style="font-size: 11px;">SUBT.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(v.detalles || []).map((d: any) => `
                            <tr>
                                <td style="font-size: 11px;">${d.descripcion || d.producto?.nombre}</td>
                                <td align="center" style="font-size: 11px;">${d.cantidad} ${d.unidad || ''}</td>
                                <td align="right" style="font-size: 11px;">${Number(d.subtotal).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="border-t"></div>
                <div class="text-right">
                    <div style="font-size: 11px;">SUBTOTAL: S/ ${Number(v.subtotal).toFixed(2)}</div>
                    <div style="font-size: 11px;">IGV (${Number(v.porcentaje_igv || 18)}%): S/ ${Number(v.igv).toFixed(2)}</div>
                    <div class="bold" style="font-size: 15px;">TOTAL: S/ ${Number(v.total).toFixed(2)}</div>
                </div>
                <div class="border-t"></div>
                
                <div class="text-center" style="margin-top: 10px;">
                    <div style="font-size: 11px;">MÉTODO: ${v.metodo_pago?.toUpperCase() || 'EFECTIVO'}</div>
                    <div style="margin-top: 10px; font-size: 11px; font-style: italic;">${company.mensaje_ticket || '¡GRACIAS POR SU COMPRA!'}</div>
                </div>
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
                                                        <div className="flex justify-between items-start">
                                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:text-white line-clamp-2 min-h-[2.5rem]">{p.nombre}</span>
                                                            {p.precios && p.precios.length > 0 && (
                                                                <Badge variant="outline" className="text-[9px] px-1 h-4 border-blue-500/50 text-blue-500 shrink-0">Multi</Badge>
                                                            )}
                                                        </div>
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
                                                            <TableCell className="text-sm font-medium">
                                                                <div>{item.nombre}</div>
                                                                <div className="text-[10px] text-slate-500 mt-1">
                                                                    {item.precios && item.precios.length > 0 ? (
                                                                        <Select 
                                                                            value={item.unidad_seleccionada} 
                                                                            onValueChange={(val) => {
                                                                                if (val === item.unidad_medida?.abreviatura) {
                                                                                    updateUnit(item.id_producto, val, 1, item.precio_venta)
                                                                                } else {
                                                                                    const p = item.precios?.find((p: any) => p.unidad_medida?.abreviatura === val || p.nombre === val)
                                                                                    if (p) updateUnit(item.id_producto, val, Number(p.factor), Number(p.precio))
                                                                                }
                                                                            }}
                                                                        >
                                                                            <SelectTrigger className="h-6 text-[10px] w-24 bg-slate-100 dark:bg-slate-800 border-none">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="bg-slate-100 dark:bg-slate-800">
                                                                                <SelectItem value={item.unidad_medida?.abreviatura || "Und"}>{item.unidad_medida?.abreviatura || "Unidad"}</SelectItem>
                                                                                {item.precios.map((p: any, i: number) => (
                                                                                    <SelectItem key={i} value={p.unidad_medida?.abreviatura || p.nombre}>
                                                                                        {p.nombre} ({p.unidad_medida?.abreviatura})
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    ) : (
                                                                        <span>Unidad: {item.unidad_medida?.abreviatura || 'Und'}</span>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-sm">S/ {item.precio_unitario.toFixed(2)}</TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center justify-center gap-3">
                                                                    <button onClick={() => updateQuantity(item.id_producto, -1)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">-</button>
                                                                    <Input
                                                                        type="number"
                                                                        min="1"
                                                                        value={item.cantidad}
                                                                        onChange={(e) => updateQuantity(item.id_producto, 0, parseFloat(e.target.value) || 0)}
                                                                        className="w-20 text-center h-8 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                                                                    />
                                                                    <button onClick={() => updateQuantity(item.id_producto, 1)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">+</button>
                                                                </div>
                                                                {item.factor_seleccionado > 1 && (
                                                                    <div className="text-[10px] text-center text-slate-500 mt-1">
                                                                        Equivale a {item.cantidad * item.factor_seleccionado} {item.unidad_medida?.abreviatura}
                                                                    </div>
                                                                )}
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
                                                    <span>IGV ({selectedCompType?.porcentaje_igv || 18}%)</span>
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
                                                        <Label className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold">Tipo de Documento</Label>
                                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                            {comprobantes.map((comp) => (
                                                                <Button
                                                                    key={comp.id}
                                                                    variant={selectedCompType?.id === comp.id ? "default" : "outline"}
                                                                    className={`h-auto flex-col py-2 gap-1 ${selectedCompType?.id === comp.id ? "bg-blue-600 hover:bg-blue-700 font-bold" : "border-slate-300 dark:border-slate-700"}`}
                                                                    onClick={() => setSelectedCompType(comp)}
                                                                >
                                                                    <span className="font-bold">{comp.nombre}</span>
                                                                    <span className="text-[9px] opacity-70 font-normal">{comp.serie || 'S001'} | {comp.aplica_igv ? `IGV ${comp.porcentaje_igv}%` : 'S/ IGV'}</span>
                                                                </Button>
                                                            ))}
                                                        </div>
                                                    </div>

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

                                                    <div className="space-y-3">
                                                        <Label className="text-slate-400 dark:text-slate-500 dark:text-slate-400 font-bold">Formato de Impresión</Label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setPrintFormat("Ticket")}
                                                                className={`border-slate-300 dark:border-slate-700 h-10 ${printFormat === 'Ticket' ? 'border-orange-500 text-orange-600 bg-orange-500/5 dark:text-orange-400' : 'text-slate-500 bg-transparent'}`}
                                                            >
                                                                Ticket
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setPrintFormat("A4")}
                                                                className={`border-slate-300 dark:border-slate-700 h-10 ${printFormat === 'A4' ? 'border-orange-500 text-orange-600 bg-orange-500/5 dark:text-orange-400' : 'text-slate-500 bg-transparent'}`}
                                                            >
                                                                Tamaño A4
                                                            </Button>
                                                        </div>
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
                                                <>
                                                    <Button
                                                        onClick={createCotizacion}
                                                        disabled={cart.length === 0 || loading}
                                                        className="w-full h-16 text-lg font-bold bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-900/20"
                                                    >
                                                        {loading ? "Guardando..." : "GUARDAR COTIZACIÓN"}
                                                    </Button>
                                                    <div className="grid grid-cols-2 gap-2 mt-3">
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setPrintFormat("Ticket")}
                                                            className={`border-slate-300 dark:border-slate-700 h-10 ${printFormat === 'Ticket' ? 'border-orange-500 text-orange-600 bg-orange-500/5 dark:text-orange-400 font-bold' : 'text-slate-500 bg-transparent'}`}
                                                        >
                                                            Facturar en Ticket
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setPrintFormat("A4")}
                                                            className={`border-slate-300 dark:border-slate-700 h-10 ${printFormat === 'A4' ? 'border-orange-500 text-orange-600 bg-orange-500/5 dark:text-orange-400 font-bold' : 'text-slate-500 bg-transparent'}`}
                                                        >
                                                            Facturar en A4
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <TabsContent value="quotes_list" className="flex-1 mt-0 h-full data-[state=active]:flex flex-col overflow-hidden">
                                <Card className="flex-1 flex flex-col bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-700 overflow-hidden">
                                    <CardHeader className="pb-4 shrink-0 flex flex-row items-center justify-between">
                                        <CardTitle className="text-purple-600">Listado de Cotizaciones</CardTitle>
                                        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-300 dark:border-slate-700">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPrintFormat("Ticket")}
                                                className={`h-8 px-3 text-xs ${printFormat === 'Ticket' ? 'bg-white dark:bg-slate-800 shadow-sm text-orange-500' : 'text-slate-500'}`}
                                            >
                                                Ticket
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setPrintFormat("A4")}
                                                className={`h-8 px-3 text-xs ${printFormat === 'A4' ? 'bg-white dark:bg-slate-800 shadow-sm text-orange-500' : 'text-slate-500'}`}
                                            >
                                                A4
                                            </Button>
                                        </div>
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
                                                                <div className="flex flex-col gap-2 scale-90">
                                                                    <div className="flex gap-1 justify-center">
                                                                        <Button variant="outline" size="sm" onClick={() => {
                                                                            setPrintFormat("Ticket")
                                                                            setTimeout(() => printCotizacion(c), 50)
                                                                        }} className="px-2 h-7 text-[10px]">Ticket</Button>
                                                                        <Button variant="outline" size="sm" onClick={() => {
                                                                            setPrintFormat("A4")
                                                                            setTimeout(() => printCotizacion(c), 50)
                                                                        }} className="px-2 h-7 text-[10px]">A4</Button>
                                                                    </div>
                                                                    {c.estado === 'pendiente' && (
                                                                        <Button variant="default" size="sm" onClick={() => loadQuoteToPos(c)} className="bg-green-600 hover:bg-green-700 text-white h-8">Vender</Button>
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
                                                    <TableRow>
                                                        <TableCell colSpan={6} className="text-center py-8">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                                <span className="text-sm text-slate-500">Cargando ventas...</span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : filteredVentas.length === 0 ? (
                                                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-500">No se encontraron ventas.</TableCell></TableRow>
                                                ) : (
                                                    filteredVentas.map((v) => (
                                                        <TableRow key={v.id_venta} className="border-slate-300 dark:border-slate-700 hover:bg-slate-300/20 dark:bg-slate-700/20">
                                                            <TableCell className="font-medium">{new Date(v.fecha).toLocaleString()}</TableCell>
                                                            <TableCell className="font-mono font-bold text-slate-400 dark:text-slate-500">
                                                                {v.serie && v.correlativo 
                                                                    ? `${v.serie}-${v.correlativo.toString().padStart(6, '0')}`
                                                                    : `#${v.id_venta.toString().padStart(6, '0')}`
                                                                }
                                                            </TableCell>
                                                            <TableCell>{v.cliente?.nombre || 'Consumidor Final'}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 uppercase text-[10px]">
                                                                    {v.tipo_comprobante || 'Ticket'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-medium text-blue-500">S/ {v.total}</TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="border-green-500 text-green-500">{v.estado}</Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-slate-400 dark:text-slate-500 dark:text-slate-400 hover:text-blue-500"
                                                                    onClick={() => {
                                                                        setSelectedSaleDetail(v)
                                                                        setIsSaleDetailOpen(true)
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>

                                    {/* Modal Detalle Venta */}
                                    <Dialog open={isSaleDetailOpen} onOpenChange={setIsSaleDetailOpen}>
                                        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                                            <DialogHeader className="flex-shrink-0 flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                                                <div>
                                                    <DialogTitle className="text-xl">Detalle de Venta #{selectedSaleDetail?.id_venta}</DialogTitle>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                        {selectedSaleDetail?.fecha && new Date(selectedSaleDetail.fecha).toLocaleString()}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 mr-4"
                                                    onClick={() => selectedSaleDetail && printTicket(selectedSaleDetail)}
                                                >
                                                    <Printer className="h-4 w-4" /> Reimprimir
                                                </Button>
                                            </DialogHeader>

                                            <div className="flex-1 overflow-auto py-4 space-y-6">
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Cliente</span>
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {selectedSaleDetail?.cliente ? selectedSaleDetail.cliente.nombre : 'Consumidor Final'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Documento (RUC/DNI)</span>
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {selectedSaleDetail?.cliente?.dni_ruc || '-'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Cajero</span>
                                                        <span className="font-medium text-slate-900 dark:text-white">
                                                            {selectedSaleDetail?.usuario?.nombre || 'Admin'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-500 block mb-1">Tipo de Comprobante</span>
                                                        <Badge variant="outline" className="capitalize border-purple-500 text-purple-600">
                                                            {selectedSaleDetail?.tipo_comprobante || 'Recibo'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h3 className="font-bold mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">Productos Vendidos</h3>
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>Producto</TableHead>
                                                                <TableHead className="text-center">Cant.</TableHead>
                                                                <TableHead className="text-right">Precio</TableHead>
                                                                <TableHead className="text-right">Subtotal</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {selectedSaleDetail?.detalles?.map((d: any) => (
                                                                <TableRow key={d.id_detalle}>
                                                                    <TableCell>{d.descripcion || d.producto?.nombre}</TableCell>
                                                                    <TableCell className="text-center">{Number(d.cantidad).toString()}</TableCell>
                                                                    <TableCell className="text-right">S/ {Number(d.precio_unitario).toFixed(2)}</TableCell>
                                                                    <TableCell className="text-right font-medium">S/ {Number(d.subtotal).toFixed(2)}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                                                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
                                                    <div className="text-sm font-medium">
                                                        Método de Pago: <span className="uppercase text-blue-600 dark:text-blue-400">{selectedSaleDetail?.metodo_pago || 'EFECTIVO'}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                            S/ {Number(selectedSaleDetail?.total || 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {selectedSaleDetail?.metodo_pago === 'mixto' && (
                                                    <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 pt-1">
                                                        <span>Efectivo: S/ {Number(selectedSaleDetail?.monto_efectivo || 0).toFixed(2)}</span>
                                                        <span>Transferencia: S/ {Number(selectedSaleDetail?.monto_transferencia || 0).toFixed(2)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-xs text-slate-400 pt-1">
                                                    <span>IGV: S/ {Number(selectedSaleDetail?.igv || 0).toFixed(2)}</span>
                                                    <span>Gravada: S/ {Number(selectedSaleDetail?.subtotal || 0).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                </Card>
                            </TabsContent>
                        </main>
                    </Tabs>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
