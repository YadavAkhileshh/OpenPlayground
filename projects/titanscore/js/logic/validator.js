import { GameStore } from '../state/store.js';

export function checkWin() {
    const tiles = GameStore.tiles;
    for (let i = 0; i < tiles.length; i++) {
        if (tiles[i].id !== i) {
            return false;
        }
    }
    return true;
}