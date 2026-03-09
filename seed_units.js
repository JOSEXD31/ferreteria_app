const { PrismaClient } = require('./lib/generated/prisma');
const prisma = new PrismaClient();

async function main() {
    try {
        const unidadesBase = [
            { nombre: 'Unidad', abreviatura: 'Und' },
            { nombre: 'Metro', abreviatura: 'Mts' },
            { nombre: 'Kilogramo', abreviatura: 'Kg' },
            { nombre: 'Litro', abreviatura: 'Lt' },
            { nombre: 'Global', abreviatura: 'Glb' },
            { nombre: 'Bobina', abreviatura: 'Bob' },
        ];

        for (const u of unidadesBase) {
            const exists = await prisma.unidad_medida.findFirst({
                where: { abreviatura: u.abreviatura }
            });

            if (!exists) {
                await prisma.unidad_medida.create({
                    data: u
                });
                console.log(`Unidad created: ${u.nombre}`);
            } else {
                console.log(`Unidad already exists: ${u.nombre}`);
            }
        }

        console.log('Proceso de unidades finalizado.');
    } catch (e) {
        console.error('Error seeding unidades:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
