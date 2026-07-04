import { Contradiction } from './contradiction.model';
import { Evaluation } from './evaluation.model';
import { FiveWhysStep } from './five-whys.model';
import { Problem } from './problem.model';
import { Solution } from './solution.model';
import { Selection } from './selection.model';

/**
 * The inspectable reasoning trail — the artifact the whole app exists to produce.
 * Aggregates every step so any screen can be revisited (input + output).
 */
export interface ReasoningTrail {
  problem: Problem;
  contradiction?: Contradiction;
  fiveWhysSteps: FiveWhysStep[];
  solutions: Solution[];
  evaluations: Evaluation[];
  selection?: Selection;
}
