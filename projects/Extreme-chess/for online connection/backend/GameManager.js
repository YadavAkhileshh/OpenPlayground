import { ChessGame } from './ChessGame.js';

export class GameManager {
    constructor() {
        this.games = new Map();
        this.waitingPlayers = [];
    }

    createGame(gameId) {
        const game = new ChessGame();
        this.games.set(gameId, {
            game,
            players: [],
            spectators: []
        });
        return game;
    }

    getGame(gameId) {
        return this.games.get(gameId);
    }

    joinGame(gameId, playerId, playerName) {
        let gameData = this.games.get(gameId);

        if (!gameData) {
            gameData = {
                game: new ChessGame(),
                players: [],
                spectators: []
            };
            this.games.set(gameId, gameData);
        }

        if (gameData.players.length < 2) {
            const color = gameData.players.length === 0 ? 'white' : 'black';
            gameData.players.push({ id: playerId, name: playerName, color });
            return { success: true, color, role: 'player' };
        } else {
            gameData.spectators.push({ id: playerId, name: playerName });
            return { success: true, role: 'spectator' };
        }
    }

    removePlayer(gameId, playerId) {
        const gameData = this.games.get(gameId);
        if (!gameData) return;

        gameData.players = gameData.players.filter(p => p.id !== playerId);
        gameData.spectators = gameData.spectators.filter(s => s.id !== playerId);

        if (gameData.players.length === 0 && gameData.spectators.length === 0) {
            this.games.delete(gameId);
        }
    }

    getPlayerColor(gameId, playerId) {
        const gameData = this.games.get(gameId);
        if (!gameData) return null;

        const player = gameData.players.find(p => p.id === playerId);
        return player ? player.color : null;
    }

    deleteGame(gameId) {
        this.games.delete(gameId);
    }
}
