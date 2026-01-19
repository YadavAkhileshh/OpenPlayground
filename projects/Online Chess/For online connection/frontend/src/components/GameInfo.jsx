function GameInfo({ currentPlayer, capturedPieces, moveHistory, inCheck, gameStatus, statusMessage, onReset, gameMode, gameId, difficulty, onDifficultyChange }) {

    const getPieceSymbol = (piece) => {
        const symbols = {
            white: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
            black: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
        };
        return symbols[piece.color][piece.type];
    };

    const getMoveNotation = (move, index) => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const fromFile = files[move.from.col];
        const fromRank = 8 - move.from.row;
        const toFile = files[move.to.col];
        const toRank = 8 - move.to.row;

        const pieceSymbols = { p: '', r: 'R', n: 'N', b: 'B', q: 'Q', k: 'K' };
        const piece = pieceSymbols[move.piece];
        const capture = move.captured ? 'x' : '';

        return `${index + 1}. ${piece}${fromFile}${fromRank}${capture}${toFile}${toRank}`;
    };

    const getGroupedCaptured = (pieces) => {
        if (!pieces) return [];
        const groups = {};
        pieces.forEach(piece => {
            groups[piece.type] = (groups[piece.type] || 0) + 1;
        });
        return Object.entries(groups).map(([type, count]) => ({
            type,
            count,
            color: pieces[0].color
        }));
    };

    return (
        <div className="game-info">
            <div className="info-section">
                <h3 className="section-title">Game Status</h3>
                <div className="status-card">
                    {inCheck && <div className="check-indicator animate-pulse">⚠️ CHECK</div>}
                    {gameStatus === 'checkmate' && <div className="checkmate-indicator">🏆 CHECKMATE</div>}
                    {gameStatus === 'stalemate' && <div className="stalemate-indicator">🤝 STALEMATE</div>}
                    <p className="status-text">{statusMessage || (gameMode === 'local' ? 'Local Match' : 'Online Match')}</p>
                    {gameMode === 'online' && gameId && (
                        <div className="game-code">
                            <strong>GAME ID:</strong> <code>{gameId}</code>
                        </div>
                    )}
                    {gameMode === 'vs-computer' && (
                        <div className="difficulty-selector">
                            <label>Difficulty: {difficulty}</label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={difficulty}
                                onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
                            />
                            <div className="difficulty-labels">
                                <span>Easy</span>
                                <span>Master</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>


            <div className="info-section">
                <h3 className="section-title">Captured Pieces</h3>
                <div className="captured-container">
                    <div className="captured-group">
                        <h4 className="captured-label">White Captured:</h4>
                        <div className="captured-pieces">
                            {getGroupedCaptured(capturedPieces?.white).map((group, idx) => (
                                <div key={idx} className="captured-piece-wrapper">
                                    <span className="captured-piece white">
                                        {getPieceSymbol({ type: group.type, color: 'white' })}
                                    </span>
                                    {group.count > 1 && <sub className="piece-count">{group.count}</sub>}
                                </div>
                            ))}
                            {(!capturedPieces?.white || capturedPieces.white.length === 0) && (
                                <span className="no-captures">None</span>
                            )}
                        </div>
                    </div>

                    <div className="captured-group">
                        <h4 className="captured-label">Black Captured:</h4>
                        <div className="captured-pieces">
                            {getGroupedCaptured(capturedPieces?.black).map((group, idx) => (
                                <div key={idx} className="captured-piece-wrapper">
                                    <span className="captured-piece black">
                                        {getPieceSymbol({ type: group.type, color: 'black' })}
                                    </span>
                                    {group.count > 1 && <sub className="piece-count">{group.count}</sub>}
                                </div>
                            ))}
                            {(!capturedPieces?.black || capturedPieces.black.length === 0) && (
                                <span className="no-captures">None</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="info-section flex-grow">
                <h3 className="section-title">Move History</h3>
                <div className="move-history">
                    {moveHistory && moveHistory.length > 0 ? (
                        <div className="moves-grid">
                            {moveHistory.map((move, idx) => (
                                <div key={idx} className="move-entry">
                                    {getMoveNotation(move, idx)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-moves">No moves yet</p>
                    )}
                </div>
            </div>

            <div className="info-section">
                <button className="reset-btn" onClick={onReset}>
                    RESET MATCH
                </button>
            </div>
        </div>
    );

}

export default GameInfo;
