import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { VoltState } from '../core/volt-state';
import { VIcon } from '../core/icons';
import { VMascot } from '../core/mascot';

// PAGE C — REPORT. Ported 1:1 from the Volt prototype (volt-template.html, lines 929–1164).

interface CandVM {
  id: string;
  method: string;
  m: 'triz' | 'm2';
  title: string;
  principle: string;
  total: number;
  summary: string;
  reasoning: string;
  isWinner: boolean;
  border: string;
  badgeBg: string;
  badgeColor: string;
  badgeBorder: string;
  badgeRadius: string;
  badgeIconName: string;
}

interface MatrixCell {
  score: number;
  pct: string;
  barColor: string;
  numColor: string;
}

interface MatrixRow {
  title: string;
  isWinner: boolean;
  total: number;
  dot: string;
  rowBg: string;
  totalColor: string;
  cells: MatrixCell[];
}

interface WhyTrailItem {
  num: number;
  q: string;
  a: string;
  isRoot: boolean;
}

@Component({
  selector: 'volt-report',
  standalone: true,
  imports: [VIcon, VMascot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .rp-hb:hover {
        border-color: var(--color-border-interactive) !important;
      }
      .rp-hp:hover {
        border-color: var(--color-primary) !important;
      }
      .rp-bright:hover {
        filter: brightness(1.08) !important;
      }
      .rp-zip:hover {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-mascot-accent) 25%, transparent) !important;
      }
    `,
  ],
  template: `
    <section aria-labelledby="rep-h" style="max-width:880px;margin:0 auto;padding:clamp(32px,5vw,72px) 24px 110px">
      <div data-reveal="" style="text-align:center;padding-bottom:36px;border-bottom:1px solid var(--color-border);margin-bottom:44px">
        <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:.18em;color:var(--color-primary);font-weight:600">SOLUTION REPORT · PROBLEM 7</div>
        <h1 id="rep-h" style="font-family:var(--font-display);font-weight:700;font-size:clamp(30px,5vw,52px);letter-spacing:-.02em;margin:16px 0 12px">Keeping Buildings<br>Hot &amp; Cold</h1>
        <p style="color:var(--color-on-surface-variant);font-size:16px;max-width:52ch;margin:0 auto">A structured resolution of the adaptivity-vs-durability contradiction, generated and evaluated by two independent methods.</p>
        <div style="display:inline-flex;flex-wrap:wrap;gap:10px;margin-top:22px;justify-content:center">
          <span style="padding:6px 13px;border-radius:999px;background:var(--color-surface-2);border:1px solid var(--color-border);font-size:12.5px;font-weight:600;color:var(--color-on-surface-variant)">SDG 13 Climate Action</span>
          <span style="padding:6px 13px;border-radius:999px;background:var(--color-surface-2);border:1px solid var(--color-border);font-size:12.5px;font-weight:600;color:var(--color-on-surface-variant)">SDG 11 Sustainable Cities</span>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:56px">

        <!-- 1 · PROBLEM STATEMENT -->
        <article data-reveal="">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);letter-spacing:.08em">SECTION 01</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em;margin:4px 0 14px;color:var(--color-on-surface)">Problem statement</h2>
          <p style="font-size:16px;line-height:1.7;color:var(--color-on-surface);margin:0 0 14px">Buildings must maintain a comfortable interior temperature across extreme and rapidly swinging exterior conditions, while cutting the energy and emissions spent doing so — a challenge sitting squarely on SDG 13 and SDG 11.</p>
          <dl style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;margin:0;font-size:14px">
            <dt style="color:var(--color-on-surface-variant)">Domain</dt><dd style="margin:0;font-weight:600">Built environment · HVAC</dd>
            <dt style="color:var(--color-on-surface-variant)">Constraints</dt><dd style="margin:0;font-weight:600">Retrofittable, &lt; 5yr payback</dd>
          </dl>
        </article>

        <!-- 2 · TRIZ BRANCH -->
        <article data-reveal="">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);letter-spacing:.08em">SECTION 02 · AUTOMATIC BRANCH</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em;margin:4px 0 14px;color:var(--color-on-surface)">TRIZ trail</h2>
          <p style="font-size:15px;line-height:1.65;color:var(--color-on-surface-variant);margin:0 0 20px;max-width:64ch">Fully automatic: the problem was reformulated as a technical contradiction, resolved through the 39×39 contradiction matrix (pytriz), and the suggested inventive principles were instantiated into candidates.</p>

          <div style="background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:24px;box-shadow:var(--shadow-1);margin-bottom:20px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px"><span style="color:var(--color-primary);display:flex"><v-icon name="contra" [size]="18" /></span><h3 style="font-family:var(--font-display);font-weight:600;font-size:18px;margin:0;color:var(--color-on-surface)">Formulated contradiction</h3></div>
            <div style="display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:stretch">
              <div style="border:1px solid color-mix(in srgb,var(--color-success) 45%,var(--color-border));background:color-mix(in srgb,var(--color-success) 10%, var(--color-surface-1));border-radius:14px;padding:16px">
                <div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--color-success)"><v-icon name="up" [size]="14" /> IMPROVING</div>
                <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);margin:10px 0 4px">TRIZ PARAM 35</div>
                <div style="font-weight:600;font-size:15px;line-height:1.35">Adaptability of the thermal envelope</div>
              </div>
              <div aria-hidden="true" style="display:grid;place-items:center;color:var(--color-on-surface-variant);font-family:var(--font-mono);font-weight:700">vs</div>
              <div style="border:1px solid color-mix(in srgb,var(--color-error) 45%,var(--color-border));background:color-mix(in srgb,var(--color-error) 9%, var(--color-surface-1));border-radius:14px;padding:16px">
                <div style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--color-error)"><v-icon name="down" [size]="14" /> WORSENING</div>
                <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);margin:10px 0 4px">TRIZ PARAM 16</div>
                <div style="font-weight:600;font-size:15px;line-height:1.35">Durability of the envelope material</div>
              </div>
            </div>
            <div style="margin-top:18px">
              <div style="font-size:12px;color:var(--color-on-surface-variant);margin-bottom:9px">Contradiction matrix output — suggested inventive principles</div>
              <div style="display:flex;flex-wrap:wrap;gap:8px">
                @for (p of s.principles; track $index) {
                  <span style="display:inline-flex;align-items:center;gap:7px;padding:6px 11px;border-radius:999px;background:var(--color-primary-container);color:var(--color-on-primary-container);font-size:12.5px;font-weight:600"><span style="font-family:var(--font-mono);opacity:.75">{{ p.num }}</span>{{ p.name }}</span>
                }
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
            @for (c of trizCandidates(); track $index) {
              <div style="background:var(--color-surface-1);border-radius:16px;padding:18px;box-shadow:var(--shadow-1);display:flex;flex-direction:column" [style.border]="'1px solid ' + c.border">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
                  <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;font-size:11.5px;font-weight:700;-webkit-user-select:none;user-select:none" [style.border-radius]="c.badgeRadius" [style.background]="c.badgeBg" [style.color]="c.badgeColor" [style.border]="'1.5px solid ' + c.badgeBorder"><span style="display:flex"><v-icon [name]="c.badgeIconName" [size]="13" /></span>{{ c.method }}</span>
                  <span style="font-family:var(--font-mono);font-size:11px;color:var(--color-on-surface-variant)">P{{ c.principle }}</span>
                </div>
                <h4 style="font-family:var(--font-display);font-weight:600;font-size:15.5px;margin:0 0 5px;color:var(--color-on-surface)">{{ c.title }}</h4>
                <p style="font-size:13px;line-height:1.5;color:var(--color-on-surface-variant);margin:0 0 12px">{{ c.summary }}</p>
                <button class="rp-hb" (click)="s.toggleExpand(c.id)" [attr.aria-expanded]="s.expanded()[c.id] ? 'true' : 'false'" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:space-between;gap:8px;width:100%;background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:9px;padding:8px 11px;cursor:pointer;color:var(--color-on-surface);font-weight:600;font-size:12.5px">
                  <span>Reasoning trace</span><span style="display:flex;transition:transform .2s" [style.transform]="s.expanded()[c.id] ? 'rotate(90deg)' : 'rotate(0deg)'"><v-icon name="chevron" [size]="16" /></span>
                </button>
                @if (s.expanded()[c.id]) {
                  <pre style="margin:10px 0 0;padding:12px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:9px;font-family:var(--font-mono);font-size:11.5px;line-height:1.55;color:var(--color-on-surface);white-space:pre-wrap;word-break:break-word">{{ c.reasoning }}</pre>
                  <button class="rp-hb" (click)="s.copyTrace(c.reasoning)" style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-on-surface);font-size:11.5px;font-weight:600;cursor:pointer"><v-icon name="copy" [size]="13" /> Copy raw output</button>
                }
              </div>
            }
          </div>
        </article>

        <!-- 3 · 5 WHYS BRANCH -->
        <article data-reveal="">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);letter-spacing:.08em">SECTION 03 · INTERACTIVE BRANCH</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em;margin:4px 0 14px;color:var(--color-on-surface)">5 Whys trail</h2>
          <p style="font-size:15px;line-height:1.65;color:var(--color-on-surface-variant);margin:0 0 20px;max-width:64ch">Interactive root-cause analysis: the user answered up to five iterative “why” questions; the AI generated each next question from the previous answer.</p>

          <ol style="list-style:none;margin:0 0 20px;padding:0;display:flex;flex-direction:column;gap:12px">
            @for (w of whyTrail(); track $index) {
              <li style="display:grid;grid-template-columns:auto 1fr;gap:14px;padding:16px;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:14px">
                <span style="width:30px;height:30px;border-radius:50%;background:var(--color-primary-container);color:var(--color-on-primary-container);display:grid;place-items:center;font-family:var(--font-mono);font-size:12.5px;font-weight:700;flex:none">{{ w.num }}</span>
                <span>
                  <span style="display:block;font-weight:600;font-size:14.5px;color:var(--color-on-surface)">{{ w.q }}</span>
                  <span style="display:block;font-size:13.5px;line-height:1.55;color:var(--color-on-surface-variant);margin-top:6px">{{ w.a }}</span>
                </span>
              </li>
            }
          </ol>

          <div style="background:linear-gradient(130deg, color-mix(in srgb,var(--color-mascot-accent) 12%,var(--color-surface-1)), var(--color-surface-1) 60%);border:1.5px solid color-mix(in srgb,var(--color-mascot-accent) 40%, var(--color-border));border-radius:16px;padding:20px;margin-bottom:20px">
            <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:var(--color-mascot-accent);color:var(--color-on-accent);font-size:12px;font-weight:700;margin-bottom:10px"><v-icon name="check" [size]="16" /> IDENTIFIED ROOT CAUSE · WHY 5</div>
            <p style="font-size:15px;line-height:1.65;color:var(--color-on-surface);margin:0">Adaptivity and durability are treated as properties of the <strong>same material layer</strong>. Decoupling them into separate functional layers dissolves the contradiction — which is exactly what the winning candidate does.</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">
            @for (c of m2Candidates(); track $index) {
              <div style="background:var(--color-surface-1);border-radius:16px;padding:18px;box-shadow:var(--shadow-1);display:flex;flex-direction:column" [style.border]="'1px solid ' + c.border">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
                  <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;font-size:11.5px;font-weight:700;-webkit-user-select:none;user-select:none" [style.border-radius]="c.badgeRadius" [style.background]="c.badgeBg" [style.color]="c.badgeColor" [style.border]="'1.5px solid ' + c.badgeBorder"><span style="display:flex"><v-icon [name]="c.badgeIconName" [size]="13" /></span>{{ c.method }}</span>
                  @if (c.isWinner) {
                    <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--color-success)"><v-icon name="trophy" [size]="15" /> WINNER</span>
                  }
                </div>
                <h4 style="font-family:var(--font-display);font-weight:600;font-size:15.5px;margin:0 0 5px;color:var(--color-on-surface)">{{ c.title }}</h4>
                <p style="font-size:13px;line-height:1.5;color:var(--color-on-surface-variant);margin:0 0 12px">{{ c.summary }}</p>
                <button class="rp-hb" (click)="s.toggleExpand(c.id)" [attr.aria-expanded]="s.expanded()[c.id] ? 'true' : 'false'" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:space-between;gap:8px;width:100%;background:var(--color-surface-2);border:1px solid var(--color-border);border-radius:9px;padding:8px 11px;cursor:pointer;color:var(--color-on-surface);font-weight:600;font-size:12.5px">
                  <span>Reasoning trace</span><span style="display:flex;transition:transform .2s" [style.transform]="s.expanded()[c.id] ? 'rotate(90deg)' : 'rotate(0deg)'"><v-icon name="chevron" [size]="16" /></span>
                </button>
                @if (s.expanded()[c.id]) {
                  <pre style="margin:10px 0 0;padding:12px;background:var(--color-bg);border:1px solid var(--color-border);border-radius:9px;font-family:var(--font-mono);font-size:11.5px;line-height:1.55;color:var(--color-on-surface);white-space:pre-wrap;word-break:break-word">{{ c.reasoning }}</pre>
                  <button class="rp-hb" (click)="s.copyTrace(c.reasoning)" style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:8px;border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-on-surface);font-size:11.5px;font-weight:600;cursor:pointer"><v-icon name="copy" [size]="13" /> Copy raw output</button>
                }
              </div>
            }
          </div>
        </article>

        <!-- 4 · MERGED POOL -->
        <article data-reveal="">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);letter-spacing:.08em">SECTION 04 · JOIN GATE</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em;margin:4px 0 14px;color:var(--color-on-surface)">Merged candidate pool</h2>
          <p style="font-size:15px;line-height:1.65;color:var(--color-on-surface-variant);margin:0 0 18px;max-width:64ch">Both branches delivered ≥3 candidates, passing the join gate. Six unique solutions entered evaluation.</p>
          <div style="border:1px solid var(--color-border);border-radius:16px;overflow:hidden">
            @for (c of candidates(); track $index) {
              <div style="display:flex;align-items:center;gap:14px;padding:13px 18px;background:var(--color-surface-1);border-bottom:1px solid var(--color-border)">
                <span style="display:inline-flex;align-items:center;gap:6px;padding:4px 10px;font-size:10.5px;font-weight:700;flex:none;-webkit-user-select:none;user-select:none" [style.border-radius]="c.badgeRadius" [style.background]="c.badgeBg" [style.color]="c.badgeColor" [style.border]="'1.5px solid ' + c.badgeBorder">{{ c.method }}</span>
                <span style="font-weight:600;font-size:14px;color:var(--color-on-surface)">{{ c.title }}</span>
                @if (c.isWinner) {
                  <span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--color-success)"><v-icon name="trophy" [size]="15" /> WINNER</span>
                }
                <span style="margin-left:auto;font-family:var(--font-mono);font-size:12.5px;font-weight:700;color:var(--color-on-surface-variant)">{{ c.total }}/25</span>
              </div>
            }
          </div>
        </article>

        <!-- 5 · EVALUATION MATRIX -->
        <article data-reveal="">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);letter-spacing:.08em">SECTION 05</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em;margin:4px 0 14px;color:var(--color-on-surface)">Evaluation matrix</h2>
          <div style="background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:22px;box-shadow:var(--shadow-1);overflow:hidden">
            <div style="overflow-x:auto">
              <table style="width:100%;border-collapse:collapse;min-width:640px;font-size:13.5px">
                <caption style="text-align:left;color:var(--color-on-surface-variant);font-size:12.5px;margin-bottom:12px">Candidates scored 1–5 per criterion. Winner marked with a trophy icon and “Winner” label — not colour alone.</caption>
                <thead>
                  <tr>
                    <th scope="col" style="text-align:left;padding:10px 12px;color:var(--color-on-surface-variant);font-weight:600;border-bottom:2px solid var(--color-border)">Solution</th>
                    @for (cr of s.criteria; track $index) {
                      <th scope="col" style="text-align:center;padding:10px 8px;color:var(--color-on-surface-variant);font-weight:600;border-bottom:2px solid var(--color-border);white-space:nowrap">{{ cr }}</th>
                    }
                    <th scope="col" style="text-align:center;padding:10px 12px;border-bottom:2px solid var(--color-border);font-weight:700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of matrix(); track $index) {
                    <tr [style.background]="row.rowBg">
                      <th scope="row" style="text-align:left;padding:12px;font-weight:600;border-bottom:1px solid var(--color-border)">
                        <span style="display:inline-flex;align-items:center;gap:8px"><span style="width:9px;height:9px;border-radius:3px" [style.background]="row.dot"></span>{{ row.title }}
                          @if (row.isWinner) {<span style="display:inline-flex;align-items:center;gap:4px;color:var(--color-success);font-size:11px;font-weight:700"><v-icon name="trophy" [size]="15" /> WINNER</span>}
                        </span>
                      </th>
                      @for (cell of row.cells; track $index) {
                        <td style="text-align:center;padding:12px 8px;border-bottom:1px solid var(--color-border)">
                          <span style="display:inline-flex;flex-direction:column;align-items:center;gap:4px">
                            <span style="font-weight:700;font-family:var(--font-mono)" [style.color]="cell.numColor">{{ cell.score }}</span>
                            <span aria-hidden="true" style="width:34px;height:5px;border-radius:3px;background:var(--color-surface-3);overflow:hidden"><span style="display:block;height:100%" [style.width]="cell.pct" [style.background]="cell.barColor"></span></span>
                          </span>
                        </td>
                      }
                      <td style="text-align:center;padding:12px;border-bottom:1px solid var(--color-border);font-weight:700;font-family:var(--font-mono);font-size:15px" [style.color]="row.totalColor">{{ row.total }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </article>

        <!-- 6 · SELECTED SOLUTION -->
        <article data-reveal="">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant);letter-spacing:.08em">SECTION 06</div>
          <h2 style="font-family:var(--font-display);font-weight:700;font-size:26px;letter-spacing:-.01em;margin:4px 0 14px;color:var(--color-on-surface)">Selected solution</h2>
          <div style="position:relative;overflow:hidden;border-radius:18px;border:1.5px solid color-mix(in srgb,var(--color-success) 40%, var(--color-border));background:linear-gradient(130deg, color-mix(in srgb,var(--color-success) 10%,var(--color-surface-1)), var(--color-surface-1) 60%);padding:26px;box-shadow:var(--shadow-1)">
            <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:14px">
              <span style="display:inline-flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:var(--color-success);color:#fff;font-size:12px;font-weight:700"><v-icon name="trophy" [size]="15" /> SELECTED SOLUTION</span>
              <span style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant)">Total 21/25 · 5 Whys branch · confidence 0.82</span>
            </div>
            <h3 style="font-family:var(--font-display);font-weight:700;font-size:clamp(22px,2.6vw,30px);letter-spacing:-.01em;margin:0 0 10px;color:var(--color-on-surface)">Aerogel–Vacuum Hybrid Panel</h3>
            <p style="font-size:15px;line-height:1.65;color:var(--color-on-surface);max-width:62ch;margin:0">Chosen for the strongest durability + emissions profile with a manufacturable retrofit path — and a direct answer to the identified root cause: it decouples adaptivity (switchable-vacuum control layer) from durability (static aerogel body) into separate functional layers. Its one weakness, moderate adaptivity, is closed by that control layer, borrowing the dynamism that made the TRIZ “Dynamic Segmentation” runner-up compelling.</p>
            <button class="rp-hp" (click)="inspectChoice($event)" style="margin-top:18px;display:inline-flex;align-items:center;gap:8px;background:var(--color-surface-1);border:1px solid var(--color-border-interactive);color:var(--color-on-surface);font-weight:600;font-size:13.5px;cursor:pointer;padding:10px 16px;border-radius:11px"><v-icon name="inspect" [size]="16" /> Inspect decision rationale</button>
          </div>
        </article>
      </div>

      <!-- EXPORT SECTION -->
      <div data-reveal="" style="margin-top:56px;padding:32px;border-radius:18px;background:var(--color-surface-2);border:1px solid var(--color-border)">
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between;margin-bottom:22px">
          <div>
            <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-primary);font-weight:600;letter-spacing:.08em">EXPORT REPORT</div>
            <div style="font-family:var(--font-display);font-weight:700;font-size:22px;margin-top:6px">Take the reasoning trail with you</div>
            <p style="color:var(--color-on-surface-variant);font-size:14px;margin:6px 0 0;max-width:52ch">Structured, reproducible artifacts — the same audit trail the pipeline generated.</p>
          </div>
          <span style="display:flex;flex:none"><v-mascot expr="idle" [scale]="4.6" [pulse]="true" [bob]="true" label="Volt handing you the report" /></span>
        </div>
        <div role="group" aria-label="Export formats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">
          <button class="rp-bright" (click)="s.exportPDF()" style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:14px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;cursor:pointer;text-align:left;font-family:inherit">
            <span style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.14);display:grid;place-items:center;flex:none"><v-icon name="pdf" [size]="20" /></span>
            <span><span style="display:block;font-size:14px;font-weight:700">PDF</span><span style="display:block;font-size:12px;opacity:.85;margin-top:2px">Presentable report</span></span>
          </button>
          <button class="rp-hp" (click)="s.exportJSON()" style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:14px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);cursor:pointer;text-align:left;font-family:inherit">
            <span style="width:36px;height:36px;border-radius:10px;background:var(--color-primary-container);color:var(--color-on-primary-container);display:grid;place-items:center;flex:none"><v-icon name="json" [size]="20" /></span>
            <span><span style="display:block;font-size:14px;font-weight:700">JSON</span><span style="display:block;font-size:12px;color:var(--color-on-surface-variant);margin-top:2px">Structured trail</span></span>
          </button>
          <button class="rp-hp" (click)="s.exportMD()" style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:14px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);cursor:pointer;text-align:left;font-family:inherit">
            <span style="width:36px;height:36px;border-radius:10px;background:var(--color-primary-container);color:var(--color-on-primary-container);display:grid;place-items:center;flex:none"><v-icon name="md" [size]="20" /></span>
            <span><span style="display:block;font-size:14px;font-weight:700">Markdown</span><span style="display:block;font-size:12px;color:var(--color-on-surface-variant);margin-top:2px">For docs &amp; wikis</span></span>
          </button>
          <button class="rp-zip" (click)="s.exportZIP()" style="display:flex;align-items:center;gap:12px;padding:16px;border-radius:14px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-mascot-accent);cursor:pointer;text-align:left;font-family:inherit">
            <span style="width:36px;height:36px;border-radius:10px;background:color-mix(in srgb, var(--color-mascot-accent) 22%, var(--color-surface-1));color:var(--color-mascot-accent);display:grid;place-items:center;flex:none"><v-icon name="zip" [size]="20" /></span>
            <span><span style="display:block;font-size:14px;font-weight:700">Download all (.zip)</span><span style="display:block;font-size:12px;color:var(--color-on-surface-variant);margin-top:2px">PDF + JSON + Markdown</span></span>
          </button>
        </div>
        <div style="margin-top:22px;padding-top:22px;border-top:1px solid var(--color-border);display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between">
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--color-on-surface-variant)">END OF REPORT · reviewed and reproducible</div>
          <button class="rp-hp" (click)="s.go('workspace')" style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 20px;background:transparent;color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:11px;cursor:pointer;font-weight:600;font-size:14px">Open in workspace <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
        </div>
      </div>
    </section>
  `,
})
export class VoltReport {
  readonly s = inject(VoltState);

  // View models — ported 1:1 from the prototype's renderVals.
  readonly candidates = computed<CandVM[]>(() =>
    this.s.candRaw.map((c) => {
      const isTriz = c.m === 'triz';
      return {
        ...c,
        isWinner: c.id === 'm2-1',
        border:
          c.id === 'm2-1'
            ? 'color-mix(in srgb,var(--color-success) 42%,var(--color-border))'
            : 'var(--color-border)',
        badgeBg: isTriz ? 'var(--color-primary-fill)' : 'var(--color-primary-container)',
        badgeColor: isTriz ? 'var(--color-on-primary-fill)' : 'var(--color-on-primary-container)',
        badgeBorder: isTriz ? 'var(--color-primary-fill)' : 'var(--color-primary-container)',
        badgeRadius: '8px',
        badgeIconName: isTriz ? 'contra' : 'candidates',
      };
    })
  );
  readonly trizCandidates = computed<CandVM[]>(() =>
    this.candidates().filter((c) => c.m === 'triz')
  );
  readonly m2Candidates = computed<CandVM[]>(() => this.candidates().filter((c) => c.m === 'm2'));

  readonly matrix = computed<MatrixRow[]>(() =>
    this.s.candRaw.map((c) => {
      const sc = this.s.scores[c.id];
      const total = sc.reduce((a, b) => a + b, 0);
      const win = c.id === 'm2-1';
      const isTriz = c.m === 'triz';
      return {
        title: c.title,
        isWinner: win,
        total,
        dot: isTriz ? 'var(--color-primary-fill)' : 'var(--color-method2)',
        rowBg: win ? 'color-mix(in srgb,var(--color-success) 8%,transparent)' : 'transparent',
        totalColor: win ? 'var(--color-success)' : 'var(--color-on-surface)',
        cells: sc.map((v) => ({
          score: v,
          pct: (v / 5) * 100 + '%',
          barColor: 'var(--color-score-' + v + ')',
          numColor: 'var(--color-score-' + v + ')',
        })),
      };
    })
  );

  readonly whyTrail = computed<WhyTrailItem[]>(() =>
    this.s.whyQuestions.map((q, i) => ({
      num: i + 1,
      q,
      a: this.s.whyAnswers()[i] || this.s.whyDemoAnswers[i],
      isRoot: i === 4,
    }))
  );

  inspectChoice(e: Event) {
    e.stopPropagation();
    this.s.openInspector('choice');
  }
}
