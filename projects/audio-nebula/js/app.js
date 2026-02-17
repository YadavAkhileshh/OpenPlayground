/**
 * Main App Controller: Ties all modules together.
 */

import { auth } from './auth.js';
import { uiManager } from './uiManager.js';
import { audioEngine } from './audioEngine.js';
import { nebulaCore } from './nebulaCore.js';

class App {
    constructor() {
        this.frameId = null;
    }

    init() {
        uiManager.init();
        nebulaCore.init('nebula-canvas', 'global-bg');

        this.checkSession();
        this.setupAuthHandlers();
        this.setupEngineHandlers();

        // Start render loop
        this.loop();
    }

    checkSession() {
        const session = auth.getCurrentSession();
        if (session) {
            const userData = auth.getUserData();
            uiManager.updateUserUI(userData);
            this.showPage('visualizer');
        } else {
            this.showPage('auth');
        }
    }

    showPage(pageId) {
        uiManager.showPage(pageId);

        // Specific page logic
        const userData = auth.getUserData();
        if (pageId === 'visualizer') {
            // Ensure canvas has dimensions after being unhidden
            setTimeout(() => nebulaCore.resize(), 100);
        } else if (pageId === 'presets') {
            uiManager.renderPresets(userData?.presets || [], (preset) => {
                this.applyPreset(preset);
            });
        } else if (pageId === 'profile') {
            uiManager.renderProfile(userData);
        }
    }

    applyPreset(preset) {
        nebulaCore.updateParams({
            density: preset.density,
            flowRate: preset.flowRate,
            theme: preset.theme
        });

        // Update UI inputs
        const { params } = uiManager.elements;
        params.density.value = preset.density;
        params.flow.value = preset.flowRate;
        params.theme.value = preset.theme;

        this.showPage('visualizer');
        alert(`RESTORED SEQUENCE: ${preset.name.toUpperCase()}`);
    }

    setupAuthHandlers() {
        const { authForm, logoutBtn, profileForm } = uiManager.elements;

        authForm.onsubmit = (e) => {
            e.preventDefault();
            const username = e.target.username.value;
            const password = e.target.password.value;
            const mode = e.target.dataset.mode || 'login';

            if (mode === 'signup') {
                const res = auth.signup(username, password);
                if (res.success) {
                    uiManager.showAuthSuccess(res.message);
                    setTimeout(() => uiManager.toggleAuthMode('login'), 1500);
                } else {
                    uiManager.showAuthError(res.message);
                }
            } else {
                const res = auth.login(username, password);
                if (res.success) {
                    uiManager.updateUserUI(res.user);
                    // Crucial: Initialize audio engine on first login interaction if needed
                    audioEngine.init();
                    this.showPage('visualizer');
                } else {
                    uiManager.showAuthError(res.message);
                }
            }
        };

        profileForm.onsubmit = (e) => {
            e.preventDefault();
            const username = e.target['profile-username'].value;
            const password = e.target['profile-password'].value;

            const res = auth.updateProfile(username, password);
            if (res.success) {
                uiManager.showProfileSuccess('IDENTITY_UPDATED');
                uiManager.updateUserUI(res.user);
            } else {
                uiManager.showProfileError(res.message);
            }
        };

        logoutBtn.onclick = () => {
            auth.logout();
            uiManager.updateUserUI(null);
            this.showPage('auth');
            audioEngine.pause();
        };

        // Handle navigation clicks
        uiManager.elements.navItems.forEach(item => {
            item.onclick = () => {
                const pageId = item.dataset.page;
                this.showPage(pageId);
            };
        });
    }

    setupEngineHandlers() {
        const { audioInput, playPauseBtn, params, dropZone } = uiManager.elements;

        audioInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                // AudioContext must be resumed on user gesture
                audioEngine.init();
                const name = await audioEngine.loadTrack(file);
                uiManager.elements.trackName.textContent = name.toUpperCase();
                dropZone.classList.add('hidden');
                uiManager.elements.audioControls.classList.remove('hidden');
                audioEngine.play();
                playPauseBtn.textContent = '⏸';
            } catch (err) {
                alert(err);
            }
        };

        playPauseBtn.onclick = () => {
            // AudioContext must be resumed on user gesture
            audioEngine.init();
            if (audioEngine.isPlaying) {
                audioEngine.pause();
                playPauseBtn.textContent = '⏵';
            } else {
                audioEngine.play();
                playPauseBtn.textContent = '⏸';
            }
        };

        params.density.oninput = (e) => nebulaCore.updateParams({ density: parseInt(e.target.value) });
        params.flow.oninput = (e) => nebulaCore.updateParams({ flowRate: parseInt(e.target.value) });
        params.theme.onchange = (e) => nebulaCore.updateParams({ theme: e.target.value });
        params.sensitivity.oninput = (e) => nebulaCore.updateParams({ sensitivity: parseInt(e.target.value) });

        uiManager.elements.saveBtn.onclick = () => {
            const name = prompt("NAME THIS FREQUENCY SEQUENCE:");
            if (!name) return;

            const preset = {
                name,
                density: parseInt(params.density.value),
                flowRate: parseInt(params.flow.value),
                theme: params.theme.value
            };

            const res = auth.savePreset(preset);
            if (res.success) {
                alert("SEQUENCE_STORED_IN_QUANTUM_LOCAL_STORAGE");
            }
        };
    }

    loop() {
        const stats = audioEngine.getAudioStats();

        // If playing, update pulse effect
        if (audioEngine.isPlaying) {
            const progress = (audioEngine.audioElement.currentTime / audioEngine.audioElement.duration) * 100;
            uiManager.updateProgress(progress);
        }

        nebulaCore.render(stats);

        this.frameId = requestAnimationFrame(() => this.loop());
    }
}

const app = new App();
window.onload = () => app.init();
