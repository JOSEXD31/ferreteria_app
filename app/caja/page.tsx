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

interface CajaRegistro {
    id_caja: number
    fecha: string
    monto_inicial: number
    total_ingresos: number
    total_egresos: number
    monto_final: number
    id_usuario: number | null
}

export default function CajaPage() {
    const [registrosCaja, setRegistrosCaja] = useState<CajaRegistro[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        monto_inicial: "0",
        total_ingresos: "0",
        total_egresos: "0",
        monto_final: "0"
    })

    useEffect(() => {
        fetchCajas()
    }, [])

    const fetchCajas = async () => {
        try {
            const res = await fetch("/api/caja")
            const data = await res.json()
            setRegistrosCaja(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching cajas:", error)
            toast.error("Error al cargar registros de caja")
        } finally {
            setLoading(false)
        }
    }

    const totals = registrosCaja.reduce((acc, curr) => {
        acc.ingresos += Number(curr.total_ingresos || 0)
        acc.egresos += Number(curr.total_egresos || 0)
        acc.balance = acc.ingresos - acc.egresos
        return acc
    }, { ingresos: 0, egresos: 0, balance: 0 })

    const handleAddCaja = async () => {
        try {
            const body = {
                monto_inicial: parseFloat(formData.monto_inicial),
                total_ingresos: parseFloat(formData.total_ingresos),
                total_egresos: parseFloat(formData.total_egresos),
                monto_final: parseFloat(formData.monto_final),
                id_usuario: parseInt(localStorage.getItem("userId") || "0") || null
            }
            const res = await fetch("/api/caja", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error("Error al registrar caja")
            toast.success("Caja registrada exitosamente")
            setIsAddModalOpen(false)
            setFormData({ monto_inicial: "0", total_ingresos: "0", total_egresos: "0", monto_final: "0" })
            fetchCajas()
        } catch (error) {
            toast.error("Error al guardar registro de caja")
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 justify-between bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger />
                            <h1 className="text-xl font-bold flex items-center gap-2">
                                <Wallet className="text-emerald-400" /> Control de Caja y Finanzas.
                            </h1>
                        </div>
                        <div className="text-sm text-slate-400 dark:text-slate-500 dark:text-slate-400 font-medium">
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-4 border-l-emerald-500 shadow-lg shadow-emerald-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <ArrowUpCircle className="w-3 h-3 text-emerald-500" /> Ingresos Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-emerald-400">S/. {totals.ingresos.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-4 border-l-rose-500 shadow-lg shadow-rose-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase flex items-center gap-2">
                                        <ArrowDownCircle className="w-3 h-3 text-rose-500" /> Egresos Totales
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-rose-400">S/. {totals.egresos.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/10">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-slate-400 dark:text-slate-500 dark:text-slate-400 text-xs uppercase flex items-center gap-2">
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

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle>Historial de Cajas</CardTitle>
                                        <CardDescription>Resumen de arqueos y cierres diarios</CardDescription>
                                    </div>
                                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                                <Plus className="w-4 h-4 mr-2" /> Registrar Arqueo de Caja
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                            <DialogHeader>
                                                <DialogTitle>Registrar Caja Diaria</DialogTitle>
                                                <DialogDescription>Ingrese los importes del cuadre de caja</DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Monto Inicial de Caja (Apertura)</Label>
                                                    <Input type="number" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="0.00" value={formData.monto_inicial} onChange={e => setFormData({ ...formData, monto_inicial: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Ingresos (Ventas)</Label>
                                                    <Input type="number" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-emerald-400 font-bold" placeholder="0.00" value={formData.total_ingresos} onChange={e => setFormData({ ...formData, total_ingresos: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Total Egresos (Compras / Pagos)</Label>
                                                    <Input type="number" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-rose-400 font-bold" placeholder="0.00" value={formData.total_egresos} onChange={e => setFormData({ ...formData, total_egresos: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Monto Final Físico (Cierre)</Label>
                                                    <Input type="number" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-400 font-bold text-lg" placeholder="0.00" value={formData.monto_final} onChange={e => setFormData({ ...formData, monto_final: e.target.value })} />
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>Cancelar</Button>
                                                <Button onClick={handleAddCaja} className="bg-emerald-600 hover:bg-emerald-700">Guardar Arqueo</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex gap-4">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                        <Input
                                            placeholder="Buscar por fecha..."
                                            className="pl-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                        <Calendar className="w-4 h-4 mr-2" /> Filtrar por fecha
                                    </Button>
                                </div>

                                <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-slate-200/50 dark:bg-slate-800/50">
                                            <TableRow className="border-slate-200 dark:border-slate-800">
                                                <TableHead>Fecha</TableHead>
                                                <TableHead className="text-right">M. Inicial</TableHead>
                                                <TableHead className="text-right text-emerald-400">T. Ingresos</TableHead>
                                                <TableHead className="text-right text-rose-400">T. Egresos</TableHead>
                                                <TableHead className="text-right text-blue-400 font-bold">M. Final</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loading ? (
                                                <TableRow><TableCell colSpan={5} className="text-center py-10">Cargando registros de caja...</TableCell></TableRow>
                                            ) : registrosCaja.filter(c => new Date(c.fecha).toLocaleDateString().includes(searchTerm)).map(c => (
                                                <TableRow key={c.id_caja} className="border-slate-200 dark:border-slate-800 hover:bg-slate-200/20 dark:bg-slate-800/20">
                                                    <TableCell className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        {new Date(c.fecha).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right text-slate-400 dark:text-slate-500 dark:text-slate-400">
                                                        S/. {Number(c.monto_inicial || 0).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-emerald-400">
                                                        S/. {Number(c.total_ingresos || 0).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-rose-400">
                                                        S/. {Number(c.total_egresos || 0).toFixed(2)}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-blue-400">
                                                        S/. {Number(c.monto_final || 0).toFixed(2)}
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
