import { Injectable } from '@nestjs/common';
import { Hospital } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateHospitalDto } from './__dtos__/create-hospital.dto';
import { UpdateHospitalDto } from './__dtos__/update-hospital.dto';

@Injectable()
export class HospitalService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
        const createdHospital = await this.prisma.hospital.create({
            data: createHospitalDto,
        });

        return createdHospital;
    }

    async findAll(): Promise<Hospital[]> {
        const hospital = await this.prisma.hospital.findMany();

        return hospital;
    }

    async findById(id: string): Promise<Hospital> {
        const hospital = await this.prisma.hospital.findUnique({
            where: { id },
        });

        return hospital;
    }

    async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
        const updatedHospital = await this.prisma.hospital.update({
            where: { id },
            data: updateHospitalDto,
        });

        return updatedHospital;
    }

    async remove(id: string): Promise<Hospital> {
        const deletedHospital = await this.prisma.hospital.delete({
            where: { id },
        });

        return deletedHospital;
    }
}
