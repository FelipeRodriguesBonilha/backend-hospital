import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserId } from 'src/decorators/userId.decorator';
import { Role } from '../role/enum/role.enum';
import { CreateUserDto } from './__dtos__/create-user.dto';
import { ReturnUserDto } from './__dtos__/return-user.dto';
import { UpdateProfileDto } from './__dtos__/update-profile.dto';
import { UpdateUserDto } from './__dtos__/update-user.dto';
import { UserService } from './user.service';

@ApiBasicAuth()
@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Post()
    async create(@Body() createUserDto: CreateUserDto, @UserId() userId: string): Promise<ReturnUserDto> {
        return new ReturnUserDto(await this.userService.create(createUserDto, userId));
    }

    @Roles(Role.AdministradorGeral)
    @Get()
    async findAll(
        @UserId() userId: string,
        @Query('name') name: string,
        @Query('page') page = '1',
        @Query('limit') limit = '10'
    ) {
        const { data, ...pagination } = await this.userService.findAll(userId, name, parseInt(page), parseInt(limit));
        return {
            data: data.map((user) => new ReturnUserDto(user)),
            ...pagination,
        };
    }

    @Get('hospital/:hospitalId')
    async findByHospital(
        @Param('hospitalId') hospitalId: string,
        @UserId() userId: string,
        @Query('name') name?: string,
        @Query('roles') roles?: string[],
        @Query('page') page = '1',
        @Query('limit') limit = '10'
    ) {
        const { data, ...pagination } = await this.userService.findByHospital(
            hospitalId,
            userId,
            name,
            roles,
            parseInt(page),
            parseInt(limit)
        );
        return {
            data: data.map((user) => new ReturnUserDto(user)),
            ...pagination,
        };
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
    @Get('hospital/:hospitalId/not-in-room/:roomId')
    async findByHospitalUsersNotInRoom(
        @Param('hospitalId') hospitalId: string,
        @Param('roomId') roomId: string,
        @UserId() userId: string
    ): Promise<ReturnUserDto[]> {
        return (await this.userService.findUsersNotInRoom(roomId, hospitalId, userId)).map((user) => new ReturnUserDto(user));
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
    @Get(':id')
    async findById(
        @Param('id') id: string,
        @UserId() userId: string
    ): Promise<ReturnUserDto> {
        return new ReturnUserDto(await this.userService.findById(id, userId));
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @UserId() userId: string
    ): Promise<ReturnUserDto> {
        return new ReturnUserDto(await this.userService.update(id, updateUserDto, userId));
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Patch(':id')
    async updateProfile(
        @Body() updateProfileDto: UpdateProfileDto,
        @UserId() userId: string
    ): Promise<ReturnUserDto> {
        return new ReturnUserDto(await this.userService.updateProfile(updateProfileDto, userId));
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital)
    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @UserId() userId: string
    ): Promise<ReturnUserDto> {
        return new ReturnUserDto(await this.userService.remove(id, userId));
    }

    @Roles(Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
    @Get('room/:roomId')
    async findAllUsersInRoom(
        @Param('roomId') roomId: string,
        @UserId() userId: string
    ): Promise<ReturnUserDto[]> {
        return (await this.userService.findAllUsersInRoom(roomId, userId)).map((roomUser) => new ReturnUserDto(roomUser));
    }
}
