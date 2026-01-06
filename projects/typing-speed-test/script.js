/**
 * Typing Speed Test - Core JavaScript
 * Features: WPM calculation, Accuracy tracking, Leaderboard, Difficulty levels
 */

// ===================================
// Sentence Database by Difficulty
// ===================================
const sentences = {
    easy: [
  "The quick brown fox jumps over the lazy dog.",
  "A journey of a thousand miles begins with a single step.",
  "Practice makes perfect.",
  "Actions speak louder than words.",
  "Time flies when you are having fun.",
  "The early bird catches the worm.",
  "Every cloud has a silver lining.",
  "Keep your friends close and your enemies closer.",
  "What goes around comes around.",
  "Better late than never.",
  "Simple is the best way to go.",
  "Cats love to sleep all day long.",
  "The sun rises in the east every morning.",
  "Good things come to those who wait.",
  "A picture is worth a thousand words.",
  "Honesty is the best policy.",
  "Laughter is the best medicine.",
  "The sky is blue and clear today.",
  "I like to drink water every morning.",
  "Dogs are loyal and friendly animals.",
  "She reads a book before sleeping.",
  "He enjoys walking in the park.",
  "The baby is smiling happily.",
  "Birds sing early in the morning.",
  "We love to play games together.",
  "The weather is nice and warm.",
  "Please close the door gently.",
  "The car stopped at the signal.",
  "I enjoy listening to soft music.",
  "She writes neatly in her notebook.",
  "The children are playing outside.",
  "He wakes up early every day.",
  "The moon looks bright tonight.",
  "I like hot tea in winter.",
  "The flowers smell very sweet.",
  "She likes to paint landscapes.",
  "We eat dinner at night.",
  "The train arrived on time.",
  "He is learning new skills.",
  "The beach looks calm today.",
  "I forgot my keys at home.",
  "She loves cooking tasty food.",
  "The phone is on the table.",
  "He runs fast in races.",
  "The clock shows ten o'clock.",
  "We watch movies on weekends.",
  "The room is clean now.",
  "I like cold ice cream.",
  "She opened the window slowly.",
  "The river flows very gently.",
  "He fixed the broken chair.",
  "The kids laughed loudly.",
  "I enjoy morning walks.",
  "The sun feels warm.",
  "She bought fresh fruits.",
  "The bag is heavy.",
  "He drinks milk daily.",
  "The light is bright.",
  "We reached home safely.",
  "She sings very well.",
  "The dog is sleeping.",
  "I like blue color.",
  "The class starts early.",
  "He studies every night.",
  "The sky looks cloudy.",
  "She waters the plants.",
  "The road is empty.",
  "I enjoy learning new things.",
  "The phone battery is low.",
  "He loves to travel.",
  "The bus was late.",
  "She tied her hair.",
  "The shop opens early.",
  "I found my pen.",
  "The cake tastes sweet.",
  "He smiled politely.",
  "The wind is cool.",
  "She cleaned her desk.",
  "The match starts today.",
  "I love sunny days.",
  "The bell rang loudly.",
  "He opened the book.",
  "The water is cold.",
  "She likes green tea.",
  "The room feels cozy.",
  "I enjoy quiet places.",
  "The laptop is charging.",
  "He finished his work.",
  "The door is locked.",
  "She wears a jacket.",
  "The stars shine bright.",
  "I like fresh air.",
  "The chair is broken.",
  "He fixed the issue.",
  "The floor is wet.",
  "She likes soft music.",
  "The bag is full.",
  "I enjoy long walks.",
  "The sun is shining.",
  "He packed his bag.",
  "The cup is empty.",
  "She baked a cake.",
  "The house is quiet.",
  "I woke up early.",
  "The fan is on.",
  "He closed the window.",
  "The road looks smooth.",
  "She likes simple food.",
  "The pen writes well.",
  "I enjoy warm coffee.",
  "The bus is crowded.",
  "He checked the time.",
  "The flowers are fresh.",
  "She folded her clothes.",
  "The table is clean.",
  "I feel happy today.",
  "The rain stopped now.",
  "He washed his hands.",
  "The shoe is missing.",
  "She likes reading books.",
  "The room feels bright.",
  "I enjoy calm music.",
  "The phone rang twice.",
  "He answered quickly.",
  "The food smells good.",
  "She poured some water.",
  "The glass is clear.",
  "I like peaceful nights.",
  "The sky looks pink.",
  "He tied his shoes.",
  "The door creaked softly.",
  "She smiled gently.",
  "The cat stretched slowly.",
  "I enjoy simple tasks.",
  "The book feels heavy.",
  "He turned off lights.",
  "The air feels fresh.",
  "She laughed softly.",
  "The window is open.",
  "I like slow mornings."
],
    medium: [
  "The only way to do great work is to love what you do and never give up on your dreams.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "In the middle of difficulty lies opportunity for those who seek it with determination.",
  "Life is what happens when you are busy making other plans for the future.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "It does not matter how slowly you go as long as you do not stop moving forward.",
  "The future belongs to those who believe in the beauty of their dreams and work hard.",
  "You must be the change you wish to see in the world around you every single day.",
  "Education is the most powerful weapon which you can use to change the world for good.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",
  "Hard work beats talent when talent does not work hard enough.",
  "Every challenge in life teaches us something valuable if we pay attention.",
  "Small daily improvements lead to remarkable long term results.",
  "Patience and consistency are key ingredients for lasting success.",
  "The path to success is rarely straight and often full of obstacles.",
  "Confidence grows when you face your fears instead of avoiding them.",
  "True happiness comes from appreciating what you already have.",
  "Discipline is choosing what you want most over what you want now.",
  "A calm mind helps you make better decisions under pressure.",
  "Learning never stops if you stay curious and open minded.",
  "Mistakes are proof that you are trying to improve yourself.",
  "Progress takes time, effort, and a strong belief in yourself.",
  "A positive attitude can change the way you experience challenges.",
  "Success requires focus, patience, and the courage to keep going.",
  "The journey matters just as much as reaching the destination.",
  "Good habits build a strong foundation for a successful future.",
  "You grow stronger every time you overcome a difficult situation.",
  "Clear goals help you stay focused and motivated every day.",
  "Consistency is more powerful than short bursts of motivation.",
  "True growth happens outside of your comfort zone.",
  "Your mindset shapes how you respond to success and failure.",
  "Taking responsibility for your actions builds strong character.",
  "Hard times reveal inner strength you never knew you had.",
  "Listening carefully is just as important as speaking clearly.",
  "Success often comes after many failed attempts and lessons learned.",
  "The ability to adapt is more valuable than raw intelligence.",
  "Every day is a new opportunity to improve yourself slightly.",
  "Believing in yourself is the first step toward achieving goals.",
  "Clear communication helps avoid unnecessary misunderstandings.",
  "Long term success depends on discipline rather than motivation.",
  "Effort and persistence can outperform natural talent over time.",
  "A healthy routine supports both mental and physical well being.",
  "Learning from failure is essential for personal development.",
  "Focus on progress instead of aiming for perfection.",
  "A strong work ethic creates opportunities over time.",
  "Staying consistent is harder than starting, but far more rewarding.",
  "Your habits define the direction of your future.",
  "Growth begins when you accept discomfort and uncertainty.",
  "Success comes to those who stay patient during difficult phases.",
  "Taking small steps daily leads to meaningful transformation.",
  "Good decisions are easier when emotions are under control.",
  "Learning to manage time effectively reduces unnecessary stress.",
  "Success requires long term thinking and short term discipline.",
  "Failure becomes valuable when lessons are taken seriously.",
  "Confidence grows through action, not overthinking.",
  "The right mindset can turn pressure into motivation.",
  "Clear goals help transform dreams into achievable plans.",
  "Self discipline creates freedom and long term stability.",
  "Staying focused helps you avoid distractions and wasted energy.",
  "Growth requires honesty with yourself about weaknesses.",
  "Patience helps you stay calm during uncertain situations.",
  "Strong foundations make it easier to handle future challenges.",
  "Consistent effort produces better results than quick shortcuts.",
  "Facing problems directly builds resilience and confidence.",
  "Your attitude influences how others respond to you.",
  "Improvement begins with awareness and honest self reflection.",
  "Success rarely comes overnight and requires steady effort.",
  "Learning from others can accelerate your personal growth.",
  "Clear thinking leads to better problem solving skills.",
  "True success includes balance, health, and inner peace.",
  "A focused mind improves efficiency and reduces mental fatigue.",
  "Setting priorities helps manage time more effectively.",
  "Every experience contributes to your personal growth story.",
  "Consistency builds trust in both personal and professional life.",
  "Strong habits reduce the need for constant motivation.",
  "Long term thinking helps avoid short term mistakes.",
  "Self improvement is a continuous and rewarding process.",
  "Learning to stay calm improves decision making.",
  "Persistence helps you push through difficult situations.",
  "Small efforts repeated daily lead to major achievements.",
  "Clarity of purpose makes hard work feel meaningful.",
  "Challenges test patience, discipline, and inner strength.",
  "Improvement requires both effort and honest reflection.",
  "Success becomes easier when distractions are minimized.",
  "Growth often feels uncomfortable before it feels rewarding.",
  "Belief combined with effort creates powerful results.",
  "Strong discipline supports consistent performance over time.",
  "Clear goals help measure progress more effectively.",
  "Progress is slow when discipline is inconsistent.",
  "Staying committed leads to long lasting success."
],
    hard: [
  "The development of full artificial intelligence could spell the end of the human race, but it could also be the greatest achievement in our history if we handle it responsibly.",
  "Programming is not about typing, it is about thinking logically and breaking complex problems into smaller, manageable components.",
  "Quantum computing represents a fundamental shift in computational paradigms by leveraging superposition and entanglement to solve previously intractable problems.",
  "The intersection of technology and creativity has created unprecedented opportunities for innovation while redefining traditional problem solving methods.",
  "Machine learning algorithms have transformed data analysis by enabling systems to learn from patterns and improve performance without explicit programming.",
  "Cybersecurity has become increasingly critical as digital infrastructure expands across governments, businesses, and personal devices worldwide.",
  "Blockchain technology provides a decentralized, transparent, and immutable system for maintaining trust across distributed networks.",
  "Early software architecture decisions significantly impact scalability, maintainability, and long term system reliability.",
  "Asynchronous programming allows applications to remain responsive while performing multiple time consuming operations simultaneously.",
  "Clean code principles emphasize readability and maintainability because software is read far more often than it is written.",
  "Artificial intelligence systems must be designed with ethical considerations to prevent bias, misuse, and unintended consequences.",
  "Distributed systems rely on fault tolerance mechanisms to ensure reliability despite hardware failures or network interruptions.",
  "Efficient algorithms balance time complexity and space complexity to optimize performance across large scale systems.",
  "The rapid evolution of technology demands continuous learning to remain relevant in an ever changing industry.",
  "Data privacy regulations require organizations to handle sensitive information responsibly and transparently.",
  "Scalable systems must be designed to handle increased load without sacrificing performance or reliability.",
  "Concurrency introduces complex challenges such as race conditions, deadlocks, and resource contention.",
  "Cryptographic protocols ensure data integrity, confidentiality, and authentication across insecure networks.",
  "System optimization often involves tradeoffs between speed, memory usage, and code readability.",
  "Fault tolerant architectures are essential for mission critical applications operating at global scale.",
  "Cloud computing enables elastic resource allocation, reducing infrastructure costs while increasing deployment flexibility.",
  "Artificial neural networks simulate biological processes to recognize patterns and make predictions.",
  "Software testing strategies help identify edge cases that may cause unexpected system failures.",
  "The rise of automation has reshaped labor markets and increased demand for specialized technical skills.",
  "Event driven architectures improve scalability by decoupling system components through asynchronous communication.",
  "Security vulnerabilities often arise from improper input validation and poor access control mechanisms.",
  "Modern web applications depend heavily on APIs to exchange data across distributed services.",
  "The reliability of a system depends on careful monitoring, logging, and proactive maintenance.",
  "Latency optimization plays a crucial role in enhancing user experience for real time applications.",
  "Version control systems enable collaborative development while maintaining a history of code changes.",
  "Artificial intelligence models require large datasets to achieve meaningful accuracy and generalization.",
  "The complexity of software systems grows exponentially as features and dependencies increase.",
  "Load balancing distributes traffic efficiently across servers to prevent performance bottlenecks.",
  "Data consistency models define how systems behave under network partitions and failures.",
  "Strong encryption standards protect sensitive information from unauthorized access.",
  "The principles of object oriented design promote modularity, reusability, and maintainability.",
  "Edge computing reduces latency by processing data closer to the source rather than centralized servers.",
  "Memory management errors can lead to performance degradation and critical security vulnerabilities.",
  "Observability tools provide insights into system behavior through metrics, logs, and traces.",
  "The adoption of microservices introduces operational complexity alongside scalability benefits.",
  "Artificial intelligence requires careful evaluation to avoid overfitting and misleading predictions.",
  "Scalable databases balance consistency, availability, and partition tolerance under heavy workloads.",
  "Human centered design ensures that technology remains accessible and intuitive for end users.",
  "The evolution of programming languages reflects changing needs in performance and developer productivity.",
  "Secure authentication mechanisms are fundamental to protecting user identities.",
  "Technical debt accumulates when short term solutions compromise long term code quality.",
  "Efficient data structures improve performance by organizing information optimally.",
  "The growth of decentralized systems challenges traditional centralized control models.",
  "Continuous integration pipelines automate testing and deployment to reduce human error.",
  "Concurrency control mechanisms prevent data corruption in multi user environments.",
  "High availability systems rely on redundancy to minimize downtime during failures.",
  "Artificial intelligence governance ensures responsible development and deployment practices.",
  "The increasing reliance on software highlights the importance of ethical engineering decisions.",
  "System resilience depends on graceful degradation during partial failures.",
  "Algorithmic efficiency directly affects scalability in large data processing systems.",
  "Real time systems require predictable response times under strict performance constraints.",
  "Secure software development begins with threat modeling and risk assessment.",
  "Distributed databases must synchronize state across geographically separated nodes.",
  "Human oversight remains essential even as automation becomes more advanced.",
  "Technology advances fastest when innovation aligns with societal needs.",
  "Performance profiling helps identify bottlenecks that limit system efficiency.",
  "The reliability of machine learning models depends on data quality and representativeness.",
  "Complex systems require clear documentation to support long term maintenance.",
  "Scalable architectures prioritize flexibility to adapt to future requirements.",
  "Ethical considerations should guide the deployment of powerful technologies."
]

};

// ===================================
// State Management
// ===================================
let state = {
    difficulty: 'easy',
    currentText: '',
    typedText: '',
    isRunning: false,
    startTime: null,
    timerInterval: null,
    correctChars: 0,
    incorrectChars: 0,
    currentIndex: 0
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    textDisplay: document.getElementById('textDisplay'),
    typingInput: document.getElementById('typingInput'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    timer: document.getElementById('timer'),
    wpm: document.getElementById('wpm'),
    accuracy: document.getElementById('accuracy'),
    chars: document.getElementById('chars'),
    progressFill: document.getElementById('progressFill'),
    resultsModal: document.getElementById('resultsModal'),
    finalWpm: document.getElementById('finalWpm'),
    finalAccuracy: document.getElementById('finalAccuracy'),
    finalTime: document.getElementById('finalTime'),
    finalDifficulty: document.getElementById('finalDifficulty'),
    playerName: document.getElementById('playerName'),
    saveScoreBtn: document.getElementById('saveScoreBtn'),
    saveScoreSection: document.getElementById('saveScoreSection'),
    tryAgainBtn: document.getElementById('tryAgainBtn'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    leaderboardTable: document.getElementById('leaderboardTable'),
    difficultyBtns: document.querySelectorAll('.diff-btn'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// ===================================
// Utility Functions
// ===================================
function getRandomSentence(difficulty) {
    const sentenceList = sentences[difficulty];
    return sentenceList[Math.floor(Math.random() * sentenceList.length)];
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function calculateWPM(charCount, timeInSeconds) {
    if (timeInSeconds === 0) return 0;
    const words = charCount / 5; // Standard: 5 chars = 1 word
    const minutes = timeInSeconds / 60;
    return Math.round(words / minutes);
}

function calculateAccuracy(correct, total) {
    if (total === 0) return 100;
    return Math.round((correct / total) * 100);
}

// ===================================
// Display Functions
// ===================================
function renderText() {
    const chars = state.currentText.split('');
    let html = '';

    chars.forEach((char, index) => {
        let className = 'char';

        if (index < state.currentIndex) {
            // Already typed
            if (state.typedText[index] === char) {
                className += ' correct';
            } else {
                className += ' incorrect';
            }
        } else if (index === state.currentIndex) {
            className += ' current';
        }

        // Handle spaces for visibility
        const displayChar = char === ' ' ? '&nbsp;' : char;
        html += `<span class="${className}">${displayChar}</span>`;
    });

    elements.textDisplay.innerHTML = html;
}

function updateStats() {
    const elapsed = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : 0;
    const totalTyped = state.correctChars + state.incorrectChars;

    elements.timer.textContent = formatTime(elapsed);
    elements.wpm.textContent = calculateWPM(state.correctChars, elapsed);
    elements.accuracy.textContent = calculateAccuracy(state.correctChars, totalTyped) + '%';
    elements.chars.textContent = `${state.currentIndex}/${state.currentText.length}`;

    // Update progress bar
    const progress = (state.currentIndex / state.currentText.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
}

function updateDifficultyButtons() {
    elements.difficultyBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === state.difficulty);
    });
}

// ===================================
// Game Logic
// ===================================
function startTest() {
    // Get a random sentence
    state.currentText = getRandomSentence(state.difficulty);
    state.typedText = '';
    state.currentIndex = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.isRunning = true;
    state.startTime = Date.now();

    // Update UI
    renderText();
    elements.textDisplay.classList.add('active');
    elements.typingInput.disabled = false;
    elements.typingInput.value = '';
    elements.typingInput.focus();
    elements.startBtn.disabled = true;
    elements.resetBtn.disabled = false;

    // Disable difficulty selection during test
    elements.difficultyBtns.forEach(btn => btn.disabled = true);

    // Start timer
    elements.timerInterval = setInterval(updateStats, 100);
}

function endTest() {
    state.isRunning = false;
    clearInterval(elements.timerInterval);

    const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
    const totalTyped = state.correctChars + state.incorrectChars;
    const finalWpm = calculateWPM(state.correctChars, elapsed);
    const finalAccuracy = calculateAccuracy(state.correctChars, totalTyped);

    // Update final stats
    elements.finalWpm.textContent = finalWpm;
    elements.finalAccuracy.textContent = finalAccuracy + '%';
    elements.finalTime.textContent = formatTime(elapsed);
    elements.finalDifficulty.textContent = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

    // Store results for saving
    state.finalResults = {
        wpm: finalWpm,
        accuracy: finalAccuracy,
        time: elapsed,
        difficulty: state.difficulty
    };

    // Show modal
    elements.resultsModal.classList.add('active');
    elements.saveScoreSection.style.display = 'flex';
    elements.playerName.value = '';
    elements.playerName.focus();
}

function resetTest() {
    state.isRunning = false;
    state.typedText = '';
    state.currentIndex = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.startTime = null;
    clearInterval(elements.timerInterval);

    // Reset UI
    elements.textDisplay.innerHTML = '<span class="placeholder-text">Click "Start Test" to begin...</span>';
    elements.textDisplay.classList.remove('active');
    elements.typingInput.disabled = true;
    elements.typingInput.value = '';
    elements.startBtn.disabled = false;
    elements.resetBtn.disabled = true;
    elements.timer.textContent = '0:00';
    elements.wpm.textContent = '0';
    elements.accuracy.textContent = '100%';
    elements.chars.textContent = '0/0';
    elements.progressFill.style.width = '0%';

    // Re-enable difficulty selection
    elements.difficultyBtns.forEach(btn => btn.disabled = false);
}

function handleTyping(e) {
    if (!state.isRunning) return;

    const typed = e.target.value;
    state.typedText = typed;
    state.currentIndex = typed.length;

    // Calculate correct/incorrect
    state.correctChars = 0;
    state.incorrectChars = 0;

    for (let i = 0; i < typed.length; i++) {
        if (typed[i] === state.currentText[i]) {
            state.correctChars++;
        } else {
            state.incorrectChars++;
        }
    }

    renderText();
    updateStats();

    // Check if test is complete
    if (typed.length >= state.currentText.length) {
        endTest();
    }
}

// ===================================
// Max-Heap Data Structure for Leaderboard
// ===================================
// We use a Min-Heap internally to track the MINIMUM score
// This allows efficient removal of lowest performer when heap is full

class LeaderboardHeap {
    constructor(maxSize = 10) {
        this.maxSize = maxSize;
        this.heap = []; // Min-heap based on WPM (lowest WPM at top for easy removal)
    }

    // Get parent index
    parentIndex(i) {
        return Math.floor((i - 1) / 2);
    }

    // Get left child index
    leftChildIndex(i) {
        return 2 * i + 1;
    }

    // Get right child index
    rightChildIndex(i) {
        return 2 * i + 2;
    }

    // Swap two elements
    swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    // Compare function - returns true if a has lower priority (lower WPM)
    hasLowerPriority(a, b) {
        // Primary: lower WPM has lower priority
        if (a.wpm !== b.wpm) return a.wpm < b.wpm;
        // Secondary: lower accuracy has lower priority
        if (a.accuracy !== b.accuracy) return a.accuracy < b.accuracy;
        // Tertiary: older entries have lower priority
        return a.date < b.date;
    }

    // Heapify up - maintain heap property after insertion
    heapifyUp(index) {
        while (index > 0) {
            const parent = this.parentIndex(index);
            // Min-heap: parent should have lower priority (lower WPM)
            if (this.hasLowerPriority(this.heap[parent], this.heap[index])) {
                break;
            }
            this.swap(index, parent);
            index = parent;
        }
    }

    // Heapify down - maintain heap property after removal
    heapifyDown(index) {
        const size = this.heap.length;
        while (true) {
            let smallest = index;
            const left = this.leftChildIndex(index);
            const right = this.rightChildIndex(index);

            // Find smallest among current, left child, and right child
            if (left < size && this.hasLowerPriority(this.heap[left], this.heap[smallest])) {
                smallest = left;
            }
            if (right < size && this.hasLowerPriority(this.heap[right], this.heap[smallest])) {
                smallest = right;
            }

            if (smallest === index) break;

            this.swap(index, smallest);
            index = smallest;
        }
    }

    // Get minimum element (lowest WPM)
    peek() {
        return this.heap.length > 0 ? this.heap[0] : null;
    }

    // Remove and return minimum element
    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const min = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown(0);
        return min;
    }

    // Insert new entry - automatically removes lowest performer if full
    insert(entry) {
        entry.date = Date.now();

        if (this.heap.length < this.maxSize) {
            // Heap not full, just add
            this.heap.push(entry);
            this.heapifyUp(this.heap.length - 1);
            return { added: true, removed: null };
        }

        // Heap is full - check if new entry is better than minimum
        const min = this.peek();
        if (this.hasLowerPriority(min, entry)) {
            // New entry is better, remove minimum and add new
            const removed = this.extractMin();
            this.heap.push(entry);
            this.heapifyUp(this.heap.length - 1);
            return { added: true, removed: removed };
        }

        // New entry is worse than all existing entries
        return { added: false, removed: null };
    }

    // Get all entries sorted by WPM (descending)
    getSortedEntries() {
        return [...this.heap].sort((a, b) => {
            if (b.wpm !== a.wpm) return b.wpm - a.wpm;
            if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
            return b.date - a.date;
        });
    }

    // Get current size
    size() {
        return this.heap.length;
    }

    // Check if empty
    isEmpty() {
        return this.heap.length === 0;
    }

    // Load from array (rebuild heap)
    loadFromArray(entries) {
        this.heap = [];
        entries.forEach(entry => this.insert(entry));
    }

    // Get raw heap data for storage
    toArray() {
        return [...this.heap];
    }
}

// Global leaderboard heap instance
const leaderboardHeap = new LeaderboardHeap(10);

// ===================================
// Leaderboard Functions
// ===================================
function getLeaderboard() {
    const data = localStorage.getItem('typingSpeedLeaderboard');
    return data ? JSON.parse(data) : [];
}

function loadLeaderboardHeap() {
    const entries = getLeaderboard();
    leaderboardHeap.loadFromArray(entries);
}

function saveLeaderboardToStorage() {
    const entries = leaderboardHeap.toArray();
    localStorage.setItem('typingSpeedLeaderboard', JSON.stringify(entries));
}

function saveToLeaderboard(entry) {
    const result = leaderboardHeap.insert(entry);

    if (result.added) {
        saveLeaderboardToStorage();

        // Show notification about auto-removal if applicable
        if (result.removed) {
            showAutoRemovalNotification(result.removed);
        }
    }

    return result;
}

function showAutoRemovalNotification(removedEntry) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'auto-removal-notification';
    notification.innerHTML = `
        <i class="ri-information-line"></i>
        <span>Leaderboard full! Removed lowest score: ${removedEntry.name} (${removedEntry.wpm} WPM)</span>
    `;
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function renderLeaderboard(filter = 'all') {
    let entries = leaderboardHeap.getSortedEntries();

    if (filter !== 'all') {
        entries = entries.filter(entry => entry.difficulty === filter);
    }

    if (entries.length === 0) {
        elements.leaderboardTable.innerHTML = `
            <div class="leaderboard-empty">
                <i class="ri-trophy-line"></i>
                <p>No scores yet. Be the first!</p>
            </div>
        `;
        return;
    }

    // Show heap info
    let html = `
        <div class="heap-info">
            <i class="ri-database-2-line"></i>
            <span>Using Max-Heap • ${leaderboardHeap.size()}/${leaderboardHeap.maxSize} entries • Auto-removes lowest scores</span>
        </div>
    `;

    entries.forEach((entry, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'gold';
        else if (index === 1) rankClass = 'silver';
        else if (index === 2) rankClass = 'bronze';

        html += `
            <div class="leaderboard-entry ${rankClass}">
                <span class="rank">#${index + 1}</span>
                <span class="player-name">${escapeHtml(entry.name)}</span>
                <span class="entry-wpm">${entry.wpm} WPM</span>
                <span class="entry-accuracy">${entry.accuracy}%</span>
                <span class="entry-difficulty ${entry.difficulty}">${entry.difficulty}</span>
            </div>
        `;
    });

    elements.leaderboardTable.innerHTML = html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Event Listeners
// ===================================
function initEventListeners() {
    // Start button
    elements.startBtn.addEventListener('click', startTest);

    // Reset button
    elements.resetBtn.addEventListener('click', resetTest);

    // Typing input
    elements.typingInput.addEventListener('input', handleTyping);

    // Prevent paste
    elements.typingInput.addEventListener('paste', (e) => e.preventDefault());

    // Difficulty buttons
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!state.isRunning) {
                state.difficulty = btn.dataset.difficulty;
                updateDifficultyButtons();
            }
        });
    });

    // Save score button
    elements.saveScoreBtn.addEventListener('click', () => {
        const name = elements.playerName.value.trim();
        if (!name) {
            elements.playerName.focus();
            elements.playerName.style.borderColor = 'var(--error)';
            return;
        }
        elements.playerName.style.borderColor = '';

        saveToLeaderboard({
            name: name,
            wpm: state.finalResults.wpm,
            accuracy: state.finalResults.accuracy,
            difficulty: state.finalResults.difficulty
        });

        elements.saveScoreSection.style.display = 'none';
        renderLeaderboard();
    });

    // Enter key to save score
    elements.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.saveScoreBtn.click();
        }
    });

    // Try again button
    elements.tryAgainBtn.addEventListener('click', () => {
        elements.resultsModal.classList.remove('active');
        resetTest();
        setTimeout(startTest, 100);
    });

    // Close modal button
    elements.closeModalBtn.addEventListener('click', () => {
        elements.resultsModal.classList.remove('active');
        resetTest();
    });

    // Close modal on outside click
    elements.resultsModal.addEventListener('click', (e) => {
        if (e.target === elements.resultsModal) {
            elements.resultsModal.classList.remove('active');
            resetTest();
        }
    });

    // Filter buttons
    elements.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderLeaderboard(btn.dataset.filter);
        });
    });

    // Keyboard shortcut: Enter to start
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !state.isRunning && document.activeElement !== elements.playerName) {
            if (!elements.startBtn.disabled) {
                startTest();
            }
        }
        // Escape to reset
        if (e.key === 'Escape') {
            if (elements.resultsModal.classList.contains('active')) {
                elements.resultsModal.classList.remove('active');
                resetTest();
            } else if (state.isRunning) {
                resetTest();
            }
        }
    });
}

// ===================================
// Theme Sync - Match main site theme
// ===================================
function syncTheme() {
    // Check if we came from main site and get its theme
    try {
        const mainTheme = localStorage.getItem('theme');
        if (mainTheme) {
            document.documentElement.setAttribute('data-theme', mainTheme);
        }
    } catch (e) {
        // Fallback to system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}

// ===================================
// Initialize
// ===================================
function init() {
    syncTheme();
    loadLeaderboardHeap();
    initEventListeners();
    renderLeaderboard();
    updateDifficultyButtons();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
