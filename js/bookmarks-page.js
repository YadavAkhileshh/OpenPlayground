/**
 * Bookmarks Page - Renders and manages the bookmarks page with Collections support
 */

document.addEventListener('DOMContentLoaded', initBookmarksPage);
document.addEventListener('componentLoaded', initBookmarksPage);

let bookmarksPageInitialized = false;
let currentCollection = 'all';
let draggedCard = null;

function initBookmarksPage() {
    if (bookmarksPageInitialized) return;
    
    const container = document.getElementById('bookmarks-container');
    const emptyState = document.getElementById('bookmarks-empty-state');
    const clearBtn = document.getElementById('clear-all-bookmarks');
    const countText = document.getElementById('bookmarks-count-text');
    
    if (!container) return;
    
    bookmarksPageInitialized = true;
    
    // Load collection from URL
    currentCollection = window.bookmarksManager.getCollectionFromURL();
    
    renderCollectionsSidebar();
    renderBookmarks();
    
    // Clear all button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            const message = currentCollection === 'all' 
                ? 'Are you sure you want to remove all bookmarks?' 
                : 'Remove all projects from this collection?';
            
            if (confirm(message)) {
                if (currentCollection === 'all') {
                    window.bookmarksManager.clearAllBookmarks();
                } else {
                    const collection = window.bookmarksManager.getCollection(currentCollection);
                    if (collection) {
                        collection.projects.forEach(title => {
                            window.bookmarksManager.removeFromCollection(title, currentCollection);
                        });
                    }
                }
                renderBookmarks();
            }
        });
    }
    
    // Create collection button
    const createCollectionBtn = document.getElementById('create-collection-btn');
    if (createCollectionBtn) {
        createCollectionBtn.addEventListener('click', () => {
            window.showCreateCollectionModal();
        });
    }
    
    // Listen for bookmark/collection changes
    document.addEventListener('bookmarkRemoved', renderBookmarks);
    document.addEventListener('bookmarksCleared', renderBookmarks);
    document.addEventListener('collectionCreated', () => {
        renderCollectionsSidebar();
        renderBookmarks();
    });
    document.addEventListener('collectionUpdated', () => {
        renderCollectionsSidebar();
        renderBookmarks();
    });
    document.addEventListener('collectionDeleted', () => {
        if (currentCollection !== 'all') {
            const collection = window.bookmarksManager.getCollection(currentCollection);
            if (!collection) {
                currentCollection = 'all';
                window.bookmarksManager.setCollectionInURL('all');
            }
        }
        renderCollectionsSidebar();
        renderBookmarks();
    });
    document.addEventListener('projectAddedToCollection', renderBookmarks);
    document.addEventListener('projectRemovedFromCollection', renderBookmarks);
}

// ==========================================
// Collections Sidebar
// ==========================================

function renderCollectionsSidebar() {
    const sidebar = document.getElementById('collections-sidebar');
    if (!sidebar) return;
    
    const collections = window.bookmarksManager.getAllCollections();
    const totalBookmarks = window.bookmarksManager.getBookmarkCount();
    
    sidebar.innerHTML = `
        <div class="collections-header">
            <h3><i class="ri-folder-3-line"></i> Collections</h3>
            <button class="btn-icon create-collection-btn" id="sidebar-create-collection" title="Create Collection">
                <i class="ri-add-line"></i>
            </button>
        </div>
        <div class="collections-list">
            <button class="collection-item ${currentCollection === 'all' ? 'active' : ''}" data-collection="all">
                <i class="ri-bookmark-line" style="color: var(--primary-500)"></i>
                <span class="collection-name">All Bookmarks</span>
                <span class="collection-count">${totalBookmarks}</span>
            </button>
            ${collections.map(collection => `
                <button class="collection-item ${currentCollection === collection.id ? 'active' : ''}" 
                        data-collection="${collection.id}"
                        draggable="false">
                    <i class="${collection.icon}" style="color: ${collection.color}"></i>
                    <span class="collection-name">${escapeHtml(collection.name)}</span>
                    <span class="collection-count">${collection.projects.length}</span>
                    ${!collection.isDefault ? `
                        <div class="collection-actions">
                            <button class="btn-icon-sm edit-collection" data-collection="${collection.id}" title="Edit">
                                <i class="ri-edit-line"></i>
                            </button>
                            <button class="btn-icon-sm delete-collection" data-collection="${collection.id}" title="Delete">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    ` : ''}
                </button>
            `).join('')}
        </div>
    `;
    
    // Collection click handlers
    sidebar.querySelectorAll('.collection-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.collection-actions')) return;
            
            currentCollection = item.dataset.collection;
            window.bookmarksManager.setCollectionInURL(currentCollection);
            
            sidebar.querySelectorAll('.collection-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            renderBookmarks();
        });
        
        // Drag and drop support for collections
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (item.dataset.collection !== 'all') {
                item.classList.add('drag-over');
            }
        });
        
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            
            if (draggedCard && item.dataset.collection !== 'all') {
                const projectTitle = draggedCard.dataset.projectTitle;
                const collectionId = item.dataset.collection;
                
                window.bookmarksManager.addToCollection(projectTitle, collectionId);
                
                if (window.notificationManager) {
                    const collection = window.bookmarksManager.getCollection(collectionId);
                    window.notificationManager.success(`Added to "${collection.name}"`);
                }
                
                renderBookmarks();
                renderCollectionsSidebar();
            }
        });
    });
    
    // Create collection button
    sidebar.querySelector('#sidebar-create-collection')?.addEventListener('click', () => {
        window.showCreateCollectionModal();
    });
    
    // Edit collection handlers
    sidebar.querySelectorAll('.edit-collection').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showEditCollectionModal(btn.dataset.collection);
        });
    });
    
    // Delete collection handlers
    sidebar.querySelectorAll('.delete-collection').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const collectionId = btn.dataset.collection;
            const collection = window.bookmarksManager.getCollection(collectionId);
            
            if (confirm(`Delete collection "${collection.name}"? The bookmarked projects will not be removed.`)) {
                window.bookmarksManager.deleteCollection(collectionId);
                
                if (window.notificationManager) {
                    window.notificationManager.success('Collection deleted');
                }
            }
        });
    });
}

// ==========================================
// Edit Collection Modal
// ==========================================

function showEditCollectionModal(collectionId) {
    const collection = window.bookmarksManager.getCollection(collectionId);
    if (!collection) return;
    
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
                <h3>Edit Collection</h3>
                <button class="collection-modal-close" aria-label="Close">
                    <i class="ri-close-line"></i>
                </button>
            </div>
            <div class="collection-modal-body">
                <div class="form-group">
                    <label for="collection-name">Collection Name</label>
                    <input type="text" id="collection-name" value="${escapeHtml(collection.name)}" maxlength="50">
                </div>
                <div class="form-group">
                    <label>Icon</label>
                    <div class="icon-picker">
                        ${collectionIcons.map(icon => `
                            <button class="icon-option ${icon === collection.icon ? 'selected' : ''}" data-icon="${icon}">
                                <i class="${icon}"></i>
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="form-group">
                    <label>Color</label>
                    <div class="color-picker">
                        ${collectionColors.map(color => `
                            <button class="color-option ${color === collection.color ? 'selected' : ''}" data-color="${color}" style="background: ${color}">
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="collection-modal-footer">
                <button class="btn btn-secondary" id="cancel-collection-btn">Cancel</button>
                <button class="btn btn-primary" id="save-collection-btn">Save Changes</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const nameInput = modal.querySelector('#collection-name');
    nameInput.focus();
    nameInput.select();
    
    let selectedIcon = collection.icon;
    let selectedColor = collection.color;
    
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
    
    const closeModal = () => modal.remove();
    
    modal.querySelector('.collection-modal-close').addEventListener('click', closeModal);
    modal.querySelector('#cancel-collection-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    modal.querySelector('#save-collection-btn').addEventListener('click', () => {
        const name = nameInput.value.trim();
        
        if (!name) {
            nameInput.classList.add('error');
            nameInput.focus();
            return;
        }
        
        window.bookmarksManager.updateCollection(collectionId, {
            name,
            icon: selectedIcon,
            color: selectedColor
        });
        
        if (window.notificationManager) {
            window.notificationManager.success('Collection updated');
        }
        
        closeModal();
    });
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('#save-collection-btn').click();
        }
    });
}

// ==========================================
// Render Bookmarks
// ==========================================

function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    const emptyState = document.getElementById('bookmarks-empty-state');
    const clearBtn = document.getElementById('clear-all-bookmarks');
    const countText = document.getElementById('bookmarks-count-text');
    const collectionTitle = document.getElementById('current-collection-title');
    
    if (!container) return;
    
    let bookmarks;
    let collectionName = 'All Bookmarks';
    
    if (currentCollection === 'all') {
        bookmarks = window.bookmarksManager.getBookmarks();
    } else {
        const collection = window.bookmarksManager.getCollection(currentCollection);
        if (collection) {
            collectionName = collection.name;
            bookmarks = window.bookmarksManager.getCollectionProjects(currentCollection);
        } else {
            bookmarks = [];
        }
    }
    
    const count = bookmarks.length;
    
    // Update collection title
    if (collectionTitle) {
        collectionTitle.textContent = collectionName;
    }
    
    // Update count text
    if (countText) {
        countText.textContent = `${count} project${count !== 1 ? 's' : ''}`;
    }
    
    // Update clear button text
    if (clearBtn) {
        clearBtn.style.display = count > 0 ? 'inline-flex' : 'none';
        clearBtn.innerHTML = currentCollection === 'all' 
            ? '<i class="ri-delete-bin-line"></i> Clear All'
            : '<i class="ri-folder-reduce-line"></i> Clear Collection';
    }
    
    // Show empty state or bookmarks
    if (count === 0) {
        container.innerHTML = '';
        
        const mainSection = document.querySelector('.bookmarks-main');
        const layout = document.querySelector('.bookmarks-layout');
        
        if (mainSection) mainSection.classList.add('empty');
        if (layout) layout.classList.add('empty-layout');
        
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    const mainSection = document.querySelector('.bookmarks-main');
    if (mainSection) {
        mainSection.classList.remove('empty');
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';
    
    // Sort by most recently added
    const sortedBookmarks = [...bookmarks].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));
    
    sortedBookmarks.forEach((project, index) => {
        const card = createBookmarkCard(project);
        
        // Stagger animation
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        container.appendChild(card);
        
        setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

function createBookmarkCard(project) {
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.draggable = true;
    card.dataset.projectTitle = project.title;
    
    // Get collections this project belongs to
    const projectCollections = window.bookmarksManager.getProjectCollections(project.title);
    const collectionTags = projectCollections.map(c => `
        <span class="collection-tag" style="background: ${c.color}20; color: ${c.color}">
            <i class="${c.icon}"></i> ${escapeHtml(c.name)}
        </span>
    `).join('');
    
    // Cover style
    let coverAttr = '';
    if (project.coverClass) {
        coverAttr = `class="card-cover ${project.coverClass}"`;
    } else if (project.coverStyle) {
        coverAttr = `class="card-cover" style="${project.coverStyle}"`;
    } else {
        coverAttr = `class="card-cover"`;
    }
    
    // Tech stack
    const techStackHtml = (project.tech || []).map(t => `<span>${escapeHtml(t)}</span>`).join('');
    
    card.innerHTML = `
        <a href="${project.link}" class="bookmark-card-link">
            <div ${coverAttr}><i class="${project.icon || 'ri-code-box-line'}"></i></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${escapeHtml(project.title)}</h3>
                    <span class="category-tag">${capitalize(project.category || 'project')}</span>
                </div>
                <p class="card-description">${escapeHtml(project.description || '')}</p>
                ${collectionTags ? `<div class="collection-tags">${collectionTags}</div>` : ''}
                <div class="card-tech">${techStackHtml}</div>
            </div>
        </a>
        <div class="bookmark-card-actions">
            <button class="btn-icon add-to-collection-btn" data-title="${escapeHtmlAttr(project.title)}" title="Add to Collection">
                <i class="ri-folder-add-line"></i>
            </button>
            <button class="remove-bookmark-btn" data-title="${escapeHtmlAttr(project.title)}" aria-label="Remove bookmark">
                <i class="ri-bookmark-fill"></i>
            </button>
        </div>
    `;
    
    // Drag events
    card.addEventListener('dragstart', (e) => {
        draggedCard = card;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });
    
    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        draggedCard = null;
    });
    
    // Add to collection button
    const addToCollectionBtn = card.querySelector('.add-to-collection-btn');
    addToCollectionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showAddToCollectionDropdown(project.title, addToCollectionBtn);
    });
    
    // Remove bookmark button
    const removeBtn = card.querySelector('.remove-bookmark-btn');
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (currentCollection !== 'all') {
            // Just remove from collection
            window.bookmarksManager.removeFromCollection(project.title, currentCollection);
            
            if (window.notificationManager) {
                window.notificationManager.success('Removed from collection');
            }
        } else {
            // Remove bookmark entirely
            window.bookmarksManager.removeBookmark(project.title);
        }
        
        // Animate removal
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
            card.remove();
            // Check if empty
            const remaining = currentCollection === 'all' 
                ? window.bookmarksManager.getBookmarkCount()
                : window.bookmarksManager.getCollectionProjects(currentCollection).length;
            if (remaining === 0) {
                renderBookmarks();
            }
            renderCollectionsSidebar();
        }, 300);
    });
    
    return card;
}

// ==========================================
// Add to Collection Dropdown (Bookmarks Page)
// ==========================================

function showAddToCollectionDropdown(projectTitle, buttonElement) {
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
            <button class="collection-dropdown-create">
                <i class="ri-add-line"></i>
                <span>New Collection</span>
            </button>
        </div>
    `;
    
    const rect = buttonElement.getBoundingClientRect();
    dropdown.style.position = 'fixed';
    dropdown.style.top = `${rect.bottom + 8}px`;
    dropdown.style.left = `${Math.min(rect.left, window.innerWidth - 220)}px`;
    dropdown.style.zIndex = '10001';
    
    document.body.appendChild(dropdown);
    
    // Collection item clicks
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
            
            renderCollectionsSidebar();
            renderBookmarks();
        });
    });
    
    // Create collection button
    dropdown.querySelector('.collection-dropdown-create').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.remove();
        window.showCreateCollectionModal(projectTitle);
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
}

// ==========================================
// Helper Functions
// ==========================================

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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

// Make renderBookmarks available globally for other scripts
window.renderBookmarks = renderBookmarks;

// Theme and scroll functionality
const scrollBtn = document.getElementById('scrollToTopBtn');
if (scrollBtn) {
    window.addEventListener('scroll', () => {
        scrollBtn.classList.toggle('show', window.scrollY > 300);
    });
    
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
