const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.configuracion_comprobante.count();
        if (count === 0) {
            await prisma.configuracion_comprobante.createMany({
                data: [
                    { nombre: 'Ticket', serie: 'T001', correlativo: 1, aplica_igv: false, porcentaje_igv: 0, activo: true },
                    { nombre: 'Boleta', serie: 'B001', correlativo: 1, aplica_igv: false, porcentaje_igv: 0, activo: true },
                    { nombre: 'Factura', serie: 'F001', correlativo: 1, aplica_igv: true, porcentaje_igv: 18, activo: true },
                    { nombre: 'Recibo', serie: 'R001', correlativo: 1, aplica_igv: false, porcentaje_igv: 0, activo: true },
                ]
            });
            console.log('Comprobantes inicializados con éxito.');
        } else {
            console.log('Ya existen comprobantes en la base de datos.');
        }
    } catch (e) {
        console.error('Error seeding comprobantes:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
