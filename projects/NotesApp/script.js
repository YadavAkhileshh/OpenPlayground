class NoteApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
        this.currentNoteId = null;

        this.notesGrid = document.getElementById('notes-grid');
        this.addNoteBtn = document.getElementById('add-note-btn');
        this.modal = document.getElementById('note-modal');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.saveNoteBtn = document.getElementById('save-note-btn');
        this.titleInput = document.getElementById('note-title-input');
        this.contentInput = document.getElementById('note-content-input');
        this.searchInput = document.getElementById('search-input');
        this.modalTitle = document.getElementById('modal-title');
        this.emptyState = document.getElementById('empty-state');

        this.init();
    }

    init() {
        this.renderNotes();
        this.addEventListeners();
    }

    addEventListeners() {
        this.addNoteBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.saveNoteBtn.addEventListener('click', () => this.saveNote());
        
        // Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        this.searchInput.addEventListener('input', (e) => {
            this.renderNotes(e.target.value);
        });
    }

    openModal(note = null) {
        if (note) {
            this.currentNoteId = note.id;
            this.titleInput.value = note.title;
            this.contentInput.value = note.content;
            this.modalTitle.textContent = 'Edit Note';
        } else {
            this.currentNoteId = null;
            this.titleInput.value = '';
            this.contentInput.value = '';
            this.modalTitle.textContent = 'Add Note';
        }
        this.modal.classList.add('active');
        this.modal.classList.remove('hidden');
        this.titleInput.focus();
    }

    closeModal() {
        this.modal.classList.remove('active');
        // Wait for animation to finish before hiding content fully (optional interaction polish)
        setTimeout(() => {
            if (!this.modal.classList.contains('active')) {
                this.modal.classList.add('hidden');
            }
        }, 300);
    }

    saveNote() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();

        if (!title && !content) {
            alert('Please enter a title or content.');
            return;
        }

        if (this.currentNoteId) {
            // Edit existing
            this.notes = this.notes.map(note => 
                note.id === this.currentNoteId 
                    ? { ...note, title, content, updatedAt: new Date().toISOString() }
                    : note
            );
        } else {
            // Create new
            const newNote = {
                id: Date.now().toString(),
                title,
                content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.notes.unshift(newNote); // Add to top
        }

        this.saveToStorage();
        this.renderNotes();
        this.closeModal();
    }

    deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveToStorage();
            this.renderNotes(this.searchInput.value);
        }
    }

    saveToStorage() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    renderNotes(searchTerm = '') {
        const filteredNotes = this.notes.filter(note => {
            const term = searchTerm.toLowerCase();
            return note.title.toLowerCase().includes(term) || 
                   note.content.toLowerCase().includes(term);
        });

        this.notesGrid.innerHTML = '';

        if (filteredNotes.length === 0) {
            this.emptyState.classList.remove('hidden');
            this.notesGrid.classList.add('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            this.notesGrid.classList.remove('hidden');
            
            filteredNotes.forEach(note => {
                const noteEl = document.createElement('div');
                noteEl.className = 'note-card';
                noteEl.innerHTML = `
                    <div class="note-header">
                        <span class="note-title">${this.escapeHtml(note.title || 'Untitled')}</span>
                        <div class="note-actions">
                            <button class="edit-btn"><i class="ri-pencil-line"></i></button>
                            <button class="delete-btn"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </div>
                    <div class="note-content">${this.escapeHtml(note.content)}</div>
                    <div class="note-footer">
                        <span class="note-date">${this.formatDate(note.updatedAt)}</span>
                    </div>
                `;

                // Add event listeners specific to this card
                const editBtn = noteEl.querySelector('.edit-btn');
                const deleteBtn = noteEl.querySelector('.delete-btn');

                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent card click if we add one later
                    this.openModal(note);
                });

                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteNote(note.id);
                });

                this.notesGrid.appendChild(noteEl);
            });
        }
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new NoteApp();
});
