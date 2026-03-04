let selectedMood = null;
let entries = [];

const moodButtons = document.querySelectorAll('.mood-btn');
const journalText = document.getElementById('journalText');
const saveBtn = document.getElementById('saveBtn');
const entriesList = document.getElementById('entriesList');
const clearBtn = document.getElementById('clearBtn');
const successMessage = document.getElementById('successMessage');

const moodEmojis = {
    happy: '😊',
    excited: '🤩',
    neutral: '😐',
    sad: '😢',
    stressed: '😰'
};

// Mood button selection
moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        moodButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedMood = btn.dataset.mood;
        updateSaveButton();
    });
});

// Journal text input
journalText.addEventListener('input', updateSaveButton);

// Update save button state
function updateSaveButton() {
    saveBtn.disabled = !selectedMood || !journalText.value.trim();
}

// Save entry
saveBtn.addEventListener('click', () => {
    const entry = {
        id: Date.now(),
        mood: selectedMood,
        text: journalText.value.trim(),
        date: new Date().toLocaleString()
    };

    entries.unshift(entry);
    saveToStorage();
    displayEntries();
    resetForm();
    showSuccessMessage();
});

// Clear all entries
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all entries?')) {
        entries = [];
        saveToStorage();
        displayEntries();
    }
});

// Reset form after saving
function resetForm() {
    moodButtons.forEach(b => b.classList.remove('selected'));
    journalText.value = '';
    selectedMood = null;
    updateSaveButton();
}

// Show success message
function showSuccessMessage() {
    successMessage.classList.add('show');
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 3000);
}

// Display all entries
function displayEntries() {
    if (entries.length === 0) {
        entriesList.innerHTML = `
            <div class="empty-state">
                <i class="ri-emotion-line"></i>
                <p>No entries yet. Start tracking your mood!</p>
            </div>
        `;
        clearBtn.style.display = 'none';
    } else {
        entriesList.innerHTML = entries.map(entry => `
            <div class="entry">
                <div class="entry-header">
                    <span class="entry-mood">${moodEmojis[entry.mood]}</span>
                    <span class="entry-date">${entry.date}</span>
                </div>
                <div class="entry-text">${entry.text}</div>
            </div>
        `).join('');
        clearBtn.style.display = 'block';
    }
}

// Save to storage (in-memory for this demo)
function saveToStorage() {
    const data = {entries};
    console.log('Saved:', data);
}

// Initialize display
displayEntries();