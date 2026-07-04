import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PipelineStore } from '@gdg-wroclaw-solution/data-access';
import { CandidateCard, LoadingBlock } from '@gdg-wroclaw-solution/ui';

/** Screen 3 — merged candidate pool (BPMN Task_merge): 3 TRIZ + 3 from 5 Whys. */
@Component({
  selector: 'app-solutions-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, CandidateCard, LoadingBlock],
  template: `
    <section class="step">
      <header>
        <h2>Candidate solutions</h2>
        <p class="sub">
          {{ store.allSolutions().length }} candidates from two independent methods.
        </p>
      </header>

      <div class="group">
        <h3><span class="material-icons" aria-hidden="true">grid_view</span> TRIZ</h3>
        @if (store.trizReady()) {
          <div class="grid">
            @for (s of store.trizSolutions(); track s.id) {
              <app-candidate-card [solution]="s" />
            }
          </div>
        } @else {
          <p class="missing">
            Branch A not finished.
            <a [routerLink]="['/p', problemId(), 'contradiction']">Complete the contradiction step →</a>
          </p>
        }
      </div>

      <div class="group">
        <h3><span class="material-icons" aria-hidden="true">account_tree</span> 5 Whys</h3>
        @if (store.fiveWhysReady()) {
          <div class="grid">
            @for (s of store.fiveWhysSolutions(); track s.id) {
              <app-candidate-card [solution]="s" />
            }
          </div>
        } @else {
          <p class="missing">
            Branch B not finished.
            <a [routerLink]="['/p', problemId(), 'five-whys']">Complete the 5 Whys →</a>
          </p>
        }
      </div>

      <footer class="foot">
        @if (busy()) {
          <app-loading-block label="Evaluating all candidates against the criteria…" />
        } @else {
          <p class="hint">
            @if (store.bothBranchesReady()) {
              Both branches complete — ready to evaluate.
            } @else {
              Finish both branches to unlock evaluation.
            }
          </p>
          <button
            mat-flat-button
            color="primary"
            [disabled]="!store.bothBranchesReady()"
            (click)="evaluate()"
          >
            <span class="material-icons" aria-hidden="true">table_chart</span>
            Evaluate all candidates
          </button>
        }
      </footer>
    </section>
  `,
  styles: `
    .step { display: flex; flex-direction: column; gap: var(--app-space-5); }
    h2 { margin: 0; font: var(--mat-sys-headline-small); }
    .sub { margin: var(--app-space-1) 0 0; color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-medium); }
    .group { display: flex; flex-direction: column; gap: var(--app-space-3); }
    h3 { display: flex; align-items: center; gap: var(--app-space-2); margin: 0; font: var(--mat-sys-title-large); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--app-space-4);
    }
    .missing { margin: 0; color: var(--mat-sys-on-surface-variant); }
    .missing a { color: var(--mat-sys-primary); }
    .foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: var(--app-space-3);
      padding-top: var(--app-space-3);
      border-top: 1px solid var(--mat-sys-outline-variant);
    }
    .hint { margin: 0; color: var(--mat-sys-on-surface-variant); }
    .material-icons { font-size: 20px; }
  `,
})
export class SolutionsGallery {
  protected readonly store = inject(PipelineStore);
  private readonly router = inject(Router);
  protected readonly busy = signal(false);
  protected readonly problemId = computed(() => this.store.problem()?.id ?? '');

  protected evaluate(): void {
    const id = this.store.problem()?.id;
    if (!id || !this.store.bothBranchesReady() || this.busy()) return;
    this.busy.set(true);
    this.store.evaluate(id).subscribe({
      next: () => this.router.navigate(['/p', id, 'evaluation']),
      error: () => this.busy.set(false),
    });
  }
}
