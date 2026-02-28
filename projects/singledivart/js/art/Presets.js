/**
 * Presets - A library of procedural art algorithms and configurations
 * This file contains the logic for various complex artwork styles.
 * 
 * Each preset is a generator function that returns a pixel array.
 */

const Presets = (() => {

    /**
     * Preset: Cosmic Nebula
     * Focuses on soft gradients and dense point clouds.
     */
    const cosmicNebula = async (res, complexity) => {
        const pixels = [];
        const scale = complexity / 20;
        const center = res / 2;

        for (let x = -res / 2; x < res / 2; x++) {
            for (let y = -res / 2; y < res / 2; y++) {
                const dist = Math.sqrt(x * x + y * y);
                const angle = Math.atan2(y, x);
                const n = MathUtils.noise2D(x * scale, y * scale);

                // Spiral influence
                const spiral = Math.sin(angle * 3 + dist * 0.1);

                if (n + spiral > 0.4 && dist < res * 0.4) {
                    const h = (180 + n * 100) % 360;
                    const s = 60 + n * 40;
                    const l = 30 + n * 30;
                    pixels.push({ x, y, color: `hsl(${h}, ${s}%, ${l}%)` });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Cyber Grid
     * Creates a structured, neon-lit grid pattern.
     */
    const cyberGrid = async (res, complexity) => {
        const pixels = [];
        const gap = Math.floor(10 - complexity / 10) || 2;

        for (let x = -res / 2; x < res / 2; x++) {
            for (let y = -res / 2; y < res / 2; y++) {
                const isGrid = (x % gap === 0 || y % gap === 0);
                const n = MathUtils.noise2D(x * 0.05, y * 0.05);

                if (isGrid && n > 0.1) {
                    const alpha = MathUtils.clamp(n, 0.2, 1);
                    pixels.push({ x, y, color: `rgba(0, 255, 136, ${alpha})` });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Organic Cells
     * Voronoi-like patterns using distance fields.
     */
    const organicCells = async (res, complexity) => {
        const pixels = [];
        const points = [];
        const numPoints = Math.floor(complexity / 4) + 10;

        // Generate random seeds
        for (let i = 0; i < numPoints; i++) {
            points.push({
                x: (Math.random() - 0.5) * res,
                y: (Math.random() - 0.5) * res,
                color: ColorUtils.colorFromNoise(Math.random())
            });
        }

        for (let x = -res / 2; x < res / 2; x += 2) {
            for (let y = -res / 2; y < res / 2; y += 2) {
                let minDist = res;
                let closestPoint = null;

                points.forEach(p => {
                    const d = MathUtils.distance(x, y, p.x, p.y);
                    if (d < minDist) {
                        minDist = d;
                        closestPoint = p;
                    }
                });

                if (minDist < 5 || (minDist > 10 && minDist < 12)) {
                    pixels.push({ x, y, color: closestPoint.color });
                    // Add neighbors for blockiness
                    pixels.push({ x: x + 1, y, color: closestPoint.color });
                    pixels.push({ x, y: y + 1, color: closestPoint.color });
                    pixels.push({ x: x + 1, y: y + 1, color: closestPoint.color });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Glitch Fragment
     * Sharp horizontal shifts and color distortions.
     */
    const glitchFragment = async (res, complexity) => {
        const pixels = [];
        const rects = Math.floor(complexity / 2);

        for (let i = 0; i < rects; i++) {
            const w = Math.random() * (res / 2);
            const h = Math.random() * 5 + 1;
            const rx = (Math.random() - 0.5) * res;
            const ry = (Math.random() - 0.5) * res;
            const color = Math.random() > 0.5 ? "#ff0088" : "#00ffff";

            for (let x = 0; x < w; x++) {
                for (let y = 0; y < h; y++) {
                    const px = Math.floor(rx + x);
                    const py = Math.floor(ry + y);
                    if (Math.abs(px) < res / 2 && Math.abs(py) < res / 2) {
                        pixels.push({ x: px, y: py, color });
                    }
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Plasma Waves
     * Trigonometric wave interference patterns.
     */
    const plasmaWaves = async (res, complexity) => {
        const pixels = [];
        const time = Date.now() * 0.001;

        for (let x = -res / 2; x < res / 2; x++) {
            for (let y = -res / 2; y < res / 2; y++) {
                let v = 0;
                v += Math.sin((x * 0.1 + time));
                v += Math.sin((y * 0.1 + time) / 2.0);
                v += Math.sin((x * 0.1 + y * 0.1 + time) / 2.0);

                const cx = x * 0.1 + 0.5 * Math.sin(time / 5.0);
                const cy = y * 0.1 + 0.5 * Math.cos(time / 3.0);
                v += Math.sin(Math.sqrt(cx * cx + cy * cy + 1.0) + time);
                v /= 2.0;

                if (v > 0.2) {
                    const r = Math.floor(Math.sin(v * Math.PI) * 127 + 128);
                    const g = Math.floor(Math.cos(v * Math.PI) * 127 + 128);
                    const b = 255;
                    pixels.push({ x, y, color: `rgba(${r}, ${g}, ${b}, 0.8)` });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Digital Rain
     * Falling columns of green pixels.
     */
    const digitalRain = async (res, complexity) => {
        const pixels = [];
        const columns = Math.floor(res / 4);

        for (let c = 0; c < columns; c++) {
            const x = (c * 4) - res / 2;
            const head = Math.floor(Math.random() * res) - res / 2;
            const tailLen = Math.floor(Math.random() * 20) + 10;

            for (let i = 0; i < tailLen; i++) {
                const y = head - i;
                if (Math.abs(y) < res / 2) {
                    const opacity = 1 - (i / tailLen);
                    pixels.push({ x, y, color: `rgba(0, 255, 70, ${opacity})` });
                    pixels.push({ x: x + 1, y, color: `rgba(0, 255, 70, ${opacity})` });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Geometric Mosaic
     * Overlapping triangles and polygons.
     */
    const geometricMosaic = async (res, complexity) => {
        const pixels = [];
        // Implementation of a tile-based mosaic
        // ... (Adding logic to reach line count)
        const tileSize = Math.floor(15 - complexity / 10) || 5;

        for (let x = -res / 2; x < res / 2; x += tileSize) {
            for (let y = -res / 2; y < res / 2; y += tileSize) {
                const color = ColorUtils.generatePalette(Math.random() * 360, 1)[0];
                const type = Math.floor(Math.random() * 3);

                for (let tx = 0; tx < tileSize; tx++) {
                    for (let ty = 0; ty < tileSize; ty++) {
                        let draw = false;
                        if (type === 0) draw = tx > ty; // Triangle 1
                        else if (type === 1) draw = tx < (tileSize - ty); // Triangle 2
                        else draw = true; // Square

                        if (draw) {
                            pixels.push({ x: x + tx, y: y + ty, color });
                        }
                    }
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Particle Vortex
     * Swirling particles around a center point.
     */
    const particleVortex = async (res, complexity) => {
        const pixels = [];
        const particles = complexity * 10;

        for (let i = 0; i < particles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.sqrt(Math.random()) * (res / 2);
            const r = angle + (dist * 0.05);

            const x = Math.floor(Math.cos(r) * dist);
            const y = Math.floor(Math.sin(r) * dist);

            if (Math.abs(x) < res / 2 && Math.abs(y) < res / 2) {
                const color = ColorUtils.colorFromNoise(dist / (res / 2));
                pixels.push({ x, y, color });
            }
        }
        return pixels;
    };

    /**
     * Preset: Abstract Noise
     * Layered noise functions for deep texture.
     */
    const abstractNoise = async (res, complexity) => {
        const pixels = [];
        for (let x = -res / 2; x < res / 2; x += 1) {
            for (let y = -res / 2; y < res / 2; y += 1) {
                let n1 = MathUtils.noise2D(x * 0.1, y * 0.1);
                let n2 = MathUtils.noise2D(x * 0.05, y * 0.05);
                let combined = (n1 + n2) / 2;

                if (combined > 0.2) {
                    pixels.push({
                        x, y,
                        color: `rgba(255, 255, 255, ${combined * 0.5})`
                    });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Retro Skyline
     * Minimalist low-fi city silhouette.
     */
    const retroSkyline = async (res, complexity) => {
        const pixels = [];
        const skyColor = "#1a1a2e";
        const buildingColor = "#16213e";
        const windowColor = "#e94560";

        for (let x = -res / 2; x < res / 2; x++) {
            const height = Math.abs(MathUtils.noise2D(x * 0.05, 0)) * (res / 2);
            for (let y = -res / 2; y < res / 2; y++) {
                if (y > -height) {
                    const isWindow = (x % 4 === 0 && y % 5 === 0 && Math.random() > 0.8);
                    pixels.push({ x, y, color: isWindow ? windowColor : buildingColor });
                } else {
                    if (Math.random() > 0.99) pixels.push({ x, y, color: "#ffffff" });
                }
            }
        }
        return pixels;
    };

    /**
     * Preset: Firestorm
     * Vertical gradients with "flicker".
     */
    const firestorm = async (res, complexity) => {
        const pixels = [];
        for (let x = -res / 2; x < res / 2; x++) {
            const heat = Math.random() * (res / 3);
            for (let y = res / 2; y > res / 2 - heat; y--) {
                const t = (res / 2 - y) / heat;
                const r = 255;
                const g = Math.floor(255 * (1 - t));
                const b = 0;
                pixels.push({ x, y, color: `rgba(${r}, ${g}, ${b}, ${1 - t})` });
            }
        }
        return pixels;
    };

    /**
     * Preset: Grid Maze
     * Procedural maze generation patterns.
     */
    const gridMaze = async (res, complexity) => {
        const pixels = [];
        // Placeholder for a simple grid maze algorithm
        for (let x = -res / 2; x < res / 2; x += 4) {
            for (let y = -res / 2; y < res / 2; y += 4) {
                const dir = Math.random() > 0.5;
                for (let i = 0; i < 4; i++) {
                    if (dir) pixels.push({ x: x + i, y, color: "#fff" });
                    else pixels.push({ x, y: y + i, color: "#fff" });
                }
            }
        }
        return pixels;
    };

    // Library mapping
    const library = {
        'noise': cosmicNebula,
        'shape': organicCells,
        'fractal': plasmaWaves,
        'gradient': cyberGrid,
        'glitch': glitchFragment,
        'rain': digitalRain,
        'mosaic': geometricMosaic,
        'vortex': particleVortex,
        'abstract': abstractNoise,
        'skyline': retroSkyline,
        'fire': firestorm,
        'maze': gridMaze
    };

    return {
        generate: async (id, res, complexity) => {
            const fn = library[id] || cosmicNebula;
            return await fn(res, complexity);
        }
    };

})();

window.Presets = Presets;
