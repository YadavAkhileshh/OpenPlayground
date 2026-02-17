/**
 * UI Manager: Handles DOM interactions, transitions, and event listeners.
 */

export const uiManager = {
    elements: {},

    init() {
        this.cacheElements();
        this.setupCoreEvents();
    },

    cacheElements() {
        this.elements = {
            pages: document.querySelectorAll('.page'),
            nav: document.getElementById('main-nav'),
            navItems: document.querySelectorAll('.nav-item'),
            authForm: document.getElementById('auth-form'),
            authMsg: document.getElementById('auth-msg'),
            userDisplay: document.getElementById('user-display'),
            showLogin: document.getElementById('show-login'),
            showSignup: document.getElementById('show-signup'),
            submitBtnText: document.querySelector('#auth-submit .btn-text'),
            dropZone: document.getElementById('drop-zone'),
            audioInput: document.getElementById('audio-input'),
            trackName: document.getElementById('track-name'),
            audioControls: document.getElementById('audio-controls'),
            playPauseBtn: document.getElementById('play-pause'),
            progressFill: document.getElementById('progress-fill'),
            presetsContainer: document.getElementById('presets-container'),
            saveBtn: document.getElementById('save-preset-btn'),
            profileForm: document.getElementById('profile-form'),
            profileMsg: document.getElementById('profile-msg'),
            logoutBtn: document.getElementById('logout-btn'),
            toggleBtn: document.getElementById('toggle-controls'),
            controlsPanel: document.querySelectorAll('.controls-panel')[0],
            visualContainer: document.querySelectorAll('.visual-container')[0],
            params: {
                sensitivity: document.getElementById('param-sensitivity'),
                density: document.getElementById('param-density'),
                flow: document.getElementById('param-flow'),
                theme: document.getElementById('param-theme')
            }
        };
    },

    setupCoreEvents() {
        // Auth Toggles
        this.elements.showLogin.onclick = () => this.toggleAuthMode('login');
        this.elements.showSignup.onclick = () => this.toggleAuthMode('signup');

        // Nav Switching
        this.elements.navItems.forEach(item => {
            item.onclick = (e) => {
                const page = e.target.dataset.page;
                if (page) this.showPage(page);
            };
        });

        // Drop Zone
        this.elements.dropZone.onclick = () => this.elements.audioInput.click();

        // Control Toggle
        this.setupToggleEvent();
    },

    setupToggleEvent() {
        if (this.elements.toggleBtn) {
            this.elements.toggleBtn.onclick = () => {
                this.elements.controlsPanel.classList.toggle('collapsed');
                this.elements.visualContainer.classList.toggle('expanded');

                // Force resize
                setTimeout(() => {
                    // Dispatch resize event for canvas
                    window.dispatchEvent(new Event('resize'));
                }, 150);
            };
        }
    },

    toggleAuthMode(mode) {
        this.elements.showLogin.classList.toggle('active', mode === 'login');
        this.elements.showSignup.classList.toggle('active', mode === 'signup');
        this.elements.submitBtnText.textContent = mode === 'login' ? 'ACCESS ENGINE' : 'INITIALIZE IDENTITY';
        this.elements.authForm.dataset.mode = mode;
        this.elements.authMsg.textContent = '';
    },

    showPage(pageId) {
        this.elements.pages.forEach(p => {
            p.classList.add('hidden');
            p.classList.remove('active');
        });

        const target = document.getElementById(`page-${pageId}`);
        if (target) {
            target.classList.remove('hidden');
            setTimeout(() => target.classList.add('active'), 50);
        }

        // Update nav active state
        this.elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === pageId);
        });
    },

    showAuthError(msg) {
        this.elements.authMsg.textContent = msg;
        this.elements.authMsg.className = 'status-msg error';
    },

    showAuthSuccess(msg) {
        this.elements.authMsg.textContent = msg;
        this.elements.authMsg.className = 'status-msg success';
    },

    updateUserUI(user) {
        if (user) {
            this.elements.userDisplay.textContent = `USER::${user.username.toUpperCase()}`;
            this.elements.nav.classList.remove('hidden');
        } else {
            this.elements.userDisplay.textContent = 'UNAUTHORIZED';
            this.elements.nav.classList.add('hidden');
        }
    },

    updateProgress(percent) {
        this.elements.progressFill.style.width = `${percent}%`;
    },

    renderPresets(presets, onApply) {
        const container = this.elements.presetsContainer;
        if (!presets || presets.length === 0) {
            container.innerHTML = '<div class="preset-empty">No sequences found in local storage.</div>';
            return;
        }

        container.innerHTML = '';
        presets.forEach((preset, index) => {
            const card = document.createElement('div');
            card.className = 'preset-card glass';
            card.innerHTML = `
                <div class="preset-info">
                    <h4>${preset.name.toUpperCase()}</h4>
                    <p>THEME: ${preset.theme.toUpperCase()}</p>
                </div>
                <button class="apply-btn cyber-button" data-index="${index}">RESTORE</button>
            `;
            container.appendChild(card);

            card.querySelector('.apply-btn').onclick = () => onApply(preset);
        });
    },

    renderProfile(user) {
        if (!user) return;
        this.elements.profileForm['profile-username'].value = user.username;
        this.elements.profileForm['profile-password'].value = user.password;
    },

    showProfileError(msg) {
        this.elements.profileMsg.textContent = msg;
        this.elements.profileMsg.className = 'status-msg error';
    },

    showProfileSuccess(msg) {
        this.elements.profileMsg.textContent = msg;
        this.elements.profileMsg.className = 'status-msg success';
    }
};
