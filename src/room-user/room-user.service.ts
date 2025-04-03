import { Injectable } from '@nestjs/common';
import { JoinRoomDto } from './__dtos__/join-room.dto';
import { LeaveRoomDto } from './__dtos__/leave-room.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RoomUserService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async joinRoom(joinRoomDto: JoinRoomDto) {
        return this.prisma.roomUser.create({
            data: joinRoomDto,
        });
    }

    async leaveRoom(leaveRoomDto: LeaveRoomDto) {
        return this.prisma.roomUser.deleteMany({
            where: {
                roomId: leaveRoomDto.roomId,
                userId: leaveRoomDto.userId,
            },
        });
    }

    async findAllRoomsByUser(userId: string) {
        return await this.prisma.roomUser.findMany({
          where: { userId },
          include: { room: true },
        });
      }

    async findAllUsersInRoom(roomId: string) {
        return this.prisma.roomUser.findMany({
            where: { roomId },
            include: { user: true },
        });
    }
}
