import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoomUserService } from './room-user.service';

@Module({
  controllers: [],
  providers: [RoomUserService, PrismaService],
  exports: [RoomUserService],
})
export class RoomUserModule {}
