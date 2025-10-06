import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { CreateExamDto } from './__dtos__/create-exam.dto';
import { ReturnExamDto } from './__dtos__/return-exam.dto';
import { UpdateExamDto } from './__dtos__/update-exam.dto';
import { ExamService } from './exam.service';
import { UserId } from 'src/decorators/userId.decorator';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import multerConfig from 'src/archive/multer-config';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) { }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
  @UseInterceptors(FilesInterceptor('arquivo', 1, multerConfig))
  @Post()
  async create(
    @Body() createExamDto: CreateExamDto,
    @UserId() userId: string,
    @UploadedFiles() file: Express.Multer.File[]
  ): Promise<ReturnExamDto> {
    return new ReturnExamDto(await this.examService.create(createExamDto, userId, file));
  }

  @Roles(Role.AdministradorGeral)
  @Get()
  async findAll(
    @UserId() userId: string,
    @Query('description') description: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const { data, ...pagination } = await this.examService.findAll(
      userId,
      description,
      parseInt(page),
      parseInt(limit)
    );

    return {
      data: data.map((exam) => new ReturnExamDto(exam)),
      ...pagination,
    };
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get('hospital/:hospitalId')
  async findByHospital(
    @Param('hospitalId') hospitalId: string,
    @UserId() userId: string,
    @Query('description') description: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10'
  ) {
    const { data, ...pagination } = await this.examService.findByHospital(
      hospitalId,
      userId,
      description,
      parseInt(page),
      parseInt(limit)
    );

    return {
      data: data.map((exam) => new ReturnExamDto(exam)),
      ...pagination,
    };
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Get(':id')
  async findById(
    @Param('id') id: string,
    @UserId() userId: string
  ): Promise<ReturnExamDto | null> {
    return new ReturnExamDto(await this.examService.findById(id, userId));
  }

  @UseInterceptors(FileInterceptor('arquivo', multerConfig))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
    @UploadedFile() file: Express.Multer.File,
    @UserId() userId: string
  ): Promise<ReturnExamDto> {
    return new ReturnExamDto(await this.examService.update(id, updateExamDto, file, userId));
  }

  @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @UserId() userId: string
  ): Promise<ReturnExamDto> {
    return new ReturnExamDto(await this.examService.remove(id, userId));
  }
}