// ====================================
// COORDINATE CONVERSION (MANDATORY CONTRACT)
// ====================================
// row 0 = rank 8 (top), row 7 = rank 1 (bottom)
// col 0 = file a (left), col 7 = file h (right)

function uiToSquare(row, col) {
    return ((7 - row) << 4) | col;
}

function squareToUI(square) {
    return {
        row: 7 - (square >> 4),
        col: square & 7
    };
}

// ====================================
// GAME.JS - UI and Game Loop
// ====================================

let selectedSquare = null;
let legalMovesForSelected = [];
let gameOver = false;
let moveCount = 0;
let lastMove = null; // Track last move for visual feedback

// Initialize the game
function initGame() {
    initBoard();
    selectedSquare = null;
    legalMovesForSelected = [];
    gameOver = false;
    moveCount = 0;
    lastMove = null;
    
    renderBoard();
    updateGameInfo();
    clearMoveHistory();
    clearCapturedPieces();
}

// Render the board
function renderBoard() {
    for (let rank = 7; rank >= 0; rank--) {
        for (let file = 0; file < 8; file++) {
            const square = (rank << 4) | file;
            const { row, col } = squareToUI(square);
            const displayIndex = row * 8 + col;
            const domSquare = document.querySelector(`[data-square="${displayIndex}"]`);
            if (!domSquare) continue;
            
            const piece = board[square];
            
            // Clear square
            domSquare.textContent = '';
            domSquare.classList.remove('selected', 'legal-move', 'check', 'capture-dest', 'last-move');
            
            // Add piece if present
            if (piece !== EMPTY) {
                const pieceType = getPieceType(piece);
                const color = getPieceColor(piece);
                const symbol = PIECE_SYMBOLS[color][pieceType];
                domSquare.textContent = symbol;
            }
            
            // Highlight selected square
            if (selectedSquare === square) {
                domSquare.classList.add('selected');
            }
            
            // Highlight legal moves
            if (legalMovesForSelected.some(m => m.to === square)) {
                domSquare.classList.add('legal-move');
            }
            
            // Highlight last move (capture visualization)
            if (lastMove) {
                if (lastMove.to === square) {
                    if (lastMove.wasCapture) {
                        domSquare.classList.add('capture-dest');
                    } else {
                        domSquare.classList.add('last-move');
                    }
                }
                if (lastMove.from === square) {
                    domSquare.classList.add('last-move');
                }
            }
            
            // Highlight king in check
            if (piece !== EMPTY && getPieceType(piece) === KING) {
                const kingColor = getPieceColor(piece);
                if (isInCheck(kingColor) && kingColor === toMove) {
                    domSquare.classList.add('check');
                }
            }
        }
    }
}

// Handle square click
function handleSquareClick(displayIndex) {
    if (gameOver) return;
    if (toMove !== WHITE) return; // Only allow clicks during player's turn
    
    const row = Math.floor(displayIndex / 8);
    const col = displayIndex % 8;
    const square = uiToSquare(row, col);
    const piece = board[square];
    
    // If a square is already selected
    if (selectedSquare !== null) {
        // Try to make a move
        const move = legalMovesForSelected.find(m => m.to === square);
        
        if (move) {
            // Check for pawn promotion
            if (move.flags & MOVE_PROMOTION) {
                // Default to queen promotion
                move.promotionPiece = QUEEN;
            }
            
            makePlayerMove(move);
        } else if (piece !== EMPTY && getPieceColor(piece) === WHITE) {
            // Select a different piece
            selectedSquare = square;
            legalMovesForSelected = getLegalMovesForPiece(square);
        } else {
            // Deselect
            selectedSquare = null;
            legalMovesForSelected = [];
        }
    } else {
        // Select a piece
        if (piece !== EMPTY && getPieceColor(piece) === WHITE) {
            selectedSquare = square;
            legalMovesForSelected = getLegalMovesForPiece(square);
        }
    }
    
    renderBoard();
}

// Make a player move
function makePlayerMove(move) {
    const wasCapture = (move.flags & MOVE_CAPTURE) !== 0;
    const notation = moveToAlgebraic(move);
    
    makeMove(move);
    
    // Track last move for visual feedback
    lastMove = {
        from: move.from,
        to: move.to,
        wasCapture: wasCapture
    };
    
    selectedSquare = null;
    legalMovesForSelected = [];
    moveCount++;
    
    addMoveToHistory(moveCount, notation, null);
    updateCapturedPieces();
    renderBoard();
    updateGameInfo();
    
    // Check game status
    const status = getGameStatus();
    if (status.over) {
        handleGameOver(status);
        return;
    }
    
    // Computer's turn
    setTimeout(makeComputerMove, 250);
}

// Make a computer move
function makeComputerMove() {
    if (toMove !== BLACK) return;
    if (gameOver) return;
    
    // Update UI to show thinking
    updateStatus("Computer is thinking...");
    
    setTimeout(() => {
        const move = getComputerMove(false, moveCount);
        
        if (move) {
            const wasCapture = (move.flags & MOVE_CAPTURE) !== 0;
            const notation = moveToAlgebraic(move);
            
            makeMove(move);
            
            // Track last move for visual feedback
            lastMove = {
                from: move.from,
                to: move.to,
                wasCapture: wasCapture
            };
            
            addMoveToHistory(moveCount, null, notation);
            updateCapturedPieces();
            renderBoard();
            updateGameInfo();
            
            // Check game status
            const status = getGameStatus();
            if (status.over) {
                handleGameOver(status);
                return;
            }
        }
    }, 100);
}

// Update game info display
function updateGameInfo() {
    const status = getGameStatus();
    
    if (status.over) {
        if (status.result === "checkmate") {
            updateStatus(`Checkmate! ${status.winner} wins!`);
        } else {
            updateStatus(`Draw by ${status.result}`);
        }
    } else if (status.result === "check") {
        updateStatus(toMove === WHITE ? "White is in check" : "Black is in check");
    } else {
        updateStatus(toMove === WHITE ? "White to move" : "Black to move");
    }
}

// Update status text
function updateStatus(text) {
    const statusElement = document.getElementById('game-status');
    if (statusElement) {
        statusElement.textContent = text;
    }
}

// Handle game over
function handleGameOver(status) {
    gameOver = true;
    updateGameInfo();
}

// Add move to history display
function addMoveToHistory(moveNum, whiteMove, blackMove) {
    const historyElement = document.getElementById('move-list');
    if (!historyElement) return;
    
    if (whiteMove) {
        const moveEntry = document.createElement('div');
        moveEntry.className = 'move-entry';
        moveEntry.innerHTML = `<span class="move-number">${moveNum}.</span> <span class="white-move">${whiteMove}</span>`;
        historyElement.appendChild(moveEntry);
    } else if (blackMove) {
        const lastEntry = historyElement.lastElementChild;
        if (lastEntry) {
            const blackSpan = document.createElement('span');
            blackSpan.className = 'black-move';
            blackSpan.textContent = blackMove;
            lastEntry.appendChild(document.createTextNode(' '));
            lastEntry.appendChild(blackSpan);
        }
    }
    
    // Auto-scroll to bottom
    historyElement.scrollTop = historyElement.scrollHeight;
}

// Clear move history
function clearMoveHistory() {
    const historyElement = document.getElementById('move-list');
    if (historyElement) {
        historyElement.innerHTML = '';
    }
}

// Update captured pieces display
function updateCapturedPieces() {
    const whiteCaptured = document.getElementById('white-captured');
    const blackCaptured = document.getElementById('black-captured');
    
    if (whiteCaptured) {
        whiteCaptured.innerHTML = capturedPieces[WHITE]
            .map(p => PIECE_SYMBOLS[WHITE][p])
            .join(' ');
    }
    
    if (blackCaptured) {
        blackCaptured.innerHTML = capturedPieces[BLACK]
            .map(p => PIECE_SYMBOLS[BLACK][p])
            .join(' ');
    }
}

// Clear captured pieces display
function clearCapturedPieces() {
    const whiteCaptured = document.getElementById('white-captured');
    const blackCaptured = document.getElementById('black-captured');
    
    if (whiteCaptured) whiteCaptured.innerHTML = '';
    if (blackCaptured) blackCaptured.innerHTML = '';
}

// Set up event listeners
function setupEventListeners() {
    // Board squares
    const squares = document.querySelectorAll('.square');
    squares.forEach((square, index) => {
        square.addEventListener('click', () => handleSquareClick(index));
    });
    
    // New game button
    const newGameBtn = document.getElementById('new-game');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            initGame();
        });
    }
    
    // Undo button
    const undoBtn = document.getElementById('undo-move');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (moveHistory.length >= 2 && !gameOver && toMove === WHITE) {
                // Undo both computer and player moves
                undoMove(); // Computer move
                undoMove(); // Player move
                
                selectedSquare = null;
                legalMovesForSelected = [];
                
                renderBoard();
                updateGameInfo();
                
                // Update history display (remove last move)
                const historyElement = document.getElementById('move-list');
                if (historyElement && historyElement.lastElementChild) {
                    historyElement.removeChild(historyElement.lastElementChild);
                    moveCount--;
                }
                
                updateCapturedPieces();
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
});
