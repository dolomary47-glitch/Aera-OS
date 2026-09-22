# Aera OS

A custom desktop environment built on GNOME Shell 46 (Ubuntu 24.04 target), developed around a central, token-driven design system. Everything visual pulls from `design-system/tokens.json` — no hardcoded colors, spacing, or radii in extensions or theme.

## Components

| Piece | Path | Roadmap | What it does |
|---|---|---|---|
| Design tokens V1.2 | `design-system/` | S2 | Canonical tokens (`tokens.json`), ES-module mirror (`aera-tokens.js`) symlinked by every extension. |
| Shell theme | `theme/` | S3 | GNOME Shell SCSS theme (glass panels, quick-settings styling). |
| Hero clock | `extensions/aera-clock` | S5 | Large centered desktop clock, anchored behind windows. |
| Dock | `extensions/aera-dock` | S6 | Floating split-pill dock: launcher, running apps, multitasking toggle (symbolic CSS-tintable icons). |
| Widget zone | `extensions/aera-widgets` | S4/7/8 | Bottom-left widget column. Weather widget: live Open-Meteo data, GeoClue2 auto-location with city-search override, locale-aware units, 15–30 min refresh, GSettings persistence. |
| System panel | `extensions/aera-system` | S8/9 | Bottom-right quick-settings tray, collapsed by default behind a grid trigger button (click to open/close). Tiles: Wi-Fi (NetworkManager), Bluetooth (BlueZ), battery (UPower), screenshot/record (Shell built-in UI); sliders: volume (Gvc/PipeWire), brightness (GNSSD Power). Unavailable backends hide their control — nothing is faked. |

## Install (dev host or VM)

```bash
bash scripts/install-aera-os.sh
```

The script symlinks each extension into `~/.local/share/gnome-shell/extensions/`, compiles the GSettings schemas (`glib-compile-schemas`) for extensions that ship one, and enables them via `gnome-extensions`. Restart GNOME Shell (Wayland: log out/in, X11: `Alt+F2` → `r`) if extensions don't pick up.

To install only the clock: `bash scripts/install-aera-clock.sh`.

## Verifying live data (VM test gate)

- Wi-Fi tile state matches `nmcli radio wifi` and `nmcli -f NAME,TYPE c show --active`.
- Bluetooth tile matches `rfkill list bluetooth` / `bluetoothctl show`.
- Volume slider matches `pactl get-sink-volume @DEFAULT_SINK@`; mute matches `pactl get-sink-mute`.
- Weather shows the real location: automatic (GeoClue2 consent dialog on first run) or a city searched in the widget's settings popover (`⋮` → gear).
- Widget zone stays bottom-left and system panel bottom-right on monitor resize/reconnect.
- `gnome-extensions disable` of either extension tears down cleanly (no stray actors, no D-Bus signal leaks).

## Light / dark

St CSS cannot match GTK theme selectors, so `aera-widgets` and `aera-system` set an `aera-light`/`aera-dark` class on their root from the system `color-scheme` and every rule is authored as a token pair. The dock uses a dark glass surface in both schemes; the clock has no surface (glow typography) and reads correctly on both.

## Roadmap

See `docs/Aera_OS_Roadmap_16_semaines.md`; current implementation status against milestones M7–M9 is tracked in `AERA_OS_CODEBASE_AUDIT.md` (§5).
