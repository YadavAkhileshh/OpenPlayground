/* Main App Controller */

class App {
    constructor() {
        this.init();
    }

    init() {
        // Initialize storage and check version
        Storage.init();
        
        // Initialize theme
        this.initTheme();
        
        this.setupEventListeners();
        this.loadProjects();
        this.checkAndResetStreak();
        this.updateStreak();
        this.updateHeaderDate();
        
        // Add Today focus cue on initial load
        document.getElementById('pageTitle')?.classList.add('today-active');
        
        TaskManager.init();
        Calendar.init();
        Storage.setLastVisit();
    }

    setupEventListeners() {
        // Add Task Button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Modal Controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('modalCancel').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('modalOverlay').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('modalSave').addEventListener('click', () => {
            this.saveTask();
        });

        // Calendar Controls
        document.getElementById('prevMonth').addEventListener('click', () => {
            Calendar.prevMonth();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            Calendar.nextMonth();
        });

        document.getElementById('calendarOverlay').addEventListener('click', () => {
            Calendar.close();
        });

        // Date input click to show calendar
        document.getElementById('taskDate').addEventListener('click', () => {
            Calendar.open();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.dataset.filter;
                const title = item.querySelector('.nav-label').textContent;
                TaskManager.setFilter(filter, title);
            });
        });

        // Add Project Button
        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.addProject();
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Streak Click - Show encouraging message
        document.getElementById('streakIndicator').addEventListener('click', () => {
            this.showStreakInfo();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Esc to close modals
            if (e.key === 'Escape') {
                this.closeTaskModal();
                Calendar.close();
            }

            // Ctrl/Cmd + K to add task
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openTaskModal();
            }
        });

        // Form submission
        document.getElementById('taskName').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.saveTask();
            }
        });
    }

    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        
        if (taskId) {
            TaskManager.editTask(taskId);
        } else {
            TaskManager.editingTaskId = null;
            document.getElementById('modalTitle').textContent = 'Add Task';
            document.getElementById('taskName').value = '';
            document.getElementById('taskProject').value = 'personal';
            document.getElementById('taskPriority').value = 'medium';
            
            // Set today's date in user-friendly format
            const today = new Date();
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            const dateInput = document.getElementById('taskDate');
            dateInput.value = today.toLocaleDateString('en-US', options);
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            dateInput.dataset.isoDate = `${year}-${month}-${day}`;
            
            document.getElementById('taskDescription').value = '';
        }

        modal.classList.add('active');
        document.getElementById('taskName').focus();
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('active');
        TaskManager.editingTaskId = null;
    }

    saveTask() {
        const name = document.getElementById('taskName').value.trim();
        const project = document.getElementById('taskProject').value;
        const priority = document.getElementById('taskPriority').value;
        const dateInput = document.getElementById('taskDate');
        const dueDate = dateInput.dataset.isoDate || dateInput.value;
        const description = document.getElementById('taskDescription').value.trim();

        if (!name) {
            alert('Please enter a task name');
            document.getElementById('taskName').focus();
            return;
        }

        const taskData = {
            name,
            project,
            priority,
            dueDate,
            description
        };

        if (TaskManager.editingTaskId) {
            Storage.updateTask(TaskManager.editingTaskId, taskData);
        } else {
            Storage.addTask(taskData);
        }

        this.closeTaskModal();
        TaskManager.renderTasks();
        TaskManager.updateCounts();
        
        // Update streak display after adding/editing task
        this.updateStreak();
    }

    loadProjects() {
        const projects = Storage.getProjects();
        const projectsList = document.getElementById('projectsList');

        projectsList.innerHTML = projects.map(project => `
            <button class="nav-item" data-filter="${project.id}" data-project="${project.id}">
                <span class="nav-icon">${project.icon}</span>
                <span class="nav-label">${project.name}</span>
                <span class="nav-count">0</span>
            </button>
        `).join('');

        // Re-attach click handlers
        document.querySelectorAll('[data-project]').forEach(item => {
            item.addEventListener('click', () => {
                const filter = item.dataset.filter;
                const title = item.querySelector('.nav-label').textContent;
                TaskManager.setFilter(filter, title);
            });
        });

        // Update project options in modal
        const select = document.getElementById('taskProject');
        select.innerHTML = projects.map(p => 
            `<option value="${p.id}">${p.icon} ${p.name}</option>`
        ).join('');
    }

    addProject() {
        const name = prompt('Enter project name:');
        if (!name) return;

        const projects = Storage.getProjects();
        const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
        const icons = ['📁', '💼', '🎯', '🏠', '💡', '🎨', '📚', '🏋️'];

        const newProject = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            color: colors[Math.floor(Math.random() * colors.length)],
            icon: icons[Math.floor(Math.random() * icons.length)]
        };

        projects.push(newProject);
        Storage.saveProjects(projects);
        this.loadProjects();
        TaskManager.updateCounts();
    }

    checkAndResetStreak() {
        // On app load, check if there are no tasks and reset streak
        const tasks = Storage.getTasks();
        if (tasks.length === 0) {
            const streak = Storage.getStreak();
            if (streak.current !== 0) {
                streak.current = 0;
                Storage.saveStreak(streak);
            }
        }
    }

    updateStreak(animate = false) {
        // Update streak daily
        const oldStreak = Storage.getStreak().current;
        Storage.updateStreak();
        
        // Get the updated streak value and display it
        const streak = Storage.getStreak();
        document.getElementById('streakCount').textContent = streak.current;
        
        // Dynamic copy based on streak count
        const label = document.querySelector('.streak-label');
        if (label) {
            if (streak.current === 0) {
                label.textContent = 'Start your streak';
            } else if (streak.current <= 3) {
                label.textContent = 'Nice start!';
            } else if (streak.current >= 7) {
                label.textContent = 'You\'re on fire 🔥';
            } else {
                label.textContent = 'day streak!';
            }
        }
        
        // Animate flame if streak increased
        if (animate && streak.current > oldStreak) {
            const flame = document.querySelector('.streak-flame');
            if (flame) {
                flame.classList.add('celebrate');
                setTimeout(() => flame.classList.remove('celebrate'), 600);
            }
        }
    }

    updateHeaderDate() {
        const today = new Date();
        const options = { weekday: 'short', day: 'numeric', month: 'short' };
        const dateStr = today.toLocaleDateString('en-US', options);
        document.getElementById('headerDate').textContent = dateStr;
    }

    initTheme() {
        // Get saved theme or default to light
        const savedTheme = localStorage.getItem('todo_theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('todo_theme', newTheme);
    }

    showStreakInfo() {
        const streak = Storage.getStreak();
        const messages = [
            "Keep it up! 🔥",
            "One day at a time! 💪",
            "You're building momentum! 🚀",
            "Consistency is key! ⭐",
            "You're doing great! 🎯"
        ];
        
        const message = streak.current === 0 
            ? "Complete a task today to start your streak! 🌟"
            : streak.current >= 7
                ? `${streak.current} days! You're unstoppable! 🔥🔥🔥`
                : `${messages[Math.floor(Math.random() * messages.length)]}`;
        
        // Create temporary tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'streak-tooltip';
        tooltip.textContent = message;
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            tooltip.classList.remove('show');
            setTimeout(() => tooltip.remove(), 300);
        }, 2000);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new App();
    });
} else {
    new App();
}
