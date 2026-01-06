class DiaryApp {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('personal-diary-entries')) || [];
        this.currentId = null;

        // Elements
        this.container = document.getElementById('entries-container');
        this.addBtn = document.getElementById('add-entry-btn');
        this.modal = document.getElementById('entry-modal');
        this.closeModalBtn = document.getElementById('close-modal-btn');
        this.saveBtn = document.getElementById('save-entry-btn');
        this.searchInput = document.getElementById('search-input');
        this.dateFilter = document.getElementById('date-filter');
        this.resetFilterBtn = document.getElementById('reset-filter-btn');
        this.emptyState = document.getElementById('empty-state');
        this.modalTitle = document.getElementById('modal-title');

        // Form Inputs
        this.dateInput = document.getElementById('entry-date');
        this.moodInput = document.getElementById('entry-mood');
        this.titleInput = document.getElementById('entry-title');
        this.contentInput = document.getElementById('entry-content');

        this.init();
    }

    init() {
        this.renderEntries();
        this.addEventListeners();
    }

    addEventListeners() {
        this.addBtn.addEventListener('click', () => this.openModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.saveBtn.addEventListener('click', () => this.saveEntry());

        this.searchInput.addEventListener('input', () => this.renderEntries());
        this.dateFilter.addEventListener('change', () => this.renderEntries());
        this.resetFilterBtn.addEventListener('click', () => {
            this.dateFilter.value = '';
            this.searchInput.value = '';
            this.renderEntries();
        });

        // Close modal on background click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    openModal(entry = null) {
        if (entry) {
            this.currentId = entry.id;
            this.dateInput.value = entry.date;
            this.moodInput.value = entry.mood;
            this.titleInput.value = entry.title;
            this.contentInput.value = entry.content;
            this.modalTitle.textContent = 'Edit Entry';
        } else {
            this.currentId = null;
            this.dateInput.value = new Date().toISOString().split('T')[0];
            this.moodInput.value = '😊';
            this.titleInput.value = '';
            this.contentInput.value = '';
            this.modalTitle.textContent = 'New Entry';
        }
        this.modal.classList.remove('hidden');
        setTimeout(() => this.modal.classList.add('active'), 10);
    }

    closeModal() {
        this.modal.classList.remove('active');
        setTimeout(() => this.modal.classList.add('hidden'), 300);
    }

    saveEntry() {
        const date = this.dateInput.value;
        const mood = this.moodInput.value;
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();

        if (!date || !title || !content) {
            alert('Please fill in all fields (Date, Title, Content).');
            return;
        }

        if (this.currentId) {
            // Update
            this.entries = this.entries.map(e =>
                e.id === this.currentId ? { ...e, date, mood, title, content } : e
            );
        } else {
            // Create
            const newEntry = {
                id: Date.now().toString(),
                date,
                mood,
                title,
                content
            };
            this.entries.unshift(newEntry);
        }

        this.saveToStorage();
        this.renderEntries();
        this.closeModal();
    }

    deleteEntry(id) {
        if (confirm('Delete this diary entry?')) {
            this.entries = this.entries.filter(e => e.id !== id);
            this.saveToStorage();
            this.renderEntries();
        }
    }

    saveToStorage() {
        // Sort by date descending
        this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        localStorage.setItem('personal-diary-entries', JSON.stringify(this.entries));
    }

    renderEntries() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const dateTerm = this.dateFilter.value;

        const filtered = this.entries.filter(entry => {
            const matchesText = entry.title.toLowerCase().includes(searchTerm) ||
                entry.content.toLowerCase().includes(searchTerm);
            const matchesDate = dateTerm ? entry.date === dateTerm : true;
            return matchesText && matchesDate;
        });

        this.container.innerHTML = '';

        if (filtered.length === 0) {
            this.emptyState.classList.remove('hidden');
        } else {
            this.emptyState.classList.add('hidden');
            filtered.forEach(entry => {
                const el = document.createElement('div');
                el.className = 'entry-card';
                el.innerHTML = `
                    <div class="entry-header">
                        <div class="entry-date-mood">
                            <span class="entry-mood">${entry.mood}</span>
                            <span class="entry-date">${this.formatDate(entry.date)}</span>
                        </div>
                        <div class="entry-actions">
                            <button class="icon-btn edit-btn"><i class="ri-pencil-line"></i></button>
                            <button class="icon-btn delete-btn"><i class="ri-delete-bin-line"></i></button>
                        </div>
                    </div>
                    <h3 class="entry-title">${this.escapeHtml(entry.title)}</h3>
                    <div class="entry-content">${this.escapeHtml(entry.content)}</div>
                `;

                el.querySelector('.edit-btn').addEventListener('click', () => this.openModal(entry));
                el.querySelector('.delete-btn').addEventListener('click', () => this.deleteEntry(entry.id));

                this.container.appendChild(el);
            });
        }
    }

    formatDate(dateStr) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DiaryApp();
});
