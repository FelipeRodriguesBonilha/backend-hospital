import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { HospitalModule } from './hospital/hospital.module';
import { MessageModule } from './message/message.module';
import { PrismaService } from './prisma.service';
import { RoomUserModule } from './room-user/room-user.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MessageModule, 
    RoomModule, 
    RoomUserModule, 
    UserModule, 
    AuthModule, 
    HospitalModule, 
    JwtModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService, 
    PrismaService, 
    ChatGateway,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }
  ],
})
export class AppModule {}
