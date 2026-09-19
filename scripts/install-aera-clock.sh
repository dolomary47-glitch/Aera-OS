#!/usr/bin/env bash
# =============================================================================
# Aera Clock — Install Script
# Part of Aera OS Design System V1
#
# Creates a symlink from the GNOME extensions directory to the source tree.
# The extension's aera-tokens.js is itself a symlink → design-system/aera-tokens.js,
# so the installed extension always reads tokens from the central design system.
#
# Usage: bash scripts/install-aera-clock.sh
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

UUID="aera-clock@aeraos"
SOURCE_DIR="${REPO_ROOT}/extensions/aera-clock"
TARGET_BASE="${HOME}/.local/share/gnome-shell/extensions"
TARGET_DIR="${TARGET_BASE}/${UUID}"

echo "=== Aera OS — Installing ${UUID} ==="
echo "    Source : ${SOURCE_DIR}"
echo "    Target : ${TARGET_DIR}"
echo ""

if [ ! -d "${SOURCE_DIR}" ]; then
    echo "Error: Source directory ${SOURCE_DIR} does not exist." >&2
    exit 1
fi

# Verify the design-system symlink is in place
TOKENS_SYMLINK="${SOURCE_DIR}/aera-tokens.js"
if [ ! -e "${TOKENS_SYMLINK}" ]; then
    echo "Warning: ${TOKENS_SYMLINK} does not exist. Creating it..."
    ln -s "../../design-system/aera-tokens.js" "${TOKENS_SYMLINK}"
    echo "  Created: aera-tokens.js → design-system/aera-tokens.js"
fi

mkdir -p "${TARGET_BASE}"

# Safely remove existing symlink or directory
if [ -L "${TARGET_DIR}" ]; then
    echo "Removing existing symlink at ${TARGET_DIR}..."
    rm -f "${TARGET_DIR}"
elif [ -d "${TARGET_DIR}" ]; then
    echo "Removing existing directory at ${TARGET_DIR}..."
    rm -rf "${TARGET_DIR}"
fi

echo "Creating symbolic link:"
echo "  ${SOURCE_DIR} → ${TARGET_DIR}"
ln -s "${SOURCE_DIR}" "${TARGET_DIR}"

echo ""
echo "=== Installation complete ==="
echo ""
echo "Token chain:"
echo "  GNOME Shell loads: ${TARGET_DIR}/"
echo "    ↓ symlink →       ${SOURCE_DIR}/"
echo "    ↓ aera-tokens.js → ${REPO_ROOT}/design-system/aera-tokens.js"
echo ""
echo "Next steps:"
echo "  gnome-extensions enable ${UUID}"
