import { Module } from '@nestjs/common';
import { ArchiveModule } from 'src/archive/archive.module';
import { HospitalModule } from 'src/hospital/hospital.module';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PatientModule } from 'src/patient/patient.module';

@Module({
  controllers: [ExamController],
  providers: [ExamService, PrismaService],
  imports: [UserModule, HospitalModule, ArchiveModule, PatientModule]
})
export class ExamModule { }
