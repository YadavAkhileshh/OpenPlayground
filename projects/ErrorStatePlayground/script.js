class ErrorStatesPlayground {
    constructor() {
        this.errorHistory = [];
        this.errorCount = 0;
        this.isDarkMode = false;
        this.initializeElements();
        this.bindEvents();
        this.loadFromStorage();
        this.updateUI();
    }

    initializeElements() {
        // UI Elements
        this.errorDisplay = document.getElementById('errorDisplay');
        this.historyList = document.getElementById('historyList');
        this.statusText = document.getElementById('statusText');
        this.statusDot = document.getElementById('statusDot');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.errorCountEl = document.getElementById('errorCount');
        this.themeToggle = document.getElementById('themeToggle');
        this.notificationContainer = document.getElementById('notificationContainer');
        
        // Buttons
        this.errorButtons = document.querySelectorAll('[data-error]');
        this.demoErrorBtn = document.getElementById('demoError');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        this.exportLogsBtn = document.getElementById('exportLogs');
        
        // Settings
        this.autoRetry = document.getElementById('autoRetry');
        this.notifications = document.getElementById('notifications');
        this.delaySelect = document.getElementById('delaySelect');
    }

    bindEvents() {
        // Error simulation buttons
        this.errorButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const errorType = e.currentTarget.dataset.error;
                this.simulateError(errorType);
            });
        });

        // Demo error
        this.demoErrorBtn?.addEventListener('click', () => {
            const errorTypes = ['network', 'server', 'validation', 'permission'];
            const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
            this.simulateError(randomType);
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Clear history
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());

        // Export logs
        this.exportLogsBtn.addEventListener('click', () => this.exportLogs());

        // Settings changes
        this.autoRetry.addEventListener('change', () => this.saveSettings());
        this.notifications.addEventListener('change', () => this.saveSettings());
        this.delaySelect.addEventListener('change', () => this.saveSettings());
    }

    simulateError(type) {
        this.errorCount++;
        const delay = parseInt(this.delaySelect.value);
        
        // Update status
        this.updateStatus('simulating', `Simulating ${type} error...`);
        
        // Clear existing error display
        this.errorDisplay.innerHTML = '';
        this.errorDisplay.classList.add('active');
        
        // Simulate network delay
        setTimeout(() => {
            switch(type) {
                case 'network':
                    this.showNetworkError();
                    break;
                case 'empty':
                    this.showEmptyState();
                    break;
                case 'permission':
                    this.showPermissionError();
                    break;
                case 'loading':
                    this.showLoadingError();
                    break;
                case 'server':
                    this.showServerError();
                    break;
                case 'validation':
                    this.showValidationError();
                    break;
            }
            
            // Add to history
            this.addToHistory(type);
            this.updateStatus('ready', 'Ready');
            
            // Show notification
            if (this.notifications.checked) {
                this.showNotification(`${type.replace(/\b\w/g, l => l.toUpperCase())} error simulated`, 'info');
            }
        }, delay);
    }

    showNetworkError() {
        const html = `
            <div class="error-state">
                <div class="error-icon error">
                    <i class="ri-wifi-off-line"></i>
                </div>
                <h2 class="error-title">Connection Error</h2>
                <p class="error-message">
                    Unable to connect to the server. Please check your internet connection and try again.
                </p>
                <div class="error-actions">
                    <button class="btn primary" onclick="app.retryConnection()">
                        <i class="ri-refresh-line"></i> Retry Connection
                    </button>
                    <button class="btn secondary" onclick="app.checkNetwork()">
                        <i class="ri-wifi-line"></i> Check Network
                    </button>
                    <button class="btn secondary" onclick="app.simulateError('network')">
                        <i class="ri-restart-line"></i> Simulate Again
                    </button>
                </div>
            </div>
        `;
        this.errorDisplay.innerHTML = html;
    }

    showEmptyState() {
        const html = `
            <div class="error-state">
                <div class="error-icon">
                    <i class="ri-inbox-line"></i>
                </div>
                <h2 class="error-title">No Projects Found</h2>
                <p class="error-message">
                    You haven't created any projects yet. Start by creating your first project to organize your work.
                </p>
                <div class="error-actions">
                    <button class="btn primary" onclick="app.createFirstProject()">
                        <i class="ri-add-line"></i> Create First Project
                    </button>
                    <button class="btn secondary" onclick="app.importData()">
                        <i class="ri-upload-line"></i> Import Data
                    </button>
                    <button class="btn secondary" onclick="app.simulateError('empty')">
                        <i class="ri-restart-line"></i> Simulate Again
                    </button>
                </div>
            </div>
        `;
        this.errorDisplay.innerHTML = html;
    }

    showPermissionError() {
        const html = `
            <div class="error-state">
                <div class="error-icon error">
                    <i class="ri-shield-flash-line"></i>
                </div>
                <h2 class="error-title">Access Denied</h2>
                <p class="error-message">
                    You don't have permission to access this resource. Please contact your administrator for assistance.
                </p>
                <div class="error-actions">
                    <button class="btn primary" onclick="app.requestAccess()">
                        <i class="ri-shield-user-line"></i> Request Access
                    </button>
                    <button class="btn secondary" onclick="app.goBack()">
                        <i class="ri-arrow-left-line"></i> Go Back
                    </button>
                    <button class="btn secondary" onclick="app.simulateError('permission')">
                        <i class="ri-restart-line"></i> Simulate Again
                    </button>
                </div>
            </div>
        `;
        this.errorDisplay.innerHTML = html;
    }

    showLoadingError() {
        const html = `
            <div class="error-state">
                <div class="error-icon warning">
                    <i class="ri-time-line"></i>
                </div>
                <h2 class="error-title">Loading Failed</h2>
                <p class="error-message">
                    The content failed to load. This might be due to server issues or a poor network connection.
                </p>
                <div class="error-actions">
                    <button class="btn primary" onclick="app.retryLoading()">
                        <i class="ri-restart-line"></i> Try Again
                    </button>
                    <button class="btn secondary" onclick="app.loadCached()">
                        <i class="ri-download-line"></i> Load Cached Version
                    </button>
                    <button class="btn secondary" onclick="app.simulateError('loading')">
                        <i class="ri-restart-line"></i> Simulate Again
                    </button>
                </div>
            </div>
        `;
        this.errorDisplay.innerHTML = html;
    }

    showServerError() {
        const html = `
            <div class="error-state">
                <div class="error-icon error">
                    <i class="ri-server-line"></i>
                </div>
                <h2 class="error-title">Server Error</h2>
                <p class="error-message">
                    The server encountered an unexpected error. Our team has been notified and is working on a fix.
                </p>
                <div class="error-actions">
                    <button class="btn primary" onclick="app.retryRequest()">
                        <i class="ri-refresh-line"></i> Retry Request
                    </button>
                    <button class="btn secondary" onclick="app.viewStatus()">
                        <i class="ri-information-line"></i> View Status
                    </button>
                    <button class="btn secondary" onclick="app.simulateError('server')">
                        <i class="ri-restart-line"></i> Simulate Again
                    </button>
                </div>
            </div>
        `;
        this.errorDisplay.innerHTML = html;
    }

    showValidationError() {
        const html = `
            <div class="error-state">
                <div class="error-icon error">
                    <i class="ri-close-circle-line"></i>
                </div>
                <h2 class="error-title">Validation Failed</h2>
                <p class="error-message">
                    Please check the following errors and try again:
                </p>
                <ul style="text-align: left; margin: 1rem 0; color: var(--error);">
                    <li>Email address is not valid</li>
                    <li>Password must be at least 8 characters</li>
                    <li>Phone number format is incorrect</li>
                </ul>
                <div class="error-actions">
                    <button class="btn primary" onclick="app.fixErrors()">
                        <i class="ri-check-line"></i> Fix Errors
                    </button>
                    <button class="btn secondary" onclick="app.clearForm()">
                        <i class="ri-eraser-line"></i> Clear Form
                    </button>
                    <button class="btn secondary" onclick="app.simulateError('validation')">
                        <i class="ri-restart-line"></i> Simulate Again
                    </button>
                </div>
            </div>
        `;
        this.errorDisplay.innerHTML = html;
    }

    addToHistory(type) {
        const error = {
            type,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            id: Date.now()
        };
        
        this.errorHistory.unshift(error);
        if (this.errorHistory.length > 10) {
            this.errorHistory.pop();
        }
        
        this.updateHistoryUI();
        this.saveToStorage();
        this.updateUI();
    }

    updateHistoryUI() {
        if (this.errorHistory.length === 0) {
            this.historyList.innerHTML = `
                <div class="history-item empty">
                    <i class="ri-time-line"></i>
                    <span>No errors simulated yet</span>
                </div>
            `;
            return;
        }
        
        this.historyList.innerHTML = this.errorHistory.map(error => `
            <div class="history-item ${error.type === 'server' || error.type === 'network' ? 'error' : 'warning'}">
                <i class="ri-${this.getErrorIcon(error.type)}-line"></i>
                <div>
                    <div>${this.formatErrorType(error.type)}</div>
                    <small style="color: var(--text-muted);">${error.time}</small>
                </div>
            </div>
        `).join('');
    }

    getErrorIcon(type) {
        const icons = {
            network: 'wifi-off',
            empty: 'inbox',
            permission: 'shield-flash',
            loading: 'time',
            server: 'server',
            validation: 'close-circle'
        };
        return icons[type] || 'error-warning';
    }

    formatErrorType(type) {
        return type.replace(/\b\w/g, l => l.toUpperCase()).replace(/([a-z])([A-Z])/g, '$1 $2');
    }

    updateStatus(state, message) {
        this.statusText.textContent = message;
        
        switch(state) {
            case 'simulating':
                this.statusDot.style.background = 'var(--warning)';
                this.statusDot.style.animation = 'pulse 1s infinite';
                this.statusIndicator.classList.remove('online');
                this.statusIndicator.classList.add('offline');
                break;
            case 'ready':
                this.statusDot.style.background = 'var(--success)';
                this.statusDot.style.animation = 'pulse 2s infinite';
                this.statusIndicator.classList.add('online');
                this.statusIndicator.classList.remove('offline');
                break;
        }
    }

    updateUI() {
        this.errorCountEl.textContent = `${this.errorHistory.length} errors simulated`;
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.isDarkMode ? 'ri-sun-line' : 'ri-moon-line';
        localStorage.setItem('darkMode', this.isDarkMode);
    }

    clearHistory() {
        if (this.errorHistory.length === 0) return;
        
        if (confirm('Clear all error history?')) {
            this.errorHistory = [];
            this.updateHistoryUI();
            this.updateUI();
            localStorage.removeItem('errorHistory');
            this.showNotification('History cleared', 'success');
        }
    }

    exportLogs() {
        const logs = {
            generatedAt: new Date().toISOString(),
            totalErrors: this.errorHistory.length,
            errors: this.errorHistory
        };
        
        const dataStr = JSON.stringify(logs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `error-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Logs exported successfully', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ri-${this.getNotificationIcon(type)}-line"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: var(--text-muted); cursor: pointer;">
                <i class="ri-close-line"></i>
            </button>
        `;
        
        this.notificationContainer.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            error: 'error-warning',
            warning: 'alert',
            success: 'checkbox-circle',
            info: 'information'
        };
        return icons[type] || 'information';
    }

    // Action methods for error states
    retryConnection() {
        this.showNotification('Retrying connection...', 'info');
        setTimeout(() => this.simulateError('network'), 1000);
    }

    checkNetwork() {
        this.showNotification('Network check initiated', 'info');
    }

    createFirstProject() {
        this.showNotification('Create project flow started', 'success');
    }

    requestAccess() {
        this.showNotification('Access request submitted', 'success');
    }

    retryLoading() {
        this.showNotification('Retrying load...', 'info');
        setTimeout(() => this.simulateError('loading'), 1000);
    }

    retryRequest() {
        this.showNotification('Retrying server request...', 'info');
        setTimeout(() => this.simulateError('server'), 1000);
    }

    // Storage methods
    saveToStorage() {
        localStorage.setItem('errorHistory', JSON.stringify(this.errorHistory));
    }

    saveSettings() {
        const settings = {
            autoRetry: this.autoRetry.checked,
            notifications: this.notifications.checked,
            delay: this.delaySelect.value
        };
        localStorage.setItem('playgroundSettings', JSON.stringify(settings));
    }

    loadFromStorage() {
        // Load error history
        const savedHistory = localStorage.getItem('errorHistory');
        if (savedHistory) {
            this.errorHistory = JSON.parse(savedHistory);
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('playgroundSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.autoRetry.checked = settings.autoRetry;
            this.notifications.checked = settings.notifications;
            this.delaySelect.value = settings.delay;
        }
        
        // Load theme
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            this.isDarkMode = true;
            document.body.classList.add('dark-mode');
            const icon = this.themeToggle.querySelector('i');
            icon.className = 'ri-sun-line';
        }
    }
}

// Initialize app
const app = new ErrorStatesPlayground();
window.app = app; // Make available globally for button callbacks