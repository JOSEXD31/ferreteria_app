// app/api/caja/deudaMasiva/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ajusta si tu ruta es diferente

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mes, anio } = body;

    if (!anio || !mes) {
      return NextResponse.json({ message: 'Año y mes son requeridos' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`CALL GenerarDeudaMasiva(${Number(anio)}, ${Number(mes)})`);

    return NextResponse.json({ message: 'Deuda generada exitosamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al generar deuda masiva:', error);
    return NextResponse.json({ message: 'Error interno al generar deuda' }, { status: 500 });
  }
}
