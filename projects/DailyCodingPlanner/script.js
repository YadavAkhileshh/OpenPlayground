// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    updateDate();
    initializeTimer();
    initializeTasks();
    initializeSnippets();
    initializeChart();
    
    // Event listeners
    setupEventListeners();
});

// Date and Time
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Pomodoro Timer
let timerInterval;
let timerRunning = false;
let timeLeft = 25 * 60; // 25 minutes in seconds

function initializeTimer() {
    updateTimerDisplay();
    
    // Timer preset buttons
    document.querySelectorAll('.preset').forEach(button => {
        button.addEventListener('click', function() {
            const minutes = parseInt(this.dataset.minutes);
            timeLeft = minutes * 60;
            updateTimerDisplay();
            if (timerRunning) {
                clearInterval(timerInterval);
                startTimer();
            }
        });
    });
}

function startTimer() {
    if (timerRunning) return;
    
    timerRunning = true;
    document.getElementById('startTimer').disabled = true;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            document.getElementById('startTimer').disabled = false;
            playTimerSound();
            showNotification('Timer completed! Take a break.');
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('startTimer').disabled = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timeLeft = 25 * 60;
    updateTimerDisplay();
    document.getElementById('startTimer').disabled = false;
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Task Management
let tasks = JSON.parse(localStorage.getItem('codingTasks')) || [];

function initializeTasks() {
    renderTasks();
    updateTaskStats();
}

function renderTasks(filter = 'all') {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'active') return !task.completed;
        return true;
    });
    
    filteredTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-index="${index}">
                ${task.completed ? '✓' : ''}
            </div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <span class="priority ${task.priority}">${task.priority}</span>
                    <span class="time">${task.time} hours</span>
                </div>
            </div>
        `;
        taskList.appendChild(taskItem);
    });
    
    // Add event listeners to checkboxes
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            toggleTaskComplete(index);
        });
    });
}

function toggleTaskComplete(index) {
    tasks[index].completed = !tasks[index].completed;
    tasks[index].completedAt = tasks[index].completed ? new Date().toISOString() : null;
    saveTasks();
    renderTasks(getActiveFilter());
    updateTaskStats();
}

function getActiveFilter() {
    const activeBtn = document.querySelector('.filter-btn.active');
    return activeBtn ? activeBtn.dataset.filter : 'all';
}

function addTask(taskData) {
    const task = {
        id: Date.now(),
        ...taskData,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTasks(getActiveFilter());
    updateTaskStats();
}

function saveTasks() {
    localStorage.setItem('codingTasks', JSON.stringify(tasks));
}

function updateTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    document.getElementById('completedTasks').textContent = `${completed}/${total} tasks completed`;
    
    // Update weekly progress
    updateProgressStats();
}

// Snippets Management
let snippets = JSON.parse(localStorage.getItem('codeSnippets')) || [];

function initializeSnippets() {
    renderSnippets();
}

function renderSnippets(filter = 'javascript') {
    const snippetsList = document.getElementById('snippetsList');
    snippetsList.innerHTML = '';
    
    const filteredSnippets = snippets.filter(snippet => 
        filter === 'all' || snippet.language === filter
    );
    
    if (filteredSnippets.length === 0) {
        snippetsList.innerHTML = `
            <div class="no-snippets">
                <p>No snippets yet. Add your first code snippet!</p>
            </div>
        `;
        return;
    }
    
    filteredSnippets.forEach(snippet => {
        const snippetItem = document.createElement('div');
        snippetItem.className = 'snippet-item';
        snippetItem.innerHTML = `
            <div class="snippet-header">
                <h4>${snippet.title}</h4>
                <span class="snippet-language">${snippet.language}</span>
            </div>
            <pre class="snippet-code">${escapeHtml(snippet.code)}</pre>
        `;
        snippetsList.appendChild(snippetItem);
    });
}

function addSnippet(title, language, code) {
    const snippet = {
        id: Date.now(),
        title,
        language,
        code,
        createdAt: new Date().toISOString()
    };
    
    snippets.push(snippet);
    saveSnippets();
    renderSnippets(language);
}

function saveSnippets() {
    localStorage.setItem('codeSnippets', JSON.stringify(snippets));
}

// Progress Chart
let progressChart;

function initializeChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hoursData = [2, 3, 1, 4, 2, 3, 1];
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: weekDays,
            datasets: [{
                label: 'Coding Hours',
                data: hoursData,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 8,
                    ticks: {
                        stepSize: 2
                    }
                }
            }
        }
    });
    
    updateProgressStats();
}

function updateProgressStats() {
    // Calculate total hours from completed tasks
    const totalHours = tasks
        .filter(task => task.completed)
        .reduce((sum, task) => sum + task.time, 0);
    
    // Calculate completed challenges (tasks with "challenge" in title)
    const completedChallenges = tasks
        .filter(task => task.completed && task.title.toLowerCase().includes('challenge'))
        .length;
    
    document.getElementById('totalHours').textContent = totalHours;
    document.getElementById('completedChallenges').textContent = completedChallenges;
}

// Modal Management
function setupEventListeners() {
    // Timer controls
    document.getElementById('startTimer').addEventListener('click', startTimer);
    document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
    document.getElementById('resetTimer').addEventListener('click', resetTimer);
    
    // Task filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks(this.dataset.filter);
        });
    });
    
    // Add task modal
    const modal = document.getElementById('taskModal');
    const addTaskBtn = document.getElementById('addTask');
    const closeModal = document.querySelector('.close-modal');
    
    addTaskBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Task form submission
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            time: parseFloat(document.getElementById('taskTime').value)
        };
        
        addTask(taskData);
        modal.style.display = 'none';
        this.reset();
    });
    
    // Add snippet button
    document.getElementById('addSnippet').addEventListener('click', function() {
        // Simple snippet addition - could be enhanced with a modal
        const languages = ['javascript', 'python', 'html', 'css'];
        const randomLanguage = languages[Math.floor(Math.random() * languages.length)];
        const snippetsExamples = {
            javascript: `// Fibonacci sequence\ngetFibonacci(n) {\n  if (n <= 1) return n;\n  return getFibonacci(n - 1) + getFibonacci(n - 2);\n}`,
            python: `# Quick sort implementation\ndef quick_sort(arr):\n    if len(arr) <= 1:\n        return arr\n    pivot = arr[len(arr) // 2]\n    left = [x for x in arr if x < pivot]\n    middle = [x for x in arr if x == pivot]\n    right = [x for x in arr if x > pivot]\n    return quick_sort(left) + middle + quick_sort(right)`,
            html: `<!-- Responsive card component -->\n<div class="card">\n  <img src="image.jpg" alt="Sample">\n  <div class="card-content">\n    <h3>Card Title</h3>\n    <p>Card description text here.</p>\n  </div>\n</div>`,
            css: `/* Glass morphism effect */\n.glass-card {\n  background: rgba(255, 255, 255, 0.1);\n  backdrop-filter: blur(10px);\n  border-radius: 20px;\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  padding: 2rem;\n}`
        };
        
        const snippetTitle = `Sample ${randomLanguage.toUpperCase()} Code`;
        addSnippet(snippetTitle, randomLanguage, snippetsExamples[randomLanguage]);
    });
    
    // Language filter
    document.getElementById('languageSelect').addEventListener('change', function() {
        renderSnippets(this.value);
    });
}

// Utility functions
function playTimerSound() {
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play();
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00b894;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);