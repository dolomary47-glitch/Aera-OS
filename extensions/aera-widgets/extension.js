/**
 * Aera Widgets — GNOME Shell 46 Extension Entry Point
 * Part of Aera OS Desktop Environment
 *
 * Tokens consumed from: ./aera-tokens.js → design-system/aera-tokens.js
 */

import Gio from 'gi://Gio';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import { WidgetManager } from './modules/widgetManager.js';

const SCHEMA_ID = 'org.gnome.shell.extensions.aera-widgets';

export default class AeraWidgetsExtension extends Extension {
    enable() {
        // Read the schema from the extension's own schemas/ directory
        // (compiled by glib-compile-schemas at install time).
        const source = Gio.SettingsSchemaSource.new_from_directory(
            this.dir.get_child('schemas').get_path(),
            Gio.SettingsSchemaSource.get_default(),
            false);

        this._settings = new Gio.Settings({
            settings_schema: source.lookup(SCHEMA_ID, true),
        });

        this._widgetManager = new WidgetManager(this.path, this._settings);

        Main.layoutManager.addChrome(this._widgetManager.actor, {
            affectsStruts: false,
            trackFullscreen: true,
        });
    }

    disable() {
        if (this._widgetManager) {
            Main.layoutManager.removeChrome(this._widgetManager.actor);
            this._widgetManager.destroy();
            this._widgetManager = null;
        }
        this._settings = null;
    }
}
