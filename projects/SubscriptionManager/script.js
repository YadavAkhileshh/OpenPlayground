// Application State
let subscriptions = [];
let currentView = 'monthly';
let editingId = null;
let chart = null;

// DOM Elements
const dom = {
    // Theme
    themeToggle: document.getElementById('theme-toggle'),
    
    // Summary Cards
    monthlyTotal: document.getElementById('monthly-total'),
    yearlyTotal: document.getElementById('yearly-total'),
    upcomingCount: document.getElementById('upcoming-count'),
    activeCount: document.getElementById('active-count'),
    
    // Charts
    spendingChart: document.getElementById('spendingChart'),
    monthlyView: document.getElementById('monthly-view'),
    yearlyView: document.getElementById('yearly-view'),
    
    // Timeline
    timeline: document.getElementById('timeline'),
    
    // Subscriptions List
    subscriptionsList: document.getElementById('subscriptions-list'),
    sortBy: document.getElementById('sort-by'),
    
    // Modal
    modal: document.getElementById('subscription-modal'),
    modalTitle: document.getElementById('modal-title'),
    closeModal: document.getElementById('close-modal'),
    cancelSubscription: document.getElementById('cancel-subscription'),
    subscriptionForm: document.getElementById('subscription-form'),
    
    // Form Fields
    subName: document.getElementById('sub-name'),
    subCost: document.getElementById('sub-cost'),
    subCategory: document.getElementById('sub-category'),
    subRenewal: document.getElementById('sub-renewal'),
    subCycle: document.getElementById('sub-cycle'),
    subUrl: document.getElementById('sub-url'),
    subNotes: document.getElementById('sub-notes'),
    
    // Buttons
    addSubscription: document.getElementById('add-subscription'),
    saveSubscription: document.getElementById('save-subscription'),
    
    // Toast
    toast: document.getElementById('alert-toast'),
    toastMessage: document.querySelector('.toast-message'),
    toastClose: document.querySelector('.toast-close')
};

// Initialize App
function init() {
    // Load subscriptions from localStorage
    loadSubscriptions();
    
    // Set today's date as default for renewal date
    const today = new Date().toISOString().split('T')[0];
    dom.subRenewal.value = today;
    dom.subRenewal.min = today;
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize chart
    initChart();
    
    // Update UI
    updateUI();
    
    // Check for upcoming renewals to show alerts
    checkUpcomingRenewals();
}

// Load subscriptions from localStorage
function loadSubscriptions() {
    const stored = localStorage.getItem('subscriptions');
    if (stored) {
        subscriptions = JSON.parse(stored);
        
        // Convert string dates back to Date objects
        subscriptions.forEach(sub => {
            sub.nextRenewal = new Date(sub.nextRenewal);
        });
    } else {
        // Load sample data if no data exists
        loadSampleData();
    }
}

// Save subscriptions to localStorage
function saveSubscriptions() {
    // Convert Date objects to strings for storage
    const subscriptionsToSave = subscriptions.map(sub => ({
        ...sub,
        nextRenewal: sub.nextRenewal.toISOString()
    }));
    
    localStorage.setItem('subscriptions', JSON.stringify(subscriptionsToSave));
    updateUI();
}

// Load sample data for first-time users
function loadSampleData() {
    const today = new Date();
    const sampleData = [
        {
            id: '1',
            name: 'Netflix',
            cost: 15.99,
            category: 'Entertainment',
            nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
            cycle: 'monthly',
            cancellationUrl: 'https://www.netflix.com/cancelplan',
            notes: 'Premium Plan'
        },
        {
            id: '2',
            name: 'Spotify',
            cost: 9.99,
            category: 'Entertainment',
            nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12),
            cycle: 'monthly',
            cancellationUrl: 'https://www.spotify.com/account/subscription',
            notes: 'Student Plan'
        },
        {
            id: '3',
            name: 'Adobe Creative Cloud',
            cost: 52.99,
            category: 'Software',
            nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 20),
            cycle: 'monthly',
            cancellationUrl: 'https://www.adobe.com/account.html',
            notes: 'All Apps Plan'
        },
        {
            id: '4',
            name: 'Gym Membership',
            cost: 29.99,
            category: 'Gym',
            nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
            cycle: 'monthly',
            cancellationUrl: 'https://www.gymexample.com/cancel',
            notes: 'Premium Access'
        },
        {
            id: '5',
            name: 'New York Times',
            cost: 17.00,
            category: 'News',
            nextRenewal: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate() - 5),
            cycle: 'monthly',
            cancellationUrl: 'https://www.nytimes.com/subscription',
            notes: 'Digital Subscription'
        },
        {
            id: '6',
            name: 'Amazon Prime',
            cost: 139.00,
            category: 'Entertainment',
            nextRenewal: new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()),
            cycle: 'yearly',
            cancellationUrl: 'https://www.amazon.com/prime',
            notes: 'Yearly Subscription'
        }
    ];
    
    subscriptions = sampleData;
    saveSubscriptions();
}

// Set up all event listeners
function setupEventListeners() {
    // Theme toggle
    dom.themeToggle.addEventListener('change', toggleTheme);
    
    // View toggles
    dom.monthlyView.addEventListener('click', () => switchView('monthly'));
    dom.yearlyView.addEventListener('click', () => switchView('yearly'));
    
    // Sort subscriptions
    dom.sortBy.addEventListener('change', updateSubscriptionsList);
    
    // Modal
    dom.addSubscription.addEventListener('click', () => openModal());
    dom.closeModal.addEventListener('click', () => closeModal());
    dom.cancelSubscription.addEventListener('click', () => closeModal());
    
    // Form submission
    dom.subscriptionForm.addEventListener('submit', handleFormSubmit);
    
    // Toast close
    dom.toastClose.addEventListener('click', () => {
        dom.toast.style.display = 'none';
    });
    
    // Close modal on outside click
    dom.modal.addEventListener('click', (e) => {
        if (e.target === dom.modal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && dom.modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// Toggle between light and dark themes
function toggleTheme() {
    const isDark = dom.themeToggle.checked;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update chart colors for theme
    if (chart) {
        updateChart();
    }
}

// Load saved theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    dom.themeToggle.checked = isDark;
}

// Switch between monthly and yearly view
function switchView(view) {
    currentView = view;
    
    // Update toggle buttons
    if (view === 'monthly') {
        dom.monthlyView.classList.add('active');
        dom.yearlyView.classList.remove('active');
    } else {
        dom.monthlyView.classList.remove('active');
        dom.yearlyView.classList.add('active');
    }
    
    // Update UI
    updateSummaryCards();
    updateChart();
}

// Open modal for adding/editing subscription
function openModal(subscription = null) {
    editingId = subscription ? subscription.id : null;
    
    // Set modal title
    dom.modalTitle.textContent = subscription ? 'Edit Subscription' : 'Add New Subscription';
    
    // Clear or populate form
    if (subscription) {
        dom.subName.value = subscription.name;
        dom.subCost.value = subscription.cost;
        dom.subCategory.value = subscription.category;
        dom.subRenewal.value = subscription.nextRenewal.toISOString().split('T')[0];
        dom.subCycle.value = subscription.cycle;
        dom.subUrl.value = subscription.cancellationUrl || '';
        dom.subNotes.value = subscription.notes || '';
    } else {
        dom.subscriptionForm.reset();
        const today = new Date().toISOString().split('T')[0];
        dom.subRenewal.value = today;
    }
    
    // Show modal
    dom.modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    dom.modal.style.display = 'none';
    editingId = null;
    dom.subscriptionForm.reset();
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const subscription = {
        id: editingId || generateId(),
        name: dom.subName.value.trim(),
        cost: parseFloat(dom.subCost.value),
        category: dom.subCategory.value,
        nextRenewal: new Date(dom.subRenewal.value),
        cycle: dom.subCycle.value,
        cancellationUrl: dom.subUrl.value.trim(),
        notes: dom.subNotes.value.trim()
    };
    
    // Validate
    if (!subscription.name || isNaN(subscription.cost) || !subscription.category) {
        showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    // Add or update subscription
    if (editingId) {
        // Update existing
        const index = subscriptions.findIndex(sub => sub.id === editingId);
        if (index !== -1) {
            subscriptions[index] = subscription;
            showToast('Subscription updated successfully', 'success');
        }
    } else {
        // Add new
        subscriptions.push(subscription);
        showToast('Subscription added successfully', 'success');
    }
    
    // Save and update UI
    saveSubscriptions();
    closeModal();
    
    // Check for upcoming renewals
    checkUpcomingRenewals();
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Update all UI components
function updateUI() {
    updateSummaryCards();
    updateSubscriptionsList();
    updateTimeline();
    updateChart();
}

// Update summary cards
function updateSummaryCards() {
    // Calculate totals
    const monthlyTotal = subscriptions.reduce((sum, sub) => {
        if (sub.cycle === 'yearly') return sum + (sub.cost / 12);
        if (sub.cycle === 'quarterly') return sum + (sub.cost / 3);
        if (sub.cycle === 'weekly') return sum + (sub.cost * 4.33);
        return sum + sub.cost;
    }, 0);
    
    const yearlyTotal = subscriptions.reduce((sum, sub) => {
        if (sub.cycle === 'monthly') return sum + (sub.cost * 12);
        if (sub.cycle === 'quarterly') return sum + (sub.cost * 4);
        if (sub.cycle === 'weekly') return sum + (sub.cost * 52);
        return sum + sub.cost;
    }, 0);
    
    // Count upcoming renewals (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingCount = subscriptions.filter(sub => {
        return sub.nextRenewal >= today && sub.nextRenewal <= nextWeek;
    }).length;
    
    // Update DOM
    dom.monthlyTotal.textContent = `$${monthlyTotal.toFixed(2)}`;
    dom.yearlyTotal.textContent = `$${yearlyTotal.toFixed(2)}`;
    dom.upcomingCount.textContent = upcomingCount;
    dom.activeCount.textContent = subscriptions.length;
}

// Update subscriptions list
function updateSubscriptionsList() {
    const sortBy = dom.sortBy.value;
    
    // Sort subscriptions
    let sortedSubscriptions = [...subscriptions];
    
    switch (sortBy) {
        case 'name':
            sortedSubscriptions.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'cost':
            sortedSubscriptions.sort((a, b) => a.cost - b.cost);
            break;
        case 'cost-desc':
            sortedSubscriptions.sort((a, b) => b.cost - a.cost);
            break;
        case 'date':
            sortedSubscriptions.sort((a, b) => a.nextRenewal - b.nextRenewal);
            break;
        case 'category':
            sortedSubscriptions.sort((a, b) => a.category.localeCompare(b.category));
            break;
    }
    
    // Clear current list
    dom.subscriptionsList.innerHTML = '';
    
    // Show empty state if no subscriptions
    if (sortedSubscriptions.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-box-open"></i>
            <h3>No subscriptions added yet</h3>
            <p>Click "Add Subscription" to start tracking your recurring expenses</p>
        `;
        dom.subscriptionsList.appendChild(emptyState);
        return;
    }
    
    // Add subscription items
    sortedSubscriptions.forEach(subscription => {
        const subElement = createSubscriptionElement(subscription);
        dom.subscriptionsList.appendChild(subElement);
    });
}

// Create subscription element for the list
function createSubscriptionElement(subscription) {
    const element = document.createElement('div');
    element.className = 'subscription-item';
    
    // Calculate cost based on current view
    let displayCost = subscription.cost;
    let displayPeriod = subscription.cycle;
    
    if (currentView === 'monthly') {
        if (subscription.cycle === 'yearly') {
            displayCost = subscription.cost / 12;
            displayPeriod = 'month';
        } else if (subscription.cycle === 'quarterly') {
            displayCost = subscription.cost / 3;
            displayPeriod = 'month';
        } else if (subscription.cycle === 'weekly') {
            displayCost = subscription.cost * 4.33;
            displayPeriod = 'month';
        }
    } else { // yearly view
        if (subscription.cycle === 'monthly') {
            displayCost = subscription.cost * 12;
            displayPeriod = 'year';
        } else if (subscription.cycle === 'quarterly') {
            displayCost = subscription.cost * 4;
            displayPeriod = 'year';
        } else if (subscription.cycle === 'weekly') {
            displayCost = subscription.cost * 52;
            displayPeriod = 'year';
        }
    }
    
    // Format date
    const renewalDate = subscription.nextRenewal.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Determine if renewal is soon (within 3 days)
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    const isRenewingSoon = subscription.nextRenewal <= threeDaysFromNow && subscription.nextRenewal >= today;
    
    // Get category class
    const categoryClass = `category-${subscription.category.toLowerCase().replace(/\s+/g, '-')}`;
    
    element.innerHTML = `
        <div class="subscription-header">
            <div class="subscription-name">
                ${subscription.name}
                ${isRenewingSoon ? '<span class="renewal-alert"><i class="fas fa-exclamation-circle"></i> Renewing Soon!</span>' : ''}
            </div>
            <div class="subscription-cost">$${displayCost.toFixed(2)}/${displayPeriod}</div>
        </div>
        <div class="subscription-details">
            <div class="detail-item">
                <div class="detail-label">Category</div>
                <div class="detail-value">
                    <span class="category-badge ${categoryClass}">${subscription.category}</span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Next Renewal</div>
                <div class="detail-value">
                    <i class="far fa-calendar-alt"></i> ${renewalDate}
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Billing Cycle</div>
                <div class="detail-value">
                    <i class="fas fa-sync-alt"></i> ${subscription.cycle.charAt(0).toUpperCase() + subscription.cycle.slice(1)}
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Actual Cost</div>
                <div class="detail-value">
                    <i class="fas fa-dollar-sign"></i> ${subscription.cost}/${subscription.cycle}
                </div>
            </div>
        </div>
        ${subscription.notes ? `<div class="subscription-notes"><strong>Notes:</strong> ${subscription.notes}</div>` : ''}
        <div class="subscription-actions">
            <button class="action-btn edit-btn" data-id="${subscription.id}">
                <i class="fas fa-edit"></i> Edit
            </button>
            ${subscription.cancellationUrl ? `
            <a href="${subscription.cancellationUrl}" target="_blank" class="action-btn cancel-btn">
                <i class="fas fa-unlink"></i> Cancel Link
            </a>
            ` : ''}
            <button class="action-btn delete-btn" data-id="${subscription.id}">
                <i class="fas fa-trash-alt"></i> Delete
            </button>
        </div>
    `;
    
    // Add event listeners to buttons
    element.querySelector('.edit-btn').addEventListener('click', () => {
        const sub = subscriptions.find(s => s.id === subscription.id);
        if (sub) openModal(sub);
    });
    
    element.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete "${subscription.name}"?`)) {
            subscriptions = subscriptions.filter(s => s.id !== subscription.id);
            saveSubscriptions();
            showToast('Subscription deleted', 'success');
        }
    });
    
    return element;
}

// Update renewal timeline
function updateTimeline() {
    // Clear timeline
    dom.timeline.innerHTML = '';
    
    // Get subscriptions with renewals in next 30 days
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    
    const upcomingSubscriptions = subscriptions
        .filter(sub => sub.nextRenewal >= today && sub.nextRenewal <= nextMonth)
        .sort((a, b) => a.nextRenewal - b.nextRenewal);
    
    // Show empty state if no upcoming renewals
    if (upcomingSubscriptions.length === 0) {
        const emptyElement = document.createElement('div');
        emptyElement.className = 'timeline-empty';
        emptyElement.innerHTML = `
            <i class="fas fa-calendar-plus"></i>
            <p>No upcoming renewals in the next 30 days</p>
        `;
        dom.timeline.appendChild(emptyElement);
        return;
    }
    
    // Add timeline items
    upcomingSubscriptions.forEach(subscription => {
        const timelineItem = createTimelineItem(subscription);
        dom.timeline.appendChild(timelineItem);
    });
}

// Create timeline item element
function createTimelineItem(subscription) {
    const element = document.createElement('div');
    
    // Format date
    const renewalDate = subscription.nextRenewal.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
    
    // Calculate days until renewal
    const today = new Date();
    const timeDiff = subscription.nextRenewal - today;
    const daysUntil = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    // Determine urgency class
    let urgencyClass = '';
    if (daysUntil <= 2) {
        urgencyClass = 'danger';
    } else if (daysUntil <= 7) {
        urgencyClass = 'warning';
    }
    
    element.className = `timeline-item ${urgencyClass}`;
    element.innerHTML = `
        <div class="timeline-date">${renewalDate}</div>
        <div class="timeline-content">
            <div class="timeline-name">
                ${subscription.name}
                ${daysUntil <= 7 ? `<span class="timeline-alert">(${daysUntil} day${daysUntil !== 1 ? 's' : ''} left)</span>` : ''}
            </div>
            <div class="timeline-details">
                <span>$${subscription.cost.toFixed(2)} • ${subscription.category}</span>
                ${subscription.cancellationUrl ? `<a href="${subscription.cancellationUrl}" target="_blank" class="cancel-link">Cancel <i class="fas fa-external-link-alt"></i></a>` : ''}
            </div>
        </div>
    `;
    
    return element;
}

// Initialize chart
function initChart() {
    const ctx = dom.spendingChart.getContext('2d');
    
    // Get chart colors based on theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#e0e0e0' : '#333333';
    
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#4361ee', '#3a0ca3', '#f72585', '#4cc9f0', '#f8961e', '#7209b7', '#06d6a0', '#ef476f'
                ],
                borderWidth: 2,
                borderColor: isDark ? '#1e1e1e' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: textColor,
                        padding: 20,
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
    
    updateChart();
}

// Update chart with current data
function updateChart() {
    if (!chart) return;
    
    // Group subscriptions by category
    const categories = {};
    
    subscriptions.forEach(sub => {
        const cost = currentView === 'monthly' 
            ? (sub.cycle === 'yearly' ? sub.cost / 12 : 
               sub.cycle === 'quarterly' ? sub.cost / 3 : 
               sub.cycle === 'weekly' ? sub.cost * 4.33 : sub.cost)
            : (sub.cycle === 'monthly' ? sub.cost * 12 : 
               sub.cycle === 'quarterly' ? sub.cost * 4 : 
               sub.cycle === 'weekly' ? sub.cost * 52 : sub.cost);
        
        if (categories[sub.category]) {
            categories[sub.category] += cost;
        } else {
            categories[sub.category] = cost;
        }
    });
    
    // Update chart data
    chart.data.labels = Object.keys(categories);
    chart.data.datasets[0].data = Object.values(categories);
    
    // Update chart colors for theme
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    chart.options.plugins.legend.labels.color = isDark ? '#e0e0e0' : '#333333';
    chart.data.datasets[0].borderColor = isDark ? '#1e1e1e' : '#ffffff';
    
    chart.update();
}

// Check for upcoming renewals and show alerts
function checkUpcomingRenewals() {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    const upcoming = subscriptions.filter(sub => {
        return sub.nextRenewal >= today && sub.nextRenewal <= threeDaysFromNow;
    });
    
    if (upcoming.length > 0) {
        const names = upcoming.map(sub => sub.name).join(', ');
        showToast(`Upcoming renewals in 3 days: ${names}`, 'warning');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    dom.toastMessage.textContent = message;
    dom.toast.className = `toast ${type}`;
    dom.toast.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        dom.toast.style.display = 'none';
    }, 5000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    loadTheme();
    
    // Initialize app
    init();
});