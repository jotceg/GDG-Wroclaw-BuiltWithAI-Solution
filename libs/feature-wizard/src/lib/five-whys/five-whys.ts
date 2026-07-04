import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PipelineStore } from '@gdg-wroclaw-solution/data-access';
import { LoadingBlock } from '@gdg-wroclaw-solution/ui';

/** Screen 2b — Branch B: interactive 5 Whys drill-down with guardrails. */
@Component({
  selector: 'app-five-whys',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    LoadingBlock,
  ],
  template: `
    <section class="step">
      <header>
        <p class="eyebrow">Branch B · 5 Whys</p>
        <h2>Root-cause drill-down</h2>
        <p class="sub">
          The agent asks; you answer. Off-topic answers are refused, not
          followed. If you get stuck, opt in to a web-search-grounded hypothesis.
        </p>
      </header>

      <!-- Resolved steps (answers / refusals / confirmed hypotheses) -->
      <ol class="chain">
        @for (s of store.fiveWhysSteps(); track s.id) {
          <li class="turn" [class.refusal]="s.kind === 'refusal'" [class.hypothesis]="s.kind === 'hypothesis'">
            <p class="q">
              <span class="depth">Why #{{ s.depth }}</span>
              {{ s.question }}
            </p>
            @switch (s.kind) {
              @case ('refusal') {
                <p class="a">
                  <span class="material-icons" aria-hidden="true">block</span>
                  <span><strong>Guardrail:</strong> {{ s.answer }}</span>
                </p>
              }
              @case ('hypothesis') {
                <p class="a">
                  <span class="material-icons" aria-hidden="true">science</span>
                  <span><strong>Confirmed hypothesis:</strong> {{ s.answer }}</span>
                </p>
              }
              @default {
                <p class="a">
                  <span class="material-icons" aria-hidden="true">arrow_right</span>
                  <span>{{ s.answer }}</span>
                </p>
              }
            }
          </li>
        }
      </ol>

      @if (store.statusFiveWhys() === 'loading' && !store.pendingQuestion()) {
        <app-loading-block label="Starting the 5 Whys…" />
      }

      <!-- Pending hypothesis proposal takes priority over the question form -->
      @if (store.pendingHypothesis(); as h) {
        <div class="proposal">
          <p>
            <span class="material-icons" aria-hidden="true">science</span>
            <span><strong>Suggested hypothesis (verify):</strong> {{ h.answer }}</span>
          </p>
          <div class="row">
            <button mat-flat-button color="primary" [disabled]="busy()" (click)="confirm(true)">
              <span class="material-icons" aria-hidden="true">check</span> Accept
            </button>
            <button mat-stroked-button [disabled]="busy()" (click)="confirm(false)">
              <span class="material-icons" aria-hidden="true">close</span> Reject
            </button>
          </div>
        </div>
      } @else if (store.pendingQuestion(); as q) {
        <form class="ask" (submit)="submitAnswer($event)">
          <p class="q current">
            <span class="depth">Why #{{ q.depth }}</span>
            {{ q.question }}
          </p>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Your answer</mat-label>
            <input
              matInput
              name="answer"
              [value]="answer()"
              (input)="onInput($event)"
              [disabled]="busy()"
              autocomplete="off"
            />
          </mat-form-field>
          <div class="row">
            <button type="button" mat-stroked-button [disabled]="busy()" (click)="stuck()">
              <span class="material-icons" aria-hidden="true">help_outline</span>
              I'm stuck — suggest a hypothesis
            </button>
            <button type="submit" mat-flat-button color="primary" [disabled]="!canSubmit()">
              <span class="material-icons" aria-hidden="true">send</span>
              Submit answer
            </button>
          </div>
        </form>
      }

      <!-- Root cause reached -> generate countermeasures -->
      @if (store.rootReached()) {
        <div class="root">
          <p class="root-h">
            <span class="material-icons" aria-hidden="true">flag</span>
            Root cause reached (depth 5)
          </p>
          @if (store.statusFiveWhys() === 'loading') {
            <app-loading-block label="Generating countermeasures…" />
          } @else if (store.fiveWhysReady()) {
            <p class="done">
              <span class="material-icons" aria-hidden="true">check_circle</span>
              {{ store.fiveWhysSolutions().length }} countermeasure candidates generated.
            </p>
            <a mat-flat-button color="primary" [routerLink]="['/p', problemId(), 'solutions']">
              View all candidates
              <span class="material-icons" aria-hidden="true">arrow_forward</span>
            </a>
          } @else {
            <button mat-flat-button color="primary" [disabled]="busy()" (click)="generateSolutions()">
              <span class="material-icons" aria-hidden="true">auto_awesome</span>
              Generate 3 countermeasures
            </button>
          }
        </div>
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
    h2 { margin: 0; font: var(--mat-sys-headline-small); }
    .sub { margin: var(--app-space-1) 0 0; color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-medium); }
    .chain { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--app-space-2); }
    .turn {
      padding: var(--app-space-3);
      border-radius: var(--app-radius-sm);
      background: var(--mat-sys-surface-container);
      border-left: 4px solid var(--mat-sys-tertiary);
    }
    .turn.refusal { border-left-color: var(--mat-sys-error); background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .turn.hypothesis { border-left-color: var(--mat-sys-primary); background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .q { margin: 0 0 var(--app-space-1); font: var(--mat-sys-title-medium); }
    .depth {
      display: inline-block;
      margin-right: var(--app-space-2);
      padding: 0 var(--app-space-2);
      border-radius: var(--app-radius-xs);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-small);
    }
    .a { display: flex; align-items: flex-start; gap: var(--app-space-2); margin: 0; font: var(--mat-sys-body-medium); }
    .a .material-icons { font-size: 18px; }
    .ask, .proposal, .root {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      border-radius: var(--app-radius-md);
      background: var(--mat-sys-surface-container);
    }
    .proposal { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .proposal p, .root p { display: flex; align-items: center; gap: var(--app-space-2); margin: 0; }
    .q.current { font: var(--mat-sys-title-large); }
    .full { width: 100%; }
    .row { display: flex; flex-wrap: wrap; gap: var(--app-space-3); justify-content: space-between; }
    .root-h { font: var(--mat-sys-title-medium); color: var(--mat-sys-primary); }
    .done { display: flex; align-items: center; gap: var(--app-space-2); color: var(--mat-sys-primary); font: var(--mat-sys-title-medium); }
    .material-icons { font-size: 18px; }
  `,
})
export class FiveWhys implements OnInit {
  protected readonly store = inject(PipelineStore);
  protected readonly answer = signal('');
  protected readonly busy = signal(false);
  protected readonly problemId = computed(() => this.store.problem()?.id ?? '');
  protected readonly canSubmit = computed(
    () => this.answer().trim().length > 0 && !this.busy()
  );

  ngOnInit(): void {
    const id = this.store.problem()?.id;
    if (!id) return;
    if (
      this.store.fiveWhysSteps().length === 0 &&
      !this.store.pendingQuestion() &&
      !this.store.rootReached()
    ) {
      this.store.startFiveWhys(id).subscribe();
    }
  }

  protected onInput(event: Event): void {
    this.answer.set((event.target as HTMLInputElement).value);
  }

  protected submitAnswer(event: Event): void {
    event.preventDefault();
    const id = this.store.problem()?.id;
    if (!id || !this.canSubmit()) return;
    this.busy.set(true);
    this.store.answerWhy(id, this.answer().trim()).subscribe({
      next: () => {
        this.answer.set('');
        this.busy.set(false);
      },
      error: () => this.busy.set(false),
    });
  }

  protected stuck(): void {
    const id = this.store.problem()?.id;
    if (!id || this.busy()) return;
    this.busy.set(true);
    this.store.requestHypothesis(id).subscribe({
      next: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }

  protected confirm(accepted: boolean): void {
    const id = this.store.problem()?.id;
    const hyp = this.store.pendingHypothesis();
    if (!id || !hyp || this.busy()) return;
    this.busy.set(true);
    this.store.confirmHypothesis(id, hyp.id, accepted).subscribe({
      next: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }

  protected generateSolutions(): void {
    const id = this.store.problem()?.id;
    if (!id || this.busy()) return;
    this.busy.set(true);
    this.store.loadFiveWhysSolutions(id).subscribe({
      next: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }
}
