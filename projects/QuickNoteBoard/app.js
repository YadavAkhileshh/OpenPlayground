// Quick Note Board - app.js

const notesBoard = document.getElementById('notesBoard');
const addNoteBtn = document.getElementById('addNoteBtn');
const searchInput = document.getElementById('searchInput');

const NOTE_COLORS = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];

function getNotes() {
    return JSON.parse(localStorage.getItem('quickNotes') || '[]');
}

function saveNotes(notes) {
    localStorage.setItem('quickNotes', JSON.stringify(notes));
}

function createNoteElement(note, index) {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    noteDiv.setAttribute('draggable', 'true');
    noteDiv.setAttribute('data-color', note.color);
    noteDiv.setAttribute('data-index', index);

    // Drag events
    noteDiv.addEventListener('dragstart', handleDragStart);
    noteDiv.addEventListener('dragend', handleDragEnd);

    // Note header
    const header = document.createElement('div');
    header.className = 'note-header';

    // Color picker
    const colorPicker = document.createElement('select');
    colorPicker.className = 'color-picker';
    NOTE_COLORS.forEach(color => {
        const opt = document.createElement('option');
        opt.value = color;
        opt.textContent = '';
        opt.style.background = getColorBg(color);
        if (color === note.color) opt.selected = true;
        colorPicker.appendChild(opt);
    });
    colorPicker.addEventListener('change', e => {
        note.color = e.target.value;
        updateNote(index, note);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Delete note';
    deleteBtn.onclick = () => deleteNote(index);

    header.appendChild(colorPicker);
    header.appendChild(deleteBtn);

    // Note textarea
    const textarea = document.createElement('textarea');
    textarea.value = note.text;
    textarea.placeholder = 'Type your note...';
    textarea.oninput = e => {
        note.text = e.target.value;
        updateNote(index, note);
    };

    noteDiv.appendChild(header);
    noteDiv.appendChild(textarea);
    return noteDiv;
}

function getColorBg(color) {
    switch (color) {
        case 'yellow': return '#fffbe7';
        case 'blue': return '#e7f0ff';
        case 'green': return '#e7ffe7';
        case 'pink': return '#ffe7f7';
        case 'purple': return '#f0e7ff';
        case 'orange': return '#fff3e7';
        default: return '#fffbe7';
    }
}

function renderNotes(filter = '') {
    notesBoard.innerHTML = '';
    let notes = getNotes();
    if (filter) {
        notes = notes.filter(n => n.text.toLowerCase().includes(filter.toLowerCase()));
    }
    notes.forEach((note, i) => {
        const noteEl = createNoteElement(note, i);
        notesBoard.appendChild(noteEl);
    });
}

function addNote() {
    const notes = getNotes();
    notes.unshift({ text: '', color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)] });
    saveNotes(notes);
    renderNotes(searchInput.value);
}

function updateNote(index, note) {
    const notes = getNotes();
    notes[index] = note;
    saveNotes(notes);
    renderNotes(searchInput.value);
}

function deleteNote(index) {
    const notes = getNotes();
    notes.splice(index, 1);
    saveNotes(notes);
    renderNotes(searchInput.value);
}

// Drag and drop
let dragSrcIdx = null;
function handleDragStart(e) {
    dragSrcIdx = +this.getAttribute('data-index');
    this.classList.add('dragging');
}
function handleDragEnd(e) {
    this.classList.remove('dragging');
    dragSrcIdx = null;
}
notesBoard.addEventListener('dragover', e => {
    e.preventDefault();
    const dragging = document.querySelector('.note.dragging');
    if (!dragging) return;
    const afterElement = getDragAfterElement(notesBoard, e.clientX, e.clientY);
    if (afterElement == null) {
        notesBoard.appendChild(dragging);
    } else {
        notesBoard.insertBefore(dragging, afterElement);
    }
});
notesBoard.addEventListener('drop', e => {
    e.preventDefault();
    const dragging = document.querySelector('.note.dragging');
    if (!dragging) return;
    const newIdx = Array.from(notesBoard.children).indexOf(dragging);
    if (dragSrcIdx !== null && newIdx !== dragSrcIdx) {
        const notes = getNotes();
        const [moved] = notes.splice(dragSrcIdx, 1);
        notes.splice(newIdx, 0, moved);
        saveNotes(notes);
        renderNotes(searchInput.value);
    }
});
function getDragAfterElement(container, x, y) {
    const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];
    return draggableElements.find(el => {
        const rect = el.getBoundingClientRect();
        return (
            y > rect.top && y < rect.bottom && x > rect.left && x < rect.right
        );
    }) || null;
}

// Event listeners
addNoteBtn.onclick = addNote;
searchInput.oninput = e => renderNotes(e.target.value);

// Initial render
renderNotes();
