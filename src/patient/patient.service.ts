import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Patient } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreatePatientDto } from './__dtos__/create-patient.dto';
import { UpdatePatientDto } from './__dtos__/update-patient.dto';
import { Role } from 'src/role/enum/role.enum';
import { UserService } from 'src/user/user.service';
import { HospitalService } from 'src/hospital/hospital.service';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly hospitalService: HospitalService,
  ) { }

  async create(createPatientDto: CreatePatientDto, userId: string) {
    const [requesterUser, hospital] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.hospitalService.findById(createPatientDto.hospitalId),
    ]);

    if (!hospital) throw new NotFoundException('Hospital não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== createPatientDto.hospitalId
    ) throw new ForbiddenException('Este tipo de usuário só pode criar pacientes para o próprio hospital!');

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) throw new ForbiddenException('Você não tem permissão para criar pacientes!');

    return await this.prisma.patient.create({
      data: createPatientDto,
      include: {
        hospital: true
      }
    });
  }

  async findAll(userId: string, name?: string, page = 1, limit = 10) {
    const requesterUser = await this.userService.findByIdWithoutAccessControl(userId);
    const userRole = requesterUser.role.name as Role;

    if (![Role.AdministradorGeral].includes(userRole)) {
      throw new ForbiddenException('Você não tem permissão para acessar todos os pacientes!');
    }

    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        include: {
          hospital: true
        },
        skip,
        take: limit,
      }),
      this.prisma.patient.count({
        where: {
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data: patients,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByHospital(hospitalId: string, userId: string, name?: string, page = 1, limit = 10) {
    const [requesterUser, hospital] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.hospitalService.findById(hospitalId),
    ]);

    if (!hospital) throw new NotFoundException('Hospital não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) &&
      requesterUser.hospitalId !== hospitalId) {
      throw new ForbiddenException('Este tipo de usuário só pode acessar pacientes do próprio hospital!');
    }

    const skip = (page - 1) * limit;

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
        where: {
          hospitalId,
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
        include: {
          hospital: true
        },
        skip,
        take: limit,
      }),
      this.prisma.patient.count({
        where: {
          hospitalId,
          name: {
            contains: name,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      data: patients,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, userId: string): Promise<Patient> {
    const [requesterUser, patient] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.patient.findUnique({ where: { id }, include: { hospital: true }}),
    ]);

    if (!patient) throw new NotFoundException('Paciente não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) &&
      requesterUser.hospitalId !== patient.hospitalId
    ) throw new ForbiddenException('Este tipo de usuário só pode acessar pacientes do próprio hospital!');

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto, userId: string) {
    const [requesterUser, patient] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.patient.findUnique({ where: { id }, include: { hospital: true }}),
    ]);

    if (!patient) throw new NotFoundException('Paciente não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== patient.hospitalId
    ) throw new ForbiddenException('Este tipo de usuário só pode editar pacientes do próprio hospital!');

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) throw new ForbiddenException('Você não tem permissão para editar pacientes!');

    if (![Role.AdministradorGeral].includes(userRole) && updatePatientDto.hospitalId) {
      throw new ForbiddenException('Você não pode alterar o hospital do paciente!');
    }

    return this.prisma.patient.update({
      where: { id },
      data: updatePatientDto,
    });
  }

  async remove(id: string, userId: string) {
    const [requesterUser, patient] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      this.prisma.patient.findUnique({ where: { id }, include: { hospital: true }}),
    ]);

    if (!patient) throw new NotFoundException('Paciente não encontrado!');

    const userRole = requesterUser.role.name as Role;

    if (
      [Role.AdministradorHospital, Role.Recepcionista].includes(userRole) &&
      requesterUser.hospitalId !== patient.hospitalId
    ) throw new ForbiddenException('Este tipo de usuário só pode excluir pacientes do próprio hospital!',);

    if (![Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista].includes(userRole)) throw new ForbiddenException('Você não tem permissão para excluir pacientes!');

    return this.prisma.patient.delete({
      where: { id },
    });
  }
}