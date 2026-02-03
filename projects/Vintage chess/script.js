// Main Chess Game Script

document.addEventListener("DOMContentLoaded", function () {
  // Initialize the chess game
  const chessGame = new ChessGame();

  // DOM elements
  const chessBoard = document.getElementById("chess-board");
  const newGameBtn = document.getElementById("new-game");
  const undoBtn = document.getElementById("undo-move");
  const flipBoardBtn = document.getElementById("flip-board");
  const hintBtn = document.getElementById("hint");
  const settingsBtn = document.getElementById("settings");
  const saveSettingsBtn = document.getElementById("save-settings");
  const closeSettingsBtn = document.getElementById("close-settings");
  const settingsModal = document.getElementById("settings-modal");
  const turnIndicator = document.getElementById("turn-indicator");
  const movesList = document.getElementById("moves-list");
  const capturedWhite = document.getElementById("captured-white");
  const capturedBlack = document.getElementById("captured-black");
  const timerWhite = document.getElementById("timer-white");
  const timerBlack = document.getElementById("timer-black");
  const gameMessage = document.getElementById("game-message");

  // Game state variables
  let selectedSquare = null;
  let legalMoves = [];
  let moveHistory = [];
  let boardFlipped = false;
  let gameActive = true;
  let whiteTime = 600; // 10 minutes in seconds
  let blackTime = 600; // 10 minutes in seconds
  let timerInterval = null;
  let currentPlayer = "white";

  // Initialize the board
  function initBoard() {
    chessBoard.innerHTML = "";
    generateCoordinates();
    chessGame.initializeBoard();
    renderBoard();
    updateGameStatus();
    startTimer();
  }

  // Generate coordinate labels
  function generateCoordinates() {
    const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const numbers = ["8", "7", "6", "5", "4", "3", "2", "1"];

    // Horizontal labels (bottom)
    const bottomLabels = document.querySelector(".bottom-labels");
    bottomLabels.innerHTML = "";
    letters.forEach((letter) => {
      const label = document.createElement("div");
      label.textContent = letter;
      bottomLabels.appendChild(label);
    });

    // Vertical labels (left)
    const leftLabels = document.querySelector(".left-labels");
    leftLabels.innerHTML = "";
    numbers.forEach((number) => {
      const label = document.createElement("div");
      label.textContent = number;
      leftLabels.appendChild(label);
    });

    // Vertical labels (right)
    const rightLabels = document.querySelector(".right-labels");
    rightLabels.innerHTML = "";
    numbers.forEach((number) => {
      const label = document.createElement("div");
      label.textContent = number;
      rightLabels.appendChild(label);
    });
  }

  // Render the chess board
  function renderBoard() {
    chessBoard.innerHTML = "";
    const board = chessGame.getBoard();

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        // Adjust indices if board is flipped
        const displayRow = boardFlipped ? 7 - row : row;
        const displayCol = boardFlipped ? 7 - col : col;

        const square = board[displayRow][displayCol];
        const squareElement = document.createElement("div");
        squareElement.className = `chess-square ${(row + col) % 2 === 0 ? "square-dark" : "square-light"}`;
        squareElement.dataset.row = displayRow;
        squareElement.dataset.col = displayCol;

        // Add last move highlight
        if (
          chessGame.lastMove &&
          ((chessGame.lastMove.from.row === displayRow &&
            chessGame.lastMove.from.col === displayCol) ||
            (chessGame.lastMove.to.row === displayRow &&
              chessGame.lastMove.to.col === displayCol))
        ) {
          squareElement.classList.add("last-move");
        }

        // Add check highlight
        if (
          chessGame.isInCheck("white") &&
          chessGame.whiteKingPosition &&
          chessGame.whiteKingPosition.row === displayRow &&
          chessGame.whiteKingPosition.col === displayCol
        ) {
          squareElement.classList.add("check");
        }

        if (
          chessGame.isInCheck("black") &&
          chessGame.blackKingPosition &&
          chessGame.blackKingPosition.row === displayRow &&
          chessGame.blackKingPosition.col === displayCol
        ) {
          squareElement.classList.add("check");
        }

        // Add piece if present
        if (square) {
          const pieceElement = document.createElement("div");
          pieceElement.className = `chess-piece piece-${square.color}`;
          pieceElement.innerHTML = getPieceSymbol(square.type, square.color);
          pieceElement.dataset.type = square.type;
          pieceElement.dataset.color = square.color;
          squareElement.appendChild(pieceElement);
        }

        // Add click event listener
        squareElement.addEventListener("click", () =>
          handleSquareClick(displayRow, displayCol),
        );

        chessBoard.appendChild(squareElement);
      }
    }

    // Highlight selected square and legal moves
    highlightSelectedAndMoves();
  }

  // Get Unicode symbol for chess piece
  function getPieceSymbol(type, color) {
    const symbols = {
      king: { white: "&#x2654;", black: "&#x265A;" },
      queen: { white: "&#x2655;", black: "&#x265B;" },
      rook: { white: "&#x2656;", black: "&#x265C;" },
      bishop: { white: "&#x2657;", black: "&#x265D;" },
      knight: { white: "&#x2658;", black: "&#x265E;" },
      pawn: { white: "&#x2659;", black: "&#x265F;" },
    };
    return symbols[type][color];
  }

  // Handle square click
  function handleSquareClick(row, col) {
    if (!gameActive) return;

    const board = chessGame.getBoard();
    const square = board[row][col];

    // If a square is already selected
    if (selectedSquare) {
      // Check if clicked square is a legal move
      const isLegalMove = legalMoves.some(
        (move) => move.to.row === row && move.to.col === col,
      );

      if (isLegalMove) {
        // Make the move
        makeMove(selectedSquare.row, selectedSquare.col, row, col);
        selectedSquare = null;
        legalMoves = [];
        renderBoard();
      } else if (square && square.color === currentPlayer) {
        // Select a different piece of the same color
        selectedSquare = { row, col };
        legalMoves = chessGame.getLegalMoves(row, col);
        renderBoard();
      } else {
        // Deselect
        selectedSquare = null;
        legalMoves = [];
        renderBoard();
      }
    } else {
      // If no square is selected, select if it's a piece of current player
      if (square && square.color === currentPlayer) {
        selectedSquare = { row, col };
        legalMoves = chessGame.getLegalMoves(row, col);
        renderBoard();
      }
    }
  }

  // Highlight selected square and legal moves
  function highlightSelectedAndMoves() {
    // Remove existing highlights
    document
      .querySelectorAll(".selected-square, .legal-move, .legal-capture")
      .forEach((el) => {
        el.classList.remove("selected-square", "legal-move", "legal-capture");
      });

    // Highlight selected square
    if (selectedSquare) {
      const squareElement = document.querySelector(
        `.chess-square[data-row="${selectedSquare.row}"][data-col="${selectedSquare.col}"]`,
      );
      if (squareElement) {
        squareElement.classList.add("selected-square");
      }

      // Highlight legal moves
      legalMoves.forEach((move) => {
        const targetSquare = document.querySelector(
          `.chess-square[data-row="${move.to.row}"][data-col="${move.to.col}"]`,
        );
        if (targetSquare) {
          const board = chessGame.getBoard();
          const targetPiece = board[move.to.row][move.to.col];

          if (targetPiece) {
            targetSquare.classList.add("legal-capture");
          } else {
            targetSquare.classList.add("legal-move");
          }
        }
      });
    }
  }

  // Make a move
  function makeMove(fromRow, fromCol, toRow, toCol) {
    const moveResult = chessGame.makeMove(fromRow, fromCol, toRow, toCol);

    if (moveResult.success) {
      // Add to move history
      const moveNotation = chessGame.getAlgebraicNotation(
        fromRow,
        fromCol,
        toRow,
        toCol,
      );
      addMoveToHistory(moveNotation);

      // Update captured pieces display
      updateCapturedPieces();

      // Switch player
      currentPlayer = currentPlayer === "white" ? "black" : "white";
      updateGameStatus();

      // Check for game end
      checkGameEnd();

      // Play move sound
      playMoveSound();
    } else {
      showMessage(moveResult.message, 2000);
    }
  }

  // Add move to history display
  function addMoveToHistory(notation) {
    const moveNumber = Math.ceil(moveHistory.length / 2) + 1;

    if (currentPlayer === "white") {
      // White's move - create new row
      const moveElement = document.createElement("div");
      moveElement.className = "move-record";
      moveElement.innerHTML = `${moveNumber}. ${notation}`;
      movesList.appendChild(moveElement);
      moveHistory.push({ white: notation });
    } else {
      // Black's move - append to last row
      const lastMoveElement = movesList.lastChild;
      if (lastMoveElement) {
        lastMoveElement.innerHTML += ` ${notation}`;
        moveHistory[moveHistory.length - 1].black = notation;
      }
    }

    // Scroll to bottom of move history
    const moveHistoryContainer = document.querySelector(".move-history");
    moveHistoryContainer.scrollTop = moveHistoryContainer.scrollHeight;
  }

  // Update captured pieces display
  function updateCapturedPieces() {
    const captured = chessGame.getCapturedPieces();

    // Update white captured pieces
    capturedWhite.innerHTML = "";
    captured.white.forEach((piece) => {
      const pieceElement = document.createElement("span");
      pieceElement.className = "captured-piece piece-black";
      pieceElement.innerHTML = getPieceSymbol(piece.type, "black");
      capturedWhite.appendChild(pieceElement);
    });

    // Update black captured pieces
    capturedBlack.innerHTML = "";
    captured.black.forEach((piece) => {
      const pieceElement = document.createElement("span");
      pieceElement.className = "captured-piece piece-white";
      pieceElement.innerHTML = getPieceSymbol(piece.type, "white");
      capturedBlack.appendChild(pieceElement);
    });
  }

  // Update game status display
  function updateGameStatus() {
    turnIndicator.textContent = `${currentPlayer === "white" ? "White" : "Black"}'s Turn`;
    turnIndicator.style.color = currentPlayer === "white" ? "#f5f5f5" : "#222";

    // Update timer display
    updateTimerDisplay();
  }

  // Start the game timer
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      if (!gameActive) return;

      if (currentPlayer === "white") {
        whiteTime--;
        if (whiteTime <= 0) {
          endGame("black", "time");
        }
      } else {
        blackTime--;
        if (blackTime <= 0) {
          endGame("white", "time");
        }
      }

      updateTimerDisplay();
    }, 1000);
  }

  // Update timer display
  function updateTimerDisplay() {
    const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    timerWhite.textContent = formatTime(whiteTime);
    timerBlack.textContent = formatTime(blackTime);

    // Highlight active player's timer
    if (currentPlayer === "white") {
      timerWhite.style.borderColor = "#ffd700";
      timerBlack.style.borderColor = "#8b4513";
    } else {
      timerWhite.style.borderColor = "#8b4513";
      timerBlack.style.borderColor = "#ffd700";
    }
  }

  // Check for game end conditions
  function checkGameEnd() {
    if (chessGame.isCheckmate("white")) {
      endGame("black", "checkmate");
    } else if (chessGame.isCheckmate("black")) {
      endGame("white", "checkmate");
    } else if (
      chessGame.isStalemate("white") ||
      chessGame.isStalemate("black")
    ) {
      endGame(null, "stalemate");
    } else if (chessGame.isDraw()) {
      endGame(null, "draw");
    }
  }

  // End the game
  function endGame(winner, reason) {
    gameActive = false;
    clearInterval(timerInterval);

    let message = "";
    if (winner) {
      message = `${winner === "white" ? "White" : "Black"} wins by ${reason === "checkmate" ? "checkmate" : "time"}!`;
    } else {
      if (reason === "stalemate") {
        message = "Stalemate! The game is a draw.";
      } else if (reason === "draw") {
        message = "Draw game!";
      }
    }

    showMessage(message, 5000);
  }

  // Show game message
  function showMessage(message, duration) {
    gameMessage.textContent = message;
    gameMessage.style.display = "block";

    setTimeout(() => {
      gameMessage.style.display = "none";
    }, duration);
  }

  // Play move sound
  function playMoveSound() {
    // Simple move sound simulation
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1,
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }

  // Event listeners for buttons
  newGameBtn.addEventListener("click", () => {
    chessGame.newGame();
    selectedSquare = null;
    legalMoves = [];
    moveHistory = [];
    movesList.innerHTML = "";
    whiteTime = 600;
    blackTime = 600;
    currentPlayer = "white";
    gameActive = true;
    initBoard();
    showMessage("New game started!", 2000);
  });

  undoBtn.addEventListener("click", () => {
    if (moveHistory.length > 0) {
      const undoResult = chessGame.undoMove();
      if (undoResult.success) {
        // Remove last move from history
        moveHistory.pop();
        movesList.innerHTML = "";

        // Re-render move history
        moveHistory.forEach((move, index) => {
          const moveNumber = index + 1;
          const moveElement = document.createElement("div");
          moveElement.className = "move-record";
          moveElement.innerHTML = `${moveNumber}. ${move.white}${move.black ? " " + move.black : ""}`;
          movesList.appendChild(moveElement);
        });

        // Switch player back
        currentPlayer = currentPlayer === "white" ? "black" : "white";
        updateCapturedPieces();
        renderBoard();
        updateGameStatus();
        showMessage("Move undone", 1500);
      }
    } else {
      showMessage("No moves to undo", 1500);
    }
  });

  flipBoardBtn.addEventListener("click", () => {
    boardFlipped = !boardFlipped;
    renderBoard();
    showMessage(`Board ${boardFlipped ? "flipped" : "normal"}`, 1500);
  });

  hintBtn.addEventListener("click", () => {
    if (!gameActive) return;

    const hint = chessGame.getHint(currentPlayer);
    if (hint) {
      showMessage(
        `Hint: Try moving ${hint.piece} from ${hint.from} to ${hint.to}`,
        3000,
      );
    } else {
      showMessage("No hint available", 2000);
    }
  });

  settingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "flex";
  });

  saveSettingsBtn.addEventListener("click", () => {
    const timeControl = parseInt(document.getElementById("time-control").value);

    if (timeControl > 0) {
      whiteTime = timeControl * 60;
      blackTime = timeControl * 60;
      updateTimerDisplay();
    }

    settingsModal.style.display = "none";
    showMessage("Settings saved", 1500);
  });

  closeSettingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.style.display = "none";
    }
  });

  // Initialize the game
  initBoard();
});
