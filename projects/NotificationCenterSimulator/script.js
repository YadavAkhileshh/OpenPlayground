// Notification Center
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const notificationsList = document.getElementById('notificationsList');
    const emptyState = document.getElementById('emptyState');
    const unreadCountEl = document.getElementById('unreadCount');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const newNotificationBtn = document.getElementById('newNotificationBtn');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const refreshBtn = document.getElementById('refreshBtn');
    const addSampleBtn = document.getElementById('addSampleBtn');
    const toggleSettingsBtn = document.getElementById('toggleSettings');
    const settingsModal = document.getElementById('settingsModal');
    const newNotificationModal = document.getElementById('newNotificationModal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const cancelSettingsBtn = document.getElementById('cancelSettings');
    const saveSettingsBtn = document.getElementById('saveSettings');
    const cancelNotificationBtn = document.getElementById('cancelNotification');
    const sendNotificationBtn = document.getElementById('sendNotification');
    const selectAllBtn = document.getElementById('selectAllBtn');
    const deselectAllBtn = document.getElementById('deselectAllBtn');
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectedCountEl = document.getElementById('selectedCount');
    const markSelectedReadBtn = document.getElementById('markSelectedReadBtn');
    const markSelectedUnreadBtn = document.getElementById('markSelectedUnreadBtn');
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const previewContent = document.getElementById('previewContent');
    const closePreviewBtn = document.getElementById('closePreview');
    const currentYearEl = document.getElementById('currentYear');

    // Count Elements
    const countAllEl = document.getElementById('countAll');
    const countUnreadEl = document.getElementById('countUnread');
    const countInfoEl = document.getElementById('countInfo');
    const countSuccessEl = document.getElementById('countSuccess');
    const countWarningEl = document.getElementById('countWarning');
    const countErrorEl = document.getElementById('countError');
    const totalNotificationsEl = document.getElementById('totalNotifications');
    const todayNotificationsEl = document.getElementById('todayNotifications');
    const unreadPercentageEl = document.getElementById('unreadPercentage');

    // Form Elements
    const notificationTitle = document.getElementById('notificationTitle');
    const notificationMessage = document.getElementById('notificationMessage');
    const notificationTypeOptions = document.querySelectorAll('.type-option');
    const notificationPriority = document.getElementById('notificationPriority');

    // Activity Elements
    const activityList = document.getElementById('activityList');

    // App State
    let notifications = [];
    let selectedNotifications = new Set();
    let currentFilter = 'all';
    let currentSort = 'newest';
    let settings = {
        soundEnabled: true,
        desktopAlerts: true,
        autoRead: true,
        groupSimilar: true,
        enabledTypes: ['info', 'success', 'warning', 'error']
    };

    // Sample notifications data
    const sampleNotifications = [
        {
            id: 1,
            title: 'System Update Available',
            message: 'A new system update is ready to install. Please restart your application to apply the update.',
            type: 'info',
            timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            read: false,
            priority: 'normal',
            tags: ['system', 'update']
        },
        {
            id: 2,
            title: 'Profile Updated Successfully',
            message: 'Your profile information has been updated successfully. The changes will be reflected immediately.',
            type: 'success',
            timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
            read: true,
            priority: 'low',
            tags: ['profile', 'success']
        },
        {
            id: 3,
            title: 'Storage Space Running Low',
            message: 'You have used 85% of your available storage. Consider deleting unnecessary files to free up space.',
            type: 'warning',
            timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            read: false,
            priority: 'high',
            tags: ['storage', 'warning']
        },
        {
            id: 4,
            title: 'Login Failed Attempt',
            message: 'There was an unsuccessful login attempt to your account from an unrecognized device.',
            type: 'error',
            timestamp: new Date(Date.now() - 14400000).toISOString(), // 4 hours ago
            read: false,
            priority: 'urgent',
            tags: ['security', 'login']
        },
        {
            id: 5,
            title: 'New Message Received',
            message: 'You have received a new message from John Doe. Click here to read and reply.',
            type: 'info',
            timestamp: new Date(Date.now() - 28800000).toISOString(), // 8 hours ago
            read: true,
            priority: 'normal',
            tags: ['message', 'communication']
        },
        {
            id: 6,
            title: 'Backup Completed',
            message: 'Your data has been successfully backed up to the cloud. All files are secure and accessible.',
            type: 'success',
            timestamp: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
            read: true,
            priority: 'low',
            tags: ['backup', 'cloud']
        },
        {
            id: 7,
            title: 'Scheduled Maintenance',
            message: 'The system will undergo scheduled maintenance tonight from 2:00 AM to 4:00 AM. Some services may be unavailable.',
            type: 'warning',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
            read: true,
            priority: 'normal',
            tags: ['maintenance', 'schedule']
        },
        {
            id: 8,
            title: 'Payment Failed',
            message: 'Your recent payment could not be processed. Please update your payment method to avoid service interruption.',
            type: 'error',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            read: true,
            priority: 'high',
            tags: ['payment', 'billing']
        }
    ];

    // Initialize App
    function init() {
        loadNotifications();
        loadSettings();
        updateCurrentYear();
        setupEventListeners();
        renderNotifications();
        updateCounts();
        updateActivityList();
        updateEmptyState();
    }

    // Load notifications from localStorage
    function loadNotifications() {
        const savedNotifications = localStorage.getItem('notificationCenterData');
        if (savedNotifications) {
            notifications = JSON.parse(savedNotifications);
            // If localStorage exists but is empty, load sample notifications
            if (notifications.length === 0) {
                notifications = [...sampleNotifications];
                saveNotifications();
            }
        } else {
            notifications = [...sampleNotifications];
            saveNotifications();
        }
    }

    // Save notifications to localStorage
    function saveNotifications() {
        localStorage.setItem('notificationCenterData', JSON.stringify(notifications));
    }

    // Load settings from localStorage
    function loadSettings() {
        const savedSettings = localStorage.getItem('notificationCenterSettings');
        if (savedSettings) {
            settings = JSON.parse(savedSettings);
            applySettingsToUI();
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        localStorage.setItem('notificationCenterSettings', JSON.stringify(settings));
    }

    // Apply settings to UI
    function applySettingsToUI() {
        document.getElementById('soundEnabled').checked = settings.soundEnabled;
        document.getElementById('desktopAlerts').checked = settings.desktopAlerts;
        document.getElementById('autoRead').checked = settings.autoRead;
        document.getElementById('groupSimilar').checked = settings.groupSimilar;

        document.getElementById('enableInfo').checked = settings.enabledTypes.includes('info');
        document.getElementById('enableSuccess').checked = settings.enabledTypes.includes('success');
        document.getElementById('enableWarning').checked = settings.enabledTypes.includes('warning');
        document.getElementById('enableError').checked = settings.enabledTypes.includes('error');
    }

    // Update current year in footer
    function updateCurrentYear() {
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Filter buttons
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderNotifications();
            });
        });

        // Search input
        searchInput.addEventListener('input', () => {
            renderNotifications();
        });

        // Sort select
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderNotifications();
        });

        // Action buttons
        newNotificationBtn.addEventListener('click', () => {
            resetNotificationForm();
            newNotificationModal.style.display = 'flex';
        });

        markAllReadBtn.addEventListener('click', markAllAsRead);
        clearAllBtn.addEventListener('click', clearAllNotifications);
        refreshBtn.addEventListener('click', refreshNotifications);
        addSampleBtn.addEventListener('click', addSampleNotifications);

        // Settings
        toggleSettingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'flex';
        });

        // Close modals
        closeModalButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                settingsModal.style.display = 'none';
                newNotificationModal.style.display = 'none';
            });
        });

        cancelSettingsBtn.addEventListener('click', () => {
            settingsModal.style.display = 'none';
        });

        saveSettingsBtn.addEventListener('click', saveSettingsFromUI);

        // Notification form
        notificationTypeOptions.forEach(option => {
            option.addEventListener('click', () => {
                notificationTypeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            });
        });

        cancelNotificationBtn.addEventListener('click', () => {
            newNotificationModal.style.display = 'none';
        });

        sendNotificationBtn.addEventListener('click', createNewNotification);

        // Selection buttons
        selectAllBtn.addEventListener('click', selectAllNotifications);
        deselectAllBtn.addEventListener('click', deselectAllNotifications);

        // Bulk actions
        markSelectedReadBtn.addEventListener('click', () => {
            markSelectedAsRead();
            hideBulkActions();
        });

        markSelectedUnreadBtn.addEventListener('click', () => {
            markSelectedAsUnread();
            hideBulkActions();
        });

        deleteSelectedBtn.addEventListener('click', () => {
            deleteSelectedNotifications();
            hideBulkActions();
        });

        // Preview
        closePreviewBtn.addEventListener('click', () => {
            previewContent.innerHTML = `
                <div class="preview-placeholder">
                    <div class="placeholder-icon">
                        <i class="fas fa-mouse-pointer"></i>
                    </div>
                    <h4>Select a notification</h4>
                    <p>Click on any notification to see detailed preview here.</p>
                </div>
            `;
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.style.display = 'none';
            }
            if (e.target === newNotificationModal) {
                newNotificationModal.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                settingsModal.style.display = 'none';
                newNotificationModal.style.display = 'none';
                hideBulkActions();
            }
            if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                selectAllNotifications();
            }
            if (e.key === 'Delete' && selectedNotifications.size > 0) {
                deleteSelectedNotifications();
                hideBulkActions();
            }
        });
    }

    // Render notifications based on current filter and search
    function renderNotifications() {
        notificationsList.innerHTML = '';
        selectedNotifications.clear();
        updateSelectedCount();
        hideBulkActions();

        let filteredNotifications = filterNotifications(notifications);

        if (filteredNotifications.length === 0) {
            updateEmptyState();
            return;
        }

        filteredNotifications.forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            notificationsList.appendChild(notificationElement);
        });

        emptyState.classList.remove('visible');
    }

    // Filter notifications based on current criteria
    function filterNotifications(notificationList) {
        let filtered = notificationList;

        // Apply type filter
        if (currentFilter !== 'all') {
            if (currentFilter === 'unread') {
                filtered = filtered.filter(n => !n.read);
            } else {
                filtered = filtered.filter(n => n.type === currentFilter);
            }
        }

        // Apply search filter
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(searchTerm) ||
                n.message.toLowerCase().includes(searchTerm) ||
                n.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Apply sort
        filtered = sortNotifications(filtered);

        return filtered;
    }

    // Sort notifications
    function sortNotifications(notificationList) {
        const sorted = [...notificationList];

        switch (currentSort) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            case 'priority':
                const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
                return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
            case 'type':
                const typeOrder = { error: 0, warning: 1, info: 2, success: 3 };
                return sorted.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);
            default:
                return sorted;
        }
    }

    // Create notification element
    function createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.type} ${notification.read ? '' : 'unread'}`;
        element.dataset.id = notification.id;

        const timeAgo = getTimeAgo(notification.timestamp);
        const icon = getTypeIcon(notification.type);

        element.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-header">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-tags">
                    ${notification.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    <span class="tag priority-${notification.priority}">${notification.priority}</span>
                </div>
            </div>
            <div class="notification-actions">
                <button class="action-btn-small ${notification.read ? '' : 'mark-read'}" 
                        data-action="toggle-read" title="${notification.read ? 'Mark unread' : 'Mark read'}">
                    <i class="fas fa-${notification.read ? 'envelope' : 'envelope-open'}"></i>
                </button>
                <button class="action-btn-small" data-action="delete" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <input type="checkbox" class="notification-checkbox" data-id="${notification.id}">
        `;

        // Add event listeners
        const checkbox = element.querySelector('.notification-checkbox');
        const actionButtons = element.querySelectorAll('.action-btn-small');

        element.addEventListener('click', (e) => {
            if (!e.target.closest('.action-btn-small') && !e.target.closest('.notification-checkbox')) {
                showNotificationPreview(notification);
                if (settings.autoRead && !notification.read) {
                    markAsRead(notification.id);
                }
            }
        });

        checkbox.addEventListener('change', (e) => {
            e.stopPropagation();
            if (checkbox.checked) {
                selectedNotifications.add(notification.id);
            } else {
                selectedNotifications.delete(notification.id);
            }
            updateSelectedCount();
            toggleBulkActions();
        });

        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'toggle-read') {
                    toggleReadStatus(notification.id);
                } else if (action === 'delete') {
                    deleteNotification(notification.id);
                }
            });
        });

        return element;
    }

    // Get type icon
    function getTypeIcon(type) {
        const icons = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            warning: 'fas fa-exclamation-triangle',
            error: 'fas fa-exclamation-circle'
        };
        return icons[type] || 'fas fa-bell';
    }

    // Get time ago string
    function getTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diff = now - past;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return past.toLocaleDateString();
    }

    // Show notification preview
    function showNotificationPreview(notification) {
        const icon = getTypeIcon(notification.type);
        const timeAgo = getTimeAgo(notification.timestamp);
        const formattedTime = new Date(notification.timestamp).toLocaleString();

        previewContent.innerHTML = `
            <div class="notification-preview">
                <div class="preview-header ${notification.type}">
                    <div class="preview-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="preview-title">
                        <h4>${notification.title}</h4>
                        <div class="preview-meta">
                            <span class="type-badge ${notification.type}">${notification.type}</span>
                            <span class="priority-badge priority-${notification.priority}">${notification.priority}</span>
                        </div>
                    </div>
                </div>
                <div class="preview-body">
                    <div class="preview-time">
                        <i class="fas fa-clock"></i>
                        <span>${formattedTime} (${timeAgo})</span>
                    </div>
                    <div class="preview-message">
                        <p>${notification.message}</p>
                    </div>
                    <div class="preview-tags">
                        ${notification.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="preview-status">
                        <i class="fas fa-${notification.read ? 'envelope-open' : 'envelope'}"></i>
                        <span>${notification.read ? 'Read' : 'Unread'}</span>
                    </div>
                </div>
                <div class="preview-actions">
                    <button class="btn-secondary" data-action="toggle-preview-read">
                        <i class="fas fa-${notification.read ? 'envelope' : 'envelope-open'}"></i>
                        Mark as ${notification.read ? 'unread' : 'read'}
                    </button>
                    <button class="btn-secondary danger" data-action="delete-preview">
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;

        // Add event listeners to preview actions
        const toggleBtn = previewContent.querySelector('[data-action="toggle-preview-read"]');
        const deleteBtn = previewContent.querySelector('[data-action="delete-preview"]');

        toggleBtn.addEventListener('click', () => {
            toggleReadStatus(notification.id);
        });

        deleteBtn.addEventListener('click', () => {
            deleteNotification(notification.id);
        });
    }

    // Mark all notifications as read
    function markAllAsRead() {
        notifications.forEach(notification => {
            notification.read = true;
        });
        saveNotifications();
        renderNotifications();
        updateCounts();
        updateActivityList();
    }

    // Clear all notifications
    function clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            notifications = [];
            saveNotifications();
            renderNotifications();
            updateCounts();
            updateActivityList();
            addActivity('Cleared all notifications');
        }
    }

    // Refresh notifications
    function refreshNotifications() {
        renderNotifications();
        updateCounts();
        addActivity('Refreshed notifications');
    }

    // Add sample notifications
    function addSampleNotifications() {
        // Create new sample notifications with unique IDs
        const newSamples = sampleNotifications.map((sample, index) => ({
            ...sample,
            id: notifications.length + index + 1,
            timestamp: new Date().toISOString(),
            read: false
        }));

        notifications.unshift(...newSamples);
        saveNotifications();
        renderNotifications();
        updateCounts();
        updateActivityList();
        addActivity('Added sample notifications');
    }

    // Reset notification form
    function resetNotificationForm() {
        notificationTitle.value = '';
        notificationMessage.value = '';
        notificationTypeOptions.forEach(opt => opt.classList.remove('active'));
        notificationTypeOptions[0].classList.add('active');
        notificationPriority.value = 'normal';
    }

    // Save settings from UI
    function saveSettingsFromUI() {
        settings.soundEnabled = document.getElementById('soundEnabled').checked;
        settings.desktopAlerts = document.getElementById('desktopAlerts').checked;
        settings.autoRead = document.getElementById('autoRead').checked;
        settings.groupSimilar = document.getElementById('groupSimilar').checked;

        settings.enabledTypes = [];
        if (document.getElementById('enableInfo').checked) settings.enabledTypes.push('info');
        if (document.getElementById('enableSuccess').checked) settings.enabledTypes.push('success');
        if (document.getElementById('enableWarning').checked) settings.enabledTypes.push('warning');
        if (document.getElementById('enableError').checked) settings.enabledTypes.push('error');

        saveSettings();
        settingsModal.style.display = 'none';
        addActivity('Updated notification settings');
    }

    // Create new notification
    function createNewNotification() {
        const title = notificationTitle.value.trim();
        const message = notificationMessage.value.trim();
        const selectedType = document.querySelector('.type-option.active').dataset.type;
        const priority = notificationPriority.value;

        if (!title || !message) {
            alert('Please fill in both title and message');
            return;
        }

        const newNotification = {
            id: Date.now(),
            title,
            message,
            type: selectedType,
            timestamp: new Date().toISOString(),
            read: false,
            priority,
            tags: ['custom']
        };

        notifications.unshift(newNotification);
        saveNotifications();
        renderNotifications();
        updateCounts();
        updateActivityList();
        addActivity(`Created new ${selectedType} notification`);

        newNotificationModal.style.display = 'none';
        resetNotificationForm();

        // Show success message
        if (settings.desktopAlerts) {
            showDesktopAlert('Notification Created', 'Your new notification has been added to the center.');
        }
    }

    // Toggle read status
    function toggleReadStatus(id) {
        const notification = notifications.find(n => n.id === id);
        if (notification) {
            notification.read = !notification.read;
            saveNotifications();
            renderNotifications();
            updateCounts();
            updateActivityList();
            addActivity(`Marked notification as ${notification.read ? 'read' : 'unread'}`);
        }
    }

    // Mark as read
    function markAsRead(id) {
        const notification = notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            saveNotifications();
            renderNotifications();
            updateCounts();
        }
    }

    // Delete notification
    function deleteNotification(id) {
        if (confirm('Are you sure you want to delete this notification?')) {
            notifications = notifications.filter(n => n.id !== id);
            selectedNotifications.delete(id);
            saveNotifications();
            renderNotifications();
            updateCounts();
            updateActivityList();
            addActivity('Deleted a notification');
            updateSelectedCount();
        }
    }

    // Select all notifications
    function selectAllNotifications() {
        const visibleNotifications = document.querySelectorAll('.notification-item');
        selectedNotifications.clear();

        visibleNotifications.forEach(item => {
            const id = parseInt(item.dataset.id);
            selectedNotifications.add(id);
            const checkbox = item.querySelector('.notification-checkbox');
            if (checkbox) checkbox.checked = true;
        });

        updateSelectedCount();
        toggleBulkActions();
    }

    // Deselect all notifications
    function deselectAllNotifications() {
        selectedNotifications.clear();
        document.querySelectorAll('.notification-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateSelectedCount();
        hideBulkActions();
    }

    // Mark selected as read
    function markSelectedAsRead() {
        notifications.forEach(notification => {
            if (selectedNotifications.has(notification.id)) {
                notification.read = true;
            }
        });
        saveNotifications();
        renderNotifications();
        updateCounts();
        updateActivityList();
        addActivity(`Marked ${selectedNotifications.size} notifications as read`);
    }

    // Mark selected as unread
    function markSelectedAsUnread() {
        notifications.forEach(notification => {
            if (selectedNotifications.has(notification.id)) {
                notification.read = false;
            }
        });
        saveNotifications();
        renderNotifications();
        updateCounts();
        updateActivityList();
        addActivity(`Marked ${selectedNotifications.size} notifications as unread`);
    }

    // Delete selected notifications
    function deleteSelectedNotifications() {
        if (confirm(`Are you sure you want to delete ${selectedNotifications.size} notification(s)?`)) {
            notifications = notifications.filter(n => !selectedNotifications.has(n.id));
            saveNotifications();
            renderNotifications();
            updateCounts();
            updateActivityList();
            addActivity(`Deleted ${selectedNotifications.size} notifications`);
        }
    }

    // Update selected count
    function updateSelectedCount() {
        selectedCountEl.textContent = selectedNotifications.size;
    }

    // Toggle bulk actions bar
    function toggleBulkActions() {
        if (selectedNotifications.size > 0) {
            bulkActionsBar.classList.add('visible');
        } else {
            bulkActionsBar.classList.remove('visible');
        }
    }

    // Hide bulk actions bar
    function hideBulkActions() {
        selectedNotifications.clear();
        updateSelectedCount();
        bulkActionsBar.classList.remove('visible');
        document.querySelectorAll('.notification-checkbox').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    // Update counts
    function updateCounts() {
        const total = notifications.length;
        const unread = notifications.filter(n => !n.read).length;
        const today = new Date().toDateString();
        const todayCount = notifications.filter(n =>
            new Date(n.timestamp).toDateString() === today
        ).length;

        // Update counts
        unreadCountEl.querySelector('span').textContent = `${unread} unread`;
        countAllEl.textContent = total;
        countUnreadEl.textContent = unread;
        countInfoEl.textContent = notifications.filter(n => n.type === 'info').length;
        countSuccessEl.textContent = notifications.filter(n => n.type === 'success').length;
        countWarningEl.textContent = notifications.filter(n => n.type === 'warning').length;
        countErrorEl.textContent = notifications.filter(n => n.type === 'error').length;

        totalNotificationsEl.textContent = total;
        todayNotificationsEl.textContent = todayCount;
        unreadPercentageEl.textContent = total > 0 ? `${Math.round((unread / total) * 100)}%` : '0%';
    }

    // Update empty state
    function updateEmptyState() {
        const hasNotifications = notifications.length > 0;
        emptyState.classList.toggle('visible', !hasNotifications);
    }

    // Update activity list
    function updateActivityList() {
        // Keep only last 5 activities
        const activities = JSON.parse(localStorage.getItem('notificationCenterActivities') || '[]');
        activityList.innerHTML = '';

        activities.slice(-5).reverse().forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <i class="fas fa-history"></i>
                <div>
                    <div>${activity.action}</div>
                    <small>${activity.time}</small>
                </div>
            `;
            activityList.appendChild(activityItem);
        });

        if (activities.length === 0) {
            activityList.innerHTML = '<div class="activity-item">No recent activity</div>';
        }
    }

    // Add activity
    function addActivity(action) {
        const activities = JSON.parse(localStorage.getItem('notificationCenterActivities') || '[]');

        activities.push({
            action,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Keep only last 20 activities
        if (activities.length > 20) {
            activities.splice(0, activities.length - 20);
        }

        localStorage.setItem('notificationCenterActivities', JSON.stringify(activities));
        updateActivityList();
    }

    // Show desktop alert (simulated)
    function showDesktopAlert(title, message) {
        // In a real app, this would use the Notification API
        console.log(`Desktop Alert: ${title} - ${message}`);

        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(toast);

        // Add styles for toast
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: var(--radius);
            padding: 15px;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Initialize the app
    init();
});