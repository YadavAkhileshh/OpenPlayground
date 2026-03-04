// Habit Tracker & Builder
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.logs = this.loadLogs();
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.currentMonth = new Date();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCurrentDate();
        this.applyTheme();
        this.renderDashboard();
    }

    // Load data from localStorage
    loadHabits() {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved) : [];
    }

    loadLogs() {
        const saved = localStorage.getItem('habitLogs');
        return saved ? JSON.parse(saved) : {};
    }

    saveHabits() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    saveLogs() {
        localStorage.setItem('habitLogs', JSON.stringify(this.logs));
    }

    // Setup Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.switchSection(e.target.closest('.nav-item')));
        });

        // Theme
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('darkModeToggle').addEventListener('change', () => this.toggleTheme());

        // Modal
        const modal = document.getElementById('habitModal');
        const newHabitBtns = document.querySelectorAll('#newHabitBtn, #newHabitBtn2');
        const closeBtn = document.getElementById('closeModal');
        const cancelBtn = document.getElementById('cancelBtn');
        const form = document.getElementById('habitForm');

        newHabitBtns.forEach(btn => {
            btn.addEventListener('click', () => this.openModal());
        });

        closeBtn.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        window.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Frequency change
        document.getElementById('habitFrequency').addEventListener('change', (e) => {
            const daysGroup = document.getElementById('daysGroup');
            daysGroup.style.display = e.target.value === 'weekly' ? 'block' : 'none';
        });

        // Filters
        document.getElementById('filterFrequency').addEventListener('change', () => this.renderHabits());
        document.getElementById('filterCategory').addEventListener('change', () => this.renderHabits());

        // Calendar
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        document.getElementById('habitSelectCalendar').addEventListener('change', () => this.renderCalendar());

        // Settings
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importBtn').addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllData());
        document.getElementById('reminderTime').addEventListener('change', (e) => {
            localStorage.setItem('reminderTime', e.target.value);
        });

        // Load reminder time if saved
        const savedTime = localStorage.getItem('reminderTime');
        if (savedTime) {
            document.getElementById('reminderTime').value = savedTime;
        }
    }

    // Section Navigation
    switchSection(navItem) {
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        navItem.classList.add('active');

        const sectionId = navItem.dataset.section;
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        if (sectionId === 'habits') {
            this.renderHabits();
        } else if (sectionId === 'calendar') {
            this.renderCalendarSection();
        } else if (sectionId === 'analytics') {
            this.renderAnalytics();
        }
    }

    // Theme Management
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="ri-sun-line"></i>';
            document.getElementById('darkModeToggle').checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="ri-moon-line"></i>';
            document.getElementById('darkModeToggle').checked = false;
        }
        if (this.charts && this.charts.completion) {
            this.renderAnalytics();
        }
    }

    // Modal Management
    openModal() {
        document.getElementById('habitForm').reset();
        document.getElementById('habitStartDate').valueAsDate = new Date();
        document.getElementById('daysGroup').style.display = 'none';
        document.getElementById('habitModal').classList.add('active');
    }

    closeModal() {
        document.getElementById('habitModal').classList.remove('active');
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const habit = {
            id: Date.now(),
            name: document.getElementById('habitName').value,
            description: document.getElementById('habitDescription').value,
            category: document.getElementById('habitCategory').value,
            frequency: document.getElementById('habitFrequency').value,
            days: document.getElementById('habitFrequency').value === 'weekly' 
                ? Array.from(document.querySelectorAll('input[name="days"]:checked')).map(c => c.value)
                : [],
            color: document.getElementById('habitColor').value,
            target: parseInt(document.getElementById('habitTarget').value),
            startDate: document.getElementById('habitStartDate').value,
            createdAt: new Date().toISOString()
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderDashboard();
        this.renderHabits();
        this.updateCalendarSelect();
        this.closeModal();
        this.showNotification('Habit created successfully!');
    }

    deleteHabit(id) {
        if (confirm('Delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== id);
            this.saveHabits();
            this.renderDashboard();
            this.renderHabits();
            this.updateCalendarSelect();
            this.showNotification('Habit deleted');
        }
    }

    // Log habit completion
    logHabitCompletion(habitId) {
        const today = this.getDateString(new Date());
        if (!this.logs[habitId]) this.logs[habitId] = {};
        
        this.logs[habitId][today] = !this.logs[habitId][today];
        this.saveLogs();
        this.renderDashboard();
    }

    // Dashboard Rendering
    renderDashboard() {
        this.updateStats();
        this.renderTodayHabits();
        this.renderTopStreaks();
    }

    updateStats() {
        const today = this.getDateString(new Date());
        const todayHabits = this.getTodayHabits();
        const completedToday = todayHabits.filter(h => this.logs[h.id] && this.logs[h.id][today]).length;

        const percentage = todayHabits.length === 0 ? 0 : Math.round((completedToday / todayHabits.length) * 100);
        
        document.getElementById('progressPercent').textContent = percentage + '%';
        document.getElementById('habitsCompleted').textContent = completedToday;
        document.getElementById('totalHabits').textContent = this.habits.length;

        // Calculate average streak
        const streaks = this.habits.map(h => this.calculateStreak(h.id));
        const avgStreak = streaks.length === 0 ? 0 : Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length);
        document.getElementById('averageStreak').textContent = avgStreak;

        // Longest streak for sidebar
        const longest = Math.max(...streaks, 0);
        document.getElementById('longestStreak').textContent = longest;
        document.getElementById('completedToday').textContent = completedToday;

        // Update progress circle
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percentage / 100) * circumference;
        document.getElementById('progressCircle').style.strokeDashoffset = offset;
        document.getElementById('progressValue').textContent = completedToday;
        document.getElementById('totalTasksCount').textContent = todayHabits.length;
    }

    getTodayHabits() {
        const today = new Date().getDay();
        return this.habits.filter(h => {
            if (h.frequency === 'daily') return true;
            if (h.frequency === 'weekly') return h.days.includes(String(today));
            return true;
        });
    }

    renderTodayHabits() {
        const today = this.getDateString(new Date());
        const todayHabits = this.getTodayHabits();

        const container = document.getElementById('todayHabits');
        if (todayHabits.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i><p>No habits for today</p></div>';
            return;
        }

        container.innerHTML = todayHabits.map(habit => {
            const isCompleted = this.logs[habit.id] && this.logs[habit.id][today];
            return `
                <div class="habit-item ${isCompleted ? 'completed' : ''}">
                    <input type="checkbox" class="habit-checkbox" ${isCompleted ? 'checked' : ''} 
                           onchange="tracker.logHabitCompletion(${habit.id})">
                    <div class="habit-info">
                        <div class="habit-title">${this.escapeHtml(habit.name)}</div>
                        <div class="habit-meta">
                            <span class="habit-category">${habit.category}</span>
                            <span><i class="ri-fire-line"></i> ${this.calculateStreak(habit.id)} day streak</span>
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="habit-btn" onclick="tracker.deleteHabit(${habit.id})" title="Delete">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderTopStreaks() {
        const streaks = this.habits
            .map(h => ({
                name: h.name,
                id: h.id,
                streak: this.calculateStreak(h.id),
                color: h.color
            }))
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 5);

        const container = document.getElementById('topStreaks');
        if (streaks.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i><p>No streaks yet</p></div>';
            return;
        }

        container.innerHTML = streaks.map(s => `
            <div class="streak-item-card">
                <div class="streak-info">
                    <div class="streak-indicator" style="background: ${s.color};">${s.streak}</div>
                    <div class="streak-text">
                        <h4>${this.escapeHtml(s.name)}</h4>
                        <p>current streak</p>
                    </div>
                </div>
                <div class="streak-count">
                    <i class="ri-fire-line"></i> ${s.streak}
                </div>
            </div>
        `).join('');
    }

    // Habits Page
    renderHabits() {
        const frequency = document.getElementById('filterFrequency').value;
        const category = document.getElementById('filterCategory').value;

        let filtered = this.habits;
        if (frequency !== 'all') {
            filtered = filtered.filter(h => h.frequency === frequency);
        }
        if (category !== 'all') {
            filtered = filtered.filter(h => h.category === category);
        }

        const container = document.getElementById('habitsGrid');
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="ri-inbox-line"></i><p>No habits found</p></div>';
            return;
        }

        container.innerHTML = filtered.map(habit => {
            const streak = this.calculateStreak(habit.id);
            const completionPercent = this.calculateCompletionPercent(habit.id);

            return `
                <div class="habit-card">
                    <div class="habit-card-header">
                        <h3 class="habit-card-title">${this.escapeHtml(habit.name)}</h3>
                        <div class="habit-card-actions">
                            <button class="habit-card-action" onclick="tracker.deleteHabit(${habit.id})" title="Delete">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>

                    <div class="habit-card-stats">
                        <div class="stat">
                            <span class="stat-number">${completionPercent}%</span>
                            <span class="stat-label">Completion</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${this.getThisMonthCompletions(habit.id)}</span>
                            <span class="stat-label">This Month</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${streak}</span>
                            <span class="stat-label">Days</span>
                        </div>
                    </div>

                    <div class="habit-card-streak" style="background: linear-gradient(135deg, ${habit.color}, ${this.adjustColor(habit.color, -20)});">
                        <div class="habit-card-streak-number">
                            <i class="ri-fire-line"></i> ${streak}
                        </div>
                        <div class="habit-card-streak-label">current streak</div>
                    </div>

                    <div class="habit-progress-bar">
                        <div class="habit-progress-fill" style="background: ${habit.color}; width: ${completionPercent}%"></div>
                    </div>

                    <div class="habit-card-category">${habit.category}</div>
                </div>
            `;
        }).join('');
    }

    // Calendar Section
    renderCalendarSection() {
        this.updateCalendarSelect();
        this.renderCalendar();
    }

    updateCalendarSelect() {
        const select = document.getElementById('habitSelectCalendar');
        select.innerHTML = '<option value="">Select a habit to view</option>';
        this.habits.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id;
            option.textContent = h.name;
            select.appendChild(option);
        });
    }

    renderCalendar() {
        const habitId = document.getElementById('habitSelectCalendar').value;
        const grid = document.getElementById('calendarGrid');

        if (!habitId) {
            grid.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 40px;">Select a habit to view calendar</p>';
            return;
        }

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        document.getElementById('currentMonth').textContent = 
            new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        let html = '';
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        // Day headers
        days.forEach(day => {
            html += `<div class="calendar-day" style="font-weight: 700; background: var(--bg-tertiary);">${day}</div>`;
        });

        // Empty cells
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty">-</div>';
        }

        // Days
        const today = new Date();
        const todayStr = this.getDateString(today);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = this.getDateString(date);
            const isCompleted = this.logs[habitId] && this.logs[habitId][dateStr];
            const isFuture = date > today;
            const isMissed = !isFuture && !isCompleted && this.shouldHaveBeenLogged(habitId, date);

            let className = 'calendar-day';
            if (isFuture) className += ' future';
            else if (isCompleted) className += ' completed';
            else if (isMissed) className += ' missed';

            html += `<div class="${className}">${day}</div>`;
        }

        grid.innerHTML = html;
    }

    previousMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
    }

    shouldHaveBeenLogged(habitId, date) {
        const habit = this.habits.find(h => h.id == habitId);
        if (!habit) return false;
        if (habit.frequency === 'daily') return true;
        if (habit.frequency === 'weekly') {
            return habit.days.includes(String(date.getDay()));
        }
        return false;
    }

    // Analytics
    renderAnalytics() {
        this.updateCompletionChart();
        this.updateHabitBreakdownChart();
        this.updateWeeklyTrendChart();
        this.updateBestTimes();
        this.generateInsights();
    }

    updateCompletionChart() {
        const labels = this.habits.map(h => h.name);
        const data = this.habits.map(h => this.calculateCompletionPercent(h.id));

        const ctx = document.getElementById('completionChart').getContext('2d');
        if (this.charts.completion) this.charts.completion.destroy();

        this.charts.completion = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Completion %',
                    data,
                    backgroundColor: this.habits.map(h => h.color),
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        max: 100,
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border') }
                    },
                    y: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    updateHabitBreakdownChart() {
        const categories = {};
        this.habits.forEach(h => {
            categories[h.category] = (categories[h.category] || 0) + 1;
        });

        const ctx = document.getElementById('habitBreakdownChart').getContext('2d');
        if (this.charts.breakdown) this.charts.breakdown.destroy();

        this.charts.breakdown = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: ['#43e97b', '#38f9d7', '#667eea', '#f093fb', '#f59e0b', '#ef4444'],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg'),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    updateWeeklyTrendChart() {
        const weekData = this.getWeeklyData();

        const ctx = document.getElementById('weeklyTrendChart').getContext('2d');
        if (this.charts.trend) this.charts.trend.destroy();

        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                datasets: [{
                    label: 'Habits Completed',
                    data: weekData,
                    borderColor: '#43e97b',
                    backgroundColor: 'rgba(67, 233, 123, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') } }
                },
                scales: {
                    y: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') },
                        grid: { color: getComputedStyle(document.documentElement).getPropertyValue('--border') }
                    },
                    x: {
                        ticks: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') }
                    }
                }
            }
        });
    }

    getWeeklyData() {
        const weekData = [0, 0, 0, 0, 0, 0, 0];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - (6 - i));
            const dateStr = this.getDateString(date);

            this.habits.forEach(h => {
                if (this.logs[h.id] && this.logs[h.id][dateStr]) {
                    weekData[i]++;
                }
            });
        }

        return weekData;
    }

    updateBestTimes() {
        const container = document.getElementById('bestTimes');
        const streaks = this.habits
            .map(h => ({ name: h.name, streak: this.calculateStreak(h.id) }))
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3);

        if (streaks.length === 0) {
            container.innerHTML = '<p class="empty-text">No data available</p>';
            return;
        }

        container.innerHTML = streaks.map(s => `
            <div class="time-item">
                <span class="time-label">${this.escapeHtml(s.name)}</span>
                <span class="time-value">${s.streak} 🔥</span>
            </div>
        `).join('');
    }

    generateInsights() {
        const insights = [];
        const totalHabits = this.habits.length;
        const completionRates = this.habits.map(h => this.calculateCompletionPercent(h.id));
        const avgCompletion = totalHabits === 0 ? 0 : Math.round(completionRates.reduce((a, b) => a + b, 0) / totalHabits);

        if (totalHabits === 0) {
            insights.push('Start a new habit to build momentum!');
        } else {
            if (avgCompletion >= 80) {
                insights.push('🎉 Amazing! You\'re crushing your habits with ' + avgCompletion + '% completion rate!');
            } else if (avgCompletion >= 60) {
                insights.push('📈 Good progress! Keep maintaining these habits at ' + avgCompletion + '%');
            } else {
                insights.push('💪 You can do better! Focus on building consistency.');
            }

            const bestHabit = this.habits.reduce((max, h) => 
                this.calculateCompletionPercent(h.id) > this.calculateCompletionPercent(max.id) ? h : max
            );
            insights.push('⭐ Your best habit: ' + this.escapeHtml(bestHabit.name));

            const streak = this.calculateStreak(bestHabit.id);
            if (streak > 7) {
                insights.push('🔥 ' + streak + ' day streak - keep the momentum going!');
            }
        }

        const insightsList = document.getElementById('insightsList');
        insightsList.innerHTML = insights.map(insight => `
            <div class="insight-item">
                <i class="ri-lightbulb-line"></i>
                <p>${insight}</p>
            </div>
        `).join('');
    }

    // Utility Functions
    calculateStreak(habitId) {
        let streak = 0;
        let date = new Date();

        while (true) {
            const dateStr = this.getDateString(date);
            const isLogged = this.logs[habitId] && this.logs[habitId][dateStr];

            if (!isLogged) break;

            streak++;
            date.setDate(date.getDate() - 1);
        }

        return streak;
    }

    calculateCompletionPercent(habitId) {
        const habit = this.habits.find(h => h.id == habitId);
        if (!habit) return 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let totalDays = 0;
        let completedDays = 0;

        for (let i = 0; i < 30; i++) {
            const date = new Date(thirtyDaysAgo);
            date.setDate(date.getDate() + i);

            if (this.shouldHaveBeenLogged(habitId, date)) {
                totalDays++;
                const dateStr = this.getDateString(date);
                if (this.logs[habitId] && this.logs[habitId][dateStr]) {
                    completedDays++;
                }
            }
        }

        return totalDays === 0 ? 0 : Math.round((completedDays / totalDays) * 100);
    }

    getThisMonthCompletions(habitId) {
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let count = 0;
        const habitLogs = this.logs[habitId] || {};
        Object.keys(habitLogs).forEach(date => {
            if (date.startsWith(thisMonth) && habitLogs[date]) {
                count++;
            }
        });

        return count;
    }

    getDateString(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    updateCurrentDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        const today = new Date().toLocaleDateString('en-US', options);
        document.getElementById('todayDate').textContent = today;
    }

    adjustColor(color, amount) {
        const rgb = parseInt(color.slice(1), 16);
        const r = Math.min(255, Math.max(0, (rgb >> 16) + amount));
        const g = Math.min(255, Math.max(0, ((rgb >> 8) & 0x00FF) + amount));
        const b = Math.min(255, Math.max(0, (rgb & 0x0000FF) + amount));
        return "#" + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification show ${type}`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // Data Management
    exportData() {
        const data = {
            habits: this.habits,
            logs: this.logs,
            exportedAt: new Date().toISOString()
        };
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habits-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        this.showNotification('Data exported!');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                this.habits = data.habits || [];
                this.logs = data.logs || {};
                this.saveHabits();
                this.saveLogs();
                this.renderDashboard();
                this.renderHabits();
                this.updateCalendarSelect();
                this.showNotification('Data imported!');
            } catch (error) {
                this.showNotification('Error importing data', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    }

    clearAllData() {
        if (confirm('Are you sure? This will delete ALL habits and logs permanently.')) {
            this.habits = [];
            this.logs = {};
            this.saveHabits();
            this.saveLogs();
            this.renderDashboard();
            this.renderHabits();
            this.updateCalendarSelect();
            this.showNotification('All data cleared');
        }
    }
}

// Initialize
const tracker = new HabitTracker();
