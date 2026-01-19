import { useRef } from 'react';

class StockfishEngine {
    constructor() {
        this.worker = null;
        this.onMoveCallback = null;
        this.init();
    }

    init() {
        try {
            // Using local worker from public folder to avoid CORS issues
            this.worker = new Worker('stockfish.js');

            this.worker.onmessage = (e) => {
                const line = e.data;
                // console.log("Stockfish:", line); // Debug

                if (line.startsWith('bestmove')) {
                    const move = line.split(' ')[1];
                    if (this.onMoveCallback) {
                        this.onMoveCallback(this.parseMove(move));
                    }
                }
            };

            this.worker.postMessage('uci');
            this.worker.postMessage('ucinewgame');
            this.worker.postMessage('isready');
        } catch (error) {
            console.error("Failed to initialize Stockfish worker:", error);
        }
    }


    setDifficulty(level) {
        // Stockfish skill level ranges from 0 to 20
        const skill = Math.max(0, Math.min(20, level));
        this.worker.postMessage(`setoption name Skill Level value ${skill}`);
    }

    findBestMove(fen, onMove) {
        this.onMoveCallback = onMove;
        this.worker.postMessage(`position fen ${fen}`);
        // 'go depth 10' is a good balance for web performance
        this.worker.postMessage('go depth 10');
    }

    parseMove(moveStr) {
        // convert 'e2e4' to {from: {row: 6, col: 4}, to: {row: 4, col: 4}}
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const fromFile = moveStr[0];
        const fromRank = parseInt(moveStr[1]);
        const toFile = moveStr[2];
        const toRank = parseInt(moveStr[3]);

        return {
            from: {
                row: 8 - fromRank,
                col: files.indexOf(fromFile)
            },
            to: {
                row: 8 - toRank,
                col: files.indexOf(toFile)
            },
            promotion: moveStr.length > 4 ? moveStr[4] : 'q'
        };
    }

    terminate() {
        if (this.worker) {
            this.worker.terminate();
        }
    }
}

export default StockfishEngine;
