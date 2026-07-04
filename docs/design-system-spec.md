# Design System Spec - verified WCAG AA contrast

> Companion to `design-system.md`. Same token structure, but every color pair here has a
> **measured contrast ratio** so you can drop it in without re-checking. Choose Variant A or B
> at 8:00 once the domain is known, then wire it via `mat.theme()` (Angular) and feed this file
> to Claude Design.
> Consistency rule: if tokens change here, update `design-system.md` and any component that hardcodes them (it shouldn't).

## How to read the ratios

- **Normal text needs ≥ 4.5:1**, large text (≥ 24px, or ≥ 19px bold) and UI/non-text (borders, icons, focus) need **≥ 3:1**.
- Every "on-*" token below is paired with its background and the measured ratio is shown.
- Ratios computed with the WCAG relative-luminance formula. Re-verify only if you change a hex.

---

## Variant A - Fintech / B2B (cool, "trust and data")

Seeds for Material Theme Builder: `primary #1544C4`, `tertiary #0F6E63`.

| Token | Value | Paired with | Ratio | Pass |
|-------|-------|-------------|-------|------|
| `--mat-sys-primary` | `#1544C4` | on-primary `#FFFFFF` | **7.91:1** | AAA |
| `--mat-sys-on-primary` | `#FFFFFF` | - | - | - |
| `--mat-sys-primary-container` | `#DDE1FF` | on-primary-container `#001551` | **13.29:1** | AAA |
| `--mat-sys-on-primary-container` | `#001551` | - | - | - |
| `--mat-sys-tertiary` | `#0F6E63` | on-tertiary `#FFFFFF` | **6.12:1** | AA |
| `--mat-sys-on-tertiary` | `#FFFFFF` | - | - | - |

## Variant B - Consumer (warm, "friendly and energetic")

Seeds for Material Theme Builder: `primary #7A34D6`, `tertiary #A8420A`.

| Token | Value | Paired with | Ratio | Pass |
|-------|-------|-------------|-------|------|
| `--mat-sys-primary` | `#7A34D6` | on-primary `#FFFFFF` | **6.38:1** | AA |
| `--mat-sys-on-primary` | `#FFFFFF` | - | - | - |
| `--mat-sys-primary-container` | `#EEDCFF` | on-primary-container `#29005A` | **13.14:1** | AAA |
| `--mat-sys-on-primary-container` | `#29005A` | - | - | - |
| `--mat-sys-tertiary` | `#A8420A` | on-tertiary `#FFFFFF` | **6.09:1** | AA |
| `--mat-sys-on-tertiary` | `#FFFFFF` | - | - | - |

## Shared neutrals + error (both variants, light mode)

These are fixed and AA-safe - do not tweak without re-measuring.

| Token | Value | Paired with | Ratio | Pass |
|-------|-------|-------------|-------|------|
| `--mat-sys-surface` | `#FFFFFF` | on-surface `#1A1C1E` | **17.09:1** | AAA |
| `--mat-sys-on-surface` | `#1A1C1E` | - | - | - |
| `--mat-sys-surface-container` | `#F1F3F7` | on-surface `#1A1C1E` | **15.38:1** | AAA |
| `--mat-sys-on-surface-variant` | `#43474E` | on `#FFFFFF` | **9.33:1** | AAA |
| `--mat-sys-outline` | `#73777F` | on `#FFFFFF` (non-text 3:1) | **4.49:1** | AA / UI |
| `--mat-sys-outline-variant` | `#C3C7CF` | decorative dividers only | n/a | - |
| `--mat-sys-error` | `#BA1A1A` | on-error `#FFFFFF` | **6.46:1** | AA |
| `--mat-sys-on-error` | `#FFFFFF` | - | - | - |
| `--mat-sys-error-container` | `#FFDAD6` | on-error-container `#410002` | **13.26:1** | AAA |
| `--mat-sys-on-error-container` | `#410002` | - | - | - |

## Dark mode neutrals (optional, if time allows)

| Token | Value | Paired with | Ratio | Pass |
|-------|-------|-------------|-------|------|
| `--mat-sys-surface` | `#121316` | on-surface `#E3E2E6` | **14.41:1** | AAA |
| `--mat-sys-on-surface` | `#E3E2E6` | - | - | - |
| `--mat-sys-surface-container` | `#1E2022` | on-surface `#E3E2E6` | ~12:1 | AAA |
| `--mat-sys-outline` | `#8D9199` | non-text on dark surface | ≥3:1 | UI |

Enable via `color-scheme: light dark;` on `html` - Material 3 switches automatically by system preference.

---

## Non-color tokens (identical to `design-system.md`, no contrast needed)

### Typography (Roboto or Inter, M3 typescale - role: size/line/weight)
```
display-large    57/64/400   headline-large 32/40/400   title-large 22/28/400
title-medium     16/24/500   body-large 16/24/400       body-medium 14/20/400
label-large      14/20/500   label-small 11/16/500
```
Use: `font: var(--mat-sys-headline-large);`

### Spacing (8px base, 4px half-step)
```
--app-space-1 4px · -2 8px · -3 12px · -4 16px · -5 24px · -6 32px · -7 48px · -8 64px
```

### Radii (M3 shape scale)
```
--app-radius-xs 4px · -sm 8px · -md 12px · -lg 16px · -xl 28px · -full 9999px
```

### Elevation
```
--app-elevation-1  card
--app-elevation-2  menu/dropdown
--app-elevation-3  dialog
```

### Motion
```
--app-duration-short 150ms · -medium 300ms · easing cubic-bezier(0.2,0,0,1)
```

---

## A11Y contract (ties to `a11y_AA_checklist.md`)

- Always pair a background token with its `on-*` token - never a raw hex on a colored background (1.4.3).
- Focus ring token = `--mat-sys-primary`; never remove `outline` without a stronger replacement (2.4.7).
- `--mat-sys-outline` is the minimum for interactive borders (non-text 3:1, 1.4.11).
- Status never carried by color alone - add text/icon (1.4.1).
- Verify the final UI with axe/WAVE/Lighthouse before the pitch; these ratios cover the tokens, not real rendered overlaps.

## Angular wiring (see `04_architecture.md` for full stack)
```scss
@use '@angular/material' as mat;
html {
  @include mat.theme((
    color: (primary: $brand-primary-palette, tertiary: $brand-tertiary-palette),
    typography: Roboto,
    density: 0,
  ));
  color-scheme: light dark;
}
```
`mat.theme` emits the `--mat-sys-*` CSS variables above. Custom components must consume `--mat-sys-*`, never hardcode hex.
