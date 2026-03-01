// /app/api/caja/reportexfecha/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Ajusta si tu instancia está en otra ruta
import { addDays } from "date-fns";


export async function POST(req: Request) {
    try {
        const { desde, hasta } = await req.json();

        if (!desde || !hasta) {
            return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
        }

        const desdeFecha = new Date(desde); // -> 2025-08-28
        const hastaFecha = addDays(new Date(hasta), 1); // -> 2025-08-29

        // Esto incluye todo el día 'hasta', porque usamos `lt` para el día siguiente
        const pagos = await prisma.comprobante_pago.findMany({
            where: {
                fecha_emision: {
                    gte: desdeFecha,
                    lt: hastaFecha, // IMPORTANTE: excluye a las 00:00 del día siguiente
                },
                estado: {
                    in: ["NORMAL", "ENVIADO"], // ← aquí incluyes ambos estados
                },
            },
            select: {
                monto_total: true,
                medio_pago: true,
                tipo_comprobante: {
                    select: {
                        tipo: true,
                    },
                },
                detalle_pago: {
                    select: {
                        descuento: true,
                    },
                },
            },
        });

        // Inicializar resumen
        let cantidad_pagos = pagos.length;
        let monto_total = 0;
        let total_descuentos = 0;

        let boletas = 0;
        let monto_boletas = 0;
        let facturas = 0;
        let monto_facturas = 0;
        let recibos = 0;
        let monto_recibos = 0;

        let efectivo = 0;
        let monto_efectivo = 0;
        let yape = 0;
        let monto_yape = 0;
        let transferencia = 0;
        let monto_transferencia = 0;

        for (const pago of pagos) {
            const monto = Number(pago.monto_total ?? 0);
            monto_total += monto;

            // Sumar descuentos
            const descuentosPago = pago.detalle_pago?.reduce((acc, det) => acc + Number(det.descuento || 0), 0) || 0;
            total_descuentos += descuentosPago;

            const tipo = pago.tipo_comprobante?.tipo?.toLowerCase() || "";
            if (tipo.includes("boleta")) {
                boletas++;
                monto_boletas += monto;
            } else if (tipo.includes("factura")) {
                facturas++;
                monto_facturas += monto;
            } else if (tipo.includes("recibo")) {
                recibos++;
                monto_recibos += monto;
            }

            const medio = pago.medio_pago?.toLowerCase() || "";
            if (medio.includes("efectivo")) {
                efectivo++;
                monto_efectivo += monto;
            } else if (medio.includes("yape")) {
                yape++;
                monto_yape += monto;
            } else if (medio.includes("transferencia")) {
                transferencia++;
                monto_transferencia += monto;
            }
        }

        return NextResponse.json({
            cantidad_pagos,
            monto_total,
            total_descuentos,
            boletas,
            monto_boletas,
            facturas,
            monto_facturas,
            recibos,
            monto_recibos,
            efectivo,
            monto_efectivo,
            yape,
            monto_yape,
            transferencia,
            monto_transferencia,
        });
    } catch (error) {
        console.error("Error al generar el reporte:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
