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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BookmarksManager };
}
