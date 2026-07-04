import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  DEMO_PROBLEM_DESCRIPTION,
  PipelineStore,
} from '@gdg-wroclaw-solution/data-access';
import { LoadingBlock } from '@gdg-wroclaw-solution/ui';

/** Screen 1 — register the inventive problem (BPMN StartEvent). */
@Component({
  selector: 'app-problem-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, LoadingBlock],
  template: `
    <section class="hero">
      <header>
        <h1>
          <span class="material-icons" aria-hidden="true">psychology</span>
          Inventive R&amp;D Solver
        </h1>
        <p class="lead">
          Turn an inventive problem into a technical contradiction, generate
          candidate solutions with <strong>TRIZ</strong> and <strong>5 Whys</strong>,
          evaluate them, and get a justified recommendation — every step inspectable.
        </p>
      </header>

      <form (submit)="submit($event)">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Describe the inventive problem</mat-label>
          <textarea
            matInput
            rows="6"
            name="description"
            [value]="description()"
            (input)="onInput($event)"
            [disabled]="submitting()"
            placeholder="e.g. Buildings must stay warm in winter and cool in summer…"
          ></textarea>
        </mat-form-field>

        <div class="actions">
          <button
            type="button"
            mat-stroked-button
            (click)="loadDemo()"
            [disabled]="submitting()"
          >
            <span class="material-icons" aria-hidden="true">bolt</span>
            Load demo problem (buildings)
          </button>
          <button
            type="submit"
            mat-flat-button
            color="primary"
            [disabled]="!canSubmit()"
          >
            <span class="material-icons" aria-hidden="true">play_arrow</span>
            Start analysis
          </button>
        </div>
      </form>

      @if (submitting()) {
        <app-loading-block label="Registering problem and splitting into TRIZ + 5 Whys…" />
      }
    </section>
  `,
  styles: `
    .hero {
      max-width: 760px;
      margin: 0 auto;
      padding: var(--app-space-8) var(--app-space-4);
      display: flex;
      flex-direction: column;
      gap: var(--app-space-5);
    }
    h1 {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      margin: 0;
      font: var(--mat-sys-headline-large);
      color: var(--mat-sys-on-surface);
    }
    .lead {
      margin: var(--app-space-3) 0 0;
      font: var(--mat-sys-body-large);
      color: var(--mat-sys-on-surface-variant);
    }
    form { display: flex; flex-direction: column; gap: var(--app-space-3); }
    .full { width: 100%; }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--app-space-3);
      justify-content: flex-end;
    }
    .material-icons { font-size: 18px; }
  `,
})
export class ProblemInput {
  private readonly store = inject(PipelineStore);
  private readonly router = inject(Router);

  protected readonly description = signal('');
  protected readonly submitting = signal(false);
  protected readonly canSubmit = computed(
    () => this.description().trim().length > 0 && !this.submitting()
  );

  protected onInput(event: Event): void {
    this.description.set((event.target as HTMLTextAreaElement).value);
  }

  protected loadDemo(): void {
    this.description.set(DEMO_PROBLEM_DESCRIPTION);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit()) return;
    this.submitting.set(true);
    this.store.createProblem(this.description().trim()).subscribe({
      next: (problem) =>
        this.router.navigate(['/p', problem.id, 'contradiction']),
      error: () => this.submitting.set(false),
    });
  }
}
