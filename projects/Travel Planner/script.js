document.addEventListener('DOMContentLoaded', function() {
    // Initialize the travel planner
    initializeTravelPlanner();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial data
    loadInitialData();
    
    // Initialize map
    initializeMap();
});

// Global variables
let currentTrip = null;
let map = null;
let itineraryDays = [];
let packingItems = [];
let expenses = [];

function initializeTravelPlanner() {
    // Set default trip
    currentTrip = {
        id: 1,
        name: 'Paris Adventure 2024',
        startDate: '2024-04-15',
        endDate: '2024-04-22',
        totalBudget: 2850,
        spentBudget: 1610,
        destinations: ['Paris', 'Versailles', 'Disneyland Paris'],
        travelers: 2
    };
    
    updateTripOverview();
}

function initializeMap() {
    // Initialize Leaflet map centered on Paris
    map = L.map('map').setView([48.8566, 2.3522], 12);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Add sample markers
    addMapMarkers();
}

function addMapMarkers() {
    // Destination markers
    const destinations = [
        { name: 'Eiffel Tower', coords: [48.8584, 2.2945], type: 'activity' },
        { name: 'Louvre Museum', coords: [48.8606, 2.3376], type: 'activity' },
        { name: 'Hotel Plaza Athénée', coords: [48.8670, 2.3047], type: 'hotel' },
        { name: 'Notre-Dame', coords: [48.8530, 2.3499], type: 'activity' },
        { name: 'Champs-Élysées', coords: [48.8700, 2.3075], type: 'activity' }
    ];
    
    destinations.forEach(dest => {
        let iconColor;
        if (dest.type === 'hotel') iconColor = '#F5A623';
        else if (dest.type === 'activity') iconColor = '#50E3C2';
        else iconColor = '#4A90E2';
        
        const icon = L.divIcon({
            html: `<div style="background: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
            className: 'custom-marker',
            iconSize: [26, 26]
        });
        
        L.marker(dest.coords, { icon: icon })
            .addTo(map)
            .bindPopup(`<b>${dest.name}</b><br>${dest.type}`);
    });
}

function setupEventListeners() {
    // New trip button
    document.getElementById('new-trip-btn').addEventListener('click', showNewTripModal);
    
    // Print button
    document.getElementById('print-btn').addEventListener('click', printItinerary);
    
    // Add day button
    document.getElementById('add-day-btn').addEventListener('click', addNewDay);
    
    // Add expense button
    document.getElementById('add-expense-btn').addEventListener('click', addNewExpense);
    
    // Add note button
    document.getElementById('add-note-btn').addEventListener('click', addNewNote);
    
    // Add packing item
    document.getElementById('add-item-btn').addEventListener('click', addPackingItem);
    document.getElementById('new-item-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addPackingItem();
    });
    
    // Map controls
    document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut());
    
    // City selector for weather
    document.getElementById('city-selector').addEventListener('change', updateWeather);
    
    // Footer buttons
    document.getElementById('export-btn').addEventListener('click', exportTrip);
    document.getElementById('share-btn').addEventListener('click', shareTrip);
    document.getElementById('help-btn').addEventListener('click', showHelp);
    
    // Modal controls
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });
    
    document.getElementById('create-trip-btn').addEventListener('click', createNewTrip);
    
    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal();
        }
    });
}

function updateTripOverview() {
    if (!currentTrip) return;
    
    // Update trip title
    document.getElementById('trip-title').textContent = currentTrip.name;
    
    // Update dates
    const startDate = new Date(currentTrip.startDate);
    const endDate = new Date(currentTrip.endDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    
    // Update budget
    document.getElementById('total-budget').textContent = `$${currentTrip.totalBudget.toLocaleString()}`;
    
    const remaining = currentTrip.totalBudget - currentTrip.spentBudget;
    document.getElementById('remaining-budget').textContent = `$${remaining.toLocaleString()}`;
    
    // Update progress
    const progress = (currentTrip.spentBudget / currentTrip.totalBudget) * 100;
    document.getElementById('budget-progress-fill').style.width = `${progress}%`;
    document.querySelector('.progress-percentage').textContent = `${Math.round(progress)}%`;
    
    // Update progress labels
    document.querySelector('.progress-labels').innerHTML = `
        <span>Spent: $${currentTrip.spentBudget.toLocaleString()}</span>
        <span>Remaining: $${remaining.toLocaleString()}</span>
    `;
}

function loadInitialData() {
    // Load itinerary
    loadItineraryData();
    
    // Load packing list
    loadPackingList();
    
    // Load expenses
    loadExpenses();
    
    // Load weather
    updateWeather();
    
    // Load notes
    loadNotes();
}

function loadItineraryData() {
    // Sample itinerary data
    itineraryDays = [
        {
            day: 1,
            date: '2024-04-15',
            title: 'Arrival in Paris',
            activities: [
                { time: '14:00', title: 'Arrive at CDG Airport', location: 'Charles de Gaulle', cost: 0 },
                { time: '15:30', title: 'Hotel Check-in', location: 'Hotel Plaza Athénée', cost: 0 },
                { time: '19:00', title: 'Welcome Dinner', location: 'Le Jules Verne', cost: 180 }
            ]
        },
        {
            day: 2,
            date: '2024-04-16',
            title: 'Exploring the City',
            activities: [
                { time: '09:00', title: 'Eiffel Tower Visit', location: 'Champ de Mars', cost: 45 },
                { time: '12:00', title: 'Lunch Cruise', location: 'Seine River', cost: 75 },
                { time: '15:00', title: 'Louvre Museum', location: 'Rue de Rivoli', cost: 35 },
                { time: '20:00', title: 'Evening Show', location: 'Moulin Rouge', cost: 120 }
            ]
        },
        {
            day: 3,
            date: '2024-04-17',
            title: 'Day Trip to Versailles',
            activities: [
                { time: '09:30', title: 'Train to Versailles', location: 'Gare Montparnasse', cost: 25 },
                { time: '11:00', title: 'Palace Tour', location: 'Versailles Palace', cost: 40 },
                { time: '14:00', title: 'Garden Exploration', location: 'Gardens of Versailles', cost: 15 },
                { time: '18:00', title: 'Return to Paris', location: 'Paris', cost: 25 }
            ]
        }
    ];
    
    renderItinerary();
}

function renderItinerary() {
    const container = document.getElementById('itinerary-container');
    container.innerHTML = '';
    
    itineraryDays.forEach(day => {
        const date = new Date(day.date);
        const dateString = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const activitiesHTML = day.activities.map(activity => `
            <div class="activity-item">
                <span class="activity-time">${activity.time}</span>
                <div class="activity-details">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-location">
                        <i class="fas fa-map-marker-alt"></i> ${activity.location}
                    </div>
                </div>
                <span class="activity-cost">$${activity.cost}</span>
            </div>
        `).join('');
        
        const dayHTML = `
            <div class="itinerary-day">
                <div class="day-header">
                    <div>
                        <span class="day-title">Day ${day.day}: ${day.title}</span>
                    </div>
                    <span class="day-date">${dateString}</span>
                </div>
                <div class="activities-list">
                    ${activitiesHTML}
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', dayHTML);
    });
    
    // Update activities count
    const totalActivities = itineraryDays.reduce((sum, day) => sum + day.activities.length, 0);
    document.getElementById('activities-count').textContent = totalActivities;
    document.getElementById('destinations-count').textContent = currentTrip.destinations.length;
}

function loadPackingList() {
    packingItems = [
        { id: 1, name: 'Passport', category: 'documents', packed: true },
        { id: 2, name: 'Wallet', category: 'documents', packed: true },
        { id: 3, name: 'Phone charger', category: 'electronics', packed: true },
        { id: 4, name: 'Power adapter', category: 'electronics', packed: false },
        { id: 5, name: 'Camera', category: 'electronics', packed: true },
        { id: 6, name: 'T-shirts (5)', category: 'clothing', packed: true },
        { id: 7, name: 'Jeans (2)', category: 'clothing', packed: true },
        { id: 8, name: 'Jacket', category: 'clothing', packed: false },
        { id: 9, name: 'Swimwear', category: 'clothing', packed: true },
        { id: 10, name: 'Toothbrush', category: 'toiletries', packed: true },
        { id: 11, name: 'Shampoo', category: 'toiletries', packed: false },
        { id: 12, name: 'Sunscreen', category: 'toiletries', packed: false }
    ];
    
    renderPackingList();
}

function renderPackingList() {
    // Clear current lists
    document.getElementById('clothing-items').innerHTML = '';
    document.getElementById('toiletry-items').innerHTML = '';
    document.getElementById('electronics-items').innerHTML = '';
    
    // Count packed items
    let packedCount = 0;
    let totalCount = 0;
    
    packingItems.forEach(item => {
        totalCount++;
        if (item.packed) packedCount++;
        
        const itemElement = document.createElement('div');
        itemElement.className = `packing-item ${item.packed ? 'packed' : ''}`;
        itemElement.innerHTML = `
            <i class="far fa-${item.packed ? 'check-square' : 'square'}"></i>
            ${item.name}
        `;
        
        itemElement.addEventListener('click', () => {
            item.packed = !item.packed;
            renderPackingList();
        });
        
        // Add to appropriate category container
        const containerId = `${item.category}-items`;
        const container = document.getElementById(containerId);
        if (container) {
            container.appendChild(itemElement);
        }
    });
    
    // Update packed count
    document.querySelector('.packed-count').textContent = `${packedCount}/${totalCount} packed`;
}

function addPackingItem() {
    const input = document.getElementById('new-item-input');
    const itemName = input.value.trim();
    
    if (!itemName) return;
    
    // Determine category based on keywords
    let category = 'clothing';
    const lowerName = itemName.toLowerCase();
    
    if (lowerName.includes('charger') || lowerName.includes('camera') || lowerName.includes('phone') || lowerName.includes('laptop')) {
        category = 'electronics';
    } else if (lowerName.includes('tooth') || lowerName.includes('brush') || lowerName.includes('shampoo') || lowerName.includes('soap')) {
        category = 'toiletries';
    } else if (lowerName.includes('passport') || lowerName.includes('ticket') || lowerName.includes('visa')) {
        category = 'documents';
    }
    
    packingItems.push({
        id: packingItems.length + 1,
        name: itemName,
        category: category,
        packed: false
    });
    
    input.value = '';
    renderPackingList();
}

function loadExpenses() {
    expenses = [
        { id: 1, title: 'Flight Tickets', category: 'Transportation', amount: 850, date: '2024-03-15' },
        { id: 2, title: 'Hotel Deposit', category: 'Accommodation', amount: 400, date: '2024-03-20' },
        { id: 3, title: 'Eiffel Tower Tickets', category: 'Activities', amount: 90, date: '2024-04-01' },
        { id: 4, title: 'Travel Insurance', category: 'Insurance', amount: 120, date: '2024-03-25' },
        { id: 5, title: 'Restaurant Dinner', category: 'Food & Dining', amount: 150, date: '2024-04-10' }
    ];
    
    renderExpenses();
}

function renderExpenses() {
    const container = document.getElementById('expenses-list');
    container.innerHTML = '';
    
    // Sort by date (newest first)
    expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show only recent 5 expenses
    expenses.slice(0, 5).forEach(expense => {
        const date = new Date(expense.date);
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        const expenseHTML = `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-title">${expense.title}</div>
                    <div class="expense-category">${expense.category} • ${dateString}</div>
                </div>
                <div class="expense-amount">$${expense.amount}</div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', expenseHTML);
    });
}

function addNewExpense() {
    // In a real app, this would show a modal for adding expenses
    const newExpense = {
        id: expenses.length + 1,
        title: 'New Expense',
        category: 'Miscellaneous',
        amount: Math.floor(Math.random() * 200) + 50,
        date: new Date().toISOString().split('T')[0]
    };
    
    expenses.unshift(newExpense);
    
    // Update budget
    currentTrip.spentBudget += newExpense.amount;
    updateTripOverview();
    renderExpenses();
    
    // Show notification
    showNotification(`Added expense: $${newExpense.amount} for ${newExpense.title}`);
}

function updateWeather() {
    const city = document.getElementById('city-selector').value;
    const weatherData = getWeatherData(city);
    
    const container = document.getElementById('weather-forecast');
    container.innerHTML = '';
    
    weatherData.forEach(day => {
        const dayHTML = `
            <div class="weather-day">
                <div class="weather-date">${day.day}</div>
                <div class="weather-icon">
                    <i class="${day.icon}"></i>
                </div>
                <div class="weather-temp">${day.temp}°</div>
                <div class="weather-condition">${day.condition}</div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', dayHTML);
    });
}

function getWeatherData(city) {
    // Sample weather data for different cities
    const weatherData = {
        paris: [
            { day: 'Mon', icon: 'fas fa-sun', temp: 18, condition: 'Sunny' },
            { day: 'Tue', icon: 'fas fa-cloud-sun', temp: 16, condition: 'Partly Cloudy' },
            { day: 'Wed', icon: 'fas fa-cloud-rain', temp: 14, condition: 'Light Rain' },
            { day: 'Thu', icon: 'fas fa-cloud', temp: 15, condition: 'Cloudy' },
            { day: 'Fri', icon: 'fas fa-sun', temp: 17, condition: 'Sunny' }
        ],
        london: [
            { day: 'Mon', icon: 'fas fa-cloud-rain', temp: 12, condition: 'Rain' },
            { day: 'Tue', icon: 'fas fa-cloud', temp: 13, condition: 'Cloudy' },
            { day: 'Wed', icon: 'fas fa-cloud-sun', temp: 14, condition: 'Partly Cloudy' },
            { day: 'Thu', icon: 'fas fa-cloud-rain', temp: 11, condition: 'Rain' },
            { day: 'Fri', icon: 'fas fa-cloud', temp: 12, condition: 'Cloudy' }
        ],
        rome: [
            { day: 'Mon', icon: 'fas fa-sun', temp: 22, condition: 'Sunny' },
            { day: 'Tue', icon: 'fas fa-sun', temp: 24, condition: 'Sunny' },
            { day: 'Wed', icon: 'fas fa-cloud-sun', temp: 21, condition: 'Partly Cloudy' },
            { day: 'Thu', icon: 'fas fa-sun', temp: 23, condition: 'Sunny' },
            { day: 'Fri', icon: 'fas fa-sun', temp: 25, condition: 'Sunny' }
        ],
        tokyo: [
            { day: 'Mon', icon: 'fas fa-cloud-sun', temp: 16, condition: 'Partly Cloudy' },
            { day: 'Tue', icon: 'fas fa-cloud-rain', temp: 15, condition: 'Rain' },
            { day: 'Wed', icon: 'fas fa-sun', temp: 18, condition: 'Sunny' },
            { day: 'Thu', icon: 'fas fa-sun', temp: 19, condition: 'Sunny' },
            { day: 'Fri', icon: 'fas fa-cloud', temp: 17, condition: 'Cloudy' }
        ]
    };
    
    return weatherData[city] || weatherData.paris;
}

function loadNotes() {
    const notes = [
        { id: 1, content: 'Remember to buy Euro currency before departure', date: '2024-04-10', category: 'reminder' },
        { id: 2, content: 'Check-in online 24 hours before flight', date: '2024-04-14', category: 'flight' },
        { id: 3, content: 'Make dinner reservation at Le Cinq for anniversary', date: '2024-04-12', category: 'dining' }
    ];
    
    renderNotes(notes);
}

function renderNotes(notes) {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';
    
    notes.forEach(note => {
        const date = new Date(note.date);
        const dateString = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        const noteHTML = `
            <div class="note-item">
                <div class="note-content">${note.content}</div>
                <div class="note-meta">
                    <span>${note.category}</span>
                    <span>${dateString}</span>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', noteHTML);
    });
}

function addNewNote() {
    const content = prompt('Enter your travel note:');
    if (!content) return;
    
    const newNote = {
        id: Math.random(),
        content: content,
        date: new Date().toISOString().split('T')[0],
        category: 'note'
    };
    
    // In a real app, you would add to notes array and re-render
    showNotification('Note added successfully!');
}

// Modal Functions
function showNewTripModal() {
    document.getElementById('new-trip-modal').classList.add('active');
    
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    document.getElementById('start-date').valueAsDate = today;
    document.getElementById('end-date').valueAsDate = nextWeek;
}

function closeModal() {
    document.getElementById('new-trip-modal').classList.remove('active');
}

function createNewTrip() {
    const name = document.getElementById('trip-name').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const destination = document.getElementById('destination').value;
    const budget = parseInt(document.getElementById('total-budget-input').value);
    const travelers = document.getElementById('travelers').value;
    
    if (!name || !startDate || !endDate || !destination || !budget) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Create new trip object
    currentTrip = {
        id: Date.now(),
        name: name,
        startDate: startDate,
        endDate: endDate,
        totalBudget: budget,
        spentBudget: 0,
        destinations: [destination],
        travelers: parseInt(travelers)
    };
    
    // Reset data
    itineraryDays = [];
    packingItems = [];
    expenses = [];
    
    // Update UI
    updateTripOverview();
    loadInitialData();
    
    // Update map to new destination (simplified)
    if (destination.toLowerCase().includes('paris')) {
        map.setView([48.8566, 2.3522], 12);
    } else if (destination.toLowerCase().includes('london')) {
        map.setView([51.5074, -0.1278], 12);
    } else if (destination.toLowerCase().includes('rome')) {
        map.setView([41.9028, 12.4964], 12);
    }
    
    closeModal();
    showNotification(`New trip "${name}" created successfully!`);
}

// Utility Functions
function addNewDay() {
    const newDay = {
        day: itineraryDays.length + 1,
        date: new Date(currentTrip.startDate),
        title: `Day ${itineraryDays.length + 1}`,
        activities: []
    };
    
    // Calculate date
    newDay.date.setDate(newDay.date.getDate() + newDay.day - 1);
    newDay.date = newDay.date.toISOString().split('T')[0];
    
    itineraryDays.push(newDay);
    renderItinerary();
    showNotification('New day added to itinerary');
}

function printItinerary() {
    alert('Print functionality would open print dialog with formatted itinerary');
    // window.print(); // Uncomment for actual print functionality
}

function exportTrip() {
    const tripData = {
        trip: currentTrip,
        itinerary: itineraryDays,
        packingList: packingItems,
        expenses: expenses
    };
    
    const dataStr = JSON.stringify(tripData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${currentTrip.name.replace(/\s+/g, '_')}_trip.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Trip exported successfully!');
}

function shareTrip() {
    if (navigator.share) {
        navigator.share({
            title: currentTrip.name,
            text: `Check out my trip to ${currentTrip.destinations[0]}!`,
            url: window.location.href,
        })
        .then(() => showNotification('Trip shared successfully!'))
        .catch(error => console.log('Error sharing:', error));
    } else {
        alert('Share this URL: ' + window.location.href);
    }
}

function showHelp() {
    alert('Travel Planner Help:\n\n1. Create a new trip with destinations and budget\n2. Add activities to your daily itinerary\n3. Track expenses and budget progress\n4. Manage packing list\n5. View weather forecasts\n6. Export or print your trip plan');
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success-color);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);