import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProblemsService } from './problems.service';

describe('ProblemsService', () => {
  let service: ProblemsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProblemsService],
    }).compile();

    service = module.get<ProblemsService>(ProblemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new problem', async () => {
      const desc = 'Keep buildings hot in winter and cold in summer';
      const result = await service.create(desc);

      expect(result).toHaveProperty('id');
      expect(result.description).toBe(desc);
      expect(result.status).toBe('PENDING');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('findOne', () => {
    it('should return a problem if it exists', async () => {
      const created = await service.create('Test problem');
      const found = await service.findOne(created.id);

      expect(found).toEqual(created);
    });

    it('should throw NotFoundException if problem does not exist', async () => {
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
