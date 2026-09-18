import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import Shell from 'gi://Shell';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class AeraClockExtension extends Extension {
    enable() {
        if (Main.panel.statusArea && Main.panel.statusArea[this.uuid]) {
            try {
                Main.panel.statusArea[this.uuid].destroy();
            } catch (e) {}
            delete Main.panel.statusArea[this.uuid];
        }

        this._buildWidget();
        this._updateTime();
        this._scheduleNextTick();

        this._monitorsChangedId = Main.layoutManager.connect(
            'monitors-changed', () => this._reposition()
        );
    }

    _buildWidget() {
        this._destroyWidget();

        this._timeLabel = new St.Label({
            style_class: 'aera-clock-time',
            style: 'font-size: 76px; font-weight: 700; color: #ffffff; text-align: center;',
            text: '',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        this._dateLabel = new St.Label({
            style_class: 'aera-clock-date',
            style: 'font-size: 17px; font-weight: 500; color: rgba(255, 255, 255, 0.85); text-align: center; padding-top: 4px;',
            text: '',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        if (this._timeLabel.clutter_text)
            this._timeLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        if (this._dateLabel.clutter_text)
            this._dateLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        // Centered glassmorphic card
        this._card = new St.BoxLayout({
            name: 'AeraClockCard',
            style_class: 'aera-clock-card',
            vertical: true,
            reactive: false,
            can_focus: false,
            track_hover: false,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
            style: 'background-color: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.28); border-radius: 28px; padding: 22px 52px; box-shadow: 0 10px 36px rgba(0, 0, 0, 0.22);',
        });

        // Add blur effect if available
        try {
            this._blurEffect = new Shell.BlurEffect({
                mode: Shell.BlurMode.BACKGROUND,
                radius: 25,
                brightness: 0.95,
            });
            this._card.add_effect(this._blurEffect);
        } catch (e) {
            // Optional enhancement if blur is unsupported in current driver
        }

        this._card.add_child(this._timeLabel);
        this._card.add_child(this._dateLabel);

        // Screen-wide positioning wrapper
        this._container = new St.Widget({
            name: 'AeraClockContainer',
            style_class: 'aera-clock-container',
            layout_manager: new Clutter.BinLayout(),
            reactive: false,
            can_focus: false,
            track_hover: false,
        });

        this._container.add_child(this._card);

        Main.layoutManager._backgroundGroup.add_child(this._container);

        this._reposition();

        this._repositionTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 50, () => {
            this._reposition();
            this._repositionTimeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _reposition() {
        if (!this._container)
            return;

        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor)
            return;

        this._container.set_width(monitor.width);
        const y = monitor.y + Math.round(monitor.height * 0.22);
        this._container.set_position(monitor.x, y);
    }

    _updateTime() {
        if (!this._timeLabel || !this._dateLabel)
            return;

        const now = GLib.DateTime.new_now_local();
        this._timeLabel.set_text(now.format('%H:%M'));
        this._dateLabel.set_text(now.format('%a %e %b %Y').replace(/\s+/g, ' ').trim());
    }

    _scheduleNextTick() {
        this._stopTimer();

        const now = GLib.DateTime.new_now_local();
        const secondsRemaining = Math.max(1, 60 - now.get_second());

        this._timeoutId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            secondsRemaining,
            () => {
                this._updateTime();
                this._scheduleNextTick();
                return GLib.SOURCE_REMOVE;
            }
        );
    }

    _stopTimer() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
    }

    _destroyWidget() {
        if (this._repositionTimeoutId) {
            GLib.source_remove(this._repositionTimeoutId);
            this._repositionTimeoutId = null;
        }

        if (this._container) {
            const parent = this._container.get_parent();
            if (parent)
                parent.remove_child(this._container);

            this._container.destroy();
            this._container = null;
        }

        this._card = null;
        this._timeLabel = null;
        this._dateLabel = null;
        this._blurEffect = null;
    }

    disable() {
        this._stopTimer();

        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }

        this._destroyWidget();
    }
}
