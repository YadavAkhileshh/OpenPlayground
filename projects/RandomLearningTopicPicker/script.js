// Learning topics database
const topics = {
    programming: {
        icon: 'ri-code-s-slash-line',
        items: [
            'Learn about Redis caching and data persistence',
            'Explore WebSockets for real-time communication',
            'Study REST API design best practices',
            'Understand Docker containerization basics',
            'Learn Git branching strategies',
            'Explore GraphQL query language',
            'Study TypeScript generics and utility types',
            'Learn about microservices architecture',
            'Explore serverless computing concepts',
            'Understand OAuth 2.0 authentication flow',
            'Learn about database indexing strategies',
            'Study React hooks in depth',
            'Explore CSS Grid and Flexbox layouts',
            'Learn about Web Workers for parallel processing',
            'Study Progressive Web Apps (PWAs)'
        ]
    },
    science: {
        icon: 'ri-flask-line',
        items: [
            'Study quantum computing fundamentals',
            'Learn about CRISPR gene editing',
            'Explore black holes and gravitational waves',
            'Understand machine learning algorithms',
            'Study neural network architectures',
            'Learn about renewable energy technologies',
            'Explore the human microbiome',
            'Study climate change science',
            'Learn about nanotechnology applications',
            'Explore the science of sleep',
            'Study cognitive psychology basics',
            'Learn about space exploration missions',
            'Explore biochemistry fundamentals',
            'Study evolutionary biology concepts',
            'Learn about materials science innovations'
        ]
    },
    creativity: {
        icon: 'ri-palette-line',
        items: [
            'Try digital illustration techniques',
            'Learn music theory fundamentals',
            'Explore 3D modeling with Blender',
            'Study photography composition rules',
            'Learn video editing basics',
            'Explore creative writing techniques',
            'Study color theory and design',
            'Learn calligraphy or hand lettering',
            'Explore motion graphics design',
            'Study UX/UI design principles',
            'Learn about sound design',
            'Explore pottery or ceramics',
            'Study film cinematography techniques',
            'Learn about animation principles',
            'Explore generative art with code'
        ]
    },
    languages: {
        icon: 'ri-translate-2',
        items: [
            'Practice Spanish conversation basics',
            'Learn Japanese hiragana and katakana',
            'Study Mandarin Chinese tones',
            'Explore French pronunciation rules',
            'Learn German grammar structure',
            'Study Korean Hangul alphabet',
            'Practice Italian vocabulary',
            'Learn Portuguese phrases',
            'Study Arabic script basics',
            'Explore Hindi Devanagari script',
            'Learn Dutch common expressions',
            'Study Russian Cyrillic alphabet',
            'Practice Swedish pronunciation',
            'Learn sign language basics',
            'Study Latin roots for vocabulary'
        ]
    },
    lifeskills: {
        icon: 'ri-heart-pulse-line',
        items: [
            'Learn basic investing principles',
            'Study time management techniques',
            'Explore meditation and mindfulness',
            'Learn about personal finance budgeting',
            'Study negotiation strategies',
            'Explore public speaking skills',
            'Learn cooking techniques and recipes',
            'Study emotional intelligence',
            'Explore home maintenance basics',
            'Learn about nutrition and meal planning',
            'Study critical thinking methods',
            'Explore productivity systems',
            'Learn conflict resolution skills',
            'Study decision-making frameworks',
            'Explore networking and relationship building'
        ]
    }
};

// Category display names
const categoryNames = {
    programming: 'Programming',
    science: 'Science',
    creativity: 'Creativity',
    languages: 'Languages',
    lifeskills: 'Life Skills'
};

// DOM elements
const topicText = document.getElementById('topicText');
const topicCategory = document.getElementById('topicCategory');
const topicDisplay = document.getElementById('topicDisplay');
const generateBtn = document.getElementById('generateBtn');
const historyList = document.getElementById('historyList');
const clearBtn = document.getElementById('clearBtn');
const topicCount = document.getElementById('topicCount');

// State
let history = JSON.parse(localStorage.getItem('learningHistory')) || [];
let count = parseInt(localStorage.getItem('learningCount')) || 0;

// Initialize
updateCounter();
renderHistory();

// Generate random topic
function generateTopic() {
    const categories = Object.keys(topics);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryItems = topics[randomCategory].items;
    const randomTopic = categoryItems[Math.floor(Math.random() * categoryItems.length)];
    const icon = topics[randomCategory].icon;

    // Fade out animation
    topicText.classList.add('fade-out');
    topicCategory.classList.add('fade-out');

    setTimeout(() => {
        // Update content
        topicText.textContent = randomTopic;
        topicCategory.innerHTML = `<i class="${icon}"></i> ${categoryNames[randomCategory]}`;

        // Fade in animation
        topicText.classList.remove('fade-out');
        topicText.classList.add('fade-in');
        topicCategory.classList.remove('fade-out');
        topicCategory.classList.add('fade-in');

        // Pulse container
        topicDisplay.classList.add('pulse');

        // Cleanup animations
        setTimeout(() => {
            topicText.classList.remove('fade-in');
            topicCategory.classList.remove('fade-in');
            topicDisplay.classList.remove('pulse');
        }, 400);

        // Add to history
        addToHistory(randomTopic, randomCategory);

        // Update counter
        count++;
        localStorage.setItem('learningCount', count);
        updateCounter();
    }, 250);
}

// Add topic to history
function addToHistory(topic, category) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const item = { topic, category, time: timestamp };

    history.unshift(item);
    if (history.length > 15) {
        history = history.slice(0, 15);
    }

    localStorage.setItem('learningHistory', JSON.stringify(history));
    renderHistory();
}

// Render history
function renderHistory() {
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="ri-book-open-line"></i>
                <p>No topics explored yet. Start your journey!</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="topic">${item.topic}</div>
            <div class="meta">
                <span class="category-badge">${categoryNames[item.category]}</span>
                <span>${item.time}</span>
            </div>
        </div>
    `).join('');
}

// Update counter
function updateCounter() {
    topicCount.textContent = count;
}

// Clear history
function clearHistory() {
    if (history.length === 0) return;

    if (confirm('Clear your learning history?')) {
        history = [];
        localStorage.setItem('learningHistory', JSON.stringify(history));
        renderHistory();
    }
}

// Event listeners
generateBtn.addEventListener('click', generateTopic);
clearBtn.addEventListener('click', clearHistory);

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('button, input, textarea')) {
        e.preventDefault();
        generateTopic();
    }
});

// Generate first topic on load
window.addEventListener('load', () => {
    setTimeout(generateTopic, 600);
});
