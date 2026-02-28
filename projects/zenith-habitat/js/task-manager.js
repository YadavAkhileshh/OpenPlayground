import Store from './store.js';
import { UIRenderer } from './ui-renderer.js';

export default class TaskManager {
    constructor() {
        this.store = new Store('zenith_tasks');
        this.tasks = this.store.get('list', []);

        // Ensure data migration if needed (bool -> status)
        this.tasks.forEach(t => {
            if (!t.status) {
                t.status = t.completed ? 'done' : 'todo';
            }
        });

        // Listeners for View Updates handled by specific views
        this.renderWidget();
    }

    addTask(text, status = 'todo', priority = 'med') {
        if (!text.trim()) return;
        const newTask = {
            id: Date.now(),
            text: text,
            status: status,
            priority: priority,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.save();
        this.notifyChange();
    }

    removeTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.save();
        this.notifyChange();
    }

    updateStatus(id, newStatus) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.status = newStatus;
            // Sync legacy boolean for compatibility
            task.completed = newStatus === 'done';
            this.save();
            this.notifyChange();
        }
    }

    save() {
        this.store.set('list', this.tasks);
    }

    notifyChange() {
        this.renderWidget();
        window.dispatchEvent(new CustomEvent('zenith:tasks-updated', { detail: this.tasks }));
    }

    renderWidget() {
        // Only show 'todo' or 'progress' in the main widget
        const activeTasks = this.tasks.filter(t => t.status !== 'done');
        UIRenderer.renderTasks(
            activeTasks.slice(0, 5), // Limit to 5
            (id) => this.removeTask(id),
            (id) => this.updateStatus(id, 'done')
        );
    }
}
