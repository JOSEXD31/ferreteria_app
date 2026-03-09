import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        contrato: {
          take: 1, // Puedes ajustar esto según lógica de negocio (más reciente, activo, etc.)
          include: {
            servicio: true,
            usuario: true,
            caja: true,
          },
        },
      },
    })

    // Formatear los datos para que coincidan con tu interfaz
    const formattedClients = clientes.map((cli) => {
      const contrato = cli.contrato[0]

      return {
        cli_id: cli.cli_id,
        cli_tipo: cli.cli_tipo,
        cli_nombre: cli.cli_nombre ?? "",
        cli_apellido: cli.cli_apellido ?? "",
        cli_razonsoci: cli.cli_razonsoci ?? "",
        cli_dni: cli.cli_dni ?? "",
        cli_ruc: cli.cli_ruc ?? "",
        cli_direccion: cli.cli_direccion,
        cli_coordenada: cli.cli_coordenada,
        cli_cel: cli.cli_cel,
        id_serv: contrato?.id_serv ?? "",
        num_con: contrato?.num_con ?? "",
        serv_nombre: contrato?.servicio?.serv_nombre ?? "",
        fecha_registro: contrato?.fecha_registro?.toISOString().split("T")[0] ?? "",
        fecha_inicio: contrato?.fecha_inicio?.toISOString().split("T")[0] ?? "",
        estado: contrato?.estado?.toString() ?? "",
        usu_nombre: contrato?.usuario?.usu_nombre ?? "",
        id_tipo_comprobante: contrato?.id_tipo_comprobante,
        id_caja: contrato?.id_caja ?? "",
        id_nodo: contrato?.caja?.id_nodo ?? "",
      }
    })

    return NextResponse.json(formattedClients)
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
      { status: 500 }
    )
  }
}
