import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';

@Module({
  controllers: [HospitalController],
  providers: [HospitalService, PrismaService],
  exports: [HospitalService]
})
export class HospitalModule {}
