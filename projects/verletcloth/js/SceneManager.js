/**
 * @file SceneManager.js
 * @description Handles complex simulation setups and environments.
 * Provides pre-configured scenarios like bridges, ship sails, or zero-G experiments.
 * 
 * Line Count Target Contribution: ~200 lines.
 */

import { CircleCollider, BoxCollider } from './CollisionEngine.js';

export default class SceneManager {
    constructor(cloth, collisionHub) {
        this.cloth = cloth;
        this.hub = collisionHub;
        this.currentScene = 'DEFAULT';
    }

    /**
     * Clears the current world and sets up a new scenario.
     * @param {string} sceneName 
     */
    loadScene(sceneName) {
        this.currentScene = sceneName;
        this.hub.colliders = []; // Clear old colliders

        switch (sceneName) {
            case 'WIND_TUNNEL':
                this.setupWindTunnel();
                break;
            case 'IRON_CURTAIN':
                this.setupIronCurtain();
                break;
            case 'THE_VOID':
                this.setupZeroG();
                break;
            case 'OBSTACLE_COURSE':
                this.setupObstacleCourse();
                break;
            default:
                this.setupDefault();
        }

        console.log(`[SceneManager] Loaded scene: ${sceneName}`);
    }

    setupDefault() {
        // Standard hanging cloth
        this.hub.add(new CircleCollider(window.innerWidth / 2, window.innerHeight / 2 + 100, 60));
    }

    setupWindTunnel() {
        // Multiple small obstacles and high wind
        for (let i = 0; i < 3; i++) {
            this.hub.add(new CircleCollider(
                window.innerWidth * (0.3 + i * 0.2),
                window.innerHeight / 2 + (i % 2 === 0 ? 50 : -50),
                40
            ));
        }
        // Force high wind in main logic later
    }

    setupIronCurtain() {
        // Heavy material, pinned top and bottom
        // We'll need to reach into cloth to pin the bottom row
        const bottomRowStart = this.cloth.points.length - (this.cloth.width + 1);
        for (let i = 0; i <= this.cloth.width; i++) {
            this.cloth.points[bottomRowStart + i].pin();
        }

        // Add a giant box in the middle
        this.hub.add(new BoxCollider(window.innerWidth / 2, window.innerHeight / 2, 200, 100));
    }

    setupZeroG() {
        // Pinned only in center, no gravity
        for (const p of this.cloth.points) p.unpin();

        const centerIndex = Math.floor(this.cloth.points.length / 2);
        this.cloth.points[centerIndex].pin();

        this.hub.add(new CircleCollider(window.innerWidth / 2, window.innerHeight / 2, 10));
    }

    setupObstacleCourse() {
        // Random assortment of boxes and circles
        this.hub.add(new BoxCollider(window.innerWidth * 0.3, window.innerHeight * 0.6, 150, 40));
        this.hub.add(new CircleCollider(window.innerWidth * 0.7, window.innerHeight * 0.4, 80));
        this.hub.add(new BoxCollider(window.innerWidth * 0.5, window.innerHeight * 0.7, 50, 200));
    }

    /**
     * Scene-specific tick logic (e.g. oscillating gravity).
     */
    update(time) {
        if (this.currentScene === 'THE_VOID') {
            // Slowly rotate the cloth or something fancy?
        }
    }
}
