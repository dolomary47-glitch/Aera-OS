/**
 * Aera System — small D-Bus helpers (org.freedesktop.DBus.Properties
 * Get/Set through a Gio.DBusProxy), shared by the tile backends.
 */

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

export function makeProxy(name, path, iface) {
    return Gio.DBusProxy.new_for_bus_sync(
        Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
        name, path, iface, null);
}

export function readProperty(proxy, iface, name) {
    const reply = proxy.call_sync(
        'org.freedesktop.DBus.Properties.Get',
        new GLib.Variant('(ss)', [iface, name]),
        Gio.DBusCallFlags.NONE, -1, null);
    return reply.deep_unpack()[0].unpack();
}

export function writeProperty(proxy, iface, name, value) {
    proxy.call_sync(
        'org.freedesktop.DBus.Properties.Set',
        new GLib.Variant('(ssv)', [iface, name, value]),
        Gio.DBusCallFlags.NONE, -1, null);
}
