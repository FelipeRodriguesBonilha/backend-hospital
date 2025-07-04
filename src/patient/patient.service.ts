import { Injectable } from '@nestjs/common';
import { CreatePatientDto } from './__dtos__/create-patient.dto';
import { UpdatePatientDto } from './__dtos__/update-patient.dto';
import { PrismaService } from 'src/prisma.service';
import { Patient } from '@prisma/client';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const createdPatient = await this.prisma.patient.create({
      data: createPatientDto,
    });

    return createdPatient;
  }

  async findAll(): Promise<Patient[]> {
    const patient = await this.prisma.patient.findMany();

    return patient;
  }

  async findById(id: string): Promise<Patient> {
    const patient = await this.prisma.patient.findUnique({
      where: { id },
    });

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const updatedPatient = await this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });

    return updatedPatient;
  }

  async remove(id: string): Promise<Patient> {
    const deletedPatient = await this.prisma.patient.delete({
      where: { id },
    });

    return deletedPatient;
  }
}
