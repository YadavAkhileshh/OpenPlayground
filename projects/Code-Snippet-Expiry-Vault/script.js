// DOM Elements
const snippetTitleInput = document.getElementById('snippet-title');
const snippetLanguageSelect = document.getElementById('snippet-language');
const expiryTimeSelect = document.getElementById('expiry-time');
const snippetCodeTextarea = document.getElementById('snippet-code');
const saveSnippetBtn = document.getElementById('save-snippet-btn');
const snippetsList = document.getElementById('snippets-list');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const snippetModal = document.getElementById('snippet-modal');
const modalTitle = document.getElementById('modal-title');
const modalLanguage = document.getElementById('modal-language');
const modalExpiry = document.getElementById('modal-expiry');
const modalCodeContent = document.getElementById('modal-code-content');
const closeModalBtn = document.getElementById('close-modal-btn');
const copySnippetBtn = document.getElementById('copy-snippet-btn');
const deleteSnippetBtn = document.getElementById('delete-snippet-btn');

// Global variables
let snippets = JSON.parse(localStorage.getItem('codeSnippets')) || [];
let currentFilter = 'all';
let currentSnippet = null;

// Initialize the app
function init() {
    loadSnippets();
    setupEventListeners();
    updateSnippetsDisplay();
    startExpiryChecker();
}

function setupEventListeners() {
    saveSnippetBtn.addEventListener('click', saveSnippet);
    filterButtons.forEach(btn => btn.addEventListener('click', handleFilter));
    closeModalBtn.addEventListener('click', closeModal);
    copySnippetBtn.addEventListener('click', copySnippet);
    deleteSnippetBtn.addEventListener('click', deleteSnippet);

    // Close modal when clicking outside
    snippetModal.addEventListener('click', (e) => {
        if (e.target === snippetModal) {
            closeModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !snippetModal.classList.contains('hidden')) {
            closeModal();
        }
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveSnippet();
        }
    });
}

function saveSnippet() {
    const title = snippetTitleInput.value.trim();
    const language = snippetLanguageSelect.value;
    const expiryMinutes = parseInt(expiryTimeSelect.value);
    const code = snippetCodeTextarea.value.trim();

    if (!title || !code) {
        showNotification('Please fill in both title and code', 'error');
        return;
    }

    const snippet = {
        id: Date.now().toString(),
        title,
        language,
        code,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + expiryMinutes * 60000).toISOString(),
        expiryMinutes
    };

    snippets.unshift(snippet);
    saveSnippetsToStorage();
    updateSnippetsDisplay();
    clearForm();
    showNotification('Snippet saved successfully!', 'success');
}

function clearForm() {
    snippetTitleInput.value = '';
    snippetCodeTextarea.value = '';
    snippetLanguageSelect.value = 'javascript';
    expiryTimeSelect.value = '15';
}

function updateSnippetsDisplay() {
    const filteredSnippets = filterSnippets();
    snippetsList.innerHTML = '';

    if (filteredSnippets.length === 0) {
        snippetsList.appendChild(emptyState);
        return;
    }

    filteredSnippets.forEach(snippet => {
        const snippetCard = createSnippetCard(snippet);
        snippetsList.appendChild(snippetCard);
    });
}

function createSnippetCard(snippet) {
    const card = document.createElement('div');
    card.className = 'snippet-card';
    card.onclick = () => openSnippetModal(snippet);

    const isExpired = new Date(snippet.expiresAt) < new Date();
    const timeLeft = getTimeLeft(snippet.expiresAt);

    card.innerHTML = `
        <div class="snippet-header">
            <h3 class="snippet-title">${escapeHtml(snippet.title)}</h3>
            <div class="snippet-meta">
                <span class="language-tag">${snippet.language}</span>
                <span class="expiry-info ${isExpired ? 'expired' : timeLeft.minutes < 30 ? 'warning' : ''}">
                    <i class="fas ${isExpired ? 'fa-exclamation-triangle' : 'fa-clock'}"></i>
                    ${isExpired ? 'Expired' : formatTimeLeft(timeLeft)}
                </span>
            </div>
        </div>
        <div class="snippet-preview">${escapeHtml(snippet.code.substring(0, 100))}${snippet.code.length > 100 ? '...' : ''}</div>
    `;

    return card;
}

function filterSnippets() {
    const now = new Date();

    switch (currentFilter) {
        case 'active':
            return snippets.filter(snippet => new Date(snippet.expiresAt) > now);
        case 'expired':
            return snippets.filter(snippet => new Date(snippet.expiresAt) <= now);
        default:
            return snippets;
    }
}

function handleFilter(e) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.id.replace('filter-', '');
    updateSnippetsDisplay();
}

function openSnippetModal(snippet) {
    currentSnippet = snippet;
    modalTitle.textContent = escapeHtml(snippet.title);
    modalLanguage.textContent = snippet.language.toUpperCase();
    modalExpiry.textContent = formatExpiryTime(snippet.expiresAt);
    modalCodeContent.textContent = snippet.code;
    modalCodeContent.className = `language-${snippet.language}`;

    // Highlight code
    Prism.highlightElement(modalCodeContent);

    snippetModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    snippetModal.classList.add('hidden');
    document.body.style.overflow = '';
    currentSnippet = null;
}

function copySnippet() {
    if (!currentSnippet) return;

    navigator.clipboard.writeText(currentSnippet.code).then(() => {
        showNotification('Code copied to clipboard!', 'success');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentSnippet.code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Code copied to clipboard!', 'success');
    });
}

function deleteSnippet() {
    if (!currentSnippet) return;

    if (confirm('Are you sure you want to delete this snippet?')) {
        snippets = snippets.filter(s => s.id !== currentSnippet.id);
        saveSnippetsToStorage();
        updateSnippetsDisplay();
        closeModal();
        showNotification('Snippet deleted successfully!', 'success');
    }
}

function getTimeLeft(expiresAt) {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff <= 0) return { expired: true };

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return { minutes, hours, days };
}

function formatTimeLeft(timeLeft) {
    if (timeLeft.expired) return 'Expired';

    if (timeLeft.days > 0) {
        return `${timeLeft.days}d ${timeLeft.hours % 24}h left`;
    } else if (timeLeft.hours > 0) {
        return `${timeLeft.hours}h ${timeLeft.minutes % 60}m left`;
    } else {
        return `${timeLeft.minutes}m left`;
    }
}

function formatExpiryTime(expiresAt) {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const isExpired = expiry < now;

    if (isExpired) {
        return `Expired ${formatDate(expiry)}`;
    } else {
        return `Expires ${formatDate(expiry)}`;
    }
}

function formatDate(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function startExpiryChecker() {
    setInterval(() => {
        updateSnippetsDisplay();
    }, 60000); // Check every minute
}

function saveSnippetsToStorage() {
    localStorage.setItem('codeSnippets', JSON.stringify(snippets));
}

function loadSnippets() {
    snippets = JSON.parse(localStorage.getItem('codeSnippets')) || [];
    // Clean up expired snippets older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    snippets = snippets.filter(snippet => {
        const expiry = new Date(snippet.expiresAt);
        return expiry > thirtyDaysAgo;
    });
    saveSnippetsToStorage();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        ${message}
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);