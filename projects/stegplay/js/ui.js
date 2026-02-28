/**
 * @file ui.js
 * @description Main UI Controller for StegPlay.
 * 
 * This module orchestrates the interaction between the user interface, 
 * the StegoEngine, and the ContentParser. It manages:
 * - Panel animations and state
 * - Theme switching (Light/Dark)
 * - Encoding/Decoding workflows
 * - Real-time statistics and feedback
 * - Clipboard operations
 * 
 * ARCHITECTURE:
 * The UI Manager follows a singleton-like pattern (instantiated on DOM load).
 * It uses an internal state object to track the active viewport and processing status.
 *
 * @author Antigravity
 * @version 1.0.0
 */

"use strict";

/**
 * StegPlayUIManager class encapsulates all UI-related logic.
 * Designed for durability and extensibility.
 */
class StegPlayUIManager {
    /**
     * Initializes the manager and sets up the internal environment.
     */
    constructor() {
        /**
         * Core Engine Instances
         * We isolate the logic from the presentation layer.
         */
        this.stego = new StegoEngine();
        this.parser = new ContentParser(this.stego);

        /**
         * DOM Element Cache
         * Pre-selecting elements improves runtime performance.
         */
        this._elements = {
            body: document.body,
            header: document.querySelector('.app-header'),
            progressBar: document.getElementById('progress-bar'),
            toast: document.getElementById('toast'),

            // Reading Area & Main Content
            articleBody: document.getElementById('article-body'),
            articleTitle: document.getElementById('editable-title'),
            btnCopyArticle: document.getElementById('btn-copy-article'),
            btnToggleTheme: document.getElementById('btn-toggle-theme'),

            // Interaction Panels
            panelEncoder: document.getElementById('panel-encoder'),
            panelDecoder: document.getElementById('panel-decoder'),
            btnToggleEncoder: document.getElementById('btn-toggle-encoder'),
            btnToggleDecoder: document.getElementById('btn-toggle-decoder'),
            panelCloses: document.querySelectorAll('.panel-close'),

            // Encoder Specifics
            inputSecret: document.getElementById('input-secret'),
            btnEncodeAction: document.getElementById('btn-encode-action'),
            encoderFeedback: document.getElementById('encoder-feedback'),
            secretCharCount: document.getElementById('secret-char-count'),
            secretBitCount: document.getElementById('secret-bit-count'),

            // Decoder Specifics
            inputCarrier: document.getElementById('input-carrier'),
            btnDecodeAction: document.getElementById('btn-decode-action'),
            decodeOutput: document.getElementById('decode-output'),
            decodeResultContainer: document.getElementById('decode-result-container'),
            btnCopyDecoded: document.getElementById('btn-copy-decoded')
        };

        /**
         * Application State
         * A single source of truth for the current UI situation.
         */
        this._state = {
            activePanel: null,
            isProcessing: false,
            theme: 'light',
            sessionStart: Date.now(),
            operationsCount: 0,
            lastEncodedLength: 0
        };

        /**
         * Logic-UI Event Bridge
         * Ensuring that logic updates can trigger UI refreshes smoothly.
         */
        this._init();
    }

    /**
     * Bootstraps the application.
     * @private
     */
    _init() {
        this._log('System Boot: Initializing StegPlay UI Interface.');

        try {
            this._setupEventListeners();
            this._loadPersistentState();
            this._refreshContentStats();

            // Delayed greeting for a premium feel
            setTimeout(() => {
                this.showToast('StegPlay active. Content-ready for encoding.');
            }, 800);

        } catch (error) {
            console.error('CRITICAL: UI initialization failed.', error);
        }
    }

    /**
     * Centralized logging for the UI manager.
     * @param {string} msg - Message to log.
     */
    _log(msg) {
        console.log(`[UI_MANAGER] ${msg}`);
    }

    /**
     * Binds all DOM events to their respective handlers.
     * Includes support for keyboard accessibility and touch.
     * @private
     */
    _setupEventListeners() {
        // --- Panel Navigation ---
        this._elements.btnToggleEncoder.addEventListener('click', (e) => {
            e.stopPropagation();
            this._togglePanel('encoder');
        });

        this._elements.btnToggleDecoder.addEventListener('click', (e) => {
            e.stopPropagation();
            this._togglePanel('decoder');
        });

        this._elements.panelCloses.forEach(btn => {
            btn.addEventListener('click', () => this._closeActivePanel());
        });

        // --- Aesthetic Control ---
        this._elements.btnToggleTheme.addEventListener('click', () => this._handleThemeSwitch());

        // --- Steganography Flow ---
        this._elements.btnEncodeAction.addEventListener('click', () => this._executeEncode());
        this._elements.inputSecret.addEventListener('input', Utils.debounce(() => this._refreshContentStats(), 100));

        this._elements.btnDecodeAction.addEventListener('click', () => this._executeDecode());
        this._elements.btnCopyDecoded.addEventListener('click', () => {
            const secret = this._elements.decodeOutput.innerText;
            Utils.copyToClipboard(secret).then(res => {
                if (res) this.showToast('Secret message copied.');
            });
        });

        // --- Article Operations ---
        this._elements.btnCopyArticle.addEventListener('click', () => this._handleArticleCopy());

        // --- Global Interactions ---
        window.addEventListener('keydown', (e) => this._handleGlobalKeydown(e));
        window.addEventListener('click', (e) => this._handleOutsideClick(e));

        // Sync article edits with stats
        this._elements.articleBody.addEventListener('input', Utils.debounce(() => this._log('Carrier content updated by user.'), 1000));
    }

    /* ======================================================================
       Core View Logic
       ====================================================================== */

    /**
     * Opens or closes panels based on state.
     * @param {string} panelID - Target panel identification.
     * @private
     */
    _togglePanel(panelID) {
        if (this._state.activePanel === panelID) {
            this._closeActivePanel();
            return;
        }

        this._closeActivePanel();

        const target = panelID === 'encoder' ? this._elements.panelEncoder : this._elements.panelDecoder;
        target.classList.add('active');
        this._state.activePanel = panelID;

        // Transition focus to the primary interaction element
        setTimeout(() => {
            const el = target.querySelector('textarea');
            if (el) el.focus();
        }, 350);

        this._log(`View Switch: ${panelID} panel is now focused.`);
    }

    /**
     * Gracefully closes any open interface panels.
     * @private
     */
    _closeActivePanel() {
        if (!this._state.activePanel) return;

        this._elements.panelEncoder.classList.remove('active');
        this._elements.panelDecoder.classList.remove('active');
        this._state.activePanel = null;

        this._log('View Switch: All overlay panels dismissed.');
    }

    /**
     * Global key handler for system functions.
     * @param {KeyboardEvent} e - Event object.
     * @private
     */
    _handleGlobalKeydown(e) {
        // Esc to exit anything
        if (e.key === 'Escape') {
            this._closeActivePanel();
        }

        // Ctrl + E to toggle encoder shortcut
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this._togglePanel('encoder');
        }
    }

    /**
     * Handles clicks outside the panels to dismiss them.
     * @param {MouseEvent} e - Event object.
     * @private
     */
    _handleOutsideClick(e) {
        if (!this._state.activePanel) return;

        const clickInsidePanel = e.target.closest('.side-panel');
        const clickInsideButton = e.target.closest('.nav-btn');

        if (!clickInsidePanel && !clickInsideButton) {
            this._closeActivePanel();
        }
    }

    /* ======================================================================
       Business Logic Entry Points
       ====================================================================== */

    /**
     * Coordinates the encoding lifecycle.
     * 1. Extract data from UI
     * 2. Run Parser & Engine
     * 3. Update DOM with results
     * @private
     */
    async _executeEncode() {
        if (this._state.isProcessing) return;

        const secret = this._elements.inputSecret.value.trim();
        const hostContent = this._elements.articleBody.innerText;

        if (!secret) {
            this.showToast('Please provide a secret payload.');
            this._elements.inputSecret.classList.add('shake');
            setTimeout(() => this._elements.inputSecret.classList.remove('shake'), 400);
            return;
        }

        this._setLoadingState(true);
        this._updateProgressVisible(30);

        try {
            this._log('Encoding initiated. Processing large content block...');

            // Use the parser's async method to prevent UI stuttering
            const resultText = await this.parser.processAndInject(hostContent, secret);

            this._updateProgressVisible(75);

            // Critical: Updating DOM while preserving stego characters
            this._elements.articleBody.innerText = resultText;

            this._state.operationsCount++;
            this._state.lastEncodedLength = secret.length;

            this._elements.encoderFeedback.classList.add('active');
            this._updateProgressVisible(100);

            this.showToast('Hidden layer successfully fused.');

            // Post-success maintenance
            setTimeout(() => {
                this._elements.inputSecret.value = '';
                this._refreshContentStats();
                this._elements.encoderFeedback.classList.remove('active');
                this._updateProgressVisible(0);
            }, 2500);

        } catch (ex) {
            this._log(`FAILURE: ${ex.message}`);
            this.showToast('Logic Error: Failed to fuse secret.');
            this._updateProgressVisible(0);
        } finally {
            this._setLoadingState(false);
        }
    }

    /**
     * Coordinates the decoding lifecycle.
     * @private
     */
    async _executeDecode() {
        const pasteBuffer = this._elements.inputCarrier.value.trim();

        if (!pasteBuffer) {
            this.showToast('Input buffer is empty. Paste data first.');
            return;
        }

        this._updateProgressVisible(40);

        // The extraction is fast but we simulate processing for UX
        setTimeout(() => {
            const foundSecret = this.parser.extract(pasteBuffer);
            this._updateProgressVisible(100);

            if (foundSecret) {
                this._elements.decodeOutput.innerText = foundSecret;
                this._elements.decodeResultContainer.classList.add('active');
                this.showToast('Message layer extracted.');
            } else {
                this._elements.decodeOutput.innerText = 'No steganographic sequence detected.';
                this._elements.decodeResultContainer.classList.remove('active');
                this.showToast('Scan complete: No data found.');
            }

            setTimeout(() => this._updateProgressVisible(0), 1200);
        }, 600);
    }

    /* ======================================================================
       Peripheral Handlers
       ====================================================================== */

    /**
     * Copies the entire reading area content.
     * @private
     */
    _handleArticleCopy() {
        const fullContent = this._elements.articleBody.innerText;
        Utils.copyToClipboard(fullContent).then(ok => {
            if (ok) this.showToast('Article copied with hidden layers intact.');
        });
    }

    /**
     * Toggles the visual theme.
     * @private
     */
    _handleThemeSwitch() {
        const next = this._state.theme === 'light' ? 'dark' : 'light';
        this._setTheme(next);
    }

    /**
     * Applies a specific theme to the document.
     * @param {string} mode - 'light' or 'dark'
     * @private
     */
    _setTheme(mode) {
        this._elements.body.classList.remove('theme-light', 'theme-dark');
        this._elements.body.classList.add(`theme-${mode}`);
        this._state.theme = mode;
        localStorage.setItem('stegplay_pref_theme', mode);
        this._log(`Theme preference updated: ${mode}`);
    }

    /**
     * Loads saved settings.
     * @private
     */
    _loadPersistentState() {
        const savedTheme = localStorage.getItem('stegplay_pref_theme');
        if (savedTheme) {
            this._setTheme(savedTheme);
        }
    }

    /**
     * Refreshes the real-time statistics in the view.
     * @private
     */
    _refreshContentStats() {
        const val = this._elements.inputSecret.value;
        const len = val.length;

        this._elements.secretCharCount.innerText = len;
        this._elements.secretBitCount.innerText = len * 8;

        // Adaptive feedback based on length
        if (len > 500) {
            this._elements.secretCharCount.style.color = 'var(--color-error)';
        } else {
            this._elements.secretCharCount.style.color = '';
        }
    }

    /**
     * Shows a non-blocking notification toast.
     * @param {string} msg - Content.
     */
    showToast(msg) {
        this._elements.toast.innerText = msg;
        this._elements.toast.classList.add('active');

        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this._elements.toast.classList.remove('active');
        }, 3500);
    }

    /**
     * Updates the systemic loading indicator.
     * @param {number} val - Progress percentage.
     * @private
     */
    _updateProgressVisible(val) {
        this._elements.progressBar.style.width = `${val}%`;
    }

    /**
     * Disables/Enables UI during intense tasks.
     * @param {boolean} loading - Status flag.
     * @private
     */
    _setLoadingState(loading) {
        this._state.isProcessing = loading;
        this._elements.btnEncodeAction.disabled = loading;
        this._elements.btnEncodeAction.innerHTML = loading ? '<span class="spinner"></span> Processing...' : 'Embed in Article';
    }
}

/**
 * Global Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Expose for debugging if needed, though encapsulated
    window.stegPlay = new StegPlayUIManager();
});
