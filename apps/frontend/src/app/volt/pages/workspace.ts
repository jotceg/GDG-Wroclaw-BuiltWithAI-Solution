import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { VoltState } from '../core/volt-state';
import { VIcon } from '../core/icons';
import { VMascot, VStagePx, VoltExpr } from '../core/mascot';

// Workspace page — ported 1:1 from the Volt prototype (PAGE B — WORKSPACE + inspector drawer).

type StageStatus = 'completed' | 'current' | 'running' | 'pending';

interface StageCfg {
  dot: string;
  pipBg: string;
  pipColor: string;
  statusColor: string;
  statusLabel: string;
  statusIcon: string;
  cardBorder: string;
  cardBg: string;
}

// Exact status config from the prototype's renderVals (statusIcon = icon name, rendered at 13px).
const STATUS_CFG: Record<StageStatus, StageCfg> = {
  completed: {
    dot: 'var(--color-primary)',
    pipBg: 'var(--color-primary-container)',
    pipColor: 'var(--color-on-primary-container)',
    statusColor: 'var(--color-primary)',
    statusLabel: 'Completed',
    statusIcon: 'check',
    cardBorder: 'var(--color-border)',
    cardBg: 'var(--color-surface-1)',
  },
  current: {
    dot: 'var(--color-accent-fill)',
    pipBg: 'var(--color-primary-fill)',
    pipColor: 'var(--color-on-primary-fill)',
    statusColor: 'var(--color-primary)',
    statusLabel: 'Focused',
    statusIcon: 'inspect',
    cardBorder: 'var(--color-primary)',
    cardBg: 'var(--color-surface-1)',
  },
  running: {
    dot: 'var(--color-accent-fill)',
    pipBg: 'var(--color-primary-fill)',
    pipColor: 'var(--color-on-primary-fill)',
    statusColor: 'var(--color-mascot-accent)',
    statusLabel: 'Reasoning…',
    statusIcon: 'core',
    cardBorder: 'var(--color-primary)',
    cardBg: 'var(--color-surface-1)',
  },
  pending: {
    dot: 'var(--color-border-interactive)',
    pipBg: 'var(--color-surface-2)',
    pipColor: 'var(--color-on-surface-variant)',
    statusColor: 'var(--color-on-surface-variant)',
    statusLabel: 'Pending',
    statusIcon: 'core',
    cardBorder: 'var(--color-border)',
    cardBg: 'var(--color-surface-1)',
  },
};

interface StageVM extends StageCfg {
  key: string;
  index: number;
  num: string;
  label: string;
  isRunning: boolean;
  current: string;
  isChoice: boolean;
  ariaLabel: string;
}

const TRIZ_SUBS_RAW = [
  { label: 'Formulating contradiction…', doneLabel: 'Contradiction formulated' },
  {
    label: 'Applying contradiction matrix (39×39, pytriz)…',
    doneLabel: 'Matrix applied · principles [35, 15, 1, 40]',
  },
  { label: 'Instantiating principles into candidates…', doneLabel: '5 candidates instantiated' },
];

@Component({
  selector: 'volt-workspace',
  standalone: true,
  imports: [VIcon, VMascot, VStagePx],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .ws-surf:hover {
        background: var(--color-surface-2) !important;
      }
      .ws-brt:hover {
        filter: brightness(1.08) !important;
      }
      .ws-stage:hover {
        border-color: var(--color-primary) !important;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-primary-fill) 12%, transparent) !important;
      }
      .ws-chip:hover {
        filter: brightness(1.12) !important;
      }
      .ws-stuck:hover {
        border-color: var(--color-border-interactive) !important;
        color: var(--color-on-surface) !important;
      }
      .ws-prim:hover {
        border-color: var(--color-primary) !important;
      }
      .ws-demo:hover {
        color: var(--color-on-surface) !important;
      }
      .ws-choice:hover {
        border-color: var(--color-success) !important;
        box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-success) 20%, transparent) !important;
      }
      .ws-bic:hover {
        border-color: var(--color-border-interactive) !important;
      }
    `,
  ],
  template: `
    <!-- ================= PAGE B — WORKSPACE ================= -->
    <section aria-labelledby="ws-h" style="max-width:1280px;margin:0 auto;padding:28px 24px 96px">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;justify-content:space-between;margin-bottom:22px">
        <div style="display:flex;align-items:center;gap:16px">
          <span style="display:flex;flex:none" role="img" [attr.aria-label]="wsMascotLabel()"><v-mascot [expr]="wsMascotExpr()" [scale]="4" [pulse]="true" [bob]="true" [label]="wsMascotLabel()" /></span>
          <div>
            <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:.12em;color:var(--color-on-surface-variant)">PROBLEM 7 · SDG 13 · SDG 11</div>
            <h1 id="ws-h" style="font-family:var(--font-display);font-weight:700;font-size:clamp(24px,3vw,34px);letter-spacing:-.02em;margin:6px 0 0">Keeping Buildings Hot &amp; Cold</h1>
          </div>
        </div>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:14px;box-shadow:var(--shadow-1)">
          <button class="ws-surf" (click)="s.simulateRun()" [attr.aria-disabled]="s.running()" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;background:transparent;color:var(--color-on-surface);border:none;border-radius:10px;font-weight:600;font-size:14px">
            <span style="display:flex;color:var(--color-mascot-accent)"><v-icon [name]="runIcon()" [size]="15" /></span>{{ runLabel() }}
          </button>
          <span aria-hidden="true" style="width:1px;height:24px;background:var(--color-border)"></span>
          <button class="ws-brt" (click)="s.go('report')" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 20px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:10px;font-weight:600;font-size:14px">View report <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
        </div>
      </div>

      <!-- STEPPER -->
      <div role="list" aria-label="Reasoning pipeline" style="position:relative;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:22px 20px;box-shadow:var(--shadow-1);overflow:hidden">
        <div aria-hidden="true" style="position:absolute;top:0;bottom:0;width:34%;pointer-events:none;transform:translateX(-50%);transition:left .4s ease" [style.left]="s.glowLeft()" [style.background]="'radial-gradient(60% 80% at 50% 40%, rgba(var(--glow),' + s.glowAlpha() + '), transparent 70%)'"></div>
        <div style="position:relative;display:grid;grid-template-columns:repeat(5,1fr);gap:10px">
          @for (st of stages(); track $index) {
            <button class="ws-stage" role="listitem" (click)="s.activeStage.set(st.index)" [attr.aria-current]="st.current" [attr.aria-label]="st.ariaLabel" style="position:relative;text-align:left;border-radius:14px;padding:14px 14px 16px;cursor:pointer;transition:border-color .2s,background .2s,box-shadow .2s;display:flex;flex-direction:column;gap:10px;min-height:112px" [style.background]="st.cardBg" [style.border]="'1.5px solid ' + st.cardBorder">
              <div style="display:flex;align-items:center;justify-content:space-between">
                <span style="width:34px;height:34px;border-radius:10px;display:grid;place-items:center" [style.background]="st.pipBg" [style.color]="st.pipColor"><v-stagepx [stage]="st.key" [scale]="3" /></span>
                <span style="position:relative;width:12px;height:12px;flex:none">
                  @if (st.isRunning) {
                    <span aria-hidden="true" style="position:absolute;inset:-4px;border-radius:50%;background:radial-gradient(circle,var(--color-accent-fill),transparent 65%);animation:praxis-pulse-strong 1.8s ease-in-out infinite"></span>
                  }
                  <span style="position:absolute;inset:0;border-radius:50%" [style.background]="st.dot"></span>
                </span>
              </div>
              <div>
                <div style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant)">{{ st.num }}</div>
                <div style="font-family:var(--font-display);font-weight:600;font-size:15px;margin-top:2px;color:var(--color-on-surface)">{{ st.label }}</div>
                <div style="display:inline-flex;align-items:center;gap:5px;margin-top:8px;font-size:11.5px;font-weight:600" [style.color]="st.statusColor">
                  <span style="display:flex"><v-icon [name]="st.statusIcon" [size]="13" /></span>{{ st.statusLabel }}
                </div>
              </div>
              @if (st.isChoice) {
                <span aria-hidden="true" style="position:absolute;bottom:12px;right:12px;width:34px;height:34px;border-radius:50%;background:var(--color-primary-fill);color:var(--color-on-primary-fill);display:grid;place-items:center;box-shadow:0 0 0 4px color-mix(in srgb, var(--color-primary-fill) 22%, transparent)"><v-icon name="arrow" [size]="18" /></span>
              }
            </button>
          }
        </div>
      </div>

      <!-- CONTENT GRID -->
      <div style="margin-top:24px;display:grid;grid-template-columns:minmax(0,1fr);gap:24px">

        <!-- STAGE VIEW 01 · PROBLEM -->
        @if (s.activeStage() === 0) {
          <div data-reveal="" style="background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:24px;box-shadow:var(--shadow-1);max-width:640px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span style="color:var(--color-primary);display:flex"><v-icon name="problem" [size]="18" /></span><h2 style="font-family:var(--font-display);font-weight:600;font-size:18px;margin:0;color:var(--color-on-surface)">Problem submitted</h2></div>
            <p style="font-size:15px;line-height:1.6;color:var(--color-on-surface);margin:0 0 16px">Buildings must hold a comfortable internal temperature across extreme and rapidly swinging external conditions, while cutting energy use and emissions.</p>
            <dl style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;margin:0;font-size:13.5px">
              <dt style="color:var(--color-on-surface-variant)">Domain</dt><dd style="margin:0;font-weight:600">Built environment · HVAC</dd>
              <dt style="color:var(--color-on-surface-variant)">Goals</dt><dd style="margin:0;font-weight:600">SDG 13 Climate · SDG 11 Cities</dd>
              <dt style="color:var(--color-on-surface-variant)">Constraint</dt><dd style="margin:0;font-weight:600">Retrofittable, &lt; 5yr payback</dd>
            </dl>
            <button (click)="s.openInspector('problem')" style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;background:none;border:none;color:var(--color-primary);font-weight:600;font-size:13.5px;cursor:pointer;padding:6px 2px"><v-icon name="inspect" [size]="16" /> Inspect raw step</button>
          </div>
        }

        <!-- STAGE VIEW 02 · PARALLEL ANALYSIS COCKPIT -->
        @if (s.activeStage() === 1) {
          <div data-reveal="" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start">

            <!-- LEFT: 5 Whys interactive -->
            <div style="background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:22px;box-shadow:var(--shadow-1)">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:10px"><span style="color:var(--color-primary);display:flex"><v-icon name="inspect" [size]="16" /></span><h2 style="font-family:var(--font-display);font-weight:600;font-size:17px;margin:0;color:var(--color-on-surface)">5 Whys <span style="font-size:12px;font-weight:400;color:var(--color-on-surface-variant)">· interactive</span></h2></div>
                <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant)">{{ s.whyProgress() }}</span>
              </div>
              <div style="display:flex;gap:6px;margin-bottom:18px" role="list" aria-label="5 Whys progress">
                @for (w of whyTimeline(); track $index) {
                  <button class="ws-chip" role="listitem" (click)="w.answered && s.whyBack(w.i)" [attr.aria-disabled]="w.isDisabled" [attr.aria-current]="w.isCurrent" [title]="w.label" style="width:34px;height:34px;border-radius:50%;border:none;display:grid;place-items:center;flex:none;color:var(--color-on-primary-fill);font-size:12px;font-weight:700;font-family:var(--font-mono);cursor:pointer" [style.background]="w.dotColor">
                    @if (w.answered) {<v-icon name="check" [size]="16" />}
                    @if (w.isCurrent) {{{ w.num }}}
                    @if (w.isDisabled) {<span style="color:var(--color-on-surface)">{{ w.num }}</span>}
                  </button>
                }
                <span style="display:flex;align-items:center;margin-left:auto" data-volt=""><v-mascot [expr]="whyMascotExpr()" [scale]="4.4" [pulse]="true" [bob]="false" /></span>
              </div>
              @if (s.whyDone()) {
                <div style="padding:16px;border-radius:12px;background:color-mix(in srgb,var(--color-mascot-accent) 12%,var(--color-surface-1));border:1.5px solid color-mix(in srgb,var(--color-mascot-accent) 40%,var(--color-border));margin-bottom:12px">
                  <div style="display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--color-secondary)"><v-icon name="check" [size]="16" /> ROOT CAUSE REACHED AT WHY {{ whyCurrentNum() }}</div>
                  <p style="font-size:13.5px;line-height:1.55;color:var(--color-on-surface);margin:10px 0 0">{{ whyCurrentAnswer() }}</p>
                </div>
                <div style="display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--color-on-surface)"><span style="display:flex;color:var(--color-secondary)"><v-icon name="check" [size]="16" /></span>{{ whyGenLabel() }}</div>
              }
              @if (!s.whyDone()) {
                <div style="display:inline-flex;align-items:center;gap:8px;padding:5px 11px;border-radius:999px;background:var(--color-primary-container);color:var(--color-on-primary-container);font-family:var(--font-mono);font-size:11.5px;font-weight:700;margin-bottom:10px">WHY {{ whyCurrentNum() }}</div>
                <h3 style="font-family:var(--font-display);font-weight:600;font-size:17px;margin:0 0 12px;line-height:1.4;color:var(--color-on-surface)">{{ whyCurrent() }}</h3>
                <textarea aria-label="Your answer" [value]="whyCurrentAnswer()" (input)="whySetAnswer($any($event.target).value)" rows="3" placeholder="Type your analysis of this why…" style="width:100%;padding:12px;background:var(--color-bg);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:11px;font-size:14px;line-height:1.5;resize:vertical;font-family:var(--font-body)"></textarea>
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                  <button class="ws-brt" (click)="whySubmit()" style="height:42px;padding:0 18px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:10px;font-weight:600;font-size:13.5px;cursor:pointer;display:inline-flex;align-items:center;gap:8px">{{ whySubmitLabel() }} <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
                  @if (whyIsEditing()) {
                    <button class="ws-surf" (click)="s.whyBackToCurrent()" style="height:42px;padding:0 14px;background:transparent;color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:10px;font-weight:600;font-size:13px;cursor:pointer">Back to current</button>
                  }
                  @if (showStuck()) {
                    <button class="ws-stuck" (click)="s.whySuggest()" style="height:42px;padding:0 14px;background:transparent;color:var(--color-on-surface-variant);border:1.5px solid var(--color-border);border-radius:10px;font-size:13px;font-weight:600;cursor:pointer">I'm stuck — suggest hypotheses</button>
                  }
                </div>
                @if (s.whySuggestions(); as sugg) {
                  <div style="margin-top:14px;padding:14px;background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:12px">
                    <div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:var(--color-on-surface-variant);margin-bottom:10px">SUGGESTED HYPOTHESES · grounded via web search</div>
                    <div style="display:flex;flex-direction:column;gap:7px">
                      @for (h of sugg; track $index) {
                        <button class="ws-prim" (click)="s.whyPickSuggestion(h)" style="display:flex;align-items:center;gap:9px;padding:10px 12px;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:9px;cursor:pointer;text-align:left;color:var(--color-on-surface);font-size:13px;line-height:1.45">
                          <span style="display:flex;flex:none;color:var(--color-primary)"><v-icon name="arrow" [size]="18" /></span>{{ h }}
                        </button>
                      }
                    </div>
                  </div>
                }
                <button class="ws-demo" (click)="s.whyFillDemo()" style="margin-top:12px;background:none;border:none;color:var(--color-on-surface-variant);font-size:12px;font-weight:600;cursor:pointer;padding:4px 2px;text-decoration:underline">Load demo answers</button>
              }
            </div>

            <!-- RIGHT: TRIZ automatic -->
            <div style="background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:22px;box-shadow:var(--shadow-1)">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px">
                <div style="display:flex;align-items:center;gap:10px"><span style="color:var(--color-primary);display:flex"><v-icon name="contra" [size]="18" /></span><h2 style="font-family:var(--font-display);font-weight:600;font-size:17px;margin:0;color:var(--color-on-surface)">TRIZ <span style="font-size:12px;font-weight:400;color:var(--color-on-surface-variant)">· automatic</span></h2></div>
                @if (s.trizDone()) {
                  <span style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:color-mix(in srgb,var(--color-success) 14%,var(--color-surface-1));color:var(--color-success);font-size:11.5px;font-weight:700"><v-icon name="check" [size]="16" /> TRIZ COMPLETE</span>
                }
              </div>
              <ol style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:4px">
                @for (sub of trizSubs(); track $index) {
                  <li style="position:relative;display:flex;align-items:flex-start;gap:14px;padding:14px 12px;border-radius:12px">
                    <span style="position:relative;width:14px;height:14px;flex:none;margin-top:3px">
                      @if (sub.activeSub) {
                        <span aria-hidden="true" style="position:absolute;inset:-6px;border-radius:50%;background:radial-gradient(circle,var(--color-accent-fill),transparent 65%);animation:praxis-pulse-strong 1.8s ease-in-out infinite"></span>
                      }
                      <span style="position:absolute;inset:0;border-radius:50%;display:grid;place-items:center" [style.background]="sub.dotColor">
                        @if (sub.done) {<span style="color:var(--color-on-primary-fill);display:flex"><v-icon name="check" [size]="9" /></span>}
                      </span>
                    </span>
                    <span>
                      <span style="display:block;font-family:var(--font-mono);font-size:10.5px;letter-spacing:.08em;color:var(--color-on-surface-variant)">SUB-STAGE {{ sub.num }}</span>
                      <span style="display:block;font-size:14px;font-weight:600;margin-top:3px" [style.color]="sub.textColor">{{ sub.label }}</span>
                      @if (sub.counter) {
                        <span style="display:inline-block;margin-top:5px;font-family:var(--font-mono);font-size:11.5px;padding:3px 8px;border-radius:6px;background:var(--color-surface-2);color:var(--color-on-surface-variant)">{{ sub.counter }}</span>
                      }
                    </span>
                  </li>
                }
              </ol>
              <p style="margin:14px 0 0;padding-top:14px;border-top:1px solid var(--color-border);font-size:12.5px;line-height:1.5;color:var(--color-on-surface-variant)">Process only — the formulated contradiction, matrix output and candidate details land in the <a href="#" (click)="$event.preventDefault(); s.go('report')" style="color:var(--color-primary);font-weight:600">Final Report</a>.</p>
            </div>
          </div>

          <!-- JOIN GATE -->
          <div data-reveal="" style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;justify-content:space-between;padding:18px 22px;border-radius:16px;background:var(--color-surface-1);box-shadow:var(--shadow-1)" [style.border]="'1.5px solid ' + joinBorder()">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="position:relative;width:14px;height:14px;flex:none">
                @if (!s.joinPassed()) {
                  <span aria-hidden="true" style="position:absolute;inset:-5px;border-radius:50%;background:radial-gradient(circle,rgba(var(--glow),.7),transparent 65%);animation:praxis-pulse 1.8s ease-in-out infinite"></span>
                }
                <span style="position:absolute;inset:0;border-radius:50%" [style.background]="joinDot()"></span>
              </span>
              <div>
                <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;color:var(--color-on-surface-variant)">JOIN GATE · ≥3 CANDIDATES PER BRANCH</div>
                <div style="font-size:14px;font-weight:600;margin-top:3px;color:var(--color-on-surface)">{{ s.joinLabel() }}</div>
              </div>
            </div>
            @if (s.joinPassed()) {
              <button class="ws-brt" (click)="s.activeStage.set(2)" style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 20px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:11px;cursor:pointer;font-weight:600;font-size:14px">Continue to Merged Candidates <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
            }
          </div>
        }

        <!-- STAGE VIEW 03 · MERGED CANDIDATES (lean) -->
        @if (s.activeStage() === 2) {
          <div data-reveal="" style="text-align:center;padding:56px 24px;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;box-shadow:var(--shadow-1)">
            <span style="display:inline-flex;margin-bottom:18px" role="img" aria-label="Volt celebrating"><v-mascot [expr]="wsMascotExpr()" [scale]="4" [pulse]="true" [bob]="true" [label]="wsMascotLabel()" /></span>
            <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0 0 8px;color:var(--color-on-surface)">6 candidates ready</h2>
            <p style="color:var(--color-on-surface-variant);font-size:15px;margin:0 auto 24px;max-width:44ch">Merged pool: 3 from TRIZ inventive principles + 3 from the 5 Whys root cause. Full details in the report.</p>
            <div style="display:inline-flex;gap:10px">
              <button class="ws-brt" (click)="s.activeStage.set(3)" style="display:inline-flex;align-items:center;gap:9px;height:48px;padding:0 24px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:12px;cursor:pointer;font-weight:600;font-size:15px">Evaluate now <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
              <button class="ws-surf" (click)="s.go('report')" style="height:48px;padding:0 20px;background:transparent;color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:12px;cursor:pointer;font-weight:600;font-size:14px">Preview in report</button>
            </div>
          </div>
        }

        <!-- STAGE VIEW 04 · EVALUATION (progress) -->
        @if (s.activeStage() === 3) {
          <div data-reveal="" style="text-align:center;padding:56px 24px;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;box-shadow:var(--shadow-1)">
            <span style="display:inline-flex;margin-bottom:18px" role="img" aria-label="Volt evaluating candidates"><v-mascot [expr]="evalMascotExpr()" [scale]="4" [pulse]="true" [bob]="true" /></span>
            <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;margin:0 0 8px;color:var(--color-on-surface)">Scoring 6 candidates × 5 criteria</h2>
            <p style="color:var(--color-on-surface-variant);font-size:15px;margin:0 auto 20px;max-width:44ch">Adaptivity · Durability · Emissions · Cost · Manufacturability, scored 1–5. The full matrix lands in the report.</p>
            <div aria-hidden="true" style="width:min(360px,80%);height:6px;margin:0 auto 24px;border-radius:3px;background:var(--color-surface-3);overflow:hidden"><span style="display:block;height:100%;width:100%;border-radius:3px;background:linear-gradient(90deg,var(--color-primary-fill),var(--color-accent-fill));background-size:200% 100%;animation:praxis-shimmer 1.6s linear infinite"></span></div>
            <button class="ws-brt" (click)="s.activeStage.set(4)" style="display:inline-flex;align-items:center;gap:9px;height:48px;padding:0 24px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:12px;cursor:pointer;font-weight:600;font-size:15px">See selected solution <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
          </div>
        }

        <!-- STAGE VIEW 05 · SELECTED SOLUTION -->
        @if (s.activeStage() === 4) {
          <!-- Final choice — clickable card leading to Final Report -->
          <button class="ws-choice" data-reveal="" (click)="s.go('report')" aria-label="Open the Final Report for the winning solution" style="display:block;text-align:left;width:100%;position:relative;overflow:hidden;border-radius:18px;border:1.5px solid color-mix(in srgb,var(--color-success) 40%, var(--color-border));background:linear-gradient(130deg, color-mix(in srgb,var(--color-success) 10%,var(--color-surface-1)), var(--color-surface-1) 60%);padding:26px;box-shadow:var(--shadow-1);cursor:pointer;transition:box-shadow .2s,border-color .2s">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:14px">
              <span style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:var(--color-success);color:#fff;font-size:12px;font-weight:700"><v-icon name="trophy" [size]="15" /> SELECTED SOLUTION</span>
              <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant)">Total 21/25 · Method 2</span>
              <span aria-hidden="true" style="margin-left:auto;display:inline-flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--color-primary)">Open in report <v-icon name="arrow" [size]="18" /></span>
            </div>
            <h2 style="font-family:var(--font-display);font-weight:700;font-size:clamp(22px,2.6vw,30px);letter-spacing:-.01em;margin:0 0 10px;color:var(--color-on-surface)">Aerogel–Vacuum Hybrid Panel</h2>
            <p style="font-size:15px;line-height:1.65;color:var(--color-on-surface);max-width:62ch;margin:0">Chosen for the strongest durability + emissions profile with a manufacturable retrofit path. Its one weakness — moderate adaptivity — is closed by pairing the static super-insulation with a switchable-vacuum control layer, borrowing the dynamism that made the TRIZ “Dynamic Segmentation” runner-up compelling. The reasoning trail from contradiction to choice is preserved for audit.</p>
            <span class="ws-prim" (click)="$event.stopPropagation(); s.openInspector('choice')" role="button" tabindex="0" style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;background:var(--color-surface-1);border:1px solid var(--color-border-interactive);color:var(--color-on-surface);font-weight:600;font-size:13.5px;cursor:pointer;padding:10px 16px;border-radius:11px"><v-icon name="inspect" [size]="16" /> Inspect decision rationale</span>
          </button>
        }
      </div>
    </section>

    <!-- ================= INSPECTOR DRAWER ================= -->
    @if (s.inspectorOpen()) {
      <div (click)="s.closeInspector()" style="position:fixed;inset:0;z-index:60;background:rgba(6,5,12,.55);backdrop-filter:blur(2px)"></div>
      <aside role="dialog" aria-modal="true" aria-label="Step inspector" style="position:fixed;top:0;right:0;bottom:0;z-index:61;width:min(460px,92vw);background:var(--color-surface-1);border-left:1px solid var(--color-border);box-shadow:var(--shadow-3);display:flex;flex-direction:column">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid var(--color-border)">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="width:34px;height:34px;border-radius:9px;background:var(--color-primary-container);color:var(--color-on-primary-container);display:grid;place-items:center"><v-icon [name]="s.inspectorStage()" [size]="18" /></span>
            <div><div style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant)">{{ inspect().num }}</div><div style="font-family:var(--font-display);font-weight:600;font-size:16px">{{ inspect().title }}</div></div>
          </div>
          <button class="ws-bic" (click)="s.closeInspector()" aria-label="Close inspector" style="width:40px;height:40px;border-radius:10px;border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-on-surface);cursor:pointer;display:grid;place-items:center"><v-icon name="close" [size]="18" /></button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:20px">
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><span style="font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--color-on-surface-variant)">INPUT</span></div>
            <pre style="margin:0;padding:14px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:11px;font-family:var(--font-mono);font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:var(--color-on-surface)">{{ inspect().input }}</pre>
          </div>
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--color-on-surface-variant)">OUTPUT</span>
              <button class="ws-bic" (click)="s.copyOutput()" style="display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-on-surface);font-size:12px;font-weight:600;cursor:pointer"><v-icon [name]="s.copied() ? 'check' : 'copy'" [size]="14" /> {{ s.copied() ? 'Copied' : 'Copy' }}</button>
            </div>
            <pre style="margin:0;padding:14px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:11px;font-family:var(--font-mono);font-size:12px;line-height:1.55;white-space:pre-wrap;word-break:break-word;color:var(--color-on-surface)">{{ inspect().output }}</pre>
          </div>
        </div>
      </aside>
    }
  `,
})
export class VoltWorkspace {
  readonly s = inject(VoltState);

  // ---- header (runLabel/runIcon + mascot, 1:1 with renderVals) ----
  readonly runLabel = computed(() => (this.s.running() ? 'Reasoning…' : 'Simulate run'));
  readonly runIcon = computed(() => (this.s.running() ? 'core' : 'play'));
  readonly wsMascotExpr = computed<VoltExpr>(() => (this.s.running() ? 'thinking' : 'aha'));
  readonly wsMascotLabel = computed(() =>
    this.s.running() ? 'Volt thinking — pipeline running' : 'Volt celebrating — solution chosen'
  );
  readonly evalMascotExpr = computed<VoltExpr>(() =>
    this.s.activeStage() === 3 && this.s.running() ? 'thinking' : 'working'
  );

  // ---- stepper view models (exact replica of renderVals stage status logic) ----
  readonly stages = computed<StageVM[]>(() => {
    const running = this.s.running();
    const active = this.s.activeStage();
    return this.s.stagesRaw.map((st, i) => {
      let status: StageStatus;
      if (running) {
        status = i < active ? 'completed' : i === active ? 'running' : 'pending';
      } else {
        status = 'completed';
        if (i === active) status = 'current';
      }
      if (!running && i > active) status = 'pending';
      const cfg = STATUS_CFG[status];
      return {
        key: st.key,
        index: i,
        num: 'STEP 0' + (i + 1),
        label: st.label,
        isRunning: status === 'running',
        current: status === 'current' ? 'step' : 'false',
        isChoice: st.key === 'choice',
        ariaLabel: 'View step ' + (i + 1) + ' — ' + st.label,
        ...cfg,
      };
    });
  });

  // ---- TRIZ sub-stages (1:1) ----
  readonly trizSubs = computed(() => {
    const ts = this.s.trizSub();
    const running = this.s.running();
    return TRIZ_SUBS_RAW.map((sub, i) => {
      const done = ts > i;
      const activeSub = ts === i && running;
      return {
        label: done ? sub.doneLabel : sub.label,
        done,
        activeSub,
        num: i + 1,
        dotColor: done
          ? 'var(--color-primary)'
          : activeSub
            ? 'var(--color-accent-fill)'
            : 'var(--color-border-interactive)',
        textColor: done
          ? 'var(--color-on-surface)'
          : activeSub
            ? 'var(--color-on-surface)'
            : 'var(--color-text-disabled)',
        counter: i === 2 && activeSub ? Math.min(this.s.trizCands(), 3) + '/5 candidates' : '',
      };
    });
  });

  // ---- join gate (1:1) ----
  readonly joinBorder = computed(() =>
    this.s.joinPassed()
      ? 'color-mix(in srgb,var(--color-success) 40%, var(--color-border))'
      : 'var(--color-border)'
  );
  readonly joinDot = computed(() =>
    this.s.joinPassed() ? 'var(--color-success)' : 'var(--color-accent-fill)'
  );

  // ---- 5 Whys timeline + flow bindings (1:1) ----
  readonly whyTimeline = computed(() => {
    const step = this.s.whyStep();
    const done = this.s.whyDone();
    const rootAt = this.s.whyRootAt();
    const editing = this.s.whyEditing();
    return this.s.whyQuestions.map((_q, i) => {
      const answered = i < step || (done && i <= rootAt);
      const isCurrent = !done && i === step && editing < 0;
      const isDisabled = !answered && !isCurrent;
      const rootHere = done && rootAt === i;
      return {
        i,
        num: i + 1,
        label: 'Why ' + (i + 1),
        answered,
        isCurrent,
        isDisabled,
        rootHere,
        dotColor: rootHere
          ? 'var(--color-mascot-accent)'
          : answered
            ? 'var(--color-primary)'
            : isCurrent
              ? 'var(--color-accent-fill)'
              : 'var(--color-border-interactive)',
      };
    });
  });

  private readonly whyIdx = computed(() =>
    this.s.whyEditing() >= 0 ? this.s.whyEditing() : this.s.whyStep()
  );
  readonly whyCurrent = computed(() => this.s.whyQuestions[this.whyIdx()] || '');
  readonly whyCurrentNum = computed(() => this.whyIdx() + 1);
  readonly whyCurrentAnswer = computed(() => this.s.whyAnswers()[this.whyIdx()] || '');
  readonly whyIsEditing = computed(() => this.s.whyEditing() >= 0);
  readonly whySubmitLabel = computed(() =>
    this.s.whyEditing() >= 0 ? 'Save edit' : this.s.whyDone() ? 'Done' : 'Continue'
  );
  readonly showStuck = computed(() => this.s.whyEditing() < 0 && !this.s.whyDone());
  readonly whyMascotExpr = computed<VoltExpr>(() =>
    this.s.whyDone() ? 'aha' : this.s.whyStep() > 2 ? 'thinking' : 'idle'
  );
  readonly whyGenLabel = computed(() =>
    this.s.whyDone()
      ? this.s.whyCands() >= 5
        ? '5 candidates generated ✓'
        : 'Generating ≥3 candidates from root cause…'
      : ''
  );

  whySetAnswer(v: string) {
    this.s.whyUpdateAnswer(this.whyIdx(), v);
  }
  whySubmit() {
    if (this.s.whyEditing() >= 0) this.s.whySaveEdit();
    else this.s.whyAnswer();
  }

  // ---- inspector (1:1) ----
  readonly inspect = computed(
    () => this.s.inspectData[this.s.inspectorStage()] || this.s.inspectData.problem
  );
}
