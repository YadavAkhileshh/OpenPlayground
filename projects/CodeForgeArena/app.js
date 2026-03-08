const { useState, useEffect, useRef, useCallback } = React;

// PERFECTED CARD DATA - Always even numbers with exact pairs
const levelCardsData = {
    1: ['⚡', '⚡', '🐍', '🐍'],  
    2: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹'],  
    3: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹', '⚙️', '⚙️', '☕', '☕'],  
    4: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹', '⚙️', '⚙️', '☕', '☕', '🔤', '🔤', 'λ', 'λ'],  
    5: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹', '⚙️', '⚙️', '☕', '☕', '🔤', '🔤', 'λ', 'λ', '🐦', '🐦', '🅺', '🅺'],  
    6: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹', '⚙️', '⚙️', '☕', '☕', '🔤', '🔤', 'λ', 'λ', '🐦', '🐦', '🅺', '🅺', '💎', '💎', '🎮', '🎮'],  
    7: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹', '⚙️', '⚙️', '☕', '☕', '🔤', '🔤', 'λ', 'λ', '🐦', '🐦', '🅺', '🅺', '💎', '💎', '🎮', '🎮', '🔥', '🔥', '🌟', '🌟'],  
    8: ['⚡', '⚡', '🐍', '🐍', '🦀', '🦀', '🐹', '🐹', '⚙️', '⚙️', '☕', '☕', '🔤', '🔤', 'λ', 'λ', '🐦', '🐦', '🅺', '🅺', '💎', '💎', '🎮', '🎮', '🔥', '🔥', '🌟', '🌟', '🚀', '🚀', '💻', '💻']
};

const challenges = [
    { prompt: "0.1 + 0.2 === 0.3 returns", answer: "false", hint: "IEEE 754 precision", points: 1000 },
    { prompt: "typeof null", answer: "object", hint: "Historical JavaScript bug", points: 800 },
    { prompt: "`[[]] * 3` shares", answer: "references", hint: "Python mutable objects", points: 900 },
    { prompt: "Rust needs `mut` for", answer: "mutable borrow", hint: "Ownership rules", points: 950 },
    { prompt: "Go map must be", answer: "initialized", hint: "Cannot use nil map", points: 850 },
    { prompt: "C++ `delete p; *p=5`", answer: "Undefined ", hint: "Use-after-free", points: 1100 },
    { prompt: "Java Integer cache up to", answer: "127", hint: "Autoboxing optimization", points: 700 },
    { prompt: "TypeScript branded types use", answer: "__brand", hint: "Nominal typing", points: 1200 },
    { prompt: "Haskell `let x=5 in (let x=10 in x, x)`", answer: "(10,5)", hint: "Lexical scoping", points: 1300 },
    { prompt: "Swift `defer` executes", answer: "LIFO", hint: "Stack order", points: 750 },
    { prompt: "Kotlin `val` is", answer: "immutable", hint: "Cannot reassign", points: 800 },
    { prompt: "Elixir `spawn` receives", answer: "EXIT", hint: "Process signals", points: 1400 }
];

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function createParticles() {
    const particlesContainer = document.querySelector('.particles') || (() => {
        const div = document.createElement('div');
        div.className = 'particles';
        document.body.appendChild(div);
        return div;
    })();

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 25 + 15) + 's';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.width = particle.style.height = (Math.random() * 5 + 1) + 'px';
        particle.style.background = `hsl(${Math.random()*60 + 180}, 100%, ${Math.random()*40 + 50}%)`;
        particlesContainer.appendChild(particle);
    }
}

function Game() {
    const [gameState, setGameState] = useState('menu');
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState(0);
    const [cards, setCards] = useState([]);
    const [currentChallenge, setCurrentChallenge] = useState(null);
    const [challengeAnswer, setChallengeAnswer] = useState('');
    const [theme, setTheme] = useState('light');
    const [highScore, setHighScore] = useState(parseInt(localStorage.getItem('codebreaker-highscore') || '0'));
    const [showHint, setShowHint] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        document.body.className = `${theme}-theme`;
        createParticles();
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('codebreaker-highscore', highScore.toString());
    }, [highScore]);

    useEffect(() => {
        if (gameState === 'playing' && level <= 8) {
            const levelData = levelCardsData[level];
            const shuffled = shuffleArray(levelData);
            setCards(shuffled);
            setFlippedCards([]);
            setMatchedPairs(0);
        }
    }, [gameState, level]);

    const flipCard = useCallback((index) => {
        if (flippedCards.length < 2 && !flippedCards.includes(index)) {
            const newFlipped = [...flippedCards, index];
            setFlippedCards(newFlipped);
            
            if (newFlipped.length === 2) {
                const [idx1, idx2] = newFlipped;
                setTimeout(() => {
                    if (cards[idx1] === cards[idx2]) {
                        // PERFECT MATCH!
                        setMatchedPairs(prev => prev + 1);
                        setScore(prev => prev + (100 * level * 10));
                        setFlippedCards([]);
                        
                        // Level complete check
                        const totalPairs = levelCardsData[level].length / 2;
                        if (matchedPairs + 1 === totalPairs) {
                            setTimeout(() => {
                                if (level < 8) {
                                    setLevel(prev => prev + 1);
                                } else {
                                    // FINAL BOSS!
                                    setGameState('challenge');
                                    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
                                    setCurrentChallenge(randomChallenge);
                                }
                            }, 1500);
                        }
                    } else {
                        // NO MATCH - Flip back
                        setFlippedCards([]);
                    }
                }, 1200);
            }
        }
    }, [flippedCards, cards, matchedPairs, level, gameState]);

    const submitChallenge = () => {
        if (challengeAnswer.toLowerCase().trim() === currentChallenge.answer.toLowerCase()) {
            const finalScore = score + currentChallenge.points;
            setScore(finalScore);
            setHighScore(prev => Math.max(prev, finalScore));
            setGameState('won');
        } else {
            setChallengeAnswer('');
            inputRef.current?.focus();
            setShowHint(true);
            setTimeout(() => setShowHint(false), 4000);
        }
    };

    const startGame = () => {
        setScore(0);
        setLevel(1);
        setGameState('playing');
    };

    const resetGame = () => {
        setGameState('menu');
        setScore(0);
        setLevel(1);
    };

    const totalPairsForLevel = levelCardsData[level]?.length / 2 || 0;

    if (gameState === 'menu') {
        return (
            <div className="app-container">
                <header className="arena-header">
                    <h1 className="arena-title">Codebreaker Arena</h1>
                    <p className="arena-subtitle">
                        🧠 8 Levels • {highScore.toLocaleString()} High Score • Expert Challenges
                    </p>
                </header>
                <div className="game-arena">
                    <div className="stats-panel">
                        <div className="stat-card">
                            <div className="stat-value">{highScore.toLocaleString()}</div>
                            <div>🏆 High Score</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">8</div>
                            <div>Max Level</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">5000+</div>
                            <div>Max Score</div>
                        </div>
                    </div>
                    <div className="game-controls">
                        <button className="btn-neon btn-primary" onClick={startGame} style={{fontSize: '1.4rem', padding: '25px 50px'}}>
                            <i className="fas fa-rocket"></i> Enter Arena
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'playing') {
        return (
            <div className="app-container">
                <header className="arena-header">
                    <h1 className="arena-title">
                        <i className="fas fa-layer-group"></i> Level {level}
                    </h1>
                    <p className="arena-subtitle">
                        Score: <span style={{color: '#00d4ff'}}>{score.toLocaleString()}</span> | 
                        {matchedPairs}/{totalPairsForLevel} Matches
                    </p>
                </header>
                <div className="game-arena">
                    <div className="stats-panel">
                        <div className="stat-card">
                            <div className="stat-value">{score.toLocaleString()}</div>
                            <div>Score</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{level}/8</div>
                            <div>Level</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value">{matchedPairs}/{totalPairsForLevel}</div>
                            <div>Matches</div>
                        </div>
                    </div>
                    <div className="game-board" style={{gridTemplateColumns: `repeat(${Math.min(8, level + 3)}, 1fr)`, gap: '15px'}}>
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                className={`memory-card ${
                                    flippedCards.includes(index) ? 'flipped matched' : ''
                                }`}
                                onClick={() => flipCard(index)}
                            >
                                {flippedCards.includes(index) ? card : '❓'}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (gameState === 'challenge') {
        return (
            <div className="app-container">
                <header className="arena-header">
                    <h1 className="arena-title">
                        <i className="fas fa-brain"></i> FINAL BOSS {level}/8
                    </h1>
                    <p className="arena-subtitle">Score: {score.toLocaleString()} | Type exact answer</p>
                </header>
                <div className="game-arena">
                    <div className="code-challenge">
                        <h3 style={{marginBottom: '25px', fontFamily: 'Orbitron'}}>
                            💻 <code style={{background: 'rgba(0,0,0,0.4)', padding: '15px 25px', borderRadius: '15px', fontSize: '1.3rem'}}>
                                {currentChallenge.prompt}
                            </code>
                        </h3>
                        <div style={{marginBottom: '30px'}}>
                            <i className="fas fa-lightbulb" style={{color: '#ffd93d'}}></i> 
                            <span style={{marginLeft: '10px', color: showHint ? '#ffd93d' : '#a8b8ff'}}>
                                {showHint ? currentChallenge.hint : 'Hint after 1st wrong try'}
                            </span>
                        </div>
                        <input
                            ref={inputRef}
                            className="challenge-input"
                            value={challengeAnswer}
                            onChange={(e) => setChallengeAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && submitChallenge()}
                            placeholder="Type precise answer (case insensitive)..."
                            autoFocus
                        />
                        <div className="game-controls">
                            <button className="btn-neon btn-secondary" onClick={() => setGameState('playing')}>
                                ← Back to Level {level}
                            </button>
                            <button className="btn-neon btn-primary" onClick={submitChallenge}>
                                🚀 Submit Answer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <header className="arena-header">
                <h1 className="arena-title">
                    <i className="fas fa-crown"></i> 🏆 CODEBREAKER LEGEND
                </h1>
                <p className="arena-subtitle">
                    FINAL: <span style={{fontSize: '2rem', color: '#ffd93d'}}>{score.toLocaleString()}</span>
                    {score > highScore && ' 🎉 NEW WORLD RECORD!'}
                </p>
            </header>
            <div className="game-arena">
                <div className="stats-panel">
                    <div className="stat-card">
                        <div className="stat-value">{score.toLocaleString()}</div>
                        <div>Legend Score</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">{highScore.toLocaleString()}</div>
                        <div>Previous Best</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value">8/8 ✅</div>
                        <div>Levels Mastered</div>
                    </div>
                </div>
                <div className="game-controls">
                    <button className="btn-neon btn-primary" onClick={resetGame} style={{fontSize: '1.5rem', padding: '30px 60px'}}>
                        <i className="fas fa-redo-alt"></i> Become Legend Again
                    </button>
                </div>
            </div>
        </div>
    );
}

// FIXED RENDER WITH THEME TOGGLE 🎨
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <div>
        {/* THEME TOGGLE - ALWAYS WORKS */}
        <button 
            className="theme-toggle" 
            onClick={() => {
                const body = document.body;
                const isDark = body.className.includes('dark-theme');
                body.className = isDark ? 'light-theme' : 'dark-theme';
            }}
            title="Toggle Theme"
        >
            {document.body.className?.includes('dark-theme') ? '☀️' : '🌙'}
        </button>
        <Game />
    </div>
);
