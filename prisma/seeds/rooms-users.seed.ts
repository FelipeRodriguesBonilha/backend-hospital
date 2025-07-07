// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoomsUsers() {
    const roomsUsers = [
        {
            id: "0f69f263-55e8-4c8a-a7e5-7f6ec3360338",
            roomId: "b9b57940-aa58-45c5-bf51-2f08f60831fd",
            userId: "435541cd-7a82-42fc-a3ec-dadd65e8c4e0"
        },
        {
            id: "b203bc47-e943-4a41-aefb-fe959ff38b1a",
            roomId: "b9b57940-aa58-45c5-bf51-2f08f60831fd",
            userId: "8020b665-cb8a-4a33-a206-c674669200e2"
        },
    ];

    await prisma.roomUser.createMany({
        data: roomsUsers,
    })
}
