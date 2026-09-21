/**
 * Aera OS Dock — Workspace / Multitasking Module
 * Provides the Multitasking / Overview view trigger button matching the reference image.
 */

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class WorkspaceManager {
    constructor(extensionPath, showTooltip, hideTooltip) {
        this._extensionPath = extensionPath;
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;

        this.actor = new St.BoxLayout({
            style_class: 'aera-dock-workspaces-box',
            y_align: Clutter.ActorAlign.CENTER,
        });

        // Multitasking / Overview toggle button (far right icon from reference)
        this._overviewButton = new St.Button({
            style_class: 'aera-dock-overview-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        const iconFile = Gio.File.new_for_path(`${this._extensionPath}/assets/workspace-view.svg`);
        const iconGIcon = new Gio.FileIcon({ file: iconFile });
        this._overviewIcon = new St.Icon({
            gicon: iconGIcon,
            icon_size: 28,
        });
        this._overviewButton.set_child(this._overviewIcon);

        this._overviewClickId = this._overviewButton.connect('clicked', () => {
            Main.overview.toggle();
        });

        this._overviewEnterId = this._overviewButton.connect('enter-event', () => {
            if (this._showTooltip)
                this._showTooltip(this._overviewButton, 'Multitasking View');
        });

        this._overviewLeaveId = this._overviewButton.connect('leave-event', () => {
            if (this._hideTooltip)
                this._hideTooltip();
        });

        // Update checked state when overview is showing
        this._overviewShowingId = Main.overview.connect('showing', () => {
            this._overviewButton.add_style_pseudo_class('checked');
        });
        this._overviewHidingId = Main.overview.connect('hiding', () => {
            this._overviewButton.remove_style_pseudo_class('checked');
        });

        this.actor.add_child(this._overviewButton);
    }

    destroy() {
        if (this._overviewClickId) {
            this._overviewButton.disconnect(this._overviewClickId);
            this._overviewClickId = null;
        }
        if (this._overviewEnterId) {
            this._overviewButton.disconnect(this._overviewEnterId);
            this._overviewEnterId = null;
        }
        if (this._overviewLeaveId) {
            this._overviewButton.disconnect(this._overviewLeaveId);
            this._overviewLeaveId = null;
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
