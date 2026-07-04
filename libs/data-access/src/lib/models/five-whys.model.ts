/**
 * 5 Whys causal step.
 *
 * NOTE: the backend does NOT yet persist a `five_whys_steps` table
 * (Denys's initial DB has only problems/contradictions/solutions/evaluations/selections).
 * This is a FE-defined contract for Screen 2b; align with backend when it lands.
 *
 * `kind` drives distinct rendering (see BPMN guardrail gateway):
 * - 'answer'     — a normal engineer answer that advances the causal chain
 * - 'refusal'    — guardrail rejected an off-topic / abusive answer; scope restated, depth NOT advanced
 * - 'hypothesis' — a web-search-grounded suggestion offered when the engineer is stuck (opt-in);
 *                  `confirmed` flips to true only after the engineer accepts it
 */
export type FiveWhysKind = 'answer' | 'refusal' | 'hypothesis';

export interface FiveWhysStep {
  id: string;
  problemId: string;
  /** 1..5 (BPMN caps the drill-down at 5). */
  depth: number;
  question: string;
  /** Engineer's answer, restated scope (refusal), or suggested cause (hypothesis). */
  answer?: string;
  kind: FiveWhysKind;
  /** Only meaningful for `hypothesis`: true once the engineer confirms it. */
  confirmed: boolean;
}

/**
 * Result of one turn in the 5 Whys loop. Models the BPMN `Gateway_ontopic` /
 * `Gateway_rootcause` outcomes explicitly so the UI can render every branch.
 */
export interface FiveWhysTurn {
  /** The step just resolved this turn (an 'answer', a 'refusal', or a confirmed 'hypothesis'). */
  step: FiveWhysStep;
  /** The next "Why?" to show, when the drill-down continues. Absent once the root is reached. */
  nextQuestion?: FiveWhysStep;
  /** True once depth 5 is answered — root cause reached, ready to generate countermeasures. */
  rootReached: boolean;
}
