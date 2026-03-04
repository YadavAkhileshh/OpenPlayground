export default class TaskBoardView {
    constructor(taskManager) {
        this.tm = taskManager;

        this.cols = {
            todo: document.getElementById('full-task-list-todo'),
            progress: document.getElementById('full-task-list-progress'),
            done: document.getElementById('full-task-list-done')
        };

        this.draggedItem = null;
        this.draggedId = null;

        // Listen for updates
        window.addEventListener('zenith:tasks-updated', (e) => this.render(e.detail));

        // Initial Render
        this.render(this.tm.tasks);

        this.bindEvents();
        this.setupDragAndDrop();
    }

    bindEvents() {
        document.getElementById('add-todo-btn').addEventListener('click', () => {
            const text = prompt("New Task Description:");
            if (!text) return;

            // Simple priority selection
            const priorities = ['low', 'med', 'high'];
            const priority = prompt("Priority (low, med, high)?", "med");

            const safePriority = priorities.includes(priority) ? priority : 'med';
            this.tm.addTask(text, 'todo', safePriority);
        });
    }

    setupDragAndDrop() {
        // Drop Zones (Columns)
        Object.keys(this.cols).forEach(status => {
            const col = this.cols[status].parentElement; // .task-column

            col.addEventListener('dragover', (e) => {
                e.preventDefault();
                col.classList.add('drag-over');
            });

            col.addEventListener('dragleave', () => {
                col.classList.remove('drag-over');
            });

            col.addEventListener('drop', (e) => {
                e.preventDefault();
                col.classList.remove('drag-over');
                if (this.draggedId) {
                    this.tm.updateStatus(this.draggedId, status);
                }
            });
        });
    }

    render(tasks) {
        // Clear all cols
        Object.values(this.cols).forEach(el => el.innerHTML = '');

        tasks.forEach(task => {
            const li = this.createTaskElement(task);
            if (this.cols[task.status]) {
                this.cols[task.status].appendChild(li);
            }
        });
    }

    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = `task-item ${task.status === 'done' ? 'completed' : ''}`;
        li.draggable = true;
        li.dataset.id = task.id;

        // Priority Badge
        const priority = task.priority || 'med';
        const badge = document.createElement('span');
        badge.className = `priority-tag priority-${priority}`;
        badge.textContent = priority;

        const span = document.createElement('span');
        span.textContent = task.text;
        span.style.flex = 1;

        // Editable Text
        span.addEventListener('dblclick', () => {
            const newText = prompt("Edit task:", task.text);
            if (newText) {
                // Manually update for now, ideally tasks manager method
                task.text = newText;
                this.tm.save();
                this.tm.notifyChange();
            }
        });

        // Controls
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.className = 'icon-btn small';
        delBtn.onclick = (e) => {
            e.stopPropagation(); // Prevent drag start if clicking button
            this.tm.removeTask(task.id);
        }

        li.appendChild(badge);
        li.appendChild(span);
        li.appendChild(delBtn);

        // Drag Events
        li.addEventListener('dragstart', () => {
            this.draggedItem = li;
            this.draggedId = task.id;
            setTimeout(() => li.classList.add('dragging'), 0);
        });

        li.addEventListener('dragend', () => {
            setTimeout(() => {
                li.classList.remove('dragging');
                this.draggedItem = null;
                this.draggedId = null;
            }, 0);
        });

        return li;
    }
}
