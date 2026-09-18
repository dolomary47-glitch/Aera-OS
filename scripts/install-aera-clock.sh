#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

UUID="aera-clock@aeraos"
SOURCE_DIR="${REPO_ROOT}/extensions/aera-clock"
TARGET_BASE="${HOME}/.local/share/gnome-shell/extensions"
TARGET_DIR="${TARGET_BASE}/${UUID}"

echo "=== Installing ${UUID} for current user ==="

if [ ! -d "${SOURCE_DIR}" ]; then
    echo "Error: Source directory ${SOURCE_DIR} does not exist." >&2
    exit 1
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
echo "  ${SOURCE_DIR} -> ${TARGET_DIR}"
ln -s "${SOURCE_DIR}" "${TARGET_DIR}"

echo "Aera Clock installed successfully via symlink."
echo "You can now run:"
echo "  gnome-extensions enable ${UUID}"
