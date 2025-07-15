import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './__dtos__/create-patient.dto';
import { UpdatePatientDto } from './__dtos__/update-patient.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  @Roles(Role.AdministradorGeral, Role.Recepcionista)
  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Roles(Role.AdministradorGeral)
  @Get()
  findAll(@Query('name') name: string) {
    return this.patientService.findAll(name);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get('hospital/:hospitalId')
  async findByHospital(
    @Param('hospitalId') hospitalId: string,
    @Query('name') name: string
  ) {
    return this.patientService.findByHospital(hospitalId, name);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.patientService.findById(id);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
