/* Calendar Functionality */

const Calendar = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),
    selectedDate: null,

    init() {
        this.render();
    },

    render() {
        const grid = document.getElementById('calendarGrid');
        const title = document.getElementById('calendarTitle');

        // Set title
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'];
        title.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        // Clear grid
        grid.innerHTML = '';

        // Add day headers
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        days.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day';
            header.textContent = day;
            header.style.fontWeight = '600';
            header.style.color = 'var(--text-muted)';
            header.style.cursor = 'default';
            grid.appendChild(header);
        });

        // Get first day of month and number of days
        const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
        const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day disabled';
            grid.appendChild(empty);
        }

        // Add days
        const today = new Date();
        const tasks = Storage.getTasks();
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;

            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateStr = date.toDateString();
            
            // Get tasks for this day
            const dayTasks = tasks.filter(t => {
                return new Date(t.dueDate).toDateString() === dateStr;
            });
            
            // Apply color coding based on task status
            if (dayTasks.length > 0) {
                const allCompleted = dayTasks.every(t => t.completed);
                if (allCompleted) {
                    dayEl.classList.add('day-completed');
                } else {
                    dayEl.classList.add('day-incomplete');
                }
            }
            
            // Check if today (pale yellow)
            if (dateStr === today.toDateString()) {
                dayEl.classList.add('today');
            }

            // Check if selected
            if (this.selectedDate && 
                dateStr === this.selectedDate.toDateString()) {
                dayEl.classList.add('selected');
            }

            dayEl.addEventListener('click', () => this.selectDate(date));
            grid.appendChild(dayEl);
        }
    },

    selectDate(date) {
        this.selectedDate = date;
        
        // Update input if in modal context
        const dateInput = document.getElementById('taskDate');
        if (dateInput) {
            // Format date for storage (YYYY-MM-DD)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            dateInput.value = `${year}-${month}-${day}`;
            
            // Store the actual date value in a data attribute for form submission
            dateInput.dataset.date = `${year}-${month}-${day}`;
            
            // Display user-friendly format
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            dateInput.value = date.toLocaleDateString('en-US', options);
            dateInput.dataset.isoDate = `${year}-${month}-${day}`;
        }

        this.close();
    },

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        }
        this.render();
    },

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    },

    open() {
        // Re-render calendar with latest data when opening
        this.render();
        document.getElementById('calendarModal').classList.add('active');
    },

    close() {
        document.getElementById('calendarModal').classList.remove('active');
    }
};
