// Input Noise Cleaner - Main JavaScript

class InputNoiseCleaner {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.diffView = document.getElementById('diffView');
        this.diffContent = document.getElementById('diffContent');
        
        // Rule checkboxes
        this.rules = {
            spaces: document.getElementById('ruleSpaces'),
            repeated: document.getElementById('ruleRepeated'),
            caps: document.getElementById('ruleCaps'),
            emoji: document.getElementById('ruleEmoji'),
            punctuation: document.getElementById('rulePunctuation'),
            trim: document.getElementById('ruleTrim')
        };

        // Stats
        this.stats = {
            spaces: 0,
            repeated: 0,
            caps: 0,
            emojis: 0,
            punctuation: 0
        };

        this.init();
    }

    init() {
        // Input event listener
        this.inputText.addEventListener('input', () => this.processInput());
        
        // Rule change listeners
        Object.values(this.rules).forEach(rule => {
            rule.addEventListener('change', () => this.processInput());
        });

        // Button listeners
        document.getElementById('clearInput').addEventListener('click', () => this.clearInput());
        document.getElementById('loadSample').addEventListener('click', () => this.loadSample());
        document.getElementById('toggleAll').addEventListener('click', () => this.toggleAllRules());
        document.getElementById('copyOutput').addEventListener('click', () => this.copyOutput());
        document.getElementById('toggleDiff').addEventListener('click', () => this.toggleDiff());

        // Initial process
        this.processInput();
    }

    processInput() {
        const input = this.inputText.value;
        this.updateCharCount('inputCharCount', input);

        if (!input.trim()) {
            this.outputText.textContent = 'Your cleaned text will appear here...';
            this.updateCharCount('outputCharCount', '');
            this.resetStats();
            return;
        }

        // Reset stats
        this.stats = {
            spaces: 0,
            repeated: 0,
            caps: 0,
            emojis: 0,
            punctuation: 0
        };

        let cleaned = input;

        // Apply cleanup rules
        if (this.rules.spaces.checked) {
            cleaned = this.removeExtraSpaces(cleaned);
        }

        if (this.rules.repeated.checked) {
            cleaned = this.fixRepeatedCharacters(cleaned);
        }

        if (this.rules.caps.checked) {
            cleaned = this.fixCapsLock(cleaned);
        }

        if (this.rules.emoji.checked) {
            cleaned = this.removeEmojiNoise(cleaned);
        }

        if (this.rules.punctuation.checked) {
            cleaned = this.fixPunctuation(cleaned);
        }

        if (this.rules.trim.checked) {
            cleaned = cleaned.trim();
        }

        // Update output
        this.outputText.textContent = cleaned;
        this.updateCharCount('outputCharCount', cleaned);
        this.updateReductionPercent(input, cleaned);
        this.updateStats();
        this.updateNoiseLevel(input);
        this.updateDiff(input, cleaned);
    }

    removeExtraSpaces(text) {
        const original = text;
        // Replace multiple spaces with single space
        text = text.replace(/ {2,}/g, ' ');
        // Replace multiple newlines with double newline (paragraph break)
        text = text.replace(/\n{3,}/g, '\n\n');
        
        const matches = original.match(/ {2,}/g);
        this.stats.spaces = matches ? matches.length : 0;
        
        return text;
    }

    fixRepeatedCharacters(text) {
        const original = text;
        // Fix characters repeated more than 2 times (keep max 2)
        text = text.replace(/(.)\1{2,}/g, '$1$1');
        
        const matches = original.match(/(.)\1{2,}/g);
        this.stats.repeated = matches ? matches.length : 0;
        
        return text;
    }

    fixCapsLock(text) {
        let capsCount = 0;
        
        // Fix words that are ALL CAPS (3+ letters)
        text = text.replace(/\b[A-Z]{3,}\b/g, (match) => {
            capsCount++;
            return match.charAt(0) + match.slice(1).toLowerCase();
        });
        
        this.stats.caps = capsCount;
        return text;
    }

    removeEmojiNoise(text) {
        const emojiRegex = /([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/gu;
        const emojis = text.match(emojiRegex);
        const emojiCount = emojis ? emojis.length : 0;
        
        if (emojiCount > 3) {
            // Remove excessive emojis (keep max 2 per occurrence)
            text = text.replace(/([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]){3,}/gu, (match) => {
                this.stats.emojis++;
                return match.slice(0, 2);
            });
        }
        
        return text;
    }

    fixPunctuation(text) {
        let punctCount = 0;
        
        // Fix repeated exclamation marks (keep max 1)
        text = text.replace(/!{2,}/g, () => {
            punctCount++;
            return '!';
        });
        
        // Fix repeated question marks (keep max 1)
        text = text.replace(/\?{2,}/g, () => {
            punctCount++;
            return '?';
        });
        
        // Fix repeated periods (keep max 3 for ellipsis)
        text = text.replace(/\.{4,}/g, () => {
            punctCount++;
            return '...';
        });
        
        this.stats.punctuation = punctCount;
        return text;
    }

    updateCharCount(elementId, text) {
        const count = text.length;
        document.getElementById(elementId).textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }

    updateReductionPercent(original, cleaned) {
        const reduction = original.length - cleaned.length;
        const percent = original.length > 0 ? Math.round((reduction / original.length) * 100) : 0;
        
        const reductionElement = document.getElementById('reductionPercent');
        if (reduction > 0) {
            reductionElement.textContent = `↓ ${percent}% reduction (${reduction} chars removed)`;
            reductionElement.style.color = '#10b981';
        } else {
            reductionElement.textContent = '';
        }
    }

    updateStats() {
        document.getElementById('statSpaces').textContent = this.stats.spaces;
        document.getElementById('statRepeated').textContent = this.stats.repeated;
        document.getElementById('statCaps').textContent = this.stats.caps;
        document.getElementById('statEmojis').textContent = this.stats.emojis;
        document.getElementById('statPunctuation').textContent = this.stats.punctuation;
        
        const total = Object.values(this.stats).reduce((a, b) => a + b, 0);
        const inputLength = this.inputText.value.length;
        const noisePercent = inputLength > 0 ? Math.round((total / inputLength) * 100) : 0;
        
        document.getElementById('statTotal').textContent = `${noisePercent}%`;
    }

    updateNoiseLevel(text) {
        const noiseElement = document.getElementById('noiseLevel');
        const total = Object.values(this.stats).reduce((a, b) => a + b, 0);
        const noisePercent = text.length > 0 ? (total / text.length) * 100 : 0;
        
        if (noisePercent === 0) {
            noiseElement.textContent = '';
        } else if (noisePercent < 10) {
            noiseElement.textContent = '🟢 Low noise';
            noiseElement.style.color = '#10b981';
        } else if (noisePercent < 25) {
            noiseElement.textContent = '🟡 Medium noise';
            noiseElement.style.color = '#f59e0b';
        } else {
            noiseElement.textContent = '🔴 High noise';
            noiseElement.style.color = '#ef4444';
        }
    }

    resetStats() {
        Object.keys(this.stats).forEach(key => {
            document.getElementById(`stat${key.charAt(0).toUpperCase() + key.slice(1)}`).textContent = '0';
        });
        document.getElementById('statTotal').textContent = '0%';
        document.getElementById('reductionPercent').textContent = '';
        document.getElementById('noiseLevel').textContent = '';
    }

    updateDiff(original, cleaned) {
        if (!this.diffView.style.display || this.diffView.style.display === 'none') {
            return;
        }

        const diffHtml = this.generateDiff(original, cleaned);
        this.diffContent.innerHTML = diffHtml;
    }

    generateDiff(original, cleaned) {
        if (original === cleaned) {
            return '<div class="diff-message">No changes detected</div>';
        }

        const originalLines = original.split('\n');
        const cleanedLines = cleaned.split('\n');
        
        let html = '<div class="diff-side-by-side">';
        html += '<div class="diff-column"><div class="diff-header">Before</div>';
        
        originalLines.forEach((line, i) => {
            const cleanedLine = cleanedLines[i] || '';
            const isDifferent = line !== cleanedLine;
            html += `<div class="diff-line ${isDifferent ? 'diff-removed' : ''}">${this.escapeHtml(line) || '&nbsp;'}</div>`;
        });
        
        html += '</div><div class="diff-column"><div class="diff-header">After</div>';
        
        cleanedLines.forEach((line, i) => {
            const originalLine = originalLines[i] || '';
            const isDifferent = line !== originalLine;
            html += `<div class="diff-line ${isDifferent ? 'diff-added' : ''}">${this.escapeHtml(line) || '&nbsp;'}</div>`;
        });
        
        html += '</div></div>';
        return html;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearInput() {
        this.inputText.value = '';
        this.processInput();
    }

    loadSample() {
        const sample = `HELLOOOO    WORLD!!!   😀😀😀😀😀

This   has    way     too     many     spaces    between    words.

reeeepeated   chaaaracters   areeee   sooooo   annnoooying!!!

WHY IS CAPS LOCK ALWAYS ON????

Please....... stop...... using...... so...... many...... dots.......

🎉🎉🎉🎉🎉🎉🎉🎉  PARTY  TIME  🎊🎊🎊🎊🎊🎊

Multiple


Blank


Lines


Are


Also


Annoying`;
        
        this.inputText.value = sample;
        this.processInput();
    }

    toggleAllRules() {
        const allChecked = Object.values(this.rules).every(rule => rule.checked);
        Object.values(this.rules).forEach(rule => {
            rule.checked = !allChecked;
        });
        this.processInput();
    }

    copyOutput() {
        const text = this.outputText.textContent;
        
        if (!text || text === 'Your cleaned text will appear here...') {
            this.showNotification('Nothing to copy!', 'error');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    }

    toggleDiff() {
        const isVisible = this.diffView.style.display !== 'none';
        const button = document.getElementById('toggleDiff');
        
        if (isVisible) {
            this.diffView.style.display = 'none';
            button.innerHTML = '<i class="ri-eye-line"></i> Show Diff';
        } else {
            this.diffView.style.display = 'block';
            button.innerHTML = '<i class="ri-eye-off-line"></i> Hide Diff';
            this.updateDiff(this.inputText.value, this.outputText.textContent);
        }
    }

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="ri-${type === 'success' ? 'checkbox-circle' : 'error-warning'}-line"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new InputNoiseCleaner();
});
