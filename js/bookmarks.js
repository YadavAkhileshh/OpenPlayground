/**
 * Bookmarks Manager - Handles bookmark functionality for projects
 * Stores bookmarks in LocalStorage for persistence across sessions
 */

class BookmarksManager {
    constructor() {
        this.STORAGE_KEY = 'openplayground_bookmarks';
        this.bookmarks = this.loadBookmarks();
    }

    loadBookmarks() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading bookmarks:', error);
            return [];
        }
    }

    saveBookmarks() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bookmarks));
        } catch (error) {
            console.error('Error saving bookmarks:', error);
        }
    }

    isBookmarked(projectTitle) {
        return this.bookmarks.some(b => b.title === projectTitle);
    }

    addBookmark(project) {
        if (!this.isBookmarked(project.title)) {
            this.bookmarks.push({
                title: project.title,
                category: project.category,
                description: project.description,
                tech: project.tech,
                link: project.link,
                icon: project.icon,
                coverStyle: project.coverStyle,
                coverClass: project.coverClass,
                addedAt: Date.now()
            });
            this.saveBookmarks();
            this.dispatchEvent('bookmarkAdded', project);
            return true;
        }
        return false;
    }

    removeBookmark(projectTitle) {
        const index = this.bookmarks.findIndex(b => b.title === projectTitle);
        if (index !== -1) {
            const removed = this.bookmarks.splice(index, 1)[0];
            this.saveBookmarks();
            this.dispatchEvent('bookmarkRemoved', removed);
            return true;
        }
        return false;
    }

    toggleBookmark(project) {
        if (this.isBookmarked(project.title)) {
            this.removeBookmark(project.title);
            return false;
        } else {
            this.addBookmark(project);
            return true;
        }
    }

    getBookmarks() {
        return [...this.bookmarks];
    }

    // Enhanced search functionality
    searchBookmarks(query) {
        if (!query.trim()) return this.getBookmarks();
        
        const searchTerm = query.toLowerCase();
        return this.bookmarks.filter(bookmark => 
            bookmark.title.toLowerCase().includes(searchTerm) ||
            bookmark.description.toLowerCase().includes(searchTerm) ||
            bookmark.category.toLowerCase().includes(searchTerm) ||
            (bookmark.tech && bookmark.tech.some(tech => tech.toLowerCase().includes(searchTerm)))
        );
    }

    // Category-wise organization
    getBookmarksByCategory() {
        const categories = {};
        this.bookmarks.forEach(bookmark => {
            const category = bookmark.category || 'uncategorized';
            if (!categories[category]) categories[category] = [];
            categories[category].push(bookmark);
        });
        return categories;
    }

    // Export bookmarks
    exportBookmarks() {
        const data = {
            bookmarks: this.bookmarks,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `openplayground-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }

    // Bulk actions
    removeMultipleBookmarks(titles) {
        const removed = [];
        titles.forEach(title => {
            const index = this.bookmarks.findIndex(b => b.title === title);
            if (index !== -1) {
                removed.push(this.bookmarks.splice(index, 1)[0]);
            }
        });
        
        if (removed.length > 0) {
            this.saveBookmarks();
            this.dispatchEvent('bookmarksRemoved', removed);
        }
        return removed.length;
    }

    // Recently bookmarked
    getRecentBookmarks(limit = 5) {
        return this.bookmarks
            .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
            .slice(0, limit);
    }

    getBookmarkCount() {
        return this.bookmarks.length;
    }

    clearAllBookmarks() {
        this.bookmarks = [];
        this.saveBookmarks();
        this.dispatchEvent('bookmarksCleared');
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }
}

// Create global instance
window.bookmarksManager = new BookmarksManager();

// Update bookmark count badge in navbar
function updateBookmarkBadge() {
    const badge = document.getElementById('bookmark-count-badge');
    if (badge) {
        const count = window.bookmarksManager.getBookmarkCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Initialize bookmark badge on load
document.addEventListener('DOMContentLoaded', updateBookmarkBadge);
document.addEventListener('componentLoaded', updateBookmarkBadge);
document.addEventListener('bookmarkAdded', updateBookmarkBadge);
document.addEventListener('bookmarkRemoved', updateBookmarkBadge);
document.addEventListener('bookmarksCleared', updateBookmarkBadge);

// Add bookmark buttons to existing static cards
function addBookmarkButtonsToCards() {
    const cards = document.querySelectorAll('.projects-container .card, .projects-section .card');
    
    cards.forEach(card => {
        // Skip if already has bookmark button
        if (card.querySelector('.bookmark-btn')) return;
        
        // Get project info from card
        const titleEl = card.querySelector('.card-heading');
        const descEl = card.querySelector('.card-description');
        const categoryEl = card.querySelector('.category-tag');
        const coverEl = card.querySelector('.card-cover');
        const techEls = card.querySelectorAll('.card-tech span');
        const iconEl = coverEl ? coverEl.querySelector('i') : null;
        
        if (!titleEl) return;
        
        const projectTitle = titleEl.textContent.trim();
        const isBookmarked = window.bookmarksManager.isBookmarked(projectTitle);
        
        // Create bookmark button
        const btn = document.createElement('button');
        btn.className = `bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`;
        btn.setAttribute('aria-label', isBookmarked ? 'Remove bookmark' : 'Add bookmark');
        btn.innerHTML = `<i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>`;
        
        // Build project object for storage
        const project = {
            title: projectTitle,
            description: descEl ? descEl.textContent.trim() : '',
            category: categoryEl ? categoryEl.textContent.trim().toLowerCase() : 'project',
            link: card.getAttribute('href') || '#',
            icon: iconEl ? iconEl.className : 'ri-code-box-line',
            coverStyle: coverEl ? coverEl.getAttribute('style') || '' : '',
            tech: Array.from(techEls).map(el => el.textContent.trim())
        };
        
        // Click handler
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const isNowBookmarked = window.bookmarksManager.toggleBookmark(project);
            const icon = btn.querySelector('i');
            
            btn.classList.toggle('bookmarked', isNowBookmarked);
            icon.className = isNowBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line';
            btn.setAttribute('aria-label', isNowBookmarked ? 'Remove bookmark' : 'Add bookmark');
            
            // Animation
            btn.classList.add('animate');
            setTimeout(() => btn.classList.remove('animate'), 300);
            
            // Toast
            showBookmarkToast(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
        });
        
        // Ensure card has relative positioning
        card.style.position = 'relative';
        card.insertBefore(btn, card.firstChild);
    });
}

// Show toast notification
function showBookmarkToast(message) {
    const existingToast = document.querySelector('.bookmark-toast');
    if (existingToast) existingToast.remove();
    
    const toast = document.createElement('div');
    toast.className = 'bookmark-toast';
    toast.innerHTML = `<i class="ri-bookmark-fill"></i><span>${message}</span>`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Initialize bookmark buttons when components load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addBookmarkButtonsToCards, 500);
});

document.addEventListener('componentLoaded', (e) => {
    if (e.detail && (e.detail.component === 'projects' || e.detail.target === '#projects-placeholder')) {
        setTimeout(addBookmarkButtonsToCards, 100);
    }
    updateBookmarkBadge();
});

// Also run after a delay to catch any late-loading content
setTimeout(addBookmarkButtonsToCards, 1500);
setTimeout(addBookmarkButtonsToCards, 3000);

// Enhanced Bookmarks Page Functionality
class BookmarksPageManager {
    constructor() {
        this.currentView = 'all';
        this.selectedBookmarks = new Set();
        this.init();
    }

    init() {
        this.setupSearchFunctionality();
        this.setupCategoryFilter();
        this.setupBulkActions();
        this.renderBookmarks();
    }

    setupSearchFunctionality() {
        const searchInput = document.getElementById('bookmark-search');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.renderBookmarks(e.target.value);
            }, 300);
        });
    }

    setupCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) return;

        categoryFilter.addEventListener('change', (e) => {
            this.currentView = e.target.value;
            this.renderBookmarks();
        });
    }

    setupBulkActions() {
        const selectAllBtn = document.getElementById('select-all-bookmarks');
        const deleteSelectedBtn = document.getElementById('delete-selected');
        const exportBtn = document.getElementById('export-bookmarks');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => this.toggleSelectAll());
        }

        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', () => this.deleteSelected());
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                window.bookmarksManager.exportBookmarks();
            });
        }
    }

    renderBookmarks(searchQuery = '') {
        const container = document.getElementById('bookmarks-container');
        if (!container) return;

        let bookmarks;
        if (searchQuery) {
            bookmarks = window.bookmarksManager.searchBookmarks(searchQuery);
        } else if (this.currentView === 'recent') {
            bookmarks = window.bookmarksManager.getRecentBookmarks(10);
        } else if (this.currentView !== 'all') {
            const byCategory = window.bookmarksManager.getBookmarksByCategory();
            bookmarks = byCategory[this.currentView] || [];
        } else {
            bookmarks = window.bookmarksManager.getBookmarks();
        }

        if (bookmarks.length === 0) {
            container.innerHTML = `
                <div class="empty-bookmarks">
                    <i class="ri-bookmark-line"></i>
                    <h3>No bookmarks found</h3>
                    <p>Start bookmarking projects to see them here!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = bookmarks.map(bookmark => this.renderBookmarkCard(bookmark)).join('');
        this.attachBookmarkEvents();
    }

    renderBookmarkCard(bookmark) {
        const isSelected = this.selectedBookmarks.has(bookmark.title);
        return `
            <div class="bookmark-card" data-title="${bookmark.title}">
                <div class="bookmark-checkbox">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                           onchange="bookmarksPageManager.toggleSelection('${bookmark.title}')">
                </div>
                <div class="bookmark-content" onclick="window.location.href='${bookmark.link}'">
                    <div class="bookmark-icon ${bookmark.coverClass || ''}" style="${bookmark.coverStyle || ''}">
                        <i class="${bookmark.icon || 'ri-code-box-line'}"></i>
                    </div>
                    <div class="bookmark-info">
                        <h3>${bookmark.title}</h3>
                        <p>${bookmark.description || 'No description available'}</p>
                        <div class="bookmark-meta">
                            <span class="category">${bookmark.category}</span>
                            <span class="date">Added ${this.formatDate(bookmark.addedAt)}</span>
                        </div>
                    </div>
                </div>
                <div class="bookmark-actions">
                    <button onclick="bookmarksPageManager.removeBookmark('${bookmark.title}')" 
                            title="Remove bookmark">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `;
    }

    toggleSelection(title) {
        if (this.selectedBookmarks.has(title)) {
            this.selectedBookmarks.delete(title);
        } else {
            this.selectedBookmarks.add(title);
        }
        this.updateBulkActionButtons();
    }

    toggleSelectAll() {
        const bookmarks = window.bookmarksManager.getBookmarks();
        if (this.selectedBookmarks.size === bookmarks.length) {
            this.selectedBookmarks.clear();
        } else {
            bookmarks.forEach(b => this.selectedBookmarks.add(b.title));
        }
        this.renderBookmarks();
        this.updateBulkActionButtons();
    }

    deleteSelected() {
        if (this.selectedBookmarks.size === 0) return;
        
        if (confirm(`Delete ${this.selectedBookmarks.size} selected bookmarks?`)) {
            const removed = window.bookmarksManager.removeMultipleBookmarks([...this.selectedBookmarks]);
            this.selectedBookmarks.clear();
            this.renderBookmarks();
            this.updateBulkActionButtons();
            
            showBookmarkToast(`Removed ${removed} bookmarks`);
        }
    }

    removeBookmark(title) {
        if (confirm('Remove this bookmark?')) {
            window.bookmarksManager.removeBookmark(title);
            this.selectedBookmarks.delete(title);
            this.renderBookmarks();
            showBookmarkToast('Bookmark removed');
        }
    }

    updateBulkActionButtons() {
        const deleteBtn = document.getElementById('delete-selected');
        const selectAllBtn = document.getElementById('select-all-bookmarks');
        
        if (deleteBtn) {
            deleteBtn.disabled = this.selectedBookmarks.size === 0;
            deleteBtn.textContent = `Delete (${this.selectedBookmarks.size})`;
        }
        
        if (selectAllBtn) {
            const bookmarks = window.bookmarksManager.getBookmarks();
            selectAllBtn.textContent = this.selectedBookmarks.size === bookmarks.length ? 'Deselect All' : 'Select All';
        }
    }

    formatDate(timestamp) {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }

    attachBookmarkEvents() {
        // Events are handled inline in the HTML for simplicity
    }
}

// Initialize bookmarks page manager
if (document.getElementById('bookmarks-container')) {
    window.bookmarksPageManager = new BookmarksPageManager();
}
