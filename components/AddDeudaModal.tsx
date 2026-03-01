"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function AddDeudaModal({
  num_con,
  onClose,
  onAdded,
}: {
  num_con: string;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [tipo, setTipo] = useState("");
  const [mes, setMes] = useState("");
  const currentYear = new Date().getFullYear();
  const [ano, setAno] = useState(currentYear.toString());
  const [detalle, setDetalle] = useState("");
  const [monto, setMonto] = useState("");
  const [loading, setLoading] = useState(false);

  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE",
  ];


  const handleSubmit = async () => {
    if (!tipo) {
      toast.error("Debe seleccionar un tipo de deuda");
      return;
    }

    if (tipo !== "RECONEXION" && !mes) {
      toast.error("Debe seleccionar un mes");
      return;
    }

    if (tipo === "OTROS" && (!detalle || !monto)) {
      toast.error("Debe ingresar detalle y monto");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/deuda/agregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          mes,
          ano,
          num_con,
          detalle,
          monto,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al registrar deuda");
      } else {
        toast.success("Deuda registrada correctamente");
        onAdded();
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* contenedor con ref para detectar clic fuera */}
      <div>
        <Card className="relative w-full max-w-md bg-gray-900 border border-gray-700 text-white shadow-2xl animate-in fade-in-50 slide-in-from-bottom-2">
          <CardHeader>
            <CardTitle className="text-xl text-center text-gray-100">
              Agregar Deuda
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Tipo */}
            <div className="space-y-1">
              <Label>Tipo de deuda</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                {/* 🔹 Aseguramos que el dropdown esté por encima del modal */}
                <SelectContent className="z-[10000] bg-gray-800 text-white border-gray-700">
                  <SelectItem value="RECONEXION">RECONEXIÓN</SelectItem>
                  <SelectItem value="MENSUALIDAD">MENSUALIDAD</SelectItem>
                  <SelectItem value="OTROS">OTROS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Mes</Label>
                <Select value={mes} onValueChange={(v) => setMes(v)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Mes..." />
                  </SelectTrigger>
                  <SelectContent className="z-[10000] bg-gray-800 text-white border-gray-700">
                    {meses.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Año</Label>
                <Select value={ano} onValueChange={(v) => setAno(v)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Año..." />
                  </SelectTrigger>
                  <SelectContent className="z-[10000] bg-gray-800 text-white border-gray-700">
                    <SelectItem value={(currentYear - 1).toString()}>{currentYear - 1}</SelectItem>
                    <SelectItem value={currentYear.toString()}>{currentYear}</SelectItem>
                    <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Solo si es OTROS */}
            {tipo === "OTROS" && (
              <>
                <div className="space-y-1">
                  <Label>Descripcion</Label>
                  <Input
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                    placeholder="Indique la descripción"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Monto</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="Ingrese monto"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white"
              >
                Cancelar
              </Button>
              <Button
                disabled={loading}
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
