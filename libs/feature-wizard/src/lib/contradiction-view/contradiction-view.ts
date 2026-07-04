import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PipelineStore } from '@gdg-wroclaw-solution/data-access';
import { LoadingBlock } from '@gdg-wroclaw-solution/ui';

/** Screen 2 — Branch A: technical contradiction + TRIZ candidate generation. */
@Component({
  selector: 'app-contradiction-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, LoadingBlock],
  template: `
    <section class="step">
      <header>
        <p class="eyebrow">Branch A · TRIZ</p>
        <h2>Technical contradiction</h2>
      </header>

      <div class="io">
        <p class="io-label">Input — the problem</p>
        <p class="problem">{{ store.problem()?.description }}</p>
      </div>

      @if (store.statusContradiction() === 'loading') {
        <app-loading-block label="Mapping onto the 39 TRIZ parameters…" />
      } @else if (contradiction(); as c) {
        <div class="io">
          <p class="io-label">Output — the contradiction</p>
          <div class="params">
            <div class="param improve">
              <span class="material-icons" aria-hidden="true">trending_up</span>
              <div>
                <p class="k">Improving</p>
                <p class="v">#{{ c.improvingParamCode }} · {{ c.improvingParamName }}</p>
              </div>
            </div>
            <span class="material-icons vs" aria-hidden="true">bolt</span>
            <div class="param worsen">
              <span class="material-icons" aria-hidden="true">trending_down</span>
              <div>
                <p class="k">Worsening</p>
                <p class="v">#{{ c.worseningParamCode }} · {{ c.worseningParamName }}</p>
              </div>
            </div>
          </div>
          <p class="explanation">{{ c.explanation }}</p>
        </div>

        @if (store.statusTriz() === 'loading') {
          <app-loading-block label="Contradiction matrix → principles → candidates…" />
        } @else if (store.trizReady()) {
          <p class="done">
            <span class="material-icons" aria-hidden="true">check_circle</span>
            {{ store.trizSolutions().length }} TRIZ candidates generated.
          </p>
          <nav class="next" aria-label="Next steps">
            <a mat-stroked-button [routerLink]="['/p', problemId(), 'five-whys']">
              <span class="material-icons" aria-hidden="true">account_tree</span>
              Go to Branch B · 5 Whys
            </a>
            <a mat-flat-button color="primary" [routerLink]="['/p', problemId(), 'solutions']">
              View all candidates
              <span class="material-icons" aria-hidden="true">arrow_forward</span>
            </a>
          </nav>
        }
      }
    </section>
  `,
  styles: `
    .step { display: flex; flex-direction: column; gap: var(--app-space-4); }
    .eyebrow {
      margin: 0;
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    h2 { margin: 0; font: var(--mat-sys-headline-small); color: var(--mat-sys-on-surface); }
    .io {
      padding: var(--app-space-4);
      border-radius: var(--app-radius-md);
      background: var(--mat-sys-surface-container);
    }
    .io-label {
      margin: 0 0 var(--app-space-2);
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface-variant);
    }
    .problem { margin: 0; font: var(--mat-sys-body-large); }
    .params {
      display: flex;
      align-items: center;
      gap: var(--app-space-4);
      flex-wrap: wrap;
    }
    .param {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      padding: var(--app-space-3);
      border-radius: var(--app-radius-sm);
      flex: 1;
      min-width: 220px;
    }
    .improve { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .worsen { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .param .k { margin: 0; font: var(--mat-sys-label-small); opacity: 0.9; }
    .param .v { margin: 0; font: var(--mat-sys-title-medium); }
    .vs { color: var(--mat-sys-on-surface-variant); }
    .explanation {
      margin: var(--app-space-4) 0 0;
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface);
    }
    .done {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      margin: 0;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-title-medium);
    }
    .next { display: flex; flex-wrap: wrap; gap: var(--app-space-3); justify-content: space-between; }
    .material-icons { font-size: 18px; }
  `,
})
export class ContradictionView implements OnInit {
  protected readonly store = inject(PipelineStore);
  protected readonly contradiction = this.store.contradiction;
  protected readonly problemId = computed(() => this.store.problem()?.id ?? '');

  ngOnInit(): void {
    const id = this.store.problem()?.id;
    if (!id) return;
    if (!this.store.contradiction()) {
      this.store.loadContradiction(id).subscribe(() => this.generateTriz(id));
    } else {
      this.generateTriz(id);
    }
  }

  private generateTriz(id: string): void {
    if (!this.store.trizReady() && this.store.statusTriz() !== 'loading') {
      this.store.loadTrizSolutions(id).subscribe();
    }
  }
}
