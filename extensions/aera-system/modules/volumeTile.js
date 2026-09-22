/**
 * Aera System — Volume slider
 * Backend: Gvc mixer (PipeWire). Own Gvc.MixerControl instance mirroring how
 * Shell instantiates its own; tracks the real default sink, including changes
 * from keyboard media keys or other apps.
 */

import Gvc from 'gi://Gvc';

import { SliderTile } from './controls.js';

export class VolumeSlider {
    constructor() {
        this.available = false;
        this._sink = null;

        this._mixer = new Gvc.MixerControl({ name: 'Aera System' });
        this._volumeMax = this._mixer.get_vol_max_norm();

        this.tile = new SliderTile({
            iconName: 'audio-volume-muted-symbolic',
            value: 0,
            title: 'Sounds',
        });
        this.tile.onChanged(v => this._applyVolume(v));
        this.tile.onIconClicked(() => this._toggleMute());

        this._stateChangedId = this._mixer.connect('state-changed', () => {
            this._bindSink();
        });
        this._defaultSinkId = this._mixer.connect('default-sink-changed', () => {
            this._bindSink();
        });

        this._mixer.open();
        this._bindSink();
        this.available = true;
    }

    _bindSink() {
        if (this._sink) {
            if (this._volumeNotifyId)
                this._sink.disconnect(this._volumeNotifyId);
            if (this._muteNotifyId)
                this._sink.disconnect(this._muteNotifyId);
            this._sink = null;
        }

        this._sink = this._mixer.get_default_sink();
        if (this._sink) {
            this._volumeNotifyId = this._sink.connect('notify::volume', () => {
                this._render();
            });
            this._muteNotifyId = this._sink.connect('notify::is-muted', () => {
                this._render();
            });
        }
        this._render();
    }

    _applyVolume(value) {
        if (!this._sink) return;
        this._sink.volume = Math.round(value * this._volumeMax);
        this._render();
    }

    _toggleMute() {
        if (!this._sink) return;
        this._sink.is_muted = !this._sink.is_muted;
        this._render();
    }

    _render() {
        if (!this._sink) {
            this.tile.setValue(0);
            this.tile.icon = 'audio-volume-muted-symbolic';
            return;
        }

        const fraction = this._sink.volume / this._volumeMax;
        this.tile.setValue(fraction);

        let icon;
        if (this._sink.is_muted || fraction <= 0.01)
            icon = 'audio-volume-muted-symbolic';
        else if (fraction < 0.34)
            icon = 'audio-volume-low-symbolic';
        else if (fraction < 0.67)
            icon = 'audio-volume-medium-symbolic';
        else
            icon = 'audio-volume-high-symbolic';
        this.tile.icon = icon;
    }

    destroy() {
        if (this._sink) {
            if (this._volumeNotifyId)
                this._sink.disconnect(this._volumeNotifyId);
            if (this._muteNotifyId)
                this._sink.disconnect(this._muteNotifyId);
        }
        if (this._stateChangedId)
            this._mixer.disconnect(this._stateChangedId);
        if (this._defaultSinkId)
            this._mixer.disconnect(this._defaultSinkId);
        this._mixer.close();
        this.tile?.destroy();
    }
}
