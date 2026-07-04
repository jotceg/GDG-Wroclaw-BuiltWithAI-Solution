import { Injectable, InjectionToken, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { PipelineGateway } from './pipeline-gateway';

/** Base path of the NestJS API (global prefix `api`). */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => '/api',
});

/**
 * Real backend gateway. Swaps in for the mock with zero component changes.
 * Endpoint paths follow docs/04_architecture.md. The `/fivewhys/*` turn
 * endpoints are not built by the backend yet — align on their shape at
 * integration time (see FiveWhysTurn / FiveWhysStep).
 */
@Injectable()
export class HttpPipelineGateway implements PipelineGateway {
  private readonly http = inject(HttpClient);
  private readonly base = inject(API_BASE_URL);

  private p(problemId: string, path = ''): string {
    return `${this.base}/problems/${problemId}${path}`;
  }

  createProblem(description: string): Observable<Problem> {
    return this.http.post<Problem>(`${this.base}/problems`, { description });
  }

  getContradiction(problemId: string): Observable<Contradiction> {
    return this.http.post<Contradiction>(this.p(problemId, '/contradiction'), {});
  }

  getTrizSolutions(problemId: string): Observable<Solution[]> {
    return this.http.post<Solution[]>(this.p(problemId, '/solutions/triz'), {});
  }

  startFiveWhys(problemId: string): Observable<FiveWhysStep> {
    return this.http.post<FiveWhysStep>(this.p(problemId, '/fivewhys/next'), {});
  }

  answerWhy(problemId: string, answer: string): Observable<FiveWhysTurn> {
    return this.http.post<FiveWhysTurn>(this.p(problemId, '/fivewhys/answer'), {
      answer,
    });
  }

  requestHypothesis(problemId: string): Observable<FiveWhysStep> {
    return this.http.post<FiveWhysStep>(
      this.p(problemId, '/fivewhys/hypothesis'),
      {}
    );
  }

  confirmHypothesis(
    problemId: string,
    stepId: string,
    accepted: boolean
  ): Observable<FiveWhysTurn> {
    return this.http.post<FiveWhysTurn>(
      this.p(problemId, '/fivewhys/hypothesis/confirm'),
      { stepId, accepted }
    );
  }

  getFiveWhysSolutions(problemId: string): Observable<Solution[]> {
    return this.http.post<Solution[]>(
      this.p(problemId, '/solutions/fivewhys'),
      {}
    );
  }

  evaluate(problemId: string): Observable<Evaluation[]> {
    return this.http.post<Evaluation[]>(this.p(problemId, '/evaluate'), {});
  }

  select(problemId: string): Observable<Selection> {
    return this.http.post<Selection>(this.p(problemId, '/select'), {});
  }

  getTrail(problemId: string): Observable<ReasoningTrail> {
    return this.http.get<ReasoningTrail>(this.p(problemId, '/trail'));
  }
}
