import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DetalleModalProps {
  abierto: boolean
  onClose: () => void
  datos: any[]
}

export default function DetalleModal({ abierto, onClose, datos }: DetalleModalProps) {
  return (
    <Dialog open={abierto} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-gray-900 border-gray-700 text-gray-100 
          w-full max-w-4xl h-full max-h-[90vh] p-4
          md:rounded-lg md:h-auto md:max-h-[70vh]
          flex flex-col
        "
      >
        <DialogHeader>
          <DialogTitle>Detalle del Reporte</DialogTitle>
        </DialogHeader>

        {/* Contenedor scroll horizontal para la tabla */}
        <div className="overflow-x-auto flex-grow mt-4">
          <table className="w-full min-w-[700px] text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-2 border border-gray-700 whitespace-nowrap">N° Comprobante</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Fecha</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Cliente</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Monto</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Comprobante</th>
                <th className="p-2 border border-gray-700 whitespace-nowrap">Método</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((item, i) => (
                <tr key={i} className="odd:bg-gray-800 even:bg-gray-700">
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.codigo}</td>                 
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.fecha}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.cliente}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">S/ {Number(item.monto).toFixed(2)}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.tipo_doc}</td>
                  <td className="p-2 border border-gray-700 whitespace-nowrap">{item.metodo_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
