import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { MailController } from './mail/mail.controller';
import { MailModule } from './mail/mail.module';
import { MailService } from './mail/mail.service';
import { MessageModule } from './message/message.module';
import { PatientModule } from './patient/patient.module';
import { PrismaService } from './prisma.service';
import { ReportModule } from './report/report.module';
import { RoleModule } from './role/role.module';
import { RoomUserModule } from './room-user/room-user.module';
import { RoomModule } from './room/room.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MessageModule,
    RoomModule,
    RoomUserModule,
    UserModule,
    AuthModule,
    HospitalModule,
    JwtModule, 
    SchedulingModule, 
    ExamModule, 
    ArchiveModule, 
    PatientModule, 
    RoleModule, 
    MailModule, 
    ReportModule
  ],
  controllers: [
    AppController,
    MailController
  ],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    MailService
  ],
})
export class AppModule { }
