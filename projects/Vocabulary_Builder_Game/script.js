const vocabularyData = [
    {
        word: "ELOQUENT",
        definition: "Fluent and persuasive in speaking or writing",
        synonym: "Articulate",
        antonym: "Inarticulate",
        sentence: "The speaker gave an ___ presentation that captivated the audience.",
        options: ["eloquent", "boring", "simple", "quiet"]
    },
    {
        word: "BENEVOLENT",
        definition: "Well-meaning and kindly",
        synonym: "Kind",
        antonym: "Malevolent",
        sentence: "The ___ donor contributed millions to charity.",
        options: ["benevolent", "greedy", "angry", "selfish"]
    },
    {
        word: "DILIGENT",
        definition: "Having or showing care and conscientiousness",
        synonym: "Hardworking",
        antonym: "Lazy",
        sentence: "She was a ___ student who always completed her homework on time.",
        options: ["diligent", "careless", "lazy", "forgetful"]
    },
    {
        word: "AMBIGUOUS",
        definition: "Open to more than one interpretation; unclear",
        synonym: "Unclear",
        antonym: "Clear",
        sentence: "The ___ instructions confused everyone.",
        options: ["ambiguous", "clear", "simple", "direct"]
    },
    {
        word: "RESILIENT",
        definition: "Able to withstand or recover quickly from difficulties",
        synonym: "Strong",
        antonym: "Fragile",
        sentence: "Despite many setbacks, she remained ___ and continued forward.",
        options: ["resilient", "weak", "broken", "defeated"]
    },
    {
        word: "METICULOUS",
        definition: "Showing great attention to detail; very careful",
        synonym: "Careful",
        antonym: "Careless",
        sentence: "The artist was ___ in every brushstroke.",
        options: ["meticulous", "sloppy", "rushed", "casual"]
    },
    {
        word: "INNOVATIVE",
        definition: "Featuring new methods; advanced and original",
        synonym: "Creative",
        antonym: "Traditional",
        sentence: "The company's ___ approach revolutionized the industry.",
        options: ["innovative", "old-fashioned", "boring", "conventional"]
    },
    {
        word: "PROFOUND",
        definition: "Very great or intense; having deep meaning",
        synonym: "Deep",
        antonym: "Shallow",
        sentence: "The book had a ___ impact on my thinking.",
        options: ["profound", "superficial", "minor", "trivial"]
    },
    {
        word: "CANDID",
        definition: "Truthful and straightforward; frank",
        synonym: "Honest",
        antonym: "Dishonest",
        sentence: "I appreciate your ___ feedback on my work.",
        options: ["candid", "deceptive", "vague", "evasive"]
    },
    {
        word: "TENACIOUS",
        definition: "Persistent and determined",
        synonym: "Persistent",
        antonym: "Yielding",
        sentence: "His ___ attitude helped him achieve his goals.",
        options: ["tenacious", "quitting", "weak", "surrendering"]
    },
    {
        word: "VERSATILE",
        definition: "Able to adapt or be adapted to many functions",
        synonym: "Adaptable",
        antonym: "Limited",
        sentence: "She is a ___ athlete who excels in multiple sports.",
        options: ["versatile", "specialized", "limited", "narrow"]
    },
    {
        word: "PRAGMATIC",
        definition: "Dealing with things sensibly and realistically",
        synonym: "Practical",
        antonym: "Idealistic",
        sentence: "We need a ___ solution to this problem.",
        options: ["pragmatic", "unrealistic", "theoretical", "impractical"]
    },
    {
        word: "SKEPTICAL",
        definition: "Not easily convinced; having doubts",
        synonym: "Doubtful",
        antonym: "Trusting",
        sentence: "I'm ___ about claims that sound too good to be true.",
        options: ["skeptical", "gullible", "believing", "trusting"]
    },
    {
        word: "ZEALOUS",
        definition: "Having or showing great energy or enthusiasm",
        synonym: "Enthusiastic",
        antonym: "Apathetic",
        sentence: "The ___ fans cheered loudly for their team.",
        options: ["zealous", "indifferent", "bored", "unenthusiastic"]
    },
    {
        word: "SUBTLE",
        definition: "So delicate or precise as to be difficult to detect",
        synonym: "Delicate",
        antonym: "Obvious",
        sentence: "There was a ___ change in her expression.",
        options: ["subtle", "obvious", "bold", "clear"]
    }
];

let score = 0;
let streak = 0;
let bestStreak = 0;
let wordsLearned = 0;
let currentMode = '';
let currentQuestion = {};
let timer;
let timeLeft = 100;
let totalQuestions = 0;
let correctAnswers = 0;
let learnedWordsList = [];
let usedWords = [];

const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const modeBtns = document.querySelectorAll('.mode-btn');
const restartBtn = document.getElementById('restartBtn');
const changeModeBtn = document.getElementById('changeMode');
const nextBtn = document.getElementById('nextBtn');
const optionsArea = document.getElementById('optionsArea');
const wordDisplay = document.getElementById('wordDisplay');
const questionText = document.getElementById('questionText');
const feedbackEl = document.getElementById('feedback');
const wordInfoEl = document.getElementById('wordInfo');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const wordsLearnedEl = document.getElementById('wordsLearned');
const timerFill = document.getElementById('timerFill');
const modeIndicator = document.getElementById('modeIndicator');
const finalScoreEl = document.getElementById('finalScore');
const finalWordsEl = document.getElementById('finalWords');
const finalStreakEl = document.getElementById('finalStreak');
const accuracyEl = document.getElementById('accuracy');
const learnedWordsDisplay = document.getElementById('learnedWords');

function init() {
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            startGame();
        });
    });
}

function startGame() {
    score = 0;
    streak = 0;
    bestStreak = 0;
    wordsLearned = 0;
    totalQuestions = 0;
    correctAnswers = 0;
    learnedWordsList = [];
    usedWords = [];
    updateStats();
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    setModeIndicator();
    generateQuestion();
}

function setModeIndicator() {
    const modeNames = {
        definition: "Match Definition",
        synonym: "Find Synonym",
        sentence: "Complete Sentence",
        antonym: "Find Antonym"
    };
    modeIndicator.textContent = modeNames[currentMode];
}

function generateQuestion() {
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    wordInfoEl.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    let availableWords = vocabularyData.filter(w => !usedWords.includes(w.word));
    
    if(availableWords.length === 0) {
        endGame();
        return;
    }
    
    const wordData = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(wordData.word);
    
    currentQuestion = {
        word: wordData.word,
        correctAnswer: '',
        options: [],
        wordData: wordData
    };
    
    wordDisplay.textContent = wordData.word;
    
    switch(currentMode) {
        case 'definition':
            questionText.textContent = wordData.definition;
            currentQuestion.correctAnswer = wordData.word.toLowerCase();
            currentQuestion.options = shuffleArray([...wordData.options]);
            break;
            
        case 'synonym':
            questionText.textContent = `Which word is a synonym of ${wordData.word}?`;
            currentQuestion.correctAnswer = wordData.synonym;
            const synonymOptions = [
                wordData.synonym,
                wordData.antonym,
                getRandomWord(),
                getRandomWord()
            ];
            currentQuestion.options = shuffleArray(synonymOptions);
            break;
            
        case 'sentence':
            questionText.textContent = wordData.sentence;
            currentQuestion.correctAnswer = wordData.word.toLowerCase();
            currentQuestion.options = shuffleArray([...wordData.options]);
            break;
            
        case 'antonym':
            questionText.textContent = `Which word is an antonym of ${wordData.word}?`;
            currentQuestion.correctAnswer = wordData.antonym;
            const antonymOptions = [
                wordData.antonym,
                wordData.synonym,
                getRandomWord(),
                getRandomWord()
            ];
            currentQuestion.options = shuffleArray(antonymOptions);
            break;
    }
    
    displayOptions();
    startTimer();
}

function getRandomWord() {
    const words = ["Happy", "Sad", "Fast", "Slow", "Big", "Small", "Smart", "Brave"];
    return words[Math.floor(Math.random() * words.length)];
}

function shuffleArray(array) {
    const newArr = [...array];
    for(let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function displayOptions() {
    optionsArea.innerHTML = '';
    currentQuestion.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.addEventListener('click', () => checkAnswer(option, btn));
        optionsArea.appendChild(btn);
    });
}

function startTimer() {
    timeLeft = 100;
    timerFill.style.width = '100%';
    clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft -= 1;
        timerFill.style.width = timeLeft + '%';
        
        if(timeLeft <= 0) {
            clearInterval(timer);
            handleWrongAnswer();
        }
    }, 150);
}

function checkAnswer(selectedAnswer, btn) {
    clearInterval(timer);
    totalQuestions++;
    
    const allBtns = document.querySelectorAll('.option-btn');
    allBtns.forEach(b => b.disabled = true);
    
    const isCorrect = selectedAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
    
    if(isCorrect) {
        btn.classList.add('correct');
        handleCorrectAnswer();
    } else {
        btn.classList.add('incorrect');
        allBtns.forEach(b => {
            if(b.textContent.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()) {
                b.classList.add('correct');
            }
        });
        handleWrongAnswer();
    }
    
    showWordInfo();
    nextBtn.classList.remove('hidden');
}

function handleCorrectAnswer() {
    correctAnswers++;
    streak++;
    if(streak > bestStreak) bestStreak = streak;
    score += 10 + (streak * 2) + Math.floor(timeLeft / 10);
    wordsLearned++;
    
    if(!learnedWordsList.includes(currentQuestion.word)) {
        learnedWordsList.push(currentQuestion.word);
    }
    
    feedbackEl.textContent = `✅ Correct! +${10 + (streak * 2)} points`;
    feedbackEl.className = 'feedback correct';
    updateStats();
}

function handleWrongAnswer() {
    streak = 0;
    feedbackEl.textContent = `❌ Incorrect! The correct answer is: ${currentQuestion.correctAnswer}`;
    feedbackEl.className = 'feedback incorrect';
    updateStats();
    showWordInfo();
    nextBtn.classList.remove('hidden');
}

function showWordInfo() {
    const wd = currentQuestion.wordData;
    wordInfoEl.innerHTML = `
        <h4>${wd.word}</h4>
        <p><strong>Definition:</strong> ${wd.definition}</p>
        <p><strong>Synonym:</strong> ${wd.synonym}</p>
        <p><strong>Antonym:</strong> ${wd.antonym}</p>
        <p><strong>Example:</strong> ${wd.sentence.replace('___', wd.word.toLowerCase())}</p>
    `;
    wordInfoEl.classList.remove('hidden');
}

function updateStats() {
    scoreEl.textContent = score;
    streakEl.textContent = streak;
    wordsLearnedEl.textContent = learnedWordsList.length;
}

function endGame() {
    clearInterval(timer);
    gameScreen.classList.add('hidden');
    gameOverScreen.classList.remove('hidden');
    
    finalScoreEl.textContent = score;
    finalWordsEl.textContent = learnedWordsList.length;
    finalStreakEl.textContent = bestStreak;
    
    const acc = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    accuracyEl.textContent = acc + '%';
    
    if(learnedWordsList.length > 0) {
        learnedWordsDisplay.innerHTML = '<h3>Words You Learned:</h3>';
        learnedWordsList.forEach(word => {
            const tag = document.createElement('span');
            tag.className = 'word-tag';
            tag.textContent = word;
            learnedWordsDisplay.appendChild(tag);
        });
    }
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    startGame();
}

function changeMode() {
    gameOverScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

restartBtn.addEventListener('click', restartGame);
changeModeBtn.addEventListener('click', changeMode);
nextBtn.addEventListener('click', generateQuestion);

init();
