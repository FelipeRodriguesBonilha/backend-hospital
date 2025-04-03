import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Room } from '@prisma/client';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RoomService } from './room.service';

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
}
