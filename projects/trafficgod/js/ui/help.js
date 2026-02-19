/**
 * @file help.js
 * @description Manages the help modal and user onboarding.
 */

export class HelpSystem {
    constructor() {
        this.overlay = document.getElementById('help-overlay');
        this.closeBtn = document.getElementById('help-close');
        this.openBtn = document.getElementById('help-btn');

        this.init();
    }

    init() {
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.show());
        }

        // Close on outside click
        if (this.overlay) {
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                }
            });
        }
    }

    show() {
        if (this.overlay) {
            this.overlay.classList.add('visible');
            this.overlay.style.display = 'flex';
        }
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('visible');
            this.overlay.style.display = 'none';
        }
    }
}
