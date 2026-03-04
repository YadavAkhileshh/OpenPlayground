/**
 * File: scene.js
 * MouseTone Module
 * Copyright (c) 2026
 */
export class Scene {
    constructor(ctx, audioCtx) {
        this.ctx = ctx;
        this.audioCtx = audioCtx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }

    async enter() { }
    async exit() { }

    update(dt, mouse) { }
    render() { }
    handleInput(type, data) { }

    resize(width, height) {
        this.width = width;
        this.height = height;
    }
}
