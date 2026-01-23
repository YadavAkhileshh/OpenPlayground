/**
 * Bookmarks & Collections Manager - Handles bookmark and collection functionality
 * Stores bookmarks and collections in LocalStorage for persistence across sessions
 * 
 * Data Structure:
 * {
 *   bookmarks: [...], // flat array of all bookmarked projects
 *   collections: {
 *     'collection-id': {
 *       id: 'collection-id',
 *       name: 'Collection Name',
 *       icon: 'ri-folder-line',
 *       color: '#6366f1',
 *       createdAt: timestamp,
 *       projects: ['project-title-1', 'project-title-2'] // references to bookmarks
 *     }
 *   },
 *   defaultCollection: 'all' // 'all' or specific collection id
 * }
 */

class BookmarksManager {
    constructor() {
        this.STORAGE_KEY = 'openplayground_bookmarks';
        this.COLLECTIONS_KEY = 'openplayground_collections';
        this.DEFAULT_COLLECTION_KEY = 'openplayground_default_collection';
        
        this.bookmarks = [];
        this.collections = {};
        this.defaultCollection = 'all';
        
        this.loadData();
        this.migrateIfNeeded();
    }

    // ==========================================
    // Data Loading & Persistence
    // ==========================================

    loadData() {
        try {
            // Load bookmarks
            const storedBookmarks = localStorage.getItem(this.STORAGE_KEY);
            this.bookmarks = storedBookmarks ? JSON.parse(storedBookmarks) : [];
            
            // Load collections
            const storedCollections = localStorage.getItem(this.COLLECTIONS_KEY);
            this.collections = storedCollections ? JSON.parse(storedCollections) : {};
            
            // Load default collection
            this.defaultCollection = localStorage.getItem(this.DEFAULT_COLLECTION_KEY) || 'all';
            
            // Ensure default collections exist
            this.ensureDefaultCollections();
        } catch (error) {
            console.error('Error loading bookmarks data:', error);
            this.bookmarks = [];
            this.collections = {};
            this.defaultCollection = 'all';
            this.ensureDefaultCollections();
        }
    }

    migrateIfNeeded() {
        // Migrate from old flat array format if needed
        if (this.bookmarks.length > 0 && Object.keys(this.collections).length === 0) {
            console.log('📦 Migrating bookmarks to new collections format...');
            this.ensureDefaultCollections();
            this.saveData();
        }
    }

    ensureDefaultCollections() {
        // Create "Favorites" collection if it doesn't exist
        if (!this.collections['favorites']) {
            this.collections['favorites'] = {
                id: 'favorites',
                name: 'Favorites',
                icon: 'ri-star-line',
                color: '#f59e0b',
                createdAt: Date.now(),
                projects: [],
                isDefault: true
            };
        }
    }

    saveData() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.bookmarks));
            localStorage.setItem(this.COLLECTIONS_KEY, JSON.stringify(this.collections));
            localStorage.setItem(this.DEFAULT_COLLECTION_KEY, this.defaultCollection);
        } catch (error) {
            console.error('Error saving bookmarks data:', error);
        }
    }

    saveBookmarks() {
        this.saveData();
    }

    // ==========================================
    // Bookmark Operations
    // ==========================================

    isBookmarked(projectTitle) {
        return this.bookmarks.some(b => b.title === projectTitle);
    }

    addBookmark(project, collectionId = null) {
        if (!this.isBookmarked(project.title)) {
            const bookmark = {
                title: project.title,
                category: project.category,
                description: project.description,
                tech: project.tech,
                link: project.link,
                icon: project.icon,
                coverStyle: project.coverStyle,
                coverClass: project.coverClass,
                addedAt: Date.now()
            };
            this.bookmarks.push(bookmark);
            
            // Add to collection if specified
            if (collectionId && this.collections[collectionId]) {
                this.addToCollection(project.title, collectionId);
            }
            
            this.saveData();
            this.dispatchEvent('bookmarkAdded', { project, collectionId });
            return true;
        }
        return false;
    }

    removeBookmark(projectTitle) {
        const index = this.bookmarks.findIndex(b => b.title === projectTitle);
        if (index !== -1) {
            const removed = this.bookmarks.splice(index, 1)[0];
            
            // Remove from all collections
            Object.values(this.collections).forEach(collection => {
                const projIndex = collection.projects.indexOf(projectTitle);
                if (projIndex !== -1) {
                    collection.projects.splice(projIndex, 1);
                }
            });
            
            this.saveData();
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

    getBookmarkCount() {
        return this.bookmarks.length;
    }

    getBookmarkByTitle(title) {
        return this.bookmarks.find(b => b.title === title);
    }

    clearAllBookmarks() {
        this.bookmarks = [];
        // Clear projects from all collections but keep collections
        Object.values(this.collections).forEach(collection => {
            collection.projects = [];
        });
        this.saveData();
        this.dispatchEvent('bookmarksCleared');
    }

    // ==========================================
    // Collection Operations
    // ==========================================

    createCollection(name, icon = 'ri-folder-line', color = '#6366f1') {
        const id = this.generateCollectionId(name);
        
        if (this.collections[id]) {
            return { success: false, error: 'Collection already exists' };
        }
        
        this.collections[id] = {
            id,
            name,
            icon,
            color,
            createdAt: Date.now(),
            projects: [],
            isDefault: false
        };
        
        this.saveData();
        this.dispatchEvent('collectionCreated', this.collections[id]);
        return { success: true, collection: this.collections[id] };
    }

    updateCollection(collectionId, updates) {
        if (!this.collections[collectionId]) {
            return { success: false, error: 'Collection not found' };
        }
        
        const collection = this.collections[collectionId];
        
        if (updates.name !== undefined) collection.name = updates.name;
        if (updates.icon !== undefined) collection.icon = updates.icon;
        if (updates.color !== undefined) collection.color = updates.color;
        
        this.saveData();
        this.dispatchEvent('collectionUpdated', collection);
        return { success: true, collection };
    }

    deleteCollection(collectionId) {
        if (!this.collections[collectionId]) {
            return { success: false, error: 'Collection not found' };
        }
        
        if (this.collections[collectionId].isDefault) {
            return { success: false, error: 'Cannot delete default collection' };
        }
        
        const deleted = this.collections[collectionId];
        delete this.collections[collectionId];
        
        // Reset default collection if it was the deleted one
        if (this.defaultCollection === collectionId) {
            this.defaultCollection = 'all';
        }
        
        this.saveData();
        this.dispatchEvent('collectionDeleted', deleted);
        return { success: true, collection: deleted };
    }

    getCollection(collectionId) {
        return this.collections[collectionId] || null;
    }

    getAllCollections() {
        return Object.values(this.collections).sort((a, b) => {
            // Default collections first, then by creation date
            if (a.isDefault && !b.isDefault) return -1;
            if (!a.isDefault && b.isDefault) return 1;
            return a.createdAt - b.createdAt;
        });
    }

    getCollectionCount() {
        return Object.keys(this.collections).length;
    }

    // ==========================================
    // Collection-Project Operations
    // ==========================================

    addToCollection(projectTitle, collectionId) {
        if (!this.collections[collectionId]) {
            return { success: false, error: 'Collection not found' };
        }
        
        if (!this.isBookmarked(projectTitle)) {
            return { success: false, error: 'Project not bookmarked' };
        }
        
        const collection = this.collections[collectionId];
        
        if (!collection.projects.includes(projectTitle)) {
            collection.projects.push(projectTitle);
            this.saveData();
            this.dispatchEvent('projectAddedToCollection', { projectTitle, collectionId });
            return { success: true };
        }
        
        return { success: false, error: 'Project already in collection' };
    }

    removeFromCollection(projectTitle, collectionId) {
        if (!this.collections[collectionId]) {
            return { success: false, error: 'Collection not found' };
        }
        
        const collection = this.collections[collectionId];
        const index = collection.projects.indexOf(projectTitle);
        
        if (index !== -1) {
            collection.projects.splice(index, 1);
            this.saveData();
            this.dispatchEvent('projectRemovedFromCollection', { projectTitle, collectionId });
            return { success: true };
        }
        
        return { success: false, error: 'Project not in collection' };
    }

    moveToCollection(projectTitle, fromCollectionId, toCollectionId) {
        if (fromCollectionId) {
            this.removeFromCollection(projectTitle, fromCollectionId);
        }
        return this.addToCollection(projectTitle, toCollectionId);
    }

    getProjectCollections(projectTitle) {
        return Object.values(this.collections).filter(
            collection => collection.projects.includes(projectTitle)
        );
    }

    getCollectionProjects(collectionId) {
        if (!this.collections[collectionId]) {
            return [];
        }
        
        return this.collections[collectionId].projects
            .map(title => this.getBookmarkByTitle(title))
            .filter(b => b !== undefined);
    }

    isInCollection(projectTitle, collectionId) {
        if (!this.collections[collectionId]) return false;
        return this.collections[collectionId].projects.includes(projectTitle);
    }

    // ==========================================
    // URL State & Deep Linking
    // ==========================================

    getCollectionFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('collection') || 'all';
    }

    setCollectionInURL(collectionId) {
        const params = new URLSearchParams(window.location.search);
        
        if (collectionId === 'all') {
            params.delete('collection');
        } else {
            params.set('collection', collectionId);
        }
        
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        window.history.replaceState({ collection: collectionId }, '', newUrl);
    }

    // ==========================================
    // Utility Methods
    // ==========================================

    generateCollectionId(name) {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
    }

    dispatchEvent(eventName, data = null) {
        const event = new CustomEvent(eventName, { detail: data });
        document.dispatchEvent(event);
    }

    // Export data for backup
    exportData() {
        return {
            bookmarks: this.bookmarks,
            collections: this.collections,
            defaultCollection: this.defaultCollection,
            exportedAt: Date.now()
        };
    }

    // Import data from backup
    importData(data) {
        try {
            if (data.bookmarks) this.bookmarks = data.bookmarks;
            if (data.collections) this.collections = data.collections;
            if (data.defaultCollection) this.defaultCollection = data.defaultCollection;
            this.ensureDefaultCollections();
            this.saveData();
            this.dispatchEvent('dataImported', data);
            return { success: true };
        } catch (error) {
            console.error('Error importing data:', error);
            return { success: false, error: error.message };
        }
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

// ==========================================
// Collection Dropdown for Project Cards
// ==========================================

function createCollectionDropdown(projectTitle, buttonElement) {
    // Remove any existing dropdown
    const existingDropdown = document.querySelector('.collection-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    const collections = window.bookmarksManager.getAllCollections();
    const projectCollections = window.bookmarksManager.getProjectCollections(projectTitle);
    
    const dropdown = document.createElement('div');
    dropdown.className = 'collection-dropdown';
    
    let collectionsHtml = collections.map(collection => {
        const isInCollection = projectCollections.some(c => c.id === collection.id);
        return `
            <button class="collection-dropdown-item ${isInCollection ? 'in-collection' : ''}" 
                    data-collection-id="${collection.id}"
                    data-project-title="${escapeHtmlAttr(projectTitle)}">
                <i class="${collection.icon}" style="color: ${collection.color}"></i>
                <span>${escapeHtml(collection.name)}</span>
                ${isInCollection ? '<i class="ri-check-line check-icon"></i>' : ''}
            </button>
        `;
    }).join('');
    
    dropdown.innerHTML = `
        <div class="collection-dropdown-header">
            <span>Add to Collection</span>
        </div>
        <div class="collection-dropdown-list">
            ${collectionsHtml}
        </div>
        <div class="collection-dropdown-footer">
            <button class="collection-dropdown-create" id="create-collection-btn">
                <i class="ri-add-line"></i>
                <span>New Collection</span>
            </button>
        </div>
    `;
    
    // Position the dropdown
    const rect = buttonElement.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.left = `${rect.left}px`;
    dropdown.style.zIndex = '10001';
    
    document.body.appendChild(dropdown);
    
    // Handle collection item clicks
    dropdown.querySelectorAll('.collection-dropdown-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const collectionId = item.dataset.collectionId;
            const title = item.dataset.projectTitle;
            
            if (item.classList.contains('in-collection')) {
                window.bookmarksManager.removeFromCollection(title, collectionId);
                item.classList.remove('in-collection');
                item.querySelector('.check-icon')?.remove();
                if (window.notificationManager) {
                    window.notificationManager.success('Removed from collection');
                }
            } else {
                window.bookmarksManager.addToCollection(title, collectionId);
                item.classList.add('in-collection');
                const checkIcon = document.createElement('i');
                checkIcon.className = 'ri-check-line check-icon';
                item.appendChild(checkIcon);
                if (window.notificationManager) {
                    window.notificationManager.success('Added to collection');
                }
            }
        });
    });
    
    // Handle create collection button
    dropdown.querySelector('#create-collection-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.remove();
        showCreateCollectionModal(projectTitle);
    });
    
    // Close dropdown when clicking outside
    const closeDropdown = (e) => {
        if (!dropdown.contains(e.target) && e.target !== buttonElement) {
            dropdown.remove();
            document.removeEventListener('click', closeDropdown);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', closeDropdown);
    }, 0);
    
    return dropdown;
}

// ==========================================
// Create Collection Modal
// ==========================================

function showCreateCollectionModal(projectTitleToAdd = null) {
    // Remove existing modal
    const existingModal = document.querySelector('.collection-modal-overlay');
    if (existingModal) existingModal.remove();
    
    const collectionColors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', 
        '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'
    ];
    
    const collectionIcons = [
        'ri-folder-line', 'ri-star-line', 'ri-heart-line', 'ri-bookmark-line',
        'ri-lightbulb-line', 'ri-code-line', 'ri-gamepad-line', 'ri-palette-line',
        'ri-rocket-line', 'ri-fire-line', 'ri-trophy-line', 'ri-flag-line'
    ];
    
    const modal = document.createElement('div');
    modal.className = 'collection-modal-overlay';
    modal.innerHTML = `
        <div class="collection-modal">
            <div class="collection-modal-header">
                <h3>Create New Collection</h3>
                <button class="collection-modal-close" aria-label="Close">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="collection-modal-body">
                <div class="form-group">
                    <label for="collection-name">Collection Name</label>
                    <input type="text" id="collection-name" placeholder="e.g., To Learn, Game Ideas" maxlength="50">
                </div>
                <div class="form-group">
                    <label>Icon</label>
                    <div class="icon-picker">
                        ${collectionIcons.map((icon, i) => `
                            <button class="icon-option ${i === 0 ? 'selected' : ''}" data-icon="${icon}">
                                <i class="${icon}"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-picker">
                        ${collectionColors.map((color, i) => `
                            <button class="color-option ${i === 0 ? 'selected' : ''}" data-color="${color}" style="background: ${color}">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="collection-modal-footer">
                <button class="btn btn-secondary" id="cancel-collection-btn">Cancel</button>
                <button class="btn btn-primary" id="create-collection-submit">Create Collection</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus input
    const nameInput = modal.querySelector('#collection-name');
    nameInput.focus();
    
    let selectedIcon = collectionIcons[0];
    let selectedColor = collectionColors[0];
    
    // Icon selection
    modal.querySelectorAll('.icon-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.querySelectorAll('.icon-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedIcon = btn.dataset.icon;
        });
    });
    
    // Color selection
    modal.querySelectorAll('.color-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedColor = btn.dataset.color;
        });
    });
    
    // Close modal
    const closeModal = () => modal.remove();
    
    modal.querySelector('.collection-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-collection-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Create collection
    modal.querySelector('#create-collection-submit').addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (!name) {
            nameInput.classList.add('error');
            nameInput.focus();
            return;
        }
        
        const result = window.bookmarksManager.createCollection(name, selectedIcon, selectedColor);
        
        if (result.success) {
            if (projectTitleToAdd) {
                window.bookmarksManager.addToCollection(projectTitleToAdd, result.collection.id);
            }
            
            if (window.notificationManager) {
                window.notificationManager.success(`Collection "${name}" created!`);
            }
            
            closeModal();
            
            // Refresh bookmarks page if on it
            if (typeof renderBookmarks === 'function') {
                renderBookmarks();
            }
        } else {
            if (window.notificationManager) {
                window.notificationManager.error(result.error);
            }
        }
    });
    
    // Enter key to submit
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('#create-collection-submit').click();
        }
    });
}

// Make showCreateCollectionModal available globally
window.showCreateCollectionModal = showCreateCollectionModal;

// ==========================================
// Helper Functions
// ==========================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeHtmlAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

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
            if (window.notificationManager) {
                window.notificationManager.success(isNowBookmarked ? 'Added to bookmarks' : 'Removed from bookmarks');
            }
        });

        // Create collection button (only shows when bookmarked)
        const collectionBtn = document.createElement('button');
        collectionBtn.className = `collection-btn ${isBookmarked ? 'visible' : ''}`;
        collectionBtn.setAttribute('aria-label', 'Add to collection');
        collectionBtn.innerHTML = `<i class="ri-folder-add-line"></i>`;
        
        collectionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!window.bookmarksManager.isBookmarked(projectTitle)) {
                // Bookmark first
                window.bookmarksManager.addBookmark(project);
                btn.classList.add('bookmarked');
                btn.querySelector('i').className = 'ri-bookmark-fill';
                collectionBtn.classList.add('visible');
            }
            
            createCollectionDropdown(projectTitle, collectionBtn);
        });

        // Ensure card has relative positioning
        card.style.position = 'relative';
        card.insertBefore(btn, card.firstChild);
        card.insertBefore(collectionBtn, card.firstChild);
        
        // Update collection button visibility on bookmark change
        const updateCollectionBtnVisibility = () => {
            const bookmarked = window.bookmarksManager.isBookmarked(projectTitle);
            collectionBtn.classList.toggle('visible', bookmarked);
        };
        
        document.addEventListener('bookmarkAdded', updateCollectionBtnVisibility);
        document.addEventListener('bookmarkRemoved', updateCollectionBtnVisibility);
    });
}

// Toast notifications are now handled by NotificationManager

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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BookmarksManager };
}
