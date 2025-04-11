// prisma/seed.ts
import { NestFactory } from '@nestjs/core';
import { PrismaClient } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { UserService } from 'src/user/user.service';

const prisma = new PrismaClient();

async function main() {
    await createRoles();
    await createHospitals();
    await createRooms();
}

async function createRoles() {
    const roles = [
        {
            id: "f219e09f-2b41-4a00-a64f-c8d173358b97",
            name: "AdminGeral"
        },
        {
            id: "42d19c5d-2768-4921-89a1-31cb431069e4",
            name: "AdminHospital"
        },
        {
            id: "eb4a2dee-a352-4a51-84e5-439ddd04adf3",
            name: "Medico"
        },
        {
            id: "e27121c3-afe6-44dc-b8cc-5b7207c55de4",
            name: "Recepcionista"
        }
    ]


    await prisma.role.createMany({
        data: roles,
    })
}

async function createHospitals() {
    const hospitals = [
        {
            id: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            companyName: "Hospital do Felipe",
            cnpj: "11111111111111",
            phone: "18996953230",
        }
    ];

    await prisma.hospital.createMany({
        data: hospitals,
    })
}

async function createRooms() {
    const rooms = [
        {
            id: "b9b57940-aa58-45c5-bf51-2f08f60831fd",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            name: "Chat de Cirurgia",
            description: "Um chat para discutir assuntos de cirurgia",
            createdAt: "2025-04-03T19:04:26.646Z",
            updatedAt: "2025-04-03T19:04:26.646Z"
        },
        {
            id: "b628592b-8dd6-49d5-85bb-55494a457a4a",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            name: "Só os enfermeiros",
            description: "Um chat para os enfermeiros",
            createdAt: "2025-04-03T20:06:52.449Z",
            updatedAt: "2025-04-03T20:06:52.449Z"
        }
    ]

    await prisma.room.createMany({
        data: rooms,
    });
}

main()
    .then(() => {
        console.log('🌱 Seed concluída com sucesso!');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
