class KanbanBoard {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
        this.currentEditId = null;
        this.draggedElement = null;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateTaskCounts();
    }

    bindEvents() {
        // Modal events
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Close modal on backdrop click
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
        });

        // Drag and drop events for columns
        const taskLists = document.querySelectorAll('.task-list');
        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => this.handleDragOver(e));
            list.addEventListener('drop', (e) => this.handleDrop(e));
            list.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            list.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        });
    }

    openModal(task = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');
        
        if (task) {
            modalTitle.textContent = 'Edit Task';
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskStatus').value = task.status;
            this.currentEditId = task.id;
        } else {
            modalTitle.textContent = 'Add New Task';
            form.reset();
            this.currentEditId = null;
        }
        
        modal.classList.add('active');
    }

    closeModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('active');
        this.currentEditId = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('taskTitle').value.trim();
        const description = document.getElementById('taskDescription').value.trim();
        const priority = document.getElementById('taskPriority').value;
        const status = document.getElementById('taskStatus').value;

        if (!title) return;

        if (this.currentEditId) {
            this.updateTask(this.currentEditId, { title, description, priority, status });
        } else {
            this.addTask({ title, description, priority, status });
        }

        this.closeModal();
    }

    addTask(taskData) {
        const task = {
            id: Date.now().toString(),
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            status: taskData.status,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateTaskCounts();
    }

    updateTask(id, taskData) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...taskData };
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }

    saveTasks() {
        localStorage.setItem('kanban-tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const todoList = document.getElementById('todoList');
        const inprogressList = document.getElementById('inprogressList');
        const doneList = document.getElementById('doneList');

        // Clear existing tasks
        todoList.innerHTML = '';
        inprogressList.innerHTML = '';
        doneList.innerHTML = '';

        // Group tasks by status
        const tasksByStatus = {
            todo: this.tasks.filter(task => task.status === 'todo'),
            inprogress: this.tasks.filter(task => task.status === 'inprogress'),
            done: this.tasks.filter(task => task.status === 'done')
        };

        // Render tasks in each column
        Object.keys(tasksByStatus).forEach(status => {
            const list = document.getElementById(`${status}List`);
            const tasks = tasksByStatus[status];

            if (tasks.length === 0) {
                list.innerHTML = `
                    <div class="empty-state">
                        <i class="ri-inbox-line"></i>
                        <p>No tasks yet</p>
                    </div>
                `;
            } else {
                tasks.forEach(task => {
                    const taskElement = this.createTaskElement(task);
                    list.appendChild(taskElement);
                });
            }
        });
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-card priority-${task.priority}`;
        taskDiv.draggable = true;
        taskDiv.dataset.taskId = task.id;

        taskDiv.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="kanban.openModal(kanban.getTaskById('${task.id}'))">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="task-btn delete-btn" onclick="kanban.deleteTask('${task.id}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
        `;

        // Add drag event listeners
        taskDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
        taskDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return taskDiv;
    }

    getTaskById(id) {
        return this.tasks.find(task => task.id === id);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateTaskCounts() {
        const counts = {
            todo: this.tasks.filter(task => task.status === 'todo').length,
            inprogress: this.tasks.filter(task => task.status === 'inprogress').length,
            done: this.tasks.filter(task => task.status === 'done').length
        };

        document.getElementById('todoCount').textContent = counts.todo;
        document.getElementById('inprogressCount').textContent = counts.inprogress;
        document.getElementById('doneCount').textContent = counts.done;
    }

    // Drag and Drop Methods
    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedElement = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDragEnter(e) {
        e.preventDefault();
        if (e.target.classList.contains('task-list')) {
            e.target.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('task-list') && !e.target.contains(e.relatedTarget)) {
            e.target.classList.remove('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const taskList = e.target.closest('.task-list');
        if (!taskList || !this.draggedElement) return;

        taskList.classList.remove('drag-over');
        
        const column = taskList.closest('.column');
        const newStatus = column.dataset.status;
        const taskId = this.draggedElement.dataset.taskId;
        
        // Update task status
        const task = this.getTaskById(taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            this.saveTasks();
            this.renderTasks();
            this.updateTaskCounts();
        }
    }
}

// Initialize the Kanban board
const kanban = new KanbanBoard();

// Add some sample tasks if none exist
if (kanban.tasks.length === 0) {
    const sampleTasks = [
        {
            id: '1',
            title: 'Design Homepage',
            description: 'Create wireframes and mockups for the new homepage design',
            priority: 'high',
            status: 'todo',
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Implement User Authentication',
            description: 'Set up login and registration functionality',
            priority: 'medium',
            status: 'inprogress',
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            title: 'Write Documentation',
            description: 'Document the API endpoints and usage examples',
            priority: 'low',
            status: 'done',
            createdAt: new Date().toISOString()
        }
    ];
    
    kanban.tasks = sampleTasks;
    kanban.saveTasks();
    kanban.renderTasks();
    kanban.updateTaskCounts();
}