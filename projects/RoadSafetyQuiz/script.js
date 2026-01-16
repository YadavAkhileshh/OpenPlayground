// Quiz Application - Road Safety Quiz
class RoadSafetyQuiz {
    constructor() {
        this.initializeElements();
        this.initializeQuiz();
        this.setupEventListeners();
        this.loadHighScore();
    }

    initializeElements() {
        // Screens
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.quizScreen = document.getElementById('quizScreen');
        this.resultsScreen = document.getElementById('resultsScreen');

        // Welcome Screen Elements
        this.categoryCards = document.querySelectorAll('.category-card');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        this.userNameInput = document.getElementById('userName');
        this.startQuizBtn = document.getElementById('startQuiz');

        // Quiz Screen Elements
        this.progressFill = document.getElementById('progressFill');
        this.currentQuestionEl = document.getElementById('currentQuestion');
        this.totalQuestionsEl = document.getElementById('totalQuestions');
        this.timerEl = document.getElementById('timer');
        this.questionCategory = document.getElementById('questionCategory');
        this.questionText = document.getElementById('questionText');
        this.questionImage = document.getElementById('questionImage');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.currentScoreEl = document.getElementById('currentScore');
        this.correctCountEl = document.getElementById('correctCount');
        this.previousBtn = document.getElementById('previousBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.finishBtn = document.getElementById('finishBtn');

        // Results Screen Elements
        this.resultMessage = document.getElementById('resultMessage');
        this.finalScoreEl = document.getElementById('finalScore');
        this.resultUserName = document.getElementById('resultUserName');
        this.finalCorrectEl = document.getElementById('finalCorrect');
        this.timeTakenEl = document.getElementById('timeTaken');
        this.userRankEl = document.getElementById('userRank');
        this.learnedPoints = document.getElementById('learnedPoints');
        this.viewAnswersBtn = document.getElementById('viewAnswersBtn');
        this.certificateBtn = document.getElementById('certificateBtn');
        this.restartBtn = document.getElementById('restartBtn');

        // Other Elements
        this.themeToggle = document.getElementById('themeToggle');
        this.highScoreEl = document.getElementById('highScore');
        this.leaderboardBtn = document.getElementById('leaderboardBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.tipsBtn = document.getElementById('tipsBtn');
        this.tipsModal = document.getElementById('tipsModal');

        // Quiz State
        this.currentCategory = 'signs';
        this.currentDifficulty = 'easy';
        this.userName = '';
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.userAnswers = [];
        this.timer = null;
        this.timeLeft = 30;
        this.startTime = null;
        this.totalTime = 0;
    }

    initializeQuiz() {
        this.setDefaultSelections();
    }

    setDefaultSelections() {
        // Set first category as active
        this.categoryCards[0].classList.add('active');
        this.currentCategory = this.categoryCards[0].dataset.category;

        // Set easy difficulty as active
        this.difficultyButtons[0].classList.add('active');
        this.currentDifficulty = this.difficultyButtons[0].dataset.difficulty;
    }

    setupEventListeners() {
        // Category Selection
        this.categoryCards.forEach(card => {
            card.addEventListener('click', () => this.selectCategory(card));
        });

        // Difficulty Selection
        this.difficultyButtons.forEach(button => {
            button.addEventListener('click', () => this.selectDifficulty(button));
        });

        // Start Quiz
        this.startQuizBtn.addEventListener('click', () => this.startQuiz());

        // Quiz Navigation
        this.previousBtn.addEventListener('click', () => this.previousQuestion());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.finishBtn.addEventListener('click', () => this.finishQuiz());

        // Results Actions
        this.viewAnswersBtn.addEventListener('click', () => this.viewAnswers());
        this.certificateBtn.addEventListener('click', () => this.generateCertificate());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());

        // Theme Toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Footer Actions
        this.leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        this.shareBtn.addEventListener('click', () => this.shareResults());
        this.tipsBtn.addEventListener('click', () => this.showTips());

        // Modal Close
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Close modal when clicking outside
        this.tipsModal.addEventListener('click', (e) => {
            if (e.target === this.tipsModal) this.closeModal();
        });

        // Handle Enter key in username input
        this.userNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.startQuiz();
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
    }

    selectCategory(card) {
        this.categoryCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.currentCategory = card.dataset.category;
    }

    selectDifficulty(button) {
        this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        this.currentDifficulty = button.dataset.difficulty;

        // Set time based on difficulty
        switch (this.currentDifficulty) {
            case 'easy': this.timeLeft = 30; break;
            case 'medium': this.timeLeft = 20; break;
            case 'hard': this.timeLeft = 15; break;
        }
    }

    startQuiz() {
        this.userName = this.userNameInput.value.trim() || 'Anonymous';

        if (this.userName.length === 0) {
            this.userNameInput.style.borderColor = '#ef4444';
            this.userNameInput.placeholder = 'Please enter your name!';
            return;
        }

        this.resetQuizState();
        this.generateQuestions();
        this.showScreen(this.quizScreen);
        this.loadQuestion();
        this.startTimer();
        this.startTime = Date.now();
    }

    resetQuizState() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.userAnswers = [];
        this.totalTime = 0;
        this.updateScoreDisplay();
        this.updateProgressBar();
    }

    generateQuestions() {
        this.questions = [];
        const questionCount = 10;

        for (let i = 0; i < questionCount; i++) {
            const question = this.generateQuestion(i + 1);
            this.questions.push(question);
        }

        this.totalQuestionsEl.textContent = questionCount;
    }

    generateQuestion(number) {
        const categories = {
            signs: this.generateSignQuestion(number),
            rules: this.generateRuleQuestion(number),
            scenarios: this.generateScenarioQuestion(number)
        };

        return categories[this.currentCategory];
    }

    // Helper function to shuffle array (Fisher-Yates algorithm)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Helper function to create question with randomized options
    createQuestion(question, imageData, options, correctIndex, explanation) {
        // Create options array with correct index
        const optionObjects = options.map((text, index) => ({
            text,
            isCorrect: index === correctIndex
        }));

        // Shuffle options
        const shuffledOptions = this.shuffleArray(optionObjects);

        // Find new correct index after shuffling
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);

        return {
            question,
            imageData,
            options: shuffledOptions.map(opt => opt.text),
            correct: newCorrectIndex,
            explanation,
            originalOptions: options // Store original for review
        };
    }

    // Generate SVG images for traffic signs
    generateSignSVG(signType) {
        const svgs = {
            stop: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="15" fill="#DC2626"/>
                    <rect x="30" y="30" width="140" height="140" rx="10" fill="white" stroke="#DC2626" stroke-width="2"/>
                    <text x="100" y="115" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="60" fill="#DC2626">STOP</text>
                </svg>`,
            yield: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <polygon points="100,20 180,180 20,180" fill="#F59E0B" stroke="#92400E" stroke-width="3"/>
                    <text x="100" y="130" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="40" fill="white">YIELD</text>
                </svg>`,
            noEntry: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="#DC2626"/>
                    <rect x="30" y="90" width="140" height="20" fill="white" rx="5"/>
                    <circle cx="100" cy="100" r="70" fill="none" stroke="white" stroke-width="3"/>
                </svg>`,
            speedLimit: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="white" stroke="#1E40AF" stroke-width="8"/>
                    <circle cx="100" cy="100" r="70" fill="#1E40AF"/>
                    <text x="100" y="115" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="60" fill="white">50</text>
                    <text x="100" y="160" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white">km/h</text>
                </svg>`,
            pedestrian: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="#3B82F6" stroke="#1E40AF" stroke-width="3"/>
                    <circle cx="100" cy="60" r="15" fill="white"/>
                    <path d="M100,75 L100,120 L85,140 L115,140 L100,120" fill="none" stroke="white" stroke-width="8" stroke-linecap="round"/>
                    <path d="M80,160 L120,160" stroke="white" stroke-width="8" stroke-linecap="round"/>
                </svg>`,
            schoolZone: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="10" fill="#F59E0B"/>
                    <path d="M70,60 L130,60 L150,100 L130,140 L70,140 L50,100 Z" fill="white" stroke="#92400E" stroke-width="3"/>
                    <circle cx="100" cy="100" r="25" fill="#F59E0B" stroke="#92400E" stroke-width="2"/>
                    <text x="100" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#92400E">SCHOOL</text>
                    <path d="M60,160 L140,160" stroke="#92400E" stroke-width="3" stroke-dasharray="5,5"/>
                </svg>`,
            construction: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="10" fill="#F59E0B"/>
                    <path d="M50,50 L150,150 M50,150 L150,50" stroke="#92400E" stroke-width="10" stroke-linecap="round"/>
                    <circle cx="100" cy="100" r="40" fill="#F59E0B" stroke="#92400E" stroke-width="3"/>
                    <text x="100" y="110" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="30" fill="#92400E">!</text>
                </svg>`,
            noParking: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="#DC2626"/>
                    <circle cx="100" cy="100" r="70" fill="white"/>
                    <rect x="50" y="85" width="100" height="30" fill="#DC2626" rx="5"/>
                    <rect x="85" y="50" width="30" height="100" fill="#DC2626" rx="5"/>
                    <circle cx="100" cy="100" r="50" fill="white"/>
                    <text x="100" y="115" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="40" fill="#DC2626">P</text>
                    <path d="M60,60 L140,140" stroke="#DC2626" stroke-width="5"/>
                </svg>`,
            hospital: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="15" fill="#3B82F6"/>
                    <rect x="60" y="60" width="80" height="80" fill="white" rx="5"/>
                    <path d="M100,70 L100,130 M70,100 L130,100" stroke="#3B82F6" stroke-width="10" stroke-linecap="round"/>
                    <circle cx="100" cy="170" r="15" fill="white"/>
                    <text x="100" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#3B82F6">H</text>
                </svg>`,
            warning: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <polygon points="100,30 180,170 20,170" fill="#F59E0B" stroke="#92400E" stroke-width="3"/>
                    <circle cx="100" cy="110" r="15" fill="#92400E"/>
                    <rect x="95" y="80" width="10" height="40" fill="#F59E0B"/>
                    <circle cx="100" cy="140" r="5" fill="#92400E"/>
                </svg>`,
            bicycleLane: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="10" fill="#F59E0B"/>
                    <circle cx="100" cy="80" r="15" fill="none" stroke="#92400E" stroke-width="3"/>
                    <line x1="100" y1="95" x2="100" y2="135" stroke="#92400E" stroke-width="3"/>
                    <line x1="80" y1="135" x2="120" y2="135" stroke="#92400E" stroke-width="3"/>
                    <circle cx="60" cy="135" r="20" fill="none" stroke="#92400E" stroke-width="3"/>
                    <circle cx="140" cy="135" r="20" fill="none" stroke="#92400E" stroke-width="3"/>
                </svg>`,
            laneEnds: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="10" fill="#F59E0B"/>
                    <path d="M70,160 L70,40 M130,160 L130,100 Q130,40 70,40" stroke="#92400E" stroke-width="15" fill="none" stroke-linecap="round"/>
                </svg>`,
            steepHill: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" rx="10" fill="#F59E0B"/>
                    <path d="M20,160 L180,60" stroke="#92400E" stroke-width="2" fill="none"/>
                    <rect x="90" y="80" width="50" height="30" fill="#92400E"/>
                    <circle cx="100" cy="110" r="8" fill="#F59E0B"/>
                    <circle cx="130" cy="110" r="8" fill="#F59E0B"/>
                </svg>`
        };

        return svgs[signType];
    }

    // Generate SVG for rule scenarios
    generateRuleSVG(ruleType) {
        const svgs = {
            followingDistance: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="10" y="80" width="180" height="40" fill="#E5E7EB" rx="5"/>
                    <rect x="20" y="85" width="40" height="30" fill="#3B82F6" rx="3"/>
                    <rect x="80" y="85" width="40" height="30" fill="#10B981" rx="3"/>
                    <rect x="140" y="85" width="40" height="30" fill="#EF4444" rx="3"/>
                    <text x="40" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">2s</text>
                    <text x="100" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">3s</text>
                    <text x="160" y="105" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">1s</text>
                    <path d="M60,100 Q70,80 80,100" fill="none" stroke="#6B7280" stroke-width="2" marker-end="url(#arrow)"/>
                    <path d="M120,100 Q130,80 140,100" fill="none" stroke="#6B7280" stroke-width="2" marker-end="url(#arrow)"/>
                    <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                            <path d="M0,0 L0,6 L9,3 z" fill="#6B7280"/>
                        </marker>
                    </defs>
                </svg>`,
            headlights: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="50" y="50" width="100" height="100" fill="#1F2937" rx="10"/>
                    <circle cx="80" cy="100" r="25" fill="#FBBF24"/>
                    <circle cx="120" cy="100" r="25" fill="#FBBF24"/>
                    <path d="M80,75 Q80,60 95,60 Q110,60 110,75" fill="#1F2937"/>
                    <path d="M120,75 Q120,60 135,60 Q150,60 150,75" fill="#1F2937"/>
                    <path d="M50,100 L30,80 M50,100 L30,120" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
                    <path d="M150,100 L170,80 M150,100 L170,120" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
                </svg>`,
            emergencyVehicle: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="40" y="80" width="120" height="60" fill="#DC2626" rx="5"/>
                    <rect x="50" y="70" width="100" height="10" fill="#1E40AF"/>
                    <circle cx="70" cy="140" r="15" fill="#1F2937"/>
                    <circle cx="130" cy="140" r="15" fill="#1F2937"/>
                    <rect x="70" y="60" width="60" height="20" fill="#F59E0B" rx="3"/>
                    <text x="100" y="75" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="white">AMBULANCE</text>
                    <path d="M160,100 L180,100" stroke="#EF4444" stroke-width="3" stroke-dasharray="5,5"/>
                    <path d="M20,100 L40,100" stroke="#10B981" stroke-width="3"/>
                </svg>`,
            bacLimit: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="80" fill="#F3F4F6"/>
                    <circle cx="100" cy="100" r="70" fill="white" stroke="#1E40AF" stroke-width="3"/>
                    <path d="M60,60 Q100,30 140,60 Q170,100 140,140 Q100,170 60,140 Q30,100 60,60" 
                          fill="none" stroke="#EF4444" stroke-width="8" stroke-dasharray="5,5"/>
                    <text x="100" y="90" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="40" fill="#DC2626">0.08</text>
                    <text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6B7280">% BAC</text>
                    <path d="M100,130 L100,150 M90,140 L110,140" stroke="#DC2626" stroke-width="3"/>
                </svg>`,
            parkingDownhill: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <path d="M20,150 L180,50" stroke="#6B7280" stroke-width="4" stroke-linecap="round"/>
                    <rect x="100" y="80" width="40" height="30" fill="#3B82F6" rx="3"/>
                    <path d="M120,110 L120,130 L110,130" stroke="#1E40AF" stroke-width="3" fill="none"/>
                    <path d="M20,150 L180,150" stroke="#92400E" stroke-width="6"/>
                    <circle cx="110" cy="140" r="8" fill="#1F2937"/>
                    <circle cx="130" cy="140" r="8" fill="#1F2937"/>
                    <path d="M100,85 L140,85" stroke="#1E40AF" stroke-width="2"/>
                </svg>`,
            solidYellow: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" fill="#FEF3C7"/>
                    <rect x="80" y="30" width="40" height="140" fill="#D97706"/>
                    <path d="M100,50 L120,70 M100,50 L80,70" stroke="#92400E" stroke-width="3" fill="none"/>
                    <path d="M100,150 L80,130 M100,150 L120,130" stroke="#92400E" stroke-width="3" fill="none"/>
                    <rect x="40" y="90" width="30" height="20" fill="#3B82F6" rx="3"/>
                    <rect x="130" y="90" width="30" height="20" fill="#EF4444" rx="3"/>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#92400E">NO PASSING</text>
                </svg>`,
            turnSignals: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="50" y="70" width="100" height="60" fill="#1F2937" rx="5"/>
                    <circle cx="70" cy="140" r="15" fill="#1F2937"/>
                    <circle cx="130" cy="140" r="15" fill="#1F2937"/>
                    <path d="M70,100 L30,100" stroke="#F59E0B" stroke-width="4" stroke-dasharray="3,3"/>
                    <path d="M130,100 L170,100" stroke="#F59E0B" stroke-width="4" stroke-dasharray="3,3"/>
                    <circle cx="85" cy="100" r="8" fill="#F59E0B" class="blink-left">
                        <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="115" cy="100" r="8" fill="#F59E0B" class="blink-right">
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite"/>
                    </circle>
                    <text x="100" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">100 ft</text>
                </svg>`,
            flashingYellow: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="70" y="50" width="60" height="100" fill="#1F2937" rx="5"/>
                    <circle cx="100" cy="80" r="20" fill="#F59E0B" class="blink">
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                    <rect x="85" y="110" width="30" height="30" fill="#374151" rx="3"/>
                    <path d="M100,120 L100,135 M92,127 L108,127" stroke="#9CA3AF" stroke-width="3" stroke-linecap="round"/>
                    <text x="100" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#D97706">PROCEED WITH CAUTION</text>
                </svg>`,
            childSeat: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="80" y="60" width="40" height="60" fill="#3B82F6" rx="5"/>
                    <circle cx="100" cy="50" r="20" fill="#F3F4F6"/>
                    <circle cx="95" cy="45" r="3" fill="#1F2937"/>
                    <circle cx="105" cy="45" r="3" fill="#1F2937"/>
                    <path d="M95,55 Q100,60 105,55" stroke="#EF4444" stroke-width="2" fill="none"/>
                    <path d="M80,120 L120,120" stroke="#1E40AF" stroke-width="4"/>
                    <path d="M85,120 L85,140 M115,120 L115,140" stroke="#1E40AF" stroke-width="3"/>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#3B82F6">UNDER 8 YEARS</text>
                </svg>`,
            moveOverLaw: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="80" width="160" height="40" fill="#6B7280" rx="5"/>
                    <rect x="40" y="85" width="40" height="30" fill="#DC2626" rx="3">
                        <animate attributeName="x" values="40;140;40" dur="3s" repeatCount="indefinite"/>
                    </rect>
                    <rect x="120" y="85" width="40" height="30" fill="#10B981" rx="3">
                        <animate attributeName="x" values="120;20;120" dur="3s" repeatCount="indefinite"/>
                    </rect>
                    <path d="M100,60 L100,80 M90,70 L110,70" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
                    <text x="100" y="50" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#1E40AF">MOVE OVER</text>
                    <text x="100" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#6B7280">OR SLOW DOWN</text>
                </svg>`
        };

        return svgs[ruleType];
    }

    // Generate SVG for driving scenarios
    generateScenarioSVG(scenarioType) {
        const svgs = {
            heavyRain: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="20" width="160" height="160" fill="#1E40AF"/>
                    <rect x="40" y="80" width="120" height="40" fill="#3B82F6" rx="5"/>
                    <circle cx="70" cy="140" r="15" fill="#1F2937"/>
                    <circle cx="130" cy="140" r="15" fill="#1F2937"/>
                    <circle cx="80" cy="100" r="15" fill="#FBBF24"/>
                    <circle cx="120" cy="100" r="15" fill="#FBBF24"/>
                    <!-- Rain drops -->
                    <g id="rain">
                        <circle cx="50" cy="40" r="2" fill="#93C5FD">
                            <animate attributeName="cy" values="40;180;40" dur="1.5s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="80" cy="30" r="2" fill="#93C5FD">
                            <animate attributeName="cy" values="30;180;30" dur="1.2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="110" cy="50" r="2" fill="#93C5FD">
                            <animate attributeName="cy" values="50;180;50" dur="1.8s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="140" cy="20" r="2" fill="#93C5FD">
                            <animate attributeName="cy" values="20;180;20" dur="1s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="170" cy="60" r="2" fill="#93C5FD">
                            <animate attributeName="cy" values="60;180;60" dur="1.6s" repeatCount="indefinite"/>
                        </circle>
                    </g>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#93C5FD">REDUCED VISIBILITY</text>
                </svg>`,
            brakeFailure: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <path d="M20,150 L180,50" stroke="#6B7280" stroke-width="4" stroke-linecap="round"/>
                    <rect x="100" y="80" width="40" height="30" fill="#EF4444" rx="3"/>
                    <path d="M120,110 L120,130 L110,130" stroke="#DC2626" stroke-width="3" fill="none"/>
                    <circle cx="110" cy="140" r="8" fill="#1F2937"/>
                    <circle cx="130" cy="140" r="8" fill="#1F2937"/>
                    <!-- Brake lines with warning -->
                    <path d="M105,85 L135,85" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,3"/>
                    <path d="M105,95 L135,95" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,3"/>
                    <path d="M105,105 L135,105" stroke="#DC2626" stroke-width="2" stroke-dasharray="3,3"/>
                    <circle cx="100" cy="70" r="10" fill="#F59E0B">
                        <animate attributeName="r" values="10;12;10" dur="0.5s" repeatCount="indefinite"/>
                    </circle>
                    <text x="100" cy="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#92400E">!</text>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#DC2626">BRAKE FAILURE</text>
                </svg>`,
            deerCrossing: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="100" width="160" height="40" fill="#6B7280" rx="5"/>
                    <rect x="60" y="110" width="40" height="20" fill="#3B82F6" rx="3"/>
                    <!-- Deer -->
                    <path d="M140,120 Q160,100 180,120" stroke="#92400E" stroke-width="8" stroke-linecap="round"/>
                    <circle cx="160" cy="100" r="10" fill="#92400E"/>
                    <path d="M165,95 L175,90 M155,95 L145,90" stroke="#92400E" stroke-width="2"/>
                    <circle cx="158" cy="98" r="2" fill="white"/>
                    <!-- Warning sign -->
                    <path d="M60,70 Q80,50 100,70 Q120,90 100,110 Q80,130 60,110 Q40,90 60,70" 
                          fill="#F59E0B" stroke="#92400E" stroke-width="2"/>
                    <path d="M80,90 L80,100 M80,90 L70,80 M80,90 L90,80" stroke="#92400E" stroke-width="3"/>
                    <text x="100" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#92400E">DEER CROSSING</text>
                </svg>`,
            tireBlowout: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="60" y="80" width="80" height="40" fill="#6B7280" rx="5"/>
                    <circle cx="80" cy="140" r="20" fill="#1F2937"/>
                    <circle cx="120" cy="140" r="20" fill="#1F2937"/>
                    <!-- Blown tire -->
                    <circle cx="80" cy="140" r="15" fill="#4B5563" stroke="#DC2626" stroke-width="3">
                        <animate attributeName="r" values="15;18;15" dur="0.3s" repeatCount="indefinite"/>
                    </circle>
                    <path d="M70,130 L90,150 M90,130 L70,150" stroke="#DC2626" stroke-width="3"/>
                    <!-- Skid marks -->
                    <path d="M60,160 Q70,155 80,160 Q90,165 100,160" stroke="#6B7280" stroke-width="2" fill="none"/>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#DC2626">TIRE BLOWOUT</text>
                </svg>`,
            crashScene: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="40" y="100" width="40" height="30" fill="#3B82F6" rx="3"/>
                    <rect x="120" y="90" width="40" height="30" fill="#EF4444" rx="3"/>
                    <!-- Crash debris -->
                    <path d="M90,110 L110,130" stroke="#6B7280" stroke-width="3"/>
                    <path d="M100,100 L120,80" stroke="#6B7280" stroke-width="3"/>
                    <!-- Warning triangle -->
                    <path d="M100,50 L120,70 L80,70 Z" fill="#F59E0B" stroke="#92400E" stroke-width="2"/>
                    <path d="M100,60 L100,65 M95,62 L105,62" stroke="#92400E" stroke-width="2"/>
                    <!-- Emergency phone -->
                    <rect x="95" y="140" width="10" height="15" fill="#10B981" rx="2"/>
                    <path d="M100,155 L100,160" stroke="#10B981" stroke-width="2"/>
                    <text x="100" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#10B981">CALL 911 FIRST</text>
                </svg>`,
            tailgating: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="80" width="160" height="40" fill="#E5E7EB" rx="5"/>
                    <rect x="30" y="85" width="40" height="30" fill="#10B981" rx="3"/>
                    <rect x="85" y="85" width="40" height="30" fill="#EF4444" rx="3"/>
                    <rect x="140" y="85" width="40" height="30" fill="#EF4444" rx="3">
                        <animate attributeName="x" values="140;135;140" dur="0.5s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Distance indicator -->
                    <path d="M70,100 L85,100" stroke="#6B7280" stroke-width="2" stroke-dasharray="3,3"/>
                    <path d="M125,100 L140,100" stroke="#DC2626" stroke-width="2">
                        <animate attributeName="stroke-dasharray" values="3,3;1,5;3,3" dur="1s" repeatCount="indefinite"/>
                    </path>
                    <text x="100" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#DC2626">TAILGATING</text>
                    <text x="100" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#10B981">CHANGE LANES</text>
                </svg>`,
            icySkid: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="80" width="160" height="40" fill="#93C5FD" rx="5"/>
                    <rect x="60" y="85" width="40" height="30" fill="#3B82F6" rx="3">
                        <animateTransform attributeName="transform" type="rotate" values="0 80 100; 15 80 100; -15 80 100; 0 80 100" dur="2s" repeatCount="indefinite"/>
                    </rect>
                    <!-- Skid marks -->
                    <path d="M40,100 Q60,90 80,100 Q100,110 120,100" stroke="#1E40AF" stroke-width="2" fill="none"/>
                    <!-- Snowflakes -->
                    <g id="snow">
                        <path d="M30,50 L30,55 M28,52 L32,52" stroke="#93C5FD" stroke-width="1">
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 130; 0 0" dur="3s" repeatCount="indefinite"/>
                        </path>
                        <path d="M60,30 L60,35 M58,32 L62,32" stroke="#93C5FD" stroke-width="1">
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 130; 0 0" dur="2.5s" repeatCount="indefinite"/>
                        </path>
                        <path d="M150,40 L150,45 M148,42 L152,42" stroke="#93C5FD" stroke-width="1">
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 130; 0 0" dur="3.2s" repeatCount="indefinite"/>
                        </path>
                    </g>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#1E40AF">STEER INTO SKID</text>
                </svg>`,
            floodedRoad: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="20" y="120" width="160" height="40" fill="#1E40AF"/>
                    <rect x="60" y="100" width="40" height="20" fill="#3B82F6" rx="3"/>
                    <!-- Water waves -->
                    <path d="M20,120 Q60,110 100,120 Q140,130 180,120" stroke="#93C5FD" stroke-width="3" fill="none">
                        <animate attributeName="d" values="M20,120 Q60,110 100,120 Q140,130 180,120;M20,120 Q60,115 100,120 Q140,125 180,120;M20,120 Q60,110 100,120 Q140,130 180,120" dur="2s" repeatCount="indefinite"/>
                    </path>
                    <!-- Warning sign -->
                    <path d="M100,50 Q120,40 140,50 Q150,70 130,80 Q110,90 90,80 Q70,70 80,50 Q90,30 100,50" 
                          fill="#DC2626" stroke="#7F1D1D" stroke-width="2"/>
                    <path d="M100,60 L100,70 M95,65 L105,65" stroke="white" stroke-width="3"/>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#DC2626">TURN AROUND DON'T DROWN</text>
                </svg>`,
            drowsyDriving: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="60" y="80" width="80" height="40" fill="#3B82F6" rx="5"/>
                    <circle cx="80" cy="140" r="15" fill="#1F2937"/>
                    <circle cx="120" cy="140" r="15" fill="#1F2937"/>
                    <!-- Sleepy driver -->
                    <circle cx="100" cy="100" r="15" fill="#F3F4F6"/>
                    <path d="M95,95 L95,98 M105,95 L105,98" stroke="#1F2937" stroke-width="2"/>
                    <path d="M100,105 Q103,108 100,110 Q97,108 100,105" fill="#EF4444" stroke="#DC2626" stroke-width="1"/>
                    <!-- Zzz's -->
                    <text x="120" y="90" font-family="Arial, sans-serif" font-size="20" fill="#F59E0B">
                        Z
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                    </text>
                    <text x="130" y="85" font-family="Arial, sans-serif" font-size="20" fill="#F59E0B">
                        Z
                        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite"/>
                    </text>
                    <text x="140" y="80" font-family="Arial, sans-serif" font-size="20" fill="#F59E0B">
                        Z
                        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
                    </text>
                    <!-- Coffee cup -->
                    <path d="M60,60 Q70,50 80,60 L80,70 Q70,80 60,70 Z" fill="#92400E"/>
                    <path d="M80,65 L90,55" stroke="#92400E" stroke-width="3"/>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#92400E">PULL OVER AND REST</text>
                </svg>`,
            stuckAccelerator: `<svg width="200" height="200" viewBox="0 0 200 200">
                    <rect x="60" y="80" width="80" height="40" fill="#EF4444" rx="5"/>
                    <circle cx="80" cy="140" r="15" fill="#1F2937"/>
                    <circle cx="120" cy="140" r="15" fill="#1F2937"/>
                    <!-- Accelerator pedal -->
                    <rect x="110" y="70" width="20" height="10" fill="#4B5563" rx="2">
                        <animate attributeName="y" values="70;65;70" dur="0.5s" repeatCount="indefinite"/>
                    </rect>
                    <path d="M120,70 L120,60" stroke="#DC2626" stroke-width="3"/>
                    <!-- Neutral indicator -->
                    <rect x="85" y="60" width="30" height="20" fill="#10B981" rx="3"/>
                    <text x="100" y="73" text-anchor="middle" font-family="Arial Black, sans-serif" font-size="16" fill="white">N</text>
                    <!-- Speed lines -->
                    <path d="M140,100 L160,90 M140,110 L160,120" stroke="#3B82F6" stroke-width="2" stroke-dasharray="3,3">
                        <animate attributeName="opacity" values="1;0.5;1" dur="0.3s" repeatCount="indefinite"/>
                    </path>
                    <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#DC2626">SHIFT TO NEUTRAL</text>
                </svg>`
        };

        return svgs[scenarioType];
    }

    generateSignQuestion(number) {
        const signQuestions = [
            {
                question: "What does this traffic sign mean?",
                imageType: "noEntry",
                options: [
                    "Stop ahead",
                    "Yield to oncoming traffic",
                    "No entry for vehicles",
                    "One-way street"
                ],
                correct: 2,
                explanation: "This is a 'No Entry' sign which prohibits all vehicles from entering a particular road or area."
            },
            {
                question: "This warning sign indicates:",
                imageType: "pedestrian",
                options: [
                    "Pedestrian crossing ahead",
                    "School zone",
                    "Sharp curve to the right",
                    "Road narrows"
                ],
                correct: 0,
                explanation: "This sign warns drivers of a pedestrian crossing ahead. Slow down and be prepared to stop."
            },
            {
                question: "What action is required by this sign?",
                imageType: "stop",
                options: [
                    "Come to a complete stop",
                    "Reduce speed",
                    "Merge left",
                    "No parking allowed"
                ],
                correct: 0,
                explanation: "The octagonal red sign means STOP. You must come to a complete stop at the stop line."
            },
            {
                question: "This regulatory sign means:",
                imageType: "speedLimit",
                options: [
                    "Maximum speed limit",
                    "Minimum speed limit",
                    "Recommended speed",
                    "End of speed limit"
                ],
                correct: 0,
                explanation: "Circular signs with red borders indicate prohibitions. This sign shows the maximum speed allowed."
            },
            {
                question: "What does this diamond-shaped sign indicate?",
                imageType: "construction",
                options: [
                    "Construction zone ahead",
                    "Railroad crossing",
                    "Deer crossing area",
                    "Slippery when wet"
                ],
                correct: 0,
                explanation: "Orange diamond signs warn of construction zones ahead. Reduce speed and be cautious."
            },
            {
                question: "This sign with a bicycle symbol means:",
                question: "This sign with a bicycle symbol means:",
                imageType: "bicycleLane",
                options: [
                    "Bicycle lane",
                    "No bicycles allowed",
                    "Bicycle crossing",
                    "Bicycle parking"
                ],
                correct: 0,
                explanation: "This sign indicates a designated lane for bicycles only."
            },
            {
                question: "What does this sign mean?",
                imageType: "laneEnds",
                options: [
                    "Keep right",
                    "Lane ends, merge left",
                    "Divided highway begins",
                    "Two-way traffic"
                ],
                correct: 1,
                explanation: "This sign warns that the lane is ending and you should merge into the adjacent lane."
            },
            {
                question: "This sign indicates:",
                imageType: "hospital",
                options: [
                    "Hospital ahead",
                    "First aid station",
                    "Emergency stopping only",
                    "No stopping any time"
                ],
                correct: 0,
                explanation: "The 'H' sign indicates there is a hospital ahead with emergency services."
            },
            {
                question: "What does this sign with a truck on a slope mean?",
                imageType: "steepHill",
                options: [
                    "Steep hill ahead",
                    "Truck crossing",
                    "Runaway truck ramp",
                    "No trucks allowed"
                ],
                correct: 0,
                explanation: "This sign warns of a steep hill ahead. Trucks should use lower gears."
            },
            {
                question: "This sign means:",
                imageType: "yield",
                options: [
                    "Traffic signal ahead",
                    "Stop sign ahead",
                    "Yield ahead",
                    "Pedestrian crossing ahead"
                ],
                correct: 2,
                explanation: "This sign warns drivers to yield to oncoming traffic at the intersection ahead."
            }
        ];

        const q = signQuestions[number - 1];
        return this.createQuestion(
            q.question,
            this.generateSignSVG(q.imageType),
            q.options,
            q.correct,
            q.explanation
        );
    }

    generateRuleQuestion(number) {
        const ruleQuestions = [
            {
                question: "What is the recommended safe following distance in good weather conditions?",
                imageType: "followingDistance",
                options: [
                    "1 second",
                    "2 seconds",
                    "3 seconds",
                    "4 seconds"
                ],
                correct: 2,
                explanation: "The 3-second rule ensures adequate stopping distance in normal driving conditions."
            },
            {
                question: "When must headlights be used according to most state laws?",
                imageType: "headlights",
                options: [
                    "From sunset to sunrise",
                    "30 minutes after sunset until 30 minutes before sunrise",
                    "Only when it's raining",
                    "Whenever visibility is less than 500 feet"
                ],
                correct: 1,
                explanation: "Most states require headlights from 30 minutes after sunset until 30 minutes before sunrise."
            },
            {
                question: "What should you do when an emergency vehicle approaches with sirens?",
                imageType: "emergencyVehicle",
                options: [
                    "Speed up to clear the way",
                    "Pull over to the right and stop",
                    "Continue driving normally",
                    "Flash your lights to acknowledge"
                ],
                correct: 1,
                explanation: "You must pull over to the right side of the road and stop to allow emergency vehicles to pass."
            },
            {
                question: "The legal blood alcohol concentration (BAC) limit for most drivers is:",
                imageType: "bacLimit",
                options: [
                    "0.08%",
                    "0.05%",
                    "0.10%",
                    "0.00%"
                ],
                correct: 0,
                explanation: "In most states, the legal BAC limit is 0.08% for drivers over 21 years old."
            },
            {
                question: "When parking downhill with a curb, you should turn your wheels:",
                imageType: "parkingDownhill",
                options: [
                    "Toward the curb",
                    "Away from the curb",
                    "Straight ahead",
                    "It doesn't matter"
                ],
                correct: 0,
                explanation: "Turn wheels toward the curb so the vehicle will roll into it if the brakes fail."
            },
            {
                question: "What does a solid yellow line on your side of the road indicate?",
                imageType: "solidYellow",
                options: [
                    "No passing allowed",
                    "Passing zone",
                    "HOV lane",
                    "Bike lane"
                ],
                correct: 0,
                explanation: "A solid yellow line on your side means passing is prohibited."
            },
            {
                question: "When should you use your turn signals?",
                imageType: "turnSignals",
                options: [
                    "At least 100 feet before turning or changing lanes",
                    "Only when other cars are present",
                    "Just as you begin to turn",
                    "When entering a highway"
                ],
                correct: 0,
                explanation: "Signals should be used at least 100 feet before turning to alert other drivers."
            },
            {
                question: "What should you do at a flashing yellow traffic signal?",
                imageType: "flashingYellow",
                options: [
                    "Stop completely",
                    "Slow down and proceed with caution",
                    "Treat as a stop sign",
                    "Speed up to clear intersection"
                ],
                correct: 1,
                explanation: "Flashing yellow means proceed with caution after yielding to pedestrians and traffic."
            },
            {
                question: "Children under what age should be in a child safety seat?",
                imageType: "childSeat",
                options: [
                    "5 years",
                    "6 years",
                    "7 years",
                    "8 years"
                ],
                correct: 3,
                explanation: "Most states require child safety seats for children under 8 years old."
            },
            {
                question: "What is the 'Move Over' law designed to protect?",
                imageType: "moveOverLaw",
                options: [
                    "Emergency and service vehicles stopped on roadside",
                    "Slow-moving vehicles",
                    "Bicycles on the road",
                    "Construction workers"
                ],
                correct: 0,
                explanation: "Move Over laws require drivers to change lanes or slow down when passing stopped emergency vehicles."
            }
        ];

        const q = ruleQuestions[number - 1];
        return this.createQuestion(
            q.question,
            this.generateRuleSVG(q.imageType),
            q.options,
            q.correct,
            q.explanation
        );
    }

    generateScenarioQuestion(number) {
        const scenarioQuestions = [
            {
                question: "You're driving in heavy rain with reduced visibility. What should you do?",
                imageType: "heavyRain",
                options: [
                    "Turn on headlights and reduce speed",
                    "Use hazard lights and maintain speed",
                    "Speed up to get out of rain quickly",
                    "Pull over immediately"
                ],
                correct: 0,
                explanation: "In heavy rain, use headlights, reduce speed by 1/3, and double your following distance."
            },
            {
                question: "Your brakes fail while driving downhill. What's your first action?",
                imageType: "brakeFailure",
                options: [
                    "Pump brake pedal rapidly",
                    "Use parking brake immediately",
                    "Shift to neutral",
                    "Turn off ignition"
                ],
                correct: 0,
                explanation: "First, pump brakes rapidly. If that fails, use parking brake gradually and shift to lower gear."
            },
            {
                question: "You see a deer crossing the road ahead. What should you do?",
                imageType: "deerCrossing",
                options: [
                    "Brake firmly and stay in your lane",
                    "Swerve to avoid hitting it",
                    "Flash your lights and honk",
                    "Speed up to scare it away"
                ],
                correct: 0,
                explanation: "Brake firmly, stay in your lane. Swerving could cause a more serious accident."
            },
            {
                question: "Your tire blows out at highway speed. What's the correct response?",
                imageType: "tireBlowout",
                options: [
                    "Hold steering wheel firmly and brake gently",
                    "Brake hard immediately",
                    "Steer sharply to the shoulder",
                    "Accelerate to maintain control"
                ],
                correct: 0,
                explanation: "Hold wheel firmly, don't brake hard, coast to safe stop on shoulder."
            },
            {
                question: "You're first at a crash scene. What should you do first?",
                imageType: "crashScene",
                options: [
                    "Secure the scene and call 911",
                    "Move injured people to safety",
                    "Start giving first aid immediately",
                    "Take photos for evidence"
                ],
                correct: 0,
                explanation: "First secure scene from further danger, then call emergency services before assisting injured."
            },
            {
                question: "You're being tailgated in the fast lane. What should you do?",
                imageType: "tailgating",
                options: [
                    "Safely change lanes and let them pass",
                    "Brake check to warn them",
                    "Speed up to create distance",
                    "Ignore and maintain speed"
                ],
                correct: 0,
                explanation: "Safely change lanes to let aggressive drivers pass. Don't engage or brake check."
            },
            {
                question: "You start to skid on an icy road. What's the proper response?",
                imageType: "icySkid",
                options: [
                    "Steer in direction of skid and ease off gas",
                    "Brake hard to stop skid",
                    "Steer opposite direction of skid",
                    "Accelerate to regain traction"
                ],
                correct: 0,
                explanation: "Steer in direction of skid, don't brake, let vehicle straighten naturally."
            },
            {
                question: "You approach a flooded section of road. What should you do?",
                imageType: "floodedRoad",
                options: [
                    "Turn around and find alternate route",
                    "Drive through slowly",
                    "Drive through quickly",
                    "Wait for water to recede"
                ],
                correct: 0,
                explanation: "Never drive through flooded roads. Turn around - 'Turn around, don't drown.'"
            },
            {
                question: "You feel drowsy while driving long distance. What's safest?",
                imageType: "drowsyDriving",
                options: [
                    "Pull over safely and take a break",
                    "Open windows and turn up radio",
                    "Drink coffee and continue",
                    "Speed up to arrive sooner"
                ],
                correct: 0,
                explanation: "Pull over safely and rest. Drowsy driving is as dangerous as drunk driving."
            },
            {
                question: "Your accelerator sticks. What should you do first?",
                imageType: "stuckAccelerator",
                options: [
                    "Shift to neutral and brake",
                    "Turn off ignition",
                    "Pump the accelerator",
                    "Use parking brake"
                ],
                correct: 0,
                explanation: "Shift to neutral to disconnect engine from wheels, then brake to safe stop."
            }
        ];

        const q = scenarioQuestions[number - 1];
        return this.createQuestion(
            q.question,
            this.generateScenarioSVG(q.imageType),
            q.options,
            q.correct,
            q.explanation
        );
    }

    async loadQuestion() {
        const question = this.questions[this.currentQuestionIndex];

        // Update question display
        this.currentQuestionEl.textContent = this.currentQuestionIndex + 1;
        this.questionCategory.textContent = this.getCategoryName(this.currentCategory);
        this.questionText.textContent = question.question;

        // Update image
        this.questionImage.innerHTML = `
            <div class="svg-container">
                ${question.imageData}
            </div>
        `;

        // Update options
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.innerHTML = `
                <span class="option-number">${String.fromCharCode(65 + index)}</span>
                ${option}
            `;

            // Check if user already answered this question
            const userAnswer = this.userAnswers[this.currentQuestionIndex];
            if (userAnswer !== undefined) {
                if (index === question.correct) {
                    optionBtn.classList.add('correct');
                }
                if (userAnswer === index && userAnswer !== question.correct) {
                    optionBtn.classList.add('incorrect');
                }
                if (userAnswer === index) {
                    optionBtn.classList.add('selected');
                }
                optionBtn.disabled = true;
            } else {
                optionBtn.addEventListener('click', () => this.selectOption(index));
            }

            this.optionsContainer.appendChild(optionBtn);
        });

        // Update navigation buttons
        this.previousBtn.disabled = this.currentQuestionIndex === 0;

        if (this.currentQuestionIndex === this.questions.length - 1) {
            this.nextBtn.style.display = 'none';
            this.finishBtn.style.display = 'flex';
        } else {
            this.nextBtn.style.display = 'flex';
            this.finishBtn.style.display = 'none';
        }

        this.updateProgressBar();
    }

    selectOption(optionIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = optionIndex === question.correct;

        // Store user's answer
        this.userAnswers[this.currentQuestionIndex] = optionIndex;

        // Update score
        if (isCorrect) {
            this.score += 10;
            this.correctAnswers++;
            this.updateScoreDisplay();
        }

        // Show correct/incorrect styling
        const optionButtons = this.optionsContainer.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, idx) => {
            if (idx === question.correct) {
                btn.classList.add('correct');
            }
            if (idx === optionIndex && !isCorrect) {
                btn.classList.add('incorrect');
            }
            btn.classList.add('selected');
            btn.disabled = true;
        });

        // Auto-advance after delay
        clearTimeout(this.timer);
        setTimeout(() => {
            if (this.currentQuestionIndex < this.questions.length - 1) {
                this.nextQuestion();
            } else {
                this.finishQuiz();
            }
        }, 1500);
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.loadQuestion();
            this.resetTimer();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.loadQuestion();
            this.resetTimer();
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz() {
        clearInterval(this.timer);
        this.totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.showScreen(this.resultsScreen);
        this.displayResults();
        this.updateHighScore();
    }

    displayResults() {
        const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);

        // Update results display
        this.finalScoreEl.textContent = percentage;
        this.resultUserName.textContent = this.userName;
        this.finalCorrectEl.textContent = `${this.correctAnswers}/${this.questions.length}`;

        // Format time
        const minutes = Math.floor(this.totalTime / 60);
        const seconds = this.totalTime % 60;
        this.timeTakenEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        // Set rank based on score
        let rank = 'Beginner';
        if (percentage >= 90) rank = 'Expert';
        else if (percentage >= 70) rank = 'Advanced';
        else if (percentage >= 50) rank = 'Intermediate';
        this.userRankEl.textContent = rank;

        // Set message based on performance
        let message = '';
        if (percentage >= 90) {
            message = 'Outstanding! You have exceptional road safety knowledge.';
        } else if (percentage >= 70) {
            message = 'Great job! You have good understanding of road safety.';
        } else if (percentage >= 50) {
            message = 'Good effort! Review the areas you missed to improve.';
        } else {
            message = 'Keep learning! Road safety is important for everyone.';
        }
        this.resultMessage.textContent = message;

        // Add learned points from incorrect answers
        this.learnedPoints.innerHTML = '';
        this.questions.forEach((q, index) => {
            if (this.userAnswers[index] !== q.correct) {
                const li = document.createElement('li');
                li.innerHTML = `<i class="ri-lightbulb-line"></i> ${q.explanation}`;
                this.learnedPoints.appendChild(li);
            }
        });

        // If all correct, add a general tip
        if (this.learnedPoints.children.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = '<i class="ri-star-line"></i> Excellent! Keep staying updated with road safety rules.';
            this.learnedPoints.appendChild(li);
        }
    }

    startTimer() {
        this.timeLeft = this.getTimeForDifficulty();
        this.timerEl.textContent = this.timeLeft;
        this.timerEl.parentElement.classList.remove('warning');

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerEl.textContent = this.timeLeft;

            // Warning when time is low
            if (this.timeLeft <= 5) {
                this.timerEl.parentElement.classList.add('warning');
            }

            // Time's up
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                if (this.currentQuestionIndex < this.questions.length - 1) {
                    this.nextQuestion();
                } else {
                    this.finishQuiz();
                }
            }
        }, 1000);
    }

    resetTimer() {
        clearInterval(this.timer);
        this.timeLeft = this.getTimeForDifficulty();
        this.timerEl.textContent = this.timeLeft;
        this.timerEl.parentElement.classList.remove('warning');
        this.startTimer();
    }

    getTimeForDifficulty() {
        switch (this.currentDifficulty) {
            case 'easy': return 30;
            case 'medium': return 20;
            case 'hard': return 15;
            default: return 30;
        }
    }

    getCategoryName(category) {
        const names = {
            signs: 'Traffic Signs',
            rules: 'Safety Rules',
            scenarios: 'Driving Scenarios'
        };
        return names[category] || 'General Knowledge';
    }

    updateProgressBar() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        this.progressFill.style.width = `${progress}%`;
    }

    updateScoreDisplay() {
        this.currentScoreEl.textContent = this.score;
        this.correctCountEl.textContent = this.correctAnswers;
    }

    loadHighScore() {
        const savedScore = localStorage.getItem('roadSafetyQuizHighScore');
        if (savedScore) {
            this.highScoreEl.textContent = savedScore;
        }
    }

    updateHighScore() {
        const currentScore = Math.round((this.correctAnswers / this.questions.length) * 100);
        const currentHighScore = parseInt(this.highScoreEl.textContent);

        if (currentScore > currentHighScore) {
            this.highScoreEl.textContent = currentScore;
            localStorage.setItem('roadSafetyQuizHighScore', currentScore);

            // Show congratulatory message
            this.resultMessage.textContent += ` 🎉 New High Score!`;
        }
    }

    showScreen(screen) {
        // Hide all screens
        this.welcomeScreen.classList.remove('active');
        this.quizScreen.classList.remove('active');
        this.resultsScreen.classList.remove('active');

        // Show requested screen
        screen.classList.add('active');
    }

    viewAnswers() {
        const reviewModal = document.createElement('div');
        reviewModal.className = 'modal active';
        reviewModal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3><i class="ri-eye-line"></i> Quiz Review</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body" style="max-height: 400px; overflow-y: auto;">
                    <div class="review-summary">
                        <h4>${this.userName}'s Performance</h4>
                        <p>Score: <strong>${Math.round((this.correctAnswers / this.questions.length) * 100)}%</strong> | 
                           Correct: <strong>${this.correctAnswers}/${this.questions.length}</strong></p>
                    </div>
                    ${this.questions.map((q, index) => {
            const userAnswerIndex = this.userAnswers[index];
            const isCorrect = userAnswerIndex === q.correct;
            const userAnswer = userAnswerIndex !== undefined ? q.options[userAnswerIndex] : 'Not answered';

            return `
                            <div class="review-item ${isCorrect ? 'correct-review' : 'incorrect-review'}">
                                <h5>Question ${index + 1}</h5>
                                <p><strong>${q.question}</strong></p>
                                <div class="svg-container" style="margin: 10px 0; text-align: center;">
                                    ${q.imageData}
                                </div>
                                <div class="review-answers">
                                    <p><i class="ri-check-line" style="color: #10b981;"></i> <strong>Correct:</strong> ${q.options[q.correct]}</p>
                                    <p><i class="${isCorrect ? 'ri-check-line' : 'ri-close-line'}" 
                                          style="color: ${isCorrect ? '#10b981' : '#ef4444'}"></i> 
                                       <strong>Your answer:</strong> ${userAnswer}</p>
                                </div>
                                <p class="explanation"><i class="ri-lightbulb-line"></i> ${q.explanation}</p>
                            </div>
                        `;
        }).join('')}
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal').remove()" class="btn-primary">Close Review</button>
                </div>
            </div>
        `;

        document.body.appendChild(reviewModal);

        // Add close functionality
        reviewModal.querySelector('.close-modal').addEventListener('click', () => {
            reviewModal.remove();
        });

        reviewModal.addEventListener('click', (e) => {
            if (e.target === reviewModal) reviewModal.remove();
        });
    }

    generateCertificate() {
        const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);
        const today = new Date();
        const dateStr = today.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Determine grade based on percentage
        let grade = '';
        if (percentage >= 90) grade = 'A+ (Excellent)';
        else if (percentage >= 80) grade = 'A (Very Good)';
        else if (percentage >= 70) grade = 'B (Good)';
        else if (percentage >= 60) grade = 'C (Satisfactory)';
        else grade = 'D (Needs Improvement)';

        const certificateHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Road Safety Certificate</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Montserrat:wght@400;600&display=swap');
                    body { 
                        margin: 0; 
                        padding: 40px; 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        font-family: 'Montserrat', sans-serif;
                    }
                    .certificate {
                        width: 800px;
                        padding: 50px;
                        background: #fff;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                        border: 20px solid transparent;
                        border-image: linear-gradient(45deg, #667eea, #764ba2) 1;
                        position: relative;
                        overflow: hidden;
                    }
                    .certificate:before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="%23f0f0f0" stroke-width="1"/></svg>');
                        opacity: 0.1;
                        z-index: 0;
                    }
                    .certificate-content {
                        position: relative;
                        z-index: 1;
                    }
                    .header {
                        margin-bottom: 40px;
                    }
                    .header h1 {
                        font-family: 'Playfair Display', serif;
                        font-size: 48px;
                        color: #2d3748;
                        margin-bottom: 10px;
                        letter-spacing: 2px;
                    }
                    .header p {
                        color: #718096;
                        font-size: 18px;
                        letter-spacing: 8px;
                        text-transform: uppercase;
                    }
                    .achievement {
                        margin: 40px 0;
                        padding: 30px;
                        background: linear-gradient(135deg, #f6f9ff 0%, #f0f4ff 100%);
                        border-radius: 15px;
                        border-left: 5px solid #667eea;
                    }
                    .achievement h2 {
                        font-size: 36px;
                        color: #2d3748;
                        margin-bottom: 10px;
                    }
                    .achievement .score {
                        font-size: 72px;
                        font-weight: bold;
                        background: linear-gradient(45deg, #667eea, #764ba2);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        margin: 20px 0;
                    }
                    .details {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 20px;
                        margin: 40px 0;
                        text-align: left;
                    }
                    .detail-item {
                        padding: 15px;
                        background: #f8fafc;
                        border-radius: 10px;
                    }
                    .detail-item h4 {
                        color: #4a5568;
                        margin-bottom: 5px;
                        font-size: 14px;
                        text-transform: uppercase;
                    }
                    .detail-item p {
                        color: #2d3748;
                        font-size: 18px;
                        font-weight: 600;
                    }
                    .signatures {
                        display: flex;
                        justify-content: space-around;
                        margin-top: 60px;
                        padding-top: 40px;
                        border-top: 2px solid #e2e8f0;
                    }
                    .signature {
                        text-align: center;
                    }
                    .signature p {
                        margin-top: 20px;
                        color: #4a5568;
                        border-top: 1px solid #cbd5e0;
                        padding-top: 10px;
                    }
                    .logo {
                        margin-top: 40px;
                        color: #667eea;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .print-button {
                        margin-top: 30px;
                        padding: 15px 30px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: all 0.3s;
                    }
                    .print-button:hover {
                        background: #5a67d8;
                        transform: translateY(-2px);
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="certificate-content">
                        <div class="header">
                            <h1>Certificate of Achievement</h1>
                            <p>Road Safety Awareness</p>
                        </div>
                        
                        <div class="achievement">
                            <p>This certifies that</p>
                            <h2>${this.userName}</h2>
                            <p>has successfully demonstrated knowledge in</p>
                            <div class="score">${percentage}%</div>
                            <p>Road Safety Quiz - ${this.getCategoryName(this.currentCategory)}</p>
                            <p>Grade: <strong>${grade}</strong></p>
                        </div>
                        
                        <div class="details">
                            <div class="detail-item">
                                <h4>Category</h4>
                                <p>${this.getCategoryName(this.currentCategory)}</p>
                            </div>
                            <div class="detail-item">
                                <h4>Difficulty</h4>
                                <p>${this.currentDifficulty.charAt(0).toUpperCase() + this.currentDifficulty.slice(1)}</p>
                            </div>
                            <div class="detail-item">
                                <h4>Correct Answers</h4>
                                <p>${this.correctAnswers} out of ${this.questions.length}</p>
                            </div>
                            <div class="detail-item">
                                <h4>Date</h4>
                                <p>${dateStr}</p>
                            </div>
                        </div>
                        
                        <div class="signatures">
                            <div class="signature">
                                <div style="width: 150px; height: 2px; background: #2d3748; margin: 0 auto;"></div>
                                <p>Road Safety Institute</p>
                            </div>
                            <div class="signature">
                                <div style="width: 150px; height: 2px; background: #2d3748; margin: 0 auto;"></div>
                                <p>Quiz Administrator</p>
                            </div>
                        </div>
                        
                        <div class="logo">
                            <i class="ri-steering-2-line"></i> Drive Safe Initiative
                        </div>
                        
                        <button class="print-button" onclick="window.print()">
                            <i class="ri-printer-line"></i> Print Certificate
                        </button>
                    </div>
                </div>
            </body>
            </html>
        `;

        const newWindow = window.open();
        newWindow.document.write(certificateHTML);
        newWindow.document.close();
    }

    restartQuiz() {
        this.showScreen(this.welcomeScreen);
        this.userNameInput.value = '';
        this.userNameInput.style.borderColor = '';
        this.userNameInput.placeholder = 'Enter your name...';
        this.userNameInput.focus();
    }

    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const icon = this.themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.className = 'ri-moon-line';
            localStorage.setItem('quizTheme', 'dark');
        } else {
            icon.className = 'ri-sun-line';
            localStorage.setItem('quizTheme', 'light');
        }
    }

    showLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('roadSafetyQuizScores') || '[]');

        // Add current score if quiz was completed
        if (this.correctAnswers > 0) {
            const currentScore = Math.round((this.correctAnswers / this.questions.length) * 100);
            const existingIndex = scores.findIndex(s => s.name === this.userName);

            if (existingIndex !== -1) {
                // Update if current score is higher
                if (currentScore > scores[existingIndex].score) {
                    scores[existingIndex].score = currentScore;
                    scores[existingIndex].date = new Date().toLocaleDateString();
                }
            } else {
                // Add new score
                scores.push({
                    name: this.userName,
                    score: currentScore,
                    date: new Date().toLocaleDateString(),
                    category: this.currentCategory
                });
            }

            localStorage.setItem('roadSafetyQuizScores', JSON.stringify(scores));
        }

        // Sort by score (highest first)
        const sortedScores = [...scores].sort((a, b) => b.score - a.score);

        // Create leaderboard modal
        const leaderboardModal = document.createElement('div');
        leaderboardModal.className = 'modal active';
        leaderboardModal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3><i class="ri-trophy-fill"></i> Leaderboard</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${sortedScores.length === 0 ?
                '<p style="text-align: center; padding: 40px;">No scores yet. Complete a quiz to appear here!</p>' :
                `
                        <div class="leaderboard-list">
                            ${sortedScores.slice(0, 10).map((score, index) => {
                    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
                    const isCurrentUser = score.name === this.userName;
                    return `
                                    <div class="leaderboard-item ${isCurrentUser ? 'current-user' : ''}">
                                        <div class="rank">${medal}</div>
                                        <div class="user-info">
                                            <strong>${score.name}</strong>
                                            <span>${score.category ? this.getCategoryName(score.category) : 'General'}</span>
                                        </div>
                                        <div class="score">${score.score}%</div>
                                        <div class="date">${score.date}</div>
                                    </div>
                                `;
                }).join('')}
                        </div>
                        <div class="leaderboard-stats">
                            <p>Total players: <strong>${sortedScores.length}</strong></p>
                            ${sortedScores.length > 0 ?
                    `<p>Top score: <strong>${sortedScores[0].score}%</strong> by ${sortedScores[0].name}</p>` :
                    ''
                }
                        </div>
                        `
            }
                </div>
                <div class="modal-footer">
                    <button onclick="this.closest('.modal').remove()" class="btn-primary">Close</button>
                    ${sortedScores.length > 0 ?
                `<button onclick="localStorage.removeItem('roadSafetyQuizScores'); location.reload();" class="btn-secondary">
                            <i class="ri-delete-bin-line"></i> Clear Leaderboard
                        </button>` :
                ''
            }
                </div>
            </div>
        `;

        document.body.appendChild(leaderboardModal);

        // Add close functionality
        leaderboardModal.querySelector('.close-modal').addEventListener('click', () => {
            leaderboardModal.remove();
        });

        leaderboardModal.addEventListener('click', (e) => {
            if (e.target === leaderboardModal) leaderboardModal.remove();
        });
    }

    shareResults() {
        const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);
        const shareText = `I scored ${percentage}% on the Road Safety Quiz! 🚦 Test your knowledge of traffic signs and driving safety.`;

        if (navigator.share) {
            navigator.share({
                title: 'My Road Safety Quiz Results',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
                this.copyToClipboard(shareText + ' ' + window.location.href);
            });
        } else {
            this.copyToClipboard(shareText + ' ' + window.location.href);
        }
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Results copied to clipboard! 📋 Share with your friends.');
        }).catch(err => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert('Results copied to clipboard! 📋 Share with your friends.');
        });
    }

    showTips() {
        this.tipsModal.classList.add('active');
    }

    closeModal() {
        this.tipsModal.classList.remove('active');
    }
}

// Initialize the quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quiz = new RoadSafetyQuiz();

    // Load saved theme preference
    const savedTheme = localStorage.getItem('quizTheme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        quiz.themeToggle.querySelector('i').className = 'ri-moon-line';
    }

    // Add CSS for additional styles
    const additionalStyles = `
        .svg-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 200px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 10px;
            margin: 20px 0;
            padding: 20px;
        }
        .svg-container img {
            max-width: 100%;
            max-height: 100%;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
        }
        .review-item {
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            background: #f9fafb;
        }
        .review-item.correct-review {
            border-left: 4px solid #10b981;
        }
        .review-item.incorrect-review {
            border-left: 4px solid #ef4444;
        }
        .review-answers {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin: 0.5rem 0;
        }
        .explanation {
            color: #6b7280;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid #e5e7eb;
        }
        .leaderboard-item {
            display: flex;
            align-items: center;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            background: #f9fafb;
            border-radius: 8px;
        }
        .leaderboard-item.current-user {
            background: #dbeafe;
            border: 2px solid #2563eb;
        }
        .rank {
            font-size: 1.2rem;
            font-weight: bold;
            width: 40px;
            text-align: center;
        }
        .user-info {
            flex: 1;
        }
        .user-info span {
            display: block;
            font-size: 0.8rem;
            color: #6b7280;
        }
        .score {
            font-weight: bold;
            color: #2563eb;
            margin: 0 1rem;
        }
        .date {
            font-size: 0.8rem;
            color: #6b7280;
        }
        .leaderboard-stats {
            margin-top: 1rem;
            padding: 1rem;
            background: #f3f4f6;
            border-radius: 8px;
            text-align: center;
        }
        .review-summary {
            text-align: center;
            margin-bottom: 1.5rem;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
        }
        .review-summary h4 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }
        .review-summary p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalStyles;
    document.head.appendChild(styleSheet);
});