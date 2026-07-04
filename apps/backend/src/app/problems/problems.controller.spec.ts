import { Test, TestingModule } from '@nestjs/testing';
import { ProblemsController } from './problems.controller';
import { ProblemsService } from './problems.service';

/**
 * Controller-layer unit test.
 *
 * Verifies that every one of the 11 HTTP handlers wires the request through to
 * the correct ProblemsService method with the correct arguments (route params +
 * body bindings) and returns the service result unchanged. The controller is a
 * thin passthrough (per CLAUDE.md "keep NestJS thin"), so that wiring IS the
 * contract we assert here. Service internals are covered separately in
 * problems.service.spec.ts.
 */
describe('ProblemsController', () => {
  let controller: ProblemsController;
  let service: jest.Mocked<ProblemsService>;

  const mockService: Record<string, jest.Mock> = {
    create: jest.fn(),
    reformulateContradiction: jest.fn(),
    generateTrizSolutions: jest.fn(),
    fiveWhysNext: jest.fn(),
    fiveWhysAnswer: jest.fn(),
    generateFiveWhysSolutions: jest.fn(),
    evaluateCandidates: jest.fn(),
    selectCandidate: jest.fn(),
    getTrail: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProblemsController],
      providers: [{ provide: ProblemsService, useValue: mockService }],
    }).compile();

    controller = module.get<ProblemsController>(ProblemsController);
    service = module.get(ProblemsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('POST /problems -> create(description)', async () => {
    const sentinel = { id: 'p1', description: 'desc', status: 'PENDING' };
    mockService.create.mockResolvedValue(sentinel);

    const result = await controller.create('Keeping buildings hot and cold');

    expect(service.create).toHaveBeenCalledWith('Keeping buildings hot and cold');
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/contradiction -> reformulateContradiction(id)', async () => {
    const sentinel = { id: 'c1' };
    mockService.reformulateContradiction.mockResolvedValue(sentinel);

    const result = await controller.reformulateContradiction('p1');

    expect(service.reformulateContradiction).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/solutions/triz -> generateTrizSolutions(id)', async () => {
    const sentinel = [{ id: 's1' }];
    mockService.generateTrizSolutions.mockResolvedValue(sentinel);

    const result = await controller.generateTrizSolutions('p1');

    expect(service.generateTrizSolutions).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/fivewhys/next -> fiveWhysNext(id)', async () => {
    const sentinel = { question: 'Why?', isAbuseOrOffTopic: false, done: false };
    mockService.fiveWhysNext.mockResolvedValue(sentinel);

    const result = await controller.fiveWhysNext('p1');

    expect(service.fiveWhysNext).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/fivewhys/answer -> fiveWhysAnswer(id, answer, kind, confirmed)', async () => {
    const sentinel = { id: 'step1', answer: 'Because solar gains' };
    mockService.fiveWhysAnswer.mockResolvedValue(sentinel);

    const result = await controller.fiveWhysAnswer('p1', 'Because solar gains', 'answer', true);

    expect(service.fiveWhysAnswer).toHaveBeenCalledWith('p1', 'Because solar gains', 'answer', true);
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/fivewhys/answer -> passes undefined optional params through', async () => {
    mockService.fiveWhysAnswer.mockResolvedValue({});

    await controller.fiveWhysAnswer('p1', 'Because solar gains');

    expect(service.fiveWhysAnswer).toHaveBeenCalledWith('p1', 'Because solar gains', undefined, undefined);
  });

  it('POST /problems/:id/solutions/fivewhys -> generateFiveWhysSolutions(id)', async () => {
    const sentinel = [{ id: 's4' }];
    mockService.generateFiveWhysSolutions.mockResolvedValue(sentinel);

    const result = await controller.generateFiveWhysSolutions('p1');

    expect(service.generateFiveWhysSolutions).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/evaluate -> evaluateCandidates(id)', async () => {
    const sentinel = [{ id: 'e1' }];
    mockService.evaluateCandidates.mockResolvedValue(sentinel);

    const result = await controller.evaluateCandidates('p1');

    expect(service.evaluateCandidates).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('POST /problems/:id/select -> selectCandidate(id)', async () => {
    const sentinel = { id: 'sel1' };
    mockService.selectCandidate.mockResolvedValue(sentinel);

    const result = await controller.selectCandidate('p1');

    expect(service.selectCandidate).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('GET /problems/:id/trail -> getTrail(id)', async () => {
    const sentinel = { selectedSolutionId: 's1', candidates: [] };
    mockService.getTrail.mockResolvedValue(sentinel);

    const result = await controller.getTrail('p1');

    expect(service.getTrail).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('GET /problems/:id -> findOne(id)', async () => {
    const sentinel = { id: 'p1' };
    mockService.findOne.mockResolvedValue(sentinel);

    const result = await controller.findOne('p1');

    expect(service.findOne).toHaveBeenCalledWith('p1');
    expect(result).toBe(sentinel);
  });

  it('GET /problems -> findAll()', async () => {
    const sentinel = [{ id: 'p1' }, { id: 'p2' }];
    mockService.findAll.mockResolvedValue(sentinel);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalledWith();
    expect(result).toBe(sentinel);
  });
});
