// chat.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/user/user.service';
import { RoomService } from 'src/room/room.service';
import { RoomUserService } from 'src/room-user/room-user.service';
import { HospitalService } from 'src/hospital/hospital.service';
import { RoleService } from 'src/role/role.service';
import { ArchiveModule } from 'src/archive/archive.module'; // ✅ precisa importar
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    forwardRef(() => ArchiveModule),
  ],
  providers: [
    PrismaService,  
    ChatGateway,
    UserService,
    MessageService,
    RoomService,
    RoomUserService,
    HospitalService,
    RoleService,
    JwtService,
  ],
  exports: [ChatGateway],
})
export class ChatModule {}