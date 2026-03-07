/**
 * Model - Data & State Management
 * Handles local message storage, user settings, and encryption interaction.
 */
class Model {
    constructor() {
        this.bus = window.StorageBus;
        this.crypto = window.Crypto;
        this.messages = [];

        // Settings defaults
        this.settings = {
            username: this._loadSetting('username', 'Anonymous'),
            darkMode: this._loadSetting('darkMode', false),
            key: this._loadSetting('encryption_key', null)
        };

        // Initialize key if not present
        if (!this.settings.key) {
            this.settings.key = this.crypto.generateKey();
            this._saveSetting('encryption_key', this.settings.key);
        }

        this._loadMessages();

        // Listen for external updates
        this.bus.on('new-message', () => this._loadMessages());
        this.bus.on('chat-cleared', () => {
            this.messages = [];
            if (window.Controller) window.Controller.refreshView();
        });
    }

    _loadSetting(key, defaultValue) {
        const val = localStorage.getItem(`localloop_${key}`);
        return val !== null ? JSON.parse(val) : defaultValue;
    }

    _saveSetting(key, value) {
        localStorage.setItem(`localloop_${key}`, JSON.stringify(value));
        this.settings[key] = value; // Update local state
    }

    _loadMessages() {
        const raw = localStorage.getItem('localloop_messages');
        if (!raw) {
            this.messages = [];
            return;
        }

        try {
            const encryptedMessages = JSON.parse(raw);
            this.messages = encryptedMessages.map(msg => ({
                ...msg,
                text: this.crypto.decrypt(msg.encryptedText, this.settings.key)
            }));

            // Notify controller to update view if it exists
            if (window.Controller) window.Controller.refreshView();
        } catch (e) {
            console.error('Failed to load messages', e);
            this.messages = [];
        }
    }

    /**
     * Post a new message
     * @param {string} text 
     */
    /**
     * Post a new message
     * @param {string} text 
     */
    async postMessage(text) {
        const message = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            timestamp: Date.now(),
            author: this.settings.username,
            encryptedText: this.crypto.encrypt(text, this.settings.key)
        };

        // Use exclusive lock to prevent overwrite race conditions
        await this.bus.runExclusive(() => {
            try {
                const raw = localStorage.getItem('localloop_messages');
                let currentMessages = raw ? JSON.parse(raw) : [];
                currentMessages.push(message);

                // Limit total messages to avoiding quota issues (e.g. 100 max)
                if (currentMessages.length > 100) {
                    currentMessages = currentMessages.slice(-100);
                }

                localStorage.setItem('localloop_messages', JSON.stringify(currentMessages));
            } catch (e) {
                console.error('Failed to save message:', e);
            }
        });

        // Emit event to network (requests its own lock, so we run it after releasing ours)
        this.bus.emit('new-message', {});

        // Update local state immediately
        this._loadMessages();
    }

    updateUsername(name) {
        this._saveSetting('username', name);
    }

    toggleDarkMode() {
        const newMode = !this.settings.darkMode;
        this._saveSetting('darkMode', newMode);
        return newMode;
    }

    getMessages() {
        return this.messages;
    }

    getCurrentUser() {
        return this.settings.username;
    }

    isDarkMode() {
        return this.settings.darkMode;
    }
}

// Defer initialization until DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.Model = new Model();
    });
} else {
    window.Model = new Model();
}
