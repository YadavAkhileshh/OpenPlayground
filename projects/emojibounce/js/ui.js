export class UI {
    constructor(simulation) {
        this.sim = simulation;
        this.interaction = simulation.interaction;
        this.selectedEmoji = null; // null = random

        this.setupListeners();
        this.loadTheme();
        this.populateEmojiGrid();

        // Initial Active State
        this.updateToolState('spawn');
    }

    setupListeners() {
        // Controls
        this.bindSlider('gravity', 'gravity');
        this.bindSlider('bounciness', 'bounciness');
        this.bindSlider('time-scale', 'timeScale');

        // Buttons
        document.getElementById('btn-clear').addEventListener('click', () => this.sim.clear());
        document.getElementById('btn-theme').addEventListener('click', () => this.toggleTheme());

        // Sidebar Toggle
        const sidebar = document.querySelector('.controls-sidebar');
        document.getElementById('btn-toggle-ui').addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
        });

        // Tool Switching
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;

                // Extra setup for portals?
                if (mode === 'portal') {
                    // We need a portal tool! Let's just repurpose 'draw' or add new?
                    // User didn't strictly ask for portal BUTTON, but feature.
                    // Let's add portal button logic if we can. 
                    // For now, assume portals are auto-added or handled separately.
                    // Wait, Plan said "Portals: Portal Gun tool".
                    // I haven't added button in HTML. I should do that.
                }

                this.interaction.setMode(mode);
                this.updateToolState(mode);
            });
        });

        // Mute
        document.getElementById('btn-mute').addEventListener('click', (e) => {
            this.sim.audio.muted = !this.sim.audio.muted;
            e.target.innerText = this.sim.audio.muted ? '🔇' : '🔊';
        });

        // Listen for stats
        window.addEventListener('stats-update', (e) => {
            document.getElementById('emoji-count').innerText = e.detail.count;
        });

        // Random Mix Checkbox
        document.getElementById('chk-mix').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.selectedEmoji = null;
                document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selected'));
                this.sim.overrideChar = null;
            } else {
                // Select first if none
                if (!this.selectedEmoji && this.sim.emojiList.length > 0) {
                    this.selectedEmoji = this.sim.emojiList[0];
                    this.sim.overrideChar = this.selectedEmoji;
                    this.updateGridSelection();
                }
            }
        });
    }

    populateEmojiGrid() {
        const grid = document.getElementById('emoji-picker');
        if (!grid) return;

        // Add special ones
        const specials = ['🥚', '💣', '🎈', '🗿'];
        const all = [...specials, ...this.sim.emojiList.slice(0, 20)]; // Limit for UI space

        all.forEach(char => {
            const btn = document.createElement('div');
            btn.className = 'emoji-btn';
            btn.innerText = char;
            btn.onclick = () => {
                this.selectedEmoji = char;
                this.sim.overrideChar = char;
                document.getElementById('chk-mix').checked = false;
                this.updateGridSelection();
            };
            grid.appendChild(btn);
        });
    }

    updateGridSelection() {
        document.querySelectorAll('.emoji-btn').forEach(b => {
            if (b.innerText === this.selectedEmoji) b.classList.add('selected');
            else b.classList.remove('selected');
        });
    }

    bindSlider(id, key) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
            this.sim.config[key] = parseFloat(e.target.value);
        });
    }

    updateToolState(mode) {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            if (btn.dataset.mode === mode) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    toggleTheme() {
        const body = document.body;
        const current = body.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', next);

        const btn = document.getElementById('btn-theme');
        btn.innerText = next === 'dark' ? '☀️' : '🌙';
    }

    loadTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
            document.getElementById('btn-theme').innerText = '☀️';
        }
    }
}
