import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Crear nuevo cliente
export async function POST(req: NextRequest) {
    try {
        const {
            id,
            nombre,
            apellido,
            razon_social,
            dni,
            ruc,
            direccion,
            celular,
            num_contrato,
            tipoServicio,
            fechaInicio,
            id_user,
            tec_id,
            coordenada,
            id_caja,
            tipoComprobante
        } = await req.json();

        // Validar si el número de contrato ya existe
        const existingContrato = await prisma.contrato.findUnique({
            where: {
                num_con: num_contrato,
            },
        });

        if (existingContrato) {
            return NextResponse.json(
                { error: "El número de contrato ingresado ya existe." },
                { status: 400 }
            );
        }

        // Obtener la fecha actual para generar el código
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2); // '25'
        const month = (now.getMonth() + 1).toString().padStart(2, "0"); // '07'

        const prefix = `${year}${month}`; // '2507'
        const lastCliente = await prisma.cliente.findFirst({
            where: {
                cli_id: {
                    startsWith: prefix,
                },
            },
            orderBy: {
                cli_id: 'desc',
            },
            select: {
                cli_id: true,
            },
        });

        let nextNumber = 1;
        if (lastCliente?.cli_id) {
            const lastNumber = parseInt(lastCliente.cli_id.slice(4)); // '25070003' => 3
            nextNumber = lastNumber + 1;
        }

        const correlativo = nextNumber.toString().padStart(4, '0');
        const cli_id = `${prefix}${correlativo}`; // '25070004', etc.

        // Determinar tipo de cliente y campos correspondientes
        const isPersonal = nombre && apellido && dni;
        const isEmpresa = razon_social && ruc;
        const cli_tipo = isEmpresa ? "JURIDICA" : isPersonal ? "NATURAL" : null;

        if (!cli_tipo) {
            return NextResponse.json(
                { error: "Datos insuficientes para determinar el tipo de cliente." },
                { status: 400 }
            );
        }

        if (!tipoServicio) {
            return NextResponse.json(
                { error: "Seleccione un servicio valido" },
                { status: 400 }
            );
        }
        if (!tec_id) {
            return NextResponse.json(
                { error: "Seleccione el tecnico responsable" },
                { status: 400 }
            );
        }
        if (!fechaInicio) {
            return NextResponse.json(
                { error: "Indique la fecha de inicio" },
                { status: 400 }
            );
        }

        // Crear cliente
        const cliente = await prisma.cliente.create({
            data: {
                cli_id,
                cli_nombre: isPersonal ? nombre : null,
                cli_apellido: isPersonal ? apellido : null,
                cli_dni: isPersonal ? dni : null,
                cli_razonsoci: isEmpresa ? razon_social : null,
                cli_ruc: isEmpresa ? ruc : null,
                cli_direccion: direccion,
                cli_coordenada: coordenada,
                cli_cel: celular,
                cli_estado: "ACTIVO",
                cli_tipo: cli_tipo,
            },
        });

        // Crear contrato
        const contrato = await prisma.contrato.create({
            data: {
                num_con: num_contrato,
                id_cli: cli_id,
                id_serv: parseInt(tipoServicio),
                fecha_registro: new Date(),
                fecha_inicio: new Date(fechaInicio),
                fecha_fin: null,
                estado: 2,
                id_user: parseInt(id_user),
                tec_id: parseInt(tec_id),
                id_caja: parseInt(id_caja),
                id_tipo_comprobante: parseInt(tipoComprobante),
            },
        });


        const servicio = await prisma.servicio.findUnique({
            where: { serv_id: parseInt(tipoServicio) },
            select: {
                serv_nombre: true,
                serv_precio: true,
            },
        });

        if (!servicio) {
            return NextResponse.json(
                { error: "Servicio no encontrado." },
                { status: 400 }
            );
        }

        //Creación de orden de trabajo
        const ord_trabajo = await prisma.orden_trabajo.create({
            data: {
                ord_descripcion: `INSTALACION DE ${servicio.serv_nombre?.toUpperCase()}`,
                ord_fecha_asignacion: new Date(fechaInicio),
                ord_fecha_finalizacion: undefined,
                ord_estado: 1,
                ord_prioridad: "Alta",
                tec_id: tec_id,
                per_id: parseInt(id_user),
                num_con: num_contrato,
                tip_id: 1,
            }
        });
        /*
        //////////////CREACION DE DEUDA//////////////////////
        const servicio = await prisma.servicio.findUnique({
            where: { serv_id: parseInt(tipoServicio) },
            select: {
                serv_nombre: true,
                serv_precio: true,
            },
        });

        if (!servicio) {
            return NextResponse.json(
                { error: "Servicio no encontrado." },
                { status: 400 }
            );
        }
        const fechaInicioDate = new Date(`${fechaInicio}T00:00:00`);
        const anio = fechaInicioDate.getFullYear();
        const mes = fechaInicioDate.getMonth(); // 0-indexed

        // Obtener cantidad de días en el mes
        const ultimoDiaDelMes = new Date(anio, mes + 1, 0).getDate();
        const diaInicio = fechaInicioDate.getDate();

        // Si se registra el último día del mes, no crear deuda
        if (diaInicio < ultimoDiaDelMes) {
            // Si se registra el primer día del mes, se cobra el precio completo
            if (diaInicio === 1) {
                const monto = Number(servicio.serv_precio);

                const ano_mes = `${anio}-${(mes + 1).toString().padStart(2, "0")}`;
                const nombreServicio = servicio.serv_nombre || "Servicio";
                const descripcion = `${nombreServicio.toUpperCase()} ${fechaInicioDate.toLocaleString("es-PE", {
                    month: "long",
                    year: "numeric"
                }).toUpperCase()}`;

                await prisma.deuda.create({
                    data: {
                        ano_mes,
                        descripcion,
                        monto,
                        saldo_pendiente: monto,
                        estado: "ACTIVO",
                        id_servicio: parseInt(tipoServicio),
                        num_con: num_contrato,
                    },
                });
            } else {
                // Si no es el primer día, se calcula prorrateo
                const diasRestantes = ultimoDiaDelMes - diaInicio;

                const precioDecimal = Number(servicio.serv_precio);
                const montoCrudo = (precioDecimal / ultimoDiaDelMes) * diasRestantes;

                const monto = Math.floor(montoCrudo * 10) / 10;

                const ano_mes = `${anio}-${(mes + 1).toString().padStart(2, "0")}`;
                const nombreServicio = servicio.serv_nombre || "Servicio";
                const descripcion = `${nombreServicio.toUpperCase()} ${fechaInicioDate.toLocaleString("es-PE", {
                    month: "long",
                    year: "numeric"
                }).toUpperCase()}`;

                await prisma.deuda.create({
                    data: {
                        ano_mes,
                        descripcion,
                        monto,
                        saldo_pendiente: monto,
                        estado: "ACTIVO",
                        id_servicio: parseInt(tipoServicio),
                        num_con: num_contrato,
                    },
                });
            }
        }*/
        return NextResponse.json({ cliente });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
