import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import { Problem } from './problem.model';
import { Contradiction } from './contradiction.model';
import { Solution } from './solution.model';
import { Evaluation } from './evaluation.model';
import { Selection } from './selection.model';
import { User } from './user.model';
import { FiveWhysStep } from './five-whys-step.model';

// Isolate every integration run in a throwaway Postgres schema so sync()/destroy()
// never touch the shared `buildwithai` dev data. A UNIQUE schema per spec file is
// required because Jest runs test files in parallel workers — a shared schema would
// race (one file dropping it while another uses it).
const TEST_SCHEMA = process.env.DB_TEST_SCHEMA_MODELS || 'backend_it_models';

describe('Database Models Integration', () => {
  let sequelize: Sequelize;
  let transaction: Transaction;

  beforeAll(async () => {
    // Connect to the test/development database defined in env
    sequelize = new Sequelize({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [Problem, Contradiction, Solution, Evaluation, Selection, User, FiveWhysStep],
      define: { schema: TEST_SCHEMA }, // all models live in the isolated schema
      logging: false, // Suppress logs during test runs
    });

    // Fail loudly (not silently) if the DB is unreachable — these tests REQUIRE Postgres.
    try {
      await sequelize.authenticate();
    } catch (err: any) {
      throw new Error(
        `Integration DB unreachable at ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}. ` +
          `Start Postgres before running \`nx test-integration backend\`. Cause: ${err.message}`
      );
    }

    // Fresh isolated schema, then create tables inside it.
    await sequelize.createSchema(TEST_SCHEMA, {}).catch(() => undefined);
    await sequelize.sync({ alter: true });
  });

  afterAll(async () => {
    // Drop the throwaway schema and everything in it, then close.
    await sequelize.query(`DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE`);
    await sequelize.close();
  });

  beforeEach(async () => {
    // Start a transaction for each test to keep database clean via rollback
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    // Rollback all inserts/updates made during the test
    await transaction.rollback();
  });

  it('should create a Problem and retrieve it', async () => {
    const problem = await Problem.create(
      {
        description: 'Testing problem creation',
        status: 'PENDING',
      },
      { transaction }
    );

    expect(problem.id).toBeDefined();
    expect(problem.description).toBe('Testing problem creation');
    expect(problem.status).toBe('PENDING');

    const retrieved = await Problem.findByPk(problem.id, { transaction });
    expect(retrieved).not.toBeNull();
    expect(retrieved!.description).toBe('Testing problem creation');
  });

  it('should establish a 1:1 relationship with Contradiction', async () => {
    const problem = await Problem.create(
      {
        description: 'Problem for contradiction mapping',
      },
      { transaction }
    );

    const contradiction = await Contradiction.create(
      {
        problemId: problem.id,
        improvingParamCode: 9,
        improvingParamName: 'Speed',
        worseningParamCode: 36,
        worseningParamName: 'Device complexity',
        explanation: 'Increasing speed requires a more complex mechanical coupling.',
      },
      { transaction }
    );

    expect(contradiction.id).toBeDefined();
    expect(contradiction.problemId).toBe(problem.id);

    // Retrieve problem with contradiction eagerly loaded
    const retrieved = await Problem.findByPk(problem.id, {
      include: [Contradiction],
      transaction,
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved!.contradiction).toBeDefined();
    expect(retrieved!.contradiction!.improvingParamName).toBe('Speed');
    expect(retrieved!.contradiction!.worseningParamName).toBe('Device complexity');
  });

  it('should establish a 1:N relationship with Solution and Evaluation', async () => {
    const problem = await Problem.create(
      {
        description: 'Problem for solutions evaluation',
      },
      { transaction }
    );

    const solution = await Solution.create(
      {
        problemId: problem.id,
        method: 'triz',
        principleCode: '10',
        principleName: 'Prior Action',
        title: 'Pre-heating pipes',
        description: 'Pre-heat the input pipes to avoid temperature shocks.',
      },
      { transaction }
    );

    const evaluation = await Evaluation.create(
      {
        solutionId: solution.id,
        criterion: 'feasibility',
        score: 8,
        reasoning: 'Highly feasible with standard industrial heating components.',
      },
      { transaction }
    );

    // Retrieve solution with evaluations
    const retrievedSolution = await Solution.findByPk(solution.id, {
      include: [Evaluation],
      transaction,
    });

    expect(retrievedSolution).not.toBeNull();
    expect(retrievedSolution!.evaluations).toHaveLength(1);
    expect(retrievedSolution!.evaluations![0].criterion).toBe('feasibility');
    expect(retrievedSolution!.evaluations![0].score).toBe(8);
  });

  it('should establish Selection and store JSONB full trail', async () => {
    const problem = await Problem.create(
      {
        description: 'Final selected problem case',
      },
      { transaction }
    );

    const solution = await Solution.create(
      {
        problemId: problem.id,
        method: 'alternative',
        principleCode: 'B',
        principleName: 'Biomimicry - Polar Bear Fur',
        title: 'Polar Bear Fur Insulation',
        description: 'Use hollow fiber structures mimicking polar bear fur.',
      },
      { transaction }
    );

    const fullTrailData = {
      problemId: problem.id,
      description: problem.description,
      contradiction: {
        improving: 'Thermal comfort',
        worsening: 'Material cost',
      },
      candidates: [
        { title: solution.title, score: 9.5 }
      ],
      winner: solution.title,
    };

    const selection = await Selection.create(
      {
        problemId: problem.id,
        selectedSolutionId: solution.id,
        justification: 'Highest overall score due to superior insulation capabilities.',
        fullTrailJson: fullTrailData,
      },
      { transaction }
    );

    expect(selection.id).toBeDefined();

    // Verify selection retrieval and JSONB content parsing
    const retrieved = await Selection.findByPk(selection.id, {
      include: [Problem, Solution],
      transaction,
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved!.problem.id).toBe(problem.id);
    expect(retrieved!.selectedSolution.id).toBe(solution.id);
    expect(retrieved!.fullTrailJson).toEqual(fullTrailData);
    expect(retrieved!.fullTrailJson.winner).toBe('Polar Bear Fur Insulation');
  });

  it('should establish User and associate with Problems', async () => {
    const user = await User.create(
      {
        email: 'test-user@triz-solver.com',
        passwordHash: '$2b$10$hashedpasswordhere',
        name: 'John Doe',
        role: 'client',
      },
      { transaction }
    );

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test-user@triz-solver.com');

    const problem = await Problem.create(
      {
        userId: user.id,
        description: 'Problem owned by test user',
      },
      { transaction }
    );

    expect(problem.userId).toBe(user.id);

    // Retrieve user and eagerly load problems
    const retrievedUser = await User.findByPk(user.id, {
      include: [Problem],
      transaction,
    });

    expect(retrievedUser).not.toBeNull();
    expect(retrievedUser!.problems).toHaveLength(1);
    expect(retrievedUser!.problems![0].id).toBe(problem.id);
    expect(retrievedUser!.problems![0].description).toBe('Problem owned by test user');
  });

  it('should establish a 1:N relationship with FiveWhysStep', async () => {
    const problem = await Problem.create(
      {
        description: 'Problem for 5 Whys process',
      },
      { transaction }
    );

    const step1 = await FiveWhysStep.create(
      {
        problemId: problem.id,
        depth: 1,
        question: 'Why do buildings get hot in summer?',
        answer: 'Because of solar radiation through windows.',
        kind: 'answer',
        confirmed: true,
      },
      { transaction }
    );

    const step2 = await FiveWhysStep.create(
      {
        problemId: problem.id,
        depth: 2,
        question: 'Why is there no smart insulation?',
        kind: 'hypothesis',
        confirmed: false,
      },
      { transaction }
    );

    expect(step1.id).toBeDefined();
    expect(step2.id).toBeDefined();

    // Retrieve problem with steps
    const retrieved = await Problem.findByPk(problem.id, {
      include: [FiveWhysStep],
      transaction,
    });

    expect(retrieved).not.toBeNull();
    expect(retrieved!.fiveWhysSteps).toHaveLength(2);
    expect(retrieved!.fiveWhysSteps![0].depth).toBe(1);
    expect(retrieved!.fiveWhysSteps![0].confirmed).toBe(true);
    expect(retrieved!.fiveWhysSteps![1].depth).toBe(2);
    expect(retrieved!.fiveWhysSteps![1].confirmed).toBe(false);
  });
});
