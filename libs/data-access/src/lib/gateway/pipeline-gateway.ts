import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
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

/**
 * The single seam between the frontend and the pipeline backend.
 * `MockPipelineGateway` implements it today; `HttpPipelineGateway` swaps in
 * unchanged once Denys ships the REST endpoints — no component changes.
 *
 * Branch A (TRIZ) and Branch B (5 Whys) run independently and converge at
 * `evaluate` -> `select`, mirroring the BPMN parallel split/join.
 */
export interface PipelineGateway {
  /** Step 1 — register the inventive problem. */
  createProblem(description: string): Observable<Problem>;

  /** Branch A — reformulate as a technical contradiction (LLM + pytriz). */
  getContradiction(problemId: string): Observable<Contradiction>;
  /** Branch A — contradiction matrix -> principles -> >=3 TRIZ solutions. */
  getTrizSolutions(problemId: string): Observable<Solution[]>;

  /** Branch B — begin the 5 Whys drill-down; returns the first "Why?". */
  startFiveWhys(problemId: string): Observable<FiveWhysStep>;
  /** Branch B — submit the engineer's answer; guardrail-checked turn result. */
  answerWhy(problemId: string, answer: string): Observable<FiveWhysTurn>;
  /** Branch B — engineer is stuck: opt in to a web-search-grounded hypothesis. */
  requestHypothesis(problemId: string): Observable<FiveWhysStep>;
  /** Branch B — accept/reject an offered hypothesis; accepting advances the chain. */
  confirmHypothesis(
    problemId: string,
    stepId: string,
    accepted: boolean
  ): Observable<FiveWhysTurn>;
  /** Branch B — root cause reached -> >=3 countermeasure solutions. */
  getFiveWhysSolutions(problemId: string): Observable<Solution[]>;

  /** Step 4 — evaluate ALL candidates against the criteria. */
  evaluate(problemId: string): Observable<Evaluation[]>;
  /** Step 5 — select one and justify. */
  select(problemId: string): Observable<Selection>;

  /** The full persisted reasoning trail. */
  getTrail(problemId: string): Observable<ReasoningTrail>;
}

export const PIPELINE_GATEWAY = new InjectionToken<PipelineGateway>(
  'PIPELINE_GATEWAY'
);
