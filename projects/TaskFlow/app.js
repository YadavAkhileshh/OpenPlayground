// TaskFlow: Smart Task Organizer
// Author: Ayaanshaikh12243
// Description: Web-based productivity tool for managing tasks, priorities, analytics, and collaboration.
// -------------------------------------------------------------

// =====================
// Utility Functions
// =====================
const Utils = {
  generateId: () => '_' + Math.random().toString(36).substr(2, 9),
  formatDate: (date) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  },
  debounce: (func, wait) => {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },
  clone: (obj) => JSON.parse(JSON.stringify(obj)),
};

// =====================
// Task Model
// =====================
class Task {
  constructor({title, description, deadline, priority, assignedTo, comments, files, status}) {
    this.id = Utils.generateId();
    this.title = title || '';
    this.description = description || '';
    this.deadline = deadline || null;
    this.priority = priority || 'Medium'; // Low, Medium, High
    this.assignedTo = assignedTo || [];
    this.comments = comments || [];
    this.files = files || [];
    this.status = status || 'Pending'; // Pending, In Progress, Completed
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

// =====================
// Task Manager
// =====================
class TaskManager {
  constructor() {
    this.tasks = [];
    this.load();
  }

  createTask(data) {
    const task = new Task(data);
    this.tasks.push(task);
    this.save();
    return task;
  }

  editTask(id, updates) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      Object.assign(task, updates);
      task.updatedAt = new Date();
      this.save();
    }
    return task;
  }

  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.save();
  }

  getTask(id) {
    return this.tasks.find(t => t.id === id);
  }

  getAllTasks() {
    return this.tasks;
  }

  save() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
  }

  load() {
    const data = localStorage.getItem('taskflow_tasks');
    if (data) {
      this.tasks = JSON.parse(data).map(t => Object.assign(new Task({}), t));
    }
  }
}

// =====================
// Smart Suggestions
// =====================
class SuggestionEngine {
  constructor(taskManager) {
    this.taskManager = taskManager;
  }

  suggestPriorities() {
    // Simple logic: tasks closer to deadline and not completed get higher priority
    const now = new Date();
    return this.taskManager.getAllTasks().map(task => {
      if (task.status === 'Completed') return task;
      if (!task.deadline) return task;
      const timeLeft = new Date(task.deadline) - now;
      if (timeLeft < 0) {
        task.priority = 'High';
      } else if (timeLeft < 2 * 24 * 60 * 60 * 1000) {
        task.priority = 'High';
      } else if (timeLeft < 7 * 24 * 60 * 60 * 1000) {
        task.priority = 'Medium';
      } else {
        task.priority = 'Low';
      }
      return task;
    });
  }

  suggestNextTask() {
    // Suggest the highest priority, earliest deadline, not completed
    const tasks = this.taskManager.getAllTasks().filter(t => t.status !== 'Completed');
    tasks.sort((a, b) => {
      const prio = {High: 3, Medium: 2, Low: 1};
      if (prio[b.priority] !== prio[a.priority]) {
        return prio[b.priority] - prio[a.priority];
      }
      return new Date(a.deadline || Infinity) - new Date(b.deadline || Infinity);
    });
    return tasks[0] || null;
  }
}

// =====================
// Calendar & Timeline
// =====================
class CalendarView {
  constructor(taskManager) {
    this.taskManager = taskManager;
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    const tasks = this.taskManager.getAllTasks();
    // Simple calendar: group by date
    const grouped = {};
    tasks.forEach(task => {
      const date = task.deadline ? new Date(task.deadline).toDateString() : 'No Deadline';
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(task);
    });
    for (const date in grouped) {
      const section = document.createElement('div');
      section.className = 'calendar-section';
      section.innerHTML = `<h4>${date}</h4>`;
      grouped[date].forEach(task => {
        const item = document.createElement('div');
        item.className = 'calendar-task';
        item.innerHTML = `<b>${task.title}</b> [${task.priority}] <span>${task.status}</span>`;
        section.appendChild(item);
      });
      container.appendChild(section);
    }
  }
}

// =====================
// Collaboration (Basic)
// =====================
class Collaboration {
  constructor(taskManager) {
    this.taskManager = taskManager;
    this.users = ['You', 'Alice', 'Bob', 'Charlie']; // Example users
  }

  assignTask(taskId, user) {
    const task = this.taskManager.getTask(taskId);
    if (task && !task.assignedTo.includes(user)) {
      task.assignedTo.push(user);
      this.taskManager.save();
    }
  }

  addComment(taskId, user, comment) {
    const task = this.taskManager.getTask(taskId);
    if (task) {
      task.comments.push({user, comment, date: new Date()});
      this.taskManager.save();
    }
  }

  shareFile(taskId, user, fileName) {
    const task = this.taskManager.getTask(taskId);
    if (task) {
      task.files.push({user, fileName, date: new Date()});
      this.taskManager.save();
    }
  }
}

// =====================
// Analytics
// =====================
class Analytics {
  constructor(taskManager) {
    this.taskManager = taskManager;
  }

  getProgress() {
    const tasks = this.taskManager.getAllTasks();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }

  getProductivityReport() {
    const tasks = this.taskManager.getAllTasks();
    const byUser = {};
    tasks.forEach(task => {
      (task.assignedTo || ['Unassigned']).forEach(user => {
        if (!byUser[user]) byUser[user] = {completed: 0, total: 0};
        byUser[user].total++;
        if (task.status === 'Completed') byUser[user].completed++;
      });
    });
    return byUser;
  }
}

// =====================
// Notifications (Simulated)
// =====================
class Notifier {
  static notify(message) {
    // Simulate push notification
    alert('🔔 ' + message);
  }

  static email(to, subject, body) {
    // Simulate email (in real app, integrate with backend)
    console.log(`Email to ${to}: ${subject}\n${body}`);
  }
}

// =====================
// UI Rendering
// =====================
class UI {
  constructor(taskManager, suggestionEngine, calendarView, collaboration, analytics) {
    this.taskManager = taskManager;
    this.suggestionEngine = suggestionEngine;
    this.calendarView = calendarView;
    this.collaboration = collaboration;
    this.analytics = analytics;
    this.init();
  }

  init() {
    this.renderTaskList();
    this.renderAnalytics();
    this.calendarView.render('calendar-container');
    this.bindEvents();
  }

  renderTaskList() {
    const container = document.getElementById('task-list');
    if (!container) return;
    container.innerHTML = '';
    const tasks = this.taskManager.getAllTasks();
    tasks.forEach(task => {
      const div = document.createElement('div');
      div.className = 'task-item';
      div.innerHTML = `
        <b>${task.title}</b> <span>[${task.priority}]</span> <span>${task.status}</span><br>
        <small>Deadline: ${task.deadline ? Utils.formatDate(task.deadline) : 'None'}</small><br>
        <button data-id="${task.id}" class="edit-btn">Edit</button>
        <button data-id="${task.id}" class="delete-btn">Delete</button>
        <button data-id="${task.id}" class="complete-btn">Complete</button>
      `;
      container.appendChild(div);
    });
  }

  renderAnalytics() {
    const progress = this.analytics.getProgress();
    const report = this.analytics.getProductivityReport();
    const container = document.getElementById('analytics');
    if (!container) return;
    container.innerHTML = `<b>Progress:</b> ${progress}%<br>`;
    for (const user in report) {
      container.innerHTML += `${user}: ${report[user].completed}/${report[user].total} completed<br>`;
    }
  }

  bindEvents() {
    // Add Task
    const addBtn = document.getElementById('add-task-btn');
    if (addBtn) {
      addBtn.onclick = () => {
        const title = prompt('Task Title:');
        if (!title) return;
        const description = prompt('Description:');
        const deadline = prompt('Deadline (YYYY-MM-DD HH:MM):');
        const priority = prompt('Priority (Low, Medium, High):', 'Medium');
        this.taskManager.createTask({title, description, deadline, priority});
        this.renderTaskList();
        this.calendarView.render('calendar-container');
        this.renderAnalytics();
      };
    }

    // Task Actions
    const container = document.getElementById('task-list');
    if (container) {
      container.onclick = (e) => {
        const target = e.target;
        if (target.classList.contains('edit-btn')) {
          const id = target.getAttribute('data-id');
          const task = this.taskManager.getTask(id);
          if (task) {
            const title = prompt('Edit Title:', task.title);
            const description = prompt('Edit Description:', task.description);
            const deadline = prompt('Edit Deadline (YYYY-MM-DD HH:MM):', task.deadline);
            const priority = prompt('Edit Priority (Low, Medium, High):', task.priority);
            this.taskManager.editTask(id, {title, description, deadline, priority});
            this.renderTaskList();
            this.calendarView.render('calendar-container');
            this.renderAnalytics();
          }
        } else if (target.classList.contains('delete-btn')) {
          const id = target.getAttribute('data-id');
          if (confirm('Delete this task?')) {
            this.taskManager.deleteTask(id);
            this.renderTaskList();
            this.calendarView.render('calendar-container');
            this.renderAnalytics();
          }
        } else if (target.classList.contains('complete-btn')) {
          const id = target.getAttribute('data-id');
          this.taskManager.editTask(id, {status: 'Completed'});
          this.renderTaskList();
          this.calendarView.render('calendar-container');
          this.renderAnalytics();
          Notifier.notify('Task marked as completed!');
        }
      };
    }
  }
}

// =====================
// Main App Initialization
// =====================
window.addEventListener('DOMContentLoaded', () => {
  const taskManager = new TaskManager();
  const suggestionEngine = new SuggestionEngine(taskManager);
  const calendarView = new CalendarView(taskManager);
  const collaboration = new Collaboration(taskManager);
  const analytics = new Analytics(taskManager);
  const ui = new UI(taskManager, suggestionEngine, calendarView, collaboration, analytics);

  // Smart Suggestions Example
  document.getElementById('suggest-btn')?.addEventListener('click', () => {
    suggestionEngine.suggestPriorities();
    ui.renderTaskList();
    Notifier.notify('Smart suggestions applied!');
  });

  // Example: Assign task (simulate team collaboration)
  document.getElementById('assign-btn')?.addEventListener('click', () => {
    const taskId = prompt('Task ID to assign:');
    const user = prompt('Assign to (You, Alice, Bob, Charlie):', 'You');
    if (taskId && user) {
      collaboration.assignTask(taskId, user);
      ui.renderTaskList();
      Notifier.notify(`Task assigned to ${user}`);
    }
  });

  // Example: Add comment
  document.getElementById('comment-btn')?.addEventListener('click', () => {
    const taskId = prompt('Task ID to comment on:');
    const user = prompt('Your name:', 'You');
    const comment = prompt('Comment:');
    if (taskId && user && comment) {
      collaboration.addComment(taskId, user, comment);
      Notifier.notify('Comment added!');
    }
  });

  // Example: Share file
  document.getElementById('share-btn')?.addEventListener('click', () => {
    const taskId = prompt('Task ID to share file:');
    const user = prompt('Your name:', 'You');
    const fileName = prompt('File name:');
    if (taskId && user && fileName) {
      collaboration.shareFile(taskId, user, fileName);
      Notifier.notify('File shared!');
    }
  });
});
// TaskFlow - Smart Task Organizer
const taskNameInput = document.getElementById('taskName');
const taskDeadlineInput = document.getElementById('taskDeadline');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasks');
const analyticsContent = document.getElementById('analyticsContent');
const taskPriorityInput = document.getElementById('taskPriority');
const suggestionBox = document.getElementById('suggestionBox');
const suggestTaskBtn = document.getElementById('suggestTaskBtn');

let tasks = [];

function renderTasks() {
  tasksList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = `${task.completed ? 'completed' : ''} ${task.priority}`;
    li.innerHTML = `
      <span>${task.name} <small>(${task.deadline})</small> <span class="priority-tag">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></span>
      <div>
        <button onclick="toggleComplete(${idx})">${task.completed ? 'Undo' : 'Done'}</button>
        <button onclick="deleteTask(${idx})">Delete</button>
      </div>
    `;
    tasksList.appendChild(li);
  });
  renderAnalytics();
}

function addTask() {
  const name = taskNameInput.value.trim();
  const deadline = taskDeadlineInput.value;
  const priority = taskPriorityInput.value;
  if (!name || !deadline) return;
  tasks.push({ name, deadline, completed: false, priority });
  taskNameInput.value = '';
  taskDeadlineInput.value = '';
  taskPriorityInput.value = 'normal';
  renderTasks();
}

function deleteTask(idx) {
  tasks.splice(idx, 1);
  renderTasks();
}

function toggleComplete(idx) {
  tasks[idx].completed = !tasks[idx].completed;
  renderTasks();
}

function renderAnalytics() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const high = tasks.filter(t => t.priority === 'high').length;
  const low = tasks.filter(t => t.priority === 'low').length;
  analyticsContent.innerHTML = `
    <p>Total Tasks: <strong>${total}</strong></p>
    <p>Completed Tasks: <strong>${completed}</strong></p>
    <p>High Priority Tasks: <strong>${high}</strong></p>
    <p>Low Priority Tasks: <strong>${low}</strong></p>
    <p>Completion Rate: <strong>${total ? Math.round((completed/total)*100) : 0}%</strong></p>
  `;
}

// Smart suggestion: suggest a task based on incomplete high priority or deadline
function suggestTask() {
  if (tasks.length === 0) {
    suggestionBox.textContent = 'No tasks found. Add a task to get suggestions!';
    return;
  }
  // Find high priority incomplete tasks
  const highPriority = tasks.filter(t => !t.completed && t.priority === 'high');
  if (highPriority.length > 0) {
    suggestionBox.textContent = `Focus on: "${highPriority[0].name}" (High Priority)`;
    return;
  }
  // Find task with nearest deadline
  const incomplete = tasks.filter(t => !t.completed);
  if (incomplete.length > 0) {
    incomplete.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    suggestionBox.textContent = `Next up: "${incomplete[0].name}" (Due: ${incomplete[0].deadline})`;
    return;
  }
  suggestionBox.textContent = 'All tasks completed! Great job!';
}

suggestTaskBtn.addEventListener('click', suggestTask);
addTaskBtn.addEventListener('click', addTask);
renderTasks();