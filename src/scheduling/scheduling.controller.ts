import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { CreateSchedulingDto } from './__dtos__/create-scheduling.dto';
import { ReturnSchedulingDto } from './__dtos__/return-scheduling.dto';
import { UpdateSchedulingDto } from './__dtos__/update-scheduling.dto';
import { SchedulingService } from './scheduling.service';
import { UserId } from 'src/decorators/userId.decorator';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) { }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Post()
  async create(
    @Body() createSchedulingDto: CreateSchedulingDto,
    @UserId() userId: string
  ): Promise<ReturnSchedulingDto> {
    return new ReturnSchedulingDto(await this.schedulingService.create(createSchedulingDto, userId));
  }

  @Roles(Role.AdministradorGeral)
  @Get()
  async findAll(
    @UserId() userId: string,
    @Query('namePatient') namePatient: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const { data, ...pagination } = await this.schedulingService.findAll(userId, namePatient, parseInt(page), parseInt(limit));

    return {
      data: data.map((s) => new ReturnSchedulingDto(s)),
      ...pagination,
    };
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get('hospital/:hospitalId')
  async findByHospital(
    @Param('hospitalId') hospitalId: string,
    @UserId() userId: string,
    @Query('namePatient') namePatient: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const { data, ...pagination } = await this.schedulingService.findByHospital(hospitalId, userId, namePatient, parseInt(page), parseInt(limit));

    return {
      data: data.map((s) => new ReturnSchedulingDto(s)),
      ...pagination,
    };
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @UserId() userId: string
  ): Promise<ReturnSchedulingDto> {
    return new ReturnSchedulingDto(await this.schedulingService.findById(id, userId));
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSchedulingDto: UpdateSchedulingDto,
    @UserId() userId: string
  ): Promise<ReturnSchedulingDto> {
    return new ReturnSchedulingDto(await this.schedulingService.update(id, updateSchedulingDto, userId));
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserId() userId: string
  ): Promise<ReturnSchedulingDto> {
    return new ReturnSchedulingDto(await this.schedulingService.remove(id, userId));
  }
}
