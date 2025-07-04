import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateExamDto } from './__dtos__/create-exam.dto';
import { UpdateExamDto } from './__dtos__/update-exam.dto';
import { Exam } from '@prisma/client';

@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) { }

  @Post()
  create(@Body() createExamDto: CreateExamDto): Promise<Exam> {
    return this.examService.create(createExamDto);
  }

  @Get()
  findAll(): Promise<Exam[]> {
    return this.examService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Exam | null> {
    return this.examService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
  ): Promise<Exam> {
    return this.examService.update(id, updateExamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Exam> {
    return this.examService.remove(id);
  }
}