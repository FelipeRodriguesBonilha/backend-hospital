import { PrismaClient } from '@prisma/client';
import { seedHospitals } from './seeds/hospitals.seed';
import { seedRoles } from './seeds/roles.seed';
import { seedRooms } from './seeds/rooms.seed';

const prisma = new PrismaClient();

async function main() {
    await seedRoles();
    await seedHospitals();
    await seedRooms();
}

main()
    .then(() => {
        console.log('Seed concluída com sucesso!');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
