// DOM Elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const addItemBtn = document.getElementById('addItemBtn');
const resetBtn = document.getElementById('resetBtn');
const bulkCompleteBtn = document.getElementById('bulkCompleteBtn');
const addFirstItemBtn = document.getElementById('addFirstItemBtn');
const viewButtons = document.querySelectorAll('.view-btn');
const filterSelect = document.getElementById('filterSelect');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const boardView = document.getElementById('boardView');
const listView = document.getElementById('listView');
const emptyState = document.getElementById('emptyState');
const addItemModal = document.getElementById('addItemModal');
const settingsModal = document.getElementById('settingsModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const confirmAddBtn = document.getElementById('confirmAddBtn');
const closeModalBtn = document.querySelector('.close-modal');
const closeSettingsBtn = document.querySelector('.close-settings');
const itemTitleInput = document.getElementById('itemTitle');
const itemDescriptionInput = document.getElementById('itemDescription');
const taskStatusSelect = document.getElementById('taskStatus');
const priorityButtons = document.querySelectorAll('.priority-btn');
const dueDateInput = document.getElementById('dueDate');
const labelOptions = document.querySelectorAll('.label-option');
const filterChips = document.querySelectorAll('.filter-chip');
const settingsBtn = document.getElementById('settingsBtn');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const clearDataBtn = document.getElementById('clearDataBtn');
const backupDataBtn = document.getElementById('backupDataBtn');
const currentYearEl = document.getElementById('currentYear');

// Column elements
const pendingColumn = document.getElementById('pendingColumn');
const progressColumn = document.getElementById('progressColumn');
const reviewColumn = document.getElementById('reviewColumn');
const completedColumn = document.getElementById('completedColumn');
const pendingCount = document.getElementById('pendingCount');
const progressCount = document.getElementById('progressCount');
const reviewCount = document.getElementById('reviewCount');
const completedCount = document.getElementById('completedCount');

// Analytics elements
const highPriorityCountEl = document.getElementById('highPriorityCount');
const overdueCountEl = document.getElementById('overdueCount');
const todayCountEl = document.getElementById('todayCount');
const progressPercentageEl = document.getElementById('progressPercentage');
const activityFeedEl = document.getElementById('activityFeed');
const listItemsEl = document.getElementById('listItems');

// App State
let tasks = [];
let currentPriority = 'medium';
let selectedLabels = [];
let currentView = 'board';
let currentFilter = 'all';
let draggedTask = null;
let draggedColumn = null;
let activityLog = [];

// Default tasks for reset
const defaultTasks = [
    {
        id: 1,
        title: 'Design Dashboard UI',
        description: 'Create wireframes and mockups for new dashboard',
        status: 'pending',
        priority: 'high',
        dueDate: '2024-01-25',
        labels: ['work', 'design'],
        completed: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
    },
    {
        id: 2,
        title: 'Implement Drag & Drop',
        description: 'Add drag and drop functionality to task cards',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2024-01-24',
        labels: ['work', 'feature'],
        completed: false,
        createdAt: '2024-01-19',
        updatedAt: '2024-01-20'
    },
    {
        id: 3,
        title: 'Fix Mobile Responsiveness',
        description: 'Address layout issues on mobile devices',
        status: 'review',
        priority: 'medium',
        dueDate: '2024-01-23',
        labels: ['work', 'bug'],
        completed: false,
        createdAt: '2024-01-18',
        updatedAt: '2024-01-19'
    },
    {
        id: 4,
        title: 'Write Documentation',
        description: 'Document API endpoints and usage',
        status: 'completed',
        priority: 'low',
        dueDate: '2024-01-22',
        labels: ['work'],
        completed: true,
        createdAt: '2024-01-17',
        updatedAt: '2024-01-21'
    },
    {
        id: 5,
        title: 'Plan Team Meeting',
        description: 'Prepare agenda and materials for weekly meeting',
        status: 'pending',
        priority: 'medium',
        dueDate: '2024-01-22',
        labels: ['work'],
        completed: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
    },
    {
        id: 6,
        title: 'Grocery Shopping',
        description: 'Buy essentials for the week',
        status: 'pending',
        priority: 'low',
        dueDate: '2024-01-21',
        labels: ['personal'],
        completed: false,
        createdAt: '2024-01-20',
        updatedAt: '2024-01-20'
    }
];

// Initialize the app
function init() {
    loadTasks();
    loadSettings();
    loadActivityLog();
    setCurrentYear();
    setupEventListeners();
    renderBoard();
    updateStats();
    updateEmptyState();
    renderActivityLog();
    
    // Set default date to today
    dueDateInput.valueAsDate = new Date();
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('taskBoardTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    } else {
        tasks = [...defaultTasks];
        saveTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('taskBoardTasks', JSON.stringify(tasks));
    updateStats();
    updateEmptyState();
}

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('taskBoardSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('autoSave').checked = settings.autoSave ?? true;
        document.getElementById('showAnimations').checked = settings.showAnimations ?? true;
        document.getElementById('confirmDeletion').checked = settings.confirmDeletion ?? false;
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        autoSave: document.getElementById('autoSave').checked,
        showAnimations: document.getElementById('showAnimations').checked,
        confirmDeletion: document.getElementById('confirmDeletion').checked
    };
    localStorage.setItem('taskBoardSettings', JSON.stringify(settings));
}

// Load activity log from localStorage
function loadActivityLog() {
    const savedActivity = localStorage.getItem('taskBoardActivity');
    if (savedActivity) {
        activityLog = JSON.parse(savedActivity);
    }
}

// Save activity log to localStorage
function saveActivityLog() {
    // Keep only last 50 activities
    if (activityLog.length > 50) {
        activityLog = activityLog.slice(-50);
    }
    localStorage.setItem('taskBoardActivity', JSON.stringify(activityLog));
}

// Add activity to log
function addActivity(action, taskTitle = '') {
    const activity = {
        id: Date.now(),
        action,
        taskTitle,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    activityLog.unshift(activity);
    saveActivityLog();
    renderActivityLog();
}

// Render board view
function renderBoard() {
    clearColumns();
    
    // Filter tasks based on current filter
    const filteredTasks = filterTasks(tasks);
    
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        const column = getColumnByStatus(task.status);
        if (column) {
            column.appendChild(taskCard);
        }
    });
    
    updateColumnCounts();
}

// Clear all columns
function clearColumns() {
    pendingColumn.innerHTML = '';
    progressColumn.innerHTML = '';
    reviewColumn.innerHTML = '';
    completedColumn.innerHTML = '';
}

// Get column by status
function getColumnByStatus(status) {
    switch (status) {
        case 'pending': return pendingColumn;
        case 'in-progress': return progressColumn;
        case 'review': return reviewColumn;
        case 'completed': return completedColumn;
        default: return pendingColumn;
    }
}

// Create task card element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.setAttribute('data-id', task.id);
    card.setAttribute('data-priority', task.priority);
    card.setAttribute('draggable', 'true');
    
    // Calculate due date status
    const dueStatus = getDueStatus(task.dueDate);
    
    card.innerHTML = `
        <div class="task-actions">
            <button class="task-action-btn delete-task" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="task-title">${task.title}</div>
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        <div class="task-meta">
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
            ${task.dueDate ? `
                <div class="task-due ${dueStatus}">
                    <i class="far fa-calendar"></i>
                    ${formatDueDate(task.dueDate)}
                </div>
            ` : ''}
        </div>
        ${task.labels && task.labels.length > 0 ? `
            <div class="task-labels">
                ${task.labels.map(label => `<span class="task-label">${label}</span>`).join('')}
            </div>
        ` : ''}
    `;
    
    // Add event listeners
    setupTaskCardListeners(card, task);
    
    return card;
}

// Setup task card event listeners
function setupTaskCardListeners(card, task) {
    // Drag events
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);
    
    // Delete button
    const deleteBtn = card.querySelector('.delete-task');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });
    
    // Click to edit
    card.addEventListener('dblclick', () => openEditModal(task));
    
    // Hover effect for actions
    card.addEventListener('mouseenter', () => {
        card.querySelector('.task-actions').style.opacity = '1';
    });
    
    card.addEventListener('mouseleave', () => {
        card.querySelector('.task-actions').style.opacity = '0';
    });
}

// Update column counts
function updateColumnCounts() {
    const pending = tasks.filter(t => t.status === 'pending').length;
    const progress = tasks.filter(t => t.status === 'in-progress').length;
    const review = tasks.filter(t => t.status === 'review').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    
    pendingCount.textContent = pending;
    progressCount.textContent = progress;
    reviewCount.textContent = review;
    completedCount.textContent = completed;
}

// Render list view
function renderListView() {
    listItemsEl.innerHTML = '';
    
    // Filter and sort tasks
    const filteredTasks = filterTasks(tasks);
    const sortedTasks = sortTasks(filteredTasks);
    
    if (sortedTasks.length === 0) {
        listItemsEl.innerHTML = `
            <div class="empty-list">
                <i class="fas fa-search"></i>
                <p>No tasks found</p>
            </div>
        `;
        return;
    }
    
    sortedTasks.forEach(task => {
        const listItem = createListItem(task);
        listItemsEl.appendChild(listItem);
    });
}

// Create list item element
function createListItem(task) {
    const row = document.createElement('div');
    row.className = 'list-item-row';
    
    const dueStatus = getDueStatus(task.dueDate);
    const formattedDue = task.dueDate ? formatDueDate(task.dueDate) : 'No due date';
    
    row.innerHTML = `
        <div class="list-item-cell">
            <div class="list-item-title">${task.title}</div>
            ${task.description ? `<div class="list-item-description">${task.description}</div>` : ''}
        </div>
        <div class="list-item-cell">
            <span class="task-priority priority-${task.priority}">${task.priority}</span>
        </div>
        <div class="list-item-cell">
            <span class="task-status status-${task.status}">${formatStatus(task.status)}</span>
        </div>
        <div class="list-item-cell">
            <span class="task-due ${dueStatus}">${formattedDue}</span>
        </div>
        <div class="list-item-cell">
            <div class="list-item-actions">
                <button class="action-btn edit-task" data-id="${task.id}" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-task" data-id="${task.id}" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="action-btn complete-task" data-id="${task.id}" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                    <i class="fas fa-${task.completed ? 'undo' : 'check'}"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const editBtn = row.querySelector('.edit-task');
    const deleteBtn = row.querySelector('.delete-task');
    const completeBtn = row.querySelector('.complete-task');
    
    editBtn.addEventListener('click', () => openEditModal(task));
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    completeBtn.addEventListener('click', () => toggleComplete(task.id));
    
    return row;
}

// Update statistics
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const highPriority = tasks.filter(t => t.priority === 'high').length;
    const overdue = tasks.filter(t => isOverdue(t.dueDate)).length;
    const today = tasks.filter(t => isDueToday(t.dueDate)).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    highPriorityCountEl.textContent = highPriority;
    overdueCountEl.textContent = overdue;
    todayCountEl.textContent = today;
    progressPercentageEl.textContent = `${progress}%`;
}

// Update empty state
function updateEmptyState() {
    if (tasks.length === 0) {
        emptyState.classList.add('active');
        boardView.classList.remove('active');
        listView.classList.remove('active');
    } else {
        emptyState.classList.remove('active');
        if (currentView === 'board') {
            boardView.classList.add('active');
        } else {
            listView.classList.add('active');
        }
    }
}

// Render activity log
function renderActivityLog() {
    activityFeedEl.innerHTML = '';
    
    if (activityLog.length === 0) {
        activityFeedEl.innerHTML = '<p class="no-activity">No recent activity</p>';
        return;
    }
    
    activityLog.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        let icon = 'fas fa-plus';
        if (activity.action.includes('deleted')) icon = 'fas fa-trash';
        else if (activity.action.includes('completed')) icon = 'fas fa-check';
        else if (activity.action.includes('moved')) icon = 'fas fa-arrows-alt-h';
        
        activityItem.innerHTML = `
            <i class="${icon}"></i>
            <div>
                <div>${activity.action}</div>
                <small>${activity.time}</small>
            </div>
        `;
        
        activityFeedEl.appendChild(activityItem);
    });
}

// Task CRUD Operations
function addTask(title, description, status, priority, dueDate, labels) {
    const newTask = {
        id: Date.now(),
        title,
        description,
        status: status || 'pending',
        priority,
        dueDate,
        labels,
        completed: status === 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    tasks.unshift(newTask);
    saveTasks();
    
    if (currentView === 'board') {
        renderBoard();
    } else {
        renderListView();
    }
    
    addActivity(`Added task: ${title}`);
    
    return newTask;
}

function deleteTask(id) {
    const shouldConfirm = document.getElementById('confirmDeletion').checked;
    
    if (shouldConfirm && !confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    const deletedTask = tasks[taskIndex];
    tasks.splice(taskIndex, 1);
    
    saveTasks();
    
    if (currentView === 'board') {
        renderBoard();
    } else {
        renderListView();
    }
    
    addActivity(`Deleted task: ${deletedTask.title}`);
}

function updateTask(id, updates) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;
    
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    
    // Update completed status based on column
    if (updates.status === 'completed') {
        tasks[taskIndex].completed = true;
    } else if (tasks[taskIndex].completed && updates.status !== 'completed') {
        tasks[taskIndex].completed = false;
    }
    
    saveTasks();
    
    if (currentView === 'board') {
        renderBoard();
    } else {
        renderListView();
    }
    
    addActivity(`Updated task: ${tasks[taskIndex].title}`);
}

function toggleComplete(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const completed = !task.completed;
    const status = completed ? 'completed' : 'pending';
    
    updateTask(id, { completed, status });
}

// Drag and Drop Functions
function handleDragStart(e) {
    draggedTask = this;
    draggedColumn = this.closest('.board-column');
    
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remove drop indicators
    document.querySelectorAll('.board-column').forEach(col => {
        col.classList.remove('drag-over');
    });
}

// Column drag events setup
function setupColumnDragEvents() {
    const columns = document.querySelectorAll('.board-column');
    
    columns.forEach(column => {
        const columnContent = column.querySelector('.column-content');
        
        columnContent.addEventListener('dragover', (e) => {
            e.preventDefault();
            column.classList.add('drag-over');
        });
        
        columnContent.addEventListener('dragleave', (e) => {
            if (!columnContent.contains(e.relatedTarget)) {
                column.classList.remove('drag-over');
            }
        });
        
        columnContent.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');
            
            if (draggedTask && draggedColumn !== column) {
                const taskId = parseInt(draggedTask.getAttribute('data-id'));
                const newStatus = column.getAttribute('data-status');
                
                updateTask(taskId, { status: newStatus });
                addActivity(`Moved task to ${formatStatus(newStatus)}`);
            }
        });
    });
}

// Filter and Sort Functions
function filterTasks(taskList) {
    const filter = currentFilter;
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    return taskList.filter(task => {
        // Apply search filter
        if (searchTerm && !task.title.toLowerCase().includes(searchTerm) && 
            !task.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Apply status filter
        switch (filter) {
            case 'pending':
                return task.status === 'pending';
            case 'completed':
                return task.status === 'completed';
            case 'high':
                return task.priority === 'high';
            case 'today':
                return isDueToday(task.dueDate);
            case 'overdue':
                return isOverdue(task.dueDate);
            default:
                return true;
        }
    });
}

function sortTasks(taskList) {
    const sortBy = sortSelect ? sortSelect.value : 'priority';
    
    return [...taskList].sort((a, b) => {
        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            case 'date':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'status':
                const statusOrder = { 'pending': 0, 'in-progress': 1, 'review': 2, 'completed': 3 };
                return statusOrder[a.status] - statusOrder[b.status];
            default:
                return 0;
        }
    });
}

// Utility Functions
function getDueStatus(dueDate) {
    if (!dueDate) return '';
    if (isOverdue(dueDate)) return 'overdue';
    if (isDueToday(dueDate)) return 'today';
    return '';
}

function isOverdue(dueDate) {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due < today;
}

function isDueToday(dueDate) {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    return due.getTime() === today.getTime();
}

function formatDueDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in-progress': 'In Progress',
        'review': 'Review',
        'completed': 'Completed'
    };
    return statusMap[status] || status;
}

function setCurrentYear() {
    currentYearEl.textContent = new Date().getFullYear();
}

// Modal Functions
function openAddModal(status = 'pending') {
    // Reset form
    itemTitleInput.value = '';
    itemDescriptionInput.value = '';
    taskStatusSelect.value = status;
    setPriority('medium');
    selectedLabels = [];
    
    // Update label selection
    labelOptions.forEach(label => {
        label.classList.remove('selected');
    });
    
    // Show modal
    addItemModal.style.display = 'flex';
    itemTitleInput.focus();
}

function openEditModal(task) {
    // Fill form with task data
    itemTitleInput.value = task.title;
    itemDescriptionInput.value = task.description || '';
    taskStatusSelect.value = task.status;
    setPriority(task.priority);
    dueDateInput.value = task.dueDate || '';
    
    // Set labels
    selectedLabels = [...(task.labels || [])];
    labelOptions.forEach(label => {
        if (selectedLabels.includes(label.dataset.label)) {
            label.classList.add('selected');
        } else {
            label.classList.remove('selected');
        }
    });
    
    // Change modal title
    document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-edit"></i> Edit Task';
    
    // Update confirm button
    confirmAddBtn.textContent = 'Update Task';
    confirmAddBtn.onclick = () => confirmUpdate(task.id);
    
    // Show modal
    addItemModal.style.display = 'flex';
}

function confirmUpdate(taskId) {
    const title = itemTitleInput.value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    const updates = {
        title,
        description: itemDescriptionInput.value.trim(),
        status: taskStatusSelect.value,
        priority: currentPriority,
        dueDate: dueDateInput.value || null,
        labels: selectedLabels
    };
    
    updateTask(taskId, updates);
    closeModal();
}

function closeModal() {
    addItemModal.style.display = 'none';
    document.querySelector('.modal-header h3').innerHTML = '<i class="fas fa-plus-circle"></i> Create New Task';
    confirmAddBtn.textContent = 'Create Task';
    confirmAddBtn.onclick = confirmAdd;
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function confirmAdd() {
    const title = itemTitleInput.value.trim();
    if (!title) {
        alert('Please enter a task title');
        return;
    }
    
    addTask(
        title,
        itemDescriptionInput.value.trim(),
        taskStatusSelect.value,
        currentPriority,
        dueDateInput.value || null,
        selectedLabels
    );
    
    closeModal();
}

function setPriority(priority) {
    currentPriority = priority;
    priorityButtons.forEach(btn => {
        if (btn.dataset.priority === priority) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Add task buttons
    addItemBtn.addEventListener('click', () => openAddModal());
    addFirstItemBtn.addEventListener('click', () => openAddModal());
    
    // Add to column buttons
    document.querySelectorAll('.add-to-column').forEach(btn => {
        btn.addEventListener('click', () => {
            const column = btn.dataset.column;
            openAddModal(column);
        });
    });
    
    // Reset button
    resetBtn.addEventListener('click', () => {
        if (confirm('Reset all tasks to default? Current tasks will be lost.')) {
            tasks = [...defaultTasks];
            saveTasks();
            renderBoard();
            addActivity('Reset board to default tasks');
        }
    });
    
    // Bulk complete
    bulkCompleteBtn.addEventListener('click', () => {
        tasks.forEach(task => {
            if (!task.completed) {
                task.completed = true;
                task.status = 'completed';
            }
        });
        saveTasks();
        renderBoard();
        addActivity('Marked all tasks as complete');
    });
    
    // View toggle
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            currentView = view;
            
            viewButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            boardView.classList.remove('active');
            listView.classList.remove('active');
            
            if (view === 'board') {
                boardView.classList.add('active');
                renderBoard();
            } else {
                listView.classList.add('active');
                renderListView();
            }
        });
    });
    
    // Filter and search
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            if (currentView === 'board') {
                renderBoard();
            } else {
                renderListView();
            }
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (currentView === 'board') {
                renderBoard();
            } else {
                renderListView();
            }
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (currentView === 'list') {
                renderListView();
            }
        });
    }
    
    // Filter chips
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const filter = chip.dataset.filter;
            currentFilter = filter;
            
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            if (filterSelect) filterSelect.value = filter;
            
            if (currentView === 'board') {
                renderBoard();
            } else {
                renderListView();
            }
        });
    });
    
    // Modal buttons
    confirmAddBtn.addEventListener('click', confirmAdd);
    cancelAddBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Priority buttons
    priorityButtons.forEach(btn => {
        btn.addEventListener('click', () => setPriority(btn.dataset.priority));
    });
    
    // Label selection
    labelOptions.forEach(label => {
        label.addEventListener('click', () => {
            const labelValue = label.dataset.label;
            if (label.classList.contains('selected')) {
                label.classList.remove('selected');
                selectedLabels = selectedLabels.filter(l => l !== labelValue);
            } else {
                label.classList.add('selected');
                selectedLabels.push(labelValue);
            }
        });
    });
    
    // Settings
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'flex';
    });
    
    closeSettingsBtn.addEventListener('click', closeSettings);
    
    // Data management
    exportBtn.addEventListener('click', exportData);
    importBtn.addEventListener('click', importData);
    clearDataBtn.addEventListener('click', clearAllData);
    backupDataBtn.addEventListener('click', backupData);
    
    // Settings checkboxes
    document.getElementById('autoSave').addEventListener('change', saveSettings);
    document.getElementById('showAnimations').addEventListener('change', saveSettings);
    document.getElementById('confirmDeletion').addEventListener('change', saveSettings);
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addItemModal) closeModal();
        if (e.target === settingsModal) closeSettings();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N to add new task
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openAddModal();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (addItemModal.style.display === 'flex') closeModal();
            if (settingsModal.style.display === 'flex') closeSettings();
        }
    });
    
    // Setup column drag events after a brief delay
    setTimeout(setupColumnDragEvents, 100);
}

// Data Management Functions
function exportData() {
    const data = {
        tasks,
        activityLog,
        version: '1.0',
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-board-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (confirm('Import tasks? Current tasks will be replaced.')) {
                    tasks = data.tasks || [];
                    activityLog = data.activityLog || [];
                    saveTasks();
                    saveActivityLog();
                    
                    if (currentView === 'board') {
                        renderBoard();
                    } else {
                        renderListView();
                    }
                    
                    addActivity('Imported tasks from backup');
                    alert('Data imported successfully!');
                }
            } catch (error) {
                alert('Error importing data: Invalid file format');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

function clearAllData() {
    if (confirm('Clear all tasks and activity log? This cannot be undone.')) {
        tasks = [];
        activityLog = [];
        saveTasks();
        saveActivityLog();
        
        if (currentView === 'board') {
            renderBoard();
        } else {
            renderListView();
        }
        
        addActivity('Cleared all data');
    }
}

function backupData() {
    saveTasks();
    saveActivityLog();
    addActivity('Created manual backup');
    alert('Backup created successfully!');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);