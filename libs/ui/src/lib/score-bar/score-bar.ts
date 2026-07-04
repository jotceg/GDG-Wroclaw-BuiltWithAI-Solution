import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Compact 1-10 score meter with an accessible numeric label. */
@Component({
  selector: 'app-score-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="wrap"
      role="meter"
      [attr.aria-valuenow]="score()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
      [attr.aria-label]="'Score ' + score() + ' out of ' + max()"
    >
      <div class="track">
        <div class="fill" [style.width.%]="pct()"></div>
      </div>
      <span class="num">{{ score() }}</span>
    </div>
  `,
  styles: `
    .wrap { display: flex; align-items: center; gap: var(--app-space-2); }
    .track {
      flex: 1;
      height: 8px;
      min-width: 48px;
      border-radius: var(--app-radius-full);
      background: var(--mat-sys-surface-container-highest, var(--mat-sys-surface-container));
      overflow: hidden;
    }
    .fill {
      height: 100%;
      border-radius: var(--app-radius-full);
      background: var(--mat-sys-primary);
      transition: width var(--app-duration-medium) var(--app-easing-standard);
    }
    .num {
      font: var(--mat-sys-label-large);
      color: var(--mat-sys-on-surface-variant);
      min-width: 1.5ch;
      text-align: right;
    }
  `,
})
export class ScoreBar {
  readonly score = input.required<number>();
  readonly max = input(10);
  protected readonly pct = computed(() =>
    Math.round((this.score() / this.max()) * 100)
  );
}
