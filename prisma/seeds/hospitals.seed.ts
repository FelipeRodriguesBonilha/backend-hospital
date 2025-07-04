// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedHospitals() {
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
