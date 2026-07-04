import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PipelineStore } from '@gdg-wroclaw-solution/data-access';

/** Every wizard step needs a registered problem; otherwise back to the start. */
export const problemGuard: CanActivateFn = () => {
  const store = inject(PipelineStore);
  return store.problem() ? true : inject(Router).parseUrl('/');
};

/** BPMN join: evaluation requires BOTH parallel branches to have produced candidates. */
export const joinGuard: CanActivateFn = () => {
  const store = inject(PipelineStore);
  const router = inject(Router);
  const problem = store.problem();
  if (!problem) return router.parseUrl('/');
  return store.bothBranchesReady()
    ? true
    : router.parseUrl(`/p/${problem.id}/solutions`);
};

/** Recommendation requires the evaluation to have run. */
export const selectionGuard: CanActivateFn = () => {
  const store = inject(PipelineStore);
  const router = inject(Router);
  const problem = store.problem();
  if (!problem) return router.parseUrl('/');
  return store.evaluationReady()
    ? true
    : router.parseUrl(`/p/${problem.id}/evaluation`);
};
