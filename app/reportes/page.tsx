"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FileText, FileSpreadsheet, BarChart3, Package, ShoppingCart, Loader2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Filter } from "lucide-react"
import { toast } from "react-toastify"
import React from "react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import ExcelJS from "exceljs"
import { cn } from "@/lib/utils"

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState<string | null>(null)
    const [selectedDateRange, setSelectedDateRange] = useState<string>("hoy")
    const [customDesde, setCustomDesde] = useState<string>("")
    const [customHasta, setCustomHasta] = useState<string>("")
    const [loadingReport, setLoadingReport] = useState<boolean>(false)
    const [reportData, setReportData] = useState<any[] | null>(null)

    // Table states
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [itemsPerPage, setItemsPerPage] = useState<number>(5)
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null)

    const reportOptions = [
        {
            id: "ventas",
            title: "Reporte de Ventas",
            description: "Análisis de ingresos",
            icon: <ShoppingCart className="w-8 h-8 text-emerald-500" />
        },
        {
            id: "compras",
            title: "Reporte de Compras",
            description: "Análisis de compras",
            icon: <Package className="w-8 h-8 text-purple-500" />
        },
        {
            id: "inventario",
            title: "Stock e Inventario",
            description: "Valorización de almacén",
            icon: <Package className="w-8 h-8 text-blue-500" />
        },
        {
            id: "caja",
            title: "Resumen de Caja",
            description: "Análisis financiero",
            icon: <BarChart3 className="w-8 h-8 text-orange-500" />
        }
    ]

    const getFilterRange = () => {
        const today = new Date()
        const offset = today.getTimezoneOffset() * 60000
        const localDate = new Date(today.getTime() - offset).toISOString().split('T')[0]

        let desde = ""
        let hasta = ""

        if (selectedDateRange === "hoy") {
            desde = localDate
            hasta = localDate
        } else if (selectedDateRange === "ayer") {
            const yesterday = new Date(today)
            yesterday.setDate(yesterday.getDate() - 1)
            const yesterdayLocal = new Date(yesterday.getTime() - offset).toISOString().split('T')[0]
            desde = yesterdayLocal
            hasta = yesterdayLocal
        } else if (selectedDateRange === "este_mes") {
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
            desde = new Date(firstDay.getTime() - offset).toISOString().split('T')[0]
            hasta = localDate
        } else if (selectedDateRange === "personalizado") {
            desde = customDesde
            hasta = customHasta
        }
        return { desde, hasta }
    }

    const exportPdf = async (type: string, data: any[], empresa: any, filter: any) => {
        const doc = new jsPDF()

        const empresaNombre = empresa?.nombre || "FERRETERIA"
        const empresaRuc = empresa?.ruc || "RUC: 0000000000000"
        const empresaDireccion = empresa?.direccion || "s/n"

        // Header Background
        doc.setFillColor(63, 81, 181) // Indigo-500
        doc.rect(0, 0, 210, 40, 'F')

        // Header Text
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.text(empresaNombre, 14, 20)

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.text(`${empresaRuc} | ${empresaDireccion}`, 14, 28)

        // Report Title
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text(`REPORTE DE ${type.toUpperCase()}`, 14, 55)

        // Date generated and period
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const today = new Date().toLocaleDateString()
        doc.text(`Fecha de Emisión: ${today}`, 14, 62)

        let periodText = "Periodo: Histórico Completo"
        if (filter?.desde || filter?.hasta) {
            periodText = `Periodo: ${filter.desde ? new Date(filter.desde + "T00:00:00").toLocaleDateString() : 'Inicio'} al ${filter.hasta ? new Date(filter.hasta + "T00:00:00").toLocaleDateString() : 'Hoy'}`
        }
        if (type === "inventario") periodText = `Estado al: ${today}`
        doc.text(periodText, 14, 68)

        let columns: string[] = []
        let rows: any[] = []

        if (type === "ventas") {
            columns = ["ID", "Fecha", "Cliente", "Comprobante", "Pago", "Total"]
            rows = data.map(v => [
                v.id_venta,
                new Date(v.fecha).toLocaleDateString(),
                v.cliente?.nombre || "Consumidor Final",
                v.tipo_comprobante === 'ticket' ? 'Recibo' : (v.tipo_comprobante || "Recibo"),
                v.metodo_pago || "Efectivo",
                `S/ ${Number(v.total).toFixed(2)}`
            ])
        } else if (type === "compras") {
            columns = ["ID", "Fecha", "Proveedor", "Total"]
            rows = data.map(c => [
                c.id_compra,
                new Date(c.fecha).toLocaleDateString(),
                c.proveedor?.nombre || "N/A",
                `S/ ${Number(c.total).toFixed(2)}`
            ])
        } else if (type === "inventario") {
            columns = ["ID", "Producto", "Stock", "P. Compra", "P. Venta", "Valor Total"]
            rows = data.map(p => [
                p.id_producto,
                p.nombre,
                p.stock_actual,
                `S/ ${Number(p.precio_compra).toFixed(2)}`,
                `S/ ${Number(p.precio_venta).toFixed(2)}`,
                `S/ ${(Number(p.stock_actual) * Number(p.precio_compra)).toFixed(2)}`
            ])
        } else if (type === "caja") {
            columns = ["ID", "Fecha", "M. Inicial", "Ingresos", "Egresos", "M. Final"]
            rows = data.map(c => [
                c.id_caja,
                new Date(c.fecha).toLocaleDateString(),
                `S/ ${Number(c.monto_inicial).toFixed(2)}`,
                `S/ ${Number(c.total_ingresos).toFixed(2)}`,
                `S/ ${Number(c.total_egresos).toFixed(2)}`,
                `S/ ${Number(c.monto_final).toFixed(2)}`
            ])
        }

        autoTable(doc, {
            head: [columns],
            body: rows,
            startY: 75,
            theme: 'grid',
            headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { top: 75, left: 14, right: 14 }
        })

        // Footer Pagination
        const pageCount = (doc as any).internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150)
            doc.text(`Página ${i} de ${pageCount}`, 196, 290, { align: 'right' })
            doc.text(`Generado por ${empresaNombre}`, 14, 290)
        }

        doc.save(`reporte_${type}_${Date.now()}.pdf`)
    }

    const exportExcel = async (type: string, data: any[], empresa: any, filter: any) => {
        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet(`Reporte ${type}`)

        let periodText = "Periodo: Histórico Completo"
        if (filter?.desde || filter?.hasta) {
            periodText = `Periodo: ${filter.desde || 'Inicio'} al ${filter.hasta || 'Hoy'}`
        }
        if (type === "inventario") periodText = `Estado al: ${new Date().toLocaleDateString()}`

        let columnsData: any[] = []

        if (type === "ventas") {
            columnsData = [
                { header: "ID Venta", key: "id", width: 15 },
                { header: "Fecha", key: "fecha", width: 25 },
                { header: "Cliente", key: "cliente", width: 35 },
                { header: "Comprobante", key: "comprobante", width: 20 },
                { header: "Pago", key: "pago", width: 20 },
                { header: "Total (S/)", key: "total", width: 20 }
            ]
            worksheet.columns = columnsData

            data.forEach(v => {
                const row = worksheet.addRow({
                    id: v.id_venta,
                    fecha: new Date(v.fecha).toLocaleString(),
                    cliente: v.cliente?.nombre || "Consumidor Final",
                    comprobante: v.tipo_comprobante === 'ticket' ? 'Recibo' : (v.tipo_comprobante || "Recibo"),
                    pago: v.metodo_pago || "Efectivo",
                    total: Number(v.total)
                })
                row.getCell('total').numFmt = '0.00'
            })
        } else if (type === "compras") {
            columnsData = [
                { header: "ID Compra", key: "id", width: 15 },
                { header: "Fecha", key: "fecha", width: 25 },
                { header: "Proveedor", key: "proveedor", width: 40 },
                { header: "Total (S/)", key: "total", width: 20 }
            ]
            worksheet.columns = columnsData

            data.forEach(c => {
                const row = worksheet.addRow({
                    id: c.id_compra,
                    fecha: new Date(c.fecha).toLocaleString(),
                    proveedor: c.proveedor?.nombre || "N/A",
                    total: Number(c.total)
                })
                row.getCell('total').numFmt = '0.00'
            })
        } else if (type === "inventario") {
            columnsData = [
                { header: "ID Prod", key: "id", width: 12 },
                { header: "Producto", key: "producto", width: 45 },
                { header: "Stock Act", key: "stock", width: 15 },
                { header: "P. Compra", key: "precio_compra", width: 18 },
                { header: "P. Venta", key: "precio_venta", width: 18 },
                { header: "Valor T. (S/)", key: "valor", width: 20 }
            ]
            worksheet.columns = columnsData

            data.forEach(p => {
                const row = worksheet.addRow({
                    id: p.id_producto,
                    producto: p.nombre,
                    stock: p.stock_actual,
                    precio_compra: Number(p.precio_compra),
                    precio_venta: Number(p.precio_venta),
                    valor: Number(p.stock_actual) * Number(p.precio_compra)
                })
                row.getCell('precio_compra').numFmt = '0.00'
                row.getCell('precio_venta').numFmt = '0.00'
                row.getCell('valor').numFmt = '0.00'
            })
        } else if (type === "caja") {
            columnsData = [
                { header: "ID Caja", key: "id", width: 12 },
                { header: "Fecha", key: "fecha", width: 25 },
                { header: "Monto Inicial", key: "inicial", width: 18 },
                { header: "Total Ingresos", key: "ingresos", width: 18 },
                { header: "Total Egresos", key: "egresos", width: 18 },
                { header: "Monto Final", key: "final", width: 18 }
            ]
            worksheet.columns = columnsData

            data.forEach(c => {
                const row = worksheet.addRow({
                    id: c.id_caja,
                    fecha: new Date(c.fecha).toLocaleString(),
                    inicial: Number(c.monto_inicial),
                    ingresos: Number(c.total_ingresos),
                    egresos: Number(c.total_egresos),
                    final: Number(c.monto_final)
                })
                row.getCell('inicial').numFmt = '0.00'
                row.getCell('ingresos').numFmt = '0.00'
                row.getCell('egresos').numFmt = '0.00'
                row.getCell('final').numFmt = '0.00'
            })
        }

        // Insert header rows at the top to push table down without losing headers
        worksheet.spliceRows(1, 0, [periodText], [])

        // Style header row (Now row 3)
        const headerRow = worksheet.getRow(3)
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } }
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3F51B5' } }
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' }

        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reporte_${type}_${Date.now()}.xlsx`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleGenerate = async () => {
        if (!selectedReport) {
            toast.warning("Por favor selecciona un tipo de reporte.")
            return
        }

        try {
            setLoadingReport(true)
            setReportData(null)
            setCurrentPage(1)
            setSortConfig(null)

            const filter = getFilterRange()

            let data: any[] = []

            if (selectedReport === "ventas") {
                const res = await fetch("/api/ventas")
                if (!res.ok) throw new Error("Error al obtener ventas")
                const allSales = await res.json()
                data = Array.isArray(allSales) ? allSales : []
                if (filter.desde && filter.desde !== "") data = data.filter((v: any) => new Date(v.fecha) >= new Date(filter.desde + "T00:00:00"))
                if (filter.hasta && filter.hasta !== "") {
                    const toDate = new Date(filter.hasta + "T23:59:59")
                    data = data.filter((v: any) => new Date(v.fecha) <= toDate)
                }
            } else if (selectedReport === "compras") {
                const res = await fetch("/api/compras")
                if (!res.ok) throw new Error("Error al obtener compras")
                const allPurchases = await res.json()
                data = Array.isArray(allPurchases) ? allPurchases : []
                if (filter.desde && filter.desde !== "") data = data.filter((c: any) => new Date(c.fecha) >= new Date(filter.desde + "T00:00:00"))
                if (filter.hasta && filter.hasta !== "") {
                    const toDate = new Date(filter.hasta + "T23:59:59")
                    data = data.filter((c: any) => new Date(c.fecha) <= toDate)
                }
            } else if (selectedReport === "caja") {
                const res = await fetch("/api/caja")
                if (!res.ok) throw new Error("Error al obtener datos de caja")
                const allCajas = await res.json()
                data = Array.isArray(allCajas) ? allCajas : []
                if (filter.desde && filter.desde !== "") data = data.filter((c: any) => new Date(c.fecha) >= new Date(filter.desde + "T00:00:00"))
                if (filter.hasta && filter.hasta !== "") {
                    const toDate = new Date(filter.hasta + "T23:59:59")
                    data = data.filter((c: any) => new Date(c.fecha) <= toDate)
                }
            }

            if (!data || data.length === 0) {
                toast.warning(`No hay datos registrados para las fechas seleccionadas.`)
                setLoadingReport(false)
                return
            }

            setReportData(data)
            toast.success(`Datos cargados correctamente.`)
        } catch (error) {
            console.error("Error generating report data:", error)
            toast.error("Error al obtener los datos.")
        } finally {
            setLoadingReport(false)
        }
    }

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc'
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        setSortConfig({ key, direction })
    }

    const sortedData = React.useMemo(() => {
        if (!reportData) return []
        let sortableItems = [...reportData]
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aVal = a[sortConfig.key]
                let bVal = b[sortConfig.key]

                // Resolve deeply nested strings for clients/providers if sorting by them
                if (selectedReport === "ventas" && sortConfig.key === "cliente") {
                    aVal = a.cliente?.nombre || ""
                    bVal = b.cliente?.nombre || ""
                } else if (selectedReport === "compras" && sortConfig.key === "proveedor") {
                    aVal = a.proveedor?.nombre || ""
                    bVal = b.proveedor?.nombre || ""
                }

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }
        return sortableItems
    }, [reportData, sortConfig, selectedReport])

    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleExport = async (format: 'PDF' | 'Excel') => {
        if (!reportData || reportData.length === 0 || !selectedReport) return

        try {
            const filter = getFilterRange()
            let empresa = null
            try {
                const empRes = await fetch("/api/empresa")
                if (empRes.ok) {
                    const empData = await empRes.json()
                    empresa = Array.isArray(empData) ? empData[0] : empData
                }
            } catch (e) { }

            toast.info(`Generando ${format}...`)

            if (format === 'PDF') {
                exportPdf(selectedReport, sortedData, empresa, filter)
            } else {
                await exportExcel(selectedReport, sortedData, empresa, filter)
            }
            toast.success(`Exportado exitosamente.`)
        } catch (error) {
            console.error(error)
            toast.error("Error en la exportación.")
        }
    }

    const handleClear = () => {
        setReportData(null)
        setSelectedReport(null)
        setCustomDesde("")
        setCustomHasta("")
        setSelectedDateRange("hoy")
        setCurrentPage(1)
        setSortConfig(null)
    }

    const getColumns = () => {
        if (selectedReport === "ventas") return [
            { key: "id_venta", label: "ID" },
            { key: "fecha", label: "Fecha" },
            { key: "cliente", label: "Cliente" },
            { key: "tipo_comprobante", label: "Comprobante" },
            { key: "metodo_pago", label: "Pago" },
            { key: "total", label: "Total (S/)" }
        ]
        if (selectedReport === "compras") return [
            { key: "id_compra", label: "ID" },
            { key: "fecha", label: "Fecha" },
            { key: "proveedor", label: "Proveedor" },
            { key: "total", label: "Total (S/)" }
        ]
        if (selectedReport === "caja") return [
            { key: "id_caja", label: "ID" },
            { key: "fecha", label: "Fecha" },
            { key: "monto_inicial", label: "M. Inicial" },
            { key: "total_ingresos", label: "Ingresos" },
            { key: "total_egresos", label: "Egresos" },
            { key: "monto_final", label: "M. Final" }
        ]
        return [
            { key: "id_producto", label: "ID" },
            { key: "nombre", label: "Producto" },
            { key: "stock_actual", label: "Stock" },
            { key: "precio_compra", label: "P. Compra" },
            { key: "precio_venta", label: "P. Venta" },
            { key: "valor_total", label: "Valor Total" }
        ]
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
                                <BarChart3 className="text-indigo-400" /> Reportes interactivos
                            </h1>
                        </div>
                    </header>

                    <div className="p-6 max-w-7xl mx-auto space-y-8">
                        {/* Fila 1: Tipos de Reporte */}
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <Filter className="w-5 h-5" /> 1. Seleccionar Reporte
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {reportOptions.map((opt) => (
                                    <div
                                        key={opt.id}
                                        onClick={() => {
                                            setSelectedReport(opt.id)
                                            setReportData(null)
                                        }}
                                        className={cn(
                                            "cursor-pointer rounded-xl border-2 p-5 transition-all flex items-center gap-4 bg-white dark:bg-slate-900",
                                            selectedReport === opt.id
                                                ? "border-indigo-500 shadow-lg shadow-indigo-500/10 scale-105"
                                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:scale-105"
                                        )}
                                    >
                                        <div className={cn("p-3 rounded-xl", selectedReport === opt.id ? "bg-indigo-50 dark:bg-indigo-500/10" : "bg-slate-100 dark:bg-slate-800")}>
                                            {opt.icon}
                                        </div>
                                        <div>
                                            <h3 className={cn("font-bold text-lg", selectedReport === opt.id ? "text-indigo-600 dark:text-indigo-400" : "")}>{opt.title}</h3>
                                            <p className="text-sm text-slate-500">{opt.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Fila 2: Filtros de Fecha y Botón Generar */}
                        <div className={cn("space-y-3 transition-all", selectedReport ? "opacity-100" : "opacity-50 pointer-events-none")}>
                            <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                <CalendarIcon className="w-5 h-5" /> 2. Rango de Fechas
                            </h2>
                            <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
                                <div className="flex-1 flex flex-wrap items-center gap-3">
                                    <Button
                                        variant={selectedDateRange === "hoy" ? "default" : "outline"}
                                        onClick={() => setSelectedDateRange("hoy")}
                                        className={selectedDateRange === "hoy" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                    >
                                        Hoy
                                    </Button>
                                    <Button
                                        variant={selectedDateRange === "ayer" ? "default" : "outline"}
                                        onClick={() => setSelectedDateRange("ayer")}
                                        className={selectedDateRange === "ayer" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                    >
                                        Ayer
                                    </Button>
                                    <Button
                                        variant={selectedDateRange === "este_mes" ? "default" : "outline"}
                                        onClick={() => setSelectedDateRange("este_mes")}
                                        className={selectedDateRange === "este_mes" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                    >
                                        Este mes
                                    </Button>
                                    <Button
                                        variant={selectedDateRange === "personalizado" ? "default" : "outline"}
                                        onClick={() => setSelectedDateRange("personalizado")}
                                        className={selectedDateRange === "personalizado" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
                                    >
                                        Personalizado
                                    </Button>

                                    {selectedDateRange === "personalizado" && (
                                        <div className="flex items-center gap-3 ml-4 animate-in fade-in slide-in-from-left-4">
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">Desde:</Label>
                                                <Input type="date" value={customDesde} onChange={(e) => setCustomDesde(e.target.value)} className="w-auto" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label className="text-sm">Hasta:</Label>
                                                <Input type="date" value={customHasta} onChange={(e) => setCustomHasta(e.target.value)} className="w-auto" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button
                                    size="lg"
                                    className="bg-emerald-600 hover:bg-emerald-700 px-8 disabled:opacity-50"
                                    onClick={handleGenerate}
                                    disabled={loadingReport || (selectedDateRange === "personalizado" && (!customDesde || !customHasta))}
                                >
                                    {loadingReport ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <BarChart3 className="w-5 h-5 mr-2" />}
                                    Generar Reporte
                                </Button>
                            </div>
                        </div>

                        {/* Resultados y Tabla */}
                        {reportData && (
                            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                                <Card className="border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-500/5">
                                    <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
                                        <CardTitle className="text-xl">Resultados del Reporte ({reportData.length} registros)</CardTitle>
                                        <Button variant="destructive" size="sm" onClick={handleClear} className="gap-2">
                                            <X className="w-4 h-4" /> Limpiar
                                        </Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm whitespace-nowrap">
                                                <thead className="bg-slate-100 dark:bg-slate-800/50 uppercase text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                                                    <tr>
                                                        {getColumns().map((col) => (
                                                            <th
                                                                key={col.key}
                                                                className="px-6 py-4 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                                                onClick={() => handleSort(col.key)}
                                                            >
                                                                <div className="flex items-center gap-1">
                                                                    {col.label}
                                                                    {sortConfig?.key === col.key && (
                                                                        sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                                                    )}
                                                                </div>
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedData.map((row, idx) => (
                                                        <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                            {getColumns().map((col) => {
                                                                let val = row[col.key]
                                                                if (col.key === 'fecha') val = new Date(val).toLocaleDateString()
                                                                if (col.key === 'tipo_comprobante') val = row.tipo_comprobante === 'ticket' ? 'Recibo' : (row.tipo_comprobante || 'Recibo')
                                                                if (col.key === 'cliente') val = row.cliente?.nombre || 'Consumidor Final'
                                                                if (col.key === 'proveedor') val = row.proveedor?.nombre || 'N/A'
                                                                if (col.key === 'total' || col.key === 'precio_compra' || col.key === 'precio_venta' || col.key === 'monto_inicial' || col.key === 'total_ingresos' || col.key === 'total_egresos' || col.key === 'monto_final') val = `S/ ${Number(val).toFixed(2)}`
                                                                if (col.key === 'valor_total') val = `S/ ${(Number(row.stock_actual) * Number(row.precio_compra)).toFixed(2)}`
                                                                return (
                                                                    <td key={col.key} className="px-6 py-4">
                                                                        {val}
                                                                    </td>
                                                                )
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 border-b">
                                            <div className="flex items-center gap-3">
                                                <Label className="text-sm text-slate-500 whitespace-nowrap">Filas por página:</Label>
                                                <select
                                                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm p-1 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-500"
                                                    value={itemsPerPage}
                                                    onChange={(e) => {
                                                        setItemsPerPage(Number(e.target.value))
                                                        setCurrentPage(1)
                                                    }}
                                                >
                                                    {[5, 10, 20, 50, 100].map(n => (
                                                        <option key={n} value={n}>{n}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, sortedData.length)} de {sortedData.length}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={currentPage === 1}
                                                    onClick={() => setCurrentPage(p => p - 1)}
                                                >
                                                    <ChevronLeft className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={currentPage === totalPages || totalPages === 0}
                                                    onClick={() => setCurrentPage(p => p + 1)}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Acciones de Exportación */}
                                        <div className="p-6 flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-950 rounded-b-xl border-b border-l border-r border-indigo-100 dark:border-indigo-900">
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-700 dark:text-white group"
                                                onClick={() => handleExport('PDF')}
                                            >
                                                <FileText className="w-5 h-5 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                                                Exportar a PDF Profesional
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:border-emerald-800 dark:text-emerald-400 group"
                                                onClick={() => handleExport('Excel')}
                                            >
                                                <FileSpreadsheet className="w-5 h-5 mr-3 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                                                Exportar a Excel
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
