document.addEventListener('DOMContentLoaded', () => {
    // State management
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Reset time to midnight for consistency
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Elements
    const gratitudeInput = document.getElementById('gratitude-input');
    const displayDate = document.getElementById('display-date');
    const displayDayFull = document.getElementById('display-day-full');
    const prevDayBtn = document.getElementById('prev-day');
    const nextDayBtn = document.getElementById('next-day');
    const saveStatus = document.getElementById('save-status');
    const streakCountDisplay = document.getElementById('streak-count');
    const quoteText = document.getElementById('motivational-quote');
    const quoteAuthor = document.getElementById('quote-author');

    // Quotes Data
    const quotes = [
        { text: "Gratitude turns what we have into enough.", author: "Aesop" },
        { text: "The more grateful I am, the more beauty I see.", author: "Mary Davis" },
        { text: "Gratitude is the fairest blossom which springs from the soul.", author: "Henry Ward Beecher" },
        { text: "Be thankful for what you have; you'll end up having more.", author: "Oprah Winfrey" },
        { text: "A grateful heart is a magnet for miracles.", author: "Anonymous" },
        { text: "Happiness is itself a kind of gratitude.", author: "Joseph Wood Krutch" },
        { text: "Gratitude makes sense of our past, brings peace for today, and creates a vision for tomorrow.", author: "Melody Beattie" },
        { text: "When you are grateful, fear disappears and abundance appears.", author: "Tony Robbins" }
    ];

    // Initialization
    function init() {
        updateDateDisplay();
        loadEntry();
        updateStreak();
        displayRandomQuote();

        // Event Listeners
        prevDayBtn.addEventListener('click', () => changeDate(-1));
        nextDayBtn.addEventListener('click', () => changeDate(1));

        let timeout = null;
        gratitudeInput.addEventListener('input', () => {
            clearTimeout(timeout);
            showSaveStatus(false);
            timeout = setTimeout(saveEntry, 1000);
        });
    }

    // Date Logic
    function updateDateDisplay() {
        const isToday = currentDate.getTime() === today.getTime();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };

        displayDate.textContent = isToday ? 'Today' : currentDate.toLocaleDateString(undefined, { weekday: 'long' });
        displayDayFull.textContent = currentDate.toLocaleDateString(undefined, options);

        // Disable next button if it's today (can't go to future)
        nextDayBtn.disabled = isToday;
    }

    function changeDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        updateDateDisplay();
        loadEntry();
    }

    // Storage Logic
    function getStorageKey(date) {
        return `gratitude_${date.toISOString().split('T')[0]}`;
    }

    function saveEntry() {
        const key = getStorageKey(currentDate);
        const value = gratitudeInput.value.trim();

        if (value) {
            localStorage.setItem(key, value);
        } else {
            localStorage.removeItem(key);
        }

        showSaveStatus(true);
        updateStreak();
    }

    function loadEntry() {
        const key = getStorageKey(currentDate);
        const savedValue = localStorage.getItem(key) || '';
        gratitudeInput.value = savedValue;
        showSaveStatus(false);
    }

    function showSaveStatus(visible) {
        if (visible) {
            saveStatus.classList.add('visible');
        } else {
            saveStatus.classList.remove('visible');
        }
    }

    // Streak Logic
    function updateStreak() {
        let streak = 0;
        let checkDate = new Date(today);

        // Check today first, then go backwards
        while (true) {
            const key = getStorageKey(checkDate);
            if (localStorage.getItem(key)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // If it's today and empty, check if yesterday has an entry
                if (checkDate.getTime() === today.getTime()) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const yesterdayKey = getStorageKey(checkDate);
                    if (!localStorage.getItem(yesterdayKey)) {
                        break;
                    }
                    // If yesterday exists, streak is still alive from yesterday
                } else {
                    break;
                }
            }
        }

        streakCountDisplay.textContent = streak;
    }

    // UI Enhancements
    function displayRandomQuote() {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[randomIndex];
        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;
    }

    init();
});
