/**
 * File: scenemanager.js
 * MouseTone Module
 * Copyright (c) 2026
 */
/**
 * Manages the transition and lifecycle of different scenes (modes).
 * Handles the main update and render loops, delegating to the current active scene.
 * Also passes input events (mouse, touch) to scenes.
 */
export class SceneManager {
    /**
     * @param {CanvasRenderingContext2D} ctx - The main canvas 2D context.
     * @param {AudioContext} audioCtx - The global Web Audio API context.
     */
    constructor(ctx, audioCtx) {
        this.ctx = ctx; // Canvas 2D context
        this.audioCtx = audioCtx;
        this.scenes = {};
        this.currentScene = null;
        this.sceneName = null;
    }

    /**
     * Registers a new scene class with a name.
     * @param {string} name - Unique identifier for the scene (e.g., 'FLOW').
     * @param {class} sceneClass - The class constructor for the scene.
     */
    register(name, sceneClass) {
        this.scenes[name] = sceneClass;
    }

    /**
     * ASM-style async switcher.
     * Switches to a named scene, handling exit/enter promises.
     * @param {string} name - The name of the scene to switch to.
     */
    async switchScene(name) {
        if (this.currentScene) {
            await this.currentScene.exit();
        }

        if (this.scenes[name]) {
            this.currentScene = new this.scenes[name](this.ctx, this.audioCtx);
            await this.currentScene.enter();
            this.sceneName = name;
            console.log(`Switched to scene: ${name}`);
        } else {
            console.error(`Scene ${name} not found`);
        }
    }

    update(dt, mouse) {
        if (this.currentScene) {
            this.currentScene.update(dt, mouse);
        }
    }

    render() {
        if (this.currentScene) {
            this.currentScene.render();
        }
    }

    handleInput(type, data) {
        if (this.currentScene && this.currentScene.handleInput) {
            this.currentScene.handleInput(type, data);
        }
    }

    resize(width, height) {
        if (this.currentScene && this.currentScene.resize) {
            this.currentScene.resize(width, height);
        }
    }
}
