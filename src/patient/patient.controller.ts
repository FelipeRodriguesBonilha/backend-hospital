import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './__dtos__/create-patient.dto';
import { UpdatePatientDto } from './__dtos__/update-patient.dto';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) { }

  @Post()
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  findAll() {
    return this.patientService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.patientService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patientService.remove(id);
  }
}
