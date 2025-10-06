// prisma/seeds/posts.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPatients() {
    const patients = [
        {
            id: "c41d959b-e06a-41a0-8ea4-33754ce26133",
            name: "Mariana Oliveira",
            cpf: "53729184052",
            phone: "11987452367",
            email: "marianaoliveira@email.com",
            address: "Rua das Acácias, 457",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91"
        },
        {
            id: "e19ee33e-894a-4ac3-b9b4-2cdeda45e334",
            name: "Rafael Santos",
            cpf: "40298571634",
            phone: "21996354127",
            email: "rafaelsantos@email.com",
            address: "Avenida Paulista, 900",
            hospitalId: "8461fdb7-c0e4-45ce-ab14-975d1e923d91"
        }        
    ];

    await prisma.patient.createMany({
        data: patients,
    })
}
