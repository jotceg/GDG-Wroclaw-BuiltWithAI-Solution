import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// Ported 1:1 from the Volt prototype (docs/design-system).
export const ICONS: Record<string, string> = {
  core: '<circle cx="12" cy="12" r="3.4"/><path d="M12 2.6v3M12 18.4v3M2.6 12h3M18.4 12h3M5.4 5.4l2.1 2.1M16.5 16.5l2.1 2.1M18.6 5.4l-2.1 2.1M7.5 16.5l-2.1 2.1"/>',
  problem:
    '<circle cx="12" cy="12" r="8.4"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
  contra: 'M4 9h11l-3-3M20 15H9l3 3',
  candidates:
    '<circle cx="6" cy="6" r="2.2"/><circle cx="6" cy="18" r="2.2"/><circle cx="18" cy="12" r="2.2"/><path d="M8 7l8 4M8 17l8-4"/>',
  eval: 'M4 6h4v4H4zM4 14h4v4H4zM11 7h9M11 16h9',
  choice:
    'M8 4h8v3a4 4 0 01-8 0zM6 5H4v1a3 3 0 003 3M18 5h2v1a3 3 0 01-3 3M9 20h6M10 20v-3h4v3M12 11v3',
  trophy: 'M7 4h10v3a5 5 0 01-10 0zM7 20h10M9.5 20l.5-3h4l.5 3M12 12v2',
  home: 'M3 11l9-7 9 7M5 10v10h5v-6h4v6h5V10',
  report: 'M7 3h7l4 4v14H7zM14 3v4h4M10 13h5M10 17h5',
  form: 'M4 20h16M6 15l9-9 3 3-9 9H6z',
  swatch: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
  moon: 'M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z',
  plus: 'M12 5v14M5 12h14',
  arrow: 'M5 12h13M13 6l6 6-6 6',
  chevron: 'M9 6l6 6-6 6',
  close: 'M6 6l12 12M18 6L6 18',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4V4a1 1 0 011-1h10v1"/>',
  check: 'M4 12l5 5 11-11',
  inspect: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>',
  up: 'M12 19V5M6 11l6-6 6 6',
  down: 'M12 5v14M18 13l-6 6-6-6',
  alert: '<path d="M12 3l9 16H3z"/><path d="M12 9v5M12 17.5v.2"/>',
  play: 'M6 4l14 8-14 8z',
  refresh: 'M20 11a8 8 0 10-1.5 5M20 5v5h-5',
  pdf: 'M7 3h8l4 4v14H7zM14 3v4h4M9 12h3v6H9zM13 12h2a2 2 0 010 4h-2v-4M17 12h3M17 15h2',
  json: 'M8 4H6a2 2 0 00-2 2v2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M20 16v2a2 2 0 01-2 2h-2M10 9v.01M10 15v.01M14 12h.01',
  md: 'M4 6h16v12H4zM7 15V9l3 4 3-4v6M17 9v6M15 13l2 2 2-2',
  zip: 'M12 3v2M12 7v2M12 11v2M12 15v3M10 3h4v18h-4z',
};

export function iconSvg(name: string, size = 22): string {
  const raw = ICONS[name] || '';
  const html = raw.charAt(0) === '<' ? raw : '<path d="' + raw + '"/>';
  return (
    '<svg width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block">' +
    html +
    '</svg>'
  );
}

@Component({
  selector: 'v-icon',
  standalone: true,
  template: `<span style="display:contents" [innerHTML]="svg()"></span>`,
  host: { style: 'display:flex' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VIcon {
  readonly name = input.required<string>();
  readonly size = input(22);
  private readonly sanitizer = inject(DomSanitizer);
  readonly svg = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(iconSvg(this.name(), this.size()))
  );
}
