import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { CreateSchedulingDto } from './__dtos__/create-scheduling.dto';
import { UpdateSchedulingDto } from './__dtos__/update-scheduling.dto';

@Controller('scheduling')
export class SchedulingController {
  constructor(private readonly schedulingService: SchedulingService) { }

  @Post()
  create(@Body() createSchedulingDto: CreateSchedulingDto) {
    return this.schedulingService.create(createSchedulingDto);
  }

  @Get()
  findAll() {
    return this.schedulingService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.schedulingService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSchedulingDto: UpdateSchedulingDto) {
    return this.schedulingService.update(id, updateSchedulingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.schedulingService.remove(id);
  }
}
