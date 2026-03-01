"use client"

import { useState, useEffect, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navarcobranza"
import { useSearchParams } from "next/navigation"
//import { customers, debts, payments, users } from "@/lib/database"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Receipt, Search, CheckCircle, Calculator, CreditCard, ArrowLeft, Printer, Download, ArrowRight
  , AlertTriangle, User
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { ReceiptPreview } from "@/components/receipt-preview"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"

import { toast } from 'react-toastify';

type tipo_comprobante = {
  id_tipo: number
  tipo: string
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
}

type detallePago = {
  id_deuda: number
  ano_mes: string
  descripcion: string
  monto: number
  saldo_pendiente: number
  fecha_creacion: Date
  num_con: string
  estado: string
}

interface Debt {
  id: string
  customerId: string
  serviceId: string
  amount: number
  dueDate: Date
  month: string // "2024-01", "2024-02", etc.
  year: number
  status: "pending" | "partial" | "paid" | "overdue"
  remainingAmount: number
  description: string
}

interface Service {
  id: string
  customerId: string
  type: "cable" | "internet" | "combo"
  plan: string
  monthlyAmount: number
  installationDate: Date
  status: "active" | "suspended" | "cancelled"
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  dni: string
  services: Service[]
  createdAt: Date
  status: "active" | "inactive" | "suspended"
}
interface Payment {
  id: string
  customerId: string
  debtIds: string[]
  amount: number
  paymentMethod: "efectivo" | "yape" | "transferencia"
  receiptType: "boleta" | "factura" | "recibo"
  receiptNumber: string
  paymentDate: Date
  cashierId: string
  notes?: string
}

interface Client {
  cli_id: string
  cli_tipo: string
  cli_nombre: string
  cli_apellido: string
  cli_razonsoci: string
  cli_dni: string
  cli_ruc: string
  cli_direccion: string
  cli_coordenada: string
  cli_cel: string
  num_con: string
  serv_nombre: string
  fecha_registro: string
  fecha_inicio: string
  estado: string
  usu_nombre: string
  id_tipo_comprobante: number
}
interface Payment {
  id: string
  customerId: string
  debtIds: string[]
  amount: number
  paymentMethod: "efectivo" | "yape" | "transferencia"
  receiptType: "boleta" | "factura" | "recibo"
  receiptNumber: string
  paymentDate: Date
  cashierId: string
  notes?: string
}

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
  detalle_pago: {
    descripcion: string
    monto: number
    descuento: number
  }[]
}




type PaymentStep = "search" | "select-debts" | "payment-details" | "confirmation"

interface SelectedDebt {
  debt: Debt
  amountToPay: number
  selected: boolean
}


export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [deudas, setDeudas] = useState<deuda[]>([])

  const [pagos, setPagos] = useState<pagos[]>([])
  const [detallePago, setDetallePago] = useState<detallePago[]>([]);


  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");




  function searchClientes(query: string): Client[] {
    if (!query.trim()) return clients

    const searchTerm = query.toLowerCase()
    return clients.filter(
      (clientes) =>
        clientes.cli_nombre.toLowerCase().includes(searchTerm) ||
        clientes.cli_apellido.toLowerCase().includes(searchTerm) ||
        clientes.cli_dni.includes(searchTerm) ||
        clientes.cli_ruc.includes(searchTerm) ||
        clientes.cli_razonsoci.toLowerCase().includes(searchTerm),
    )
  }

  //Carga de clientes y contratos
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/cliente/clienteContrato");
      if (!res.ok) {
        console.error("Error al obtener información de los clientes:", res.status);
        return;
      }
      const data = await res.json();
      setClients(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };


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

  useEffect(() => {
    fetchClients();
    fetchPagos();
  }, []);

  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get("customer")
  const receiptRef = useRef<HTMLDivElement>(null)

  const [currentStep, setCurrentStep] = useState<PaymentStep>("search")
  const [searchQuery, setSearchQuery] = useState("")


  const [error, setError] = useState("")

  //  const customers = searchCustomers(searchQuery)
  const clientes_filtrados = searchClientes(searchQuery)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedPagos, setSelectedPagos] = useState<pagos[]>([])

  // Cargar deudas cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      const pagos = getPagosCliente(selectedClient.num_con)
      const pagossSelection = pagos
        .filter((pag) => pag.estado !== "ANULADO")
      setSelectedPagos(pagossSelection)
    }
  }, [selectedClient])

  function getPagosCliente(num_con: string): pagos[] {
    return pagos
      .filter((pag) => pag.num_con === num_con)
      .sort((a, b) => new Date(a.fecha_emision).getTime() - new Date(b.fecha_emision).getTime())
  }

  const handleClienteSelect = (cliente: Client) => {
    setSelectedClient(cliente)
    setCurrentStep("select-debts")
    setError("")
  }


  const resetearselectedPagos = () => {
    const updated = selectedPagos.map((deuda) => ({
      ...deuda,
      selected: false,
      amountToPay: 0,
    }));

    setSelectedPagos(updated);
  };
  function montoALetras(monto: number): string {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    });

    const [entero, decimal] = formatter.format(monto).replace("S/", "").trim().split(",");
    const num = parseInt(entero.replace(/\./g, ''));
    const dec = parseInt(decimal || "00");

    // Puedes usar una librería si prefieres, esto es un placeholder:
    return `*** ${entero} CON ${dec < 10 ? '0' + dec : dec}/100 SOLES ***`;
  }


  function formatearFechaUTCString(fechaUTC: string): string {
    const [fecha, hora] = fechaUTC.split("T");
    const [year, month, day] = fecha.split("-");
    const horaLimpiada = hora.slice(0, 8); // elimina los milisegundos y la Z

    return `${day}/${month}/${year} ${horaLimpiada}`;
  }


  const handlePrintReceipt = async (cod_comprobante_rein: string) => {
    try {

      const res = await fetch(`/api/caja/impresion?cod_comprobante=${cod_comprobante_rein}`);
      const data = await res.json();

      if (!data || data.message) {
        alert("Error al obtener los datos del comprobante");
        return;
      }

      const {
        cod_comprobante,
        fecha_emision,
        monto_total,
        cliente,
        detalles_pago,
        medio_pago,
        cajero,
        tipo_comprobante,
      } = data;

      const isNatural = cliente.cli_tipo === "NATURAL";
      const nombreCliente = isNatural
        ? `${cliente.cli_nombre || ""} ${cliente.cli_apellido || ""}`.trim()
        : cliente.cli_razonsoci;
      const documento = isNatural ? cliente.cli_dni : cliente.cli_ruc;

      const fechaFormateada = formatearFechaUTCString(data.fecha_emision);


      const printWindow = window.open('', '', 'width=400,height=600');

      if (printWindow) {
        printWindow.document.write(`
        <html>
          <head>
            <title>Comprobante</title>
            <style>
              @page {
                size: 80mm auto; /* Ajusta al tamaño de tu papel (ej: 80mm ancho de rollo térmico) */
                margin: 0; /* Elimina márgenes de impresión */
              }
              body {
                font-family: Arial, sans-serif;
                width: 80mm; /* ancho estándar boleta térmica */
                margin: 0; /* elimina márgenes laterales */
                padding: 5px; /* pequeño padding interno */
                font-size: 14px; /* sube tamaño de letra */
              }
              .center {
                text-align: center;
              }
              .bold {
                font-weight: bold;
              }
              .section {
                margin: 8px 0;
              }
              .table {
                width: 100%;
                border-collapse: collapse;
                font-size: 13px;
              }
              .table th, .table td {
                text-align: left;
                padding: 3px 0;
              }
              .line {
                border-top: 1px dashed #000;
                margin: 5px 0;
              }
            </style>
          </head>
          <body>
            <div class="center bold">CARMONA LEON LUILLY PAOL</div>
            <div class="center bold">10434642341</div>
            <div class="center">A.H. SOL NACIENTE MZ. F LT. 01</div>
            <div class="center">Telf: 935671661</div>
            
            <div class="line"></div>
            <div class="center bold">${tipo_comprobante.toUpperCase()} ELECTRÓNICA</div>
            <div class="center bold">${cod_comprobante}</div>
            <div class="center">${fechaFormateada}</div>
            <div class="line"></div>
            <div><strong>Cód. Abonado:</strong> ${cliente.cli_id}</div>
            <div><strong>${isNatural ? 'DNI' : 'RUC'}:</strong> ${documento}</div>
            <div><strong>Cliente:</strong> ${nombreCliente}</div>
            <div><strong>Dirección:</strong> ${cliente.cli_direccion}</div>
            <div><strong>Medio de Pago:</strong> ${(data.medio_pago).toUpperCase()}</div>
            <div class="line"></div>
            <table class="table">
              <thead>
                <tr>
                  <th style="text-align: left;">Cant.</th>
                  <th style="text-align: left;">Descripción</th>
                  <th style="text-align: right;">Importe</th>
                </tr>
              </thead>
              <tbody>
                ${detalles_pago.map((item: { descripcion: string; monto: number; descuento?: number }) => `
                  <tr>
                    <td>01</td>
                    <td>
                      ${item.descripcion}
                      ${item.descuento && Number(item.descuento) > 0 ? `<br/><span style="font-size: 11px; font-style: italic;">(Desc: S/ ${Number(item.descuento).toFixed(2)})</span>` : ''}
                    </td>
                    <td style="text-align: right;">S/. ${Number(item.monto).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="line"></div>
            <div style="text-align: right; font-weight: bold; margin-top: 5px;">
              Total: S/. ${Number(monto_total).toFixed(2)}
            </div>
            <div><strong>Son:</strong> ${montoALetras(Number(monto_total))}</div>
            <div class="center"><strong>Cajero:</strong> ${cajero}</div>
            <div class="line"></div>

            <div class="center" style="margin-top: 8px;">
              <img src="/logo_impresion.webp" alt="Logo" width="100" />
            </div>
          </body>
        </html>

      `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        alert("No se pudo abrir la ventana de impresión.");
      }

    } catch (error) {
      console.error("Error al imprimir:", error);
      alert("Error al imprimir el comprobante.");
    }
  };

  const renderSearchStep = () => (
    <div className="space-y-6">
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            Buscar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nombre, DNI, teléfono o email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-white"
              />
            </div>

            {searchQuery.trim() && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {clientes_filtrados.length > 0 ? (
                  clientes_filtrados.map((clientes) => (
                    <div
                      key={clientes.num_con}
                      className="p-4 rounded-md border border-gray-700 bg-gray-800/50 hover:bg-gray-600 cursor-pointer transition-colors"
                      onClick={() => handleClienteSelect(clientes)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {clientes.cli_tipo === "NATURAL" ? (
                            <>
                              <h3 className="font-medium text-gray-100">
                                {clientes.cli_nombre} {clientes.cli_apellido}
                              </h3>
                              <p className="text-sm text-gray-400">
                                DNI: {clientes.cli_dni} | Tel: {clientes.cli_cel}
                              </p>
                            </>
                          ) : (
                            <>
                              <h3 className="font-medium text-gray-100">
                                {clientes.cli_razonsoci}
                              </h3>
                              <p className="text-sm text-gray-400">
                                RUC: {clientes.cli_ruc} | Tel: {clientes.cli_cel}
                              </p>
                            </>
                          )}
                          <p className="text-sm text-gray-400">{clientes.cli_direccion}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              clientes.estado === "1"
                                ? "success"
                                : clientes.estado === "0"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {clientes.estado === "1"
                              ? "Activo"
                              : clientes.estado === "0"
                                ? "Cortado"
                                : "Inactivo"}
                          </Badge>
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron clientes</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderPagos = () => (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card className="rounded-md border-none bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Cliente Seleccionado
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentStep("search");
                resetearselectedPagos();
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {selectedClient?.cli_tipo === "NATURAL" ? (
                <>
                  <h2 className="font-semibold text-lg text-gray-100">
                    {selectedClient?.cli_nombre} {selectedClient?.cli_apellido}
                  </h2>
                  <p className="text-gray-300">DNI: {selectedClient?.cli_dni}</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg text-gray-100">
                    {selectedClient?.cli_razonsoci}
                  </h3>
                  <p className="text-gray-300">RUC: {selectedClient?.cli_ruc}</p>
                </>
              )}
              <p className="text-gray-300">CEL: {selectedClient?.cli_cel}</p>
            </div>
            <div>
              <p className="text-gray-300">SERVICIO: {selectedClient?.serv_nombre}</p>
              <p className="text-gray-300">DIRECCION: {selectedClient?.cli_direccion}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Pagos Realizados */}
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="text-gray-100">Pagos Realizados</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPagos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay pagos registrados para este cliente.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-300">
                <thead className="bg-gray-700 text-gray-200">
                  <tr>
                    <th className="px-4 py-2">N° Comprobante</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Detalle</th>
                    <th className="px-4 py-2">Medio de Pago</th>
                    <th className="px-4 py-2">Monto Total</th>
                    <th className="px-4 py-2">Reeimprimir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {selectedPagos.map((pago) => (
                    <tr key={pago.cod_comprobante}>
                      <td className="px-4 py-2 align-top">
                        {pago.serie}-{pago.correlativo.toString().padStart(6, "0")}
                      </td>
                      <td className="px-4 py-2 align-top">
                        {pago.fecha_emision.toString().replace("T", " ").replace(".000Z", "")}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <ul className="list-disc list-inside space-y-1">
                          {pago.detalle_pago?.map((detalle, idx) => (
                            <li key={idx} className="text-xs">
                              {detalle.descripcion}
                              <span className="text-gray-400"> (S/ {Number(detalle.monto).toFixed(2)})</span>
                              {Number(detalle.descuento) > 0 && (
                                <span className="text-green-400 block ml-4">
                                  - Descuento: S/ {Number(detalle.descuento).toFixed(2)}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-4 py-2 capitalize align-top">{pago.medio_pago}</td>
                      <td className="px-4 py-2 font-semibold text-green-400 align-top">
                        S/ {pago.monto_total}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Button onClick={() => handlePrintReceipt(pago.cod_comprobante)}
                          className="bg-white text-black hover:bg-gray-700 hover:text-white h-8 text-xs">
                          <Printer className="h-4 w-4 mr-2" />
                          Reimprimir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )


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
              <CardHeader>
                {/* Header */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-100 mb-2">Historial de pagos</h1>
                  <p className="text-gray-300">Revisa los pagos efectuados por los clientes</p>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-4">
                    {[
                      { key: "search", label: "Buscar Cliente", icon: Search },
                      { key: "select-debts", label: "Pagos Realizados", icon: CreditCard },

                    ].map((step, index) => {
                      const Icon = step.icon
                      const isActive = currentStep === step.key
                      const isCompleted =
                        (currentStep === "select-debts" && step.key === "search") ||
                        (currentStep === "payment-details" && ["search", "select-debts"].includes(step.key))
                      return (
                        <div key={step.key} className="flex items-center">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${isActive
                              ? "border-blue-600 bg-blue-600 text-white"
                              : isCompleted
                                ? "border-green-600 bg-green-600 text-white"
                                : "border-gray-400  text-gray-400"
                              }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`ml-2 text-sm font-medium ${isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-400"
                              }`}
                          >
                            {step.label}
                          </span>
                          {index < 1 && <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Step Content */}
                {currentStep === "search" && renderSearchStep()}
                {currentStep === "select-debts" && renderPagos()}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
