import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Roles } from 'src/decorators/roles.decorator';
import { UserId } from 'src/decorators/userId.decorator';
import { Role } from 'src/role/enum/role.enum';
import { CreateMessageDto } from './__dtos__/create-message.dto';
import { ReturnMessageDto } from './__dtos__/return-message.dto';
import { UpdateMessageDto } from './__dtos__/update-message.dto';
import { MessageService } from './message.service';

@Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
@Controller('messages')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    async create(
        @Body() createMessageDto: CreateMessageDto, 
        @UserId() userId: string
    ): Promise<ReturnMessageDto> {
        return new ReturnMessageDto(await this.messageService.create(createMessageDto, userId));
    }

    @Get()
    async findAll(): Promise<ReturnMessageDto[]> {
        return (await this.messageService.findAll()).map((message) => new ReturnMessageDto(message));
    }

    @Get('room/:roomId')
    async findAllMessagesByRoom(
        @Param('roomId') roomId: string,
        @UserId() userId: string
    ): Promise<ReturnMessageDto[]> {
        return (await this.messageService.findAllMessagesByRoom(roomId, userId)).map((message) => new ReturnMessageDto(message));
    }

    @Get(':id')
    async findById(
        @Param('id') id: string, 
        @UserId() userId: string
    ): Promise<ReturnMessageDto> {
        return new ReturnMessageDto(await this.messageService.findById(id, userId));
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateMessageDto: UpdateMessageDto,
        @UserId() userId: string
    ): Promise<ReturnMessageDto> {
        return new ReturnMessageDto(await this.messageService.update(id, updateMessageDto, userId));
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @UserId() userId: string
    ): Promise<ReturnMessageDto> {
        return new ReturnMessageDto(await this.messageService.remove(id, userId));
    }
}
