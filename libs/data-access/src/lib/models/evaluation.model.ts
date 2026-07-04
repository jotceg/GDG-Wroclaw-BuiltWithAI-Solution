/**
 * Mirrors backend `evaluations` table. One row per (solution x criterion).
 */
export type EvaluationCriterion =
  | 'feasibility'
  | 'impact'
  | 'cost'
  | 'innovation';

export const EVALUATION_CRITERIA: readonly EvaluationCriterion[] = [
  'feasibility',
  'impact',
  'cost',
  'innovation',
] as const;

export interface Evaluation {
  id: string;
  solutionId: string;
  criterion: EvaluationCriterion;
  /** 1-10. */
  score: number;
  reasoning: string;
}
