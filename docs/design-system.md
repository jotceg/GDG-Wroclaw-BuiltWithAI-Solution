# Design System - [NAZWA PROJEKTU]

> Źródło prawdy dla Filaru 2 (UI/UX & A11Y). Ten plik czytają: Claude Design (spójny UI), Angular Material (`mat.theme`) i zespół.
> Zasada nadrzędna: **tokeny nazywamy semantycznie (rola), nie wartością** - `primary`, `on-surface`, `space-4`, a nie `blue-600`, `gray-900`, `16px`. Dzięki temu jury widzi "poprawne zastosowanie Design Tokens", a UI adaptuje się do dark mode i zmian marki bez przepisywania CSS.

## Jak tego użyć (3 kroki, ~30 min)

1. O 8:00, po poznaniu domeny, wybierz **Wariant A lub B** (niżej) i wklej jego kolory seed do **Material Theme Builder** (m3.material.io) -> eksport wygeneruje pełną, przetestowaną pod kontrast (AA) rampę tonalną i tokeny `--mat-sys-*`.
2. W Angularze: podepnij paletę przez `mat.theme(...)` (snippet na dole). Angular Material wygeneruje tokeny jako zmienne CSS `--mat-sys-*`.
3. W Claude Design: wskaż ten plik jako design system. Generowany UI użyje tych samych ról -> spójność design <-> kod.

**Uwaga o kontraście:** hexy neutrali i błędów poniżej są bezpieczne (pochodzą z bazowej palety M3). Kolory marki generuj przez Theme Builder, a końcowo przejedź UI narzędziem axe/WAVE/Lighthouse (jest w `a11y_AA_checklist.md`).

---

## 1. Zasady wizualne (dla Claude Design i dla spójności)

- Jeden kolor akcentu na ekran - `primary` prowadzi wzrok do akcji głównej (CTA), reszta to neutrale.
- Hierarchia przez rozmiar i wagę typografii oraz przestrzeń, nie przez mnożenie kolorów.
- Powierzchnie budujemy tokenami `surface*`, treść na nich zawsze tokenem `on-*` (gwarancja kontrastu).
- Zaokrąglenia i cienie spójne w całej apce (jedna skala `radius-*`, jedna `elevation-*`).
- Gęstość dostosowana do domeny: dane/B2B = ciaśniej, konsument = luźniej.

---

## 2. Kolory (role semantyczne = tokeny `--mat-sys-*`)

Każde tło ma sparowany token tekstu/ikony `on-*` czytelny na tym tle - **zawsze używaj ich w parze** (to Wasza gwarancja kontrastu pod A11Y).

### Warianty palety - wybierz jeden rano

**Wariant A - Fintech / B2B (chłodny, "zaufanie i dane")**
```
seed primary   : #2F5BEA   (niebieski)
seed tertiary  : #12B5A5   (teal, akcent)
```
Charakter: spokojny, precyzyjny, dobry pod dashboardy i gęste dane.

**Wariant B - Konsumencki (ciepły, "przyjazny i energiczny")**
```
seed primary   : #8B3DFF   (fiolet)
seed tertiary  : #FF8A3D   (ciepły pomarańcz, akcent)
```
Charakter: żywy, przystępny, dobry pod produkt dla użytkownika końcowego.

### Role kolorów (light mode) - nazwy tokenów wspólne dla obu wariantów
Wartości `primary*`/`tertiary*` przyjdą z Theme Buildera. Neutrale i błędy poniżej są stałe i AA-bezpieczne.

```css
:root {
  /* --- Brand (wygenerowane z seed przez Material Theme Builder) --- */
  --mat-sys-primary:              /* z generatora */;
  --mat-sys-on-primary:           #FFFFFF;
  --mat-sys-primary-container:    /* z generatora */;
  --mat-sys-on-primary-container: /* z generatora */;

  --mat-sys-tertiary:              /* z generatora */;
  --mat-sys-on-tertiary:           #FFFFFF;
  --mat-sys-tertiary-container:    /* z generatora */;
  --mat-sys-on-tertiary-container: /* z generatora */;

  /* --- Powierzchnie i tekst (stałe, bezpieczne) --- */
  --mat-sys-background:            #FDFCFF;
  --mat-sys-surface:              #FFFFFF;
  --mat-sys-on-surface:           #1A1C1E;   /* tekst główny */
  --mat-sys-surface-container:    #F1F3F7;   /* karty, panele */
  --mat-sys-on-surface-variant:   #43474E;   /* tekst drugorzędny */
  --mat-sys-outline:              #73777F;   /* obramowania, dividery */
  --mat-sys-outline-variant:      #C3C7CF;

  /* --- Stany błędu (M3 baseline, AA) --- */
  --mat-sys-error:                #BA1A1A;
  --mat-sys-on-error:             #FFFFFF;
  --mat-sys-error-container:      #FFDAD6;
  --mat-sys-on-error-container:   #410002;
}
```

### Dark mode (opcjonalnie, jeśli wystarczy czasu)
M3 obsługuje to przez `color-scheme: light dark`. Neutrale w dark:
```css
:root {
  --mat-sys-background:         #121316;
  --mat-sys-surface:            #121316;
  --mat-sys-on-surface:         #E3E2E6;
  --mat-sys-surface-container:  #1E2022;
  --mat-sys-on-surface-variant: #C3C7CF;
  --mat-sys-outline:            #8D9199;
}
```

### Użycie (przykłady - zawsze para tło + on-*)
```css
.cta         { background: var(--mat-sys-primary);          color: var(--mat-sys-on-primary); }
.card        { background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface); }
.caption     { color: var(--mat-sys-on-surface-variant); }
.error-banner{ background: var(--mat-sys-error-container);   color: var(--mat-sys-on-error-container); }
```

---

## 3. Typografia

Font: **Roboto** (domyślny M3, Google-native pod GDG) lub **Inter**. Jeden font-family na całość + waga na hierarchię.
Skala M3 (rola: rozmiar / interlinia / waga). W Angularze te role wychodzą jako `--mat-sys-<rola>` (np. `font: var(--mat-sys-headline-large)`).

```
display-large    57 / 64 / 400     (hero, ekran startowy)
headline-large   32 / 40 / 400     (tytuł sekcji)
headline-small   24 / 32 / 400
title-large      22 / 28 / 400     (nagłówek karty)
title-medium     16 / 24 / 500     (etykiety, tab)
body-large       16 / 24 / 400     (tekst główny)
body-medium      14 / 20 / 400     (tekst drugorzędny)
label-large      14 / 20 / 500     (tekst przycisku)
label-small      11 / 16 / 500     (mikrokopie)
```

---

## 4. Spacing (baza 8px, półkrok 4px)
Wszystkie odstępy (padding, gap, margin) tylko z tej skali - to daje rytm wizualny.
```css
:root {
  --app-space-0: 0;
  --app-space-1: 4px;
  --app-space-2: 8px;
  --app-space-3: 12px;
  --app-space-4: 16px;   /* domyślny padding karty / gap */
  --app-space-5: 24px;
  --app-space-6: 32px;
  --app-space-7: 48px;
  --app-space-8: 64px;
}
```

## 5. Radii (skala kształtu M3)
```css
:root {
  --app-radius-none: 0;
  --app-radius-xs:   4px;
  --app-radius-sm:   8px;
  --app-radius-md:   12px;   /* domyślne dla kart / inputów */
  --app-radius-lg:   16px;
  --app-radius-xl:   28px;   /* duże powierzchnie, modale */
  --app-radius-full: 9999px; /* pill, avatar */
}
```

## 6. Elevation / cienie
```css
:root {
  --app-elevation-0: none;
  --app-elevation-1: 0 1px 2px rgba(0,0,0,.30), 0 1px 3px 1px rgba(0,0,0,.15);
  --app-elevation-2: 0 1px 2px rgba(0,0,0,.30), 0 2px 6px 2px rgba(0,0,0,.15);
  --app-elevation-3: 0 4px 8px 3px rgba(0,0,0,.15), 0 1px 3px rgba(0,0,0,.30);
}
```
Reguła: `card` = elevation-1, `menu/dropdown` = elevation-2, `dialog` = elevation-3.

## 7. Motion (opcjonalnie)
```css
:root {
  --app-duration-short:  150ms;  /* hover, ripple */
  --app-duration-medium: 300ms;  /* wejście karty, modal */
  --app-easing-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

---

## 8. A11Y - twarde minimum (spina się z `a11y_AA_checklist.md`)
- Tło i treść ZAWSZE parą tokenów tło + `on-*`. Nigdy ręczny hex tekstu na kolorowym tle.
- Widoczny fokus: nie usuwać `outline`; token fokusu = `--mat-sys-primary`.
- Kontrast: tekst normalny min. 4.5:1, duży 3:1 - zweryfikuj axe/WAVE/Lighthouse przed pitchem.
- Cel dotyku min. 24x24px (użyj `--app-space-*`, np. przycisk min-height 40px).
- Kolor nie jest jedynym nośnikiem statusu (błąd = kolor error + ikona + tekst).

---

## 9. Podpięcie w Angular Material (dla dewelopera FE)
```scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary:  $brand-primary-palette,   // paleta z Material Theme Builder (z seed)
      tertiary: $brand-tertiary-palette,
    ),
    typography: Roboto,
    density: 0,                            // B2B/dane: rozważ -1 lub -2 (ciaśniej)
  ));
  color-scheme: light dark;               // auto light/dark wg preferencji systemu
}
```
`mat.theme` generuje tokeny jako zmienne CSS `--mat-sys-*`. Własne komponenty też mają konsumować `--mat-sys-*` (nie hardkodować hexów) - wtedy cały UI reaguje na motyw bez dodatkowej pracy. Nadpisania rób przez API `mat.*-overrides`, nie ręcznym CSS-em na wewnętrznych klasach Materiala (to pułapka upgrade'owa).

## 10. Component tokens - pomijamy na 10h
Trzecia warstwa (tokeny per-komponent) to na hackathonie strata czasu. Zostajemy na: reference (seed) -> system (`--mat-sys-*` + `--app-*`). Wystarczy do spójności i punktów w Filarze 2.
