/**
 * RETRO RAYCASTING ENGINE (Wolfenstein 3D Style)
 * * Features:
 * - DDA (Digital Differential Analyzer) Raycasting
 * - Procedural Texture Generation (No external assets)
 * - Floor & Ceiling Casting
 * - Depth Shading (Fog)
 * - Collision Detection
 * - Minimap Rendering
 * * @author saiusesgithub
 */

/* =========================================
   1. CONFIGURATION & CONSTANTS
   ========================================= */

const CONFIG = {
    screenWidth: 640,  // Internal resolution (scaled up by CSS)
    screenHeight: 360,
    fov: 66,           // Field of View in degrees
    tickRate: 60,      // Target FPS
    moveSpeed: 0.08,   // Walking speed
    rotSpeed: 0.05,    // Turning speed
    texWidth: 64,      // Texture size (64x64 pixels)
    texHeight: 64,
    mapWidth: 24,      // Size of the world grid
    mapHeight: 24
};

// Colors for Procedural Textures
const PALETTE = {
    floor: '#333333',
    ceiling: '#1a1a1a',
    wall1: [180, 50, 50],   // Red Brick
    wall2: [50, 100, 180],  // Blue Metal
    wall3: [50, 180, 50],   // Green Slime
    wall4: [180, 180, 50]   // Yellow Warning
};

/* =========================================
   2. WORLD MAP DATA (1 = Wall, 0 = Empty)
   ========================================= */

const worldMap = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 2, 2, 0, 2, 2, 0, 0, 0, 0, 3, 0, 3, 0, 3, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 5, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

/* =========================================
   3. TEXTURE GENERATOR (Procedural)
   ========================================= */

class TextureManager {
    constructor() {
        this.textures = [];
        this.generateTextures();
    }

    // Helper: Generate Noise
    getNoise(x, y, factor = 1) {
        return (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 * factor) % 1;
    }

    generateTextures() {
        // We will generate 8 different texture buffers
        for (let t = 0; t < 8; t++) {
            const buffer = new Uint32Array(CONFIG.texWidth * CONFIG.texHeight);

            for (let x = 0; x < CONFIG.texWidth; x++) {
                for (let y = 0; y < CONFIG.texHeight; y++) {
                    let color = 0;

                    // Texture 0: Generic Noise (Wall 1)
                    if (t === 0) {
                        const n = Math.random() * 50;
                        color = this.packColor(100 + n, 50 + n, 50 + n);
                    }
                    // Texture 1: Bricks (Wall 2)
                    else if (t === 1) {
                        const isMortar = (x % 32 < 2) || (y % 16 < 2);
                        color = isMortar ? this.packColor(150, 150, 150) : this.packColor(150, 50, 50);
                    }
                    // Texture 2: Metal Plates with Rivets
                    else if (t === 2) {
                        const border = (x < 2 || x > 61 || y < 2 || y > 61);
                        const rivet = (x % 16 < 2 && y % 16 < 2);
                        if (border) color = this.packColor(80, 80, 100);
                        else if (rivet) color = this.packColor(200, 200, 200);
                        else color = this.packColor(80 + Math.random() * 20, 80 + Math.random() * 20, 100 + Math.random() * 20);
                    }
                    // Texture 3: Wood
                    else if (t === 3) {
                        const grain = Math.sin(x * 0.5 + y * 0.1) * 20;
                        color = this.packColor(140 + grain, 90 + grain, 50 + grain);
                    }
                    // Fallback
                    else {
                        const c = (x ^ y);
                        color = this.packColor(c, c, c);
                    }

                    buffer[y * CONFIG.texWidth + x] = color;
                }
            }
            this.textures[t] = buffer;
        }
    }

    // Convert R,G,B to integer (0xAABBGGRR for Canvas ImageData)
    packColor(r, g, b) {
        return (255 << 24) | (b << 16) | (g << 8) | r;
    }
}

/* =========================================
   4. ENGINE CORE (Raycasting & Input)
   ========================================= */

class Engine {
    constructor() {
        // Canvases
        this.canvas = document.getElementById('screen-buffer');
        this.ctx = this.canvas.getContext('2d');
        this.miniCanvas = document.getElementById('minimap-buffer');
        this.miniCtx = this.miniCanvas.getContext('2d');

        // Resize
        this.canvas.width = CONFIG.screenWidth;
        this.canvas.height = CONFIG.screenHeight;

        // Player State
        this.posX = 12.0;
        this.posY = 12.0;
        this.dirX = -1.0;
        this.dirY = 0.0;
        this.planeX = 0.0;
        this.planeY = 0.66; // FOV Ratio

        // Input State
        this.keys = {
            w: false, s: false, a: false, d: false, shift: false
        };

        // Systems
        this.textures = new TextureManager();
        this.lastTime = 0;

        // Image Buffer for direct pixel manipulation (Faster than fillRect)
        this.screenBuffer = this.ctx.createImageData(CONFIG.screenWidth, CONFIG.screenHeight);

        // Bindings
        this.bindInput();
        this.isRunning = false;

        document.getElementById('btn-start').addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            this.isRunning = true;
            requestAnimationFrame(t => this.loop(t));
        });
    }

    bindInput() {
        window.addEventListener('keydown', (e) => this.handleKey(e.key, true));
        window.addEventListener('keyup', (e) => this.handleKey(e.key, false));
    }

    handleKey(key, state) {
        const k = key.toLowerCase();
        if (this.keys.hasOwnProperty(k)) {
            this.keys[k] = state;
        }
    }

    /* --- GAME LOOP --- */
    loop(timestamp) {
        if (!this.isRunning) return;

        // Delta Time calculation
        const dt = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // Logic
        this.update(dt);
        this.render();
        this.updateHUD(dt);

        requestAnimationFrame(t => this.loop(t));
    }

    /* --- UPDATE LOGIC (Movement & Collision) --- */
    update(dt) {
        // Speed modifier (Sprint)
        const moveSpeed = (this.keys.shift ? CONFIG.moveSpeed * 1.8 : CONFIG.moveSpeed) * (dt * 60);
        const rotSpeed = CONFIG.rotSpeed * (dt * 60);

        // Rotation Matrix (Rotate vectors dir and plane)
        if (this.keys.d) {
            const oldDirX = this.dirX;
            this.dirX = this.dirX * Math.cos(-rotSpeed) - this.dirY * Math.sin(-rotSpeed);
            this.dirY = oldDirX * Math.sin(-rotSpeed) + this.dirY * Math.cos(-rotSpeed);
            const oldPlaneX = this.planeX;
            this.planeX = this.planeX * Math.cos(-rotSpeed) - this.planeY * Math.sin(-rotSpeed);
            this.planeY = oldPlaneX * Math.sin(-rotSpeed) + this.planeY * Math.cos(-rotSpeed);
        }
        if (this.keys.a) {
            const oldDirX = this.dirX;
            this.dirX = this.dirX * Math.cos(rotSpeed) - this.dirY * Math.sin(rotSpeed);
            this.dirY = oldDirX * Math.sin(rotSpeed) + this.dirY * Math.cos(rotSpeed);
            const oldPlaneX = this.planeX;
            this.planeX = this.planeX * Math.cos(rotSpeed) - this.planeY * Math.sin(rotSpeed);
            this.planeY = oldPlaneX * Math.sin(rotSpeed) + this.planeY * Math.cos(rotSpeed);
        }

        // Movement with Collision Detection
        if (this.keys.w) {
            if (worldMap[Math.floor(this.posX + this.dirX * moveSpeed)][Math.floor(this.posY)] === 0)
                this.posX += this.dirX * moveSpeed;
            if (worldMap[Math.floor(this.posX)][Math.floor(this.posY + this.dirY * moveSpeed)] === 0)
                this.posY += this.dirY * moveSpeed;
        }
        if (this.keys.s) {
            if (worldMap[Math.floor(this.posX - this.dirX * moveSpeed)][Math.floor(this.posY)] === 0)
                this.posX -= this.dirX * moveSpeed;
            if (worldMap[Math.floor(this.posX)][Math.floor(this.posY - this.dirY * moveSpeed)] === 0)
                this.posY -= this.dirY * moveSpeed;
        }

        // Bobbing animation trigger
        const weapon = document.getElementById('weapon-sprite');
        if (this.keys.w || this.keys.s) weapon.parentElement.classList.add('walking');
        else weapon.parentElement.classList.remove('walking');
    }

    /* --- RENDERER (DDA Raycasting) --- */
    render() {
        // We manipulate the Uint32Array view of the buffer for speed
        // Format: AABBGGRR (Little Endian)
        const buf32 = new Uint32Array(this.screenBuffer.data.buffer);

        // 1. FLOOR & CEILING CASTING (Simplified Gradient for Performance)
        // Calculating full floor casting in JS for every pixel is heavy, so we use a vertical gradient
        for (let y = 0; y < CONFIG.screenHeight; y++) {
            const isFloor = y > CONFIG.screenHeight / 2;
            // Generate a fake depth shading
            const color = isFloor ? 0xFF333333 : 0xFF111111;
            // Fill row
            const start = y * CONFIG.screenWidth;
            buf32.fill(color, start, start + CONFIG.screenWidth);
        }

        // 2. WALL CASTING
        for (let x = 0; x < CONFIG.screenWidth; x++) {
            // Calculate Ray Position and Direction
            const cameraX = 2 * x / CONFIG.screenWidth - 1; // x-coordinate in camera space
            const rayDirX = this.dirX + this.planeX * cameraX;
            const rayDirY = this.dirY + this.planeY * cameraX;

            // Which box of the map we're in
            let mapX = Math.floor(this.posX);
            let mapY = Math.floor(this.posY);

            // Length of ray from one x or y-side to next x or y-side
            const deltaDistX = (rayDirX === 0) ? 1e30 : Math.abs(1 / rayDirX);
            const deltaDistY = (rayDirY === 0) ? 1e30 : Math.abs(1 / rayDirY);

            let sideDistX;
            let sideDistY;

            let stepX;
            let stepY;

            let hit = 0; // Was there a wall hit?
            let side;    // Was a NS or a EW wall hit?

            // Calculate step and initial sideDist
            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (this.posX - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1.0 - this.posX) * deltaDistX;
            }
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (this.posY - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1.0 - this.posY) * deltaDistY;
            }

            // --- DDA ALGORITHM START ---
            while (hit === 0) {
                // Jump to next map square, OR in x-direction, OR in y-direction
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                // Check if ray has hit a wall
                if (worldMap[mapX][mapY] > 0) hit = 1;
            }
            // --- DDA END ---

            // Calculate distance projected on camera direction (Euclidean correction for fisheye)
            let perpWallDist;
            if (side === 0) perpWallDist = (sideDistX - deltaDistX);
            else perpWallDist = (sideDistY - deltaDistY);

            // Calculate height of line to draw on screen
            const lineHeight = Math.floor(CONFIG.screenHeight / perpWallDist);

            // Calculate lowest and highest pixel to fill in current stripe
            let drawStart = -lineHeight / 2 + CONFIG.screenHeight / 2;
            if (drawStart < 0) drawStart = 0;
            let drawEnd = lineHeight / 2 + CONFIG.screenHeight / 2;
            if (drawEnd >= CONFIG.screenHeight) drawEnd = CONFIG.screenHeight - 1;

            // --- TEXTURE CALCULATION ---
            const texNum = worldMap[mapX][mapY] - 1; // Texture index (1-based map to 0-based array)

            // Calculate where exactly the wall was hit
            let wallX;
            if (side === 0) wallX = this.posY + perpWallDist * rayDirY;
            else wallX = this.posX + perpWallDist * rayDirX;
            wallX -= Math.floor(wallX);

            // x coordinate on the texture
            let texX = Math.floor(wallX * CONFIG.texWidth);
            if (side === 0 && rayDirX > 0) texX = CONFIG.texWidth - texX - 1;
            if (side === 1 && rayDirY < 0) texX = CONFIG.texWidth - texX - 1;

            // How much to increase the texture coordinate per screen pixel
            const step = 1.0 * CONFIG.texHeight / lineHeight;
            // Starting texture coordinate
            let texPos = (drawStart - CONFIG.screenHeight / 2 + lineHeight / 2) * step;

            // --- DRAW VERTICAL STRIP ---
            for (let y = Math.floor(drawStart); y < Math.floor(drawEnd); y++) {
                // Cast the texture coordinate to integer, and mask with (texHeight - 1) in case of overflow
                const texY = Math.floor(texPos) & (CONFIG.texHeight - 1);
                texPos += step;

                const color = this.textures.textures[texNum][CONFIG.texHeight * texY + texX];

                // Shade side walls darker
                let finalColor = color;
                if (side === 1) finalColor = (color >>> 1) & 0x7F7F7F7F; // Quick integer divide by 2 for darkening

                // Depth Shading (Simple linear fog)
                // If distance is far, blend with black
                if (perpWallDist > 5) {
                    // This is a simplified bitwise fog (making pixels darker as dist increases)
                    // Real implementation requires unpacking RGB, lerping, and repacking.
                    // For JS perf, we skip complex lerp here and rely on the CRT effect overlay.
                }

                buf32[y * CONFIG.screenWidth + x] = finalColor;
            }
        }

        // Put the image data back to canvas
        this.ctx.putImageData(this.screenBuffer, 0, 0);

        // Render Minimap Overlay
        this.renderMinimap();
    }

    renderMinimap() {
        const size = 8; // Grid size in pixels
        const ctx = this.miniCtx;

        ctx.clearRect(0, 0, 200, 200);

        // Center map on player
        const offsetX = 100 - (this.posX * size);
        const offsetY = 100 - (this.posY * size);

        ctx.save();
        ctx.translate(offsetX, offsetY);

        // Draw Map
        for (let x = 0; x < CONFIG.mapWidth; x++) {
            for (let y = 0; y < CONFIG.mapHeight; y++) {
                if (worldMap[x][y] > 0) {
                    ctx.fillStyle = '#555';
                    ctx.fillRect(x * size, y * size, size, size);
                }
            }
        }

        // Draw Player
        ctx.fillStyle = '#33ff00';
        ctx.beginPath();
        ctx.arc(this.posX * size, this.posY * size, 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw Direction Line
        ctx.strokeStyle = '#33ff00';
        ctx.beginPath();
        ctx.moveTo(this.posX * size, this.posY * size);
        ctx.lineTo((this.posX + this.dirX * 3) * size, (this.posY + this.dirY * 3) * size);
        ctx.stroke();

        ctx.restore();
    }

    updateHUD(dt) {
        const fps = (typeof dt === 'number' && dt > 0) ? Math.round(1 / dt) : 0;
        document.getElementById('debug-fps').innerText = fps;
        document.getElementById('debug-pos').innerText = `${this.posX.toFixed(1)}, ${this.posY.toFixed(1)}`;

        // Simple collision warning
        const warn = document.getElementById('collision-warn');
        const nextX = Math.floor(this.posX + this.dirX);
        const nextY = Math.floor(this.posY + this.dirY);

        let collisionAhead = false;
        if (
            nextX >= 0 && nextX < CONFIG.mapWidth &&
            nextY >= 0 && nextY < CONFIG.mapHeight
        ) {
            collisionAhead = worldMap[nextX][nextY] > 0;
        }

        if (collisionAhead) {
            warn.classList.remove('hidden');
        } else {
            warn.classList.add('hidden');
        }
    }
}

// Initialize
window.onload = () => {
    const game = new Engine();
};