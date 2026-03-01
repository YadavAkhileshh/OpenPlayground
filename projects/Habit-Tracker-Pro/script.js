/**
 * Habit Tracker Pro - Complete JavaScript Implementation
 * Features: Habit management, streak tracking, analytics, goals, export functionality
 */

// Global variables and data structures
let habits = [];
let goals = [];
let currentDate = new Date();
let currentView = 'today';
let selectedHabit = null;
let theme = localStorage.getItem('theme') || 'light';

// DOM elements
const elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    loadData();
    setupEventListeners();
    renderAll();
    updateProductivityScore();
});

// Initialize DOM elements
function initializeElements() {
    elements = {
        // Navigation
        themeToggle: document.getElementById('theme-toggle'),
        exportBtn: document.getElementById('export-btn'),

        // Header
        productivityScore: document.getElementById('productivity-score'),

        // Today's Habits
        currentDate: document.getElementById('current-date'),
        prevDate: document.getElementById('prev-date'),
        nextDate: document.getElementById('next-date'),
        habitsGrid: document.getElementById('habits-grid'),

        // Habits Overview
        habitsFilter: document.getElementById('habits-filter'),
        habitsList: document.getElementById('habits-list'),

        // Streaks
        streaksGrid: document.getElementById('streaks-grid'),

        // Analytics
        analyticsTabs: document.querySelectorAll('.analytics-tab'),
        chartsContainer: document.getElementById('charts-container'),
        insightsList: document.getElementById('insights-list'),

        // Goals
        goalsGrid: document.getElementById('goals-grid'),

        // Modals
        modals: {
            createHabit: document.getElementById('create-habit-modal'),
            editHabit: document.getElementById('edit-habit-modal'),
            createGoal: document.getElementById('create-goal-modal'),
            analytics: document.getElementById('analytics-modal'),
            export: document.getElementById('export-modal')
        },

        // Forms
        habitForm: document.getElementById('habit-form'),
        goalForm: document.getElementById('goal-form'),

        // Loading and toast
        loadingOverlay: document.getElementById('loading-overlay'),
        toastContainer: document.getElementById('toast-container')
    };
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.exportBtn.addEventListener('click', () => showModal('export'));

    // Date navigation
    elements.prevDate.addEventListener('click', () => navigateDate(-1));
    elements.nextDate.addEventListener('click', () => navigateDate(1));

    // Habit filters
    elements.habitsFilter.addEventListener('click', handleFilterClick);

    // Analytics tabs
    elements.analyticsTabs.forEach(tab => {
        tab.addEventListener('click', () => switchAnalyticsTab(tab.dataset.tab));
    });

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => hideAllModals());
    });

    // Modal overlays
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideAllModals();
        });
    });

    // Forms
    elements.habitForm.addEventListener('submit', handleHabitSubmit);
    elements.goalForm.addEventListener('submit', handleGoalSubmit);

    // Quick actions
    document.getElementById('create-habit-btn').addEventListener('click', () => showModal('createHabit'));
    document.getElementById('create-goal-btn').addEventListener('click', () => showModal('createGoal'));
    document.getElementById('view-analytics-btn').addEventListener('click', () => showModal('analytics'));

    // Export options
    document.getElementById('export-json').addEventListener('click', () => exportData('json'));
    document.getElementById('export-csv').addEventListener('click', () => exportData('csv'));
    document.getElementById('export-pdf').addEventListener('click', () => exportData('pdf'));
}

// Data management
function loadData() {
    habits = JSON.parse(localStorage.getItem('habits')) || [];
    goals = JSON.parse(localStorage.getItem('goals')) || [];

    // Ensure habits have proper structure
    habits = habits.map(habit => ({
        id: habit.id || generateId(),
        name: habit.name || '',
        description: habit.description || '',
        icon: habit.icon || 'fas fa-star',
        color: habit.color || '#10b981',
        frequency: habit.frequency || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        target: habit.target || 1,
        unit: habit.unit || 'times',
        category: habit.category || 'general',
        createdAt: habit.createdAt || new Date().toISOString(),
        completedDates: habit.completedDates || [],
        streak: habit.streak || 0,
        longestStreak: habit.longestStreak || 0,
        totalCompletions: habit.totalCompletions || 0
    }));

    // Ensure goals have proper structure
    goals = goals.map(goal => ({
        id: goal.id || generateId(),
        title: goal.title || '',
        description: goal.description || '',
        target: goal.target || 1,
        current: goal.current || 0,
        unit: goal.unit || 'completions',
        deadline: goal.deadline || '',
        habitId: goal.habitId || null,
        completed: goal.completed || false,
        createdAt: goal.createdAt || new Date().toISOString()
    }));

    saveData();
}

function saveData() {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getDateString(date) {
    return date.toISOString().split('T')[0];
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// Theme management
function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    elements.themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

// Initialize theme
document.documentElement.setAttribute('data-theme', theme);
elements.themeToggle.innerHTML = theme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';

// Date navigation
function navigateDate(direction) {
    currentDate.setDate(currentDate.getDate() + direction);
    renderTodaysHabits();
    updateCurrentDateDisplay();
}

// Habit management
function createHabit(habitData) {
    const habit = {
        id: generateId(),
        name: habitData.name,
        description: habitData.description,
        icon: habitData.icon,
        color: habitData.color,
        frequency: habitData.frequency,
        target: parseInt(habitData.target),
        unit: habitData.unit,
        category: habitData.category,
        createdAt: new Date().toISOString(),
        completedDates: [],
        streak: 0,
        longestStreak: 0,
        totalCompletions: 0
    };

    habits.push(habit);
    saveData();
    renderAll();
    showToast('Habit created successfully!', 'success');
}

function updateHabit(habitId, habitData) {
    const habit = habits.find(h => h.id === habitId);
    if (habit) {
        Object.assign(habit, habitData);
        saveData();
        renderAll();
        showToast('Habit updated successfully!', 'success');
    }
}

function deleteHabit(habitId) {
    habits = habits.filter(h => h.id !== habitId);
    goals = goals.filter(g => g.habitId !== habitId);
    saveData();
    renderAll();
    showToast('Habit deleted successfully!', 'success');
}

function toggleHabitCompletion(habitId, date = null) {
    const targetDate = date || getDateString(currentDate);
    const habit = habits.find(h => h.id === habitId);

    if (!habit) return;

    const existingIndex = habit.completedDates.findIndex(completion =>
        completion.date === targetDate
    );

    if (existingIndex >= 0) {
        // Remove completion
        habit.completedDates.splice(existingIndex, 1);
        habit.totalCompletions = Math.max(0, habit.totalCompletions - 1);
    } else {
        // Add completion
        habit.completedDates.push({
            date: targetDate,
            count: 1,
            timestamp: new Date().toISOString()
        });
        habit.totalCompletions += 1;
    }

    updateStreak(habit);
    saveData();
    renderAll();
    updateProductivityScore();
}

function updateStreak(habit) {
    const today = new Date();
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check consecutive days backwards from today
    while (true) {
        const dateStr = getDateString(checkDate);
        const completion = habit.completedDates.find(c => c.date === dateStr);

        if (completion) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    habit.streak = currentStreak;
    habit.longestStreak = Math.max(habit.longestStreak, currentStreak);
}

// Goal management
function createGoal(goalData) {
    const goal = {
        id: generateId(),
        title: goalData.title,
        description: goalData.description,
        target: parseInt(goalData.target),
        current: 0,
        unit: goalData.unit,
        deadline: goalData.deadline,
        habitId: goalData.habitId,
        completed: false,
        createdAt: new Date().toISOString()
    };

    goals.push(goal);
    saveData();
    renderAll();
    showToast('Goal created successfully!', 'success');
}

function updateGoalProgress(goalId, increment = 1) {
    const goal = goals.find(g => g.id === goalId);
    if (goal && !goal.completed) {
        goal.current = Math.min(goal.target, goal.current + increment);
        if (goal.current >= goal.target) {
            goal.completed = true;
            showToast(`Goal "${goal.title}" completed! 🎉`, 'success');
        }
        saveData();
        renderAll();
    }
}

function deleteGoal(goalId) {
    goals = goals.filter(g => g.id !== goalId);
    saveData();
    renderAll();
    showToast('Goal deleted successfully!', 'success');
}

// Rendering functions
function renderAll() {
    renderTodaysHabits();
    renderHabitsOverview();
    renderStreaks();
    renderAnalytics();
    renderGoals();
    updateCurrentDateDisplay();
}

function updateCurrentDateDisplay() {
    elements.currentDate.textContent = formatDate(currentDate);
}

function renderTodaysHabits() {
    const dateStr = getDateString(currentDate);
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const todaysHabits = habits.filter(habit =>
        habit.frequency.includes(dayName) || habit.frequency.includes('daily')
    );

    elements.habitsGrid.innerHTML = '';

    if (todaysHabits.length === 0) {
        elements.habitsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-day"></i>
                <h3>No habits scheduled for today</h3>
                <p>Create your first habit to get started!</p>
            </div>
        `;
        return;
    }

    todaysHabits.forEach(habit => {
        const completion = habit.completedDates.find(c => c.date === dateStr);
        const isCompleted = !!completion;
        const isPastDate = isPast(currentDate) && !isToday(currentDate);

        const habitCard = document.createElement('div');
        habitCard.className = `habit-card ${isCompleted ? 'completed' : ''}`;
        habitCard.innerHTML = `
            <div class="habit-header">
                <div class="habit-info">
                    <div class="habit-icon" style="background-color: ${habit.color}">
                        <i class="${habit.icon}"></i>
                    </div>
                    <div class="habit-details">
                        <div class="habit-name">${habit.name}</div>
                        <div class="habit-meta">
                            ${habit.target} ${habit.unit} • ${habit.category}
                            ${habit.streak > 0 ? ` • 🔥 ${habit.streak} day streak` : ''}
                        </div>
                    </div>
                </div>
                <div class="habit-actions">
                    ${!isPastDate ? `
                        <button class="habit-check ${isCompleted ? 'completed' : ''}"
                                onclick="toggleHabitCompletion('${habit.id}')"
                                ${isCompleted ? 'title="Mark as incomplete"' : 'title="Mark as complete"'}>
                            <i class="fas ${isCompleted ? 'fa-check' : 'fa-circle'}"></i>
                        </button>
                    ` : `
                        <div class="habit-check ${isCompleted ? 'completed' : ''}" title="Past date - cannot modify">
                            <i class="fas ${isCompleted ? 'fa-check' : 'fa-circle'}"></i>
                        </div>
                    `}
                </div>
            </div>
            ${habit.description ? `<div class="habit-description">${habit.description}</div>` : ''}
        `;

        elements.habitsGrid.appendChild(habitCard);
    });
}

function renderHabitsOverview() {
    const filter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';

    let filteredHabits = habits;
    if (filter !== 'all') {
        filteredHabits = habits.filter(habit => habit.category === filter);
    }

    elements.habitsList.innerHTML = '';

    if (filteredHabits.length === 0) {
        elements.habitsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list"></i>
                <h3>No habits found</h3>
                <p>Create your first habit to get started!</p>
            </div>
        `;
        return;
    }

    filteredHabits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-overview';
        habitItem.innerHTML = `
            <div class="habit-overview-icon" style="background-color: ${habit.color}">
                <i class="${habit.icon}"></i>
            </div>
            <div class="habit-overview-info">
                <div class="habit-overview-name">${habit.name}</div>
                <div class="habit-overview-stats">
                    Streak: ${habit.streak} days • Total: ${habit.totalCompletions} • Best: ${habit.longestStreak}
                </div>
            </div>
            <div class="habit-overview-actions">
                <button class="habit-btn" onclick="editHabit('${habit.id}')" title="Edit habit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="habit-btn" onclick="deleteHabit('${habit.id}')" title="Delete habit">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        elements.habitsList.appendChild(habitItem);
    });
}

function renderStreaks() {
    const topStreaks = habits
        .filter(habit => habit.streak > 0)
        .sort((a, b) => b.streak - a.streak)
        .slice(0, 6);

    elements.streaksGrid.innerHTML = '';

    if (topStreaks.length === 0) {
        elements.streaksGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-fire"></i>
                <h3>No active streaks</h3>
                <p>Complete habits consistently to build streaks!</p>
            </div>
        `;
        return;
    }

    topStreaks.forEach(habit => {
        const streakCard = document.createElement('div');
        streakCard.className = 'streak-card';
        streakCard.innerHTML = `
            <div class="streak-value">${habit.streak}</div>
            <div class="streak-label">Day Streak</div>
            <div class="streak-habit">${habit.name}</div>
        `;

        elements.streaksGrid.appendChild(streakCard);
    });
}

function renderAnalytics() {
    // This will be enhanced with Chart.js integration
    renderCharts();
    renderInsights();
}

function renderCharts() {
    // Weekly completion chart
    const weeklyData = getWeeklyCompletionData();
    const chartContainer = document.getElementById('weekly-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-chart-line"></i>
                <p>Weekly Progress Chart</p>
                <small>Last 7 days: ${weeklyData.total} completions</small>
            </div>
        `;
    }

    // Category breakdown chart
    const categoryData = getCategoryData();
    const categoryChart = document.getElementById('category-chart');
    if (categoryChart) {
        categoryChart.innerHTML = `
            <div class="chart-placeholder">
                <i class="fas fa-chart-pie"></i>
                <p>Habits by Category</p>
                <small>${categoryData.length} categories tracked</small>
            </div>
        `;
    }
}

function renderInsights() {
    const insights = generateInsights();

    elements.insightsList.innerHTML = '';

    insights.forEach(insight => {
        const insightItem = document.createElement('div');
        insightItem.className = 'insight-item';
        insightItem.innerHTML = `
            <i class="${insight.icon}"></i>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-description">${insight.description}</div>
            </div>
        `;

        elements.insightsList.appendChild(insightItem);
    });
}

function renderGoals() {
    elements.goalsGrid.innerHTML = '';

    if (goals.length === 0) {
        elements.goalsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <h3>No goals set</h3>
                <p>Create goals to track your progress!</p>
            </div>
        `;
        return;
    }

    goals.forEach(goal => {
        const progress = (goal.current / goal.target) * 100;
        const isCompleted = goal.completed;

        const goalCard = document.createElement('div');
        goalCard.className = `goal-card ${isCompleted ? 'completed' : ''}`;
        goalCard.innerHTML = `
            <div class="goal-header">
                <div>
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-meta">
                        ${goal.current}/${goal.target} ${goal.unit}
                        ${goal.deadline ? ` • Due: ${new Date(goal.deadline).toLocaleDateString()}` : ''}
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-secondary" onclick="updateGoalProgress('${goal.id}')">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deleteGoal('${goal.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(progress)}% complete</div>
            </div>
            ${goal.description ? `<div class="goal-description">${goal.description}</div>` : ''}
        `;

        elements.goalsGrid.appendChild(goalCard);
    });
}

// Analytics data functions
function getWeeklyCompletionData() {
    const data = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = getDateString(date);

        const completions = habits.reduce((total, habit) => {
            return total + habit.completedDates.filter(c => c.date === dateStr).length;
        }, 0);

        data.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            completions: completions
        });
    }

    return {
        labels: data.map(d => d.date),
        data: data.map(d => d.completions),
        total: data.reduce((sum, d) => sum + d.completions, 0)
    };
}

function getCategoryData() {
    const categories = {};

    habits.forEach(habit => {
        if (!categories[habit.category]) {
            categories[habit.category] = 0;
        }
        categories[habit.category] += habit.totalCompletions;
    });

    return Object.entries(categories).map(([category, count]) => ({
        category,
        count
    }));
}

function generateInsights() {
    const insights = [];

    // Total habits insight
    insights.push({
        icon: 'fas fa-list',
        title: `${habits.length} Habits Created`,
        description: `You've created ${habits.length} habits to track your progress.`
    });

    // Active streaks insight
    const activeStreaks = habits.filter(h => h.streak > 0).length;
    if (activeStreaks > 0) {
        insights.push({
            icon: 'fas fa-fire',
            title: `${activeStreaks} Active Streaks`,
            description: `${activeStreaks} of your habits currently have active streaks.`
        });
    }

    // Completion rate insight
    const totalPossible = habits.length * 7; // Assuming weekly tracking
    const totalCompleted = habits.reduce((sum, h) => sum + h.totalCompletions, 0);
    const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    insights.push({
        icon: 'fas fa-chart-line',
        title: `${completionRate}% Completion Rate`,
        description: `You've completed ${totalCompleted} habit instances out of ${totalPossible} possible this week.`
    });

    // Goals progress insight
    const completedGoals = goals.filter(g => g.completed).length;
    if (goals.length > 0) {
        insights.push({
            icon: 'fas fa-bullseye',
            title: `${completedGoals}/${goals.length} Goals Completed`,
            description: `${completedGoals} out of ${goals.length} goals have been achieved.`
        });
    }

    return insights;
}

// Productivity score calculation
function updateProductivityScore() {
    const todayStr = getDateString(new Date());
    const todaysHabits = habits.filter(habit => {
        const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        return habit.frequency.includes(dayName) || habit.frequency.includes('daily');
    });

    const completedToday = todaysHabits.filter(habit =>
        habit.completedDates.some(c => c.date === todayStr)
    ).length;

    const score = todaysHabits.length > 0 ? Math.round((completedToday / todaysHabits.length) * 100) : 0;

    elements.productivityScore.innerHTML = `
        <div class="score-display">
            <span class="score-label">Today's Score</span>
            <span class="score-value">${score}</span>
            <span class="score-max">/100</span>
        </div>
    `;
}

// Modal management
function showModal(modalName) {
    hideAllModals();
    const modal = elements.modals[modalName];
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
    document.body.style.overflow = '';
}

// Form handling
function handleHabitSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const habitData = {
        name: formData.get('name'),
        description: formData.get('description'),
        icon: formData.get('icon'),
        color: formData.get('color'),
        frequency: Array.from(formData.getAll('frequency')),
        target: formData.get('target'),
        unit: formData.get('unit'),
        category: formData.get('category')
    };

    if (selectedHabit) {
        updateHabit(selectedHabit.id, habitData);
    } else {
        createHabit(habitData);
    }

    hideAllModals();
    e.target.reset();
    selectedHabit = null;
}

function handleGoalSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const goalData = {
        title: formData.get('title'),
        description: formData.get('description'),
        target: formData.get('target'),
        unit: formData.get('unit'),
        deadline: formData.get('deadline'),
        habitId: formData.get('habitId')
    };

    createGoal(goalData);
    hideAllModals();
    e.target.reset();
}

function editHabit(habitId) {
    selectedHabit = habits.find(h => h.id === habitId);
    if (!selectedHabit) return;

    // Populate form
    const form = elements.habitForm;
    form.name.value = selectedHabit.name;
    form.description.value = selectedHabit.description;
    form.icon.value = selectedHabit.icon;
    form.color.value = selectedHabit.color;
    form.target.value = selectedHabit.target;
    form.unit.value = selectedHabit.unit;
    form.category.value = selectedHabit.category;

    // Set frequency checkboxes
    form.querySelectorAll('input[name="frequency"]').forEach(checkbox => {
        checkbox.checked = selectedHabit.frequency.includes(checkbox.value);
    });

    showModal('editHabit');
}

function handleFilterClick(e) {
    if (e.target.classList.contains('filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        renderHabitsOverview();
    }
}

function switchAnalyticsTab(tabName) {
    elements.analyticsTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Here you would switch between different analytics views
    // For now, just re-render the current analytics
    renderAnalytics();
}

// Export functionality
function exportData(format) {
    showLoading('Exporting data...');

    setTimeout(() => {
        const data = {
            habits: habits,
            goals: goals,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        switch (format) {
            case 'json':
                downloadFile(JSON.stringify(data, null, 2), 'habit-tracker-data.json', 'application/json');
                break;
            case 'csv':
                const csv = convertToCSV(data);
                downloadFile(csv, 'habit-tracker-data.csv', 'text/csv');
                break;
            case 'pdf':
                // For PDF export, we'd need a library like jsPDF
                showToast('PDF export coming soon!', 'info');
                break;
        }

        hideLoading();
        hideAllModals();
    }, 1000);
}

function convertToCSV(data) {
    let csv = 'Habit Name,Category,Total Completions,Current Streak,Longest Streak,Created Date\n';

    data.habits.forEach(habit => {
        csv += `"${habit.name}","${habit.category}",${habit.totalCompletions},${habit.streak},${habit.longestStreak},"${habit.createdAt}"\n`;
    });

    csv += '\nGoal Title,Target,Current,Completed,Deadline\n';
    data.goals.forEach(goal => {
        csv += `"${goal.title}",${goal.target},${goal.current},${goal.completed},"${goal.deadline}"\n`;
    });

    return csv;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Loading and toast notifications
function showLoading(message = 'Loading...') {
    elements.loadingOverlay.querySelector('.loading-text').textContent = message;
    elements.loadingOverlay.classList.add('show');
}

function hideLoading() {
    elements.loadingOverlay.classList.remove('show');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    elements.toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Global functions for onclick handlers
window.toggleHabitCompletion = toggleHabitCompletion;
window.editHabit = editHabit;
window.deleteHabit = deleteHabit;
window.updateGoalProgress = updateGoalProgress;
window.deleteGoal = deleteGoal;