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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Shield, User, Mail, Lock, Settings, UserCheck } from "lucide-react"
import { toast } from 'react-toastify'

interface Usuario {
    id_usuario: number
    nombre: string
    usuario: string
    rol: string
    estado: string // 'activo', 'inactivo'
}

export default function UsuariosPage() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    const [formData, setFormData] = useState({
        nombre: "",
        usuario: "",
        password: "",
        rol: "vendedor"
    })

    useEffect(() => {
        fetchUsuarios()
    }, [])

    const fetchUsuarios = async () => {
        try {
            const res = await fetch("/api/usuarios")
            const data = await res.json()
            if (res.ok) {
                setUsuarios(data)
            } else {
                toast.error(data.message || "Error al cargar usuarios")
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            toast.error("Error de conexión al cargar usuarios")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async () => {
        if (!formData.nombre || !formData.usuario || !formData.password || !formData.rol) {
            toast.warning("Por favor complete todos los campos")
            return
        }

        try {
            const res = await fetch("/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            const data = await res.json()

            if (res.ok && data.success) {
                toast.success("Usuario creado con éxito")
                setIsCreateModalOpen(false)
                setFormData({
                    nombre: "",
                    usuario: "",
                    password: "",
                    rol: "vendedor"
                })
                fetchUsuarios()
            } else {
                toast.error(data.message || "Error al crear usuario")
            }
        } catch (error) {
            console.error("Error creating user:", error)
            toast.error("Error de conexión al crear usuario")
        }
    }

    const filteredUsers = usuarios.filter(u => 
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.usuario.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">Administrador</Badge>
            case 'vendedor': return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Ventas (POS)</Badge>
            case 'almacen': return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Almacenero</Badge>
            case 'tecnico': return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/50">Técnico</Badge>
            default: return <Badge variant="outline">{role}</Badge>
        }
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
                                <Shield className="text-purple-400" /> Control de Accesos
                            </h1>
                        </div>
                    </header>

                    <div className="p-6">
                        <div className="max-w-5xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div className="relative w-full max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                                    <Input 
                                        placeholder="Buscar usuario o nombre..." 
                                        className="pl-10 bg-slate-900 border-slate-800 shadow-inner"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
                                            <Plus className="w-4 h-4 mr-2" /> Agregar Usuario
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                                        <DialogHeader>
                                            <DialogTitle>Crear Usuario de Sistema</DialogTitle>
                                            <DialogDescription>Asigne un rol y credenciales para el nuevo personal</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label>Nombre Completo</Label>
                                                <Input className="bg-slate-800 border-slate-700" placeholder="Ej: Maria Lopez" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Nombre de Usuario</Label>
                                                    <Input className="bg-slate-800 border-slate-700" placeholder="marial" value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Contraseña</Label>
                                                    <Input type="password" className="bg-slate-800 border-slate-700" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Rol en el Sistema</Label>
                                                <Select value={formData.rol} onValueChange={v => setFormData({...formData, rol: v})}>
                                                    <SelectTrigger className="bg-slate-800 border-slate-700">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                                                        <SelectItem value="vendedor">Vendedor (Punto de Venta)</SelectItem>
                                                        <SelectItem value="almacen">Almacenero (Inventario)</SelectItem>
                                                        <SelectItem value="tecnico">Técnico (Servicios)</SelectItem>
                                                        <SelectItem value="admin">Administrador General</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancelar</Button>
                                            <Button onClick={handleCreateUser} className="bg-purple-600 hover:bg-purple-700">Crear Acceso</Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <Card className="bg-slate-900 border-slate-800 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-800/50">
                                        <TableRow className="border-slate-800">
                                            <TableHead className="w-[300px]">Colaborador</TableHead>
                                            <TableHead>Id de Usuario</TableHead>
                                            <TableHead>Rol Asignado</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Ajustes</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-500">Buscando usuarios...</TableCell></TableRow>
                                        ) : filteredUsers.map(u => (
                                            <TableRow key={u.id_usuario} className="border-slate-800 hover:bg-slate-800/20 group transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-9 w-9 border border-slate-700">
                                                            <AvatarFallback className="bg-slate-800 text-purple-400 font-bold">
                                                                {u.nombre.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-semibold text-slate-200">{u.nombre}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-slate-400">{u.usuario}</TableCell>
                                                <TableCell>{getRoleBadge(u.rol)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                        En línea
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-white">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                            
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-900/50 border-slate-800 border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-slate-500" /> Seguridad de Cuentas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs text-slate-500 leading-relaxed">
                                        Se recomienda cambiar las contraseñas cada 90 días. Los administradores pueden restablecer accesos bloqueados por intentos fallidos.
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900/50 border-slate-800 border-dashed">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <UserCheck className="w-4 h-4 text-slate-500" /> Monitoreo de sesión
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-xs text-slate-500 leading-relaxed">
                                        Usted está viendo a los usuarios con permisos de escritorio. Solo los administradores pueden gestionar otros perfiles administrativos.
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
