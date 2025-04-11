import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Message } from '@prisma/client';
import { CreateMessageDto } from './__dtos__/create-message.dto';
import { UpdateMessageDto } from './__dtos__/update-message.dto';
import { MessageService } from './message.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/user/enum/role.enum';
import { UserId } from 'src/decorators/userId.decorator';

@Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    @Post()
    async create(@Body() createMessageDto: CreateMessageDto, @UserId() userId: string): Promise<Message> {
        return this.messageService.create(createMessageDto, userId);
    }

    @Get()
    async findAll(): Promise<Message[]> {
        return this.messageService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string, @UserId() userId: string): Promise<Message> {
        return this.messageService.findById(id, userId);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateMessageDto: UpdateMessageDto,
        @UserId() userId: string
    ): Promise<Message> {
        return this.messageService.update(id, updateMessageDto, userId);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @UserId() userId: string
    ): Promise<Message> {
        return this.messageService.remove(id, userId);
    }

    @Get('room/:roomId')
    async findAllMessagesByRoom(
        @Param('roomId') roomId: string,
        @UserId() userId: string
    ): Promise<Message[]> {
        return this.messageService.findAllMessagesByRoom(roomId, userId);
    }
}
