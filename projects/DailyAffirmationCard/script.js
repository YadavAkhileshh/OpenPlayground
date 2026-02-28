// ===== Affirmations Collection =====
const affirmations = [
    "I am worthy of love, success, and happiness.",
    "Today, I choose to focus on what I can control.",
    "I trust the journey, even when I don't understand it.",
    "I am becoming the best version of myself, one day at a time.",
    "My potential is limitless, and I embrace new opportunities.",
    "I radiate positivity and attract good things into my life.",
    "I am grateful for this moment and the possibilities it holds.",
    "I release all doubts and welcome confidence into my life.",
    "Every challenge I face is an opportunity to grow stronger.",
    "I am deserving of all the good things coming my way.",
    "My mind is calm, my heart is at peace, and my spirit is free.",
    "I believe in my abilities and trust my intuition.",
    "Today, I will be kind to myself and others.",
    "I am resilient, and I can overcome any obstacle.",
    "I choose joy, gratitude, and abundance today.",
    "I am enough, exactly as I am right now.",
    "My thoughts create my reality, and I choose positive thoughts.",
    "I welcome new adventures and embrace change with open arms.",
    "I am surrounded by love and support.",
    "Every day is a fresh start and a new opportunity.",
    "I honor my boundaries and respect my needs.",
    "I am proud of how far I've come and excited for what's ahead.",
    "I attract success by being my authentic self.",
    "My unique gifts make the world a better place.",
    "I am at peace with my past and excited for my future.",
    "I give myself permission to rest and recharge.",
    "I am creating a life that feels good on the inside.",
    "My voice matters, and I express myself with confidence.",
    "I choose to see the beauty in every moment.",
    "I am constantly evolving and becoming wiser.",
    "Today, I will make progress, not excuses.",
    "I trust that everything is working out for my highest good.",
    "I am filled with energy, vitality, and purpose.",
    "My heart is open to giving and receiving love.",
    "I celebrate my small wins and acknowledge my growth.",
    "I am the architect of my life and I build its foundation.",
    "I release negativity and embrace positive energy.",
    "Every breath I take fills me with peace and clarity.",
    "I am worthy of taking up space in this world.",
    "Today, I choose courage over fear.",
    "I am blessed with incredible family and friends.",
    "My creativity flows freely and abundantly.",
    "I trust myself to make the right decisions.",
    "I am learning, growing, and improving every single day.",
    "I forgive myself for past mistakes and grow from them.",
    "My life is filled with abundance and prosperity.",
    "I am exactly where I need to be right now.",
    "I embrace my imperfections as part of my unique beauty.",
    "Today, I will spread kindness wherever I go.",
    "I am in charge of how I feel, and I choose happiness."
];

// ===== Streak Messages =====
const streakMessages = {
    0: "Start your daily affirmation journey!",
    1: "Great start! You've begun your journey! 🌱",
    3: "Three days strong! Keep it up! 💪",
    7: "One week of positivity! You're amazing! ⭐",
    14: "Two weeks! You're building a wonderful habit! 🌟",
    21: "Three weeks! This is becoming second nature! 🎯",
    30: "One month! You're a positivity champion! 🏆",
    50: "50 days! Your commitment is inspiring! 💫",
    100: "100 days! You're unstoppable! 🚀",
    365: "One full year! You're absolutely incredible! 🎉"
};

// ===== DOM Elements =====
const dayNameEl = document.getElementById('dayName');
const fullDateEl = document.getElementById('fullDate');
const affirmationTextEl = document.getElementById('affirmationText');
const affirmationNumberEl = document.getElementById('affirmationNumber');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const streakCountEl = document.getElementById('streakCount');
const streakMessageEl = document.getElementById('streakMessage');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// ===== Utility Functions =====

/**
 * Get a consistent seed for today's date
 * @returns {number} A number representing today's date
 */
function getDaySeed() {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
}

/**
 * Get today's date as a string key for localStorage
 * @returns {string} Date string in YYYY-MM-DD format
 */
function getTodayKey() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

/**
 * Simple seeded random number generator
 * @param {number} seed - The seed value
 * @returns {number} A pseudo-random number between 0 and 1
 */
function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

/**
 * Get the affirmation index for today
 * @returns {number} Index of today's affirmation
 */
function getTodayAffirmationIndex() {
    const seed = getDaySeed();
    return Math.floor(seededRandom(seed) * affirmations.length);
}

/**
 * Format the current date for display
 */
function formatDate() {
    const now = new Date();
    const options = { weekday: 'long' };
    const dayName = now.toLocaleDateString('en-US', options);

    const fullOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const fullDate = now.toLocaleDateString('en-US', fullOptions);

    return { dayName, fullDate };
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 */
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===== Streak Management =====

/**
 * Get streak data from localStorage
 * @returns {Object} Streak data object
 */
function getStreakData() {
    const data = localStorage.getItem('affirmationStreak');
    if (!data) {
        return {
            count: 0,
            lastVisit: null
        };
    }
    return JSON.parse(data);
}

/**
 * Save streak data to localStorage
 * @param {Object} data - Streak data to save
 */
function saveStreakData(data) {
    localStorage.setItem('affirmationStreak', JSON.stringify(data));
}

/**
 * Update the streak based on today's visit
 * @returns {number} Current streak count
 */
function updateStreak() {
    const today = getTodayKey();
    const data = getStreakData();

    // If already visited today, return current streak
    if (data.lastVisit === today) {
        return data.count;
    }

    // Calculate if the streak should continue or reset
    if (data.lastVisit) {
        const lastVisit = new Date(data.lastVisit);
        const todayDate = new Date(today);
        const diffTime = todayDate - lastVisit;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day - increment streak
            data.count += 1;
        } else if (diffDays > 1) {
            // Streak broken - reset to 1
            data.count = 1;
        }
    } else {
        // First visit ever
        data.count = 1;
    }

    data.lastVisit = today;
    saveStreakData(data);

    return data.count;
}

/**
 * Get the appropriate streak message
 * @param {number} count - Current streak count
 * @returns {string} The streak message
 */
function getStreakMessage(count) {
    // Find the highest threshold that's <= count
    const thresholds = Object.keys(streakMessages)
        .map(Number)
        .sort((a, b) => b - a);

    for (const threshold of thresholds) {
        if (count >= threshold) {
            return streakMessages[threshold];
        }
    }

    return streakMessages[0];
}

// ===== Main Functions =====

/**
 * Display today's affirmation
 */
function displayAffirmation() {
    const index = getTodayAffirmationIndex();
    const affirmation = affirmations[index];

    affirmationTextEl.textContent = affirmation;
    affirmationNumberEl.textContent = `Affirmation #${index + 1} of ${affirmations.length}`;
}

/**
 * Display the current date
 */
function displayDate() {
    const { dayName, fullDate } = formatDate();
    dayNameEl.textContent = dayName;
    fullDateEl.textContent = fullDate;
}

/**
 * Display the streak information
 */
function displayStreak() {
    const count = updateStreak();
    streakCountEl.textContent = count;
    streakMessageEl.textContent = getStreakMessage(count);
}

/**
 * Share the current affirmation
 */
async function shareAffirmation() {
    const affirmation = affirmationTextEl.textContent;
    const shareText = `Today's Affirmation:\n\n"${affirmation}"\n\n✨ Daily Affirmation Card`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Daily Affirmation',
                text: shareText
            });
            showToast('Shared successfully! 🎉');
        } catch (err) {
            if (err.name !== 'AbortError') {
                // Fallback to copy
                copyToClipboard(shareText);
            }
        }
    } else {
        // Fallback to copy
        copyToClipboard(shareText);
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard! 📋');
    } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard! 📋');
    }
}

/**
 * Copy just the affirmation text
 */
function copyAffirmation() {
    const affirmation = affirmationTextEl.textContent;
    copyToClipboard(`"${affirmation}"`);
}

// ===== Event Listeners =====
shareBtn.addEventListener('click', shareAffirmation);
copyBtn.addEventListener('click', copyAffirmation);

// ===== Initialize =====
function init() {
    displayDate();
    displayAffirmation();
    displayStreak();
}

// Run on page load
document.addEventListener('DOMContentLoaded', init);
