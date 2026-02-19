/**
 * Quantum Chess Engine
 * Handles superposition states, board rendering, and wave function collapse.
 */

const canvas = document.getElementById('chess-canvas');
const ctx = canvas.getContext('2d');

// --- Config ---
const TILE_SIZE = 80;
const BOARD_SIZE = 8;
const COLORS = { light: '#f2f4f8', dark: '#89b4fa', select: 'rgba(255, 255, 0, 0.4)', ghost: 'rgba(203, 166, 247, 0.6)' };

// --- State ---
let board = []; // 8x8 Grid
let selected = null; // {r, c}
let level = 1;
let moves = []; // Legal moves for selected

// --- Pieces & Logic ---
const TYPE = { P: 'Pawn', R: 'Rook', N: 'Knight', B: 'Bishop', Q: 'Queen', K: 'King' };
const COLOR = { W: 'White', B: 'Black' };

class Piece {
    constructor(type, color) {
        this.type = type;
        this.color = color;
        this.prob = 1.0; // 1.0 = Real, 0.5 = Superposition
        this.ghostId = null; // To link entangled pairs
    }
}

// --- Levels ---
// Simple puzzles to demonstrate mechanics
const LEVELS = [
    {
        // Level 1: Superposition Knight Mate
        // White Knight must split to cover two escape squares
        setup: [
            {r: 0, c: 7, p: new Piece(TYPE.K, COLOR.B)}, // Black King corner
            {r: 2, c: 5, p: new Piece(TYPE.K, COLOR.W)}, // White King support
            {r: 3, c: 4, p: new Piece(TYPE.N, COLOR.W)}  // White Knight
        ]
    }
];

// --- Init ---

function init() {
    canvas.width = TILE_SIZE * BOARD_SIZE;
    canvas.height = TILE_SIZE * BOARD_SIZE;
    
    // Prevent Context Menu
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    canvas.addEventListener('mousedown', handleInput);
    
    loadLevel(0);
    draw();
}

function resetBoard() {
    board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
}

function loadLevel(idx) {
    resetBoard();
    const l = LEVELS[idx];
    l.setup.forEach(item => {
        board[item.r][item.c] = item.p;
    });
    level = idx + 1;
    document.getElementById('level-val').innerText = level;
}

// --- Game Logic ---

function handleInput(e) {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const r = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    
    // 1. Right Click (Split / Quantum Move)
    if (e.button === 2) {
        if (selected) {
            tryQuantumMove(r, c);
            selected = null;
            moves = [];
            draw();
        }
        return;
    }

    // 2. Left Click (Select / Move)
    if (selected) {
        // Try Move
        if (isValidMove(r, c)) {
            movePiece(selected.r, selected.c, r, c);
            selected = null;
            moves = [];
        } else {
            // Deselect or Select new
            const p = board[r][c];
            if (p && p.color === COLOR.W) {
                selectPiece(r, c);
            } else {
                selected = null;
                moves = [];
            }
        }
    } else {
        const p = board[r][c];
        if (p && p.color === COLOR.W) {
            selectPiece(r, c);
        }
    }
    draw();
}

function selectPiece(r, c) {
    selected = {r, c};
    moves = getLegalMoves(r, c, board[r][c]);
}

function getLegalMoves(r, c, p) {
    // Simplified logic for demo
    let m = [];
    
    if (p.type === TYPE.N) { // Knight
        const jumps = [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]];
        jumps.forEach(j => {
            const nr = r + j[0], nc = c + j[1];
            if (onBoard(nr, nc)) {
                if (!board[nr][nc] || board[nr][nc].color !== p.color) m.push({r: nr, c: nc});
            }
        });
    }
    else if (p.type === TYPE.K) {
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++) {
            if(dr===0 && dc===0) continue;
            const nr = r+dr, nc = c+dc;
            if (onBoard(nr, nc) && (!board[nr][nc] || board[nr][nc].color !== p.color)) m.push({r: nr, c: nc});
        }
    }
    return m;
}

function tryQuantumMove(r, c) {
    // Quantum Move: Move a piece to TWO squares at once (50% prob)
    // Only valid if piece is currently 100% real
    const p = board[selected.r][selected.c];
    if (p.prob !== 1.0) return; // Already split
    
    // Check if target is valid move
    const valid = moves.some(m => m.r === r && m.c === c);
    if (!valid) return;

    // Create Split
    // Original stays (becomes 50%)
    // New Ghost moves to target (50%)
    
    p.prob = 0.5;
    p.ghostId = Date.now(); // Link them
    
    const ghost = new Piece(p.type, p.color);
    ghost.prob = 0.5;
    ghost.ghostId = p.ghostId;
    
    // Move ghost to target
    board[r][c] = ghost;
    
    // UI Feedback
    console.log("Quantum Split performed!");
}

function movePiece(fr, fc, tr, tc) {
    const p = board[fr][fc];
    const target = board[tr][tc];

    // Interaction / Measurement Logic
    if (target) {
        // Capture!
        // If target is Quantum, we must collapse it first
        if (target.prob < 1.0) {
            collapse(tr, tc);
            // If target disappeared, just move. If target became real, capture it.
            if (!board[tr][tc]) {
                // Target vanished, free square
            }
        }
    }
    
    // If Moving Piece is Quantum, it might not actually move there!
    // Measurement logic on move...
    // For simplicity: Moving a quantum piece collapses it 50/50 to either origin or dest?
    // Let's keep it simple: Standard move maintains state, unless interacting.
    
    board[tr][tc] = p;
    board[fr][fc] = null;
    
    checkWinCondition();
}

function collapse(r, c) {
    // Force a quantum piece to decide existence
    const p = board[r][c];
    if (!p || p.prob === 1.0) return;

    const exists = Math.random() > 0.5;
    
    // Find the OTHER pair
    let pairR, pairC;
    for(let i=0; i<BOARD_SIZE; i++) for(let j=0; j<BOARD_SIZE; j++) {
        if((i!==r || j!==c) && board[i][j] && board[i][j].ghostId === p.ghostId) {
            pairR = i; pairC = j;
        }
    }

    if (exists) {
        // This one becomes Real
        p.prob = 1.0;
        p.ghostId = null;
        // The other vanishes
        if (pairR !== undefined) board[pairR][pairC] = null;
        
        // Show Overlay
        showMsg("Collapsed: EXISTS");
    } else {
        // This one vanishes
        board[r][c] = null;
        // The other becomes Real
        if (pairR !== undefined) {
            board[pairR][pairC].prob = 1.0;
            board[pairR][pairC].ghostId = null;
        }
        showMsg("Collapsed: VANISHED");
    }
}

function checkWinCondition() {
    // Determine Checkmate
    // For Level 1: If Black King has no moves
    // This requires full chess logic, let's simplify for "Puzzle Solved" state
    // If Black King is threatened by a Quantum Piece that covers multiple squares?
    
    // Just a placeholder win trigger
    const bKing = findPiece(TYPE.K, COLOR.B);
    if (!bKing) {
        showWin();
    }
}

function findPiece(type, color) {
    for(let r=0; r<BOARD_SIZE; r++) for(let c=0; c<BOARD_SIZE; c++) {
        const p = board[r][c];
        if (p && p.type === type && p.color === color) return {r, c};
    }
    return null;
}

// --- Rendering ---

function draw() {
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Board
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const isDark = (r + c) % 2 === 1;
            ctx.fillStyle = isDark ? COLORS.dark : COLORS.light;
            
            // Highlight Moves
            if (moves.some(m => m.r === r && m.c === c)) {
                ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
            }
            // Highlight Selected
            if (selected && selected.r === r && selected.c === c) {
                ctx.fillStyle = COLORS.select;
            }

            ctx.fillRect(c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // Draw Piece
            const p = board[r][c];
            if (p) drawPiece(r, c, p);
        }
    }
}

function drawPiece(r, c, p) {
    const cx = c * TILE_SIZE + TILE_SIZE / 2;
    const cy = r * TILE_SIZE + TILE_SIZE / 2;

    ctx.font = '50px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Ghost transparency
    ctx.globalAlpha = p.prob;
    
    // Unicode Chess Symbols
    const symbols = {
        'White': { 'King': '♔', 'Queen': '♕', 'Rook': '♖', 'Bishop': '♗', 'Knight': '♘', 'Pawn': '♙' },
        'Black': { 'King': '♚', 'Queen': '♛', 'Rook': '♜', 'Bishop': '♝', 'Knight': '♞', 'Pawn': '♟' }
    };
    
    ctx.fillStyle = p.color === COLOR.W ? '#fff' : '#000';
    if (p.color === COLOR.W) {
        // Stroke white pieces so they pop on light squares
        ctx.shadowColor="black";
        ctx.shadowBlur=2;
    }
    
    ctx.fillText(symbols[p.color][p.type], cx, cy);
    
    ctx.shadowBlur=0;
    ctx.globalAlpha = 1.0;
    
    // Quantum Badge
    if (p.prob < 1.0) {
        ctx.fillStyle = '#cba6f7';
        ctx.beginPath();
        ctx.arc(cx + 20, cy - 20, 8, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.fillText('?', cx + 20, cy - 20);
    }
}

function onBoard(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

// --- UI ---

function showMsg(txt) {
    // Temporary toast
    console.log(txt);
}

function showWin() {
    document.getElementById('overlay').classList.remove('hidden');
}

function resetLevel() {
    loadLevel(level-1);
    draw();
}

function nextLevel() {
    document.getElementById('overlay').classList.add('hidden');
    resetLevel(); // Just reset for now
}

// Start
init();