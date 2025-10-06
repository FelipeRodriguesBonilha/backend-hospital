import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateExamDto } from './__dtos__/create-exam.dto';
import { UpdateExamDto } from './__dtos__/update-exam.dto';
import { UserService } from 'src/user/user.service';
import { Role } from 'src/role/enum/role.enum';
import { HospitalService } from 'src/hospital/hospital.service';
import { PatientService } from 'src/patient/patient.service';
import { ArchiveService } from 'src/archive/archive.service';
import { CreateArchiveDto } from 'src/archive/__dtos__/create-archive.dto';

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly hospitalService: HospitalService,
    private readonly patientService: PatientService,
    private readonly archiveService: ArchiveService,
  ) { }

  async create(createExamDto: CreateExamDto, userId: string, file: Express.Multer.File[]) {
    const [
      hospital, requesterUser, provider, patient
    ] = await Promise.all([
      this.hospitalService.findById(createExamDto.hospitalId),
      this.userService.findByIdWithoutAccessControl(userId),
      this.userService.findByIdWithoutAccessControl(createExamDto.providerId),
      this.patientService.findById(createExamDto.patientId, userId)
    ]);

    if (!file || file.length === 0) {
      throw new BadRequestException('Arquivo é obrigatório para criar um exame!');
    }

    if (!hospital) throw new NotFoundException('Hospital não encontrado!');
    if (!requesterUser) throw new NotFoundException('Usuário não encontrado!');
    if (!provider) throw new NotFoundException('Profissional (provider) não encontrado!');
    if (!patient) throw new NotFoundException('Profissional (provider) não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [
        Role.AdministradorHospital,
        Role.Recepcionista,
        Role.Medico
      ].includes(userRole) &&
      requesterUser.hospitalId !== createExamDto.hospitalId
    ) throw new ForbiddenException('Você só pode criar exames pro seu hospital!');

    const hospitalIdToValidate = userRole === Role.AdministradorGeral
      ? createExamDto.hospitalId
      : requesterUser.hospitalId;

    if (provider.role.name !== Role.Medico) throw new ForbiddenException('Apenas médicos podem atender exames');
    if (provider.hospitalId !== hospitalIdToValidate) throw new BadRequestException('O médico deve pertencer ao mesmo hospital do exame');

    if (patient.hospitalId !== hospitalIdToValidate) throw new BadRequestException('O paciente deve pertencer ao mesmo hospital do exame');

    const exam = await this.prisma.exam.create({
      data: {
        ...createExamDto,
        createdById: userId
      },
    });

    if (file) {
      const [archive] = await this.archiveService.create({
        messageId: null,
      } as CreateArchiveDto, file, userId);

      await this.prisma.exam.update({
        where: { id: exam.id },
        data: {
          archiveId: archive.id,
        },
      });
    }

    return exam;
  }

  async findAll(userId: string, description?: string, page = 1, limit = 10) {
    const requesterUser = await this.userService.findByIdWithoutAccessControl(userId);
    const userRole = requesterUser.role.name as Role;

    if (![Role.AdministradorGeral].includes(userRole)) {
      throw new ForbiddenException('Você não tem permissão para acessar todos os exames!');
    }

    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where: {
          description: {
            contains: description,
            mode: 'insensitive',
          },
        },
        include: {
          patient: true,
          provider: true,
          createdBy: true,
          hospital: true,
          archive: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.exam.count({
        where: {
          description: {
            contains: description,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data: exams,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByHospital(
    hospitalId: string,
    userId: string,
    description?: string,
    page = 1,
    limit = 10
  ) {
    const [requesterUser, hospital] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.hospitalService.findById(hospitalId),
    ]);

    if (!hospital) throw new NotFoundException('Hospital não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) &&
      requesterUser.hospitalId !== hospitalId
    ) throw new ForbiddenException('Você só pode acessar exames do seu hospital!');

    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where: {
          hospitalId,
          description: {
            contains: description,
            mode: 'insensitive',
          },
        },
        include: {
          patient: true,
          provider: true,
          createdBy: true,
          hospital: true,
          archive: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.exam.count({
        where: {
          hospitalId,
          description: {
            contains: description,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    if (total === 0) throw new NotFoundException('Exames não encontrados!');

    return {
      data: exams,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string) {
    const [requesterUser, exam] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.exam.findUnique({
        where: { id },
        include: {
          patient: true,
          provider: true,
          createdBy: true,
          hospital: true,
          archive: true,
        },
      }),
    ]);

    if (!exam) throw new NotFoundException('Exame não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [
        Role.AdministradorHospital,
        Role.Recepcionista,
        Role.Medico
      ].includes(userRole) &&
      requesterUser.hospitalId !== exam.hospitalId
    ) throw new ForbiddenException('Você só pode acessar exames do seu hospital!');

    return exam;
  }

  async update(
    id: string,
    updateExamDto: UpdateExamDto,
    file: Express.Multer.File | Express.Multer.File[] | undefined,
    userId: string
  ) {
    const [requesterUser, exam, provider, patient] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.exam.findUnique({ where: { id } }),
      updateExamDto.providerId
        ? this.userService.findByIdWithoutAccessControl(updateExamDto.providerId)
        : Promise.resolve(null),
      updateExamDto.patientId
        ? this.patientService.findById(updateExamDto.patientId, userId)
        : Promise.resolve(null),
    ]);
  
    if (!exam) throw new NotFoundException('Exame não encontrado!');
  
    const userRole = requesterUser.role.name as Role;
  
    if (
      [Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) &&
      requesterUser.hospitalId !== exam.hospitalId
    ) throw new ForbiddenException('Você só pode editar exames do seu hospital!');
  
    if (![Role.AdministradorGeral].includes(userRole) && updateExamDto.hospitalId) {
      throw new ForbiddenException('Você não pode alterar o hospital do exame!');
    }
  
    const hospitalIdToValidate =
      userRole === Role.AdministradorGeral
        ? (updateExamDto.hospitalId || exam.hospitalId)
        : requesterUser.hospitalId;
  
    if (provider) {
      if (provider.role.name !== Role.Medico) {
        throw new ForbiddenException('Apenas médicos podem atender exames');
      }
      if (provider.hospitalId !== hospitalIdToValidate) {
        throw new BadRequestException('O médico deve pertencer ao mesmo hospital do exame');
      }
    }
  
    if (patient) {
      if (patient.hospitalId !== hospitalIdToValidate) {
        throw new BadRequestException('O paciente deve pertencer ao mesmo hospital do exame');
      }
    }
  
    const files = Array.isArray(file) ? file : (file ? [file] : []);
    let archiveId = exam.archiveId;
  
    if (files.length > 0) {
      if (!archiveId) {
        const [archive] = await this.archiveService.create(
          { messageId: null } as CreateArchiveDto,
          files,
          userId
        );
        archiveId = archive.id;
        (updateExamDto as any).archiveId = archiveId;
      } else {
        await this.archiveService.update(
          archiveId,
          { messageId: null } as CreateArchiveDto,
          files,
          userId
        );
      }
    }
  
    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: updateExamDto,
      include: {
        patient: true,
        provider: true,
        createdBy: true,
        hospital: true,
        archive: true,
      },
    });
  
    return updatedExam;
  }  

  async remove(id: string, userId: string) {
    const [requesterUser, exam] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.exam.findUnique({ where: { id } }),
    ]);

    if (!exam) throw new NotFoundException('Exame não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [
        Role.AdministradorHospital,
        Role.Recepcionista,
        Role.Medico
      ].includes(userRole) &&
      requesterUser.hospitalId !== exam.hospitalId
    ) throw new ForbiddenException('Você só pode remover exames do seu hospital!');

    return this.prisma.exam.delete({
      where: { id },
    });
  }
}