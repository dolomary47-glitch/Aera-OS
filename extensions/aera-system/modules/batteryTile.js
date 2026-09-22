/**
 * Aera System — Battery tile (informational)
 * Backend: UPower DisplayDevice over D-Bus. No battery (desktop machines) →
 * no tile.
 */

import { ToggleTile } from './controls.js';
import { makeProxy, readProperty } from './dbus.js';

const UPOWER_BUS = 'org.freedesktop.UPower';
const UPOWER_DEVICE_IFACE = 'org.freedesktop.UPower.Device';
const UPOWER_DEVICE_TYPE_BATTERY = 2;

const STATE_TEXT = {
    1: 'Charging',
    2: 'On battery',
    3: 'Empty',
    4: 'Fully charged',
    5: 'Charging',
    6: 'Discharging',
};

export class BatteryTile {
    constructor() {
        this.available = false;

        try {
            this._proxy = makeProxy(UPOWER_BUS,
                '/org/freedesktop/UPower/devices/DisplayDevice',
                UPOWER_DEVICE_IFACE);
            if (readProperty(this._proxy, UPOWER_DEVICE_IFACE, 'Type')
                !== UPOWER_DEVICE_TYPE_BATTERY)
                return;
        } catch (e) {
            return; // UPower missing → omit the tile
        }

        this.tile = new ToggleTile({
            iconName: 'battery-symbolic',
            title: 'Battery',
            toggle: false,
        });
        this.tile.actor.reactive = false;
        this.tile.actor.can_focus = false;

        this._propsChangedId = this._proxy.connect('g-properties-changed', () => {
            this._render();
        });
        this._render();
        this.available = true;
    }

    _render() {
        try {
            const pct = readProperty(this._proxy, UPOWER_DEVICE_IFACE, 'Percentage');
            const state = readProperty(this._proxy, UPOWER_DEVICE_IFACE, 'State');
            this.tile.subtitle =
                `${Math.round(pct)}% · ${STATE_TEXT[state] ?? 'Unknown'}`;
        } catch (e) {
            this.tile.subtitle = 'Unavailable';
        }
    }

    destroy() {
        if (this._propsChangedId && this._proxy)
            this._proxy.disconnect(this._propsChangedId);
        this._proxy = null;
        this.tile?.destroy();
    }
}
