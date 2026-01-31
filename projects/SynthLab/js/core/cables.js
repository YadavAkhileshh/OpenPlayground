/**
 * Cable Manager & Canvas Renderer
 * Handles physics simulation (Bezier curves) and connection logic.
 */
export class CableManager {
    constructor(canvasId, rackId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.rack = document.getElementById(rackId);
        
        this.connections = []; // { from: JackID, to: JackID, color: string }
        this.dragState = null; // { startJack: ID, x: num, y: num }
        
        // Resize observer
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Animation Loop
        this.animate();
    }

    resize() {
        this.canvas.width = this.rack.offsetWidth;
        this.canvas.height = this.rack.offsetHeight;
    }

    startDrag(jackId, x, y, type) {
        this.dragState = {
            startJack: jackId,
            type: type, // 'input' or 'output'
            x: x,
            y: y,
            color: this.getRandomColor()
        };
    }

    updateDrag(x, y) {
        if (this.dragState) {
            // Offset coordinates relative to canvas
            const rect = this.canvas.getBoundingClientRect();
            this.dragState.x = x - rect.left;
            this.dragState.y = y - rect.top;
        }
    }

    endDrag(endJackId, type) {
        if (!this.dragState) return null;

        // Validation: Must connect Output -> Input
        if (endJackId && type !== this.dragState.type) {
            // Success connection
            const connection = {
                id: Date.now(),
                from: this.dragState.type === 'output' ? this.dragState.startJack : endJackId,
                to: this.dragState.type === 'input' ? this.dragState.startJack : endJackId,
                color: this.dragState.color
            };
            this.connections.push(connection);
            this.dragState = null;
            return connection;
        }

        // Cancel drag
        this.dragState = null;
        return null;
    }

    removeConnection(connId) {
        this.connections = this.connections.filter(c => c.id !== connId);
    }

    getJackPosition(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        return {
            x: (rect.left + rect.width / 2) - canvasRect.left,
            y: (rect.top + rect.height / 2) - canvasRect.top
        };
    }

    getRandomColor() {
        const colors = ['#e91e63', '#9c27b0', '#2196f3', '#00bcd4', '#4caf50', '#ffeb3b', '#ff9800'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw active connections
        this.connections.forEach(conn => {
            const start = this.getJackPosition(conn.from);
            const end = this.getJackPosition(conn.to);
            if (start && end) {
                this.drawCable(start, end, conn.color);
            }
        });

        // Draw dragging cable
        if (this.dragState) {
            const start = this.getJackPosition(this.dragState.startJack);
            if (start) {
                this.drawCable(start, { x: this.dragState.x, y: this.dragState.y }, this.dragState.color, true);
            }
        }

        requestAnimationFrame(() => this.animate());
    }

    drawCable(p1, p2, color, isDragging = false) {
        this.ctx.beginPath();
        
        // Physics Simulation: Sag based on distance
        const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
        const sag = Math.min(dist * 0.5, 300); // Max sag limit

        this.ctx.moveTo(p1.x, p1.y);
        
        // Bezier Curve
        // CP1 (Control Point 1) goes down
        // CP2 goes down
        this.ctx.bezierCurveTo(
            p1.x, p1.y + sag,
            p2.x, p2.y + sag,
            p2.x, p2.y
        );

        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.lineCap = 'round';
        
        // Shadow
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetY = 5;
        
        this.ctx.stroke();
        
        // Reset Shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetY = 0;

        // Connector ends
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(p1.x, p1.y, 6, 0, Math.PI*2);
        this.ctx.arc(p2.x, p2.y, 6, 0, Math.PI*2);
        this.ctx.fill();
    }
}