import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"

export async function POST(req: Request) {
    try {
        const { desde, hasta } = await req.json()

        if (!desde || !hasta) {
            return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 })
        }

        const desdeFecha = new Date(desde)
        const hastaFecha = addDays(new Date(hasta), 1)

        const comprobantes = await prisma.comprobante_pago.findMany({
            where: {
                fecha_emision: {
                    gte: desdeFecha,
                    lt: hastaFecha,
                },
                estado: {
                    in: ["NORMAL", "ENVIADO"], // ← aquí incluyes ambos estados
                },
            },
            orderBy: {
                fecha_emision: "asc",
            },
            select: {
                cod_comprobante: true,
                fecha_emision: true,
                monto_total: true,
                medio_pago: true,
                tipo_comprobante: {
                    select: {
                        tipo: true,
                    },
                },
                contrato: {
                    select: {
                        cliente: {
                            select: {
                                cli_nombre: true,
                                cli_apellido: true,
                                cli_razonsoci: true,
                                cli_tipo: true,
                            },
                        }
                    },
                },
            },
        })

        // Formateamos los resultados
        const data = comprobantes.map((c) => {
            let clienteNombre = "Sin nombre"
            if (c.contrato?.cliente) {
                const cli = c.contrato.cliente
                if (cli.cli_tipo === "NATURAL") {
                    clienteNombre = `${cli.cli_nombre ?? ""} ${cli.cli_apellido ?? ""}`.trim()
                } else if (cli.cli_tipo === "JURIDICA") {
                    clienteNombre = cli.cli_razonsoci ?? "Sin razón social"
                }
            }

            return {
                codigo: c.cod_comprobante,
                fecha: c.fecha_emision.toISOString().replace("T", " ").replace(".000Z", ""),
                cliente: clienteNombre,
                monto: Number(c.monto_total ?? 0),
                tipo_doc: c.tipo_comprobante?.tipo ?? "N/A",
                metodo_pago: c.medio_pago?.toUpperCase() ?? "N/A",
            }
        })
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error al obtener detalles del reporte:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}
