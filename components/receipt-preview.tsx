"use client"

import { forwardRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { customers, debts, payments, users } from "@/lib/database"


interface ReceiptPreviewProps {
  payment: Payment
  className?: string
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

 interface Service {
  id: string
  customerId: string
  type: "cable" | "internet" | "combo"
  plan: string
  monthlyAmount: number
  installationDate: Date
  status: "active" | "suspended" | "cancelled"
}


export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(({ payment, className = "" }, ref) => {
  const customer = getCustomerById(payment.customerId)
  const debts = payment.debtIds.map((id) => getDebtById(id)).filter(Boolean) as Debt[]

  if (!customer) return null

  const receiptTitle = {
    boleta: "BOLETA DE VENTA ELECTRÓNICA",
    factura: "FACTURA ELECTRÓNICA",
    recibo: "RECIBO DE PAGO",
  }[payment.receiptType]

  const companyInfo = {
    name: "TELECOMUNICACIONES DEL PERÚ S.A.C.",
    ruc: "20123456789",
    address: "Av. Tecnología 123, Lima - Perú",
    phone: "(01) 234-5678",
    email: "info@telecomperu.com",
  }


  function getCustomerById(id: string): Customer | undefined {
    return customers.find((customer) => customer.id === id)
  }
  
  function getDebtById(id: string): Debt | undefined {
    return debts.find((debt) => debt.id === id)
  }


  return (
    <div ref={ref} className={`bg-white ${className}`}>
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{companyInfo.name}</h1>
            <p className="text-sm text-gray-600">RUC: {companyInfo.ruc}</p>
            <p className="text-sm text-gray-600">{companyInfo.address}</p>
            <p className="text-sm text-gray-600">
              Tel: {companyInfo.phone} | Email: {companyInfo.email}
            </p>
          </div>

          <Separator className="mb-6" />

          {/* Receipt Type and Number */}
          <div className="text-center mb-6">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {receiptTitle}
            </Badge>
            <p className="text-xl font-bold mt-2">{payment.receiptNumber}</p>
          </div>

          <Separator className="mb-6" />

          {/* Customer and Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">DATOS DEL CLIENTE</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Nombre:</span> {customer.name}
                </p>
                <p>
                  <span className="font-medium">DNI:</span> {customer.dni}
                </p>
                <p>
                  <span className="font-medium">Teléfono:</span> {customer.phone}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {customer.email}
                </p>
                <p>
                  <span className="font-medium">Dirección:</span> {customer.address}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">DATOS DEL PAGO</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Fecha:</span>{" "}
                  {new Date(payment.paymentDate).toLocaleDateString("es-PE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Hora:</span> {new Date(payment.paymentDate).toLocaleTimeString("es-PE")}
                </p>
                <p>
                  <span className="font-medium">Método de Pago:</span>{" "}
                  {payment.paymentMethod === "efectivo"
                    ? "Efectivo"
                    : payment.paymentMethod === "yape"
                      ? "Yape"
                      : "Transferencia Bancaria"}
                </p>
                <p>
                  <span className="font-medium">Cajero:</span> {payment.cashierId}
                </p>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Services/Debts Detail */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">DETALLE DE SERVICIOS PAGADOS</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Descripción</th>
                    <th className="text-center py-2">Período</th>
                    <th className="text-right py-2">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.map((debt) => (
                    <tr key={debt.id} className="border-b">
                      <td className="py-2">{debt.description}</td>
                      <td className="text-center py-2">
                        {new Date(debt.month + "-01").toLocaleDateString("es-PE", {
                          year: "numeric",
                          month: "long",
                        })}
                      </td>
                      <td className="text-right py-2">S/ {debt.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Totals */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>S/ {payment.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>IGV (18%):</span>
              <span>S/ {(payment.amount * 0.18).toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>S/ {(payment.amount * 1.18).toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Observaciones:</h4>
              <p className="text-sm text-gray-600">{payment.notes}</p>
            </div>
          )}

          <Separator className="mb-6" />

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Gracias por su pago puntual</p>
            <p>Este comprobante es válido como sustento de pago</p>
            <p>
              Para consultas: {companyInfo.phone} | {companyInfo.email}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

ReceiptPreview.displayName = "ReceiptPreview"
