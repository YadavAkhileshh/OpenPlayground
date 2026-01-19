class DatasetGenerator {
    constructor() {
        this.data = [];
        this.features = [];
        this.labels = [];
        this.type = 'regression';
        this.rng = new SeededRandom(42);
        this.metadata = {};
    }

    generateRegression(n, noiseLevel, rangeMin, rangeMax) {
        this.data = [];
        this.features = ['x_coordinate'];
        this.labels = ['y_value'];
        
        // Normalize range to [-1, 1] internally for consistent noise scaling
        const normalizedMin = -1;
        const normalizedMax = 1;
        const span = normalizedMax - normalizedMin;
        
        for (let i = 0; i < n; i++) {
            // Evenly spaced x values
            const normalizedX = normalizedMin + (i / (n - 1)) * span;
            
            // Linear relationship: y = 2x + 1 (normalized)
            const trueY = 2 * normalizedX + 1;
            
            // Add controlled noise
            const noise = this.rng.gaussian(0, noiseLevel);
            const observedY = trueY + noise;
            
            // Scale back to user's range
            const x = rangeMin + ((normalizedX - normalizedMin) / span) * (rangeMax - rangeMin);
            const y = observedY * (rangeMax - rangeMin) / 4 + (rangeMin + rangeMax) / 2;
            
            this.data.push({ x_coordinate: x, y_value: y });
        }
        
        this.metadata = {
            pattern: 'linear',
            slope: 2,
            intercept: 1,
            noise_level: noiseLevel
        };
    }

    generateClassification(n, numClasses, noiseLevel, classBalance, rangeMin, rangeMax) {
        this.data = [];
        this.features = ['horizontal_position', 'vertical_position'];
        this.labels = ['group'];
        
        // Calculate samples per class with balance control
        const baseSamples = Math.floor(n / numClasses);
        const samplesPerClass = [];
        
        for (let c = 0; c < numClasses; c++) {
            if (c === 0) {
                // First class gets reduced samples if imbalanced
                samplesPerClass.push(Math.max(10, Math.floor(baseSamples * classBalance)));
            } else {
                samplesPerClass.push(baseSamples);
            }
        }
        
        // Distribute centers in a circle to avoid overlap
        const centerRadius = (rangeMax - rangeMin) * 0.3;
        const centerX = (rangeMin + rangeMax) / 2;
        const centerY = (rangeMin + rangeMax) / 2;
        
        for (let c = 0; c < numClasses; c++) {
            // Place class centers evenly around circle
            const angle = (2 * Math.PI * c) / numClasses;
            const classCenterX = centerX + centerRadius * Math.cos(angle);
            const classCenterY = centerY + centerRadius * Math.sin(angle);
            
            // Ensure centers are within bounds
            const safeCenterX = Math.max(rangeMin + 1, Math.min(rangeMax - 1, classCenterX));
            const safeCenterY = Math.max(rangeMin + 1, Math.min(rangeMax - 1, classCenterY));
            
            for (let i = 0; i < samplesPerClass[c]; i++) {
                // Controlled spread around center
                const spread = (rangeMax - rangeMin) * 0.1 * (1 + noiseLevel);
                const x = this.rng.gaussian(safeCenterX, spread);
                const y = this.rng.gaussian(safeCenterY, spread);
                
                // Clamp to bounds
                const clampedX = Math.max(rangeMin, Math.min(rangeMax, x));
                const clampedY = Math.max(rangeMin, Math.min(rangeMax, y));
                
                this.data.push({ 
                    horizontal_position: clampedX, 
                    vertical_position: clampedY, 
                    group: c 
                });
            }
        }
        
        this.metadata = {
            pattern: 'separated_groups',
            num_classes: numClasses,
            balance_ratio: classBalance,
            noise_level: noiseLevel
        };
    }

    generateClustering(n, numClusters, noiseLevel, rangeMin, rangeMax) {
        this.data = [];
        this.features = ['horizontal_feature', 'vertical_feature'];
        this.labels = ['natural_cluster'];
        
        const samplesPerCluster = Math.floor(n / numClusters);
        const centerX = (rangeMin + rangeMax) / 2;
        const centerY = (rangeMin + rangeMax) / 2;
        
        // Create natural cluster positions
        const clusterPositions = [];
        for (let c = 0; c < numClusters; c++) {
            const angle = (2 * Math.PI * c) / numClusters;
            const distance = (rangeMax - rangeMin) * 0.25;
            clusterPositions.push({
                x: centerX + distance * Math.cos(angle),
                y: centerY + distance * Math.sin(angle)
            });
        }
        
        for (let c = 0; c < numClusters; c++) {
            const pos = clusterPositions[c];
            const spread = (rangeMax - rangeMin) * 0.08 * (1 + noiseLevel);
            
            for (let i = 0; i < samplesPerCluster; i++) {
                const x = this.rng.gaussian(pos.x, spread);
                const y = this.rng.gaussian(pos.y, spread);
                
                // Ensure points stay within bounds
                const boundedX = Math.max(rangeMin, Math.min(rangeMax, x));
                const boundedY = Math.max(rangeMin, Math.min(rangeMax, y));
                
                this.data.push({ 
                    horizontal_feature: boundedX, 
                    vertical_feature: boundedY, 
                    natural_cluster: c 
                });
            }
        }
        
        this.metadata = {
            pattern: 'natural_clusters',
            num_clusters: numClusters,
            noise_level: noiseLevel
        };
    }

    generateTimeSeries(n, noiseLevel) {
        this.data = [];
        this.features = ['time_step'];
        this.labels = ['measurement'];
        
        // Base values for consistent scaling
        const baseValue = 50;
        const trendStrength = 0.3;
        const seasonStrength = 5;
        const seasonPeriod = 20;
        
        for (let i = 0; i < n; i++) {
            const t = i;
            
            // Trend component
            const trend = trendStrength * t;
            
            // Seasonal component
            const seasonal = seasonStrength * Math.sin(2 * Math.PI * t / seasonPeriod);
            
            // Noise component
            const noise = this.rng.gaussian(0, noiseLevel * seasonStrength * 0.5);
            
            const value = baseValue + trend + seasonal + noise;
            
            this.data.push({ 
                time_step: t, 
                measurement: value 
            });
        }
        
        this.metadata = {
            pattern: 'trend_plus_seasonal',
            trend_strength: trendStrength,
            season_strength: seasonStrength,
            season_period: seasonPeriod,
            noise_level: noiseLevel
        };
    }

    toCSV() {
        if (this.data.length === 0) return '';
        
        const headers = [...this.features, ...this.labels];
        let csv = headers.join(',') + '\n';
        
        // Add metadata as comments
        csv = `# DataForge Dataset Export\n` +
              `# Pattern: ${this.metadata.pattern || 'unknown'}\n` +
              `# Generated: ${new Date().toISOString()}\n` +
              `# Total points: ${this.data.length}\n` +
              `# Features: ${this.features.join(', ')}\n` +
              `# Labels: ${this.labels.join(', ')}\n\n` + csv;
        
        for (let row of this.data) {
            const values = headers.map(h => {
                const val = row[h];
                return typeof val === 'number' ? val.toFixed(6) : val;
            });
            csv += values.join(',') + '\n';
        }
        
        return csv;
    }
    
    // Utility methods for data quality
    getStatistics() {
        const stats = {};
        
        [...this.features, ...this.labels].forEach(key => {
            const values = this.data.map(d => d[key]).filter(v => typeof v === 'number');
            if (values.length > 0) {
                const sorted = [...values].sort((a, b) => a - b);
                stats[key] = {
                    count: values.length,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    mean: values.reduce((a, b) => a + b, 0) / values.length,
                    median: sorted[Math.floor(sorted.length / 2)],
                    std: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length)
                };
            }
        });
        
        return stats;
    }
    
    validate() {
        const issues = [];
        
        if (this.data.length === 0) {
            issues.push('No data generated');
            return issues;
        }
        
        // Check for NaN or infinite values
        for (let row of this.data) {
            for (let key of [...this.features, ...this.labels]) {
                const val = row[key];
                if (typeof val === 'number' && (!isFinite(val) || isNaN(val))) {
                    issues.push(`Invalid value in ${key}: ${val}`);
                }
            }
        }
        
        return issues;
    }
}