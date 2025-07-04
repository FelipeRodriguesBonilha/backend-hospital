import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Archive } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CreateArchiveDto } from './__dtos__/create-archive.dto';
import { ArchiveService } from './archive.service';

@Controller('archives')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) { }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (
          _: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ): void => {
          const uniqueName: string = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Archive> {
    const fileUrl: string = `/uploads/${file.filename}`;

    const archiveDto: CreateArchiveDto = {
      name: file.originalname,
      type: file.mimetype,
      url: fileUrl,
    };

    return this.archiveService.create(archiveDto);
  }
}