// ====================================
// ENGINE.JS - Chess Engine with Minimax + Alpha-Beta
// ====================================

// Transposition table for position caching
const transpositionTable = new Map();
const MAX_TABLE_SIZE = 1000000;

// Move ordering scores
const MVV_LVA = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 15, 14, 13, 12, 11, 10],  // Pawn captures
    [0, 25, 24, 23, 22, 21, 20],  // Knight captures
    [0, 35, 34, 33, 32, 31, 30],  // Bishop captures
    [0, 45, 44, 43, 42, 41, 40],  // Rook captures
    [0, 55, 54, 53, 52, 51, 50],  // Queen captures
    [0, 0, 0, 0, 0, 0, 0]         // King (shouldn't capture)
];

// Search statistics
let nodesSearched = 0;
let searchDepth = 6;
const NODE_LIMIT = 300000;
const TIME_LIMIT = 3500; // 3.5 seconds max
const MAX_QUIESCENCE_DEPTH = 3; // Limit quiescence explosion
let searchStart = 0;
let currentMoveCount = 0;

// Check if time limit exceeded
function timeUp() {
    return performance.now() - searchStart > TIME_LIMIT;
}

// Dynamic depth based on game phase
function getDynamicDepth() {
    if (currentMoveCount < 20) return 5; // Opening: faster
    if (currentMoveCount < 40) return 6; // Middlegame: deeper
    return 6; // Endgame: deeper (was 7, reduced for speed)
}

// Order moves for better alpha-beta pruning (DEFENSIVE PRIORITY)
function orderMoves(moves) {
    const currentColor = toMove;
    const enemyColor = currentColor === WHITE ? BLACK : WHITE;
    
    const scoredMoves = moves.map(move => {
        let score = 0;
        const pieceType = getPieceType(board[move.from]);
        const pieceValue = PIECE_VALUES[pieceType];
        
        // 1️⃣ HIGHEST PRIORITY: Defending hanging pieces
        // Check if this move defends a piece under attack
        let defendsHangingPiece = false;
        for (let sq = 0; sq < 128; sq++) {
            if (!isValidSquare(sq)) continue;
            const piece = board[sq];
            if (piece === EMPTY || getPieceColor(piece) !== currentColor) continue;
            if (sq === move.from) continue; // Don't count the piece we're moving
            
            const attackers = countAttackers(sq, enemyColor);
            const defenders = countAttackers(sq, currentColor);
            
            if (attackers > defenders) {
                // This piece is hanging, check if our move defends it
                makeMove(move);
                const newDefenders = countAttackers(sq, currentColor);
                undoMove();
                
                if (newDefenders > defenders) {
                    defendsHangingPiece = true;
                    const defendedValue = PIECE_VALUES[getPieceType(piece)];
                    score += 1500 + defendedValue; // HIGHEST PRIORITY
                    break;
                }
            }
        }
        
        // 2️⃣ PENALTY: Hanging piece after move
        makeMove(move);
        const attackersAfter = countAttackers(move.to, enemyColor);
        const defendersAfter = countAttackers(move.to, currentColor);
        undoMove();
        
        if (attackersAfter > defendersAfter) {
            score -= pieceValue * 1.5; // CRITICAL PENALTY
        }
        
        // 3️⃣ SACRIFICE FILTER: Don't sacrifice without compensation
        if (move.flags & MOVE_CAPTURE) {
            const attacker = pieceType;
            const victim = getPieceType(board[move.to]);
            const victimValue = PIECE_VALUES[victim];
            
            // If we're sacrificing material
            if (pieceValue > victimValue) {
                // Penalize unless there's clear justification
                if (attackersAfter > defendersAfter) {
                    score -= 400; // Bad sacrifice
                }
            }
            
            score += MVV_LVA[attacker][victim] * 1000;
        }
        
        // 4️⃣ PIECE PRIORITY: Never hang queen/rook
        if (pieceType === QUEEN && attackersAfter > defendersAfter) {
            score -= 800; // MASSIVE PENALTY
        }
        if (pieceType === ROOK && attackersAfter > defendersAfter) {
            score -= 600;
        }
        
        // 5️⃣ HIGH PRIORITY: Castling (when safe)
        if (move.flags & (MOVE_CASTLE_KINGSIDE | MOVE_CASTLE_QUEENSIDE)) {
            score += 800;
        }
        
        // 6️⃣ ATTACK ONLY WHEN KING IS SAFE
        const kingPos = findKing(currentColor);
        const kingAttackers = countAttackers(kingPos, enemyColor);
        if (kingAttackers > 0 && (move.flags & MOVE_CAPTURE)) {
            score -= 250; // Don't attack when king is threatened
        }
        
        // Promotions
        if (move.flags & MOVE_PROMOTION) {
            score += 8000;
        }
        
        // Center control for quiet moves
        if (!(move.flags & MOVE_CAPTURE)) {
            const toRank = move.to >> 4;
            const toFile = move.to & 7;
            const distFromCenter = Math.abs(3.5 - toRank) + Math.abs(3.5 - toFile);
            score += (7 - distFromCenter) * 10;
        }
        
        return { move, score };
    });
    
    // Sort by score descending
    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves.map(sm => sm.move);
}

// Quiescence search to avoid horizon effect (LIMITED FOR SPEED)
function quiescence(alpha, beta, color, depth = 0) {
    nodesSearched++;
    
    // Time and depth limits to prevent explosion
    if (depth >= MAX_QUIESCENCE_DEPTH) return evaluate();
    if (timeUp()) return evaluate();
    if (nodesSearched > NODE_LIMIT) return evaluate();
    
    const standPat = evaluate();
    const score = color === WHITE ? standPat : -standPat;
    
    if (score >= beta) return beta;
    if (alpha < score) alpha = score;
    
    // Delta pruning: skip if hopeless
    const bigDelta = 900; // Queen value
    if (score < alpha - bigDelta) return alpha;
    
    // Generate only captures (removed checks for speed)
    const allMoves = generateAllPseudoLegalMoves(color);
    const captureMoves = allMoves.filter(m => m.flags & MOVE_CAPTURE);
    const legalCaptures = filterLegalMoves(captureMoves, color);
    
    // Skip obviously bad captures
    const goodCaptures = legalCaptures.filter(m => {
        const attacker = getPieceType(board[m.from]);
        const victim = getPieceType(board[m.to]);
        return PIECE_VALUES[victim] >= PIECE_VALUES[attacker] * 0.5;
    });
    
    // Order tactical moves
    const orderedTactical = orderMoves(goodCaptures);
    
    for (const move of orderedTactical) {
        makeMove(move);
        const score = -quiescence(-beta, -alpha, color === WHITE ? BLACK : WHITE, depth + 1);
        undoMove();
        
        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
    }
    
    return alpha;
}

// Minimax with alpha-beta pruning
function alphaBeta(depth, alpha, beta, color, allowNull = true) {
    nodesSearched++;
    
    // Time and node limits
    if (timeUp()) return evaluate();
    if (nodesSearched > NODE_LIMIT) return evaluate();
    
    // Check transposition table
    const hash = getBoardHash();
    const ttEntry = transpositionTable.get(hash);
    if (ttEntry && ttEntry.depth >= depth) {
        return ttEntry.score;
    }
    
    // Terminal node or max depth
    if (depth === 0) {
        return quiescence(alpha, beta, color);
    }
    
    // Check for game over
    if (isCheckmate(color)) {
        return color === WHITE ? -999999 + (searchDepth - depth) : 999999 - (searchDepth - depth);
    }
    
    if (isDraw()) {
        return 0;
    }
    
    // Generate and order moves
    const moves = generateLegalMoves(color);
    if (moves.length === 0) {
        return 0; // Stalemate
    }
    
    const orderedMoves = orderMoves(moves);
    
    let bestScore = -Infinity;
    
    for (const move of orderedMoves) {
        // Skip obviously bad moves for speed
        if (depth > 2 && move.flags & MOVE_CAPTURE) {
            const attacker = getPieceType(board[move.from]);
            const victim = getPieceType(board[move.to]);
            // Skip losing captures at shallow depth
            if (PIECE_VALUES[attacker] > PIECE_VALUES[victim] * 2) {
                if (isSquareAttacked(move.to, color === WHITE ? BLACK : WHITE)) {
                    continue; // Skip this bad capture
                }
            }
        }
        
        makeMove(move);
        
        const score = -alphaBeta(depth - 1, -beta, -alpha, color === WHITE ? BLACK : WHITE, true);
        
        undoMove();
        
        if (score > bestScore) {
            bestScore = score;
        }
        
        if (bestScore > alpha) {
            alpha = bestScore;
        }
        
        // Beta cutoff
        if (alpha >= beta) {
            break;
        }
    }
    
    // Store in transposition table
    if (transpositionTable.size < MAX_TABLE_SIZE) {
        transpositionTable.set(hash, { score: bestScore, depth });
    }
    
    return bestScore;
}

// Get the best move for the current position (TIME-LIMITED)
function getBestMove(color, depth = 5) {
    searchDepth = depth;
    nodesSearched = 0;
    searchStart = performance.now(); // Start timer
    
    const moves = generateLegalMoves(color);
    if (moves.length === 0) return null;
    
    // Single legal move - play it immediately
    if (moves.length === 1) {
        return moves[0];
    }
    
    const orderedMoves = orderMoves(moves);
    
    let bestMove = orderedMoves[0];
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;
    
    for (const move of orderedMoves) {
        if (timeUp()) break; // Time limit reached
        
        makeMove(move);
        
        const score = -alphaBeta(depth - 1, -beta, -alpha, color === WHITE ? BLACK : WHITE, true);
        
        undoMove();
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
        
        if (score > alpha) {
            alpha = score;
        }
    }
    
    const elapsed = (performance.now() - searchStart).toFixed(0);
    console.log(`Depth: ${depth}, Nodes: ${nodesSearched}, Time: ${elapsed}ms, Score: ${bestScore}`);
    
    return bestMove;
}

// Iterative deepening search (TIME-LIMITED)
function getBestMoveIterative(color, maxDepth = 6, maxTime = 3500) {
    searchStart = performance.now();
    let bestMove = null;
    
    for (let depth = 1; depth <= maxDepth; depth++) {
        if (timeUp()) break;
        
        const move = getBestMove(color, depth);
        if (move) {
            bestMove = move;
        }
        
        // Stop if we've used 90% of time
        if (performance.now() - searchStart > maxTime * 0.9) break;
    }
    
    return bestMove;
}

// Get computer move (main entry point with move count tracking)
function getComputerMove(useIterativeDeepening = false, moveCount = 0) {
    currentMoveCount = moveCount;
    searchStart = performance.now();
    
    // Clear transposition table periodically
    if (transpositionTable.size > MAX_TABLE_SIZE * 0.9) {
        transpositionTable.clear();
    }
    
    const targetDepth = getDynamicDepth();
    
    if (useIterativeDeepening) {
        return getBestMoveIterative(BLACK, targetDepth + 1, TIME_LIMIT);
    } else {
        return getBestMove(BLACK, targetDepth);
    }
}
