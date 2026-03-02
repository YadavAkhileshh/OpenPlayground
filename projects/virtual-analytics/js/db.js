/**
 * LocalStorage Database for Day 117 Analytics
 */
const DB = {
    KEYS: {
        USER: 'df_user',
        SESSION: 'df_session',
        SETTINGS: 'df_settings',
        LOGS: 'df_logs',
        FAVORITES: 'df_favorites'
    },

    init() {
        if (!localStorage.getItem(this.KEYS.USER)) {
            const admin = {
                id: 'sys-01',
                name: 'System Admin',
                email: 'admin@dataflow.io',
                password: 'admin',
                role: 'ROOT',
                avatar: 'https://ui-avatars.com/api/?name=Admin&background=00d2ff&color=fff'
            };
            localStorage.setItem(this.KEYS.USER, JSON.stringify([admin]));
        }

        if (!localStorage.getItem(this.KEYS.SETTINGS)) {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify({
                refreshRate: 1000,
                logRetention: 100,
                theme: 'dark'
            }));
        }
    },

    get(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    set(key, val) {
        localStorage.setItem(key, JSON.stringify(val));
    },

    login(email, password) {
        const users = this.get(this.KEYS.USER);
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem(this.KEYS.SESSION, JSON.stringify(user));
            return { success: true };
        }
        return { success: false, message: 'Access Denied' };
    },

    logout() {
        localStorage.removeItem(this.KEYS.SESSION);
        window.location.href = 'login.html';
    },

    getSession() {
        return JSON.parse(localStorage.getItem(this.KEYS.SESSION));
    },

    requireAuth() {
        if (!this.getSession()) {
            window.location.href = 'login.html';
        }
    }
};

DB.init();
