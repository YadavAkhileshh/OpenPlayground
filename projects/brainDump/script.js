// Enhanced configuration with more keywords
const keywords = {
  Work: ["meeting", "project", "office", "job", "client", "deadline", "team", "work", "report", "presentation", "colleague", "boss", "task", "email", "schedule", "conference", "interview"],
  Study: ["study", "exam", "homework", "learn", "college", "university", "class", "lecture", "assignment", "research", "paper", "thesis", "quiz", "test", "course", "book", "reading"],
  Ideas: ["idea", "startup", "app", "design", "plan", "create", "build", "invent", "innovate", "concept", "brainstorm", "project", "solution", "prototype", "sketch", "blueprint"],
  Personal: ["family", "friend", "trip", "movie", "love", "birthday", "holiday", "party", "gift", "hobby", "game", "music", "pet", "home", "garden", "cook", "travel"],
  Health: ["gym", "diet", "exercise", "doctor", "sleep", "health", "fitness", "workout", "yoga", "meditation", "wellness", "nutrition", "meal", "water", "rest", "recovery", "vitamin"],
  Finance: ["money", "bill", "salary", "rent", "save", "budget", "investment", "stock", "bank", "credit", "debt", "loan", "tax", "expense", "income", "payment", "savings"]
};

const categories = Object.keys(keywords);
let currentEditNoteId = null;
let notes = [];

// Initialize application
function init() {
  loadNotes();
  renderBoard();
  setupEventListeners();
  updateStats();
}

// Event Listeners
function setupEventListeners() {
  // Input character count
  document.getElementById('ideaInput').addEventListener('input', function(e) {
    document.getElementById('charCount').textContent = e.target.value.length;
    updateCategoryPreview(e.target.value);
  });
  
  // Quick categories toggle
  document.getElementById('quickCategories').addEventListener('click', function() {
    const dropdown = document.getElementById('quickCategoriesDropdown');
    dropdown.style.display = dropdown.style.display === 'grid' ? 'none' : 'grid';
  });
  
  // Quick category buttons
  document.querySelectorAll('.quick-cat-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const input = document.getElementById('ideaInput');
      const cat = this.dataset.cat;
      input.value = `${input.value} [${cat.toLowerCase()}]`.trim();
      input.focus();
      updateCategoryPreview(input.value);
    });
  });
  
  // Search functionality
  document.getElementById('searchInput').addEventListener('input', function(e) {
    filterNotes(e.target.value.toLowerCase());
  });
  
  // Clear all button
  document.getElementById('clearAll').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
      localStorage.removeItem('notes');
      notes = [];
      renderBoard();
      updateStats();
      showNotification('All notes cleared successfully', 'success');
    }
  });
  
  // Theme toggle
  document.getElementById('toggleTheme').addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    const icon = this.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
  });
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('toggleTheme').querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }
  
  // Close quick categories when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#quickCategories') && !e.target.closest('#quickCategoriesDropdown')) {
      document.getElementById('quickCategoriesDropdown').style.display = 'none';
    }
  });
}

// Update category preview
function updateCategoryPreview(text) {
  const category = detectCategory(text);
  document.getElementById('detectedCategory').textContent = category;
  document.getElementById('detectedCategory').style.color = getCategoryColor(category);
}

// Enhanced category detection with scoring
function detectCategory(text) {
  text = text.toLowerCase();
  let scores = {};
  
  // Initialize scores
  categories.forEach(cat => scores[cat] = 0);
  
  // Score each keyword match
  for (let category in keywords) {
    keywords[category].forEach(word => {
      if (text.includes(word.toLowerCase())) {
        scores[category]++;
      }
    });
  }
  
  // Find highest score
  let highestScore = 0;
  let detectedCategory = 'Ideas'; // Default
  
  for (let category in scores) {
    if (scores[category] > highestScore) {
      highestScore = scores[category];
      detectedCategory = category;
    }
  }
  
  return detectedCategory;
}

// Get category color
function getCategoryColor(category) {
  const colors = {
    Work: '#3b82f6',
    Study: '#10b981',
    Ideas: '#f59e0b',
    Personal: '#8b5cf6',
    Health: '#ef4444',
    Finance: '#06b6d4'
  };
  return colors[category] || '#38bdf8';
}

// Add new idea
function addIdea() {
  const input = document.getElementById('ideaInput');
  const text = input.value.trim();
  
  if (!text) {
    showNotification('Please enter some text', 'error');
    return;
  }
  
  const category = detectCategory(text);
  const note = {
    id: Date.now().toString(),
    text: text,
    category: category,
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
  
  saveNote(note);
  renderNote(note);
  updateStats();
  
  input.value = '';
  document.getElementById('charCount').textContent = '0';
  updateCategoryPreview('');
  
  showNotification('Note added successfully!', 'success');
  
  // Hide quick categories dropdown
  document.getElementById('quickCategoriesDropdown').style.display = 'none';
}

// Save note to localStorage
function saveNote(note) {
  notes.push(note);
  localStorage.setItem('notes', JSON.stringify(notes));
  updateLastSaved();
}

// Load notes from localStorage
function loadNotes() {
  const savedNotes = localStorage.getItem('notes');
  notes = savedNotes ? JSON.parse(savedNotes) : [];
}

// Update stats
function updateStats() {
  document.getElementById('totalNotes').textContent = `Total Notes: ${notes.length}`;
  
  // Count by category
  const counts = {};
  notes.forEach(note => {
    counts[note.category] = (counts[note.category] || 0) + 1;
  });
  
  // Update category counts
  categories.forEach(cat => {
    const countElement = document.querySelector(`[data-category="${cat}"] .category-count`);
    if (countElement) {
      countElement.textContent = counts[cat] || 0;
    }
  });
}

// Update last saved time
function updateLastSaved() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  document.getElementById('lastSaved').textContent = `Last saved: ${timeString}`;
}

// Render the board with all categories
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  
  categories.forEach(category => {
    const categoryNotes = notes.filter(note => note.category === category);
    
    const categoryElement = document.createElement('div');
    categoryElement.className = 'category';
    categoryElement.dataset.category = category;
    
    categoryElement.innerHTML = `
      <div class="category-header">
        <h2>
          <i class="fas ${getCategoryIcon(category)}"></i>
          ${category}
        </h2>
        <span class="category-count">${categoryNotes.length}</span>
      </div>
      <div class="category-notes" id="${category}">
        ${categoryNotes.length === 0 ? 
          `<div class="empty-state">No notes yet. Add one!</div>` : 
          categoryNotes.map(note => createNoteHTML(note)).join('')
        }
      </div>
    `;
    
    board.appendChild(categoryElement);
  });
  
  // Add empty state if no notes
  if (notes.length === 0) {
    const emptyBoard = document.createElement('div');
    emptyBoard.className = 'empty-board';
    emptyBoard.innerHTML = `
      <div style="text-align: center; padding: 40px; opacity: 0.7;">
        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 20px;"></i>
        <h3>No notes yet</h3>
        <p>Start by adding your first thought above!</p>
      </div>
    `;
    board.appendChild(emptyBoard);
  }
}

// Get category icon
function getCategoryIcon(category) {
  const icons = {
    Work: 'fa-briefcase',
    Study: 'fa-graduation-cap',
    Ideas: 'fa-lightbulb',
    Personal: 'fa-user',
    Health: 'fa-heartbeat',
    Finance: 'fa-money-bill-wave'
  };
  return icons[category] || 'fa-sticky-note';
}

// Create note HTML
function createNoteHTML(note) {
  return `
    <div class="note" data-id="${note.id}">
      <div class="note-text">${escapeHTML(note.text)}</div>
      <div class="note-footer">
        <span class="note-date">${note.date}</span>
        <div class="note-actions">
          <i class="fas fa-edit" onclick="editNote('${note.id}')" title="Edit"></i>
          <i class="fas fa-trash" onclick="deleteNote('${note.id}')" title="Delete"></i>
        </div>
      </div>
    </div>
  `;
}

// Render single note
function renderNote(note) {
  const categoryElement = document.getElementById(note.category);
  if (categoryElement) {
    const emptyState = categoryElement.querySelector('.empty-state');
    if (emptyState) {
      emptyState.remove();
    }
    
    const noteElement = document.createElement('div');
    noteElement.className = 'note';
    noteElement.dataset.id = note.id;
    noteElement.innerHTML = `
      <div class="note-text">${escapeHTML(note.text)}</div>
      <div class="note-footer">
        <span class="note-date">${note.date}</span>
        <div class="note-actions">
          <i class="fas fa-edit" onclick="editNote('${note.id}')" title="Edit"></i>
          <i class="fas fa-trash" onclick="deleteNote('${note.id}')" title="Delete"></i>
        </div>
      </div>
    `;
    
    categoryElement.prepend(noteElement);
    updateStats();
  }
}

// Edit note
function editNote(noteId) {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;
  
  currentEditNoteId = noteId;
  document.getElementById('editTextarea').value = note.text;
  document.getElementById('editCategory').value = note.category;
  document.getElementById('editModal').style.display = 'flex';
}

// Save edited note
function saveEdit() {
  if (!currentEditNoteId) return;
  
  const text = document.getElementById('editTextarea').value.trim();
  const category = document.getElementById('editCategory').value;
  
  if (!text) {
    showNotification('Note cannot be empty', 'error');
    return;
  }
  
  const noteIndex = notes.findIndex(n => n.id === currentEditNoteId);
  if (noteIndex > -1) {
    notes[noteIndex].text = text;
    notes[noteIndex].category = category;
    notes[noteIndex].date = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    localStorage.setItem('notes', JSON.stringify(notes));
    renderBoard();
    updateStats();
    showNotification('Note updated successfully!', 'success');
  }
  
  closeEditModal();
}

// Close edit modal
function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
  currentEditNoteId = null;
}

// Delete note
function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  
  notes = notes.filter(note => note.id !== noteId);
  localStorage.setItem('notes', JSON.stringify(notes));
  
  const noteElement = document.querySelector(`[data-id="${noteId}"]`);
  if (noteElement) {
    noteElement.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      noteElement.remove();
      const category = noteElement.closest('.category-notes');
      if (category && category.children.length === 0) {
        category.innerHTML = '<div class="empty-state">No notes yet. Add one!</div>';
      }
      updateStats();
      showNotification('Note deleted', 'info');
    }, 300);
  }
}

// Filter notes
function filterNotes(searchTerm) {
  if (!searchTerm) {
    renderBoard();
    return;
  }
  
  categories.forEach(category => {
    const categoryElement = document.getElementById(category);
    if (categoryElement) {
      const notesInCategory = notes.filter(note => 
        note.category === category && 
        note.text.toLowerCase().includes(searchTerm)
      );
      
      categoryElement.innerHTML = notesInCategory.length === 0 ? 
        `<div class="empty-state">No matching notes</div>` :
        notesInCategory.map(note => createNoteHTML(note)).join('');
    }
  });
}

// Show notification
function showNotification(message, type) {
  // Remove existing notification
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <i class="fas fa-times" onclick="this.parentElement.remove()"></i>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}

// Add CSS for notification
const notificationCSS = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 10px;
    background: #1e293b;
    color: white;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 1001;
    animation: slideIn 0.3s ease;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    border-left: 4px solid #38bdf8;
  }
  
  .notification.success {
    border-left-color: #10b981;
  }
  
  .notification.error {
    border-left-color: #ef4444;
  }
  
  .notification.info {
    border-left-color: #8b5cf6;
  }
  
  .notification i {
    cursor: pointer;
    opacity: 0.7;
  }
  
  .notification i:hover {
    opacity: 1;
  }
  
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.9); }
  }
`;

// Add notification CSS to head
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationCSS;
document.head.appendChild(styleSheet);

// Utility function to escape HTML
function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);