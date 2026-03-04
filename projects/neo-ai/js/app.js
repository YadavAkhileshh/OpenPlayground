import { ContentEngine } from './processor.js';
import { UIManager } from './ui.js';

class App {
    constructor() {
        this.engine = new ContentEngine();
        this.ui = new UIManager();

        this.state = {
            platform: 'twitter',
            hookStyle: 'question',
            emotion: 'excited',
            length: 2,
            isGenerating: false
        };

        this.init();
    }

    init() {
        // Chip Group Listeners
        this.setupChipGroup('platform-chips', 'platform');
        this.setupChipGroup('hook-chips', 'hookStyle');
        this.setupChipGroup('emotion-chips', 'emotion');

        // Length Slider
        const lengthSlider = document.getElementById('length-slider');
        lengthSlider.addEventListener('input', (e) => {
            this.state.length = parseInt(e.target.value);
        });

        // Input Handling
        const promptInput = document.getElementById('prompt-input');
        promptInput.addEventListener('input', () => this.ui.updateCharCount());

        // Buttons
        document.getElementById('generate-btn').addEventListener('click', () => this.handleGenerate());
        document.getElementById('clear-btn').addEventListener('click', () => this.ui.clearOutput());
        document.getElementById('copy-btn').addEventListener('click', () => this.handleCopy());
        document.getElementById('download-btn').addEventListener('click', () => this.handleDownload());
    }

    setupChipGroup(id, stateKey) {
        document.getElementById(id).addEventListener('click', (e) => {
            if (e.target.classList.contains('chip')) {
                this.updateActiveChip(id, e.target);
                this.state[stateKey] = e.target.dataset.value;
            }
        });
    }

    updateActiveChip(parentId, targetChip) {
        document.getElementById(parentId).querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        targetChip.classList.add('active');
    }

    async handleGenerate() {
        const prompt = document.getElementById('prompt-input').value;
        if (!prompt || this.state.isGenerating) return;

        this.state.isGenerating = true;
        this.ui.setGenerating();

        try {
            const content = await this.engine.generate(
                prompt,
                this.state.platform,
                this.state.hookStyle,
                this.state.emotion,
                this.state.length
            );
            await this.ui.streamText(content);
        } catch (error) {
            console.error(error);
            this.ui.showToast('Computation error. Please try again.');
        } finally {
            this.state.isGenerating = false;
        }
    }

    handleCopy() {
        const text = document.querySelector('.output-card').textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.ui.showToast('Copied to clipboard!');
        });
    }

    handleDownload() {
        const text = document.querySelector('.output-card').textContent;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-core-${this.state.platform}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Start the app
new App();
