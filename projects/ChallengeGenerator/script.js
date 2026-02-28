
        const challenges = [
            { 
                text: "Take three slow, deep breaths and notice the air filling your lungs", 
                icon: "fas fa-wind",
                duration: "1 minute",
                category: "mindfulness"
            },
            { 
                text: "Gently stretch your arms overhead like you're reaching for soft clouds", 
                icon: "fas fa-cloud",
                duration: "30 seconds",
                category: "stretching"
            },
            { 
                text: "Sip a glass of water while looking out a window", 
                icon: "fas fa-tint",
                duration: "1 minute",
                category: "health"
            },
            { 
                text: "Look at something green for 20 seconds to rest your eyes", 
                icon: "fas fa-leaf",
                duration: "20 seconds",
                category: "eye care"
            },
            { 
                text: "Roll your shoulders gently five times forward and backward", 
                icon: "fas fa-sync-alt",
                duration: "1 minute",
                category: "stretching"
            },
            { 
                text: "Think of one small thing you're thankful for today", 
                icon: "fas fa-star",
                duration: "30 seconds",
                category: "mindfulness"
            },
            { 
                text: "Walk slowly around your space, noticing three things you haven't seen today", 
                icon: "fas fa-feather-alt",
                duration: "2 minutes",
                category: "movement"
            },
            { 
                text: "Close your eyes and listen to the quietest sound you can hear", 
                icon: "fas fa-volume-off",
                duration: "30 seconds",
                category: "mindfulness"
            },
            { 
                text: "Gently massage your own hands for one minute", 
                icon: "fas fa-hand-holding-heart",
                duration: "1 minute",
                category: "self-care"
            },
            { 
                text: "Smile softly to yourself, just because you can", 
                icon: "fas fa-smile-beam",
                duration: "15 seconds",
                category: "mindfulness"
            },
            { 
                text: "Write down one kind thing you can do for yourself today", 
                icon: "fas fa-pen-fancy",
                duration: "1 minute",
                category: "self-care"
            },
            { 
                text: "Stand up and gently twist your torso from side to side", 
                icon: "fas fa-redo",
                duration: "45 seconds",
                category: "stretching"
            },
            { 
                text: "Place your hand on your heart and take a calming breath", 
                icon: "fas fa-heartbeat",
                duration: "30 seconds",
                category: "mindfulness"
            },
            { 
                text: "Hum a soothing tune for 20 seconds", 
                icon: "fas fa-music",
                duration: "20 seconds",
                category: "fun"
            },
            { 
                text: "Gently roll your head in a half-circle from shoulder to shoulder", 
                icon: "fas fa-moon",
                duration: "1 minute",
                category: "stretching"
            }
        ];

        // Encouragement messages
        const encouragements = [
            "You're doing beautifully!",
            "Gentle steps create lasting change",
            "So proud of you for taking this moment",
            "Your well-being matters every day",
            "This small act is a gift to yourself",
            "You're creating positive patterns",
            "Every gentle break adds up",
            "You're worth this moment of care",
            "Beautiful job prioritizing yourself",
            "Your consistency is inspiring"
        ];

        // Completion messages
        const completionMessages = [
            "Lovely! Challenge completed with grace",
            "Wonderful! You're nurturing yourself",
            "Beautifully done! Take a moment to feel proud",
            "Excellent! You've honored your needs",
            "Fantastic! You're building healthy rhythms",
            "Well done! Your consistency shines",
            "Perfect! You're creating space for joy",
            "Amazing! You've gifted yourself this moment",
            "Excellent! You're cultivating self-care",
            "Beautiful! You've completed another gentle challenge"
        ];

        // App state
        let challengeCount = 0;
        let streakCount = 0;
        let currentChallenge = null;
        let lastCompletionDate = null;
        let buttonState = "start"; // "start", "done", or "next"
        
        // DOM elements
        const challengeText = document.getElementById('challengeText');
        const challengeIcon = document.getElementById('challengeIcon');
        const challengeDuration = document.getElementById('challengeDuration');
        const mainButton = document.getElementById('mainButton');
        const encouragement = document.getElementById('encouragement');
        const challengeCountElement = document.getElementById('challengeCount');
        const streakCountElement = document.getElementById('streakCount');
        
        // Initialize the app
        function initApp() {
            // Load saved state from localStorage
            const savedState = localStorage.getItem('pastelChallengeState');
            if (savedState) {
                const state = JSON.parse(savedState);
                challengeCount = state.challengeCount || 0;
                streakCount = state.streakCount || 0;
                lastCompletionDate = state.lastCompletionDate || null;
                
                // Update counters
                challengeCountElement.textContent = challengeCount;
                streakCountElement.textContent = streakCount;
                
                // Check if streak should continue
                checkStreak();
                
                // Set initial button state
                buttonState = challengeCount === 0 ? "start" : "next";
                updateButton();
            }
            
            // Set up event listeners
            mainButton.addEventListener('click', handleMainButtonClick);
            
            // Show a random encouragement message
            showRandomEncouragement();
        }
        
        // Handle main button click
        function handleMainButtonClick() {
            if (buttonState === "start" || buttonState === "next") {
                generateNewChallenge();
                buttonState = "done";
                updateButton();
            } else if (buttonState === "done") {
                completeChallenge();
                buttonState = "next";
                updateButton();
            }
        }
        
        // Update button text and icon based on state
        function updateButton() {
            if (buttonState === "start") {
                mainButton.innerHTML = '<i class="fas fa-play-circle"></i> Start Your First Challenge';
                mainButton.classList.remove('completed');
                mainButton.classList.add('pulse');
            } else if (buttonState === "done") {
                mainButton.innerHTML = '<i class="fas fa-check-circle"></i> Mark as Completed';
                mainButton.classList.remove('pulse');
                mainButton.classList.add('completed');
            } else if (buttonState === "next") {
                mainButton.innerHTML = '<i class="fas fa-forward"></i> Next Gentle Challenge';
                mainButton.classList.remove('completed');
                mainButton.classList.remove('pulse');
            }
        }
        
        // Generate a new random challenge
        function generateNewChallenge() {
            // Get a random challenge that's not the current one
            let newChallenge;
            do {
                newChallenge = challenges[Math.floor(Math.random() * challenges.length)];
            } while (currentChallenge && newChallenge.text === currentChallenge.text);
            
            currentChallenge = newChallenge;
            
            // Update the display with fade-in animation
            challengeIcon.innerHTML = `<i class="${newChallenge.icon}"></i>`;
            challengeText.textContent = newChallenge.text;
            challengeDuration.textContent = `Takes about ${newChallenge.duration}`;
            
            // Add animation class
            challengeText.classList.remove('fade-in');
            challengeIcon.classList.remove('fade-in');
            void challengeText.offsetWidth; // Trigger reflow
            challengeText.classList.add('fade-in');
            challengeIcon.classList.add('fade-in');
            
            // Show a random encouragement message
            showRandomEncouragement();
        }
        
        // Complete the current challenge
        function completeChallenge() {
            if (!currentChallenge) return;
            
            // Update challenge count
            challengeCount++;
            challengeCountElement.textContent = challengeCount;
            
            // Update streak
            updateStreak();
            
            // Show celebration animation
            document.querySelector('.challenge-display').classList.add('celebrate');
            
            // Show completion message
            const randomCompletion = completionMessages[Math.floor(Math.random() * completionMessages.length)];
            encouragement.textContent = randomCompletion;
            encouragement.style.color = "#8ecc7d";
            
            // Create confetti effect
            createConfetti();
            
            // Save state
            saveState();
            
            // Remove celebration class after animation
            setTimeout(() => {
                document.querySelector('.challenge-display').classList.remove('celebrate');
            }, 500);
        }
        
        // Update streak counter
        function updateStreak() {
            const today = new Date().toDateString();
            
            // If this is the first completion ever
            if (!lastCompletionDate) {
                streakCount = 1;
            } 
            // If last completion was yesterday
            else if (isYesterday(lastCompletionDate)) {
                streakCount++;
            }
            // If last completion was today, don't increase streak
            else if (lastCompletionDate !== today) {
                // If last completion wasn't yesterday, reset streak
                streakCount = 1;
            }
            
            // Update last completion date
            lastCompletionDate = today;
            
            // Update display
            streakCountElement.textContent = streakCount;
        }
        
        // Check if we need to reset streak (if user missed a day)
        function checkStreak() {
            if (!lastCompletionDate) return;
            
            const today = new Date().toDateString();
            const lastDate = new Date(lastCompletionDate);
            const todayDate = new Date(today);
            
            // Calculate difference in days
            const diffTime = Math.abs(todayDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // If last completion was more than 1 day ago (and not today), reset streak
            if (diffDays > 1 && lastCompletionDate !== today) {
                streakCount = 0;
                streakCountElement.textContent = streakCount;
            }
        }
        
        // Helper function to check if a date string is yesterday
        function isYesterday(dateString) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toDateString() === dateString;
        }
        
        // Show a random encouragement message
        function showRandomEncouragement() {
            const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
            encouragement.textContent = randomEncouragement;
            encouragement.style.color = "#89c4f4";
        }
        
        // Create confetti effect
        function createConfetti() {
            const container = document.querySelector('.challenge-display');
            const colors = ['#a8edea', '#fed6e3', '#d4c1ff', '#89c4f4', '#c5f9d7'];
            
            for (let i = 0; i < 20; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.width = Math.random() * 10 + 8 + 'px';
                confetti.style.height = confetti.style.width;
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
                
                container.appendChild(confetti);
                
                // Animation
                confetti.style.animation = `confettiRain ${Math.random() * 1 + 0.5}s linear forwards`;
                
                // Remove confetti after animation
                setTimeout(() => {
                    confetti.remove();
                }, 1500);
            }
        }
        
        // Save app state to localStorage
        function saveState() {
            const state = {
                challengeCount,
                streakCount,
                lastCompletionDate
            };
            localStorage.setItem('pastelChallengeState', JSON.stringify(state));
        }
        
        // Initialize the app when the page loads
        document.addEventListener('DOMContentLoaded', initApp);