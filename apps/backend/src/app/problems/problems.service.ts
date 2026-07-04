import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Problem, Contradiction, Solution, Evaluation, Selection, FiveWhysStep } from '../database/models';
import { LlmService } from './llm.service';
import { McpClientService } from './mcp-client.service';

@Injectable()
export class ProblemsService {
  constructor(
    @InjectModel(Problem)
    private readonly problemModel: typeof Problem,
    @InjectModel(Contradiction)
    private readonly contradictionModel: typeof Contradiction,
    @InjectModel(Solution)
    private readonly solutionModel: typeof Solution,
    @InjectModel(Evaluation)
    private readonly evaluationModel: typeof Evaluation,
    @InjectModel(Selection)
    private readonly selectionModel: typeof Selection,
    @InjectModel(FiveWhysStep)
    private readonly fiveWhysStepModel: typeof FiveWhysStep,
    private readonly llmService: LlmService,
    private readonly mcpClient: McpClientService
  ) {}

  async create(description: string): Promise<Problem> {
    if (!description || !description.trim()) {
      throw new BadRequestException('Problem description is required');
    }
    return this.problemModel.create({
      description,
      status: 'PENDING',
    });
  }

  async findOne(id: string): Promise<Problem> {
    const problem = await this.problemModel.findByPk(id, {
      include: [Contradiction, Solution, Selection, FiveWhysStep],
    });
    if (!problem) {
      throw new NotFoundException(`Problem with ID "${id}" not found`);
    }
    return problem;
  }

  async findAll(): Promise<Problem[]> {
    return this.problemModel.findAll({
      include: [Contradiction, Selection],
    });
  }

  async reformulateContradiction(problemId: string): Promise<Contradiction> {
    const problem = await this.findOne(problemId);

    const contradictionData = await this.llmService.generateContradiction(problem.description);

    // Remove any existing contradiction for this problem to prevent duplicate key violations
    await this.contradictionModel.destroy({ where: { problemId } });

    const contradiction = await this.contradictionModel.create({
      problemId,
      improvingParamCode: contradictionData.improvingParamCode,
      improvingParamName: contradictionData.improvingParamName,
      worseningParamCode: contradictionData.worseningParamCode,
      worseningParamName: contradictionData.worseningParamName,
      explanation: contradictionData.explanation,
    });

    problem.status = 'CONTRADICTION_GENERATED';
    await problem.save();

    return contradiction;
  }

  async generateTrizSolutions(problemId: string): Promise<Solution[]> {
    const problem = await this.findOne(problemId);
    if (!problem.contradiction) {
      throw new BadRequestException('Formulate contradiction first before generating TRIZ solutions');
    }

    // Call Agent to generate concrete solutions by looking up parameters
    const candidates = await this.llmService.generateTrizSolutions(
      problem.description,
      problem.contradiction.improvingParamCode,
      problem.contradiction.worseningParamCode
    );

    // Remove old TRIZ solutions if any
    await this.solutionModel.destroy({ where: { problemId, method: 'triz' } });

    const solutions = await Promise.all(
      candidates.map((cand) =>
        this.solutionModel.create({
          problemId,
          method: 'triz',
          principleCode: cand.principleCode,
          principleName: cand.principleName,
          title: cand.title,
          description: cand.description,
        })
      )
    );

    problem.status = 'TRIZ_SOLUTIONS_GENERATED';
    await problem.save();

    return solutions;
  }

  async fiveWhysNext(problemId: string): Promise<{ question: string; isAbuseOrOffTopic: boolean; done: boolean; suggestedHypothesis?: string }> {
    const problem = await this.findOne(problemId);

    const history = problem.fiveWhysSteps || [];
    const formattedHistory = history
      .sort((a, b) => a.depth - b.depth)
      .map((step) => ({
        question: step.question,
        answer: step.answer || '',
        kind: step.kind,
        confirmed: step.confirmed,
      }));

    // If depth is already 5 and all have answers, the Q&A is done
    if (formattedHistory.length >= 5 && formattedHistory.every((h) => h.answer !== '')) {
      return { question: '', isAbuseOrOffTopic: false, done: true };
    }

    // If there is a pending question (latest question has no answer), return it
    const pendingStep = history.find((step) => !step.answer);
    if (pendingStep) {
      return {
        question: pendingStep.question,
        isAbuseOrOffTopic: false,
        done: false,
        suggestedHypothesis: pendingStep.confirmed ? undefined : undefined, // Keep it simple
      };
    }

    // Call Agent to generate the next question
    const nextQuestionData = await this.llmService.askNextWhy(problem.description, formattedHistory);

    if (nextQuestionData.isAbuseOrOffTopic) {
      return { question: '', isAbuseOrOffTopic: true, done: false };
    }

    // Save the new question step
    const nextDepth = formattedHistory.length + 1;
    await this.fiveWhysStepModel.create({
      problemId,
      depth: nextDepth,
      question: nextQuestionData.question,
      kind: nextQuestionData.suggestedHypothesis ? 'hypothesis' : 'answer',
      confirmed: false,
    });

    return {
      question: nextQuestionData.question,
      isAbuseOrOffTopic: false,
      done: false,
      suggestedHypothesis: nextQuestionData.suggestedHypothesis,
    };
  }

  async fiveWhysAnswer(problemId: string, answer: string, kind?: string, confirmed?: boolean): Promise<FiveWhysStep> {
    if (!answer || !answer.trim()) {
      throw new BadRequestException('Answer text is required');
    }
    const problem = await this.findOne(problemId);
    const steps = problem.fiveWhysSteps || [];

    // Find the latest pending step (which doesn't have an answer yet)
    const pendingStep = steps
      .sort((a, b) => b.depth - a.depth)
      .find((step) => !step.answer);

    if (!pendingStep) {
      throw new BadRequestException('No pending question found to answer. Request next question first.');
    }

    pendingStep.answer = answer;
    if (kind) pendingStep.kind = kind;
    if (confirmed !== undefined) pendingStep.confirmed = confirmed;

    await pendingStep.save();
    return pendingStep;
  }

  async generateFiveWhysSolutions(problemId: string): Promise<Solution[]> {
    const problem = await this.findOne(problemId);
    const steps = problem.fiveWhysSteps || [];

    if (steps.length === 0) {
      throw new BadRequestException('Perform 5 Whys interactive process before generating countermeasures');
    }

    // Causal chain representation
    const causalChain = steps
      .sort((a, b) => a.depth - b.depth)
      .map((s) => `Why ${s.depth}: ${s.question} -> Answer: ${s.answer}`)
      .join('\n');

    const candidates = await this.llmService.generateFiveWhysSolutions(problem.description, causalChain);

    // Remove old 5 whys solutions
    await this.solutionModel.destroy({ where: { problemId, method: 'fivewhys' } });

    const solutions = await Promise.all(
      candidates.map((cand) =>
        this.solutionModel.create({
          problemId,
          method: 'fivewhys',
          title: cand.title,
          description: cand.description,
        })
      )
    );

    problem.status = 'FIVE_WHYS_SOLUTIONS_GENERATED';
    await problem.save();

    return solutions;
  }

  async evaluateCandidates(problemId: string): Promise<Evaluation[]> {
    const problem = await this.findOne(problemId);
    const candidates = problem.solutions || [];

    if (candidates.length === 0) {
      throw new BadRequestException('No candidate solutions generated yet to evaluate');
    }

    const solutionsPayload = candidates.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      method: c.method,
    }));

    const evaluationsData = await this.llmService.evaluateSolutions(problem.description, solutionsPayload);

    // Clear old evaluations for this problem's solutions
    const candidateIds = candidates.map((c) => c.id);
    await this.evaluationModel.destroy({ where: { solutionId: candidateIds } });

    const evaluations = await Promise.all(
      evaluationsData.map((e) =>
        this.evaluationModel.create({
          solutionId: e.solutionId,
          criterion: e.criterion,
          score: e.score,
          reasoning: e.reasoning,
        })
      )
    );

    problem.status = 'EVALUATED';
    await problem.save();

    return evaluations;
  }

  async selectCandidate(problemId: string): Promise<Selection> {
    const problem = await this.findOne(problemId);
    const candidates = problem.solutions || [];

    if (candidates.length === 0) {
      throw new BadRequestException('No candidate solutions exist to select from');
    }

    // Retrieve all candidates with their evaluations eagerly loaded
    const candidatesWithEvals = await this.solutionModel.findAll({
      where: { problemId },
      include: [Evaluation],
    });

    const selectResult = await this.llmService.selectBestSolution(problem.description, candidatesWithEvals);

    // Remove old selection if exists
    await this.selectionModel.destroy({ where: { problemId } });

    // Compile the complete persisted reasoning trail
    const fullTrailJson = {
      problemId: problem.id,
      problemDescription: problem.description,
      contradiction: problem.contradiction,
      fiveWhysSteps: problem.fiveWhysSteps,
      candidates: candidatesWithEvals.map((c) => ({
        id: c.id,
        method: c.method,
        title: c.title,
        description: c.description,
        evaluations: c.evaluations,
      })),
      selectedSolutionId: selectResult.selectedSolutionId,
      justification: selectResult.justification,
    };

    const selection = await this.selectionModel.create({
      problemId,
      selectedSolutionId: selectResult.selectedSolutionId,
      justification: selectResult.justification,
      fullTrailJson,
    });

    problem.status = 'COMPLETED';
    await problem.save();

    return selection;
  }

  async getTrail(problemId: string): Promise<any> {
    const selection = await this.selectionModel.findOne({
      where: { problemId },
    });
    if (!selection) {
      throw new NotFoundException(`No selection trail found for problem ID "${problemId}"`);
    }
    return selection.fullTrailJson;
  }
}
