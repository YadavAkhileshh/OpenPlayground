import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './GameManager.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

const gameManager = new GameManager();

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createGame', ({ playerName }) => {
        const gameId = Math.random().toString(36).substring(7);
        gameManager.createGame(gameId);
        const result = gameManager.joinGame(gameId, socket.id, playerName);

        socket.join(gameId);
        socket.emit('gameCreated', { gameId, ...result });
        console.log(`Game created: ${gameId} by ${playerName}`);
    });

    socket.on('joinGame', ({ gameId, playerName }) => {
        const result = gameManager.joinGame(gameId, socket.id, playerName);

        if (result.success) {
            socket.join(gameId);
            socket.emit('gameJoined', { gameId, ...result });

            const gameData = gameManager.getGame(gameId);
            if (gameData) {
                io.to(gameId).emit('gameState', gameData.game.getGameState());

                if (gameData.players.length === 2) {
                    io.to(gameId).emit('gameStart', {
                        players: gameData.players.map(p => ({ name: p.name, color: p.color }))
                    });
                }
            }
            console.log(`${playerName} joined game: ${gameId}`);
        } else {
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    socket.on('move', ({ gameId, from, to, promotion }) => {
        const gameData = gameManager.getGame(gameId);

        if (!gameData) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }

        const playerColor = gameManager.getPlayerColor(gameId, socket.id);

        if (playerColor !== gameData.game.currentPlayer) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }

        const result = gameData.game.makeMove(from.row, from.col, to.row, to.col, promotion);

        if (result.success) {
            io.to(gameId).emit('moveMade', {
                from,
                to,
                gameState: gameData.game.getGameState(),
                gameStatus: result.gameStatus
            });

            if (result.gameStatus === 'checkmate') {
                io.to(gameId).emit('gameOver', {
                    winner: playerColor,
                    reason: 'checkmate'
                });
            } else if (result.gameStatus === 'stalemate') {
                io.to(gameId).emit('gameOver', {
                    winner: null,
                    reason: 'stalemate'
                });
            }
        } else {
            socket.emit('error', { message: result.message });
        }
    });

    socket.on('getLegalMoves', ({ gameId, row, col }) => {
        const gameData = gameManager.getGame(gameId);

        if (!gameData) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }

        const legalMoves = gameData.game.getLegalMoves(row, col);
        socket.emit('legalMoves', { row, col, moves: legalMoves });
    });

    socket.on('resetGame', ({ gameId }) => {
        const gameData = gameManager.getGame(gameId);

        if (gameData) {
            gameData.game = gameManager.createGame(gameId).game;
            io.to(gameId).emit('gameState', gameData.game.getGameState());
            io.to(gameId).emit('gameReset');
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove player from all games
        for (const [gameId, gameData] of gameManager.games.entries()) {
            const wasPlayer = gameData.players.some(p => p.id === socket.id);
            gameManager.removePlayer(gameId, socket.id);

            if (wasPlayer) {
                io.to(gameId).emit('playerLeft', { message: 'Opponent disconnected' });
            }
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Chess server running on port ${PORT}`);
});
