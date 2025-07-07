// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRooms() {
    const rooms = [
        {
            id: "b9b57940-aa58-45c5-bf51-2f08f60831fd",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            name: "Chat de Cirurgia",
            description: "Um chat para discutir assuntos de cirurgia"
        },
        {
            id: "b628592b-8dd6-49d5-85bb-55494a457a4a",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            name: "Chat dos Enfermeiros",
            description: "Um chat para os enfermeiros"
        }
    ];

    await prisma.room.createMany({
        data: rooms,
    });
}
