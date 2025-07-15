import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSchedulingDto } from './__dtos__/create-scheduling.dto';
import { UpdateSchedulingDto } from './__dtos__/update-scheduling.dto';
import { PrismaService } from 'src/prisma.service';
import { Scheduling } from '@prisma/client';
import { Role } from 'src/user/enum/role.enum';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async create(createSchedulingDto: CreateSchedulingDto) {
    const start = new Date(createSchedulingDto.startDate);
    const end = new Date(createSchedulingDto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('startDate deve ser anterior a endDate');
    }

    const [hospital, createdBy, provider, patient] = await Promise.all([
      this.prisma.hospital.findUnique({ where: { id: createSchedulingDto.hospitalId } }),
      this.prisma.user.findUnique({ where: { id: createSchedulingDto.createdById }, include: { role: true } }),
      this.prisma.user.findUnique({ where: { id: createSchedulingDto.providerId }, include: { role: true } }),
      this.prisma.patient.findUnique({ where: { id: createSchedulingDto.patientId } }),
    ]);

    if (!hospital) throw new NotFoundException('Hospital não encontrado');
    if (!createdBy) throw new NotFoundException('Usuário (createdBy) não encontrado');
    if (!provider) throw new NotFoundException('Profissional (provider) não encontrado');
    if (!patient) throw new NotFoundException('Paciente não encontrado');

    if(createdBy.role.name !== Role.Recepcionista) {
      throw new ForbiddenException('Apenas recepcionistas podem criar agendamentos');
    }

    if(provider.role.name !== Role.Medico) {
      throw new ForbiddenException('Apenas médicos podem atender agendamentos');
    }

    if (
      createdBy.hospitalId !== createSchedulingDto.hospitalId ||
      provider.hospitalId !== createSchedulingDto.hospitalId
    ) {
      throw new BadRequestException('Usuários devem pertencer ao mesmo hospital');
    }

    const overlap = await this.prisma.scheduling.findFirst({
      where: {
        providerId: createSchedulingDto.providerId,
        hospitalId: createSchedulingDto.hospitalId,
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });

    if (overlap) {
      throw new ConflictException(
        'Profissional já possui agendamento nesse período',
      );
    }

    return this.prisma.scheduling.create({
      data: createSchedulingDto,
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      }
    });
  }

  async findAll(): Promise<Scheduling[]> {
    return await this.prisma.scheduling.findMany({
      orderBy: { startDate: 'asc' },
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      }
    });
  }

  async findByHospital(hospitalId: string){
    return await this.prisma.scheduling.findMany({
      where: {
        hospitalId,
      },
      orderBy: { startDate: 'asc' },
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      }
    });
  }

  async findById(id: string): Promise<Scheduling> {
    const scheduling = await this.prisma.scheduling.findUnique({
      where: { id },
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      }
    });

    if (!scheduling) throw new NotFoundException('Agendamento não encontrado');
    return scheduling;
  }

  async update(id: string, updateSchedulingDto: UpdateSchedulingDto) {
    const current = await this.prisma.scheduling.findUnique({ where: { id } });
    if (!current) throw new NotFoundException('Agendamento não encontrado');

    const data = { ...updateSchedulingDto };
    const start = updateSchedulingDto.startDate ? new Date(updateSchedulingDto.startDate) : current.startDate;
    const end = updateSchedulingDto.endDate ? new Date(updateSchedulingDto.endDate) : current.endDate;
    const providerId = updateSchedulingDto.providerId ?? current.providerId;

    if (start >= end) {
      throw new BadRequestException('startDate deve ser anterior a endDate');
    }

    const overlap = await this.prisma.scheduling.findFirst({
      where: {
        id: { not: id },
        providerId,
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });
    if (overlap) {
      throw new ConflictException(
        'Profissional já possui agendamento nesse período',
      );
    }

    return this.prisma.scheduling.update({
      where: { id },
      data,
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      }
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.scheduling.delete({ where: { id } });
  }
}
