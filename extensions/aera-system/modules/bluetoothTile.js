/**
 * Aera System — Bluetooth tile
 * Backend: BlueZ over D-Bus. The first org.bluez.Adapter1 found through the
 * root ObjectManager is the real adapter; no adapter → no tile.
 */

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

import { ToggleTile } from './controls.js';
import { makeProxy, readProperty, writeProperty } from './dbus.js';

const BLUEZ_BUS = 'org.bluez';
const BLUEZ_ADAPTER_IFACE = 'org.bluez.Adapter1';

export class BluetoothTile {
    constructor() {
        this.available = false;

        let adapterPath = null;
        try {
            const om = makeProxy(BLUEZ_BUS, '/',
                'org.freedesktop.DBus.ObjectManager');
            const [managed] = om.call_sync('GetManagedObjects',
                new GLib.Variant('()'), Gio.DBusCallFlags.NONE, -1, null)
                .deep_unpack();

            for (const [path, ifaces] of Object.entries(managed)) {
                if (ifaces[BLUEZ_ADAPTER_IFACE]) {
                    adapterPath = path;
                    break;
                }
            }
        } catch (e) {
            return; // BlueZ not running → panel omits the tile
        }

        if (!adapterPath)
            return; // No Bluetooth hardware → no fake tile

        try {
            this._adapterProxy = makeProxy(BLUEZ_BUS, adapterPath,
                BLUEZ_ADAPTER_IFACE);
            readProperty(this._adapterProxy, BLUEZ_ADAPTER_IFACE, 'Powered');
        } catch (e) {
            return;
        }

        this.tile = new ToggleTile({
            iconName: 'bluetooth-disabled-symbolic',
            title: 'Bluetooth',
        });
        this.tile.onClicked(() => this._toggle());
        this._propsChangedId = this._adapterProxy.connect(
            'g-properties-changed', () => this._render());
        this._render();
        this.available = true;
    }

    _toggle() {
        try {
            writeProperty(this._adapterProxy, BLUEZ_ADAPTER_IFACE, 'Powered',
                new GLib.Variant('b', !this.tile.state));
        } catch (e) {
            // Keep the UI honest by re-reading the real state below
        }
        this._render();
    }

    _render() {
        let powered = false;
        try {
            powered = readProperty(this._adapterProxy, BLUEZ_ADAPTER_IFACE, 'Powered');
        } catch (e) {
            // Adapter disappeared — show as off
        }
        this.tile.state = powered;
        this.tile.icon = powered
            ? 'bluetooth-active-symbolic'
            : 'bluetooth-disabled-symbolic';
        this.tile.subtitle = powered ? 'On' : 'Off';
    }

    destroy() {
        if (this._propsChangedId && this._adapterProxy)
            this._adapterProxy.disconnect(this._propsChangedId);
        this._adapterProxy = null;
        this.tile?.destroy();
    }
}
