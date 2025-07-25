import { Test, TestingModule } from '@nestjs/testing';
import { ExamController } from '../exam.controller';
import { ExamService } from '../exam.service';

describe('ExamsController', () => {
  let controller: ExamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExamController],
      providers: [ExamService],
    }).compile();

    controller = module.get<ExamController>(ExamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
