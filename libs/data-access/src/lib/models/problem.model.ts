/**
 * Mirrors backend `problems` table (apps/backend/.../problem.model.ts).
 * Source of truth for the API contract is Denys's Sequelize model.
 */
export type ProblemStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'ERROR';

export interface Problem {
  id: string;
  description: string;
  status: ProblemStatus;
  /** ISO timestamp (Sequelize `created_at`). */
  createdAt: string;
}
