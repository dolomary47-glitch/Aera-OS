import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

const AeraClockButton = GObject.registerClass(
class AeraClockButton extends PanelMenu.Button {
    _init() {
        super._init(0.5, 'Aera Clock', true);

        this.add_style_class_name('aera-clock-button');

        this._label = new St.Label({
            style_class: 'aera-clock-label',
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this.add_child(this._label);
    }

    setTime(timeString) {
        this._label.set_text(timeString);
    }
});

export default class AeraClockExtension extends Extension {
    enable() {
        this._indicator = new AeraClockButton();
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'center');

        this._updateTime();
        this._scheduleNextTick();
    }

    _updateTime() {
        if (!this._indicator)
            return;

        const now = GLib.DateTime.new_now_local();
        this._indicator.setTime(now.format('%H:%M'));
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

    disable() {
        this._stopTimer();

        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }
}
