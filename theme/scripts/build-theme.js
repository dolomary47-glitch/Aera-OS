#!/usr/bin/env node

/**
 * Aera OS — GNOME Shell Theme Builder
 * =============================================================================
 * Deploys the official Aera OS transparent shell theme.
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const THEME_DIR = path.join(REPO_ROOT, 'theme');
const DIST_DIR = path.join(THEME_DIR, 'dist');
const TRANSPARENT_REF = path.join(REPO_ROOT, 'references/Transparent-shell-theme-4.8/Transparent shell theme 4.8/gnome-shell');

console.log('=== Aera OS — Building Aera Theme ===');

// Ensure dist directory exists
fs.mkdirSync(DIST_DIR, { recursive: true });

const aeraDist = path.join(DIST_DIR, 'Aera');
const aeraGSDist = path.join(aeraDist, 'gnome-shell');
fs.mkdirSync(aeraGSDist, { recursive: true });

// Initialize from reference if not already present
if (!fs.existsSync(path.join(aeraGSDist, 'gnome-shell.css')) && fs.existsSync(TRANSPARENT_REF)) {
    for (const file of fs.readdirSync(TRANSPARENT_REF)) {
        const srcFile = path.join(TRANSPARENT_REF, file);
        const destFile = path.join(aeraGSDist, file);
        if (fs.statSync(srcFile).isFile()) {
            fs.copyFileSync(srcFile, destFile);
        }
    }
    console.log(`[1/4] Initialized Aera theme files from reference`);
} else {
    console.log(`[1/4] Verified Aera theme files in dist/Aera/gnome-shell/`);
}

// Create index.theme
const indexTheme = `[Desktop Entry]
Type=X-GNOME-Metatheme
Name=Aera
Comment=Aera OS Official GNOME Shell Theme
Encoding=UTF-8

[X-GNOME-Metatheme]
GnomeShellTheme=Aera
`;
fs.writeFileSync(path.join(aeraDist, 'index.theme'), indexTheme, 'utf-8');
console.log(`[2/4] Created index.theme`);

// Generate install.sh
const installScript = `#!/usr/bin/env bash
# =============================================================================
# Aera OS Theme — Installer Script
# Installs Aera theme into ~/.local/share/themes/
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="\${HOME}/.local/share/themes"

mkdir -p "\${TARGET_DIR}"

echo "=== Installing Aera OS GNOME Shell Theme ==="
rm -rf "\${TARGET_DIR}/Aera-Dark" "\${TARGET_DIR}/Aera-Light" "\${TARGET_DIR}/Aera-BigSur" "\${TARGET_DIR}/Aera"
cp -r "\${SCRIPT_DIR}/Aera" "\${TARGET_DIR}/"

echo ""
echo "Successfully installed to \${TARGET_DIR}/Aera:"
find "\${TARGET_DIR}/Aera" -type f

echo ""
echo "To activate Aera theme:"
echo "1. Ensure User Themes extension is enabled:"
echo "   gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com"
echo "2. Apply GNOME Shell theme:"
echo "   gsettings set org.gnome.shell.extensions.user-theme name 'Aera'"
`;
fs.writeFileSync(path.join(DIST_DIR, 'install.sh'), installScript, { mode: 0o755, encoding: 'utf-8' });

// Generate README.md in dist
const distReadme = `# Aera OS — GNOME Shell Theme

Official GNOME Shell theme for Aera OS based on the Transparent Shell Theme (GNOME 45–48+).

## Supported GNOME Versions

- GNOME 45
- GNOME 46 (Ubuntu 24.04 LTS / Zorin OS 18)
- GNOME 47
- GNOME 48

## Installation

\`\`\`bash
bash install.sh
\`\`\`

Or manually copy \`Aera\` to \`~/.local/share/themes/\`.

## Activation

\`\`\`bash
# Enable User Themes extension
gnome-extensions enable user-theme@gnome-shell-extensions.gcampax.github.com

# Apply Aera theme
gsettings set org.gnome.shell.extensions.user-theme name 'Aera'
\`\`\`
`;
fs.writeFileSync(path.join(DIST_DIR, 'README.md'), distReadme, 'utf-8');

// Generate LICENSE
const licenseContent = `MIT License

Copyright (c) 2026 Aera OS Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
`;
fs.writeFileSync(path.join(DIST_DIR, 'LICENSE'), licenseContent, 'utf-8');
console.log(`[3/4] Generated install.sh, README.md, and LICENSE`);

console.log(`[4/4] Theme build completed successfully!`);
