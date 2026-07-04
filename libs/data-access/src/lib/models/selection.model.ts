import { ReasoningTrail } from './reasoning-trail.model';

/**
 * Mirrors backend `selections` table.
 * Holds the chosen solution, its justification, and the persisted end-to-end trail.
 */
export interface Selection {
  id: string;
  problemId: string;
  selectedSolutionId: string;
  justification: string;
  /** Full reasoning trail snapshot (backend column `full_trail_json`, JSONB). */
  fullTrailJson: ReasoningTrail;
}
