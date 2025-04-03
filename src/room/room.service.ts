import { Injectable } from '@nestjs/common';
import { Room } from '@prisma/client';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RoomUserService } from 'src/room-user/room-user.service';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly roomUserService: RoomUserService,
    ) { }

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

    async joinRoom(joinRoomDto: JoinRoomDto){
        const userJoinedRoom = await this.roomUserService.joinRoom(joinRoomDto);

        return userJoinedRoom;
    }

    async leaveRoom(leaveRoomDto: LeaveRoomDto){
        const userLeavedRoom = await this.roomUserService.leaveRoom(leaveRoomDto);

        return userLeavedRoom;
    }

    async findAllRoomsByUser(userId: string){
        const allRoomsByUSer = await this.roomUserService.findAllRoomsByUser(userId);

        return allRoomsByUSer
    }

    async findAllUsersInRoom(roomId: string){
        const allUsersInRoom = await this.roomUserService.findAllUsersInRoom(roomId);

        return allUsersInRoom;
    }
}
