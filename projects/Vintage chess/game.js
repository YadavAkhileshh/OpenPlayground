// Chess Game Logic

class ChessGame {
  constructor() {
    this.board = [];
    this.currentPlayer = "white";
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.whiteKingPosition = { row: 7, col: 4 };
    this.blackKingPosition = { row: 0, col: 4 };
    this.lastMove = null;
    this.castlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    };
    this.enPassantTarget = null;
    this.initializeBoard();
  }

  initializeBoard() {
    // Create empty 8x8 board
    this.board = Array(8)
      .fill()
      .map(() => Array(8).fill(null));

    // Set up black pieces
    this.board[0][0] = { type: "rook", color: "black", moved: false };
    this.board[0][1] = { type: "knight", color: "black", moved: false };
    this.board[0][2] = { type: "bishop", color: "black", moved: false };
    this.board[0][3] = { type: "queen", color: "black", moved: false };
    this.board[0][4] = { type: "king", color: "black", moved: false };
    this.board[0][5] = { type: "bishop", color: "black", moved: false };
    this.board[0][6] = { type: "knight", color: "black", moved: false };
    this.board[0][7] = { type: "rook", color: "black", moved: false };

    // Set up black pawns
    for (let col = 0; col < 8; col++) {
      this.board[1][col] = { type: "pawn", color: "black", moved: false };
    }

    // Set up white pawns
    for (let col = 0; col < 8; col++) {
      this.board[6][col] = { type: "pawn", color: "white", moved: false };
    }

    // Set up white pieces
    this.board[7][0] = { type: "rook", color: "white", moved: false };
    this.board[7][1] = { type: "knight", color: "white", moved: false };
    this.board[7][2] = { type: "bishop", color: "white", moved: false };
    this.board[7][3] = { type: "queen", color: "white", moved: false };
    this.board[7][4] = { type: "king", color: "white", moved: false };
    this.board[7][5] = { type: "bishop", color: "white", moved: false };
    this.board[7][6] = { type: "knight", color: "white", moved: false };
    this.board[7][7] = { type: "rook", color: "white", moved: false };

    this.currentPlayer = "white";
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    };
    this.enPassantTarget = null;
    this.lastMove = null;
  }

  getBoard() {
    return this.board;
  }

  getLegalMoves(row, col) {
    const piece = this.board[row][col];
    if (!piece || piece.color !== this.currentPlayer) return [];

    let moves = [];

    switch (piece.type) {
      case "pawn":
        moves = this.getPawnMoves(row, col, piece.color);
        break;
      case "rook":
        moves = this.getRookMoves(row, col, piece.color);
        break;
      case "knight":
        moves = this.getKnightMoves(row, col, piece.color);
        break;
      case "bishop":
        moves = this.getBishopMoves(row, col, piece.color);
        break;
      case "queen":
        moves = this.getQueenMoves(row, col, piece.color);
        break;
      case "king":
        moves = this.getKingMoves(row, col, piece.color);
        break;
    }

    // Filter out moves that would leave king in check
    return moves.filter((move) => {
      // Make a copy of the board
      const boardCopy = this.board.map((row) => row.slice());
      const capturedPiece = boardCopy[move.to.row][move.to.col];

      // Make the move on the copy
      boardCopy[move.to.row][move.to.col] =
        boardCopy[move.from.row][move.from.col];
      boardCopy[move.from.row][move.from.col] = null;

      // Check if king is in check after move
      const kingPos =
        piece.type === "king"
          ? { row: move.to.row, col: move.to.col }
          : piece.color === "white"
            ? this.whiteKingPosition
            : this.blackKingPosition;

      return !this.isSquareAttacked(
        kingPos.row,
        kingPos.col,
        piece.color === "white" ? "black" : "white",
        boardCopy,
      );
    });
  }

  getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === "white" ? -1 : 1;
    const startRow = color === "white" ? 6 : 1;

    // Move forward one square
    if (
      this.isValidSquare(row + direction, col) &&
      !this.board[row + direction][col]
    ) {
      moves.push({
        from: { row, col },
        to: { row: row + direction, col },
      });

      // Move forward two squares from starting position
      if (row === startRow && !this.board[row + 2 * direction][col]) {
        moves.push({
          from: { row, col },
          to: { row: row + 2 * direction, col },
          enPassant: true,
        });
      }
    }

    // Capture diagonally
    const captureCols = [col - 1, col + 1];
    for (const captureCol of captureCols) {
      if (this.isValidSquare(row + direction, captureCol)) {
        const targetPiece = this.board[row + direction][captureCol];
        if (targetPiece && targetPiece.color !== color) {
          moves.push({
            from: { row, col },
            to: { row: row + direction, col: captureCol },
            capture: true,
          });
        }

        // En passant
        if (
          this.enPassantTarget &&
          this.enPassantTarget.row === row + direction &&
          this.enPassantTarget.col === captureCol
        ) {
          moves.push({
            from: { row, col },
            to: { row: row + direction, col: captureCol },
            enPassantCapture: true,
          });
        }
      }
    }

    return moves;
  }

  getRookMoves(row, col, color) {
    const moves = [];
    const directions = [
      { dr: -1, dc: 0 }, // up
      { dr: 1, dc: 0 }, // down
      { dr: 0, dc: -1 }, // left
      { dr: 0, dc: 1 }, // right
    ];

    for (const dir of directions) {
      let r = row + dir.dr;
      let c = col + dir.dc;

      while (this.isValidSquare(r, c)) {
        const targetPiece = this.board[r][c];

        if (!targetPiece) {
          moves.push({ from: { row, col }, to: { row: r, col: c } });
        } else {
          if (targetPiece.color !== color) {
            moves.push({
              from: { row, col },
              to: { row: r, col: c },
              capture: true,
            });
          }
          break;
        }

        r += dir.dr;
        c += dir.dc;
      }
    }

    return moves;
  }

  getKnightMoves(row, col, color) {
    const moves = [];
    const knightMoves = [
      { dr: -2, dc: -1 },
      { dr: -2, dc: 1 },
      { dr: -1, dc: -2 },
      { dr: -1, dc: 2 },
      { dr: 1, dc: -2 },
      { dr: 1, dc: 2 },
      { dr: 2, dc: -1 },
      { dr: 2, dc: 1 },
    ];

    for (const move of knightMoves) {
      const r = row + move.dr;
      const c = col + move.dc;

      if (this.isValidSquare(r, c)) {
        const targetPiece = this.board[r][c];

        if (!targetPiece) {
          moves.push({ from: { row, col }, to: { row: r, col: c } });
        } else if (targetPiece.color !== color) {
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            capture: true,
          });
        }
      }
    }

    return moves;
  }

  getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [
      { dr: -1, dc: -1 }, // up-left
      { dr: -1, dc: 1 }, // up-right
      { dr: 1, dc: -1 }, // down-left
      { dr: 1, dc: 1 }, // down-right
    ];

    for (const dir of directions) {
      let r = row + dir.dr;
      let c = col + dir.dc;

      while (this.isValidSquare(r, c)) {
        const targetPiece = this.board[r][c];

        if (!targetPiece) {
          moves.push({ from: { row, col }, to: { row: r, col: c } });
        } else {
          if (targetPiece.color !== color) {
            moves.push({
              from: { row, col },
              to: { row: r, col: c },
              capture: true,
            });
          }
          break;
        }

        r += dir.dr;
        c += dir.dc;
      }
    }

    return moves;
  }

  getQueenMoves(row, col, color) {
    // Queen moves are combination of rook and bishop moves
    return [
      ...this.getRookMoves(row, col, color),
      ...this.getBishopMoves(row, col, color),
    ];
  }

  getKingMoves(row, col, color) {
    const moves = [];
    const kingMoves = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 0 },
      { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
    ];

    for (const move of kingMoves) {
      const r = row + move.dr;
      const c = col + move.dc;

      if (this.isValidSquare(r, c)) {
        const targetPiece = this.board[r][c];

        if (!targetPiece) {
          moves.push({ from: { row, col }, to: { row: r, col: c } });
        } else if (targetPiece.color !== color) {
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            capture: true,
          });
        }
      }
    }

    // Castling
    const castlingRights = this.castlingRights[color];
    if (!this.isInCheck(color)) {
      // King-side castling
      if (castlingRights.kingSide) {
        const kingSideEmpty =
          !this.board[row][col + 1] &&
          !this.board[row][col + 2] &&
          !this.isSquareAttacked(
            row,
            col + 1,
            color === "white" ? "black" : "white",
          ) &&
          !this.isSquareAttacked(
            row,
            col + 2,
            color === "white" ? "black" : "white",
          );

        if (kingSideEmpty) {
          moves.push({
            from: { row, col },
            to: { row: row, col: col + 2 },
            castling: "kingSide",
          });
        }
      }

      // Queen-side castling
      if (castlingRights.queenSide) {
        const queenSideEmpty =
          !this.board[row][col - 1] &&
          !this.board[row][col - 2] &&
          !this.board[row][col - 3] &&
          !this.isSquareAttacked(
            row,
            col - 1,
            color === "white" ? "black" : "white",
          ) &&
          !this.isSquareAttacked(
            row,
            col - 2,
            color === "white" ? "black" : "white",
          );

        if (queenSideEmpty) {
          moves.push({
            from: { row, col },
            to: { row: row, col: col - 2 },
            castling: "queenSide",
          });
        }
      }
    }

    return moves;
  }

  isValidSquare(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  }

  isSquareAttacked(row, col, attackingColor, board = this.board) {
    // Check for pawn attacks
    const pawnDirection = attackingColor === "white" ? -1 : 1;
    const pawnAttackCols = [col - 1, col + 1];

    for (const attackCol of pawnAttackCols) {
      const attackRow = row - pawnDirection;
      if (this.isValidSquare(attackRow, attackCol)) {
        const piece = board[attackRow][attackCol];
        if (piece && piece.type === "pawn" && piece.color === attackingColor) {
          return true;
        }
      }
    }

    // Check for knight attacks
    const knightMoves = [
      { dr: -2, dc: -1 },
      { dr: -2, dc: 1 },
      { dr: -1, dc: -2 },
      { dr: -1, dc: 2 },
      { dr: 1, dc: -2 },
      { dr: 1, dc: 2 },
      { dr: 2, dc: -1 },
      { dr: 2, dc: 1 },
    ];

    for (const move of knightMoves) {
      const r = row + move.dr;
      const c = col + move.dc;

      if (this.isValidSquare(r, c)) {
        const piece = board[r][c];
        if (
          piece &&
          piece.type === "knight" &&
          piece.color === attackingColor
        ) {
          return true;
        }
      }
    }

    // Check for bishop/queen attacks (diagonals)
    const bishopDirections = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 1 },
    ];

    for (const dir of bishopDirections) {
      let r = row + dir.dr;
      let c = col + dir.dc;

      while (this.isValidSquare(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (
            piece.color === attackingColor &&
            (piece.type === "bishop" || piece.type === "queen")
          ) {
            return true;
          }
          break;
        }
        r += dir.dr;
        c += dir.dc;
      }
    }

    // Check for rook/queen attacks (straight lines)
    const rookDirections = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];

    for (const dir of rookDirections) {
      let r = row + dir.dr;
      let c = col + dir.dc;

      while (this.isValidSquare(r, c)) {
        const piece = board[r][c];
        if (piece) {
          if (
            piece.color === attackingColor &&
            (piece.type === "rook" || piece.type === "queen")
          ) {
            return true;
          }
          break;
        }
        r += dir.dr;
        c += dir.dc;
      }
    }

    // Check for king attacks
    const kingMoves = [
      { dr: -1, dc: -1 },
      { dr: -1, dc: 0 },
      { dr: -1, dc: 1 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
      { dr: 1, dc: -1 },
      { dr: 1, dc: 0 },
      { dr: 1, dc: 1 },
    ];

    for (const move of kingMoves) {
      const r = row + move.dr;
      const c = col + move.dc;

      if (this.isValidSquare(r, c)) {
        const piece = board[r][c];
        if (piece && piece.type === "king" && piece.color === attackingColor) {
          return true;
        }
      }
    }

    return false;
  }

  makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];

    if (!piece || piece.color !== this.currentPlayer) {
      return { success: false, message: "Not your piece" };
    }

    const legalMoves = this.getLegalMoves(fromRow, fromCol);
    const move = legalMoves.find(
      (m) => m.to.row === toRow && m.to.col === toCol,
    );

    if (!move) {
      return { success: false, message: "Illegal move" };
    }

    // Save current state for undo
    const moveRecord = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
      piece: { ...piece },
      captured: this.board[toRow][toCol]
        ? { ...this.board[toRow][toCol] }
        : null,
      castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
      enPassantTarget: this.enPassantTarget,
      promotion: null,
    };

    // Handle capture
    if (move.capture || move.enPassantCapture) {
      const capturedPiece = move.enPassantCapture
        ? this.board[fromRow][toCol]
        : this.board[toRow][toCol];

      if (capturedPiece) {
        this.capturedPieces[this.currentPlayer].push(capturedPiece);
        moveRecord.captured = { ...capturedPiece };

        // Remove captured piece
        if (move.enPassantCapture) {
          this.board[fromRow][toCol] = null;
        }
      }
    }

    // Move the piece
    this.board[toRow][toCol] = piece;
    this.board[fromRow][fromCol] = null;
    piece.moved = true;

    // Update king position
    if (piece.type === "king") {
      if (piece.color === "white") {
        this.whiteKingPosition = { row: toRow, col: toCol };
      } else {
        this.blackKingPosition = { row: toRow, col: toCol };
      }

      // Update castling rights
      this.castlingRights[piece.color] = { kingSide: false, queenSide: false };
    }

    // Update rook moved status for castling
    if (piece.type === "rook") {
      if (fromRow === 7 && fromCol === 0)
        this.castlingRights.white.queenSide = false;
      if (fromRow === 7 && fromCol === 7)
        this.castlingRights.white.kingSide = false;
      if (fromRow === 0 && fromCol === 0)
        this.castlingRights.black.queenSide = false;
      if (fromRow === 0 && fromCol === 7)
        this.castlingRights.black.kingSide = false;
    }

    // Handle castling
    if (move.castling) {
      if (move.castling === "kingSide") {
        // Move rook
        const rook = this.board[toRow][toCol + 1];
        this.board[toRow][toCol + 1] = null;
        this.board[toRow][toCol - 1] = rook;
        rook.moved = true;
      } else if (move.castling === "queenSide") {
        // Move rook
        const rook = this.board[toRow][toCol - 2];
        this.board[toRow][toCol - 2] = null;
        this.board[toRow][toCol + 1] = rook;
        rook.moved = true;
      }
    }

    // Handle pawn promotion
    if (piece.type === "pawn" && (toRow === 0 || toRow === 7)) {
      // Auto-promote to queen for simplicity
      this.board[toRow][toCol] = {
        type: "queen",
        color: piece.color,
        moved: true,
      };
      moveRecord.promotion = "queen";
    }

    // Set en passant target
    if (move.enPassant) {
      this.enPassantTarget = {
        row: fromRow + (piece.color === "white" ? -1 : 1),
        col: fromCol,
      };
    } else {
      this.enPassantTarget = null;
    }

    // Switch player
    this.currentPlayer = this.currentPlayer === "white" ? "black" : "white";
    this.moveHistory.push(moveRecord);
    this.lastMove = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
    };

    return { success: true, message: "Move made" };
  }

  undoMove() {
    if (this.moveHistory.length === 0) {
      return { success: false, message: "No moves to undo" };
    }

    const lastMove = this.moveHistory.pop();

    // Restore the piece to its original position
    this.board[lastMove.from.row][lastMove.from.col] = lastMove.piece;
    this.board[lastMove.to.row][lastMove.to.col] = lastMove.captured || null;

    // Restore captured piece
    if (lastMove.captured) {
      const capturedColor =
        lastMove.captured.color === "white" ? "black" : "white";
      const capturedArray = this.capturedPieces[capturedColor];
      const index = capturedArray.findIndex(
        (p) =>
          p.type === lastMove.captured.type &&
          p.color === lastMove.captured.color,
      );
      if (index > -1) {
        capturedArray.splice(index, 1);
      }
    }

    // Restore king position
    if (lastMove.piece.type === "king") {
      if (lastMove.piece.color === "white") {
        this.whiteKingPosition = {
          row: lastMove.from.row,
          col: lastMove.from.col,
        };
      } else {
        this.blackKingPosition = {
          row: lastMove.from.row,
          col: lastMove.from.col,
        };
      }
    }

    // Restore castling rights
    this.castlingRights = lastMove.castlingRights;

    // Restore en passant target
    this.enPassantTarget = lastMove.enPassantTarget;

    // Switch player back
    this.currentPlayer = lastMove.piece.color;

    // Update last move
    if (this.moveHistory.length > 0) {
      const prevMove = this.moveHistory[this.moveHistory.length - 1];
      this.lastMove = { from: prevMove.from, to: prevMove.to };
    } else {
      this.lastMove = null;
    }

    return { success: true, message: "Move undone" };
  }

  isInCheck(color) {
    const kingPos =
      color === "white" ? this.whiteKingPosition : this.blackKingPosition;
    return this.isSquareAttacked(
      kingPos.row,
      kingPos.col,
      color === "white" ? "black" : "white",
    );
  }

  isCheckmate(color) {
    if (!this.isInCheck(color)) return false;

    // Check if any legal move exists for any piece of the given color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          const legalMoves = this.getLegalMoves(row, col);
          if (legalMoves.length > 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  isStalemate(color) {
    if (this.isInCheck(color)) return false;

    // Check if any legal move exists for any piece of the given color
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          const legalMoves = this.getLegalMoves(row, col);
          if (legalMoves.length > 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  isDraw() {
    // Check for insufficient material
    let whitePieces = [];
    let blackPieces = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece) {
          if (piece.color === "white") {
            whitePieces.push(piece.type);
          } else {
            blackPieces.push(piece.type);
          }
        }
      }
    }

    // King vs king
    if (whitePieces.length === 1 && blackPieces.length === 1) {
      return true;
    }

    // King and bishop vs king
    if (
      whitePieces.length === 2 &&
      blackPieces.length === 1 &&
      whitePieces.includes("bishop") &&
      whitePieces.includes("king")
    ) {
      return true;
    }

    if (
      blackPieces.length === 2 &&
      whitePieces.length === 1 &&
      blackPieces.includes("bishop") &&
      blackPieces.includes("king")
    ) {
      return true;
    }

    // King and knight vs king
    if (
      whitePieces.length === 2 &&
      blackPieces.length === 1 &&
      whitePieces.includes("knight") &&
      whitePieces.includes("king")
    ) {
      return true;
    }

    if (
      blackPieces.length === 2 &&
      whitePieces.length === 1 &&
      blackPieces.includes("knight") &&
      blackPieces.includes("king")
    ) {
      return true;
    }

    // Check for 50-move rule (simplified)
    if (this.moveHistory.length >= 100) {
      return true;
    }

    return false;
  }

  getCapturedPieces() {
    return this.capturedPieces;
  }

  getAlgebraicNotation(fromRow, fromCol, toRow, toCol) {
    const piece = this.board[fromRow][fromCol];
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    let notation = "";

    // Piece letter (except pawn)
    if (piece.type !== "pawn") {
      notation =
        piece.type === "knight" ? "N" : piece.type.charAt(0).toUpperCase();
    }

    // File and rank for ambiguous moves (simplified)
    notation += files[fromCol] + ranks[fromRow];

    // Capture indicator
    if (this.board[toRow][toCol]) {
      if (piece.type === "pawn") {
        notation = files[fromCol];
      }
      notation += "x";
    }

    // Destination square
    notation += files[toCol] + ranks[toRow];

    return notation;
  }

  getHint(color) {
    // Simple hint system: return a random legal move
    const pieces = [];

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === color) {
          const legalMoves = this.getLegalMoves(row, col);
          if (legalMoves.length > 0) {
            pieces.push({ row, col, moves: legalMoves });
          }
        }
      }
    }

    if (pieces.length === 0) return null;

    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    const randomMove =
      randomPiece.moves[Math.floor(Math.random() * randomPiece.moves.length)];

    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

    return {
      piece: this.board[randomPiece.row][randomPiece.col].type,
      from: files[randomPiece.col] + ranks[randomPiece.row],
      to: files[randomMove.to.col] + ranks[randomMove.to.row],
    };
  }

  newGame() {
    this.initializeBoard();
  }
}
