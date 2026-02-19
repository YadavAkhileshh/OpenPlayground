/**
 * Typing Speed Test - Core JavaScript
 * Features: WPM calculation, Accuracy tracking, Leaderboard, Difficulty levels, Analytics
 */

// ===================================
// Sentence Database by Difficulty and Category
// ===================================
const sentences = {
    easy: {
        general: [
            "The quick brown fox jumps over the lazy dog.",
            "A journey of a thousand miles begins with a single step.",
            "Practice makes perfect.",
            "Actions speak louder than words.",
            "Time flies when you are having fun.",
            "The early bird catches the worm.",
            "Every cloud has a silver lining.",
            "Keep your friends close and your enemies closer.",
            "What goes around comes around.",
            "Better late than never."
        ],
        technology: [
            "The keyboard is an input device for computers.",
            "Software updates often improve performance and security.",
            "The internet connects people around the world.",
            "Smartphones have become essential tools for daily life.",
            "Cloud computing stores data on remote servers.",
            "Artificial intelligence is changing many industries.",
            "Programming languages help us create software.",
            "Websites are built with HTML, CSS, and JavaScript.",
            "Data is the new oil in the digital age.",
            "Encryption keeps your information safe online."
        ],
        science: [
            "Water is essential for all forms of life.",
            "The Earth orbits around the sun once every year.",
            "Gravity keeps us grounded on the planet's surface.",
            "Photosynthesis is how plants make their food.",
            "Atoms are the basic building blocks of matter.",
            "The human body has many complex systems.",
            "Evolution explains how species change over time.",
            "Electricity powers our modern world.",
            "The universe is vast and mostly unexplored.",
            "DNA contains the genetic instructions for life."
        ],
        philosophy: [
            "Know thyself is an ancient Greek maxim.",
            "The unexamined life is not worth living.",
            "Happiness is the meaning and purpose of life.",
            "We are what we repeatedly do.",
            "The only true wisdom is in knowing you know nothing.",
            "Live in the present moment as if it were your last.",
            "The journey matters more than the destination.",
            "Everything changes and nothing stands still.",
            "Reason is the source of knowledge and truth.",
            "Virtue is the foundation of a good life."
        ],
        literature: [
            "It was the best of times, it was the worst of times.",
            "All happy families are alike; each unhappy family is unhappy in its own way.",
            "Call me Ishmael, a simple sailor seeking adventure.",
            "It is a truth universally acknowledged, that a single man in possession of a good fortune must be in want of a wife.",
            "The woods are lovely, dark and deep, but I have promises to keep.",
            "Two households, both alike in dignity, in fair Verona where we lay our scene.",
            "I am the master of my fate, I am the captain of my soul.",
            "Whatever our souls are made of, his and mine are the same.",
            "To be, or not to be, that is the question.",
            "It matters not how strait the gate, how charged with punishments the scroll, I am the master of my fate."
        ]
    },
    medium: {
        general: [
            "The only way to do great work is to love what you do and never give up on your dreams.",
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "In the middle of difficulty lies opportunity for those who seek it with determination.",
            "Life is what happens when you are busy making other plans for the future.",
            "The greatest glory in living lies not in never falling, but in rising every time we fall."
        ],
        technology: [
            "Machine learning algorithms have revolutionized the way we process and analyze data, enabling systems to learn from experience and improve their performance over time.",
            "Cybersecurity has become increasingly critical as our digital infrastructure expands, requiring constant vigilance and sophisticated defensive measures to protect sensitive information.",
            "The blockchain technology underlying cryptocurrencies offers a decentralized approach to maintaining secure, transparent, and immutable records across distributed networks.",
            "Software architecture decisions made early in a project can have profound implications on scalability, maintainability, and the overall success of the application.",
            "Understanding the intricacies of asynchronous programming is essential for building responsive applications that can handle multiple operations concurrently without blocking."
        ],
        science: [
            "Quantum computing represents a fundamental shift in computational paradigms, leveraging the principles of superposition and entanglement to solve previously intractable problems.",
            "The theory of relativity transformed our understanding of space, time, and gravity, showing that they are interconnected in ways that challenge common sense.",
            "Natural selection is the gradual process by which biological traits become either more or less common in a population as a function of their effect on survival and reproduction.",
            "The human genome project mapped the entire DNA sequence of humans, opening new frontiers in medicine, biology, and our understanding of what makes us who we are.",
            "Climate change poses one of the greatest challenges of our time, requiring global cooperation and innovative solutions to mitigate its impacts on ecosystems and human societies."
        ],
        philosophy: [
            "The unexamined life may not be worth living, but the over-examined life can be paralysing, suggesting we need a balance between reflection and action.",
            "Ethics is not merely about following rules, but about cultivating the wisdom to know when rules apply and when exceptions are morally justified.",
            "Consciousness remains one of the greatest mysteries in philosophy, raising questions about the nature of experience and the relationship between mind and matter.",
            "Free will and determinism present a perennial philosophical puzzle: if our actions are determined by prior causes, can we truly be held morally responsible?",
            "The meaning of life may not be discovered but created through our choices, relationships, and the values we choose to embrace and pursue."
        ],
        literature: [
            "The great gatsby by F. Scott Fitzgerald explores themes of wealth, love, and the american dream through its vivid portrayal of the jazz age.",
            "In to kill a mockingbird, Harper Lee crafts a powerful narrative about racial injustice and moral growth in the deep south.",
            "George Orwell's 1984 remains a chilling warning about totalitarianism, surveillance, and the manipulation of truth in modern society.",
            "The catcher in the rye captures adolescent alienation and rebellion through its unforgettable protagonist Holden Caulfield.",
            "One hundred years of solitude by Gabriel Garcia Marquez weaves a magical realist tapestry of family, love, and the cyclical nature of history."
        ]
    },
    hard: {
        general: [
            "The development of full artificial intelligence could spell the end of the human race, but it could also be the greatest achievement in our history if we handle it responsibly.",
            "Programming is not about typing, it's about thinking. The most valuable skill a developer can have is the ability to break down complex problems into simple, manageable pieces.",
            "Quantum computing represents a fundamental shift in computational paradigms, leveraging the principles of superposition and entanglement to solve previously intractable problems.",
            "The intersection of technology and creativity has given rise to unprecedented opportunities for innovation, challenging us to reimagine the boundaries of what is possible.",
            "Machine learning algorithms have revolutionized the way we process and analyze data, enabling systems to learn from experience and improve their performance over time."
        ],
        technology: [
            "The evolution of programming paradigms from procedural to object-oriented to functional reflects our growing understanding of how to manage complexity in software development while maintaining flexibility and robustness.",
            "Distributed systems theory encompasses the challenges of coordinating multiple computers to work together reliably, addressing issues of consistency, partition tolerance, and availability in networked environments.",
            "The semantic web extends the current web by enabling machines to understand and process data meaningfully, requiring sophisticated ontologies and reasoning capabilities to transform information into knowledge.",
            "Neuromorphic computing attempts to mimic the neural structures of the human brain using analog circuits, potentially revolutionizing how we approach artificial intelligence and machine learning hardware.",
            "Zero-knowledge proofs represent a breakthrough in cryptographic protocols, allowing one party to prove to another that a statement is true without revealing any information beyond the validity of the statement itself."
        ],
        science: [
            "The Copenhagen interpretation of quantum mechanics suggests that physical systems generally do not have definite properties prior to being measured, leading to profound philosophical questions about the nature of reality and observation.",
            "Epigenetics reveals how environmental factors can influence gene expression without changing the DNA sequence itself, potentially explaining how experiences can affect not just individuals but their descendants.",
            "The holographic principle in theoretical physics proposes that the entire universe can be seen as a two-dimensional information structure projected onto a cosmic horizon, challenging our understanding of space and reality.",
            "Neuroplasticity demonstrates that the brain's neural networks can reorganize throughout life in response to learning and experience, contradicting earlier beliefs about fixed brain structure after critical developmental periods.",
            "The anthropic principle suggests that observations of the universe must be compatible with the conscious life that observes it, raising questions about fine-tuning and the apparent design of physical constants."
        ],
        philosophy: [
            "The simulation hypothesis proposes that reality might be a simulated construct, raising questions about consciousness, knowledge, and whether we could ever definitively prove we are not living in a simulation.",
            "Moral particularism challenges the idea that ethical reasoning requires principles, arguing instead that moral judgment should be based on the specific features of each unique situation without relying on generalizations.",
            "The hard problem of consciousness, articulated by David Chalmers, distinguishes between the easy problems of explaining cognitive functions and the hard problem of explaining subjective experience itself.",
            "Postmodern philosophy questions the grand narratives of progress and truth that characterized modernity, emphasizing instead the plurality of perspectives and the social construction of knowledge and meaning.",
            "The extended mind thesis proposes that cognitive processes can extend beyond the brain to include tools and environment, suggesting that our smartphones and notebooks are part of our cognitive system."
        ],
        literature: [
            "James Joyce's Ulysses revolutionized modernist literature through its stream of consciousness technique, dense allusions, and parallel structure to Homer's Odyssey, while challenging conventional narrative and linguistic boundaries.",
            "In Search of Lost Time by Marcel Proust explores memory, time, and consciousness through an intricate narrative style that mirrors the associative nature of human thought and the involuntary nature of recollection.",
            "The works of Franz Kafka present absurd, surreal situations that explore themes of alienation, existential anxiety, guilt, and the incomprehensible nature of bureaucratic systems in modern society.",
            "Virginia Woolf's Mrs. Dalloway weaves together the inner lives of its characters through shifting perspectives and interior monologues, examining the complexities of identity, mental health, and social conventions in post-war England.",
            "Herman Melville's Moby-Dick operates on multiple levels as an adventure story, a metaphysical meditation, and an encyclopedia of whaling, incorporating elements of drama, philosophy, and natural history into its narrative."
        ]
    }
};

// ===================================
// State Management
// ===================================
let state = {
    difficulty: 'easy',
    category: 'general',
    currentText: '',
    typedText: '',
    isRunning: false,
    startTime: null,
    timerInterval: null,
    correctChars: 0,
    incorrectChars: 0,
    currentIndex: 0,
    mistakes: [], 
    performanceData: [], 
    sessionHistory: [], 
    selectedSessions: [] 
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
    categoryBtns: document.querySelectorAll('.category-btn'),
    filterBtns: document.querySelectorAll('.filter-btn'),
    graphFilters: document.querySelectorAll('.graph-filter'),
    heatmapContainer: document.getElementById('heatmapContainer'),
    sessionComparison: document.getElementById('sessionComparison'),
    compareSessionsBtn: document.getElementById('compareSessionsBtn')
};

// ===================================
// Utility Functions
// ===================================
function getRandomSentence(difficulty, category) {
    const categorySentences = sentences[difficulty][category];
    if (!categorySentences || categorySentences.length === 0) {
        // Fallback to general category
        return sentences[difficulty].general[Math.floor(Math.random() * sentences[difficulty].general.length)];
    }
    return categorySentences[Math.floor(Math.random() * categorySentences.length)];
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

    // Track performance data every second
    if (state.isRunning && elapsed > 0 && elapsed % 1 === 0) {
        state.performanceData.push({
            time: elapsed,
            wpm: calculateWPM(state.correctChars, elapsed),
            accuracy: calculateAccuracy(state.correctChars, totalTyped)
        });
    }
}

function updateDifficultyButtons() {
    elements.difficultyBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === state.difficulty);
    });
}

function updateCategoryButtons() {
    elements.categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === state.category);
    });
}

// ===================================
// Game Logic
// ===================================
function startTest() {
    state.currentText = getRandomSentence(state.difficulty, state.category);
    state.typedText = '';
    state.currentIndex = 0;
    state.correctChars = 0;
    state.incorrectChars = 0;
    state.mistakes = [];
    state.performanceData = [];
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
    elements.categoryBtns.forEach(btn => btn.disabled = true);

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

    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        difficulty: state.difficulty,
        category: state.category,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        time: elapsed,
        mistakes: [...state.mistakes],
        performanceData: [...state.performanceData],
        text: state.currentText
    };

    state.sessionHistory.push(session);
    saveSessionHistory();

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
        difficulty: state.difficulty,
        category: state.category
    };

    // Show modal
    elements.resultsModal.classList.add('active');
    elements.saveScoreSection.style.display = 'flex';
    elements.playerName.value = '';
    elements.playerName.focus();

    renderHeatmap();
    renderPerformanceChart();
    renderSessionHistory();
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
    elements.categoryBtns.forEach(btn => btn.disabled = false);
}

function handleTyping(e) {
    if (!state.isRunning) return;

    const typed = e.target.value;
    const newChars = typed.slice(state.typedText.length);
    
    for (let i = 0; i < newChars.length; i++) {
        const pos = state.currentIndex + i;
        if (pos < state.currentText.length) {
            if (newChars[i] !== state.currentText[pos]) {
                // Record mistake
                state.mistakes.push({
                    position: pos,
                    expected: state.currentText[pos],
                    actual: newChars[i],
                    timestamp: Date.now() - state.startTime
                });
            }
        }
    }

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
// Analytics Functions
// ===================================
function renderHeatmap() {
    if (!elements.heatmapContainer) return;

    if (state.mistakes.length === 0) {
        elements.heatmapContainer.innerHTML = `
            <div class="heatmap-placeholder">
                <i class="ri-heat-map-line"></i>
                <p>No mistakes in this session! Perfect typing!</p>
            </div>
        `;
        return;
    }

    const mistakeMap = {};
    state.mistakes.forEach(mistake => {
        if (!mistakeMap[mistake.position]) {
            mistakeMap[mistake.position] = [];
        }
        mistakeMap[mistake.position].push(mistake);
    });

    const positions = Object.keys(mistakeMap).map(Number).sort((a, b) => a - b);
    const maxMistakes = Math.max(...positions.map(pos => mistakeMap[pos].length));
    
    let html = '<div class="heatmap-grid">';
    
    positions.forEach(pos => {
        const count = mistakeMap[pos].length;
        const intensity = count / maxMistakes;
        
        const r = 239;
        const g = Math.round(68 + (187 * (1 - intensity)));
        const b = Math.round(68 + (187 * (1 - intensity)));
        
        const mistakes = mistakeMap[pos];
        const characters = mistakes.map(m => `'${m.actual}' (expected '${m.expected}')`).join(', ');
        
        html += `
            <div class="heatmap-cell" style="background: rgba(${r}, ${g}, ${b}, ${0.3 + intensity * 0.7})">
                <div class="heatmap-tooltip">
                    Position ${pos + 1}: ${count} mistake${count > 1 ? 's' : ''}<br>
                    ${characters}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    html += `
        <div class="heatmap-legend">
            <div class="legend-item">
                <div class="legend-color" style="background: rgba(239, 68, 68, 0.3)"></div>
                <span>Fewer mistakes</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: rgba(239, 68, 68, 1)"></div>
                <span>More mistakes</span>
            </div>
        </div>
    `;
    
    elements.heatmapContainer.innerHTML = html;
}

let performanceChart = null;

function renderPerformanceChart(period = 'all') {
    const ctx = document.getElementById('performanceChart')?.getContext('2d');
    if (!ctx) return;

    let data = [];
    const now = Date.now();
    
    state.sessionHistory.forEach(session => {
        const sessionDate = new Date(session.date).getTime();
        let include = false;
        
        switch(period) {
            case 'week':
                include = (now - sessionDate) <= 7 * 24 * 60 * 60 * 1000;
                break;
            case 'month':
                include = (now - sessionDate) <= 30 * 24 * 60 * 60 * 1000;
                break;
            default:
                include = true;
        }
        
        if (include) {
            data.push({
                date: new Date(session.date).toLocaleDateString(),
                wpm: session.wpm,
                accuracy: session.accuracy
            });
        }
    });

    data.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (performanceChart) {
        performanceChart.destroy();
    }

    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [
                {
                    label: 'WPM',
                    data: data.map(d => d.wpm),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Accuracy (%)',
                    data: data.map(d => d.accuracy),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.dataset.label === 'WPM' ? 
                                    context.parsed.y + ' WPM' : 
                                    context.parsed.y + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'WPM'
                    },
                    min: 0
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy (%)'
                    },
                    min: 0,
                    max: 100,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

function renderSessionHistory() {
    if (!elements.sessionComparison) return;

    if (state.sessionHistory.length === 0) {
        elements.sessionComparison.innerHTML = `
            <div class="session-placeholder">
                <i class="ri-history-line"></i>
                <p>No session history yet</p>
            </div>
        `;
        return;
    }

    const sessions = [...state.sessionHistory].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    let html = '<div class="session-list">';
    
    sessions.slice(0, 10).forEach(session => {
        const date = new Date(session.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const isSelected = state.selectedSessions.includes(session.id);
        
        html += `
            <div class="session-item ${isSelected ? 'selected' : ''}" data-session-id="${session.id}">
                <div class="session-checkbox">
                    ${isSelected ? '<i class="ri-check-line"></i>' : ''}
                </div>
                <div class="session-info">
                    <div class="session-title">
                        ${session.difficulty.charAt(0).toUpperCase() + session.difficulty.slice(1)} • ${session.category.charAt(0).toUpperCase() + session.category.slice(1)}
                    </div>
                    <div class="session-meta">
                        <span>${formattedDate}</span>
                        <span>${formatTime(session.time)}</span>
                    </div>
                </div>
                <div class="session-stats">
                    <span class="session-wpm">${session.wpm} WPM</span>
                    <span class="session-accuracy">${session.accuracy}%</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    elements.sessionComparison.innerHTML = html;

    document.querySelectorAll('.session-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const sessionId = parseInt(item.dataset.sessionId);
            toggleSessionSelection(sessionId);
        });
    });
}

function toggleSessionSelection(sessionId) {
    const index = state.selectedSessions.indexOf(sessionId);
    if (index === -1) {
        if (state.selectedSessions.length < 2) {
            state.selectedSessions.push(sessionId);
        } else {
            state.selectedSessions.shift();
            state.selectedSessions.push(sessionId);
        }
    } else {
        state.selectedSessions.splice(index, 1);
    }
    
    renderSessionHistory();
}

function compareSessions() {
    if (state.selectedSessions.length !== 2) {
        alert('Please select exactly 2 sessions to compare');
        return;
    }

    const session1 = state.sessionHistory.find(s => s.id === state.selectedSessions[0]);
    const session2 = state.sessionHistory.find(s => s.id === state.selectedSessions[1]);

    if (!session1 || !session2) return;

    const wpmDiff = session2.wpm - session1.wpm;
    const accuracyDiff = session2.accuracy - session1.accuracy;
    const timeDiff = session2.time - session1.time;

    const comparisonHtml = `
        <div class="comparison-stats">
            <div class="comparison-stat">
                <div class="comparison-label">WPM Change</div>
                <div class="comparison-value">${wpmDiff > 0 ? '+' : ''}${wpmDiff}</div>
                <div class="comparison-diff ${wpmDiff >= 0 ? 'positive' : 'negative'}">
                    ${wpmDiff >= 0 ? '↑' : '↓'} ${Math.abs(wpmDiff)} WPM
                </div>
            </div>
            <div class="comparison-stat">
                <div class="comparison-label">Accuracy Change</div>
                <div class="comparison-value">${accuracyDiff > 0 ? '+' : ''}${accuracyDiff}%</div>
                <div class="comparison-diff ${accuracyDiff >= 0 ? 'positive' : 'negative'}">
                    ${accuracyDiff >= 0 ? '↑' : '↓'} ${Math.abs(accuracyDiff)}%
                </div>
            </div>
            <div class="comparison-stat">
                <div class="comparison-label">Time Change</div>
                <div class="comparison-value">${timeDiff > 0 ? '+' : ''}${timeDiff}s</div>
                <div class="comparison-diff ${timeDiff >= 0 ? 'positive' : 'negative'}">
                    ${timeDiff >= 0 ? '↑' : '↓'} ${Math.abs(timeDiff)}s
                </div>
            </div>
        </div>
    `;

    const existingComparison = document.querySelector('.comparison-stats');
    if (existingComparison) {
        existingComparison.remove();
    }
    
    elements.sessionComparison.insertAdjacentHTML('beforeend', comparisonHtml);
}

function loadSessionHistory() {
    const data = localStorage.getItem('typingSessionHistory');
    if (data) {
        try {
            state.sessionHistory = JSON.parse(data);
        } catch (e) {
            state.sessionHistory = [];
        }
    }
}

function saveSessionHistory() {
    localStorage.setItem('typingSessionHistory', JSON.stringify(state.sessionHistory));
}

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

    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!state.isRunning) {
                state.category = btn.dataset.category;
                updateCategoryButtons();
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

    elements.graphFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.graphFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderPerformanceChart(btn.dataset.period);
        });
    });

    if (elements.compareSessionsBtn) {
        elements.compareSessionsBtn.addEventListener('click', compareSessions);
    }

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
    loadSessionHistory();
    initEventListeners();
    renderLeaderboard();
    renderSessionHistory();
    renderPerformanceChart();
    updateDifficultyButtons();
    updateCategoryButtons();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);