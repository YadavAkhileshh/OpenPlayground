// AI Habit Tracker - Main Application Script

class HabitTracker {
    constructor() {
        this.habits = [];
        this.initializeElement = this.initialize.bind(this);
        this.loadFromStorage();
        this.init();
        this.setupEventListeners();
        this.renderHabits();
        this.updateStats();
        this.updateAIInsights();
    }

    init() {
        // Initialize dark mode
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('darkMode').checked = true;
        }
    }

    initialize() {
        this.init();
    }

    setupEventListeners() {
        // Add habit
        document.getElementById('addHabitBtn').addEventListener('click', () => this.addHabit());
        document.getElementById('habitInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addHabit();
        });

        // Dark mode toggle
        document.getElementById('darkMode').addEventListener('change', (e) => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', e.target.checked);
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderHabits(e.target.dataset.filter);
            });
        });

        // Export and Clear buttons
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAllData());

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('habitModal').classList.remove('show');
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('habitModal');
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    addHabit() {
        const input = document.getElementById('habitInput');
        const category = document.getElementById('categorySelect').value;
        const habitName = input.value.trim();

        if (!habitName) {
            this.showToast('Please enter a habit name', 'warning');
            return;
        }

        const habit = {
            id: Date.now(),
            name: habitName,
            category: category,
            createdDate: new Date().toISOString(),
            completedDates: [],
            streak: 0,
            totalCompleted: 0,
            notes: []
        };

        this.habits.push(habit);
        this.saveToStorage();
        this.renderHabits();
        this.updateStats();
        this.updateAIInsights();
        input.value = '';
        this.showToast(`Habit "${habitName}" added successfully!`, 'success');
    }

    deleteHabit(habitId) {
        if (confirm('Are you sure you want to delete this habit?')) {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveToStorage();
            this.renderHabits();
            this.updateStats();
            this.updateAIInsights();
            this.showToast('Habit deleted successfully', 'success');
        }
    }

    toggleHabitCompletion(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const today = new Date().toLocaleDateString('en-CA');
        const index = habit.completedDates.indexOf(today);

        if (index === -1) {
            habit.completedDates.push(today);
            habit.totalCompleted++;
            this.calculateStreak(habit);
            this.showToast(`Great! "${habit.name}" completed!`, 'success');
        } else {
            habit.completedDates.splice(index, 1);
            habit.totalCompleted--;
            this.calculateStreak(habit);
            this.showToast(`"${habit.name}" marked as incomplete`, 'info');
        }

        this.saveToStorage();
        this.renderHabits();
        this.updateStats();
        this.updateAIInsights();
    }

    calculateStreak(habit) {
        const today = new Date();
        let streak = 0;

        for (let i = 0; i < 365; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-CA');

            if (habit.completedDates.includes(dateStr)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

        habit.streak = streak;
    }

    renderHabits(filter = 'all') {
        const habitsList = document.getElementById('habitsList');

        let filteredHabits = this.habits;
        if (filter === 'active') {
            filteredHabits = this.habits.filter(h => !this.isHabitCompletedToday(h));
        } else if (filter === 'completed') {
            filteredHabits = this.habits.filter(h => this.isHabitCompletedToday(h));
        }

        if (filteredHabits.length === 0) {
            habitsList.innerHTML = `
                <div class="empty-state">
                    <i class="ri-inbox-line"></i>
                    <p>No habits to display. Start by adding one!</p>
                </div>
            `;
            return;
        }

        habitsList.innerHTML = filteredHabits.map(habit => {
            const isCompleted = this.isHabitCompletedToday(habit);
            return `
                <div class="habit-card ${isCompleted ? 'completed' : ''} ${habit.category}">
                    <div class="habit-info">
                        <div class="habit-title">
                            <i class="ri-checkbox-${isCompleted ? 'fill' : 'blank'}-circle-line"></i>
                            ${habit.name}
                            <span class="habit-category">${habit.category}</span>
                        </div>
                        <div class="habit-meta">
                            <div class="meta-item">
                                <i class="ri-fire-line"></i>
                                Streak: ${habit.streak} days
                            </div>
                            <div class="meta-item">
                                <i class="ri-check-line"></i>
                                Completed: ${habit.totalCompleted} times
                            </div>
                            <div class="meta-item">
                                <i class="ri-calendar-line"></i>
                                ${Math.floor((Date.now() - new Date(habit.createdDate).getTime()) / (1000 * 60 * 60 * 24))} days old
                            </div>
                        </div>
                    </div>
                    <div class="habit-actions">
                        <button class="action-btn check" onclick="tracker.toggleHabitCompletion(${habit.id})" 
                                title="${isCompleted ? 'Mark incomplete' : 'Mark complete'}">
                            <i class="ri-checkbox-${isCompleted ? 'fill' : 'blank'}-circle-line"></i>
                        </button>
                        <button class="action-btn" onclick="tracker.showHabitDetails(${habit.id})" title="View details">
                            <i class="ri-eye-line"></i>
                        </button>
                        <button class="action-btn delete" onclick="tracker.deleteHabit(${habit.id})" title="Delete habit">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    isHabitCompletedToday(habit) {
        const today = new Date().toLocaleDateString('en-CA');
        return habit.completedDates.includes(today);
    }

    showHabitDetails(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;

        const modal = document.getElementById('habitModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = habit.name;

        const createdDate = new Date(habit.createdDate).toLocaleDateString();
        const completionRate = Math.round((habit.totalCompleted / Math.max(1, Math.floor((Date.now() - new Date(habit.createdDate).getTime()) / (1000 * 60 * 60 * 24)))) * 100) || 0;

        modalBody.innerHTML = `
            <div class="stat-card">
                <div class="stat-title">Category</div>
                <div>${habit.category.toUpperCase()}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Current Streak</div>
                <div class="stat-number">${habit.streak} days</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Total Completed</div>
                <div class="stat-number">${habit.totalCompleted}</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Completion Rate</div>
                <div class="stat-number">${completionRate}%</div>
            </div>
            <div class="stat-card">
                <div class="stat-title">Created</div>
                <div>${createdDate}</div>
            </div>
        `;

        modal.classList.add('show');
    }

    updateStats() {
        document.getElementById('habitCount').textContent = this.habits.length;
        document.getElementById('completedToday').textContent = this.habits.filter(h => this.isHabitCompletedToday(h)).length;

        const maxStreak = Math.max(0, ...this.habits.map(h => h.streak));
        document.getElementById('maxStreak').textContent = maxStreak;

        // Completion rate
        const totalPossible = this.habits.length;
        const completedToday = this.habits.filter(h => this.isHabitCompletedToday(h)).length;
        const completionRate = totalPossible === 0 ? 0 : Math.round((completedToday / totalPossible) * 100);
        document.getElementById('completionRate').textContent = completionRate;

        // Weekly overview
        this.renderWeeklyOverview();

        // Category chart
        this.renderCategoryStats();
    }

    renderWeeklyOverview() {
        const weeklyContainer = document.getElementById('weeklyOverview');
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = '';

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-CA');
            const dayName = days[date.getDay()];

            const completedCount = this.habits.filter(h => h.completedDates.includes(dateStr)).length;
            const isActive = completedCount > 0;

            html += `
                <div class="day-cell ${isActive ? 'active' : ''}" title="${dateStr}">
                    <div>${dayName}</div>
                    <div style="font-size: 0.65rem;">${completedCount}/${this.habits.length}</div>
                </div>
            `;
        }

        weeklyContainer.innerHTML = html;
    }

    renderCategoryStats() {
        const categoryCount = {};
        this.habits.forEach(habit => {
            categoryCount[habit.category] = (categoryCount[habit.category] || 0) + 1;
        });

        const categoryChart = document.getElementById('categoryChart');
        categoryChart.style.display = 'none'; // Hide canvas for simple text representation

        const categories = Object.entries(categoryCount)
            .map(([cat, count]) => `<div style="font-size: 0.875rem; margin: 0.25rem 0;">${cat}: ${count}</div>`)
            .join('');

        categoryChart.parentElement.innerHTML = categories || '<div style="color: var(--text-secondary);">No categories yet</div>';
    }

    updateAIInsights() {
        const insightsContainer = document.getElementById('aiInsights');

        if (this.habits.length === 0) {
            insightsContainer.innerHTML = `
                <div class="insight-placeholder">
                    <i class="ri-lightbulb-flash-line"></i>
                    <p>Complete your habits to get personalized AI insights and motivational feedback!</p>
                </div>
            `;
            return;
        }

        const insights = this.generateAIInsights();
        insightsContainer.innerHTML = insights.map(insight => `
            <div class="insight-card">
                <div class="insight-title">
                    <i class="${insight.icon}"></i>
                    ${insight.title}
                </div>
                <div class="insight-text">${insight.text}</div>
            </div>
        `).join('');
    }

    generateAIInsights() {
        const insights = [];
        const totalHabits = this.habits.length;
        const completedToday = this.habits.filter(h => this.isHabitCompletedToday(h)).length;
        const completionRate = totalHabits === 0 ? 0 : (completedToday / totalHabits);

        // Insight 1: Motivational message based on completion
        if (completionRate === 1) {
            insights.push({
                icon: 'ri-emotion-happy-line',
                title: 'Perfect Day!',
                text: '🎉 Wow! You\'ve completed all your habits today! You\'re on fire! Keep up this momentum and you\'ll achieve great things.'
            });
        } else if (completionRate >= 0.75) {
            insights.push({
                icon: 'ri-emotion-smile-line',
                title: 'Great Progress!',
                text: 'You\'re doing amazing! You\'ve completed ' + completedToday + ' out of ' + totalHabits + ' habits. Keep pushing!'
            });
        } else if (completionRate >= 0.5) {
            insights.push({
                icon: 'ri-emotion-normal-line',
                title: 'Good Start!',
                text: 'You\'ve completed ' + completedToday + ' habits today. You\'re halfway there! Try to complete the remaining ones.'
            });
        } else if (completedToday > 0) {
            insights.push({
                icon: 'ri-emotion-sad-line',
                title: 'Keep Going!',
                text: 'You\'ve completed ' + completedToday + ' habit(s) today. Every small step counts towards building consistency!'
            });
        } else {
            insights.push({
                icon: 'ri-emotion-laugh-line',
                title: 'Start Now!',
                text: 'Don\'t wait! Start completing your habits today. Every journey begins with a single step. You can do this!'
            });
        }

        // Insight 2: Streak analysis
        const maxStreak = Math.max(0, ...this.habits.map(h => h.streak));
        const averageStreak = this.habits.length === 0 ? 0 : Math.round(this.habits.reduce((sum, h) => sum + h.streak, 0) / this.habits.length);

        if (maxStreak > 7) {
            insights.push({
                icon: 'ri-fire-line',
                title: 'On Fire!',
                text: 'Your best streak is ' + maxStreak + ' days! You\'re building momentum. Keep this consistency going!'
            });
        } else if (maxStreak > 0) {
            insights.push({
                icon: 'ri-lightbulb-flash-line',
                title: 'Building Momentum',
                text: 'Your longest streak is ' + maxStreak + ' days. Consistency is key! Try to extend it further.'
            });
        }

        // Insight 3: Category insights
        const categoryStats = {};
        this.habits.forEach(habit => {
            const rate = habit.totalCompleted / Math.max(1, Math.floor((Date.now() - new Date(habit.createdDate).getTime()) / (1000 * 60 * 60 * 24)));
            categoryStats[habit.category] = (categoryStats[habit.category] || []).concat(rate);
        });

        const bestCategory = Object.entries(categoryStats).reduce((best, [cat, rates]) => {
            const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
            return avg > (best.avg || 0) ? { category: cat, avg } : best;
        }, {});

        if (bestCategory.category) {
            insights.push({
                icon: 'ri-star-line',
                title: 'Your Strength',
                text: 'You\'re strongest in ' + bestCategory.category + ' habits! You\'re showing great dedication in this area. Impressive!'
            });
        }

        // Insight 4: Recommendations
        const incompletedHabits = this.habits.filter(h => !this.isHabitCompletedToday(h));
        if (incompletedHabits.length > 0) {
            const habitsToComplete = incompletedHabits.slice(0, 2).map(h => h.name).join(' and ');
            insights.push({
                icon: 'ri-lightbulb-line',
                title: 'AI Recommendation',
                text: `Try to complete "${habitsToComplete}" today to boost your completion rate. You're almost there!`
            });
        }

        return insights;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    exportData() {
        if (this.habits.length === 0) {
            this.showToast('No habits to export', 'warning');
            return;
        }

        const dataStr = JSON.stringify(this.habits, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habits-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showToast('Data exported successfully!', 'success');
    }

    clearAllData() {
        if (confirm('Are you sure you want to delete all habits and data? This cannot be undone!')) {
            if (confirm('This will permanently delete everything. Are you absolutely sure?')) {
                this.habits = [];
                this.saveToStorage();
                this.renderHabits();
                this.updateStats();
                this.updateAIInsights();
                this.showToast('All data cleared', 'success');
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('habits', JSON.stringify(this.habits));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('habits');
        this.habits = stored ? JSON.parse(stored) : [];
    }
}

// Initialize the app when DOM is loaded
let tracker;
document.addEventListener('DOMContentLoaded', () => {
    tracker = new HabitTracker();
});
