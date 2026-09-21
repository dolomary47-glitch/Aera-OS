/**
 * Aera OS Dock — Workspace Item Module
 * Represents a single workspace button.
 */

import Clutter from 'gi://Clutter';
import St from 'gi://St';

export class WorkspaceItem {
    constructor(index, workspace, showTooltip, hideTooltip) {
        this.index = index;
        this.workspace = workspace;
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;

        this.actor = new St.Button({
            style_class: 'aera-dock-workspace-item',
            reactive: true,
            can_focus: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });

        this._label = new St.Label({
            text: `${this.index + 1}`,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.actor.set_child(this._label);

        this._clickedId = this.actor.connect('clicked', () => {
            this.workspace.activate(global.get_current_time());
        });

        this._enterId = this.actor.connect('enter-event', () => {
            if (this._showTooltip)
                this._showTooltip(this.actor, `Workspace ${this.index + 1}`);
        });

        this._leaveId = this.actor.connect('leave-event', () => {
            if (this._hideTooltip)
                this._hideTooltip();
        });

        this.updateActiveState();
    }

    updateActiveState() {
        const activeWs = global.workspace_manager.get_active_workspace();
        if (this.workspace === activeWs) {
            this.actor.add_style_class_name('active');
        } else {
            this.actor.remove_style_class_name('active');
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
