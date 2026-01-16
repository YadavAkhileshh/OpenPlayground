// ====================================
// MOVES.JS - Legal Move Generation
// ====================================

// Move flags
const MOVE_NORMAL = 0;
const MOVE_CAPTURE = 1;
const MOVE_CASTLE_KINGSIDE = 2;
const MOVE_CASTLE_QUEENSIDE = 4;
const MOVE_EN_PASSANT = 8;
const MOVE_PROMOTION = 16;

// Direction offsets for pieces
const KNIGHT_OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];
const BISHOP_OFFSETS = [-17, -15, 15, 17];
const ROOK_OFFSETS = [-16, -1, 1, 16];
const QUEEN_OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];
const KING_OFFSETS = [-17, -16, -15, -1, 1, 15, 16, 17];

// Generate all pseudo-legal moves for a piece
function generatePseudoLegalMoves(index) {
    const moves = [];
    const piece = board[index];
    if (piece === EMPTY) return moves;
    
    const pieceType = getPieceType(piece);
    const color = getPieceColor(piece);
    
    switch (pieceType) {
        case PAWN:
            generatePawnMoves(index, color, moves);
            break;
        case KNIGHT:
            generateKnightMoves(index, color, moves);
            break;
        case BISHOP:
            generateBishopMoves(index, color, moves);
            break;
        case ROOK:
            generateRookMoves(index, color, moves);
            break;
        case QUEEN:
            generateQueenMoves(index, color, moves);
            break;
        case KING:
            generateKingMoves(index, color, moves);
            break;
    }
    
    return moves;
}

// Generate pawn moves
function generatePawnMoves(index, color, moves) {
    const direction = color === WHITE ? 16 : -16;
    const startRank = color === WHITE ? 1 : 6;
    const promotionRank = color === WHITE ? 7 : 0;
    const currentRank = index >> 4;
    
    // Forward move
    const forward = index + direction;
    if (isValidSquare(forward) && board[forward] === EMPTY) {
        const flags = (forward >> 4) === promotionRank ? MOVE_PROMOTION : MOVE_NORMAL;
        moves.push({ from: index, to: forward, flags });
        
        // Double move from starting position
        if (currentRank === startRank) {
            const doubleForward = forward + direction;
            if (board[doubleForward] === EMPTY) {
                moves.push({ from: index, to: doubleForward, flags: MOVE_NORMAL });
            }
        }
    }
    
    // Captures
    const captureOffsets = color === WHITE ? [15, 17] : [-17, -15];
    for (const offset of captureOffsets) {
        const to = index + offset;
        if (!isValidSquare(to)) continue;
        
        const target = board[to];
        if (target !== EMPTY && getPieceColor(target) !== color) {
            const flags = ((to >> 4) === promotionRank ? MOVE_PROMOTION : MOVE_NORMAL) | MOVE_CAPTURE;
            moves.push({ from: index, to, flags });
        }
        
        // En passant
        if (to === enPassant) {
            moves.push({ from: index, to, flags: MOVE_EN_PASSANT | MOVE_CAPTURE });
        }
    }
}

// Generate knight moves
function generateKnightMoves(index, color, moves) {
    for (const offset of KNIGHT_OFFSETS) {
        const to = index + offset;
        if (!isValidSquare(to)) continue;
        
        const target = board[to];
        if (target === EMPTY) {
            moves.push({ from: index, to, flags: MOVE_NORMAL });
        } else if (getPieceColor(target) !== color) {
            moves.push({ from: index, to, flags: MOVE_CAPTURE });
        }
    }
}

// Generate sliding piece moves (bishop, rook, queen)
function generateSlidingMoves(index, color, offsets, moves) {
    for (const offset of offsets) {
        let to = index + offset;
        
        while (isValidSquare(to)) {
            const target = board[to];
            
            if (target === EMPTY) {
                moves.push({ from: index, to, flags: MOVE_NORMAL });
            } else {
                if (getPieceColor(target) !== color) {
                    moves.push({ from: index, to, flags: MOVE_CAPTURE });
                }
                break;
            }
            
            to += offset;
        }
    }
}

function generateBishopMoves(index, color, moves) {
    generateSlidingMoves(index, color, BISHOP_OFFSETS, moves);
}

function generateRookMoves(index, color, moves) {
    generateSlidingMoves(index, color, ROOK_OFFSETS, moves);
}

function generateQueenMoves(index, color, moves) {
    generateSlidingMoves(index, color, QUEEN_OFFSETS, moves);
}

// Generate king moves (including castling)
function generateKingMoves(index, color, moves) {
    // Normal king moves
    for (const offset of KING_OFFSETS) {
        const to = index + offset;
        if (!isValidSquare(to)) continue;
        
        const target = board[to];
        if (target === EMPTY) {
            moves.push({ from: index, to, flags: MOVE_NORMAL });
        } else if (getPieceColor(target) !== color) {
            moves.push({ from: index, to, flags: MOVE_CAPTURE });
        }
    }
    
    // Castling
    if (color === WHITE) {
        // Kingside
        if ((castlingRights & WHITE_KINGSIDE) &&
            board[0x05] === EMPTY &&
            board[0x06] === EMPTY &&
            !isSquareAttacked(0x04, BLACK) &&
            !isSquareAttacked(0x05, BLACK) &&
            !isSquareAttacked(0x06, BLACK)) {
            moves.push({ from: 0x04, to: 0x06, flags: MOVE_CASTLE_KINGSIDE });
        }
        
        // Queenside
        if ((castlingRights & WHITE_QUEENSIDE) &&
            board[0x01] === EMPTY &&
            board[0x02] === EMPTY &&
            board[0x03] === EMPTY &&
            !isSquareAttacked(0x04, BLACK) &&
            !isSquareAttacked(0x03, BLACK) &&
            !isSquareAttacked(0x02, BLACK)) {
            moves.push({ from: 0x04, to: 0x02, flags: MOVE_CASTLE_QUEENSIDE });
        }
    } else {
        // Kingside
        if ((castlingRights & BLACK_KINGSIDE) &&
            board[0x75] === EMPTY &&
            board[0x76] === EMPTY &&
            !isSquareAttacked(0x74, WHITE) &&
            !isSquareAttacked(0x75, WHITE) &&
            !isSquareAttacked(0x76, WHITE)) {
            moves.push({ from: 0x74, to: 0x76, flags: MOVE_CASTLE_KINGSIDE });
        }
        
        // Queenside
        if ((castlingRights & BLACK_QUEENSIDE) &&
            board[0x71] === EMPTY &&
            board[0x72] === EMPTY &&
            board[0x73] === EMPTY &&
            !isSquareAttacked(0x74, WHITE) &&
            !isSquareAttacked(0x73, WHITE) &&
            !isSquareAttacked(0x72, WHITE)) {
            moves.push({ from: 0x74, to: 0x72, flags: MOVE_CASTLE_QUEENSIDE });
        }
    }
}

// Generate all pseudo-legal moves for a side
function generateAllPseudoLegalMoves(color) {
    const moves = [];
    
    for (let i = 0; i < 128; i++) {
        if (!isValidSquare(i)) continue;
        
        const piece = board[i];
        if (piece !== EMPTY && getPieceColor(piece) === color) {
            generatePseudoLegalMoves(i).forEach(move => moves.push(move));
        }
    }
    
    return moves;
}

// Filter out illegal moves (those that leave king in check)
function filterLegalMoves(moves, color) {
    const legalMoves = [];
    
    for (const move of moves) {
        makeMove(move);
        
        if (!isInCheck(color)) {
            legalMoves.push(move);
        }
        
        undoMove();
    }
    
    return legalMoves;
}

// Generate all legal moves for a side
function generateLegalMoves(color) {
    const pseudoLegal = generateAllPseudoLegalMoves(color);
    return filterLegalMoves(pseudoLegal, color);
}

// Get legal moves for a specific piece
function getLegalMovesForPiece(index) {
    const piece = board[index];
    if (piece === EMPTY) return [];
    
    const color = getPieceColor(piece);
    if (color !== toMove) return [];
    
    const pseudoLegal = generatePseudoLegalMoves(index);
    return filterLegalMoves(pseudoLegal, color);
}
