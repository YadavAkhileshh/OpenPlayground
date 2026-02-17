/**
 * RhythmLock - Main Application
 * -----------------------------
 * Entry point. Initializes modules and manages application state (Enrollment vs Verification).
 * Orchestrates the secure authentication flow.
 */

import { KeystrokeTracker } from './biometrics/keystroke-tracker.js';
import { SecureStorage } from './biometrics/secure-storage.js';
import { Visualizer } from './ui/visualizer.js';
import { FeedbackManager } from './ui/feedback.js';
import { InputHandler } from './ui/input-handler.js';
import { AuditLog } from './utils/audit-log.js';
import { EntropyCalculator } from './utils/entropy-calculator.js';
import { DataExporter } from './utils/data-exporter.js';

class RhythmLockApp {
    constructor() {
        // Core Modules
        this.tracker = new KeystrokeTracker();
        this.storage = new SecureStorage();
        this.auditLog = new AuditLog();
        this.entropyCalc = new EntropyCalculator();
        this.exporter = new DataExporter(this.storage);

        // UI Modules
        this.visualizer = new Visualizer('rhythm-canvas');
        this.feedback = new FeedbackManager();

        // State
        this.mode = 'VERIFICATION'; // 'VERIFICATION' or 'ENROLLMENT'
        this.enrollmentCount = 0;
        this.maxEnrollmentSamples = 4;

        // Input Handler (must be initialized after others to bind callbacks)
        this.inputHandler = new InputHandler(
            this.tracker,
            this.handleAttempt.bind(this), // On Complete
            this.handleTypingStart.bind(this) // On Start
        );

        this.bindControls();
        this.checkState();

        this.auditLog.log('SYSTEM', 'Application initialized', { version: '1.0' });
    }

    bindControls() {
        // Buttons
        document.getElementById('enroll-btn').addEventListener('click', () => {
            if (this.mode !== 'ENROLLMENT') {
                this.switchMode('ENROLLMENT');
            }
        });

        document.getElementById('verify-btn').addEventListener('click', () => {
            if (this.mode !== 'VERIFICATION') {
                this.switchMode('VERIFICATION');
            }
        });

        document.getElementById('export-btn').addEventListener('click', () => {
            this.exporter.downloadProfile();
            this.auditLog.log('USER', 'Profile exported');
            this.feedback.showMessage("Profile Exported.");
        });

        // Keyboard Visualizer Hook
        window.addEventListener('keydown', (e) => this.visualizer.triggerEvent('keydown'));
        // window.addEventListener('keyup', (e) => this.visualizer.triggerEvent('keyup')); 
    }

    checkState() {
        this.visualizer.start();
        if (!this.storage.isEnrolled()) {
            this.feedback.showMessage("System Uncalibrated. Please Enroll.");
            this.auditLog.log('SYSTEM', 'No user profile found');
        } else {
            this.auditLog.log('SYSTEM', 'User profile loaded');
        }
    }

    switchMode(newMode) {
        this.mode = newMode;
        this.feedback.setMode(newMode);
        this.feedback.reset();

        // UI Button Updates
        document.getElementById('enroll-btn').className = newMode === 'ENROLLMENT' ? 'btn primary active' : 'btn secondary';
        document.getElementById('verify-btn').className = newMode === 'VERIFICATION' ? 'btn primary active' : 'btn secondary';

        if (newMode === 'ENROLLMENT') {
            this.startEnrollment();
        } else {
            this.inputHandler.reset();
        }

        this.inputHandler.focus();
        this.auditLog.log('USER', `Switched mode to ${newMode}`);
    }

    startEnrollment() {
        this.enrollmentCount = 0;
        this.storage.startEnrollment();
        this.feedback.showMessage(`Enrollment: Type password (${this.enrollmentCount}/${this.maxEnrollmentSamples})`);
    }

    handleTypingStart() {
        this.feedback.updateStatus('ANALYZING INPUT...', 'normal');
        this.feedback.hideStats();
    }

    handleAttempt(text, vector) {
        // Basic length check
        if (text.length < 4) {
            this.feedback.showMessage("Password too short. Try again.");
            this.inputHandler.focus();
            this.auditLog.log('FAILURE', 'Attempt too short', { length: text.length });
            return;
        }

        // Entropy Check (only warning, doesn't block verification really)
        if (this.mode === 'ENROLLMENT') {
            const entropy = this.entropyCalc.calculate(text);
            const strength = this.entropyCalc.getStrengthLabel(entropy);
            console.log(`Password Strength: ${strength} (${Math.round(entropy)} bits)`);
        }

        if (this.mode === 'ENROLLMENT') {
            this.processEnrollmentStep(text, vector);
        } else {
            this.processVerificationStep(text, vector);
        }
    }

    processEnrollmentStep(text, vector) {
        const success = this.storage.addEnrollmentSample(text, vector);

        if (!success) {
            this.feedback.showMessage("Text mismatch! Please type the SAME password.");
            this.auditLog.log('ENROLLMENT', 'Sample mismatch (text)');
            return;
        }

        this.enrollmentCount++;
        this.auditLog.log('ENROLLMENT', `Sample ${this.enrollmentCount} recorded`);

        if (this.enrollmentCount >= this.maxEnrollmentSamples) {
            const finalized = this.storage.finalizeEnrollment();
            if (finalized) {
                this.feedback.showMessage("Enrollment Complete. Switching to Verify.");
                this.auditLog.log('ENROLLMENT', 'Profile created successfully');
                setTimeout(() => this.switchMode('VERIFICATION'), 1500);
            } else {
                this.feedback.showMessage("Enrollment Failed. Try again.");
                this.auditLog.log('ENROLLMENT', 'Profile creation failed');
                this.startEnrollment();
            }
        } else {
            this.feedback.showMessage(`Sample Recorded. Again (${this.enrollmentCount}/${this.maxEnrollmentSamples})`);
            this.inputHandler.focus();
        }
    }

    processVerificationStep(text, vector) {
        if (!this.storage.isEnrolled()) {
            this.feedback.showMessage("No profile found. Please Enroll first.");
            return;
        }

        const result = this.storage.verify(text, vector);

        if (result.success) {
            this.feedback.unlock();
            this.auditLog.log('SUCCESS', 'Authentication successful', { score: result.score });
        } else {
            this.feedback.deny();
            if (result.reason === 'Incorrect Password') {
                this.feedback.showMessage("Incorrect Text.");
                this.auditLog.log('FAILURE', 'Text mismatch');
            } else {
                this.feedback.showMessage(`Rhythm Mismatch (${result.score}% similarity)`);
                this.auditLog.log('FAILURE', 'Rhythm mismatch', { score: result.score, distance: result.distance });
            }
        }

        this.feedback.showStats(result.score, result.distance);
        document.getElementById('keystroke-count').textContent = this.tracker.getStats().totalKeys;
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new RhythmLockApp();
});
