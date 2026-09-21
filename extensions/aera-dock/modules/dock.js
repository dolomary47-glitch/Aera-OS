/**
 * Aera OS Dock — Main Dock Container Module
 * Coordinates the launcher, applications tray, workspace switcher, and tooltip.
 */

import Clutter from 'gi://Clutter';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { AeraLauncher } from './aeraLauncher.js';
import { AppManager } from './appManager.js';
import { WorkspaceManager } from './workspaceManager.js';

export class AeraDock {
    constructor(extensionPath) {
        this._extensionPath = extensionPath;

        // Root fullscreen wrapper actor with BinLayout
        this.actor = new Clutter.Actor({
            name: 'aeraDockWrapper',
            layout_manager: new Clutter.BinLayout(),
            reactive: false,
            x_expand: true,
            y_expand: true,
        });

        // ── 1. Tooltip Manager ───────────────────────────────────────────────
        this._tooltip = new St.Label({
            style_class: 'aera-dock-tooltip',
            opacity: 0,
            visible: false,
        });
        Main.uiGroup.add_child(this._tooltip);

        const showTooltip = (targetActor, text) => this._showTooltip(targetActor, text);
        const hideTooltip = () => this._hideTooltip();

        // ── 2. Centered Bottom Dock Box ──────────────────────────────────────
        this._dockBox = new St.BoxLayout({
            name: 'aeraDock',
            style_class: 'aera-dock-container',
            reactive: true,
            track_hover: true,
            x_align: Clutter.ActorAlign.CENTER,
            y_align: Clutter.ActorAlign.END,
        });
        this.actor.add_child(this._dockBox);

        // ── 3. Left Segment: Aera Launcher ───────────────────────────────────
        this._leftSegment = new St.BoxLayout({
            style_class: 'aera-dock-segment aera-dock-launcher-segment',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._launcher = new AeraLauncher(this._extensionPath, showTooltip, hideTooltip);
        this._leftSegment.add_child(this._launcher.actor);
        this._dockBox.add_child(this._leftSegment);

        // ── 4. Right Segment: Main Apps & Multitasking Bar ───────────────────
        this._rightSegment = new St.BoxLayout({
            style_class: 'aera-dock-segment aera-dock-bar',
            y_align: Clutter.ActorAlign.CENTER,
        });

        // Applications Box
        this._appManager = new AppManager(showTooltip, hideTooltip);
        this._rightSegment.add_child(this._appManager.actor);

        // Workspaces / Overview Box
        this._workspaceManager = new WorkspaceManager(this._extensionPath, showTooltip, hideTooltip);
        this._rightSegment.add_child(this._workspaceManager.actor);

        this._dockBox.add_child(this._rightSegment);

        // ── 5. Position & Geometry ───────────────────────────────────────────
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => {
            this.reposition();
        });

        this.reposition();
    }

    reposition() {
        const monitor = Main.layoutManager.primaryMonitor;
        if (!monitor) return;

        // Cover the monitor bounds so BinLayout aligns child to bottom-center
        this.actor.set_position(
            monitor.x,
            monitor.y
        );
        this.actor.set_size(
            monitor.width,
            monitor.height
        );
    }

    _showTooltip(targetActor, text) {
        if (!this._tooltip || !targetActor) return;

        this._tooltip.set_text(text);
        this._tooltip.ensure_style();
        this._tooltip.show();

        // Calculate absolute screen position above the target actor
        const [targetX, targetY] = targetActor.get_transformed_position();
        const targetWidth = targetActor.get_width();
        const tooltipWidth = this._tooltip.get_width();
        const tooltipHeight = this._tooltip.get_height();

        const x = Math.round(targetX + (targetWidth - tooltipWidth) / 2);
        const y = Math.round(targetY - tooltipHeight - 8);

        this._tooltip.set_position(x, y);
        this._tooltip.ease({
            opacity: 255,
            duration: 150,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
        });
    }

    _hideTooltip() {
        if (!this._tooltip) return;

        this._tooltip.ease({
            opacity: 0,
            duration: 100,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            onComplete: () => {
                if (this._tooltip)
                    this._tooltip.hide();
            },
        });
    }

    destroy() {
        if (this._monitorsChangedId) {
            Main.layoutManager.disconnect(this._monitorsChangedId);
            this._monitorsChangedId = null;
        }

        if (this._tooltip) {
            Main.uiGroup.remove_child(this._tooltip);
            this._tooltip.destroy();
            this._tooltip = null;
        }

        if (this._launcher) {
            this._launcher.destroy();
            this._launcher = null;
        }

        if (this._appManager) {
            this._appManager.destroy();
            this._appManager = null;
        }

        if (this._workspaceManager) {
            this._workspaceManager.destroy();
            this._workspaceManager = null;
        }

        this.actor.destroy();
    }
}
