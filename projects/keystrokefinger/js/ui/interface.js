/**
 * KeystrokeFingerprint - InterfaceController
 * Manages UI interactions, state updates, and connects modules.
 */

import { TypingCollector } from '../core/collector.js';
import { BiometricEngine } from '../core/engine.js';
import { StorageManager } from '../core/storage.js';
import { Visualizer } from './visualizer.js';
import { MathUtils } from '../utils/math.js';

export class InterfaceController {
    constructor() {
        this.collector = new TypingCollector();
        this.engine = new BiometricEngine();
        this.storage = new StorageManager();
        this.visualizer = new Visualizer('rhythm-canvas');

        this.elements = {
            input: document.getElementById('auth-input'),
            btnEnroll: document.getElementById('btn-enroll'),
            btnVerify: document.getElementById('btn-verify'),
            feedback: document.getElementById('feedback-msg'),
            statusDot: document.getElementById('system-status'),
            statusText: document.getElementById('status-text'),
            statDwell: document.getElementById('stat-dwell'),
            statFlight: document.getElementById('stat-flight'),
            statScore: document.getElementById('stat-score')
        };

        this.mode = 'verify'; // 'enroll' or 'verify'
        this.USERNAME = 'current_user'; // Single user demo for now

        this.initListeners();
        this.updateModeUI();

        // Connect Collector to Visualizer
        this.collector.onKeyDown = (key, time) => this.visualizer.addEvent('down');
        this.collector.onKeyUp = (key, time) => this.visualizer.addEvent('up');
    }

    initListeners() {
        this.elements.btnEnroll.addEventListener('click', () => this.setMode('enroll'));
        this.elements.btnVerify.addEventListener('click', () => this.setMode('verify'));

        this.elements.input.addEventListener('focus', () => {
            this.collector.attach(this.elements.input);
            this.setStatus('active');
        });

        this.elements.input.addEventListener('blur', () => {
            // Don't detach immediately if we submitted, but for now ok
            // this.collector.detach();
        });

        // We detect "Enter" to submit the attempt
        this.elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSubmission();
                e.preventDefault();
            } else {
                this.setStatus('typing');
            }
        });
    }

    setMode(newMode) {
        this.mode = newMode;
        this.updateModeUI();
        this.resetInput();
    }

    updateModeUI() {
        if (this.mode === 'enroll') {
            this.elements.btnEnroll.classList.add('active');
            this.elements.btnVerify.classList.remove('active');
            this.elements.feedback.textContent = "Mode: Enrollment. Type a passphrase and press Enter to save profile.";
            this.elements.feedback.style.color = 'var(--text-secondary)';
        } else {
            this.elements.btnVerify.classList.add('active');
            this.elements.btnEnroll.classList.remove('active');
            this.elements.feedback.textContent = "Mode: Verification. Type your passphrase to unlock.";
            this.elements.feedback.style.color = 'var(--text-secondary)';
        }
    }

    resetInput() {
        this.elements.input.value = '';
        this.collector.reset();
        this.visualizer.clear();
        this.updateStats(0, 0, '--');
        this.setStatus('locked');
    }

    setStatus(state) {
        const dot = this.elements.statusDot;
        const text = this.elements.statusText;

        dot.className = 'status-dot'; // Reset

        switch (state) {
            case 'locked':
                dot.classList.add('locked');
                text.textContent = "SYSTEM LOCKED";
                break;
            case 'active':
            case 'typing':
                dot.classList.add('pending');
                text.textContent = "ANALYZING...";
                break;
            case 'success':
                dot.classList.add('success');
                text.textContent = "ACCESS GRANTED";
                break;
            case 'fail':
                dot.classList.add('error');
                text.textContent = "ACCESS DENIED";
                break;
        }
    }

    handleSubmission() {
        const text = this.elements.input.value;
        if (text.length < 4) {
            this.elements.feedback.textContent = "Passphrase too short.";
            this.setStatus('fail');
            return;
        }

        const sessionData = this.collector.getSessionData();
        const vector = this.engine.createVector(sessionData);

        // Update basic stats for display
        const avgDwell = MathUtils.mean(sessionData.dwells.map(d => d.duration));
        const avgFlight = MathUtils.mean(sessionData.flights.map(f => f.time));

        if (this.mode === 'enroll') {
            this.storage.saveProfile(this.USERNAME, text, vector);
            this.elements.feedback.textContent = "Profile Saved Successfully.";
            this.elements.feedback.style.color = 'var(--color-success)';
            this.updateStats(avgDwell, avgFlight, "SAVED");
            this.setStatus('success'); // Visual feedback
            setTimeout(() => this.resetInput(), 1500);

        } else if (this.mode === 'verify') {
            const profile = this.storage.getProfile(this.USERNAME);

            if (!profile) {
                this.elements.feedback.textContent = "No profile found. Please Enroll first.";
                this.setStatus('fail');
                return;
            }

            // Check text match first (Password check)
            if (profile.text !== text) {
                this.elements.feedback.textContent = "Incorrect Passphrase.";
                this.updateStats(avgDwell, avgFlight, "FAIL");
                this.setStatus('fail');
                this.triggerShake();
                return;
            }

            // Biometric Check
            const result = this.engine.compare(vector, profile.vector);

            this.updateStats(avgDwell, avgFlight, (result.score * 100).toFixed(1) + '%');

            if (result.match) {
                this.elements.feedback.textContent = `Identity Verified (Dev: ${result.avgDeviation.toFixed(0)}ms)`;
                this.elements.feedback.style.color = 'var(--color-success)';
                this.setStatus('success');
            } else {
                this.elements.feedback.textContent = `Biometric Mismatch (Dev: ${result.avgDeviation.toFixed(0)}ms)`;
                this.elements.feedback.style.color = 'var(--color-error)';
                this.setStatus('fail');
                this.triggerShake();
            }
        }
    }

    updateStats(dwell, flight, score) {
        this.elements.statDwell.textContent = typeof dwell === 'number' ? dwell.toFixed(1) + 'ms' : dwell;
        this.elements.statFlight.textContent = typeof flight === 'number' ? flight.toFixed(1) + 'ms' : flight;
        this.elements.statScore.textContent = score;
    }

    triggerShake() {
        this.elements.input.parentElement.classList.add('shake');
        setTimeout(() => {
            this.elements.input.parentElement.classList.remove('shake');
        }, 500);
    }
}
