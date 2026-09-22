/**
 * Aera System — Wi-Fi tile
 * Backend: NetworkManager over D-Bus (system bus), same service NM-applets use.
 * Reflects WirelessEnabled/HwEnabled and shows the active connection name.
 */

import GLib from 'gi://GLib';

import { ToggleTile } from './controls.js';
import { makeProxy, readProperty, writeProperty } from './dbus.js';

const NM_BUS = 'org.freedesktop.NetworkManager';
const NM_PATH = '/org/freedesktop/NetworkManager';
const NM_IFACE = 'org.freedesktop.NetworkManager';
const NM_ACTIVE_CONN_IFACE = 'org.freedesktop.NetworkManager.Connection.Active';

export class WifiTile {
    constructor() {
        this.available = false;
        try {
            this._proxy = makeProxy(NM_BUS, NM_PATH, NM_IFACE);
            readProperty(this._proxy, NM_IFACE, 'WirelessEnabled');
        } catch (e) {
            return; // NetworkManager not running → panel omits the tile
        }

        this.tile = new ToggleTile({
            iconName: 'network-wireless-symbolic',
            title: 'Wi-Fi',
        });
        this.tile.onClicked(() => this._toggle());
        this._propsChangedId = this._proxy.connect('g-properties-changed', () => {
            this._render();
        });
        this._render();
        this.available = true;
    }

    _toggle() {
        try {
            writeProperty(this._proxy, NM_IFACE, 'WirelessEnabled',
                new GLib.Variant('b', !this.tile.state));
        } catch (e) {
            // Re-render from real state so the UI never claims a false mode
        }
        this._render();
    }

    _activeConnectionName() {
        let paths = [];
        try {
            paths = readProperty(this._proxy, NM_IFACE, 'ActiveConnections') ?? [];
        } catch (e) {
            return '';
        }
        let firstName = '';
        for (const path of paths) {
            try {
                const p = makeProxy(NM_BUS, path, NM_ACTIVE_CONN_IFACE);
                const id = readProperty(p, NM_ACTIVE_CONN_IFACE, 'Id');
                const type = readProperty(p, NM_ACTIVE_CONN_IFACE, 'Type');
                if (type === '802-11-wireless')
                    return id;
                firstName ||= id;
            } catch (e) {
                // Connection vanished mid-read — skip it
            }
        }
        return firstName;
    }

    _render() {
        try {
            const enabled = readProperty(this._proxy, NM_IFACE, 'WirelessEnabled');
            const hwEnabled = readProperty(this._proxy, NM_IFACE, 'WirelessHwEnabled');

            this.tile.state = enabled;
            if (!hwEnabled)
                this.tile.subtitle = 'Hardware blocked';
            else if (!enabled)
                this.tile.subtitle = 'Off';
            else
                this.tile.subtitle = this._activeConnectionName() || 'Connected';
        } catch (e) {
            this.tile.state = false;
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
