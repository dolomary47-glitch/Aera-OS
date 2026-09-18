import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Pango from 'gi://Pango';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export default class AeraClockExtension extends Extension {
    enable() {
        // Clean up any previous panel indicator if upgrading
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
            style: 'font-size: 78px; font-weight: 700; color: #cad8e6; text-align: center;',
            text: '',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        this._dateLabel = new St.Label({
            style_class: 'aera-clock-date',
            style: 'font-size: 18px; font-weight: 500; color: #9cb0c3; text-align: center; padding-top: 6px;',
            text: '',
            x_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        if (this._timeLabel.clutter_text)
            this._timeLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        if (this._dateLabel.clutter_text)
            this._dateLabel.clutter_text.ellipsize = Pango.EllipsizeMode.NONE;

        this._container = new St.BoxLayout({
            name: 'AeraClockWidget',
            style_class: 'aera-clock-widget',
            vertical: true,
            reactive: false,
            can_focus: false,
            track_hover: false,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._container.add_child(this._timeLabel);
        this._container.add_child(this._dateLabel);

        // Add behind windows onto the desktop wallpaper layer
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

        // Position in the upper-middle area (approx 22% from top, matching the Aera OS concept)
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

        this._timeLabel = null;
        this._dateLabel = null;
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
