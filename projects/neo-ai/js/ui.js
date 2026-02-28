import { UI_CONFIG } from './config.js';

export class UIManager {
    constructor() {
        this.outputDisplay = document.getElementById('output-display');
        this.actionsPanel = document.getElementById('output-actions');
        this.promptInput = document.getElementById('prompt-input');
        this.charCount = document.querySelector('.char-count');
    }

    updateCharCount() {
        const length = this.promptInput.value.length;
        this.charCount.textContent = `${length} / ${UI_CONFIG.MAX_CHARS}`;

        if (length > UI_CONFIG.MAX_CHARS) {
            this.charCount.style.color = '#EF4444';
        } else {
            this.charCount.style.color = '';
        }
    }

    clearOutput() {
        this.outputDisplay.innerHTML = `
            <div class="output-placeholder">
                <div class="placeholder-orb"></div>
                <p>Awaiting your spark of creativity...</p>
            </div>
        `;
        this.actionsPanel.style.display = 'none';
        this.promptInput.value = '';
        this.updateCharCount();
    }

    setGenerating() {
        this.outputDisplay.innerHTML = `
            <div class="output-placeholder">
                <div class="placeholder-orb" style="animation-duration: 1s; opacity: 1;"></div>
                <p class="pulse">AI Engine is synthesizing...</p>
            </div>
        `;
        this.actionsPanel.style.display = 'none';
    }

    streamText(text) {
        this.outputDisplay.innerHTML = '<div class="streaming-text"></div>';
        const container = this.outputDisplay.querySelector('.streaming-text');
        let index = 0;

        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (index < text.length) {
                    container.textContent += text[index];
                    index++;
                    this.outputDisplay.scrollTop = this.outputDisplay.scrollHeight;
                } else {
                    clearInterval(interval);
                    container.classList.remove('streaming-text');
                    this.actionsPanel.style.display = 'flex';
                    resolve();
                }
            }, UI_CONFIG.TYPING_SPEED);
        });
    }

    showToast(message) {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--primary);
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 1000;
            animation: fadeInUp 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
}
