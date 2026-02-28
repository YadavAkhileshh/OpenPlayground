import { CONFIG, BLOCKS } from '../utils/constants.js';
import { Camera } from './camera.js';
import { Raycaster } from './raycaster.js';
import { Renderer } from './renderer.js';
import { ChunkManager } from '../world/chunk_manager.js';

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.chunkManager = new ChunkManager();
        this.camera = new Camera(0, 30, 0);
        this.raycaster = new Raycaster(this.chunkManager);
        this.renderer = new Renderer(this.canvas, this.camera, this.raycaster);

        this.lastTime = 0;
        this.keys = {};
        this.selectedBlock = BLOCKS.DIRT;

        // Interaction state
        this.interactionResult = {
            hit: false,
            block: 0,
            distance: 0,
            side: 0,
            face: 0,
            mapPos: { x: 0, y: 0, z: 0 },
            hitPos: { x: 0, y: 0, z: 0 }
        };

        this.setupInput();
        this.setupUI();

        // Initial chunk load
        this.chunkManager.update(this.camera.position.x, this.camera.position.z);
    }

    setupInput() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.key >= '1' && e.key <= '4') {
                this.selectedBlock = parseInt(e.key);
                document.querySelectorAll('.slot').forEach(s => s.classList.remove('active'));
                const slot = document.querySelector(`.slot[data-block="${this.selectedBlock}"]`);
                if (slot) slot.classList.add('active');
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.canvas.addEventListener('click', () => {
            this.canvas.requestPointerLock();
        });

        document.addEventListener('mousemove', (e) => {
            if (document.pointerLockElement === this.canvas) {
                this.camera.rotate(e.movementX, e.movementY);
            }
        });

        document.addEventListener('mousedown', (e) => {
            if (document.pointerLockElement !== this.canvas) return;

            if (!this.interactionResult.hit) return;

            const x = this.interactionResult.mapPos.x;
            const y = this.interactionResult.mapPos.y;
            const z = this.interactionResult.mapPos.z;

            if (e.button === 0) { // Break
                this.chunkManager.setBlock(x, y, z, BLOCKS.AIR);
            } else if (e.button === 2) { // Place
                let nx = x, ny = y, nz = z;
                const f = this.interactionResult.face;

                // face mapping:
                // 0: x+, 1: x-, 2: y+, 3: y-, 4: z+, 5: z-
                // Corrections based on Raycaster logic:
                // side 0 (X): stepX>0 => 1 (Left/-x), stepX<0 => 0 (Right/+x) ??

                // Let's re-verify Raycaster logic briefly mentally:
                // if (side === 0) face = (stepX > 0) ? 1 : 0;
                // If stepX > 0 (moving +x), we hit the side facing -x. So we should place at x-1.
                // Wait. We are looking for the AIR block adjacent to the HIT block.
                // If we hit the face pointing -x (at x=10), the adjacent air is at x=9.
                // So if stepX > 0 (we are at x=9 looking at x=10), we hit face 1.
                // So neighbor x = x - 1.

                // My mapping in Raycaster:
                // if (stepX > 0) face = 1; -> We want neighbor x-1?
                // if (stepX < 0) face = 0; -> We want neighbor x+1?

                // Let's map it simply:
                if (f === 1) nx--;
                else if (f === 0) nx++;
                else if (f === 3) ny--;
                else if (f === 2) ny++;
                else if (f === 5) nz--;
                else if (f === 4) nz++;

                // Prevent placing inside player
                const px = Math.floor(this.camera.position.x);
                const py = Math.floor(this.camera.position.y);
                const pz = Math.floor(this.camera.position.z);

                // Check simple distance or floor coords
                // Player height is usually 2 blocks
                if (!((nx === px && nz === pz) && (ny === py || ny === py + 1))) {
                    this.chunkManager.setBlock(nx, ny, nz, this.selectedBlock);
                }
            }
        });
    }

    setupUI() {
        document.getElementById('start-screen').addEventListener('click', () => {
            document.getElementById('start-screen').style.display = 'none';
            document.getElementById('hud').style.display = 'block';
            this.canvas.requestPointerLock();
            this.start();
        });
    }

    start() {
        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Movement constants
        const speed = this.keys['ShiftLeft'] ? CONFIG.RUN_SPEED : CONFIG.MOVEMENT_SPEED;
        const dist = speed * dt;

        // Wish direction relative to camera
        const cosYaw = Math.cos(this.camera.yaw);
        const sinYaw = Math.sin(this.camera.yaw);

        // Forward vector on XZ plane
        // yaw 0 -> (0,0,1) usually.
        // My camera: dir.x = sinYaw, dir.z = cosYaw
        const fwdX = sinYaw;
        const fwdZ = cosYaw;
        const rightX = cosYaw; // Right is (z, 0, -x) ?
        const rightZ = -sinYaw;

        let dx = 0;
        let dz = 0;

        if (this.keys['KeyW']) { dx += fwdX; dz += fwdZ; }
        if (this.keys['KeyS']) { dx -= fwdX; dz -= fwdZ; }
        if (this.keys['KeyA']) { dx -= rightX; dz -= rightZ; } // Verify strafe direction
        if (this.keys['KeyD']) { dx += rightX; dz += rightZ; }

        // Normalize
        if (dx !== 0 || dz !== 0) {
            const len = Math.sqrt(dx * dx + dz * dz);
            dx = (dx / len) * dist;
            dz = (dz / len) * dist;
        }

        // Collision Check (Simple)
        const oldX = this.camera.position.x;
        const oldZ = this.camera.position.z;
        const newX = oldX + dx;
        const newZ = oldZ + dz;
        const y = Math.floor(this.camera.position.y); // Eye level or feet?

        // Check feet and head
        // Approx feet = y - 1.5? Camera is at eye level.
        // Let's assume camera.y is eye level, player height is 1.8. Feet at y-1.6. Head at y+0.2

        const feetY = Math.floor(this.camera.position.y - 1.5);
        const headY = Math.floor(this.camera.position.y);

        // X-Move
        if (this.chunkManager.getBlock(Math.floor(newX), feetY, Math.floor(oldZ)) === 0 &&
            this.chunkManager.getBlock(Math.floor(newX), headY, Math.floor(oldZ)) === 0) {
            this.camera.position.x = newX;
        }

        // Z-Move
        if (this.chunkManager.getBlock(Math.floor(this.camera.position.x), feetY, Math.floor(newZ)) === 0 &&
            this.chunkManager.getBlock(Math.floor(this.camera.position.x), headY, Math.floor(newZ)) === 0) {
            this.camera.position.z = newZ;
        }

        // Vertical Movement (Creative Flight)
        if (this.keys['Space']) this.camera.position.y += dist;
        if (this.keys['ControlLeft']) this.camera.position.y -= dist;

        // Interaction Raycast
        this.raycaster.cast(this.camera.position, this.camera.direction, 5.0, this.interactionResult);

        // UI Updates
        this.updateHUD();

        // Chunk Loading
        this.chunkManager.update(this.camera.position.x, this.camera.position.z);
    }

    updateHUD() {
        // Debug Info
        document.getElementById('pos').textContent =
            `${this.camera.position.x.toFixed(1)}, ${this.camera.position.y.toFixed(1)}, ${this.camera.position.z.toFixed(1)}`;
        document.getElementById('chunks').textContent = this.chunkManager.chunks.size;

        // Crosshair
        const ch = document.getElementById('crosshair');
        if (this.interactionResult.hit) {
            ch.style.transform = 'translate(-50%, -50%) scale(1.2)';
            ch.style.color = '#ff5555';
        } else {
            ch.style.transform = 'translate(-50%, -50%) scale(1)';
            ch.style.color = 'rgba(255, 255, 255, 0.8)';
        }
    }

    loop(time) {
        const dt = Math.min((time - this.lastTime) / 1000, 0.1); // Cap dt
        this.lastTime = time;

        this.update(dt);
        this.renderer.render();

        document.getElementById('fps').textContent = Math.round(1 / (dt || 1));

        requestAnimationFrame((t) => this.loop(t));
    }
}

window.onload = () => {
    new Game();
};
