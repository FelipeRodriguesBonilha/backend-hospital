import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { HospitalModule } from 'src/hospital/hospital.module';

@Module({
  controllers: [PatientController],
  providers: [PatientService, PrismaService],
  imports: [UserModule, HospitalModule],
  exports: [PatientService]
})
export class PatientModule { }