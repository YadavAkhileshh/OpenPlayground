import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Play, BarChart2 } from 'lucide-react';

const TypingEngine = ({ onFinish }) => {
    const [words, setWords] = useState([]);
    const [userInput, setUserInput] = useState('');
    const [activeWordIndex, setActiveWordIndex] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [isFinished, setIsFinished] = useState(false);
    const [errors, setErrors] = useState(0);
    const [charactersTyped, setCharactersTyped] = useState(0);
    const [testMode, setTestMode] = useState('words'); // 'words', 'time', 'quotes'

    const inputRef = useRef(null);
    const { user, token } = useAuth();

    const FALLBACK_WORDS = ["the", "quick", "brown", "fox", "jumps", "over", "the", "lazy", "dog", "typing", "practice", "improves", "speed", "and", "accuracy", "consistency", "is", "key", "to", "success", "mastering", "the", "keyboard", "takes", "time", "but", "it", "is", "worth", "the", "effort", "keep", "practicing", "every", "day", "for", "best", "results", "challenge", "yourself", "beyond", "limits", "focus", "flow", "rhythm", "efficiency", "skill", "development"];

    useEffect(() => {
        fetchWords();
    }, [testMode]);

    const fetchWords = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/words?count=${testMode === 'time' ? 100 : 50}`);
            setWords(res.data);
            resetTest();
        } catch (err) {
            const shuffled = [...FALLBACK_WORDS].sort(() => 0.5 - Math.random());
            setWords(shuffled.slice(0, testMode === 'time' ? 100 : 50));
            resetTest();
        }
    };

    const resetTest = () => {
        setUserInput('');
        setActiveWordIndex(0);
        setStartTime(null);
        setWpm(0);
        setAccuracy(100);
        setIsFinished(false);
        setErrors(0);
        setCharactersTyped(0);
        if (inputRef.current) inputRef.current.focus();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (!startTime) setStartTime(Date.now());

        if (value.endsWith(' ')) {
            const trimmedValue = value.trim();
            const currentWord = words[activeWordIndex];

            if (trimmedValue !== currentWord) {
                setErrors(prev => prev + 1);
            }

            setCharactersTyped(prev => prev + trimmedValue.length + 1);
            setActiveWordIndex(prev => prev + 1);
            setUserInput('');

            if (activeWordIndex === words.length - 1) {
                finishTest();
            }
        } else {
            setUserInput(value);
            calculateStats(value);
        }
    };

    const calculateStats = (currentValue) => {
        if (!startTime) return;
        const timeElapsed = (Date.now() - startTime) / 60000;
        const totalChars = charactersTyped + (currentValue?.length || 0);
        const currentWpm = Math.round((totalChars / 5) / timeElapsed) || 0;
        setWpm(currentWpm);
    };

    const finishTest = async () => {
        setIsFinished(true);
        const finalWpm = Math.round((charactersTyped / 5) / ((Date.now() - startTime) / 60000));
        setWpm(finalWpm);

        if (token) {
            try {
                await axios.post('http://localhost:5000/api/results', {
                    wpm: finalWpm,
                    accuracy,
                    characters: charactersTyped,
                    errors,
                    mode: testMode
                });
                if (onFinish) onFinish();
            } catch (err) {
                console.error('Error saving result', err);
            }
        }
    };

    return (
        <div className="typing-container">
            <div className="mode-switcher">
                {['words', 'time', 'quotes'].map(mode => (
                    <button
                        key={mode}
                        className={`mode-btn ${testMode === mode ? 'active' : ''}`}
                        onClick={() => setTestMode(mode)}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}
            </div>

            <div className="typing-area shadow">
                {!isFinished ? (
                    <>
                        <div className="stats-overlay">
                            <div className="stat-box">
                                <span className="label">WPM</span>
                                <span className="value">{wpm}</span>
                            </div>
                            <div className="stat-box">
                                <span className="label">Errors</span>
                                <span className="value">{errors}</span>
                            </div>
                        </div>

                        <div className="words-container" onClick={() => inputRef.current.focus()}>
                            {words.map((word, wIdx) => (
                                <span key={wIdx} className={`word ${wIdx === activeWordIndex ? 'active' : ''}`}>
                                    {word.split('').map((letter, lIdx) => {
                                        let className = 'letter';
                                        if (wIdx < activeWordIndex) {
                                            className += ' correct';
                                        } else if (wIdx === activeWordIndex && lIdx < userInput.length) {
                                            className += userInput[lIdx] === letter ? ' correct' : ' incorrect';
                                        }
                                        return <span key={lIdx} className={className}>{letter}</span>;
                                    })}
                                </span>
                            ))}
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            className="hidden-input"
                            value={userInput}
                            onChange={handleInputChange}
                            autoFocus
                        />

                        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={resetTest}>
                                <RefreshCw size={18} /> Restart
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="results-view" style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Great job!</h2>
                        <div className="stats-overlay" style={{ justifyContent: 'center' }}>
                            <div className="stat-box" style={{ padding: '2rem' }}>
                                <span className="label">Final WPM</span>
                                <span className="value" style={{ fontSize: '3rem' }}>{wpm}</span>
                            </div>
                            <div className="stat-box" style={{ padding: '2rem' }}>
                                <span className="label">Accuracy</span>
                                <span className="value" style={{ fontSize: '3rem' }}>{accuracy}%</span>
                            </div>
                        </div>
                        <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" onClick={fetchWords}>
                                <Play size={18} /> Take New Test
                            </button>
                            <button className="btn btn-outline" onClick={() => window.location.href = '/dashboard'}>
                                <BarChart2 size={18} /> View History
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TypingEngine;
