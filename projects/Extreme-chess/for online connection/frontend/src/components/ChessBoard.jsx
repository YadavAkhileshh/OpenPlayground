import ChessPiece from './ChessPiece';

function ChessBoard({ board, onSquareClick, selectedSquare, legalMoves, currentPlayer, playerColor }) {
    const isLegalMove = (row, col) => {
        return legalMoves.some(move => move.row === row && move.col === col);
    };

    const isSelected = (row, col) => {
        return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
    };

    const getSquareClass = (row, col) => {
        const isLight = (row + col) % 2 === 0;
        let className = `square ${isLight ? 'light' : 'dark'}`;

        if (isSelected(row, col)) {
            className += ' selected';
        }

        if (isLegalMove(row, col)) {
            className += ' legal-move';
        }

        return className;
    };

    return (
        <div className="chess-board-container">
            <div className="turn-indicator">
                <div className={`turn-icon white ${currentPlayer === 'white' ? 'active' : ''}`}>
                    ♔
                </div>
                <span className="turn-text">
                    {currentPlayer === 'white' ? "White's Turn" : "Black's Turn"}
                </span>
                <div className={`turn-icon black ${currentPlayer === 'black' ? 'active' : ''}`}>
                    ♚
                </div>
            </div>

            <div className="chess-board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="board-row">
                        {row.map((piece, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={getSquareClass(rowIndex, colIndex)}
                                onClick={() => onSquareClick(rowIndex, colIndex)}
                            >
                                {/* Rank/File Labels inside squares */}
                                {colIndex === 0 && (
                                    <span className="coordinate rank">{8 - rowIndex}</span>
                                )}
                                {rowIndex === 7 && (
                                    <span className="coordinate file">
                                        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][colIndex]}
                                    </span>
                                )}

                                {piece && <ChessPiece type={piece.type} color={piece.color} />}
                                {isLegalMove(rowIndex, colIndex) && (
                                    <div className={`move-indicator ${piece ? 'capture' : ''}`} />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );

}

export default ChessBoard;
