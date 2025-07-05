// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedUsers() {
    const users = [
        {
            id: "fcbfafe2-1e72-4bdc-808f-2edaa324c5da",
            name: "Administrador Geral",
            cpf: "52502038869",
            phone: "18996953230",
            email: "admin@example.com",
            password: "admin123",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            roleId: "f219e09f-2b41-4a00-a64f-c8d173358b97"
        }
    ];

    await prisma.user.createMany({
        data: users,
    });
}
