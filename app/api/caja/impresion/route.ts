import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cod_comprobante = searchParams.get("cod_comprobante");

  if (!cod_comprobante) {
    return NextResponse.json(
      { message: "El parámetro 'cod_comprobante' es requerido" },
      { status: 400 }
    );
  }

  try {
    const comprobante = await prisma.comprobante_pago.findUnique({
      where: { cod_comprobante },
      include: {
        tipo_comprobante: true,
        contrato: {
          include: {
            cliente: true,
          },
        },
        detalle_pago: true,
        personal_oficina: {
          include: {
            usuario: true,
          },
        },
      },
    });

    if (!comprobante) {
      return NextResponse.json(
        { message: "Comprobante no encontrado" },
        { status: 404 }
      );
    }

    const cliente = comprobante.contrato?.cliente;

    const response = {
      cod_comprobante: comprobante.cod_comprobante,
      fecha_emision: comprobante.fecha_emision,
      monto_total: comprobante.monto_total,
      cliente: {
        cli_id: cliente?.cli_id,
        cli_nombre: cliente?.cli_nombre,
        cli_apellido: cliente?.cli_apellido,
        cli_razonsoci: cliente?.cli_razonsoci,
        cli_dni: cliente?.cli_dni,
        cli_ruc: cliente?.cli_ruc,
        cli_tipo: cliente?.cli_tipo,
        cli_direccion: cliente?.cli_direccion,
      },
      detalles_pago: comprobante.detalle_pago.map((detalle) => ({
        descripcion: detalle.descripcion,
        monto: detalle.monto,
        descuento: detalle.descuento,
        mot_descuento: detalle.mot_descuento,
      })),
      tipo_comprobante: comprobante.tipo_comprobante?.tipo,
      medio_pago: comprobante.medio_pago,
      cantidad_detalles: comprobante.detalle_pago.length,
      cajero: comprobante.personal_oficina?.usuario?.usu_nombre || "N/A",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error al obtener comprobante:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
