import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { CreateHospitalDto } from './__dtos__/create-hospital.dto';
import { ReturnHospitalDto } from './__dtos__/return-hospital.dto';
import { UpdateHospitalDto } from './__dtos__/update-hospital.dto';
import { HospitalService } from './hospital.service';
import { ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('JWT-auth')
@Roles(Role.AdministradorGeral)
@Controller('hospital')
export class HospitalController {
    constructor(private readonly hospitalService: HospitalService) { }

    @Post()
    async create(@Body() createHospitalDto: CreateHospitalDto): Promise<ReturnHospitalDto> {
        return new ReturnHospitalDto(await this.hospitalService.create(createHospitalDto));
    }

    @Get()
    async findAll(
        @Query('companyName') companyName: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10'
    ) {
        const { data, ...pagination } = await this.hospitalService.findAll(
            companyName,
            parseInt(page),
            parseInt(limit)
        );

        return {
            data: data.map((hospital) => new ReturnHospitalDto(hospital)),
            ...pagination,
        };
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<ReturnHospitalDto> {
        return new ReturnHospitalDto(await this.hospitalService.findById(id));
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateHospitalDto: UpdateHospitalDto
    ): Promise<ReturnHospitalDto> {
        return new ReturnHospitalDto(await this.hospitalService.update(id, updateHospitalDto));
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<ReturnHospitalDto> {
        return new ReturnHospitalDto(await this.hospitalService.remove(id));
    }
}
