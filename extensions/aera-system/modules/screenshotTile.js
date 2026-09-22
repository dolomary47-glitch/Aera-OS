/**
 * Aera System — Screenshot tile
 * Reuses GNOME Shell's own screenshot UI through its existing session-bus
 * service (org.gnome.Shell.Screenshot InteractiveScreenshot) — the same call
 * the Print key triggers, so the built-in capture/record overlay handles both.
 */

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { ToggleTile } from './controls.js';

const SCREENSHOT_BUS = 'org.gnome.Shell.Screenshot';
const SCREENSHOT_PATH = '/org/gnome/Shell/Screenshot';
const SCREENSHOT_IFACE = 'org.gnome.Shell.Screenshot';

export class ScreenshotTile {
    constructor() {
        this.tile = new ToggleTile({
            iconName: 'camera-photo-symbolic',
            title: 'Screenshot',
            toggle: false,
        });
        this.tile.onClicked(() => this._openUi());
        this.available = true;
    }

    _openUi() {
        Gio.DBus.session.call(
            SCREENSHOT_BUS, SCREENSHOT_PATH, SCREENSHOT_IFACE,
            'InteractiveScreenshot', null,
            new GLib.VariantType('(bs)'),
            Gio.DBusCallFlags.NONE, -1, null,
            (proxy, res) => {
                try {
                    proxy.call_finish(res);
                } catch (e) {
                    logError(e, 'Aera System: could not open screenshot UI');
                }
            });
    }

    destroy() {
        this.tile?.destroy();
    }
}
