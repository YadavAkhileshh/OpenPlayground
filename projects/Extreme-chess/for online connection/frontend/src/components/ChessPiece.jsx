function ChessPiece({ type, color }) {
    const pieceSymbols = {
        white: {
            k: '♔',
            q: '♕',
            r: '♖',
            b: '♗',
            n: '♘',
            p: '♙'
        },
        black: {
            k: '♚',
            q: '♛',
            r: '♜',
            b: '♝',
            n: '♞',
            p: '♟'
        }
    };

    return (
        <div className={`chess-piece ${color}`}>
            {pieceSymbols[color][type]}
        </div>
    );
}

export default ChessPiece;
