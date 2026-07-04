import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Pixel sprite engine ported 1:1 from the Volt prototype (docs/design-system).
// Legend: O outline · B body · L body-shade · F face plate · E green eye/joint
//         C indigo core · Y amber antenna · G green sparkle · K info thought-dot · W glint
const PAL: Record<string, string> = {
  O: 'var(--color-on-surface)',
  B: 'var(--color-on-surface-variant)',
  L: 'var(--color-border-interactive)',
  F: 'var(--color-mascot-face)',
  E: 'var(--color-mascot-accent)',
  C: 'var(--color-primary-fill)',
  P: 'var(--color-primary)',
  W: 'var(--color-surface-1)',
  Y: 'var(--color-warning-fill)',
  G: 'var(--color-mascot-accent)',
  K: 'var(--color-info)',
  S: 'var(--color-success)',
  R: 'var(--color-error)',
  M: 'var(--color-method2-dot)',
};

export type VoltExpr = 'idle' | 'thinking' | 'aha' | 'confused' | 'working';

const VOLT: Record<VoltExpr, string[]> = {
  idle: [
    '.......YE.......',
    '.......YO.......',
    '.......EO.......',
    '...OOOOOOOOOO...',
    '..OBBBBBBBBBBBO.',
    '..OBFFFFFFFFFFBO',
    '..OBFEEFFFFEEFBO',
    '..OBFFFFFFFFFFBO',
    '..OBFFFEEEEFFFBO',
    '..OBFFFFFFFFFFBO',
    '..OBBBBBBBBBBBO.',
    '...OLLCCCCCLLO..',
    'E..OLCCWWCCLO..E',
    '.OOOLCCCCCCLOOO.',
    '...OOO....OOO...',
    '...OO......OO...',
  ],
  thinking: [
    '.......YE......K',
    '.......YO....K..',
    '.......EO..K....',
    '...OOOOOOOOOO...',
    '..OBBBBBBBBBBBO.',
    '..OBFFFFFFFFFFBO',
    '..OBFEEFFFFEEFBO',
    '..OBFFFFFFFFFFBO',
    '..OBFFFF.FFFFBO.',
    '..OBFFFEEEFFFBO.',
    '..OBBBBBBBBBBBO.',
    '...OLLCCCCCLLO..',
    '...OLCCWWCCLO...',
    '.OOOLCCCCCCLOOO.',
    '...OOO....OOO...',
    '...OO......OO...',
  ],
  aha: [
    '.....G.YE.G.....',
    '......YO..G.....',
    '.G.....EO.......',
    '...OOOOOOOOOO...',
    '.G.OBBBBBBBBBO.G',
    '..OBFFFFFFFFFFBO',
    '..OBFEEFFFFEEFBO',
    '..OBFFEEEEEEFFBO',
    '..OBFEEEEEEEEFBO',
    '..OBFFFFFFFFFFBO',
    '..OBBBBBBBBBBBO.',
    '.G.OLLCCCCCLLO..',
    '...OLCCWWCCLO..G',
    '.OOOLCCCCCCLOOO.',
    '...OOO....OOO...',
    '..GOO......OOG..',
  ],
  confused: [
    '.......Y........',
    '......Y.........',
    '.....YE.........',
    '...OOOOOOOOOO..K',
    '..OBBBBBBBBBBBO.',
    '..OBFFFFFFFFFFBO',
    '..OBFEEFFEEFFFBO',
    '..OBFEEFFEEFFFBO',
    '..OBFFFFFFFFFFBO',
    '..OBFFFEE.FFFFBO',
    '..OBFFF.EEFFFFBO',
    '..OBBBBBBBBBBBO.',
    '...OLLCCCCCLLO..',
    '...OLCCWWCCLO...',
    '.OOOLCCCCCCLOOO.',
    '...OOO....OOO..K',
    '...OO......OO...',
  ],
  working: [
    '.......YE.......',
    '.......YO.......',
    '.......EO.......',
    '...OOOOOOOOOO...',
    '..OBBBBBBBBBBBO.',
    '..OBFFFFFFFFFFBO',
    '..OBFEEFFFFEEFBO',
    '..OBFFFFFFFFFFBO',
    '..OBFFFEEEEFFFBO',
    '..OBFFFFFFFFFFBO',
    '..OBBBBBBBBBBBO.',
    '...OLLCCCCCLLO..',
    '...OLCCWWCCLO...',
    '.OOOLCCCCCCLOOO.',
    '...OOO....OOO...',
    '..GGGGG..GGGGG..',
  ],
};

const VOLT_MINI = [
  '....YE....',
  '..OOOOOO..',
  '.OBBBBBBO.',
  '.OFEEFFEO.',
  '.OFFFFFEO.',
  '.OFEEEEFO.',
  '.OBBBBBBO.',
  '..OCCCCO..',
  '...OOOO...',
];

const STAGE_PX: Record<string, string[]> = {
  problem: ['............', '...OOOO.....', '..O....O....', '.O..CC..O...', '.O..CC..O...', '..O....O....', '...OOOO.....', '......OO....', '.......OO...', '........OO..', '............'],
  contradiction: ['............', '.....Y......', '...O.YY.O...', '..OO.YY.OO..', '.OOOOYYOOOO.', '..OO.YY.OO..', '...O.YY.O...', '......Y.....', '............'],
  fivewhys: ['..OOOOOO....', '..OFFFFFO...', '.OFEEFFEO.K.', '..OFFFFFO.K.', '..OOOOOO..K.', '...O..K..K..', '......K..K..', '......KK....', '..........K.', '............'],
  parallel: ['.C.......E..', '.C.......E..', '.CC.....EE..', '..CC...EE...', '...CC.EE....', '....CCE.....', '.....O......', '.....O......', '....OOO.....', '...OOOOO....'],
  candidates: ['....OOOO....', '...O....O...', '..O..CC..O..', 'E.O.C..C.O.E', '..O..CC..O..', '...O....O...', '....O..O....', '....OOOO....', '....OBBO....', '.....OO.....'],
  evaluation: ['..........SS', '.........SS.', '..S.....SS..', '...S...SS...', '....S.SS....', '.....SS.....', '.CC.........', '.CC..KK.....', '.CC..KK..BB.', '.CC..KK..BB.', 'OOOOOOOOOOOO'],
  choice: ['..O.YYYY.O..', '..O.YYYY.O..', '...O.YY.O...', '....OYYO....', '.....YY.....', '.....OO.....', '....OOOO....', '...OOOOOO...'],
};

export function pxSvg(
  map: string[],
  pxSize: number,
  opts: { pulse?: boolean; alt?: boolean } = {}
): string {
  const h = map.length;
  const w = Math.max(...map.map((r) => r.length));
  const core: string[] = [];
  const rest: string[] = [];
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const el = `<rect x="${x}" y="${y}" width="1" height="1" fill="${PAL[ch] || ch}"/>`;
      if (ch === 'C' || ch === 'P') core.push(el);
      else rest.push(el);
    }
  });
  const coreStyle = opts.pulse
    ? ' style="animation:praxis-blink 1.8s ease-in-out infinite;transform-origin:center"'
    : '';
  return (
    `<svg width="${w * pxSize}" height="${h * pxSize}" viewBox="0 0 ${w} ${h}"` +
    (opts.alt ? '' : ' aria-hidden="true"') +
    ` style="display:block;shape-rendering:crispEdges;overflow:visible">` +
    `<g>${rest.join('')}</g><g${coreStyle}>${core.join('')}</g></svg>`
  );
}

// Volt mascot at a given expression + scale. label => role="img" wrapper.
@Component({
  selector: 'v-mascot',
  standalone: true,
  template: `<span
    style="display:contents"
    [attr.role]="label() ? 'img' : null"
    [attr.aria-label]="label() || null"
    [attr.aria-hidden]="label() ? null : 'true'"
    [innerHTML]="svg()"
  ></span>`,
  host: { style: 'display:flex', '[attr.data-volt]': "bob() ? '' : null" },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VMascot {
  readonly expr = input<VoltExpr>('idle');
  readonly scale = input(4);
  readonly pulse = input(true);
  readonly bob = input(true);
  readonly label = input('');
  private readonly sanitizer = inject(DomSanitizer);
  readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      pxSvg(VOLT[this.expr()], this.scale(), { pulse: this.pulse(), alt: !!this.label() })
    )
  );
}

// Mini Volt head (nav lockup / footer).
@Component({
  selector: 'v-mini',
  standalone: true,
  template: `<span style="display:contents" [innerHTML]="svg()"></span>`,
  host: { style: 'display:flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VMini {
  readonly scale = input(2.6);
  private readonly sanitizer = inject(DomSanitizer);
  readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(pxSvg(VOLT_MINI, this.scale()))
  );
}

// Pixel stage illustration (stepper cards, how-it-works, foundations).
@Component({
  selector: 'v-stagepx',
  standalone: true,
  template: `<span style="display:contents" [innerHTML]="svg()"></span>`,
  host: { style: 'display:flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VStagePx {
  readonly stage = input.required<string>();
  readonly scale = input(3);
  private readonly sanitizer = inject(DomSanitizer);
  readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(
      pxSvg(STAGE_PX[this.stage()] || STAGE_PX['problem'], this.scale())
    )
  );
}

// Volt face plate for the nav lockup. Pupils track the cursor through the
// --vex/--vey custom properties (set globally by VoltApp's pointermove handler).
@Component({
  selector: 'v-face',
  standalone: true,
  template: `<span style="display:contents" [innerHTML]="svg"></span>`,
  host: { style: 'display:flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VFace {
  private readonly sanitizer = inject(DomSanitizer);
  readonly svg: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    `<svg width="28" height="28" viewBox="0 0 10 9" aria-hidden="true" style="display:block;shape-rendering:crispEdges;overflow:visible">` +
      `<rect x="0" y="1" width="10" height="7" rx="0.6" fill="var(--color-on-surface-variant)"/>` +
      `<rect x="1" y="2" width="8" height="5" rx="0.3" fill="var(--color-mascot-face)"/>` +
      `<rect x="4" y="0" width="2" height="2" rx="0.2" fill="var(--color-warning-fill)"/>` +
      `<rect x="5" y="0" width="1" height="1" fill="var(--color-mascot-accent)"/>` +
      `<rect x="2" y="3" width="2" height="2" rx="0.2" fill="var(--color-mascot-accent)"/>` +
      `<rect x="6" y="3" width="2" height="2" rx="0.2" fill="var(--color-mascot-accent)"/>` +
      `<rect x="2.5" y="3.4" width="1" height="1" fill="var(--color-on-surface)" style="transform:translate(var(--vex,0px),var(--vey,0px));transition:transform .1s"/>` +
      `<rect x="6.5" y="3.4" width="1" height="1" fill="var(--color-on-surface)" style="transform:translate(var(--vex,0px),var(--vey,0px));transition:transform .1s"/>` +
      `<rect x="3" y="6" width="4" height="0.8" rx="0.3" fill="var(--color-on-surface)" opacity="0.5"/>` +
      `<rect x="4" y="4" width="2" height="1.5" rx="0.3" fill="var(--color-primary-fill)" style="animation:praxis-blink 1.8s ease-in-out infinite"/>` +
      `</svg>`
  );
}
