/**
 * Aera OS — Design Tokens V1
 * GJS ES Module — importable by GNOME Shell extensions
 *
 * Usage in an extension:
 *   import * as T from './aera-tokens.js';
 *   actor.set_style(`color: ${T.color.light.text.primary};`);
 *
 * Source of truth: design-system/tokens.json
 * Keep this file in sync with tokens.json when tokens change.
 *
 * GNOME Shell compatibility notes:
 *   - CSS custom properties (var(--x)) are NOT supported in GNOME Shell CSS.
 *   - backdrop-filter is NOT supported. Use Shell.BlurEffect in GJS instead.
 *   - filter: saturate() is NOT supported.
 *   - :-gtk-dark pseudo-class IS supported for light/dark switching in CSS.
 */

// ─── Accent ──────────────────────────────────────────────────────────────────

export const accent = {
    primary:   '#03DFF8',
    onPrimary: '#061316',
    hover:     '#33E8FA',
    pressed:   '#02B8D0',
    muted:     'rgba(3, 223, 248, 0.20)',
    glow:      'rgba(3, 223, 248, 0.35)',
};

// ─── Colors ───────────────────────────────────────────────────────────────────

export const color = {
    light: {
        surface: {
            root:   'rgba(255, 255, 255, 0.35)',
            strong: 'rgba(255, 255, 255, 0.45)',
            subtle: 'rgba(255, 255, 255, 0.20)',
            inner:  'rgba(255, 255, 255, 0.15)',
        },
        border: {
            glass:  'rgba(255, 255, 255, 0.40)',
            subtle: 'rgba(255, 255, 255, 0.25)',
        },
        text: {
            primary:   '#FFFFFF',
            secondary: 'rgba(255, 255, 255, 0.72)',
            muted:     'rgba(255, 255, 255, 0.55)',
            disabled:  'rgba(255, 255, 255, 0.40)',
        },
    },
    dark: {
        surface: {
            root:   'rgba(20, 25, 35, 0.70)',
            strong: 'rgba(20, 25, 35, 0.82)',
            subtle: 'rgba(20, 25, 35, 0.55)',
            inner:  'rgba(255, 255, 255, 0.08)',
        },
        border: {
            glass:  'rgba(255, 255, 255, 0.20)',
            subtle: 'rgba(255, 255, 255, 0.12)',
        },
        text: {
            primary:   '#FFFFFF',
            secondary: '#C6CBD3',
            muted:     '#9E9E9E',
            disabled:  'rgba(255, 255, 255, 0.40)',
        },
    },
};

// ─── Glass ────────────────────────────────────────────────────────────────────

export const glass = {
    light: {
        background: 'rgba(255, 255, 255, 0.35)',
        border:     'rgba(255, 255, 255, 0.40)',
    },
    dark: {
        background: 'rgba(20, 25, 35, 0.70)',
        border:     'rgba(255, 255, 255, 0.20)',
    },
    inner: {
        light: 'rgba(255, 255, 255, 0.20)',
        dark:  'rgba(255, 255, 255, 0.10)',
    },
    /**
     * Blur intention: 25px
     * Use Shell.BlurEffect({ mode: Shell.BlurMode.BACKGROUND, radius: 25, brightness: 0.95 })
     * backdrop-filter is NOT supported in GNOME Shell CSS.
     */
    blurRadius: 25,
    blurBrightness: 0.95,
};

// ─── Typography ───────────────────────────────────────────────────────────────

export const type = {
    /** Hero numbers, clock face — 72–96px range. Default: 80px */
    display: { size: '80px', weight: '700' },
    /** Important values, date line — 18–24px range. Default: 20px */
    metric:  { size: '20px', weight: '600' },
    /** Labels, controls — 13–14px */
    label:   { size: '13px', weight: '500' },
    /** Dates, metadata — 10–11px */
    caption: { size: '11px', weight: '400' },
};

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const space = {
    1:  4,   // px
    2:  8,
    3:  12,
    4:  16,
    5:  20,
    6:  24,
    8:  32,
    10: 40,
};

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    '2xl': 24,
    pill: 999,
};

// ─── Borders ──────────────────────────────────────────────────────────────────

export const border = {
    width: { hairline: '1px' },
    glass: {
        light: 'rgba(255, 255, 255, 0.40)',
        dark:  'rgba(255, 255, 255, 0.20)',
    },
};

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadow = {
    floating: '0 12px 32px rgba(0, 0, 0, 0.25)',
    subtle:   '0 6px 18px rgba(0, 0, 0, 0.16)',
};

// ─── States ───────────────────────────────────────────────────────────────────

export const state = {
    hover:    { surfaceBoost: 'rgba(255, 255, 255, 0.10)' },
    focus:    { color: '#03DFF8', outline: '2px solid #03DFF8' },
    active:   { color: '#03DFF8' },
    disabled: { opacity: 0.40 },
};
