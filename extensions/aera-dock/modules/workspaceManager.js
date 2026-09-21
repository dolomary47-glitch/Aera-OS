/**
 * Aera OS Dock — Workspace Manager Module
 * Manages dynamic workspace switcher buttons and overview trigger.
 */

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { WorkspaceItem } from './workspaceItem.js';

export class WorkspaceManager {
    constructor(extensionPath, showTooltip, hideTooltip) {
        this._extensionPath = extensionPath;
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;
        this._wsItems = [];

        this.actor = new St.BoxLayout({
            style_class: 'aera-dock-workspaces-box',
            y_align: Clutter.ActorAlign.CENTER,
        });

        // 1. Workspace buttons container
        this._itemsBox = new St.BoxLayout({
            spacing: 3,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.actor.add_child(this._itemsBox);

        // 2. Multitasking / Overview toggle button (far right icon from reference)
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
            icon_size: 24,
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

        this.actor.add_child(this._overviewButton);

        // 3. Connect workspace manager signals
        const wsMgr = global.workspace_manager;
        this._activeWsId = wsMgr.connect('active-workspace-changed', () => {
            this._updateActiveStates();
        });

        this._wsAddedId = wsMgr.connect('workspace-added', () => {
            this.refresh();
        });

        this._wsRemovedId = wsMgr.connect('workspace-removed', () => {
            this.refresh();
        });

        this.refresh();
    }

    refresh() {
        // Clear existing items
        for (const item of this._wsItems) {
            item.destroy();
        }
        this._wsItems = [];
        this._itemsBox.remove_all_children();

        const wsMgr = global.workspace_manager;
        const nWorkspaces = wsMgr.get_n_workspaces();

        for (let i = 0; i < nWorkspaces; i++) {
            const ws = wsMgr.get_workspace_by_index(i);
            const item = new WorkspaceItem(i, ws, this._showTooltip, this._hideTooltip);
            this._wsItems.push(item);
            this._itemsBox.add_child(item.actor);
        }
    }

    _updateActiveStates() {
        for (const item of this._wsItems) {
            item.updateActiveState();
        }
    }

    destroy() {
        const wsMgr = global.workspace_manager;
        if (this._activeWsId) {
            wsMgr.disconnect(this._activeWsId);
            this._activeWsId = null;
        }
        if (this._wsAddedId) {
            wsMgr.disconnect(this._wsAddedId);
            this._wsAddedId = null;
        }
        if (this._wsRemovedId) {
            wsMgr.disconnect(this._wsRemovedId);
            this._wsRemovedId = null;
        }

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

        for (const item of this._wsItems) {
            item.destroy();
        }
        this._wsItems = [];

        this.actor.destroy();
    }
}
