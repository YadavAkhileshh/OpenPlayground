import Store from './store.js';

export default class AuthSystem {
    constructor() {
        this.userStore = new Store('zenith_users');
        this.sessionStore = new Store('zenith_session');
    }

    /**
     * Simple hash function for "security" (Simulated).
     * DO NOT USE IN PRODUCTION APPS.
     */
    _hash(str) {
        let hash = 0;
        for (let i = 0, len = str.length; i < len; i++) {
            let chr = str.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash.toString();
    }

    signup(username, password) {
        if (!username || !password) return { success: false, message: 'Missing fields' };

        const users = this.userStore.get('users', {});

        if (users[username]) {
            return { success: false, message: 'User already exists' };
        }

        users[username] = {
            username,
            passwordHash: this._hash(password),
            createdAt: new Date().toISOString(),
            settings: { theme: 'dark' }
        };

        this.userStore.set('users', users);
        this.login(username, password);
        return { success: true, message: 'Account created' };
    }

    login(username, password) {
        const users = this.userStore.get('users', {});
        const user = users[username];

        if (!user) return { success: false, message: 'User not found' };

        if (user.passwordHash !== this._hash(password)) {
            return { success: false, message: 'Invalid credentials' };
        }

        // Set Session
        const session = {
            username: user.username,
            loginTime: new Date().toISOString()
        };
        this.sessionStore.set('current', session);
        return { success: true, message: 'Logged in' };
    }

    logout() {
        this.sessionStore.remove('current');
    }

    getSession() {
        return this.sessionStore.get('current');
    }

    requireAuth(redirectUrl = 'auth.html') {
        if (!this.getSession()) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
}
