/**
 * text-distort.js
 * Breaks paragraph text into individual characters/words and applies degradation classes.
 */

export class TextDistort {
    constructor() {
        this.processed = false;
        // We only want to run the expensive DOM splitting operation once or incrementally.
    }

    /**
     * Splits text content into spans for generic P tags.
     * This increases DOM size significantly, so we limit it to specific sections.
     */
    initialize() {
        if (this.processed) return;

        const paragraphs = document.querySelectorAll('.hero-content p, .card p');
        paragraphs.forEach(p => {
            const text = p.textContent;
            p.innerHTML = '';

            // Split by words to keep it somewhat sane, or chars for max chaos.
            // Let's go with words for now, and chars for headers.
            const words = text.split(' ');
            words.forEach(word => {
                const span = document.createElement('span');
                span.textContent = word + ' ';
                span.className = 'word-node';
                p.appendChild(span);
            });
        });

        const headers = document.querySelectorAll('h1, h2');
        headers.forEach(h => {
            // Avoid double visual if user reloads? The JS runs fresh each reload.
            if (h.querySelector('.char-node')) return;

            const text = h.innerText;
            h.innerHTML = '';
            [...text].forEach(char => {
                const span = document.createElement('span');
                span.textContent = char;
                span.className = 'char-node';
                h.appendChild(span);
            });
        });

        this.processed = true;
    }

    update(chaosLevel) {
        if (!this.processed) this.initialize();

        // Randomly assign decay classes to words/chars based on chaos
        if (chaosLevel < 0.1) return;

        const allNodes = document.querySelectorAll('.word-node, .char-node');
        const count = allNodes.length;

        // Number of nodes to corrupt per frame (very low, cumulative)
        // Actually, random sampling is better.

        const corruptionChance = chaosLevel * 0.001; // Small chance per frame to rot a new node

        // Loop through a random subset instead of all to save perf?
        // Or just pick N random nodes.
        const numToCorrupt = 3;

        for (let i = 0; i < numToCorrupt; i++) {
            const idx = Math.floor(Math.random() * count);
            const node = allNodes[idx];

            // Should this node rot?
            if (Math.random() < chaosLevel && !node.classList.contains('rotted')) {
                this.rotNode(node, chaosLevel);
            }
        }
    }

    rotNode(node, chaos) {
        const effects = ['char-skew', 'char-blur', 'decay-text-char'];
        const effect = effects[Math.floor(Math.random() * effects.length)];

        node.classList.add(effect);
        node.classList.add('rotted'); // Marker to avoid regarding

        // If chaos is high, maybe make it fall
        if (chaos > 0.6 && Math.random() > 0.5) {
            node.classList.add('char-fallen');
        }

        // If chaos max, delete it
        if (chaos > 0.9 && Math.random() > 0.8) {
            node.classList.add('char-missing');
        }
    }
}
