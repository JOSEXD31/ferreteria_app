"use client"

import { useState, useEffect, useRef } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navarcobranza"
import AddDeudaModal from "@/components/AddDeudaModal";
import { useSearchParams } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Receipt, Search, CheckCircle, Calculator, CreditCard, ArrowLeft, Printer, Plus, ArrowRight
  , AlertTriangle, User, FileText, Wrench
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"


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

interface Trabajo {
  id: string
  client: string
  type: string
  status: string
  priority: string
  technician: string
  createdDate: string
  scheduledDate: string
  description: string
  address: string
  id_tec: number
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
  detalle_pago?: detallePago[]
}

interface Receipt {
  id: string
  paymentId: string
  type: "boleta" | "factura" | "recibo"
  number: string
  customer: Customer
  items: ReceiptItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  issuedAt: Date
  cashier: string
}

interface ReceiptItem {
  description: string
  amount: number
  month: string
  service: string
}

type PaymentStep = "search" | "select-debts" | "payment-details" | "confirmation"

interface SelectedDebt {
  debt: Debt
  amountToPay: number
  selected: boolean
}

interface SelectedDeudas {
  deu: deuda
  amountToPay: number
  selected: boolean
  discount?: number
  discountReason?: string
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [tipo_comrprobante, setTipoComprobante] = useState<tipo_comprobante[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  //const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [openModal, setOpenModal] = useState(false);

  // Discount Modal State
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false)
  const [activeDebtIndex, setActiveDebtIndex] = useState<number | null>(null)
  const [discountAmount, setDiscountAmount] = useState("")
  const [discountReason, setDiscountReason] = useState("")

  const [deudas, setDeudas] = useState<deuda[]>([])

  const [pagos, setPagos] = useState<pagos[]>([])
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [detallePago, setDetallePago] = useState<detallePago[]>([]);


  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [id_user, setIdUser] = useState("");
  const [showAddDeuda, setShowAddDeuda] = useState(false);

  // Modals for Ver Pagos / Ver Trabajos
  const [showPagosModal, setShowPagosModal] = useState(false);
  const [showTrabajosModal, setShowTrabajosModal] = useState(false);


  const [showDetalleComprobante, setShowDetalleComprobante] = useState(false);
  const [newPago, setNewPago] = useState({
    id_tipo_compro: "",
    serie: "",
    correlativo: 0,
    monto_total: 0,
    medio_pago: "EFECTIVO",
    num_con: "",
    id_user: id_user,
  })


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
  //Carga de deudas
  const fetchDeudas = async () => {
    try {
      const res = await fetch("/api/caja/deudasTodo");
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

  // Carga de trabajos
  const fetchTrabajos = async () => {
    try {
      const res = await fetch("/api/ordenTrabajo");
      if (!res.ok) {
        console.error("Error al obtener información de los trabajos:", res.status);
        return;
      }
      const data = await res.json();
      setTrabajos(data);
    } catch (err) {
      console.error("Error parsing JSON:", err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDeudas();
    fetchPagos();
    fetchTrabajos();
  }, []);


  //Carga de tipos de comprobante
  useEffect(() => {
    const fetchTipoComprobante = async () => {
      try {
        const res = await fetch("/api/tipoComprobante")
        const data = await res.json()
        setTipoComprobante(data)
      } catch (err) {
        console.error("Error al cargar tipos de comprobante:", err)
      }
    }
    fetchTipoComprobante()
  }, [])

  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user) {
      setNewPago((prev) => ({
        ...prev,
        id_user: id_user,
      }));
    }
  }, [id_user]);

  const searchParams = useSearchParams()
  const preselectedCustomerId = searchParams.get("customer")
  const receiptRef = useRef<HTMLDivElement>(null)

  const [currentStep, setCurrentStep] = useState<PaymentStep>("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedDebts, setSelectedDebts] = useState<SelectedDebt[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "yape" | "transferencia">("efectivo")
  const [receiptType, setReceiptType] = useState<"boleta" | "factura" | "recibo">("boleta")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedPayment, setProcessedPayment] = useState<Payment | null>(null)
  const [pagoProcesado, setpagoProcesado] = useState<pagos | null>(null)

  const [error, setError] = useState("")

  //  const customers = searchCustomers(searchQuery)
  const clientes_filtrados = searchClientes(searchQuery)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedDeudas, setSelectedDeudas] = useState<SelectedDeudas[]>([])

  // Cargar deudas cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClient) {
      const deudas = getDeudaClientes(selectedClient.num_con)
      const deudasSelection = deudas
        .filter((deu) => deu.estado !== "PAGADO" && deu.estado !== "ANULADO")
        .map((deu) => ({
          deu,
          amountToPay: deu.monto,
          selected: false,
        }))
      setSelectedDeudas(deudasSelection)
    }
  }, [selectedClient, deudas]); // 👈 escucha también los cambios en "deudas"

  function getDeudaClientes(num_con: string): deuda[] {
    return deudas
      .filter((deu) => deu.num_con === num_con)
      .sort((a, b) => new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime())
  }

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCurrentStep("select-debts")
    setError("")
  }

  const handleClienteSelect = (cliente: Client) => {
    setSelectedClient(cliente)
    setCurrentStep("select-debts")
    setError("")
  }

  //deudas nuevo
  const handleDeudaSelection = (index: number, selected: boolean) => {
    const updated = [...selectedDeudas]
    updated[index].selected = selected
    if (selected) {
      updated[index].amountToPay = updated[index].deu.saldo_pendiente;
    } else {
      updated[index].amountToPay = 0;
    }
    setSelectedDeudas(updated)
  }

  const handleMontoChange = (index: number, amount: number) => {
    const updated = [...selectedDeudas]
    const maxAmount = updated[index].deu.saldo_pendiente
    // Ensure amount + discount doesn't exceed total debt? 
    // Usually user pays (Debt - Discount). 
    // So AmountToPay should be (Debt - Discount).
    // If they change amount manually, it's fine, but let's just update the value.
    updated[index].amountToPay = amount
    setSelectedDeudas(updated)
  }

  const openDiscountModal = (index: number) => {
    setActiveDebtIndex(index)
    // If there is already a discount, populate it
    const currentDiscount = selectedDeudas[index].discount || 0
    const currentReason = selectedDeudas[index].discountReason || ""
    setDiscountAmount(currentDiscount > 0 ? currentDiscount.toString() : "")
    setDiscountReason(currentReason)
    setIsDiscountModalOpen(true)
  }

  const handleApplyDiscount = () => {
    if (activeDebtIndex !== null) {
      const updated = [...selectedDeudas]
      const discountVal = parseFloat(discountAmount) || 0

      updated[activeDebtIndex].discount = discountVal
      updated[activeDebtIndex].discountReason = discountReason

      // Auto-adjust amount to pay: (Saldo - Discount)
      const saldo = updated[activeDebtIndex].deu.saldo_pendiente
      const newAmountToPay = Math.max(0, saldo - discountVal)

      updated[activeDebtIndex].amountToPay = newAmountToPay

      setSelectedDeudas(updated)
      setIsDiscountModalOpen(false)
      setActiveDebtIndex(null)
      setDiscountAmount("")
      setDiscountReason("")
    }
  }

  const getSelectedDeudasTotal = () => {
    return selectedDeudas
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + Number(item.amountToPay || 0), 0);
  };


  const getSelectedDeudasCount = () => {
    return selectedDeudas.filter((item) => item.selected).length
  }





  const handleContinueToPayment = () => {
    const selectedCount = getSelectedDeudasCount()
    if (selectedCount === 0) {
      setError("Debes seleccionar al menos una deuda para continuar")
      return
    }
    setError("")
    setCurrentStep("payment-details")
  }


  async function processPayment(
    num_con: string,
    selectedDeudass: { id_deuda: string; amount: number; deuda: deuda; descuento?: number; mot_descuento?: string }[],
    paymentMethod: "efectivo" | "yape" | "transferencia",
    receiptType: "boleta" | "factura" | "recibo",
    id_usuario: string,
  ): Promise<{ success: boolean; cod_comprobante: string; error?: string }> {
    try {
      const totalAmount = selectedDeudass.reduce((sum, item) => sum + Number(item.amount), 0);

      // Obtener tipo
      let id_tipo_com: number;
      if (receiptType === "boleta") id_tipo_com = 1;
      else if (receiptType === "factura") id_tipo_com = 2;
      else if (receiptType === "recibo") id_tipo_com = 3;
      else throw new Error("Tipo de comprobante inválido");

      // Obtener serie y correlativo
      const { serie, numero } = await generarNumeroComprobante(id_tipo_com);
      const cod_comprobante = `${serie}-${numero}`;

      await GuardarPago(
        {
          id_tipo_compro: id_tipo_com.toString(),
          serie,
          correlativo: numero,
          monto_total: totalAmount,
          medio_pago: paymentMethod,
          num_con,
          id_user: id_usuario,
        },
        selectedDeudass.map((item) => ({
          ...item,
          id_deuda: item.deuda.id_deuda || "",
          descripcion: item.deuda.descripcion || "",
          ano_mes: item.deuda.ano_mes || "",
          monto: Number(item.amount),
          descuento: item.descuento || 0,
          mot_descuento: item.mot_descuento || "",
        }))
      );

      fetchDeudas();
      fetchPagos();

      return { success: true, cod_comprobante };
    } catch (error) {
      console.error("Error en processPayment:", error);
      return { success: false, cod_comprobante: "", error: "Error al procesar el pago" };
    }
  }

  async function GuardarPago(pago: any, detalle: any[]) {
    try {
      const res = await fetch("/api/caja/agregar_pago", {
        method: "POST",
        body: JSON.stringify({
          ...pago,
          detallePago: detalle.map((item) => ({
            id_deuda: item.id_deuda,
            descripcion: item.descripcion,
            ano_mes: item.ano_mes,
            monto: item.monto,
            descuento: item.descuento || 0,
            mot_descuento: item.mot_descuento || "",
          })),
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
        return;
      }

      // Limpieza
      setNewPago({
        id_tipo_compro: "",
        serie: "",
        correlativo: 0,
        monto_total: 0,
        medio_pago: "",
        num_con: "",
        id_user: id_user,
      });
      setDetallePago([]);

    } catch (error) {
      toast.error("Error inesperado al guardar pago");
      console.error("Error al registrar el pago:", error);
    }
  }

  async function generarNumeroComprobante(id_tipo: number): Promise<{ serie: string; numero: string }> {
    try {
      const res = await fetch(`/api/caja/numeroComprobante?id_tipo=${id_tipo}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || "Error al obtener numero de comprobante");
      }

      const { serie, numero } = await res.json();

      return { serie, numero }; // Ejemplo: B001-00012
    } catch (error) {
      console.error("Error generando número de comprobante:", error);
      return { serie: "ERROR", numero: "00000000" }; // Puedes lanzar error o retornar algo más útil según el caso
    }
  }

  const handleProcessPayment = async () => {
    setIsProcessing(true)
    setError("")

    try {
      const selectedItems = selectedDeudas
        .filter((item) => item.selected)
        .map((item) => ({
          id_deuda: item.deu.id_deuda.toString(),
          amount: item.amountToPay,
          deuda: item.deu,
          descuento: item.discount,
          mot_descuento: item.discountReason
        }))

      const result = await processPayment(
        selectedClient!.num_con,
        selectedItems,
        paymentMethod,
        receiptType,
        id_user,
      );

      if (result.success && result.cod_comprobante) {
        // Esperar a que se carguen los pagos frescos
        const res = await fetch("/api/caja/pagos");
        const data: pagos[] = await res.json();

        const numero_comprobante = result.cod_comprobante;

        // Buscar el pago en los datos recién obtenidos
        const pago_realizado = data.find((pago) => pago.cod_comprobante === numero_comprobante) || null;

        // Actualizar estados
        setPagos(data);
        setpagoProcesado(pago_realizado);
        setCurrentStep("confirmation");
      } else {
        setError(result.error || "Error al procesar el pago");
      }
    } catch (err) {
      setError("Error inesperado al procesar el pago")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewPayment = () => {
    setCurrentStep("search")
    setSelectedClient(null)
    setSelectedDeudas([])
    setPaymentMethod("efectivo")
    setReceiptType("boleta")
    setpagoProcesado(null)
    setError("")
    setSearchQuery("")
  }

  const resetearSelectedDeudas = () => {
    const updated = selectedDeudas.map((deuda) => ({
      ...deuda,
      selected: false,
      amountToPay: 0,
    }));

    setSelectedDeudas(updated);
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


  const handlePrintReceipt = async () => {
    try {

      const res = await fetch(`/api/caja/impresion?cod_comprobante=${pagoProcesado?.cod_comprobante}`);
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

  const renderSelectDebtsStep = () => (
    <div className="space-y-6">
      {/* Customer Info */}
      <Card className="rounded-md border-none bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-100">
            <div className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Cliente Seleccionado
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setCurrentStep("search"); resetearSelectedDeudas(); }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cambiar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              {selectedClient?.cli_tipo === "NATURAL" ? (
                <>
                  <h2 className="font-semibold text-lg text-gray-100">{selectedClient?.cli_nombre} {selectedClient?.cli_apellido}</h2>
                  <p className="text-gray-300">DNI: {selectedClient?.cli_dni}</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg text-gray-100">{selectedClient?.cli_razonsoci}</h3>
                  <p className="text-gray-300">RUC: {selectedClient?.cli_ruc}</p>
                </>
              )
              }
              <p className="text-gray-300">CEL: {selectedClient?.cli_cel}</p>
            </div>
            <div>
              <p className="text-gray-300">Nº CONTRATO: {selectedClient?.num_con}</p>
              <p className="text-gray-300">SERVICIO: {selectedClient?.serv_nombre}</p>
              <p className="text-gray-300">DIRECCION: {selectedClient?.cli_direccion}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                className="bg-gray-200 text-gray-700 hover:bg-gray-500 hover:text-white"
                onClick={() => setShowAddDeuda(true)}
              >
                Agregar otras Deudas
                <Plus className="h-4 w-4 ml-2" />
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="bg-gray-200 text-gray-700 hover:bg-gray-500 hover:text-white border-none"
                  onClick={() => setShowPagosModal(true)}
                >
                  Ver todos los pagos
                  <FileText className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-gray-200 text-gray-700 hover:bg-gray-500 hover:text-white border-none"
                  onClick={() => setShowTrabajosModal(true)}
                >
                  Ver trabajos
                  <Wrench className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debts Selection */}
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-200">
            <CreditCard className="h-5 w-5 mr-2" />
            Seleccionar Deudas a Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDeudas.length > 0 ? (
            <div className="space-y-4">
              {selectedDeudas.map((item, index) => (
                <div key={item.deu.id_deuda} className="p-3 rounded-md border border-gray-400">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={(checked) => handleDeudaSelection(index, checked as boolean)}
                      className="mt-1 border-gray-400"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-white">{item.deu.descripcion}</h4>
                        </div>
                        <Badge
                          variant={
                            item.deu.estado === "ACTIVO"
                              ? "destructive"
                              : item.deu.estado === "RESTANTE"
                                ? "warning"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {item.deu.estado === "RESTANTE" ? "PENDIENTE" : item.deu.estado}
                        </Badge>

                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div>
                          <Label className="text-xs text-gray-200">Monto Total</Label>
                          <p className="font-semibold text-white">S/ {Number(item.deu.monto).toFixed(2)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-200">Saldo Pendiente</Label>
                          <p className="font-semibold text-red-600">S/ {Number(item.deu.saldo_pendiente).toFixed(2)}</p>
                        </div>
                        <div>
                          <Label htmlFor={`amount-${index}`} className="text-xs text-gray-200">
                            Monto a Pagar
                          </Label>
                          <Input
                            id={`amount-${index}`}
                            type="number"
                            min="0"
                            max={item.deu.saldo_pendiente}
                            step="0.01"
                            value={item.selected ? item.amountToPay ?? "" : ""}
                            onChange={(e) => handleMontoChange(index, parseFloat(e.target.value) || 0)}
                            disabled={!item.selected}
                            className="text-right bg-gray-700/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>

                      {item.selected && (
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            {item.discount && item.discount > 0 ? (
                              <span className="text-green-400">
                                Descuento aplicado: S/ {item.discount.toFixed(2)} ({item.discountReason})
                              </span>
                            ) : (
                              <span>Sin descuento</span>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 border-gray-600 hover:text-white hover:bg-gray-700"
                            onClick={() => openDiscountModal(index)}
                          >
                            {item.discount && item.discount > 0 ? "Modificar Descuento" : "Agregar Descuento"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex items-center justify-between ">
                <div>
                  <p className="font-medium text-white">Total a Pagar</p>
                  <p className="text-sm text-gray-300">{getSelectedDeudasCount()} deuda(s) seleccionada(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">S/ {getSelectedDeudasTotal().toFixed(2)}</p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button className="bg-gray-200 text-gray-700 hover:bg-gray-500 hover:text-white" onClick={handleContinueToPayment} disabled={getSelectedDeudasCount() === 0}>
                  Continuar al Pago
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">Sin deudas pendientes</h3>
              <p className="text-gray-300">Este cliente está al día con sus pagos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderPaymentDetailsStep = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Payment Summary */}
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-gray-200">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Resumen del Pago
            </div>
            <Button variant="ghost" size="sm" onClick={() => setCurrentStep("select-debts")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-white">
            <div className="flex justify-between items-center">
              <span>Cliente:</span>
              {selectedClient?.cli_tipo === "NATURAL" ? (
                <>
                  <span className="font-medium">{selectedClient?.cli_nombre} {selectedClient?.cli_apellido}</span>
                </>
              ) : (
                <>
                  <span className="font-medium">{selectedClient?.cli_razonsoci}</span>
                </>
              )
              }
            </div>
            <div className="flex justify-between items-center">
              <span>Deudas seleccionadas:</span>
              <span className="font-medium">{getSelectedDeudasCount()}</span>
            </div>
            <Separator />

            {selectedDeudas.filter((deudas) => deudas.selected === true).map((deudas) =>
              <div key={deudas.deu.id_deuda} className="flex justify-between items-center">
                <span>{deudas.deu.descripcion}</span>
                <span className="font-medium">{deudas.amountToPay}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Total a pagar:</span>
              <span className="font-bold text-blue-600">S/ {getSelectedDeudasTotal().toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-200">
            <Receipt className="h-5 w-5 mr-2" />
            Detalles del Pago
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
            <div>
              <Label htmlFor="payment-method">Método de Pago</Label>
              <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="yape">Yape</SelectItem>
                  <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="receipt-type">Tipo de Comprobante</Label>
              <Select value={receiptType} onValueChange={(value: any) => setReceiptType(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="boleta">Boleta de Venta</SelectItem>
                  <SelectItem value="factura">Factura</SelectItem>
                  <SelectItem value="recibo">Recibo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setCurrentStep("select-debts")} className="bg-transparent border-none text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <Button className="bg-gray-200 text-gray-700 hover:bg-gray-500 hover:text-white" onClick={handleProcessPayment} disabled={isProcessing}>
              {isProcessing ? "Procesando..." : "Procesar Pago"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <Card className="rounded-md border border-gray-700 bg-gray-800/30">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            Pago Procesado Exitosamente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50/5 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">Comprobante Generado</h3>
              <p className="text-green-700">
                N° {pagoProcesado?.cod_comprobante}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-200">Cliente</Label>
                {selectedClient?.cli_tipo === "NATURAL" ? (
                  <>
                    <p className="font-medium text-gray-400">{selectedClient?.cli_nombre}{" "}{selectedClient?.cli_apellido}</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-400">{selectedClient?.cli_razonsoci}</p>
                  </>
                )
                }
              </div>
              <div>
                <Label className="text-sm text-gray-200">Monto Pagado</Label>
                <p className="font-medium text-green-600">S/ {pagoProcesado?.monto_total}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-200">Método de Pago</Label>
                <p className="font-medium text-gray-400">{pagoProcesado?.medio_pago}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-200">Fecha</Label>
                <p className="font-medium text-gray-400">
                  {pagoProcesado?.fecha_emision
                    ? new Date(pagoProcesado.fecha_emision).toLocaleDateString("es-PE")
                    : ""}
                </p>
              </div>
            </div>

            <div className="flex justify-center space-x-4 pt-4">
              <Button onClick={handlePrintReceipt} className="bg-white text-black hover:bg-gray-700 hover:text-white">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Comprobante
              </Button>
              <Button onClick={handleNewPayment} className="bg-white text-black hover:bg-gray-700 hover:text-white">
                Nuevo Pago
              </Button>
            </div>
          </div>
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
                  <h1 className="text-3xl font-bold text-gray-100 mb-2">Pasarela de Cobranza</h1>
                  <p className="text-gray-300">Procesa pagos de servicios de telecomunicaciones</p>
                </div>
              </CardHeader>
              <CardContent>
                {/* Progress Steps */}
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-4">
                    {[
                      { key: "search", label: "Buscar Cliente", icon: Search },
                      { key: "select-debts", label: "Seleccionar Deudas", icon: CreditCard },
                      { key: "payment-details", label: "Detalles de Pago", icon: Receipt },
                      { key: "confirmation", label: "Confirmación", icon: CheckCircle },
                    ].map((step, index) => {
                      const Icon = step.icon
                      const isActive = currentStep === step.key
                      const isCompleted =
                        (currentStep === "select-debts" && step.key === "search") ||
                        (currentStep === "payment-details" && ["search", "select-debts"].includes(step.key)) ||
                        (currentStep === "confirmation" && ["search", "select-debts", "payment-details"].includes(step.key))

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
                          {index < 3 && <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Step Content */}
                {currentStep === "search" && renderSearchStep()}
                {currentStep === "select-debts" && renderSelectDebtsStep()}
                {currentStep === "payment-details" && renderPaymentDetailsStep()}
                {currentStep === "confirmation" && renderConfirmationStep()}
              </CardContent>
            </Card>
          </div>
        </div>
        {showAddDeuda && (
          <AddDeudaModal
            num_con={selectedClient?.num_con!}
            onClose={() => setShowAddDeuda(false)}
            onAdded={() => fetchDeudas()}
          />
        )}

        {/* Discount Modal */}
        {isDiscountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-xl w-full max-w-md">
              <h3 className="text-lg font-bold text-white mb-4">Agregar Descuento</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-200">Monto del Descuento</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">Motivo</Label>
                  <Input
                    placeholder="Razón del descuento..."
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setIsDiscountModalOpen(false)}
                    className="text-gray-300 hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleApplyDiscount}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Aplicar Descuento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver Pagos */}
        {showPagosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700 text-white flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Historial de Pagos - {selectedClient?.cli_nombre || selectedClient?.cli_razonsoci}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowPagosModal(false)}>
                  <span className="text-xl">×</span>
                </Button>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1 p-4">
                <div className="space-y-4">
                  {pagos.filter(p => p.num_con === selectedClient?.num_con).length > 0 ? (
                    pagos.filter(p => p.num_con === selectedClient?.num_con)
                      .sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime())
                      .map((pago_item) => (
                        <div key={pago_item.cod_comprobante} className="border border-gray-700 rounded-lg p-2 bg-gray-800/50">
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <p className="font-bold text-base">{pago_item.cod_comprobante}</p>
                              <p className="text-xs text-gray-400">{new Date(pago_item.fecha_emision).toLocaleDateString("es-PE")} {new Date(pago_item.fecha_emision).toLocaleTimeString("es-PE")}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-400 text-base">S/ {Number(pago_item.monto_total).toFixed(2)}</p>
                              <Badge className={
                                pago_item.medio_pago.toLowerCase() === "yape" ? "bg-purple-600 hover:bg-purple-700" :
                                  pago_item.medio_pago.toLowerCase() === "transferencia" ? "bg-blue-600 hover:bg-blue-700" :
                                    pago_item.medio_pago.toLowerCase() === "efectivo" ? "bg-green-600 hover:bg-green-700" :
                                      "bg-gray-600 hover:bg-gray-700"
                              }>
                                {pago_item.medio_pago}
                              </Badge>
                            </div>
                          </div>

                          {pago_item.detalle_pago && pago_item.detalle_pago.length > 0 && (
                            <div className="mt-1 text-xs bg-gray-900/50 p-1.5 rounded">
                              <div className="text-gray-400 mb-0.5 font-medium">Conceptos:</div>
                              <ul className="list-disc list-inside text-gray-300 space-y-0.5">
                                {pago_item.detalle_pago.map((det, idx) => (
                                  <li key={idx} className="truncate">
                                    {det.descripcion} - <span className="text-gray-400">S/ {Number(det.monto).toFixed(2)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      No hay pagos registrados para este cliente.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal Ver Trabajos */}
        {showTrabajosModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden bg-gray-900 border-gray-700 text-white flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Historial de Trabajos - {selectedClient?.cli_nombre || selectedClient?.cli_razonsoci}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowTrabajosModal(false)}>
                  <span className="text-xl">×</span>
                </Button>
              </CardHeader>
              <CardContent className="overflow-y-auto flex-1 p-4">
                <div className="space-y-4">
                  {trabajos.filter(t => t.description.includes(selectedClient?.cli_nombre || "") || t.client.includes(selectedClient?.cli_nombre || "") || t.client === selectedClient?.cli_razonsoci).length > 0 ? (
                    trabajos.filter(t => t.description.includes(selectedClient?.cli_nombre || "") || t.client.includes(selectedClient?.cli_nombre || "") || t.client === selectedClient?.cli_razonsoci)
                      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                      .map((trabajo) => (
                        <div key={trabajo.id} className="border border-gray-700 rounded-lg p-2 bg-gray-800/50">
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-base">{trabajo.type}</p>
                                <Badge className="text-xs px-1.5 py-0 h-5" variant={
                                  trabajo.status === "Pendiente" ? "secondary" :
                                    trabajo.status === "En proceso" ? "warning" :
                                      trabajo.status === "Finalizado" ? "success" : "destructive"
                                }>
                                  {trabajo.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400">Asignado a: {trabajo.technician}</p>
                              <p className="text-xs text-gray-500">Creado: {trabajo.createdDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-400 uppercase">Prioridad</p>
                              <span className="font-medium text-sm text-blue-400">{trabajo.priority}</span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-300 bg-gray-900/50 p-1.5 rounded">
                            <p>{trabajo.description}</p>
                          </div>
                        </div>
                      ))
                  ) : (
                    // Fallback to simple filtering if needed or just show empty
                    trabajos.length > 0 ? (
                      <div className="text-center py-10 text-gray-500">
                        No se encontraron trabajos vinculados directamente por nombre.
                        (Implemente filtro por num_con si está disponible en API)
                      </div>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        No hay trabajos registrados.
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
