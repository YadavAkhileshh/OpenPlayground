// SmartNotes - AI-Powered Note Organizer
// ...existing code...
const noteForm = document.getElementById('note-form');
const notesList = document.getElementById('notes');
const searchBtn = document.getElementById('search-btn');
const searchKeyword = document.getElementById('search-keyword');
const searchResults = document.getElementById('search-results');

let notes = [];

noteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const content = document.getElementById('note-content').value;
    const tags = document.getElementById('note-tags').value.split(',').map(t => t.trim()).filter(t => t);
    const reminder = document.getElementById('note-reminder').value;
    const summary = summarizeNote(content);
    const category = categorizeNote(content);
    notes.push({ content, tags, reminder, summary, category, date: new Date() });
    renderNotes();
    noteForm.reset();
});

function summarizeNote(content) {
    // Simple summary: first 20 words
    return content.split(' ').slice(0, 20).join(' ') + (content.split(' ').length > 20 ? '...' : '');
}

function categorizeNote(content) {
    // Simple categorization: keyword-based
    if (/meeting|call|appointment/i.test(content)) return 'Work';
    if (/buy|shopping|groceries/i.test(content)) return 'Personal';
    if (/exam|study|assignment/i.test(content)) return 'Education';
    return 'General';
}

function renderNotes() {
    notesList.innerHTML = '';
    notes.forEach((n, idx) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${n.category}</strong> <br>${n.summary}<br><span class="reminder">${n.reminder ? 'Reminder: ' + new Date(n.reminder).toLocaleString() : ''}</span><br>${n.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}`;
        notesList.appendChild(li);
    });
}

searchBtn.addEventListener('click', function() {
    const keyword = searchKeyword.value.toLowerCase();
    searchResults.innerHTML = '';
    const results = notes.filter(n => n.content.toLowerCase().includes(keyword) || n.tags.some(tag => tag.toLowerCase().includes(keyword)));
    results.forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${n.category}</strong> <br>${n.summary}<br><span class="reminder">${n.reminder ? 'Reminder: ' + new Date(n.reminder).toLocaleString() : ''}</span><br>${n.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}`;
        searchResults.appendChild(li);
    });
});
// ...existing code...
