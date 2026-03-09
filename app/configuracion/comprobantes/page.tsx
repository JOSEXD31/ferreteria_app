"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Edit, FileText } from "lucide-react"
import { toast } from "react-toastify"
import { ConfigHeader } from "@/components/config-header"

export default function ComprobantesPage() {
    const [comprobantes, setComprobantes] = useState<any[]>([])
    const [isCompModalOpen, setIsCompModalOpen] = useState(false)
    const [editingComp, setEditingComp] = useState<any>(null)
    const [compFormData, setCompFormData] = useState({
        nombre: "",
        serie: "",
        correlativo: "1",
        aplica_igv: true,
        porcentaje_igv: "18",
        tipo: "venta"
    })

    useEffect(() => {
        fetchComprobantes()
    }, [])

    const fetchComprobantes = async () => {
        try {
            const res = await fetch("/api/configuracion/comprobantes")
            const data = await res.json()
            setComprobantes(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching comprobantes:", error)
        }
    }

    const handleSaveComprobante = async () => {
        if (!compFormData.nombre) {
            toast.warning("El nombre es obligatorio")
            return
        }
        try {
            const res = await fetch("/api/configuracion/comprobantes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingComp ? { ...compFormData, id: editingComp.id } : compFormData)
            })
            if (res.ok) {
                toast.success(editingComp ? "Comprobante actualizado" : "Comprobante creado")
                setIsCompModalOpen(false)
                fetchComprobantes()
                setCompFormData({ nombre: "", serie: "", correlativo: "1", aplica_igv: true, porcentaje_igv: "18", tipo: "venta" })
                setEditingComp(null)
            }
        } catch (error) {
            toast.error("Error al guardar")
        }
    }

    const handleDeleteComprobante = async (id: number) => {
        if (!confirm("¿Eliminar este tipo de comprobante?")) return
        try {
            const res = await fetch(`/api/configuracion/comprobantes?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Eliminado")
                fetchComprobantes()
            }
        } catch (error) {
            toast.error("Error al eliminar")
        }
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
                    <ConfigHeader />

                    <div className="p-6 max-w-4xl mx-auto space-y-6 w-full flex-1">
                        <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                                            <FileText className="h-6 w-6 text-blue-500" />
                                            Tipos de Comprobantes
                                        </CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400">
                                            Define Boletas, Facturas y sus reglas de impuestos
                                        </CardDescription>
                                    </div>
                                    <Dialog open={isCompModalOpen} onOpenChange={setIsCompModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => {
                                                setCompFormData({ nombre: "", serie: "", correlativo: "1", aplica_igv: true, porcentaje_igv: "18", tipo: "venta" })
                                                setEditingComp(null)
                                            }}>
                                                <Plus className="h-4 w-4 mr-2" /> Agregar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                            <DialogHeader>
                                                <DialogTitle>{editingComp ? "Editar Comprobante" : "Nuevo Comprobante"}</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Nombre (Ej: Factura)</Label>
                                                    <Input value={compFormData.nombre} onChange={e => setCompFormData({ ...compFormData, nombre: e.target.value })} className="bg-slate-200 dark:bg-slate-700" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Serie (Ej: F001)</Label>
                                                        <Input value={compFormData.serie} onChange={e => setCompFormData({ ...compFormData, serie: e.target.value })} className="bg-slate-200 dark:bg-slate-700" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Correlativo</Label>
                                                        <Input type="number" value={compFormData.correlativo} onChange={e => setCompFormData({ ...compFormData, correlativo: e.target.value })} className="bg-slate-200 dark:bg-slate-700" />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-3 bg-slate-300/20 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <input type="checkbox" checked={compFormData.aplica_igv} onChange={e => setCompFormData({ ...compFormData, aplica_igv: e.target.checked })} className="h-4 w-4" id="tax-toggle" />
                                                        <Label htmlFor="tax-toggle" className="cursor-pointer">¿Aplica IGV?</Label>
                                                    </div>
                                                    {compFormData.aplica_igv && (
                                                        <div className="flex-1 flex items-center gap-2">
                                                            <Input type="number" value={compFormData.porcentaje_igv} onChange={e => setCompFormData({ ...compFormData, porcentaje_igv: e.target.value })} className="h-8 w-20 bg-slate-200 dark:bg-slate-700" />
                                                            <span className="text-sm">%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" onClick={() => setIsCompModalOpen(false)}>Cancelar</Button>
                                                <Button onClick={handleSaveComprobante} className="bg-blue-600 hover:bg-blue-700">Guardar</Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100 dark:bg-slate-900/50">
                                            <tr>
                                                <th className="text-left p-3">Documento</th>
                                                <th className="text-left p-3">Serie</th>
                                                <th className="text-left p-3">Correlativo</th>
                                                <th className="text-left p-3">IGV</th>
                                                <th className="text-right p-3">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-300 dark:divide-slate-700">
                                            {comprobantes.map((c: any) => (
                                                <tr key={c.id}>
                                                    <td className="p-3 font-medium">{c.nombre}</td>
                                                    <td className="p-3">{c.serie || '---'}</td>
                                                    <td className="p-3 font-mono">{c.correlativo.toString().padStart(6, '0')}</td>
                                                    <td className="p-3">
                                                        {c.aplica_igv ? <Badge className="bg-green-500/20 text-green-500 border-none">{c.porcentaje_igv}%</Badge> : <Badge variant="outline">Exento</Badge>}
                                                    </td>
                                                    <td className="p-3 text-right space-x-1">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400" onClick={() => {
                                                            setEditingComp(c)
                                                            setCompFormData({
                                                                nombre: c.nombre,
                                                                serie: c.serie || "",
                                                                correlativo: c.correlativo.toString(),
                                                                aplica_igv: c.aplica_igv,
                                                                porcentaje_igv: c.porcentaje_igv.toString(),
                                                                tipo: c.tipo || "venta"
                                                            })
                                                            setIsCompModalOpen(true)
                                                        }}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => handleDeleteComprobante(c.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {comprobantes.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No hay comprobantes configurados.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
