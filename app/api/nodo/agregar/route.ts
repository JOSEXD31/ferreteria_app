import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const {
            nombre,
            descripcion,
            coordenada,
            num_cajas
        } = await req.json();

        console.log(nombre,descripcion,coordenada,num_cajas)

        if (!nombre) {
            return NextResponse.json(
                { error: "Registre un nombre" },
                { status: 400 }
            );
        }

        if (!descripcion) {
            return NextResponse.json(
                { error: "Agregue una descripcion" },
                { status: 400 }
            );
        }
        if (!coordenada) {
            return NextResponse.json(
                { error: "Ingrese una coordenada" },
                { status: 400 }
            );
        }
        if (!num_cajas) {
            return NextResponse.json(
                { error: "Indique el numero de caja" },
                { status: 400 }
            );
        }

        // Crear Nodo
        const nodo = await prisma.nodo.create({
            data: {
                nombre,
                descripcion,
                coordenada,
            },
        });

        // Crear las cajas asociadas al nodo
        const cajasData = Array.from({ length: num_cajas }, (_, i) => ({
            nombre: `CAJA ${i + 1} - ${nombre}`,
            descripcion: "",
            coordenada: "",
            id_nodo: nodo.id_nodo,
        }));

        
        await prisma.caja.createMany({
            data: cajasData,
        });

        return NextResponse.json({ nodo });
        
    } catch (error) {
        console.error("Error al crear nodo y cajas:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
