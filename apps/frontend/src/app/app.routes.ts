import { Route } from '@angular/router';
import { WIZARD_ROUTES } from '@gdg-wroclaw-solution/feature-wizard';

export const appRoutes: Route[] = [
  ...WIZARD_ROUTES,
  { path: '**', redirectTo: '' },
];
