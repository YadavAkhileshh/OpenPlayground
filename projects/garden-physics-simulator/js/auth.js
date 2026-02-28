/**
 * Simple LocalStorage based Authentication System
 */
export const Auth = {
    currentUser: null,

    init() {
        const savedUser = localStorage.getItem('zen_garden_session');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        return this.currentUser;
    },

    register(username, password) {
        const users = JSON.parse(localStorage.getItem('zen_garden_users') || '[]');

        if (users.find(u => u.username === username)) {
            throw new Error('Username already exists');
        }

        const newUser = { username, password, createdAt: new Date().toISOString() };
        users.push(newUser);
        localStorage.setItem('zen_garden_users', JSON.stringify(users));
        return this.login(username, password);
    },

    login(username, password) {
        const users = JSON.parse(localStorage.getItem('zen_garden_users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            throw new Error('Invalid username or password');
        }

        this.currentUser = { username: user.username };
        localStorage.setItem('zen_garden_session', JSON.stringify(this.currentUser));
        return this.currentUser;
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('zen_garden_session');
        window.location.reload();
    },

    isAuthenticated() {
        return !!this.currentUser;
    }
};
