
        // DOM Elements
        const scenarioText = document.getElementById('scenarioText');
        const choicesContainer = document.getElementById('choicesContainer');
        const confirmChoiceBtn = document.getElementById('confirmChoiceBtn');
        const resetBtn = document.getElementById('resetBtn');
        const outcomeBox = document.getElementById('outcomeBox');
        const outcomeText = document.getElementById('outcomeText');
        const pathVisualization = document.getElementById('pathVisualization');
        const timeline = document.getElementById('timeline');
        const collapseEffect = document.getElementById('collapseEffect');
        const particlesContainer = document.getElementById('particlesContainer');
        
        // Stats elements
        const choicesCount = document.getElementById('choicesCount');
        const pathsExplored = document.getElementById('pathsExplored');
        const collapsePoints = document.getElementById('collapsePoints');
        const complexityScore = document.getElementById('complexityScore');
        const choicesBar = document.getElementById('choicesBar');
        const pathsBar = document.getElementById('pathsBar');
        const collapseBar = document.getElementById('collapseBar');
        const complexityBar = document.getElementById('complexityBar');
        
        // Simulation data
        let simulationState = {
            currentScenario: 0,
            selectedChoice: null,
            decisionHistory: [],
            pathNodes: [],
            pathConnections: [],
            stats: {
                choicesMade: 0,
                pathsExplored: 1,
                collapsePoints: 0,
                complexityScore: 1.0
            }
        };
        
        // Scenarios data
        const scenarios = [
            {
                id: 0,
                text: "You wake up on a beautiful morning with the whole day ahead of you. The sun is shining, birds are singing, and you feel a sense of possibility. What do you decide to do with your day?",
                choices: [
                    {
                        id: 0,
                        title: "Creative Exploration",
                        desc: "Spend the day painting, writing, or making music. Let your imagination run wild.",
                        icon: "fas fa-palette",
                        tag: "Artistic",
                        color: "#FF9BC6",
                        nextScenario: 1
                    },
                    {
                        id: 1,
                        title: "Nature Adventure",
                        desc: "Go for a hike, visit a botanical garden, or have a picnic in the park.",
                        icon: "fas fa-tree",
                        tag: "Outdoors",
                        color: "#66CCFF",
                        nextScenario: 2
                    },
                    {
                        id: 2,
                        title: "Learning Journey",
                        desc: "Visit a museum, read a book on a new topic, or take an online course.",
                        icon: "fas fa-graduation-cap",
                        tag: "Educational",
                        color: "#B399FF",
                        nextScenario: 3
                    },
                    {
                        id: 3,
                        title: "Social Connection",
                        desc: "Call a friend, visit family, or join a community event.",
                        icon: "fas fa-users",
                        tag: "Social",
                        color: "#FFCC66",
                        nextScenario: 4
                    }
                ]
            },
            {
                id: 1,
                text: "You've spent the morning creating art. As you step back to admire your work, you notice something unusual about it. The colors seem to shift when you look away. What do you do?",
                choices: [
                    {
                        id: 4,
                        title: "Study the Phenomenon",
                        desc: "Try to understand what's causing the color shifts. Experiment with different lighting.",
                        icon: "fas fa-search",
                        tag: "Analytical",
                        color: "#66CCFF",
                        nextScenario: 5
                    },
                    {
                        id: 5,
                        title: "Embrace the Magic",
                        desc: "Accept the mysterious quality and incorporate it into your creative process.",
                        icon: "fas fa-magic",
                        tag: "Mystical",
                        color: "#B399FF",
                        nextScenario: 6
                    },
                    {
                        id: 6,
                        title: "Share Your Discovery",
                        desc: "Show the artwork to a friend or post it online to get others' perspectives.",
                        icon: "fas fa-share-alt",
                        tag: "Collaborative",
                        color: "#FF9BC6",
                        nextScenario: 7
                    }
                ]
            },
            {
                id: 2,
                text: "During your hike, you discover a hidden path you've never noticed before. It leads into a dense part of the forest. What's your approach?",
                choices: [
                    {
                        id: 7,
                        title: "Follow the Path",
                        desc: "Curiosity gets the better of you. You decide to see where this new path leads.",
                        icon: "fas fa-hiking",
                        tag: "Adventurous",
                        color: "#66CCFF",
                        nextScenario: 8
                    },
                    {
                        id: 8,
                        title: "Document First",
                        desc: "Take photos, mark the location, and plan to return better prepared.",
                        icon: "fas fa-camera",
                        tag: "Cautious",
                        color: "#B399FF",
                        nextScenario: 9
                    },
                    {
                        id: 9,
                        title: "Ignore and Continue",
                        desc: "Stick to your original plan. The unknown path might be dangerous.",
                        icon: "fas fa-ban",
                        tag: "Practical",
                        color: "#FFCC66",
                        nextScenario: 10
                    }
                ]
            },
            {
                id: 3,
                text: "While researching at the museum, you stumble upon an exhibit that seems oddly out of place. It depicts technology far more advanced than anything you've seen. What's your reaction?",
                choices: [
                    {
                        id: 10,
                        title: "Investigate Thoroughly",
                        desc: "Spend hours studying the exhibit, taking notes, and asking staff questions.",
                        icon: "fas fa-microscope",
                        tag: "Inquisitive",
                        color: "#66CCFF",
                        nextScenario: 11
                    },
                    {
                        id: 11,
                        title: "Assume It's Art",
                        desc: "Decide it's an artistic representation of future technology, not real artifacts.",
                        icon: "fas fa-theater-masks",
                        tag: "Skeptical",
                        color: "#B399FF",
                        nextScenario: 12
                    },
                    {
                        id: 12,
                        title: "Report Your Find",
                        desc: "Contact museum management or a local university about the unusual exhibit.",
                        icon: "fas fa-flag",
                        tag: "Responsible",
                        color: "#FF9BC6",
                        nextScenario: 13
                    }
                ]
            },
            {
                id: 4,
                text: "Your friend suggests an impromptu road trip to a town you've never heard of. They seem unusually excited about it. How do you respond?",
                choices: [
                    {
                        id: 13,
                        title: "Embrace Spontaneity",
                        desc: "Pack a bag and join them without hesitation. Adventure awaits!",
                        icon: "fas fa-car",
                        tag: "Spontaneous",
                        color: "#66CCFF",
                        nextScenario: 14
                    },
                    {
                        id: 14,
                        title: "Ask for Details",
                        desc: "Want to know more about this town and why it's suddenly so important.",
                        icon: "fas fa-question-circle",
                        tag: "Inquisitive",
                        color: "#B399FF",
                        nextScenario: 15
                    },
                    {
                        id: 15,
                        title: "Suggest Alternative",
                        desc: "Propose a different activity that's more familiar and comfortable.",
                        icon: "fas fa-exchange-alt",
                        tag: "Cautious",
                        color: "#FFCC66",
                        nextScenario: 16
                    }
                ]
            }
        ];
        
        // Outcomes for different paths
        const outcomes = {
            5: {
                title: "Scientific Discovery",
                text: "Your investigation leads to a genuine scientific breakthrough! The color-shifting phenomenon turns out to be a previously unknown optical effect. Researchers from universities contact you, and your artwork becomes the subject of academic papers."
            },
            6: {
                title: "Magical Realism",
                text: "By embracing the magical quality of your art, you develop a unique style that gains a cult following. Your exhibitions sell out, and critics praise your work as 'transcending the boundaries of reality.'"
            },
            7: {
                title: "Viral Sensation",
                text: "When you share your artwork online, it goes viral overnight. You gain thousands of followers and receive offers for collaborations, merchandise, and gallery exhibitions around the world."
            },
            8: {
                title: "Hidden Wonder",
                text: "The path leads to a breathtaking waterfall hidden deep in the forest. You've discovered a natural wonder untouched by tourists. You return regularly, finding peace and inspiration in this secret place."
            },
            9: {
                title: "Conservation Hero",
                text: "Your documentation reveals that the area is home to an endangered species. Your careful approach leads to the area being designated as a protected conservation zone, saving the habitat."
            },
            10: {
                title: "Safe Return",
                text: "By sticking to the known path, you avoid potential dangers and have a pleasant, uneventful hike. You return home refreshed and content with your sensible decision."
            },
            11: {
                title: "Time Travel Clues",
                text: "Your investigation uncovers evidence that the exhibit contains genuine artifacts from the future. You become part of a secret research team studying temporal anomalies, changing your understanding of reality forever."
            },
            12: {
                title: "Artistic Revelation",
                text: "Your assumption proves correct—the exhibit is an elaborate art installation. The artist contacts you, impressed by your interpretation, and invites you to collaborate on their next project."
            },
            13: {
                title: "Academic Recognition",
                text: "The university confirms the artifacts are genuine but unexplained. Your discovery earns you an honorary research position and your name in academic journals as a 'contributor to unexplained phenomena studies.'"
            },
            14: {
                title: "Life-Changing Journey",
                text: "The road trip leads you to a charming town where you feel an inexplicable sense of belonging. Months later, you move there and open a small business that becomes the heart of the community."
            },
            15: {
                title: "Conspiracy Uncovered",
                text: "Your questions reveal your friend is part of a secret society preserving forgotten knowledge. You're invited to join and gain access to esoteric wisdom that transforms your worldview."
            },
            16: {
                title: "Comfortable Familiarity",
                text: "Your alternative plan leads to a delightful day with old friends. While not adventurous, it strengthens your relationships and leaves you with warm memories and renewed connections."
            }
        };
        
        // Initialize the simulation
        function init() {
            createParticles();
            renderScenario();
            createTimeline();
            updateStats();
            setupEventListeners();
        }
        
        // Create background particles
        function createParticles() {
            particlesContainer.innerHTML = '';
            const particleCount = 30;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Random position
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                particle.style.left = `${x}%`;
                particle.style.top = `${y}%`;
                
                // Random size
                const size = 5 + Math.random() * 15;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                // Random color
                const colors = ['#FFD6E7', '#E6E6FF', '#D6FFF6', '#FFF9D6', '#D6F0FF', '#F0D6FF'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                particle.style.backgroundColor = color;
                
                // Random animation
                const duration = 10 + Math.random() * 20;
                const delay = Math.random() * 5;
                particle.style.animation = `float ${duration}s ${delay}s infinite alternate`;
                
                // Create CSS for float animation
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes float {
                        0% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
                        100% { transform: translateY(-100px) rotate(180deg); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
                
                particlesContainer.appendChild(particle);
            }
        }
        
        // Setup event listeners
        function setupEventListeners() {
            confirmChoiceBtn.addEventListener('click', confirmChoice);
            resetBtn.addEventListener('click', resetSimulation);
        }
        
        // Render current scenario
        function renderScenario() {
            const scenario = scenarios[simulationState.currentScenario];
            
            // Update scenario text
            scenarioText.textContent = scenario.text;
            
            // Clear choices container
            choicesContainer.innerHTML = '';
            
            // Create choice cards
            scenario.choices.forEach(choice => {
                const choiceCard = document.createElement('div');
                choiceCard.className = 'choice-card';
                choiceCard.dataset.choiceId = choice.id;
                
                // Check if this choice was already selected
                const wasSelected = simulationState.decisionHistory.some(
                    decision => decision.choiceId === choice.id
                );
                
                if (wasSelected) {
                    choiceCard.classList.add('selected');
                }
                
                choiceCard.innerHTML = `
                    <div class="choice-icon">
                        <i class="${choice.icon}"></i>
                    </div>
                    <div class="choice-title">${choice.title}</div>
                    <div class="choice-desc">${choice.desc}</div>
                    <div class="choice-tag">${choice.tag}</div>
                `;
                
                // Add click event
                choiceCard.addEventListener('click', () => selectChoice(choice.id));
                
                // Add ripple effect on click
                choiceCard.addEventListener('click', function(e) {
                    createRippleEffect(e, choice.color);
                });
                
                choicesContainer.appendChild(choiceCard);
            });
            
            // Reset selected choice
            simulationState.selectedChoice = null;
            confirmChoiceBtn.disabled = true;
            
            // Hide outcome box
            outcomeBox.classList.remove('show');
            
            // Update visualization
            updatePathVisualization();
        }
        
        // Select a choice
        function selectChoice(choiceId) {
            // Remove selection from all choice cards
            document.querySelectorAll('.choice-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Add selection to clicked card
            const selectedCard = document.querySelector(`[data-choice-id="${choiceId}"]`);
            if (selectedCard) {
                selectedCard.classList.add('selected');
            }
            
            // Update selected choice
            simulationState.selectedChoice = choiceId;
            confirmChoiceBtn.disabled = false;
        }
        
        // Create ripple effect
        function createRippleEffect(event, color) {
            const card = event.currentTarget;
            const rect = card.getBoundingClientRect();
            
            const ripple = document.createElement('div');
            ripple.className = 'choice-ripple';
            
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            ripple.style.width = `${size}px`;
            ripple.style.height = `${size}px`;
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.style.backgroundColor = color + '80'; // Add transparency
            
            card.appendChild(ripple);
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
        
        // Confirm choice and advance simulation
        function confirmChoice() {
            if (simulationState.selectedChoice === null) return;
            
            // Find the selected choice
            const scenario = scenarios[simulationState.currentScenario];
            const choice = scenario.choices.find(c => c.id === simulationState.selectedChoice);
            
            if (!choice) return;
            
            // Add to decision history
            simulationState.decisionHistory.push({
                scenarioId: simulationState.currentScenario,
                choiceId: choice.id,
                choiceTitle: choice.title
            });
            
            // Update stats
            simulationState.stats.choicesMade++;
            
            // Check for collapse point (when revisiting a scenario)
            const isRevisit = simulationState.decisionHistory.some(
                (decision, index) => 
                    index < simulationState.decisionHistory.length - 1 && 
                    decision.scenarioId === simulationState.currentScenario
            );
            
            if (isRevisit) {
                simulationState.stats.collapsePoints++;
                createCollapseEffect();
            }
            
            // Move to next scenario
            const nextScenarioId = choice.nextScenario;
            
            // Check if next scenario exists
            if (nextScenarioId >= scenarios.length) {
                // End of simulation - show outcome
                showOutcome(choice.nextScenario);
                
                // Don't change scenario, just show outcome
                return;
            }
            
            // Update current scenario
            simulationState.currentScenario = nextScenarioId;
            
            // Update path exploration stats
            const isNewPath = !simulationState.decisionHistory.some(
                decision => decision.scenarioId === simulationState.currentScenario
            );
            
            if (isNewPath) {
                simulationState.stats.pathsExplored++;
            }
            
            // Update complexity score
            simulationState.stats.complexityScore = 
                (simulationState.stats.choicesMade * 0.5 + simulationState.stats.pathsExplored * 0.3 + simulationState.stats.collapsePoints * 0.2).toFixed(1);
            
            // Update UI
            updateStats();
            renderScenario();
            updateTimeline();
            
            // Show outcome if there is one for this path
            if (outcomes[choice.nextScenario]) {
                setTimeout(() => {
                    showOutcome(choice.nextScenario);
                }, 500);
            }
        }
        
        // Create collapse effect
        function createCollapseEffect() {
            collapseEffect.innerHTML = '';
            
            // Create multiple collapse circles
            for (let i = 0; i < 5; i++) {
                const circle = document.createElement('div');
                circle.className = 'collapse-circle';
                
                // Random position
                const x = Math.random() * 100;
                const y = Math.random() * 100;
                circle.style.left = `${x}%`;
                circle.style.top = `${y}%`;
                
                // Random size
                const size = 50 + Math.random() * 150;
                circle.style.width = `${size}px`;
                circle.style.height = `${size}px`;
                
                // Random color
                const colors = ['#FF9BC6', '#B399FF', '#66CCFF', '#FFCC66'];
                const color = colors[Math.floor(Math.random() * colors.length)];
                circle.style.background = `radial-gradient(circle, ${color}80 0%, ${color}00 70%)`;
                
                // Random animation delay
                const delay = Math.random() * 0.5;
                circle.style.animationDelay = `${delay}s`;
                
                collapseEffect.appendChild(circle);
            }
            
            // Show effect
            collapseEffect.style.opacity = '1';
            
            // Hide effect after animation
            setTimeout(() => {
                collapseEffect.style.opacity = '0';
                setTimeout(() => {
                    collapseEffect.innerHTML = '';
                }, 500);
            }, 1000);
        }
        
        // Show outcome for a path
        function showOutcome(outcomeId) {
            const outcome = outcomes[outcomeId];
            
            if (!outcome) return;
            
            outcomeText.innerHTML = `
                <strong>${outcome.title}</strong><br><br>
                ${outcome.text}
            `;
            
            outcomeBox.classList.add('show');
            
            // Scroll to outcome
            outcomeBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        
        // Update path visualization
        function updatePathVisualization() {
            // Clear visualization
            pathVisualization.innerHTML = '';
            
            const width = pathVisualization.clientWidth;
            const height = pathVisualization.clientHeight;
            
            // Create start node
            const startNode = document.createElement('div');
            startNode.className = 'path-node start';
            startNode.textContent = 'Start';
            startNode.style.left = `${width / 2 - 45}px`;
            startNode.style.top = '30px';
            pathVisualization.appendChild(startNode);
            
            // Calculate node positions
            const nodeCount = scenarios.length;
            const nodeSpacing = height / (nodeCount + 1);
            
            // Create scenario nodes
            scenarios.forEach((scenario, index) => {
                const node = document.createElement('div');
                node.className = 'path-node';
                
                // Add current class if this is the current scenario
                if (index === simulationState.currentScenario) {
                    node.classList.add('current');
                }
                
                // Node color based on position
                const colors = ['#FF9BC6', '#B399FF', '#66CCFF', '#FFCC66', '#66FFCC'];
                const colorIndex = index % colors.length;
                node.style.background = colors[colorIndex];
                
                node.textContent = `S${index + 1}`;
                node.title = scenario.text.substring(0, 50) + '...';
                
                // Position nodes in a branching pattern
                const xPos = width / 2 + (Math.sin(index * 1.5) * (width / 3));
                const yPos = 100 + (index * nodeSpacing);
                
                node.style.left = `${xPos}px`;
                node.style.top = `${yPos}px`;
                
                // Add click event to jump to scenario
                node.addEventListener('click', () => {
                    // Only allow jumping to scenarios that have been visited
                    const hasBeenVisited = simulationState.decisionHistory.some(
                        decision => decision.scenarioId === index
                    );
                    
                    if (hasBeenVisited || index === 0) {
                        simulationState.currentScenario = index;
                        renderScenario();
                        updateTimeline();
                    }
                });
                
                pathVisualization.appendChild(node);
                
                // Create connections
                if (index > 0) {
                    const prevNode = document.querySelectorAll('.path-node')[index]; // +1 because start node is first
                    const prevRect = prevNode.getBoundingClientRect();
                    const containerRect = pathVisualization.getBoundingClientRect();
                    
                    // Find which scenario leads to this one
                    let fromScenarioIndex = null;
                    for (let i = 0; i < scenarios.length; i++) {
                        if (scenarios[i].choices.some(choice => choice.nextScenario === index)) {
                            fromScenarioIndex = i;
                            break;
                        }
                    }
                    
                    if (fromScenarioIndex !== null) {
                        const fromNode = document.querySelectorAll('.path-node')[fromScenarioIndex + 1]; // +1 for start node
                        const fromRect = fromNode.getBoundingClientRect();
                        
                        // Calculate connection
                        const x1 = fromRect.left - containerRect.left + fromRect.width / 2;
                        const y1 = fromRect.top - containerRect.top + fromRect.height / 2;
                        const x2 = prevRect.left - containerRect.left + prevRect.width / 2;
                        const y2 = prevRect.top - containerRect.top + prevRect.height / 2;
                        
                        // Calculate distance and angle
                        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
                        
                        // Create connection element
                        const connection = document.createElement('div');
                        connection.className = 'path-connection';
                        
                        // Check if this connection is part of the current path
                        const isActive = simulationState.decisionHistory.some(
                            decision => decision.scenarioId === fromScenarioIndex
                        ) && simulationState.currentScenario === index;
                        
                        if (isActive) {
                            connection.classList.add('active');
                        }
                        
                        connection.style.width = `${distance}px`;
                        connection.style.transform = `rotate(${angle}deg)`;
                        connection.style.left = `${x1}px`;
                        connection.style.top = `${y1}px`;
                        
                        pathVisualization.appendChild(connection);
                    }
                }
            });
        }
        
        // Create timeline
        function createTimeline() {
            timeline.innerHTML = '';
            
            scenarios.forEach((scenario, index) => {
                const step = document.createElement('div');
                step.className = 'timeline-step';
                if (index === simulationState.currentScenario) {
                    step.classList.add('active');
                }
                
                step.innerHTML = `
                    <div class="timeline-dot">${index + 1}</div>
                    <div class="timeline-label">Step ${index + 1}</div>
                `;
                
                // Add click event to jump to scenario
                step.addEventListener('click', () => {
                    // Only allow jumping to scenarios that have been visited
                    const hasBeenVisited = simulationState.decisionHistory.some(
                        decision => decision.scenarioId === index
                    );
                    
                    if (hasBeenVisited || index === 0) {
                        simulationState.currentScenario = index;
                        renderScenario();
                        updateTimeline();
                    }
                });
                
                timeline.appendChild(step);
            });
        }
        
        // Update timeline
        function updateTimeline() {
            document.querySelectorAll('.timeline-step').forEach((step, index) => {
                step.classList.remove('active');
                if (index === simulationState.currentScenario) {
                    step.classList.add('active');
                }
            });
        }
        
        // Update statistics
        function updateStats() {
            const stats = simulationState.stats;
            
            choicesCount.textContent = stats.choicesMade;
            pathsExplored.textContent = stats.pathsExplored;
            collapsePoints.textContent = stats.collapsePoints;
            complexityScore.textContent = stats.complexityScore;
            
            // Update bars
            choicesBar.style.width = `${Math.min(stats.choicesMade * 20, 100)}%`;
            pathsBar.style.width = `${Math.min(stats.pathsExplored * 25, 100)}%`;
            collapseBar.style.width = `${Math.min(stats.collapsePoints * 33, 100)}%`;
            complexityBar.style.width = `${Math.min(parseFloat(stats.complexityScore) * 20, 100)}%`;
        }
        
        // Reset simulation
        function resetSimulation() {
            simulationState = {
                currentScenario: 0,
                selectedChoice: null,
                decisionHistory: [],
                pathNodes: [],
                pathConnections: [],
                stats: {
                    choicesMade: 0,
                    pathsExplored: 1,
                    collapsePoints: 0,
                    complexityScore: 1.0
                }
            };
            
            renderScenario();
            updateTimeline();
            updateStats();
            
            // Hide outcome box
            outcomeBox.classList.remove('show');
        }
        
        // Initialize the simulation
        init();
        
        // Handle window resize
        window.addEventListener('resize', updatePathVisualization);
    