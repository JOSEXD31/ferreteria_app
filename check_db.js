const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    try {
        const counts = {
            usuarios: await prisma.usuario.count(),
            productos: await prisma.producto.count(),
            ventas: await prisma.venta.count(),
            clientes: await prisma.cliente.count(),
            empresa: await prisma.empresa.count(),
            config_comprobantes: await prisma.configuracion_comprobante.count(),
        };
        console.log('Database Status:');
        console.log(JSON.stringify(counts, null, 2));

        const columns = await prisma.$queryRaw`DESCRIBE ventas`;
        console.log('Columns in ventas:');
        console.log(JSON.stringify(columns, null, 2));

    } catch (e) {
        console.error('Error checking database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
