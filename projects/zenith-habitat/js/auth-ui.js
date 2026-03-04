import AuthSystem from './auth.js';

class AuthUI {
    constructor() {
        this.auth = new AuthSystem();
        this.init();
    }

    init() {
        // Redirect if already logged in
        if (this.auth.getSession()) {
            window.location.href = 'index.html';
        }

        this.cacheDOM();
        this.bindEvents();
    }

    cacheDOM() {
        this.form = document.getElementById('auth-form');
        this.modeInput = document.getElementById('auth-mode');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.errorMsg = document.getElementById('error-msg');
        this.toggleBtn = document.getElementById('toggle-btn');
        this.submitBtn = document.getElementById('submit-btn');

        this.title = document.getElementById('form-title');
        this.subtitle = document.getElementById('form-subtitle');
        this.toggleMsg = document.getElementById('toggle-msg');
    }

    bindEvents() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.toggleBtn.addEventListener('click', (e) => this.toggleMode(e));
    }

    toggleMode(e) {
        e.preventDefault();
        const currentMode = this.modeInput.value;
        const newMode = currentMode === 'login' ? 'signup' : 'login';

        this.modeInput.value = newMode;
        this.errorMsg.textContent = '';

        if (newMode === 'signup') {
            this.title.textContent = 'Join Zenith';
            this.subtitle.textContent = 'Create your personalized focus environment.';
            this.submitBtn.textContent = 'Create Account';
            this.toggleMsg.textContent = 'Already have an account? ';
            this.toggleBtn.textContent = 'Login';
        } else {
            this.title.textContent = 'Welcome Back';
            this.subtitle.textContent = 'Enter your credentials to access your habitat.';
            this.submitBtn.textContent = 'Login to Habitat';
            this.toggleMsg.textContent = 'Don\'t have an account? ';
            this.toggleBtn.textContent = 'Sign Up';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        const mode = this.modeInput.value;

        let result;
        if (mode === 'signup') {
            result = this.auth.signup(username, password);
        } else {
            result = this.auth.login(username, password);
        }

        if (result.success) {
            window.location.href = 'index.html';
        } else {
            this.errorMsg.textContent = result.message;
            this.form.classList.add('shake');
            setTimeout(() => this.form.classList.remove('shake'), 400);
        }
    }
}

// Add shake animation to CSS dynamically or assume it's there
const style = document.createElement('style');
style.textContent = `
    .shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);

new AuthUI();
