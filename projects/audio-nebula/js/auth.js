/**
 * Auth Module: Manages local storage based authentication.
 */

const USERS_KEY = 'neogen_users';
const SESSION_KEY = 'neogen_session';

export const auth = {
    // Get all users from local storage
    _getUsers() {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    },

    // Save users to local storage
    _saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    },

    // Register a new user
    signup(username, password) {
        const users = this._getUsers();
        if (users.find(u => u.username === username)) {
            return { success: false, message: 'IDENTITY_ALREADY_EXISTS' };
        }

        const newUser = {
            username,
            password, // In a real app, this would be hashed
            presets: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this._saveUsers(users);
        return { success: true, message: 'IDENTITY_INITIALIZED' };
    },

    // Login user
    login(username, password) {
        const users = this._getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            return { success: false, message: 'ACCESS_DENIED: INVALID_CREDENTIALS' };
        }

        const session = {
            username: user.username,
            loginTime: new Date().getTime()
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, user };
    },

    // Logout user
    logout() {
        localStorage.removeItem(SESSION_KEY);
    },

    // Check if user is currently logged in
    getCurrentSession() {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        if (!session) return null;

        // Optional: Session expiry check (e.g., 24 hours)
        const now = new Date().getTime();
        const expiry = 24 * 60 * 60 * 1000;
        if (now - session.loginTime > expiry) {
            this.logout();
            return null;
        }

        return session;
    },

    // Get user data for the current session
    getUserData() {
        const session = this.getCurrentSession();
        if (!session) return null;

        const users = this._getUsers();
        return users.find(u => u.username === session.username);
    },

    // Save a preset for the current user
    savePreset(preset) {
        const session = this.getCurrentSession();
        if (!session) return { success: false };

        const users = this._getUsers();
        const user = users.find(u => u.username === session.username);

        if (user) {
            if (!user.presets) user.presets = [];
            user.presets.push({
                ...preset,
                id: Date.now(),
                createdAt: new Date().toISOString()
            });
            this._saveUsers(users);
            return { success: true };
        }
        return { success: false };
    },

    // Update user profile
    updateProfile(newUsername, newPassword) {
        const session = this.getCurrentSession();
        if (!session) return { success: false, message: 'SESSION_EXPIRED' };

        const users = this._getUsers();
        const userIndex = users.findIndex(u => u.username === session.username);

        if (userIndex !== -1) {
            // Check if new username is taken by someone else
            if (newUsername !== session.username && users.find(u => u.username === newUsername)) {
                return { success: false, message: 'IDENTITY_ALREADY_EXISTS' };
            }

            users[userIndex].username = newUsername;
            users[userIndex].password = newPassword;
            this._saveUsers(users);

            // Update session
            const newSession = { ...session, username: newUsername };
            localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));

            return { success: true, user: users[userIndex] };
        }
        return { success: false, message: 'USER_NOT_FOUND' };
    }
};
