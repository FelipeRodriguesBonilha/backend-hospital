// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';
import { createPasswordHashed } from '../../src/utils/password';

const prisma = new PrismaClient();

export async function seedUsers() {
    const users = [
        {
            id: "fcbfafe2-1e72-4bdc-808f-2edaa324c5da",
            name: "Administrador Geral",
            cpf: "52592938869",
            phone: "18996953230",
            email: "admin@admin.com",
            password: "admin",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            roleId: "f219e09f-2b41-4a00-a64f-c8d173358b97"
        },
        {
            id: "96bd058b-4ee9-4e52-a81f-3a7dd0131f01",
            name: "Felipe Rodrigues Moya Bonilha",
            cpf: "12345678901",
            phone: "18996953231",
            email: "felipebonilha013@gmail.com",
            password: "felipe123",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            roleId: "42d19c5d-2768-4921-89a1-31cb431069e4"
        },
        {
            id: "435541cd-7a82-42fc-a3ec-dadd65e8c4e0",
            name: "Luiz Carlos Begosso",
            cpf: "12345678902",
            phone: "18996953232",
            email: "begosso@begosso.com",
            password: "begosso123",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            roleId: "eb4a2dee-a352-4a51-84e5-439ddd04adf3"
        },
        {
            id: "8020b665-cb8a-4a33-a206-c674669200e2",
            name: "Almir Camolesi",
            cpf: "12345678903",
            phone: "18996953233",
            email: "camolesi@camolesi.com",
            password: "camolesi123",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            roleId: "e27121c3-afe6-44dc-b8cc-5b7207c55de4"
        },
    ];

    const usersWithPassHashed = await Promise.all(
        users.map(async (user) => ({
            ...user,
            password: await createPasswordHashed(user.password),
        }))
    );

    await prisma.user.createMany({
        data: usersWithPassHashed,
    });
}
