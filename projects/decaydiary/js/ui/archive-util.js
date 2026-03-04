/**
 * archive-util.js
 * Provides "Snapshot" capabilities for DecayDiary.
 * 
 * Allows users to rescue their thoughts by copying all 
 * non-expired text to the clipboard using a shortcut.
 */

class ArchiveUtility {
    constructor() {
        this.lastArchiveTime = 0;
    }

    /**
     * Initializes the utility.
     */
    init() {
        window.addEventListener('keydown', (e) => {
            // Ctrl + S (for Snapshot)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.takeSnapshot();
            }
        });
    }

    /**
     * Captures all active characters and copies them as text.
     */
    async takeSnapshot() {
        if (!timerSystem) return;

        const text = this.getActiveText();

        if (!text) {
            console.warn("ArchiveUtility: Nothing to capture.");
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showFeedback(text.length);

            if (typeof eventBus !== 'undefined') {
                eventBus.emit('archive:snapshot');
            }
        } catch (err) {
            console.error("ArchiveUtility: Failed to copy text.", err);
        }
    }

    /**
     * Traverses the registry to reconstruct the active text.
     */
    getActiveText() {
        // We look at the characters in the order they appear in DOM
        const area = document.querySelector(CONFIG.SELECTORS.WRITING_AREA);
        if (!area) return "";

        // Standard textContent might lose formatting, so we iterate
        let result = "";
        const children = area.childNodes;

        children.forEach(node => {
            if (node.nodeName === 'SPAN') {
                result += node.textContent === '\u00A0' ? ' ' : node.textContent;
            } else if (node.nodeName === 'BR') {
                result += '\n';
            }
        });

        return result;
    }

    /**
     * Displays transient visual feedback for the archive event.
     */
    showFeedback(count) {
        console.log(`ArchiveUtility: Captured ${count} characters to clipboard.`);

        // Visual cue via status indicator
        const indicator = document.querySelector(CONFIG.SELECTORS.STATUS_INDICATOR);
        if (indicator) {
            indicator.style.backgroundColor = 'hsl(120, 70%, 60%)';
            setTimeout(() => {
                indicator.style.backgroundColor = '';
            }, 1000);
        }
    }
}

// Global instance
const archiveUtility = new ArchiveUtility();
