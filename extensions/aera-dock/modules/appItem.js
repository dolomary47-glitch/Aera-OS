/**
 * Aera OS Dock — App Item Module
 * Represents a single application item (pinned or running) in the dock.
 */

import Clutter from 'gi://Clutter';
import Shell from 'gi://Shell';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

export class AppItem {
    constructor(app, isFavorite, showTooltip, hideTooltip) {
        this.app = app;
        this.isFavorite = isFavorite;
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;

        // Container button
        this.actor = new St.Button({
            style_class: 'aera-dock-app-button',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        // Vertical box holding Icon + Running Indicator Dot
        this._contentBox = new St.BoxLayout({
            vertical: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.actor.set_child(this._contentBox);

        // App Icon
        this._icon = this.app.create_icon_texture(34);
        if (!this._icon) {
            this._icon = new St.Icon({
                icon_name: 'application-x-executable',
                icon_size: 34,
            });
        }
        this._icon.x_align = Clutter.ActorAlign.CENTER;
        this._contentBox.add_child(this._icon);

        // Running indicator dot
        this._runningDot = new St.Widget({
            style_class: 'aera-dock-running-dot',
            x_align: Clutter.ActorAlign.CENTER,
        });
        this._contentBox.add_child(this._runningDot);

        // Click handler
        this._clickedId = this.actor.connect('clicked', (actor, button) => {
            this._handleClick(button);
        });

        // Hover tooltip
        this._enterId = this.actor.connect('enter-event', () => {
            if (this._showTooltip) {
                const name = this.app.get_name() || 'Application';
                this._showTooltip(this.actor, name);
            }
        });

        this._leaveId = this.actor.connect('leave-event', () => {
            if (this._hideTooltip)
                this._hideTooltip();
        });

        this.updateState();
    }

    _handleClick(button) {
        const windows = this.app.get_windows();
        const activeWorkspace = global.workspace_manager.get_active_workspace();

        if (button === 3) {
            // Right-click: Open new window
            this.app.open_new_window(-1);
            return;
        }

        if (windows.length === 0) {
            // Not running: Launch application
            this.app.open_new_window(-1);
        } else if (windows.length === 1) {
            const win = windows[0];
            if (win.has_focus() && !Main.overview.visible) {
                // Window is already focused: minimize or toggle
                // GNOME default: keep focus or minimize
                win.activate(global.get_current_time());
            } else {
                Main.activateWindow(win);
            }
        } else {
            // Multiple windows: Cycle through or activate most recent
            const focusedWin = global.display.focus_window;
            let targetWin = windows[0];

            if (focusedWin && windows.includes(focusedWin)) {
                const idx = windows.indexOf(focusedWin);
                targetWin = windows[(idx + 1) % windows.length];
            }
            Main.activateWindow(targetWin);
        }

        if (Main.overview.visible)
            Main.overview.hide();
    }

    updateState() {
        const isRunning = this.app.state === Shell.AppState.RUNNING;
        const windows = this.app.get_windows();

        if (isRunning && windows.length > 0) {
            this._runningDot.show();
            
            // Check if any window of this app currently has focus
            const focusedWin = global.display.focus_window;
            if (focusedWin && windows.includes(focusedWin)) {
                this.actor.add_style_class_name('focused');
            } else {
                this.actor.remove_style_class_name('focused');
            }
        } else {
            this._runningDot.hide();
            this.actor.remove_style_class_name('focused');
        }
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
        this.actor.destroy();
    }
}
