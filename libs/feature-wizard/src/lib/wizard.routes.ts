import { Route } from '@angular/router';
import { joinGuard, problemGuard, selectionGuard } from './guards';

/**
 * The wizard flow. After Problem Input the path splits into two parallel
 * branches (contradiction / five-whys) that converge at evaluation -> recommendation,
 * mirroring rd_solver_main.bpmn.
 */
export const WIZARD_ROUTES: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./problem-input/problem-input').then((m) => m.ProblemInput),
  },
  {
    path: 'p/:id',
    canActivate: [problemGuard],
    loadComponent: () =>
      import('./wizard-shell/wizard-shell').then((m) => m.WizardShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contradiction' },
      {
        path: 'contradiction',
        loadComponent: () =>
          import('./contradiction-view/contradiction-view').then(
            (m) => m.ContradictionView
          ),
      },
      {
        path: 'five-whys',
        loadComponent: () =>
          import('./five-whys/five-whys').then((m) => m.FiveWhys),
      },
      {
        path: 'solutions',
        loadComponent: () =>
          import('./solutions-gallery/solutions-gallery').then(
            (m) => m.SolutionsGallery
          ),
      },
      {
        path: 'evaluation',
        canActivate: [joinGuard],
        loadComponent: () =>
          import('./evaluation-matrix/evaluation-matrix').then(
            (m) => m.EvaluationMatrix
          ),
      },
      {
        path: 'recommendation',
        canActivate: [selectionGuard],
        loadComponent: () =>
          import('./recommendation/recommendation').then((m) => m.Recommendation),
      },
    ],
  },
];
