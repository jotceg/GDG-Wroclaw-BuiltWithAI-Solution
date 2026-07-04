import { Route } from '@angular/router';
import { VoltApp } from './volt/volt-app';

export const appRoutes: Route[] = [
  { path: '', component: VoltApp },
  { path: '**', redirectTo: '' },
];
