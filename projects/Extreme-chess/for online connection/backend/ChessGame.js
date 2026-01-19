export class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.moveHistory = [];
        this.capturedPieces = { white: [], black: [] };
        this.enPassantTarget = null;
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.halfMoveClock = 0;
        this.fullMoveNumber = 1;
    }

    initializeBoard() {
        // Initialize 8x8 board with pieces in starting positions
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Black pieces (top of board)
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(p => ({ type: p, color: 'black' }));
        board[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'black' }));

        // White pieces (bottom of board)
        board[6] = Array(8).fill(null).map(() => ({ type: 'p', color: 'white' }));
        board[7] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(p => ({ type: p, color: 'white' }));

        return board;
    }

    getPiece(row, col) {
        if (row < 0 || row > 7 || col < 0 || col > 7) return null;
        return this.board[row][col];
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        if (!piece || piece.color !== this.currentPlayer) return false;

        const targetPiece = this.getPiece(toRow, toCol);
        if (targetPiece && targetPiece.color === piece.color) return false;

        // Get legal moves for the piece
        const legalMoves = this.getLegalMoves(fromRow, fromCol);
        return legalMoves.some(move => move.row === toRow && move.col === toCol);
    }

    getLegalMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];

        let moves = [];

        switch (piece.type) {
            case 'p':
                moves = this.getPawnMoves(row, col, piece.color);
                break;
            case 'r':
                moves = this.getRookMoves(row, col, piece.color);
                break;
            case 'n':
                moves = this.getKnightMoves(row, col, piece.color);
                break;
            case 'b':
                moves = this.getBishopMoves(row, col, piece.color);
                break;
            case 'q':
                moves = this.getQueenMoves(row, col, piece.color);
                break;
            case 'k':
                moves = this.getKingMoves(row, col, piece.color);
                break;
        }

        // Filter out moves that would leave king in check
        return moves.filter(move => {
            return !this.wouldBeInCheck(row, col, move.row, move.col, piece.color);
        });
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Forward move
        if (!this.getPiece(row + direction, col)) {
            moves.push({ row: row + direction, col });

            // Double move from starting position
            if (row === startRow && !this.getPiece(row + 2 * direction, col)) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Captures (diagonal)
        for (const dcol of [-1, 1]) {
            const newCol = col + dcol;
            const targetPiece = this.getPiece(row + direction, newCol);
            if (targetPiece && targetPiece.color !== color) {
                moves.push({ row: row + direction, col: newCol });
            }

            // En passant
            if (this.enPassantTarget &&
                this.enPassantTarget.row === row + direction &&
                this.enPassantTarget.col === newCol) {
                moves.push({ row: row + direction, col: newCol, enPassant: true });
            }
        }

        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        for (const [drow, dcol] of directions) {
            let newRow = row + drow;
            let newCol = col + dcol;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += drow;
                newCol += dcol;
            }
        }

        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [drow, dcol] of knightMoves) {
            const newRow = row + drow;
            const newCol = col + dcol;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        for (const [drow, dcol] of directions) {
            let newRow = row + drow;
            let newCol = col + dcol;

            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (targetPiece.color !== color) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
                newRow += drow;
                newCol += dcol;
            }
        }

        return moves;
    }

    getQueenMoves(row, col, color) {
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];

        for (const [drow, dcol] of directions) {
            const newRow = row + drow;
            const newCol = col + dcol;

            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }

        // Castling
        const castlingMoves = this.getCastlingMoves(row, col, color);
        moves.push(...castlingMoves);

        return moves;
    }

    getCastlingMoves(row, col, color) {
        const moves = [];

        if (this.isInCheck(color)) return moves;

        const rights = this.castlingRights[color];

        // Kingside castling
        if (rights.kingside) {
            if (!this.getPiece(row, 5) && !this.getPiece(row, 6)) {
                if (!this.wouldBeInCheck(row, col, row, 5, color) &&
                    !this.wouldBeInCheck(row, col, row, 6, color)) {
                    moves.push({ row, col: 6, castling: 'kingside' });
                }
            }
        }

        // Queenside castling
        if (rights.queenside) {
            if (!this.getPiece(row, 1) && !this.getPiece(row, 2) && !this.getPiece(row, 3)) {
                if (!this.wouldBeInCheck(row, col, row, 3, color) &&
                    !this.wouldBeInCheck(row, col, row, 2, color)) {
                    moves.push({ row, col: 2, castling: 'queenside' });
                }
            }
        }

        return moves;
    }

    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === 'k' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }

    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;

        const opponentColor = color === 'white' ? 'black' : 'white';

        // Check if any opponent piece can attack the king
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === opponentColor) {
                    const moves = this.getPieceMoves(row, col, piece);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    getPieceMoves(row, col, piece) {
        // Get raw moves without check validation
        switch (piece.type) {
            case 'p':
                return this.getPawnMoves(row, col, piece.color);
            case 'r':
                return this.getRookMoves(row, col, piece.color);
            case 'n':
                return this.getKnightMoves(row, col, piece.color);
            case 'b':
                return this.getBishopMoves(row, col, piece.color);
            case 'q':
                return this.getQueenMoves(row, col, piece.color);
            case 'k':
                // For check detection, don't include castling
                const moves = [];
                const directions = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1], [0, 1],
                    [1, -1], [1, 0], [1, 1]
                ];
                for (const [drow, dcol] of directions) {
                    const newRow = row + drow;
                    const newCol = col + dcol;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        moves.push({ row: newRow, col: newCol });
                    }
                }
                return moves;
            default:
                return [];
        }
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Simulate the move and check if king would be in check
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        const inCheck = this.isInCheck(color);

        // Undo the move
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = capturedPiece;

        return inCheck;
    }

    makeMove(fromRow, fromCol, toRow, toCol, promotion = 'q') {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) {
            return { success: false, message: 'Invalid move' };
        }

        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        const move = this.getLegalMoves(fromRow, fromCol).find(m => m.row === toRow && m.col === toCol);

        // Handle en passant capture
        if (move && move.enPassant) {
            const capturedPawnRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            const capturedPawn = this.board[capturedPawnRow][toCol];
            this.capturedPieces[piece.color].push(capturedPawn);
            this.board[capturedPawnRow][toCol] = null;
        } else if (capturedPiece) {
            this.capturedPieces[piece.color].push(capturedPiece);
        }

        // Handle castling
        if (move && move.castling) {
            const rookFromCol = move.castling === 'kingside' ? 7 : 0;
            const rookToCol = move.castling === 'kingside' ? 5 : 3;
            this.board[fromRow][rookToCol] = this.board[fromRow][rookFromCol];
            this.board[fromRow][rookFromCol] = null;
        }

        // Move the piece
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Handle pawn promotion
        if (piece.type === 'p' && (toRow === 0 || toRow === 7)) {
            this.board[toRow][toCol] = { type: promotion, color: piece.color };
        }

        // Update en passant target
        this.enPassantTarget = null;
        if (piece.type === 'p' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = { row: (fromRow + toRow) / 2, col: toCol };
        }

        // Update castling rights
        if (piece.type === 'k') {
            this.castlingRights[piece.color].kingside = false;
            this.castlingRights[piece.color].queenside = false;
        }
        if (piece.type === 'r') {
            if (fromCol === 0) this.castlingRights[piece.color].queenside = false;
            if (fromCol === 7) this.castlingRights[piece.color].kingside = false;
        }

        // Record move
        this.moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece.type,
            captured: capturedPiece,
            player: this.currentPlayer
        });

        // Switch player
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';

        // Check game state
        const inCheck = this.isInCheck(this.currentPlayer);
        const hasLegalMoves = this.hasAnyLegalMoves(this.currentPlayer);

        let gameStatus = 'ongoing';
        if (inCheck && !hasLegalMoves) {
            gameStatus = 'checkmate';
        } else if (!inCheck && !hasLegalMoves) {
            gameStatus = 'stalemate';
        } else if (inCheck) {
            gameStatus = 'check';
        }

        return {
            success: true,
            board: this.board,
            currentPlayer: this.currentPlayer,
            capturedPieces: this.capturedPieces,
            moveHistory: this.moveHistory,
            gameStatus,
            inCheck
        };
    }

    hasAnyLegalMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.color === color) {
                    const legalMoves = this.getLegalMoves(row, col);
                    if (legalMoves.length > 0) return true;
                }
            }
        }
        return false;
    }

    getGameState() {
        return {
            board: this.board,
            currentPlayer: this.currentPlayer,
            moveHistory: this.moveHistory,
            capturedPieces: this.capturedPieces,
            inCheck: this.isInCheck(this.currentPlayer)
        };
    }
}
