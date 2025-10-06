import { Injectable } from '@nestjs/common';
import { Room, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { JoinRoomDto } from './__dtos__/join-room.dto';
import { LeaveRoomDto } from './__dtos__/leave-room.dto';

@Injectable()
export class RoomUserService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async joinRoom(joinRoomDto: JoinRoomDto) {
        await this.prisma.roomUser.createMany({
            data: joinRoomDto.userIds.map((userId) => ({
                roomId: joinRoomDto.roomId,
                userId,
            })),
            skipDuplicates: true,
        });

        return await this.prisma.room.findUniqueOrThrow({
            where: {
                id: joinRoomDto.roomId,
            },
            include: {
                admin: true,
                hospital: true,
            },
        });
    }

    async leaveRoom(leaveRoomDto: LeaveRoomDto, userId: string) {
        const roomUser = await this.prisma.roomUser.delete({
            where: {
                roomId_userId: {
                    roomId: leaveRoomDto.roomId,
                    userId: userId,
                },
            },
            include: {
                room: {
                    include: {
                        admin: true,
                        hospital: true,
                    }
                }
            },
        });

        return roomUser.room;
    }

    async findAllRoomsByUser(userId: string) {
        const roomUsers = await this.prisma.roomUser.findMany({
            where: { userId },
            include: {
                room: {
                    include: {
                        admin: true,
                        hospital: true,
                    }
                },
                user: true,
            },
        });

        return roomUsers.map((roomUser) => roomUser.room);
    }

    async findAllUsersInRoom(roomId: string) {
        const roomUsers = await this.prisma.roomUser.findMany({
            where: { roomId },
            include: {
                user: true,
            },
        });

        return roomUsers.map((roomUser) => roomUser.user);
    }

    async userAlreadyInRoom(roomId: string, userId: string) {
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

        return !!roomUser;
    }

    async findUsersNotInRoom(roomId: string, hospitalId: string) {
        const allUsersInRoom = await this.findAllUsersInRoom(roomId);

        const userIdsInRoom = allUsersInRoom.map((u) => u.id);

        return this.prisma.user.findMany({
            where: {
                hospitalId,
                id: {
                    notIn: userIdsInRoom,
                },
            },
            include: {
                hospital: true,
                role: true,
            },
        });
    }


    async removeUser(roomId: string, userId: string) {
        const roomUser = await this.prisma.roomUser.delete({
            where: { roomId_userId: { roomId, userId } },
            include: {
                room: {
                    include: { admin: true, hospital: true },
                },
            },
        });

        return roomUser.room;
    }
}
