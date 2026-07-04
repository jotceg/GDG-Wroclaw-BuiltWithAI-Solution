import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PipelineStore } from '@gdg-wroclaw-solution/data-access';

interface NavStep {
  path: string;
  label: string;
  icon: string;
  /** Parallel branch marker (A / B) or null for converged steps. */
  branch: 'A' | 'B' | null;
  enabled: boolean;
  done: boolean;
}

/** Stepper reflecting the BPMN split (A ‖ B) → join → evaluate → select. */
@Component({
  selector: 'app-wizard-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" aria-label="Pipeline steps">
      <ol>
        @for (step of steps(); track step.path) {
          <li>
            @if (step.enabled) {
              <a
                [routerLink]="['/p', problemId(), step.path]"
                routerLinkActive="active"
                #rla="routerLinkActive"
                [attr.aria-current]="rla.isActive ? 'step' : null"
                class="step"
              >
                <span class="material-icons" aria-hidden="true">{{
                  step.done ? 'check_circle' : step.icon
                }}</span>
                <span class="label">{{ step.label }}</span>
                @if (step.branch) {
                  <span class="branch">Branch {{ step.branch }}</span>
                }
              </a>
            } @else {
              <span class="step disabled" aria-disabled="true">
                <span class="material-icons" aria-hidden="true">{{ step.icon }}</span>
                <span class="label">{{ step.label }}</span>
                @if (step.branch) {
                  <span class="branch">Branch {{ step.branch }}</span>
                }
              </span>
            }
          </li>
        }
      </ol>
      <p class="hint">
        <span class="material-icons" aria-hidden="true">call_split</span>
        Branches A &amp; B run in parallel, then converge to evaluate &amp; select.
      </p>
    </nav>
  `,
  styles: `
    .nav { display: flex; flex-direction: column; gap: var(--app-space-2); }
    ol {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-2);
      margin: 0;
      padding: 0;
    }
    .step {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      padding: var(--app-space-2) var(--app-space-3);
      border-radius: var(--app-radius-sm);
      text-decoration: none;
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-container);
      font: var(--mat-sys-label-large);
      min-height: 40px;
    }
    .step .material-icons { font-size: 18px; }
    .step.active {
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
    }
    .step.disabled { opacity: 0.5; cursor: not-allowed; }
    .branch {
      font: var(--mat-sys-label-small);
      padding: 0 var(--app-space-1);
      border-radius: var(--app-radius-xs);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface-variant);
    }
    .hint {
      display: flex;
      align-items: center;
      gap: var(--app-space-1);
      margin: 0;
      font: var(--mat-sys-body-small);
      color: var(--mat-sys-on-surface-variant);
    }
    .hint .material-icons { font-size: 16px; }
  `,
})
export class WizardNav {
  private readonly store = inject(PipelineStore);
  protected readonly problemId = computed(() => this.store.problem()?.id ?? '');

  protected readonly steps = computed<NavStep[]>(() => {
    const trizDone = this.store.trizReady();
    const fiveWhysDone = this.store.fiveWhysReady();
    const join = this.store.bothBranchesReady();
    const evalDone = this.store.evaluationReady();
    const selDone = this.store.selectionReady();
    return [
      { path: 'contradiction', label: 'Contradiction', icon: 'grid_view', branch: 'A', enabled: true, done: trizDone },
      { path: 'five-whys', label: '5 Whys', icon: 'account_tree', branch: 'B', enabled: true, done: fiveWhysDone },
      { path: 'solutions', label: 'Solutions', icon: 'lightbulb', branch: null, enabled: true, done: join },
      { path: 'evaluation', label: 'Evaluation', icon: 'table_chart', branch: null, enabled: join, done: evalDone },
      { path: 'recommendation', label: 'Recommendation', icon: 'verified', branch: null, enabled: evalDone, done: selDone },
    ];
  });
}
