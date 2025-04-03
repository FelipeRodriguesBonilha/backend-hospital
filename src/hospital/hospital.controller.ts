import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Hospital } from '@prisma/client';
import { CreateHospitalDto } from './__dtos__/create-hospital.dto';
import { UpdateHospitalDto } from './__dtos__/update-hospital.dto';
import { HospitalService } from './hospital.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';

@Roles(Role.AdministradorGeral)
@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) { }

    @Post()
    async create(@Body() createHospitalDto: CreateHospitalDto): Promise<Hospital> {
        return this.hospitalService.create(createHospitalDto);
    }

    @Get()
    async findAll(): Promise<Hospital[]> {
        return this.hospitalService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Hospital> {
        return this.hospitalService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateHospitalDto: UpdateHospitalDto
    ): Promise<Hospital> {
        return this.hospitalService.update(id, updateHospitalDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Hospital> {
        return this.hospitalService.remove(id);
    }
}
