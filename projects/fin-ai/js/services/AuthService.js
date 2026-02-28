import { Storage } from '../utils/Storage.js';

export class AuthService {
    constructor() {
        this.currentUser = Storage.load('fin_session');
        this.users = Storage.load('fin_users') || [];
    }

    register(name, email, password) {
        if (this.users.find(u => u.email === email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: 'user_' + Date.now(),
            name,
            email,
            password, // In a real app, hash this!
            joined: new Date().toISOString()
        };

        this.users.push(newUser);
        Storage.save('fin_users', this.users);
        this.login(email, password);
        return newUser;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        this.currentUser = { ...user };
        delete this.currentUser.password; // Don't keep password in session
        Storage.save('fin_session', this.currentUser);
        return this.currentUser;
    }

    logout() {
        this.currentUser = null;
        Storage.clear('fin_session');
    }

    updateProfile(data) {
        if (!this.currentUser) throw new Error('No user logged in');

        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) throw new Error('User not found');

        this.users[userIndex] = { ...this.users[userIndex], ...data };
        Storage.save('fin_users', this.users);

        // Update session
        this.currentUser = { ...this.users[userIndex] };
        delete this.currentUser.password;
        Storage.save('fin_session', this.currentUser);

        return this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }
}
