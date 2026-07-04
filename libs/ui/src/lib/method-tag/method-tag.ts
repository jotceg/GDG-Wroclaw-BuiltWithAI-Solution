import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

/** Method provenance chip for a candidate solution (icon + text, not colour alone). */
@Component({
  selector: 'app-method-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="tag" [class.triz]="isTriz()" [class.fivewhys]="!isTriz()">
      <span class="material-icons" aria-hidden="true">{{
        isTriz() ? 'grid_view' : 'account_tree'
      }}</span>
      {{ label() }}
    </span>
  `,
  styles: `
    .tag {
      display: inline-flex;
      align-items: center;
      gap: var(--app-space-1);
      padding: var(--app-space-1) var(--app-space-3);
      border-radius: var(--app-radius-full);
      font: var(--mat-sys-label-large);
      line-height: 1;
    }
    .material-icons { font-size: 16px; }
    .triz {
      background: var(--mat-sys-primary-container);
      color: var(--mat-sys-on-primary-container);
    }
    .fivewhys {
      background: var(--mat-sys-tertiary-container);
      color: var(--mat-sys-on-tertiary-container);
    }
  `,
})
export class MethodTag {
  readonly method = input.required<'triz' | 'fivewhys'>();
  protected readonly isTriz = computed(() => this.method() === 'triz');
  protected readonly label = computed(() => (this.isTriz() ? 'TRIZ' : '5 Whys'));
}
