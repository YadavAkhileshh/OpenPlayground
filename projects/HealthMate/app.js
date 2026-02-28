// HealthMate - Personal Wellness Dashboard
// Author: Ayaanshaikh12243
// Description: Aggregates health data, visualizes trends, tracks goals, offers tips and reminders

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
// Models
// =====================
class HealthData {
    constructor({type, value, date, source}) {
        this.id = Utils.generateId();
        this.type = type; // steps, calories, sleep, water, etc.
        this.value = value;
        this.date = date || new Date();
        this.source = source || 'manual';
    }
}

class Goal {
    constructor({type, target, period}) {
        this.id = Utils.generateId();
        this.type = type; // steps, calories, sleep, etc.
        this.target = target;
        this.period = period || 'daily';
        this.progress = 0;
        this.completed = false;
    }
}

class Tip {
    constructor({text}) {
        this.id = Utils.generateId();
        this.text = text;
    }
}

class Reminder {
    constructor({text, time}) {
        this.id = Utils.generateId();
        this.text = text;
        this.time = time;
        this.shown = false;
    }
}

// =====================
// Main Dashboard Class
// =====================
class HealthMate {
    constructor() {
        this.data = [];
        this.goals = [];
        this.tips = [];
        this.reminders = [];
        this.load();
    }

    addHealthData(entry) {
        const data = new HealthData(entry);
        this.data.push(data);
        this.save();
        return data;
    }

    addGoal(goal) {
        const g = new Goal(goal);
        this.goals.push(g);
        this.save();
        return g;
    }

    addTip(text) {
        const tip = new Tip({text});
        this.tips.push(tip);
        this.save();
        return tip;
    }

    addReminder(text, time) {
        const reminder = new Reminder({text, time});
        this.reminders.push(reminder);
        this.save();
        return reminder;
    }

    getDataByType(type) {
        return this.data.filter(d => d.type === type);
    }

    getGoalProgress(goal) {
        const relevant = this.data.filter(d => d.type === goal.type);
        let sum = 0;
        if (goal.period === 'daily') {
            const today = new Date().toDateString();
            sum = relevant.filter(d => new Date(d.date).toDateString() === today)
                .reduce((acc, d) => acc + Number(d.value), 0);
        } else {
            sum = relevant.reduce((acc, d) => acc + Number(d.value), 0);
        }
        return sum;
    }

    updateGoalProgress() {
        this.goals.forEach(goal => {
            goal.progress = this.getGoalProgress(goal);
            goal.completed = goal.progress >= goal.target;
        });
        this.save();
    }

    getPersonalizedTips() {
        // Simple: suggest based on missing goals
        this.updateGoalProgress();
        const tips = [];
        this.goals.forEach(goal => {
            if (!goal.completed) {
                tips.push(`Try to reach your ${goal.type} goal of ${goal.target} (${goal.period})!`);
            }
        });
        if (this.data.length === 0) tips.push('Start logging your health data for better insights!');
        return tips.concat(this.tips.map(t => t.text));
    }

    save() {
        localStorage.setItem('healthmate_data', JSON.stringify({
            data: this.data,
            goals: this.goals,
            tips: this.tips,
            reminders: this.reminders
        }));
    }
    load() {
        const data = localStorage.getItem('healthmate_data');
        if (data) {
            const parsed = JSON.parse(data);
            this.data = parsed.data || [];
            this.goals = parsed.goals || [];
            this.tips = parsed.tips || [];
            this.reminders = parsed.reminders || [];
        }
    }
}

// =====================
// Notifications
// =====================
class Notifier {
    static show(message) {
        const notif = document.getElementById('notifications');
        if (!notif) return;
        notif.textContent = message;
        notif.style.display = 'block';
        setTimeout(() => { notif.style.display = 'none'; }, 2500);
    }
}

// =====================
// Simple Chart Renderer (text-based)
// =====================
class ChartRenderer {
    static renderBarChart(container, data, label) {
        if (!container) return;
        container.innerHTML = '';
        if (data.length === 0) {
            container.innerHTML = '<em>No data to display.</em>';
            return;
        }
        const max = Math.max(...data.map(d => d.value));
        data.forEach(d => {
            const bar = document.createElement('div');
            bar.style.background = '#2d7ff9';
            bar.style.height = '24px';
            bar.style.width = `${(d.value / max) * 100}%`;
            bar.style.marginBottom = '6px';
            bar.style.borderRadius = '6px';
            bar.style.color = '#fff';
            bar.style.display = 'flex';
            bar.style.alignItems = 'center';
            bar.style.paddingLeft = '10px';
            bar.textContent = `${label}: ${d.value} (${Utils.formatDate(d.date)})`;
            container.appendChild(bar);
        });
    }
}

// =====================
// UI Rendering
// =====================
class UI {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.renderAll();
        this.bindEvents();
        this.startReminders();
    }
    renderAll() {
        this.renderHealthData();
        this.renderCharts();
        this.renderGoals();
        this.renderTips();
        this.renderReminders();
    }
    renderHealthData() {
        const container = document.getElementById('health-data');
        if (!container) return;
        container.innerHTML = '';
        this.dashboard.data.forEach(d => {
            const div = document.createElement('div');
            div.className = 'data-item';
            div.innerHTML = `<b>${d.type}</b>: ${d.value} <span>(${Utils.formatDate(d.date)}) [${d.source}]</span>`;
            container.appendChild(div);
        });
    }
    renderCharts() {
        const container = document.getElementById('charts');
        if (!container) return;
        // Example: show steps and sleep
        const steps = this.dashboard.getDataByType('steps');
        const sleep = this.dashboard.getDataByType('sleep');
        container.innerHTML = '<h4>Steps</h4>';
        ChartRenderer.renderBarChart(container, steps, 'Steps');
        container.innerHTML += '<h4>Sleep (hours)</h4>';
        ChartRenderer.renderBarChart(container, sleep, 'Sleep');
    }
    renderGoals() {
        this.dashboard.updateGoalProgress();
        const container = document.getElementById('goals-list');
        if (!container) return;
        container.innerHTML = '';
        this.dashboard.goals.forEach(goal => {
            const div = document.createElement('div');
            div.className = 'goal-item';
            div.innerHTML = `<b>${goal.type}</b>: ${goal.progress}/${goal.target} (${goal.period}) <span>${goal.completed ? '✅' : ''}</span>`;
            container.appendChild(div);
        });
    }
    renderTips() {
        const container = document.getElementById('tips-list');
        if (!container) return;
        container.innerHTML = '';
        this.dashboard.getPersonalizedTips().forEach(tip => {
            const div = document.createElement('div');
            div.className = 'tip-item';
            div.textContent = tip;
            container.appendChild(div);
        });
    }
    renderReminders() {
        const container = document.getElementById('reminders-list');
        if (!container) return;
        container.innerHTML = '';
        this.dashboard.reminders.forEach(rem => {
            const div = document.createElement('div');
            div.className = 'reminder-item';
            div.textContent = `${rem.text} at ${rem.time}`;
            container.appendChild(div);
        });
    }
    bindEvents() {
        // Connect Tracker (simulate import)
        document.getElementById('connect-tracker-btn')?.addEventListener('click', () => {
            const type = prompt('Data type to import (steps, calories, sleep, water):');
            const value = prompt('Value:');
            if (type && value) {
                this.dashboard.addHealthData({type, value, source: 'tracker'});
                this.renderAll();
                Notifier.show('Tracker data imported!');
            }
        });
        // Manual Log
        document.getElementById('log-manual-btn')?.addEventListener('click', () => {
            const type = prompt('Data type (steps, calories, sleep, water, etc.):');
            const value = prompt('Value:');
            if (type && value) {
                this.dashboard.addHealthData({type, value, source: 'manual'});
                this.renderAll();
                Notifier.show('Manual data logged!');
            }
        });
        // Set Goal
        document.getElementById('set-goal-btn')?.addEventListener('click', () => {
            const type = prompt('Goal type (steps, calories, sleep, etc.):');
            const target = prompt('Target value:');
            const period = prompt('Period (daily, weekly, monthly):', 'daily');
            if (type && target) {
                this.dashboard.addGoal({type, target, period});
                this.renderGoals();
                Notifier.show('Goal set!');
            }
        });
        // Export Data
        document.getElementById('export-btn')?.addEventListener('click', () => {
            const data = JSON.stringify(this.dashboard.data, null, 2);
            const blob = new Blob([data], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'healthmate_data.json';
            a.click();
            Notifier.show('Data exported!');
        });
    }
    startReminders() {
        setInterval(() => {
            const now = new Date();
            this.dashboard.reminders.forEach(rem => {
                if (!rem.shown && rem.time) {
                    const [h, m] = rem.time.split(':').map(Number);
                    if (now.getHours() === h && now.getMinutes() === m) {
                        Notifier.show(rem.text);
                        rem.shown = true;
                        this.dashboard.save();
                    }
                }
            });
        }, 60000); // check every minute
    }
}

// =====================
// Main App Initialization
// =====================
window.addEventListener('DOMContentLoaded', () => {
    const dashboard = new HealthMate();
    const ui = new UI(dashboard);
});
