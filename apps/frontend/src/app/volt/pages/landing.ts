import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VoltState } from '../core/volt-state';
import { VIcon } from '../core/icons';
import { VMascot, VMini, VStagePx } from '../core/mascot';

// PAGE A — LANDING. Ported 1:1 from the Volt prototype (volt-template.html).
@Component({
  selector: 'volt-landing',
  standalone: true,
  imports: [VIcon, VMascot, VMini, VStagePx],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .lp-cta:hover {
        filter: brightness(1.08) !important;
      }
      .lp-ghost:hover {
        background: var(--color-surface-2) !important;
      }
      .lp-step:hover {
        transform: translateY(-4px) !important;
        border-color: var(--color-border-interactive) !important;
      }
    `,
  ],
  template: `
    <section aria-labelledby="hero-h">
      <!-- HERO -->
      <div style="position:relative;overflow:hidden;border-bottom:1px solid var(--color-border)">
        <div aria-hidden="true" style="position:absolute;inset:0;background:radial-gradient(120% 90% at 78% 8%, rgba(var(--glow),.24), transparent 55%),radial-gradient(80% 70% at 8% 96%, rgba(203,232,90,.10), transparent 60%)"></div>
        <div style="position:relative;max-width:1280px;margin:0 auto;padding:clamp(48px,7vw,104px) 24px;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:56px;align-items:center">
          <div data-reveal>
            <span style="display:inline-flex;align-items:center;gap:9px;padding:7px 14px;border-radius:999px;background:var(--color-surface-2);border:1px solid var(--color-border);font-size:12.5px;font-weight:600;font-family:var(--font-mono);letter-spacing:.04em;color:var(--color-on-surface-variant)">
              <span style="width:7px;height:7px;border-radius:50%;background:var(--color-accent-fill);box-shadow:0 0 10px var(--color-accent-fill)"></span>
              TRIZ · METHOD-2 · REASONING ENGINE
            </span>
            <h1 id="hero-h" style="font-family:var(--font-display);font-weight:700;font-size:clamp(38px,5.6vw,68px);line-height:1.02;letter-spacing:-.02em;margin:22px 0 0">
              Turn inventive problems into <span style="color:var(--color-primary)">structured solutions</span>.
            </h1>
            <p style="font-size:clamp(16px,1.5vw,19px);line-height:1.6;color:var(--color-on-surface-variant);max-width:34em;margin:22px 0 0">
              Volt reformulates any assigned challenge as a TRIZ technical contradiction, generates candidate solutions with two independent methods, scores them against weighted criteria — and shows you every step of the reasoning it took to get there.
            </p>
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:34px">
              <button (click)="s.go('form')" data-magnetic class="lp-cta" style="display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 26px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:13px;font-size:16px;font-weight:600;box-shadow:var(--shadow-2)">
                Start solving <span style="display:flex"><v-icon name="arrow" [size]="18" /></span>
              </button>
              <button (click)="s.go('workspace')" class="lp-ghost" style="display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 24px;background:transparent;color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:13px;font-size:16px;font-weight:600">
                See a worked example
              </button>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin:26px 0 0">
              <span style="display:flex;flex:none"><v-mascot expr="idle" [scale]="4.6" [pulse]="true" [bob]="true" label="Volt, the pixel robot mascot, waving" /></span>
              <p style="margin:0;font-size:13px;line-height:1.5;color:var(--color-on-surface-variant)"><strong style="color:var(--color-on-surface)">Volt</strong>, your reasoning companion · Live demo: Problem 7 — “Keeping Buildings Hot &amp; Cold” · SDG 13 &amp; 11</p>
            </div>
          </div>

          <!-- Reasoning-core signature visual -->
          <div data-reveal style="position:relative;aspect-ratio:1;max-width:460px;margin:0 auto;width:100%">
            <div aria-hidden="true" style="position:absolute;inset:8%;border-radius:50%;background:radial-gradient(circle, rgba(var(--glow),.42), rgba(var(--glow),.06) 55%, transparent 70%);animation:praxis-pulse-strong 3.2s ease-in-out infinite;filter:blur(6px)"></div>
            <div aria-hidden="true" style="position:absolute;inset:0;border-radius:50%;border:1px solid var(--color-border)"></div>
            <div aria-hidden="true" style="position:absolute;inset:12%;border-radius:50%;border:1px dashed color-mix(in srgb,var(--color-primary) 40%, transparent);animation:praxis-orbit 44s linear infinite"></div>
            <div aria-hidden="true" style="position:absolute;inset:26%;border-radius:50%;border:1px solid var(--color-border);animation:praxis-orbit-rev 30s linear infinite"></div>
            <!-- orbiting stage nodes -->
            <div aria-hidden="true" style="position:absolute;inset:12%;animation:praxis-orbit 44s linear infinite">
              @for (n of orbitNodes; track $index) {
                <span
                  style="position:absolute;top:50%;left:50%;width:14px;height:14px;margin:-7px;border-radius:50%"
                  [style.transform]="'rotate(' + n.deg + 'deg) translateX(calc(50% + 78px)) rotate(' + n.negdeg + 'deg)'"
                  [style.background]="n.color"
                  [style.box-shadow]="'0 0 12px ' + n.color"
                ></span>
              }
            </div>
            <!-- core -->
            <div style="position:absolute;inset:0;display:grid;place-items:center">
              <div style="text-align:center">
                <div aria-hidden="true" style="width:88px;height:88px;margin:0 auto;border-radius:50%;background:conic-gradient(from 0deg, var(--color-primary-fill), var(--color-accent-fill), var(--color-primary-fill));display:grid;place-items:center;box-shadow:0 0 44px rgba(var(--glow),.5);animation:praxis-orbit 12s linear infinite">
                  <span style="width:66px;height:66px;border-radius:50%;background:var(--color-surface-1);display:grid;place-items:center">
                    <span style="color:var(--color-primary);display:flex"><v-icon name="core" [size]="30" /></span>
                  </span>
                </div>
                <div style="margin-top:16px;font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;color:var(--color-on-surface-variant)">REASONING CORE</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- HOW IT WORKS -->
      <div style="max-width:1280px;margin:0 auto;padding:clamp(56px,7vw,96px) 24px">
        <div data-reveal style="display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:16px;margin-bottom:40px">
          <div>
            <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:.16em;color:var(--color-primary);font-weight:600">HOW IT WORKS</div>
            <h2 style="font-family:var(--font-display);font-weight:700;font-size:clamp(28px,3.4vw,40px);letter-spacing:-.02em;margin:10px 0 0">Five inspectable steps</h2>
          </div>
          <p style="max-width:30em;color:var(--color-on-surface-variant);font-size:15px;margin:0">Not one prompt — a pipeline. Every stage exposes its raw inputs and outputs, so the reasoning is auditable end to end.</p>
        </div>
        <ol style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,1fr);gap:16px" role="list">
          @for (st of howSteps; track $index) {
            <li data-reveal style="position:relative">
              <button (click)="stepGo($index)" class="lp-step" style="width:100%;text-align:left;height:100%;background:var(--color-surface-1);color:var(--color-on-surface);border:1px solid var(--color-border);border-radius:16px;padding:22px 18px;cursor:pointer;transition:transform .18s,border-color .18s;box-shadow:var(--shadow-1)">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span style="display:flex" aria-hidden="true"><v-stagepx [stage]="st.key" [scale]="3.5" /></span>
                  <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant)">{{ st.num }}</span>
                </div>
                <h3 style="font-family:var(--font-display);font-weight:600;font-size:17px;margin:16px 0 6px;color:var(--color-on-surface)">{{ st.label }}</h3>
                <p style="font-size:13.5px;line-height:1.5;color:var(--color-on-surface-variant);margin:0">{{ st.desc }}</p>
              </button>
              @if (st.hasArrow) {
                <span aria-hidden="true" style="position:absolute;top:42px;right:-15px;z-index:2;color:var(--color-border-interactive);display:flex"><v-icon name="arrow" [size]="18" /></span>
              }
            </li>
          }
        </ol>

        <div data-reveal style="margin-top:56px;display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:center;padding:36px;border-radius:20px;background:linear-gradient(120deg, var(--color-surface-2), color-mix(in srgb,var(--color-primary-fill) 12%, var(--color-surface-2)));border:1px solid var(--color-border);text-align:center">
          <div style="flex:1;min-width:240px;text-align:left">
            <h3 style="font-family:var(--font-display);font-weight:700;font-size:22px;margin:0">Ready to solve one?</h3>
            <p style="color:var(--color-on-surface-variant);margin:6px 0 0;font-size:15px">Feed Volt an inventive problem and watch the contradiction resolve.</p>
          </div>
          <button (click)="s.go('form')" class="lp-cta" style="display:inline-flex;align-items:center;gap:10px;height:50px;padding:0 26px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:13px;cursor:pointer;font-size:16px;font-weight:600;box-shadow:var(--shadow-2)">Start solving <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
        </div>
      </div>

      <footer style="border-top:1px solid var(--color-border)">
        <div style="max-width:1280px;margin:0 auto;padding:32px 24px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;color:var(--color-on-surface-variant);font-size:13px">
          <div style="display:flex;align-items:center;gap:10px"><span style="display:flex" aria-hidden="true"><v-mini [scale]="2.6" /></span><span style="font-family:var(--font-display);font-weight:700;letter-spacing:.14em;color:var(--color-on-surface)">VOLT</span><span>· Inventive Reasoning Engine</span></div>
          <div style="font-family:var(--font-mono)">Team Contradiction · Hackathon 2026</div>
        </div>
      </footer>
    </section>
  `,
})
export class VoltLanding {
  readonly s = inject(VoltState);

  // orbit nodes for the reasoning-core hero visual (1:1 with prototype renderVals)
  readonly orbitNodes = [
    'var(--color-primary-fill)',
    'var(--color-accent-fill)',
    'var(--color-primary)',
    'var(--color-info)',
    'var(--color-secondary)',
  ].map((color, i) => ({ deg: i * 72, negdeg: -(i * 72), color }));

  // how-it-works cards, derived from the shared stage data
  readonly howSteps = this.s.stagesRaw.map((st, i) => ({
    key: st.key,
    num: '0' + (i + 1),
    label: st.label,
    desc: st.desc,
    hasArrow: i < this.s.stagesRaw.length - 1,
  }));

  stepGo(i: number) {
    if (i === 0) {
      this.s.go('form');
    } else {
      this.s.activeStage.set(i);
      this.s.go('workspace');
    }
  }
}
