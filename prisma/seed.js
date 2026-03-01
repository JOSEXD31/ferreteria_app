const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = await prisma.usuario.upsert({
        where: { usuario: 'admin' },
        update: {},
        create: {
            nombre: 'Administrador del Sistema',
            usuario: 'admin',
            password: hashedPassword,
            rol: 'admin',
            estado: 1,
        },
    })

    console.log({ admin })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
