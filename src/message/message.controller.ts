import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Message } from '@prisma/client';
import { CreateMessageDto } from './__dtos__/create-message.dto';
import { UpdateMessageDto } from './__dtos__/update-message.dto';
import { MessageService } from './message.service';

@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Post()
    async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
        return this.messageService.create(createMessageDto);
    }

    @Get()
    async findAll(): Promise<Message[]> {
        return this.messageService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string): Promise<Message> {
        return this.messageService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateMessageDto: UpdateMessageDto
    ): Promise<Message> {
        return this.messageService.update(id, updateMessageDto);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<Message> {
        return this.messageService.remove(id);
    }
}
