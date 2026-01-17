// Roadmap data structure
let roadmapSteps = [
    { id: 1, title: "HTML Basics", hours: 6, completed: false, order: 1 },
    { id: 2, title: "CSS Fundamentals", hours: 8, completed: false, order: 2 },
    { id: 3, title: "JavaScript Basics", hours: 12, completed: false, order: 3 },
    { id: 4, title: "Build First Project", hours: 10, completed: false, order: 4 }
];

// Pace multipliers
const paceMultiplier = {
    beginner: 1.4,
    moderate: 1,
    fast: 0.7
};

// Current state
let currentPace = 'moderate';
let weeklyAvailableHours = 10;
let currentEditingStep = null;

// DOM Elements
const roadmapList = document.getElementById('roadmapList');
const hoursPerDayInput = document.getElementById('hoursPerDay');
const hoursPerWeekInput = document.getElementById('hoursPerWeek');
const weeklySummary = document.getElementById('weeklySummary');
const learningPaceInput = document.getElementById('learningPace');
const paceOptions = document.querySelectorAll('.pace-option');
const estimatedDuration = document.getElementById('estimatedDuration');
const progressPercent = document.getElementById('progressPercent');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const completionDate = document.getElementById('completionDate');
const completedCount = document.getElementById('completedCount');
const remainingCount = document.getElementById('remainingCount');
const totalHours = document.getElementById('totalHours');
const addStepBtn = document.getElementById('addStep');
const resetAllBtn = document.getElementById('resetAll');
const exportRoadmapBtn = document.getElementById('exportRoadmap');
const editModal = document.getElementById('editModal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const saveEditBtn = document.getElementById('saveEdit');
const deleteStepBtn = document.getElementById('deleteStep');
const editTitleInput = document.getElementById('editTitle');
const editHoursInput = document.getElementById('editHours');
const editCompletedCheckbox = document.getElementById('editCompleted');

// Initialize the application
function init() {
    loadFromLocalStorage();
    setupEventListeners();
    updateAvailability();
    renderRoadmap();
    updateProgress();
    updateDuration();
}

// Load data from localStorage
function loadFromLocalStorage() {
    const savedSteps = localStorage.getItem('roadmapSteps');
    const savedPace = localStorage.getItem('learningPace');
    const savedHours = localStorage.getItem('weeklyHours');
    
    if (savedSteps) {
        roadmapSteps = JSON.parse(savedSteps);
    }
    
    if (savedPace) {
        currentPace = savedPace;
        learningPaceInput.value = savedPace;
        updatePaceSelection();
    }
    
    if (savedHours) {
        weeklyAvailableHours = parseInt(savedHours);
        hoursPerWeekInput.value = weeklyAvailableHours;
        hoursPerDayInput.value = Math.round(weeklyAvailableHours / 5);
    }
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('roadmapSteps', JSON.stringify(roadmapSteps));
    localStorage.setItem('learningPace', currentPace);
    localStorage.setItem('weeklyHours', weeklyAvailableHours.toString());
}

// Setup event listeners
function setupEventListeners() {
    // Availability inputs
    hoursPerDayInput.addEventListener('input', updateAvailability);
    hoursPerWeekInput.addEventListener('input', updateAvailability);
    
    // Pace selection
    paceOptions.forEach(option => {
        option.addEventListener('click', () => {
            const pace = option.dataset.pace;
            setPace(pace);
        });
    });
    
    // Control buttons
    addStepBtn.addEventListener('click', addNewStep);
    resetAllBtn.addEventListener('click', resetAll);
    exportRoadmapBtn.addEventListener('click', exportRoadmap);
    
    // Modal controls
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            editModal.style.display = 'none';
        });
    });
    
    saveEditBtn.addEventListener('click', saveStepEdit);
    deleteStepBtn.addEventListener('click', deleteCurrentStep);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });
}

// Update availability based on user input
function updateAvailability() {
    const hoursPerDay = parseInt(hoursPerDayInput.value) || 0;
    const hoursPerWeek = parseInt(hoursPerWeekInput.value) || 0;
    
    // If both are filled, prefer weekly
    if (hoursPerWeek > 0) {
        weeklyAvailableHours = hoursPerWeek;
    } else if (hoursPerDay > 0) {
        weeklyAvailableHours = hoursPerDay * 5; // Assume 5 days/week
    } else {
        weeklyAvailableHours = 10; // Default
    }
    
    // Update UI
    weeklySummary.innerHTML = `Based on your inputs: <strong>${weeklyAvailableHours} hours/week</strong> available`;
    
    // Update weekly input to match calculated value
    hoursPerWeekInput.value = weeklyAvailableHours;
    
    updateDuration();
    saveToLocalStorage();
}

// Set learning pace
function setPace(pace) {
    currentPace = pace;
    learningPaceInput.value = pace;
    
    // Update UI
    updatePaceSelection();
    updateDuration();
    saveToLocalStorage();
}

// Update pace selection UI
function updatePaceSelection() {
    paceOptions.forEach(option => {
        if (option.dataset.pace === currentPace) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Calculate and update duration
function updateDuration() {
    const totalRoadmapHours = roadmapSteps.reduce((sum, step) => sum + step.hours, 0);
    
    if (weeklyAvailableHours === 0) {
        estimatedDuration.textContent = "Set availability first";
        return;
    }
    
    // Calculate weeks
    let totalWeeks = (totalRoadmapHours / weeklyAvailableHours) * paceMultiplier[currentPace];
    totalWeeks = Math.max(1, Math.ceil(totalWeeks));
    
    estimatedDuration.textContent = `${totalWeeks} week${totalWeeks !== 1 ? 's' : ''}`;
    
    // Update completion date
    updateCompletionDate(totalWeeks);
}

// Update completion date estimate
function updateCompletionDate(weeks) {
    const today = new Date();
    const completion = new Date(today);
    completion.setDate(today.getDate() + (weeks * 7));
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    completionDate.textContent = `Estimated completion: ${completion.toLocaleDateString(undefined, options)}`;
}

// Render roadmap steps
function renderRoadmap() {
    roadmapList.innerHTML = '';
    
    // Sort steps by order
    const sortedSteps = [...roadmapSteps].sort((a, b) => a.order - b.order);
    
    sortedSteps.forEach((step, index) => {
        const stepElement = createStepElement(step, index);
        roadmapList.appendChild(stepElement);
    });
    
    // Update stats
    updateStats();
    saveToLocalStorage();
}

// Create a step element
function createStepElement(step, index) {
    const li = document.createElement('li');
    li.className = `step ${step.completed ? 'completed' : 'upcoming'}`;
    li.dataset.id = step.id;
    li.draggable = true;
    
    // Determine status
    let status = 'upcoming';
    if (step.completed) status = 'completed';
    else if (index === 0) status = 'current';
    
    if (status === 'current') li.classList.add('current');
    
    li.innerHTML = `
        <div class="step-content">
            <div class="step-header">
                <span class="step-title">${step.title}</span>
                <span class="step-hours">${step.hours} hrs</span>
            </div>
            <div class="step-status">
                <span class="status-badge ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
                <span>Step ${index + 1} of ${roadmapSteps.length}</span>
            </div>
        </div>
        <div class="step-controls">
            <button class="complete-btn" onclick="toggleComplete(${step.id})" title="${step.completed ? 'Mark as incomplete' : 'Mark as complete'}">
                <i class="fas fa-${step.completed ? 'undo' : 'check'}"></i>
            </button>
            <button class="edit-btn" onclick="openEditModal(${step.id})" title="Edit step">
                <i class="fas fa-edit"></i>
            </button>
            <button class="up-btn" onclick="moveStep(${step.id}, -1)" title="Move up" ${index === 0 ? 'disabled' : ''}>
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="down-btn" onclick="moveStep(${step.id}, 1)" title="Move down" ${index === roadmapSteps.length - 1 ? 'disabled' : ''}>
                <i class="fas fa-arrow-down"></i>
            </button>
        </div>
    `;
    
    // Add drag and drop events
    setupDragAndDrop(li, step.id);
    
    return li;
}

// Setup drag and drop for a step
function setupDragAndDrop(element, stepId) {
    element.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', stepId.toString());
        element.classList.add('dragging');
    });
    
    element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
        roadmapList.querySelectorAll('.step').forEach(step => step.classList.remove('over'));
    });
    
    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        element.classList.add('over');
    });
    
    element.addEventListener('dragleave', () => {
        element.classList.remove('over');
    });
    
    element.addEventListener('drop', (e) => {
        e.preventDefault();
        element.classList.remove('over');
        
        const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
        const targetId = stepId;
        
        if (draggedId !== targetId) {
            reorderSteps(draggedId, targetId);
        }
    });
}

// Reorder steps
function reorderSteps(draggedId, targetId) {
    const draggedIndex = roadmapSteps.findIndex(s => s.id === draggedId);
    const targetIndex = roadmapSteps.findIndex(s => s.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Remove dragged step
    const [draggedStep] = roadmapSteps.splice(draggedIndex, 1);
    
    // Insert at target position
    roadmapSteps.splice(targetIndex, 0, draggedStep);
    
    // Update order property
    roadmapSteps.forEach((step, index) => {
        step.order = index + 1;
    });
    
    renderRoadmap();
}

// Move step up or down
function moveStep(stepId, direction) {
    const stepIndex = roadmapSteps.findIndex(s => s.id === stepId);
    if (stepIndex === -1) return;
    
    const newIndex = stepIndex + direction;
    if (newIndex < 0 || newIndex >= roadmapSteps.length) return;
    
    // Swap steps
    [roadmapSteps[stepIndex], roadmapSteps[newIndex]] = [roadmapSteps[newIndex], roadmapSteps[stepIndex]];
    
    // Update order property
    roadmapSteps.forEach((step, index) => {
        step.order = index + 1;
    });
    
    renderRoadmap();
}

// Toggle step completion
function toggleComplete(stepId) {
    const step = roadmapSteps.find(s => s.id === stepId);
    if (step) {
        step.completed = !step.completed;
        renderRoadmap();
        updateProgress();
    }
}

// Update progress
function updateProgress() {
    const totalSteps = roadmapSteps.length;
    const completedSteps = roadmapSteps.filter(step => step.completed).length;
    const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    progressPercent.textContent = `${percentage}%`;
    progressText.textContent = `${completedSteps}/${totalSteps} steps completed`;
    progressFill.style.width = `${percentage}%`;
    
    // Update stats
    completedCount.textContent = completedSteps;
    remainingCount.textContent = totalSteps - completedSteps;
}

// Update stats
function updateStats() {
    const totalSteps = roadmapSteps.length;
    const completedSteps = roadmapSteps.filter(step => step.completed).length;
    const totalHours = roadmapSteps.reduce((sum, step) => sum + step.hours, 0);
    
    completedCount.textContent = completedSteps;
    remainingCount.textContent = totalSteps - completedSteps;
    document.getElementById('totalHours').textContent = totalHours;
}

// Open edit modal
function openEditModal(stepId) {
    const step = roadmapSteps.find(s => s.id === stepId);
    if (!step) return;
    
    currentEditingStep = stepId;
    editTitleInput.value = step.title;
    editHoursInput.value = step.hours;
    editCompletedCheckbox.checked = step.completed;
    
    editModal.style.display = 'flex';
}

// Save step edit
function saveStepEdit() {
    const step = roadmapSteps.find(s => s.id === currentEditingStep);
    if (!step) return;
    
    step.title = editTitleInput.value.trim();
    step.hours = parseInt(editHoursInput.value) || 1;
    step.completed = editCompletedCheckbox.checked;
    
    editModal.style.display = 'none';
    renderRoadmap();
    updateProgress();
    updateDuration();
}

// Delete current step
function deleteCurrentStep() {
    if (!confirm('Are you sure you want to delete this step?')) return;
    
    roadmapSteps = roadmapSteps.filter(s => s.id !== currentEditingStep);
    
    // Reorder remaining steps
    roadmapSteps.forEach((step, index) => {
        step.order = index + 1;
    });
    
    editModal.style.display = 'none';
    renderRoadmap();
    updateProgress();
    updateDuration();
}

// Add new step
function addNewStep() {
    const title = prompt('Enter step title:', 'New Learning Step');
    if (!title) return;
    
    const hours = parseInt(prompt('Enter estimated hours:', '5')) || 5;
    
    const newId = roadmapSteps.length > 0 ? Math.max(...roadmapSteps.map(s => s.id)) + 1 : 1;
    const newOrder = roadmapSteps.length + 1;
    
    const newStep = {
        id: newId,
        title: title,
        hours: hours,
        completed: false,
        order: newOrder
    };
    
    roadmapSteps.push(newStep);
    renderRoadmap();
    updateProgress();
    updateDuration();
}

// Reset all
function resetAll() {
    if (!confirm('Are you sure you want to reset all progress? This cannot be undone.')) return;
    
    roadmapSteps = [
        { id: 1, title: "HTML Basics", hours: 6, completed: false, order: 1 },
        { id: 2, title: "CSS Fundamentals", hours: 8, completed: false, order: 2 },
        { id: 3, title: "JavaScript Basics", hours: 12, completed: false, order: 3 },
        { id: 4, title: "Build First Project", hours: 10, completed: false, order: 4 }
    ];
    
    hoursPerDayInput.value = 2;
    hoursPerWeekInput.value = 10;
    setPace('moderate');
    
    updateAvailability();
    renderRoadmap();
    updateProgress();
    updateDuration();
}

// Export roadmap
function exportRoadmap() {
    const exportData = {
        roadmapSteps: roadmapSteps,
        learningPace: currentPace,
        weeklyAvailableHours: weeklyAvailableHours,
        exportDate: new Date().toISOString(),
        progress: {
            completed: roadmapSteps.filter(s => s.completed).length,
            total: roadmapSteps.length,
            percentage: Math.round((roadmapSteps.filter(s => s.completed).length / roadmapSteps.length) * 100)
        }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `learning-roadmap-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);