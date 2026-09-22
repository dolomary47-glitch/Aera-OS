#!/usr/bin/env bash
# =============================================================================
# Aera OS — Full Desktop Install Script (VM-safe, idempotent)
# Part of Aera OS
#
# Installs every Aera OS GNOME Shell extension by symlinking the source tree
# into ~/.local/share/gnome-shell/extensions (same pattern as
# install-aera-clock.sh), so the repo remains the single source of truth:
#
#   extension aera-tokens.js → design-system/aera-tokens.js (central tokens)
#
# Also compiles GSettings schemas for extensions that ship one
# (aera-widgets) and enables all extensions via gnome-extensions.
#
# Usage: bash scripts/install-aera-os.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_BASE="${HOME}/.local/share/gnome-shell/extensions"

# extension-source-dir : uuid : needs-token-symlink : has-schemas
EXTENSIONS=(
    "aera-clock|aera-clock@aeraos|yes|no"
    "aera-dock|aera-dock@aeraos|no|no"
    "aera-widgets|aera-widgets@aeraos|yes|yes"
    "aera-system|aera-system@aeraos|yes|no"
)

echo "=== Aera OS — Installing desktop extensions ==="
echo "    Repo   : ${REPO_ROOT}"
echo "    Target : ${TARGET_BASE}"
echo ""

mkdir -p "${TARGET_BASE}"

for entry in "${EXTENSIONS[@]}"; do
    IFS='|' read -r dir uuid token_symlink has_schemas <<< "${entry}"
    SOURCE_DIR="${REPO_ROOT}/extensions/${dir}"
    TARGET_DIR="${TARGET_BASE}/${uuid}"

    echo "── ${uuid}"

    if [ ! -d "${SOURCE_DIR}" ]; then
        echo "   Error: ${SOURCE_DIR} not found." >&2
        exit 1
    fi

    # Central design-token symlink (extension → design-system)
    if [ "${token_symlink}" = "yes" ] && [ ! -e "${SOURCE_DIR}/aera-tokens.js" ]; then
        ln -s "../../design-system/aera-tokens.js" "${SOURCE_DIR}/aera-tokens.js"
        echo "   created aera-tokens.js → design-system/aera-tokens.js"
    fi

    # Compile GSettings schemas in-place (Shell loads them from the extension dir)
    if [ "${has_schemas}" = "yes" ]; then
        if ! command -v glib-compile-schemas > /dev/null; then
            echo "   Error: glib-compile-schemas not found (install libglib2.0-dev-bin / gir1.2-glib-2.0 tooling)." >&2
            exit 1
        fi
        glib-compile-schemas --strict "${SOURCE_DIR}/schemas"
        echo "   compiled schemas/ → gschemas.compiled"
    fi

    # Replace any previous install of this extension (symlink or stale dir)
    if [ -L "${TARGET_DIR}" ]; then
        rm -f "${TARGET_DIR}"
    elif [ -d "${TARGET_DIR}" ]; then
        echo "   replacing existing directory ${TARGET_DIR}"
        rm -rf "${TARGET_DIR}"
    fi
    ln -s "${SOURCE_DIR}" "${TARGET_DIR}"
    echo "   linked → ${TARGET_DIR}"
done

echo ""
echo "=== Enabling extensions ==="
for entry in "${EXTENSIONS[@]}"; do
    IFS='|' read -r dir uuid token_symlink has_schemas <<< "${entry}"
    if gnome-extensions enable "${uuid}" 2>/dev/null; then
        echo "   enabled  ${uuid}"
    else
        echo "   SKIPPED  ${uuid} — could not reach a running GNOME Shell session."
        echo "            Run 'gnome-extensions enable ${uuid}' after logging into the desktop."
    fi
done

echo ""
echo "=== Done ==="
echo "Restart GNOME Shell if extensions were already enabled:"
echo "  Wayland : log out and back in"
echo "  X11     : Alt+F2 → type 'r' → Enter"
echo ""
echo "Suggested VM verification (see README.md 'Verifying live data'):"
echo "  weather widget shows real conditions for your location"
echo "  Wi-Fi tile state matches:   nmcli radio wifi"
echo "  Bluetooth tile matches:     rfkill list bluetooth"
echo "  volume slider matches:      pactl get-sink-volume @DEFAULT_SINK@"
