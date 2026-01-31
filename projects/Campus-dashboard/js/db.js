/**
 * Simple LocalStorage Database Wrapper
 */
const DB = {
    // Keys
    USERS: 'sc_users',
    SESSION: 'sc_session',
    ATTENDANCE: 'sc_attendance',
    LIBRARY: 'sc_library',
    EVENTS: 'sc_events',
    ENERGY: 'sc_energy',
    SUBJECTS: 'sc_subjects',

    init() {
        if (!localStorage.getItem(this.USERS)) {
            const defaultUser = {
                id: 'u1',
                name: 'Admin User',
                email: 'admin@campus.edu',
                password: 'admin',
                role: 'Admin',
                avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff'
            };
            localStorage.setItem(this.USERS, JSON.stringify([defaultUser]));
        }

        if (!localStorage.getItem(this.SUBJECTS)) {
            const subjects = [
                { id: 1, name: 'Advanced AI Systems', code: 'CS-401', professor: 'Dr. Alan Smith', credits: 4, schedule: 'Mon/Wed 10:00 AM', progress: 75, grade: 'A', color: 'blue' },
                { id: 2, name: 'Fullstack Web Engineering', code: 'CS-302', professor: 'Prof. Sarah Connor', credits: 3, schedule: 'Tue/Thu 2:00 PM', progress: 60, grade: 'B+', color: 'purple' },
                { id: 3, name: 'Quantum Computing', code: 'PHY-405', professor: 'Dr. Richard Feynman', credits: 4, schedule: 'Fri 9:00 AM', progress: 30, grade: 'A-', color: 'cyan' },
                { id: 4, name: 'Data Visualization', code: 'DS-201', professor: 'Ms. Cathy O\'Neil', credits: 3, schedule: 'Mon 1:00 PM', progress: 90, grade: 'A', color: 'orange' },
                { id: 5, name: 'Cyber Security Essentials', code: 'SEC-101', professor: 'Mr. Elliot Alderson', credits: 3, schedule: 'Wed 4:00 PM', progress: 45, grade: 'B', color: 'red' }
            ];
            localStorage.setItem(this.SUBJECTS, JSON.stringify(subjects));
        }

        if (!localStorage.getItem(this.ENERGY)) {
            localStorage.setItem(this.ENERGY, JSON.stringify({
                'north-hall': true,
                'library-main': true,
                'dorms-ac': true,
                'science-lab': false
            }));
        }

        if (!localStorage.getItem(this.EVENTS)) {
            const events = [
                { id: 1, title: 'Tech Talk: AI Futures', date: '2023-11-15', location: 'Auditorium A', registered: [] },
                { id: 2, title: 'Campus Hackathon', date: '2023-11-20', location: 'Science Block', registered: [] },
                { id: 3, title: 'Music Fest', date: '2023-11-25', location: 'Open Grounds', registered: [] },
                { id: 4, title: 'Career Fair', date: '2023-12-01', location: 'Main Hall', registered: [] },
            ];
            localStorage.setItem(this.EVENTS, JSON.stringify(events));
        }

        // Library Seats (Rows of 6)
        if (!localStorage.getItem(this.LIBRARY)) {
            const seats = Array(36).fill(null).map((_, i) => ({ id: i, status: Math.random() > 0.7 ? 'occupied' : 'available', userId: null }));
            localStorage.setItem(this.LIBRARY, JSON.stringify(seats));
        }
    },

    get(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    },

    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    // Session Helpers
    login(email, password) {
        const users = this.get(this.USERS);
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem(this.SESSION, JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, message: 'Invalid credentials' };
    },

    register(name, email, password, role) {
        const users = this.get(this.USERS);
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Email already exists' };
        }

        const newUser = {
            id: 'u' + Date.now(),
            name,
            email,
            password,
            role,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`
        };

        users.push(newUser);
        this.set(this.USERS, users);
        return { success: true };
    },

    updateUser(id, updates) {
        const users = this.get(this.USERS);
        const index = users.findIndex(u => u.id === id);

        if (index !== -1) {
            const updatedUser = { ...users[index], ...updates };
            // Update Avatar if name changed
            if (updates.name) {
                updatedUser.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(updates.name)}&background=random&color=fff`;
            }
            users[index] = updatedUser;
            this.set(this.USERS, users);

            // If updating current user, update session
            const currentUser = this.getUser();
            if (currentUser && currentUser.id === id) {
                localStorage.setItem(this.SESSION, JSON.stringify(updatedUser));
            }
            return { success: true };
        }
        return { success: false, message: 'User not found' };
    },

    logout() {
        localStorage.removeItem(this.SESSION);
        window.location.href = 'login.html';
    },

    requireAuth() {
        if (!localStorage.getItem(this.SESSION)) {
            window.location.href = 'login.html';
        }
    },

    // Subject Helpers
    addSubject(subject) {
        const subjects = this.get(this.SUBJECTS);
        // Basic validation
        if (!subject.name || !subject.code) return { success: false, message: 'Name and Code are required' };

        subject.id = Date.now();
        subject.progress = 0;
        subject.grade = 'N/A';
        subject.content = { notes: '', links: [], resources: [] }; // Content storage

        subjects.push(subject);
        this.set(this.SUBJECTS, subjects);
        return { success: true };
    },

    saveSubjectContent(id, content) {
        const subjects = this.get(this.SUBJECTS);
        const index = subjects.find(s => s.id === id);
        if (index) {
            index.content = content;
            this.set(this.SUBJECTS, subjects);
            return { success: true };
        }
        return { success: false };
    },

    getUser() {
        return JSON.parse(localStorage.getItem(this.SESSION));
    }
};

// Initialize on load
DB.init();
