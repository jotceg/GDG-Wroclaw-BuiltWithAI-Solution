import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { ProblemsService } from './problems.service';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';
import { Problem, Contradiction, Solution, Evaluation, Selection, FiveWhysStep } from '../database/models';

/**
 * ProblemsService unit tests (all Sequelize models + LlmService + McpClientService mocked).
 *
 * Covers every pipeline method and, critically, the guard branches that enforce
 * the docs' step-ordering / inspectability contract (docs/04_architecture.md,
 * docs/01_task.md): TRIZ requires a contradiction first, evaluate/select require
 * candidates, etc. Also asserts the hard requirements are structurally satisfied
 * (>=3 TRIZ, >=3 five-whys, evaluate ALL candidates, select persists full trail).
 */
describe('ProblemsService', () => {
  let service: ProblemsService;

  // Fresh mocks each test so call assertions and per-test return values don't leak.
  let mockProblemModel: any;
  let mockContradictionModel: any;
  let mockSolutionModel: any;
  let mockEvaluationModel: any;
  let mockSelectionModel: any;
  let mockFiveWhysStepModel: any;
  let mockLlmService: any;

  /** Build a Problem-like row with a save() spy and any eager-loaded associations. */
  const makeProblem = (overrides: Record<string, any> = {}) => ({
    id: 'problem-1',
    description: 'Keeping buildings hot and cold',
    status: 'PENDING',
    contradiction: undefined,
    solutions: undefined,
    fiveWhysSteps: undefined,
    selection: undefined,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  });

  beforeEach(async () => {
    mockProblemModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'problem-1', ...dto, save: jest.fn() })),
      findByPk: jest.fn(),
      findAll: jest.fn().mockResolvedValue([]),
    };
    mockContradictionModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'contra-1', ...dto })),
      destroy: jest.fn().mockResolvedValue(1),
    };
    mockSolutionModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: `sol-${Math.random()}`, ...dto })),
      destroy: jest.fn().mockResolvedValue(1),
      findAll: jest.fn().mockResolvedValue([]),
    };
    mockEvaluationModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'eval-1', ...dto })),
      destroy: jest.fn().mockResolvedValue(1),
    };
    mockSelectionModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'select-1', ...dto })),
      destroy: jest.fn().mockResolvedValue(1),
      findOne: jest.fn(),
    };
    mockFiveWhysStepModel = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'step-1', ...dto })),
    };
    mockLlmService = {
      generateContradiction: jest.fn(),
      generateTrizSolutions: jest.fn(),
      askNextWhy: jest.fn(),
      generateFiveWhysSolutions: jest.fn(),
      evaluateSolutions: jest.fn(),
      selectBestSolution: jest.fn(),
    };

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
        { provide: McpClientService, useValue: {} },
      ],
    }).compile();

    service = module.get<ProblemsService>(ProblemsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a PENDING problem', async () => {
      const desc = 'Keep buildings hot in winter and cold in summer';
      const result = await service.create(desc);

      expect(mockProblemModel.create).toHaveBeenCalledWith({ description: desc, status: 'PENDING' });
      expect(result.description).toBe(desc);
      expect(result.status).toBe('PENDING');
    });

    it('rejects an empty/blank description (BadRequest guard)', async () => {
      await expect(service.create('   ')).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.create(undefined as any)).rejects.toBeInstanceOf(BadRequestException);
      expect(mockProblemModel.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns the problem with associations eagerly loaded', async () => {
      const prob = makeProblem();
      mockProblemModel.findByPk.mockResolvedValue(prob);

      const result = await service.findOne('problem-1');

      expect(result).toBe(prob);
      expect(mockProblemModel.findByPk).toHaveBeenCalledWith('problem-1', {
        include: [Contradiction, Solution, Selection, FiveWhysStep],
      });
    });

    it('throws NotFoundException when the problem does not exist', async () => {
      mockProblemModel.findByPk.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('returns all problems with contradiction + selection', async () => {
      const list = [makeProblem(), makeProblem({ id: 'problem-2' })];
      mockProblemModel.findAll.mockResolvedValue(list);

      const result = await service.findAll();

      expect(result).toBe(list);
      expect(mockProblemModel.findAll).toHaveBeenCalledWith({ include: [Contradiction, Selection] });
    });
  });

  describe('reformulateContradiction', () => {
    it('persists the contradiction and advances status', async () => {
      const prob = makeProblem();
      mockProblemModel.findByPk.mockResolvedValue(prob);
      mockLlmService.generateContradiction.mockResolvedValue({
        improvingParamCode: 9,
        improvingParamName: 'Speed',
        worseningParamCode: 36,
        worseningParamName: 'Device complexity',
        explanation: 'Explanation',
      });

      const result = await service.reformulateContradiction('problem-1');

      expect(mockLlmService.generateContradiction).toHaveBeenCalledWith(prob.description);
      // idempotent: clears any prior contradiction before inserting
      expect(mockContradictionModel.destroy).toHaveBeenCalledWith({ where: { problemId: 'problem-1' } });
      expect(mockContradictionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ problemId: 'problem-1', improvingParamCode: 9, worseningParamCode: 36 })
      );
      expect(prob.status).toBe('CONTRADICTION_GENERATED');
      expect(prob.save).toHaveBeenCalled();
      expect(result.improvingParamName).toBe('Speed');
    });
  });

  describe('generateTrizSolutions', () => {
    it('requires a contradiction first (BadRequest guard)', async () => {
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ contradiction: undefined }));
      await expect(service.generateTrizSolutions('problem-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(mockLlmService.generateTrizSolutions).not.toHaveBeenCalled();
    });

    it('generates >=3 TRIZ candidates and advances status', async () => {
      const prob = makeProblem({
        contradiction: { improvingParamCode: 9, worseningParamCode: 36 },
      });
      mockProblemModel.findByPk.mockResolvedValue(prob);
      mockLlmService.generateTrizSolutions.mockResolvedValue([
        { title: 'T1', description: 'd', principleCode: '10', principleName: 'Prior Action' },
        { title: 'T2', description: 'd', principleCode: '32', principleName: 'Color change' },
        { title: 'T3', description: 'd', principleCode: '35', principleName: 'Parameter Change' },
      ]);

      const result = await service.generateTrizSolutions('problem-1');

      expect(mockLlmService.generateTrizSolutions).toHaveBeenCalledWith(prob.description, 9, 36);
      expect(mockSolutionModel.destroy).toHaveBeenCalledWith({ where: { problemId: 'problem-1', method: 'triz' } });
      expect(result).toHaveLength(3); // hard requirement: >=3 candidates from TRIZ
      expect(result.every((s) => s.method === 'triz')).toBe(true);
      expect(prob.status).toBe('TRIZ_SOLUTIONS_GENERATED');
    });
  });

  describe('fiveWhysNext', () => {
    it('returns the pending question without calling the LLM again', async () => {
      const prob = makeProblem({
        fiveWhysSteps: [{ depth: 1, question: 'Why hot?', answer: '', kind: 'answer', confirmed: false }],
      });
      mockProblemModel.findByPk.mockResolvedValue(prob);

      const result = await service.fiveWhysNext('problem-1');

      expect(result).toEqual(expect.objectContaining({ question: 'Why hot?', done: false }));
      expect(mockLlmService.askNextWhy).not.toHaveBeenCalled();
    });

    it('reports done when depth>=5 and all answered', async () => {
      const steps = Array.from({ length: 5 }, (_, i) => ({
        depth: i + 1,
        question: `Why ${i + 1}?`,
        answer: `Because ${i + 1}`,
        kind: 'answer',
        confirmed: true,
      }));
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ fiveWhysSteps: steps }));

      const result = await service.fiveWhysNext('problem-1');

      expect(result.done).toBe(true);
      expect(mockLlmService.askNextWhy).not.toHaveBeenCalled();
    });

    it('short-circuits on abuse/off-topic without persisting a step', async () => {
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ fiveWhysSteps: [] }));
      mockLlmService.askNextWhy.mockResolvedValue({ question: '', isAbuseOrOffTopic: true });

      const result = await service.fiveWhysNext('problem-1');

      expect(result.isAbuseOrOffTopic).toBe(true);
      expect(mockFiveWhysStepModel.create).not.toHaveBeenCalled();
    });

    it('persists a newly generated question at the next depth', async () => {
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ fiveWhysSteps: [] }));
      mockLlmService.askNextWhy.mockResolvedValue({ question: 'Why does it heat up?', isAbuseOrOffTopic: false });

      const result = await service.fiveWhysNext('problem-1');

      expect(mockFiveWhysStepModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ problemId: 'problem-1', depth: 1, question: 'Why does it heat up?', confirmed: false })
      );
      expect(result.question).toBe('Why does it heat up?');
    });
  });

  describe('fiveWhysAnswer', () => {
    it('fills the latest pending step', async () => {
      const pending = { depth: 1, question: 'Why?', answer: '', kind: 'answer', confirmed: false, save: jest.fn() };
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ fiveWhysSteps: [pending] }));

      const result = await service.fiveWhysAnswer('problem-1', 'Because of solar gains', 'answer', true);

      expect(pending.answer).toBe('Because of solar gains');
      expect(pending.confirmed).toBe(true);
      expect(pending.save).toHaveBeenCalled();
      expect(result).toBe(pending);
    });

    it('throws BadRequest when there is no pending question', async () => {
      const answered = { depth: 1, question: 'Why?', answer: 'Because', kind: 'answer', confirmed: true, save: jest.fn() };
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ fiveWhysSteps: [answered] }));

      await expect(service.fiveWhysAnswer('problem-1', 'x')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('throws BadRequest on an empty answer', async () => {
      await expect(service.fiveWhysAnswer('problem-1', '  ')).rejects.toBeInstanceOf(BadRequestException);
      expect(mockProblemModel.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('generateFiveWhysSolutions', () => {
    it('throws BadRequest when no 5-whys steps exist', async () => {
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ fiveWhysSteps: [] }));
      await expect(service.generateFiveWhysSolutions('problem-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(mockLlmService.generateFiveWhysSolutions).not.toHaveBeenCalled();
    });

    it('generates >=3 countermeasures from the causal chain and advances status', async () => {
      const prob = makeProblem({
        fiveWhysSteps: [
          { depth: 1, question: 'Why hot?', answer: 'Solar gains', kind: 'answer', confirmed: true },
          { depth: 2, question: 'Why solar gains?', answer: 'No shading', kind: 'answer', confirmed: true },
        ],
      });
      mockProblemModel.findByPk.mockResolvedValue(prob);
      mockLlmService.generateFiveWhysSolutions.mockResolvedValue([
        { title: 'C1', description: 'd' },
        { title: 'C2', description: 'd' },
        { title: 'C3', description: 'd' },
      ]);

      const result = await service.generateFiveWhysSolutions('problem-1');

      // causal chain string is built from the sorted steps
      expect(mockLlmService.generateFiveWhysSolutions).toHaveBeenCalledWith(
        prob.description,
        expect.stringContaining('Why 1: Why hot? -> Answer: Solar gains')
      );
      expect(mockSolutionModel.destroy).toHaveBeenCalledWith({ where: { problemId: 'problem-1', method: 'fivewhys' } });
      expect(result).toHaveLength(3); // hard requirement: >=3 candidates from second method
      expect(result.every((s) => s.method === 'fivewhys')).toBe(true);
      expect(prob.status).toBe('FIVE_WHYS_SOLUTIONS_GENERATED');
    });
  });

  describe('evaluateCandidates', () => {
    it('throws BadRequest when there are no candidates', async () => {
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ solutions: [] }));
      await expect(service.evaluateCandidates('problem-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('evaluates ALL candidates and advances status', async () => {
      const solutions = [
        { id: 's1', title: 'T1', description: 'd', method: 'triz' },
        { id: 's2', title: 'T2', description: 'd', method: 'triz' },
        { id: 's3', title: 'C1', description: 'd', method: 'fivewhys' },
      ];
      const prob = makeProblem({ solutions });
      mockProblemModel.findByPk.mockResolvedValue(prob);
      mockLlmService.evaluateSolutions.mockResolvedValue(
        solutions.map((s) => ({ solutionId: s.id, criterion: 'feasibility', score: 7, reasoning: 'ok' }))
      );

      const result = await service.evaluateCandidates('problem-1');

      // hard requirement: evaluate ALL candidates -> LLM sees every solution id
      expect(mockLlmService.evaluateSolutions).toHaveBeenCalledWith(
        prob.description,
        expect.arrayContaining([
          expect.objectContaining({ id: 's1' }),
          expect.objectContaining({ id: 's2' }),
          expect.objectContaining({ id: 's3' }),
        ])
      );
      expect(mockEvaluationModel.destroy).toHaveBeenCalledWith({ where: { solutionId: ['s1', 's2', 's3'] } });
      expect(result).toHaveLength(3);
      expect(prob.status).toBe('EVALUATED');
    });
  });

  describe('selectCandidate', () => {
    it('throws BadRequest when there are no candidates', async () => {
      mockProblemModel.findByPk.mockResolvedValue(makeProblem({ solutions: [] }));
      await expect(service.selectCandidate('problem-1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('persists the full reasoning trail and marks COMPLETED', async () => {
      const prob = makeProblem({
        solutions: [{ id: 's1', method: 'triz', title: 'T1', description: 'd' }],
        contradiction: { improvingParamCode: 9, worseningParamCode: 36 },
        fiveWhysSteps: [{ depth: 1, question: 'Why?', answer: 'Because' }],
      });
      mockProblemModel.findByPk.mockResolvedValue(prob);
      const candidatesWithEvals = [
        { id: 's1', method: 'triz', title: 'T1', description: 'd', evaluations: [{ criterion: 'feasibility', score: 8 }] },
      ];
      mockSolutionModel.findAll.mockResolvedValue(candidatesWithEvals);
      mockLlmService.selectBestSolution.mockResolvedValue({ selectedSolutionId: 's1', justification: 'Best' });

      const result = await service.selectCandidate('problem-1');

      expect(mockSelectionModel.destroy).toHaveBeenCalledWith({ where: { problemId: 'problem-1' } });
      // full inspectable trail persisted (docs: trail lives in DB, not ephemeral)
      const created = mockSelectionModel.create.mock.calls[0][0];
      expect(created.selectedSolutionId).toBe('s1');
      expect(created.justification).toBe('Best');
      expect(created.fullTrailJson).toEqual(
        expect.objectContaining({
          problemId: 'problem-1',
          contradiction: prob.contradiction,
          fiveWhysSteps: prob.fiveWhysSteps,
          selectedSolutionId: 's1',
        })
      );
      expect(created.fullTrailJson.candidates).toHaveLength(1);
      expect(prob.status).toBe('COMPLETED');
      expect(result.selectedSolutionId).toBe('s1');
    });
  });

  describe('getTrail', () => {
    it('returns the persisted fullTrailJson', async () => {
      const trail = { selectedSolutionId: 's1', candidates: [] };
      mockSelectionModel.findOne.mockResolvedValue({ fullTrailJson: trail });

      const result = await service.getTrail('problem-1');

      expect(mockSelectionModel.findOne).toHaveBeenCalledWith({ where: { problemId: 'problem-1' } });
      expect(result).toBe(trail);
    });

    it('throws NotFound when no selection exists yet', async () => {
      mockSelectionModel.findOne.mockResolvedValue(null);
      await expect(service.getTrail('problem-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
