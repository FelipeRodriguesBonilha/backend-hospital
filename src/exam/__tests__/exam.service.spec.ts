import { Test, TestingModule } from '@nestjs/testing';
import { ExamService } from '../exam.service';

describe('ExamsService', () => {
  let service: ExamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExamService],
    }).compile();

    service = module.get<ExamService>(ExamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
