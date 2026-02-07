import Store from './store.js';

export default class AnalyticsDashboard {
    constructor() {
        this.store = new Store('zenith_analytics');
        this.container = document.getElementById('analytics-chart');
        this.totalEl = document.getElementById('total-focus-time');
        this.dashboardGrid = document.querySelector('#view-analytics .dashboard-grid');

        // Listen for updates
        window.addEventListener('zenith:session-complete', () => this.render());

        // Initial Render
        this.render();
    }

    render() {
        const history = this.store.get('history', {});
        const weekData = this.getLast7Days(history);
        const stats = this.calculateStats(history);

        this.renderChart(weekData);
        this.renderStats(stats);
    }

    calculateStats(history) {
        let totalMinutes = 0;
        let streak = 0;
        let maxStreak = 0;
        let currentStreak = 0;

        // Convert history dict to sorted array of dates
        const dates = Object.keys(history).sort();

        dates.forEach(date => {
            totalMinutes += history[date];
        });

        // Calculate Streak (Simplified)
        // Check consecutive days backwards from today
        const today = new Date();
        let d = new Date(today);
        let checkDateStr = d.toISOString().split('T')[0];

        while (history[checkDateStr] > 0) {
            currentStreak++;
            d.setDate(d.getDate() - 1);
            checkDateStr = d.toISOString().split('T')[0];
        }

        const avg = dates.length > 0 ? Math.round(totalMinutes / dates.length) : 0;

        return {
            totalMinutes,
            currentStreak,
            avgDaily: avg
        };
    }

    renderStats(stats) {
        // Update Total Time Main Card
        const hrs = Math.floor(stats.totalMinutes / 60);
        const mins = stats.totalMinutes % 60;
        this.totalEl.textContent = `${hrs}h ${mins}m`;

        // Inject Additional Cards if not present
        if (!document.getElementById('stat-streak')) {
            const extraStats = document.createElement('div');
            extraStats.className = 'stats-grid';
            extraStats.style.gridColumn = 'span 3';

            extraStats.innerHTML = `
                <div class="stat-card" id="stat-streak">
                    <span class="stat-label">Current Streak</span>
                    <span class="stat-value" id="val-streak">0</span>
                    <div class="heatmap">
                        <div class="heat-box active-3"></div>
                        <div class="heat-box active-2"></div>
                        <div class="heat-box"></div>
                    </div>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Daily Average</span>
                    <span class="stat-value" id="val-avg">0m</span>
                </div>
            `;
            // Append after existing content
            this.dashboardGrid.appendChild(extraStats);
        }

        // Update Values
        const streakEl = document.getElementById('val-streak');
        if (streakEl) streakEl.textContent = `${stats.currentStreak} Days`;

        const avgEl = document.getElementById('val-avg');
        if (avgEl) avgEl.textContent = `${stats.avgDaily}m`;
    }

    renderChart(weekData) {
        this.container.innerHTML = '';
        const maxVal = Math.max(...weekData.map(d => d.minutes), 60);

        weekData.forEach(day => {
            const group = document.createElement('div');
            group.className = 'bar-group';

            const height = (day.minutes / maxVal) * 100;

            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${height}%`;
            bar.title = `${day.minutes} mins`;

            // Color code intensity
            if (day.minutes > 120) bar.style.background = 'var(--accent)';

            const label = document.createElement('div');
            label.className = 'bar-label';
            label.textContent = day.label;

            group.appendChild(bar);
            group.appendChild(label);
            this.container.appendChild(group);
        });
    }

    getLast7Days(history) {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

            days.push({
                date: dateStr,
                label: dayLabel,
                minutes: history[dateStr] || 0
            });
        }
        return days;
    }
}
