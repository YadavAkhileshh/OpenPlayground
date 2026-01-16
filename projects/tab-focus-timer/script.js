// Tab Focus Timer - Dynamic Version
class TabFocusTimer {
    constructor() {
        this.userId = this.getUserId();
        this.tabs = this.loadTabs();
        this.settings = this.loadSettings();
        this.activities = this.loadActivities();
        this.sessionStartTime = null;
        this.isPaused = false;
        this.activeTabId = null;
        this.timers = {};
        
        this.init();
    }
    
    getUserId() {
        let userId = localStorage.getItem('tabFocus_userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tabFocus_userId', userId);
        }
        return userId;
    }
    
    loadTabs() {
        const tabs = JSON.parse(localStorage.getItem(`tabFocus_tabs_${this.userId}`)) || [];
        // Reset active state on page load
        return tabs.map(tab => ({
            ...tab,
            isActive: false,
            isPaused: true
        }));
    }
    
    loadSettings() {
        return JSON.parse(localStorage.getItem(`tabFocus_settings_${this.userId}`)) || {
            reminders: true,
            autoPause: true,
            autoExport: false
        };
    }
    
    loadActivities() {
        return JSON.parse(localStorage.getItem(`tabFocus_activities_${this.userId}`)) || [];
    }
    
    saveTabs() {
        localStorage.setItem(`tabFocus_tabs_${this.userId}`, JSON.stringify(this.tabs));
    }
    
    saveSettings() {
        localStorage.setItem(`tabFocus_settings_${this.userId}`, JSON.stringify(this.settings));
    }
    
    saveActivities() {
        // Keep only last 100 activities
        if (this.activities.length > 100) {
            this.activities = this.activities.slice(-100);
        }
        localStorage.setItem(`tabFocus_activities_${this.userId}`, JSON.stringify(this.activities));
    }
    
    init() {
        this.setupEventListeners();
        this.renderTabs();
        this.updateStats();
        this.renderActivities();
        this.updateSettingsUI();
        this.startSessionTimer();
        
        // Start timers for active tabs
        this.tabs.forEach(tab => {
            if (tab.isActive && !tab.isPaused) {
                this.startTabTimer(tab.id);
            }
        });
    }
    
    setupEventListeners() {
        // Tab buttons
        document.getElementById('addTabBtn').addEventListener('click', () => this.showTabModal());
        document.getElementById('addFirstTabBtn').addEventListener('click', () => this.showTabModal());
        document.getElementById('saveTabBtn').addEventListener('click', () => this.saveTab());
        document.getElementById('cancelTabBtn').addEventListener('click', () => this.hideTabModal());
        document.getElementById('closeTabModal').addEventListener('click', () => this.hideTabModal());
        
        // Session controls
        document.getElementById('pauseAllBtn').addEventListener('click', () => this.pauseAllTabs());
        document.getElementById('resumeAllBtn').addEventListener('click', () => this.resumeAllTabs());
        
        // Settings
        document.getElementById('remindersToggle').addEventListener('change', (e) => this.updateSetting('reminders', e.target.checked));
        document.getElementById('autoPauseToggle').addEventListener('change', (e) => this.updateSetting('autoPause', e.target.checked));
        document.getElementById('autoExportToggle').addEventListener('change', (e) => this.updateSetting('autoExport', e.target.checked));
        
        // Clear history
        document.getElementById('clearHistoryBtn').addEventListener('click', () => this.clearHistory());
        
        // Close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
        
        // Close modal with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideAllModals();
            }
        });
    }
    
    showTabModal() {
        document.getElementById('tabModal').classList.add('active');
        document.getElementById('tabTitle').value = '';
        document.getElementById('tabUrl').value = '';
        document.getElementById('focusGoal').value = '60';
        document.getElementById('tabTitle').focus();
    }
    
    hideTabModal() {
        document.getElementById('tabModal').classList.remove('active');
    }
    
    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    saveTab() {
        const title = document.getElementById('tabTitle').value.trim();
        const url = document.getElementById('tabUrl').value.trim();
        const goal = parseInt(document.getElementById('focusGoal').value) || 60;
        
        if (!title) {
            this.showToast('Please enter a title for your tab');
            return;
        }
        
        if (goal < 1 || goal > 480) {
            this.showToast('Please set a goal between 1 and 480 minutes');
            return;
        }
        
        const newTab = {
            id: Date.now().toString(),
            title: title,
            url: url || '',
            goal: goal,
            elapsed: 0, // in seconds
            isActive: true,
            isPaused: false,
            createdAt: new Date().toISOString(),
            sessions: []
        };
        
        this.tabs.push(newTab);
        this.saveTabs();
        this.hideTabModal();
        
        // Start timer for this tab
        this.startTabTimer(newTab.id);
        
        // Add activity
        this.addActivity(`Started tracking "${title}"`, 'tab-add');
        
        // Update UI
        this.renderTabs();
        this.updateStats();
        
        this.showToast(`Started tracking "${title}"`);
    }
    
    deleteTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        if (!confirm(`Stop tracking "${tab.title}"?`)) {
            return;
        }
        
        // Stop timer if running
        if (this.timers[tabId]) {
            clearInterval(this.timers[tabId]);
            delete this.timers[tabId];
        }
        
        // Remove tab
        this.tabs = this.tabs.filter(t => t.id !== tabId);
        this.saveTabs();
        
        // Add activity
        this.addActivity(`Stopped tracking "${tab.title}"`, 'tab-remove');
        
        // Update UI
        this.renderTabs();
        this.updateStats();
        
        this.showToast(`Stopped tracking "${tab.title}"`);
    }
    
    toggleTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        if (tab.isPaused) {
            this.resumeTab(tabId);
        } else {
            this.pauseTab(tabId);
        }
    }
    
    pauseTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab || tab.isPaused) return;
        
        tab.isPaused = true;
        tab.sessions.push({
            start: this.getCurrentSessionTime(),
            end: Date.now(),
            duration: Math.floor((Date.now() - this.getCurrentSessionTime()) / 1000)
        });
        
        // Stop timer
        if (this.timers[tabId]) {
            clearInterval(this.timers[tabId]);
            delete this.timers[tabId];
        }
        
        this.saveTabs();
        this.renderTabs();
        this.addActivity(`Paused "${tab.title}"`, 'pause');
        
        this.showToast(`Paused "${tab.title}"`);
    }
    
    resumeTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab || !tab.isPaused) return;
        
        tab.isPaused = false;
        this.startTabTimer(tabId);
        this.saveTabs();
        this.renderTabs();
        this.addActivity(`Resumed "${tab.title}"`, 'play');
        
        this.showToast(`Resumed "${tab.title}"`);
    }
    
    pauseAllTabs() {
        this.tabs.forEach(tab => {
            if (!tab.isPaused) {
                this.pauseTab(tab.id);
            }
        });
        
        document.getElementById('pauseAllBtn').style.display = 'none';
        document.getElementById('resumeAllBtn').style.display = 'flex';
    }
    
    resumeAllTabs() {
        this.tabs.forEach(tab => {
            if (tab.isPaused) {
                this.resumeTab(tab.id);
            }
        });
        
        document.getElementById('pauseAllBtn').style.display = 'flex';
        document.getElementById('resumeAllBtn').style.display = 'none';
    }
    
    startTabTimer(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        // Clear existing timer
        if (this.timers[tabId]) {
            clearInterval(this.timers[tabId]);
        }
        
        // Start new timer
        this.timers[tabId] = setInterval(() => {
            const tab = this.tabs.find(t => t.id === tabId);
            if (tab && !tab.isPaused) {
                tab.elapsed += 1;
                this.updateTabDisplay(tabId);
                this.updateStats();
                
                // Check if goal is reached
                if (tab.goal > 0 && tab.elapsed >= tab.goal * 60) {
                    this.handleGoalReached(tabId);
                }
            }
        }, 1000);
    }
    
    updateTabDisplay(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        const tabElement = document.querySelector(`[data-tab-id="${tabId}"]`);
        if (tabElement) {
            const timeElement = tabElement.querySelector('.tab-time');
            const goalElement = tabElement.querySelector('.tab-goal');
            
            if (timeElement) {
                timeElement.textContent = this.formatTime(tab.elapsed);
            }
            
            if (goalElement) {
                const percentage = Math.min(100, Math.round((tab.elapsed / (tab.goal * 60)) * 100));
                goalElement.textContent = `${percentage}% of ${tab.goal}min goal`;
                
                if (percentage >= 100) {
                    goalElement.classList.add('completed');
                } else {
                    goalElement.classList.remove('completed');
                }
            }
        }
    }
    
    handleGoalReached(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        this.addActivity(`🎉 Reached goal for "${tab.title}"!`, 'trophy');
        this.showToast(`🎉 Goal reached for "${tab.title}"!`);
        
        // Optional: Auto-pause when goal is reached
        if (this.settings.autoPause) {
            this.pauseTab(tabId);
        }
    }
    
    renderTabs() {
        const container = document.getElementById('tabsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (this.tabs.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = '';
        
        this.tabs.forEach(tab => {
            const percentage = tab.goal > 0 ? Math.min(100, Math.round((tab.elapsed / (tab.goal * 60)) * 100)) : 0;
            
            const tabCard = document.createElement('div');
            tabCard.className = `tab-card ${tab.isPaused ? 'paused' : 'active'}`;
            tabCard.setAttribute('data-tab-id', tab.id);
            
            tabCard.innerHTML = `
                <button class="tab-delete-btn" title="Stop Tracking">
                    <i class="fas fa-times"></i>
                </button>
                <div class="tab-header">
                    <div>
                        <div class="tab-title">${tab.title}</div>
                        ${tab.url ? `<div class="tab-url">${tab.url}</div>` : ''}
                    </div>
                </div>
                <div class="tab-timer">
                    <div class="tab-time">${this.formatTime(tab.elapsed)}</div>
                    ${tab.goal > 0 ? 
                        `<div class="tab-goal ${percentage >= 100 ? 'completed' : ''}">
                            ${percentage}% of ${tab.goal}min goal
                        </div>` 
                        : ''
                    }
                </div>
                <div class="tab-actions">
                    <button class="btn ${tab.isPaused ? 'success' : 'secondary'} toggle-btn">
                        <i class="fas fa-${tab.isPaused ? 'play' : 'pause'}"></i>
                        ${tab.isPaused ? 'Resume' : 'Pause'}
                    </button>
                </div>
            `;
            
            container.appendChild(tabCard);
            
            // Add event listeners
            const deleteBtn = tabCard.querySelector('.tab-delete-btn');
            const toggleBtn = tabCard.querySelector('.toggle-btn');
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTab(tab.id);
            });
            
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleTab(tab.id);
            });
            
            // Make entire card clickable to resume if paused
            if (tab.isPaused) {
                tabCard.addEventListener('click', (e) => {
                    if (!e.target.closest('.tab-delete-btn') && !e.target.closest('.toggle-btn')) {
                        this.resumeTab(tab.id);
                    }
                });
            }
        });
    }
    
    updateStats() {
        // Update total focus time
        const totalSeconds = this.tabs.reduce((sum, tab) => sum + tab.elapsed, 0);
        document.getElementById('totalFocusTime').textContent = this.formatTime(totalSeconds);
        
        // Update active tabs count
        const activeTabs = this.tabs.filter(tab => !tab.isPaused).length;
        document.getElementById('activeTabsCount').textContent = activeTabs;
        
        // Update average focus per tab
        const avgSeconds = this.tabs.length > 0 ? Math.floor(totalSeconds / this.tabs.length) : 0;
        document.getElementById('avgFocusPerTab').textContent = this.formatTime(avgSeconds, true);
        
        // Update productivity score (simple calculation)
        const totalGoalSeconds = this.tabs.reduce((sum, tab) => sum + (tab.goal * 60), 0);
        const productivity = totalGoalSeconds > 0 ? Math.min(100, Math.round((totalSeconds / totalGoalSeconds) * 100)) : 0;
        document.getElementById('productivityScore').textContent = `${productivity}%`;
    }
    
    startSessionTimer() {
        this.sessionStartTime = Date.now();
        
        setInterval(() => {
            if (!this.isPaused) {
                const elapsed = Date.now() - this.sessionStartTime;
                document.getElementById('currentSessionTime').textContent = 
                    this.formatTime(Math.floor(elapsed / 1000));
            }
        }, 1000);
    }
    
    renderActivities() {
        const container = document.getElementById('activityList');
        container.innerHTML = '';
        
        if (this.activities.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <div class="activity-text">Add tabs to start tracking</div>
                    <div class="activity-time">Now</div>
                </div>
            `;
            return;
        }
        
        // Show only last 10 activities
        const recentActivities = this.activities.slice(-10).reverse();
        
        recentActivities.forEach(activity => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            let icon = 'fa-info-circle';
            if (activity.type === 'tab-add') icon = 'fa-plus-circle';
            else if (activity.type === 'tab-remove') icon = 'fa-minus-circle';
            else if (activity.type === 'pause') icon = 'fa-pause-circle';
            else if (activity.type === 'play') icon = 'fa-play-circle';
            else if (activity.type === 'trophy') icon = 'fa-trophy';
            
            const timeAgo = this.getTimeAgo(activity.timestamp);
            
            item.innerHTML = `
                <i class="fas ${icon}"></i>
                <div class="activity-text">${activity.message}</div>
                <div class="activity-time">${timeAgo}</div>
            `;
            
            container.appendChild(item);
        });
    }
    
    addActivity(message, type = 'info') {
        const activity = {
            message: message,
            type: type,
            timestamp: Date.now()
        };
        
        this.activities.push(activity);
        this.saveActivities();
        this.renderActivities();
    }
    
    clearHistory() {
        if (confirm('Clear all activity history?')) {
            this.activities = [];
            this.saveActivities();
            this.renderActivities();
            this.showToast('Activity history cleared');
        }
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        this.showToast(`${key} ${value ? 'enabled' : 'disabled'}`);
    }
    
    updateSettingsUI() {
        document.getElementById('remindersToggle').checked = this.settings.reminders;
        document.getElementById('autoPauseToggle').checked = this.settings.autoPause;
        document.getElementById('autoExportToggle').checked = this.settings.autoExport;
    }
    
    // Helper Methods
    formatTime(seconds, short = false) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (short && hrs === 0) {
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }
    
    getCurrentSessionTime() {
        return this.sessionStartTime;
    }
    
    showToast(message) {
        const toast = document.getElementById('toast');
        const messageEl = toast.querySelector('.toast-message');
        
        messageEl.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new TabFocusTimer();
});