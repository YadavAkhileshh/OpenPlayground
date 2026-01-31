/**
 * Renderer.js - Terrain Visualization
 * Handles canvas rendering with multiple color schemes and 3D projection
 */

class TerrainRenderer {
    constructor(canvas, terrain) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.terrain = terrain;
        
        // Rendering settings
        this.colorScheme = 'realistic';
        this.showRivers = true;
        this.show3D = false;
        
        // Color palettes
        this.setupColorPalettes();
        
        // Animation
        this.animationFrame = null;
        
        // Initialize canvas size
        this.updateCanvasSize();
    }

    /**
     * Setup color palettes for different visualization modes
     */
    setupColorPalettes() {
        this.palettes = {
            realistic: [
                { stop: 0.0, color: [28, 107, 160] },    // Deep water
                { stop: 0.15, color: [40, 140, 200] },   // Shallow water
                { stop: 0.2, color: [194, 178, 128] },   // Beach
                { stop: 0.3, color: [85, 130, 60] },     // Lowland
                { stop: 0.45, color: [100, 150, 80] },   // Grass
                { stop: 0.6, color: [120, 120, 100] },   // Hills
                { stop: 0.75, color: [140, 140, 140] },  // Mountain
                { stop: 0.9, color: [200, 200, 200] },   // High mountain
                { stop: 1.0, color: [255, 255, 255] }    // Snow
            ],
            heightmap: [
                { stop: 0.0, color: [0, 0, 0] },
                { stop: 0.25, color: [85, 0, 0] },
                { stop: 0.5, color: [170, 85, 0] },
                { stop: 0.75, color: [255, 170, 0] },
                { stop: 1.0, color: [255, 255, 255] }
            ],
            erosion: [
                { stop: 0.0, color: [50, 0, 100] },
                { stop: 0.5, color: [150, 50, 150] },
                { stop: 1.0, color: [255, 200, 255] }
            ],
            water: [
                { stop: 0.0, color: [139, 90, 43] },     // Dry land
                { stop: 0.3, color: [100, 140, 80] },    // Moderate
                { stop: 0.6, color: [40, 140, 200] },    // Wet
                { stop: 1.0, color: [0, 100, 255] }      // Very wet
            ]
        };
    }

    /**
     * Update canvas size to match container
     */
    updateCanvasSize() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 32, container.clientHeight - 32, 800);
        this.canvas.width = size;
        this.canvas.height = size;
    }

    /**
     * Interpolate between colors in a palette
     */
    getColorFromPalette(value, paletteName) {
        const palette = this.palettes[paletteName] || this.palettes.realistic;
        value = Math.max(0, Math.min(1, value));

        // Find the two stops to interpolate between
        let lowerStop = palette[0];
        let upperStop = palette[palette.length - 1];

        for (let i = 0; i < palette.length - 1; i++) {
            if (value >= palette[i].stop && value <= palette[i + 1].stop) {
                lowerStop = palette[i];
                upperStop = palette[i + 1];
                break;
            }
        }

        // Interpolate
        const range = upperStop.stop - lowerStop.stop;
        const t = range === 0 ? 0 : (value - lowerStop.stop) / range;

        const r = Math.round(lowerStop.color[0] + (upperStop.color[0] - lowerStop.color[0]) * t);
        const g = Math.round(lowerStop.color[1] + (upperStop.color[1] - lowerStop.color[1]) * t);
        const b = Math.round(lowerStop.color[2] + (upperStop.color[2] - lowerStop.color[2]) * t);

        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Apply shading based on slope
     */
    calculateShading(x, y) {
        const size = this.terrain.size;
        if (x <= 0 || x >= size - 1 || y <= 0 || y >= size - 1) {
            return 1;
        }

        const h = this.terrain.getHeight(x, y);
        const hx = this.terrain.getHeight(x + 1, y) - this.terrain.getHeight(x - 1, y);
        const hy = this.terrain.getHeight(x, y + 1) - this.terrain.getHeight(x, y - 1);

        // Calculate normal vector
        const nx = -hx;
        const ny = -hy;
        const nz = 2;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

        // Light direction (from top-left)
        const lx = -0.5;
        const ly = -0.5;
        const lz = 1;
        const llen = Math.sqrt(lx * lx + ly * ly + lz * lz);

        // Dot product for lighting
        const dot = (nx * lx + ny * ly + nz * lz) / (len * llen);
        
        // Map to 0.5 - 1.5 range for subtle shading
        return 0.5 + dot * 0.5;
    }

    /**
     * Render terrain in 2D (top-down view)
     */
    render2D() {
        const size = this.terrain.size;
        const cellWidth = this.canvas.width / size;
        const cellHeight = this.canvas.height / size;

        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render each cell
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                let value;
                
                // Get value based on color scheme
                switch (this.colorScheme) {
                    case 'heightmap':
                        value = this.terrain.heightmap[y][x];
                        break;
                    case 'erosion':
                        value = Math.abs(this.terrain.originalHeightmap[y][x] - this.terrain.heightmap[y][x]) * 5;
                        value = Math.min(1, value);
                        break;
                    case 'water':
                        value = Math.min(1, this.terrain.waterMap[y][x] * 2);
                        break;
                    default: // realistic
                        value = this.terrain.heightmap[y][x];
                        break;
                }

                // Get base color
                let color = this.getColorFromPalette(value, this.colorScheme);

                // Apply shading for realistic mode
                if (this.colorScheme === 'realistic') {
                    const shading = this.calculateShading(x, y);
                    const rgb = color.match(/\d+/g);
                    const r = Math.round(parseInt(rgb[0]) * shading);
                    const g = Math.round(parseInt(rgb[1]) * shading);
                    const b = Math.round(parseInt(rgb[2]) * shading);
                    color = `rgb(${r}, ${g}, ${b})`;
                }

                // Draw cell
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    Math.floor(x * cellWidth),
                    Math.floor(y * cellHeight),
                    Math.ceil(cellWidth) + 1,
                    Math.ceil(cellHeight) + 1
                );
            }
        }

        // Overlay water flow if enabled
        if (this.showRivers && this.colorScheme !== 'water') {
            this.renderWaterOverlay(cellWidth, cellHeight);
        }
    }

    /**
     * Render water overlay
     */
    renderWaterOverlay(cellWidth, cellHeight) {
        const size = this.terrain.size;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const water = this.terrain.waterMap[y][x];
                if (water > 0.05) {
                    const alpha = Math.min(0.7, water * 0.5);
                    this.ctx.fillStyle = `rgba(0, 150, 255, ${alpha})`;
                    this.ctx.fillRect(
                        Math.floor(x * cellWidth),
                        Math.floor(y * cellHeight),
                        Math.ceil(cellWidth) + 1,
                        Math.ceil(cellHeight) + 1
                    );
                }
            }
        }
    }

    /**
     * Render terrain in 3D isometric view
     */
    render3D() {
        const size = this.terrain.size;
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Isometric projection parameters
        const scale = this.canvas.width / (size * 1.5);
        const heightScale = 100;
        const offsetX = this.canvas.width / 2;
        const offsetY = this.canvas.height / 4;

        // Create array of points with depth for sorting
        const points = [];
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const height = this.terrain.heightmap[y][x];
                
                // Isometric projection
                const isoX = (x - y) * scale + offsetX;
                const isoY = (x + y) * scale / 2 - height * heightScale + offsetY;
                const depth = x + y; // For sorting

                points.push({
                    x: isoX,
                    y: isoY,
                    gridX: x,
                    gridY: y,
                    height: height,
                    depth: depth
                });
            }
        }

        // Sort by depth (back to front)
        points.sort((a, b) => a.depth - b.depth);

        // Render points
        const pointSize = Math.max(1, scale * 0.8);
        
        for (const point of points) {
            let value = point.height;
            
            // Adjust value based on color scheme
            if (this.colorScheme === 'water') {
                value = Math.min(1, this.terrain.waterMap[point.gridY][point.gridX] * 2);
            }

            const color = this.getColorFromPalette(value, this.colorScheme);
            
            // Apply shading
            const shading = this.calculateShading(point.gridX, point.gridY);
            const rgb = color.match(/\d+/g);
            const r = Math.round(parseInt(rgb[0]) * shading);
            const g = Math.round(parseInt(rgb[1]) * shading);
            const b = Math.round(parseInt(rgb[2]) * shading);

            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(
                Math.floor(point.x),
                Math.floor(point.y),
                Math.ceil(pointSize) + 1,
                Math.ceil(pointSize) + 1
            );
        }
    }

    /**
     * Main render function
     */
    render() {
        if (this.show3D) {
            this.render3D();
        } else {
            this.render2D();
        }
    }

    /**
     * Set color scheme
     */
    setColorScheme(scheme) {
        this.colorScheme = scheme;
        this.render();
    }

    /**
     * Toggle river display
     */
    setShowRivers(show) {
        this.showRivers = show;
        this.render();
    }

    /**
     * Toggle 3D view
     */
    setShow3D(show) {
        this.show3D = show;
        this.render();
    }

    /**
     * Start animation loop
     */
    startAnimation(callback) {
        const animate = () => {
            callback();
            this.render();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * Stop animation loop
     */
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.updateCanvasSize();
        this.render();
    }
}
