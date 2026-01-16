// ====================================
// RULES.JS - Chess Rules & Validation
// ====================================

// Check if a square is attacked by a specific color
function isSquareAttacked(square, attackerColor) {
    // Check pawn attacks
    const pawnOffsets = attackerColor === WHITE ? [-15, -17] : [15, 17];
    for (const offset of pawnOffsets) {
        const from = square + offset;
        if (isValidSquare(from)) {
            const piece = board[from];
            if (getPieceType(piece) === PAWN && getPieceColor(piece) === attackerColor) {
                return true;
            }
        }
    }
    
    // Check knight attacks
    for (const offset of KNIGHT_OFFSETS) {
        const from = square + offset;
        if (isValidSquare(from)) {
            const piece = board[from];
            if (getPieceType(piece) === KNIGHT && getPieceColor(piece) === attackerColor) {
                return true;
            }
        }
    }
    
    // Check king attacks (for adjacent king check)
    for (const offset of KING_OFFSETS) {
        const from = square + offset;
        if (isValidSquare(from)) {
            const piece = board[from];
            if (getPieceType(piece) === KING && getPieceColor(piece) === attackerColor) {
                return true;
            }
        }
    }
    
    // Check sliding piece attacks (bishop, rook, queen)
    const bishopDirs = BISHOP_OFFSETS;
    const rookDirs = ROOK_OFFSETS;
    
    // Bishop/Queen diagonal attacks
    for (const offset of bishopDirs) {
        let from = square + offset;
        while (isValidSquare(from)) {
            const piece = board[from];
            if (piece !== EMPTY) {
                if (getPieceColor(piece) === attackerColor) {
                    const type = getPieceType(piece);
                    if (type === BISHOP || type === QUEEN) {
                        return true;
                    }
                }
                break;
            }
            from += offset;
        }
    }
    
    // Rook/Queen orthogonal attacks
    for (const offset of rookDirs) {
        let from = square + offset;
        while (isValidSquare(from)) {
            const piece = board[from];
            if (piece !== EMPTY) {
                if (getPieceColor(piece) === attackerColor) {
                    const type = getPieceType(piece);
                    if (type === ROOK || type === QUEEN) {
                        return true;
                    }
                }
                break;
            }
            from += offset;
        }
    }
    
    return false;
}

// Find the king's position for a given color
function findKing(color) {
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (getPieceType(piece) === KING && getPieceColor(piece) === color) {
            return i;
        }
    }
    return -1; // Should never happen in valid position
}

// Check if a side is in check
function isInCheck(color) {
    const kingPos = findKing(color);
    if (kingPos === -1) return false;
    
    const opponentColor = color === WHITE ? BLACK : WHITE;
    return isSquareAttacked(kingPos, opponentColor);
}

// Check if the current position is checkmate
function isCheckmate(color) {
    if (!isInCheck(color)) return false;
    
    const legalMoves = generateLegalMoves(color);
    return legalMoves.length === 0;
}

// Check if the current position is stalemate
function isStalemate(color) {
    if (isInCheck(color)) return false;
    
    const legalMoves = generateLegalMoves(color);
    return legalMoves.length === 0;
}

// Check for insufficient material draw
function isInsufficientMaterial() {
    const pieces = [];
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (piece !== EMPTY) {
            const type = getPieceType(piece);
            if (type !== KING) {
                pieces.push({ type, color: getPieceColor(piece) });
            }
        }
    }
    
    // King vs King
    if (pieces.length === 0) return true;
    
    // King + Knight vs King
    // King + Bishop vs King
    if (pieces.length === 1) {
        const type = pieces[0].type;
        return type === KNIGHT || type === BISHOP;
    }
    
    // King + Bishop vs King + Bishop (same color bishops)
    if (pieces.length === 2) {
        if (pieces[0].type === BISHOP && pieces[1].type === BISHOP) {
            // Check if bishops are on same colored squares
            let bishop1Sq = -1, bishop2Sq = -1;
            for (let i = 0; i < 128; i++) {
                if (!isValidSquare(i)) continue;
                const piece = board[i];
                if (getPieceType(piece) === BISHOP) {
                    if (bishop1Sq === -1) bishop1Sq = i;
                    else bishop2Sq = i;
                }
            }
            
            const bishop1Light = ((bishop1Sq >> 4) + (bishop1Sq & 7)) % 2 === 0;
            const bishop2Light = ((bishop2Sq >> 4) + (bishop2Sq & 7)) % 2 === 0;
            return bishop1Light === bishop2Light;
        }
    }
    
    return false;
}

// Check for threefold repetition
function isThreefoldRepetition() {
    if (moveHistory.length < 8) return false; // Need at least 4 reversible moves
    
    // Simple position hash based on board state
    const currentHash = getBoardHash();
    let repetitions = 1;
    
    // Check previous positions
    for (let i = moveHistory.length - 2; i >= 0; i--) {
        const entry = moveHistory[i];
        if (entry.hash === currentHash) {
            repetitions++;
            if (repetitions >= 3) return true;
        }
    }
    
    return false;
}

// Get a simple hash of the current position
function getBoardHash() {
    let hash = 0;
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (piece !== EMPTY) {
            // Simple hash combining piece and position
            hash ^= (piece << i % 24);
        }
    }
    
    hash ^= (toMove << 20);
    hash ^= (castlingRights << 16);
    hash ^= (enPassant << 8);
    
    return hash;
}

// Check for 50-move rule
function isFiftyMoveRule() {
    if (moveHistory.length < 100) return false;
    
    // Check if last 50 moves (100 half-moves) were without pawn move or capture
    for (let i = moveHistory.length - 100; i < moveHistory.length; i++) {
        const entry = moveHistory[i];
        const piece = getPieceType(entry.piece);
        if (piece === PAWN || entry.captured !== EMPTY) {
            return false;
        }
    }
    
    return true;
}

// Check if the game is a draw
function isDraw() {
    return isStalemate(toMove) ||
           isInsufficientMaterial() ||
           isThreefoldRepetition() ||
           isFiftyMoveRule();
}

// Check if the game is over
function isGameOver() {
    return isCheckmate(toMove) || isDraw();
}

// Get game status
function getGameStatus() {
    if (isCheckmate(toMove)) {
        const winner = toMove === WHITE ? "Black" : "White";
        return { over: true, result: "checkmate", winner };
    }
    
    if (isStalemate(toMove)) {
        return { over: true, result: "stalemate", winner: null };
    }
    
    if (isInsufficientMaterial()) {
        return { over: true, result: "insufficient material", winner: null };
    }
    
    if (isThreefoldRepetition()) {
        return { over: true, result: "threefold repetition", winner: null };
    }
    
    if (isFiftyMoveRule()) {
        return { over: true, result: "fifty-move rule", winner: null };
    }
    
    if (isInCheck(toMove)) {
        return { over: false, result: "check", winner: null };
    }
    
    return { over: false, result: "in progress", winner: null };
}

// Convert 0x88 index to algebraic notation
function indexToAlgebraic(index) {
    const file = String.fromCharCode(97 + (index & 7));
    const rank = String(1 + (index >> 4));
    return file + rank;
}

// Convert algebraic notation to 0x88 index
function algebraicToIndex(algebraic) {
    const file = algebraic.charCodeAt(0) - 97;
    const rank = parseInt(algebraic[1]) - 1;
    return (rank << 4) | file;
}

// Convert move to algebraic notation (basic)
function moveToAlgebraic(move) {
    const from = indexToAlgebraic(move.from);
    const to = indexToAlgebraic(move.to);
    
    if (move.flags & MOVE_CASTLE_KINGSIDE) return "O-O";
    if (move.flags & MOVE_CASTLE_QUEENSIDE) return "O-O-O";
    
    const piece = board[move.from];
    const pieceType = getPieceType(piece);
    let notation = "";
    
    // Add piece letter (except for pawns)
    if (pieceType !== PAWN) {
        notation += ["", "", "N", "B", "R", "Q", "K"][pieceType];
    }
    
    // Add capture symbol
    if (move.flags & MOVE_CAPTURE) {
        if (pieceType === PAWN) {
            notation += from[0]; // File for pawn captures
        }
        notation += "x";
    }
    
    notation += to;
    
    // Add promotion
    if (move.flags & MOVE_PROMOTION) {
        notation += "=Q"; // Default to queen promotion
    }
    
    // Check/checkmate notation will be added after move is made
    return notation;
}
