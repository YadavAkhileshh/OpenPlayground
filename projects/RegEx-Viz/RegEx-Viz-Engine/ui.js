
(function(root) {
    'use strict';

    class Visualizer {
        constructor() {
            this.canvasMain = document.getElementById('canvas-main');
            this.canvasData = document.getElementById('canvas-data');
            this.ctxMain = this.canvasMain.getContext('2d');
            this.ctxData = this.canvasData.getContext('2d');
            
            this.width = 400;
            this.height = 400;
            
            this.initCanvases();
        }

        initCanvases() {
            [this.canvasMain, this.canvasData].forEach(c => {
                c.width = this.width;
                c.height = this.height;
            });
        }

        /**
         * Renders the Heatmap Decision Boundary
         * This requires running a forward pass for every 4th pixel.
         */
        drawDecisionBoundary(model) {
            const step = 4; // Resolution of the heatmap
            const imgData = this.ctxMain.createImageData(this.width, this.height);
            
            for (let y = 0; y < this.height; y += step) {
                for (let x = 0; x < this.width; x += step) {
                    // Map screen coords to normalized space [-1, 1]
                    const nx = (x / this.width) * 2 - 1;
                    const ny = (y / this.height) * 2 - 1;

                    // Forward pass through the actual model logic
                    const input = new root.NF.Tensor([[nx, ny]]);
                    const pred = model.forward(input).data[0][0];

                    // Map prediction to color (Blue for negative, Orange for positive)
                    const color = this._getColorForValue(pred);

                    // Fill the pixel block
                    for (let sy = 0; sy < step; sy++) {
                        for (let sx = 0; sx < step; sx++) {
                            const idx = ((y + sy) * this.width + (x + sx)) * 4;
                            imgData.data[idx] = color[0];     // R
                            imgData.data[idx + 1] = color[1]; // G
                            imgData.data[idx + 2] = color[2]; // B
                            imgData.data[idx + 3] = 255;      // A
                        }
                    }
                }
            }
            this.ctxMain.putImageData(imgData, 0, 0);
        }

        _getColorForValue(val) {
            // Sigmoid-like squashing for visual contrast
            const s = 1 / (1 + Math.exp(-val * 3));
            // Transition from #0984e3 (Blue) to #ff9f0a (Orange)
            const r = Math.floor(9 + (255 - 9) * s);
            const g = Math.floor(132 + (159 - 132) * s);
            const b = Math.floor(227 + (10 - 227) * s);
            return [r, g, b];
        }

        /**
         * Renders training data points on the top layer
         */
        drawDataPoints(points, labels) {
            this.ctxData.clearRect(0, 0, this.width, this.height);
            points.forEach((p, i) => {
                const x = (p[0] + 1) * 0.5 * this.width;
                const y = (1 - (p[1] + 1) * 0.5) * this.height;
                
                this.ctxData.beginPath();
                this.ctxData.arc(x, y, 4, 0, Math.PI * 2);
                this.ctxData.fillStyle = labels[i] > 0 ? '#ff9f0a' : '#0984e3';
                this.ctxData.strokeStyle = '#fff';
                this.ctxData.lineWidth = 1.5;
                this.ctxData.fill();
                this.ctxData.stroke();
            });
        }

        /**
         * Generates an SVG representation of the Neural Network architecture
         */
        renderNetworkGraph(model) {
            const svg = document.getElementById('svg-graph');
            svg.innerHTML = ''; // Clear
            
            const layers = [2]; // Input layer
            model.layers.forEach(l => {
                if (l instanceof root.NF.Dense) {
                    layers.push(l.weights.shape[1]);
                }
            });

            const vGap = 30;
            const hGap = 80;
            const radius = 6;

            layers.forEach((count, lIdx) => {
                const x = 40 + lIdx * hGap;
                const startY = (200 - (count * vGap)) / 2;

                for (let nIdx = 0; nIdx < count; nIdx++) {
                    const y = startY + nIdx * vGap;
                    
                    // Draw connections to next layer
                    if (lIdx < layers.length - 1) {
                        const nextCount = layers[lIdx + 1];
                        const nextStartX = 40 + (lIdx + 1) * hGap;
                        const nextStartY = (200 - (nextCount * vGap)) / 2;

                        for (let nextN = 0; nextN < nextCount; nextN++) {
                            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                            line.setAttribute("x1", x);
                            line.setAttribute("y1", y);
                            line.setAttribute("x2", nextStartX);
                            line.setAttribute("y2", nextStartY + nextN * vGap);
                            line.setAttribute("stroke", "rgba(255,255,255,0.1)");
                            svg.appendChild(line);
                        }
                    }

                    // Draw Neuron
                    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                    circle.setAttribute("cx", x);
                    circle.setAttribute("cy", y);
                    circle.setAttribute("r", radius);
                    circle.setAttribute("fill", "#555");
                    svg.appendChild(circle);
                }
            });
        }
    }

    root.Visualizer = Visualizer;

})(window);