/**
 * Aera System — Brightness slider
 * Backend: org.gnome.SettingsDaemon.Power Screen interface (the service
 * gnome-control-center's display slider drives). No backlight (desktops,
 * many VMs) → slider is hidden rather than fake.
 */

import GLib from 'gi://GLib';

import { SliderTile } from './controls.js';
import { makeProxy, readProperty, writeProperty } from './dbus.js';

const SSD_POWER_BUS = 'org.gnome.SettingsDaemon.Power';
const SSD_POWER_PATH = '/org/gnome/SettingsDaemon/Power';
const SSD_SCREEN_IFACE = 'org.gnome.SettingsDaemon.Power.Screen';

export class BrightnessSlider {
    constructor() {
        this.available = false;

        try {
            this._proxy = makeProxy(SSD_POWER_BUS, SSD_POWER_PATH, SSD_SCREEN_IFACE);
            this._max = readProperty(this._proxy, SSD_SCREEN_IFACE, 'MaxBrightness');
            const probe = readProperty(this._proxy, SSD_SCREEN_IFACE, 'Brightness');
            this._variantType = probe.get_type_string();
        } catch (e) {
            return; // No Screen backlight interface → omit the slider
        }

        if (!this._max)
            return; // Read-only/unmapped backlight → omit, never fake it

        this.tile = new SliderTile({
            iconName: 'display-brightness-symbolic',
            value: 0,
        });
        this.tile.onChanged(v => this._apply(v));
        this._propsChangedId = this._proxy.connect('g-properties-changed', () => {
            this._render();
        });
        this._render();
        this.available = true;
    }

    _apply(value) {
        try {
            writeProperty(this._proxy, SSD_SCREEN_IFACE, 'Brightness',
                new GLib.Variant(this._variantType,
                    Math.round(value * this._max)));
        } catch (e) {
            // Fall back to the real hardware value on rejection
        }
        this._render();
    }

    _render() {
        try {
            const value = readProperty(this._proxy, SSD_SCREEN_IFACE, 'Brightness');
            this.tile.setValue(value / this._max);
        } catch (e) {
            // Ignore transient read failures; next property change re-renders
        }
    }

    destroy() {
        if (this._propsChangedId && this._proxy)
            this._proxy.disconnect(this._propsChangedId);
        this._proxy = null;
        this.tile?.destroy();
    }
}
