// ====================================
// EVALUATE.JS - Position Evaluation
// ====================================

// Piece-square tables for positional evaluation
const PAWN_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE = [
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE = [
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLE_TABLE = [
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
];

const KING_END_TABLE = [
    -50,-40,-30,-20,-20,-30,-40,-50,
    -30,-20,-10,  0,  0,-10,-20,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 30, 40, 40, 30,-10,-30,
    -30,-10, 20, 30, 30, 20,-10,-30,
    -30,-30,  0,  0,  0,  0,-30,-30,
    -50,-30,-30,-30,-30,-30,-30,-50
];

// Get piece-square table value
function getPieceSquareValue(piece, index, isEndgame = false) {
    const pieceType = getPieceType(piece);
    const color = getPieceColor(piece);
    
    const rank = index >> 4;
    const file = index & 7;
    
    // Flip rank for black pieces
    const tableIndex = color === WHITE ? rank * 8 + file : (7 - rank) * 8 + file;
    
    switch (pieceType) {
        case PAWN:
            return PAWN_TABLE[tableIndex];
        case KNIGHT:
            return KNIGHT_TABLE[tableIndex];
        case BISHOP:
            return BISHOP_TABLE[tableIndex];
        case ROOK:
            return ROOK_TABLE[tableIndex];
        case QUEEN:
            return QUEEN_TABLE[tableIndex];
        case KING:
            return isEndgame ? KING_END_TABLE[tableIndex] : KING_MIDDLE_TABLE[tableIndex];
        default:
            return 0;
    }
}

// Check if position is endgame
function isEndgame() {
    let queens = 0;
    let minorPieces = 0;
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (piece === EMPTY) continue;
        
        const type = getPieceType(piece);
        if (type === QUEEN) queens++;
        if (type === KNIGHT || type === BISHOP) minorPieces++;
    }
    
    // Endgame if no queens or very few minor pieces
    return queens === 0 || (queens === 2 && minorPieces <= 2);
}

// Evaluate material
function evaluateMaterial() {
    let score = 0;
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (piece === EMPTY) continue;
        
        const type = getPieceType(piece);
        const color = getPieceColor(piece);
        const value = PIECE_VALUES[type];
        
        score += color === WHITE ? value : -value;
    }
    
    return score;
}

// Evaluate piece-square tables
function evaluatePosition() {
    let score = 0;
    const endgame = isEndgame();
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (piece === EMPTY) continue;
        
        const color = getPieceColor(piece);
        const psqValue = getPieceSquareValue(piece, i, endgame);
        
        score += color === WHITE ? psqValue : -psqValue;
    }
    
    return score;
}

// Evaluate mobility (number of legal moves)
function evaluateMobility() {
    const whiteMoves = generateLegalMoves(WHITE).length;
    const blackMoves = generateLegalMoves(BLACK).length;
    
    return (whiteMoves - blackMoves) * 10;
}

// Evaluate pawn structure
function evaluatePawns() {
    let score = 0;
    
    const whitePawns = [];
    const blackPawns = [];
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (getPieceType(piece) === PAWN) {
            if (getPieceColor(piece) === WHITE) {
                whitePawns.push(i);
            } else {
                blackPawns.push(i);
            }
        }
    }
    
    // Doubled pawns penalty
    for (let file = 0; file < 8; file++) {
        const whiteOnFile = whitePawns.filter(p => (p & 7) === file).length;
        const blackOnFile = blackPawns.filter(p => (p & 7) === file).length;
        
        if (whiteOnFile > 1) score -= (whiteOnFile - 1) * 20;
        if (blackOnFile > 1) score += (blackOnFile - 1) * 20;
    }
    
    // Isolated pawns penalty
    for (const pawn of whitePawns) {
        const file = pawn & 7;
        const hasNeighbor = whitePawns.some(p => {
            const pFile = p & 7;
            return Math.abs(pFile - file) === 1;
        });
        if (!hasNeighbor) score -= 15;
    }
    
    for (const pawn of blackPawns) {
        const file = pawn & 7;
        const hasNeighbor = blackPawns.some(p => {
            const pFile = p & 7;
            return Math.abs(pFile - file) === 1;
        });
        if (!hasNeighbor) score += 15;
    }
    
    // Passed pawns bonus
    for (const pawn of whitePawns) {
        const file = pawn & 7;
        const rank = pawn >> 4;
        const isPassedPawn = !blackPawns.some(p => {
            const pFile = p & 7;
            const pRank = p >> 4;
            return Math.abs(pFile - file) <= 1 && pRank < rank;
        });
        if (isPassedPawn) score += (rank - 1) * 10;
    }
    
    for (const pawn of blackPawns) {
        const file = pawn & 7;
        const rank = pawn >> 4;
        const isPassedPawn = !whitePawns.some(p => {
            const pFile = p & 7;
            const pRank = p >> 4;
            return Math.abs(pFile - file) <= 1 && pRank > rank;
        });
        if (isPassedPawn) score -= (6 - rank) * 10;
    }
    
    return score;
}
// Helper: Find king position
function findKing(color) {
    for (let sq = 0; sq < 128; sq++) {
        if (!isValidSquare(sq)) continue;
        const piece = board[sq];
        if (piece !== EMPTY && getPieceType(piece) === KING && getPieceColor(piece) === color) {
            return sq;
        }
    }
    return -1;
}
// Count attackers on a square
function countAttackers(square, attackerColor) {
    let count = 0;
    
    // Check pawn attacks
    const pawnOffsets = attackerColor === WHITE ? [-15, -17] : [15, 17];
    for (const offset of pawnOffsets) {
        const from = square + offset;
        if (isValidSquare(from)) {
            const piece = board[from];
            if (getPieceType(piece) === PAWN && getPieceColor(piece) === attackerColor) {
                count++;
            }
        }
    }
    
    // Check knight attacks
    const KNIGHT_OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];
    for (const offset of KNIGHT_OFFSETS) {
        const from = square + offset;
        if (isValidSquare(from)) {
            const piece = board[from];
            if (getPieceType(piece) === KNIGHT && getPieceColor(piece) === attackerColor) {
                count++;
            }
        }
    }
    
    // Check sliding piece attacks
    const BISHOP_OFFSETS = [-17, -15, 15, 17];
    const ROOK_OFFSETS = [-16, -1, 1, 16];
    
    for (const offset of BISHOP_OFFSETS) {
        let from = square + offset;
        while (isValidSquare(from)) {
            const piece = board[from];
            if (piece !== EMPTY) {
                if (getPieceColor(piece) === attackerColor) {
                    const type = getPieceType(piece);
                    if (type === BISHOP || type === QUEEN) count++;
                }
                break;
            }
            from += offset;
        }
    }
    
    for (const offset of ROOK_OFFSETS) {
        let from = square + offset;
        while (isValidSquare(from)) {
            const piece = board[from];
            if (piece !== EMPTY) {
                if (getPieceColor(piece) === attackerColor) {
                    const type = getPieceType(piece);
                    if (type === ROOK || type === QUEEN) count++;
                }
                break;
            }
            from += offset;
        }
    }
    
    // Check king attacks
    const KING_OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];
    for (const offset of KING_OFFSETS) {
        const from = square + offset;
        if (isValidSquare(from)) {
            const piece = board[from];
            if (getPieceType(piece) === KING && getPieceColor(piece) === attackerColor) {
                count++;
            }
        }
    }
    
    return count;
}

// Evaluate hanging pieces (pieces under attack with insufficient defense)
function evaluateHangingPieces() {
    let score = 0;
    
    for (let square = 0; square < 128; square++) {
        if (!isValidSquare(square)) continue;
        
        const piece = board[square];
        if (piece === EMPTY) continue;
        
        const pieceType = getPieceType(piece);
        const color = getPieceColor(piece);
        const opponentColor = color === WHITE ? BLACK : WHITE;
        
        const attackers = countAttackers(square, opponentColor);
        const defenders = countAttackers(square, color);
        
        if (attackers > defenders) {
            const pieceValue = PIECE_VALUES[pieceType];
            const hangingPenalty = pieceValue * 0.8 * (attackers - defenders);
            
            if (color === WHITE) {
                score -= hangingPenalty;
            } else {
                score += hangingPenalty;
            }
        }
    }
    
    return score;
}

// Evaluate king safety
function evaluateKingSafety() {
    let score = 0;
    
    const whiteKing = findKing(WHITE);
    const blackKing = findKing(BLACK);
    
    if (whiteKing !== -1 && !isEndgame()) {
        // Penalize exposed king in middle game
        const rank = whiteKing >> 4;
        if (rank > 2) score -= 50; // Increased from 30
        
        // Check if king is under attack
        const kingAttackers = countAttackers(whiteKing, BLACK);
        if (kingAttackers > 0) {
            score -= 120; // Heavy penalty for exposed king
        }
        
        // Check pawn shield
        const file = whiteKing & 7;
        let pawnShield = 0;
        for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
            const shieldSquare = ((rank + 1) << 4) | f;
            if (isValidSquare(shieldSquare)) {
                const piece = board[shieldSquare];
                if (getPieceType(piece) === PAWN && getPieceColor(piece) === WHITE) {
                    pawnShield++;
                }
            }
        }
        score += pawnShield * 15; // Increased from 10
    }
    
    if (blackKing !== -1 && !isEndgame()) {
        // Penalize exposed king in middle game
        const rank = blackKing >> 4;
        if (rank < 5) score += 50; // Increased from 30
        
        // Check if king is under attack
        const kingAttackers = countAttackers(blackKing, WHITE);
        if (kingAttackers > 0) {
            score += 120; // Heavy penalty for exposed king
        }
        
        // Check pawn shield
        const file = blackKing & 7;
        let pawnShield = 0;
        for (let f = Math.max(0, file - 1); f <= Math.min(7, file + 1); f++) {
            const shieldSquare = ((rank - 1) << 4) | f;
            if (isValidSquare(shieldSquare)) {
                const piece = board[shieldSquare];
                if (getPieceType(piece) === PAWN && getPieceColor(piece) === BLACK) {
                    pawnShield++;
                }
            }
        }
        score -= pawnShield * 15; // Increased from 10
    }
    
    return score;
}

// Evaluate castling rights and status
function evaluateCastling() {
    let score = 0;
    
    const whiteKing = findKing(WHITE);
    const blackKing = findKing(BLACK);
    
    // Bonus for having castling rights (encourages castling)
    if (castlingRights & (WHITE_KINGSIDE | WHITE_QUEENSIDE)) {
        score += 80; // Encourage keeping castling rights
    }
    
    if (castlingRights & (BLACK_KINGSIDE | BLACK_QUEENSIDE)) {
        score -= 80; // Encourage keeping castling rights
    }
    
    // Bonus for having castled (king on g1/c1 for white, g8/c8 for black)
    if (whiteKing === 0x06 || whiteKing === 0x02) {
        score += 150; // Large bonus for having castled
    }
    
    if (blackKing === 0x76 || blackKing === 0x72) {
        score -= 150; // Large bonus for having castled
    }
    
    return score;
}

// Main evaluation function
function evaluate() {
    // Check for checkmate/stalemate
    if (isCheckmate(WHITE)) return -999999;
    if (isCheckmate(BLACK)) return 999999;
    if (isDraw()) return 0;
    
    let score = 0;
    
    // Material evaluation (most important)
    score += evaluateMaterial();
    
    // Positional evaluation
    score += evaluatePosition();
    
    // Pawn structure
    score += evaluatePawns();
    
    // King safety (CRITICAL - prevents greedy play)
    score += evaluateKingSafety();
    
    // Castling bonus (CRITICAL - encourages castling)
    score += evaluateCastling();
    
    // Hanging pieces (CRITICAL - prevents blunders)
    score += evaluateHangingPieces();
    
    // Mobility (lighter weight in evaluation)
    // Commented out for performance - can be re-enabled for stronger play
    // score += evaluateMobility();
    
    return score;
}
