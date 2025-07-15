import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from './__dtos__/create-user.dto';
import { UpdateUserDto } from './__dtos__/update-user.dto';
import { UserService } from './user.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from './enum/role.enum';
import { ApiBasicAuth } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';

@ApiBasicAuth()
@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @Roles(Role.AdministradorGeral)
    @Get()
    async findAll(@Query('name') name: string): Promise<User[]> {
        return this.userService.findAll(name);
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
    @Get('hospital/:hospitalId')
    async findByHospital(
        @Param('hospitalId') hospitalId: string,
        @Query('name') name: string
    ): Promise<User[]> {
        return this.userService.findByHospital(hospitalId, name);
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
    @Get(':id')
    async findById(@Param('id') id: string): Promise<User> {
        return this.userService.findById(id);
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Patch(':id')
    async updateProfile(
        @UserId() id: string,
        @Body() updateUserDto: UpdateUserDto,
    ): Promise<User> {
        return this.userService.updateProfile(id, updateUserDto);
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Delete(':id')
    async remove(@Param('id') id: string): Promise<User> {
        return this.userService.remove(id);
    }
}
