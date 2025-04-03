import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Room } from '@prisma/client';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RoomService } from './room.service';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) { }

    @Post()
    async create(@Body() CreateRoomDto: CreateRoomDto): Promise<Room> {
        return this.roomService.create(CreateRoomDto);
    }

    @Get()
    async findAll(): Promise<Room[]> {
        return this.roomService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Room> {
        return this.roomService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateRoomDto: UpdateRoomDto
    ): Promise<Room> {
        return this.roomService.update(id, updateRoomDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Room> {
        return this.roomService.remove(id);
    }

    @Post('join')
    async joinRoom(@Body() joinRoomDto: JoinRoomDto) {
        return this.roomService.joinRoom(joinRoomDto);
    }

    @Post('leave')
    async leaveRoom(@Body() leaveRoomDto: LeaveRoomDto) {
        return this.roomService.leaveRoom(leaveRoomDto);
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
