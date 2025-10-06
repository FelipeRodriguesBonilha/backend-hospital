import { forwardRef, Module } from '@nestjs/common';
import { ArchiveModule } from 'src/archive/archive.module';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
  imports: [UserModule, forwardRef(() => ArchiveModule)]
})
export class MessageModule { }
