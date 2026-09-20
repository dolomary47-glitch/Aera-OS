#!/usr/bin/env bash
# =============================================================================
# Aera OS Theme — Installer Script
# Installs Aera theme into ~/.local/share/themes/
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${HOME}/.local/share/themes"

mkdir -p "${TARGET_DIR}"

echo "=== Installing Aera OS GNOME Shell Theme ==="
rm -rf "${TARGET_DIR}/Aera-Dark" "${TARGET_DIR}/Aera-Light" "${TARGET_DIR}/Aera-BigSur" "${TARGET_DIR}/Aera"
cp -r "${SCRIPT_DIR}/Aera" "${TARGET_DIR}/"

echo ""
echo "Successfully installed to ${TARGET_DIR}/Aera:"
find "${TARGET_DIR}/Aera" -type f

echo ""
echo "To activate Aera theme:"
echo "1. Ensure User Themes extension is enabled:"
echo "   gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com"
echo "2. Apply GNOME Shell theme:"
echo "   gsettings set org.gnome.shell.extensions.user-theme name 'Aera'"
