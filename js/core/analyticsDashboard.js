/**
 * Analytics Dashboard - Learning Insights & Progress Visualization
 * Features: Stats, Radar Chart, Achievements, Recommendations, Goals
 */

import { analyticsEngine } from './analyticsEngine.js';

class AnalyticsDashboard {
    constructor() {
        this.isOpen = false;
        this.activeTab = 'overview';
        this.init();
    }

    init() {
        this.createDashboardDOM();
        this.attachEventListeners();
    }

    createDashboardDOM() {
        if (document.getElementById('analytics-dashboard')) return;

        const dashboard = document.createElement('div');
        dashboard.id = 'analytics-dashboard';
        dashboard.className = 'analytics-dashboard';
        dashboard.innerHTML = `
            <div class="analytics-overlay"></div>
            <div class="analytics-container">
                <div class="analytics-header">
                    <div class="analytics-title">
                        <i class="ri-bar-chart-box-line"></i>
                        <span>Learning Insights</span>
                    </div>
                    <div class="analytics-header-actions">
                        <button class="analytics-btn" id="btn-export-report" title="Export Report">
                            <i class="ri-download-2-line"></i> Export
                        </button>
                        <button class="analytics-btn-close" id="btn-close-analytics" title="Close">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>

                <div class="analytics-tabs">
                    <button class="analytics-tab active" data-tab="overview">
                        <i class="ri-dashboard-line"></i> Overview
                    </button>
                    <button class="analytics-tab" data-tab="achievements">
                        <i class="ri-award-line"></i> Achievements
                    </button>
                    <button class="analytics-tab" data-tab="journey">
                        <i class="ri-road-map-line"></i> Journey
                    </button>
                    <button class="analytics-tab" data-tab="goals">
                        <i class="ri-flag-line"></i> Goals
                    </button>
                </div>

                <div class="analytics-body">
                    <!-- Overview Tab -->
                    <div class="analytics-panel active" id="panel-overview">
                        <div class="stats-grid">
                            <div class="stat-card stat-primary">
                                <div class="stat-icon"><i class="ri-eye-line"></i></div>
                                <div class="stat-value" id="stat-projects-viewed">0</div>
                                <div class="stat-label">Projects Viewed</div>
                            </div>
                            <div class="stat-card stat-secondary">
                                <div class="stat-icon"><i class="ri-folder-open-line"></i></div>
                                <div class="stat-value" id="stat-categories">0</div>
                                <div class="stat-label">Categories Explored</div>
                            </div>
                            <div class="stat-card stat-accent">
                                <div class="stat-icon"><i class="ri-fire-line"></i></div>
                                <div class="stat-value" id="stat-streak">0</div>
                                <div class="stat-label">Day Streak</div>
                            </div>
                            <div class="stat-card stat-info">
                                <div class="stat-icon"><i class="ri-time-line"></i></div>
                                <div class="stat-value" id="stat-time">0m</div>
                                <div class="stat-label">Time Spent</div>
                            </div>
                        </div>

                        <div class="analytics-row">
                            <div class="analytics-card">
                                <div class="card-header">
                                    <h3><i class="ri-pie-chart-line"></i> Skill Radar</h3>
                                </div>
                                <div class="card-body">
                                    <canvas id="skill-radar-chart" width="300" height="300"></canvas>
                                </div>
                            </div>

                            <div class="analytics-card">
                                <div class="card-header">
                                    <h3><i class="ri-calendar-check-line"></i> Weekly Summary</h3>
                                </div>
                                <div class="card-body">
                                    <div class="weekly-summary" id="weekly-summary"></div>
                                    <div class="activity-heatmap" id="activity-heatmap"></div>
                                </div>
                            </div>
                        </div>

                        <div class="analytics-card full-width">
                            <div class="card-header">
                                <h3><i class="ri-lightbulb-line"></i> Recommended For You</h3>
                            </div>
                            <div class="card-body">
                                <div class="recommendations-grid" id="recommendations-grid"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Achievements Tab -->
                    <div class="analytics-panel" id="panel-achievements">
                        <div class="achievements-progress">
                            <div class="progress-text">
                                <span id="achievements-unlocked">0</span> / <span id="achievements-total">0</span> Achievements
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="achievements-progress-bar"></div>
                            </div>
                        </div>
                        <div class="achievements-grid" id="achievements-grid"></div>
                    </div>

                    <!-- Journey Tab -->
                    <div class="analytics-panel" id="panel-journey">
                        <div class="journey-stats">
                            <div class="journey-stat">
                                <span class="journey-stat-value" id="journey-first-visit">-</span>
                                <span class="journey-stat-label">Started Learning</span>
                            </div>
                            <div class="journey-stat">
                                <span class="journey-stat-value" id="journey-longest-streak">0</span>
                                <span class="journey-stat-label">Longest Streak</span>
                            </div>
                            <div class="journey-stat">
                                <span class="journey-stat-value" id="journey-unique-projects">0</span>
                                <span class="journey-stat-label">Unique Projects</span>
                            </div>
                        </div>
                        <div class="learning-timeline" id="learning-timeline"></div>
                    </div>

                    <!-- Goals Tab -->
                    <div class="analytics-panel" id="panel-goals">
                        <div class="goals-header">
                            <h3>Your Learning Goals</h3>
                            <button class="btn-add-goal" id="btn-add-goal">
                                <i class="ri-add-line"></i> Add Goal
                            </button>
                        </div>
                        <div class="goals-list" id="goals-list"></div>

                        <!-- Add Goal Form -->
                        <div class="goal-form" id="goal-form" style="display: none;">
                            <div class="goal-form-header">
                                <h4>Set a New Goal</h4>
                                <button class="btn-close-form" id="btn-close-goal-form">
                                    <i class="ri-close-line"></i>
                                </button>
                            </div>
                            <div class="goal-form-body">
                                <div class="form-group">
                                    <label>Goal Description</label>
                                    <input type="text" id="goal-text" placeholder="e.g., Explore 5 game projects">
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Target</label>
                                        <input type="number" id="goal-target" value="5" min="1" max="100">
                                    </div>
                                    <div class="form-group">
                                        <label>Category (optional)</label>
                                        <select id="goal-category">
                                            <option value="">Any</option>
                                            <option value="game">Games</option>
                                            <option value="utility">Utilities</option>
                                            <option value="animation">Animations</option>
                                            <option value="education">Education</option>
                                            <option value="productivity">Productivity</option>
                                        </select>
                                    </div>
                                </div>
                                <button class="btn-save-goal" id="btn-save-goal">
                                    <i class="ri-check-line"></i> Create Goal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        this.dashboard = dashboard;
        this.overlay = dashboard.querySelector('.analytics-overlay');
    }

    attachEventListeners() {
        // Close button
        document.getElementById('btn-close-analytics').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        // Tab switching
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.closest('.analytics-tab').dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Export report
        document.getElementById('btn-export-report').addEventListener('click', () => this.exportReport());

        // Goals
        document.getElementById('btn-add-goal').addEventListener('click', () => this.showGoalForm());
        document.getElementById('btn-close-goal-form').addEventListener('click', () => this.hideGoalForm());
        document.getElementById('btn-save-goal').addEventListener('click', () => this.saveGoal());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.close();
            }
        });
    }

    switchTab(tabName) {
        this.activeTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update panels
        document.querySelectorAll('.analytics-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `panel-${tabName}`);
        });

        // Load tab-specific content
        this.loadTabContent(tabName);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'overview':
                this.loadOverview();
                break;
            case 'achievements':
                this.loadAchievements();
                break;
            case 'journey':
                this.loadJourney();
                break;
            case 'goals':
                this.loadGoals();
                break;
        }
    }

    loadOverview() {
        const stats = analyticsEngine.getStats();

        // Update stat cards
        document.getElementById('stat-projects-viewed').textContent = stats.uniqueProjects;
        document.getElementById('stat-categories').textContent = stats.categoriesExplored;
        document.getElementById('stat-streak').textContent = stats.currentStreak;
        document.getElementById('stat-time').textContent = analyticsEngine.formatTime(stats.totalTimeSpent);

        // Load radar chart
        this.renderRadarChart();

        // Load weekly summary
        this.renderWeeklySummary();

        // Load recommendations
        this.loadRecommendations();

        // Load activity heatmap
        this.renderActivityHeatmap();
    }

    renderRadarChart() {
        const canvas = document.getElementById('skill-radar-chart');
        const ctx = canvas.getContext('2d');
        const distribution = analyticsEngine.getCategoryDistribution();

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const categories = Object.keys(distribution);
        const values = Object.values(distribution);
        const maxValue = Math.max(...values, 1);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 40;

        // Draw background circles
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;

        for (let i = 1; i <= 4; i++) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * i / 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw category lines
        const angleStep = (Math.PI * 2) / categories.length;
        categories.forEach((cat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.stroke();

            // Draw labels
            const labelX = centerX + Math.cos(angle) * (radius + 25);
            const labelY = centerY + Math.sin(angle) * (radius + 25);
            ctx.fillStyle = isDark ? '#e0e0e0' : '#333';
            ctx.font = '12px system-ui';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cat.charAt(0).toUpperCase() + cat.slice(1), labelX, labelY);
        });

        // Draw data polygon
        ctx.beginPath();
        categories.forEach((cat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const value = distribution[cat] / maxValue;
            const x = centerX + Math.cos(angle) * radius * value;
            const y = centerY + Math.sin(angle) * radius * value;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw data points
        categories.forEach((cat, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const value = distribution[cat] / maxValue;
            const x = centerX + Math.cos(angle) * radius * value;
            const y = centerY + Math.sin(angle) * radius * value;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#6366f1';
            ctx.fill();
        });
    }

    renderWeeklySummary() {
        const summary = analyticsEngine.getWeeklySummary();
        const container = document.getElementById('weekly-summary');

        container.innerHTML = `
            <div class="weekly-stat">
                <span class="weekly-value">${summary.projectsViewed}</span>
                <span class="weekly-label">Views This Week</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-value">${summary.uniqueProjects}</span>
                <span class="weekly-label">Unique Projects</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-value">${summary.categoriesExplored}</span>
                <span class="weekly-label">Categories</span>
            </div>
            ${summary.topCategory ? `
                <div class="weekly-highlight">
                    <i class="ri-star-line"></i>
                    Top category: <strong>${summary.topCategory}</strong>
                </div>
            ` : ''}
        `;
    }

    renderActivityHeatmap() {
        const container = document.getElementById('activity-heatmap');
        const stats = analyticsEngine.getStats();
        const visitDates = new Set(stats.visitDates || []);

        // Generate last 30 days
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            days.push({
                date: dateStr,
                active: visitDates.has(dateStr),
                day: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
            });
        }

        container.innerHTML = `
            <div class="heatmap-label">Activity (Last 30 Days)</div>
            <div class="heatmap-grid">
                ${days.map(d => `
                    <div class="heatmap-cell ${d.active ? 'active' : ''}" 
                         title="${d.date}"></div>
                `).join('')}
            </div>
        `;
    }

    loadRecommendations() {
        const container = document.getElementById('recommendations-grid');
        const projects = window.projectManagerInstance?.state?.allProjects || [];
        const recommendations = analyticsEngine.getRecommendations(projects);

        if (recommendations.length === 0) {
            container.innerHTML = '<p class="no-recommendations">Start exploring projects to get personalized recommendations!</p>';
            return;
        }

        container.innerHTML = recommendations.map(project => `
            <div class="recommendation-card" onclick="window.location.href='${project.link}'">
                <div class="recommendation-icon">
                    <i class="${project.icon || 'ri-code-s-slash-line'}"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${this.escapeHtml(project.title)}</h4>
                    <span class="recommendation-category">${project.category || 'Project'}</span>
                </div>
            </div>
        `).join('');
    }

    loadAchievements() {
        const stats = analyticsEngine.getStats();
        const allAchievements = Object.values(analyticsEngine.achievements);
        const unlockedIds = new Set(stats.unlockedAchievements);

        // Update progress
        document.getElementById('achievements-unlocked').textContent = unlockedIds.size;
        document.getElementById('achievements-total').textContent = allAchievements.length;
        const progressPercent = (unlockedIds.size / allAchievements.length) * 100;
        document.getElementById('achievements-progress-bar').style.width = `${progressPercent}%`;

        // Render achievements grid
        const container = document.getElementById('achievements-grid');
        container.innerHTML = allAchievements.map(achievement => {
            const unlocked = unlockedIds.has(achievement.id);
            return `
                <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                    <div class="achievement-badge">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h4>${achievement.name}</h4>
                        <p>${achievement.description}</p>
                    </div>
                    ${unlocked ? '<div class="achievement-check"><i class="ri-check-line"></i></div>' : ''}
                </div>
            `;
        }).join('');
    }

    loadJourney() {
        const stats = analyticsEngine.getStats();

        // Update journey stats
        const firstVisit = stats.firstVisit ? new Date(stats.firstVisit).toLocaleDateString() : '-';
        document.getElementById('journey-first-visit').textContent = firstVisit;
        document.getElementById('journey-longest-streak').textContent = stats.longestStreak;
        document.getElementById('journey-unique-projects').textContent = stats.uniqueProjects;

        // Render learning timeline
        this.renderLearningTimeline(stats.learningPath);
    }

    renderLearningTimeline(learningPath) {
        const container = document.getElementById('learning-timeline');

        if (!learningPath || learningPath.length === 0) {
            container.innerHTML = '<p class="no-journey">Start exploring projects to build your learning journey!</p>';
            return;
        }

        // Group by date
        const grouped = {};
        learningPath.slice(-20).forEach(entry => {
            const date = entry.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(entry);
        });

        container.innerHTML = Object.entries(grouped).reverse().map(([date, entries]) => `
            <div class="timeline-day">
                <div class="timeline-date">${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                <div class="timeline-entries">
                    ${entries.map(entry => `
                        <div class="timeline-entry">
                            <span class="entry-category" data-category="${entry.category}">${entry.category}</span>
                            <span class="entry-title">${this.escapeHtml(entry.title)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    loadGoals() {
        const stats = analyticsEngine.getStats();
        const container = document.getElementById('goals-list');

        if (!stats.goals || stats.goals.length === 0) {
            container.innerHTML = '<p class="no-goals">No goals set yet. Create a goal to track your learning progress!</p>';
            return;
        }

        container.innerHTML = stats.goals.map(goal => {
            const progressPercent = Math.min((goal.progress / goal.target) * 100, 100);
            return `
                <div class="goal-card ${goal.completed ? 'completed' : ''}">
                    <div class="goal-header">
                        <h4>${this.escapeHtml(goal.text)}</h4>
                        <button class="btn-delete-goal" onclick="window.analyticsDashboard.deleteGoal(${goal.id})">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress-bar">
                            <div class="goal-progress-fill" style="width: ${progressPercent}%"></div>
                        </div>
                        <span class="goal-progress-text">${goal.progress} / ${goal.target}</span>
                    </div>
                    ${goal.category ? `<span class="goal-category">${goal.category}</span>` : ''}
                    ${goal.completed ? '<div class="goal-completed-badge"><i class="ri-check-double-line"></i> Completed!</div>' : ''}
                </div>
            `;
        }).join('');
    }

    showGoalForm() {
        document.getElementById('goal-form').style.display = 'block';
        document.getElementById('goal-text').focus();
    }

    hideGoalForm() {
        document.getElementById('goal-form').style.display = 'none';
        document.getElementById('goal-text').value = '';
        document.getElementById('goal-target').value = '5';
        document.getElementById('goal-category').value = '';
    }

    saveGoal() {
        const text = document.getElementById('goal-text').value.trim();
        const target = parseInt(document.getElementById('goal-target').value) || 5;
        const category = document.getElementById('goal-category').value;

        if (!text) {
            alert('Please enter a goal description');
            return;
        }

        analyticsEngine.addGoal({ text, target, category: category || null });
        this.hideGoalForm();
        this.loadGoals();
    }

    deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal?')) {
            analyticsEngine.deleteGoal(goalId);
            this.loadGoals();
        }
    }

    exportReport() {
        const data = analyticsEngine.exportData();
        const stats = data.stats;

        // Create HTML report
        const reportHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>OpenPlayground Learning Report</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        h1 { color: #6366f1; }
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
        .stat { background: #f5f5f5; padding: 20px; border-radius: 12px; text-align: center; }
        .stat-value { font-size: 32px; font-weight: bold; color: #6366f1; }
        .stat-label { color: #666; margin-top: 8px; }
        .section { margin: 32px 0; }
        .achievement { display: flex; align-items: center; gap: 12px; padding: 12px; background: #f5f5f5; border-radius: 8px; margin: 8px 0; }
        .badge { font-size: 24px; }
        .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <h1>🎓 Learning Report</h1>
    <p>Generated on ${new Date().toLocaleDateString()}</p>
    
    <div class="stat-grid">
        <div class="stat">
            <div class="stat-value">${stats.uniqueProjects}</div>
            <div class="stat-label">Projects Explored</div>
        </div>
        <div class="stat">
            <div class="stat-value">${stats.categoriesExplored}</div>
            <div class="stat-label">Categories</div>
        </div>
        <div class="stat">
            <div class="stat-value">${stats.longestStreak}</div>
            <div class="stat-label">Longest Streak</div>
        </div>
        <div class="stat">
            <div class="stat-value">${analyticsEngine.formatTime(stats.totalTimeSpent)}</div>
            <div class="stat-label">Time Spent</div>
        </div>
    </div>
    
    <div class="section">
        <h2>🏆 Achievements Unlocked (${data.achievements.length})</h2>
        ${data.achievements.map(a => `
            <div class="achievement">
                <span class="badge">${a.icon}</span>
                <div>
                    <strong>${a.name}</strong>
                    <div style="color: #666">${a.description}</div>
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="section">
        <h2>📊 Category Breakdown</h2>
        ${Object.entries(stats.categoryViews).map(([cat, count]) => `
            <div style="margin: 8px 0;">
                <strong>${cat}:</strong> ${count} projects
            </div>
        `).join('')}
    </div>
    
    <div class="footer">
        <p>OpenPlayground - Your Learning Journey</p>
        <p>All data stored locally. Privacy-first analytics.</p>
    </div>
</body>
</html>`;

        // Download as HTML
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `learning-report-${new Date().toISOString().split('T')[0]}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    open() {
        this.isOpen = true;
        this.dashboard.classList.add('open');
        this.loadTabContent(this.activeTab);
    }

    close() {
        this.isOpen = false;
        this.dashboard.classList.remove('open');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}

// Export singleton
const analyticsDashboard = new AnalyticsDashboard();
window.analyticsDashboard = analyticsDashboard; // For goal deletion
export { analyticsDashboard, AnalyticsDashboard };
