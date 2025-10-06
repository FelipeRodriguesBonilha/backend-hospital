import { forwardRef, Module } from '@nestjs/common';
import { HospitalModule } from 'src/hospital/hospital.module';
import { PrismaService } from 'src/prisma.service';
import { RoleModule } from 'src/role/role.module';
import { RoomUserModule } from 'src/room-user/room-user.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { RoomModule } from 'src/room/room.module';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [UserService],
  imports: [RoomUserModule, HospitalModule, forwardRef(() => RoomModule), forwardRef(() => RoleModule)]
})
export class UserModule { }
