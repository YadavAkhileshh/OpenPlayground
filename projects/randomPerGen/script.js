        // DOM Elements
        const problemInput = document.getElementById('problemInput');
        const generateBtn = document.getElementById('generateBtn');
        const specificBtn = document.getElementById('specificBtn');
        const saveBtn = document.getElementById('saveBtn');
        const perspectiveDisplay = document.getElementById('perspectiveDisplay');
        const emptyState = document.getElementById('emptyState');
        const activePerspective = document.getElementById('activePerspective');
        const perspectiveIcon = document.getElementById('perspectiveIcon');
        const perspectiveRole = document.getElementById('perspectiveRole');
        const perspectiveDescription = document.getElementById('perspectiveDescription');
        const perspectiveAdvice = document.getElementById('perspectiveAdvice');
        const perspectivesGrid = document.getElementById('perspectivesGrid');
        const historyList = document.getElementById('historyList');
        const perspectiveCount = document.getElementById('perspectiveCount');
        const uniqueCount = document.getElementById('uniqueCount');
        const todayCount = document.getElementById('todayCount');

        // Perspective Database
        const perspectiveDatabase = [
            {
                role: "Child",
                icon: "fas fa-child",
                category: "Creative",
                description: "View the situation with curiosity, playfulness, and a sense of wonder.",
                advice: "What would make this fun? How would you explore this if you had no preconceived notions? What's the simplest solution?"
            },
            {
                role: "CEO",
                icon: "fas fa-user-tie",
                category: "Business",
                description: "View the situation as a strategic leader focused on efficiency, ROI, and long-term vision.",
                advice: "What would maximize return on investment? How can you delegate or automate? What systems would create sustainable results?"
            },
            {
                role: "Artist",
                icon: "fas fa-palette",
                category: "Creative",
                description: "View the situation with aesthetic sensitivity, creativity, and emotional expression.",
                advice: "How can you make this more beautiful or meaningful? What unconventional approach might work? What emotions does this evoke?"
            },
            {
                role: "Scientist",
                icon: "fas fa-flask",
                category: "Analytical",
                description: "View the situation with objectivity, curiosity, and a methodical approach.",
                advice: "What hypotheses can you test? What data would you need? How can you isolate variables to understand cause and effect?"
            },
            {
                role: "Athlete",
                icon: "fas fa-running",
                category: "Physical",
                description: "View the situation with discipline, focus on performance, and physical awareness.",
                advice: "What training would improve your skills? How can you build endurance? What's your game plan for success?"
            },
            {
                role: "Elder",
                icon: "fas fa-user-friends",
                category: "Wisdom",
                description: "View the situation with wisdom, patience, and long-term perspective.",
                advice: "What matters most in the long run? What lessons from the past apply here? How can you find peace with this situation?"
            },
            {
                role: "Detective",
                icon: "fas fa-search",
                category: "Analytical",
                description: "View the situation with attention to detail, skepticism, and investigative thinking.",
                advice: "What clues are you missing? Who has motives? What assumptions need to be questioned? What's not adding up?"
            },
            {
                role: "Chef",
                icon: "fas fa-utensils",
                category: "Creative",
                description: "View the situation with attention to ingredients, timing, and sensory experience.",
                advice: "What are the key ingredients? How can you adjust the recipe? What presentation would make this more appealing?"
            },
            {
                role: "Architect",
                icon: "fas fa-drafting-compass",
                category: "Strategic",
                description: "View the situation with attention to structure, foundation, and design.",
                advice: "What's the underlying structure? How can you build a solid foundation? What design principles apply here?"
            },
            {
                role: "Gardener",
                icon: "fas fa-seedling",
                category: "Nurturing",
                description: "View the situation with patience, attention to growth, and environmental factors.",
                advice: "What conditions are needed for growth? What needs pruning? How can you cultivate the right environment?"
            },
            {
                role: "Explorer",
                icon: "fas fa-mountain",
                category: "Adventure",
                description: "View the situation with curiosity, risk-taking, and a sense of adventure.",
                advice: "What uncharted territory can you explore? What risks are worth taking? What tools do you need for this journey?"
            },
            {
                role: "Mediator",
                icon: "fas fa-handshake",
                category: "Social",
                description: "View the situation with empathy, neutrality, and focus on resolution.",
                advice: "What are all sides of this issue? How can you find common ground? What compromise would satisfy everyone?"
            },
            {
                role: "Minimalist",
                icon: "fas fa-minus-circle",
                category: "Lifestyle",
                description: "View the situation with focus on simplicity, essentials, and eliminating waste.",
                advice: "What's truly essential here? What can you remove? How can you simplify this to its core?"
            },
            {
                role: "Futurist",
                icon: "fas fa-robot",
                category: "Visionary",
                description: "View the situation with focus on trends, technology, and future possibilities.",
                advice: "How will this look in 10 years? What emerging technologies could help? What future trends should you consider?"
            },
            {
                role: "Historian",
                icon: "fas fa-landmark",
                category: "Wisdom",
                description: "View the situation with understanding of context, patterns, and lessons from history.",
                advice: "What historical patterns apply here? How has this been solved in the past? What can we learn from history?"
            }
        ];

        // State variables
        let currentPerspective = null;
        let history = JSON.parse(localStorage.getItem('perspectiveHistory')) || [];
        let counters = JSON.parse(localStorage.getItem('perspectiveCounters')) || { total: 0, unique: 0, today: 0, lastDate: null };
        let savedPerspectives = JSON.parse(localStorage.getItem('savedPerspectives')) || [];

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            updateCounters();
            renderRecentPerspectives();
            renderHistory();
            
            // Generate initial perspective
            generateRandomPerspective();
            
            // Set up click handlers for specific perspective button
            specificBtn.addEventListener('click', showPerspectiveSelector);
            
            // Set up save button
            saveBtn.addEventListener('click', saveCurrentPerspective);
            
            // Set up keyboard shortcuts
            setupKeyboardShortcuts();
        });

        // Generate random perspective
        generateBtn.addEventListener('click', generateRandomPerspective);

        // Generate a random perspective
        function generateRandomPerspective() {
            // Hide empty state and show active perspective
            emptyState.style.display = 'none';
            activePerspective.style.display = 'block';
            
            // Get random perspective
            const randomIndex = Math.floor(Math.random() * perspectiveDatabase.length);
            currentPerspective = perspectiveDatabase[randomIndex];
            
            // Update display
            updatePerspectiveDisplay(currentPerspective);
            
            // Add to history
            addToHistory(currentPerspective);
            
            // Update counters
            updateCounters();
            
            // Update recent perspectives grid
            renderRecentPerspectives();
            
            // Add animation
            perspectiveDisplay.classList.add('pulse-animation');
            setTimeout(() => {
                perspectiveDisplay.classList.remove('pulse-animation');
            }, 1000);
        }

        // Update perspective display
        function updatePerspectiveDisplay(perspective) {
            perspectiveIcon.innerHTML = `<i class="${perspective.icon}"></i>`;
            perspectiveRole.textContent = perspective.role;
            perspectiveDescription.textContent = perspective.description;
            
            // Customize advice based on user input
            const problem = problemInput.value.trim();
            let advice = perspective.advice;
            
            if (problem) {
                advice = `<strong>Viewing "${problem.length > 50 ? problem.substring(0, 50) + '...' : problem}" as a ${perspective.role}:</strong> ${perspective.advice}`;
            }
            
            perspectiveAdvice.innerHTML = advice;
            
            // Add floating animation to icon
            perspectiveIcon.classList.add('floating-animation');
        }

        // Add perspective to history
        function addToHistory(perspective) {
            const historyItem = {
                role: perspective.role,
                category: perspective.category,
                timestamp: new Date().toISOString(),
                problem: problemInput.value.trim()
            };
            
            history.unshift(historyItem);
            
            // Keep only last 20 items
            if (history.length > 20) {
                history = history.slice(0, 20);
            }
            
            localStorage.setItem('perspectiveHistory', JSON.stringify(history));
            renderHistory();
        }

        // Update counters
        function updateCounters() {
            // Update total count
            counters.total++;
            
            // Update unique count (simplified - just increment for demo)
            counters.unique = perspectiveDatabase.length;
            
            // Update today's count
            const today = new Date().toDateString();
            if (counters.lastDate !== today) {
                counters.today = 1;
                counters.lastDate = today;
            } else {
                counters.today++;
            }
            
            // Save to localStorage
            localStorage.setItem('perspectiveCounters', JSON.stringify(counters));
            
            // Update display
            perspectiveCount.textContent = counters.total;
            uniqueCount.textContent = counters.unique;
            todayCount.textContent = counters.today;
        }

        // Render recent perspectives grid
        function renderRecentPerspectives() {
            perspectivesGrid.innerHTML = '';
            
            // Get 6 random perspectives for the grid
            const shuffled = [...perspectiveDatabase].sort(() => 0.5 - Math.random());
            const recent = shuffled.slice(0, 6);
            
            recent.forEach(perspective => {
                const card = document.createElement('div');
                card.className = 'perspective-card';
                if (currentPerspective && perspective.role === currentPerspective.role) {
                    card.classList.add('active');
                }
                
                card.innerHTML = `
                    <div class="card-icon">
                        <i class="${perspective.icon}"></i>
                    </div>
                    <div class="card-title">${perspective.role}</div>
                    <div class="card-category">${perspective.category}</div>
                `;
                
                card.addEventListener('click', () => {
                    // Set as current perspective
                    currentPerspective = perspective;
                    updatePerspectiveDisplay(perspective);
                    
                    // Add to history
                    addToHistory(perspective);
                    
                    // Update active card
                    document.querySelectorAll('.perspective-card').forEach(c => c.classList.remove('active'));
                    card.classList.add('active');
                    
                    // Hide empty state
                    emptyState.style.display = 'none';
                    activePerspective.style.display = 'block';
                });
                
                perspectivesGrid.appendChild(card);
            });
        }

        // Render history list
        function renderHistory() {
            if (history.length === 0) {
                historyList.innerHTML = '<div class="empty-state" style="padding:20px;"><p>Your perspective history will appear here</p></div>';
                return;
            }
            
            historyList.innerHTML = '';
            
            history.slice(0, 5).forEach(item => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const date = new Date(item.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                historyItem.innerHTML = `
                    <div>
                        <div class="history-role">${item.role}</div>
                        <div>${item.problem ? `"${item.problem.length > 30 ? item.problem.substring(0, 30) + '...' : item.problem}"` : 'No problem specified'}</div>
                    </div>
                    <div class="history-time">${timeStr}</div>
                `;
                
                historyList.appendChild(historyItem);
            });
        }

        // Show perspective selector
        function showPerspectiveSelector() {
            // Create modal-like selector
            const selectorHTML = `
                <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; justify-content:center; align-items:center; z-index:1000;">
                    <div style="background:white; padding:30px; border-radius:20px; max-width:800px; width:90%; max-height:80vh; overflow-y:auto;">
                        <h2 style="margin-bottom:20px; color:#5a5a5a;">Choose a Specific Perspective</h2>
                        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:15px;">
                            ${perspectiveDatabase.map(p => `
                                <div class="perspective-card" onclick="selectSpecificPerspective('${p.role}')" style="cursor:pointer;">
                                    <div class="card-icon"><i class="${p.icon}"></i></div>
                                    <div class="card-title">${p.role}</div>
                                    <div class="card-category">${p.category}</div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="closeSelector()" style="margin-top:20px; padding:10px 20px; background:#6a11cb; color:white; border:none; border-radius:10px; cursor:pointer;">Close</button>
                    </div>
                </div>
            `;
            
            const selector = document.createElement('div');
            selector.innerHTML = selectorHTML;
            selector.id = 'perspectiveSelector';
            document.body.appendChild(selector);
        }

        // Select specific perspective (called from selector)
        window.selectSpecificPerspective = function(role) {
            const perspective = perspectiveDatabase.find(p => p.role === role);
            if (perspective) {
                currentPerspective = perspective;
                updatePerspectiveDisplay(perspective);
                addToHistory(perspective);
                
                // Hide empty state
                emptyState.style.display = 'none';
                activePerspective.style.display = 'block';
                
                // Update recent perspectives grid
                renderRecentPerspectives();
            }
            
            closeSelector();
        };

        // Close selector
        window.closeSelector = function() {
            const selector = document.getElementById('perspectiveSelector');
            if (selector) {
                selector.remove();
            }
        };

        // Save current perspective
        function saveCurrentPerspective() {
            if (!currentPerspective) return;
            
            const saveItem = {
                ...currentPerspective,
                savedAt: new Date().toISOString(),
                problem: problemInput.value.trim()
            };
            
            savedPerspectives.unshift(saveItem);
            localStorage.setItem('savedPerspectives', JSON.stringify(savedPerspectives));
            
            // Show confirmation
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Perspective Saved!';
            saveBtn.style.background = 'linear-gradient(45deg, #00b09b, #96c93d)';
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.style.background = '';
            }, 2000);
        }

        // Change theme colors
        window.changeTheme = function(color1, color2) {
            document.body.style.background = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
            
            // Update primary button gradient
            const primaryBtns = document.querySelectorAll('.btn-primary');
            primaryBtns.forEach(btn => {
                btn.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
            });
        };

        // Set up keyboard shortcuts
        function setupKeyboardShortcuts() {
            document.addEventListener('keydown', function(e) {
                // Space to generate new perspective
                if (e.code === 'Space' && document.activeElement !== problemInput) {
                    e.preventDefault();
                    generateRandomPerspective();
                }
                
                // Enter to generate when problem input is focused
                if (e.code === 'Enter' && document.activeElement === problemInput && e.ctrlKey) {
                    e.preventDefault();
                    generateRandomPerspective();
                }
                
                // Escape to close selector if open
                if (e.code === 'Escape') {
                    closeSelector();
                }
            });
        }

        // Initialize with a random perspective
        generateRandomPerspective();