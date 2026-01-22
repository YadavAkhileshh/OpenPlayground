// world.js
class World {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.camera = {
            x: 0,
            y: 0,
            z: 300,
            rotX: 0.3,
            rotY: 0.3,
            distance: 300
        };

        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.hoveredOrganism = null;
        this.mouseX = 0;
        this.mouseY = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });

        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const dx = e.clientX - this.lastMouseX;
                const dy = e.clientY - this.lastMouseY;
                
                this.camera.rotY += dx * 0.005;
                this.camera.rotX += dy * 0.005;
                
                this.camera.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotX));
                
                this.lastMouseX = e.clientX;
                this.lastMouseY = e.clientY;
            }
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.distance += e.deltaY * 0.5;
            this.camera.distance = Math.max(100, Math.min(800, this.camera.distance));
        });
        
        this.canvas.addEventListener('click', (e) => {
            if (this.hoveredOrganism) {
                this.hoveredOrganism.feed(30);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.isDragging) {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            }
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    project(x, y, z) {
        const cosX = Math.cos(this.camera.rotX);
        const sinX = Math.sin(this.camera.rotX);
        const cosY = Math.cos(this.camera.rotY);
        const sinY = Math.sin(this.camera.rotY);

        let tempZ = z * cosX - y * sinX;
        let rotY = y * cosX + z * sinX;
        
        let rotX = x * cosY - tempZ * sinY;
        let rotZ = tempZ * cosY + x * sinY;

        rotZ += this.camera.distance;

        if (rotZ <= 0) rotZ = 0.1;

        const scale = 400 / rotZ;
        const projX = rotX * scale + this.width / 2;
        const projY = rotY * scale + this.height / 2;

        return { x: projX, y: projY, scale: scale, depth: rotZ };
    }

    clear() {
        this.ctx.fillStyle = 'rgba(10, 10, 20, 0.3)';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    drawGrid() {
        const gridSize = 50;
        const gridRange = 200;
        
        this.ctx.strokeStyle = 'rgba(79, 195, 247, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = -gridRange; i <= gridRange; i += gridSize) {
            const p1 = this.project(i, -gridRange, 0);
            const p2 = this.project(i, gridRange, 0);
            
            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.stroke();

            const p3 = this.project(-gridRange, i, 0);
            const p4 = this.project(gridRange, i, 0);
            
            this.ctx.beginPath();
            this.ctx.moveTo(p3.x, p3.y);
            this.ctx.lineTo(p4.x, p4.y);
            this.ctx.stroke();
        }
    }

    drawOrganism(organism) {
        const pos = this.project(organism.x, organism.y, organism.z);
        const pulseSize = organism.getPulseSize() * pos.scale;
        
        // Check if mouse is hovering over organism
        const distance = Math.sqrt((pos.x - this.mouseX) ** 2 + (pos.y - this.mouseY) ** 2);
        organism.isHovered = distance < pulseSize;
        
        if (organism.isHovered && !this.isDragging) {
            this.hoveredOrganism = organism;
            this.canvas.style.cursor = 'pointer';
        }
        
        // Enhanced glow effect
        const glowSize = pulseSize + (organism.glowIntensity * 10 * pos.scale);
        if (organism.glowIntensity > 0 || organism.isHovered) {
            this.ctx.shadowBlur = 15 + organism.glowIntensity * 20;
            this.ctx.shadowColor = organism.color;
        }

        const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowSize);
        gradient.addColorStop(0, organism.color);
        gradient.addColorStop(0.5, organism.color);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Pulsating outer ring
        const ringAlpha = 0.5 + Math.sin(organism.pulsePhase) * 0.3;
        this.ctx.strokeStyle = organism.color.replace('hsl', 'hsla').replace(')', `, ${ringAlpha})`);
        this.ctx.lineWidth = organism.isHovered ? 3 : 2;
        this.ctx.stroke();
        
        // Core sphere
        const coreGradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pulseSize * 0.6);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(pos.x, pos.y, pulseSize * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Draw info tooltip on hover
        if (organism.isHovered) {
            this.drawOrganismInfo(organism, pos);
        }
    }

    drawTrail(organism) {
        if (organism.trail.length < 2) return;

        this.ctx.strokeStyle = organism.color;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;

        this.ctx.beginPath();
        const firstPos = this.project(organism.trail[0].x, organism.trail[0].y, organism.trail[0].z);
        this.ctx.moveTo(firstPos.x, firstPos.y);

        for (let i = 1; i < organism.trail.length; i++) {
            const pos = this.project(organism.trail[i].x, organism.trail[i].y, organism.trail[i].z);
            this.ctx.lineTo(pos.x, pos.y);
        }

        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawOrganismInfo(organism, pos) {
        const padding = 10;
        const lineHeight = 16;
        const text = [
            `Energy: ${Math.round(organism.energy)}/${organism.maxEnergy}`,
            `Age: ${Math.round(organism.age)}`,
            `Gen: ${organism.generation}`,
            `Click to feed!`
        ];
        
        const maxWidth = Math.max(...text.map(t => this.ctx.measureText(t).width));
        const boxWidth = maxWidth + padding * 2;
        const boxHeight = text.length * lineHeight + padding * 2;
        
        let infoX = pos.x + 20;
        let infoY = pos.y - boxHeight / 2;
        
        // Keep info box on screen
        if (infoX + boxWidth > this.width) infoX = pos.x - boxWidth - 20;
        if (infoY < 0) infoY = 0;
        if (infoY + boxHeight > this.height) infoY = this.height - boxHeight;
        
        // Draw box
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(infoX, infoY, boxWidth, boxHeight);
        this.ctx.strokeStyle = organism.color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(infoX, infoY, boxWidth, boxHeight);
        
        // Draw text
        this.ctx.fillStyle = organism.color;
        this.ctx.font = '12px monospace';
        text.forEach((line, i) => {
            this.ctx.fillText(line, infoX + padding, infoY + padding + (i + 1) * lineHeight);
        });
    }

    render(organisms, showTrails) {
        this.clear();
        this.drawGrid();
        
        this.hoveredOrganism = null;
        this.canvas.style.cursor = this.isDragging ? 'grabbing' : 'grab';

        const sorted = organisms.slice().sort((a, b) => {
            const depthA = this.project(a.x, a.y, a.z).depth;
            const depthB = this.project(b.x, b.y, b.z).depth;
            return depthB - depthA;
        });

        if (showTrails) {
            sorted.forEach(organism => this.drawTrail(organism));
        }

        sorted.forEach(organism => this.drawOrganism(organism));
    }
}