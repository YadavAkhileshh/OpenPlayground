/**
 * Rendering System
 */
export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth;
        this.canvas.height = parent.clientHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    render(scene, rays) {
        this.clear();
        scene.forEach(comp => this.drawComponent(comp));
        this.drawRays(rays);
    }

    drawComponent(comp) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(comp.position.x, comp.position.y);
        ctx.rotate(comp.rotation);

        const w = comp.width;
        const h = comp.height;

        if (comp.selected) {
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
            ctx.shadowBlur = 0;
        }

        switch (comp.type) {
            case 'laser':
                ctx.fillStyle = '#333';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.fillStyle = comp.isOn ? comp.color : '#550000';
                ctx.fillRect(w / 2 - 5, -5, 5, 10);
                break;

            case 'mirror':
                ctx.fillStyle = '#4a5568';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.fillStyle = '#a0aec0';
                ctx.fillRect(-w / 2, -2, w, 4);
                break;

            case 'splitter':
                ctx.strokeStyle = '#a0aec0';
                ctx.lineWidth = 2;
                ctx.strokeRect(-w / 2, -h / 2, w, h);
                ctx.beginPath();
                ctx.moveTo(-w / 2, -h / 2);
                ctx.lineTo(w / 2, h / 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.stroke();
                break;

            case 'sensor':
                ctx.fillStyle = comp.isLit ? '#2aff2a' : '#1a202c';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeStyle = '#48bb78';
                ctx.lineWidth = 2;
                ctx.strokeRect(-w / 2, -h / 2, w, h);
                if (comp.portId !== undefined) return; // Don't draw label for ports
                ctx.fillStyle = '#fff';
                ctx.font = '10px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('S', 0, 4);
                break;

            case 'gate':
                ctx.fillStyle = '#2d3748';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.strokeStyle = '#a0aec0';
                ctx.lineWidth = 2;
                ctx.strokeRect(-w / 2, -h / 2, w, h);

                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(comp.op, 0, 4);

                const inY = h / 4;
                ctx.fillStyle = comp.inputState[0] ? '#2aff2a' : '#4a5568';
                ctx.fillRect(-w / 2 - 4, -inY - 3, 4, 6); // Input A

                if (comp.op !== 'NOT') {
                    ctx.fillStyle = comp.inputState[1] ? '#2aff2a' : '#4a5568';
                    ctx.fillRect(-w / 2 - 4, inY - 3, 4, 6); // Input B
                }

                // Logic check for display
                let active = false;
                const a = comp.inputState[0];
                const b = comp.inputState[1];
                switch (comp.op) {
                    case 'AND': active = a && b; break;
                    case 'OR': active = a || b; break;
                    case 'NOT': active = !a; break;
                    case 'NAND': active = !(a && b); break;
                }

                ctx.fillStyle = active ? '#2aff2a' : '#4a5568';
                ctx.fillRect(w / 2, -3, 4, 6);
                break;

            case 'filter':
                ctx.fillStyle = '#2d3748';
                ctx.fillRect(-w / 2, -h / 2, w, h);
                ctx.fillStyle = comp.color;
                ctx.globalAlpha = 0.6;
                ctx.fillRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4);
                ctx.globalAlpha = 1.0;
                break;

            case 'prism':
                ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
                ctx.strokeStyle = '#a0aec0';
                ctx.lineWidth = 1;

                const r = w / 2;
                ctx.beginPath();
                ctx.moveTo(0, -r);
                ctx.lineTo(r * 0.866, r * 0.5);
                ctx.lineTo(-r * 0.866, r * 0.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    drawRays(rays) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'screen';

        rays.forEach(ray => {
            ctx.beginPath();
            ctx.moveTo(ray.start.x, ray.start.y);
            ctx.lineTo(ray.end.x, ray.end.y);

            ctx.strokeStyle = ray.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = ray.color;
            ctx.shadowBlur = 10;
            ctx.stroke();

            ctx.lineWidth = 1;
            ctx.strokeStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.stroke();
        });

        ctx.restore();
    }
}
