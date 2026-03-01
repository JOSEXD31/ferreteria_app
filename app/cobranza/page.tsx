"use client"

import { useState, useEffect, use } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table"
import Link from "next/link"
import { Navbar } from "@/components/navarcobranza"
import DetalleModal from "@/components/cobranza/detallereporte" // <- Nuevo componente
import { format } from "date-fns"



import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Search, TrendingDown, TrendingUp, CreditCard, CopyX, Eye, MapPinIcon, BriefcaseIcon, PlusCircle, IdCard } from "lucide-react"
import { toast } from 'react-toastify';


import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";




interface pagos {
  cod_comprobante: string
  id_tipo_comprobante: string
  serie: string
  correlativo: number
  fecha_emision: Date
  monto_total: number
  medio_pago: "efectivo" | "yape" | "transferencia"
  estado: string
  num_con: string
  id_per_oficina: string
  duedas_ids: string[]
}

type deuda = {
  id_deuda: number
  ano_mes: string
  descripcion: string
  monto: number
  saldo_pendiente: number
  fecha_creacion: Date
  num_con: string
  estado: string
  contrato?: {
    estado: number | null
  }
}

type ingresoPrevisto = {
  mes_ano: string
  monto: number
}

export default function ClientsPage() {

  const [openModal, setOpenModal] = useState(false);
  const [pagos, setPagos] = useState<pagos[]>([]);
  const [deudas, setDeudas] = useState<deuda[]>([])
  const [ingresoPrevisto, setIngresoPrevisto] = useState<ingresoPrevisto[]>([])


  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [detalleReporte, setDetalleReporte] = useState<any[]>([])

  const [userRole, setUserRole] = useState("");




  //Carga de pagos
  const fetchPagos = async () => {
    try {
      const res = await fetch("/api/caja/pagos");
      if (!res.ok) {
        console.error("Error al obtener información de los pagos:", res.status);
        return;
      }
      const data = await res.json();
      setPagos(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  //Carga de deudas
  const fetchDeudas = async () => {
    try {
      const res = await fetch("/api/caja/deudasParaCobranza");
      if (!res.ok) {
        console.error("Error al obtener información de las deudas:", res.status);
        return;
      }
      const data = await res.json();
      setDeudas(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  //Carga ingreso previsto
  const fetchIngresoPrevisto = async () => {
    try {
      const res = await fetch("/api/caja/ingreso_previsto");
      if (!res.ok) {
        toast.error("Error a al obtener datos desde la API")
      }
      const data = await res.json();
      setIngresoPrevisto(data);
    } catch (err) {
      toast.error("Error al cargar monto previsto")
    }
  };

  useEffect(() => {
    fetchDeudas();
    fetchPagos();
    fetchIngresoPrevisto();
    setUserRole(localStorage.getItem("userRole") || "")
  }, []);


  const abrirDetalle = async () => {
    try {
      const hoy = format(new Date(), "yyyy-MM-dd")

      const res = await fetch("/api/caja/reportexfechadet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ desde: hoy, hasta: hoy }),
      })

      const data = await res.json()
      setDetalleReporte(data)
      setDetalleAbierto(true)
    } catch (err) {
      console.error("Error al obtener detalle:", err)
    }
  }

  const todayLocal = new Date().toLocaleDateString("en-CA"); // yyyy-mm-dd

  // ADMIN - MÉTRICAS
  const deudasActivas = deudas.filter(
    (d) => (d.estado === "ACTIVO" || d.estado === "RESTANTE") && d.contrato?.estado === 1
  );

  const deudasAnuladas = deudas.filter((d) => d.estado === "ANULADO");

  const totalPorCobrar = Math.round(deudasActivas.reduce((sum, d) => sum + Number(d.saldo_pendiente), 0) * 100) / 100;
  // PAGOS DE HOY (para ambos roles)
  const pagosHoy = pagos.filter((p) => {
    const fechaPago = new Date(p.fecha_emision).toLocaleDateString("en-CA");
    return p.estado !== "ANULADO" && fechaPago === todayLocal;
  });

  const ingresosHoy = Math.round(pagosHoy.reduce((sum, p) => sum + Number(p.monto_total), 0) * 100) / 100;

  const ingresosPorMedio = pagosHoy.reduce(
    (acc, p) => {
      acc[p.medio_pago] = (acc[p.medio_pago] || 0) + Number(p.monto_total);
      return acc;
    },
    {} as Record<"efectivo" | "yape" | "transferencia", number>
  );


  const data = Object.entries(ingresosPorMedio).map(([medio, total]) => ({
    medio,
    total: Math.round(total * 10) / 10,
  }));



  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">

            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Cobranza</h1>
            </div>
            <Navbar />

          </header>

          <div className="p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardContent className="container mx-auto px-4 py-4">

                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-100 mb-2">Bienvenido!</h1>
                  <p className="text-gray-400">Resumen de panel de cobranza</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {userRole === "ADMINISTRADOR" && (
                    <>
                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Deudas Activas</CardTitle>
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-white">{deudasActivas.length}</div>
                          <p className="text-xs text-gray-400">Estado: ACTIVO / RESTANTE</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Deudas Anuladas</CardTitle>
                          <CopyX className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-500">{deudasAnuladas.length}</div>
                          <p className="text-xs text-gray-400">Marcadas como ANULADO</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800/50 border-gray-700">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium text-white">Total por Cobrar</CardTitle>
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-500">S/ {totalPorCobrar}</div>
                          <p className="text-xs text-gray-400">Saldo pendiente total</p>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {/* Esto va para ambos */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-white">Ingresos Hoy</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">S/ {ingresosHoy}</div>
                      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <p className="text-xs text-gray-400">{pagosHoy.length} pagos procesados</p>
                        <Button onClick={abrirDetalle} className="bg-gray-500/10 hover:bg-gray-700">
                          <Eye />Ver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-white">Ingreso Previsto</CardTitle>
                    </CardHeader>
                    {ingresoPrevisto.map((item, i) => {
                      const prev = ingresoPrevisto[i - 1];
                      const isUp = prev ? item.monto >= prev.monto : null;
                      const Icon =
                        isUp === null
                          ? null
                          : isUp
                            ? TrendingUp
                            : TrendingDown;
                      const iconColor = isUp ? "text-green-500" : "text-red-600";

                      return (
                        <CardContent key={i}>
                          <p className="text-xm flex text-gray-400 gap-6 items-center">
                            {item.mes_ano}
                            {Icon && <Icon className={`${iconColor} h-4 w-4`} />}
                          </p>
                          <div className="text-2xl font-bold text-blue-500">
                            S/ {item.monto.toLocaleString()}
                          </div>
                        </CardContent>
                      );
                    })}
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Search className="h-5 w-5 mr-2" />
                        Procesar Pago
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Buscar cliente y procesar pagos de servicios
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/cobranza/pagos">
                        <Button className="w-full bg-white text-black hover:bg-gray-600 hover:text-white">Ir a pagos</Button>
                      </Link>
                    </CardContent>
                  </Card>
                  <Card className="col-span-1 md:col-span-2 bg-gray-800/50 border-gray-700">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-white text-sm">Ingresos por Medio de Pago (Hoy)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data}>
                          <XAxis dataKey="medio" stroke="#ccc" />
                          <YAxis stroke="#ccc" />
                          <Tooltip />
                          <Bar dataKey="total" radius={[5, 5, 0, 0]}>
                            {data.map((entry, index) => {
                              let fillColor = "#22c55e"; // verde por defecto (efectivo)

                              if (entry.medio === "yape") fillColor = "#a855f7";         // morado
                              else if (entry.medio === "transferencia") fillColor = "#3b82f6"; // azul

                              return <Cell key={`cell-${index}`} fill={fillColor} />;
                            })}
                          </Bar>
                        </BarChart>

                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                </div>

              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal separado */}
        <DetalleModal
          abierto={detalleAbierto}
          onClose={() => setDetalleAbierto(false)}
          datos={detalleReporte}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
