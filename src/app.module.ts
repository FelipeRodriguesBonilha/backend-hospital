import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { RoomUserService } from './room-user/room-user.service';
import { RoomUserModule } from './room-user/room-user.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { HospitalModule } from './hospital/hospital.module';
import { ChatGateway } from './chat/chat.gateway';
import { PrismaService } from './prisma.service';

@Module({
  imports: [MessageModule, RoomModule, RoomUserModule, UserModule, AuthModule, HospitalModule],
  controllers: [AppController],
  providers: [AppService, RoomUserService, PrismaService, ChatGateway],
})
export class AppModule {}
