import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  Contradiction,
  Evaluation,
  EvaluationCriterion,
  FiveWhysStep,
  Problem,
  ReasoningTrail,
  Selection,
  Solution,
} from '../models';
import { PIPELINE_GATEWAY } from '../gateway/pipeline-gateway';

export type StageStatus = 'idle' | 'loading' | 'done' | 'error';

/**
 * The single source of truth for the reasoning trail. Every screen reads from
 * these signals and can be revisited (input + output preserved), satisfying the
 * "inspectable, not ephemeral" requirement. Branch A and Branch B advance
 * independently; `bothBranchesReady` is the BPMN parallel-join condition.
 */
@Injectable({ providedIn: 'root' })
export class PipelineStore {
  private readonly gateway = inject(PIPELINE_GATEWAY);

  // --- state ---------------------------------------------------------------
  readonly problem = signal<Problem | null>(null);
  readonly contradiction = signal<Contradiction | null>(null);
  readonly trizSolutions = signal<Solution[]>([]);
  readonly fiveWhysSolutions = signal<Solution[]>([]);
  readonly fiveWhysSteps = signal<FiveWhysStep[]>([]);
  readonly pendingQuestion = signal<FiveWhysStep | null>(null);
  readonly pendingHypothesis = signal<FiveWhysStep | null>(null);
  readonly rootReached = signal(false);
  readonly evaluations = signal<Evaluation[]>([]);
  readonly selection = signal<Selection | null>(null);

  readonly statusContradiction = signal<StageStatus>('idle');
  readonly statusTriz = signal<StageStatus>('idle');
  readonly statusFiveWhys = signal<StageStatus>('idle');
  readonly statusEvaluation = signal<StageStatus>('idle');
  readonly statusSelection = signal<StageStatus>('idle');

  // --- derived -------------------------------------------------------------
  readonly allSolutions = computed<Solution[]>(() => [
    ...this.trizSolutions(),
    ...this.fiveWhysSolutions(),
  ]);
  readonly trizReady = computed(() => this.trizSolutions().length >= 3);
  readonly fiveWhysReady = computed(() => this.fiveWhysSolutions().length >= 3);
  /** BPMN Gateway_join: both parallel branches have produced their candidates. */
  readonly bothBranchesReady = computed(
    () => this.trizReady() && this.fiveWhysReady()
  );
  readonly evaluationReady = computed(() => this.evaluations().length > 0);
  readonly selectionReady = computed(() => this.selection() !== null);

  readonly rankedSolutions = computed<Solution[]>(() =>
    [...this.allSolutions()].sort(
      (a, b) => this.total(b.id) - this.total(a.id)
    )
  );

  readonly trail = computed<ReasoningTrail | null>(() => {
    const problem = this.problem();
    if (!problem) return null;
    return {
      problem,
      contradiction: this.contradiction() ?? undefined,
      fiveWhysSteps: this.fiveWhysSteps(),
      solutions: this.allSolutions(),
      evaluations: this.evaluations(),
      selection: this.selection() ?? undefined,
    };
  });

  total(solutionId: string): number {
    return this.evaluations()
      .filter((e) => e.solutionId === solutionId)
      .reduce((sum, e) => sum + e.score, 0);
  }

  cell(solutionId: string, criterion: EvaluationCriterion): Evaluation | undefined {
    return this.evaluations().find(
      (e) => e.solutionId === solutionId && e.criterion === criterion
    );
  }

  // --- actions -------------------------------------------------------------
  createProblem(description: string): Observable<Problem> {
    this.reset();
    return this.gateway.createProblem(description).pipe(
      tap((p) => this.problem.set(p))
    );
  }

  loadContradiction(problemId: string): Observable<Contradiction> {
    this.statusContradiction.set('loading');
    return this.gateway.getContradiction(problemId).pipe(
      tap({
        next: (c) => {
          this.contradiction.set(c);
          this.statusContradiction.set('done');
        },
        error: () => this.statusContradiction.set('error'),
      })
    );
  }

  loadTrizSolutions(problemId: string): Observable<Solution[]> {
    this.statusTriz.set('loading');
    return this.gateway.getTrizSolutions(problemId).pipe(
      tap({
        next: (s) => {
          this.trizSolutions.set(s);
          this.statusTriz.set('done');
        },
        error: () => this.statusTriz.set('error'),
      })
    );
  }

  startFiveWhys(problemId: string): Observable<FiveWhysStep> {
    this.statusFiveWhys.set('loading');
    this.fiveWhysSteps.set([]);
    this.rootReached.set(false);
    return this.gateway.startFiveWhys(problemId).pipe(
      tap({
        next: (q) => {
          this.pendingQuestion.set(q);
          this.statusFiveWhys.set('done');
        },
        error: () => this.statusFiveWhys.set('error'),
      })
    );
  }

  answerWhy(problemId: string, answer: string): Observable<unknown> {
    return this.gateway.answerWhy(problemId, answer).pipe(
      tap((turn) => {
        this.fiveWhysSteps.update((steps) => [...steps, turn.step]);
        this.pendingQuestion.set(turn.nextQuestion ?? null);
        this.rootReached.set(turn.rootReached);
      })
    );
  }

  requestHypothesis(problemId: string): Observable<FiveWhysStep> {
    return this.gateway.requestHypothesis(problemId).pipe(
      tap((h) => this.pendingHypothesis.set(h))
    );
  }

  confirmHypothesis(
    problemId: string,
    stepId: string,
    accepted: boolean
  ): Observable<unknown> {
    return this.gateway.confirmHypothesis(problemId, stepId, accepted).pipe(
      tap((turn) => {
        this.pendingHypothesis.set(null);
        if (accepted) {
          this.fiveWhysSteps.update((steps) => [...steps, turn.step]);
          this.pendingQuestion.set(turn.nextQuestion ?? null);
          this.rootReached.set(turn.rootReached);
        }
      })
    );
  }

  loadFiveWhysSolutions(problemId: string): Observable<Solution[]> {
    return this.gateway.getFiveWhysSolutions(problemId).pipe(
      tap((s) => this.fiveWhysSolutions.set(s))
    );
  }

  evaluate(problemId: string): Observable<Evaluation[]> {
    this.statusEvaluation.set('loading');
    return this.gateway.evaluate(problemId).pipe(
      tap({
        next: (e) => {
          this.evaluations.set(e);
          this.statusEvaluation.set('done');
        },
        error: () => this.statusEvaluation.set('error'),
      })
    );
  }

  select(problemId: string): Observable<Selection> {
    this.statusSelection.set('loading');
    return this.gateway.select(problemId).pipe(
      tap({
        next: (sel) => {
          this.selection.set(sel);
          this.statusSelection.set('done');
        },
        error: () => this.statusSelection.set('error'),
      })
    );
  }

  reset(): void {
    this.problem.set(null);
    this.contradiction.set(null);
    this.trizSolutions.set([]);
    this.fiveWhysSolutions.set([]);
    this.fiveWhysSteps.set([]);
    this.pendingQuestion.set(null);
    this.pendingHypothesis.set(null);
    this.rootReached.set(false);
    this.evaluations.set([]);
    this.selection.set(null);
    this.statusContradiction.set('idle');
    this.statusTriz.set('idle');
    this.statusFiveWhys.set('idle');
    this.statusEvaluation.set('idle');
    this.statusSelection.set('idle');
  }
}
