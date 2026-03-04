import { State } from './engine/State.js';
import { PhysicsEngine } from './engine/Physics.js';
import { Renderer } from './engine/Renderer.js';
import { InputHandler } from './engine/Input.js';
import { Auth } from './auth.js';

/**
 * Zen Garden Application Controller
 */
class ZenGarden {
    constructor() {
        this.isLoginMode = true;
        this.init();
    }

    async init() {
        const canvas = document.getElementById('garden-canvas');

        // 1. Initialize Auth
        const user = Auth.init();
        this.updateAuthUI(user);

        // 2. Initialize Core Engines
        this.physics = new PhysicsEngine(State.gridWidth, State.gridHeight);
        this.renderer = new Renderer(canvas, State);
        this.input = new InputHandler(canvas, State, this.physics);

        // 3. UI Setup
        this.setupUIListeners();
        this.setupAuthListeners();

        // 4. Start Loop
        this.loop();
    }

    setupAuthListeners() {
        const modal = document.getElementById('auth-modal');
        const form = document.getElementById('auth-form');
        const toggleBtn = document.getElementById('auth-toggle');
        const logoutBtn = document.getElementById('logout-btn');

        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.isLoginMode = !this.isLoginMode;
            document.querySelector('.modal-header h2').textContent = this.isLoginMode ? 'Welcome to Zen Garden' : 'Create Account';
            document.getElementById('auth-submit').textContent = this.isLoginMode ? 'Sign In' : 'Sign Up';
            toggleBtn.textContent = this.isLoginMode ? 'Create one' : 'Sign in instead';
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('auth-error');

            try {
                const user = this.isLoginMode
                    ? Auth.login(username, password)
                    : Auth.register(username, password);

                this.updateAuthUI(user);
                modal.classList.add('hidden');
            } catch (err) {
                errorEl.textContent = err.message;
                errorEl.classList.remove('hidden');
            }
        });

        logoutBtn.addEventListener('click', () => Auth.logout());
    }

    updateAuthUI(user) {
        const modal = document.getElementById('auth-modal');
        const profile = document.getElementById('user-profile');
        const usernameDisplay = document.getElementById('username-display');

        if (user) {
            modal.classList.add('hidden');
            profile.classList.remove('hidden');
            usernameDisplay.textContent = user.username;
        } else {
            modal.classList.remove('hidden');
            profile.classList.add('hidden');
        }
    }

    setupUIListeners() {
        // Tool Selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                State.activeTool = btn.dataset.tool;
            });
        });

        // Theme Selection
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                State.currentTheme = opt.dataset.theme;
                this.updateThemeColors();
            });
        });

        // Sliders
        document.getElementById('sand-viscosity').addEventListener('input', (e) => {
            State.viscosity = parseFloat(e.target.value);
        });

        document.getElementById('brush-size').addEventListener('input', (e) => {
            State.brushSize = parseInt(e.target.value);
        });

        // Actions
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.physics.clear();
            this.physics.init();
        });

        document.getElementById('screenshot-btn').addEventListener('click', () => {
            this.captureMoment();
        });
    }

    updateThemeColors() {
        const theme = State.themes[State.currentTheme];
        const root = document.documentElement;

        // Update DOM attribute for CSS targeting
        document.body.setAttribute('data-theme', State.currentTheme);

        // Dynamically update CSS variables for UI feedback
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--accent-light', theme.bg);
    }

    captureMoment() {
        const canvas = document.getElementById('garden-canvas');
        const link = document.createElement('a');
        link.download = `zen-garden-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    loop() {
        // 1. Update Physics (Settling)
        this.physics.update(State.viscosity);

        // 2. Render
        this.renderer.render(this.physics);

        requestAnimationFrame(() => this.loop());
    }
}

// Spark Joy
window.addEventListener('DOMContentLoaded', () => {
    new ZenGarden();
});
