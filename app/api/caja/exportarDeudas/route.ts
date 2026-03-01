import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  const estadoParam = req.nextUrl.searchParams.get("estado");

  // Validar parámetro
  if (!estadoParam || (estadoParam !== "activo" && estadoParam !== "cortado")) {
    return new Response(JSON.stringify({ error: "Parámetro 'estado' inválido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const estadoContrato = estadoParam === "activo" ? 1 : 0;

  // Consulta SQL raw usando Prisma
  const resultados = await prisma.$queryRawUnsafe<
    {
      contrato_num: string;
      cliente_nombre: string;
      documento: string;
      direccion: string;
      celular: string;
      num_deudas: number;
      detalle: string;
      monto_total: number;
    }[]
  >(`
    SELECT 
      c.num_con AS contrato_num,
      CASE 
        WHEN cl.cli_tipo = 'NATURAL' THEN CONCAT(COALESCE(cl.cli_apellido, ''), ' ', COALESCE(cl.cli_nombre, ''))
        ELSE COALESCE(cl.cli_razonsoci, '')
      END AS cliente_nombre,
      CASE 
        WHEN cl.cli_tipo = 'NATURAL' THEN COALESCE(cl.cli_dni, '')
        ELSE COALESCE(cl.cli_ruc, '')
      END AS documento,
      COALESCE(cl.cli_direccion, '') AS direccion,
      COALESCE(cl.cli_cel, '') AS celular,
      COUNT(d.id_deuda) AS num_deudas,
      GROUP_CONCAT(CONCAT(d.descripcion, ' - S/. ', FORMAT(d.saldo_pendiente, 2)) SEPARATOR ' -- || -- ') AS detalle,
      SUM(d.saldo_pendiente) AS monto_total
    FROM contrato c
    JOIN cliente cl ON cl.cli_id = c.id_cli
    JOIN deuda d ON d.num_con = c.num_con
    WHERE 
      c.estado = ${estadoContrato}
      AND cl.cli_estado = 'ACTIVO'
      AND d.estado = 'ACTIVO'
    GROUP BY c.num_con
  `);

  // Crear archivo Excel
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Deudas");

  worksheet.columns = [
    { header: "N°", key: "numero", width: 5 },
    { header: "Contrato", key: "contrato", width: 15 },
    { header: "Cliente", key: "cliente", width: 30 },
    { header: "Documento", key: "documento", width: 20 },
    { header: "Dirección", key: "direccion", width: 30 },
    { header: "Celular", key: "celular", width: 15 },
    { header: "N° Deudas", key: "num_deudas", width: 12 },
    { header: "Detalle", key: "detalle", width: 60 },
    { header: "Monto Total", key: "monto_total", width: 15 },
  ];

  const safeResultados = resultados.map((r) => ({
    ...r,
    num_deudas: Number(r.num_deudas),
    monto_total: Number(r.monto_total),
  }));

  let index = 1;

  for (const r of safeResultados) {
    worksheet.addRow({
      numero: index++,
      contrato: r.contrato_num,
      cliente: r.cliente_nombre,
      documento: r.documento,
      direccion: r.direccion,
      celular: r.celular,
      num_deudas: r.num_deudas,
      detalle: r.detalle,
      monto_total: r.monto_total.toFixed(2),
    });
  }


  // Exportar archivo Excel
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="deudas_${estadoParam}.xlsx"`,
    },
  });
}
