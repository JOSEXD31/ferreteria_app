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
import { Wallet, ArrowUpCircle, ArrowDownCircle, Search, Plus, Calendar, DollarSign } from "lucide-react"
import { toast } from 'react-toastify'

interface Transaccion {
    id: number
    tipo: 'ingreso' | 'egreso'
    descripcion: string
    monto: number
    fecha: string
    metodo: string
}

export default function CajaPage() {
    const [transacciones, setTransacciones] = useState<Transaccion[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    
    const [formData, setFormData] = useState({
        tipo: 'ingreso',
        descripcion: "",
        monto: "",
        metodo: "Efectivo"
    })

    useEffect(() => {
        fetchTransacciones()
    }, [])

    const fetchTransacciones = async () => {
        // En un caso real, esto vendría de una API
        // Por ahora simularemos datos basados en ventas y compras registradas
        setLoading(false)
        setTransacciones([
            { id: 1, tipo: 'ingreso', descripcion: 'Venta #V001', monto: 150.50, fecha: new Date().toISOString(), metodo: 'Efectivo' },
            { id: 2, tipo: 'egreso', descripcion: 'Pago Proveedor - Clavos S.A.', monto: 45.00, fecha: new Date().toISOString(), metodo: 'Transferencia' },
        ])
    }

    const totals = transacciones.reduce((acc, curr) => {
        if (curr.tipo === 'ingreso') acc.ingresos += curr.monto
        else acc.egresos += curr.monto
        acc.balance = acc.ingresos - acc.egresos
        return acc
    }, { ingresos: 0, egresos: 0, balance: 0 })

    const handleAddMovement = () => {
        if (!formData.monto || !formData.descripcion) return
        const newMove: Transaccion = {
            id: Date.now(),
            tipo: formData.tipo as 'ingreso' | 'egreso',
            descripcion: formData.descripcion,
            monto: parseFloat(formData.monto),
            fecha: new Date().toISOString(),
            metodo: formData.metodo
        }
        setTransacciones([newMove, ...transacciones])
        setIsAddModalOpen(false)
        setFormData({ tipo: 'ingreso', descripcion: "", monto: "", metodo: "Efectivo" })
        toast.success("Movimiento registrado")
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-slate-950 text-white">
                    <header className="h-16 border-b border-slate-800 flex items-center px-6 justify-between bg-slate-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="text-emerald-400" /> Control de Caja y Finanzas.
                            </h1>
                        </div>
                        <div className="text-sm text-slate-400 font-medium">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <ArrowUpCircle className="w-3 h-3 text-emerald-500" /> Ingresos Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-400">S/. {totals.ingresos.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-rose-500 shadow-lg shadow-rose-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <ArrowDownCircle className="w-3 h-3 text-rose-500" /> Egresos Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-rose-400">S/. {totals.egresos.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800 border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <DollarSign className="w-3 h-3 text-blue-500" /> Balance en Caja
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-3xl font-bold ${totals.balance >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                                        S/. {totals.balance.toFixed(2)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Historial de Movimientos</CardTitle>
                                        <CardDescription>Resumen de flujo de efectivo diario</CardDescription>
                                    </div>
                                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                                <Plus className="w-4 h-4 mr-2" /> Nuevo Movimiento
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-slate-900 border-slate-800 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Registrar Movimiento</DialogTitle>
                                                <DialogDescription>Añadir ingreso o egreso manual a caja</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Tipo de Movimiento</Label>
                                                    <Select onValueChange={v => setFormData({...formData, tipo: v})}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700">
                                                            <SelectValue placeholder="Seleccionar..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectItem value="ingreso">Ingreso (+)</SelectItem>
                                                            <SelectItem value="egreso">Egreso (-)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Monto (S/.)</Label>
                                                    <Input type="number" className="bg-slate-800 border-slate-700 text-lg font-bold text-emerald-400" placeholder="0.00" value={formData.monto} onChange={e => setFormData({...formData, monto: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Descripción / Concepto</Label>
                                                    <Input className="bg-slate-800 border-slate-700" placeholder="Ej: Pago de servicios luz, Venta menor..." value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Método</Label>
                                                    <Select onValueChange={v => setFormData({...formData, metodo: v})}>
                                                        <SelectTrigger className="bg-slate-800 border-slate-700">
                                                            <SelectValue placeholder="Efectivo" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                            <SelectItem value="Efectivo">Efectivo</SelectItem>
                                                            <SelectItem value="Yape/Plin">Yape / Plin</SelectItem>
                                                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                                                            <SelectItem value="Tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                                                <Button onClick={handleAddMovement} className="bg-emerald-600 hover:bg-emerald-700">Guardar Movimiento</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex gap-4">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                        <Input 
                                            placeholder="Buscar en transacciones..." 
                                            className="pl-10 bg-slate-950 border-slate-800"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" className="border-slate-800 bg-slate-900">
                                        <Calendar className="w-4 h-4 mr-2" /> Filtrar por fecha
                                    </Button>
                                </div>

                                <div className="rounded-xl border border-slate-800 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-800/50">
                                            <TableRow className="border-slate-800">
                                                <TableHead>Fecha / Hora</TableHead>
                                                <TableHead>Concepto</TableHead>
                                                <TableHead>Método</TableHead>
                                                <TableHead className="text-right">Monto</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={4} className="text-center py-10">Cargando transacciones...</TableCell></TableRow>
                                            ) : transacciones.filter(t => t.descripcion.toLowerCase().includes(searchTerm.toLowerCase())).map(t => (
                                                <TableRow key={t.id} className="border-slate-800 hover:bg-slate-800/20">
                                                    <TableCell className="text-xs text-slate-400">
                                                        {new Date(t.fecha).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-slate-200">{t.descripcion}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="text-[10px] border-slate-700">{t.metodo}</Badge>
                                                    </TableCell>
                                                    <TableCell className={`text-right font-bold ${t.tipo === 'ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                        {t.tipo === 'ingreso' ? '+' : '-'} S/. {t.monto.toFixed(2)}
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
