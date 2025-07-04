import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateExamDto } from './__dtos__/create-exam.dto';
import { UpdateExamDto } from './__dtos__/update-exam.dto';
import { Exam } from '@prisma/client';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createExamDto: CreateExamDto): Promise<Exam> {
    return this.prisma.exam.create({
      data: createExamDto,
    });
  }


  async findAll(): Promise<Exam[]> {
    return this.prisma.exam.findMany({
      include: {
        patient: true,
        provider: true,
        createdBy: true,
        hospital: true,
        archive: true,
      },
    });
  }

  async findById(id: string): Promise<Exam | null> {
    return this.prisma.exam.findUnique({
      where: { id },
      include: {
        patient: true,
        provider: true,
        createdBy: true,
        hospital: true,
        archive: true,
      },
    });
  }

  async update(id: string, data: UpdateExamDto): Promise<Exam> {
    return this.prisma.exam.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Exam> {
    return this.prisma.exam.delete({
      where: { id },
    });
  }
}