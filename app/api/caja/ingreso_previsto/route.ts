import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRawUnsafe<any[]>(
      `CALL sp_monto_previsto_facturacion()`
    );

    const rows = Array.isArray(result[0]) ? result[0] : result;

    const data = rows.map((r) => ({
      mes_ano: r.f0,
      monto: Number(r.f1),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error ejecutando SP:", error);
    return NextResponse.json(
      { error: "Error al obtener ingreso previsto" },
      { status: 500 }
    );
  }
}
