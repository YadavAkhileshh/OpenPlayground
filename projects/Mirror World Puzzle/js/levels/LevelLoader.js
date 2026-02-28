import { WORLD_WIDTH, TILE_SIZE } from '../utils/Constants.js';
import Transform from '../components/Transform.js';
import Velocity from '../components/Velocity.js';
import Sprite from '../components/Sprite.js';
import Collider from '../components/Collider.js';
import PlayerControl from '../components/PlayerControl.js';
import WorldLayer from '../components/WorldLayer.js';
import MirrorMovement from '../components/MirrorMovement.js';

export default class LevelLoader {
    constructor(world) {
        this.world = world;
    }

    loadLevel(levelData) {
        // Clear existing entities (naive approach, usually we'd have a scene clear)
        // this.world.entities = []; 

        this.createWorld(levelData, 'left');
        this.createWorld(levelData, 'right');
    }

    createWorld(data, layer) {
        const isMirrored = layer === 'right';

        // Helper to mirror X coordinate
        const getX = (x, width) => {
            return isMirrored ? (WORLD_WIDTH - x - width) : x;
        };

        // Create Walls
        data.walls.forEach(wall => {
            const e = this.world.createEntity();
            e.addComponent(new Transform(getX(wall.x, wall.w), wall.y))
                .addComponent(new Sprite('#666', wall.w, wall.h))
                .addComponent(new Collider(wall.w, wall.h, false, 'wall'))
                .addComponent(new WorldLayer(layer));
        });

        // Create Exit
        const exitE = this.world.createEntity();
        const exitW = 48; // slightly bigger
        const exitH = 48;
        exitE.addComponent(new Transform(getX(data.exit.x, exitW), data.exit.y))
            .addComponent(new Sprite('#0f0', exitW, exitH)) // Green exit
            .addComponent(new Collider(exitW, exitH, true, 'exit'))
            .addComponent(new WorldLayer(layer));

        // Create Player
        const player = this.world.createEntity();
        const pSize = 32;
        player.addComponent(new Transform(getX(data.start.x, pSize), data.start.y))
            .addComponent(new Velocity())
            .addComponent(new Sprite('#f00', pSize, pSize)) // Red player
            .addComponent(new Collider(pSize, pSize, false, 'player'))
            .addComponent(new PlayerControl())
            .addComponent(new WorldLayer(layer));

        if (isMirrored) {
            // Add Mirror Movement trait to Right Player
            // Mirror X input, keep Y
            player.addComponent(new MirrorMovement(true, false));
            // Visual distinction
            player.getComponent('Sprite').color = '#00f'; // Blue player
        }
    }
}
