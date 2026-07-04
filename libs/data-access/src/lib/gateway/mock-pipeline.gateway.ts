import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  Contradiction,
  Evaluation,
  FiveWhysStep,
  FiveWhysTurn,
  Problem,
  ReasoningTrail,
  Selection,
  Solution,
} from '../models';
import { PipelineGateway } from './pipeline-gateway';
import {
  FIVE_WHYS_HYPOTHESIS,
  FIVE_WHYS_ROOT_CAUSE,
  FIVE_WHYS_SCRIPT,
  GUARDRAIL_RESTATEMENT,
  OFF_TOPIC_TRIGGERS,
  mockContradiction,
  mockEvaluations,
  mockFiveWhysSolutions,
  mockTrizSolutions,
  totalScore,
} from './mock-data';

const MAX_DEPTH = 5;

interface MockSession {
  problem: Problem;
  contradiction?: Contradiction;
  trizSolutions: Solution[];
  fiveWhysSolutions: Solution[];
  steps: FiveWhysStep[];
  currentDepth: number;
  pendingQuestion: string;
  pendingHypothesis?: FiveWhysStep;
  rootReached: boolean;
  evaluations: Evaluation[];
  selection?: Selection;
}

/**
 * In-memory gateway that mimics the real pipeline so the whole frontend
 * runs — and demos — without a backend. Latency is simulated so loading
 * states are exercised. Content is the canonical Problem 7 reasoning trail.
 */
@Injectable()
export class MockPipelineGateway implements PipelineGateway {
  private readonly sessions = new Map<string, MockSession>();
  private seq = 0;

  private id(prefix: string): string {
    return `${prefix}-${++this.seq}`;
  }

  private session(problemId: string): MockSession {
    const s = this.sessions.get(problemId);
    if (!s) throw new Error(`Unknown problem: ${problemId}`);
    return s;
  }

  private emit<T>(value: T, ms = 500): Observable<T> {
    return of(value).pipe(delay(ms));
  }

  private questionStep(problemId: string, depth: number): FiveWhysStep {
    return {
      id: this.id('why-q'),
      problemId,
      depth,
      question: FIVE_WHYS_SCRIPT[depth - 1],
      answer: undefined,
      kind: 'answer',
      confirmed: false,
    };
  }

  createProblem(description: string): Observable<Problem> {
    const problemId = this.id('problem');
    const problem: Problem = {
      id: problemId,
      description,
      status: 'RUNNING',
      createdAt: new Date().toISOString(),
    };
    this.sessions.set(problemId, {
      problem,
      trizSolutions: mockTrizSolutions(problemId),
      fiveWhysSolutions: mockFiveWhysSolutions(problemId),
      steps: [],
      currentDepth: 1,
      pendingQuestion: FIVE_WHYS_SCRIPT[0],
      rootReached: false,
      evaluations: [],
    });
    return this.emit(problem, 300);
  }

  getContradiction(problemId: string): Observable<Contradiction> {
    const s = this.session(problemId);
    s.contradiction = mockContradiction(problemId);
    return this.emit(s.contradiction, 900);
  }

  getTrizSolutions(problemId: string): Observable<Solution[]> {
    return this.emit(this.session(problemId).trizSolutions, 1100);
  }

  startFiveWhys(problemId: string): Observable<FiveWhysStep> {
    const s = this.session(problemId);
    s.currentDepth = 1;
    s.pendingQuestion = FIVE_WHYS_SCRIPT[0];
    return this.emit(this.questionStep(problemId, 1), 600);
  }

  answerWhy(problemId: string, answer: string): Observable<FiveWhysTurn> {
    const s = this.session(problemId);

    // Guardrail: off-topic / abusive answers are refused, depth NOT advanced.
    if (this.isOffTopic(answer)) {
      const refusal: FiveWhysStep = {
        id: this.id('why-refusal'),
        problemId,
        depth: s.currentDepth,
        question: s.pendingQuestion,
        answer: GUARDRAIL_RESTATEMENT,
        kind: 'refusal',
        confirmed: false,
      };
      s.steps = [...s.steps, refusal];
      return this.emit(
        {
          step: refusal,
          nextQuestion: this.questionStep(problemId, s.currentDepth),
          rootReached: false,
        },
        500
      );
    }

    return this.emit(this.advance(s, answer, 'answer'), 700);
  }

  requestHypothesis(problemId: string): Observable<FiveWhysStep> {
    const s = this.session(problemId);
    const hypothesis: FiveWhysStep = {
      id: this.id('why-hyp'),
      problemId,
      depth: s.currentDepth,
      question: s.pendingQuestion,
      answer: FIVE_WHYS_HYPOTHESIS,
      kind: 'hypothesis',
      confirmed: false,
    };
    s.pendingHypothesis = hypothesis;
    return this.emit(hypothesis, 800);
  }

  confirmHypothesis(
    problemId: string,
    stepId: string,
    accepted: boolean
  ): Observable<FiveWhysTurn> {
    const s = this.session(problemId);
    const hyp = s.pendingHypothesis;
    if (!hyp || hyp.id !== stepId) {
      throw new Error('No matching pending hypothesis');
    }
    s.pendingHypothesis = undefined;

    if (!accepted) {
      // Rejected: re-ask the same question, nothing recorded.
      return this.emit(
        {
          step: { ...hyp, confirmed: false },
          nextQuestion: this.questionStep(problemId, s.currentDepth),
          rootReached: false,
        },
        400
      );
    }
    // Accepted: the confirmed hypothesis becomes the answer and advances the chain.
    return this.emit(this.advance(s, hyp.answer ?? '', 'hypothesis', hyp.id), 600);
  }

  getFiveWhysSolutions(problemId: string): Observable<Solution[]> {
    return this.emit(this.session(problemId).fiveWhysSolutions, 1100);
  }

  evaluate(problemId: string): Observable<Evaluation[]> {
    const s = this.session(problemId);
    const all = [...s.trizSolutions, ...s.fiveWhysSolutions];
    s.evaluations = mockEvaluations(all);
    return this.emit(s.evaluations, 1300);
  }

  select(problemId: string): Observable<Selection> {
    const s = this.session(problemId);
    const all = [...s.trizSolutions, ...s.fiveWhysSolutions];
    const ranked = [...all].sort(
      (a, b) => totalScore(b.id, s.evaluations) - totalScore(a.id, s.evaluations)
    );
    const winner = ranked[0];
    const runnerUp = ranked[1];
    const winnerTotal = totalScore(winner.id, s.evaluations);
    const runnerTotal = totalScore(runnerUp.id, s.evaluations);

    s.problem = { ...s.problem, status: 'DONE' };
    const selection: Selection = {
      id: this.id('selection'),
      problemId,
      selectedSolutionId: winner.id,
      justification:
        `Selected “${winner.title}” (${winner.method}) — the highest total score, ` +
        `${winnerTotal}/40 across feasibility, impact, cost and innovation. ` +
        `It leads on impact by directly addressing the root cause across both seasons, ` +
        `while staying retrofittable. It edges out the next candidate, “${runnerUp.title}” ` +
        `(${runnerUp.method}, ${runnerTotal}/40).`,
      fullTrailJson: this.buildTrail(s),
    };
    s.selection = selection;
    return this.emit(selection, 900);
  }

  getTrail(problemId: string): Observable<ReasoningTrail> {
    return this.emit(this.buildTrail(this.session(problemId)), 300);
  }

  // -- internals -----------------------------------------------------------

  private isOffTopic(answer: string): boolean {
    const a = answer.toLowerCase();
    return OFF_TOPIC_TRIGGERS.some((t) => a.includes(t));
  }

  /** Record an accepted answer/hypothesis at the current depth and advance. */
  private advance(
    s: MockSession,
    answer: string,
    kind: 'answer' | 'hypothesis',
    id?: string
  ): FiveWhysTurn {
    const step: FiveWhysStep = {
      id: id ?? this.id('why-a'),
      problemId: s.problem.id,
      depth: s.currentDepth,
      question: s.pendingQuestion,
      answer,
      kind,
      confirmed: kind === 'hypothesis',
    };
    s.steps = [...s.steps, step];

    if (s.currentDepth >= MAX_DEPTH) {
      s.rootReached = true;
      return { step, nextQuestion: undefined, rootReached: true };
    }
    s.currentDepth += 1;
    s.pendingQuestion = FIVE_WHYS_SCRIPT[s.currentDepth - 1];
    return {
      step,
      nextQuestion: this.questionStep(s.problem.id, s.currentDepth),
      rootReached: false,
    };
  }

  private buildTrail(s: MockSession): ReasoningTrail {
    return {
      problem: s.problem,
      contradiction: s.contradiction,
      fiveWhysSteps: s.steps,
      solutions: [...s.trizSolutions, ...s.fiveWhysSolutions],
      evaluations: s.evaluations,
      selection: s.selection,
    };
  }
}
