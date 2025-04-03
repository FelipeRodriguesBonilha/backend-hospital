import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';

@Injectable()
export class RoomService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createRoomDto: CreateRoomDto): Promise<Room> {
        const createdRoom = await this.prisma.room.create({
            data: createRoomDto,
        });

        return createdRoom;
    }

    async findAll(): Promise<Room[]> {
        const rooms = await this.prisma.room.findMany();

        return rooms;
    }

    async findById(id: string): Promise<Room> {
        const room = await this.prisma.room.findUnique({
            where: { id },
        });

        return room;
    }

    async update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
        const updatedRoom = await this.prisma.room.update({
            where: { id },
            data: updateRoomDto,
        });

        return updatedRoom;
    }

    async remove(id: string): Promise<Room> {
        const deletedRoom = await this.prisma.room.delete({
            where: { id },
        });

        return deletedRoom;
    }
}
