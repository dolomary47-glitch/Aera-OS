/**
 * Aera OS Dock — Launcher Button Module
 * Left segment button triggering the Aera system menu / overview.
 */

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class AeraLauncher {
    constructor(extensionPath, showTooltip, hideTooltip) {
        this._extensionPath = extensionPath;
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;

        this.actor = new St.Button({
            style_class: 'aera-dock-launcher-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        // Symbolic icon: the "-symbolic.svg" filename suffix makes St tint
        // every shape fill with the CSS `color` of .aera-dock-launcher-icon,
        // so the artwork follows hover/active states and both color schemes.
        const iconFile = Gio.File.new_for_path(`${this._extensionPath}/assets/aera-launcher-symbolic.svg`);
        const iconGIcon = new Gio.FileIcon({ file: iconFile });
        this._icon = new St.Icon({
            gicon: iconGIcon,
            style_class: 'aera-dock-launcher-icon',
            icon_size: 30,
        });
        this.actor.set_child(this._icon);

        // Click action: Toggle overview
        this._clickedId = this.actor.connect('clicked', () => {
            Main.overview.toggle();
        });

        // Tooltip
        this._enterId = this.actor.connect('enter-event', () => {
            if (this._showTooltip)
                this._showTooltip(this.actor, 'Aera Launcher');
        });

        this._leaveId = this.actor.connect('leave-event', () => {
            if (this._hideTooltip)
                this._hideTooltip();
        });

        // Track overview state to reflect active state
        this._overviewShowingId = Main.overview.connect('showing', () => {
            this.actor.add_style_pseudo_class('checked');
        });
        this._overviewHidingId = Main.overview.connect('hiding', () => {
            this.actor.remove_style_pseudo_class('checked');
        });
    }

    destroy() {
        if (this._clickedId) {
            this.actor.disconnect(this._clickedId);
            this._clickedId = null;
        }
        if (this._enterId) {
            this.actor.disconnect(this._enterId);
            this._enterId = null;
        }
        if (this._leaveId) {
            this.actor.disconnect(this._leaveId);
            this._leaveId = null;
        }
        if (this._overviewShowingId) {
            Main.overview.disconnect(this._overviewShowingId);
            this._overviewShowingId = null;
        }
        if (this._overviewHidingId) {
            Main.overview.disconnect(this._overviewHidingId);
            this._overviewHidingId = null;
        }
        this.actor.destroy();
    }
}
