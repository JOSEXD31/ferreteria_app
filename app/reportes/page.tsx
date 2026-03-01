"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, FileSpreadsheet, BarChart3, TrendingUp, Package, ShoppingCart, UserCheck, Wallet } from "lucide-react"
import { toast } from "react-toastify"

export default function ReportsPage() {
    const [reports, setReports] = useState([
        {
            id: "ventas",
            title: "Reporte de Ventas",
            description: "Análisis detallado de ingresos por periodo",
            icon: <ShoppingCart className="w-8 h-8 text-emerald-500" />,
            color: "emerald"
        },
        {
            id: "inventario",
            title: "Stock e Inventario",
            description: "Valorización de almacén y alertas de stock bajo",
            icon: <Package className="w-8 h-8 text-blue-500" />,
            color: "blue"
        },
        {
            id: "servicios",
            title: "Servicios Técnicos",
            description: "Productividad y estado de trabajos",
            icon: <UserCheck className="w-8 h-8 text-cyan-500" />,
            color: "cyan"
        },
        {
            id: "caja",
            title: "Movimientos de Caja",
            description: "Cierres diarios y flujo de efectivo",
            icon: <Wallet className="w-8 h-8 text-purple-500" />,
            color: "purple"
        }
    ])

    const handleGenerate = (type: string, format: string) => {
        toast.info(`Generando reporte de ${type} en formato ${format}...`)
        // Simulación de descarga
        setTimeout(() => {
            toast.success("Reporte listo para descargar")
        }, 2000)
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
                                <BarChart3 className="text-indigo-400" /> Centro de Reportes
                            </h1>
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-slate-500 text-xs font-bold uppercase">Crecimiento Mensual</p>
                                            <h3 className="text-2xl font-bold text-emerald-400">+12.4%</h3>
                                        </div>
                                        <TrendingUp className="text-emerald-500 w-10 h-10 opacity-20" />
                                    </div>
                                </CardContent>
                            </Card>
                            {/* Repetir para otros KPIs si es necesario */}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {reports.map((report) => (
                                <Card key={report.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all group">
                                    <CardHeader className="flex flex-row items-center gap-6">
                                        <div className="p-4 rounded-2xl bg-slate-800 group-hover:scale-110 transition-transform">
                                            {report.icon}
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{report.title}</CardTitle>
                                            <CardDescription className="text-slate-400">{report.description}</CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-500">Desde</Label>
                                                <Input type="date" className="bg-slate-950 border-slate-800" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-500">Hasta</Label>
                                                <Input type="date" className="bg-slate-950 border-slate-800" />
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button 
                                                onClick={() => handleGenerate(report.id, 'PDF')}
                                                className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300"
                                            >
                                                <FileText className="w-4 h-4 mr-2" /> PDF
                                            </Button>
                                            <Button 
                                                onClick={() => handleGenerate(report.id, 'Excel')}
                                                className="flex-1 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 border border-emerald-500/30"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
