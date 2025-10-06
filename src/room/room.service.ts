import { ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/role/enum/role.enum';
import { JoinRoomDto } from 'src/room-user/__dtos__/join-room.dto';
import { LeaveRoomDto } from 'src/room-user/__dtos__/leave-room.dto';
import { RoomUserService } from 'src/room-user/room-user.service';
import { UserService } from 'src/user/user.service';
import { CreateRoomDto } from './__dtos__/create-room.dto';
import { UpdateRoomDto } from './__dtos__/update-room.dto';
import { RemoveUserDto } from 'src/room-user/__dtos__/remove-user.dto';

@Injectable()
export class RoomService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly roomUserService: RoomUserService,


        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService
    ) { }

    async create(createRoomDto: CreateRoomDto, userId: string) {
        const user = await this.userService.findByIdWithoutAccessControl(userId);

        const userRole = user.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && user.hospitalId !== createRoomDto.hospitalId) {
            throw new ForbiddenException('Usuário não pertence ao hospital informado.');
        }

        const roomCreated = await this.prisma.room.create({
            data: {
                ...createRoomDto,
                adminId: userId,
            },
            include: {
                hospital: true,
            }
        });

        const joinRoomDto: JoinRoomDto = {
            roomId: roomCreated.id,
            userIds: [userId]
        }

        await this.roomUserService.joinRoom(joinRoomDto);

        return roomCreated;
    }

    async findAll() {
        return await this.prisma.room.findMany({
            include: {
                hospital: true,
            }
        });
    }

    async findById(id: string, userId: string) {
        const [requesterUser, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.prisma.room.findUnique({
                where: { id },
                include: {
                    hospital: true,
                }
            })
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!');

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode acessar salas do seu hospital!');
        }

        return room;
    }

    async update(id: string, updateRoomDto: UpdateRoomDto, userId: string) {
        const [requesterUser, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.findById(id, userId),
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!')

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode editar salas do seu hospital!');
        }

        if (room.adminId !== userId) throw new ForbiddenException('Usuário não é o criador da sala!');

        return await this.prisma.room.update({
            where: { id },
            data: updateRoomDto,
            include: {
                hospital: true,
            }
        });
    }

    async remove(id: string, userId: string) {
        const [requesterUser, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.findById(id, userId),
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!')

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode remover salas do seu hospital!');
        }

        if (room.adminId !== userId) throw new ForbiddenException('Usuário não é o criador da sala!');

        return await this.prisma.room.delete({
            where: { id },
            include: {
                hospital: true,
            }
        });
    }

    async joinRoom(joinRoomDto: JoinRoomDto, adminId: string) {
        const [userAdding, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(adminId),
            this.findById(joinRoomDto.roomId, adminId),
        ]);

        if (!userAdding) throw new ForbiddenException('Usuário que está tentando adicionar não foi encontrado!');
        if (userAdding.role.name === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if (userAdding.hospitalId !== room.hospitalId) throw new ForbiddenException('Usuário que está tentando adicionar não pertence ao hospital da sala!');
        if (userAdding.id !== room.adminId) throw new ForbiddenException('Somente o administrador da sala pode adicionar usuários!');

        await Promise.all(
            joinRoomDto.userIds.map(async (id) => {
                const user = await this.userService.findByIdWithoutAccessControl(id);

                if (user.hospitalId !== room.hospitalId) throw new ForbiddenException(`Usuário ${id} não pertence ao hospital da sala!`);

                const alreadyInRoom = await this.userService.userAlreadyInRoom(joinRoomDto.roomId, id);

                if (alreadyInRoom) throw new ForbiddenException(`Usuário ${id} já está na sala!`);

                return true;
            })
        );

        return this.roomUserService.joinRoom(joinRoomDto);
    }

    async leaveRoom(leaveRoomDto: LeaveRoomDto, userId: string) {
        const [requesterUser, isMember, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.userService.userAlreadyInRoom(
                leaveRoomDto.roomId,
                userId,
            ),
            this.prisma.room.findUnique({
                where: { id: leaveRoomDto.roomId },
                include: { roomUsers: { orderBy: { createdAt: 'asc' } } },
            })
        ]);

        if (requesterUser.role.name === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if (!isMember) throw new NotFoundException('Usuário não está na sala!');
        if (!room) throw new NotFoundException('Sala não encontrada!');

        const isAdmin = room.adminId === userId;
        const remainingUsers = room.roomUsers.filter((ru) => ru.userId !== userId);

        if (isAdmin && remainingUsers.length === 0) {
            await this.prisma.$transaction([
                this.prisma.roomUser.delete({
                    where: { roomId_userId: { roomId: leaveRoomDto.roomId, userId } },
                }),
                this.prisma.room.delete({ where: { id: leaveRoomDto.roomId } }),
            ]);

            return room;
        }

        if (isAdmin) {
            const oldestUser = remainingUsers[0];
            await this.prisma.room.update({
                where: { id: leaveRoomDto.roomId },
                data: { adminId: oldestUser.userId },
            });
        }

        return await this.roomUserService.leaveRoom(leaveRoomDto, userId);
    }

    async removeUserFromRoom(dto: RemoveUserDto, adminId: string) {
        const [actor, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(adminId),
            this.findById(dto.roomId, adminId),
        ]);

        if (!actor) throw new ForbiddenException('Usuário (admin) não encontrado!');
        if (actor.role.name === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if (actor.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Admin não pertence ao hospital da sala!');
        }
        if (room.adminId !== adminId) {
            throw new ForbiddenException('Somente o administrador da sala pode remover usuários!');
        }
        if (dto.userId === room.adminId) {
            throw new ForbiddenException('Não é permitido remover o administrador da sala.');
        }

        const isMember = await this.userService.userAlreadyInRoom(dto.roomId, dto.userId);
        if (!isMember) throw new NotFoundException('Usuário não está na sala!');

        await this.roomUserService.removeUser(dto.roomId, dto.userId);

        return { room, removedUserId: dto.userId };
    }

    async findAllRoomsByUser(userId: string) {
        const [_, rooms] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.roomUserService.findAllRoomsByUser(userId),
        ]);

        return rooms;
    }
}
