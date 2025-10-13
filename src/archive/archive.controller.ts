import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ChatGateway } from 'src/chat/chat.gateway';
import { MessageService } from 'src/message/message.service';
import { CreateArchiveDto } from './__dtos__/create-archive.dto';
import { ArchiveService } from './archive.service';
import { UserId } from 'src/decorators/userId.decorator';
import multerConfig from './multer-config';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/role/enum/role.enum';
import { ReturnMessageDto } from 'src/message/__dtos__/return-message.dto';

@Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
@Controller('archive')
export class ArchiveController {
    constructor(
        private readonly archiveService: ArchiveService,
        private readonly messageService: MessageService,
        private readonly chatGateway: ChatGateway
    ) { }

    @Roles(Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Post('upload-to-message')
    @UseInterceptors(FilesInterceptor('arquivos', 10, multerConfig))
    async uploadFilesToMessage(
        @Body() createArchiveDto: CreateArchiveDto,
        @UploadedFiles() files: Express.Multer.File[],
        @UserId() userId: string
    ) {
        const archives = await this.archiveService.create(
            createArchiveDto,
            files,
            userId,
            true
        );

        const message = new ReturnMessageDto(await this.messageService.findById(createArchiveDto.messageId, userId));
        message.seenByAll = await this.messageService.isMessageSeenByAllUsers(message.id, message.roomId, userId);
        
        this.chatGateway.server
            .to(message.roomId)
            .emit('message-updated', message);

        return archives;
    }

    @Roles(Role.AdministradorGeral, Role.AdministradorHospital, Role.Medico, Role.Recepcionista)
    @Get('file/:filename')
    async getFile(@Param('filename') filename: string, @Res() res: Response) {
        const fileStream = this.archiveService.getFileStream(filename);
        return fileStream.getStream().pipe(res);
    }
}