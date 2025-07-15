// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPatients() {
    const patients = [
        {
            id: "c41d959b-e06a-41a0-8ea4-33754ce26133",
            name: "Diomara de Barros",
            cpf: "12345678904",
            phone: "189912120101",
            email: "diomara@diomara.com",
            address: "Rua das Flores, 123",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91"
        },
        {
            id: "e19ee33e-894a-4ac3-b9b4-2cdeda45e334",
            name: "Guilherme Farto",
            cpf: "12345678905",
            phone: "189912120102",
            email: "guilherme@guilherme.com",
            address: "Rua Avenida Rui Barbosa, 321",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91"
        },
    ];

    await prisma.patient.createMany({
        data: patients,
    })
}
