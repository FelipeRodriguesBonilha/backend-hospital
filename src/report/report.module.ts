import { Module } from '@nestjs/common';
import { HospitalModule } from 'src/hospital/hospital.module';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService, PrismaService],
  imports: [UserModule, HospitalModule],
  exports: []
})
export class ReportModule { }