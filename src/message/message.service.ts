import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { CreateArchiveDto } from 'src/archive/__dtos__/create-archive.dto';
import { ArchiveService } from 'src/archive/archive.service';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/role/enum/role.enum';
import { UserService } from 'src/user/user.service';
import { generateStoredFilename, UPLOAD_FILES_DIR } from 'src/utils/file-naming.util';
import { ALLOWED_FILE_MIME_TYPES, AllowedFileMimeType } from 'src/utils/file-types.constants';
import { CreateMessageDto } from './__dtos__/create-message.dto';
import { UpdateMessageDto } from './__dtos__/update-message.dto';

export interface IncomingFile {
    originalname: string;
    mimetype: string;
    buffer: Buffer;
}

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,

        @Inject(forwardRef(() => ArchiveService))
        private readonly archiveService: ArchiveService
    ) { }

    async create(createMessageDto: CreateMessageDto, userId: string) {
        const [requesterUser, room, isMember] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.prisma.room.findUnique({ where: { id: createMessageDto.roomId }, include: { hospital: true } }),
            this.userService.userAlreadyInRoom(createMessageDto.roomId, userId),
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!');

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode enviar mensagens para salas do seu hospital!');
        }

        if (!isMember) throw new ForbiddenException('Usuário não pertence à sala.');

        const createdMessage = await this.prisma.message.create({
            data: {
                ...createMessageDto,
                senderId: requesterUser.id,
            },
            include: {
                sender: true,
                room: true,
                archives: true,
            },
        });

        return this.findById(createdMessage.id, userId);
    }

    async findAll() {
        return await this.prisma.message.findMany({
            include: {
                sender: true,
                room: true,
                archives: true,
            }
        });
    }

    async findById(id: string, userId: string) {
        const [requesterUser, message] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.prisma.message.findFirst({
                where: {
                    id,
                },
                include: {
                    sender: true,
                    room: { include: { hospital: true } },
                    archives: true,
                },
            })
        ]);

        if (!message) throw new NotFoundException('Mensagem não encontrada!');

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== message.room.hospitalId) {
            throw new ForbiddenException('Você só pode acessar mensagens do seu hospital!');
        }

        const isMember = await this.userService.userAlreadyInRoom(message.roomId, userId);
        if (!isMember) throw new ForbiddenException('Usuário não pertence à sala.');

        return message;
    }

    async update(id: string, updateMessageDto: UpdateMessageDto, userId: string) {
        const [requesterUser, message] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.findById(id, userId)
        ]);

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== message.room.hospitalId) {
            throw new ForbiddenException('Você só pode editar mensagens do seu hospital!');
        }

        if (message.senderId !== userId) throw new ForbiddenException('A mensagem não pertence ao usuário');

        const isMember = await this.userService.userAlreadyInRoom(message.roomId, userId);
        if (!isMember) throw new ForbiddenException('Usuário não pertence à sala.');

        return await this.prisma.message.update({
            where: { id },
            data: { content: updateMessageDto.content },
            include: {
                sender: true,
                room: true,
                archives: true,
            }
        });
    }

    async remove(id: string, userId: string) {
        const [requesterUser, message] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.findById(id, userId),
        ]);

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== message.room.hospitalId) {
            throw new ForbiddenException('Você só pode remover mensagens do seu hospital!');
        }

        if (message.senderId !== userId) throw new ForbiddenException('A mensagem não pertence ao usuário');

        const isMember = await this.userService.userAlreadyInRoom(message.roomId, userId);
        if (!isMember) throw new ForbiddenException('Usuário não pertence à sala.');

        return await this.prisma.message.delete({
            where: { id },
            include: {
                sender: true,
                room: true,
                archives: true,
            },
        });
    }

    async findAllMessagesByRoom(roomId: string, userId: string) {
        const [requesterUser, room, userInRoom] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.prisma.room.findUnique({ where: { id: roomId }, include: { hospital: true } }),
            this.userService.userAlreadyInRoom(roomId, userId),
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!');

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode acessar mensagens do seu hospital!');
        }

        if (!userInRoom) throw new ForbiddenException('Usuário não pertence à sala.');

        return await this.prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: true,
                room: true,
                archives: true,
            }
        });
    }

    async findAllMessagesByRoomWithoutAccessControl(roomId: string) {
        return await this.prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: true,
                room: true,
                archives: true,
            }
        });
    }

    async markAllMessagesNotReadAsRead(roomId: string, userId: string) {
        const [requesterUser, room, userInRoom] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.prisma.room.findUnique({ where: { id: roomId }, include: { hospital: true } }),
            this.userService.userAlreadyInRoom(roomId, userId),
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!');

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode atualizar mensagens do seu hospital!');
        }

        if (!userInRoom) throw new ForbiddenException('Usuário não pertence à sala.');

        const unreadMessages = await this.prisma.message.findMany({
            where: {
                roomId,
                senderId: { not: userId },
                messageViewedUsers: {
                    none: { userId },
                },
            },
        });

        if (unreadMessages.length === 0) return

        const createData = unreadMessages.map((message: Message) => ({
            messageId: message.id,
            userId,
        }));

        await this.prisma.messageViewedUser.createMany({
            data: createData,
            skipDuplicates: true,
        });

        return unreadMessages;
    }

    async isMessageSeenByAllUsers(messageId: string, roomId: string, userId: string) {
        const [requesterUser, room] = await Promise.all([
            this.userService.findByIdWithoutAccessControl(userId),
            this.prisma.room.findUnique({ where: { id: roomId }, include: { hospital: true } })
        ]);

        if (!room) throw new NotFoundException('Sala não encontrada!');

        const userRole = requesterUser.role.name as Role;
        if (userRole === Role.AdministradorGeral) {
            throw new ForbiddenException('Administrador geral não possui permissões de sala.');
        }
        if ([Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) && requesterUser.hospitalId !== room.hospitalId) {
            throw new ForbiddenException('Você só pode acessar mensagens do seu hospital!');
        }

        const isMember = await this.userService.userAlreadyInRoom(roomId, userId);
        if (!isMember) throw new ForbiddenException('Usuário não pertence à sala.');

        const usersInRoom = await this.prisma.roomUser.findMany({
            where: { roomId },
            select: { userId: true }
        });

        const message = await this.findById(messageId, userId);

        const otherUsersInRoom = usersInRoom.filter((user) =>
            user.userId !== message.senderId
        );

        if (otherUsersInRoom.length === 0) return true;

        const viewedCount = await this.prisma.messageViewedUser.count({
            where: {
                messageId,
                userId: {
                    in: otherUsersInRoom.map((user) => user.userId)
                }
            }
        });

        return viewedCount === otherUsersInRoom.length;
    }

    async isMessageSeenByAllUsersWithoutAccessControl(messageId: string, roomId: string){
        const usersInRoom = await this.prisma.roomUser.findMany({
            where: { roomId },
            select: { userId: true }
        });

        const message = await this.prisma.message.findUnique({
            where: { id: messageId }
        });

        const otherUsersInRoom = usersInRoom.filter((user) =>
            user.userId !== message.senderId
        );

        if (otherUsersInRoom.length === 0) return true;

        const viewedCount = await this.prisma.messageViewedUser.count({
            where: {
                messageId,
                userId: {
                    in: otherUsersInRoom.map((user) => user.userId)
                }
            }
        });

        return viewedCount === otherUsersInRoom.length;
    }
}
