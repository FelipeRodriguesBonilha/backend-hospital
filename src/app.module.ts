import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArchiveModule } from './archive/archive.module';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import { ExamModule } from './exam/exam.module';
import { RolesGuard } from './guards/roles.guard';
import { HospitalModule } from './hospital/hospital.module';
import { MessageModule } from './message/message.module';
import { PrismaService } from './prisma.service';
import { RoomUserModule } from './room-user/room-user.module';
import { RoomModule } from './room/room.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { UserModule } from './user/user.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [
    MessageModule,
    RoomModule,
    RoomUserModule,
    UserModule,
    AuthModule,
    HospitalModule,
    JwtModule, SchedulingModule, ExamModule, ArchiveModule, PatientModule,
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
export class AppModule { }
