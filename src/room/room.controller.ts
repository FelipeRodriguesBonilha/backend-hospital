import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { UserId } from 'src/decorators/userId.decorator';
import { Role } from 'src/role/enum/role.enum';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { ReturnRoomDto } from './__dtos__/return-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RoomService } from './room.service';

@ApiSecurity('JWT-auth')
@Roles(Role.AdministradorHospital, Role.Recepcionista, Role.Medico)
@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService
    ) { }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Post()
    async create(@Body() createRoomDto: CreateRoomDto, @UserId() userId): Promise<ReturnRoomDto> {
        return new ReturnRoomDto(await this.roomService.create(createRoomDto, userId));
    }

    @Roles(Role.AdministradorHospital)
    @Get()
    async findAll(): Promise<ReturnRoomDto[]> {
        return (await this.roomService.findAll()).map((room) => new ReturnRoomDto(room));
    }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Get(':id')
    async findById(@Param('id') id: string, @UserId() userId): Promise<ReturnRoomDto> {
        return new ReturnRoomDto(await this.roomService.findById(id, userId));
    }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoomDto: UpdateRoomDto,
        @UserId() userId: string
    ): Promise<ReturnRoomDto> {
        return new ReturnRoomDto(await this.roomService.update(id, updateRoomDto, userId));
    }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Delete(':id')
    async remove(@Param('id') id: string, @UserId() userId): Promise<ReturnRoomDto> {
        return new ReturnRoomDto(await this.roomService.remove(id, userId));
    }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Post('join')
    async joinRoom(@Body() joinRoomDto: JoinRoomDto, @UserId() userId: string): Promise<ReturnRoomDto> {
        return new ReturnRoomDto(await this.roomService.joinRoom(joinRoomDto, userId));
    }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Post('leave')
    async leaveRoom(@Body() leaveRoomDto: LeaveRoomDto, @UserId() userId: string): Promise<ReturnRoomDto> {
        return new ReturnRoomDto(await this.roomService.leaveRoom(leaveRoomDto, userId));
    }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Get('user/:userId')
    async findAllRoomsByUser(@Param('userId') userId: string) {
        return (await this.roomService.findAllRoomsByUser(userId))
    }
}
