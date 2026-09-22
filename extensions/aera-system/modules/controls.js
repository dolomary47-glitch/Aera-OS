/**
 * Aera System — shared control widgets.
 *
 * ToggleTile reuses the shell's `.quick-toggle` class conventions (default
 * GNOME theme + theme/src/components/_quick-settings.scss style them), so
 * tiles look and behave like the built-in quick settings.
 */

import Clutter from 'gi://Clutter';
import St from 'gi://St';

import { Slider } from 'resource:///org/gnome/shell/ui/slider.js';

export class ToggleTile {
    constructor({ iconName, title, subtitle = '', toggle = true }) {
        this.actor = new St.Button({
            style_class: 'aera-quick-toggle quick-toggle',
            toggle_mode: toggle,
            can_focus: true,
            x_expand: true,
        });

        this._icon = new St.Icon({
            icon_name: iconName,
            style_class: 'quick-toggle-icon',
            icon_size: 18,
        });

        this._title = new St.Label({
            text: title,
            style_class: 'quick-toggle-title',
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._subtitle = new St.Label({
            text: subtitle,
            style_class: 'quick-toggle-subtitle',
            x_align: Clutter.ActorAlign.START,
            visible: subtitle !== '',
        });

        const textBox = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'aera-quick-toggle-text',
        });
        textBox.add_child(this._title);
        textBox.add_child(this._subtitle);

        const box = new St.BoxLayout({
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        box.add_child(this._icon);
        box.add_child(textBox);

        this.actor.child = box;
    }

    get state() {
        return this.actor.checked;
    }

    set state(on) {
        this.actor.checked = !!on;
    }

    set icon(name) {
        this._icon.icon_name = name;
    }

    set subtitle(text) {
        this._subtitle.text = text;
        this._subtitle.visible = text !== '';
    }

    onClicked(cb) {
        this.actor.connect('clicked', cb);
    }

    destroy() {
        this.actor.destroy();
    }
}

export class SliderTile {
    constructor({ iconName, value = 0 }) {
        this.actor = new St.BoxLayout({
            style_class: 'aera-quick-slider quick-slider',
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        this._iconButton = new St.Button({
            style_class: 'aera-slider-icon icon-button',
            can_focus: true,
            child: new St.Icon({
                icon_name: iconName,
                icon_size: 16,
            }),
        });

        this._slider = new Slider(value);
        this._slider.add_style_class_name('aera-slider');
        this._slider.x_expand = true;

        this.actor.add_child(this._iconButton);
        this.actor.add_child(this._slider);

        this._syncing = false;
    }

    get value() {
        return this._slider.value;
    }

    /** Programmatic update — does not echo back through onChanged(). */
    setValue(v) {
        this._syncing = true;
        this._slider.value = Math.max(0, Math.min(1, v));
        this._syncing = false;
    }

    set icon(name) {
        this._iconButton.child.icon_name = name;
    }

    onChanged(cb) {
        this._slider.connect('notify::value', () => {
            if (!this._syncing)
                cb(this._slider.value);
        });
    }

    onIconClicked(cb) {
        this._iconButton.connect('clicked', cb);
    }

    destroy() {
        this.actor.destroy();
    }
}
