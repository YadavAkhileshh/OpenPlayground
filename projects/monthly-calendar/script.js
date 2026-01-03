class MonthlyCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = null;
        this.events = this.loadEvents();
        this.editingEvent = null;
        
        this.initializeElements();
        this.bindEvents();
        this.renderCalendar();
        this.renderEvents();
    }

    initializeElements() {
        this.monthYearElement = document.getElementById('monthYear');
        this.calendarDaysElement = document.getElementById('calendarDays');
        this.eventsListElement = document.getElementById('eventsList');
        this.eventModal = document.getElementById('eventModal');
        this.eventForm = document.getElementById('eventForm');
        this.modalTitle = document.getElementById('modalTitle');
        
        // Form elements
        this.eventTitleInput = document.getElementById('eventTitle');
        this.eventDateInput = document.getElementById('eventDate');
        this.eventTimeInput = document.getElementById('eventTime');
        this.eventDescriptionInput = document.getElementById('eventDescription');
        this.eventColorSelect = document.getElementById('eventColor');
        
        // Buttons
        this.prevMonthBtn = document.getElementById('prevMonth');
        this.nextMonthBtn = document.getElementById('nextMonth');
        this.addEventBtn = document.getElementById('addEventBtn');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
    }

    bindEvents() {
        this.prevMonthBtn.addEventListener('click', () => this.previousMonth());
        this.nextMonthBtn.addEventListener('click', () => this.nextMonth());
        this.addEventBtn.addEventListener('click', () => this.openAddEventModal());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        this.cancelBtn.addEventListener('click', () => this.closeModal());
        this.eventForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.deleteBtn.addEventListener('click', () => this.deleteEvent());
        
        // Close modal when clicking outside
        this.eventModal.addEventListener('click', (e) => {
            if (e.target === this.eventModal) {
                this.closeModal();
            }
        });
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month/year display
        this.monthYearElement.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);
        
        // Clear previous calendar
        this.calendarDaysElement.innerHTML = '';
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Add previous month's trailing days
        const prevMonth = new Date(year, month - 1, 0);
        const prevMonthDays = prevMonth.getDate();
        
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const dayElement = this.createDayElement(
                prevMonthDays - i,
                new Date(year, month - 1, prevMonthDays - i),
                true
            );
            this.calendarDaysElement.appendChild(dayElement);
        }
        
        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayElement = this.createDayElement(day, date, false);
            this.calendarDaysElement.appendChild(dayElement);
        }
        
        // Add next month's leading days
        const totalCells = this.calendarDaysElement.children.length;
        const remainingCells = 42 - totalCells; // 6 rows × 7 days
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(
                day,
                new Date(year, month + 1, day),
                true
            );
            this.calendarDaysElement.appendChild(dayElement);
        }
    }

    createDayElement(dayNumber, date, isOtherMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Check if it's today
        const today = new Date();
        if (this.isSameDay(date, today)) {
            dayElement.classList.add('today');
        }
        
        // Check if it's selected
        if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
            dayElement.classList.add('selected');
        }
        
        // Create day number
        const dayNumberElement = document.createElement('div');
        dayNumberElement.className = 'day-number';
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);
        
        // Create events container
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        
        // Add events for this day
        const dayEvents = this.getEventsForDate(date);
        dayEvents.forEach(event => {
            const eventDot = document.createElement('div');
            eventDot.className = 'event-dot';
            eventDot.style.backgroundColor = event.color;
            eventDot.textContent = event.title;
            eventDot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditEventModal(event);
            });
            eventsContainer.appendChild(eventDot);
        });
        
        dayElement.appendChild(eventsContainer);
        
        // Add click event to select day
        dayElement.addEventListener('click', () => {
            this.selectDate(date);
        });
        
        return dayElement;
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        this.renderCalendar();
        this.renderEvents();
    }

    getEventsForDate(date) {
        return this.events.filter(event => 
            this.isSameDay(new Date(event.date), date)
        );
    }

    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.renderCalendar();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.renderCalendar();
    }

    renderEvents() {
        this.eventsListElement.innerHTML = '';
        
        let eventsToShow = this.events;
        
        // If a date is selected, show only events for that date
        if (this.selectedDate) {
            eventsToShow = this.getEventsForDate(this.selectedDate);
        } else {
            // Show events for current month
            eventsToShow = this.events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === this.currentDate.getMonth() &&
                       eventDate.getFullYear() === this.currentDate.getFullYear();
            });
        }
        
        // Sort events by date and time
        eventsToShow.sort((a, b) => {
            const dateA = new Date(a.date + (a.time ? ' ' + a.time : ''));
            const dateB = new Date(b.date + (b.time ? ' ' + b.time : ''));
            return dateA - dateB;
        });
        
        if (eventsToShow.length === 0) {
            const noEventsElement = document.createElement('div');
            noEventsElement.className = 'no-events';
            noEventsElement.textContent = this.selectedDate ? 
                'No events for selected date' : 'No events this month';
            noEventsElement.style.textAlign = 'center';
            noEventsElement.style.color = '#666';
            noEventsElement.style.padding = '20px';
            this.eventsListElement.appendChild(noEventsElement);
            return;
        }
        
        eventsToShow.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item';
            eventElement.style.borderLeftColor = event.color;
            
            const titleElement = document.createElement('div');
            titleElement.className = 'event-title';
            titleElement.textContent = event.title;
            
            const detailsElement = document.createElement('div');
            detailsElement.className = 'event-details';
            
            const eventDate = new Date(event.date);
            const dateStr = eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            let detailsText = dateStr;
            if (event.time) {
                const timeStr = new Date('2000-01-01 ' + event.time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                detailsText += ' at ' + timeStr;
            }
            
            if (event.description) {
                detailsText += ' • ' + event.description;
            }
            
            detailsElement.textContent = detailsText;
            
            eventElement.appendChild(titleElement);
            eventElement.appendChild(detailsElement);
            
            eventElement.addEventListener('click', () => {
                this.openEditEventModal(event);
            });
            
            this.eventsListElement.appendChild(eventElement);
        });
    }

    openAddEventModal() {
        this.editingEvent = null;
        this.modalTitle.textContent = 'Add Event';
        this.deleteBtn.style.display = 'none';
        
        // Set default date to selected date or today
        const defaultDate = this.selectedDate || new Date();
        this.eventDateInput.value = this.formatDateForInput(defaultDate);
        
        // Clear form
        this.eventTitleInput.value = '';
        this.eventTimeInput.value = '';
        this.eventDescriptionInput.value = '';
        this.eventColorSelect.value = '#3b82f6';
        
        this.eventModal.style.display = 'block';
        this.eventTitleInput.focus();
    }

    openEditEventModal(event) {
        this.editingEvent = event;
        this.modalTitle.textContent = 'Edit Event';
        this.deleteBtn.style.display = 'block';
        
        // Populate form with event data
        this.eventTitleInput.value = event.title;
        this.eventDateInput.value = event.date;
        this.eventTimeInput.value = event.time || '';
        this.eventDescriptionInput.value = event.description || '';
        this.eventColorSelect.value = event.color;
        
        this.eventModal.style.display = 'block';
        this.eventTitleInput.focus();
    }

    closeModal() {
        this.eventModal.style.display = 'none';
        this.editingEvent = null;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const eventData = {
            id: this.editingEvent ? this.editingEvent.id : Date.now().toString(),
            title: this.eventTitleInput.value.trim(),
            date: this.eventDateInput.value,
            time: this.eventTimeInput.value,
            description: this.eventDescriptionInput.value.trim(),
            color: this.eventColorSelect.value
        };
        
        if (this.editingEvent) {
            // Update existing event
            const index = this.events.findIndex(e => e.id === this.editingEvent.id);
            if (index !== -1) {
                this.events[index] = eventData;
            }
        } else {
            // Add new event
            this.events.push(eventData);
        }
        
        this.saveEvents();
        this.renderCalendar();
        this.renderEvents();
        this.closeModal();
    }

    deleteEvent() {
        if (this.editingEvent && confirm('Are you sure you want to delete this event?')) {
            this.events = this.events.filter(e => e.id !== this.editingEvent.id);
            this.saveEvents();
            this.renderCalendar();
            this.renderEvents();
            this.closeModal();
        }
    }

    formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    loadEvents() {
        try {
            const stored = localStorage.getItem('calendar-events');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading events:', error);
            return [];
        }
    }

    saveEvents() {
        try {
            localStorage.setItem('calendar-events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving events:', error);
        }
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MonthlyCalendar();
});