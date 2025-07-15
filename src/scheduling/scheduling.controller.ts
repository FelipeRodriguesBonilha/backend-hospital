import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { CreateSchedulingDto } from './__dtos__/create-scheduling.dto';
import { UpdateSchedulingDto } from './__dtos__/update-scheduling.dto';
import { SchedulingService } from './scheduling.service';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) { }

  @Roles(Role.AdministradorGeral, Role.Recepcionista)
  @Post()
  create(@Body() createSchedulingDto: CreateSchedulingDto) {
    return this.schedulingService.create(createSchedulingDto);
  }

  @Roles(Role.AdministradorGeral)
  @Get()
  findAll() {
    return this.schedulingService.findAll();
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get('hospital/:hospitalId')
  async findByHospital(
    @Param('hospitalId') hospitalId: string
  ) {
    return this.schedulingService.findByHospital(hospitalId);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.schedulingService.findById(id);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchedulingDto: UpdateSchedulingDto) {
    return this.schedulingService.update(id, updateSchedulingDto);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulingService.remove(id);
  }
}
