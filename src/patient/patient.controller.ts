import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './__dtos__/create-patient.dto';
import { UpdatePatientDto } from './__dtos__/update-patient.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { ReturnPatientDto } from './__dtos__/return-patient.dto';
import { UserId } from 'src/decorators/userId.decorator';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Post()
  async create(@Body() createPatientDto: CreatePatientDto, @UserId() userId: string): Promise<ReturnPatientDto> {
    return new ReturnPatientDto(await this.patientService.create(createPatientDto, userId));
  }

  @Roles(Role.AdministradorGeral)
  @Get()
  async findAll(
    @UserId() userId: string,
    @Query('name') name: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const { data, ...pagination } = await this.patientService.findAll(userId, name, parseInt(page), parseInt(limit));

    return {
      data: data.map((patient) => new ReturnPatientDto(patient)),
      ...pagination,
    };
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get('hospital/:hospitalId')
  async findByHospital(
    @Param('hospitalId') hospitalId: string,
    @UserId() userId: string,
    @Query('name') name: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const { data, ...pagination } = await this.patientService.findByHospital(hospitalId, userId, name, parseInt(page), parseInt(limit));

    return {
      data: data.map((patient) => new ReturnPatientDto(patient)),
      ...pagination,
    };
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @UserId() userId: string
  ): Promise<ReturnPatientDto> {
    return new ReturnPatientDto(await this.patientService.findById(id, userId));
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @UserId() userId: string
  ): Promise<ReturnPatientDto> {
    return new ReturnPatientDto(await this.patientService.update(id, updatePatientDto, userId));
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserId() userId: string
  ): Promise<ReturnPatientDto> {
    return new ReturnPatientDto(await this.patientService.remove(id, userId));
  }
}
