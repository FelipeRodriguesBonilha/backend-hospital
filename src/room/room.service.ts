import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Room, RoomUser } from '@prisma/client';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RoomUserService } from 'src/room-user/room-user.service';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly roomUserService: RoomUserService,
        private readonly userService: UserService
    ) { }

    async create(createRoomDto: CreateRoomDto, userId: string): Promise<Room> {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        if (user.hospitalId !== createRoomDto.hospitalId) {
            throw new ForbiddenException('Usuário não pertence ao hospital informado.');
        }

        const createdRoom = await this.prisma.room.create({
            data: createRoomDto,
            include: {
                hospital: true,
            }
        });

        return createdRoom;
    }

    async findAll(): Promise<Room[]> {
        const rooms = await this.prisma.room.findMany({
            include: {
                hospital: true,
            }
        });

        return rooms;
    }

    async findById(id: string, userId: string): Promise<Room> {
        const userInRoom = await this.userInRoom(id, userId);

        if (!userInRoom) {
            throw new ForbiddenException('Usuário não pertence a sala!');
        }

        const room = await this.prisma.room.findUnique({
            where: { id },
            include: {
                hospital: true,
            }
        });

        return room;
    }

    async update(id: string, updateRoomDto: UpdateRoomDto, userId: string): Promise<Room> {
        const room = await this.findById(id, userId);

        if (!room) {
            throw new NotFoundException('Sala não encontrada!')
        }

        if (room.adminId !== userId) {
            throw new ForbiddenException('Usuário não é o criador da sala!');
        }

        const updatedRoom = await this.prisma.room.update({
            where: { id },
            data: updateRoomDto,
            include: {
                hospital: true,
            }
        });

        return updatedRoom;
    }

    async remove(id: string, userId: string): Promise<Room> {
        const room = await this.findById(id, userId);

        if (!room) {
            throw new NotFoundException('Sala não encontrada!')
        }

        if (room.adminId !== userId) {
            throw new ForbiddenException('Usuário não é o criador da sala!');
        }

        const deletedRoom = await this.prisma.room.delete({
            where: { id },
            include: {
                hospital: true,
            }
        });

        return deletedRoom;
    }

    async joinRoom(joinRoomDto: JoinRoomDto, userId: string): Promise<RoomUser> {
        const userTryingAdd = await this.userService.findById(userId);

        if (!userTryingAdd) {
            throw new ForbiddenException('Usuário que está tentando adicionar outro usuário não encontrado');
        }

        const user = await this.userService.findById(joinRoomDto.userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        const room = await this.findById(joinRoomDto.roomId, userId);

        if (!room) {
            throw new NotFoundException('Sala não encontrada!');
        }

        if (userTryingAdd.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Usuário que está tentando adicionar não pertence ao hospital desta sala!');
        }

        if (user.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Usuário que está sendo adicionado não pertence ao hospital desta sala!');
        }

        const userInRoom = await this.roomUserService.userInRoom(joinRoomDto.roomId, joinRoomDto.userId);

        if (userInRoom) {
            throw new ForbiddenException('Usuário já está na sala!');
        }

        //adicionar lógica para somente criador da sala conseguir adicionar outros usuários a sala

        const userJoinedRoom = await this.roomUserService.joinRoom(joinRoomDto);

        return userJoinedRoom;
    }

    async leaveRoom(leaveRoomDto: LeaveRoomDto, userId: string): Promise<RoomUser> {
        const userInRoom = await this.roomUserService.userInRoom(leaveRoomDto.roomId, userId);

        if (!userInRoom) {
            throw new NotFoundException('Usuário não está na sala!');
        }

        const userLeavedRoom = await this.roomUserService.leaveRoom(leaveRoomDto, userId);

        return userLeavedRoom;
    }

    async findAllRoomsByUser(userId: string): Promise<RoomUser[]> {
        const allRoomsByUSer = await this.roomUserService.findAllRoomsByUser(userId);

        return allRoomsByUSer
    }

    async findAllUsersInRoom(roomId: string): Promise<RoomUser[]> {
        const allUsersInRoom = await this.roomUserService.findAllUsersInRoom(roomId);

        return allUsersInRoom;
    }

    async userInRoom(roomId: string, userId: string): Promise<RoomUser> {
        const userInRoom = await this.roomUserService.userInRoom(roomId, userId);

        return userInRoom;
    }
}
