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
