/**
 * Aera OS Dock — App Manager Module
 * Manages the list of favorite & running applications and synchronizes with GNOME Shell.
 */

import Shell from 'gi://Shell';
import St from 'gi://St';
import { AppItem } from './appItem.js';

export class AppManager {
    constructor(showTooltip, hideTooltip) {
        this._showTooltip = showTooltip;
        this._hideTooltip = hideTooltip;
        this._appSys = Shell.AppSystem.get_default();
        this._items = new Map(); // appId -> AppItem

        this.actor = new St.BoxLayout({
            style_class: 'aera-dock-apps-box',
        });

        // 1. Listen for favorite app changes
        this._favSettingsId = global.settings.connect('changed::favorite-apps', () => {
            this.refresh();
        });

        // 2. Listen for app system changes (installed, state change)
        this._installedChangedId = this._appSys.connect('installed-changed', () => {
            this.refresh();
        });

        this._appStateChangedId = this._appSys.connect('app-state-changed', (sys, app) => {
            this._onAppStateChanged(app);
        });

        // 3. Listen for window focus changes
        this._focusWindowId = global.display.connect('notify::focus-window', () => {
            this._updateAllStates();
        });

        // 4. Listen for workspace switches
        this._workspaceSwitchId = global.window_manager.connect('switch-workspace', () => {
            this._updateAllStates();
        });

        this.refresh();
    }

    _getFavoriteAppIds() {
        return global.settings.get_strv('favorite-apps') || [];
    }

    refresh() {
        const favIds = this._getFavoriteAppIds();
        const runningApps = this._appSys.get_running();

        // 1. Gather all unique apps to show: Favorites first, then Running apps
        const targetApps = [];
        const seenIds = new Set();

        // Add Favorites
        for (const id of favIds) {
            const app = this._appSys.lookup_app(id);
            if (app) {
                targetApps.push({ app, isFavorite: true });
                seenIds.add(app.get_id());
            }
        }

        // Add running apps not in favorites
        for (const app of runningApps) {
            const id = app.get_id();
            if (id && !seenIds.has(id)) {
                // Ensure the app is not a background daemon without windows
                if (app.get_windows().length > 0) {
                    targetApps.push({ app, isFavorite: false });
                    seenIds.add(id);
                }
            }
        }

        // 2. Destroy removed items
        const targetIds = new Set(targetApps.map(item => item.app.get_id()));
        for (const [id, item] of this._items.entries()) {
            if (!targetIds.has(id)) {
                item.destroy();
                this._items.delete(id);
            }
        }

        // 3. Rebuild/reorder items in the container
        this.actor.remove_all_children();

        for (const { app, isFavorite } of targetApps) {
            const id = app.get_id();
            let item = this._items.get(id);

            if (!item) {
                item = new AppItem(app, isFavorite, this._showTooltip, this._hideTooltip);
                this._items.set(id, item);
            } else {
                item.isFavorite = isFavorite;
                item.updateState();
            }

            this.actor.add_child(item.actor);
        }
    }

    _onAppStateChanged(app) {
        const id = app.get_id();
        if (!id) return;

        const favIds = this._getFavoriteAppIds();
        const isFavorite = favIds.includes(id);

        if (app.state === Shell.AppState.RUNNING) {
            if (!this._items.has(id)) {
                this.refresh();
                return;
            }
        } else if (app.state === Shell.AppState.STOPPED) {
            if (!isFavorite && this._items.has(id)) {
                this.refresh();
                return;
            }
        }

        const item = this._items.get(id);
        if (item)
            item.updateState();
    }

    _updateAllStates() {
        for (const item of this._items.values()) {
            item.updateState();
        }
    }

    destroy() {
        if (this._favSettingsId) {
            global.settings.disconnect(this._favSettingsId);
            this._favSettingsId = null;
        }
        if (this._installedChangedId) {
            this._appSys.disconnect(this._installedChangedId);
            this._installedChangedId = null;
        }
        if (this._appStateChangedId) {
            this._appSys.disconnect(this._appStateChangedId);
            this._appStateChangedId = null;
        }
        if (this._focusWindowId) {
            global.display.disconnect(this._focusWindowId);
            this._focusWindowId = null;
        }
        if (this._workspaceSwitchId) {
            global.window_manager.disconnect(this._workspaceSwitchId);
            this._workspaceSwitchId = null;
        }

        for (const item of this._items.values()) {
            item.destroy();
        }
        this._items.clear();
        this.actor.destroy();
    }
}
