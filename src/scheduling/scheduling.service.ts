import { BadGatewayException, BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { HospitalService } from 'src/hospital/hospital.service';
import { PatientService } from 'src/patient/patient.service';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/role/enum/role.enum';
import { UserService } from 'src/user/user.service';
import { CreateSchedulingDto } from './__dtos__/create-scheduling.dto';
import { UpdateSchedulingDto } from './__dtos__/update-scheduling.dto';

@Injectable()
export class SchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly hospitalService: HospitalService,
    private readonly patientService: PatientService
  ) { }

  async create(createSchedulingDto: CreateSchedulingDto, userId: string) {
    const start = new Date(createSchedulingDto.startDate);
    const end = new Date(createSchedulingDto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('startDate deve ser anterior a endDate');
    }

    const [
      hospital, requesterUser, provider, patient
    ] = await Promise.all([
      this.hospitalService.findById(createSchedulingDto.hospitalId),
      this.userService.findByIdWithoutAccessControl(userId),
      this.userService.findByIdWithoutAccessControl(createSchedulingDto.providerId),
      this.patientService.findById(createSchedulingDto.patientId, userId)
    ]);

    if (!hospital) throw new NotFoundException('Hospital não encontrado!');
    if (!requesterUser) throw new NotFoundException('Usuário não encontrado!');
    if (!provider) throw new NotFoundException('Profissional (provider) não encontrado!');
    if (!patient) throw new NotFoundException('Profissional (provider) não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) throw new ForbiddenException('Você não tem permissão para criar agendamentos!');

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== createSchedulingDto.hospitalId
    ) throw new ForbiddenException('Você só pode criar agendamentos pro seu hospital!');

    const hospitalIdToValidate = userRole === Role.AdministradorGeral 
      ? createSchedulingDto.hospitalId
      : requesterUser.hospitalId;

    if (provider.role.name !== Role.Medico) throw new ForbiddenException('Apenas médicos podem atender agendamentos');
    if (provider.hospitalId !== hospitalIdToValidate) throw new BadRequestException('O médico deve pertencer ao mesmo hospital do agendamento');

    if (patient.hospitalId !== hospitalIdToValidate) throw new BadRequestException('O paciente deve pertencer ao mesmo hospital do agendamento');

    const overlap = await this.prisma.scheduling.findFirst({
      where: {
        providerId: createSchedulingDto.providerId,
        hospitalId: createSchedulingDto.hospitalId,
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });

    if (overlap) throw new ConflictException('Profissional já possui agendamento nesse período');

    return this.prisma.scheduling.create({
      data: {
        ...createSchedulingDto,
        createdById: userId
      },
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      }
    });
  }

  async findAll(userId: string, namePatient?: string, page = 1, limit = 10) {
    const requesterUser = await this.userService.findByIdWithoutAccessControl(userId);
    const userRole = requesterUser.role.name as Role;

    if (![Role.AdministradorGeral].includes(userRole)) {
      throw new ForbiddenException('Você não tem permissão para acessar todos os agendamentos!');
    }

    const skip = (page - 1) * limit;

    const [schedulings, total] = await Promise.all([
      this.prisma.scheduling.findMany({
        where: {
          patient: {
            name: {
              contains: namePatient,
              mode: 'insensitive',
            },
          },
        },
        orderBy: { startDate: 'asc' },
        include: {
          hospital: true,
          createdBy: true,
          provider: true,
          patient: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.scheduling.count(),
    ]);

    return {
      data: schedulings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByHospital(hospitalId: string, userId: string, namePatient?: string, page = 1, limit = 10) {
    const [requesterUser, hospital] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.hospitalService.findById(hospitalId),
    ]);

    if (!hospital) throw new NotFoundException('Hospital não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== hospitalId
    ) {
      throw new ForbiddenException('Você só pode acessar agendamentos do seu hospital!');
    }

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) {
      throw new ForbiddenException('Você não tem permissão para acessar agendamentos!');
    }

    const skip = (page - 1) * limit;

    const [schedulings, total] = await Promise.all([
      this.prisma.scheduling.findMany({
        where: {
          hospitalId,
          patient: {
            name: {
              contains: namePatient,
              mode: 'insensitive',
            },
          },
        },
        orderBy: { startDate: 'asc' },
        include: {
          hospital: true,
          createdBy: true,
          provider: true,
          patient: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.scheduling.count({ where: { hospitalId } }),
    ]);

    return {
      data: schedulings,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string) {
    const [requesterUser, scheduling] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.scheduling.findUnique({
        where: { id },
        include: {
          hospital: true,
          createdBy: true,
          provider: true,
          patient: true,
        }
      }),
    ]);

    if (!scheduling) throw new NotFoundException('Agendamento não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== scheduling.hospitalId
    ) throw new ForbiddenException('Você só pode acessar agendamentos do seu hospital!');

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) throw new ForbiddenException('Você não tem permissão para acessar agendamentos!');

    return scheduling;
  }

  async update(id: string, updateSchedulingDto: UpdateSchedulingDto, userId: string) {
    const start = new Date(updateSchedulingDto.startDate);
    const end = new Date(updateSchedulingDto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      throw new BadRequestException('startDate deve ser anterior a endDate');
    }

    const [requesterUser, scheduling, provider, patient] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.scheduling.findUnique({ where: { id } }),
      updateSchedulingDto.providerId ? this.userService.findByIdWithoutAccessControl(updateSchedulingDto.providerId) : Promise.resolve(null),
      updateSchedulingDto.patientId ? this.patientService.findById(updateSchedulingDto.patientId, userId) : Promise.resolve(null),
    ]);

    if (!scheduling) throw new NotFoundException('Agendamento não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== scheduling.hospitalId
    ) throw new ForbiddenException('Você só pode editar agendamentos do seu hospital!');

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) throw new ForbiddenException('Você não tem permissão para editar agendamentos!');

    if (![Role.AdministradorGeral].includes(userRole) && updateSchedulingDto.hospitalId) {
      throw new ForbiddenException('Você não pode alterar o hospital do agendamento!');
    }

    const hospitalIdToValidate = userRole === Role.AdministradorGeral 
      ? (updateSchedulingDto.hospitalId || scheduling.hospitalId)
      : requesterUser.hospitalId;

    if (provider) {
      if (provider.role.name !== Role.Medico) throw new ForbiddenException('Apenas médicos podem atender agendamentos');
      if (provider.hospitalId !== hospitalIdToValidate) throw new BadRequestException('O médico deve pertencer ao mesmo hospital do agendamento');
    }

    if (patient) {
      if (patient.hospitalId !== hospitalIdToValidate) throw new BadRequestException('O paciente deve pertencer ao mesmo hospital do agendamento');
    }

    const overlap = await this.prisma.scheduling.findFirst({
      where: {
        id: { not: id },
        providerId: updateSchedulingDto.providerId,
        hospitalId: updateSchedulingDto.hospitalId,
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
      },
    });

    if (overlap) throw new ConflictException('Profissional já possui agendamento nesse período');

    return this.prisma.scheduling.update({
      where: { id },
      data: updateSchedulingDto,
      include: {
        hospital: true,
        createdBy: true,
        provider: true,
        patient: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const [requesterUser, scheduling] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.scheduling.findUnique({ where: { id } }),
    ]);

    if (!scheduling) throw new NotFoundException('Agendamento não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== scheduling.hospitalId
    ) {
      throw new ForbiddenException('Você só pode remover agendamentos do seu hospital!');
    }

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) {
      throw new ForbiddenException('Você não tem permissão para remover agendamentos!');
    }

    return this.prisma.scheduling.delete({ where: { id } });
  }
}
