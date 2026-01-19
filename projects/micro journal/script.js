/**
 * Micro Journal
 * Minimalist daily entry logic using LocalStorage
 */

const state = {
    currentDate: new Date(),
    saveTimeout: null
};

// DOM Elements
const body = document.body;
const dateDisplay = document.getElementById('currentDateDisplay');
const journalInput = document.getElementById('journalInput');
const prevBtn = document.getElementById('prevDay');
const nextBtn = document.getElementById('nextDay');
const todayBtn = document.getElementById('todayBtn');
const dateInput = document.getElementById('dateInput');
const bookmarkContainer = document.getElementById('bookmarkContainer');
const saveStatus = document.getElementById('saveStatus');

const COLORS = [
    '#FFEB3B', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#E1BEE7',
    '#FFE0B2', '#F0F4C3', '#B2EBF2', '#D1C4E9', '#F8BBD0'
];

/**
 * Formats date for display: "thursday, jan 15"
 */
function formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options).toLowerCase();
}

/**
 * Returns key for LocalStorage: "mj-2026-01-15"
 */
function getDateKey(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `mj-${yyyy}-${mm}-${dd}`;
}

/**
 * Returns date in YYYY-MM-DD format for input value
 */
function getInputDateValue(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * Loads entry for current state date with a smooth transition
 */
function loadEntry() {
    const main = document.querySelector('main');

    // Fade out
    main.classList.add('fade-out');

    setTimeout(() => {
        const key = getDateKey(state.currentDate);
        const entry = localStorage.getItem(key) || '';
        journalInput.value = entry;
        dateDisplay.textContent = formatDate(state.currentDate);
        dateInput.value = getInputDateValue(state.currentDate);

        renderBookmarks();
        updateZenMode();

        // Fade in
        main.classList.remove('fade-out');
        main.classList.add('fade-in');

        setTimeout(() => {
            main.classList.remove('fade-in');
        }, 600);
    }, 200);
}

/**
 * Saves current entry to LocalStorage
 */
function saveEntry() {
    const key = getDateKey(state.currentDate);
    const content = journalInput.value.trim();

    const hadContent = localStorage.getItem(key) !== null;

    if (content) {
        localStorage.setItem(key, content);
    } else {
        localStorage.removeItem(key);
    }

    // If we just added or removed the first content for a day, refresh bookmarks
    const hasContent = content.length > 0;
    if (hadContent !== hasContent) {
        renderBookmarks();
    }

    showStatus();
}

/**
 * Shows temporary save status
 */
function showStatus() {
    saveStatus.classList.add('visible');
    setTimeout(() => {
        saveStatus.classList.remove('visible');
    }, 2000);
}

/**
 * Toggles Zen Mode (fades UI) when typing or focused
 */
function updateZenMode() {
    if (journalInput.value.length > 0) {
        body.classList.add('zen-mode');
    } else {
        body.classList.remove('zen-mode');
    }
}

/**
 * Renders bookmarks for each day of the current month
 */
function renderBookmarks() {
    bookmarkContainer.innerHTML = '';

    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const key = getDateKey(date);
        const hasContent = localStorage.getItem(key) !== null;
        const isCurrentSelection = day === state.currentDate.getDate();
        const isToday = isCurrentMonth && day === today.getDate();

        // Rules: 
        // 1. Don't show future dates
        // 2. Only show if has content OR is currently being viewed OR is today
        const isFuture = isCurrentMonth && day > today.getDate();
        if (isFuture) continue;
        if (!hasContent && !isCurrentSelection && !isToday) continue;

        const bookmark = document.createElement('div');
        bookmark.className = 'bookmark';
        if (isCurrentSelection) bookmark.classList.add('active');
        if (isToday) bookmark.classList.add('today');

        bookmark.textContent = day;
        bookmark.style.backgroundColor = COLORS[day % COLORS.length];

        // Positioning logic (Perimeter)
        // 1-7: Top, 8-18: Right, 19-25: Bottom, 26-31: Left
        if (day <= 7) {
            bookmark.classList.add('side-top');
            bookmark.style.top = '-45px'; // Adjusted for larger size
            bookmark.style.left = `${12 + (day - 1) * 12}%`;
        } else if (day <= 18) {
            bookmark.classList.add('side-right');
            bookmark.style.right = '-45px'; // Adjusted for larger size
            bookmark.style.top = `${12 + (day - 8) * 7.5}%`;
        } else if (day <= 25) {
            bookmark.classList.add('side-bottom');
            bookmark.style.bottom = '-45px'; // Adjusted for larger size
            bookmark.style.right = `${12 + (day - 19) * 12}%`;
        } else {
            bookmark.classList.add('side-left');
            bookmark.style.left = '-45px'; // Adjusted for larger size
            bookmark.style.bottom = `${12 + (day - 26) * 12}%`;
        }

        const rotation = (Math.random() * 4 - 2).toFixed(1);
        bookmark.style.transform += ` rotate(${rotation}deg)`;

        bookmark.addEventListener('click', (e) => {
            e.stopPropagation();
            state.currentDate = date;
            loadEntry();
        });

        bookmarkContainer.appendChild(bookmark);
    }
}

/**
 * Event Listeners
 */
journalInput.addEventListener('input', () => {
    updateZenMode();
    clearTimeout(state.saveTimeout);
    state.saveTimeout = setTimeout(saveEntry, 800);
});

journalInput.addEventListener('focus', updateZenMode);
journalInput.addEventListener('blur', updateZenMode);

prevBtn.addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() - 1);
    loadEntry();
});

nextBtn.addEventListener('click', () => {
    state.currentDate.setDate(state.currentDate.getDate() + 1);
    loadEntry();
});

todayBtn.addEventListener('click', () => {
    state.currentDate = new Date();
    loadEntry();
});

dateInput.addEventListener('change', (e) => {
    if (e.target.value) {
        state.currentDate = new Date(e.target.value);
        loadEntry();
    }
});

// Prevent multi-line but allow wrapping focus out
journalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        journalInput.blur();
    }
});

// Initialize
loadEntry();
journalInput.focus();
