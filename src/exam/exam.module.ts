import { Module } from '@nestjs/common';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ExamController],
  providers: [ExamService, PrismaService],
})
export class ExamModule {}
