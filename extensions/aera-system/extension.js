/**
 * Aera System — GNOME Shell 46 Extension Entry Point
 * Part of Aera OS Desktop Environment
 *
 * Tokens consumed from: ./aera-tokens.js → design-system/aera-tokens.js
 */

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { SystemPanel } from './modules/systemPanel.js';

export default class AeraSystemExtension extends Extension {
    enable() {
        this._panel = new SystemPanel();

        Main.layoutManager.addChrome(this._panel.actor, {
            affectsStruts: false,
            trackFullscreen: true,
        });
    }

    disable() {
        if (this._panel) {
            Main.layoutManager.removeChrome(this._panel.actor);
            this._panel.destroy();
            this._panel = null;
        }
    }
}
