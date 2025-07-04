import { Injectable } from '@nestjs/common';
import { CreateArchiveDto } from './__dtos__/create-archive.dto';
import { UpdateArchiveDto } from './__dtos__/update-archive.dto';
import { PrismaService } from 'src/prisma.service';
import { Archive } from '@prisma/client';

@Injectable()
export class ArchiveService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createArchiveDto: CreateArchiveDto): Promise<Archive> {
    const { name, type, url, messageId, examId } = createArchiveDto;

    return this.prisma.archive.create({
      data: {
        name,
        type,
        url,
        message: messageId ? { connect: { id: messageId } } : undefined,
        exam: examId ? { connect: { id: examId } } : undefined,
      },
    });
  }

  async findAll(): Promise<Archive[]> {
    return this.prisma.archive.findMany();
  }

  async findById(id: string): Promise<Archive | null> {
    return this.prisma.archive.findUnique({ where: { id } });
  }

  async update(id: string, updateArchiveDto: UpdateArchiveDto): Promise<Archive> {
    return this.prisma.archive.update({
      where: { id },
      data: updateArchiveDto,
    });
  }

  async remove(id: string): Promise<Archive> {
    return this.prisma.archive.delete({ where: { id } });
  }
}