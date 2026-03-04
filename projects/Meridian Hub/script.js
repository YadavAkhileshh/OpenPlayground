// World Meeting Planner - Main Application Script

class WorldMeetingPlanner {
    constructor() {
        // State Management
        this.state = {
            cities: [],
            selectedTime: new Date(),
            timeFormat: '12h',
            theme: 'light',
            goldenHours: [],
            workingHours: { start: 9, end: 17 }
        };
        
        // DOM Elements
        this.elements = {};
        this.timezoneData = [];
        
        // Initialize the application
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Initialize data
        this.loadTimezoneData();
        this.loadSavedState();
        
        // Initialize UI
        this.initUI();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start updates
        this.startUpdates();
        
        // Show initial toast
        this.showToast('Welcome to World Meeting Planner! Add cities to start.', 'success');
    }
    
    cacheElements() {
        // Theme and controls
        this.elements.themeToggle = document.getElementById('themeToggle');
        this.elements.cityInput = document.getElementById('cityInput');
        this.elements.addCityBtn = document.getElementById('addCityBtn');
        this.elements.clearAllBtn = document.getElementById('clearAllBtn');
        this.elements.findSlotBtn = document.getElementById('findSlotBtn');
        this.elements.copyTimesBtn = document.getElementById('copyTimesBtn');
        this.elements.copyInviteBtn = document.getElementById('copyInviteBtn');
        this.elements.refreshTime = document.getElementById('refreshTime');
        
        // Format toggles
        this.elements.formatBtns = document.querySelectorAll('.format-btn');
        this.elements.timeFormatToggle = document.querySelector('.time-format-toggle');
        
        // Containers
        this.elements.citiesList = document.getElementById('citiesList');
        this.elements.cityCount = document.getElementById('cityCount');
        this.elements.timelineHours = document.getElementById('timelineHours');
        this.elements.dayNightIndicator = document.getElementById('dayNightIndicator');
        this.elements.goldenHourOverlay = document.getElementById('goldenHourOverlay');
        this.elements.currentTimeMarker = document.getElementById('currentTimeMarker');
        this.elements.goldenHourList = document.getElementById('goldenHourList');
        this.elements.goldenHourInfo = document.getElementById('goldenHourInfo');
        this.elements.invitePreview = document.getElementById('invitePreview');
        this.elements.convertedTimes = document.getElementById('convertedTimes');
        
        // Slider elements
        this.elements.sliderTrack = document.getElementById('sliderTrack');
        this.elements.sliderHandle = document.getElementById('sliderHandle');
        this.elements.handleTime = document.getElementById('handleTime');
        
        // Modal elements
        this.elements.helpModal = document.getElementById('helpModal');
        this.elements.helpBtn = document.getElementById('helpBtn');
        this.elements.closeHelpModal = document.getElementById('closeHelpModal');
        
        // Time displays
        this.elements.currentTime = document.getElementById('currentTime');
        
        // Converter
        this.elements.convertTime = document.getElementById('convertTime');
        this.elements.convertFrom = document.getElementById('convertFrom');
        
        // Meeting details
        this.elements.meetingTitle = document.getElementById('meetingTitle');
        this.elements.meetingDuration = document.getElementById('meetingDuration');
    }
    
    loadTimezoneData() {
        // Sample timezone data - in production, this would come from an API
        this.timezoneData = [
            { name: "New York", timezone: "America/New_York", country: "US", offset: "-5", flag: "🇺🇸" },
            { name: "London", timezone: "Europe/London", country: "GB", offset: "+0", flag: "🇬🇧" },
            { name: "Tokyo", timezone: "Asia/Tokyo", country: "JP", offset: "+9", flag: "🇯🇵" },
            { name: "Sydney", timezone: "Australia/Sydney", country: "AU", offset: "+10", flag: "🇦🇺" },
            { name: "San Francisco", timezone: "America/Los_Angeles", country: "US", offset: "-8", flag: "🇺🇸" },
            { name: "Berlin", timezone: "Europe/Berlin", country: "DE", offset: "+1", flag: "🇩🇪" },
            { name: "Singapore", timezone: "Asia/Singapore", country: "SG", offset: "+8", flag: "🇸🇬" },
            { name: "Dubai", timezone: "Asia/Dubai", country: "AE", offset: "+4", flag: "🇦🇪" },
            { name: "Mumbai", timezone: "Asia/Kolkata", country: "IN", offset: "+5.5", flag: "🇮🇳" },
            { name: "São Paulo", timezone: "America/Sao_Paulo", country: "BR", offset: "-3", flag: "🇧🇷" }
        ];
        
        // Populate converter dropdown
        this.populateTimezoneDropdown();
    }
    
    populateTimezoneDropdown() {
        this.timezoneData.forEach(city => {
            const option = document.createElement('option');
            option.value = city.timezone;
            option.textContent = `${city.name} (GMT${city.offset})`;
            this.elements.convertFrom.appendChild(option);
        });
    }
    
    loadSavedState() {
        try {
            const saved = localStorage.getItem('worldMeetingPlanner');
            if (saved) {
                const data = JSON.parse(saved);
                this.state.cities = data.cities || [];
                this.state.theme = data.theme || 'light';
                this.state.timeFormat = data.timeFormat || '12h';
                
                // Apply saved theme
                document.body.className = `${this.state.theme}-theme`;
            }
        } catch (e) {
            console.error('Failed to load saved state:', e);
        }
    }
    
    saveState() {
        try {
            localStorage.setItem('worldMeetingPlanner', JSON.stringify({
                cities: this.state.cities,
                theme: this.state.theme,
                timeFormat: this.state.timeFormat
            }));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }
    
    initUI() {
        // Update city list
        this.updateCitiesList();
        
        // Update timeline
        this.updateTimeline();
        
        // Set current time
        this.updateCurrentTime();
        
        // Initialize slider
        this.initSlider();
        
        // Update golden hours
        this.calculateGoldenHours();
        
        // Update invite preview
        this.updateInvitePreview();
    }
    
    setupEventListeners() {
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Add city
        this.elements.addCityBtn.addEventListener('click', () => this.addCity());
        this.elements.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addCity();
        });
        
        // Clear all cities
        this.elements.clearAllBtn.addEventListener('click', () => this.clearAllCities());
        
        // Find next slot
        this.elements.findSlotBtn.addEventListener('click', () => this.findNextSlot());
        
        // Copy times
        this.elements.copyTimesBtn.addEventListener('click', () => this.copyAllTimes());
        
        // Copy invite
        this.elements.copyInviteBtn.addEventListener('click', () => this.copyInviteText());
        
        // Refresh time
        this.elements.refreshTime.addEventListener('click', () => this.updateCurrentTime());
        
        // Time format toggle
        this.elements.formatBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setTimeFormat(e.target.dataset.format));
        });
        
        // Modal controls
        this.elements.helpBtn.addEventListener('click', () => this.showHelpModal());
        this.elements.closeHelpModal.addEventListener('click', () => this.hideHelpModal());
        
        // Close modal when clicking outside
        this.elements.helpModal.addEventListener('click', (e) => {
            if (e.target === this.elements.helpModal) this.hideHelpModal();
        });
        
        // Converter
        this.elements.convertTime.addEventListener('change', () => this.updateConverter());
        this.elements.convertFrom.addEventListener('change', () => this.updateConverter());
        
        // Meeting details
        this.elements.meetingTitle.addEventListener('input', () => this.updateInvitePreview());
        this.elements.meetingDuration.addEventListener('change', () => this.updateInvitePreview());
        
        // Slider
        this.setupSlider();
    }
    
    setupSlider() {
        const handle = this.elements.sliderHandle;
        const track = this.elements.sliderTrack;
        let isDragging = false;
        
        const getSliderPosition = (clientX) => {
            const rect = track.getBoundingClientRect();
            let position = (clientX - rect.left) / rect.width;
            position = Math.max(0, Math.min(1, position));
            return position;
        };
        
        const updateTimeFromSlider = (position) => {
            const hours = Math.floor(position * 24);
            const minutes = Math.floor((position * 24 * 60) % 60);
            const date = new Date();
            date.setHours(hours, minutes, 0, 0);
            this.state.selectedTime = date;
            this.updateHandleTime();
            this.updateCitiesList();
        };
        
        // Mouse events
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isDragging = true;
            handle.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const position = getSliderPosition(e.clientX);
            updateTimeFromSlider(position);
            this.updateSliderPosition(position);
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                handle.style.cursor = 'grab';
            }
        });
        
        // Touch events for mobile
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
        });
        
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const position = getSliderPosition(touch.clientX);
            updateTimeFromSlider(position);
            this.updateSliderPosition(position);
        });
        
        document.addEventListener('touchend', () => {
            isDragging = false;
        });
        
        // Click on track to move slider
        track.addEventListener('click', (e) => {
            const position = getSliderPosition(e.clientX);
            updateTimeFromSlider(position);
            this.updateSliderPosition(position);
        });
        
        // Initialize slider position
        this.updateSliderPosition(0.5); // Start at noon
    }
    
    updateSliderPosition(position) {
        const handle = this.elements.sliderHandle;
        const trackWidth = this.elements.sliderTrack.offsetWidth;
        const handleWidth = handle.offsetWidth;
        const left = (position * trackWidth) - (handleWidth / 2);
        handle.style.left = `${left}px`;
    }
    
    updateHandleTime() {
        const timeStr = this.formatTime(this.state.selectedTime, this.state.timeFormat);
        this.elements.handleTime.textContent = timeStr;
    }
    
    toggleTheme() {
        const themes = ['light', 'dark', 'professional'];
        const currentIndex = themes.indexOf(this.state.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.state.theme = themes[nextIndex];
        
        document.body.className = `${this.state.theme}-theme`;
        this.saveState();
        
        const themeNames = {
            'light': 'Light Theme',
            'dark': 'Dark Theme',
            'professional': 'Professional Theme'
        };
        
        this.showToast(`Switched to ${themeNames[this.state.theme]}`, 'success');
    }
    
    addCity() {
        const input = this.elements.cityInput.value.trim();
        if (!input) return;
        
        // Find matching city in our data
        const searchTerm = input.toLowerCase();
        const matchedCity = this.timezoneData.find(city => 
            city.name.toLowerCase().includes(searchTerm) ||
            city.country.toLowerCase().includes(searchTerm)
        );
        
        if (matchedCity && !this.state.cities.find(c => c.name === matchedCity.name)) {
            const newCity = {
                ...matchedCity,
                id: Date.now().toString(),
                workingHours: { ...this.state.workingHours }
            };
            
            this.state.cities.push(newCity);
            this.updateCitiesList();
            this.calculateGoldenHours();
            this.updateInvitePreview();
            this.saveState();
            
            this.elements.cityInput.value = '';
            this.showToast(`Added ${matchedCity.name}`, 'success');
        } else if (this.state.cities.find(c => c.name === matchedCity?.name)) {
            this.showToast(`${matchedCity.name} is already added`, 'error');
        } else {
            this.showToast('City not found. Try: New York, London, Tokyo, etc.', 'error');
        }
    }
    
    removeCity(cityId) {
        const city = this.state.cities.find(c => c.id === cityId);
        this.state.cities = this.state.cities.filter(c => c.id !== cityId);
        
        this.updateCitiesList();
        this.calculateGoldenHours();
        this.updateInvitePreview();
        this.saveState();
        
        this.showToast(`Removed ${city.name}`, 'success');
    }
    
    clearAllCities() {
        if (this.state.cities.length === 0) return;
        
        if (confirm('Remove all cities?')) {
            this.state.cities = [];
            this.updateCitiesList();
            this.calculateGoldenHours();
            this.updateInvitePreview();
            this.saveState();
            
            this.showToast('All cities removed', 'success');
        }
    }
    
    updateCitiesList() {
        const container = this.elements.citiesList;
        const countElement = this.elements.cityCount;
        
        if (this.state.cities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-globe-americas"></i>
                    <p>Add cities to start planning meetings</p>
                    <p class="hint">Try: New York, London, Tokyo, Sydney</p>
                </div>
            `;
            countElement.textContent = '0 cities';
            return;
        }
        
        countElement.textContent = `${this.state.cities.length} ${this.state.cities.length === 1 ? 'city' : 'cities'}`;
        
        const citiesHTML = this.state.cities.map(city => {
            const localTime = this.getLocalTime(city.timezone, this.state.selectedTime);
            const timeStr = this.formatTime(localTime, this.state.timeFormat);
            
            return `
                <div class="city-card" data-city-id="${city.id}">
                    <button class="remove-city" title="Remove city">
                        <i class="fas fa-times"></i>
                    </button>
                    <div class="city-card-header">
                        <div>
                            <span class="city-flag">${city.flag}</span>
                            <span class="city-name">${city.name}</span>
                        </div>
                        <div class="city-timezone">${city.timezone.split('/')[1]}</div>
                    </div>
                    <div class="city-time">${timeStr}</div>
                    <div class="city-info">
                        <span>GMT${city.offset}</span>
                        <span>${city.country}</span>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = citiesHTML;
        
        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-city').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const cityCard = btn.closest('.city-card');
                const cityId = cityCard.dataset.cityId;
                this.removeCity(cityId);
            });
        });
    }
    
    updateTimeline() {
        // Create hour labels
        let hoursHTML = '';
        for (let i = 0; i < 24; i++) {
            const hour = i % 12 || 12;
            const period = i < 12 ? 'AM' : 'PM';
            const label = this.state.timeFormat === '24h' ? `${i}:00` : `${hour}:00 ${period}`;
            hoursHTML += `<div class="hour-label">${label}</div>`;
        }
        this.elements.timelineHours.innerHTML = hoursHTML;
        
        // Update current time marker
        this.updateCurrentTimeMarker();
    }
    
    updateCurrentTimeMarker() {
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const position = (currentHour * 60 + currentMinute) / (24 * 60);
        
        const marker = this.elements.currentTimeMarker;
        marker.style.left = `${position * 100}%`;
    }
    
    updateCurrentTime() {
        const now = new Date();
        const timeStr = this.formatTime(now, this.state.timeFormat);
        const dateStr = now.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        this.elements.currentTime.textContent = `${dateStr} • ${timeStr}`;
        this.updateCurrentTimeMarker();
    }
    
    calculateGoldenHours() {
        if (this.state.cities.length < 2) {
            this.state.goldenHours = [];
            this.updateGoldenHoursDisplay();
            return;
        }
        
        // Simple golden hour calculation: find overlap of working hours
        // In a real app, this would be more sophisticated
        const goldenHours = [];
        
        // For demo: create some golden hours
        if (this.state.cities.length >= 2) {
            goldenHours.push({
                start: '09:00',
                end: '11:00',
                participants: this.state.cities.length,
                timezone: 'GMT'
            });
            
            if (this.state.cities.length >= 3) {
                goldenHours.push({
                    start: '14:00',
                    end: '16:00',
                    participants: this.state.cities.length - 1,
                    timezone: 'GMT'
                });
            }
        }
        
        this.state.goldenHours = goldenHours;
        this.updateGoldenHoursDisplay();
        this.updateGoldenHourOverlay();
    }
    
    updateGoldenHoursDisplay() {
        const container = this.elements.goldenHourList;
        
        if (this.state.goldenHours.length === 0) {
            container.innerHTML = '<div class="no-golden-hour">Add at least 2 cities to see optimal meeting times</div>';
            return;
        }
        
        const goldenHoursHTML = this.state.goldenHours.map(hour => `
            <div class="golden-hour-badge">
                <i class="fas fa-crown"></i>
                ${hour.start} - ${hour.end} (${hour.participants}/${this.state.cities.length} available)
            </div>
        `).join('');
        
        container.innerHTML = goldenHoursHTML;
    }
    
    updateGoldenHourOverlay() {
        const overlay = this.elements.goldenHourOverlay;
        overlay.innerHTML = '';
        
        this.state.goldenHours.forEach(hour => {
            const startHour = parseInt(hour.start.split(':')[0]);
            const endHour = parseInt(hour.end.split(':')[0]);
            
            const startPercent = (startHour / 24) * 100;
            const endPercent = (endHour / 24) * 100;
            const widthPercent = endPercent - startPercent;
            
            const highlight = document.createElement('div');
            highlight.className = 'golden-hour-highlight';
            highlight.style.left = `${startPercent}%`;
            highlight.style.width = `${widthPercent}%`;
            
            overlay.appendChild(highlight);
        });
    }
    
    findNextSlot() {
        if (this.state.cities.length < 2) {
            this.showToast('Add at least 2 cities to find meeting slots', 'error');
            return;
        }
        
        // Simple algorithm: find next hour where all cities are in working hours
        const now = new Date();
        const currentHour = now.getHours();
        
        // For demo purposes, find next golden hour
        if (this.state.goldenHours.length > 0) {
            const nextGoldenHour = this.state.goldenHours[0];
            const [startHour] = nextGoldenHour.start.split(':').map(Number);
            
            // Move slider to this time
            const position = startHour / 24;
            this.updateSliderPosition(position);
            
            // Update selected time
            const newTime = new Date();
            newTime.setHours(startHour, 0, 0, 0);
            this.state.selectedTime = newTime;
            this.updateHandleTime();
            this.updateCitiesList();
            
            this.showToast(`Found slot at ${nextGoldenHour.start}`, 'success');
        } else {
            this.showToast('No suitable slots found. Try adjusting working hours.', 'error');
        }
    }
    
    copyAllTimes() {
        if (this.state.cities.length === 0) {
            this.showToast('No cities to copy', 'error');
            return;
        }
        
        const lines = this.state.cities.map(city => {
            const localTime = this.getLocalTime(city.timezone, this.state.selectedTime);
            const timeStr = this.formatTime(localTime, this.state.timeFormat);
            return `${city.flag} ${city.name}: ${timeStr} (GMT${city.offset})`;
        });
        
        const text = `Current times:\n${lines.join('\n')}`;
        this.copyToClipboard(text);
        this.showToast('All times copied to clipboard', 'success');
    }
    
    updateInvitePreview() {
        if (this.state.cities.length === 0) {
            this.elements.invitePreview.textContent = 'Add cities to generate invite';
            return;
        }
        
        const title = this.elements.meetingTitle.value || 'Team Meeting';
        const duration = parseInt(this.elements.meetingDuration.value);
        const durationText = duration === 60 ? '1 hour' : `${duration} minutes`;
        
        const selectedTime = this.state.selectedTime;
        const formattedDate = selectedTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const formattedTime = this.formatTime(selectedTime, this.state.timeFormat);
        
        // Find a reference timezone (use first city)
        const refCity = this.state.cities[0];
        const refTime = this.getLocalTime(refCity.timezone, selectedTime);
        const refTimeStr = this.formatTime(refTime, this.state.timeFormat);
        
        const timezoneLines = this.state.cities.map(city => {
            const localTime = this.getLocalTime(city.timezone, selectedTime);
            const timeStr = this.formatTime(localTime, this.state.timeFormat);
            const offset = city.offset.startsWith('+') ? city.offset : `-${city.offset.substring(1)}`;
            return `• ${city.name}: ${timeStr} (GMT${offset})`;
        }).join('\n');
        
        const inviteText = `Meeting: ${title}
Date: ${formattedDate}
Time: ${formattedTime} (${durationText})
Time Zone: ${refCity.timezone}

Local Times:
${timezoneLines}

Generated by World Meeting Planner`;

        this.elements.invitePreview.textContent = inviteText;
    }
    
    copyInviteText() {
        if (this.state.cities.length === 0) {
            this.showToast('Add cities to generate invite', 'error');
            return;
        }
        
        const text = this.elements.invitePreview.textContent;
        this.copyToClipboard(text);
        this.showToast('Invite text copied to clipboard', 'success');
    }
    
    updateConverter() {
        const time = this.elements.convertTime.value;
        const timezone = this.elements.convertFrom.value;
        
        if (!time || timezone === 'auto') {
            this.elements.convertedTimes.textContent = 'Select a time and timezone';
            return;
        }
        
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        
        const conversions = this.state.cities.map(city => {
            const localTime = this.getLocalTime(city.timezone, date);
            const timeStr = this.formatTime(localTime, this.state.timeFormat);
            return `${city.flag} ${city.name}: ${timeStr}`;
        }).join('\n');
        
        this.elements.convertedTimes.textContent = conversions || 'No cities added';
    }
    
    setTimeFormat(format) {
        this.state.timeFormat = format;
        
        // Update active button
        this.elements.formatBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.format === format);
        });
        
        // Update displays
        this.updateCitiesList();
        this.updateTimeline();
        this.updateHandleTime();
        this.updateCurrentTime();
        this.saveState();
    }
    
    showHelpModal() {
        this.elements.helpModal.classList.add('active');
    }
    
    hideHelpModal() {
        this.elements.helpModal.classList.remove('active');
    }
    
    getLocalTime(timezone, date) {
        // In a real app, use Luxon or similar for proper timezone conversion
        // This is a simplified version for demo purposes
        const offsetMatch = timezone.match(/GMT([+-]\d+)/);
        if (offsetMatch) {
            const offset = parseInt(offsetMatch[1]);
            const localDate = new Date(date);
            localDate.setHours(date.getHours() + offset);
            return localDate;
        }
        
        // Default: assume timezone string contains offset info
        // This is simplified - real implementation would use proper timezone library
        return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    }
    
    formatTime(date, format = '12h') {
        let hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        if (format === '12h') {
            const period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            return `${hours}:${minutes} ${period}`;
        } else {
            return `${hours.toString().padStart(2, '0')}:${minutes}`;
        }
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(err => {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
    
    startUpdates() {
        // Update current time every minute
        setInterval(() => {
            this.updateCurrentTime();
        }, 60000);
        
        // Update converter every 30 seconds if it has content
        setInterval(() => {
            if (this.elements.convertedTimes.textContent !== 'Select a time and timezone') {
                this.updateConverter();
            }
        }, 30000);
    }
    
    initSlider() {
        // Set initial slider time to current time
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const position = (hour * 60 + minute) / (24 * 60);
        
        this.updateSliderPosition(position);
        this.updateHandleTime();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new WorldMeetingPlanner();
    
    // Make app available globally for debugging
    window.worldMeetingPlanner = app;
});