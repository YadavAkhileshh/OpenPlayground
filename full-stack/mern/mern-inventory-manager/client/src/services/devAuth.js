// Mock Authentication Service using LocalStorage
// This is for development purposes only and can be removed when MongoDB is connected.

const DEV_USERS_KEY = 'dev_inventory_users';
const DEV_TOKEN_KEY = 'dev_inventory_token';
const DEV_CURRENT_USER_KEY = 'dev_inventory_user';

// Pre-seed admin user if not exists
const initDevUsers = () => {
    const users = JSON.parse(localStorage.getItem(DEV_USERS_KEY) || '[]');
    if (users.length === 0) {
        const adminUser = {
            id: 'dev-admin-id',
            name: 'Dev Admin',
            email: 'admin@example.com',
            password: 'password123',
            role: 'Admin',
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        localStorage.setItem(DEV_USERS_KEY, JSON.stringify(users));
    }
};

initDevUsers();

export const devAuth = {
    login: async (email, password) => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        const users = JSON.parse(localStorage.getItem(DEV_USERS_KEY) || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            throw { response: { data: { message: 'Invalid email or password (Dev Mode)' } } };
        }

        const token = `dev-token-${user.id}-${Date.now()}`;
        localStorage.setItem(DEV_TOKEN_KEY, token);
        localStorage.setItem(DEV_CURRENT_USER_KEY, JSON.stringify(user));

        return { token, user };
    },

    register: async (name, email, password, role = 'Staff') => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const users = JSON.parse(localStorage.getItem(DEV_USERS_KEY) || '[]');
        if (users.find(u => u.email === email)) {
            throw { response: { data: { message: 'User already exists (Dev Mode)' } } };
        }

        const newUser = {
            id: `dev-user-${Date.now()}`,
            name,
            email,
            password,
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(DEV_USERS_KEY, JSON.stringify(users));

        const token = `dev-token-${newUser.id}-${Date.now()}`;
        localStorage.setItem(DEV_TOKEN_KEY, token);
        localStorage.setItem(DEV_CURRENT_USER_KEY, JSON.stringify(newUser));

        return { token, user: newUser };
    },

    fetchProfile: async () => {
        const token = localStorage.getItem(DEV_TOKEN_KEY);
        const user = JSON.parse(localStorage.getItem(DEV_CURRENT_USER_KEY));

        if (!token || !user) {
            throw new Error('Not authenticated');
        }

        return { user };
    },

    logout: () => {
        localStorage.removeItem(DEV_TOKEN_KEY);
        localStorage.removeItem(DEV_CURRENT_USER_KEY);
    }
};
