class VolatilityRenderer {
    constructor(id, calc) {
        this.id = id;
        this.calc = calc;
        this.setup();
        window.addEventListener('resize', Utils.debounce(this.setup.bind(this), 250));
        this.history = new CircularBuffer(100);
    }

    setup() {
        const { canvas, ctx, width, height } = CanvasHelper.initCanvas(this.id);
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width;
        this.height = height;
    }

    render() {
        CanvasHelper.clear(this.ctx, this.width, this.height, '#0d0f14');

        this.history.push(this.calc.vixSimulated);
        const vals = this.history.toArray();
        if (vals.length < 2) return;

        const maxV = 80;
        const xStep = this.width / 100;
        const startX = this.width - (vals.length * xStep);

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#fca311';
        this.ctx.lineWidth = 2;

        for (let i = 0; i < vals.length; i++) {
            const x = startX + i * xStep;
            const y = this.height - (vals[i] / maxV) * this.height;
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        }
        this.ctx.stroke();
    }
}

window.VolatilityRenderer = VolatilityRenderer;
