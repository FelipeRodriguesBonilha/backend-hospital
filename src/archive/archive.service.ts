import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync, unlinkSync } from 'fs';
import * as path from 'path';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma.service';
import { Role } from 'src/role/enum/role.enum';
import { UserService } from 'src/user/user.service';
import { UPLOAD_FILES_DIR } from 'src/utils/file-naming.util';
import { CreateArchiveDto } from './__dtos__/create-archive.dto';
import { UpdateArchiveDto } from './__dtos__/update-archive.dto';

@Injectable()
export class ArchiveService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,

    @Inject(forwardRef(() => MessageService))
    private readonly messageService: MessageService
  ) { }

  getFileStream(filename: string) {
    const filePath = path.join(UPLOAD_FILES_DIR, filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException(`Arquivo "${filename}" não encontrado`);
    }

    const fileStream = createReadStream(filePath);
    return new StreamableFile(fileStream);
  }

  async create(
    createArchiveDto: CreateArchiveDto,
    files: Express.Multer.File[],
    userId: string,
    isMessage = false
  ) {
    if (files.length === 0) {
      throw new BadRequestException('Pelo menos um arquivo deve ser enviado!');
    }

    if(isMessage){
      const [user, message] = await Promise.all([
        this.userService.findByIdWithoutAccessControl(userId),
        createArchiveDto.messageId
          ? this.messageService.findById(createArchiveDto.messageId, userId)
          : Promise.resolve(null)
      ]);

      if(!createArchiveDto.messageId){
        throw new BadRequestException('Um mensagem deve atrelada a um arquivo!');
      }
  
      const userRole = user.role.name as Role;

      if (userRole === Role.AdministradorGeral && createArchiveDto.messageId) {
        throw new ForbiddenException('Administrador geral não possui permissão para criar arquivos em mensagens.');
      }
  
      if (
        [
          Role.AdministradorHospital,
          Role.Recepcionista,
          Role.Medico
        ].includes(userRole) && (user.hospitalId !== message?.room?.hospitalId) && createArchiveDto.messageId &&
        message?.senderId !== user.id
      ) {
        throw new BadRequestException('Você não tem permissão para criar um arquivo nessa mensagem');
      }
    }

    return Promise.all(
      files.map((file) =>
        this.prisma.archive.create({
          data: {
            name: file.filename,
            type: file.mimetype,
            url: file.path.replace(/\\/g, '/'),
            message: createArchiveDto.messageId ? { connect: { id: createArchiveDto.messageId } } : undefined,
          },
        })
      )
    );
  }

  async update(
    id: string,
    updateArchiveDto: UpdateArchiveDto,
    files: Express.Multer.File[],
    userId: string
  ) {
    const existingArchive = await this.prisma.archive.findUnique({
      where: { id },
      include: { message: { include: { room: true } } }
    });

    if (!existingArchive) {
      throw new NotFoundException('Arquivo não encontrado!');
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('É necessário enviar pelo menos um arquivo para atualizar!');
    }

    const [user, message] = await Promise.all([
      this.userService.findByIdWithoutAccessControl(userId),
      updateArchiveDto.messageId
        ? this.messageService.findById(updateArchiveDto.messageId, userId)
        : existingArchive.message
    ]);

    const userRole = user.role.name as Role;

    if (userRole === Role.AdministradorGeral && updateArchiveDto.messageId) {
      throw new ForbiddenException('Administrador geral não possui permissão para atualizar arquivos em mensagens.');
    }

    if (
      [Role.AdministradorHospital, Role.Recepcionista, Role.Medico].includes(userRole) &&
      user.hospitalId !== message?.room?.hospitalId && updateArchiveDto.messageId
    ) {
      throw new ForbiddenException('Você não tem permissão para atualizar este arquivo');
    }

    const file = files[0];

    const updatedArchive = await this.prisma.archive.update({
      where: { id },
      data: {
        name: file.filename,
        type: file.mimetype,
        url: file.path.replace(/\\/g, '/'),
        message: updateArchiveDto.messageId ? { connect: { id: updateArchiveDto.messageId } } : undefined,
      },
    });

    const oldFilePath = existingArchive.url;
    if (oldFilePath && existsSync(oldFilePath)) {
      unlinkSync(oldFilePath);
    }

    return updatedArchive;
  }
}