import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/** Inline loading indicator with an accessible status label. */
@Component({
  selector: 'app-loading-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinner],
  template: `
    <div class="wrap" role="status">
      <mat-progress-spinner diameter="28" mode="indeterminate" />
      <span>{{ label() }}</span>
    </div>
  `,
  styles: `
    .wrap {
      display: flex;
      align-items: center;
      gap: var(--app-space-3);
      padding: var(--app-space-4);
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-body-medium);
    }
  `,
})
export class LoadingBlock {
  readonly label = input('Working…');
}
