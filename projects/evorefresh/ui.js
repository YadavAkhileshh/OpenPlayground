// ============================================
// UI.JS - User Interface Controller
// ============================================

class UIController {
    constructor(evolutionSystem) {
        this.evolutionSystem = evolutionSystem;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.updateChangePanel();
        this.attachEventListeners();
    }

    updateChangePanel() {
        const genLabel = document.getElementById('gen-label');
        const changesList = document.getElementById('changes-list');
        
        const changeLog = this.evolutionSystem.getChangeLog();
        
        // Update generation label
        if (genLabel && changeLog.stage) {
            genLabel.textContent = changeLog.stage;
        }

        // Update changes list
        if (changesList && changeLog.improvements) {
            changesList.innerHTML = '';
            changeLog.improvements.forEach(change => {
                const p = document.createElement('p');
                p.textContent = change;
                changesList.appendChild(p);
            });
        }
    }

    attachEventListeners() {
        // Reset button
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset evolution to Generation 1? This will restart the entire journey.')) {
                    this.evolutionSystem.reset();
                    this.updateChangePanel();
                }
            });
        }

        // Close panel button
        const closeBtn = document.getElementById('close-panel');
        const panel = document.getElementById('change-panel');
        if (closeBtn && panel) {
            closeBtn.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }

        // Add click handlers to buttons
        const ctaButtons = document.querySelectorAll('.btn-large');
        ctaButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                location.reload();
            });
        });

        // Make hero buttons interactive
        const heroButtons = document.querySelectorAll('.hero-buttons .btn');
        heroButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const currentGen = this.evolutionSystem.getCurrentGeneration();
                if (currentGen < 10) {
                    alert(`Currently at ${this.evolutionSystem.getChangeLog().stage}\n\nRefresh the page to continue evolution!`);
                } else {
                    alert('You\'ve reached Peak Evolution! 🎉\n\nThe UI has evolved from bad to beautiful.\nYou can reset to experience the journey again.');
                }
            });
        });
    }
}

// Initialize UI controller when evolution system is ready
if (window.evolutionSystem) {
    new UIController(window.evolutionSystem);
} else {
    console.error('Evolution system not initialized');
}
