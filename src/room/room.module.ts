import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { RoomUserModule } from 'src/room-user/room-user.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [RoomController],
  providers: [RoomService, PrismaService],
  exports: [RoomService],
  imports: [RoomUserModule, UserModule]
})
export class RoomModule {}
