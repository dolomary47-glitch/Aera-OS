/**
 * Aera Widgets — Weather Widget
 * Live temperature + condition card. Location comes from GeoClue2 (system
 * geolocation) or a manual city override; data comes from Open-Meteo (no API
 * key). All values are real system/API data — never mocked.
 *
 * Token usage: type.metric / type.caption sizes, motion.durations for pulse,
 * colors via stylesheet.css classes only.
 */

import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Soup from 'gi://Soup?version=3.0';
import St from 'gi://St';

import { motion } from '../aera-tokens.js';

const GEOCLUE_BUS = 'org.freedesktop.GeoClue2';
const GEOCLUE_ACCURACY_CITY = 8; // GeoClueAccuracyLevel CITY

// GJS on GNOME 46 has no global fetch — HTTP goes through libsoup 3,
// which is part of the base desktop image.
const _httpSession = Soup.Session.new();

function httpGetJson(url) {
    return new Promise((resolve, reject) => {
        const message = Soup.Message.new('GET', url);
        _httpSession.send_and_read_async(message, GLib.PRIORITY_DEFAULT, null,
            (sess, res) => {
                try {
                    const bytes = sess.send_and_read_finish(res);
                    if (!bytes)
                        throw new Error('Empty response');
                    if (message.get_status() !== 200)
                        throw new Error(`HTTP ${message.get_status()}`);
                    resolve(JSON.parse(
                        new TextDecoder().decode(bytes.get_data())));
                } catch (e) {
                    reject(e);
                }
            });
    });
}

// WMO weather interpretation codes → label + themed symbolic icon
const WMO_CODES = [
    [[0], 'Clear sky', 'weather-clear-symbolic'],
    [[1], 'Mainly clear', 'weather-few-clouds-symbolic'],
    [[2], 'Partly cloudy', 'weather-few-clouds-symbolic'],
    [[3], 'Overcast', 'weather-overcast-symbolic'],
    [[45, 48], 'Fog', 'weather-overcast-symbolic'],
    [[51, 53, 55, 56, 57], 'Drizzle', 'weather-showers-scattered-symbolic'],
    [[61, 63, 65, 66, 67, 80, 81, 82], 'Rain', 'weather-showers-symbolic'],
    [[71, 73, 75, 77, 85, 86], 'Snow', 'weather-snow-symbolic'],
    [[95, 96, 97, 99], 'Thunderstorm', 'weather-storm-symbolic'],
];

function weatherFromCode(code) {
    for (const [codes, label, icon] of WMO_CODES) {
        if (codes.includes(code))
            return { label, icon };
    }
    return { label: 'Unknown conditions', icon: 'weather-overcast-symbolic' };
}

export class AeraWeatherWidget {
    constructor(extensionPath, settings) {
        this._settings = settings;
        this._destroyed = false;
        this._fetchSeq = 0;
        this._pulsing = false;
        this._pulseId = 0;
        this._place = '';

        // ── Card shell ───────────────────────────────────────────────────────
        this.actor = new St.BoxLayout({
            style_class: 'aera-widget-card aera-weather-card',
            vertical: true,
            reactive: true,
        });

        // ── Content: place header · hero temperature · icon + details ────────
        this._textBox = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'aera-weather-text',
        });

        this._placeLabel = new St.Label({
            style_class: 'aera-weather-place',
            text: '',
            x_align: Clutter.ActorAlign.START,
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });

        this._settingsButton = new St.Button({
            style_class: 'aera-widget-settings-button',
            toggle_mode: true,
            child: new St.Icon({
                icon_name: 'open-menu-symbolic',
                icon_size: 16,
            }),
        });
        this._settingsButton.connect('notify::checked', () => {
            this._setPanelVisible(this._settingsButton.checked);
        });

        this._headerRow = new St.BoxLayout({
            style_class: 'aera-weather-header',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._headerRow.add_child(this._placeLabel);
        this._headerRow.add_child(this._settingsButton);

        this._tempLabel = new St.Label({
            style_class: 'aera-weather-temp',
            text: '—',
            x_align: Clutter.ActorAlign.START,
        });

        this._icon = new St.Icon({
            icon_name: 'weather-clear-symbolic',
            style_class: 'aera-weather-icon',
            icon_size: 48,
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._summaryLabel = new St.Label({
            style_class: 'aera-weather-summary',
            text: '',
            x_align: Clutter.ActorAlign.START,
        });
        this._feelsLabel = new St.Label({
            style_class: 'aera-weather-feels',
            text: '',
            x_align: Clutter.ActorAlign.START,
            visible: false,
        });
        this._summaryBox = new St.BoxLayout({
            vertical: true,
            x_expand: true,
            style_class: 'aera-weather-summary-box',
        });
        this._summaryBox.add_child(this._summaryLabel);
        this._summaryBox.add_child(this._feelsLabel);

        this._bottomRow = new St.BoxLayout({
            style_class: 'aera-weather-bottom',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this._bottomRow.add_child(this._icon);
        this._bottomRow.add_child(this._summaryBox);

        this._textBox.add_child(this._headerRow);
        this._textBox.add_child(this._tempLabel);
        this._textBox.add_child(this._bottomRow);
        this.actor.add_child(this._textBox);

        // ── Compact error row ────────────────────────────────────────────────
        this._errorBox = new St.BoxLayout({
            style_class: 'aera-weather-row aera-widget-error',
            y_align: Clutter.ActorAlign.CENTER,
            visible: false,
        });
        this._errorIcon = new St.Icon({
            icon_name: 'dialog-warning-symbolic',
            style_class: 'aera-weather-icon',
            icon_size: 24,
        });
        this._errorLabel = new St.Label({
            style_class: 'aera-weather-meta',
            text: '',
            y_align: Clutter.ActorAlign.CENTER,
            x_expand: true,
        });
        this._retryButton = new St.Button({
            style_class: 'aera-widget-settings-button',
            child: new St.Icon({
                icon_name: 'view-refresh-symbolic',
                icon_size: 16,
            }),
        });
        this._retryButton.connect('clicked', () => this.refresh());
        this._errorBox.add_child(this._errorIcon);
        this._errorBox.add_child(this._errorLabel);
        this._errorBox.add_child(this._retryButton);
        this.actor.add_child(this._errorBox);

        // ── Inline settings panel ────────────────────────────────────────────
        this._panel = this._buildSettingsPanel();
        this.actor.add_child(this._panel);

        this.refresh();
    }

    _buildSettingsPanel() {
        const panel = new St.BoxLayout({
            style_class: 'aera-widget-settings',
            vertical: true,
            visible: false,
        });

        const locRow = new St.BoxLayout({
            style_class: 'aera-widget-settings-row',
        });
        this._cityEntry = new St.Entry({
            style_class: 'aera-widget-entry',
            hint_text: 'City name',
            can_focus: true,
            x_expand: true,
        });
        this._cityEntry.clutter_text.connect('activate', () => this._geocodeAndSet());
        this._searchButton = new St.Button({
            style_class: 'aera-widget-chip',
            label: 'Search',
        });
        this._searchButton.connect('clicked', () => this._geocodeAndSet());
        locRow.add_child(this._cityEntry);
        locRow.add_child(this._searchButton);

        this._hintLabel = new St.Label({
            style_class: 'aera-widget-hint',
            text: '',
            x_align: Clutter.ActorAlign.START,
        });

        const modeRow = new St.BoxLayout({
            style_class: 'aera-widget-settings-row',
        });
        this._autoButton = new St.Button({
            style_class: 'aera-widget-chip',
            toggle_mode: true,
            label: 'Automatic location',
        });
        this._autoButton.connect('clicked', () => {
            this._settings.set_string('weather-location-mode', 'auto');
        });
        this._unitsButton = new St.Button({
            style_class: 'aera-widget-chip',
        });
        this._unitsButton.connect('clicked', () => {
            const order = ['auto', 'metric', 'imperial'];
            const current = this._settings.get_string('weather-units');
            const next = order[(order.indexOf(current) + 1) % order.length];
            this._settings.set_string('weather-units', next);
        });
        modeRow.add_child(this._autoButton);
        modeRow.add_child(this._unitsButton);

        panel.add_child(locRow);
        panel.add_child(this._hintLabel);
        panel.add_child(modeRow);
        return panel;
    }

    _setPanelVisible(visible) {
        if (!this._panel) return;
        if (visible)
            this._syncPanel();
        this._panel.visible = visible;
    }

    _syncPanel() {
        const mode = this._settings.get_string('weather-location-mode');
        this._autoButton.checked = mode === 'auto';
        this._unitsButton.label = `Units · ${this._settings.get_string('weather-units')}`;
        this._cityEntry.set_text(this._settings.get_string('weather-location-name'));
        this._hintLabel.set_text('');
    }

    // ── Settings contract ────────────────────────────────────────────────────
    onSettingsChanged(key) {
        if (key.startsWith('weather-'))
            this._queueRefresh();
    }

    _queueRefresh() {
        if (this._queuedRefreshId) return;
        this._queuedRefreshId = GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            this._queuedRefreshId = null;
            if (!this._destroyed)
                this.refresh();
            return GLib.SOURCE_REMOVE;
        });
    }

    _effectiveUnits() {
        const pref = this._settings.get_string('weather-units');
        if (pref === 'metric' || pref === 'imperial')
            return pref;
        // 'auto' — locales that conventionally use Fahrenheit
        const locale = GLib.get_language_names().find(l => l.includes('_')) ?? '';
        const region = locale.split('_')[1] ?? '';
        return ['US', 'LR', 'MM'].includes(region) ? 'imperial' : 'metric';
    }

    // ── State machine ────────────────────────────────────────────────────────
    _setState(state, detail = '') {
        this._state = state;
        if (state === 'loading') {
            this._errorBox.hide();
            this._textBox.show();
            this._tempLabel.set_text('···');
            this._summaryLabel.set_text(detail);
            this._feelsLabel.visible = false;
            this._startPulse();
        } else if (state === 'error') {
            this._stopPulse();
            this._textBox.hide();
            this._errorLabel.set_text(detail || 'Unavailable');
            this._errorBox.show();
        } else {
            this._stopPulse();
            this._errorBox.hide();
            this._textBox.show();
        }
    }

    // Full-color status icons from the hicolor theme (as the reference does),
    // falling back to the themed symbolic icon when none is installed.
    _setWeatherIcon(iconName) {
        const base = `${iconName}`.replace(/-symbolic$/, '');
        for (const suffix of ['-large', '-small', '']) {
            const file = Gio.File.new_for_path(GLib.build_filenamev(
                ['/usr/share/icons/hicolor/scalable/status', `${base}${suffix}.svg`]));
            if (file.query_exists(null)) {
                this._icon.gicon = Gio.FileIcon.new(file);
                return;
            }
        }
        this._icon.gicon = null;
        this._icon.icon_name = iconName;
    }

    _startPulse() {
        if (this._pulsing) return;
        this._pulsing = true;
        // Fire-and-forget flips on a timeout instead of chaining ease() via
        // onComplete: an unmapped actor completes transitions synchronously,
        // which turned chained callbacks into unbounded recursion.
        let dim = false;
        const step = () => {
            if (this._destroyed || !this._pulsing) return GLib.SOURCE_REMOVE;
            dim = !dim;
            this._textBox.ease({
                opacity: dim ? 80 : 255,
                duration: motion.durations.smooth,
                mode: Clutter.AnimationMode.EASE_IN_OUT_QUAD,
            });
            return GLib.SOURCE_CONTINUE;
        };
        step();
        this._pulseId = GLib.timeout_add(
            GLib.PRIORITY_DEFAULT, motion.durations.smooth, step);
    }

    _stopPulse() {
        this._pulsing = false;
        if (this._pulseId) {
            GLib.source_remove(this._pulseId);
            this._pulseId = 0;
        }
        this._textBox.ease({ opacity: 255, duration: 0 });
    }

    // ── Refresh pipeline ─────────────────────────────────────────────────────
    refresh() {
        const mode = this._settings.get_string('weather-location-mode');

        if (mode === 'manual') {
            const name = this._settings.get_string('weather-location-name');
            const lat = this._settings.get_double('weather-latitude');
            const lon = this._settings.get_double('weather-longitude');

            if (!name && lat === 0 && lon === 0) {
                this._setState('error', 'No location set yet');
                return;
            }
            this._place = name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            this._fetchWeather(lat, lon);
            return;
        }

        this._startAutoLocation();
    }

    _scheduleRefresh() {
        if (this._refreshId) {
            GLib.source_remove(this._refreshId);
            this._refreshId = null;
        }
        const minutes = this._settings.get_int('weather-refresh-minutes');
        this._refreshId = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT, minutes * 60, () => {
                this._refreshId = null;
                if (!this._destroyed)
                    this.refresh();
                return GLib.SOURCE_REMOVE;
            });
    }

    async _fetchWeather(lat, lon) {
        const seq = ++this._fetchSeq;
        const units = this._effectiveUnits();
        const unitChar = units === 'imperial' ? 'F' : 'C';
        const url = 'https://api.open-meteo.com/v1/forecast'
            + `?latitude=${lat}&longitude=${lon}`
            + '&current=temperature_2m,apparent_temperature,weather_code'
            + `&temperature_unit=${units === 'imperial' ? 'fahrenheit' : 'celsius'}`
            + '&timezone=auto';

        this._setState('loading', 'Loading weather…');
        try {
            const data = await httpGetJson(url);

            if (this._destroyed || seq !== this._fetchSeq)
                return;

            const temp = Math.round(data.current.temperature_2m);
            const info = weatherFromCode(Number(data.current.weather_code));

            this._setWeatherIcon(info.icon);
            this._tempLabel.set_text(`${temp}°${unitChar}`);
            this._summaryLabel.set_text(info.label);
            const feels = Number(data.current.apparent_temperature);
            if (Number.isFinite(feels)) {
                this._feelsLabel.set_text(
                    `Feels like ${Math.round(feels)}°${unitChar}`);
                this._feelsLabel.visible = true;
            } else {
                this._feelsLabel.visible = false;
            }
            this._placeLabel.set_text(this._place);
            this._setState('ready');
        } catch (e) {
            if (this._destroyed || seq !== this._fetchSeq)
                return;
            this._setState('error', 'Weather unavailable');
        }
        this._scheduleRefresh();
    }

    async _geocodeAndSet() {
        const query = this._cityEntry.get_text().trim();
        if (!query)
            return;

        this._searchButton.reactive = false;
        this._hintLabel.set_text('Searching…');
        try {
            const url = 'https://geocoding-api.open-meteo.com/v1/search'
                + '?count=1&language=en'
                + `&name=${encodeURIComponent(query)}`;
            const data = await httpGetJson(url);

            if (this._destroyed)
                return;

            const place = data?.results?.[0];
            if (!place) {
                this._hintLabel.set_text(`No match for “${query}”`);
                return;
            }

            const name = place.country ? `${place.name}, ${place.country}` : place.name;
            this._settings.set_string('weather-location-mode', 'manual');
            this._settings.set_double('weather-latitude', place.latitude);
            this._settings.set_double('weather-longitude', place.longitude);
            this._settings.set_string('weather-location-name', name);
            this._hintLabel.set_text(`Saved · ${name}`);
            // The settings changes trigger refresh via onSettingsChanged
        } catch (e) {
            if (!this._destroyed)
                this._hintLabel.set_text('Search failed — check your network');
        } finally {
            if (!this._destroyed)
                this._searchButton.reactive = true;
        }
    }

    // ── GeoClue2 (system geolocation over D-Bus) ─────────────────────────────
    _startAutoLocation() {
        this._stopGeoClue();
        this._setState('loading', 'Getting location…');

        // GeoClue refuses every client while the system Location Services
        // switch is off (default on fresh installs) — say so directly.
        try {
            const locSettings = Gio.Settings.new('org.gnome.system.location');
            if (!locSettings.get_boolean('enabled')) {
                this._setState('error', 'Enable Location Services in Settings');
                this._scheduleRefresh();
                return;
            }
        } catch {
            // Schema not installed — let GeoClue itself answer
        }

        try {
            const manager = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
                GEOCLUE_BUS, '/org/freedesktop/GeoClue2/Manager',
                `${GEOCLUE_BUS}.Manager`, null);

            // No-argument D-Bus calls take null parameters — a GLib.Variant
            // built from '()' throws in GJS because there is no value to pack.
            const reply = manager.call_sync('GetClient',
                null, Gio.DBusCallFlags.NONE, -1, null);
            const [clientPath] = reply.deep_unpack();

            this._geoClientProxy = Gio.DBusProxy.new_for_bus_sync(
                Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
                GEOCLUE_BUS, clientPath, `${GEOCLUE_BUS}.Client`, null);

            // The D-Bus caller is gnome-shell itself, so use Shell's desktop
            // id — GeoClue's consent agent validates it.
            this._geoSetProp('DesktopId',
                new GLib.Variant('s', 'org.gnome.Shell.desktop'));
            // GeoClue 2.7 renamed the writable property to
            // RequestedAccuracyLevel (AccuracyLevel was read-only there).
            this._geoSetProp('RequestedAccuracyLevel',
                new GLib.Variant('u', GEOCLUE_ACCURACY_CITY));

            this._geoSignalId = this._geoClientProxy.connectSignal(
                'LocationUpdated', (proxy, name, args) =>
                    this._onLocationUpdated(args));

            this._geoClientProxy.call_sync('Start',
                null, Gio.DBusCallFlags.NONE, -1, null);

            this._geoTimeoutId = GLib.timeout_add_seconds(
                GLib.PRIORITY_DEFAULT, 30, () => {
                    this._geoTimeoutId = null;
                    if (this._destroyed)
                        return GLib.SOURCE_REMOVE;
                    this._stopGeoClue();
                    this._setState('error', 'Location timed out');
                    this._scheduleRefresh();
                    return GLib.SOURCE_REMOVE;
                });
        } catch (e) {
            this._stopGeoClue();
            // Surface the real D-Bus reason (trimmed) — never a vague label
            const reason = `${e.message ?? e}`
                .replace(/^GDBus\.Error:[^:]+:\s*/, '').trim();
            this._setState('error',
                reason ? `Location: ${reason.slice(0, 60)}` : 'Location unavailable');
            this._scheduleRefresh();
        }
    }

    _geoSetProp(name, value) {
        this._geoClientProxy.call_sync(
            'org.freedesktop.DBus.Properties.Set',
            new GLib.Variant('(ssv)', [`${GEOCLUE_BUS}.Client`, name, value]),
            Gio.DBusCallFlags.NONE, -1, null);
    }

    _onLocationUpdated(args) {
        // Signal payload is (old, new) — before the first fix `old` is '/',
        // so the NEW path is the one to follow.
        const [, locationPath] = args.deep_unpack();
        if (!locationPath || locationPath === '/')
            return;

        this._clearGeoTimeout();

        try {
            const lat = this._readLocationProp(locationPath, 'Latitude');
            const lon = this._readLocationProp(locationPath, 'Longitude');
            this._stopGeoClue();
            this._place = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
            this._fetchWeather(lat, lon);
        } catch (e) {
            this._stopGeoClue();
            this._setState('error', 'Could not read location');
            this._scheduleRefresh();
        }
    }

    _readLocationProp(path, name) {
        const proxy = Gio.DBusProxy.new_for_bus_sync(
            Gio.BusType.SYSTEM, Gio.DBusProxyFlags.NONE, null,
            GEOCLUE_BUS, path, 'org.freedesktop.DBus.Properties', null);
        const value = proxy.call_sync('Get',
            new GLib.Variant('(ss)', [`${GEOCLUE_BUS}.Location`, name]),
            Gio.DBusCallFlags.NONE, -1, null);
        return value.deep_unpack()[0].unpack();
    }

    _clearGeoTimeout() {
        if (this._geoTimeoutId) {
            GLib.source_remove(this._geoTimeoutId);
            this._geoTimeoutId = null;
        }
    }

    _stopGeoClue() {
        this._clearGeoTimeout();

        if (this._geoClientProxy) {
            if (this._geoSignalId) {
                this._geoClientProxy.disconnectSignal(this._geoSignalId);
                this._geoSignalId = null;
            }
            try {
                this._geoClientProxy.call_sync('Stop',
                    null, Gio.DBusCallFlags.NONE, 500, null);
            } catch (e) {
                // Session may already be gone; nothing to release.
            }
            this._geoClientProxy = null;
        }
    }

    // ── Teardown ─────────────────────────────────────────────────────────────
    destroy() {
        this._destroyed = true;
        this._stopPulse();

        if (this._queuedRefreshId) {
            GLib.source_remove(this._queuedRefreshId);
            this._queuedRefreshId = null;
        }

        if (this._refreshId) {
            GLib.source_remove(this._refreshId);
            this._refreshId = null;
        }

        this._stopGeoClue();
        this.actor.destroy();
    }
}
