/**
 * Renderer Class
 * Handles all canvas drawing operations.
 */
class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.camera = new Vector2(0, 0); // Camera position
        this.zoom = 1.0;

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    clear() {
        this.ctx.fillStyle = '#0d0d12'; // Clear color
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Main render loop
     * @param {Terrain} terrain 
     * @param {Robot} robot 
     */
    render(terrain, robot) {
        this.clear();

        this.ctx.save();

        // Setup camera transform
        // Center the view on the robot if it exists, otherwise 0,0
        const camX = robot ? robot.position.x : 0;
        const camY = robot ? robot.position.y : 0;

        // Translate to center of screen
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        // Translate against camera position
        this.ctx.translate(-camX, -camY + 100); // +100 to push ground down a bit

        // Draw Grid
        this.drawGrid(camX, camY);

        // Draw Terrain
        this.drawTerrain(terrain, camX - (this.width / 2 / this.zoom), camX + (this.width / 2 / this.zoom));

        // Draw Robot
        if (robot) {
            this.drawRobot(robot);
        }

        this.ctx.restore();
    }

    drawGrid(camX, camY) {
        this.ctx.strokeStyle = '#222233';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();

        const gridSize = 100;
        const startX = Math.floor((camX - this.width / 2) / gridSize) * gridSize;
        const endX = Math.ceil((camX + this.width / 2) / gridSize) * gridSize;
        const startY = Math.floor((camY - this.height / 2) / gridSize) * gridSize;
        const endY = Math.ceil((camY + this.height / 2) / gridSize) * gridSize;

        for (let x = startX; x <= endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }
        this.ctx.stroke();
    }

    drawTerrain(terrain, minX, maxX) {
        this.ctx.strokeStyle = '#00ffaa';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        const step = 5; // Resolution
        // Since we are transformed, we draw relative to world coordinate 0
        // But we only want to draw visible segment

        for (let x = minX - 100; x <= maxX + 100; x += step) {
            const h = terrain.getHeight(x);
            // Height is positive upwards in standard math, but canvas Y is down.
            // Let's assume ground is at Y=0 + h.
            // If terrain returns +50, that's "up" visually, so -50 in canvas Y?
            // Or "down" visually? Terrain usually implies ground level.
            // Let's assume positive Y is DOWN (canvas standard).
            // So ground at +50 is lower on screen.
            this.ctx.lineTo(x, h);
        }

        this.ctx.stroke();

        // Fill below
        this.ctx.lineTo(maxX + 100, 1000); // Deep down
        this.ctx.lineTo(minX - 100, 1000);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(0, 255, 170, 0.05)';
        this.ctx.fill();
    }

    drawRobot(robot) {
        // Draw Body
        this.ctx.fillStyle = '#222';
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.arc(robot.position.x, robot.position.y, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        robot.legs.forEach(leg => {
            this.drawLeg(leg);
        });
    }

    drawLeg(leg) {
        // Leg is a chain of Vector2 points
        this.ctx.beginPath();
        this.ctx.moveTo(leg.joints[0].x, leg.joints[0].y);
        for (let i = 1; i < leg.joints.length; i++) {
            this.ctx.lineTo(leg.joints[i].x, leg.joints[i].y);
        }
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();

        // Draw joints
        this.ctx.fillStyle = '#00ffaa';
        leg.joints.forEach(j => {
            this.ctx.beginPath();
            this.ctx.arc(j.x, j.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
}
