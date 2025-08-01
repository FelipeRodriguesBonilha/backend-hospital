import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './__dtos__/create-message.dto';
import { UpdateMessageDto } from './__dtos__/update-message.dto';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';
import { RoomUserService } from 'src/room-user/room-user.service';

@Injectable()
export class MessageService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly roomService: RoomService,
        private readonly roomUserService: RoomUserService
    ) { }

    async create(createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        const createdMessage = await this.prisma.message.create({
            data: {
                ...createMessageDto,
                senderId: userId
            },
            include: {
                sender: true,
                room: true
            }
        });

        return createdMessage;
    }

    async findAll(): Promise<Message[]> {
        const messages = await this.prisma.message.findMany({
            include: {
                sender: true,
                room: true
            }
        });

        return messages;
    }

    async findById(id: string, userId: string): Promise<Message> {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        const message = await this.prisma.message.findFirst({
            where: {
                id,
                senderId: userId,
            },
            include: {
                sender: true,
                room: true
            }
        });

        if (!message) {
            throw new ForbiddenException('A mensagem não pertence ao usuário');
        }

        return message;
    }

    async update(id: string, updateMessageDto: UpdateMessageDto, userId: string): Promise<Message> {
        const message = await this.findById(id, userId);

        if (!message) {
            throw new NotFoundException('Mensagem não encontrada!')
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('A mensagem não pertence ao usuário');
        }

        const updatedMessage = await this.prisma.message.update({
            where: { id },
            data: updateMessageDto,
            include: {
                sender: true,
                room: true
            }
        });

        return updatedMessage;
    }

    async remove(id: string, userId: string): Promise<Message> {
        const message = await this.findById(id, userId);

        if (!message) {
            throw new NotFoundException('Mensagem não encontrada!')
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('A mensagem não pertence ao usuário');
        }

        const deletedMessage = await this.prisma.message.delete({
            where: { id },
            include: {
                sender: true,
                room: true
            }
        });

        return deletedMessage;
    }

    async findAllMessagesByRoom(roomId: string, userId: string) {
        const user = await this.userService.findById(userId);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado!');
        }

        const userInRoom = await this.roomService.userInRoom(roomId, userId);

        if (!userInRoom) {
            throw new ForbiddenException('Usuário não pertence à sala.');
        }

        const allMessagesByRoom = await this.prisma.message.findMany({
            where: { roomId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: true,
                room: true
            }
        });

        return allMessagesByRoom;
    }

    async markAllMessagesNotReadAsRead(roomId: string, userId: string): Promise<Message[]> {
        const unreadMessages = await this.prisma.message.findMany({
            where: {
                roomId,
                senderId: { not: userId },
                messageViewedUsers: {
                    none: { userId },
                },
            },
        });

        if (unreadMessages.length === 0) {
            throw new BadRequestException('Todas as mensagens já foram visualizadas pelo usuário!')
        }

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


    async isMessageSeenByAllUsers(messageId: string, roomId: string): Promise<boolean> {
        const usersInRoom = await this.prisma.roomUser.findMany({
            where: { roomId },
            select: { userId: true }
        });

        const message = await this.prisma.message.findUnique({
            where: { id: messageId },
            select: { senderId: true }
        });

        if (!message) {
            throw new NotFoundException('Mensagem não encontrada!');
        }

        const otherUsersInRoom = usersInRoom.filter((user) =>
            user.userId !== message.senderId
        );

        if (otherUsersInRoom.length === 0) {
            return true;
        }

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
