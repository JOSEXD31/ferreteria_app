import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// POST: Crear nuevo técnico
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, esp_id, dni } = await req.json();
    const hashedPassword = await bcrypt.hash(dni, 10);

    const user = await prisma.usuario.create({
      data: {
        usu_usuario: dni,
        usu_cel: phone,
        usu_contrasena: hashedPassword,
        usu_nombre: name,
        usu_correo: email,
        usu_dni: dni,
        usu_rol: "OFICINA",
        usu_estado: 1,
        usu_fecha: new Date(),
      },
    });

    const per_oficina = await prisma.personal_oficina.create({
      data: {
        per_id: user.usu_id,
        per_estado: "ACTIVO",
        usuario_usu_id: user.usu_id,
      },
    });

    return NextResponse.json({ per_oficina });
  } catch (error) {
    console.error("Error al crear personal de oficina:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Listar personal de oficina
export async function GET() {
  try {
    const per_oficina = await prisma.personal_oficina.findMany({
      include: {
        usuario: true,
      },
    });

    const result = per_oficina.map((per_oficina) => ({
      id: `OFI-${per_oficina.usuario.usu_dni}`,
      name: per_oficina.usuario.usu_nombre || "",
      email: per_oficina.usuario.usu_correo || "",
      phone: per_oficina.usuario.usu_cel || "",
      status: per_oficina.per_estado,
      joinDate: per_oficina.usuario.usu_fecha?.toISOString().split("T")[0] || "",
      avatar: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
