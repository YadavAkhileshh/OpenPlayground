// ====================================
// BOARD.JS - 0x88 Board Representation
// ====================================

// 0x88 Board: 128 element array (16x8)
// Valid squares: (index & 0x88) === 0
// Allows fast bounds checking and move validation

const EMPTY = 0;

// Piece types (white = positive, black = negative)
const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6;
const WHITE = 8, BLACK = 16;

// Piece values for evaluation
const PIECE_VALUES = {
    [PAWN]: 100,
    [KNIGHT]: 320,
    [BISHOP]: 330,
    [ROOK]: 500,
    [QUEEN]: 900,
    [KING]: 20000
};

// Unicode pieces for display
const PIECE_SYMBOLS = {
    [WHITE]: {
        [PAWN]: '♙',
        [KNIGHT]: '♘',
        [BISHOP]: '♗',
        [ROOK]: '♖',
        [QUEEN]: '♕',
        [KING]: '♔'
    },
    [BLACK]: {
        [PAWN]: '♟',
        [KNIGHT]: '♞',
        [BISHOP]: '♝',
        [ROOK]: '♜',
        [QUEEN]: '♛',
        [KING]: '♚'
    }
};

// Board state
let board = new Array(128);
let toMove = WHITE;
let castlingRights = 0;
let enPassant = -1;
let halfMoveClock = 0;
let fullMoveNumber = 1;
let moveHistory = [];
let capturedPieces = { [WHITE]: [], [BLACK]: [] };

// Castling flags
const WHITE_KINGSIDE = 1;
const WHITE_QUEENSIDE = 2;
const BLACK_KINGSIDE = 4;
const BLACK_QUEENSIDE = 8;

// Initialize board to starting position
function initBoard() {
    board.fill(EMPTY);
    
    // White pieces
    board[0x00] = WHITE | ROOK;
    board[0x01] = WHITE | KNIGHT;
    board[0x02] = WHITE | BISHOP;
    board[0x03] = WHITE | QUEEN;
    board[0x04] = WHITE | KING;
    board[0x05] = WHITE | BISHOP;
    board[0x06] = WHITE | KNIGHT;
    board[0x07] = WHITE | ROOK;
    
    for (let i = 0; i < 8; i++) {
        board[0x10 + i] = WHITE | PAWN;
    }
    
    // Black pieces
    board[0x70] = BLACK | ROOK;
    board[0x71] = BLACK | KNIGHT;
    board[0x72] = BLACK | BISHOP;
    board[0x73] = BLACK | QUEEN;
    board[0x74] = BLACK | KING;
    board[0x75] = BLACK | BISHOP;
    board[0x76] = BLACK | KNIGHT;
    board[0x77] = BLACK | ROOK;
    
    for (let i = 0; i < 8; i++) {
        board[0x60 + i] = BLACK | PAWN;
    }
    
    toMove = WHITE;
    castlingRights = WHITE_KINGSIDE | WHITE_QUEENSIDE | BLACK_KINGSIDE | BLACK_QUEENSIDE;
    enPassant = -1;
    halfMoveClock = 0;
    fullMoveNumber = 1;
    moveHistory = [];
    capturedPieces = { [WHITE]: [], [BLACK]: [] };
}

// Convert 0x88 index to algebraic notation
function indexToAlgebraic(index) {
    const file = index & 7;
    const rank = index >> 4;
    return String.fromCharCode(97 + file) + (rank + 1);
}

// Convert algebraic notation to 0x88 index
function algebraicToIndex(algebraic) {
    const file = algebraic.charCodeAt(0) - 97;
    const rank = parseInt(algebraic[1]) - 1;
    return (rank << 4) | file;
}

// Get piece at square
function getPiece(index) {
    return board[index];
}

// Get piece type (without color)
function getPieceType(piece) {
    return piece & 7;
}

// Get piece color
function getPieceColor(piece) {
    return piece & 24;
}

// Check if square is valid (0x88 trick)
function isValidSquare(index) {
    return (index & 0x88) === 0;
}

// Check if piece is white
function isWhite(piece) {
    return (piece & WHITE) !== 0;
}

// Check if piece is black
function isBlack(piece) {
    return (piece & BLACK) !== 0;
}

// Get opponent color
function opponent(color) {
    return color === WHITE ? BLACK : WHITE;
}

// Make a move on the board
function makeMove(move) {
    const piece = board[move.from];
    const captured = board[move.to];
    
    // Store move for undo
    const undoInfo = {
        from: move.from,
        to: move.to,
        piece: piece,
        captured: captured,
        castlingRights: castlingRights,
        enPassant: enPassant,
        halfMoveClock: halfMoveClock,
        fullMoveNumber: fullMoveNumber
    };
    
    // Move piece
    board[move.to] = piece;
    board[move.from] = EMPTY;
    
    // Track captured pieces
    if (captured !== EMPTY) {
        const capturedType = getPieceType(captured);
        const capturedColor = getPieceColor(captured);
        if (capturedColor === WHITE) {
            capturedPieces[BLACK].push(capturedType);
        } else {
            capturedPieces[WHITE].push(capturedType);
        }
    }
    
    // Handle castling
    if (move.flags & MOVE_CASTLE_KINGSIDE) {
        if (toMove === WHITE) {
            board[0x07] = EMPTY;
            board[0x05] = WHITE | ROOK;
        } else {
            board[0x77] = EMPTY;
            board[0x75] = BLACK | ROOK;
        }
    } else if (move.flags & MOVE_CASTLE_QUEENSIDE) {
        if (toMove === WHITE) {
            board[0x00] = EMPTY;
            board[0x03] = WHITE | ROOK;
        } else {
            board[0x70] = EMPTY;
            board[0x73] = BLACK | ROOK;
        }
    }
    
    // Handle en passant capture
    if (move.flags & MOVE_EN_PASSANT) {
        const capturedPawn = toMove === WHITE ? move.to - 16 : move.to + 16;
        const pawn = board[capturedPawn];
        board[capturedPawn] = EMPTY;
        const pawnColor = getPieceColor(pawn);
        if (toMove === WHITE) {
            capturedPieces[WHITE].push(PAWN);
        } else {
            capturedPieces[BLACK].push(PAWN);
        }
        undoInfo.enPassantCapture = capturedPawn;
        undoInfo.enPassantPiece = pawn;
    }
    
    // Handle pawn promotion
    if (move.flags & MOVE_PROMOTION) {
        board[move.to] = toMove | QUEEN; // Always promote to queen
    }
    
    // Update castling rights
    if (getPieceType(piece) === KING) {
        if (toMove === WHITE) {
            castlingRights &= ~(WHITE_KINGSIDE | WHITE_QUEENSIDE);
        } else {
            castlingRights &= ~(BLACK_KINGSIDE | BLACK_QUEENSIDE);
        }
    } else if (getPieceType(piece) === ROOK) {
        if (move.from === 0x00) castlingRights &= ~WHITE_QUEENSIDE;
        else if (move.from === 0x07) castlingRights &= ~WHITE_KINGSIDE;
        else if (move.from === 0x70) castlingRights &= ~BLACK_QUEENSIDE;
        else if (move.from === 0x77) castlingRights &= ~BLACK_KINGSIDE;
    }
    
    // Update en passant square
    enPassant = -1;
    if (getPieceType(piece) === PAWN) {
        if (Math.abs(move.to - move.from) === 32) {
            enPassant = (move.from + move.to) / 2;
        }
    }
    
    // Update move counters
    if (captured !== EMPTY || getPieceType(piece) === PAWN) {
        halfMoveClock = 0;
    } else {
        halfMoveClock++;
    }
    
    if (toMove === BLACK) {
        fullMoveNumber++;
    }
    
    // Switch turn
    toMove = opponent(toMove);
    
    // Add to history
    moveHistory.push(undoInfo);
    
    return undoInfo;
}

// Undo last move
function undoMove() {
    if (moveHistory.length === 0) return;
    
    const undoInfo = moveHistory.pop();
    
    // Restore board
    board[undoInfo.from] = undoInfo.piece;
    board[undoInfo.to] = undoInfo.captured;
    
    // Restore castling rook
    const piece = undoInfo.piece;
    const pieceType = getPieceType(piece);
    const color = getPieceColor(piece);
    
    if (pieceType === KING) {
        const kingFrom = undoInfo.from;
        const kingTo = undoInfo.to;
        
        if (kingFrom === 0x04 && kingTo === 0x06) { // White kingside
            board[0x07] = WHITE | ROOK;
            board[0x05] = EMPTY;
        } else if (kingFrom === 0x04 && kingTo === 0x02) { // White queenside
            board[0x00] = WHITE | ROOK;
            board[0x03] = EMPTY;
        } else if (kingFrom === 0x74 && kingTo === 0x76) { // Black kingside
            board[0x77] = BLACK | ROOK;
            board[0x75] = EMPTY;
        } else if (kingFrom === 0x74 && kingTo === 0x72) { // Black queenside
            board[0x70] = BLACK | ROOK;
            board[0x73] = EMPTY;
        }
    }
    
    // Restore en passant capture
    if (undoInfo.enPassantCapture !== undefined) {
        board[undoInfo.enPassantCapture] = undoInfo.enPassantPiece;
    }
    
    // Restore state
    castlingRights = undoInfo.castlingRights;
    enPassant = undoInfo.enPassant;
    halfMoveClock = undoInfo.halfMoveClock;
    fullMoveNumber = undoInfo.fullMoveNumber;
    
    // Restore turn
    toMove = opponent(toMove);
    
    // Remove captured piece from list
    if (undoInfo.captured !== EMPTY) {
        const capturedType = getPieceType(undoInfo.captured);
        const capturedColor = getPieceColor(undoInfo.captured);
        const capturingPlayer = capturedColor === WHITE ? BLACK : WHITE;
        const idx = capturedPieces[capturingPlayer].indexOf(capturedType);
        if (idx !== -1) capturedPieces[capturingPlayer].splice(idx, 1);
    }
    
    // Remove en passant captured piece
    if (undoInfo.enPassantPiece !== undefined) {
        const capturingPlayer = toMove === WHITE ? WHITE : BLACK;
        const idx = capturedPieces[capturingPlayer].indexOf(PAWN);
        if (idx !== -1) capturedPieces[capturingPlayer].splice(idx, 1);
    }
}
