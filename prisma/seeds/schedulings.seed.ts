// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedSchedulings() {
    const shedulings = [
        {
            id: '315a24d5-c1f5-4029-b9ed-7ae430038179',
            hospitalId: '8461fdb7-c0e4-45ce-ab14-975d1e923d91',
            createdById: '8020b665-cb8a-4a33-a206-c674669200e2',
            providerId: '435541cd-7a82-42fc-a3ec-dadd65e8c4e0',
            patientId: 'c41d959b-e06a-41a0-8ea4-33754ce26133',
            observation: 'Paciente com dor lombar',
            startDate: new Date('2025-07-06T13:00:00'),
            endDate: new Date('2025-07-06T14:00:00'),
        },
        {
            id: 'a805f05c-95f7-4c8e-8c51-d5b6ba1a988d',
            hospitalId: '8461fdb7-c0e4-45ce-ab14-975d1e923d91',
            createdById: '8020b665-cb8a-4a33-a206-c674669200e2',
            providerId: '435541cd-7a82-42fc-a3ec-dadd65e8c4e0',
            patientId: 'e19ee33e-894a-4ac3-b9b4-2cdeda45e334',
            observation: 'Paciente com muitas dores',
            startDate: new Date('2025-07-06T14:00:00'),
            endDate: new Date('2025-07-06T15:00:00'),
        }
    ];

    await prisma.scheduling.createMany({
        data: shedulings,
    });
}
