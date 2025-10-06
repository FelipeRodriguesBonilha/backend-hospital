import { forwardRef, Module } from '@nestjs/common';
import { MessageModule } from 'src/message/message.module';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { ArchiveController } from './archive.controller';
import { ArchiveService } from './archive.service';

@Module({
  controllers: [ArchiveController],
  providers: [ArchiveService, PrismaService],
  exports: [ArchiveService],
  imports: [forwardRef(() => MessageModule), UserModule]
})
export class ArchiveModule { }
