import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { num_con: string } }) {
  const { num_con } = params;

  try {
    const deudas = await prisma.deuda.findMany({
      where: {
        num_con,
        estado: 'ACTIVO',
      },
      select: {
        id_deuda: true,
        ano_mes: true,
        descripcion: true,
        monto: true,
      },
      orderBy: {
        ano_mes: 'asc',
      },
    });

    const formatted = deudas.map((d) => ({
      id: d.id_deuda,
      ano_mes: d.ano_mes ?? '',
      descripcion: d.descripcion ?? '',
      monto: Number(d.monto ?? 0),
      num_con: num_con,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error en API /deudas:', error);
    return NextResponse.json({ message: 'Error al obtener deudas' }, { status: 500 });
  }
}
