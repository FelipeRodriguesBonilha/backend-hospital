import { Controller, Get, Param, Res } from '@nestjs/common';
import { ArchiveService } from './archive.service';
import { Response } from 'express';

@Controller('archive')
export class ArchiveController {
    constructor(private readonly archiveService: ArchiveService) { }

    @Get('file/:filename')
    async getFile(@Param('filename') filename: string, @Res() res: Response) {
        const fileStream = this.archiveService.getFileStream(filename);

        return fileStream.getStream().pipe(res);
    }
}