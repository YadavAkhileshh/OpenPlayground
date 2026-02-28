// scene.js
class Scene3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width = window.innerWidth;
        this.height = canvas.height = window.innerHeight;
        
        console.log('Canvas size:', this.width, 'x', this.height);
        
        this.camera = {
            x: 0,
            y: 0,
            z: 1000,
            rotationX: 0.4,
            rotationY: 0.5,
            rotationZ: 0,
            fov: 700
        };
        
        this.mouse = {
            x: 0,
            y: 0,
            isDragging: false,
            isRotating: false,
            isPanning: false,
            draggedNode: null,
            lastX: 0,
            lastY: 0
        };
        
        this.zoom = 1;
        this.pan = { x: 0, y: 0 };
        this.backgroundColor = '#020408';
        this.gridSize = 200;
        this.stars = [];
        this.hoveredNode = null;
        this.selectedNode = null;
        
        this.initStars();
        this.setupEventListeners();
    }
    
    initStars() {
        this.stars = [];
        for (let i = 0; i < 500; i++) {
            this.stars.push({
                x: (Math.random() - 0.5) * 6000,
                y: (Math.random() - 0.5) * 6000,
                z: (Math.random() - 0.5) * 4000,
                size: Math.random() * 2.5 + 0.3,
                opacity: Math.random() * 0.9 + 0.1
            });
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        window.addEventListener('mouseup', (e) => this.onMouseUp(e));
        window.addEventListener('resize', () => this.onResize());
    }
    
    onMouseDown(e) {
        e.preventDefault();
        this.mouse.lastX = e.clientX;
        this.mouse.lastY = e.clientY;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        if (e.button === 0) {
            this.mouse.isDragging = true;
            this.mouse.draggedNode = this.hoveredNode;
            if (!this.hoveredNode) {
                this.mouse.isRotating = true;
                this.canvas.classList.add('rotating');
            } else {
                this.canvas.classList.add('dragging');
            }
        } else if (e.button === 2) {
            this.mouse.isRotating = true;
            this.canvas.classList.add('rotating');
        } else if (e.button === 1) {
            this.mouse.isPanning = true;
            this.canvas.classList.add('panning');
        }
    }
    
    onMouseMove(e) {
        e.preventDefault();
        
        const dx = e.clientX - this.mouse.lastX;
        const dy = e.clientY - this.mouse.lastY;
        
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        if (this.mouse.isRotating) {
            this.camera.rotationY += dx * 0.01;
            this.camera.rotationX += dy * 0.01;
            this.camera.rotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.camera.rotationX));
            this.mouse.lastX = e.clientX;
            this.mouse.lastY = e.clientY;
        }
        
        if (this.mouse.isPanning) {
            this.pan.x += dx;
            this.pan.y += dy;
            this.mouse.lastX = e.clientX;
            this.mouse.lastY = e.clientY;
        }
    }
    
    onMouseUp(e) {
        e.preventDefault();
        this.mouse.isDragging = false;
        this.mouse.isRotating = false;
        this.mouse.isPanning = false;
        this.mouse.draggedNode = null;
        this.canvas.classList.remove('dragging', 'rotating', 'panning');
    }
    
    onWheel(e) {
        e.preventDefault();
        const zoomFactor = 0.1;
        const delta = e.deltaY > 0 ? (1 - zoomFactor) : (1 + zoomFactor);
        this.zoom *= delta;
        this.zoom = Math.max(0.2, Math.min(8, this.zoom));
    }
    
    onResize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }
    
    project(x, y, z) {
        const cosX = Math.cos(this.camera.rotationX);
        const sinX = Math.sin(this.camera.rotationX);
        const cosY = Math.cos(this.camera.rotationY);
        const sinY = Math.sin(this.camera.rotationY);
        
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;
        
        let x1 = x * cosY + z1 * sinY;
        let z2 = -x * sinY + z1 * cosY;
        
        const distance = this.camera.z + z2;
        const scale = this.camera.fov / Math.max(1, distance);
        
        const projectedX = x1 * scale * this.zoom + this.width / 2 + this.pan.x;
        const projectedY = y1 * scale * this.zoom + this.height / 2 + this.pan.y;
        
        const isVisible = distance > 50 && distance < 5000 && scale > 0;
        
        return {
            x: projectedX,
            y: projectedY,
            scale: scale,
            depth: distance,
            visible: isVisible
        };
    }
    
    unproject(screenX, screenY, targetZ) {
        const x = (screenX - this.width / 2 - this.pan.x) / this.zoom;
        const y = (screenY - this.height / 2 - this.pan.y) / this.zoom;
        
        const distance = this.camera.z + targetZ;
        const scale = this.camera.fov / Math.max(1, distance);
        
        const x1 = x / scale;
        const y1 = y / scale;
        
        const cosX = Math.cos(this.camera.rotationX);
        const sinX = Math.sin(this.camera.rotationX);
        const cosY = Math.cos(this.camera.rotationY);
        const sinY = Math.sin(this.camera.rotationY);
        
        const z2 = targetZ;
        const z1 = (x1 * sinY + z2) / cosY;
        const worldZ = z1 * cosX - y1 * sinX;
        const worldY = (y1 + worldZ * sinX) / cosX;
        const worldX = (x1 - z1 * sinY) / cosY;
        
        return { x: worldX, y: worldY, z: targetZ };
    }
    
    clear() {
        const grad = this.ctx.createRadialGradient(
            this.width/2, this.height/2, 0,
            this.width/2, this.height/2, Math.max(this.width, this.height)
        );
        grad.addColorStop(0, '#0f1a2e');
        grad.addColorStop(0.5, '#06080f');
        grad.addColorStop(1, '#020408');
        
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawGrid() {
        const ctx = this.ctx;
        const gridSpacing = 150;
        const gridRange = 1500;
        
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
        ctx.lineWidth = 1;
        
        for (let x = -gridRange; x <= gridRange; x += gridSpacing) {
            for (let z = -gridRange; z <= gridRange; z += gridSpacing) {
                const p1 = this.project(x, 0, z);
                const p2 = this.project(x + gridSpacing, 0, z);
                const p3 = this.project(x, 0, z + gridSpacing);
                
                if (p1.visible && p2.visible) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
                
                if (p1.visible && p3.visible) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.stroke();
                }
            }
        }
    }
    
    drawStars() {
        const ctx = this.ctx;
        
        this.stars.forEach(star => {
            const projected = this.project(star.x, star.y, star.z);
            
            if (projected.visible && projected.scale > 0) {
                const brightness = star.opacity * Math.min(1, projected.scale * 2);
                const twinkle = 0.7 + Math.sin(Date.now() * 0.001 + star.x) * 0.3;
                
                ctx.fillStyle = `rgba(200, 220, 255, ${brightness * twinkle})`;
                ctx.beginPath();
                ctx.arc(projected.x, projected.y, star.size * projected.scale * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    
    beginFrame() {
        this.clear();
        this.drawStars();
        this.drawGrid();
    }

    drawConnectionProjected(projFrom, projTo, color, originalWidth, isHovered, congestion) {
        if (!projFrom.visible || !projTo.visible) return;

        const ctx = this.ctx;
        
        const avgDepth = (projFrom.depth + projTo.depth) / 2;
        const depthFactor = Math.max(0, 1 - avgDepth / 2500);
        const depthAlpha = Math.max(0.2, Math.min(0.9, depthFactor * 1.1));
        const depthBlur = (1 - depthFactor) * 4;
        
        const gradient = ctx.createLinearGradient(projFrom.x, projFrom.y, projTo.x, projTo.y);
        gradient.addColorStop(0, this.hexToRgba(color, depthAlpha * 0.8));
        gradient.addColorStop(0.5, this.hexToRgba(color, depthAlpha * 0.3));
        gradient.addColorStop(1, this.hexToRgba(color, depthAlpha * 0.8));

        const avgScale = (projFrom.scale + projTo.scale) / 2;
        const lineWidth = originalWidth * avgScale * (isHovered ? 1.8 : 1);
        
        ctx.filter = depthBlur > 0 ? `blur(${depthBlur}px)` : 'none';
        ctx.strokeStyle = isHovered ? this.hexToRgba('#ffffff', depthAlpha) : gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(projFrom.x, projFrom.y);
        ctx.lineTo(projTo.x, projTo.y);
        ctx.stroke();

        if (isHovered || congestion > 0.5) {
            ctx.shadowBlur = 15 * avgScale;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        
        ctx.filter = 'none';
    }

    drawNodeProjected(proj, radius, color, label, state, isSelected, isHovered, queueLength) {
        if (!proj.visible) return;

        const ctx = this.ctx;
        const screenRadius = radius * proj.scale * this.zoom;
        const depthFactor = Math.max(0, 1 - proj.depth / 2500);
        const alpha = Math.max(0.4, Math.min(1, depthFactor * 1.2));
        const depthBlur = (1 - depthFactor) * 3;

        let stateColor = '#00ff9d';
        if (state === 'congested') stateColor = '#ffaa00';
        if (state === 'overloaded') stateColor = '#ff5500';
        if (state === 'failed') stateColor = '#ff0055';
        
        const glowRadius = screenRadius * (isSelected || isHovered ? 1.8 : 1.3);
        
        ctx.filter = depthBlur > 0 ? `blur(${depthBlur}px)` : 'none';
        
        const glow = ctx.createRadialGradient(
            proj.x, proj.y, screenRadius * 0.3,
            proj.x, proj.y, glowRadius * 2.5
        );
        glow.addColorStop(0, this.hexToRgba(stateColor, alpha * 0.8));
        glow.addColorStop(0.5, this.hexToRgba(stateColor, alpha * 0.3));
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, glowRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();

        const sphereGrad = ctx.createRadialGradient(
            proj.x - screenRadius * 0.35, proj.y - screenRadius * 0.35, 0,
            proj.x, proj.y, screenRadius * 1.2
        );
        sphereGrad.addColorStop(0, this.hexToRgba('#ffffff', alpha));
        sphereGrad.addColorStop(0.3, this.hexToRgba(color, alpha));
        sphereGrad.addColorStop(1, this.hexToRgba('#000000', alpha * 0.9));

        ctx.fillStyle = sphereGrad;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, screenRadius, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected || isHovered) {
            ctx.strokeStyle = this.hexToRgba('#ffffff', alpha);
            ctx.lineWidth = 3 * proj.scale;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, screenRadius + 5 * proj.scale, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        ctx.filter = 'none';

        if (screenRadius > 8) {
            ctx.fillStyle = this.hexToRgba('#ffffff', alpha * 0.95);
            ctx.font = `600 ${Math.max(10, 12 * proj.scale * this.zoom)}px 'Inter', sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, proj.x, proj.y);
        }

        if (queueLength > 0 && screenRadius > 5) {
            const qSize = Math.max(3, 5 * proj.scale * this.zoom);
            const maxDots = Math.min(queueLength, 8);
            for (let i = 0; i < maxDots; i++) {
                ctx.fillStyle = this.hexToRgba(stateColor, alpha * 0.8);
                ctx.shadowBlur = 5;
                ctx.shadowColor = stateColor;
                ctx.beginPath();
                ctx.arc(proj.x + (screenRadius + 8 + i * 7) * proj.scale, proj.y - screenRadius, qSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    drawPacketProjected(proj, size, color) {
        if (!proj.visible) return;

        const ctx = this.ctx;
        const packetSize = size * proj.scale * this.zoom;
        const depthFactor = Math.max(0, 1 - proj.depth / 3000);
        const alpha = Math.max(0.6, depthFactor);
        
        const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, packetSize * 3);
        gradient.addColorStop(0, this.hexToRgba('#ffffff', alpha));
        gradient.addColorStop(0.3, this.hexToRgba(color, alpha));
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15 * proj.scale;
        ctx.shadowColor = color;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, packetSize * 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.hexToRgba('#ffffff', alpha);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, packetSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = this.hexToRgba(color, alpha * 0.9);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, packetSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }

    isPointInNode(proj, mouseX, mouseY) {
        if (!proj) return false;
        const dx = mouseX - proj.x;
        const dy = mouseY - proj.y;
        return (dx * dx + dy * dy) <= (proj.screenRadius * proj.screenRadius);
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}
