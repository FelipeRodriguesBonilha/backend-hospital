// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedExams() {
    const exams = [
        {
            id: "737ec7a4-2c2c-41ca-97ca-336ff18fcfed",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            createdById: '8020b665-cb8a-4a33-a206-c674669200e2',
            providerId: '435541cd-7a82-42fc-a3ec-dadd65e8c4e0',
            patientId: 'c41d959b-e06a-41a0-8ea4-33754ce26133',
            description: "Exame de sangue",
        },
        {
            id: "c51756b7-40a6-423d-bb22-9028e6ae11a8",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            createdById: '8020b665-cb8a-4a33-a206-c674669200e2',
            providerId: '435541cd-7a82-42fc-a3ec-dadd65e8c4e0',
            patientId: 'e19ee33e-894a-4ac3-b9b4-2cdeda45e334',
            description: "Exame de urina",
        },
    ];

    await prisma.exam.createMany({
        data: exams,
    });
}
