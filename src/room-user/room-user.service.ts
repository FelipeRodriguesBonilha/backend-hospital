import { Injectable } from '@nestjs/common';
import { JoinRoomDto } from './__dtos__/join-room.dto';
import { LeaveRoomDto } from './__dtos__/leave-room.dto';
import { PrismaService } from 'src/prisma.service';
import { RoomUser } from '@prisma/client';

@Injectable()
export class RoomUserService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async joinRoom(joinRoomDto: JoinRoomDto): Promise<RoomUser> {
        return this.prisma.roomUser.create({
            data: joinRoomDto,
            include: {
                user: true,
                room: true,
            },
        });
    }

    async leaveRoom(leaveRoomDto: LeaveRoomDto, userId: string): Promise<RoomUser> {
        return this.prisma.roomUser.delete({
            where: {
                roomId_userId: {
                    roomId: leaveRoomDto.roomId,
                    userId: userId,
                },
            },
            include: {
                user: true,
                room: true,
            },
        });
    }

    async findAllRoomsByUser(userId: string): Promise<RoomUser[]> {
        return await this.prisma.roomUser.findMany({
            where: { userId },
            include: {
                user: true,
                room: true,
            },
        });
    }

    async findAllUsersInRoom(roomId: string): Promise<RoomUser[]> {
        return this.prisma.roomUser.findMany({
            where: { roomId },
            include: {
                user: true,
                room: true,
            },
        });
    }

    async userInRoom(roomId: string, userId: string): Promise<RoomUser> {
        const roomUser = await this.prisma.roomUser.findUnique({
            where: {
                roomId_userId: {
                    roomId: roomId,
                    userId: userId,
                },
            },
            include: {
                user: true,
                room: true,
            },
        });

        return roomUser;
    }
}
