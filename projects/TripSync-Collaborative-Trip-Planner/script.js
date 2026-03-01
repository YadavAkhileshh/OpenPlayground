// TripSync - Collaborative Trip Planner Script

// Global variables
let currentTrip = null;
let trips = [];
let collaborators = [];

// DOM elements
const newTripBtn = document.getElementById('new-trip-btn');
const refreshTripsBtn = document.getElementById('refresh-trips');
const tripsList = document.getElementById('trips-list');
const tripHeader = document.getElementById('trip-header');
const collaboratorsSection = document.getElementById('collaborators-section');
const tripNavigation = document.getElementById('trip-navigation');
const tabContent = document.getElementById('tab-content');

// Modal elements
const newTripModal = document.getElementById('new-trip-modal');
const activityModal = document.getElementById('activity-modal');
const noteModal = document.getElementById('note-modal');
const inviteModal = document.getElementById('invite-modal');

// Forms
const newTripForm = document.getElementById('new-trip-form');
const activityForm = document.getElementById('activity-form');
const noteForm = document.getElementById('note-form');
const inviteForm = document.getElementById('invite-form');

// Tab buttons
const tabButtons = document.querySelectorAll('.tab-btn');

// Action buttons
const addActivityBtn = document.getElementById('add-activity-btn');
const addNoteBtn = document.getElementById('add-note-btn');
const addExpenseBtn = document.getElementById('add-expense-btn');
const addItemBtn = document.getElementById('add-item-btn');
const inviteBtn = document.getElementById('invite-btn');

// Notifications
const notificationsContainer = document.getElementById('notifications');

// Event listeners
document.addEventListener('DOMContentLoaded', init);
newTripBtn.addEventListener('click', () => openModal(newTripModal));
refreshTripsBtn.addEventListener('click', loadTrips);
newTripForm.addEventListener('submit', createTrip);
activityForm.addEventListener('submit', addActivity);
noteForm.addEventListener('submit', addNote);
inviteForm.addEventListener('submit', sendInvite);

addActivityBtn.addEventListener('click', () => openModal(activityModal));
addNoteBtn.addEventListener('click', () => openModal(noteModal));
addExpenseBtn.addEventListener('click', () => openModal(document.getElementById('expense-modal')));
addItemBtn.addEventListener('click', () => openModal(document.getElementById('item-modal')));
inviteBtn.addEventListener('click', () => openModal(inviteModal));

// Tab switching
tabButtons.forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.tab));
});

// Modal close handlers
document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
  btn.addEventListener('click', () => closeAllModals());
});

// Close modal on outside click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeAllModals();
    }
  });
});

// Initialize the app
function init() {
  loadFromLocalStorage();
  loadTrips();
  setupDefaultCollaborators();
  setDefaultDates();
}

// Load data from localStorage
function loadFromLocalStorage() {
  const savedTrips = localStorage.getItem('tripsync-trips');
  const savedCurrentTrip = localStorage.getItem('tripsync-current-trip');

  if (savedTrips) {
    trips = JSON.parse(savedTrips);
  }

  if (savedCurrentTrip) {
    currentTrip = JSON.parse(savedCurrentTrip);
  }
}

// Save data to localStorage
function saveToLocalStorage() {
  localStorage.setItem('tripsync-trips', JSON.stringify(trips));
  if (currentTrip) {
    localStorage.setItem('tripsync-current-trip', JSON.stringify(currentTrip));
  }
}

// Setup default collaborators
function setupDefaultCollaborators() {
  collaborators = [
    { id: 1, name: 'You', email: 'you@example.com', role: 'Organizer', avatar: 'Y' },
    { id: 2, name: 'Alice Johnson', email: 'alice@example.com', role: 'Contributor', avatar: 'A' },
    { id: 3, name: 'Bob Smith', email: 'bob@example.com', role: 'Viewer', avatar: 'B' }
  ];
}

// Set default dates
function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  document.getElementById('start-date').value = today;
  document.getElementById('end-date').value = tomorrow;
  document.getElementById('activity-date').value = today;
}

// Load and display trips
function loadTrips() {
  tripsList.innerHTML = '';

  if (trips.length === 0) {
    tripsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No trips yet. Create your first trip!</p>';
    return;
  }

  trips.forEach(trip => {
    const tripElement = createTripElement(trip);
    tripsList.appendChild(tripElement);
  });

  // Auto-select current trip if exists
  if (currentTrip) {
    selectTrip(currentTrip.id);
  }
}

// Create trip element
function createTripElement(trip) {
  const div = document.createElement('div');
  div.className = `trip-item ${currentTrip && currentTrip.id === trip.id ? 'active' : ''}`;
  div.onclick = () => selectTrip(trip.id);

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

  div.innerHTML = `
    <div class="trip-item-header">
      <div class="trip-item-title">${trip.name}</div>
      <div class="trip-item-status">Active</div>
    </div>
    <div class="trip-item-meta">
      <div class="trip-item-location">
        <i class="fas fa-map-marker-alt"></i>
        ${trip.destination}
      </div>
      <div class="trip-item-dates">
        <i class="fas fa-calendar-alt"></i>
        ${formatDateRange(trip.startDate, trip.endDate)} (${duration} days)
      </div>
    </div>
  `;

  return div;
}

// Select a trip
function selectTrip(tripId) {
  currentTrip = trips.find(t => t.id === tripId);
  if (!currentTrip) return;

  // Update UI
  document.querySelectorAll('.trip-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget?.classList.add('active');

  // Show trip content
  tripHeader.classList.remove('hidden');
  collaboratorsSection.classList.remove('hidden');
  tripNavigation.classList.remove('hidden');

  // Update trip info
  document.getElementById('trip-title').textContent = currentTrip.name;
  document.getElementById('trip-dates').textContent = formatDateRange(currentTrip.startDate, currentTrip.endDate);
  document.getElementById('trip-location').textContent = currentTrip.destination;

  // Load collaborators
  loadCollaborators();

  // Load itinerary by default
  switchTab('itinerary');

  saveToLocalStorage();
}

// Create new trip
function createTrip(e) {
  e.preventDefault();

  const formData = new FormData(newTripForm);
  const trip = {
    id: Date.now(),
    name: formData.get('trip-name'),
    destination: formData.get('trip-destination'),
    startDate: formData.get('start-date'),
    endDate: formData.get('end-date'),
    description: formData.get('trip-description'),
    createdAt: new Date().toISOString(),
    itinerary: [],
    notes: [],
    expenses: [],
    packingList: initializePackingList(),
    collaborators: [1] // Current user
  };

  trips.push(trip);
  saveToLocalStorage();
  loadTrips();
  closeAllModals();
  selectTrip(trip.id);

  showNotification('Trip created successfully!', 'success');
  newTripForm.reset();
  setDefaultDates();
}

// Initialize default packing list
function initializePackingList() {
  return {
    essentials: [
      { id: 1, item: 'Passport/ID', completed: false },
      { id: 2, item: 'Travel Insurance', completed: false },
      { id: 3, item: 'Credit Cards', completed: false },
      { id: 4, item: 'Cash/Local Currency', completed: false }
    ],
    clothing: [
      { id: 5, item: 'Underwear', completed: false },
      { id: 6, item: 'Socks', completed: false },
      { id: 7, item: 'T-Shirts', completed: false },
      { id: 8, item: 'Pants/Shorts', completed: false }
    ],
    toiletries: [
      { id: 9, item: 'Toothbrush', completed: false },
      { id: 10, item: 'Toothpaste', completed: false },
      { id: 11, item: 'Shampoo', completed: false },
      { id: 12, item: 'Deodorant', completed: false }
    ],
    electronics: [
      { id: 13, item: 'Phone', completed: false },
      { id: 14, item: 'Charger', completed: false },
      { id: 15, item: 'Headphones', completed: false },
      { id: 16, item: 'Camera', completed: false }
    ]
  };
}

// Load collaborators
function loadCollaborators() {
  const collaboratorsList = document.getElementById('collaborators-list');
  collaboratorsList.innerHTML = '';

  const tripCollaborators = collaborators.filter(c =>
    currentTrip.collaborators.includes(c.id)
  );

  tripCollaborators.forEach(collaborator => {
    const div = document.createElement('div');
    div.className = 'collaborator-item';
    div.innerHTML = `
      <div class="collaborator-avatar">${collaborator.avatar}</div>
      <div class="collaborator-info">
        <div class="collaborator-name">${collaborator.name}</div>
        <div class="collaborator-role">${collaborator.role}</div>
      </div>
    `;
    collaboratorsList.appendChild(div);
  });
}

// Switch tabs
function switchTab(tabName) {
  // Update tab buttons
  tabButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Load tab content
  switch (tabName) {
    case 'itinerary':
      loadItinerary();
      break;
    case 'notes':
      loadNotes();
      break;
    case 'expenses':
      loadExpenses();
      break;
    case 'packing':
      loadPackingList();
      break;
  }
}

// Itinerary functions
function loadItinerary() {
  const activitiesList = document.getElementById('activities-list');
  activitiesList.innerHTML = '';

  if (currentTrip.itinerary.length === 0) {
    activitiesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No activities planned yet. Add your first activity!</p>';
    return;
  }

  // Sort activities by date and time
  const sortedActivities = currentTrip.itinerary.sort((a, b) => {
    const dateCompare = new Date(a.date) - new Date(b.date);
    if (dateCompare !== 0) return dateCompare;
    return (a.time || '00:00').localeCompare(b.time || '00:00');
  });

  sortedActivities.forEach(activity => {
    const activityElement = createActivityElement(activity);
    activitiesList.appendChild(activityElement);
  });
}

function createActivityElement(activity) {
  const div = document.createElement('div');
  div.className = 'activity-item';
  div.innerHTML = `
    <div class="activity-header">
      <div class="activity-title">${activity.title}</div>
      <div class="activity-category">${activity.category}</div>
    </div>
    <div class="activity-meta">
      <div class="activity-meta-item">
        <i class="fas fa-calendar-alt"></i>
        ${formatDate(activity.date)}
      </div>
      ${activity.time ? `
        <div class="activity-meta-item">
          <i class="fas fa-clock"></i>
          ${formatTime(activity.time)}
        </div>
      ` : ''}
      ${activity.location ? `
        <div class="activity-meta-item">
          <i class="fas fa-map-marker-alt"></i>
          ${activity.location}
        </div>
      ` : ''}
      ${activity.cost ? `
        <div class="activity-meta-item">
          <i class="fas fa-dollar-sign"></i>
          $${activity.cost}
        </div>
      ` : ''}
    </div>
    ${activity.description ? `
      <div class="activity-description">${activity.description}</div>
    ` : ''}
    <div class="activity-actions">
      <button class="btn-edit" onclick="editActivity(${activity.id})">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="btn-delete" onclick="deleteActivity(${activity.id})">
        <i class="fas fa-trash"></i> Delete
      </button>
    </div>
  `;

  return div;
}

function addActivity(e) {
  e.preventDefault();

  if (!currentTrip) return;

  const formData = new FormData(activityForm);
  const activity = {
    id: Date.now(),
    title: formData.get('activity-title'),
    date: formData.get('activity-date'),
    time: formData.get('activity-time'),
    location: formData.get('activity-location'),
    category: formData.get('activity-category'),
    description: formData.get('activity-description'),
    cost: parseFloat(formData.get('activity-cost')) || 0,
    createdBy: 1, // Current user
    createdAt: new Date().toISOString()
  };

  currentTrip.itinerary.push(activity);
  saveToLocalStorage();
  loadItinerary();
  closeAllModals();

  showNotification('Activity added successfully!', 'success');
  activityForm.reset();
  setDefaultDates();
}

function deleteActivity(activityId) {
  if (!currentTrip) return;

  currentTrip.itinerary = currentTrip.itinerary.filter(a => a.id !== activityId);
  saveToLocalStorage();
  loadItinerary();
  showNotification('Activity deleted', 'info');
}

// Notes functions
function loadNotes() {
  const notesContainer = document.getElementById('notes-container');
  notesContainer.innerHTML = '';

  if (currentTrip.notes.length === 0) {
    notesContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No notes yet. Add your first note!</p>';
    return;
  }

  currentTrip.notes.forEach(note => {
    const noteElement = createNoteElement(note);
    notesContainer.appendChild(noteElement);
  });
}

function createNoteElement(note) {
  const author = collaborators.find(c => c.id === note.createdBy);
  const div = document.createElement('div');
  div.className = 'note-item';
  div.innerHTML = `
    <div class="note-header">
      <div class="note-title">${note.title}</div>
      <div class="note-category">${note.category}</div>
    </div>
    <div class="note-content">${note.content}</div>
    <div class="note-meta">
      <div class="note-author">
        <i class="fas fa-user"></i>
        ${author ? author.name : 'Unknown'}
      </div>
      <div class="note-actions">
        <button class="btn-edit" onclick="editNote(${note.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn-delete" onclick="deleteNote(${note.id})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  return div;
}

function addNote(e) {
  e.preventDefault();

  if (!currentTrip) return;

  const formData = new FormData(noteForm);
  const note = {
    id: Date.now(),
    title: formData.get('note-title'),
    content: formData.get('note-content'),
    category: formData.get('note-category'),
    createdBy: 1, // Current user
    createdAt: new Date().toISOString()
  };

  currentTrip.notes.push(note);
  saveToLocalStorage();
  loadNotes();
  closeAllModals();

  showNotification('Note added successfully!', 'success');
  noteForm.reset();
}

function deleteNote(noteId) {
  if (!currentTrip) return;

  currentTrip.notes = currentTrip.notes.filter(n => n.id !== noteId);
  saveToLocalStorage();
  loadNotes();
  showNotification('Note deleted', 'info');
}

// Expenses functions
function loadExpenses() {
  const expensesList = document.getElementById('expenses-list');
  expensesList.innerHTML = '';

  if (currentTrip.expenses.length === 0) {
    expensesList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">No expenses tracked yet. Add your first expense!</p>';
    updateExpenseSummary();
    return;
  }

  currentTrip.expenses.forEach(expense => {
    const expenseElement = createExpenseElement(expense);
    expensesList.appendChild(expenseElement);
  });

  updateExpenseSummary();
}

function createExpenseElement(expense) {
  const div = document.createElement('div');
  div.className = 'expense-item';
  div.innerHTML = `
    <div class="expense-info">
      <div class="expense-title">${expense.description}</div>
      <div class="expense-meta">${formatDate(expense.date)} • ${expense.category}</div>
    </div>
    <div class="expense-amount">$${expense.amount.toFixed(2)}</div>
  `;

  return div;
}

function updateExpenseSummary() {
  const totalBudget = 0; // Could be set separately
  const totalSpent = currentTrip.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = totalBudget - totalSpent;

  document.getElementById('total-budget').textContent = `$${totalBudget.toFixed(2)}`;
  document.getElementById('total-spent').textContent = `$${totalSpent.toFixed(2)}`;
  document.getElementById('remaining-budget').textContent = `$${remaining.toFixed(2)}`;
}

// Packing list functions
function loadPackingList() {
  const packingCategories = document.getElementById('packing-categories');
  packingCategories.innerHTML = '';

  Object.entries(currentTrip.packingList).forEach(([category, items]) => {
    const categoryElement = createPackingCategoryElement(category, items);
    packingCategories.appendChild(categoryElement);
  });
}

function createPackingCategoryElement(categoryName, items) {
  const div = document.createElement('div');
  div.className = 'packing-category';

  const completedCount = items.filter(item => item.completed).length;
  const capitalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  div.innerHTML = `
    <div class="packing-category-header">
      <div class="packing-category-title">${capitalizedCategory}</div>
      <div class="packing-category-count">${completedCount}/${items.length}</div>
    </div>
    <div class="packing-items">
      ${items.map(item => `
        <div class="packing-item ${item.completed ? 'completed' : ''}" onclick="togglePackingItem('${categoryName}', ${item.id})">
          <div class="packing-item-checkbox ${item.completed ? 'checked' : ''}"></div>
          <div class="packing-item-text">${item.item}</div>
        </div>
      `).join('')}
    </div>
  `;

  return div;
}

function togglePackingItem(category, itemId) {
  const item = currentTrip.packingList[category].find(i => i.id === itemId);
  if (item) {
    item.completed = !item.completed;
    saveToLocalStorage();
    loadPackingList();
  }
}

// Modal functions
function openModal(modal) {
  closeAllModals();
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  document.body.style.overflow = '';
}

// Send invite
function sendInvite(e) {
  e.preventDefault();

  const formData = new FormData(inviteForm);
  const email = formData.get('invite-email');
  const message = formData.get('invite-message');

  // Simulate sending invite
  showNotification(`Invite sent to ${email}!`, 'success');
  closeAllModals();
  inviteForm.reset();
}

// Notification system
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  notificationsContainer.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `${startStr} - ${endStr}`;
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Placeholder functions for future implementation
function editActivity(activityId) {
  showNotification('Edit functionality coming soon!', 'info');
}

function editNote(noteId) {
  showNotification('Edit functionality coming soon!', 'info');
}

// Export functions for global access
window.editActivity = editActivity;
window.deleteActivity = deleteActivity;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.togglePackingItem = togglePackingItem;