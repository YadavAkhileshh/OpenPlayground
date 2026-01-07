/**
 * Bookmarks Page - Renders and manages the bookmarks page
 */

document.addEventListener('DOMContentLoaded', initBookmarksPage);
document.addEventListener('componentLoaded', initBookmarksPage);

let bookmarksPageInitialized = false;

function initBookmarksPage() {
    if (bookmarksPageInitialized) return;
    
    const container = document.getElementById('bookmarks-container');
    const emptyState = document.getElementById('bookmarks-empty-state');
    const clearBtn = document.getElementById('clear-all-bookmarks');
    const countText = document.getElementById('bookmarks-count-text');
    
    if (!container) return;
    
    bookmarksPageInitialized = true;
    
    renderBookmarks();
    
    // Clear all button
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove all bookmarks?')) {
                window.bookmarksManager.clearAllBookmarks();
                renderBookmarks();
            }
        });
    }
    
    // Listen for bookmark changes
    document.addEventListener('bookmarkRemoved', renderBookmarks);
    document.addEventListener('bookmarksCleared', renderBookmarks);
}

function renderBookmarks() {
    const container = document.getElementById('bookmarks-container');
    const emptyState = document.getElementById('bookmarks-empty-state');
    const clearBtn = document.getElementById('clear-all-bookmarks');
    const countText = document.getElementById('bookmarks-count-text');
    
    if (!container) return;
    
    const bookmarks = window.bookmarksManager.getBookmarks();
    const count = bookmarks.length;
    
    // Update count text
    if (countText) {
        countText.textContent = `${count} bookmarked project${count !== 1 ? 's' : ''}`;
    }
    
    // Show/hide clear button
    if (clearBtn) {
        clearBtn.style.display = count > 0 ? 'inline-flex' : 'none';
    }
    
    // Show empty state or bookmarks
    if (count === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.style.display = 'flex';
        return;
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
    const techStackHtml = (project.tech || []).map(t => `<span>${t}</span>`).join('');
    
    card.innerHTML = `
        <a href="${project.link}" class="bookmark-card-link">
            <div ${coverAttr}><i class="${project.icon || 'ri-code-box-line'}"></i></div>
            <div class="card-content">
                <div class="card-header-flex">
                    <h3 class="card-heading">${project.title}</h3>
                    <span class="category-tag">${capitalize(project.category || 'project')}</span>
                </div>
                <p class="card-description">${project.description || ''}</p>
                <div class="card-tech">${techStackHtml}</div>
            </div>
        </a>
        <button class="remove-bookmark-btn" data-title="${escapeHtml(project.title)}" aria-label="Remove bookmark">
            <i class="ri-bookmark-fill"></i>
        </button>
    `;
    
    // Remove bookmark button
    const removeBtn = card.querySelector('.remove-bookmark-btn');
    removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.bookmarksManager.removeBookmark(project.title);
        
        // Animate removal
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.9)';
        setTimeout(() => {
            card.remove();
            // Check if empty
            const remaining = window.bookmarksManager.getBookmarkCount();
            if (remaining === 0) {
                renderBookmarks();
            }
        }, 300);
    });
    
    return card;
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

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

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const newTheme = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}
