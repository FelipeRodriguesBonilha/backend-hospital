import { Module } from '@nestjs/common';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { HospitalModule } from 'src/hospital/hospital.module';
import { PatientModule } from 'src/patient/patient.module';

@Module({
  controllers: [SchedulingController],
  providers: [SchedulingService, PrismaService],
  imports: [UserModule, HospitalModule, PatientModule]
})
export class SchedulingModule {}
