const USERS_KEY = 'nexus_users';
const SESSION_KEY = 'nexus_session';

export const auth = {
    // --- Public API ---

    init(uiCallbacks) {
        this.callbacks = uiCallbacks;
        this.checkSession();
    },

    login(username, password) {
        const users = this._getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this._createSession(user);
            return { success: true, user };
        }
        return { success: false, message: 'INVALID_CREDENTIALS' };
    },

    signup(username, password) {
        const users = this._getUsers();

        if (users.find(u => u.username === username)) {
            return { success: false, message: 'USER_EXISTS' };
        }

        const newUser = {
            id: Date.now(),
            username,
            password,
            created: new Date().toISOString()
        };

        users.push(newUser);
        this._saveUsers(users);
        this._createSession(newUser);

        return { success: true, user: newUser };
    },

    logout() {
        localStorage.removeItem(SESSION_KEY);
        if (this.callbacks.onLogout) this.callbacks.onLogout();
    },

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    },

    // --- Private Helpers ---

    checkSession() {
        const session = this.getCurrentUser();
        if (session) {
            if (this.callbacks.onAuthSuccess) this.callbacks.onAuthSuccess(session);
        } else {
            if (this.callbacks.onAuthRequired) this.callbacks.onAuthRequired();
        }
    },

    _getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    },

    _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    _createSession(user) {
        const sessionData = {
            username: user.username,
            loginTime: Date.now()
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        if (this.callbacks.onAuthSuccess) this.callbacks.onAuthSuccess(sessionData);
    }
};
