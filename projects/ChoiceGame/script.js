        // Game state
        const gameState = {
            currentScenario: 0,
            logicScore: 0,
            emotionScore: 0,
            choices: [],
            scenarios: [
                {
                    id: 1,
                    description: "Your close friend is starting a new business and asks you to invest $5,000. They have no business experience but are passionate about the idea. You have the money saved, but it's a significant portion of your emergency fund.",
                    logicChoice: {
                        text: "Analyze the business plan, ask for market research, and suggest they gain experience first. Offer to help in other ways without financial investment.",
                        consequences: [
                            { type: "logic", value: "+20", label: "Financial Security" },
                            { type: "logic", value: "+15", label: "Risk Management" },
                            { type: "emotion", value: "-10", label: "Friend's Disappointment" }
                        ]
                    },
                    emotionChoice: {
                        text: "Invest the money to show support for your friend's dream. Trust in their passion and determination to make it work, despite the risks.",
                        consequences: [
                            { type: "emotion", value: "+25", label: "Friendship Strengthened" },
                            { type: "emotion", value: "+15", label: "Supporting Dreams" },
                            { type: "logic", value: "-20", label: "Financial Risk" }
                        ]
                    }
                },
                {
                    id: 2,
                    description: "You've been offered a promotion that requires relocating to another city. It's a great career move with a 30% salary increase, but you'd have to leave your aging parents and close-knit friend group behind.",
                    logicChoice: {
                        text: "Accept the promotion. The career advancement and financial benefits are too significant to pass up. You can visit family and friends regularly.",
                        consequences: [
                            { type: "logic", value: "+25", label: "Career Advancement" },
                            { type: "logic", value: "+20", label: "Financial Growth" },
                            { type: "emotion", value: "-15", label: "Distance from Loved Ones" }
                        ]
                    },
                    emotionChoice: {
                        text: "Decline the promotion. Family and community connections are more important than career or money. Happiness comes from relationships, not just success.",
                        consequences: [
                            { type: "emotion", value: "+25", label: "Family Connection" },
                            { type: "emotion", value: "+15", label: "Community Ties" },
                            { type: "logic", value: "-20", label: "Missed Opportunity" }
                        ]
                    }
                },
                {
                    id: 3,
                    description: "You discover a coworker is taking credit for your work on an important project. Confronting them could create workplace tension, but staying silent means you won't get proper recognition.",
                    logicChoice: {
                        text: "Gather evidence of your contributions and schedule a professional meeting with your supervisor to clarify the situation without direct confrontation.",
                        consequences: [
                            { type: "logic", value: "+20", label: "Professional Integrity" },
                            { type: "logic", value: "+15", label: "Credit Where Due" },
                            { type: "emotion", value: "-10", label: "Workplace Tension" }
                        ]
                    },
                    emotionChoice: {
                        text: "Confront your coworker directly but compassionately. Express how their actions made you feel and hope for an honest resolution that preserves your relationship.",
                        consequences: [
                            { type: "emotion", value: "+20", label: "Emotional Honesty" },
                            { type: "emotion", value: "+15", label: "Direct Communication" },
                            { type: "logic", value: "-15", label: "Professional Risk" }
                        ]
                    }
                },
                {
                    id: 4,
                    description: "You find a wallet with $500 cash and identification. Returning it would be the right thing to do, but you're struggling financially and the money would solve some immediate problems.",
                    logicChoice: {
                        text: "Return the wallet with all contents intact. The legal and ethical implications of keeping it aren't worth the temporary financial relief.",
                        consequences: [
                            { type: "logic", value: "+25", label: "Ethical Integrity" },
                            { type: "logic", value: "+15", label: "Legal Safety" },
                            { type: "emotion", value: "+10", label: "Good Karma" }
                        ]
                    },
                    emotionChoice: {
                        text: "Keep the cash but return the wallet with identification. You rationalize that the owner probably has insurance and you need the money more right now.",
                        consequences: [
                            { type: "emotion", value: "-20", label: "Guilt" },
                            { type: "logic", value: "+15", label: "Financial Relief" },
                            { type: "emotion", value: "-15", label: "Self-Image" }
                        ]
                    }
                },
                {
                    id: 5,
                    description: "Your partner wants to adopt a dog, but you're concerned about the time, cost, and responsibility. You love animals but worry about the long-term commitment.",
                    logicChoice: {
                        text: "Create a detailed analysis of costs, time requirements, and lifestyle changes. Suggest waiting until you're more financially stable and have a suitable living situation.",
                        consequences: [
                            { type: "logic", value: "+20", label: "Practical Planning" },
                            { type: "logic", value: "+15", label: "Financial Responsibility" },
                            { type: "emotion", value: "-15", label: "Partner's Disappointment" }
                        ]
                    },
                    emotionChoice: {
                        text: "Say yes to adoption. The joy and companionship a dog would bring to your lives is worth the sacrifices. You'll figure out the logistics together.",
                        consequences: [
                            { type: "emotion", value: "+25", label: "Shared Joy" },
                            { type: "emotion", value: "+15", label: "Companionship" },
                            { type: "logic", value: "-20", label: "Added Responsibility" }
                        ]
                    }
                }
            ],
            gameCompleted: false
        };

        // DOM Elements
        const logicScoreEl = document.getElementById('logic-score');
        const emotionScoreEl = document.getElementById('emotion-score');
        const balanceIndicatorEl = document.getElementById('balance-indicator');
        const decisionTipEl = document.getElementById('decision-tip');
        const scenarioNumberEl = document.getElementById('scenario-number');
        const scenarioDescriptionEl = document.getElementById('scenario-description');
        const logicChoiceEl = document.getElementById('logic-choice');
        const emotionChoiceEl = document.getElementById('emotion-choice');
        const consequencesContainer = document.getElementById('consequences-container');
        const consequencesGrid = document.getElementById('consequences-grid');
        const backButton = document.getElementById('back-button');
        const nextButton = document.getElementById('next-button');
        const restartButton = document.getElementById('restart-button');
        const resultsContainer = document.getElementById('results-container');
        const personalityTypeEl = document.getElementById('personality-type');
        const typeTitleEl = document.getElementById('type-title');
        const typeDescriptionEl = document.getElementById('type-description');
        const finalLogicEl = document.getElementById('final-logic');
        const finalEmotionEl = document.getElementById('final-emotion');
        const finalBalanceEl = document.getElementById('final-balance');

        // Initialize the game
        function initGame() {
            updateScores();
            loadScenario(0);
            setupEventListeners();
            updateDecisionTip();
        }

        // Update score displays
        function updateScores() {
            logicScoreEl.textContent = gameState.logicScore;
            emotionScoreEl.textContent = gameState.emotionScore;
            
            // Update balance indicator
            const total = gameState.logicScore + gameState.emotionScore;
            let balancePercentage = 50; // Default middle
            
            if (total > 0) {
                balancePercentage = (gameState.logicScore / total) * 100;
            }
            
            // Clamp between 5% and 95% so indicator doesn't go off edges
            balancePercentage = Math.max(5, Math.min(95, balancePercentage));
            balanceIndicatorEl.style.left = `${balancePercentage}%`;
        }

        // Update decision tip based on current balance
        function updateDecisionTip() {
            const total = gameState.logicScore + gameState.emotionScore;
            let tip = "";
            
            if (total === 0) {
                tip = "The best decisions often balance both logic and emotion. Consider facts AND feelings!";
            } else {
                const logicPercent = (gameState.logicScore / total) * 100;
                
                if (logicPercent > 70) {
                    tip = "You're leaning heavily on logic. Remember that emotions provide valuable information about values and relationships.";
                } else if (logicPercent < 30) {
                    tip = "You're following your heart. Consider adding logical analysis to ensure practical outcomes.";
                } else {
                    tip = "Great balance! You're considering both logic and emotion, which leads to well-rounded decisions.";
                }
            }
            
            decisionTipEl.textContent = tip;
        }

        // Load a scenario
        function loadScenario(index) {
            if (index < 0 || index >= gameState.scenarios.length) return;
            
            gameState.currentScenario = index;
            const scenario = gameState.scenarios[index];
            
            // Update scenario display
            scenarioNumberEl.textContent = `Scenario ${index + 1} of ${gameState.scenarios.length}`;
            scenarioDescriptionEl.textContent = scenario.description;
            
            // Update choice descriptions
            logicChoiceEl.querySelector('.choice-description').textContent = scenario.logicChoice.text;
            emotionChoiceEl.querySelector('.choice-description').textContent = scenario.emotionChoice.text;
            
            // Hide consequences
            consequencesContainer.style.display = 'none';
            
            // Update button states
            backButton.disabled = (index === 0);
            
            if (index === gameState.scenarios.length - 1) {
                nextButton.innerHTML = '<i class="fas fa-flag-checkered"></i> Finish Game';
            } else {
                nextButton.innerHTML = '<i class="fas fa-arrow-right"></i> Next Scenario';
            }
            
            // Reset choice selection visual
            resetChoiceSelection();
        }

        // Reset choice selection visual
        function resetChoiceSelection() {
            logicChoiceEl.style.border = '3px solid transparent';
            emotionChoiceEl.style.border = '3px solid transparent';
        }

        // Show consequences for a choice
        function showConsequences(choiceType) {
            const scenario = gameState.scenarios[gameState.currentScenario];
            const choice = choiceType === 'logic' ? scenario.logicChoice : scenario.emotionChoice;
            
            // Highlight selected choice
            resetChoiceSelection();
            if (choiceType === 'logic') {
                logicChoiceEl.style.border = `3px solid ${getComputedStyle(document.documentElement).getPropertyValue('--logic-color')}`;
            } else {
                emotionChoiceEl.style.border = `3px solid ${getComputedStyle(document.documentElement).getPropertyValue('--emotion-color')}`;
            }
            
            // Clear previous consequences
            consequencesGrid.innerHTML = '';
            
            // Add new consequences
            choice.consequences.forEach(consequence => {
                const consequenceEl = document.createElement('div');
                consequenceEl.className = `consequence ${consequence.type}`;
                
                const valueClass = consequence.value.startsWith('+') ? 'positive' : 'negative';
                const valueColor = consequence.value.startsWith('+') ? '' : 'color: #ff6b6b;';
                
                consequenceEl.innerHTML = `
                    <div class="consequence-value" style="${valueColor}">${consequence.value}</div>
                    <div class="consequence-label">${consequence.label}</div>
                `;
                
                consequencesGrid.appendChild(consequenceEl);
            });
            
            // Show consequences container
            consequencesContainer.style.display = 'block';
            
            // Update scores based on consequences
            updateScoresFromChoice(choice);
            
            // Record the choice
            gameState.choices.push({
                scenario: gameState.currentScenario,
                choice: choiceType,
                logicPoints: choiceType === 'logic' ? 1 : 0,
                emotionPoints: choiceType === 'emotion' ? 1 : 0
            });
            
            // Update decision tip
            updateDecisionTip();
        }

        // Update scores based on choice consequences
        function updateScoresFromChoice(choice) {
            choice.consequences.forEach(consequence => {
                const value = parseInt(consequence.value);
                
                if (consequence.type === 'logic') {
                    gameState.logicScore = Math.max(0, gameState.logicScore + value);
                } else {
                    gameState.emotionScore = Math.max(0, gameState.emotionScore + value);
                }
            });
            
            updateScores();
        }

        // Finish the game and show results
        function finishGame() {
            gameState.gameCompleted = true;
            
            // Calculate final results
            const totalChoices = gameState.choices.length;
            const logicChoices = gameState.choices.filter(c => c.choice === 'logic').length;
            const emotionChoices = gameState.choices.filter(c => c.choice === 'emotion').length;
            
            const totalPoints = gameState.logicScore + gameState.emotionScore;
            const logicPercent = totalPoints > 0 ? Math.round((gameState.logicScore / totalPoints) * 100) : 50;
            const emotionPercent = 100 - logicPercent;
            
            // Update final results display
            finalLogicEl.textContent = logicChoices;
            finalEmotionEl.textContent = emotionChoices;
            finalBalanceEl.textContent = `${logicPercent}% / ${emotionPercent}%`;
            
            // Determine personality type
            let personalityType = "";
            let typeDescription = "";
            
            if (logicPercent >= 70) {
                personalityType = "The Analytical Strategist";
                typeDescription = "You make decisions based primarily on logic, data, and rational analysis. You excel at solving complex problems and thinking several steps ahead.";
            } else if (emotionPercent >= 70) {
                personalityType = "The Empathetic Heart";
                typeDescription = "You lead with your heart, prioritizing emotions, relationships, and personal values. You're deeply intuitive and connect strongly with others' feelings.";
            } else if (Math.abs(logicPercent - emotionPercent) <= 20) {
                personalityType = "The Balanced Integrator";
                typeDescription = "You skillfully balance logic and emotion in your decisions, considering both facts and feelings to arrive at well-rounded conclusions.";
            } else if (logicPercent > emotionPercent) {
                personalityType = "The Pragmatic Thinker";
                typeDescription = "You lean toward logical analysis but remain aware of emotional factors. You make practical decisions that consider both head and heart.";
            } else {
                personalityType = "The Intuitive Feelist";
                typeDescription = "You primarily follow your intuition and emotions but incorporate logical considerations when needed. You trust your gut while staying grounded.";
            }
            
            // Update personality type display
            typeTitleEl.textContent = personalityType;
            typeDescriptionEl.textContent = typeDescription;
            
            // Color the personality type box based on balance
            const hue = Math.round((logicPercent / 100) * 120); // 0 (red/emotion) to 120 (green/logic)
            personalityTypeEl.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 85%), hsl(${hue + 30}, 70%, 90%))`;
            
            // Show results container
            resultsContainer.style.display = 'block';
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        }

        // Setup event listeners
        function setupEventListeners() {
            // Logic choice click
            logicChoiceEl.addEventListener('click', function() {
                if (!gameState.gameCompleted) {
                    showConsequences('logic');
                }
            });
            
            // Emotion choice click
            emotionChoiceEl.addEventListener('click', function() {
                if (!gameState.gameCompleted) {
                    showConsequences('emotion');
                }
            });
            
            // Back button
            backButton.addEventListener('click', function() {
                if (gameState.currentScenario > 0) {
                    loadScenario(gameState.currentScenario - 1);
                }
            });
            
            // Next button
            nextButton.addEventListener('click', function() {
                if (gameState.currentScenario < gameState.scenarios.length - 1) {
                    loadScenario(gameState.currentScenario + 1);
                } else {
                    // Last scenario - finish game
                    finishGame();
                }
            });
            
            // Restart button
            restartButton.addEventListener('click', function() {
                // Reset game state
                gameState.currentScenario = 0;
                gameState.logicScore = 0;
                gameState.emotionScore = 0;
                gameState.choices = [];
                gameState.gameCompleted = false;
                
                // Reset UI
                updateScores();
                loadScenario(0);
                consequencesContainer.style.display = 'none';
                resultsContainer.style.display = 'none';
                updateDecisionTip();
                
                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Initialize the game when page loads
        document.addEventListener('DOMContentLoaded', initGame);