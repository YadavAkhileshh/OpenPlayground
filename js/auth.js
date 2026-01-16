// ===============================
// OpenPlayground - Authentication
// ===============================

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAuthStateListener();
    }

    setupEventListeners() {
        // Modal controls
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        const authModalClose = document.getElementById('authModalClose');
        const authToggleLink = document.getElementById('authToggleLink');
        const logoutBtn = document.getElementById('logoutBtn');

        // Form submissions
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        // Event listeners
        loginBtn?.addEventListener('click', () => this.showAuthModal('login'));
        signupBtn?.addEventListener('click', () => this.showAuthModal('signup'));
        authModalClose?.addEventListener('click', () => this.hideAuthModal());
        authToggleLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForm();
        });

        loginForm?.addEventListener('submit', (e) => this.handleLogin(e));
        signupForm?.addEventListener('submit', (e) => this.handleSignup(e));
        logoutBtn?.addEventListener('click', () => this.handleLogout());

        // Close modal on outside click
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.hideAuthModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('authModal').style.display !== 'none') {
                this.hideAuthModal();
            }
        });
    }

    setupAuthStateListener() {
        onAuthStateChanged(window.auth, (user) => {
            this.currentUser = user;
            this.updateUI(user);

            // Dispatch custom event for other modules
            const authEvent = new CustomEvent('authStateChanged', { detail: { user } });
            document.dispatchEvent(authEvent);
        });
    }

    showAuthModal(mode = 'login') {
        const modal = document.getElementById('authModal');
        const title = document.getElementById('authModalTitle');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const toggleText = document.getElementById('authToggleText');

        modal.style.display = 'flex';

        if (mode === 'signup') {
            title.textContent = 'Sign Up';
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="authToggleLink">Login</a>';
        } else {
            title.textContent = 'Login';
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="authToggleLink">Sign up</a>';
        }

        // Re-attach event listener for toggle link
        document.getElementById('authToggleLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthForm();
        });
    }

    hideAuthModal() {
        document.getElementById('authModal').style.display = 'none';
        this.resetForms();
    }

    toggleAuthForm() {
        const title = document.getElementById('authModalTitle');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const toggleText = document.getElementById('authToggleText');

        if (loginForm.style.display === 'none') {
            title.textContent = 'Login';
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            toggleText.innerHTML = 'Don\'t have an account? <a href="#" id="authToggleLink">Sign up</a>';
        } else {
            title.textContent = 'Sign Up';
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            toggleText.innerHTML = 'Already have an account? <a href="#" id="authToggleLink">Login</a>';
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const userCredential = await signInWithEmailAndPassword(window.auth, email, password);
            console.log('Login successful:', userCredential.user);
            this.hideAuthModal();
            this.showMessage('Login successful!', 'success');
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(this.getErrorMessage(error.code), 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();

        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(window.auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });

            console.log('Signup successful:', userCredential.user);
            this.hideAuthModal();
            this.showMessage('Account created successfully!', 'success');
        } catch (error) {
            console.error('Signup error:', error);
            this.showMessage(this.getErrorMessage(error.code), 'error');
        }
    }

    async handleLogout() {
        try {
            await signOut(window.auth);
            this.showMessage('Logged out successfully!', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showMessage('Error logging out', 'error');
        }
    }

    updateUI(user) {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const userDisplayName = document.getElementById('userDisplayName');

        if (user) {
            authButtons.style.display = 'none';
            userMenu.style.display = 'flex';
            userDisplayName.textContent = user.displayName || user.email.split('@')[0];
        } else {
            authButtons.style.display = 'flex';
            userMenu.style.display = 'none';
        }
    }

    resetForms() {
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
    }

    showMessage(message, type = 'info') {
        // Simple notification - you can enhance this with a proper toast system
        const notification = document.createElement('div');
        notification.className = `auth-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else {
            notification.style.backgroundColor = '#3b82f6';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            default:
                return 'An error occurred. Please try again.';
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for global access
window.AuthManager = authManager;
