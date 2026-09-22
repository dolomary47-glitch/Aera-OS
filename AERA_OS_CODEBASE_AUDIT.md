# Aera OS — Comprehensive Codebase Audit

> **Project Name:** Aera OS *(formerly referenced as Dream OS in early design documents)*  
> **Target Platform:** Ubuntu 24.04 LTS (GNOME Shell 46, Wayland / X11)  
> **Audit Date:** September 2026  
> **Audit Type:** Read-Only Technical Architecture & Codebase Review  

---

# 1. Repo Overview

### 1.1 Directory Tree

```text
/home/mary/Documents/OS/Aera OS/
├── README.md
├── AERA_OS_CODEBASE_AUDIT.md
├── design-system/
│   ├── AERA_DESIGN_TOKENS_V1.md          # Full design token specification (Markdown)
│   ├── README.md                          # Architecture doc for token consumption
│   ├── aera-theme.css                     # Reference CSS implementation of tokens
│   ├── aera-tokens.js                     # ES Module token exports for GNOME extensions
│   └── tokens.json                        # Canonical JSON source of truth for all tokens
├── docs/
│   ├── AERA_DESIGN_TOKENS_V1.md           # Copy of design token specification
│   └── Aera_OS_Roadmap_16_semaines.md     # 16-week master product & engineering roadmap
├── extensions/
│   ├── aera-clock/                        # Centered desktop clock extension
│   │   ├── aera-tokens.js                 # Symlink → ../../design-system/aera-tokens.js
│   │   ├── extension.js                   # Extension entry point & layout logic
│   │   ├── metadata.json                  # Extension metadata (UUID: aera-clock@aeraos)
│   │   └── stylesheet.css                 # Clock typography & text glow styling
│   ├── aera-dock/                         # Custom desktop application dock extension
│   │   ├── assets/
│   │   │   ├── aera-launcher-symbolic.svg # Isometric cube symbolic (left segment, CSS-tintable)
│   │   │   └── workspace-view-symbolic.svg# Stacked window cards symbolic (right segment, CSS-tintable)
│   │   ├── extension.js                   # Extension entry point (chrome registration)
│   │   ├── metadata.json                  # Extension metadata (UUID: aera-dock@aeraos)
│   │   ├── modules/
│   │   │   ├── aeraLauncher.js            # Left segment launcher button controller
│   │   │   ├── appItem.js                 # Individual app button widget & window focus
│   │   │   ├── appManager.js              # Favorite & running apps synchronizer
│   │   │   ├── dock.js                    # Dock container, positioning & overview bridge
│   │   │   └── workspaceManager.js        # Multitasking view toggle controller
│   │   └── stylesheet.css                 # Split-pill frosted glass styling
│   ├── aera-widgets/                      # Left-side widget zone (Semaine 4/7/8)
│   │   ├── aera-tokens.js                 # Symlink → ../../design-system/aera-tokens.js
│   │   ├── extension.js                   # Entry point: GSettings load + chrome registration
│   │   ├── metadata.json                  # Extension metadata (UUID: aera-widgets@aeraos)
│   │   ├── modules/
│   │   │   ├── widgetManager.js           # Bottom-left anchor column, light/dark root class, reposition
│   │   │   └── weatherWidget.js           # Open-Meteo weather + GeoClue2 location + city override
│   │   ├── schemas/
│   │   │   └── org.gnome.shell.extensions.aera-widgets.gschema.xml  # Per-widget persisted config
│   │   └── stylesheet.css                 # Glass token-styled widget cards (aera-light/aera-dark pairs)
│   ├── aera-system/                       # Right-side system panel (Semaine 8/9)
│   │   ├── aera-tokens.js                 # Symlink → ../../design-system/aera-tokens.js
│   │   ├── extension.js                   # Entry point (chrome registration)
│   │   ├── metadata.json                  # Extension metadata (UUID: aera-system@aeraos)
│   │   ├── modules/
│   │   │   ├── systemPanel.js             # Bottom-right glass card, tiles + sliders, reposition
│   │   │   ├── controls.js                # ToggleTile & SliderRow (reuses .quick-toggle conventions)
│   │   │   ├── dbus.js                    # Shared Properties.Get/Set helpers
│   │   │   ├── wifiTile.js                # NetworkManager D-Bus backend (real SSID, on/off)
│   │   │   ├── bluetoothTile.js           # BlueZ adapter backend
│   │   │   ├── batteryTile.js             # UPower DisplayDevice info tile
│   │   │   ├── screenshotTile.js          # Shell built-in screenshot UI (org.gnome.Shell.Screenshot)
│   │   │   ├── volumeTile.js              # Gvc mixer slider + mute (PipeWire)
│   │   │   └── brightnessTile.js          # org.gnome.SettingsDaemon.Power.Screen slider
│   │   └── stylesheet.css                 # Quick-settings card styling (scheme class pairs)
│   └── aera-shell/                        # Early exploratory shell stubs
│       ├── aera-clock@aeraos/             # Secondary copy of aera-clock
│       │   ├── aera-tokens.js
│       │   ├── extension.js
│       │   ├── metadata.json
│       │   └── stylesheet.css
│       └── aerashell@aerasos.dev.com/     # Empty starter extension stub
│           ├── extension.js
│           ├── metadata.json
│           └── stylesheet.css
├── references/
│   ├── README.md
│   └── Transparent-shell-theme-4.8/       # Upstream base theme reference assets
│       └── Transparent shell theme 4.8/
│           └── gnome-shell/
│               ├── calendar-event-disabled.svg
│               ├── calendar-event-today.svg
│               ├── calendar-event.svg
│               ├── gnome-shell.css
│               └── workspace-placeholder.svg
├── scripts/
│   ├── README.md
│   ├── install-aera-clock.sh              # Installation script for Aera Clock
│   └── install-aera-os.sh                 # Full desktop install (all extensions + schemas)
├── tests/
│   └── README.md
└── theme/
    ├── Aera-Theme-1.0.tar.gz              # Distribution tarball
    ├── README.md                          # Theme compilation & installation guide
    ├── assets/                            # 49 SVG assets for GNOME Shell controls
    ├── dist/                              # Compiled installable theme packages
    │   ├── Aera/
    │   │   ├── gnome-shell/
    │   │   │   ├── calendar-event-disabled.svg
    │   │   │   ├── calendar-event-today.svg
    │   │   │   ├── calendar-event.svg
    │   │   │   ├── gnome-shell.css
    │   │   │   └── workspace-placeholder.svg
    │   │   └── index.theme
    │   ├── LICENSE
    │   ├── README.md
    │   └── install.sh                     # Theme installation script
    ├── scripts/
    │   ├── build-theme.js                 # Theme builder & asset deployer
    │   └── package-theme.sh               # Tarball archive packager
    └── src/                               # Modular SCSS source code (11 components)
        ├── components/
        │   ├── _app-grid.scss
        │   ├── _base.scss
        │   ├── _calendar.scss
        │   ├── _dialogs.scss
        │   ├── _menus.scss
        │   ├── _notifications.scss
        │   ├── _osd-switcher.scss
        │   ├── _overview.scss
        │   ├── _panel.scss
        │   ├── _quick-settings.scss
        │   └── _search.scss
        ├── gnome-shell-dark.scss
        ├── gnome-shell-light.scss
        └── tokens/
            ├── _dark-tokens.scss
            ├── _index.scss
            ├── _light-tokens.scss
            └── _tokens.scss
```

---

### 1.2 GNOME Shell Extensions Present

| Extension Folder | UUID (from `metadata.json`) | Target Shell Versions | Description / Role |
|---|---|---|---|
| `extensions/aera-dock` | `aera-dock@aeraos` | 45, 46, 47, 48, 49, 50 | Custom "Split-Pill" floating application dock and multitasking controller. |
| `extensions/aera-clock` | `aera-clock@aeraos` | 45, 46, 47, 48, 49, 50 | Minimalist centered desktop clock & date widget anchored behind windows. |
| `extensions/aera-widgets` | `aera-widgets@aeraos` | 45, 46, 47, 48, 49, 50 | Left widget zone: WidgetManager + live weather widget (Open-Meteo, GeoClue2, GSettings). |
| `extensions/aera-system` | `aera-system@aeraos` | 45, 46, 47, 48, 49, 50 | Right system panel: Wi-Fi/Bluetooth/battery/screenshot tiles + volume/brightness sliders on real backends. |
| `extensions/aera-shell/aerashell@aerasos.dev.com` | `aerashell@aerasos.dev.com` | 46 | Minimal starter extension stub (empty `enable()`/`disable()`). **Flagged as dead code — removal pending owner decision.** |
| `extensions/aera-shell/aera-clock@aeraos` | `aera-clock@aeraos` | 45, 46, 47, 48, 49, 50 | Duplicate backup copy of the clock extension. |

---

### 1.3 Target Versions & Environment

- **Primary Target:** GNOME Shell 46 on Ubuntu 24.04 LTS (tested under Wayland and X11 sessions, also verified on Zorin OS 18).
- **Extension Engine:** Modern GJS utilizing ES Modules (`import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js'`).
- **Compatibility Array:** Declared across `metadata.json` for GNOME 45 through GNOME 50.

---

### 1.4 External Dependencies & Build Tooling

- **No npm runtime or build packages:** Zero `node_modules` required.
- **Theme Builder:** Pure Node.js script (`theme/scripts/build-theme.js`) using built-in `fs` and `path` modules.
- **Extensions Implementation:** 100% custom codebase built from scratch using GNOME Shell native APIs (`Shell.AppSystem`, `global.settings`, `global.workspace_manager`, `Main.overview`, `Clutter`, `St`). No third-party extension code (such as Dash to Dock codebase) is imported into `extensions/aera-dock`.

---

# 2. Theme Architecture

### 2.1 GTK Theme Structure

- **Current State:** There is **no GTK 3, GTK 4, or libadwaita theme** in the repository.
- **Scope:** The theming layer in the codebase is exclusively focused on the **GNOME Shell UI layer** (`gnome-shell.css`). Applications rely on the standard system GTK theme (e.g. Yaru / Adwaita).

---

### 2.2 GNOME Shell Theme Restyling Coverage

The GNOME Shell theme sources in `theme/src/` and compiled distribution in `theme/dist/Aera/gnome-shell/gnome-shell.css` restyle the following UI components:

1. **Top Panel (`#panel`):** Background transparency, panel button padding, status indicator alignment.
2. **Popup Menus & Submenus (`.popup-menu`, `.popup-sub-menu`, `.popup-menu-item`):** Frosted glass surfaces, item padding, hover and active states.
3. **Quick Settings (`.quick-settings-grid`, `.quick-toggle`):** Rounded action tiles, slider troughs, submenu containers.
4. **Notifications & Message Tray (`.notification-banner`, `.message`):** Frosted cards, message headers, action buttons.
5. **OSD Windows (`.osd-window`, `.level`):** Centered floating volume/brightness overlays with pill level bars.
6. **Modal & Authentication Dialogs (`.modal-dialog`, `.prompt-dialog`, `.end-session-dialog`):** Dialog backgrounds, linked action buttons, password entries.
7. **App Grid & App Well (`.icon-grid`, `.app-well-app`, `.app-folder`):** App icon padding, running dots, folder popups, page indicator pills.
8. **Search Entry & Results (`.search-entry`, `.list-search-result`, `.grid-search-result`):** Translucent search bars, selected result highlights.
9. **Lock Screen & Screen Shield (`.screen-shield-clock`, `.unlock-dialog`):** Hero time typography, date display, user authentication widgets.
10. **Controls (`.button`, `StEntry`, `StScrollBar`, `toggle-switch`, `slider`):** Form controls and interactive widgets.

---

### 2.3 Canonical Design Tokens

All tokens are centrally defined in `design-system/tokens.json` and mirrored in `design-system/aera-tokens.js` and `design-system/aera-theme.css`:

#### Colors
- **Global Accent:**
  - `accent.primary`: `#03DFF8`
  - `accent.on-primary`: `#061316`
  - `accent.hover`: `#33E8FA`
  - `accent.pressed`: `#02B8D0`
  - `accent.muted`: `rgba(3, 223, 248, 0.20)`
  - `accent.glow`: `rgba(3, 223, 248, 0.35)`
- **Light Mode Surfaces:**
  - `light.surface.root`: `rgba(240, 243, 246, 0.92)`
  - `light.surface.strong`: `rgba(255, 255, 255, 0.95)`
  - `light.surface.subtle`: `rgba(255, 255, 255, 0.70)`
  - `light.surface.inner`: `rgba(255, 255, 255, 0.60)`
  - `light.surface.card`: `rgba(255, 255, 255, 0.75)`
  - `light.border.glass`: `rgba(255, 255, 255, 0.80)`
  - `light.border.subtle`: `rgba(0, 0, 0, 0.08)`
  - `light.text.primary`: `#111827`
  - `light.text.secondary`: `#4B5563`
  - `light.text.muted`: `#9CA3AF`
  - `light.text.disabled`: `rgba(17, 24, 39, 0.35)`
- **Dark Mode Surfaces:**
  - `dark.surface.root`: `rgba(18, 22, 30, 0.88)`
  - `dark.surface.strong`: `rgba(24, 29, 39, 0.94)`
  - `dark.surface.subtle`: `rgba(255, 255, 255, 0.08)`
  - `dark.surface.inner`: `rgba(255, 255, 255, 0.06)`
  - `dark.surface.card`: `rgba(255, 255, 255, 0.08)`
  - `dark.border.glass`: `rgba(255, 255, 255, 0.16)`
  - `dark.border.subtle`: `rgba(255, 255, 255, 0.08)`
  - `dark.text.primary`: `#FFFFFF`
  - `dark.text.secondary`: `#C6CBD3`
  - `dark.text.muted`: `#8E95A2`
  - `dark.text.disabled`: `rgba(255, 255, 255, 0.35)`

#### Typography
- **Font Family:** `Inter, 'SF Pro Display', 'Cantarell', 'Ubuntu', sans-serif`
- **Scale:**
  - `display`: `80px` / weight `700` (Hero clock face)
  - `metric`: `20px` / weight `600` (Date lines, hero numbers)
  - `label`: `13px` / weight `600` (Buttons, control labels)
  - `caption`: `11px` / weight `500` (Metadata, timestamps)

#### Spacing & Radius Scale
- **Spacing Scale:** `space.1 = 4px`, `space.2 = 8px`, `space.3 = 12px`, `space.4 = 16px`, `space.5 = 20px`, `space.6 = 24px`, `space.8 = 32px`, `space.10 = 40px`
- **Corner Radii:** `radius.sm = 8px`, `radius.md = 12px`, `radius.lg = 16px`, `radius.xl = 20px`, `radius.2xl = 24px`, `radius.pill = 999px`

#### Shadows, Blur & Motion
- `shadow.floating`: `0 14px 36px rgba(0, 0, 0, 0.22)`
- `shadow.subtle`: `0 4px 14px rgba(0, 0, 0, 0.08)`
- `glass.blurRadius`: `25` (Note: CSS `backdrop-filter` is unsupported in St; blur is simulated via semi-transparent alphas and text-shadows, or `Shell.BlurEffect` in JS)
- `duration.fast`: `150ms`, `duration.normal`: `250ms`, `duration.smooth`: `350ms`

---

### 2.4 Light/Dark Mode Implementation

Light/Dark switching is supported through two mechanisms:
1. **Extension Stylesheets (`:-gtk-dark`):** Handled directly by St using the `:-gtk-dark` pseudo-class selector inside `stylesheet.css` rules.
2. **Theme SCSS Pipeline:** Dual entry-points `theme/src/gnome-shell-dark.scss` and `theme/src/gnome-shell-light.scss` importing their respective token sets (`_dark-tokens.scss` and `_light-tokens.scss`).

---

### 2.5 Verbatim Theme SCSS Source Excerpts

#### `theme/src/tokens/_tokens.scss` (Full File)

```scss
// =============================================================================
// Aera OS Design Tokens — Shared / Base Tokens
// Source of truth: design-system/tokens.json
// =============================================================================

// Accent Palette
$accent-primary:    #03DFF8;
$accent-on-primary: #061316;
$accent-hover:      #33E8FA;
$accent-pressed:    #02B8D0;
$accent-muted:      rgba(3, 223, 248, 0.20);
$accent-glow:       rgba(3, 223, 248, 0.35);

// Typography
$font-family:       Inter, "SF Pro Display", Cantarell, Ubuntu, sans-serif;
$font-size-base:    11pt;
$type-display-size: 80px;
$type-display-weight: 700;
$type-metric-size:  20px;
$type-metric-weight: 600;
$type-label-size:   13px;
$type-label-weight: 600;
$type-caption-size: 11px;
$type-caption-weight: 500;

// Spacing Scale
$space-1:  4px;
$space-2:  8px;
$space-3: 12px;
$space-4: 16px;
$space-5: 20px;
$space-6: 24px;
$space-8: 32px;
$space-10: 40px;

// Corner Radii
$radius-sm:   8px;
$radius-md:  12px;
$radius-lg:  16px;
$radius-xl:  20px;
$radius-2xl: 24px;
$radius-pill: 999px;

// Shadows
$shadow-floating: 0 14px 36px rgba(0, 0, 0, 0.22);
$shadow-subtle:   0 4px 14px rgba(0, 0, 0, 0.08);
$shadow-focus:    0 0 0 2px $accent-primary, 0 0 12px $accent-glow;

// Motion
$duration-fast:   150ms;
$duration-normal: 250ms;
$duration-smooth: 350ms;
```

#### `theme/src/tokens/_dark-tokens.scss` (Full File)

```scss
// =============================================================================
// Aera OS Design Tokens — Dark Variant
// =============================================================================

@import "tokens";

// Surfaces & Glass
$surface-root:    rgba(18, 22, 30, 0.88);
$surface-strong:  rgba(24, 29, 39, 0.94);
$surface-subtle:  rgba(255, 255, 255, 0.08);
$surface-inner:   rgba(255, 255, 255, 0.06);
$card-bg:         rgba(255, 255, 255, 0.08);

$glass-bg:        rgba(18, 22, 30, 0.88);
$glass-strong-bg: rgba(24, 29, 39, 0.94);
$glass-inner-bg:  rgba(255, 255, 255, 0.06);

// Borders
$border-glass:    rgba(255, 255, 255, 0.16);
$border-subtle:   rgba(255, 255, 255, 0.08);

// Text
$text-primary:    #FFFFFF;
$text-secondary:  #C6CBD3;
$text-muted:      #8E95A2;
$text-disabled:   rgba(255, 255, 255, 0.35);

// Contextual
$panel-bg:        rgba(18, 22, 30, 0.75);
$entry-bg:        rgba(255, 255, 255, 0.08);
$slider-bg:       rgba(255, 255, 255, 0.15);
$osd-bg:          rgba(18, 22, 30, 0.92);

// Toggle Switch Assets
$toggle-on-asset:  "assets/toggle-on.svg";
$toggle-off-asset: "assets/toggle-off.svg";
```

#### `theme/src/components/_panel.scss` (Full File)

```scss
// =============================================================================
// Aera OS — Top Panel & Status Area
// Translucent glass bar, crisp typography, clean status indicators
// =============================================================================

#panel {
    background-color: $panel-bg;
    font-family: $font-family;
    font-size: $type-label-size;
    font-weight: 600;
    height: 34px;
    border-bottom: 1px solid $border-glass;
    transition-duration: $duration-normal;

    &:overview,
    &.unlock-screen,
    &.login-screen {
        background-color: transparent;
        border-bottom-color: transparent;
    }

    .panel-corner {
        -panel-corner-radius: 0;
    }
}

.panel-button {
    font-weight: 600;
    color: $text-primary;
    -natural-hpadding: $space-3;
    -minimum-hpadding: $space-2;
    transition-duration: $duration-fast;
    border-radius: $radius-sm;

    &:hover, &:focus {
        color: $text-primary;
        background-color: rgba(255, 255, 255, 0.12);
    }

    &:active, &:checked {
        color: $accent-primary;
        background-color: rgba(255, 255, 255, 0.18);
    }

    .system-status-icon {
        icon-size: 16px;
        padding: 0 2px;
        color: $text-primary;
    }

    .clock {
        font-weight: 700;
        font-size: $type-label-size;
        letter-spacing: 0.5px;
    }
}

.panel-status-indicators-box {
    spacing: $space-1;
}

#panelActivities {
    border-radius: $radius-pill;
    margin: 3px $space-2;
    padding: 0 $space-3;

    &:hover {
        background-color: rgba(255, 255, 255, 0.15);
    }
}
```

---

# 3. Dock Extension (`extensions/aera-dock`)

### 3.1 Implementation Approach

The Aera Dock is a **custom GNOME Shell extension built from scratch** using GJS and native Shell APIs. It is **not** a fork or skin over Dash to Dock or Ubuntu Dock.

- **Presentation Layer:** Creates two distinct floating segments inside a root `St.BoxLayout` positioned at the bottom of the primary monitor.
- **GNOME API Integration:**
  - `Shell.AppSystem.get_default()`: Tracks installed applications and runtime state transitions (`app-state-changed`).
  - `global.settings.get_strv('favorite-apps')`: Synchronizes with GNOME's native pinned favorites list.
  - `global.display.focus_window`: Tracks active window focus to light up the running indicator.
  - `Main.overview`: Connects to `showing`/`hiding` events to hide the redundant native overview dash and toggle the overview state.

---

### 3.2 Implemented vs. Planned Features

| Feature | Status | Implementation Details |
|---|---|---|
| **Split-Pill Segmented Silhouette** | **Implemented** | Left segment for launcher (`12px 0 0 12px`), right segment for apps (`0 12px 12px 0`). |
| **Favorite / Pinned Applications** | **Implemented** | Dynamically loaded from `org.gnome.shell.favorite-apps`. |
| **Running Application Detection** | **Implemented** | Unpinned running apps automatically append to the right bar. |
| **Click to Launch** | **Implemented** | Invokes `app.open_new_window(-1)` if app is closed. |
| **Click to Focus / Activate** | **Implemented** | Invokes `Main.activateWindow(win)` if app has 1 open window. |
| **Multi-window Cycling** | **Implemented** | Cycles through windows on successive clicks if multiple windows exist. |
| **Right-Click New Window** | **Implemented** | Secondary click launches new instance (`button === 3`). |
| **Running Indicator Dot** | **Implemented** | Neutral white dot below running icons; expands when focused. |
| **Hover Tooltip** | **Implemented** | Floating `St.Label` hovering above icons with fade ease. |
| **Double Dock Suppression** | **Implemented** | Automatically calls `Main.overview.dash.hide()` on overview transitions. |
| **Dynamic Repositioning** | **Implemented** | Re-anchors to `monitor.y + monitor.height - height - 4px` on resolution/allocation change. |
| **Drag-and-Drop Reordering** | *Planned* | Not yet implemented in V1. |
| **Context Menu / App Quicklists** | *Planned* | Basic right-click implemented; full popup menu planned. |
| **Intellihide / Autohide** | *Planned* | Fixed floating position in current build. |
| **Preferences GUI (`prefs.js`)** | *Planned* | Not yet present. |

---

### 3.3 Default Icons Shown & Launch Actions

The dock renders icons dynamically from GNOME's configuration:

```text
┌─────────────────────────┐  ┌────────────────────────────────────────────────────────────────────────┐
│  [1] Aera Launcher      │  │  [2] Firefox   [3] Files   [4] Software   [5] Help   [6] Multitasking    │
│       (Cube Icon)       │  │                                                          (Window Cards)  │
└─────────────────────────┘  └────────────────────────────────────────────────────────────────────────┘
```

1. **Aera Launcher (3D Cube SVG):** Hardcoded launcher button; clicking triggers `Main.overview.toggle()`.
2. **Firefox Browser (`firefox.desktop`):** Default pinned browser; launches/focuses Firefox.
3. **File Manager (`org.gnome.Nautilus.desktop`):** Default pinned file manager; launches/focuses Nautilus.
4. **App Center / Software (`snap-store_snap-store.desktop` or `org.gnome.Software.desktop`):** Default Ubuntu software store (orange "A" icon).
5. **Help / Yelp (`yelp.desktop`):** Default system documentation (question mark icon).
6. **Multitasking View (Overview SVG):** Dedicated overview toggle button; clicking triggers `Main.overview.toggle()`.
*(Any unpinned application launched by the user dynamically appears between the favorites and the multitasking button).*

---

### 3.4 Settings Schema & Preferences (`gschema.xml` / `prefs.js`)

- **Current State:** There is **no `gschema.xml` schema** and **no `prefs.js`** in `extensions/aera-dock`.
- **Configuration:** All layout dimensions, icon sizes (34px), and styling are token-driven via `stylesheet.css` and JavaScript module constants.

---

### 3.5 Verbatim Extension Source Code

#### `extensions/aera-dock/metadata.json`

```json
{
  "name": "Aera Dock",
  "description": "The official desktop application dock and workspace switcher for Aera OS.",
  "uuid": "aera-dock@aeraos",
  "shell-version": [
    "45",
    "46",
    "47",
    "48",
    "49",
    "50"
  ],
  "version": 1
}
```

#### `extensions/aera-dock/extension.js`

```javascript
/**
 * Aera OS Dock — GNOME Shell 46 Extension Entry Point
 * Part of Aera OS Desktop Environment
 */

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { AeraDock } from './modules/dock.js';

export default class AeraDockExtension extends Extension {
    enable() {
        this._dock = new AeraDock(this.path);

        // Add to GNOME Shell chrome tracking
        Main.layoutManager.addChrome(this._dock.actor, {
            affectsStruts: false,
            trackFullscreen: true,
        });
    }

    disable() {
        if (this._dock) {
            Main.layoutManager.removeChrome(this._dock.actor);
            this._dock.destroy();
            this._dock = null;
        }
    }
}
```

#### `extensions/aera-dock/modules/dock.js`

```javascript
/**
 * Aera OS Dock — Main Dock Container Module
 * Coordinates the launcher, applications tray, workspace switcher, and tooltip.
 */

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { AeraLauncher } from './aeraLauncher.js';
import { AppManager } from './appManager.js';
import { WorkspaceManager } from './workspaceManager.js';

export class AeraDock {
    constructor(extensionPath) {
        this._extensionPath = extensionPath;
        this._repositioning = false;

        // ── 1. Floating Dock Box ─────────────────────────────────────────────
        this.actor = new St.BoxLayout({
            name: 'aeraDock',
            style_class: 'aera-dock-container',
            reactive: true,
            track_hover: true,
        });

        // ── 2. Tooltip Manager ───────────────────────────────────────────────
        this._tooltip = new St.Label({
            style_class: 'aera-dock-tooltip',
            opacity: 0,
            visible: false,
        });
        Main.uiGroup.add_child(this._tooltip);

        const showTooltip = (targetActor, text) => this._showTooltip(targetActor, text);
        const hideTooltip = () => this._hideTooltip();

        // ── 3. Left Segment: Aera Launcher (Rounded Left, Straight Right) ─────
        this._leftSegment = new St.BoxLayout({
            style_class: 'aera-dock-segment aera-dock-launcher-segment',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._launcher = new AeraLauncher(this._extensionPath, showTooltip, hideTooltip);
        this._leftSegment.add_child(this._launcher.actor);
        this.actor.add_child(this._leftSegment);

        // ── 4. Right Segment: Apps & Multitasking (Straight Left, Rounded Right)
        this._rightSegment = new St.BoxLayout({
            style_class: 'aera-dock-segment aera-dock-bar',
            y_align: Clutter.ActorAlign.CENTER,
        });

        // Applications Box
        this._appManager = new AppManager(showTooltip, hideTooltip);
        this._rightSegment.add_child(this._appManager.actor);

        // Workspaces / Overview Box
        this._workspaceManager = new WorkspaceManager(this._extensionPath, showTooltip, hideTooltip);
        this._rightSegment.add_child(this._workspaceManager.actor);

        this.actor.add_child(this._rightSegment);

        // ── 5. Suppress Default Overview Dash (Avoid Double Dock) ─────────────
        if (Main.overview.dash) {
            this._origDashVisible = Main.overview.dash.visible;
            Main.overview.dash.hide();
        }

        this._overviewShowingDashId = Main.overview.connect('showing', () => {
            if (Main.overview.dash)
                Main.overview.dash.hide();
        });

        // ── 6. Dynamic Repositioning ─────────────────────────────────────────
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => {
            this.reposition();
        });

        this._allocId = this.actor.connect('notify::allocation', () => {
            this._queueReposition();
        });

        this._queueReposition();
    }

    _queueReposition() {
        if (this._queuedRepositionId) return;
        this._queuedRepositionId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._queuedRepositionId = null;
            this.reposition();
            return GLib.SOURCE_REMOVE;
        });
    }

    reposition() {
        if (this._repositioning) return;
        this._repositioning = true;

        try {
            const monitor = Main.layoutManager.primaryMonitor;
            if (!monitor || !this.actor) return;

            this.actor.ensure_style();
            const [, natWidth] = this.actor.get_preferred_width(-1);
            const [, natHeight] = this.actor.get_preferred_height(-1);

            const width = natWidth > 0 ? natWidth : 350;
            const height = natHeight > 0 ? natHeight : 54;

            // Centered horizontally, 4px from the bottom edge
            const x = Math.round(monitor.x + (monitor.width - width) / 2);
            const y = Math.round(monitor.y + monitor.height - height - 4);

            this.actor.set_position(x, y);
            this.actor.set_size(width, height);
        } finally {
            this._repositioning = false;
        }
    }

    _showTooltip(targetActor, text) {
        if (!this._tooltip || !targetActor) return;

        this._tooltip.set_text(text);
        this._tooltip.ensure_style();
        this._tooltip.show();

        // Calculate absolute screen position above the target actor
        const [targetX, targetY] = targetActor.get_transformed_position();
        const targetWidth = targetActor.get_width();
        const tooltipWidth = this._tooltip.get_width();
        const tooltipHeight = this._tooltip.get_height();

        const x = Math.round(targetX + (targetWidth - tooltipWidth) / 2);
        const y = Math.round(targetY - tooltipHeight - 8);

        this._tooltip.set_position(x, y);
        this._tooltip.ease({
            opacity: 255,
            duration: 150,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
    }

    _hideTooltip() {
        if (!this._tooltip) return;

        this._tooltip.ease({
            opacity: 0,
            duration: 100,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                if (this._tooltip)
                    this._tooltip.hide();
            },
        });
    }

    destroy() {
        if (this._queuedRepositionId) {
            GLib.source_remove(this._queuedRepositionId);
            this._queuedRepositionId = null;
        }

        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }

        if (this._allocId) {
            this.actor.disconnect(this._allocId);
            this._allocId = null;
        }

        if (this._overviewShowingDashId) {
            Main.overview.disconnect(this._overviewShowingDashId);
            this._overviewShowingDashId = null;
        }

        // Restore overview dash visibility
        if (Main.overview.dash) {
            Main.overview.dash.show();
        }

        if (this._tooltip) {
            Main.uiGroup.remove_child(this._tooltip);
            this._tooltip.destroy();
            this._tooltip = null;
        }

        if (this._launcher) {
            this._launcher.destroy();
            this._launcher = null;
        }

        if (this._appManager) {
            this._appManager.destroy();
            this._appManager = null;
        }

        if (this._workspaceManager) {
            this._workspaceManager.destroy();
            this._workspaceManager = null;
        }

        this.actor.destroy();
    }
}
```

#### `extensions/aera-dock/modules/appItem.js` (Excerpts: Core Logic)

```javascript
export class AppItem {
    constructor(app, isFavorite, showTooltip, hideTooltip) {
        this.app = app;
        this.isFavorite = isFavorite;
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;

        this.actor = new St.Button({
            style_class: 'aera-dock-app-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._contentBox = new St.BoxLayout({
            vertical: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.actor.set_child(this._contentBox);

        this._icon = this.app.create_icon_texture(34);
        if (!this._icon) {
            this._icon = new St.Icon({
                icon_name: 'application-x-executable',
                icon_size: 34,
            });
        }
        this._icon.x_align = Clutter.ActorAlign.CENTER;
        this._contentBox.add_child(this._icon);

        this._runningDot = new St.Widget({
            style_class: 'aera-dock-running-dot',
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._contentBox.add_child(this._runningDot);

        this._clickedId = this.actor.connect('clicked', (actor, button) => {
            this._handleClick(button);
        });

        this._enterId = this.actor.connect('enter-event', () => {
            if (this._showTooltip) {
                const name = this.app.get_name() || 'Application';
                this._showTooltip(this.actor, name);
            }
        });

        this._leaveId = this.actor.connect('leave-event', () => {
            if (this._hideTooltip)
                this._hideTooltip();
        });

        this.updateState();
    }

    _handleClick(button) {
        const windows = this.app.get_windows();

        if (button === 3) {
            this.app.open_new_window(-1);
            return;
        }

        if (windows.length === 0) {
            this.app.open_new_window(-1);
        } else if (windows.length === 1) {
            const win = windows[0];
            if (win.has_focus() && !Main.overview.visible) {
                win.activate(global.get_current_time());
            } else {
                Main.activateWindow(win);
            }
        } else {
            const focusedWin = global.display.focus_window;
            let targetWin = windows[0];

            if (focusedWin && windows.includes(focusedWin)) {
                const idx = windows.indexOf(focusedWin);
                targetWin = windows[(idx + 1) % windows.length];
            }
            Main.activateWindow(targetWin);
        }

        if (Main.overview.visible)
            Main.overview.hide();
    }

    updateState() {
        const isRunning = this.app.state === Shell.AppState.RUNNING;
        const windows = this.app.get_windows();

        if (isRunning && windows.length > 0) {
            this._runningDot.show();
            const focusedWin = global.display.focus_window;
            if (focusedWin && windows.includes(focusedWin)) {
                this.actor.add_style_class_name('focused');
            } else {
                this.actor.remove_style_class_name('focused');
            }
        } else {
            this._runningDot.hide();
            this.actor.remove_style_class_name('focused');
        }
    }
    // ... [destroy() omitted for brevity]
}
```

#### `extensions/aera-dock/stylesheet.css` (Full File)

```css
/* =============================================================================
 * Aera OS Dock — Extension Stylesheet
 * Refined split-pill frosted glass floating dock matching visual reference
 * ============================================================================= */

/* ── Outer Dock Container (Positioned at bottom center) ─────────────────────── */
.aera-dock-container {
    spacing: 3px;
}

/* ── Segment Card Base (Frosted Glass Surface) ──────────────────────────────── */
.aera-dock-segment {
    background-color: rgba(28, 32, 44, 0.60);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    padding: 3px 5px;
}

/* ── Left Segment: Aera Launcher (Left side rounded, right side straight) ───── */
.aera-dock-launcher-segment {
    border-radius: 12px 0 0 12px;
}

.aera-dock-launcher-button {
    width: 46px;
    height: 46px;
    border-radius: 8px 0 0 8px;
    border: 1px solid transparent;
    transition-duration: 120ms;
}

.aera-dock-launcher-button:hover {
    background-color: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.15);
}

.aera-dock-launcher-button:active,
.aera-dock-launcher-button:checked {
    background-color: rgba(255, 255, 255, 0.20);
    border-color: rgba(255, 255, 255, 0.25);
}

.aera-dock-launcher-icon {
    icon-size: 30px;
}

/* ── Right Segment: Apps & Multitasking (Left side straight, right side rounded) */
.aera-dock-bar {
    border-radius: 0 12px 12px 0;
    spacing: 3px;
}

.aera-dock-apps-box {
    spacing: 2px;
}

/* ── Individual App Item ────────────────────────────────────────────────────── */
.aera-dock-app-button {
    width: 46px;
    height: 46px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition-duration: 120ms;
}

.aera-dock-app-button:hover,
.aera-dock-app-button:focus {
    background-color: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.12);
}

.aera-dock-app-button:active {
    background-color: rgba(255, 255, 255, 0.18);
}

.aera-dock-app-icon {
    icon-size: 34px;
}

/* ── Running Indicator Dot ─────────────────────────────────────────────────── */
.aera-dock-running-dot {
    width: 4px;
    height: 4px;
    border-radius: 999px;
    background-color: rgba(255, 255, 255, 0.75);
    margin-bottom: 2px;
    transition-duration: 150ms;
}

.aera-dock-app-button.focused .aera-dock-running-dot {
    background-color: #FFFFFF;
    box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
    width: 6px;
}

/* ── Multitasking / Overview Trigger Button ────────────────────────────────── */
.aera-dock-workspaces-box {
    spacing: 0;
}

.aera-dock-overview-button {
    width: 46px;
    height: 46px;
    border-radius: 0 8px 8px 0;
    border: 1px solid transparent;
    transition-duration: 120ms;
}

.aera-dock-overview-button:hover {
    background-color: rgba(255, 255, 255, 0.10);
    border-color: rgba(255, 255, 255, 0.12);
}

.aera-dock-overview-button:active,
.aera-dock-overview-button:checked {
    background-color: rgba(255, 255, 255, 0.18);
    border-color: rgba(255, 255, 255, 0.20);
}

/* ── Tooltip Bubble ────────────────────────────────────────────────────────── */
.aera-dock-tooltip {
    background-color: rgba(18, 22, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    text-align: center;
}
```

---

# 4. Clock Extension (`extensions/aera-clock`)

### 4.1 Architecture & Separation

- **Type:** Standalone GNOME Shell extension (`extensions/aera-clock`, UUID: `aera-clock@aeraos`).
- **Separation:** It is **not** part of the top bar / panel; it is rendered as a hero desktop clock attached behind all windows directly on `Main.layoutManager._backgroundGroup`.

---

### 4.2 Positioning & Visual Format

- **Position:** Horizontally centered, placed vertically at **22% from the top** of the primary monitor:
  $$y = \text{monitor.y} + \mathrm{round}(\text{monitor.height} \times 0.22)$$
- **Time Format:** 24-hour time (`HH:MM`, e.g. `00:39`) formatted via `GLib.DateTime.new_now_local().format('%H:%M')`.
- **Date Line:** Rendered directly below the time label with `now.format('%a %e %b %Y')` (e.g. `Mon 21 Sep 2026`).
- **Typography & Glow:**
  - Time Label: `80px`, weight `700`, `letter-spacing: 2px`, layered glass text-shadow glow (`0 0 40px rgba(255, 255, 255, 0.55)`).
  - Date Label: `20px`, weight `600`, `letter-spacing: 1px`, soft glow (`0 0 18px rgba(255, 255, 255, 0.40)`).
- **Timer Loop:** Precision timer using `GLib.timeout_add_seconds` calculating exact remaining seconds until the next minute boundary:
  $$\text{secondsRemaining} = \max(1, 60 - \text{now.get\_second}())$$

---

### 4.3 Verbatim Source Code

#### `extensions/aera-clock/extension.js` (Full File)

```javascript
/**
 * Aera Clock — GNOME Shell Extension
 * Part of Aera OS Design System V1
 *
 * Tokens consumed from: ./aera-tokens.js → design-system/aera-tokens.js
 */

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as T from './aera-tokens.js';

export default class AeraClockExtension extends Extension {
    enable() {
        // Guard: clean up any stale panel indicator from a previous version
        if (Main.panel.statusArea && Main.panel.statusArea[this.uuid]) {
            try { Main.panel.statusArea[this.uuid].destroy(); } catch (e) {}
            delete Main.panel.statusArea[this.uuid];
        }

        this._buildWidget();
        this._updateTime();
        this._scheduleNextTick();

        this._monitorsChangedId = Main.layoutManager.connect(
            'monitors-changed', () => this._reposition()
        );
    }

    _buildWidget() {
        this._destroyWidget();

        // ── Time label — type.display ───────────────────────────────────────
        this._timeLabel = new St.Label({
            style_class: 'aera-clock-time',
            text: '',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        // ── Date label — type.metric ────────────────────────────────────────
        this._dateLabel = new St.Label({
            style_class: 'aera-clock-date',
            text: '',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        if (this._timeLabel.clutter_text)
            this._timeLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;
        if (this._dateLabel.clutter_text)
            this._dateLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        // ── Vertical box — no background, no card ──────────────────────────
        // Token usage: space.2 (8px) gap via CSS padding-top on date label
        this._box = new St.BoxLayout({
            name: 'AeraClockBox',
            vertical: true,
            reactive: false,
            can_focus: false,
            track_hover: false,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._box.add_child(this._timeLabel);
        this._box.add_child(this._dateLabel);

        // ── Screen-wide positioning wrapper ────────────────────────────────
        this._container = new St.Widget({
            name: 'AeraClockContainer',
            style_class: 'aera-clock-container',
            layout_manager: new Clutter.BinLayout(),
            reactive: false,
            can_focus: false,
            track_hover: false,
        });

        this._container.add_child(this._box);

        // Attach behind all windows, on the desktop background layer
        Main.layoutManager._backgroundGroup.add_child(this._container);

        this._reposition();

        // Deferred reposition after layout settles
        this._repositionTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            this._reposition();
            this._repositionTimeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _reposition() {
        if (!this._container)
            return;

        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor)
            return;

        this._container.set_width(monitor.width);
        // Position at 22% from top — intentional: gives space above for panel/notch area
        // Token reference: no explicit position token in V1; this is component-specific layout.
        const y = monitor.y + Math.round(monitor.height * 0.22);
        this._container.set_position(monitor.x, y);
    }

    _updateTime() {
        if (!this._timeLabel || !this._dateLabel)
            return;

        const now = GLib.DateTime.new_now_local();
        this._timeLabel.set_text(now.format('%H:%M'));
        this._dateLabel.set_text(
            now.format('%a %e %b %Y').replace(/\s+/g, ' ').trim()
        );
    }

    _scheduleNextTick() {
        this._stopTimer();

        const now = GLib.DateTime.new_now_local();
        const secondsRemaining = Math.max(1, 60 - now.get_second());

        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            secondsRemaining,
            () => {
                this._updateTime();
                this._scheduleNextTick();
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    _stopTimer() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _destroyWidget() {
        if (this._repositionTimeoutId) {
            GLib.source_remove(this._repositionTimeoutId);
            this._repositionTimeoutId = null;
        }

        if (this._container) {
            const parent = this._container.get_parent();
            if (parent)
                parent.remove_child(this._container);
            this._container.destroy();
            this._container = null;
        }

        this._box = null;
        this._timeLabel = null;
        this._dateLabel = null;
    }

    disable() {
        this._stopTimer();

        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }

        this._destroyWidget();
    }
}
```

---

# 5. Gaps vs. The Product Roadmap

A comparative analysis against `docs/Aera_OS_Roadmap_16_semaines.md`:

### 5.1 Existing in Codebase (Implemented or Scaffolding Present)

| Milestone | Component | Implementation State |
|---|---|---|
| **Semaine 1** | Foundation & Minimal Extension | **Complete** — Local dev scripts, GJS extension architecture. |
| **Semaine 2** | Design Token System V1 | **Complete** — `tokens.json` v1.2 (`motion.durations`, `components.*` added), `aera-tokens.js`, `aera-theme.css`, `_tokens.scss`. |
| **Semaine 3** | GNOME Shell Theme Layer | **Partially Implemented** — GNOME Shell SCSS & CSS compiled; GTK theme not yet created. |
| **Semaine 4** | Widget Zone Skeleton | **Implemented** — `extensions/aera-widgets/modules/widgetManager.js`: bottom-left chrome column, dock-mirrored repositioning, scheme-class light/dark, GSettings persistence. |
| **Semaine 5** | Desktop Hero Clock | **Complete** — `extensions/aera-clock` with precision GLib timer & glow typography. |
| **Semaine 6** | Desktop Dock (`aera-dock`) | **Functional Core Complete** — Split-pill floating dock, launcher button, favorite/running apps, window activation, overview toggle; symbolic CSS-tintable icons. |
| **Semaine 7** | Widget Architecture (M7) | **Implemented** — minimal widget contract `{ actor, destroy(), onSettingsChanged(key) }` + loading/error states, first project gschema compiled at install. |
| **Semaine 8** | Weather + System Widgets (M8) | **Weather implemented** — live Open-Meteo (key-free), GeoClue2 auto-location with city-search override, locale units with per-widget override, 15–30 min refresh. **System tiles implemented** — Wi-Fi (NetworkManager), Bluetooth (BlueZ), battery (UPower), screenshot/record (Shell built-in UI), volume (Gvc/PipeWire), brightness (SSD Power). |
| **Semaine 9** | Control Center Panel (M9) | **Partially Implemented** — `extensions/aera-system` floating bottom-right panel with real toggles/sliders; microphone toggle and per-app controls pending. |

---

### 5.2 Gaps (Not Yet Implemented / Missing from Codebase)

| Roadmap Component | Planned Milestone | Current State in Codebase |
|---|---|---|
| **GTK 3 / GTK 4 / Libadwaita Theme** | Semaine 3 | **Missing** — No GTK theme files exist in the repo. |
| **Widget Architecture & Framework** | Semaine 7 | **Implemented** — `extensions/aera-widgets` WidgetManager + widget contract + gschema. |
| **Weather Widget (`Widget météo`)** | Semaine 8 | **Implemented** — Open-Meteo fetch, GeoClue2 location, settings popover, skeleton/error states. |
| **Left-Side Widget Zone** | Semaine 4 & 8 | **Implemented** — bottom-left chrome column shared with weather card. |
| **Right-Side System Panel / Quick Toggles** | Semaine 8 & 9 | **Implemented (core)** — `extensions/aera-system`: Wi-Fi, Bluetooth, battery, screenshot tiles + brightness/volume sliders on real backends; microphone + night-light pending. |
| **Aera Launcher V1 / Standalone Search** | Semaine 11 & 12 | **Missing** — Dock cube currently triggers default `Main.overview.toggle()` instead of a dedicated search window. |
| **Aera Settings App (`Dream/Aera Settings`)** | Semaine 13 | **Missing** — No dedicated settings app or GNOME extension preferences UI. |
| **OOBE / First Run Experience** | Semaine 15 | **Missing** — No initial setup wizard. |
| **Custom Icon & Cursor Theme** | Target Arch | **Missing** — Relies on system default icon and cursor themes. |
| **ISO / Packaging Automation** | Post-16w | **Missing** — Theme packaging script exists (`package-theme.sh`), but no OS distribution ISO pipeline. |
