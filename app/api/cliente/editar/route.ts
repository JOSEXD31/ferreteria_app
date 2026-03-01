import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { cliente, contrato } = await req.json();

    // Actualizar cliente
    await prisma.cliente.update({
      where: {
        cli_id: cliente.cli_id,
      },
      data: {
        cli_tipo: cliente.cli_tipo,
        cli_nombre: cliente.cli_nombre,
        cli_apellido: cliente.cli_apellido,
        cli_razonsoci: cliente.cli_razonsoci,
        cli_dni: cliente.cli_dni,
        cli_ruc: cliente.cli_ruc,
        cli_direccion: cliente.cli_direccion,
        cli_coordenada: cliente.cli_coordenada,
        cli_cel: cliente.cli_cel,
      },
    });

    // Actualizar contrato
    await prisma.contrato.update({
      where: {
        num_con: contrato.num_con,
      },
      data: {
        id_serv: contrato.id_serv,
        id_caja: contrato.id_caja,
        estado: contrato.estado,
      },
    });

    return NextResponse.json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error("Error al editar cliente:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
