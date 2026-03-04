/**
 * File: js/audio/synth.js
 * MouseTone Module
 * Copyright (c) 2026
 * 
 * Modular synthesizer components for the audio engine.
 * Includes LFOs, Envelopes (ADSR), and a complete SynthVoice class.
 */

/**
 * Low-Frequency Oscillator (LFO).
 * Used to modulate parameters (pitch, filter, gain) over time.
 */
export class LFO {
    /**
     * @param {AudioContext} ctx 
     * @param {Object} options 
     */
    constructor(ctx, options = {}) {
        this.ctx = ctx;
        this.osc = ctx.createOscillator();
        this.osc.type = options.type || 'sine';
        this.osc.frequency.value = options.freq || 1.0;
        this.gain = ctx.createGain();
        this.gain.gain.value = options.depth || 100;

        this.osc.connect(this.gain);
        this.osc.start();
    }

    /**
     * Connects this LFO to an AudioParam.
     * @param {AudioParam} param - The parameter to modulate.
     */
    connect(param) {
        this.gain.connect(param);
    }

    /**
     * Sets the frequency of the LFO.
     * @param {number} rate - Frequency in Hz.
     */
    setRate(rate) {
        this.osc.frequency.setTargetAtTime(rate, this.ctx.currentTime, 0.1);
    }
}

/**
 * Attack-Decay-Sustain-Release (ADSR) Envelope Generator.
 * Controls the evolution of a value (usually volume or filter cutoff) over time.
 */
export class ADSR {
    /**
     * @param {AudioContext} ctx 
     * @param {AudioParam} param - The AudioParam to control. 
     * @param {Object} options - Envelope times (attack, decay, release) and sustain level.
     */
    constructor(ctx, param, options = {}) {
        this.ctx = ctx;
        this.param = param;
        this.attack = options.attack || 0.1;
        this.decay = options.decay || 0.1;
        this.sustain = options.sustain || 0.5;
        this.release = options.release || 0.5;
    }

    /**
     * Triggers the Attack and Decay phases.
     * @param {number} time - When to start.
     * @param {number} velocity - Peak value (0-1).
     */
    trigger(time, velocity = 1.0) {
        const now = time || this.ctx.currentTime;
        this.param.cancelScheduledValues(now);
        this.param.setValueAtTime(0, now);
        this.param.linearRampToValueAtTime(velocity, now + this.attack);
        this.param.exponentialRampToValueAtTime(this.sustain * velocity, now + this.attack + this.decay);
    }

    /**
     * Triggers the Release phase.
     * @param {number} time - When to release.
     */
    release(time) {
        const now = time || this.ctx.currentTime;
        this.param.cancelScheduledValues(now);
        this.param.setValueAtTime(this.param.value, now);
        this.param.exponentialRampToValueAtTime(0.001, now + this.release);
    }
}

/**
 * A monophonic subtractive synthesizer voice.
 * Features 2 oscillators, dual ADSR envelopes (Amp & Filter), and an LFO for vibrato.
 */
export class SynthVoice {
    /**
     * @param {AudioContext} ctx 
     * @param {AudioNode} destination - Where to route the output.
     */
    constructor(ctx, destination) {
        this.ctx = ctx;
        this.destination = destination;

        this.osc1 = ctx.createOscillator();
        this.osc2 = ctx.createOscillator();
        this.filter = ctx.createBiquadFilter();
        this.amp = ctx.createGain();

        this.osc1.type = 'sawtooth';
        this.osc2.type = 'square';
        this.osc2.detune.value = 10; // Slight detune for thickness

        this.filter.type = 'lowpass';
        this.filter.Q.value = 5;

        // Routing
        this.osc1.connect(this.filter);
        this.osc2.connect(this.filter);
        this.filter.connect(this.amp);
        this.amp.connect(destination);

        this.envelope = new ADSR(ctx, this.amp.gain);
        this.filterEnvelope = new ADSR(ctx, this.filter.frequency, {
            attack: 0.05, decay: 0.2, sustain: 200, release: 1.0
        });

        this.lfo = new LFO(ctx, { freq: 5, depth: 5 });
        this.lfo.connect(this.osc1.frequency); // Vibrato

        this.active = false;

        this.osc1.start();
        this.osc2.start();
        this.amp.gain.value = 0;
    }

    /**
     * Play a note.
     * @param {number} freq - Frequency in Hz.
     * @param {number} time - Start time.
     * @param {number} vel - Velocity (0-1).
     */
    play(freq, time, vel = 0.5) {
        this.active = true;
        this.osc1.frequency.setValueAtTime(freq, time);
        this.osc2.frequency.setValueAtTime(freq, time);

        this.envelope.trigger(time, vel);
        this.filter.frequency.setValueAtTime(freq * 4, time); // Brightness follows pitch
        this.filterEnvelope.trigger(time, freq * 2);
    }

    /**
     * Stop the note (release).
     * @param {number} time - Stop time.
     */
    stop(time) {
        this.active = false;
        this.envelope.release(time);
        this.filterEnvelope.release(time);
        this.amp.gain.setTargetAtTime(0, time + 0.5, 0.1);
    }
}
