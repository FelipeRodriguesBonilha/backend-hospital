import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Exam } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { CreateExamDto } from './__dtos__/create-exam.dto';
import { UpdateExamDto } from './__dtos__/update-exam.dto';
import { ExamService } from './exam.service';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) { }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
  @Post()
  create(@Body() createExamDto: CreateExamDto): Promise<Exam> {
    return this.examService.create(createExamDto);
  }

  @Roles(Role.AdministradorGeral)
  @Get()
  findAll(@Query('description') description: string): Promise<Exam[]> {
    return this.examService.findAll(description);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get('hospital/:hospitalId')
  async findByHospital(
    @Param('hospitalId') hospitalId: string,
    @Query('description') description: string
  ): Promise<Exam[]> {
    return this.examService.findByHospital(hospitalId, description);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get(':id')
  findById(@Param('id') id: string): Promise<Exam | null> {
    return this.examService.findById(id);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
  ): Promise<Exam> {
    return this.examService.update(id, updateExamDto);
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Exam> {
    return this.examService.remove(id);
  }
}