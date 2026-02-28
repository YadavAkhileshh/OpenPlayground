
        // Data for random items
        const randomItems = {
            quote: [
                "The only way to do great work is to love what you do. - Steve Jobs",
                "Innovation distinguishes between a leader and a follower. - Steve Jobs",
                "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
                "The way to get started is to quit talking and begin doing. - Walt Disney",
                "Your time is limited, so don't waste it living someone else's life. - Steve Jobs",
                "If life were predictable it would cease to be life, and be without flavor. - Eleanor Roosevelt",
                "Life is what happens when you're busy making other plans. - John Lennon",
                "Spread love everywhere you go. - Mother Teresa",
                "The purpose of our lives is to be happy. - Dalai Lama",
                "You only live once, but if you do it right, once is enough. - Mae West"
            ],
            task: [
                "Organize your workspace for 10 minutes.",
                "Take a 5-minute walk outside and notice three new things.",
                "Write down three things you're grateful for today.",
                "Learn one new fact about a topic that interests you.",
                "Declutter one small area of your home.",
                "Call or text someone you haven't spoken to in a while.",
                "Try a new recipe for your next meal.",
                "Read 10 pages of a book you've been meaning to read.",
                "Practice a skill for 15 minutes that you want to improve.",
                "Plan your ideal weekend with three activities you'd enjoy."
            ],
            challenge: [
                "Go an entire day without complaining about anything.",
                "Do 10 minutes of exercise you don't normally do.",
                "Talk to someone new today.",
                "Take a cold shower in the morning.",
                "Fast from social media for 24 hours.",
                "Write a handwritten letter to someone important to you.",
                "Try a food you've never tasted before.",
                "Learn and use five words in a foreign language.",
                "Do something creative without judging the outcome.",
                "Perform a random act of kindness for a stranger."
            ],
            prompt: [
                "If you could have dinner with any historical figure, who would it be and why?",
                "What would you do if you had an extra hour every day?",
                "If you could instantly master any skill, what would it be?",
                "What's something you believed as a child that you now know isn't true?",
                "If you could live in any fictional universe, which would you choose?",
                "What's the most spontaneous thing you've ever done?",
                "If you could time travel, would you go to the past or the future?",
                "What's one thing you would change about your daily routine?",
                "If you were a superhero, what would your power be?",
                "What's a small change that could make your life significantly better?"
            ]
        };

        // Category icons
        const categoryIcons = {
            quote: "fas fa-quote-left",
            task: "fas fa-tasks",
            challenge: "fas fa-mountain",
            prompt: "fas fa-lightbulb"
        };

        // Category display names
        const categoryNames = {
            quote: "Quote",
            task: "Task",
            challenge: "Challenge",
            prompt: "Fun Prompt"
        };

        // DOM Elements
        const generateBtn = document.getElementById('generate-btn');
        const resultContainer = document.getElementById('result-container');
        const resultContent = document.getElementById('result-content');
        const resultCategory = document.getElementById('result-category');
        const resultIcon = document.getElementById('result-icon');
        const currentDateElement = document.getElementById('current-date');
        const resetTimeElement = document.getElementById('reset-time');
        const currentYearElement = document.getElementById('current-year');

        // Set current year in footer
        currentYearElement.textContent = new Date().getFullYear();

        // Get today's date string in YYYY-MM-DD format
        function getTodayString() {
            const today = new Date();
            return today.toISOString().split('T')[0];
        }

        // Get time until next reset
        function getTimeUntilReset() {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            const timeUntilReset = tomorrow - now;
            const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
            
            return `Resets in ${hours}h ${minutes}m`;
        }

        // Update the reset time display
        function updateResetTime() {
            resetTimeElement.textContent = getTimeUntilReset();
        }

        // Format current date for display
        function formatCurrentDate() {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return today.toLocaleDateString('en-US', options);
        }

        // Generate a seeded random number based on today's date
        function getDailyRandomIndex(max, seed) {
            // Create a simple seeded random function
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash |= 0; // Convert to 32-bit integer
            }
            
            // Use absolute value and modulo to get index
            return Math.abs(hash) % max;
        }

        // Get today's random item (same for the entire day)
        function getTodaysRandomItem() {
            const todayString = getTodayString();
            const stored = localStorage.getItem('dailyRandomizer');
            
            // Check if we have a stored item for today
            if (stored) {
                const storedData = JSON.parse(stored);
                if (storedData.date === todayString) {
                    return storedData;
                }
            }
            
            // Generate new item for today
            const categories = Object.keys(randomItems);
            const categorySeed = todayString + "_category";
            const contentSeed = todayString + "_content";
            
            // Pick a random category based on today's date
            const categoryIndex = getDailyRandomIndex(categories.length, categorySeed);
            const category = categories[categoryIndex];
            
            // Pick a random item from that category based on today's date
            const itemIndex = getDailyRandomIndex(randomItems[category].length, contentSeed);
            const content = randomItems[category][itemIndex];
            
            // Create today's item
            const todaysItem = {
                date: todayString,
                category: category,
                content: content
            };
            
            // Store it for today
            localStorage.setItem('dailyRandomizer', JSON.stringify(todaysItem));
            
            return todaysItem;
        }

        // Display the random item with animation
        function displayRandomItem(item) {
            // Add animation class to container
            resultContainer.classList.add('animating');
            
            // Set category and content
            resultCategory.textContent = categoryNames[item.category];
            resultContent.textContent = item.content;
            
            // Set icon
            const iconClass = categoryIcons[item.category];
            resultIcon.innerHTML = `<i class="${iconClass}"></i>`;
            
            // Add fade-in animation to content
            resultContent.classList.add('fade-in');
            
            // Remove animation classes after animation completes
            setTimeout(() => {
                resultContainer.classList.remove('animating');
                resultContent.classList.remove('fade-in');
            }, 500);
        }

        // Initialize the app
        function initApp() {
            // Display current date
            currentDateElement.textContent = `Today: ${formatCurrentDate()}`;
            
            // Get and display today's random item
            const todaysItem = getTodaysRandomItem();
            displayRandomItem(todaysItem);
            
            // Set up button click handler
            generateBtn.addEventListener('click', () => {
                const todaysItem = getTodaysRandomItem();
                displayRandomItem(todaysItem);
            });
            
            // Update reset time immediately and then every minute
            updateResetTime();
            setInterval(updateResetTime, 60000);
            
            // Check if it's a new day every hour
            setInterval(() => {
                const todayString = getTodayString();
                const stored = localStorage.getItem('dailyRandomizer');
                
                if (stored) {
                    const storedData = JSON.parse(stored);
                    if (storedData.date !== todayString) {
                        // New day, generate new item
                        const newItem = getTodaysRandomItem();
                        displayRandomItem(newItem);
                        currentDateElement.textContent = `Today: ${formatCurrentDate()}`;
                    }
                }
            }, 3600000); // Check every hour
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initApp);
