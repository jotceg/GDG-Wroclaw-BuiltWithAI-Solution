import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { VoltState } from '../core/volt-state';
import { VIcon } from '../core/icons';
import { VMascot } from '../core/mascot';

// SDG toggle chip definitions — ported 1:1 from the prototype's sdgDef (volt-template.html).
const SDG_DEF = [
  { v: 'SDG 13', name: 'Climate', d: 'M8 20l4-4 4 4M12 4v12M6 10c0-3 3-6 6-6s6 3 6 6' },
  { v: 'SDG 11', name: 'Cities', d: 'M4 20V10l4-3v13M12 20V6l4-2v16M20 20V12l-2-1' },
  { v: 'SDG 7', name: 'Energy', d: 'M13 3L4 14h6l-1 7 9-11h-6z' },
  { v: 'SDG 9', name: 'Industry', d: 'M4 20V10l5 3V10l5 3V6l5 3v11z' },
];

// PAGE D — INPUT FORM. Ported 1:1 from the Volt prototype (volt-template.html).
@Component({
  selector: 'volt-form',
  standalone: true,
  imports: [VIcon, VMascot],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .fm-chip:hover {
        border-color: var(--color-primary) !important;
      }
      .fm-submit:hover {
        filter: brightness(1.08) !important;
      }
      .fm-ghost:hover {
        background: var(--color-surface-2) !important;
      }
    `,
  ],
  template: `
    <section aria-labelledby="form-h" style="max-width:1120px;margin:0 auto;padding:clamp(28px,4vw,56px) 24px 96px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,.9fr);gap:44px;align-items:start">
      <div>
        <div style="font-family:var(--font-mono);font-size:12px;letter-spacing:.14em;color:var(--color-primary);font-weight:600">NEW INVENTIVE PROBLEM</div>
        <h1 id="form-h" style="font-family:var(--font-display);font-weight:700;font-size:clamp(28px,3.6vw,40px);letter-spacing:-.02em;margin:12px 0 8px">Frame a problem for Volt</h1>
        <p style="color:var(--color-on-surface-variant);font-size:15.5px;margin:0 0 30px;max-width:52ch">Describe the challenge in plain language. Volt will find the underlying contradiction — you don’t need to phrase it in TRIZ terms.</p>

        <form (submit)="s.submitForm($event)" novalidate style="display:flex;flex-direction:column;gap:24px">
          <div>
            <label for="f-title" style="display:block;font-weight:600;font-size:14px;margin-bottom:8px">Problem title <span style="color:var(--color-error)" aria-hidden="true">*</span></label>
            <input id="f-title" name="title" [value]="s.form().title" (input)="s.setField('title', $any($event.target).value)" aria-required="true" [attr.aria-invalid]="s.errors().title ? 'true' : 'false'" aria-describedby="f-title-err" placeholder="e.g. Keeping buildings hot &amp; cold" style="width:100%;height:48px;padding:0 14px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:11px;font-size:15px" [style.border-color]="s.errors().title ? 'var(--color-error)' : 'var(--color-border-interactive)'">
            @if (s.errors().title) {
              <p id="f-title-err" style="display:flex;align-items:center;gap:7px;margin:8px 0 0;color:var(--color-error);font-size:13px;font-weight:600"><v-icon name="alert" [size]="15" /> {{ s.errors().title }}</p>
            }
          </div>

          <div>
            <label for="f-desc" style="display:block;font-weight:600;font-size:14px;margin-bottom:8px">Description <span style="color:var(--color-error)" aria-hidden="true">*</span></label>
            <textarea id="f-desc" name="desc" [value]="s.form().desc" (input)="s.setField('desc', $any($event.target).value)" aria-required="true" [attr.aria-invalid]="s.errors().desc ? 'true' : 'false'" aria-describedby="f-desc-help f-desc-err" rows="5" placeholder="Describe the challenge, the conditions it must work under, and what “better” means…" style="width:100%;padding:12px 14px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:11px;font-size:15px;line-height:1.55;resize:vertical;font-family:var(--font-body)" [style.border-color]="s.errors().desc ? 'var(--color-error)' : 'var(--color-border-interactive)'"></textarea>
            <p id="f-desc-help" style="margin:8px 0 0;color:var(--color-on-surface-variant);font-size:12.5px">{{ s.form().desc.length }} characters · aim for at least 40.</p>
            @if (s.errors().desc) {
              <p id="f-desc-err" style="display:flex;align-items:center;gap:7px;margin:6px 0 0;color:var(--color-error);font-size:13px;font-weight:600"><v-icon name="alert" [size]="15" /> {{ s.errors().desc }}</p>
            }
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
            <div>
              <label for="f-domain" style="display:block;font-weight:600;font-size:14px;margin-bottom:8px">Domain <span style="color:var(--color-on-surface-variant);font-weight:400">(optional)</span></label>
              <select id="f-domain" (change)="s.setField('domain', $any($event.target).value)" style="width:100%;height:48px;padding:0 12px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:11px;font-size:15px">
                <option value="">Select domain…</option>
                <option>Built environment · HVAC</option>
                <option>Mobility &amp; transport</option>
                <option>Energy &amp; grid</option>
                <option>Materials &amp; manufacturing</option>
                <option>Agriculture &amp; water</option>
              </select>
            </div>
            <div>
              <label for="f-pay" style="display:block;font-weight:600;font-size:14px;margin-bottom:8px">Constraint <span style="color:var(--color-on-surface-variant);font-weight:400">(optional)</span></label>
              <input id="f-pay" (input)="s.setField('constraint', $any($event.target).value)" placeholder="e.g. retrofittable, &lt; 5yr payback" style="width:100%;height:48px;padding:0 14px;background:var(--color-surface-1);color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:11px;font-size:15px">
            </div>
          </div>

          <div>
            <span style="display:block;font-weight:600;font-size:14px;margin-bottom:10px">Sustainable Development Goals <span style="color:var(--color-on-surface-variant);font-weight:400">(optional)</span></span>
            <div role="group" aria-label="SDG tags" style="display:flex;flex-wrap:wrap;gap:9px">
              @for (chip of sdgChips; track $index) {
                <button type="button" class="fm-chip" (click)="s.toggleSdg(chip.v)" [attr.aria-pressed]="on(chip.v) ? 'true' : 'false'" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:999px;border:1.5px solid var(--color-border-interactive);background:transparent;color:var(--color-on-surface);font-size:13px;font-weight:600;cursor:pointer;min-height:40px" [style.border-color]="on(chip.v) ? 'var(--color-primary)' : 'var(--color-border-interactive)'" [style.background]="on(chip.v) ? 'var(--color-primary-container)' : 'transparent'" [style.color]="on(chip.v) ? 'var(--color-on-primary-container)' : 'var(--color-on-surface)'">
                  <span style="display:flex"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;shape-rendering:crispEdges"><path [attr.d]="chip.d" /></svg></span>{{ chip.v }} · {{ chip.name }}
                  @if (on(chip.v)) {
                    <span style="display:flex;color:var(--color-primary)"><v-icon name="check" [size]="16" /></span>
                  }
                </button>
              }
            </div>
          </div>

          <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin-top:4px">
            <button type="submit" data-magnetic class="fm-submit" style="display:inline-flex;align-items:center;gap:10px;height:52px;padding:0 26px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:13px;font-size:16px;font-weight:600;box-shadow:var(--shadow-2)">Run reasoning pipeline <span style="display:flex"><v-icon name="arrow" [size]="18" /></span></button>
            <button type="button" class="fm-ghost" (click)="s.fillDemo()" style="height:52px;padding:0 20px;background:transparent;color:var(--color-on-surface);border:1.5px solid var(--color-border-interactive);border-radius:13px;cursor:pointer;font-size:15px;font-weight:600">Use demo problem</button>
          </div>
        </form>
      </div>

      <!-- Aside: empty state / preview -->
      <aside aria-live="polite" style="position:sticky;top:88px;background:var(--color-surface-1);border:1px solid var(--color-border);border-radius:18px;padding:26px;box-shadow:var(--shadow-1);overflow:hidden">
        @if (formEmpty()) {
          <div style="text-align:center;padding:14px 4px">
            <div style="position:relative;width:130px;height:130px;margin:0 auto 20px">
              <span aria-hidden="true" style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,rgba(var(--glow),.35),transparent 70%);animation:praxis-pulse 2.4s ease-in-out infinite"></span>
              <span aria-hidden="true" style="position:absolute;inset:6%;border-radius:50%;border:1.5px dashed color-mix(in srgb,var(--color-primary) 45%,transparent);animation:praxis-orbit 26s linear infinite"></span>
              <span style="position:absolute;inset:0;display:grid;place-items:center"><v-mascot expr="idle" [scale]="6.4" [pulse]="true" [bob]="true" label="Volt waiting, curious" /></span>
            </div>
            <h2 style="font-family:var(--font-display);font-weight:600;font-size:18px;margin:0 0 8px">Nothing to reason about — yet</h2>
            <p style="color:var(--color-on-surface-variant);font-size:14px;line-height:1.55;margin:0">As you describe your problem, Volt previews the contradiction it will try to resolve here.</p>
          </div>
        } @else {
          <div>
            <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:.12em;color:var(--color-primary);font-weight:600">LIVE PREVIEW</div>
            <h2 style="font-family:var(--font-display);font-weight:600;font-size:19px;margin:8px 0 4px;word-break:break-word">{{ previewTitle() }}</h2>
            <p style="color:var(--color-on-surface-variant);font-size:13.5px;line-height:1.55;margin:0 0 18px">{{ previewDesc() }}</p>
            <div style="padding:14px;border-radius:12px;background:var(--color-surface-2);border:1px dashed var(--color-border-interactive)">
              <div style="font-size:11px;color:var(--color-on-surface-variant);margin-bottom:6px">ANTICIPATED CONTRADICTION</div>
              <div style="font-family:var(--font-mono);font-size:13px;line-height:1.5;color:var(--color-on-surface)">improving ⟂ worsening<br>→ resolved via inventive principles</div>
            </div>
          </div>
        }
      </aside>
    </section>
  `,
})
export class VoltForm {
  readonly s = inject(VoltState);
  readonly sdgChips = SDG_DEF;

  on(v: string): boolean {
    return this.s.form().sdg.includes(v);
  }

  readonly formEmpty = computed(() => {
    const f = this.s.form();
    return !f.title.trim() && f.desc.trim().length === 0;
  });
  readonly previewTitle = computed(() => this.s.form().title.trim() || 'Untitled problem');
  readonly previewDesc = computed(() => this.s.form().desc.trim() || 'Awaiting description…');
}
