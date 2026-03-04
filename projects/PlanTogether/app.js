// PlanTogether - Collaborative Event & Schedule Planner
// Author: Ayaanshaikh12243
// Description: Propose/vote dates, shared calendar, agenda, notes, real-time updates, notifications

// =====================
// Utility Functions
// =====================
const Utils = {
    generateId: () => '_' + Math.random().toString(36).substr(2, 9),
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    },
    debounce: (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },
    clone: (obj) => JSON.parse(JSON.stringify(obj)),
};

// =====================
// Event Option Model
// =====================
class EventOption {
    constructor({date, proposer}) {
        this.id = Utils.generateId();
        this.date = date || null;
        this.proposer = proposer || 'Anonymous';
        this.votes = [];
    }
}

// =====================
// Agenda Item Model
// =====================
class AgendaItem {
    constructor({text, addedBy}) {
        this.id = Utils.generateId();
        this.text = text || '';
        this.addedBy = addedBy || 'Anonymous';
    }
}

// =====================
// Note Model
// =====================
class Note {
    constructor({text, addedBy}) {
        this.id = Utils.generateId();
        this.text = text || '';
        this.addedBy = addedBy || 'Anonymous';
        this.date = new Date();
    }
}

// =====================
// Main Planner Class
// =====================
class PlanTogether {
    constructor() {
        this.eventOptions = [];
        this.agenda = [];
        this.notes = [];
        this.load();
    }

    proposeDate(date, proposer) {
        const option = new EventOption({date, proposer});
        this.eventOptions.push(option);
        this.save();
        return option;
    }

    voteOption(optionId, voter) {
        const option = this.eventOptions.find(o => o.id === optionId);
        if (option && !option.votes.includes(voter)) {
            option.votes.push(voter);
            this.save();
        }
    }

    addAgendaItem(text, addedBy) {
        const item = new AgendaItem({text, addedBy});
        this.agenda.push(item);
        this.save();
        return item;
    }

    addNote(text, addedBy) {
        const note = new Note({text, addedBy});
        this.notes.push(note);
        this.save();
        return note;
    }

    getWinningOption() {
        if (this.eventOptions.length === 0) return null;
        return this.eventOptions.reduce((a, b) => (a.votes.length > b.votes.length ? a : b));
    }

    save() {
        localStorage.setItem('plantogether_data', JSON.stringify({
            eventOptions: this.eventOptions,
            agenda: this.agenda,
            notes: this.notes
        }));
    }

    load() {
        const data = localStorage.getItem('plantogether_data');
        if (data) {
            const parsed = JSON.parse(data);
            this.eventOptions = parsed.eventOptions || [];
            this.agenda = parsed.agenda || [];
            this.notes = parsed.notes || [];
        }
    }
}

// =====================
// Notifications
// =====================
class Notifier {
    static show(message) {
        const notif = document.getElementById('notifications');
        if (!notif) return;
        notif.textContent = message;
        notif.style.display = 'block';
        setTimeout(() => { notif.style.display = 'none'; }, 2500);
    }
}

// =====================
// UI Rendering
// =====================
class UI {
    constructor(planner) {
        this.planner = planner;
        this.renderAll();
        this.bindEvents();
    }

    renderAll() {
        this.renderEventOptions();
        this.renderCalendar();
        this.renderAgenda();
        this.renderNotes();
    }

    renderEventOptions() {
        const container = document.getElementById('event-options');
        if (!container) return;
        container.innerHTML = '';
        this.planner.eventOptions.forEach(option => {
            const div = document.createElement('div');
            div.className = 'event-option';
            div.innerHTML = `
                <b>${Utils.formatDate(option.date)}</b> <span>by ${option.proposer}</span><br>
                <span>Votes: ${option.votes.length}</span>
                <button data-id="${option.id}" class="vote-btn">Vote</button>
            `;
            container.appendChild(div);
        });
    }

    renderCalendar() {
        const container = document.getElementById('calendar-container');
        if (!container) return;
        container.innerHTML = '';
        const winning = this.planner.getWinningOption();
        if (winning) {
            const section = document.createElement('div');
            section.className = 'calendar-section';
            section.innerHTML = `<h4>Selected Date</h4><div class="calendar-event"><b>${Utils.formatDate(winning.date)}</b> (Votes: ${winning.votes.length})</div>`;
            container.appendChild(section);
        } else {
            container.innerHTML = '<em>No date selected yet.</em>';
        }
    }

    renderAgenda() {
        const container = document.getElementById('agenda-list');
        if (!container) return;
        container.innerHTML = '';
        this.planner.agenda.forEach(item => {
            const div = document.createElement('div');
            div.className = 'agenda-item';
            div.innerHTML = `<b>${item.text}</b> <span>by ${item.addedBy}</span>`;
            container.appendChild(div);
        });
    }

    renderNotes() {
        const container = document.getElementById('notes-list');
        if (!container) return;
        container.innerHTML = '';
        this.planner.notes.forEach(note => {
            const div = document.createElement('div');
            div.className = 'note-item';
            div.innerHTML = `<span>${note.text}</span> <small>by ${note.addedBy} (${Utils.formatDate(note.date)})</small>`;
            container.appendChild(div);
        });
    }

    bindEvents() {
        // Propose Date
        document.getElementById('propose-date-btn')?.addEventListener('click', () => {
            const date = prompt('Propose date/time (YYYY-MM-DD HH:MM):');
            const proposer = prompt('Your name:', 'Anonymous');
            if (date) {
                this.planner.proposeDate(date, proposer);
                this.renderAll();
                Notifier.show('Date proposed!');
            }
        });
        // Vote
        document.getElementById('event-options')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('vote-btn')) {
                const id = e.target.getAttribute('data-id');
                const voter = prompt('Your name:', 'Anonymous');
                if (id && voter) {
                    this.planner.voteOption(id, voter);
                    this.renderAll();
                    Notifier.show('Vote recorded!');
                }
            }
        });
        // Add Agenda
        document.getElementById('add-agenda-btn')?.addEventListener('click', () => {
            const text = prompt('Agenda item:');
            const addedBy = prompt('Your name:', 'Anonymous');
            if (text) {
                this.planner.addAgendaItem(text, addedBy);
                this.renderAgenda();
                Notifier.show('Agenda item added!');
            }
        });
        // Add Note
        document.getElementById('add-note-btn')?.addEventListener('click', () => {
            const text = prompt('Note:');
            const addedBy = prompt('Your name:', 'Anonymous');
            if (text) {
                this.planner.addNote(text, addedBy);
                this.renderNotes();
                Notifier.show('Note added!');
            }
        });
    }
}

// =====================
// Main App Initialization
// =====================
window.addEventListener('DOMContentLoaded', () => {
    const planner = new PlanTogether();
    const ui = new UI(planner);
});
