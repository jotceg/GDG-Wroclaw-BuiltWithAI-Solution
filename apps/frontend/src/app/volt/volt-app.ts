import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  afterNextRender,
  inject,
} from '@angular/core';
import { VoltState, VoltPage } from './core/volt-state';
import { VIcon } from './core/icons';
import { VFace } from './core/mascot';
import { VoltLanding } from './pages/landing';
import { VoltWorkspace } from './pages/workspace';
import { VoltReport } from './pages/report';
import { VoltForm } from './pages/form';
import { VoltFoundations } from './pages/foundations';

interface NavItem {
  page: VoltPage;
  label: string;
  icon: string;
}

// App shell — header/nav/theme toggle/toast, ported 1:1 from the Volt prototype.
@Component({
  selector: 'volt-app',
  standalone: true,
  imports: [VIcon, VFace, VoltLanding, VoltWorkspace, VoltReport, VoltForm, VoltFoundations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .sh-nav-item:hover {
        background: var(--color-surface-2) !important;
        color: var(--color-on-surface) !important;
      }
      .sh-theme:hover {
        border-color: var(--color-border-interactive) !important;
        box-shadow: 0 0 18px 2px rgba(var(--glow), 0.35) !important;
      }
      .sh-cta:hover {
        filter: brightness(1.08);
      }
    `,
  ],
  template: `
    <div
      [attr.data-theme]="s.theme()"
      style="min-height:100vh;background:var(--color-bg);color:var(--color-on-surface);font-family:var(--font-body);-webkit-font-smoothing:antialiased;line-height:1.5"
    >
      <!-- ================= APP BAR ================= -->
      <header
        style="position:sticky;top:0;z-index:40;background:color-mix(in srgb, var(--color-bg) 82%, transparent);backdrop-filter:saturate(140%) blur(14px);border-bottom:1px solid var(--color-border)"
      >
        <div
          style="max-width:1280px;margin:0 auto;padding:0 24px;height:64px;display:flex;align-items:center;gap:20px"
        >
          <button
            (click)="s.go('landing')"
            aria-label="Volt home"
            style="display:flex;align-items:center;gap:10px;background:none;border:none;cursor:pointer;padding:6px 4px;color:var(--color-on-surface)"
          >
            <span
              style="position:relative;width:30px;height:30px;display:grid;place-items:center;flex:none"
              data-volt-eyes
            >
              <span
                aria-hidden="true"
                style="position:absolute;inset:-2px;border-radius:50%;background:radial-gradient(circle, rgba(var(--glow),.5), transparent 68%);animation:praxis-pulse 1.8s ease-in-out infinite"
              ></span>
              <span aria-hidden="true" style="position:relative;display:flex"><v-face /></span>
            </span>
            <span
              style="font-family:var(--font-display);font-weight:700;font-size:19px;letter-spacing:.14em"
              >VOLT</span
            >
          </button>

          <nav
            aria-label="Primary"
            style="display:flex;align-items:center;gap:2px;margin-left:8px;overflow-x:auto"
          >
            @for (item of navItems; track item.page) {
            <button
              class="sh-nav-item"
              (click)="s.go(item.page)"
              [attr.aria-current]="s.page() === item.page ? 'page' : 'false'"
              [title]="item.label"
              style="position:relative;display:inline-flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;padding:9px 13px;border-radius:10px;font-size:13.5px;font-weight:600;color:var(--color-on-surface-variant);white-space:nowrap;transition:color .15s,background .15s"
            >
              <span
                [style.color]="
                  s.page() === item.page ? 'var(--color-primary)' : 'var(--color-on-surface-variant)'
                "
                style="display:flex"
                ><v-icon [name]="item.icon" [size]="18"
              /></span>
              <span
                [style.color]="
                  s.page() === item.page ? 'var(--color-on-surface)' : 'var(--color-on-surface-variant)'
                "
                >{{ item.label }}</span
              >
              @if (s.page() === item.page) {
              <span
                aria-hidden="true"
                style="position:absolute;left:12px;right:12px;bottom:1px;height:2px;border-radius:2px;background:var(--color-primary)"
              ></span>
              }
            </button>
            }
          </nav>

          <div style="margin-left:auto;display:flex;align-items:center;gap:10px">
            <button
              class="sh-theme"
              (click)="s.toggleTheme()"
              [attr.aria-label]="s.themeToggleLabel()"
              [title]="s.themeToggleLabel()"
              style="position:relative;display:grid;place-items:center;width:44px;height:44px;background:var(--color-surface-2);color:var(--color-sun);border:1px solid var(--color-border);border-radius:50%;cursor:pointer;box-shadow:0 0 0 0 rgba(var(--glow),0)"
            >
              <!-- sun ⇄ moon geometry morph (140ms ease) -->
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" style="display:block">
                <mask id="volt-moon-mask">
                  <rect x="0" y="0" width="24" height="24" fill="#fff" />
                  <circle
                    r="7"
                    fill="#000"
                    [style.cx]="s.theme() === 'dark' ? '16px' : '26px'"
                    [style.cy]="s.theme() === 'dark' ? '7px' : '2px'"
                    style="transition:cx .14s ease, cy .14s ease"
                  />
                </mask>
                <circle
                  mask="url(#volt-moon-mask)"
                  fill="currentColor"
                  style="cx:12px;cy:12px;transition:r .14s ease"
                  [style.r]="s.theme() === 'dark' ? '8px' : '5.2px'"
                />
                <g
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  [style.opacity]="s.theme() === 'dark' ? 0 : 1"
                  [style.transform]="
                    s.theme() === 'dark' ? 'rotate(-45deg) scale(.6)' : 'rotate(0deg) scale(1)'
                  "
                  style="transform-origin:12px 12px;transition:opacity .14s ease, transform .14s ease"
                >
                  <path
                    d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M19.4 4.6l-1.7 1.7M6.3 17.7l-1.7 1.7"
                  />
                </g>
              </svg>
            </button>
            <button
              class="sh-cta"
              (click)="s.go('form')"
              style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 18px;background:var(--color-primary-fill);color:var(--color-on-primary-fill);border:none;border-radius:11px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:var(--shadow-1)"
            >
              <span style="display:flex"><v-icon name="plus" [size]="17" /></span>New problem
            </button>
          </div>
        </div>
      </header>

      <main>
        @switch (s.page()) { @case ('landing') {
        <volt-landing />
        } @case ('workspace') {
        <volt-workspace />
        } @case ('report') {
        <volt-report />
        } @case ('form') {
        <volt-form />
        } @case ('foundations') {
        <volt-foundations />
        } }
      </main>

      <!-- ================= TOAST (live region) ================= -->
      <div
        aria-live="polite"
        aria-atomic="true"
        style="position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:80;pointer-events:none"
      >
        @if (s.toast(); as toast) {
        <div
          style="display:inline-flex;align-items:center;gap:11px;padding:13px 20px;border-radius:13px;background:var(--color-surface-3);color:var(--color-on-surface);border:1px solid var(--color-border-interactive);box-shadow:var(--shadow-3);font-size:14px;font-weight:600"
        >
          <span style="display:flex;color:var(--color-success)"><v-icon name="check" [size]="16" /></span
          >{{ toast }}
        </div>
        }
      </div>
    </div>
  `,
})
export class VoltApp implements OnDestroy {
  readonly s = inject(VoltState);

  readonly navItems: NavItem[] = [
    { page: 'landing', label: 'Landing', icon: 'home' },
    { page: 'workspace', label: 'Workspace', icon: 'contra' },
    { page: 'report', label: 'Report', icon: 'report' },
    { page: 'form', label: 'New Problem', icon: 'form' },
    { page: 'foundations', label: 'Foundations', icon: 'swatch' },
  ];

  private pointerHandler: ((e: PointerEvent) => void) | undefined;

  constructor() {
    // Magnetic CTAs + mascot eye tracking (1:1 with prototype componentDidMount).
    afterNextRender(() => {
      try {
        const reduced =
          window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isTouch = 'ontouchstart' in window;
        if (reduced || isTouch) return;
        this.pointerHandler = (e: PointerEvent) => {
          const target = e.target as HTMLElement | null;
          const t = target && target.closest ? target.closest('[data-magnetic]') : null;
          document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
            if (el === t) {
              const r = el.getBoundingClientRect();
              const dx = Math.max(-5, Math.min(5, (e.clientX - (r.left + r.width / 2)) * 0.18));
              const dy = Math.max(-4, Math.min(4, (e.clientY - (r.top + r.height / 2)) * 0.18));
              el.style.translate = dx + 'px ' + dy + 'px';
            } else if (el.style.translate && el.style.translate !== '0px 0px') {
              el.style.translate = '0px 0px';
            }
          });
          const eyeEl = document.querySelector('[data-volt-eyes]');
          if (eyeEl) {
            const r = eyeEl.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = Math.max(-0.45, Math.min(0.45, (e.clientX - cx) * 0.003));
            const dy = Math.max(-0.35, Math.min(0.35, (e.clientY - cy) * 0.003));
            document.documentElement.style.setProperty('--vex', dx + 'px');
            document.documentElement.style.setProperty('--vey', dy + 'px');
          }
        };
        document.addEventListener('pointermove', this.pointerHandler, { passive: true });
      } catch {
        /* noop */
      }
    });
  }

  ngOnDestroy() {
    if (this.pointerHandler) document.removeEventListener('pointermove', this.pointerHandler);
  }
}
