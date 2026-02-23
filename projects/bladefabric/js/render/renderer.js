// renderer.js
import { globalEvents } from '../core/eventBus.js';
import { DrawMesh } from './drawMesh.js';
import { DrawDebug } from './drawDebug.js';

export class Renderer {
    constructor(canvasSystem, camera, world, particleSystem, input) {
        this.canvasSys = canvasSystem;
        this.ctx = canvasSystem.ctx;
        this.effectsCtx = document.getElementById('effects-canvas').getContext('2d');
        this.camera = camera;
        this.world = world;
        this.particleSystem = particleSystem;
        this.input = input;

        this.showDebug = false;
        this.showAABB = false;
        this.showContacts = false;

        globalEvents.on('toggle_debug', val => this.showDebug = val);
        globalEvents.on('toggle_aabb', val => this.showAABB = val);
        globalEvents.on('toggle_contacts', val => this.showContacts = val);

        // Match effects canvas to main canvas
        window.addEventListener('resize', this.resizeEffectsCanvas.bind(this));
        setTimeout(() => this.resizeEffectsCanvas(), 100);
    }

    resizeEffectsCanvas() {
        const c2 = document.getElementById('effects-canvas');
        const rect = c2.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        c2.width = rect.width * dpr;
        c2.height = rect.height * dpr;
        this.effectsCtx.scale(dpr, dpr);
    }

    render(alpha) {
        this.canvasSys.clear();

        // Clear effects canvas without scaling transform
        const effectsCanvas = document.getElementById('effects-canvas');
        this.effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

        this.camera.update();
        this.camera.applyTransform(this.ctx);

        // Draw Constraints (Cloth links)
        DrawMesh.drawConstraints(this.ctx, this.world.constraints);

        // Draw Bodies
        for (const body of this.world.bodies) {
            DrawMesh.drawBody(this.ctx, body);

            if (this.showDebug && this.showAABB) {
                DrawDebug.drawAABB(this.ctx, body.getAABB());
            }
        }

        // Draw Debug Contacts
        if (this.showDebug && this.showContacts) {
            DrawDebug.drawContacts(this.ctx, this.world.contacts);
        }

        // Draw Slice Line
        if (this.input.isSlicing && this.input.sliceStart && this.input.sliceEnd) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.input.sliceStart.x, this.input.sliceStart.y);
            this.ctx.lineTo(this.input.sliceEnd.x, this.input.sliceEnd.y);
            this.ctx.strokeStyle = '#f59e0b';
            this.ctx.lineWidth = 2;
            // Dotted line
            this.ctx.setLineDash([10, 10]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            this.ctx.shadowColor = '#f59e0b';
            this.ctx.shadowBlur = 10;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }

        // Restore Matrix
        this.camera.restoreTransform(this.ctx);

        // Render Particles (Handles its own screen space projection)
        this.particleSystem.render(this.effectsCtx, this.camera);
    }
}
