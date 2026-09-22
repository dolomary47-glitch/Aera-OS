/**
 * Aera OS — Design Tokens V1.1
 * GJS ES Module — importable by GNOME Shell extensions
 *
 * Source of truth: design-system/tokens.json
 */

export const accent = {
    primary:   '#03DFF8',
    onPrimary: '#061316',
    hover:     '#33E8FA',
    pressed:   '#02B8D0',
    muted:     'rgba(3, 223, 248, 0.20)',
    glow:      'rgba(3, 223, 248, 0.35)',
};

export const color = {
    light: {
        surface: {
            root:   'rgba(240, 243, 246, 0.92)',
            strong: 'rgba(255, 255, 255, 0.95)',
            subtle: 'rgba(255, 255, 255, 0.70)',
            inner:  'rgba(255, 255, 255, 0.60)',
            card:   'rgba(255, 255, 255, 0.75)',
        },
        border: {
            glass:  'rgba(255, 255, 255, 0.80)',
            subtle: 'rgba(0, 0, 0, 0.08)',
        },
        text: {
            primary:   '#111827',
            secondary: '#4B5563',
            muted:     '#9CA3AF',
            disabled:  'rgba(17, 24, 39, 0.35)',
            onDark:    '#FFFFFF',
        },
    },
    dark: {
        surface: {
            root:   'rgba(18, 22, 30, 0.88)',
            strong: 'rgba(24, 29, 39, 0.94)',
            subtle: 'rgba(255, 255, 255, 0.08)',
            inner:  'rgba(255, 255, 255, 0.06)',
            card:   'rgba(255, 255, 255, 0.08)',
        },
        border: {
            glass:  'rgba(255, 255, 255, 0.16)',
            subtle: 'rgba(255, 255, 255, 0.08)',
        },
        text: {
            primary:   '#FFFFFF',
            secondary: '#C6CBD3',
            muted:     '#8E95A2',
            disabled:  'rgba(255, 255, 255, 0.35)',
            onDark:    '#FFFFFF',
        },
    },
};

export const glass = {
    light: {
        background: 'rgba(240, 243, 246, 0.92)',
        border:     'rgba(255, 255, 255, 0.80)',
    },
    dark: {
        background: 'rgba(18, 22, 30, 0.88)',
        border:     'rgba(255, 255, 255, 0.16)',
    },
    inner: {
        light: 'rgba(255, 255, 255, 0.60)',
        dark:  'rgba(255, 255, 255, 0.06)',
    },
    blurRadius: 25,
    blurBrightness: 0.95,
};

export const type = {
    display: { size: '80px', weight: '700' },
    metric:  { size: '20px', weight: '600' },
    label:   { size: '13px', weight: '600' },
    caption: { size: '11px', weight: '500' },
};

export const space = {
    1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40,
};

export const radius = {
    sm: 8, md: 12, lg: 16, xl: 20, '2xl': 24, pill: 999,
};

export const shadow = {
    floating: '0 14px 36px rgba(0, 0, 0, 0.22)',
    subtle:   '0 4px 14px rgba(0, 0, 0, 0.08)',
};

export const motion = {
    durations: {
        fast:   150,
        normal: 250,
        smooth: 350,
    },
};

export const components = {
    dock:    { height: 56 },
    slider:  { height: 28 },
    compact: { height: 38 },
    widget:  { width: 240 },
    system:  { width: 300 },
};
