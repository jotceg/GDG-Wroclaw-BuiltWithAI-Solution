import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PipelineStore } from '@gdg-wroclaw-solution/data-access';
import { CandidateCard, LoadingBlock } from '@gdg-wroclaw-solution/ui';

/** Screen 5 — selected candidate, justification, and the full reasoning trail. */
@Component({
  selector: 'app-recommendation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, CandidateCard, LoadingBlock],
  template: `
    <section class="step">
      <header>
        <p class="eyebrow">Recommendation</p>
        <h2>Selected solution</h2>
      </header>

      @if (store.statusSelection() === 'loading') {
        <app-loading-block label="Assembling the recommendation and trail…" />
      } @else if (selected(); as sel) {
        <app-candidate-card [solution]="sel" [selected]="true" [total]="store.total(sel.id)" />

        <div class="just">
          <p class="j-h"><span class="material-icons" aria-hidden="true">gavel</span> Why this one</p>
          <p>{{ store.selection()?.justification }}</p>
        </div>

        <div class="trail">
          <h3>Reasoning trail</h3>
          <ol>
            <li>
              <p class="t-h">1 · Problem</p>
              <p>{{ store.problem()?.description }}</p>
            </li>
            @if (store.contradiction(); as c) {
              <li>
                <p class="t-h">2 · Contradiction (TRIZ)</p>
                <p>
                  Improve <strong>#{{ c.improvingParamCode }} {{ c.improvingParamName }}</strong>
                  without worsening <strong>#{{ c.worseningParamCode }} {{ c.worseningParamName }}</strong>.
                </p>
              </li>
            }
            <li>
              <p class="t-h">2b · 5 Whys</p>
              <p>
                {{ answeredCount() }} answered steps to the root cause:
                <em>{{ rootCause() }}</em>
              </p>
            </li>
            <li>
              <p class="t-h">3 · Candidates</p>
              <p>{{ store.allSolutions().length }} generated ({{ store.trizSolutions().length }} TRIZ + {{ store.fiveWhysSolutions().length }} via 5 Whys).</p>
            </li>
            <li>
              <p class="t-h">4 · Evaluation</p>
              <p>Ranked on feasibility, impact, cost, innovation — winner scored {{ store.total(selected()!.id) }}/40.</p>
            </li>
            <li>
              <p class="t-h">5 · Decision</p>
              <p>{{ selected()!.title }} ({{ selected()!.method === 'triz' ? 'TRIZ' : '5 Whys' }}).</p>
            </li>
          </ol>
        </div>

        <footer class="foot">
          <button mat-stroked-button (click)="startOver()">
            <span class="material-icons" aria-hidden="true">restart_alt</span>
            Analyse another problem
          </button>
        </footer>
      }
    </section>
  `,
  styles: `
    .step { display: flex; flex-direction: column; gap: var(--app-space-4); }
    .eyebrow { margin: 0; font: var(--mat-sys-label-large); color: var(--mat-sys-primary); text-transform: uppercase; letter-spacing: 0.06em; }
    h2 { margin: 0; font: var(--mat-sys-headline-small); }
    .just, .trail {
      padding: var(--app-space-4);
      border-radius: var(--app-radius-md);
      background: var(--mat-sys-surface-container);
    }
    .j-h, .t-h { display: flex; align-items: center; gap: var(--app-space-2); margin: 0 0 var(--app-space-1); font: var(--mat-sys-title-medium); }
    .just p:last-child { margin: 0; font: var(--mat-sys-body-large); }
    .trail h3 { margin: 0 0 var(--app-space-3); font: var(--mat-sys-title-large); }
    .trail ol { margin: 0; padding-left: var(--app-space-5); display: flex; flex-direction: column; gap: var(--app-space-3); }
    .trail li p:last-child { margin: 0; color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-medium); }
    .foot { display: flex; justify-content: flex-start; }
    .material-icons { font-size: 18px; }
  `,
})
export class Recommendation implements OnInit {
  protected readonly store = inject(PipelineStore);
  private readonly router = inject(Router);

  protected readonly selected = computed(() => {
    const sel = this.store.selection();
    if (!sel) return null;
    return (
      this.store.allSolutions().find((s) => s.id === sel.selectedSolutionId) ??
      null
    );
  });

  protected readonly answeredCount = computed(
    () => this.store.fiveWhysSteps().filter((s) => s.kind !== 'refusal').length
  );
  protected readonly rootCause = computed(
    () => this.store.fiveWhysSolutions()[0]?.principleName ?? 'root cause identified'
  );

  ngOnInit(): void {
    const id = this.store.problem()?.id;
    if (!id) return;
    if (!this.store.selectionReady() && this.store.statusSelection() !== 'loading') {
      this.store.select(id).subscribe();
    }
  }

  protected startOver(): void {
    this.store.reset();
    this.router.navigate(['/']);
  }
}
