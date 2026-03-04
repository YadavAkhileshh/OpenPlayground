document.addEventListener('DOMContentLoaded', function() {
    // App state
    let habits = JSON.parse(localStorage.getItem('habits')) || [];
    let selectedHabitId = null;
    let isDragging = false;
    let dragHabit = null;
    let offsetX = 0, offsetY = 0;
    
    // DOM Elements
    const gravityCanvas = document.getElementById('gravity-canvas');
    const noHabitsMessage = document.getElementById('no-habits-message');
    const habitNameInput = document.getElementById('habit-name');
    const habitColorInput = document.getElementById('habit-color');
    const addHabitButton = document.getElementById('add-habit');
    const progressFill = document.getElementById('progress-fill');
    const completedCount = document.getElementById('completed-count');
    const totalHabits = document.getElementById('total-habits');
    const streakList = document.getElementById('streak-list');
    const resetViewButton = document.getElementById('reset-view');
    const simulateDayButton = document.getElementById('simulate-day');
    const habitModal = document.getElementById('habit-modal');
    const closeModalButton = document.getElementById('close-modal');
    const modalHabitName = document.getElementById('modal-habit-name');
    const streakCalendar = document.getElementById('streak-calendar');
    const currentStreakEl = document.getElementById('current-streak');
    const longestStreakEl = document.getElementById('longest-streak');
    const completionRateEl = document.getElementById('completion-rate');
    const markCompletedButton = document.getElementById('mark-completed');
    const deleteHabitButton = document.getElementById('delete-habit');
    
    // Initialize the app
    init();
    
    function init() {
        updateUI();
        renderHabits();
        setupEventListeners();
        startAnimationLoop();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add habit button
        addHabitButton.addEventListener('click', addHabit);
        habitNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addHabit();
        });
        
        // Canvas buttons
        resetViewButton.addEventListener('click', resetHabitPositions);
        simulateDayButton.addEventListener('click', simulateDay);
        
        // Modal buttons
        closeModalButton.addEventListener('click', () => {
            habitModal.style.display = 'none';
        });
        
        markCompletedButton.addEventListener('click', markHabitCompleted);
        deleteHabitButton.addEventListener('click', deleteSelectedHabit);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === habitModal) {
                habitModal.style.display = 'none';
            }
        });
    }
    
    // Add a new habit
    function addHabit() {
        const name = habitNameInput.value.trim();
        if (!name) {
            alert('Please enter a habit name');
            return;
        }
        
        const newHabit = {
            id: Date.now().toString(),
            name: name,
            color: habitColorInput.value,
            streak: 0,
            longestStreak: 0,
            completedToday: false,
            position: {
                x: Math.random() * (gravityCanvas.offsetWidth - 100) + 50,
                y: Math.random() * (gravityCanvas.offsetHeight - 100) + 50
            },
            velocity: { x: 0, y: 0 },
            history: []
        };
        
        habits.push(newHabit);
        saveHabits();
        renderHabits();
        updateUI();
        
        // Clear input
        habitNameInput.value = '';
        habitNameInput.focus();
    }
    
    // Render all habits on the canvas
    function renderHabits() {
        // Clear canvas
        gravityCanvas.innerHTML = '';
        
        // Show or hide no habits message
        if (habits.length === 0) {
            noHabitsMessage.style.display = 'flex';
            return;
        } else {
            noHabitsMessage.style.display = 'none';
        }
        
        // Create habit elements
        habits.forEach(habit => {
            const habitElement = document.createElement('div');
            habitElement.className = 'habit-node';
            habitElement.id = `habit-${habit.id}`;
            habitElement.style.backgroundColor = habit.color;
            habitElement.style.left = `${habit.position.x}px`;
            habitElement.style.top = `${habit.position.y}px`;
            
            // Determine icon based on streak
            let iconClass = 'fas fa-seedling'; // Default for new habits
            if (habit.streak >= 30) iconClass = 'fas fa-fire';
            else if (habit.streak >= 14) iconClass = 'fas fa-star';
            else if (habit.streak >= 7) iconClass = 'fas fa-rocket';
            else if (habit.streak >= 3) iconClass = 'fas fa-leaf';
            
            habitElement.innerHTML = `
                <i class="${iconClass}"></i>
                <div class="habit-name">${habit.name}</div>
                <div class="habit-streak">${habit.streak} day${habit.streak !== 1 ? 's' : ''}</div>
            `;
            
            // Add event listeners
            habitElement.addEventListener('click', (e) => {
                if (!isDragging) {
                    // If not dragging, mark as completed or show details
                    if (e.detail === 1) {
                        // Single click - mark as completed
                        toggleHabitCompleted(habit.id);
                    } else if (e.detail === 2) {
                        // Double click - show details
                        showHabitDetails(habit.id);
                    }
                }
            });
            
            // Drag and drop functionality
            habitElement.addEventListener('mousedown', startDrag);
            
            gravityCanvas.appendChild(habitElement);
        });
        
        // Draw force lines between habits
        drawForceLines();
    }
    
    // Draw attraction/repulsion lines between habits
    function drawForceLines() {
        // Remove existing force lines
        document.querySelectorAll('.force-line').forEach(line => line.remove());
        
        // Draw lines between habits
        for (let i = 0; i < habits.length; i++) {
            for (let j = i + 1; j < habits.length; j++) {
                const habitA = habits[i];
                const habitB = habits[j];
                
                // Calculate distance
                const dx = habitA.position.x - habitB.position.x;
                const dy = habitA.position.y - habitB.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Only draw lines for nearby habits
                if (distance < 300) {
                    // Determine if habits attract or repel based on streak consistency
                    const streakDiff = Math.abs(habitA.streak - habitB.streak);
                    const isAttracting = streakDiff <= 3; // Similar streaks attract
                    
                    // Create line element
                    const line = document.createElement('div');
                    line.className = `force-line ${isAttracting ? 'attraction-line' : 'repulsion-line'}`;
                    
                    // Calculate line properties
                    const angle = Math.atan2(dy, dx);
                    const width = Math.max(50, 300 - distance);
                    const opacity = Math.max(0.1, 0.6 * (1 - distance/300));
                    
                    // Position and style the line
                    line.style.width = `${width}px`;
                    line.style.left = `${habitA.position.x + 40}px`;
                    line.style.top = `${habitA.position.y + 40}px`;
                    line.style.transform = `rotate(${angle}rad)`;
                    line.style.opacity = opacity.toString();
                    
                    gravityCanvas.appendChild(line);
                }
            }
        }
    }
    
    // Start dragging a habit
    function startDrag(e) {
        const habitId = this.id.replace('habit-', '');
        dragHabit = habits.find(h => h.id === habitId);
        
        if (!dragHabit) return;
        
        isDragging = true;
        dragHabit.isDragging = true;
        
        // Calculate offset
        const rect = this.getBoundingClientRect();
        const canvasRect = gravityCanvas.getBoundingClientRect();
        offsetX = e.clientX - rect.left + canvasRect.left;
        offsetY = e.clientY - rect.top + canvasRect.top;
        
        // Add dragging class
        this.classList.add('dragging');
        
        // Add event listeners for dragging
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
        
        e.preventDefault();
    }
    
    // Drag a habit
    function drag(e) {
        if (!isDragging || !dragHabit) return;
        
        // Update habit position
        const canvasRect = gravityCanvas.getBoundingClientRect();
        dragHabit.position.x = e.clientX - canvasRect.left - offsetX + 40;
        dragHabit.position.y = e.clientY - canvasRect.top - offsetY + 40;
        
        // Keep within bounds
        dragHabit.position.x = Math.max(0, Math.min(gravityCanvas.offsetWidth - 80, dragHabit.position.x));
        dragHabit.position.y = Math.max(0, Math.min(gravityCanvas.offsetHeight - 80, dragHabit.position.y));
        
        // Update visual position
        const habitElement = document.getElementById(`habit-${dragHabit.id}`);
        if (habitElement) {
            habitElement.style.left = `${dragHabit.position.x}px`;
            habitElement.style.top = `${dragHabit.position.y}px`;
        }
        
        // Redraw force lines
        drawForceLines();
    }
    
    // Stop dragging a habit
    function stopDrag() {
        if (!dragHabit) return;
        
        isDragging = false;
        dragHabit.isDragging = false;
        
        // Remove dragging class
        const habitElement = document.getElementById(`habit-${dragHabit.id}`);
        if (habitElement) {
            habitElement.classList.remove('dragging');
        }
        
        // Remove event listeners
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);
        
        // Save updated position
        saveHabits();
    }
    
    // Toggle habit completion for today
    function toggleHabitCompleted(habitId) {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;
        
        // Toggle completion
        habit.completedToday = !habit.completedToday;
        
        // Update streak
        if (habit.completedToday) {
            habit.streak++;
            habit.history.push({
                date: new Date().toISOString().split('T')[0],
                completed: true
            });
            
            // Update longest streak if needed
            if (habit.streak > habit.longestStreak) {
                habit.longestStreak = habit.streak;
            }
        } else {
            habit.streak = Math.max(0, habit.streak - 1);
            habit.history.push({
                date: new Date().toISOString().split('T')[0],
                completed: false
            });
        }
        
        saveHabits();
        updateUI();
        renderHabits();
    }
    
    // Show habit details in modal
    function showHabitDetails(habitId) {
        const habit = habits.find(h => h.id === habitId);
        if (!habit) return;
        
        selectedHabitId = habitId;
        
        // Update modal content
        modalHabitName.textContent = habit.name;
        currentStreakEl.textContent = habit.streak;
        longestStreakEl.textContent = habit.longestStreak;
        
        // Calculate completion rate
        const totalDays = Math.max(30, habit.history.length);
        const completedDays = habit.history.filter(entry => entry.completed).length;
        const rate = Math.round((completedDays / totalDays) * 100);
        completionRateEl.textContent = `${rate}%`;
        
        // Generate calendar
        generateCalendar(habit);
        
        // Show modal
        habitModal.style.display = 'flex';
    }
    
    // Generate calendar view for habit history
    function generateCalendar(habit) {
        streakCalendar.innerHTML = '';
        
        // Create last 30 days
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            // Check if habit was completed on this day
            const historyEntry = habit.history.find(entry => entry.date === dateString);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (historyEntry) {
                dayElement.classList.add(historyEntry.completed ? 'completed' : 'missed');
                dayElement.title = `${dateString}: ${historyEntry.completed ? 'Completed' : 'Missed'}`;
            } else {
                dayElement.title = `${dateString}: No data`;
            }
            
            dayElement.textContent = date.getDate();
            streakCalendar.appendChild(dayElement);
        }
    }
    
    // Mark selected habit as completed
    function markHabitCompleted() {
        if (!selectedHabitId) return;
        toggleHabitCompleted(selectedHabitId);
        showHabitDetails(selectedHabitId); // Refresh modal
    }
    
    // Delete selected habit
    function deleteSelectedHabit() {
        if (!selectedHabitId) return;
        
        if (confirm('Are you sure you want to delete this habit?')) {
            habits = habits.filter(h => h.id !== selectedHabitId);
            saveHabits();
            updateUI();
            renderHabits();
            habitModal.style.display = 'none';
        }
    }
    
    // Update UI stats
    function updateUI() {
        // Update progress
        const completed = habits.filter(h => h.completedToday).length;
        const total = habits.length;
        
        completedCount.textContent = completed;
        totalHabits.textContent = total;
        
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
        progressFill.style.width = `${progress}%`;
        progressFill.textContent = `${progress}%`;
        
        // Update streak list
        streakList.innerHTML = '';
        
        if (habits.length === 0) {
            streakList.innerHTML = '<li>No habits yet</li>';
            return;
        }
        
        // Sort habits by streak
        const sortedHabits = [...habits].sort((a, b) => b.streak - a.streak).slice(0, 5);
        
        sortedHabits.forEach(habit => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${habit.name}</span>
                <span>${habit.streak} days</span>
            `;
            streakList.appendChild(li);
        });
    }
    
    // Reset habit positions to random positions
    function resetHabitPositions() {
        habits.forEach(habit => {
            habit.position = {
                x: Math.random() * (gravityCanvas.offsetWidth - 100) + 50,
                y: Math.random() * (gravityCanvas.offsetHeight - 100) + 50
            };
            habit.velocity = { x: 0, y: 0 };
        });
        
        saveHabits();
        renderHabits();
    }
    
    // Simulate a day passing
    function simulateDay() {
        // Reset today's completions
        habits.forEach(habit => {
            habit.completedToday = false;
            
            // Randomly complete some habits (simulating user behavior)
            if (Math.random() > 0.5) {
                toggleHabitCompleted(habit.id);
            }
        });
        
        updateUI();
        renderHabits();
    }
    
    // Physics simulation for habit movement
    function startAnimationLoop() {
        function animate() {
            // Apply gravity forces between habits
            for (let i = 0; i < habits.length; i++) {
                const habitA = habits[i];
                if (habitA.isDragging) continue; // Skip if being dragged
                
                // Reset acceleration
                let accelerationX = 0;
                let accelerationY = 0;
                
                for (let j = 0; j < habits.length; j++) {
                    if (i === j) continue;
                    
                    const habitB = habits[j];
                    const dx = habitB.position.x - habitA.position.x;
                    const dy = habitB.position.y - habitA.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Avoid division by zero
                    if (distance < 5) continue;
                    
                    // Determine if habits attract or repel based on streak similarity
                    const streakDiff = Math.abs(habitA.streak - habitB.streak);
                    const isAttracting = streakDiff <= 3; // Similar streaks attract
                    
                    // Calculate force (inverse square law)
                    const force = isAttracting ? 0.5 : -0.3;
                    const strength = force / (distance * 0.01);
                    
                    // Apply force
                    accelerationX += (dx / distance) * strength;
                    accelerationY += (dy / distance) * strength;
                }
                
                // Apply velocity with damping
                habitA.velocity.x = habitA.velocity.x * 0.95 + accelerationX * 0.1;
                habitA.velocity.y = habitA.velocity.y * 0.95 + accelerationY * 0.1;
                
                // Update position
                habitA.position.x += habitA.velocity.x;
                habitA.position.y += habitA.velocity.y;
                
                // Keep within bounds
                habitA.position.x = Math.max(0, Math.min(gravityCanvas.offsetWidth - 80, habitA.position.x));
                habitA.position.y = Math.max(0, Math.min(gravityCanvas.offsetHeight - 80, habitA.position.y));
                
                // Bounce off walls
                if (habitA.position.x <= 0 || habitA.position.x >= gravityCanvas.offsetWidth - 80) {
                    habitA.velocity.x *= -0.5;
                }
                if (habitA.position.y <= 0 || habitA.position.y >= gravityCanvas.offsetHeight - 80) {
                    habitA.velocity.y *= -0.5;
                }
            }
            
            // Update visual positions
            habits.forEach(habit => {
                if (habit.isDragging) return; // Skip if being dragged
                
                const habitElement = document.getElementById(`habit-${habit.id}`);
                if (habitElement) {
                    habitElement.style.left = `${habit.position.x}px`;
                    habitElement.style.top = `${habit.position.y}px`;
                }
            });
            
            // Redraw force lines
            drawForceLines();
            
            // Continue animation loop
            requestAnimationFrame(animate);
        }
        
        // Start animation
        animate();
    }
    
    // Save habits to localStorage
    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }
});