"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, Loader2, Building, Image as ImageIcon } from "lucide-react"
import { toast } from "react-toastify"
import Image from "next/image"

export default function ConfigPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        nombre: "",
        ruc: "",
        direccion: "",
        telefono: "",
        email: "",
        logo_url: "/tufibra_logo.webp",
        moneda: "PEN",
        igv_porcentaje: 18.00,
        mensaje_ticket: ""
    })

    useEffect(() => {
        fetchDatosEmpresa()
    }, [])

    const fetchDatosEmpresa = async () => {
        try {
            const res = await fetch("/api/empresa")
            if (res.ok) {
                const data = await res.json()
                if (data && data.nombre) {
                    setFormData({
                        nombre: data.nombre || "",
                        ruc: data.ruc || "",
                        direccion: data.direccion || "",
                        telefono: data.telefono || "",
                        email: data.email || "",
                        logo_url: data.logo_url || "/tufibra_logo.webp",
                        moneda: data.moneda || "PEN",
                        igv_porcentaje: data.igv_porcentaje || 18.00,
                        mensaje_ticket: data.mensaje_ticket || ""
                    })
                }
            }
        } catch (error) {
            console.error("Error loading empresa data:", error)
            toast.error("Error al cargar configuración")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch("/api/empresa", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            if (res.ok) {
                toast.success("Configuración de empresa actualizada")
            } else {
                toast.error("Error al actualizar configuración")
            }
        } catch (error) {
            console.error("Error saving empresa:", error)
            toast.error("Error al actualizar configuración")
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="min-h-screen bg-gradient-to-br from-slate-100 dark:from-black via-slate-50 dark:via-gray-900 to-white dark:to-slate-900">
                    <header className="flex h-16 w-full items-center border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4 text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <h1 className="text-xl font-semibold">Configuración de la Empresa</h1>
                        </div>
                    </header>

                    <div className="p-6 max-w-4xl mx-auto">
                        <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Building className="h-6 w-6 text-blue-500" />
                                    <div>
                                        <CardTitle className="text-slate-900 dark:text-white">Datos del Negocio</CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400">
                                            Actualiza la información básica que aparecerá en los tickets y el sistema
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="nombre">Nombre de la Empresa</Label>
                                                    <Input
                                                        id="nombre"
                                                        name="nombre"
                                                        required
                                                        value={formData.nombre}
                                                        onChange={handleChange}
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="ruc">RUC / NIT</Label>
                                                    <Input
                                                        id="ruc"
                                                        name="ruc"
                                                        value={formData.ruc}
                                                        onChange={handleChange}
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="telefono">Teléfono</Label>
                                                    <Input
                                                        id="telefono"
                                                        name="telefono"
                                                        value={formData.telefono}
                                                        onChange={handleChange}
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">Correo Electrónico</Label>
                                                    <Input
                                                        id="email"
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="moneda">Moneda Base (Ej. PEN, USD)</Label>
                                                    <Input
                                                        id="moneda"
                                                        name="moneda"
                                                        value={formData.moneda}
                                                        onChange={handleChange}
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="direccion">Dirección</Label>
                                                    <Textarea
                                                        id="direccion"
                                                        name="direccion"
                                                        value={formData.direccion}
                                                        onChange={handleChange}
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 min-h-[110px]"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="mensaje_ticket">Mensaje al final del Ticket</Label>
                                                    <Textarea
                                                        id="mensaje_ticket"
                                                        name="mensaje_ticket"
                                                        value={formData.mensaje_ticket}
                                                        onChange={handleChange}
                                                        placeholder="¡Gracias por su compra!"
                                                        className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700 min-h-[110px]"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="logo_url">Ruta / URL del Logo</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="logo_url"
                                                            name="logo_url"
                                                            value={formData.logo_url}
                                                            onChange={handleChange}
                                                            className="bg-slate-100 dark:bg-slate-900/50 border-slate-300 dark:border-slate-700"
                                                        />
                                                        <Button type="button" variant="outline" size="icon" className="shrink-0 border-slate-300 dark:border-slate-700 bg-slate-200 dark:bg-slate-800">
                                                            <ImageIcon className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-slate-300 dark:border-slate-700">
                                            <Button
                                                type="submit"
                                                disabled={saving}
                                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Guardar Cambios
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
