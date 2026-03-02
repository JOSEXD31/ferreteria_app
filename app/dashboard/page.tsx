"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { PieChart, Pie, Cell, Tooltip, Legend, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid, BarChart } from 'recharts'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Package, ShoppingCart, Wrench, AlertTriangle, TrendingUp, Calendar } from "lucide-react"

export default function DashboardPage() {
  const [userRole, setUserRole] = useState("")
  const [username, setUsername] = useState("")
  const [metrics, setMetrics] = useState({
    totalClientes: 0,
    ventasHoy: 0,
    stockBajo: 0,
    trabajosPendientes: 0
  })
  const [ventasCategoria, setVentasCategoria] = useState<{ name: string; value: number }[]>([])
  const [tendenciaIngresos, setTendenciaIngresos] = useState<{ date: string; amount: number }[]>([])
  const [stockTop, setStockTop] = useState<{ name: string; stock: number }[]>([])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setUsername(localStorage.getItem("username") || "")
    
    // Simular carga de métricas (luego crear APIs)
    const fetchMetrics = async () => {
      // Por ahora datos estáticos para visualizar el cambio
      setMetrics({
        totalClientes: 124,
        ventasHoy: 1540.50,
        stockBajo: 8,
        trabajosPendientes: 5
      })
      
      setVentasCategoria([
        { name: 'Herramientas', value: 400 },
        { name: 'Pinturas', value: 300 },
        { name: 'Electricidad', value: 300 },
        { name: 'Construcción', value: 200 },
      ])

      setTendenciaIngresos([
        { date: 'Lun', amount: 1200 },
        { date: 'Mar', amount: 1900 },
        { date: 'Mie', amount: 1500 },
        { date: 'Jue', amount: 2100 },
        { date: 'Vie', amount: 2400 },
        { date: 'Sab', amount: 1800 },
        { date: 'Dom', amount: 500 },
      ])

      setStockTop([
        { name: 'Martillo Galp.', stock: 15 },
        { name: 'Cinta Métrica', stock: 4 },
        { name: 'Taladro Perc.', stock: 2 },
        { name: 'Pintura Blanca 1G', stock: 20 },
      ])
    }
    fetchMetrics()
  }, [])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-slate-100 dark:from-black via-slate-50 dark:via-gray-900 to-white dark:to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-300 dark:border-slate-700 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-slate-900 dark:text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Ferretería - Dashboard</h1>
              <p className="text-sm text-slate-700 dark:text-slate-300">Bienvenido, {username} (Rol: {userRole})</p>
            </div>
          </header>
          
          <div className="flex-1 space-y-6 p-4 sm:p-6">
            {/* Estadísticas rápidas hardware store */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
              <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ventas Hoy</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">S/ {metrics.ventasHoy.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider">Stock Bajo</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.stockBajo} Artíc.</p>
                    </div>
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider">Servicios / Trabajos</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.trabajosPendientes}</p>
                    </div>
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Wrench className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clientes</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.totalClientes}</p>
                    </div>
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Gráfico de Ventas por Categoría */}
              <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Ventas por Categoría</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={ventasCategoria}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {ventasCategoria.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico de Tendencia de Ingresos */}
              <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white">Ingresos Semanales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={tendenciaIngresos}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="amount" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: '#38bdf8' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Alertas de Inventario */}
            <Card className="bg-slate-200/40 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5" /> Revisión de Stock Crítico
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {stockTop.map((item, i) => (
                    <div key={i} className="flex flex-col p-3 rounded-lg bg-slate-100/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700">
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400 dark:text-slate-500">Stock Actual</span>
                        <Badge variant={item.stock < 5 ? "destructive" : "secondary"}>
                          {item.stock} unidades
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
