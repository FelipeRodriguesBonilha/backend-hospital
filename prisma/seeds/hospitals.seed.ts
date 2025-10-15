// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedHospitals() {
    const hospitals = [
        {
            id: "8461fdb7-c0e4-45ce-ab14-975d1e923d91",
            companyName: "Santa Casa de Misericórdia de Assis",
            cnpj: "44364826000105",
            phone: "1833023311",
        },
        {
            id: "1f4c3b40-2a16-4a17-913d-5296da0fa2ec",
            companyName: "Hospital Regional de Assis",
            cnpj: "46374500012362",
            phone: "1833026000",
        }
    ];

    await prisma.hospital.createMany({
        data: hospitals,
    })
}
