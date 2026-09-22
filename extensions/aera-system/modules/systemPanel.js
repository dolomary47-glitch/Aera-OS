/**
 * Aera System — Floating system panel
 * Glass card bottom-right of the primary monitor with quick-toggle tiles and
 * two sliders. Repositioning mirrors the dock/WidgetManager pattern.
 * Tiles whose backend is unavailable are omitted, never faked.
 */

import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { space, components } from '../aera-tokens.js';

import { WifiTile } from './wifiTile.js';
import { BluetoothTile } from './bluetoothTile.js';
import { BatteryTile } from './batteryTile.js';
import { ScreenshotTile } from './screenshotTile.js';
import { VolumeSlider } from './volumeTile.js';
import { BrightnessSlider } from './brightnessTile.js';

export class SystemPanel {
    constructor() {
        this._repositioning = false;

        this.actor = new St.BoxLayout({
            name: 'aeraSystemPanel',
            style_class: 'aera-system-root aera-system-card',
            vertical: true,
            reactive: true,
            track_hover: true,
        });

        // ── Light/dark scheme class (St can't match GTK theme selectors) ─────
        // color-scheme / gtk-theme live in org.gnome.desktop.interface —
        // global.settings (org.gnome.shell) has no such key on Shell 46.
        this._interfaceSettings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.interface',
        });
        this._colorSchemeChangedId = this._interfaceSettings.connect(
            'changed::color-scheme', () => this._updateColorScheme());
        this._gtkThemeChangedId = this._interfaceSettings.connect(
            'changed::gtk-theme', () => this._updateColorScheme());
        this._updateColorScheme();

        // ── Controls (availability-filtered) ─────────────────────────────────
        const tiles = [
            new WifiTile(),
            new BluetoothTile(),
            new BatteryTile(),
            new ScreenshotTile(),
        ];
        const sliders = [
            new BrightnessSlider(),
            new VolumeSlider(),
        ];

        this._items = [...tiles, ...sliders].filter(item => item.available);

        // Three icon-topped tiles per row (mirrors the QS grid density)
        const availableTiles = tiles.filter(t => t.available);
        for (let i = 0; i < availableTiles.length; i += 3) {
            const row = new St.BoxLayout({ style_class: 'aera-system-row' });
            for (const t of availableTiles.slice(i, i + 3))
                row.add_child(t.tile.actor);
            this.actor.add_child(row);
        }

        const sliderBox = new St.BoxLayout({
            style_class: 'aera-system-sliders',
            vertical: true,
        });
        for (const slider of sliders) {
            if (slider.available)
                sliderBox.add_child(slider.tile.actor);
        }
        if (sliderBox.get_n_children() > 0)
            this.actor.add_child(sliderBox);

        // ── Repositioning (mirrors dock.js / WidgetManager) ──────────────────
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => {
            this.reposition();
        });

        this._allocId = this.actor.connect('notify::allocation', () => {
            this._queueReposition();
        });

        this._queueReposition();
    }

    _updateColorScheme() {
        const scheme = this._interfaceSettings.get_string('color-scheme');
        const theme = this._interfaceSettings.get_string('gtk-theme') || '';
        const dark = scheme.includes('dark') || theme.toLowerCase().includes('dark');

        this.actor.remove_style_class_name(dark ? 'aera-light' : 'aera-dark');
        this.actor.add_style_class_name(dark ? 'aera-dark' : 'aera-light');
    }

    _queueReposition() {
        if (this._queuedRepositionId) return;
        this._queuedRepositionId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._queuedRepositionId = null;
            this.reposition();
            return GLib.SOURCE_REMOVE;
        });
    }

    reposition() {
        if (this._repositioning) return;
        this._repositioning = true;

        try {
            const monitor = Main.layoutManager.primaryMonitor;
            if (!monitor || !this.actor) return;

            this.actor.ensure_style();
            const [, natWidth] = this.actor.get_preferred_width(-1);
            const [, natHeight] = this.actor.get_preferred_height(-1);

            const width = natWidth > 0 ? natWidth : components.system.width;
            const height = natHeight > 0 ? natHeight : components.compact.height;

            // Bottom-right anchored, same vertical offset as the widget zone:
            // dock height + space.4 gap above the bottom edge
            const x = Math.round(monitor.x + monitor.width - width - space[6]);
            const y = Math.round(monitor.y + monitor.height - height
                - (components.dock.height + space[4]));

            this.actor.set_position(x, y);
            this.actor.set_size(width, height);
        } finally {
            this._repositioning = false;
        }
    }

    destroy() {
        if (this._queuedRepositionId) {
            GLib.source_remove(this._queuedRepositionId);
            this._queuedRepositionId = null;
        }

        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }

        if (this._allocId) {
            this.actor.disconnect(this._allocId);
            this._allocId = null;
        }

        if (this._colorSchemeChangedId) {
            this._interfaceSettings.disconnect(this._colorSchemeChangedId);
            this._colorSchemeChangedId = null;
        }

        if (this._gtkThemeChangedId) {
            this._interfaceSettings.disconnect(this._gtkThemeChangedId);
            this._gtkThemeChangedId = null;
        }

        this._interfaceSettings = null;

        for (const item of this._items ?? [])
            item.destroy();
        this._items = [];

        this.actor.destroy();
    }
}
