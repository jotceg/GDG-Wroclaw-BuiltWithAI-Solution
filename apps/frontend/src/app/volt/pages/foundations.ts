import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { VoltState } from '../core/volt-state';
import { VIcon } from '../core/icons';
import { VMascot, VStagePx, VoltExpr } from '../core/mascot';

// Swatch definitions per theme — ported 1:1 from the prototype's renderVals (volt-template.html).
type SwatchDef = [string, string, string, string]; // [name, role, value, ratio]
const SW_DARK: SwatchDef[] = [
  ['Primary', 'primary', '#B0A2FF', '8.20 [AAA]'],
  ['Primary fill', 'primary-fill', '#6D50FF', '—'],
  ['Secondary', 'secondary', '#CBE85A', '13.20 [AAA]'],
  ['Method 2', 'method2', '#9A8DE0', '6.29 [AA]'],
  ['On surface', 'on-surface', '#ECEAF6', '15.31 [AAA]'],
  ['On surface var', 'on-surface-variant', '#AEA9C4', '8.03 [AAA]'],
  ['Text disabled', 'text-disabled', '#8B86A3', '5.23 [AA]'],
  ['Success', 'success', '#4BD07E', '9.21 [AAA]'],
  ['Warning', 'warning', '#FFC53D', '11.53 [AAA]'],
  ['Error', 'error', '#FF7A8A', '7.28 [AAA]'],
  ['Info', 'info', '#7FB0FF', '8.28 [AAA]'],
];
const SW_LIGHT: SwatchDef[] = [
  ['Primary', 'primary', '#5B3DF5', '6.12 [AA]'],
  ['Primary container', 'primary-container', '#E4DFFF', '—'],
  ['Secondary', 'secondary', '#5E6B00', '5.87 [AA]'],
  ['Method 2', 'method2', '#5B3DF5', '6.12 [AA]'],
  ['On surface', 'on-surface', '#17151F', '18.05 [AAA]'],
  ['On surface var', 'on-surface-variant', '#4B4860', '8.77 [AAA]'],
  ['Text disabled', 'text-disabled', '#7A7689', '4.39 [~AA]'],
  ['Success', 'success', '#0A6B33', '6.64 [AAA]'],
  ['Warning', 'warning', '#946200', '5.24 [AA]'],
  ['Error', 'error', '#C11B33', '6.05 [AA]'],
  ['Info', 'info', '#1D5AD1', '6.11 [AA]'],
];

interface MascotCard {
  expr: VoltExpr;
  name: string;
  usage: string;
  alt: string;
  pulse: boolean;
}

// PAGE E — FOUNDATIONS. Ported 1:1 from the Volt prototype (volt-template.html).
@Component({
  selector: 'volt-foundations',
  standalone: true,
  imports: [VIcon, VMascot, VStagePx],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .fd-btn-primary:hover {
        filter: brightness(1.08) !important;
      }
      .fd-btn-secondary:hover {
        background: var(--color-surface-2) !important;
      }
      .fd-btn-ghost:hover {
        background: var(--color-primary-container) !important;
      }
      .fd-btn-destr:hover {
        filter: brightness(1.06) !important;
      }
    `,
  ],
  template: `
    <section aria-labelledby="fnd-h" style="max-width:1280px;margin:0 auto;padding:clamp(28px,4vw,52px) 24px 110px">
      <div style="margin-bottom:36px">
        <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:.14em;color:var(--color-primary);font-weight:600">DESIGN SYSTEM</div>
        <h1 id="fnd-h" style="font-family:var(--font-display);font-weight:700;font-size:clamp(28px,3.6vw,42px);letter-spacing:-.02em;margin:10px 0 6px">Foundations &amp; components</h1>
        <p style="color:var(--color-on-surface-variant);font-size:15px;margin:0;max-width:60ch">Every token verified for contrast on each surface. Toggle the theme in the top bar to inspect both modes — all values shift live.</p>
      </div>

      <!-- Palette -->
      <h2 style="font-family:var(--font-display);font-weight:600;font-size:20px;margin:0 0 16px">Color tokens <span style="font-size:13px;font-weight:400;color:var(--color-on-surface-variant)">· contrast on surface-1</span></h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:44px">
        @for (sw of swatches(); track $index) {
          <div style="border:1px solid var(--color-border);border-radius:14px;overflow:hidden;background:var(--color-surface-1)">
            <div style="height:64px;display:flex;align-items:flex-end;justify-content:flex-end;padding:8px" [style.background]="sw.value"><span style="font-family:var(--font-mono);font-size:10.5px;font-weight:600;padding:3px 6px;border-radius:5px;background:var(--color-surface-1);color:var(--color-on-surface)">{{ sw.ratio }}</span></div>
            <div style="padding:11px 13px">
              <div style="font-size:13px;font-weight:600">{{ sw.name }}</div>
              <div style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant);margin-top:2px">{{ sw.role }}</div>
            </div>
          </div>
        }
      </div>

      <!-- Type -->
      <h2 style="font-family:var(--font-display);font-weight:600;font-size:20px;margin:0 0 16px">Typography</h2>
      <div style="border:1px solid var(--color-border);border-radius:16px;padding:26px;background:var(--color-surface-1);margin-bottom:44px;display:flex;flex-direction:column;gap:18px">
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:14px;border-bottom:1px solid var(--color-border);padding-bottom:18px"><span style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant);width:120px">Display · Grotesk</span><span style="font-family:var(--font-display);font-weight:700;font-size:40px;letter-spacing:-.02em">Reasoning, visible</span></div>
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:14px;border-bottom:1px solid var(--color-border);padding-bottom:18px"><span style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant);width:120px">Body · Plex Sans</span><span style="font-size:16px;max-width:52ch;color:var(--color-on-surface)">Clean humanist sans for interface copy and long-form explanation, tuned for sustained reading at 16px.</span></div>
        <div style="display:flex;flex-wrap:wrap;align-items:baseline;gap:14px"><span style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant);width:120px">Mono · Plex Mono</span><span style="font-family:var(--font-mono);font-size:14px;color:var(--color-on-surface)">PARAM_35 ⟂ PARAM_16 → principle[35,15,1,40]</span></div>
      </div>

      <!-- Buttons state matrix -->
      <h2 style="font-family:var(--font-display);font-weight:600;font-size:20px;margin:0 0 16px">Buttons <span style="font-size:13px;font-weight:400;color:var(--color-on-surface-variant)">· default / hover / focus / disabled</span></h2>
      <div style="border:1px solid var(--color-border);border-radius:16px;padding:24px;background:var(--color-surface-1);margin-bottom:24px;display:flex;flex-wrap:wrap;gap:14px;align-items:center">
        <button class="fd-btn-primary" style="height:44px;padding:0 20px;border-radius:11px;border:none;background:var(--color-primary-fill);color:var(--color-on-primary-fill);font-weight:600;font-size:14px;cursor:pointer">Primary</button>
        <button class="fd-btn-secondary" style="height:44px;padding:0 20px;border-radius:11px;border:1.5px solid var(--color-border-interactive);background:transparent;color:var(--color-on-surface);font-weight:600;font-size:14px;cursor:pointer">Secondary</button>
        <button class="fd-btn-ghost" style="height:44px;padding:0 20px;border-radius:11px;border:none;background:transparent;color:var(--color-primary);font-weight:600;font-size:14px;cursor:pointer">Ghost</button>
        <button class="fd-btn-destr" style="height:44px;padding:0 20px;border-radius:11px;border:none;background:var(--color-error);color:#fff;font-weight:600;font-size:14px;cursor:pointer">Destructive</button>
        <button aria-disabled="true" style="height:44px;padding:0 20px;border-radius:11px;border:1px dashed var(--color-text-disabled);background:var(--color-surface-2);color:var(--color-text-disabled);font-weight:600;font-size:14px;cursor:not-allowed">Disabled</button>
        <button style="height:44px;padding:0 20px;border-radius:11px;border:1.5px solid var(--color-primary-fill);background:transparent;color:var(--color-on-surface);font-weight:600;font-size:14px;display:inline-flex;align-items:center;gap:9px;cursor:progress"><span aria-hidden="true" style="width:15px;height:15px;border-radius:50%;border:2px solid var(--color-primary);border-top-color:transparent;animation:praxis-spin .8s linear infinite"></span>Loading</button>
      </div>

      <!-- Chips / badges / status / skeleton -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:20px">
        <div style="border:1px solid var(--color-border);border-radius:16px;padding:22px;background:var(--color-surface-1)">
          <h3 style="font-family:var(--font-display);font-size:15px;margin:0 0 14px">Chips &amp; badges</h3>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            <span style="padding:6px 11px;border-radius:999px;background:var(--color-primary-container);color:var(--color-on-primary-container);font-size:12.5px;font-weight:600">Principle 35</span>
            <span style="padding:6px 11px;border-radius:8px;background:var(--color-primary-fill);color:#fff;font-size:11.5px;font-weight:700;display:inline-flex;gap:6px;align-items:center"><v-icon name="contra" [size]="18" />TRIZ</span>
            <span style="padding:6px 11px;border-radius:999px;background:transparent;border:1.5px solid var(--color-method2-dot);color:var(--color-method2);font-size:11.5px;font-weight:700">METHOD 2</span>
            <span style="padding:6px 11px;border-radius:999px;background:var(--color-secondary-container);color:var(--color-on-secondary-container);font-size:12.5px;font-weight:600">SDG 13</span>
          </div>
        </div>
        <div style="border:1px solid var(--color-border);border-radius:16px;padding:22px;background:var(--color-surface-1)">
          <h3 style="font-family:var(--font-display);font-size:15px;margin:0 0 14px">Status messages</h3>
          <div style="display:flex;flex-direction:column;gap:9px">
            <div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--color-success) 12%,var(--color-surface-1));color:var(--color-success);font-size:13px;font-weight:600"><v-icon name="check" [size]="16" /> Pipeline complete</div>
            <div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--color-warning) 14%,var(--color-surface-1));color:var(--color-warning);font-size:13px;font-weight:600"><v-icon name="alert" [size]="15" /> Low-confidence candidate</div>
            <div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:10px;background:color-mix(in srgb,var(--color-error) 12%,var(--color-surface-1));color:var(--color-error);font-size:13px;font-weight:600"><v-icon name="alert" [size]="15" /> Contradiction unresolved</div>
          </div>
        </div>
        <div style="border:1px solid var(--color-border);border-radius:16px;padding:22px;background:var(--color-surface-1)">
          <h3 style="font-family:var(--font-display);font-size:15px;margin:0 0 14px">Loading skeleton</h3>
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">
            <span style="display:flex"><v-mascot expr="working" [scale]="3.2" [pulse]="true" [bob]="true" label="Volt working" /></span>
            <span style="font-size:13px;color:var(--color-on-surface-variant)">Volt pairs with skeletons while the pipeline runs.</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <span style="height:14px;width:70%;border-radius:6px;background:linear-gradient(90deg,var(--color-surface-2),var(--color-surface-3),var(--color-surface-2));background-size:800px 100%;animation:praxis-shimmer 1.3s linear infinite"></span>
            <span style="height:14px;width:100%;border-radius:6px;background:linear-gradient(90deg,var(--color-surface-2),var(--color-surface-3),var(--color-surface-2));background-size:800px 100%;animation:praxis-shimmer 1.3s linear infinite"></span>
            <span style="height:14px;width:45%;border-radius:6px;background:linear-gradient(90deg,var(--color-surface-2),var(--color-surface-3),var(--color-surface-2));background-size:800px 100%;animation:praxis-shimmer 1.3s linear infinite"></span>
          </div>
        </div>
      </div>

      <!-- Mascot: Volt -->
      <h2 style="font-family:var(--font-display);font-weight:600;font-size:20px;margin:44px 0 6px">Volt — the reasoning mascot</h2>
      <p style="color:var(--color-on-surface-variant);font-size:14px;margin:0 0 16px;max-width:64ch">A pixel robot whose chest core is the same reasoning-pulse used across the product — when the pipeline thinks, Volt’s core pulses in sync. Five expressions, reused across states.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:36px">
        @for (m of mascotSet; track $index) {
          <div style="border:1px solid var(--color-border);border-radius:14px;padding:18px;background:var(--color-surface-1);text-align:center">
            <span style="display:inline-flex;margin-bottom:12px"><v-mascot [expr]="m.expr" [scale]="4.4" [pulse]="m.pulse" [bob]="true" [label]="m.alt" /></span>
            <div style="font-size:13.5px;font-weight:600">{{ m.name }}</div>
            <div style="font-size:12px;color:var(--color-on-surface-variant);margin-top:3px">{{ m.usage }}</div>
          </div>
        }
      </div>

      <h2 style="font-family:var(--font-display);font-weight:600;font-size:20px;margin:0 0 16px">Stage illustrations</h2>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px">
        @for (st of s.stagesRaw; track $index) {
          <div style="border:1px solid var(--color-border);border-radius:14px;padding:18px;background:var(--color-surface-1);text-align:center">
            <span style="display:inline-flex;margin-bottom:10px" aria-hidden="true"><v-stagepx [stage]="st.key" [scale]="4" /></span>
            <div style="font-size:13px;font-weight:600">{{ st.label }}</div>
          </div>
        }
      </div>
    </section>
  `,
})
export class VoltFoundations {
  readonly s = inject(VoltState);

  readonly swatches = computed(() =>
    (this.s.theme() === 'dark' ? SW_DARK : SW_LIGHT).map(([name, role, value, ratio]) => ({
      name,
      role: '--color-' + role,
      value,
      ratio,
    }))
  );

  readonly mascotSet: MascotCard[] = [
    { expr: 'idle', name: 'Idle / greeting', usage: 'Landing hero, empty states', alt: 'Volt waving hello', pulse: true },
    { expr: 'thinking', name: 'Thinking', usage: 'Pipeline running — core pulses', alt: 'Volt thinking, core pulsing', pulse: true },
    { expr: 'aha', name: 'Aha!', usage: 'Solution chosen', alt: 'Volt celebrating with a spark', pulse: false },
    { expr: 'confused', name: 'Confused', usage: 'Errors — friendly, not alarming', alt: 'Volt confused with a sweat drop', pulse: false },
    { expr: 'working', name: 'Working', usage: 'Loading, long operations', alt: 'Volt working with progress dots', pulse: true },
  ];
}
