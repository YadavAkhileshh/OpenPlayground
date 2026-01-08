
        // Diary application state
        const diaryApp = {
            currentDate: new Date(),
            selectedDate: new Date(),
            entries: [],
            editingEntryId: null,
            currentView: 'calendar',
            searchTerm: ''
        };

        // DOM Elements
        const elements = {
            calendar: document.getElementById('calendar'),
            currentMonth: document.getElementById('current-month'),
            prevMonthBtn: document.getElementById('prev-month'),
            nextMonthBtn: document.getElementById('next-month'),
            entryDate: document.getElementById('entry-date'),
            entryTitle: document.getElementById('entry-title'),
            entryContent: document.getElementById('entry-content'),
            saveBtn: document.getElementById('save-btn'),
            updateBtn: document.getElementById('update-btn'),
            deleteBtn: document.getElementById('delete-btn'),
            newBtn: document.getElementById('new-btn'),
            entriesContainer: document.getElementById('entries-container'),
            searchInput: document.getElementById('search-input'),
            searchBtn: document.getElementById('search-btn'),
            searchResults: document.getElementById('search-results'),
            viewCalendar: document.getElementById('view-calendar'),
            viewList: document.getElementById('view-list')
        };

        // Initialize the application
        function init() {
            // Load entries from localStorage
            loadEntries();
            
            // Set up event listeners
            setupEventListeners();
            
            // Initialize the calendar
            renderCalendar();
            
            // Set today's date in the form
            setFormDate(new Date());
            
            // Load recent entries
            renderEntriesList();
            
            // Update search results info
            updateSearchResults();
        }

        // Load entries from localStorage
        function loadEntries() {
            const entriesJson = localStorage.getItem('diaryEntries');
            diaryApp.entries = entriesJson ? JSON.parse(entriesJson) : [];
        }

        // Save entries to localStorage
        function saveEntries() {
            localStorage.setItem('diaryEntries', JSON.stringify(diaryApp.entries));
        }

        // Set up event listeners
        function setupEventListeners() {
            // Calendar navigation
            elements.prevMonthBtn.addEventListener('click', () => {
                diaryApp.currentDate.setMonth(diaryApp.currentDate.getMonth() - 1);
                renderCalendar();
            });
            
            elements.nextMonthBtn.addEventListener('click', () => {
                diaryApp.currentDate.setMonth(diaryApp.currentDate.getMonth() + 1);
                renderCalendar();
            });
            
            // Form buttons
            elements.saveBtn.addEventListener('click', saveEntry);
            elements.updateBtn.addEventListener('click', updateEntry);
            elements.deleteBtn.addEventListener('click', deleteEntry);
            elements.newBtn.addEventListener('click', newEntry);
            
            // Search functionality
            elements.searchBtn.addEventListener('click', performSearch);
            elements.searchInput.addEventListener('input', function() {
                diaryApp.searchTerm = this.value;
                if (diaryApp.searchTerm === '') {
                    renderEntriesList();
                    updateSearchResults();
                }
            });
            
            // View toggles
            elements.viewCalendar.addEventListener('click', () => switchView('calendar'));
            elements.viewList.addEventListener('click', () => switchView('list'));
        }

        // Render the calendar
        function renderCalendar() {
            const year = diaryApp.currentDate.getFullYear();
            const month = diaryApp.currentDate.getMonth();
            
            // Update month display
            elements.currentMonth.textContent = `${new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
            
            // Clear calendar
            elements.calendar.innerHTML = '';
            
            // Add day headers
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            days.forEach(day => {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-header';
                dayElement.textContent = day;
                elements.calendar.appendChild(dayElement);
            });
            
            // Get first day of month and total days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day';
                elements.calendar.appendChild(emptyDay);
            }
            
            // Add days of the month
            const today = new Date();
            const isToday = (day) => {
                return day === today.getDate() && 
                       month === today.getMonth() && 
                       year === today.getFullYear();
            };
            
            const isSelected = (day) => {
                return day === diaryApp.selectedDate.getDate() && 
                       month === diaryApp.selectedDate.getMonth() && 
                       year === diaryApp.selectedDate.getFullYear();
            };
            
            const hasEntry = (day) => {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return diaryApp.entries.some(entry => entry.date === dateStr);
            };
            
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                dayElement.textContent = day;
                
                if (isToday(day)) {
                    dayElement.classList.add('today');
                }
                
                if (isSelected(day)) {
                    dayElement.classList.add('selected');
                }
                
                if (hasEntry(day)) {
                    dayElement.classList.add('has-entry');
                }
                
                dayElement.addEventListener('click', () => {
                    diaryApp.selectedDate = new Date(year, month, day);
                    renderCalendar();
                    loadEntryForDate(diaryApp.selectedDate);
                });
                
                elements.calendar.appendChild(dayElement);
            }
        }

        // Set form date
        function setFormDate(date) {
            const dateStr = date.toISOString().split('T')[0];
            elements.entryDate.value = dateStr;
        }

        // Load entry for a specific date
        function loadEntryForDate(date) {
            const dateStr = date.toISOString().split('T')[0];
            const entry = diaryApp.entries.find(entry => entry.date === dateStr);
            
            if (entry) {
                elements.entryTitle.value = entry.title;
                elements.entryContent.value = entry.content;
                diaryApp.editingEntryId = entry.id;
                
                // Show update/delete buttons, hide save button
                elements.saveBtn.classList.add('hidden');
                elements.updateBtn.classList.remove('hidden');
                elements.deleteBtn.classList.remove('hidden');
            } else {
                // Clear form for new entry
                elements.entryTitle.value = '';
                elements.entryContent.value = '';
                diaryApp.editingEntryId = null;
                
                // Show save button, hide update/delete buttons
                elements.saveBtn.classList.remove('hidden');
                elements.updateBtn.classList.add('hidden');
                elements.deleteBtn.classList.add('hidden');
            }
            
            setFormDate(date);
        }

        // Save a new entry
        function saveEntry() {
            const title = elements.entryTitle.value.trim();
            const content = elements.entryContent.value.trim();
            const date = elements.entryDate.value;
            
            if (!title || !content) {
                alert('Please enter both title and content for your diary entry.');
                return;
            }
            
            const newEntry = {
                id: Date.now().toString(),
                date: date,
                title: title,
                content: content,
                created: new Date().toISOString()
            };
            
            diaryApp.entries.push(newEntry);
            saveEntries();
            
            // Reset form
            newEntry();
            
            // Update UI
            renderCalendar();
            renderEntriesList();
            
            alert('Diary entry saved successfully!');
        }

        // Update an existing entry
        function updateEntry() {
            if (!diaryApp.editingEntryId) return;
            
            const title = elements.entryTitle.value.trim();
            const content = elements.entryContent.value.trim();
            const date = elements.entryDate.value;
            
            if (!title || !content) {
                alert('Please enter both title and content for your diary entry.');
                return;
            }
            
            const entryIndex = diaryApp.entries.findIndex(entry => entry.id === diaryApp.editingEntryId);
            
            if (entryIndex !== -1) {
                diaryApp.entries[entryIndex].title = title;
                diaryApp.entries[entryIndex].content = content;
                diaryApp.entries[entryIndex].date = date;
                diaryApp.entries[entryIndex].updated = new Date().toISOString();
                
                saveEntries();
                
                // Reset form
                newEntry();
                
                // Update UI
                renderCalendar();
                renderEntriesList();
                
                alert('Diary entry updated successfully!');
            }
        }

        // Delete an entry
        function deleteEntry() {
            if (!diaryApp.editingEntryId) return;
            
            if (confirm('Are you sure you want to delete this diary entry?')) {
                diaryApp.entries = diaryApp.entries.filter(entry => entry.id !== diaryApp.editingEntryId);
                saveEntries();
                
                // Reset form
                newEntry();
                
                // Update UI
                renderCalendar();
                renderEntriesList();
                
                alert('Diary entry deleted successfully!');
            }
        }

        // Create a new entry
        function newEntry() {
            diaryApp.editingEntryId = null;
            elements.entryTitle.value = '';
            elements.entryContent.value = '';
            setFormDate(new Date());
            
            // Show save button, hide update/delete buttons
            elements.saveBtn.classList.remove('hidden');
            elements.updateBtn.classList.add('hidden');
            elements.deleteBtn.classList.add('hidden');
            
            // Update selected date to today
            diaryApp.selectedDate = new Date();
            renderCalendar();
        }

        // Render entries list
        function renderEntriesList() {
            let entriesToShow = [...diaryApp.entries];
            
            // Apply search filter if applicable
            if (diaryApp.searchTerm) {
                const term = diaryApp.searchTerm.toLowerCase();
                entriesToShow = entriesToShow.filter(entry => 
                    entry.title.toLowerCase().includes(term) || 
                    entry.content.toLowerCase().includes(term)
                );
            }
            
            // Sort by date (newest first)
            entriesToShow.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Limit to 10 entries for the list view
            const displayEntries = entriesToShow.slice(0, 10);
            
            if (displayEntries.length === 0) {
                elements.entriesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="far fa-clipboard"></i>
                        <h3>No diary entries found</h3>
                        <p>${diaryApp.searchTerm ? 'Try a different search term' : 'Start by writing your first diary entry!'}</p>
                    </div>
                `;
                return;
            }
            
            let entriesHTML = '';
            
            displayEntries.forEach(entry => {
                const entryDate = new Date(entry.date);
                const formattedDate = entryDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                
                // Truncate content for preview
                const contentPreview = entry.content.length > 150 
                    ? entry.content.substring(0, 150) + '...' 
                    : entry.content;
                
                entriesHTML += `
                    <div class="entry-item" data-id="${entry.id}">
                        <div class="entry-header">
                            <div class="entry-date">${formattedDate}</div>
                            <div class="entry-title"><strong>${entry.title}</strong></div>
                        </div>
                        <div class="entry-content">${contentPreview}</div>
                        <div class="entry-actions">
                            <button class="btn btn-secondary btn-small edit-entry" data-id="${entry.id}">
                                <i class="far fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-secondary btn-small view-entry" data-id="${entry.id}">
                                <i class="far fa-eye"></i> View
                            </button>
                        </div>
                    </div>
                `;
            });
            
            elements.entriesContainer.innerHTML = entriesHTML;
            
            // Add event listeners to entry buttons
            document.querySelectorAll('.edit-entry').forEach(btn => {
                btn.addEventListener('click', function() {
                    const entryId = this.getAttribute('data-id');
                    const entry = diaryApp.entries.find(e => e.id === entryId);
                    
                    if (entry) {
                        diaryApp.selectedDate = new Date(entry.date);
                        diaryApp.editingEntryId = entry.id;
                        
                        elements.entryTitle.value = entry.title;
                        elements.entryContent.value = entry.content;
                        setFormDate(new Date(entry.date));
                        
                        // Show update/delete buttons, hide save button
                        elements.saveBtn.classList.add('hidden');
                        elements.updateBtn.classList.remove('hidden');
                        elements.deleteBtn.classList.remove('hidden');
                        
                        // Update calendar selection
                        renderCalendar();
                    }
                });
            });
            
            document.querySelectorAll('.view-entry').forEach(btn => {
                btn.addEventListener('click', function() {
                    const entryId = this.getAttribute('data-id');
                    const entry = diaryApp.entries.find(e => e.id === entryId);
                    
                    if (entry) {
                        const entryDate = new Date(entry.date);
                        const formattedDate = entryDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        });
                        
                        alert(`Title: ${entry.title}\n\nDate: ${formattedDate}\n\nContent:\n${entry.content}`);
                    }
                });
            });
        }

        // Perform search
        function performSearch() {
            diaryApp.searchTerm = elements.searchInput.value.trim();
            renderEntriesList();
            updateSearchResults();
        }

        // Update search results info
        function updateSearchResults() {
            if (!diaryApp.searchTerm) {
                elements.searchResults.textContent = 'Search for entries containing specific words';
                return;
            }
            
            const term = diaryApp.searchTerm.toLowerCase();
            const filteredEntries = diaryApp.entries.filter(entry => 
                entry.title.toLowerCase().includes(term) || 
                entry.content.toLowerCase().includes(term)
            );
            
            elements.searchResults.textContent = `Found ${filteredEntries.length} entries matching "${diaryApp.searchTerm}"`;
        }

        // Switch between calendar and list view
        function switchView(view) {
            diaryApp.currentView = view;
            
            // Update active button
            if (view === 'calendar') {
                elements.viewCalendar.classList.add('active');
                elements.viewList.classList.remove('active');
            } else {
                elements.viewCalendar.classList.remove('active');
                elements.viewList.classList.add('active');
            }
            
            // In a more complex app, you would switch between different views here
            // For now, we'll just update the UI accordingly
            if (view === 'list') {
                renderEntriesList();
            }
        }

        // Add some sample entries on first load
        function addSampleEntries() {
            if (diaryApp.entries.length === 0) {
                const sampleEntries = [
                    {
                        id: '1',
                        date: new Date().toISOString().split('T')[0],
                        title: 'First Day with My Diary',
                        content: 'Today I started using this personal diary app. I\'m excited to have a private space to record my thoughts and experiences. The interface is clean and easy to use. Looking forward to making this a daily habit!',
                        created: new Date().toISOString()
                    },
                    {
                        id: '2',
                        date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                        title: 'A Productive Day',
                        content: 'Completed all my tasks ahead of schedule today. Felt really productive and accomplished. Met with the team to discuss the new project timeline. Everyone seems motivated about the upcoming challenges.',
                        created: new Date(Date.now() - 86400000).toISOString()
                    },
                    {
                        id: '3',
                        date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // Two days ago
                        title: 'Weekend Reflections',
                        content: 'Spent the weekend hiking in the mountains. The fresh air and nature were exactly what I needed to recharge. I realized how important it is to take breaks from technology and connect with the natural world.',
                        created: new Date(Date.now() - 2 * 86400000).toISOString()
                    }
                ];
                
                diaryApp.entries.push(...sampleEntries);
                saveEntries();
            }
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            init();
            addSampleEntries();
        });