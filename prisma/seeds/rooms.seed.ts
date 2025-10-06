// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRooms() {
    const rooms = [
        {
            id: "b9b57940-aa58-45c5-bf51-2f08f60831fd",
            adminId: "435541cd-7a82-42fc-a3ec-dadd65e8c4e0",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            name: "Chat de Cirurgia",
            description: "Um chat para discutir assuntos de cirurgia"
        },
        {
            id: "b628592b-8dd6-49d5-85bb-55494a457a4a",
            adminId: "8020b665-cb8a-4a33-a206-c674669200e2",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            name: "Chat dos Enfermeiros",
            description: "Um chat para os enfermeiros"
        }
    ];

    await prisma.room.createMany({
        data: rooms,
    });
}
