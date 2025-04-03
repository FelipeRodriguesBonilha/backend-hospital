import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreateMessageDto } from './__dtos__/create-message.dto';
import { UpdateMessageDto } from './__dtos__/update-message.dto';

@Injectable()
export class MessageService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createMessageDto: CreateMessageDto): Promise<Message> {
        const createdMessage = await this.prisma.message.create({
            data: createMessageDto,
        });

        return createdMessage;
    }

    async findAll(): Promise<Message[]> {
        const messages = await this.prisma.message.findMany();

        return messages;
    }

    async findById(id: string): Promise<Message> {
        const message = await this.prisma.message.findUnique({
            where: { id },
        });

        return message;
    }

    async update(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
        const updatedMessage = await this.prisma.message.update({
            where: { id },
            data: updateMessageDto,
        });

        return updatedMessage;
    }

    async remove(id: string): Promise<Message> {
        const deletedMessage = await this.prisma.message.delete({
            where: { id },
        });

        return deletedMessage;
    }
}
