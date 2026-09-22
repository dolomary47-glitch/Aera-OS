/**
 * Aera Widgets — Widget Manager
 * Anchors a vertical column of widget cards bottom-left of the primary
 * monitor. Repositioning mirrors the aera-dock pattern (monitors-changed +
 * allocation-driven, idle-queued, no hardcoded coordinates).
 *
 * Widget contract: { actor, destroy(), onSettingsChanged?(key) }
 */

import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { space, components } from '../aera-tokens.js';
import { AeraWeatherWidget } from './weatherWidget.js';

export class WidgetManager {
    constructor(extensionPath, settings) {
        this._settings = settings;
        this._repositioning = false;

        // ── 1. Widget column root ────────────────────────────────────────────
        this.actor = new St.BoxLayout({
            name: 'aeraWidgets',
            style_class: 'aera-widgets-root',
            vertical: true,
            reactive: true,
            track_hover: true,
        });

        // ── 2. Light/dark scheme class (St CSS can't match GTK theme itself) ─
        this._colorSchemeChangedId = global.settings.connect(
            'changed::color-scheme', () => this._updateColorScheme());
        this._gtkThemeChangedId = global.settings.connect(
            'changed::gtk-theme', () => this._updateColorScheme());
        this._updateColorScheme();

        // ── 3. Widgets ───────────────────────────────────────────────────────
        this._widgets = [
            new AeraWeatherWidget(extensionPath, settings),
        ];
        for (const widget of this._widgets)
            this.actor.add_child(widget.actor);

        this._settingsChangedId = settings.connect('changed', (s, key) => {
            for (const widget of this._widgets)
                widget.onSettingsChanged?.(key);
        });

        // ── 4. Dynamic repositioning (mirrors dock.js) ───────────────────────
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => {
            this.reposition();
        });

        this._allocId = this.actor.connect('notify::allocation', () => {
            this._queueReposition();
        });

        this._queueReposition();
    }

    _updateColorScheme() {
        const scheme = global.settings.get_string('color-scheme') || '';
        const theme = global.settings.get_string('gtk-theme') || '';
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

            // Fallbacks: components.widget.width + a single compact card
            const width = natWidth > 0 ? natWidth : components.widget.width;
            const height = natHeight > 0 ? natHeight : components.compact.height;

            // Bottom-left anchored, stacked above the dock:
            //   left  = monitor.x + space.6 (24)
            //   above = dock height + space.4 gap from the bottom edge
            const x = Math.round(monitor.x + space[6]);
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
            global.settings.disconnect(this._colorSchemeChangedId);
            this._colorSchemeChangedId = null;
        }

        if (this._gtkThemeChangedId) {
            global.settings.disconnect(this._gtkThemeChangedId);
            this._gtkThemeChangedId = null;
        }

        if (this._settingsChangedId && this._settings) {
            this._settings.disconnect(this._settingsChangedId);
            this._settingsChangedId = null;
        }

        for (const widget of this._widgets ?? [])
            widget.destroy();
        this._widgets = [];

        this.actor.destroy();
    }
}
