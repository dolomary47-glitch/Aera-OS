#!/usr/bin/env bash

# =============================================================================
# Aera OS Theme — Packaging Script
# Creates Aera-Theme-1.0.tar.gz for distribution
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
THEME_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${THEME_DIR}/dist"
ARCHIVE_NAME="Aera-Theme-1.0.tar.gz"
OUTPUT_ARCHIVE="${THEME_DIR}/${ARCHIVE_NAME}"

echo "=== Aera OS — Packaging Theme Archive ==="

# 1. Rebuild theme to ensure dist/ is up to date
node "${SCRIPT_DIR}/build-theme.js"

# 2. Package tar.gz
cd "${DIST_DIR}"
tar -czf "${OUTPUT_ARCHIVE}" \
    Aera \
    README.md \
    LICENSE \
    install.sh

echo ""
echo "Archive successfully created: ${OUTPUT_ARCHIVE}"

set +o pipefail
tar -tzf "${OUTPUT_ARCHIVE}" | head -n 12
echo "... (package verified)"
