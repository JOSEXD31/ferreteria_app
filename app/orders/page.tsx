"use client"

import { useState, useRef, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Plus, Search, Edit, Eye, Filter, Truck,
  AlertTriangle,
  Wrench,
  CheckCircle
} from "lucide-react"
import Listado_Tecnicos from "@/components/filtrado_tec";
import Listado_Clientes from "@/components/filtrado_cli";
import { toast } from 'react-toastify';


type TipoTrabajo = {
  tip_id: number
  tip_nombre: string
}

type Tecnicos = {
  tec_id: number
  usuario: {
    usu_nombre: string
  }
}

type Clientes = {
  cli_id: number
  cli_nombre: string
  cli_dni: string
  cli_direccion: string
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

interface WorkOrder {
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
}

type servicios = {
  serv_id: number
  serv_nombre: string
}




export default function OrdersPage() {



  const [tipoTrabajos, setTipoTrabajos] = useState<TipoTrabajo[]>([])
  const [tecnicos, setTecnicos] = useState<Tecnicos[]>([])
  //const [clientes, setClientes] = useState<Clientes[]>([])
  const [servicios, setServicios] = useState<servicios[]>([])
  const [clients, setClients] = useState<Client[]>([])



  const [id_user, setIdUser] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("userId") || "";
    setIdUser(storedId);
  }, []);

  useEffect(() => {
    if (id_user) {
      setNewOrdenTrabajo((prev) => ({
        ...prev,
        per_id: id_user,
      }));
    }
  }, [id_user]);

  useEffect(() => {
    fetchOrdenesTrabajo();
    fetchClients();
  }, []);


  const [newOrdenTrabajo, setNewOrdenTrabajo] = useState({
    descripcion: "",
    fecha_asignacion: "",
    prioridad: "",
    tec_id: "",
    per_id: "",
    cli_id: "",
    tip_id: "",
    tecnico: "",
    num_con: "",
    cliente: "",
    direccion: "",
    servicio_actual: "",
    servicio_nuevo: "",
  });
  const [orders, setOrders] = useState<WorkOrder[]>([])


  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("Pendiente")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)

  //Carga de clientes y contratos
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/cliente/clienteContrato");
      if (!res.ok) {
        toast.error("Error al obtener información de los clientes");
        return;
      }
      const data = await res.json();
      setClients(data);
    } catch (err) {
      toast.error("Erroral obtener clientes");
    }
  };


  //Carga de tipo de trabajos
  useEffect(() => {
    const fetchTipoTrabajos = async () => {
      try {
        const res = await fetch("/api/tipoTrabajo")
        const data = await res.json()

        setTipoTrabajos(data)
      } catch (err) {
        toast.error("Error cargando tipo de trabajos")
      }
    }
    fetchTipoTrabajos()
  }, [])


  //Carga de servicios
  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const res = await fetch("/api/servicios")
        const data = await res.json()
        setServicios(data)
      } catch (err) {
        toast.error("Error al cargar los servicios")
      }
    }

    fetchServicios()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalizado":
        return "bg-green-500"
      case "En proceso":
        return "bg-blue-500"
      case "Pendiente":
        return "bg-yellow-500"
      case "Cancelada":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  //Carga de tecnicos disponibles
  useEffect(() => {
    const fetchTecnicos = async () => {
      try {
        const res = await fetch("/api/technician/tecnicosDisponibles")
        const data = await res.json()
        setTecnicos(data)
      } catch (err) {
        toast.error("Error al cargar técnicos")
      }
    }
    fetchTecnicos()
  }, [])


  /*//Carga de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await fetch("/api/cliente")
        const data = await res.json()
        setClientes(data)
      } catch (err) {
        console.error("Error al cargar clientes:", err)
      }
    }
    fetchClientes()
  }, [])
*/

  //Carga de ordenes de trabajo
  const fetchOrdenesTrabajo = async () => {
    try {
      const res = await fetch("/api/ordenTrabajo");
      if (!res.ok) {
        toast.error("Error al obtener las ordenes de trabajo");
        return;
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      toast.error("Error parsing JSON");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "bg-red-500"
      case "Media":
        return "bg-yellow-500"
      case "Baja":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.scheduledDate.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()) ||
      order.priority.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
    return matchesSearch && matchesFilter
  })

  function convertToUTCWithoutShift(localDateTime: string): string {
    // Descompone la fecha tipo "2025-09-19T12:23"
    const [datePart, timePart] = localDateTime.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);

    // Crea una fecha en UTC con esos mismos valores
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
    return utcDate.toISOString(); // Ya lleva la 'Z' al final
  }

  //creacion de ordenes de trabajo
  const handleCreateOrder = async () => {
    try {

      const fechaUTC = convertToUTCWithoutShift(newOrdenTrabajo.fecha_asignacion);

      const res = await fetch("/api/ordenTrabajo", {
        method: "POST",
        body: JSON.stringify({
          ...newOrdenTrabajo,
          cli_id: parseInt(newOrdenTrabajo.cli_id),
          tec_id: parseInt(newOrdenTrabajo.tec_id),
          fecha_asignacion: fechaUTC, // ✅ fecha en UTC sin desfase

        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.error) {
        toast.error(`Error: ${data.error}`);
      } else {
        toast.success("Orden creada");
        setIsCreateModalOpen(false);
        setNewOrdenTrabajo({
          descripcion: "",
          fecha_asignacion: "",
          prioridad: "",
          tec_id: "",
          per_id: id_user,
          cli_id: "",
          tip_id: "",
          num_con: "",
          tecnico: "",
          cliente: "",
          direccion: "",
          servicio_actual: "",
          servicio_nuevo: "",
        });
        await fetchOrdenesTrabajo();
      }
    } catch (error) {
      toast.error("Error al crear la orden de trabajo");
    }
  };

  /*const handleEditOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map((order) => (order.id === selectedOrder.id ? selectedOrder : order)))
      setIsEditModalOpen(false)
      setSelectedOrder(null)
    }
  }*/


  const tipoTrabajoSeleccionado = tipoTrabajos.find(
    (trab) => trab.tip_id.toString() === newOrdenTrabajo.tip_id
  );
  const esCambioDePlan = tipoTrabajoSeleccionado?.tip_nombre === "CAMBIO DE PLAN";

  const isFormValid = () => {
    const baseFieldsFilled =
      newOrdenTrabajo.tip_id &&
      newOrdenTrabajo.prioridad &&
      newOrdenTrabajo.fecha_asignacion &&
      newOrdenTrabajo.direccion &&
      newOrdenTrabajo.cliente;

    if (esCambioDePlan) {
      return (
        baseFieldsFilled &&
        newOrdenTrabajo.servicio_actual &&
        newOrdenTrabajo.servicio_nuevo
      );
    } else {
      return baseFieldsFilled && newOrdenTrabajo.tec_id;
    }
  };

  const getStatusStep = (status: string) => {
    const steps = ['Pendiente', 'En proceso', 'Finalizado'];
    return steps.indexOf(status);
  };

  const handleStepClick = (newStatus: string) => {
    // Aquí puedes cambiar el estado o hacer una llamada a una API
    console.log("Nuevo estado:", newStatus);
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'Pendiente':
        return <AlertTriangle size={20} />;
      case 'En proceso':
        return <Wrench size={20} />;
      case 'Finalizado':
        return <CheckCircle size={20} />;
      default:
        return null;
    }
  };


  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-slate-900">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-700 bg-gray-800/50 backdrop-blur-xl px-4">
            <SidebarTrigger className="-ml-1 text-white" />
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-white">Gestión de Órdenes de Trabajo</h1>
              <p className="text-sm text-gray-400">Administra todas las órdenes de trabajo</p>
            </div>
          </header>

          <div className="flex-1 space-y-6 p-6">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">Órdenes de Trabajo</CardTitle>
                    <CardDescription className="text-gray-400">
                      Gestiona y supervisa todas las órdenes de trabajo
                    </CardDescription>
                  </div>

                  <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Orden
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Orden de Trabajo</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Completa los datos para crear una nueva orden de trabajo
                        </DialogDescription>
                      </DialogHeader>

                      {/** Bandera para CAMBIO DE PLAN */}
                      {(() => {


                        return (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 gap-4">

                              {/* Tipo de Trabajo */}
                              <div className="space-y-2">
                                <Label htmlFor="type">Tipo de Trabajo</Label>
                                <Select
                                  value={newOrdenTrabajo.tip_id}
                                  onValueChange={(value) =>
                                    setNewOrdenTrabajo({ ...newOrdenTrabajo, tip_id: value })
                                  }
                                >
                                  <SelectTrigger className="bg-gray-700 border-gray-600">
                                    <SelectValue placeholder="Seleccionar tipo" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    {tipoTrabajos.map((trab) => (
                                      <SelectItem key={trab.tip_id} value={trab.tip_id.toString()}>
                                        {trab.tip_nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Prioridad (siempre) */}
                              <div className="space-y-2">
                                <Label htmlFor="priority">Prioridad</Label>
                                <Select
                                  value={newOrdenTrabajo.prioridad}
                                  onValueChange={(value) =>
                                    setNewOrdenTrabajo({ ...newOrdenTrabajo, prioridad: value })
                                  }
                                >
                                  <SelectTrigger className="bg-gray-700 border-gray-600">
                                    <SelectValue placeholder="Seleccionar prioridad" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                    <SelectItem value="Alta">Alta</SelectItem>
                                    <SelectItem value="Media">Media</SelectItem>
                                    <SelectItem value="Baja">Baja</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Fecha asignación o cambio */}
                              <div className="space-y-2">
                                <Label htmlFor="scheduledDate">
                                  {esCambioDePlan ? "Fecha de Cambio" : "Fecha Programada"}
                                </Label>
                                <Input
                                  id="scheduledDate"
                                  type="datetime-local"
                                  value={newOrdenTrabajo.fecha_asignacion || ""}
                                  onChange={(e) =>
                                    setNewOrdenTrabajo({
                                      ...newOrdenTrabajo,
                                      fecha_asignacion: e.target.value,
                                    })
                                  }
                                  className="bg-gray-700 border-gray-600 text-white"
                                  style={{
                                    colorScheme: "dark", // mantiene el fondo oscuro
                                  }}
                                />

                              </div>
                            </div>
                            {/* Cliente (siempre se muestra) */}
                            <Listado_Clientes
                              clientes={clients}
                              newOrder={newOrdenTrabajo}
                              setNewOrder={setNewOrdenTrabajo}
                            />

                            {/* Dirección */}
                            {(esCambioDePlan || newOrdenTrabajo.direccion) && (
                              <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                  id="address"
                                  value={newOrdenTrabajo.direccion || ""}
                                  disabled
                                  className="bg-gray-700 border-gray-600 text-white"
                                />
                              </div>
                            )}

                            {/* Técnico (solo si NO es cambio de plan) */}
                            {!esCambioDePlan && (
                              <Listado_Tecnicos
                                tecnicos={tecnicos}
                                newOrder={newOrdenTrabajo}
                                setNewOrder={setNewOrdenTrabajo}
                              />
                            )}


                            <div className="grid grid-cols-2 gap-4">

                              {/* SERVICIO ACTUAL (si cambio de plan) */}
                              {esCambioDePlan && (
                                <div className="space-y-2">
                                  <Label>Servicio Actual</Label>
                                  <Input
                                    value={newOrdenTrabajo.servicio_actual || ""}
                                    disabled
                                    className="bg-gray-700 border-gray-600 text-white"
                                  />
                                </div>
                              )}

                              {/* NUEVO PLAN (si cambio de plan) */}
                              {esCambioDePlan && (
                                <div className="space-y-2">
                                  <Label>Nuevo Plan</Label>
                                  <Select
                                    value={newOrdenTrabajo.servicio_nuevo}
                                    onValueChange={(value) =>
                                      setNewOrdenTrabajo({ ...newOrdenTrabajo, servicio_nuevo: value })
                                    }
                                  >
                                    <SelectTrigger className="bg-gray-700 border-gray-600">
                                      <SelectValue placeholder="Seleccionar nuevo plan" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                      {servicios.map((serv) => (
                                        <SelectItem key={serv.serv_id} value={serv.serv_id.toString()}>
                                          {serv.serv_nombre}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                            {/* Descripción */}
                            <div className="space-y-2">
                              <Label htmlFor="description">Descripción</Label>
                              <Textarea
                                id="description"
                                value={newOrdenTrabajo.descripcion}
                                onChange={(e) =>
                                  setNewOrdenTrabajo({
                                    ...newOrdenTrabajo,
                                    descripcion: e.target.value,
                                  })
                                }
                                className="bg-gray-700 border-gray-600"
                                rows={3}
                              />
                            </div>

                            {/* Campo oculto */}
                            <input
                              type="hidden"
                              name="per_id"
                              value={newOrdenTrabajo.per_id || ""}
                            />
                          </div>
                        );
                      })()}

                      {/* Botones */}
                      <div className="flex justify-end space-x-2 text-black">
                        <Button
                          variant="outline"
                          onClick={() => setIsCreateModalOpen(false)}
                          className="hover:bg-gray-600 hover:text-white transition"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleCreateOrder}
                          disabled={!isFormValid()}
                          className={`bg-gradient-to-r from-cyan-500 to-blue-600 text-white transition ${isFormValid()
                            ? "hover:from-cyan-600 hover:to-blue-700"
                            : "opacity-50 cursor-not-allowed"
                            }`}
                        >
                          Crear Orden
                        </Button>

                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por cliente, tipo de trabajo, fecha programada, prioridad..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-gray-300">
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="En proceso">En proceso</SelectItem>
                      <SelectItem value="Finalizado">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border border-gray-700 bg-gray-800/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-200">Cliente</TableHead>
                        <TableHead className="text-gray-200">Tipo</TableHead>
                        <TableHead className="text-gray-200">Estado</TableHead>
                        <TableHead className="text-gray-200">Prioridad</TableHead>
                        <TableHead className="text-gray-200">Técnico</TableHead>
                        <TableHead className="text-gray-200">Fecha Programada</TableHead>
                        <TableHead className="text-gray-200">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="border-gray-700">
                          <TableCell className="text-gray-200">{order.client}</TableCell>
                          <TableCell className="text-gray-200">{order.type}</TableCell>
                          <TableCell>
                            <Badge className={`${getStatusColor(order.status)} text-white`}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getPriorityColor(order.priority)} text-white`}>{order.priority}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-200">{order.technician}</TableCell>
                          <TableCell className="text-gray-200">{order.scheduledDate}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsViewModalOpen(true)
                                }}
                                className="text-slate-400 hover:text-black"
                              ><Eye className="w-4 h-4" />Ver
                              </Button>
                              {/*<Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setIsEditModalOpen(true)
                                }}
                                className="text-slate-400 hover:text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>*/}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de visualización */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Orden de Trabajo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Información completa de la orden {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Cliente</Label>
                    <p className="text-white">{selectedOrder.client}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Tipo de Trabajo</Label>
                    <p className="text-white">{selectedOrder.type}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Estado</Label>
                    <Badge className={`${getStatusColor(selectedOrder.status)} text-white mt-1`}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-400">Prioridad</Label>
                    <Badge className={`${getPriorityColor(selectedOrder.priority)} text-white mt-1`}>
                      {selectedOrder.priority}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Técnico Asignado</Label>
                    <p className="text-white">{selectedOrder.technician}</p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Fecha Programada</Label>
                    <p className="text-white">{selectedOrder.scheduledDate}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400">Dirección</Label>
                  <p className="text-white">{selectedOrder.address}</p>
                </div>
                <div>
                  <Label className="text-gray-400">Descripción</Label>
                  <p className="text-white">{selectedOrder.description}</p>
                </div>

                {selectedOrder && (
                  <div className="mt-6">
                    <Label className="text-gray-400 mb-2 block">Seguimiento</Label>
                    <div className="flex items-center justify-between relative">
                      {['Pendiente', 'En proceso', 'Finalizado'].map((step, index) => {
                        const isActive = index <= getStatusStep(selectedOrder.status);
                        return (
                          <div
                            key={step}
                            className="flex flex-col items-center cursor-pointer z-10"
                            onClick={() => handleStepClick(step)}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
              ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                              {getStepIcon(step)}
                            </div>
                            <span className="text-sm mt-1 text-gray-300">{step}</span>
                          </div>
                        );
                      })}
                      <div className="absolute top-5 left-5 right-5 h-1 bg-gray-600 z-0">
                        <div
                          className="h-1 bg-blue-500 transition-all duration-300"
                          style={{ width: `${(getStatusStep(selectedOrder.status) / 2) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de edición 
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Orden de Trabajo</DialogTitle>
              <DialogDescription className="text-gray-400">
                Modifica los datos de la orden {selectedOrder?.id}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-client">Cliente</Label>
                    <Input
                      id="edit-client"
                      value={selectedOrder.client}
                      onChange={(e) => setSelectedOrder({ ...selectedOrder, client: e.target.value })}
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Tipo de Trabajo</Label>
                    <Select
                      value={selectedOrder.type}
                      onValueChange={(value) => setSelectedOrder({ ...selectedOrder, type: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Instalación">Instalación</SelectItem>
                        <SelectItem value="Reconexión">Reconexión</SelectItem>
                        <SelectItem value="Corte">Corte</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="Reparación">Reparación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Estado</Label>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) => setSelectedOrder({ ...selectedOrder, status: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En Progreso">En Progreso</SelectItem>
                        <SelectItem value="Completada">Completada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Prioridad</Label>
                    <Select
                      value={selectedOrder.priority}
                      onValueChange={(value) => setSelectedOrder({ ...selectedOrder, priority: value })}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-technician">Técnico Asignado</Label>
                  <Select
                    value={selectedOrder.technician}
                    onValueChange={(value) => setSelectedOrder({ ...selectedOrder, technician: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Carlos López">Carlos López</SelectItem>
                      <SelectItem value="Ana Martín">Ana Martín</SelectItem>
                      <SelectItem value="Luis Torres">Luis Torres</SelectItem>
                      <SelectItem value="José Díaz">José Díaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-scheduledDate">Fecha Programada</Label>
                  <Input
                    id="edit-scheduledDate"
                    type="date"
                    value={selectedOrder.scheduledDate}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, scheduledDate: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Dirección</Label>
                  <Input
                    id="edit-address"
                    value={selectedOrder.address}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, address: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descripción</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedOrder.description}
                    onChange={(e) => setSelectedOrder({ ...selectedOrder, description: e.target.value })}
                    className="bg-gray-700 border-gray-600"
                    rows={3}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditOrder} className="bg-gradient-to-r from-cyan-500 to-blue-600">
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>*/}
      </SidebarInset>
    </SidebarProvider>
  )
}
