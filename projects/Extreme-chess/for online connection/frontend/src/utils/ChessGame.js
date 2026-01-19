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
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[0] = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].map(p => ({ type: p, color: 'black' }));
        board[1] = Array(8).fill(null).map(() => ({ type: 'p', color: 'black' }));
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
        const legalMoves = this.getLegalMoves(fromRow, fromCol);
        return legalMoves.some(move => move.row === toRow && move.col === toCol);
    }

    getLegalMoves(row, col) {
        const piece = this.getPiece(row, col);
        if (!piece) return [];
        let moves = [];
        switch (piece.type) {
            case 'p': moves = this.getPawnMoves(row, col, piece.color); break;
            case 'r': moves = this.getRookMoves(row, col, piece.color); break;
            case 'n': moves = this.getKnightMoves(row, col, piece.color); break;
            case 'b': moves = this.getBishopMoves(row, col, piece.color); break;
            case 'q': moves = this.getQueenMoves(row, col, piece.color); break;
            case 'k': moves = this.getKingMoves(row, col, piece.color); break;
        }
        return moves.filter(move => !this.wouldBeInCheck(row, col, move.row, move.col, piece.color));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        if (!this.getPiece(row + direction, col)) {
            moves.push({ row: row + direction, col });
            if (row === startRow && !this.getPiece(row + 2 * direction, col)) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        for (const dcol of [-1, 1]) {
            const newCol = col + dcol;
            const targetPiece = this.getPiece(row + direction, newCol);
            if (targetPiece && targetPiece.color !== color) {
                moves.push({ row: row + direction, col: newCol });
            }
            if (this.enPassantTarget && this.enPassantTarget.row === row + direction && this.enPassantTarget.col === newCol) {
                moves.push({ row: row + direction, col: newCol, enPassant: true });
            }
        }
        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [drow, dcol] of directions) {
            let newRow = row + drow, newCol = col + dcol;
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece) moves.push({ row: newRow, col: newCol });
                else {
                    if (targetPiece.color !== color) moves.push({ row: newRow, col: newCol });
                    break;
                }
                newRow += drow; newCol += dcol;
            }
        }
        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [drow, dcol] of knightMoves) {
            const newRow = row + drow, newCol = col + dcol;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece || targetPiece.color !== color) moves.push({ row: newRow, col: newCol });
            }
        }
        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
        for (const [drow, dcol] of directions) {
            let newRow = row + drow, newCol = col + dcol;
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece) moves.push({ row: newRow, col: newCol });
                else {
                    if (targetPiece.color !== color) moves.push({ row: newRow, col: newCol });
                    break;
                }
                newRow += drow; newCol += dcol;
            }
        }
        return moves;
    }

    getQueenMoves(row, col, color) { return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)]; }

    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for (const [drow, dcol] of directions) {
            const newRow = row + drow, newCol = col + dcol;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.getPiece(newRow, newCol);
                if (!targetPiece || targetPiece.color !== color) moves.push({ row: newRow, col: newCol });
            }
        }
        moves.push(...this.getCastlingMoves(row, col, color));
        return moves;
    }

    getCastlingMoves(row, col, color) {
        const moves = [];
        if (this.isInCheck(color)) return moves;
        const rights = this.castlingRights[color];
        if (rights.kingside && !this.getPiece(row, 5) && !this.getPiece(row, 6)) {
            if (!this.wouldBeInCheck(row, col, row, 5, color) && !this.wouldBeInCheck(row, col, row, 6, color)) moves.push({ row, col: 6, castling: 'kingside' });
        }
        if (rights.queenside && !this.getPiece(row, 1) && !this.getPiece(row, 2) && !this.getPiece(row, 3)) {
            if (!this.wouldBeInCheck(row, col, row, 3, color) && !this.wouldBeInCheck(row, col, row, 2, color)) moves.push({ row, col: 2, castling: 'queenside' });
        }
        return moves;
    }

    findKing(color) {
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
            const p = this.getPiece(r, c);
            if (p && p.type === 'k' && p.color === color) return { row: r, col: c };
        }
        return null;
    }

    isInCheck(color) {
        const kingPos = this.findKing(color);
        if (!kingPos) return false;
        const opponentColor = color === 'white' ? 'black' : 'white';
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
            const p = this.getPiece(r, c);
            if (p && p.color === opponentColor) {
                const moves = this.getPieceMovesForCheck(r, c, p);
                if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) return true;
            }
        }
        return false;
    }

    getPieceMovesForCheck(row, col, piece) {
        switch (piece.type) {
            case 'p': return this.getPawnMoves(row, col, piece.color);
            case 'r': return this.getRookMoves(row, col, piece.color);
            case 'n': return this.getKnightMoves(row, col, piece.color);
            case 'b': return this.getBishopMoves(row, col, piece.color);
            case 'q': return this.getQueenMoves(row, col, piece.color);
            case 'k':
                const moves = [];
                for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    let nr = row + dr, nc = col + dc;
                    if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) moves.push({ row: nr, col: nc });
                }
                return moves;
            default: return [];
        }
    }

    wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        const piece = this.board[fromRow][fromCol], captured = this.board[toRow][toCol];
        this.board[toRow][toCol] = piece; this.board[fromRow][fromCol] = null;
        const inCheck = this.isInCheck(color);
        this.board[fromRow][fromCol] = piece; this.board[toRow][toCol] = captured;
        return inCheck;
    }

    makeMove(fromRow, fromCol, toRow, toCol, promotion = 'q') {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return { success: false, message: 'Invalid move' };
        const piece = this.board[fromRow][fromCol], capturedPiece = this.board[toRow][toCol];
        const move = this.getLegalMoves(fromRow, fromCol).find(m => m.row === toRow && m.col === toCol);
        if (move && move.enPassant) {
            const cpRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            this.capturedPieces[piece.color].push(this.board[cpRow][toCol]);
            this.board[cpRow][toCol] = null;
        } else if (capturedPiece) this.capturedPieces[piece.color].push(capturedPiece);
        if (move && move.castling) {
            const rfc = move.castling === 'kingside' ? 7 : 0, rtc = move.castling === 'kingside' ? 5 : 3;
            this.board[fromRow][rtc] = this.board[fromRow][rfc]; this.board[fromRow][rfc] = null;
        }
        this.board[toRow][toCol] = (piece.type === 'p' && (toRow === 0 || toRow === 7)) ? { type: promotion, color: piece.color } : piece;
        this.board[fromRow][fromCol] = null;
        this.enPassantTarget = (piece.type === 'p' && Math.abs(toRow - fromRow) === 2) ? { row: (fromRow + toRow) / 2, col: toCol } : null;
        if (piece.type === 'k') { this.castlingRights[piece.color].kingside = false; this.castlingRights[piece.color].queenside = false; }
        if (piece.type === 'r') { if (fromCol === 0) this.castlingRights[piece.color].queenside = false; if (fromCol === 7) this.castlingRights[piece.color].kingside = false; }
        this.moveHistory.push({ from: { row: fromRow, col: fromCol }, to: { row: toRow, col: toCol }, piece: piece.type, captured: capturedPiece, player: this.currentPlayer });
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        const inCheck = this.isInCheck(this.currentPlayer), hasMoves = this.hasAnyLegalMoves(this.currentPlayer);
        let gameStatus = 'ongoing';
        if (inCheck && !hasMoves) gameStatus = 'checkmate';
        else if (!inCheck && !hasMoves) gameStatus = 'stalemate';
        else if (inCheck) gameStatus = 'check';
        return { success: true, board: this.board, currentPlayer: this.currentPlayer, capturedPieces: this.capturedPieces, moveHistory: this.moveHistory, gameStatus, inCheck };
    }

    hasAnyLegalMoves(color) {
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
            const p = this.getPiece(r, c);
            if (p && p.color === color && this.getLegalMoves(r, c).length > 0) return true;
        }
        return false;
    }

    getGameState() { return { board: this.board, currentPlayer: this.currentPlayer, moveHistory: this.moveHistory, capturedPieces: this.capturedPieces, inCheck: this.isInCheck(this.currentPlayer) }; }

    getFEN() {
        let fen = '';
        for (let r = 0; r < 8; r++) {
            let empty = 0;
            for (let c = 0; c < 8; c++) {
                const p = this.getPiece(r, c);
                if (!p) {
                    empty++;
                } else {
                    if (empty > 0) {
                        fen += empty;
                        empty = 0;
                    }
                    const char = p.type === 'p' ? 'p' : p.type;
                    fen += p.color === 'white' ? char.toUpperCase() : char;
                }
            }
            if (empty > 0) fen += empty;
            if (r < 7) fen += '/';
        }

        fen += ` ${this.currentPlayer === 'white' ? 'w' : 'b'}`;

        let castling = '';
        if (this.castlingRights.white.kingside) castling += 'K';
        if (this.castlingRights.white.queenside) castling += 'Q';
        if (this.castlingRights.black.kingside) castling += 'k';
        if (this.castlingRights.black.queenside) castling += 'q';
        fen += ` ${castling || '-'}`;

        if (this.enPassantTarget) {
            const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
            fen += ` ${files[this.enPassantTarget.col]}${8 - this.enPassantTarget.row}`;
        } else {
            fen += ' -';
        }

        fen += ` ${this.halfMoveClock} ${this.fullMoveNumber}`;
        return fen;
    }
}

