import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import {
  EVALUATION_CRITERIA,
  PipelineStore,
} from '@gdg-wroclaw-solution/data-access';
import { MethodTag, ScoreBar, LoadingBlock } from '@gdg-wroclaw-solution/ui';

/** Screen 4 — evaluate all candidates (solution x criterion), ranked. */
@Component({
  selector: 'app-evaluation-matrix',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe, MatButtonModule, MethodTag, ScoreBar, LoadingBlock],
  template: `
    <section class="step">
      <header>
        <h2>Evaluation matrix</h2>
        <p class="sub">
          Every candidate scored 1–10 on feasibility, impact, cost and innovation.
          Hover a score to see the reasoning.
        </p>
      </header>

      @if (store.statusEvaluation() === 'loading') {
        <app-loading-block label="Scoring all candidates…" />
      } @else if (store.evaluationReady()) {
        <div class="scroll">
          <table>
            <caption class="visually-hidden">
              Candidate solutions scored across four criteria, ranked by total score
            </caption>
            <thead>
              <tr>
                <th scope="col">Candidate</th>
                @for (c of criteria; track c) {
                  <th scope="col">{{ c | titlecase }}</th>
                }
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              @for (s of ranked(); track s.id; let i = $index) {
                <tr [class.top]="i === 0">
                  <th scope="row" class="cand">
                    <span class="rank">#{{ i + 1 }}</span>
                    <span class="name">{{ s.title }}</span>
                    <app-method-tag [method]="s.method" />
                  </th>
                  @for (c of criteria; track c) {
                    <td [title]="store.cell(s.id, c)?.reasoning">
                      <app-score-bar [score]="store.cell(s.id, c)?.score ?? 0" />
                    </td>
                  }
                  <td class="total">{{ store.total(s.id) }}<span class="max">/40</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <footer class="foot">
          @if (busy()) {
            <app-loading-block label="Selecting the best candidate…" />
          } @else {
            <button mat-flat-button color="primary" (click)="select()">
              <span class="material-icons" aria-hidden="true">verified</span>
              Select the best candidate
            </button>
          }
        </footer>
      }
    </section>
  `,
  styles: `
    .step { display: flex; flex-direction: column; gap: var(--app-space-4); }
    h2 { margin: 0; font: var(--mat-sys-headline-small); }
    .sub { margin: var(--app-space-1) 0 0; color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-medium); }
    .scroll { overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; min-width: 720px; }
    th, td {
      padding: var(--app-space-3);
      text-align: left;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      vertical-align: middle;
    }
    thead th { font: var(--mat-sys-label-large); color: var(--mat-sys-on-surface-variant); }
    tr.top { background: var(--mat-sys-primary-container); }
    .cand { display: flex; flex-direction: column; gap: var(--app-space-1); min-width: 220px; }
    .rank { font: var(--mat-sys-label-small); color: var(--mat-sys-on-surface-variant); }
    .name { font: var(--mat-sys-title-medium); color: var(--mat-sys-on-surface); }
    .total { font: var(--mat-sys-title-medium); white-space: nowrap; }
    .max { font: var(--mat-sys-label-small); color: var(--mat-sys-on-surface-variant); }
    .foot { display: flex; justify-content: flex-end; }
    .visually-hidden {
      position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
      overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0;
    }
    .material-icons { font-size: 18px; }
  `,
})
export class EvaluationMatrix implements OnInit {
  protected readonly store = inject(PipelineStore);
  private readonly router = inject(Router);
  protected readonly criteria = EVALUATION_CRITERIA;
  protected readonly busy = signal(false);
  protected readonly ranked = computed(() => this.store.rankedSolutions());

  ngOnInit(): void {
    const id = this.store.problem()?.id;
    if (!id) return;
    if (!this.store.evaluationReady() && this.store.statusEvaluation() !== 'loading') {
      this.store.evaluate(id).subscribe();
    }
  }

  protected select(): void {
    const id = this.store.problem()?.id;
    if (!id || this.busy()) return;
    this.busy.set(true);
    this.store.select(id).subscribe({
      next: () => this.router.navigate(['/p', id, 'recommendation']),
      error: () => this.busy.set(false),
    });
  }
}
