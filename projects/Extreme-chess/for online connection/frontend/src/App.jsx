import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ChessBoard from './components/ChessBoard';
import GameInfo from './components/GameInfo';
import { ChessGame } from './utils/ChessGame';
import StockfishEngine from './utils/StockfishEngine';
import './App.css';

function App() {
    const [gameMode, setGameMode] = useState(null); // 'local' or 'online'
    const [socket, setSocket] = useState(null);
    const [gameId, setGameId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [playerColor, setPlayerColor] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [legalMoves, setLegalMoves] = useState([]);
    const [gameStatus, setGameStatus] = useState('ongoing');
    const [statusMessage, setStatusMessage] = useState('');
    const [difficulty, setDifficulty] = useState(10); // Default 10 (intermediate)
    const [aiColor, setAiColor] = useState('black');

    const localGameRef = useRef(null);
    const engineRef = useRef(null);

    // Initialize socket connection for online mode
    useEffect(() => {
        if (gameMode === 'online') {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
            const newSocket = io(backendUrl);
            setSocket(newSocket);

            newSocket.on('gameCreated', ({ gameId, color }) => {
                setGameId(gameId);
                setPlayerColor(color);
                setStatusMessage(`Game created! Code: ${gameId}`);
            });

            newSocket.on('gameJoined', ({ gameId, color }) => {
                setPlayerColor(color);
                setStatusMessage('Joined successfully!');
            });

            newSocket.on('gameState', (state) => {
                setGameState(state);
            });

            newSocket.on('gameStart', () => {
                setStatusMessage('Game started!');
            });

            newSocket.on('moveMade', ({ gameState: newState, gameStatus: status }) => {
                setGameState(newState);
                setGameStatus(status);
                setSelectedSquare(null);
                setLegalMoves([]);

                if (status === 'check') setStatusMessage('Check!');
                else if (status === 'checkmate') setStatusMessage('Checkmate!');
                else if (status === 'stalemate') setStatusMessage('Stalemate!');
                else setStatusMessage('');
            });

            newSocket.on('legalMoves', ({ moves }) => {
                setLegalMoves(moves);
            });

            newSocket.on('gameReset', () => {
                setSelectedSquare(null);
                setLegalMoves([]);
                setGameStatus('ongoing');
                setStatusMessage('Game reset!');
            });

            newSocket.on('playerLeft', ({ message }) => {
                setStatusMessage(message);
            });

            newSocket.on('error', ({ message }) => {
                alert(message);
            });

            newSocket.on('connect_error', () => {
                setStatusMessage('Connection failed. Please ensure the backend server is running.');
                setSocket(null);
                setGameMode(null);
            });

            return () => newSocket.close();
        }
    }, [gameMode]);

    // Initialize local/vs-computer game
    useEffect(() => {
        if (gameMode === 'local' || gameMode === 'vs-computer') {
            const game = new ChessGame();
            localGameRef.current = game;
            setGameState(game.getGameState());
            setPlayerColor('white'); // Human always plays white initially for simplicity
            setGameStatus('ongoing');
            setStatusMessage(gameMode === 'local' ? 'Local Mode' : `VS CPU (Level ${difficulty})`);

            if (gameMode === 'vs-computer') {
                engineRef.current = new StockfishEngine();
                engineRef.current.setDifficulty(difficulty);
                setAiColor('black');
            }
        }

        return () => {
            if (engineRef.current) {
                engineRef.current.terminate();
                engineRef.current = null;
            }
        };
    }, [gameMode]);

    const createOnlineGame = () => {
        if (!playerName.trim()) return alert('Enter your name');
        socket.emit('createGame', { playerName });
    };

    const joinOnlineGame = () => {
        if (!playerName.trim() || !gameId.trim()) return alert('Enter name and code');
        socket.emit('joinGame', { gameId, playerName });
    };

    // Trigger AI move
    useEffect(() => {
        if (gameMode === 'vs-computer' &&
            gameState?.currentPlayer === aiColor &&
            (gameStatus === 'ongoing' || gameStatus === 'check')) {


            const timer = setTimeout(() => {
                const fen = localGameRef.current.getFEN();
                engineRef.current.findBestMove(fen, (move) => {
                    makeMove(move.from.row, move.from.col, move.to.row, move.to.col);
                });
            }, 500); // Slight delay for realism

            return () => clearTimeout(timer);
        }
    }, [gameState?.currentPlayer, gameMode, gameStatus]);

    const handleDifficultyChange = (newLevel) => {
        setDifficulty(newLevel);
        if (gameMode === 'vs-computer') {
            setStatusMessage(`VS CPU (Level ${newLevel})`);
            if (engineRef.current) {
                engineRef.current.setDifficulty(newLevel);
            }
        }
    };


    const handleSquareClick = (row, col) => {
        if (gameStatus === 'checkmate' || gameStatus === 'stalemate') return;

        if (gameMode === 'online' && gameState?.currentPlayer !== playerColor) return;
        if (gameMode === 'vs-computer' && gameState?.currentPlayer === aiColor) return;

        const piece = gameState?.board[row][col];

        if (selectedSquare) {
            const move = legalMoves.find(m => m.row === row && m.col === col);
            if (move) {
                makeMove(selectedSquare.row, selectedSquare.col, row, col);
            } else if (piece && piece.color === gameState?.currentPlayer) {
                setSelectedSquare({ row, col });
                requestLegalMoves(row, col);
            } else {
                setSelectedSquare(null);
                setLegalMoves([]);
            }
        } else {
            if (piece && piece.color === gameState?.currentPlayer) {
                setSelectedSquare({ row, col });
                requestLegalMoves(row, col);
            }
        }
    };

    const requestLegalMoves = (row, col) => {
        if (gameMode === 'online') {
            socket.emit('getLegalMoves', { gameId, row, col });
        } else if (localGameRef.current) {
            setLegalMoves(localGameRef.current.getLegalMoves(row, col));
        }
    };

    const makeMove = (fromRow, fromCol, toRow, toCol) => {
        if (gameMode === 'online') {
            socket.emit('move', {
                gameId,
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                promotion: 'q'
            });
        } else if (localGameRef.current) {
            const result = localGameRef.current.makeMove(fromRow, fromCol, toRow, toCol);
            if (result.success) {
                setGameState(localGameRef.current.getGameState());
                setGameStatus(result.gameStatus);
                setSelectedSquare(null);
                setLegalMoves([]);

                let message = '';
                if (result.gameStatus === 'check') message = 'Check!';
                else if (result.gameStatus === 'checkmate') message = 'Checkmate!';
                else if (result.gameStatus === 'stalemate') message = 'Stalemate!';

                if (gameMode === 'vs-computer') {
                    setStatusMessage(message || `VS CPU (Level ${difficulty})`);
                } else {
                    setStatusMessage(message || 'Local Mode');
                }
            }
        }
    };

    const resetGame = () => {
        if (gameMode === 'online') {
            socket.emit('resetGame', { gameId });
        } else if (localGameRef.current) {
            const game = new ChessGame();
            localGameRef.current = game;
            setGameState(game.getGameState());
            setSelectedSquare(null);
            setLegalMoves([]);
            setGameStatus('ongoing');
            setStatusMessage(gameMode === 'local' ? 'Local Mode' : `VS CPU (Level ${difficulty})`);
        }
    };

    const backToMenu = () => {
        setGameMode(null);
        setGameState(null);
        setSelectedSquare(null);
        setLegalMoves([]);
        setGameId('');
        setPlayerName('');
        setPlayerColor(null);
        setGameStatus('ongoing');
        setStatusMessage('');
    };

    if (!gameMode) {
        return (
            <div className="app">
                <div className="menu-container">
                    <h1 className="game-title">♔ Chess Game ♚</h1>
                    <p className="game-subtitle">Modern chess experience</p>
                    <div className="menu-buttons">
                        <button className="menu-btn local-btn" onClick={() => setGameMode('local')}>
                            <span className="btn-icon">♟️</span>
                            <span className="btn-text"><strong>Local Game</strong><small>Play on same device</small></span>
                        </button>
                        <button className="menu-btn ai-btn" onClick={() => setGameMode('vs-computer')}>
                            <span className="btn-icon">🤖</span>
                            <span className="btn-text"><strong>VS Computer</strong><small>Play against Stockfish</small></span>
                        </button>
                        <button className="menu-btn online-btn" onClick={() => setGameMode('online')}>
                            <span className="btn-icon">🌐</span>
                            <span className="btn-text"><strong>Online Game</strong><small>Play with friends</small></span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (gameMode === 'online' && !gameState) {
        return (
            <div className="app">
                <div className="lobby-container">
                    <h2 className="lobby-title">Online Setup</h2>
                    <div className="lobby-form">
                        <input type="text" placeholder="Your Name" value={playerName} onChange={e => setPlayerName(e.target.value)} className="lobby-input" />
                        <div className="lobby-actions">
                            <button className="lobby-btn create-btn" onClick={createOnlineGame}>Create Game</button>
                            <div className="join-section">
                                <input type="text" placeholder="Game Code" value={gameId} onChange={e => setGameId(e.target.value)} className="lobby-input" />
                                <button className="lobby-btn join-btn" onClick={joinOnlineGame}>Join Game</button>
                            </div>
                        </div>
                        <button className="back-btn" onClick={backToMenu}>← Back</button>
                    </div>
                    {statusMessage && <p className="status-message">{statusMessage}</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            <div className="game-container">
                <div className="game-header">
                    <h1 className="game-title-small">♔ Chess ♚</h1>
                    <button className="back-btn-small" onClick={backToMenu}>← Menu</button>
                </div>
                <div className="game-layout">
                    <ChessBoard
                        board={gameState?.board || []}
                        onSquareClick={handleSquareClick}
                        selectedSquare={selectedSquare}
                        legalMoves={legalMoves}
                        currentPlayer={gameState?.currentPlayer}
                        playerColor={playerColor}
                    />
                    <GameInfo
                        currentPlayer={gameState?.currentPlayer}
                        capturedPieces={gameState?.capturedPieces}
                        moveHistory={gameState?.moveHistory}
                        inCheck={gameState?.inCheck}
                        gameStatus={gameStatus}
                        statusMessage={statusMessage}
                        onReset={resetGame}
                        gameMode={gameMode}
                        gameId={gameId}
                        difficulty={difficulty}
                        onDifficultyChange={handleDifficultyChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
