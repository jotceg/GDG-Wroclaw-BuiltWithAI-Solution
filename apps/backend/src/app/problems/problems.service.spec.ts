import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ProblemsService } from './problems.service';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';
import { Problem, Contradiction, Solution, Evaluation, Selection, FiveWhysStep } from '../database/models';

describe('ProblemsService', () => {
  let service: ProblemsService;

  const mockProblemModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'problem-1', ...dto, save: jest.fn() })),
    findByPk: jest.fn().mockImplementation((id) => Promise.resolve({ id, description: 'Test problem', status: 'PENDING', save: jest.fn() })),
    findAll: jest.fn().mockResolvedValue([]),
  };
  const mockContradictionModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'contra-1', ...dto })),
    destroy: jest.fn().mockResolvedValue(1),
  };
  const mockSolutionModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'sol-1', ...dto })),
    destroy: jest.fn().mockResolvedValue(1),
    findAll: jest.fn().mockResolvedValue([]),
  };
  const mockEvaluationModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'eval-1', ...dto })),
    destroy: jest.fn().mockResolvedValue(1),
  };
  const mockSelectionModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'select-1', ...dto })),
    destroy: jest.fn().mockResolvedValue(1),
  };
  const mockFiveWhysStepModel = {
    create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'step-1', ...dto })),
  };

  const mockLlmService = {
    generateContradiction: jest.fn().mockResolvedValue({
      improvingParamCode: 9,
      improvingParamName: 'Speed',
      worseningParamCode: 36,
      worseningParamName: 'Device complexity',
      explanation: 'Explanation',
    }),
    generateTrizSolutions: jest.fn().mockResolvedValue([
      { title: 'Sol 1', description: 'Desc 1', principleCode: '10', principleName: 'Prior Action' }
    ]),
    askNextWhy: jest.fn().mockResolvedValue({
      question: 'Why?',
      isAbuseOrOffTopic: false,
    }),
    generateFiveWhysSolutions: jest.fn().mockResolvedValue([
      { title: 'Sol 5w', description: 'Desc 5w' }
    ]),
    evaluateSolutions: jest.fn().mockResolvedValue([
      { solutionId: 'sol-1', criterion: 'feasibility', score: 8, reasoning: 'Reason' }
    ]),
    selectBestSolution: jest.fn().mockResolvedValue({
      selectedSolutionId: 'sol-1',
      justification: 'Justify',
    }),
  };

  const mockMcpClientService = {
    browseContradictionMatrix: jest.fn().mockResolvedValue('Principles description text'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProblemsService,
        { provide: getModelToken(Problem), useValue: mockProblemModel },
        { provide: getModelToken(Contradiction), useValue: mockContradictionModel },
        { provide: getModelToken(Solution), useValue: mockSolutionModel },
        { provide: getModelToken(Evaluation), useValue: mockEvaluationModel },
        { provide: getModelToken(Selection), useValue: mockSelectionModel },
        { provide: getModelToken(FiveWhysStep), useValue: mockFiveWhysStepModel },
        { provide: LlmService, useValue: mockLlmService },
        { provide: McpClientService, useValue: mockMcpClientService },
      ],
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
    });
  });
});
