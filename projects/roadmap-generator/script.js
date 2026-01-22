// Roadmap data for different topics
const roadmapData = {
    'web-development': {
        title: 'Web Development',
        steps: [
            { title: 'HTML Basics', description: 'Learn HTML structure, tags, and semantic elements', baseHours: 15 },
            { title: 'CSS Fundamentals', description: 'Master CSS styling, layouts, and responsive design', baseHours: 20 },
            { title: 'JavaScript Basics', description: 'Variables, functions, DOM manipulation', baseHours: 25 },
            { title: 'JavaScript Advanced', description: 'ES6+, async/await, APIs', baseHours: 30 },
            { title: 'Frontend Framework', description: 'Learn React, Vue, or Angular', baseHours: 40 },
            { title: 'Backend Basics', description: 'Node.js, Express, databases', baseHours: 35 },
            { title: 'Full Stack Project', description: 'Build a complete web application', baseHours: 50 }
        ]
    },
    'javascript': {
        title: 'JavaScript Mastery',
        steps: [
            { title: 'JavaScript Fundamentals', description: 'Variables, data types, operators', baseHours: 20 },
            { title: 'Functions & Scope', description: 'Function declarations, closures, scope', baseHours: 15 },
            { title: 'Objects & Arrays', description: 'Object manipulation, array methods', baseHours: 18 },
            { title: 'DOM Manipulation', description: 'Selecting elements, event handling', baseHours: 22 },
            { title: 'Asynchronous JavaScript', description: 'Promises, async/await, fetch API', baseHours: 25 },
            { title: 'ES6+ Features', description: 'Arrow functions, destructuring, modules', baseHours: 20 },
            { title: 'Advanced Concepts', description: 'Prototypes, this keyword, design patterns', baseHours: 30 }
        ]
    },
    'python': {
        title: 'Python Programming',
        steps: [
            { title: 'Python Basics', description: 'Syntax, variables, data types', baseHours: 18 },
            { title: 'Control Structures', description: 'Loops, conditionals, functions', baseHours: 20 },
            { title: 'Data Structures', description: 'Lists, dictionaries, sets, tuples', baseHours: 22 },
            { title: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism', baseHours: 25 },
            { title: 'File Handling & Modules', description: 'Working with files, importing modules', baseHours: 15 },
            { title: 'Libraries & Frameworks', description: 'NumPy, Pandas, Flask/Django basics', baseHours: 35 },
            { title: 'Project Development', description: 'Build a complete Python application', baseHours: 40 }
        ]
    },
    'react': {
        title: 'React Development',
        steps: [
            { title: 'React Fundamentals', description: 'Components, JSX, props', baseHours: 20 },
            { title: 'State Management', description: 'useState, useEffect, component lifecycle', baseHours: 25 },
            { title: 'Event Handling', description: 'Forms, user interactions, controlled components', baseHours: 18 },
            { title: 'React Router', description: 'Navigation, routing, dynamic routes', baseHours: 15 },
            { title: 'Advanced Hooks', description: 'useContext, useReducer, custom hooks', baseHours: 22 },
            { title: 'State Management Libraries', description: 'Redux, Zustand, or Context API', baseHours: 28 },
            { title: 'React Project', description: 'Build a full React application', baseHours: 45 }
        ]
    },
    'data-science': {
        title: 'Data Science',
        steps: [
            { title: 'Python for Data Science', description: 'NumPy, Pandas basics', baseHours: 25 },
            { title: 'Data Visualization', description: 'Matplotlib, Seaborn, Plotly', baseHours: 20 },
            { title: 'Statistics & Probability', description: 'Descriptive and inferential statistics', baseHours: 30 },
            { title: 'Data Cleaning', description: 'Handling missing data, outliers', baseHours: 22 },
            { title: 'Machine Learning Basics', description: 'Scikit-learn, supervised learning', baseHours: 35 },
            { title: 'Advanced ML', description: 'Unsupervised learning, model evaluation', baseHours: 40 },
            { title: 'Data Science Project', description: 'End-to-end data science project', baseHours: 50 }
        ]
    },
    'machine-learning': {
        title: 'Machine Learning',
        steps: [
            { title: 'ML Fundamentals', description: 'Types of ML, basic concepts', baseHours: 20 },
            { title: 'Supervised Learning', description: 'Linear regression, classification', baseHours: 30 },
            { title: 'Unsupervised Learning', description: 'Clustering, dimensionality reduction', baseHours: 25 },
            { title: 'Model Evaluation', description: 'Cross-validation, metrics, overfitting', baseHours: 22 },
            { title: 'Feature Engineering', description: 'Feature selection, scaling, encoding', baseHours: 20 },
            { title: 'Deep Learning Basics', description: 'Neural networks, TensorFlow/PyTorch', baseHours: 40 },
            { title: 'ML Project', description: 'Complete machine learning project', baseHours: 45 }
        ]
    }
};

let currentRoadmap = null;
let isEditMode = false;
let completedSteps = new Set();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadSavedProgress();
});

function setupEventListeners() {
    // Range sliders
    document.getElementById('hoursPerDay').addEventListener('input', updateHoursDisplay);
    document.getElementById('daysPerWeek').addEventListener('input', updateDaysDisplay);
}

function updateHoursDisplay() {
    const hours = document.getElementById('hoursPerDay').value;
    document.getElementById('hoursValue').textContent = `${hours} hour${hours != 1 ? 's' : ''}`;
}

function updateDaysDisplay() {
    const days = document.getElementById('daysPerWeek').value;
    document.getElementById('daysValue').textContent = `${days} day${days != 1 ? 's' : ''}`;
}

function generateRoadmap() {
    const topic = document.getElementById('topic').value;
    const experience = document.getElementById('experience').value;
    const hoursPerDay = parseFloat(document.getElementById('hoursPerDay').value);
    const daysPerWeek = parseInt(document.getElementById('daysPerWeek').value);
    const learningPace = document.getElementById('learningPace').value;

    if (!topic) {
        alert('Please select a learning topic');
        return;
    }

    // Calculate multipliers based on user preferences
    const experienceMultiplier = {
        'beginner': 1.3,
        'intermediate': 1.0,
        'advanced': 0.7
    };

    const paceMultiplier = {
        'relaxed': 1.4,
        'moderate': 1.0,
        'intensive': 0.7
    };

    // Generate personalized roadmap
    const baseRoadmap = roadmapData[topic];
    const expMultiplier = experienceMultiplier[experience];
    const paceMultiplier_val = paceMultiplier[learningPace];

    currentRoadmap = {
        ...baseRoadmap,
        hoursPerDay,
        daysPerWeek,
        experience,
        learningPace,
        steps: baseRoadmap.steps.map((step, index) => ({
            ...step,
            id: index,
            adjustedHours: Math.ceil(step.baseHours * expMultiplier * paceMultiplier_val),
            completed: completedSteps.has(`${topic}-${index}`),
            status: getStepStatus(index)
        }))
    };

    displayRoadmap();
    saveProgress();
}

function getStepStatus(stepIndex) {
    const completedCount = Array.from(completedSteps).filter(id => 
        id.startsWith(document.getElementById('topic').value)
    ).length;
    
    if (completedSteps.has(`${document.getElementById('topic').value}-${stepIndex}`)) {
        return 'completed';
    } else if (stepIndex === completedCount) {
        return 'current';
    } else {
        return 'upcoming';
    }
}

function displayRoadmap() {
    document.getElementById('setupSection').style.display = 'none';
    document.getElementById('roadmapSection').style.display = 'block';

    // Calculate total duration
    const totalHours = currentRoadmap.steps.reduce((sum, step) => sum + step.adjustedHours, 0);
    const totalDays = Math.ceil(totalHours / (currentRoadmap.hoursPerDay * currentRoadmap.daysPerWeek));
    const totalWeeks = Math.ceil(totalDays / 7);

    // Update stats
    document.getElementById('roadmapStats').innerHTML = `
        <strong>${currentRoadmap.title}</strong><br>
        📅 Duration: ${totalWeeks} weeks (${totalDays} days)<br>
        ⏱️ Total Hours: ${totalHours}h<br>
        📚 ${currentRoadmap.hoursPerDay}h/day × ${currentRoadmap.daysPerWeek} days/week
    `;

    // Update progress
    updateProgress();

    // Display steps
    displaySteps();
}

function displaySteps() {
    const timeline = document.getElementById('roadmapTimeline');
    timeline.innerHTML = '';

    currentRoadmap.steps.forEach((step, index) => {
        const stepElement = createStepElement(step, index);
        timeline.appendChild(stepElement);
    });
}

function createStepElement(step, index) {
    const stepDiv = document.createElement('div');
    stepDiv.className = `roadmap-step ${step.status}`;
    stepDiv.setAttribute('data-step-id', step.id);

    const statusIcon = {
        'completed': '✓',
        'current': '▶',
        'upcoming': (index + 1).toString()
    };

    const daysToComplete = Math.ceil(step.adjustedHours / currentRoadmap.hoursPerDay);

    stepDiv.innerHTML = `
        <div class="step-status">${statusIcon[step.status]}</div>
        <div class="step-header">
            <div class="step-title">${step.title}</div>
            <div class="step-duration">${step.adjustedHours}h (${daysToComplete} days)</div>
        </div>
        <div class="step-description">${step.description}</div>
        <div class="step-actions">
            ${step.status !== 'completed' ? `<button class="step-btn complete-btn" onclick="markStepComplete(${step.id})">Mark Complete</button>` : ''}
            ${step.status === 'completed' ? `<button class="step-btn complete-btn" onclick="markStepIncomplete(${step.id})">Mark Incomplete</button>` : ''}
            <button class="step-btn edit-step-btn" onclick="editStep(${step.id})">Edit</button>
            <button class="step-btn move-btn" onclick="moveStepUp(${step.id})">↑ Move Up</button>
            <button class="step-btn move-btn" onclick="moveStepDown(${step.id})">↓ Move Down</button>
            <button class="step-btn delete-btn" onclick="deleteStep(${step.id})">Delete</button>
        </div>
    `;

    return stepDiv;
}

function markStepComplete(stepId) {
    const topic = document.getElementById('topic').value;
    completedSteps.add(`${topic}-${stepId}`);
    updateStepStatuses();
    displaySteps();
    updateProgress();
    saveProgress();
}

function markStepIncomplete(stepId) {
    const topic = document.getElementById('topic').value;
    completedSteps.delete(`${topic}-${stepId}`);
    updateStepStatuses();
    displaySteps();
    updateProgress();
    saveProgress();
}

function updateStepStatuses() {
    currentRoadmap.steps.forEach((step, index) => {
        step.status = getStepStatus(index);
        step.completed = completedSteps.has(`${document.getElementById('topic').value}-${index}`);
    });
}

function updateProgress() {
    const completedCount = currentRoadmap.steps.filter(step => step.completed).length;
    const totalSteps = currentRoadmap.steps.length;
    const progressPercentage = (completedCount / totalSteps) * 100;

    document.getElementById('progressFill').style.width = `${progressPercentage}%`;
    document.getElementById('progressText').textContent = `${Math.round(progressPercentage)}% Complete (${completedCount}/${totalSteps} steps)`;
}

function editStep(stepId) {
    const step = currentRoadmap.steps.find(s => s.id === stepId);
    const newTitle = prompt('Edit step title:', step.title);
    const newDescription = prompt('Edit step description:', step.description);
    const newHours = prompt('Edit estimated hours:', step.adjustedHours);

    if (newTitle && newDescription && newHours) {
        step.title = newTitle;
        step.description = newDescription;
        step.adjustedHours = parseInt(newHours);
        displaySteps();
        displayRoadmap();
        saveProgress();
    }
}

function moveStepUp(stepId) {
    const index = currentRoadmap.steps.findIndex(s => s.id === stepId);
    if (index > 0) {
        [currentRoadmap.steps[index], currentRoadmap.steps[index - 1]] = 
        [currentRoadmap.steps[index - 1], currentRoadmap.steps[index]];
        updateStepStatuses();
        displaySteps();
        saveProgress();
    }
}

function moveStepDown(stepId) {
    const index = currentRoadmap.steps.findIndex(s => s.id === stepId);
    if (index < currentRoadmap.steps.length - 1) {
        [currentRoadmap.steps[index], currentRoadmap.steps[index + 1]] = 
        [currentRoadmap.steps[index + 1], currentRoadmap.steps[index]];
        updateStepStatuses();
        displaySteps();
        saveProgress();
    }
}

function deleteStep(stepId) {
    if (confirm('Are you sure you want to delete this step?')) {
        currentRoadmap.steps = currentRoadmap.steps.filter(s => s.id !== stepId);
        updateStepStatuses();
        displaySteps();
        displayRoadmap();
        saveProgress();
    }
}

function toggleEditMode() {
    isEditMode = !isEditMode;
    const timeline = document.getElementById('roadmapTimeline');
    const editBtn = document.querySelector('.edit-btn');
    
    if (isEditMode) {
        timeline.classList.add('edit-mode');
        editBtn.textContent = '✓ Done Editing';
        editBtn.style.background = '#48bb78';
    } else {
        timeline.classList.remove('edit-mode');
        editBtn.textContent = '✏️ Edit Mode';
        editBtn.style.background = '#48bb78';
    }
}

function resetRoadmap() {
    if (confirm('Are you sure you want to create a new roadmap? This will clear your current progress.')) {
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('roadmapSection').style.display = 'none';
        currentRoadmap = null;
        isEditMode = false;
    }
}

function saveProgress() {
    const progressData = {
        completedSteps: Array.from(completedSteps),
        currentRoadmap: currentRoadmap
    };
    localStorage.setItem('roadmapProgress', JSON.stringify(progressData));
}

function loadSavedProgress() {
    const saved = localStorage.getItem('roadmapProgress');
    if (saved) {
        const progressData = JSON.parse(saved);
        completedSteps = new Set(progressData.completedSteps);
        
        if (progressData.currentRoadmap) {
            currentRoadmap = progressData.currentRoadmap;
            // Restore form values
            document.getElementById('topic').value = Object.keys(roadmapData).find(key => 
                roadmapData[key].title === currentRoadmap.title
            ) || '';
            document.getElementById('hoursPerDay').value = currentRoadmap.hoursPerDay;
            document.getElementById('daysPerWeek').value = currentRoadmap.daysPerWeek;
            updateHoursDisplay();
            updateDaysDisplay();
            displayRoadmap();
        }
    }
}