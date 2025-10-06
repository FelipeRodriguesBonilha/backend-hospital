import { Injectable } from '@nestjs/common';
import { Hospital } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateHospitalDto } from './__dtos__/create-hospital.dto';
import { UpdateHospitalDto } from './__dtos__/update-hospital.dto';

@Injectable()
export class HospitalService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async create(createHospitalDto: CreateHospitalDto) {
        return await this.prisma.hospital.create({
            data: createHospitalDto,
        });
    }

    async findAll(companyName: string, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [hospitals, total] = await Promise.all([
            this.prisma.hospital.findMany({
                where: {
                    companyName: {
                        contains: companyName,
                        mode: 'insensitive',
                    },
                },
                skip,
                take: limit,
            }),
            this.prisma.hospital.count({
                where: {
                    companyName: {
                        contains: companyName,
                        mode: 'insensitive',
                    },
                },
            }),
        ]);

        return {
            data: hospitals,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string) {
        return await this.prisma.hospital.findUnique({
            where: { id },
        });
    }

    async update(id: string, updateHospitalDto: UpdateHospitalDto) {
        return await this.prisma.hospital.update({
            where: { id },
            data: updateHospitalDto,
        });
    }

    async remove(id: string) {
        return await this.prisma.hospital.delete({
            where: { id },
        });
    }
}
