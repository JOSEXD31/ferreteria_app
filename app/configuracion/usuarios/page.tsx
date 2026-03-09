"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Search, Shield, Lock, UserCheck, Edit, Trash2 } from "lucide-react"
import { toast } from 'react-toastify'
import { ConfigHeader } from "@/components/config-header"

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
    const [editingUser, setEditingUser] = useState<Usuario | null>(null)

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
        if (!formData.nombre || !formData.usuario || !formData.rol) {
            toast.warning("Por favor complete todos los campos obligatorios")
            return
        }

        if (!editingUser && !formData.password) {
            toast.warning("La contraseña es obligatoria para nuevos usuarios")
            return
        }

        try {
            const method = editingUser ? "PUT" : "POST"
            const body = editingUser ? { ...formData, id_usuario: editingUser.id_usuario } : formData

            const res = await fetch("/api/usuarios", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
            const data = await res.json()

            if (res.ok && data.success) {
                toast.success(editingUser ? "Usuario actualizado con éxito" : "Usuario creado con éxito")
                setIsCreateModalOpen(false)
                resetForm()
                fetchUsuarios()
            } else {
                toast.error(data.message || "Error al procesar la solicitud")
            }
        } catch (error) {
            console.error("Error saving user:", error)
            toast.error("Error de conexión al guardar usuario")
        }
    }

    const resetForm = () => {
        setEditingUser(null)
        setFormData({
            nombre: "",
            usuario: "",
            password: "",
            rol: "vendedor"
        })
    }

    const handleEdit = (u: Usuario) => {
        setEditingUser(u)
        setFormData({
            nombre: u.nombre,
            usuario: u.usuario,
            password: "",
            rol: u.rol
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: number) => {
        if (!confirm("¿Está seguro de desactivar este usuario?")) return;
        try {
            const res = await fetch(`/api/usuarios?id=${id}`, {
                method: "DELETE"
            })
            const data = await res.json()
            if (res.ok && data.success) {
                toast.success("Usuario desactivado correctamente")
                fetchUsuarios()
            } else {
                toast.error(data.message || "Error al desactivar usuario")
            }
        } catch (error) {
            console.error("Error deleting user:", error)
            toast.error("Error de conexión")
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
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col">
                    <ConfigHeader />

                    <div className="p-6 max-w-5xl mx-auto space-y-6 w-full flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
                                <Input
                                    placeholder="Buscar usuario..."
                                    className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-inner"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                                if (!open) resetForm();
                                setIsCreateModalOpen(open);
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20">
                                        <Plus className="w-4 h-4 mr-2" /> Agregar Usuario
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                                    <DialogHeader>
                                        <DialogTitle>{editingUser ? "Editar Usuario" : "Crear Usuario de Sistema"}</DialogTitle>
                                        <DialogDescription>{editingUser ? "Modifique los datos del usuario. Deje la contraseña en blanco para no cambiarla." : "Asigne un rol y credenciales para el nuevo personal"}</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Nombre Completo</Label>
                                            <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="Ej: Maria Lopez" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Nombre de Usuario</Label>
                                                <Input className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="marial" value={formData.usuario} onChange={e => setFormData({ ...formData, usuario: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Contraseña</Label>
                                                <Input type="password" className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Rol en el Sistema</Label>
                                            <Select value={formData.rol} onValueChange={v => setFormData({ ...formData, rol: v })}>
                                                <SelectTrigger className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white">
                                                    <SelectItem value="vendedor">Vendedor (Punto de Venta)</SelectItem>
                                                    <SelectItem value="almacen">Almacenero (Inventario)</SelectItem>
                                                    <SelectItem value="tecnico">Técnico (Servicios)</SelectItem>
                                                    <SelectItem value="admin">Administrador General</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => { setIsCreateModalOpen(false); resetForm(); }}>Cancelar</Button>
                                        <Button onClick={handleCreateUser} className="bg-purple-600 hover:bg-purple-700">{editingUser ? "Guardar Cambios" : "Crear Acceso"}</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 overflow-hidden">
                            <CardHeader className="bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-6 w-6 text-purple-500" />
                                    <div>
                                        <CardTitle className="text-slate-900 dark:text-white font-bold">Control de Accesos</CardTitle>
                                        <CardDescription className="text-slate-500 dark:text-slate-400">Gestiona los permisos y cuentas del personal</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <Table>
                                <TableHeader className="bg-slate-200/50 dark:bg-slate-800/50">
                                    <TableRow className="border-slate-200 dark:border-slate-800">
                                        <TableHead className="w-[300px]">Colaborador</TableHead>
                                        <TableHead>Id de Usuario</TableHead>
                                        <TableHead>Rol Asignado</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Ajustes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-10 text-slate-400 dark:text-slate-500">Buscando usuarios...</TableCell></TableRow>
                                    ) : filteredUsers.map(u => (
                                        <TableRow key={u.id_usuario} className="border-slate-200 dark:border-slate-800 hover:bg-slate-200/20 dark:bg-slate-800/20 group transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-slate-300 dark:border-slate-700">
                                                        <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-purple-400 font-bold">
                                                            {u.nombre.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{u.nombre}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-slate-400 dark:text-slate-500">{u.usuario}</TableCell>
                                            <TableCell>{getRoleBadge(u.rol)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs text-emerald-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                                    En línea
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(u)} className="h-8 w-8 text-blue-400 hover:text-blue-300">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id_usuario)} className="h-8 w-8 text-red-400 hover:text-red-300">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                            <Card className="bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 border-dashed">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Seguridad de Cuentas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Se recomienda cambiar las contraseñas cada 90 días. Los administradores pueden restablecer accesos bloqueados por intentos fallidos.
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 border-dashed">
                                <CardHeader>
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" /> Monitoreo de sesión
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                                    Usted está viendo a los usuarios con permisos de escritorio. Solo los administradores pueden gestionar otros perfiles administrativos.
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
