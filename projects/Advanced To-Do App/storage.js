/* LocalStorage Management */

const Storage = {
    // Keys
    TASKS_KEY: 'todo_tasks',
    PROJECTS_KEY: 'todo_projects',
    STREAK_KEY: 'todo_streak',
    LAST_VISIT_KEY: 'todo_last_visit',
    VERSION_KEY: 'todo_version',
    CURRENT_VERSION: '1.0.0',

    // Initialize and check version
    init() {
        const savedVersion = localStorage.getItem(this.VERSION_KEY);
        if (!savedVersion || savedVersion !== this.CURRENT_VERSION) {
            console.log('Version mismatch or first run. Clearing old data...');
            this.clearAll(true); // Clear without confirmation
            localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
        }
    },

    // Tasks
    getTasks() {
        try {
            return JSON.parse(localStorage.getItem(this.TASKS_KEY)) || [];
        } catch (e) {
            console.error('Error reading tasks:', e);
            return [];
        }
    },

    saveTasks(tasks) {
        try {
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
            return true;
        } catch (e) {
            console.error('Error saving tasks:', e);
            return false;
        }
    },

    addTask(task) {
        const tasks = this.getTasks();
        task.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        task.createdAt = new Date().toISOString();
        task.completed = false;
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    },

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    },

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filtered);
        return filtered;
    },

    // Projects
    getProjects() {
        try {
            const projects = JSON.parse(localStorage.getItem(this.PROJECTS_KEY));
            return projects || [
                { id: 'personal', name: 'Personal', color: '#3498db', icon: '👤' },
                { id: 'work', name: 'Work', color: '#e74c3c', icon: '💼' }
            ];
        } catch (e) {
            return [
                { id: 'personal', name: 'Personal', color: '#3498db', icon: '👤' },
                { id: 'work', name: 'Work', color: '#e74c3c', icon: '💼' }
            ];
        }
    },

    saveProjects(projects) {
        localStorage.setItem(this.PROJECTS_KEY, JSON.stringify(projects));
    },

    // Streak
    getStreak() {
        try {
            return JSON.parse(localStorage.getItem(this.STREAK_KEY)) || { 
                current: 0, 
                longest: 0,
                lastCompleted: null 
            };
        } catch (e) {
            return { current: 0, longest: 0, lastCompleted: null };
        }
    },

    saveStreak(streak) {
        localStorage.setItem(this.STREAK_KEY, JSON.stringify(streak));
    },

    updateStreak() {
        const streak = this.getStreak();
        const today = new Date().toDateString();
        const tasks = this.getTasks();
        
        // If no tasks exist at all, always reset streak to 0
        if (tasks.length === 0) {
            if (streak.current !== 0) {
                streak.current = 0;
                this.saveStreak(streak);
            }
            return false;
        }
        
        // Get today's tasks
        const todayTasks = tasks.filter(t => {
            const taskDate = new Date(t.dueDate).toDateString();
            return taskDate === today;
        });

        // If no tasks for today, check if we should reset
        if (todayTasks.length === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            // Only reset if we haven't completed today or yesterday
            if (streak.lastCompleted !== today && streak.lastCompleted !== yesterdayStr) {
                if (streak.current !== 0) {
                    streak.current = 0;
                    this.saveStreak(streak);
                }
            }
            return false;
        }

        // Check if all today's tasks are completed
        const allCompleted = todayTasks.every(t => t.completed);

        if (allCompleted && streak.lastCompleted !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (streak.lastCompleted === yesterdayStr) {
                streak.current += 1;
            } else if (!streak.lastCompleted || streak.lastCompleted !== today) {
                streak.current = 1;
            }

            streak.lastCompleted = today;
            if (streak.current > streak.longest) {
                streak.longest = streak.current;
            }
            this.saveStreak(streak);
            return true; // Streak increased
        } else if (!allCompleted) {

            if (streak.lastCompleted === today) {
                streak.lastCompleted = null;
            }
            
            if (streak.current !== 0) {
                streak.current = 0;
                this.saveStreak(streak);
            }
        }
        return false;
    },

    // Visit tracking
    getLastVisit() {
        return localStorage.getItem(this.LAST_VISIT_KEY);
    },

    setLastVisit() {
        localStorage.setItem(this.LAST_VISIT_KEY, new Date().toISOString());
    },

    // Utility
    clearAll(skipConfirm = false) {
        if (skipConfirm || confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            localStorage.removeItem(this.TASKS_KEY);
            localStorage.removeItem(this.PROJECTS_KEY);
            localStorage.removeItem(this.STREAK_KEY);
            localStorage.removeItem(this.LAST_VISIT_KEY);
            if (!skipConfirm) {
                location.reload();
            }
        }
    }
};
