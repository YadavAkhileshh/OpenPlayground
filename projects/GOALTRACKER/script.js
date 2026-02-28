
        // Current year for footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Motivational quotes
        const motivationalQuotes = [
            { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
            { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
            { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
            { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
            { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
            { text: "The harder I work, the more luck I seem to have.", author: "Thomas Jefferson" }
        ];

        // Sample goals data
        let goals = [
            {
                id: 1,
                title: "Read 12 books this year",
                category: "education",
                timeframe: "yearly",
                target: 12,
                current: 5,
                description: "Read one book per month to expand knowledge",
                createdAt: new Date(2023, 0, 1).toISOString()
            },
            {
                id: 2,
                title: "Save $5,000 for emergency fund",
                category: "finance",
                timeframe: "yearly",
                target: 5000,
                current: 3200,
                description: "Monthly savings goal: $417",
                createdAt: new Date(2023, 0, 15).toISOString()
            },
            {
                id: 3,
                title: "Lose 5 kg this month",
                category: "fitness",
                timeframe: "monthly",
                target: 5,
                current: 2.5,
                description: "Exercise 5 times per week and track calories",
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                title: "Complete online course",
                category: "education",
                timeframe: "monthly",
                target: 100,
                current: 65,
                description: "Web Development Bootcamp on Udemy",
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                title: "Meditate 30 days straight",
                category: "health",
                timeframe: "monthly",
                target: 30,
                current: 15,
                description: "10 minutes of meditation every morning",
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                title: "Run 500 km this year",
                category: "fitness",
                timeframe: "yearly",
                target: 500,
                current: 210,
                description: "Approximately 10 km per week",
                createdAt: new Date(2023, 0, 1).toISOString()
            }
        ];

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Set random motivational quote
            setRandomQuote();
            
            // Load goals from localStorage if available
            const savedGoals = localStorage.getItem('goalTrackerGoals');
            if (savedGoals) {
                goals = JSON.parse(savedGoals);
            }
            
            // Initialize category selection
            initCategorySelection();
            
            // Initialize timeframe selection
            initTimeframeSelection();
            
            // Update target display when target changes
            document.getElementById('goalTarget').addEventListener('input', function() {
                document.getElementById('targetDisplay').textContent = this.value || 0;
            });
            
            // Set initial target display
            document.getElementById('targetDisplay').textContent = document.getElementById('goalTarget').value || 0;
            
            // Load the goals list
            renderGoals();
            updateDashboard();
            
            // Set up event listeners
            setupEventListeners();
            
            // Set up filter buttons
            setupFilterButtons();
        });

        // Set random motivational quote
        function setRandomQuote() {
            const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
            const quote = motivationalQuotes[randomIndex];
            document.getElementById('quoteText').textContent = quote.text;
            document.getElementById('quoteAuthor').textContent = quote.author;
        }

        // Initialize category selection in the form
        function initCategorySelection() {
            const categoryOptions = document.querySelectorAll('.category-option');
            const categoryInput = document.getElementById('goalCategory');
            
            categoryOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected class from all options
                    categoryOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    // Update the hidden input value
                    categoryInput.value = this.dataset.category;
                });
                
                // Set the first option as selected by default
                if (option.dataset.category === categoryInput.value) {
                    option.classList.add('selected');
                }
            });
        }

        // Initialize timeframe selection in the form
        function initTimeframeSelection() {
            const timeframeOptions = document.querySelectorAll('.timeframe-option');
            const timeframeInput = document.getElementById('goalTimeframe');
            
            timeframeOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected class from all options
                    timeframeOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    // Update the hidden input value
                    timeframeInput.value = this.dataset.timeframe;
                });
                
                // Set the first option as selected by default
                if (option.dataset.timeframe === timeframeInput.value) {
                    option.classList.add('selected');
                }
            });
        }

        // Set up event listeners
        function setupEventListeners() {
            // Form submission
            const form = document.getElementById('goalForm');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                addGoal();
            });
        }

        // Set up filter buttons
        function setupFilterButtons() {
            const filterButtons = document.querySelectorAll('.filter-btn');
            filterButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all filter buttons
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Get the filter value
                    const filter = this.dataset.filter;
                    
                    // Apply the filter
                    filterGoals(filter);
                });
            });
        }

        // Add a new goal
        function addGoal() {
            const title = document.getElementById('goalTitle').value;
            const category = document.getElementById('goalCategory').value;
            const timeframe = document.getElementById('goalTimeframe').value;
            const target = parseInt(document.getElementById('goalTarget').value);
            const current = parseInt(document.getElementById('goalCurrent').value) || 0;
            const description = document.getElementById('goalDescription').value;
            
            // Validate input
            if (current > target) {
                showNotification('Current progress cannot exceed target value!', 'error');
                return;
            }
            
            // Create new goal object
            const newGoal = {
                id: Date.now(), // Simple ID generation
                title: title,
                category: category,
                timeframe: timeframe,
                target: target,
                current: current,
                description: description,
                createdAt: new Date().toISOString()
            };
            
            // Add to goals array
            goals.push(newGoal);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Clear the form
            document.getElementById('goalForm').reset();
            document.getElementById('goalCurrent').value = 0;
            document.getElementById('targetDisplay').textContent = 0;
            
            // Reset category selection
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.category-option[data-category="health"]').classList.add('selected');
            document.getElementById('goalCategory').value = 'health';
            
            // Reset timeframe selection
            const timeframeOptions = document.querySelectorAll('.timeframe-option');
            timeframeOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.timeframe-option[data-timeframe="monthly"]').classList.add('selected');
            document.getElementById('goalTimeframe').value = 'monthly';
            
            // Update the goals list and dashboard
            renderGoals();
            updateDashboard();
            
            // Show success message
            showNotification('Goal added successfully!', 'success');
        }

        // Edit a goal
        function editGoal(id) {
            const goal = goals.find(g => g.id === id);
            if (!goal) return;
            
            // Populate the form with goal data
            document.getElementById('goalTitle').value = goal.title;
            document.getElementById('goalTarget').value = goal.target;
            document.getElementById('goalCurrent').value = goal.current;
            document.getElementById('goalDescription').value = goal.description;
            document.getElementById('targetDisplay').textContent = goal.target;
            
            // Set the category
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector(`.category-option[data-category="${goal.category}"]`).classList.add('selected');
            document.getElementById('goalCategory').value = goal.category;
            
            // Set the timeframe
            const timeframeOptions = document.querySelectorAll('.timeframe-option');
            timeframeOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector(`.timeframe-option[data-timeframe="${goal.timeframe}"]`).classList.add('selected');
            document.getElementById('goalTimeframe').value = goal.timeframe;
            
            // Change form button to "Update"
            const formButton = document.querySelector('.btn-add');
            formButton.innerHTML = '<i class="fas fa-save"></i> Update Goal';
            formButton.onclick = function(e) {
                e.preventDefault();
                updateGoal(id);
            };
            
            // Scroll to form
            document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth' });
            
            showNotification('Editing goal...', 'info');
        }

        // Update a goal
        function updateGoal(id) {
            const index = goals.findIndex(g => g.id === id);
            if (index === -1) return;
            
            // Get updated values
            const target = parseInt(document.getElementById('goalTarget').value);
            const current = parseInt(document.getElementById('goalCurrent').value) || 0;
            
            // Validate input
            if (current > target) {
                showNotification('Current progress cannot exceed target value!', 'error');
                return;
            }
            
            // Update goal data
            goals[index].title = document.getElementById('goalTitle').value;
            goals[index].category = document.getElementById('goalCategory').value;
            goals[index].timeframe = document.getElementById('goalTimeframe').value;
            goals[index].target = target;
            goals[index].current = current;
            goals[index].description = document.getElementById('goalDescription').value;
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Reset form
            document.getElementById('goalForm').reset();
            document.getElementById('goalCurrent').value = 0;
            document.getElementById('targetDisplay').textContent = 0;
            
            // Reset category selection
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.category-option[data-category="health"]').classList.add('selected');
            document.getElementById('goalCategory').value = 'health';
            
            // Reset timeframe selection
            const timeframeOptions = document.querySelectorAll('.timeframe-option');
            timeframeOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.timeframe-option[data-timeframe="monthly"]').classList.add('selected');
            document.getElementById('goalTimeframe').value = 'monthly';
            
            // Change form button back to "Add"
            const formButton = document.querySelector('.btn-add');
            formButton.innerHTML = '<i class="fas fa-calendar-plus"></i> Add Goal';
            formButton.onclick = function(e) {
                e.preventDefault();
                addGoal();
            };
            
            // Update the goals list and dashboard
            renderGoals();
            updateDashboard();
            
            showNotification('Goal updated successfully!', 'success');
        }

        // Delete a goal
        function deleteGoal(id) {
            if (!confirm('Are you sure you want to delete this goal?')) return;
            
            // Remove goal from array
            goals = goals.filter(g => g.id !== id);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update the goals list and dashboard
            renderGoals();
            updateDashboard();
            
            showNotification('Goal deleted', 'info');
        }

        // Update goal progress
        function updateProgress(id, amount) {
            const goal = goals.find(g => g.id === id);
            if (!goal) return;
            
            // Calculate new current value
            let newCurrent = goal.current + amount;
            
            // Ensure current value is between 0 and target
            newCurrent = Math.max(0, Math.min(newCurrent, goal.target));
            
            // Update goal
            goal.current = newCurrent;
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update the goals list and dashboard
            renderGoals();
            updateDashboard();
            
            // Check if goal is now completed
            if (newCurrent === goal.target && amount > 0) {
                showNotification(`Congratulations! You completed: ${goal.title}`, 'success');
                
                // Add achievement badge temporarily
                const goalCard = document.querySelector(`.goal-card[data-id="${id}"]`);
                if (goalCard) {
                    const badge = document.createElement('div');
                    badge.className = 'achievement-badge';
                    badge.innerHTML = '<i class="fas fa-trophy"></i>';
                    goalCard.appendChild(badge);
                    
                    // Remove badge after 5 seconds
                    setTimeout(() => {
                        if (badge.parentNode) {
                            badge.parentNode.removeChild(badge);
                        }
                    }, 5000);
                }
            }
        }

        // Save goals to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('goalTrackerGoals', JSON.stringify(goals));
        }

        // Render the goals list
        function renderGoals(filter = 'all') {
            const goalsList = document.getElementById('goalsList');
            const emptyState = document.getElementById('emptyGoals');
            
            // Clear the goals list
            goalsList.innerHTML = '';
            
            // Filter goals based on selected filter
            let filteredGoals = [...goals];
            
            if (filter === 'monthly') {
                filteredGoals = filteredGoals.filter(g => g.timeframe === 'monthly');
            } else if (filter === 'yearly') {
                filteredGoals = filteredGoals.filter(g => g.timeframe === 'yearly');
            } else if (filter === 'in-progress') {
                filteredGoals = filteredGoals.filter(g => g.current < g.target);
            } else if (filter === 'completed') {
                filteredGoals = filteredGoals.filter(g => g.current >= g.target);
            }
            
            // Sort goals by completion status (in progress first, then completed)
            filteredGoals.sort((a, b) => {
                const aCompleted = a.current >= a.target;
                const bCompleted = b.current >= b.target;
                
                if (aCompleted && !bCompleted) return 1;
                if (!aCompleted && bCompleted) return -1;
                
                // If same completion status, sort by creation date (newest first)
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
            
            // If no goals, show empty state
            if (filteredGoals.length === 0) {
                emptyState.style.display = 'block';
                goalsList.appendChild(emptyState);
                return;
            }
            
            // Hide empty state
            emptyState.style.display = 'none';
            
            // Create goal cards
            filteredGoals.forEach(goal => {
                const goalCard = document.createElement('div');
                goalCard.className = `goal-card ${goal.category}`;
                if (goal.current >= goal.target) {
                    goalCard.classList.add('completed-goal');
                }
                goalCard.dataset.id = goal.id;
                
                // Calculate progress percentage
                const progressPercentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
                
                // Get category name with first letter capitalized
                const categoryName = goal.category.charAt(0).toUpperCase() + goal.category.slice(1);
                
                // Format timeframe
                const timeframeName = goal.timeframe.charAt(0).toUpperCase() + goal.timeframe.slice(1);
                
                // Create the goal card HTML
                goalCard.innerHTML = `
                    <div class="goal-header">
                        <div class="goal-title">${goal.title}</div>
                        <div>
                            <span class="goal-category ${goal.category}">${categoryName}</span>
                            <span class="goal-timeframe">${timeframeName}</span>
                        </div>
                    </div>
                    
                    <div class="goal-description">${goal.description || 'No description provided.'}</div>
                    
                    <div class="progress-container">
                        <div class="progress-info">
                            <span class="progress-label">Progress</span>
                            <span class="progress-percentage">${progressPercentage}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-target">${goal.current} / ${goal.target}</div>
                    </div>
                    
                    <div class="goal-actions">
                        <div class="progress-controls">
                            <button class="progress-btn decrease" onclick="updateProgress(${goal.id}, -1)">
                                <i class="fas fa-minus"></i> Decrease
                            </button>
                            <button class="progress-btn increase" onclick="updateProgress(${goal.id}, 1)">
                                <i class="fas fa-plus"></i> Increase
                            </button>
                            <button class="progress-btn increase" onclick="updateProgress(${goal.id}, 5)">
                                <i class="fas fa-fast-forward"></i> +5
                            </button>
                        </div>
                        
                        <div class="goal-card-actions">
                            <button class="action-btn edit-btn" onclick="editGoal(${goal.id})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteGoal(${goal.id})">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
                
                goalsList.appendChild(goalCard);
            });
        }

        // Filter goals
        function filterGoals(filter) {
            renderGoals(filter);
        }

        // Update the dashboard statistics
        function updateDashboard() {
            // Calculate total goals
            document.getElementById('totalGoals').textContent = goals.length;
            
            // Calculate completed goals
            const completedGoals = goals.filter(g => g.current >= g.target).length;
            document.getElementById('completedGoals').textContent = completedGoals;
            
            // Calculate monthly progress average
            const monthlyGoals = goals.filter(g => g.timeframe === 'monthly');
            let monthlyAvg = 0;
            if (monthlyGoals.length > 0) {
                const totalMonthlyProgress = monthlyGoals.reduce((sum, goal) => {
                    return sum + Math.min(100, Math.round((goal.current / goal.target) * 100));
                }, 0);
                monthlyAvg = Math.round(totalMonthlyProgress / monthlyGoals.length);
            }
            document.getElementById('monthlyProgress').textContent = `${monthlyAvg}%`;
            
            // Calculate yearly progress average
            const yearlyGoals = goals.filter(g => g.timeframe === 'yearly');
            let yearlyAvg = 0;
            if (yearlyGoals.length > 0) {
                const totalYearlyProgress = yearlyGoals.reduce((sum, goal) => {
                    return sum + Math.min(100, Math.round((goal.current / goal.target) * 100));
                }, 0);
                yearlyAvg = Math.round(totalYearlyProgress / yearlyGoals.length);
            }
            document.getElementById('yearlyProgress').textContent = `${yearlyAvg}%`;
        }

        // Show notification
        function showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                animation: slideIn 0.3s ease-out;
            `;
            
            // Set background color based on type
            if (type === 'success') {
                notification.style.backgroundColor = 'var(--success)';
            } else if (type === 'error') {
                notification.style.backgroundColor = 'var(--danger)';
            } else {
                notification.style.backgroundColor = 'var(--primary)';
            }
            
            // Add to page
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 3000);
            
            // Add CSS for animations
            if (!document.querySelector('#notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
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
            }
        }
    