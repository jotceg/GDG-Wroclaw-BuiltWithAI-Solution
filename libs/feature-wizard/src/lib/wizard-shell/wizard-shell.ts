import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WizardNav } from '../wizard-nav/wizard-nav';

/** Layout for every p/:id step: brand header, stepper, routed content. */
@Component({
  selector: 'app-wizard-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, WizardNav],
  template: `
    <div class="shell">
      <header class="topbar">
        <h1>
          <span class="material-icons" aria-hidden="true">psychology</span>
          Inventive R&amp;D Solver
        </h1>
        <p class="sub">TRIZ contradiction + 5 Whys · buildings hot &amp; cold (SDG 13/11)</p>
      </header>
      <app-wizard-nav />
      <main class="content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .shell {
      max-width: 1080px;
      margin: 0 auto;
      padding: var(--app-space-5) var(--app-space-4) var(--app-space-8);
      display: flex;
      flex-direction: column;
      gap: var(--app-space-5);
    }
    .topbar h1 {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      margin: 0;
      font: var(--mat-sys-headline-small);
      color: var(--mat-sys-on-surface);
    }
    .sub {
      margin: var(--app-space-1) 0 0;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-medium);
    }
    .content { min-height: 300px; }
  `,
})
export class WizardShell {}
