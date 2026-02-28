export default class GUIManager {
    constructor(game) {
        this.game = game;
        this.overlay = null;
        this.init();
    }

    init() {
        // Create DOM elements for Skill Tree
        this.overlay = document.createElement('div');
        this.overlay.id = 'skill-tree-overlay';
        this.overlay.className = 'overlay hidden';
        this.overlay.innerHTML = `
            <div class="skill-container">
                <h1>NEURAL UPGRADES</h1>
                <div class="currency-display">DATA SHARDS: <span id="shard-count">0</span></div>
                
                <div class="upgrade-grid">
                    <div class="upgrade-node" data-id="overclockDuration">
                        <h3>Overclock++</h3>
                        <p>Duration +1s</p>
                        <button class="buy-btn">UPGRADE</button>
                    </div>
                    <div class="upgrade-node" data-id="comboKeeper">
                        <h3>Combo Stability</h3>
                        <p>Hold combo longer</p>
                        <button class="buy-btn">UPGRADE</button>
                    </div>
                    <div class="upgrade-node" data-id="weapon_railgun">
                        <h3>Unlock Railgun</h3>
                        <p>High Power Pierce</p>
                        <button class="buy-btn">UNLOCK</button>
                    </div>
                </div>
                
                <button id="close-skills" class="cyber-btn small">RESUME</button>
            </div>
        `;
        document.body.appendChild(this.overlay);

        // Styles should ideally be in CSS, but injecting here for self-containment in module or assumed CSS update
        this.bindEvents();
    }

    bindEvents() {
        const closeBtn = this.overlay.querySelector('#close-skills');
        closeBtn.addEventListener('click', () => this.hide());

        // Buy buttons
        this.overlay.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const node = e.target.closest('.upgrade-node');
                const id = node.dataset.id;
                this.tryBuy(id);
            });
        });

        // Toggle key (e.g., TAB)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this.toggle();
            }
        });
    }

    tryBuy(id) {
        const success = this.game.progression.unlockUpgrade(id);
        if (success) {
            this.game.audio.playPowerUp();
            this.updateDisplay();
        } else {
            // Error sound
        }
    }

    updateDisplay() {
        document.getElementById('shard-count').innerText = this.game.progression.data.currency;
        // Update button states/costs
    }

    show() {
        this.game.running = false; // Pause game
        this.updateDisplay();
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('active');
    }

    hide() {
        this.game.running = true;
        this.game.lastTime = performance.now(); // Reset time to prevent huge dt jump
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('active');
        this.game.loop(performance.now());
    }

    toggle() {
        if (this.overlay.classList.contains('active')) {
            this.hide();
        } else {
            this.show();
        }
    }
}
