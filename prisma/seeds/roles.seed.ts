// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedRoles() {
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
