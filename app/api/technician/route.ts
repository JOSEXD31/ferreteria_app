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
        usu_rol: "TECNICO",
        usu_estado: 1,
        usu_fecha: new Date(),
      },
    });

    const technician = await prisma.tecnico.create({
      data: {
        tec_id: user.usu_id,
        tec_estado: "Disponible",
        tec_id_especialidad: esp_id,
        usuario_usu_id: user.usu_id,
      },
    });

    return NextResponse.json({ technician });
  } catch (error) {
    console.error("Error al crear técnico:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// GET: Listar técnicos
export async function GET() {
  try {
    const technicians = await prisma.tecnico.findMany({
      include: {
        usuario: true,
        orden_trabajo: {
          where: {
            ord_estado: 1,
          },
        },
        especialidad: true,
      },
    });

    const result = technicians.map((technician) => ({
      id: `TEC-${technician.usuario.usu_dni}`,
      name: technician.usuario.usu_nombre || "",
      email: technician.usuario.usu_correo || "",
      phone: technician.usuario.usu_cel || "",
      specialization: technician.especialidad?.esp_nombre || "Sin especialidad",
      status: technician.tec_estado,
      activeOrders: technician.orden_trabajo.length,
      completedOrders: 0,
      joinDate: technician.usuario.usu_fecha?.toISOString().split("T")[0] || "",
      avatar: undefined,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error al obtener técnicos:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
