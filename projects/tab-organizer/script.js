// Tab Organizer with Instant Updates
class TabOrganizer {
    constructor() {
        // Generate or retrieve unique user ID
        this.userId = this.getUserId();
        this.displayUserId();
        
        // Load user-specific data from localStorage
        this.loadUserData();
        this.currentCategoryId = null;
        
        this.init();
    }
    
    getUserId() {
        let userId = localStorage.getItem('tabOrganizer_userId');
        if (!userId) {
            // Generate unique user ID
            userId = 'user_' + Math.random().toString(36).substr(2, 9) + 
                     '_' + Date.now().toString(36);
            localStorage.setItem('tabOrganizer_userId', userId);
        }
        return userId;
    }
    
    displayUserId() {
        const displayElement = document.getElementById('userDisplay');
        // Show a shortened version of the user ID
        const shortId = this.userId.substring(0, 8) + '...';
        displayElement.textContent = shortId;
    }
    
    loadUserData() {
        // Load user-specific data
        const userData = JSON.parse(localStorage.getItem(`tabOrganizer_${this.userId}`)) || {
            categories: [],
            tabs: []
        };
        
        this.categories = userData.categories;
        this.tabs = userData.tabs;
    }
    
    saveUserData() {
        const userData = {
            categories: this.categories,
            tabs: this.tabs,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem(`tabOrganizer_${this.userId}`, JSON.stringify(userData));
    }
    
    init() {
        this.setupEventListeners();
        this.renderCategories();
        this.updateStats();
        
        // Select first category if exists
        if (this.categories.length > 0) {
            this.selectCategory(this.categories[0].id);
        }
    }
    
    setupEventListeners() {
        // Category buttons
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.showCategoryModal());
        document.getElementById('saveCategoryBtn').addEventListener('click', () => this.saveCategory());
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.hideCategoryModal());
        document.getElementById('closeCategoryModal').addEventListener('click', () => this.hideCategoryModal());
        
        // Tab buttons
        document.getElementById('addTabBtn').addEventListener('click', () => this.showTabModal());
        document.getElementById('addFirstTabBtn').addEventListener('click', () => this.showTabModal());
        document.getElementById('saveTabBtn').addEventListener('click', () => this.saveTab());
        document.getElementById('cancelTabBtn').addEventListener('click', () => this.hideTabModal());
        document.getElementById('closeTabModal').addEventListener('click', () => this.hideTabModal());
        
        // Open tabs buttons
        document.getElementById('openAllBtn').addEventListener('click', () => this.openAllTabs());
        document.getElementById('openCategoryBtn').addEventListener('click', () => this.openCategoryTabs());
        
        // Close modals when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    // Category Management
    showCategoryModal() {
        document.getElementById('categoryModal').classList.add('active');
        document.getElementById('categoryName').value = '';
        document.getElementById('categoryName').focus();
    }
    
    hideCategoryModal() {
        document.getElementById('categoryModal').classList.remove('active');
    }
    
    saveCategory() {
        const name = document.getElementById('categoryName').value.trim();
        
        if (!name) {
            alert('Please enter a category name');
            return;
        }
        
        const newCategory = {
            id: Date.now().toString(),
            name: name,
            createdAt: new Date().toISOString()
        };
        
        this.categories.push(newCategory);
        this.saveUserData();
        
        // Hide modal
        this.hideCategoryModal();
        
        // Update UI
        this.renderCategories();
        this.selectCategory(newCategory.id);
        
        // Show toast
        this.showToast(`Category "${name}" created`);
    }
    
    deleteCategory(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        if (!category) return;
        
        if (!confirm(`Delete category "${category.name}" and all its tabs?`)) {
            return;
        }
        
        // Delete all tabs in this category first
        this.tabs = this.tabs.filter(tab => tab.categoryId !== categoryId);
        
        // Delete the category
        this.categories = this.categories.filter(c => c.id !== categoryId);
        this.saveUserData();
        
        // Update UI
        this.renderCategories();
        this.renderTabs();
        this.updateStats();
        
        // If we deleted the current category, select first available or clear
        if (this.currentCategoryId === categoryId) {
            if (this.categories.length > 0) {
                this.selectCategory(this.categories[0].id);
            } else {
                this.currentCategoryId = null;
                this.updateHeader();
            }
        }
        
        this.showToast(`Category "${category.name}" deleted`);
    }
    
    renderCategories() {
        const container = document.getElementById('categoryList');
        container.innerHTML = '';
        
        this.categories.forEach(category => {
            const categoryItem = document.createElement('div');
            categoryItem.className = `category-item ${this.currentCategoryId === category.id ? 'active' : ''}`;
            
            const tabCount = this.tabs.filter(tab => tab.categoryId === category.id).length;
            
            categoryItem.innerHTML = `
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <div class="category-stats">${tabCount} tab${tabCount !== 1 ? 's' : ''}</div>
                </div>
                <div class="category-actions">
                    <button class="category-action-btn delete-category-btn" data-category-id="${category.id}" title="Delete Category">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Add event listeners
            categoryItem.addEventListener('click', (e) => {
                // Don't select if clicking delete button
                if (!e.target.closest('.category-action-btn')) {
                    this.selectCategory(category.id);
                }
            });
            
            // Delete button event
            const deleteBtn = categoryItem.querySelector('.delete-category-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteCategory(category.id);
            });
            
            container.appendChild(categoryItem);
        });
        
        this.updateTabCategoryOptions();
    }
    
    selectCategory(categoryId) {
        this.currentCategoryId = categoryId;
        this.renderCategories();
        this.renderTabs();
        this.updateHeader();
        
        document.getElementById('openCategoryBtn').disabled = false;
    }
    
    // Tab Management
    showTabModal() {
        document.getElementById('tabModal').classList.add('active');
        document.getElementById('tabTitle').value = '';
        document.getElementById('tabUrl').value = '';
        document.getElementById('tabTitle').focus();
    }
    
    hideTabModal() {
        document.getElementById('tabModal').classList.remove('active');
    }
    
    saveTab() {
        const title = document.getElementById('tabTitle').value.trim();
        const url = document.getElementById('tabUrl').value.trim();
        const categoryId = document.getElementById('tabCategory').value;
        
        // Validation
        if (!title) {
            alert('Please enter a title');
            return;
        }
        
        if (!url) {
            alert('Please enter a URL');
            return;
        }
        
        // Validate URL format
        let validatedUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            validatedUrl = 'https://' + url;
        }
        
        try {
            new URL(validatedUrl);
        } catch {
            alert('Please enter a valid URL');
            return;
        }
        
        if (!categoryId) {
            alert('Please select a category');
            return;
        }
        
        const newTab = {
            id: Date.now().toString(),
            title,
            url: validatedUrl,
            categoryId,
            createdAt: new Date().toISOString(),
            lastAccessed: null,
            accessCount: 0
        };
        
        this.tabs.push(newTab);
        this.saveUserData();
        
        // Hide modal
        this.hideTabModal();
        
        // Update UI
        this.renderTabs();
        this.renderCategories();
        this.updateStats();
        
        // Select the category if not already selected
        if (this.currentCategoryId !== categoryId) {
            this.selectCategory(categoryId);
        }
        
        this.showToast(`Tab "${title}" added`);
    }
    
    deleteTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        if (!confirm(`Delete tab "${tab.title}"?`)) {
            return;
        }
        
        this.tabs = this.tabs.filter(t => t.id !== tabId);
        this.saveUserData();
        
        // Update UI
        this.renderTabs();
        this.renderCategories();
        this.updateStats();
        
        this.showToast(`Tab "${tab.title}" deleted`);
    }
    
    renderTabs() {
        const container = document.getElementById('tabsContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!this.currentCategoryId) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        const categoryTabs = this.tabs.filter(tab => tab.categoryId === this.currentCategoryId);
        
        if (categoryTabs.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = '';
        
        categoryTabs.forEach(tab => {
            const tabCard = document.createElement('div');
            tabCard.className = 'tab-card';
            
            const lastAccessed = tab.lastAccessed 
                ? this.formatTimeAgo(new Date(tab.lastAccessed))
                : 'Never opened';
            
            tabCard.innerHTML = `
                <button class="tab-delete-btn" data-tab-id="${tab.id}" title="Delete Tab">
                    <i class="fas fa-times"></i>
                </button>
                <div class="tab-content">
                    <div class="tab-header">
                        <div>
                            <div class="tab-title">${tab.title}</div>
                            <div class="tab-url">${tab.url}</div>
                        </div>
                    </div>
                    <div class="tab-footer">
                        <div class="tab-actions">
                            <button class="icon-btn open-tab-btn" data-tab-id="${tab.id}" title="Open Tab">
                                <i class="fas fa-external-link-alt"></i>
                            </button>
                        </div>
                        <div class="tab-time">
                            ${lastAccessed}
                            ${tab.accessCount > 0 ? ` • ${tab.accessCount} opens` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            container.appendChild(tabCard);
            
            // Add event listeners to this specific tab card
            const deleteBtn = tabCard.querySelector('.tab-delete-btn');
            const openBtn = tabCard.querySelector('.open-tab-btn');
            const tabContent = tabCard.querySelector('.tab-content');
            
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTab(tab.id);
            });
            
            openBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openTab(tab.id);
            });
            
            tabContent.addEventListener('click', (e) => {
                if (!e.target.closest('.tab-delete-btn') && !e.target.closest('.open-tab-btn')) {
                    this.openTab(tab.id);
                }
            });
        });
    }
    
    openTab(tabId) {
        const tab = this.tabs.find(t => t.id === tabId);
        if (!tab) return;
        
        // Update tab access info
        tab.lastAccessed = new Date().toISOString();
        tab.accessCount = (tab.accessCount || 0) + 1;
        this.saveUserData();
        
        // Open in new tab
        window.open(tab.url, '_blank');
        
        // Update this tab's display
        this.renderTabs();
        this.showToast(`Opening "${tab.title}"`);
    }
    
    openCategoryTabs() {
        if (!this.currentCategoryId) return;
        
        const categoryTabs = this.tabs.filter(tab => tab.categoryId === this.currentCategoryId);
        if (categoryTabs.length === 0) {
            this.showToast('No tabs in this category');
            return;
        }
        
        // Update access info for all tabs
        const now = new Date().toISOString();
        categoryTabs.forEach(tab => {
            tab.lastAccessed = now;
            tab.accessCount = (tab.accessCount || 0) + 1;
        });
        
        this.saveUserData();
        
        // Open all tabs
        categoryTabs.forEach(tab => {
            window.open(tab.url, '_blank');
        });
        
        const category = this.categories.find(c => c.id === this.currentCategoryId);
        this.showToast(`Opening ${categoryTabs.length} tabs from "${category.name}"`);
        
        // Update UI
        this.renderTabs();
    }
    
    openAllTabs() {
        if (this.tabs.length === 0) {
            this.showToast('No tabs to open');
            return;
        }
        
        // Update access info for all tabs
        const now = new Date().toISOString();
        this.tabs.forEach(tab => {
            tab.lastAccessed = now;
            tab.accessCount = (tab.accessCount || 0) + 1;
        });
        
        this.saveUserData();
        
        // Open all tabs
        this.tabs.forEach(tab => {
            window.open(tab.url, '_blank');
        });
        
        this.showToast(`Opening all ${this.tabs.length} tabs`);
        
        // Update UI
        this.renderTabs();
    }
    
    // Helper Methods
    updateHeader() {
        const title = document.getElementById('currentCategoryTitle');
        const openBtn = document.getElementById('openCategoryBtn');
        
        if (this.currentCategoryId) {
            const category = this.categories.find(c => c.id === this.currentCategoryId);
            const tabCount = this.tabs.filter(tab => tab.categoryId === this.currentCategoryId).length;
            
            title.textContent = `${category.name} (${tabCount} tabs)`;
            openBtn.disabled = false;
        } else {
            title.textContent = 'Select a Category';
            openBtn.disabled = true;
        }
    }
    
    updateTabCategoryOptions() {
        const select = document.getElementById('tabCategory');
        select.innerHTML = '';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            select.appendChild(option);
        });
        
        // Set to current category if exists
        if (this.currentCategoryId) {
            select.value = this.currentCategoryId;
        } else if (this.categories.length > 0) {
            select.value = this.categories[0].id;
        }
    }
    
    updateStats() {
        document.getElementById('categoryCount').textContent = this.categories.length;
        document.getElementById('tabCount').textContent = this.tabs.length;
    }
    
    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin}m ago`;
        if (diffHour < 24) return `${diffHour}h ago`;
        if (diffDay < 7) return `${diffDay}d ago`;
        
        return date.toLocaleDateString();
    }
    
    showToast(message) {
        // Create toast if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            toast.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span class="toast-message">${message}</span>
            `;
            document.body.appendChild(toast);
            
            // Remove after 2 seconds
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 2000);
        } else {
            // Update existing toast
            const messageEl = toast.querySelector('.toast-message');
            messageEl.textContent = message;
            toast.classList.add('show');
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast && toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, 2000);
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new TabOrganizer();
});