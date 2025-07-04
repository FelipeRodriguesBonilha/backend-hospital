import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { UserModule } from 'src/user/user.module';
import { RoomModule } from 'src/room/room.module';
import { RoomUserModule } from 'src/room-user/room-user.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService, PrismaService],
  exports: [MessageService],
  imports: [UserModule, RoomModule, RoomUserModule]
})
export class MessageModule {}
