import { PrismaClient } from '@prisma/client';
import { seedExams } from './seeds/exams';
import { seedHospitals } from './seeds/hospitals.seed';
import { seedPatients } from './seeds/patients.seed';
import { seedRoles } from './seeds/roles.seed';
import { seedRoomsUsers } from './seeds/rooms-users.seed';
import { seedRooms } from './seeds/rooms.seed';
import { seedSchedulings } from './seeds/schedulings.seed';
import { seedUsers } from './seeds/user.seed';

const prisma = new PrismaClient();

async function main() {
    await seedRoles();
    await seedHospitals();
    await seedUsers();
    await seedRooms();
    await seedRoomsUsers();
    await seedPatients();
    await seedSchedulings();
    await seedExams();
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
