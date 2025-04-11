import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post } from '@nestjs/common';
import { Room } from '@prisma/client';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RoomService } from './room.service';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { ApiSecurity } from '@nestjs/swagger';
import { UserId } from 'src/decorators/userId.decorator';
import { UserService } from 'src/user/user.service';

@ApiSecurity('JWT-auth')
@Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
@Controller('room')
export class RoomController {
    constructor(
        private readonly roomService: RoomService
    ) { }

    @Post()
    async create(@Body() createRoomDto: CreateRoomDto, @UserId() userId): Promise<Room> {
        return this.roomService.create(createRoomDto, userId);
    }

    @Get()
    async findAll(): Promise<Room[]> {
        return this.roomService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string, @UserId() userId): Promise<Room> {
        return this.roomService.findById(id, userId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoomDto: UpdateRoomDto,
        @UserId() userId
    ): Promise<Room> {
        return this.roomService.update(id, updateRoomDto, userId);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @UserId() userId): Promise<Room> {
        return this.roomService.remove(id, userId);
    }

    @Post('join')
    async joinRoom(@Body() joinRoomDto: JoinRoomDto, @UserId() userId: string) {
        return this.roomService.joinRoom(joinRoomDto, userId);
    }

    @Post('leave')
    async leaveRoom(@Body() leaveRoomDto: LeaveRoomDto, @UserId() userId: string) {
        return this.roomService.leaveRoom(leaveRoomDto, userId);
    }

    @Get('user/:userId')
    async findAllRoomsByUser(@Param('userId') userId: string) {
        return this.roomService.findAllRoomsByUser(userId);
    }

    @Get(':roomId/users')
    async findAllUsersInRoom(@Param('roomId') roomId: string) {
        return this.roomService.findAllUsersInRoom(roomId);
    }
}
