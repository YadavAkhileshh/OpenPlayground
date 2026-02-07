        // Wisdom database categorized by type
        const wisdomDatabase = {
            motivation: [
                {
                    text: "The only way to do great work is to love what you do.",
                    author: "Steve Jobs",
                    category: "Motivation"
                },
                {
                    text: "Believe you can and you're halfway there.",
                    author: "Theodore Roosevelt",
                    category: "Motivation"
                },
                {
                    text: "Your time is limited, don't waste it living someone else's life.",
                    author: "Steve Jobs",
                    category: "Motivation"
                },
                {
                    text: "The future belongs to those who believe in the beauty of their dreams.",
                    author: "Eleanor Roosevelt",
                    category: "Motivation"
                },
                {
                    text: "Don't watch the clock; do what it does. Keep going.",
                    author: "Sam Levenson",
                    category: "Motivation"
                },
                {
                    text: "The secret of getting ahead is getting started.",
                    author: "Mark Twain",
                    category: "Motivation"
                }
            ],
            mindfulness: [
                {
                    text: "The present moment is the only moment where life exists.",
                    author: "Thich Nhat Hanh",
                    category: "Mindfulness"
                },
                {
                    text: "Mindfulness is the aware, balanced acceptance of the present experience.",
                    author: "Sylvia Boorstein",
                    category: "Mindfulness"
                },
                {
                    text: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.",
                    author: "Oprah Winfrey",
                    category: "Mindfulness"
                },
                {
                    text: "Feelings come and go like clouds in a windy sky. Conscious breathing is my anchor.",
                    author: "Thich Nhat Hanh",
                    category: "Mindfulness"
                },
                {
                    text: "The best way to capture moments is to pay attention. This is how we cultivate mindfulness.",
                    author: "Jon Kabat-Zinn",
                    category: "Mindfulness"
                },
                {
                    text: "In today's rush, we all think too much, seek too much, want too much and forget about the joy of just being.",
                    author: "Eckhart Tolle",
                    category: "Mindfulness"
                }
            ],
            practical: [
                {
                    text: "If you're feeling overwhelmed, break your task into five-minute chunks. Just start with five minutes.",
                    author: "Practical Tip",
                    category: "Practical"
                },
                {
                    text: "Drink a glass of water. Dehydration often masquerades as fatigue or anxiety.",
                    author: "Health Advice",
                    category: "Practical"
                },
                {
                    text: "Take a 10-minute walk outside. Even a short break can reset your perspective.",
                    author: "Productivity Tip",
                    category: "Practical"
                },
                {
                    text: "Make a list of three small things you can accomplish today. Completing them builds momentum.",
                    author: "Productivity Strategy",
                    category: "Practical"
                },
                {
                    text: "Clean one small area of your space. A tidy environment can help clear your mind.",
                    author: "Organizational Tip",
                    category: "Practical"
                },
                {
                    text: "Set a timer for 25 minutes of focused work, then take a 5-minute break. Repeat.",
                    author: "Pomodoro Technique",
                    category: "Practical"
                }
            ],
            inspiration: [
                {
                    text: "You are never too old to set another goal or to dream a new dream.",
                    author: "C.S. Lewis",
                    category: "Inspiration"
                },
                {
                    text: "The only impossible journey is the one you never begin.",
                    author: "Tony Robbins",
                    category: "Inspiration"
                },
                {
                    text: "Everything you can imagine is real.",
                    author: "Pablo Picasso",
                    category: "Inspiration"
                },
                {
                    text: "Do what you can, with what you have, where you are.",
                    author: "Theodore Roosevelt",
                    category: "Inspiration"
                },
                {
                    text: "Life is 10% what happens to you and 90% how you react to it.",
                    author: "Charles R. Swindoll",
                    category: "Inspiration"
                },
                {
                    text: "The purpose of our lives is to be happy.",
                    author: "Dalai Lama",
                    category: "Inspiration"
                }
            ],
            health: [
                {
                    text: "Take a deep breath. Inhale peace, exhale tension. Repeat five times.",
                    author: "Breathing Exercise",
                    category: "Health"
                },
                {
                    text: "Stand up and stretch for two minutes. Your body will thank you.",
                    author: "Physical Health Tip",
                    category: "Health"
                },
                {
                    text: "Aim for 7-9 hours of sleep tonight. Quality rest is foundational to health.",
                    author: "Sleep Advice",
                    category: "Health"
                },
                {
                    text: "Eat something nourishing. Your brain needs fuel to function optimally.",
                    author: "Nutrition Tip",
                    category: "Health"
                },
                {
                    text: "Call a friend or loved one. Social connection is vital for wellbeing.",
                    author: "Mental Health Tip",
                    category: "Health"
                },
                {
                    text: "Limit screen time before bed. The blue light can disrupt your sleep cycle.",
                    author: "Digital Wellness",
                    category: "Health"
                }
            ],
            relationship: [
                {
                    text: "Listen with the intent to understand, not just to reply.",
                    author: "Stephen R. Covey",
                    category: "Relationships"
                },
                {
                    text: "The most precious gift we can offer anyone is our attention.",
                    author: "Thich Nhat Hanh",
                    category: "Relationships"
                },
                {
                    text: "A single act of kindness throws out roots in all directions.",
                    author: "Amelia Earhart",
                    category: "Relationships"
                },
                {
                    text: "The best relationships are the ones where you can be yourself.",
                    author: "Unknown",
                    category: "Relationships"
                },
                {
                    text: "Communication is the fuel that keeps the fire of your relationship alive.",
                    author: "Relationship Advice",
                    category: "Relationships"
                },
                {
                    text: "Apologize when you're wrong, forgive when you're right.",
                    author: "Relationship Wisdom",
                    category: "Relationships"
                }
            ]
        };

        // App state
        let currentCategory = 'random';
        let wisdomHistory = [];
        const maxHistoryItems = 10;

        // DOM Elements
        const helpButton = document.getElementById('help-button');
        const loadingElement = document.getElementById('loading');
        const wisdomContainer = document.getElementById('wisdom-container');
        const wisdomText = document.getElementById('wisdom-text');
        const wisdomAuthor = document.getElementById('wisdom-author');
        const wisdomCategory = document.getElementById('wisdom-category');
        const historyContainer = document.getElementById('history-container');
        const historyList = document.getElementById('history-list');
        const categoryButtons = document.querySelectorAll('.control-btn[id$="-btn"]:not(#history-toggle-btn):not(#close-history-btn):not(#share-btn):not(#reset-btn)');
        const historyToggleBtn = document.getElementById('history-toggle-btn');
        const closeHistoryBtn = document.getElementById('close-history-btn');
        const shareBtn = document.getElementById('share-btn');
        const resetBtn = document.getElementById('reset-btn');
        const body = document.body;

        // Initialize the app
        function initApp() {
            // Load history from localStorage if available
            const savedHistory = localStorage.getItem('wisdomHistory');
            if (savedHistory) {
                wisdomHistory = JSON.parse(savedHistory);
                updateHistoryDisplay();
            }
            
            // Set up event listeners
            helpButton.addEventListener('click', getWisdom);
            
            categoryButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all category buttons
                    categoryButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Set current category based on button id
                    const category = this.id.replace('-btn', '');
                    currentCategory = category;
                    
                    // Change background based on category
                    changeBackground(category);
                });
            });
            
            // Set random button as active by default
            document.getElementById('random-btn').classList.add('active');
            
            historyToggleBtn.addEventListener('click', toggleHistory);
            closeHistoryBtn.addEventListener('click', toggleHistory);
            shareBtn.addEventListener('click', shareWisdom);
            resetBtn.addEventListener('click', resetApp);
            
            // Add keyboard shortcut (spacebar or enter) to trigger help
            document.addEventListener('keydown', function(e) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    getWisdom();
                }
            });
        }

        // Get wisdom based on current category
        function getWisdom() {
            // Show loading state
            loadingElement.classList.add('show');
            wisdomContainer.classList.remove('show');
            helpButton.disabled = true;
            
            // Simulate "searching" for the right wisdom
            setTimeout(() => {
                let wisdomArray;
                
                if (currentCategory === 'random') {
                    // Combine all wisdom into one array and pick random
                    const allWisdom = Object.values(wisdomDatabase).flat();
                    wisdomArray = allWisdom;
                } else {
                    wisdomArray = wisdomDatabase[currentCategory];
                }
                
                // Select random wisdom from the array
                const randomIndex = Math.floor(Math.random() * wisdomArray.length);
                const selectedWisdom = wisdomArray[randomIndex];
                
                // Display the wisdom
                displayWisdom(selectedWisdom);
                
                // Add to history
                addToHistory(selectedWisdom);
                
                // Hide loading state
                loadingElement.classList.remove('show');
                wisdomContainer.classList.add('show');
                helpButton.disabled = false;
                
                // Change background based on category
                changeBackground(selectedWisdom.category.toLowerCase());
                
            }, 800 + Math.random() * 800); // Random delay between 0.8-1.6 seconds
        }

        // Display wisdom on the screen
        function displayWisdom(wisdom) {
            wisdomText.textContent = wisdom.text;
            wisdomAuthor.textContent = wisdom.author;
            wisdomCategory.textContent = wisdom.category;
            
            // Add subtle animation to the text
            wisdomText.style.opacity = '0';
            wisdomText.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                wisdomText.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                wisdomText.style.opacity = '1';
                wisdomText.style.transform = 'translateY(0)';
            }, 50);
        }

        // Change background based on category
        function changeBackground(category) {
            // Remove all category background classes
            body.classList.remove('motivation-bg', 'mindfulness-bg', 'practical-bg', 
                                 'inspiration-bg', 'health-bg', 'relationship-bg');
            
            // Add the appropriate class
            if (category === 'motivation') {
                body.classList.add('motivation-bg');
            } else if (category === 'mindfulness') {
                body.classList.add('mindfulness-bg');
            } else if (category === 'practical') {
                body.classList.add('practical-bg');
            } else if (category === 'inspiration') {
                body.classList.add('inspiration-bg');
            } else if (category === 'health') {
                body.classList.add('health-bg');
            } else if (category === 'relationship') {
                body.classList.add('relationship-bg');
            } else if (category === 'random') {
                // For random, pick a random background
                const categories = ['motivation', 'mindfulness', 'practical', 'inspiration', 'health', 'relationship'];
                const randomCategory = categories[Math.floor(Math.random() * categories.length)];
                body.classList.add(`${randomCategory}-bg`);
            }
        }

        // Add wisdom to history
        function addToHistory(wisdom) {
            // Add timestamp
            const wisdomWithTime = {
                ...wisdom,
                timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
            };
            
            // Add to beginning of array
            wisdomHistory.unshift(wisdomWithTime);
            
            // Keep only the most recent items
            if (wisdomHistory.length > maxHistoryItems) {
                wisdomHistory = wisdomHistory.slice(0, maxHistoryItems);
            }
            
            // Save to localStorage
            localStorage.setItem('wisdomHistory', JSON.stringify(wisdomHistory));
            
            // Update history display
            updateHistoryDisplay();
        }

        // Update history display
        function updateHistoryDisplay() {
            historyList.innerHTML = '';
            
            if (wisdomHistory.length === 0) {
                historyList.innerHTML = '<div class="history-item"><div class="history-item-text">No wisdom yet. Click the button to get started!</div></div>';
                return;
            }
            
            wisdomHistory.forEach((item, index) => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                // Determine icon based on category
                let icon = 'fas fa-quote-left';
                if (item.category === 'Motivation') icon = 'fas fa-bolt';
                else if (item.category === 'Mindfulness') icon = 'fas fa-spa';
                else if (item.category === 'Practical') icon = 'fas fa-tasks';
                else if (item.category === 'Inspiration') icon = 'fas fa-lightbulb';
                else if (item.category === 'Health') icon = 'fas fa-heartbeat';
                else if (item.category === 'Relationships') icon = 'fas fa-users';
                
                historyItem.innerHTML = `
                    <div class="history-item-icon"><i class="${icon}"></i></div>
                    <div class="history-item-text">
                        ${item.text}
                        <div class="history-item-category">${item.category} • ${item.timestamp}</div>
                    </div>
                `;
                
                historyList.appendChild(historyItem);
            });
        }

        // Toggle history visibility
        function toggleHistory() {
            historyContainer.classList.toggle('show');
            
            if (historyContainer.classList.contains('show')) {
                historyToggleBtn.innerHTML = '<i class="fas fa-times"></i> Hide History';
                historyToggleBtn.classList.add('active');
            } else {
                historyToggleBtn.innerHTML = '<i class="fas fa-history"></i> View History';
                historyToggleBtn.classList.remove('active');
            }
        }

        // Share current wisdom
        function shareWisdom() {
            const currentWisdom = wisdomText.textContent;
            const currentAuthor = wisdomAuthor.textContent;
            
            if (currentWisdom.includes("Click the button")) {
                alert("Please get some wisdom first before sharing!");
                return;
            }
            
            const shareText = `"${currentWisdom}" — ${currentAuthor}\n\nShared via One Button Life Helper`;
            
            // Check if Web Share API is available
            if (navigator.share) {
                navigator.share({
                    title: 'Wisdom from One Button Life Helper',
                    text: shareText,
                    url: window.location.href
                })
                .catch(err => {
                    console.log('Error sharing:', err);
                    copyToClipboard(shareText);
                });
            } else {
                // Fallback to clipboard
                copyToClipboard(shareText);
            }
        }

        // Copy text to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    // Show confirmation
                    const originalText = shareBtn.innerHTML;
                    shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    
                    setTimeout(() => {
                        shareBtn.innerHTML = originalText;
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy to clipboard. You can manually copy the text.');
                });
        }

        // Reset the app
        function resetApp() {
            if (confirm("Are you sure you want to reset? This will clear your wisdom history.")) {
                wisdomHistory = [];
                localStorage.removeItem('wisdomHistory');
                updateHistoryDisplay();
                
                // Reset display
                wisdomText.textContent = "Click the button above for personalized advice, inspiration, or practical help.";
                wisdomAuthor.textContent = "One Button Life Helper";
                wisdomCategory.textContent = "Welcome";
                
                // Reset background
                body.className = '';
                
                // Reset active button
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                document.getElementById('random-btn').classList.add('active');
                currentCategory = 'random';
                
                // Hide history if open
                if (historyContainer.classList.contains('show')) {
                    toggleHistory();
                }
            }
        }

        // Initialize the app when the page loads
        document.addEventListener('DOMContentLoaded', initApp);