import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Solution } from '@gdg-wroclaw-solution/data-access';
import { MethodTag } from '../method-tag/method-tag';

/** Presentational card for one candidate solution. */
@Component({
  selector: 'app-candidate-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MethodTag],
  template: `
    <article class="card" [class.selected]="selected()">
      <header class="head">
        <h3 class="title">{{ solution().title }}</h3>
        <app-method-tag [method]="solution().method" />
      </header>

      <p class="principle">
        <span class="material-icons" aria-hidden="true">lightbulb</span>
        @if (solution().method === 'triz') {
          <span
            >Principle
            @if (solution().principleCode) {
              {{ solution().principleCode }} —
            }
            {{ solution().principleName }}</span
          >
        } @else {
          <span>Root cause: {{ solution().principleName }}</span>
        }
      </p>

      <p class="desc">{{ solution().description }}</p>

      @if (total() !== null) {
        <p class="total">
          Total score: <strong>{{ total() }}</strong> / 40
        </p>
      }

      @if (selected()) {
        <p class="badge">
          <span class="material-icons" aria-hidden="true">check_circle</span>
          Selected
        </p>
      }
    </article>
  `,
  styles: `
    .card {
      display: flex;
      flex-direction: column;
      gap: var(--app-space-3);
      height: 100%;
      padding: var(--app-space-4);
      border-radius: var(--app-radius-md);
      background: var(--mat-sys-surface-container);
      box-shadow: var(--app-elevation-1);
      border: 2px solid transparent;
    }
    .selected {
      border-color: var(--mat-sys-primary);
      background: var(--mat-sys-surface);
    }
    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--app-space-3);
    }
    .title {
      margin: 0;
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }
    .principle {
      display: flex;
      align-items: center;
      gap: var(--app-space-2);
      margin: 0;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .principle .material-icons { font-size: 18px; }
    .desc {
      margin: 0;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
    }
    .total {
      margin: 0;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1);
      margin: 0;
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-primary);
    }
    .badge .material-icons { font-size: 18px; }
  `,
})
export class CandidateCard {
  readonly solution = input.required<Solution>();
  readonly selected = input(false);
  readonly total = input<number | null>(null);
}
