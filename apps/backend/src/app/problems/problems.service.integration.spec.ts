import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { SequelizeModule } from '@nestjs/sequelize';
import { ProblemsService } from './problems.service';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';
import { Problem, Contradiction, Solution, Evaluation, Selection, User, FiveWhysStep } from '../database/models';
import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

describe('ProblemsService (Integration)', () => {
  let service: ProblemsService;
  let sequelize: Sequelize;
  let transaction: Transaction;

  const mockLlmService = {
    generateContradiction: jest.fn(),
    generateTrizSolutions: jest.fn(),
    askNextWhy: jest.fn(),
    generateFiveWhysSolutions: jest.fn(),
    evaluateSolutions: jest.fn(),
    selectBestSolution: jest.fn(),
  };

  const mockMcpClientService = {
    browseContradictionMatrix: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        SequelizeModule.forRoot({
          dialect: 'postgres',
          host: process.env.DB_HOST,
          port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          models: [Problem, Contradiction, Solution, Evaluation, Selection, User, FiveWhysStep],
          logging: false,
        }),
        SequelizeModule.forFeature([Problem, Contradiction, Solution, Evaluation, Selection, User, FiveWhysStep]),
      ],
      providers: [
        ProblemsService,
        { provide: LlmService, useValue: mockLlmService },
        { provide: McpClientService, useValue: mockMcpClientService },
      ],
    }).compile();

    service = module.get<ProblemsService>(ProblemsService);
    sequelize = module.get<Sequelize>(Sequelize);
    await sequelize.sync({ alter: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    transaction = await sequelize.transaction();
    // Eagerly bind transaction to models for clean rollbacks,
    // or run raw queries within transactions. In this suite, we can
    // clean up tables directly in afterEach if transaction rollback is not global,
    // but standard Sequelize unit tests rollback perfectly if hooks/queries are transaction-bound.
    // To ensure complete safety and isolation, we will destroy entries in afterEach.
  });

  afterEach(async () => {
    await transaction.rollback();
    jest.clearAllMocks();
    
    // Cleanup tables to avoid cross-test dirtiness in case rollback is incomplete
    await Selection.destroy({ where: {}, force: true });
    await Evaluation.destroy({ where: {}, force: true });
    await Solution.destroy({ where: {}, force: true });
    await FiveWhysStep.destroy({ where: {}, force: true });
    await Contradiction.destroy({ where: {}, force: true });
    await Problem.destroy({ where: {}, force: true });
  });

  it('should run the entire pipeline end-to-end and persist states correctly in the database', async () => {
    // 1. Create problem
    const prob = await service.create('Keeping buildings hot and cold');
    expect(prob.id).toBeDefined();
    expect(prob.status).toBe('PENDING');

    // 2. Reformulate Contradiction
    mockLlmService.generateContradiction.mockResolvedValue({
      improvingParamCode: 9,
      improvingParamName: 'Speed',
      worseningParamCode: 36,
      worseningParamName: 'Device complexity',
      explanation: 'Test contradiction explanation',
    });

    const contra = await service.reformulateContradiction(prob.id);
    expect(contra.problemId).toBe(prob.id);
    expect(contra.improvingParamName).toBe('Speed');

    // Verify DB update
    const updatedProb1 = await service.findOne(prob.id);
    expect(updatedProb1.status).toBe('CONTRADICTION_GENERATED');
    expect(updatedProb1.contradiction).toBeDefined();

    // 3. TRIZ Solutions
    mockMcpClientService.browseContradictionMatrix.mockResolvedValue('Inventive Principles');
    mockLlmService.generateTrizSolutions.mockResolvedValue([
      { title: 'TRIZ Sol 1', description: 'Desc 1', principleCode: '10', principleName: 'Prior Action' },
      { title: 'TRIZ Sol 2', description: 'Desc 2', principleCode: '32', principleName: 'Color change' },
      { title: 'TRIZ Sol 3', description: 'Desc 3', principleCode: '35', principleName: 'Parameter Change' },
    ]);

    const trizSols = await service.generateTrizSolutions(prob.id);
    expect(trizSols).toHaveLength(3);
    expect(trizSols[0].method).toBe('triz');

    // 4. Five Whys Q&A Loops
    mockLlmService.askNextWhy.mockResolvedValue({
      question: 'Why does it heat up?',
      isAbuseOrOffTopic: false,
    });

    const nextQ1 = await service.fiveWhysNext(prob.id);
    expect(nextQ1.question).toBe('Why does it heat up?');

    // Submit answer
    const answeredStep = await service.fiveWhysAnswer(prob.id, 'Because of direct solar gains');
    expect(answeredStep.answer).toBe('Because of direct solar gains');
    expect(answeredStep.depth).toBe(1);

    // 5. 5 Whys solutions
    mockLlmService.generateFiveWhysSolutions.mockResolvedValue([
      { title: '5W Sol 1', description: 'Desc 5W 1' },
      { title: '5W Sol 2', description: 'Desc 5W 2' },
      { title: '5W Sol 3', description: 'Desc 5W 3' },
    ]);
    const fiveWhysSols = await service.generateFiveWhysSolutions(prob.id);
    expect(fiveWhysSols).toHaveLength(3);
    expect(fiveWhysSols[0].method).toBe('fivewhys');

    // 6. Evaluate all candidates
    const allSolutions = await Solution.findAll({ where: { problemId: prob.id } });
    expect(allSolutions).toHaveLength(6);

    mockLlmService.evaluateSolutions.mockResolvedValue(
      allSolutions.flatMap((s) => [
        { solutionId: s.id, criterion: 'feasibility', score: 8, reasoning: 'Reasonable' },
        { solutionId: s.id, criterion: 'impact', score: 9, reasoning: 'High impact' },
      ])
    );
    const evals = await service.evaluateCandidates(prob.id);
    expect(evals).toHaveLength(12); // 6 solutions * 2 criteria mocked

    // 7. Select
    mockLlmService.selectBestSolution.mockResolvedValue({
      selectedSolutionId: allSolutions[0].id,
      justification: 'Best choice',
    });
    const selection = await service.selectCandidate(prob.id);
    expect(selection.selectedSolutionId).toBe(allSolutions[0].id);

    const finalProb = await service.findOne(prob.id);
    expect(finalProb.status).toBe('COMPLETED');
    expect(finalProb.selection).toBeDefined();

    // 8. Trail
    const trail = await service.getTrail(prob.id);
    expect(trail.selectedSolutionId).toBe(allSolutions[0].id);
    expect(trail.candidates).toHaveLength(6);
  });
});
