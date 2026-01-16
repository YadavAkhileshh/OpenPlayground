/* Task Management */

const TaskManager = {
    currentFilter: 'today',
    editingTaskId: null,

    init() {
        this.renderTasks();
        this.updateCounts();
    },

    renderTasks(filter = this.currentFilter) {
        const container = document.getElementById('tasksContainer');
        const tasks = this.getFilteredTasks(filter);
        const allTasks = Storage.getTasks();
        
        // Check if there are tasks but all completed (for Today view)
        const hasCompletedTasks = filter === 'today' && 
            allTasks.some(task => {
                const taskDate = new Date(task.dueDate);
                taskDate.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return taskDate.getTime() === today.getTime() && task.completed;
            }) && tasks.length === 0;

        if (tasks.length === 0) {
            container.innerHTML = this.getEmptyState(filter, hasCompletedTasks);
            return;
        }

        container.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        this.attachTaskListeners();
    },

    getFilteredTasks(filter) {
        const allTasks = Storage.getTasks();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
            case 'today':
                return allTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate.getTime() === today.getTime();
                });
            
            case 'upcoming':
                return allTasks.filter(task => {
                    const taskDate = new Date(task.dueDate);
                    taskDate.setHours(0, 0, 0, 0);
                    return taskDate > today;
                }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            
            default:
                // Project filter
                return allTasks.filter(task => task.project === filter);
        }
    },

    createTaskHTML(task) {
        const dateLabel = this.getDateLabel(task.dueDate);
        const project = Storage.getProjects().find(p => p.id === task.project);

        return `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}" data-priority="${task.priority}">
                <div class="task-drag-handle">⋮⋮</div>
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="TaskManager.toggleTask('${task.id}')"></div>
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.name)}</div>
                    <div class="task-meta">
                        ${dateLabel ? `<span class="task-date ${dateLabel.class}">${dateLabel.text}</span>` : ''}
                        ${project ? `<span class="task-project ${project.id}">${project.icon} ${project.name}</span>` : ''}
                        <span class="task-priority ${task.priority}"></span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn edit" onclick="TaskManager.editTask('${task.id}')" title="Edit">
                        ✏️
                    </button>
                    <button class="task-action-btn delete" onclick="TaskManager.deleteTask('${task.id}')" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    getDateLabel(dueDate) {
        if (!dueDate) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const taskDate = new Date(dueDate);
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() === today.getTime()) {
            return { text: 'Today', class: 'today' };
        } else if (taskDate.getTime() === tomorrow.getTime()) {
            return { text: 'Tomorrow', class: 'tomorrow' };
        } else if (taskDate < today) {
            return { text: this.formatDate(taskDate), class: 'overdue' };
        } else {
            return { text: this.formatDate(taskDate), class: '' };
        }
    },

    formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    },

    getEmptyState(filter, allCompleted = false) {
        // Show completion message if all tasks are done
        if (allCompleted) {
            return `
                <div class="empty-state">
                    <div class="empty-state-icon">🎉</div>
                    <div class="empty-state-title">All clear for today!</div>
                    <div class="empty-state-description">Great work! Add something for tomorrow?</div>
                    <button class="empty-state-cta" onclick="document.getElementById('addTaskBtn').click()">
                        <span>+</span> Plan ahead
                    </button>
                </div>
            `;
        }
        
        // Time-based messaging for Today view
        const hour = new Date().getHours();
        let todayMsg;
        
        if (hour < 12) {
            todayMsg = { 
                icon: '🌅', 
                title: 'Good morning!', 
                desc: 'Plan your day — one task at a time.' 
            };
        } else if (hour < 18) {
            todayMsg = { 
                icon: '☀️', 
                title: 'Your day is clear!', 
                desc: 'Start fresh — add your first task and keep your streak alive.' 
            };
        } else {
            todayMsg = { 
                icon: '🌙', 
                title: 'Evening focus', 
                desc: 'What\'s one thing you can finish today?' 
            };
        }
        
        const messages = {
            today: todayMsg,
            upcoming: { 
                icon: '🎯', 
                title: 'All caught up!', 
                desc: 'You\'re ahead of the game. Plan something new?' 
            },
            default: { 
                icon: '✨', 
                title: 'Ready to focus?', 
                desc: 'Create your first task and begin building momentum.' 
            }
        };

        const msg = messages[filter] || messages.default;

        return `
            <div class="empty-state">
                <div class="empty-state-icon">${msg.icon}</div>
                <div class="empty-state-title">${msg.title}</div>
                <div class="empty-state-description">${msg.desc}</div>
                <button class="empty-state-cta" onclick="document.getElementById('addTaskBtn').click()">
                    <span>+</span> Add your first task
                </button>
            </div>
        `;
    },

    attachTaskListeners() {
        // No automatic edit on card click - only via edit button
        // Task interaction is handled via onclick attributes in HTML
    },

    toggleTask(taskId) {
        const tasks = Storage.getTasks();
        const task = tasks.find(t => t.id === taskId);
        
        if (task) {
            task.completed = !task.completed;
            Storage.updateTask(taskId, { completed: task.completed });
            this.renderTasks();
            this.updateCounts();
            
            // Check streak
            const streakIncreased = Storage.updateStreak();
            if (streakIncreased) {
                this.showCelebration();
            }
            
            // Update streak display with animation
            if (typeof app !== 'undefined') {
                app.updateStreak(task.completed); // Animate if task was completed
            } else {
                const streak = Storage.getStreak();
                document.getElementById('streakCount').textContent = streak.current;
            }
        }
    },

    editTask(taskId) {
        const task = Storage.getTasks().find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        document.getElementById('modalTitle').textContent = 'Edit Task';
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskProject').value = task.project;
        document.getElementById('taskPriority').value = task.priority;
        
        // Format date for display
        const dateInput = document.getElementById('taskDate');
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            dateInput.value = date.toLocaleDateString('en-US', options);
            dateInput.dataset.isoDate = task.dueDate;
        } else {
            dateInput.value = '';
            dateInput.dataset.isoDate = '';
        }
        
        document.getElementById('taskDescription').value = task.description || '';

        document.getElementById('taskModal').classList.add('active');
        document.getElementById('taskName').focus();
    },

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            Storage.deleteTask(taskId);
            this.renderTasks();
            this.updateCounts();
            
            // Update streak immediately if all tasks are deleted
            Storage.updateStreak();
            const streak = Storage.getStreak();
            document.getElementById('streakCount').textContent = streak.current;
        }
    },

    showCelebration() {
        const celebration = document.getElementById('celebration');
        celebration.classList.add('active');
        setTimeout(() => {
            celebration.classList.remove('active');
        }, 3000);
    },

    updateCounts() {
        const tasks = Storage.getTasks();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today count
        const todayCount = tasks.filter(t => {
            const taskDate = new Date(t.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate.getTime() === today.getTime() && !t.completed;
        }).length;

        // Upcoming count
        const upcomingCount = tasks.filter(t => {
            const taskDate = new Date(t.dueDate);
            taskDate.setHours(0, 0, 0, 0);
            return taskDate > today && !t.completed;
        }).length;

        document.getElementById('todayCount').textContent = todayCount;
        document.getElementById('upcomingCount').textContent = upcomingCount;

        // Update project counts
        const projects = Storage.getProjects();
        projects.forEach(project => {
            const count = tasks.filter(t => t.project === project.id && !t.completed).length;
            const countEl = document.querySelector(`[data-project="${project.id}"] .nav-count`);
            if (countEl) {
                countEl.textContent = count;
            }
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    setFilter(filter, title) {
        this.currentFilter = filter;
        const titleElement = document.getElementById('pageTitle');
        titleElement.textContent = title;
        
        // Add Today focus visual cue
        if (filter === 'today') {
            titleElement.classList.add('today-active');
        } else {
            titleElement.classList.remove('today-active');
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');
        
        this.renderTasks(filter);
    }
};
