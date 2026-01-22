class Visualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.padding = 50;
        this.colors = [
            '#2563eb', // blue
            '#dc2626', // red
            '#16a34a', // green
            '#ea580c', // orange
            '#7c3aed', // purple
            '#0891b2'  // cyan
        ];
        this.resize();
    }

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.plotWidth = this.canvas.width - 2 * this.padding;
        this.plotHeight = this.canvas.height - 2 * this.padding;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw(data, type, features, labels) {
        this.clear();
        
        if (data.length === 0) return;
        
        // Draw plot background
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(this.padding, this.padding, this.plotWidth, this.plotHeight);
        
        // Draw grid
        this.drawGrid();
        
        // Draw axes
        this.drawAxes(features[0], labels[0]);
        
        // Draw data
        if (type === 'regression' || type === 'timeseries') {
            this.drawScatter(data, features[0], labels[0], this.colors[0]);
            this.drawTrendLine(data, features[0], labels[0]);
        } else if (type === 'classification') {
            this.drawClassification(data, features);
        } else if (type === 'clustering') {
            this.drawClustering(data, features);
        }
        
        // Draw legend
        this.drawLegend(type, labels[0]);
    }

    drawGrid() {
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        const xStep = this.plotWidth / 10;
        for (let i = 0; i <= 10; i++) {
            const x = this.padding + i * xStep;
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.padding);
            this.ctx.lineTo(x, this.padding + this.plotHeight);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        const yStep = this.plotHeight / 10;
        for (let i = 0; i <= 10; i++) {
            const y = this.padding + i * yStep;
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, y);
            this.ctx.lineTo(this.padding + this.plotWidth, y);
            this.ctx.stroke();
        }
    }
    
    drawAxes(xLabel, yLabel) {
        this.ctx.strokeStyle = '#334155';
        this.ctx.lineWidth = 2;
        
        // X-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding + this.plotHeight);
        this.ctx.lineTo(this.padding + this.plotWidth, this.padding + this.plotHeight);
        this.ctx.stroke();
        
        // Y-axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.padding, this.padding);
        this.ctx.lineTo(this.padding, this.padding + this.plotHeight);
        this.ctx.stroke();
        
        // Axis labels
        this.ctx.fillStyle = '#334155';
        this.ctx.font = 'bold 14px sans-serif';
        this.ctx.textAlign = 'center';
        
        // X-axis label
        this.ctx.fillText(xLabel, this.padding + this.plotWidth / 2, this.padding + this.plotHeight + 35);
        
        // Y-axis label (rotated)
        this.ctx.save();
        this.ctx.translate(this.padding - 35, this.padding + this.plotHeight / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(yLabel, 0, 0);
        this.ctx.restore();
    }

    drawScatter(data, xKey, yKey, color) {
        const xValues = data.map(d => d[xKey]);
        const yValues = data.map(d => d[yKey]);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;
        
        // Draw points
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.lineWidth = 1;
        
        for (let point of data) {
            const x = this.padding + ((point[xKey] - xMin) / xRange) * this.plotWidth;
            const y = this.padding + this.plotHeight - ((point[yKey] - yMin) / yRange) * this.plotHeight;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        }
        
        // Store scale for legend
        this.currentScale = { xMin, xMax, yMin, yMax };
    }
    
    drawTrendLine(data, xKey, yKey) {
        if (data.length < 2) return;
        
        const xValues = data.map(d => d[xKey]);
        const yValues = data.map(d => d[yKey]);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;
        
        // Simple linear regression
        const n = data.length;
        const sumX = xValues.reduce((a, b) => a + b, 0);
        const sumY = yValues.reduce((a, b) => a + b, 0);
        const sumXY = data.reduce((sum, d) => sum + d[xKey] * d[yKey], 0);
        const sumXX = xValues.reduce((sum, x) => sum + x * x, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Calculate line endpoints
        const x1 = xMin;
        const y1 = slope * x1 + intercept;
        const x2 = xMax;
        const y2 = slope * x2 + intercept;
        
        // Convert to canvas coordinates
        const canvasX1 = this.padding + ((x1 - xMin) / xRange) * this.plotWidth;
        const canvasY1 = this.padding + this.plotHeight - ((y1 - yMin) / yRange) * this.plotHeight;
        const canvasX2 = this.padding + ((x2 - xMin) / xRange) * this.plotWidth;
        const canvasY2 = this.padding + this.plotHeight - ((y2 - yMin) / yRange) * this.plotHeight;
        
        // Draw trend line
        this.ctx.strokeStyle = '#dc2626';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.moveTo(canvasX1, canvasY1);
        this.ctx.lineTo(canvasX2, canvasY2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawClassification(data, features) {
        const xValues = data.map(d => d[features[0]]);
        const yValues = data.map(d => d[features[1]]);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;
        
        // Group points by class
        const classes = {};
        data.forEach(point => {
            const cls = point.group;
            if (!classes[cls]) classes[cls] = [];
            classes[cls].push(point);
        });
        
        // Draw each class
        Object.entries(classes).forEach(([cls, points], index) => {
            const color = this.colors[index % this.colors.length];
            
            // Draw points
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 1;
            
            points.forEach(point => {
                const x = this.padding + ((point[features[0]] - xMin) / xRange) * this.plotWidth;
                const y = this.padding + this.plotHeight - ((point[features[1]] - yMin) / yRange) * this.plotHeight;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
            });
        });
        
        this.currentScale = { xMin, xMax, yMin, yMax };
        this.currentClasses = Object.keys(classes);
    }

    drawClustering(data, features) {
        const xValues = data.map(d => d[features[0]]);
        const yValues = data.map(d => d[features[1]]);
        
        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);
        
        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;
        
        // Group points by cluster
        const clusters = {};
        data.forEach(point => {
            const cluster = point.natural_cluster;
            if (!clusters[cluster]) clusters[cluster] = [];
            clusters[cluster].push(point);
        });
        
        // Draw each cluster
        Object.entries(clusters).forEach(([cluster, points], index) => {
            const color = this.colors[index % this.colors.length];
            
            // Draw cluster center
            const centerX = points.reduce((sum, p) => sum + p[features[0]], 0) / points.length;
            const centerY = points.reduce((sum, p) => sum + p[features[1]], 0) / points.length;
            
            const canvasCenterX = this.padding + ((centerX - xMin) / xRange) * this.plotWidth;
            const canvasCenterY = this.padding + this.plotHeight - ((centerY - yMin) / yRange) * this.plotHeight;
            
            // Draw center marker
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(canvasCenterX, canvasCenterY, 8, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Draw points
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = 0.7;
            points.forEach(point => {
                const x = this.padding + ((point[features[0]] - xMin) / xRange) * this.plotWidth;
                const y = this.padding + this.plotHeight - ((point[features[1]] - yMin) / yRange) * this.plotHeight;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1.0;
        });
        
        this.currentScale = { xMin, xMax, yMin, yMax };
        this.currentClusters = Object.keys(clusters);
    }
    
    drawLegend(type, label) {
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'left';
        
        let items = [];
        
        if (type === 'classification' && this.currentClasses) {
            items = this.currentClasses.map((cls, i) => ({
                label: `Group ${cls}`,
                color: this.colors[i % this.colors.length]
            }));
        } else if (type === 'clustering' && this.currentClusters) {
            items = this.currentClusters.map((cluster, i) => ({
                label: `Cluster ${cluster}`,
                color: this.colors[i % this.colors.length]
            }));
        } else {
            items = [{
                label: label,
                color: this.colors[0]
            }];
        }
        
        // Draw legend background
        const legendX = this.padding + this.plotWidth - 120;
        const legendY = this.padding + 10;
        const itemHeight = 20;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(legendX - 10, legendY - 10, 130, items.length * itemHeight + 10);
        this.ctx.strokeStyle = '#cbd5e1';
        this.ctx.strokeRect(legendX - 10, legendY - 10, 130, items.length * itemHeight + 10);
        
        // Draw legend items
        items.forEach((item, i) => {
            const y = legendY + i * itemHeight;
            
            // Color box
            this.ctx.fillStyle = item.color;
            this.ctx.fillRect(legendX, y, 12, 12);
            
            // Label
            this.ctx.fillStyle = '#334155';
            this.ctx.fillText(item.label, legendX + 20, y + 10);
        });
    }
}