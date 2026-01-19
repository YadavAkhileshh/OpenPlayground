// Database Index Visualizer
class DatabaseIndexVisualizer {
    constructor() {
        this.currentAlgo = 'btree';
        this.datasetSize = 100;
        this.dataset = [];
        this.animationSpeed = 5;
        this.stepMode = false;
        this.isAnimating = false;
        this.metrics = {
            steps: 0,
            comparisons: 0,
            ioOperations: 0,
            time: 0
        };
        
        this.initialize();
        this.generateDataset();
        this.renderStructures();
        this.showTutorial();
    }

    initialize() {
        // DOM Elements
        this.elements = {
            dataSize: document.getElementById('dataSize'),
            sizeValue: document.getElementById('sizeValue'),
            searchValue: document.getElementById('searchValue'),
            searchBtn: document.getElementById('searchBtn'),
            insertBtn: document.getElementById('insertBtn'),
            resetBtn: document.getElementById('resetBtn'),
            compareBtn: document.getElementById('compareBtn'),
            stepBtn: document.getElementById('stepBtn'),
            animationSpeed: document.getElementById('animationSpeed'),
            vizTitle: document.getElementById('vizTitle'),
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            tutorialModal: document.getElementById('tutorialModal'),
            closeTutorial: document.getElementById('closeTutorial')
        };

        // Event Listeners
        this.setupEventListeners();
        this.setupAlgorithmButtons();
    }

    setupEventListeners() {
        // Dataset size slider
        this.elements.dataSize.addEventListener('input', (e) => {
            this.datasetSize = parseInt(e.target.value);
            this.elements.sizeValue.textContent = `${this.datasetSize} records`;
            this.generateDataset();
            this.renderStructures();
            this.resetMetrics();
        });

        // Search button
        this.elements.searchBtn.addEventListener('click', () => {
            const value = parseInt(this.elements.searchValue.value);
            if (value && !this.isAnimating) {
                this.search(value);
            }
        });

        // Insert button
        this.elements.insertBtn.addEventListener('click', () => {
            const value = Math.floor(Math.random() * 1000) + 1;
            this.elements.searchValue.value = value;
            this.insert(value);
        });

        // Reset button
        this.elements.resetBtn.addEventListener('click', () => {
            this.generateDataset();
            this.renderStructures();
            this.resetMetrics();
            this.updateStatus('Ready', 'success');
        });

        // Compare all button
        this.elements.compareBtn.addEventListener('click', () => {
            const value = parseInt(this.elements.searchValue.value);
            if (value) {
                this.compareAll(value);
            }
        });

        // Step mode button
        this.elements.stepBtn.addEventListener('click', () => {
            this.stepMode = !this.stepMode;
            this.elements.stepBtn.classList.toggle('active');
            this.elements.stepBtn.innerHTML = this.stepMode ? 
                '<i class="fas fa-pause"></i> Step Mode' : 
                '<i class="fas fa-step-forward"></i> Step Mode';
        });

        // Animation speed
        this.elements.animationSpeed.addEventListener('input', (e) => {
            this.animationSpeed = parseInt(e.target.value);
        });

        // Tutorial
        this.elements.closeTutorial.addEventListener('click', () => {
            this.hideTutorial();
        });

        // Enter key for search
        this.elements.searchValue.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.elements.searchBtn.click();
            }
        });
    }

    setupAlgorithmButtons() {
        document.querySelectorAll('.algo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const algo = e.currentTarget.dataset.algo;
                this.switchAlgorithm(algo);
            });
        });
    }

    switchAlgorithm(algo) {
        this.currentAlgo = algo;
        
        // Update active button
        document.querySelectorAll('.algo-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-algo="${algo}"]`).classList.add('active');
        
        // Update visualization
        document.querySelectorAll('.structure-viz').forEach(viz => {
            viz.classList.remove('active');
        });
        document.getElementById(`${algo}-viz`).classList.add('active');
        
        // Update title
        const titles = {
            btree: 'B-Tree Index Visualization',
            hash: 'Hash Index Visualization',
            sequential: 'Full Scan Visualization'
        };
        this.elements.vizTitle.textContent = titles[algo];
        
        // Update complexity display
        const complexities = {
            btree: 'O(log n)',
            hash: 'O(1) average',
            sequential: 'O(n)'
        };
        document.getElementById('timeComplexity').textContent = complexities[algo];
        
        this.renderStructures();
    }

    generateDataset() {
        this.dataset = [];
        const maxValue = 1000;
        
        // Generate sorted unique values for B-tree
        for (let i = 0; i < this.datasetSize; i++) {
            this.dataset.push(Math.floor(Math.random() * maxValue) + 1);
        }
        
        // Sort for B-tree visualization
        this.dataset.sort((a, b) => a - b);
        
        // Remove duplicates
        this.dataset = [...new Set(this.dataset)];
    }

    async search(value) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.resetMetrics();
        this.updateStatus('Searching...', 'searching');
        
        switch(this.currentAlgo) {
            case 'btree':
                await this.visualizeBTreeSearch(value);
                break;
            case 'hash':
                await this.visualizeHashSearch(value);
                break;
            case 'sequential':
                await this.visualizeSequentialSearch(value);
                break;
        }
        
        this.isAnimating = false;
        this.updateMetrics();
    }

    async visualizeBTreeSearch(value) {
        const container = document.getElementById('btreeContainer');
        container.innerHTML = '';
        
        // Create tree levels
        const levels = this.createBTreeLevels();
        this.renderBTree(container, levels);
        
        await this.sleep(500);
        
        // Simulate B-tree search
        let currentLevel = 0;
        let found = false;
        
        for (const level of levels) {
            const nodes = container.querySelectorAll(`.tree-level:nth-child(${currentLevel + 1}) .tree-node`);
            
            for (const node of nodes) {
                // Highlight current node
                node.classList.add('active');
                this.updateMetric('steps', 1);
                this.updateMetric('ioOperations', 1);
                await this.sleep(1000 / this.animationSpeed);
                
                // Get keys from node
                const keys = Array.from(node.querySelectorAll('.key')).map(k => parseInt(k.textContent));
                
                // Compare with each key
                for (let i = 0; i < keys.length; i++) {
                    const keyElement = node.querySelectorAll('.key')[i];
                    keyElement.classList.add('current');
                    this.updateMetric('comparisons', 1);
                    
                    await this.sleep(800 / this.animationSpeed);
                    
                    if (value === keys[i]) {
                        // Found!
                        keyElement.classList.remove('current');
                        keyElement.classList.add('found');
                        node.classList.remove('active');
                        node.classList.add('found');
                        found = true;
                        
                        this.updateStatus('Found!', 'success');
                        await this.sleep(1000);
                        return;
                    } else if (value < keys[i]) {
                        // Go left
                        keyElement.classList.remove('current');
                        break;
                    }
                    
                    keyElement.classList.remove('current');
                }
                
                node.classList.remove('active');
                node.classList.add('visited');
                
                if (this.stepMode) await this.waitForStep();
            }
            
            currentLevel++;
        }
        
        if (!found) {
            this.updateStatus('Value not found', 'danger');
        }
    }

    async visualizeHashSearch(value) {
        const container = document.getElementById('hashTable');
        container.innerHTML = '';
        
        // Create hash table
        const hashTable = this.createHashTable();
        this.renderHashTable(container, hashTable);
        
        await this.sleep(500);
        
        // Calculate hash
        const hash = this.hashFunction(value, hashTable.length);
        const bucket = container.querySelector(`[data-bucket="${hash}"]`);
        
        if (!bucket) return;
        
        // Highlight bucket
        bucket.classList.add('active');
        this.updateMetric('steps', 1);
        this.updateMetric('ioOperations', 1);
        await this.sleep(1000 / this.animationSpeed);
        
        // Search in bucket
        const items = Array.from(bucket.querySelectorAll('.hash-item'));
        let found = false;
        
        for (const item of items) {
            item.classList.add('current');
            this.updateMetric('comparisons', 1);
            
            await this.sleep(800 / this.animationSpeed);
            
            const itemValue = parseInt(item.textContent.split('→')[0].split(':')[1].trim());
            
            if (itemValue === value) {
                item.classList.remove('current');
                item.classList.add('found');
                found = true;
                this.updateStatus('Found!', 'success');
                await this.sleep(1000);
                break;
            }
            
            item.classList.remove('current');
            
            if (this.stepMode) await this.waitForStep();
        }
        
        bucket.classList.remove('active');
        
        if (!found) {
            this.updateStatus('Value not found', 'danger');
        }
    }

    async visualizeSequentialSearch(value) {
        const container = document.getElementById('scanContainer');
        container.innerHTML = '';
        
        // Create data items
        this.renderSequentialData(container);
        
        await this.sleep(500);
        
        let found = false;
        const items = container.querySelectorAll('.data-item');
        
        for (const item of items) {
            item.classList.add('current');
            this.updateMetric('steps', 1);
            this.updateMetric('comparisons', 1);
            
            await this.sleep(300 / this.animationSpeed);
            
            const itemValue = parseInt(item.textContent);
            
            if (itemValue === value) {
                item.classList.remove('current');
                item.classList.add('found');
                found = true;
                this.updateStatus('Found!', 'success');
                await this.sleep(1000);
                break;
            }
            
            item.classList.remove('current');
            item.classList.add('checked');
            
            if (this.stepMode) await this.waitForStep();
        }
        
        if (!found) {
            this.updateStatus('Value not found', 'danger');
        }
    }

    async insert(value) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.updateStatus('Inserting...', 'warning');
        
        // Add to dataset
        if (!this.dataset.includes(value)) {
            this.dataset.push(value);
            this.dataset.sort((a, b) => a - b);
            
            // Update visualization
            this.renderStructures();
            
            await this.sleep(1000);
            this.updateStatus('Inserted successfully', 'success');
        } else {
            this.updateStatus('Value already exists', 'warning');
        }
        
        this.isAnimating = false;
    }

    async compareAll(value) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        this.updateStatus('Comparing all algorithms...', 'searching');
        
        const results = [];
        
        // Test each algorithm
        const algorithms = ['sequential', 'hash', 'btree'];
        
        for (const algo of algorithms) {
            this.switchAlgorithm(algo);
            await this.sleep(500);
            
            const startTime = performance.now();
            this.resetMetrics();
            
            // Run search (without visualization)
            const found = this.simulateSearch(algo, value);
            
            const endTime = performance.now();
            const time = endTime - startTime;
            
            results.push({
                algo,
                time,
                steps: this.metrics.steps,
                comparisons: this.metrics.comparisons,
                found
            });
        }
        
        // Switch back to current algorithm
        this.switchAlgorithm(this.currentAlgo);
        
        // Update comparison chart
        this.updateComparisonChart(results);
        
        this.isAnimating = false;
        this.updateStatus('Comparison complete', 'success');
    }

    simulateSearch(algo, value) {
        switch(algo) {
            case 'sequential':
                return this.dataset.includes(value);
            case 'hash':
                return this.dataset.includes(value);
            case 'btree':
                return this.binarySearch(value);
            default:
                return false;
        }
    }

    binarySearch(value) {
        let left = 0;
        let right = this.dataset.length - 1;
        
        while (left <= right) {
            this.updateMetric('steps', 1);
            this.updateMetric('comparisons', 1);
            
            const mid = Math.floor((left + right) / 2);
            
            if (this.dataset[mid] === value) {
                return true;
            } else if (this.dataset[mid] < value) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return false;
    }

    updateComparisonChart(results) {
        // Find max time for scaling
        const maxTime = Math.max(...results.map(r => r.time));
        
        results.forEach(result => {
            const bar = document.querySelector(`.chart-bar[data-algo="${result.algo}"] .bar-fill`);
            const value = document.querySelector(`.chart-bar[data-algo="${result.algo}"] .bar-value`);
            
            if (bar && value) {
                const percentage = (result.time / maxTime) * 100;
                bar.style.width = `${percentage}%`;
                value.textContent = `${result.time.toFixed(1)} ms`;
            }
        });
    }

    // Rendering Methods
    renderStructures() {
        this.renderBTree();
        this.renderHashTable();
        this.renderSequentialData();
    }

    renderBTree(container = document.getElementById('btreeContainer')) {
        if (!container) return;
        
        container.innerHTML = '';
        const levels = this.createBTreeLevels();
        
        levels.forEach((level, levelIndex) => {
            const levelDiv = document.createElement('div');
            levelDiv.className = 'tree-level';
            
            level.forEach((node, nodeIndex) => {
                const nodeDiv = document.createElement('div');
                nodeDiv.className = 'tree-node';
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'node-content';
                
                node.forEach(key => {
                    const keySpan = document.createElement('span');
                    keySpan.className = 'key';
                    keySpan.textContent = key;
                    contentDiv.appendChild(keySpan);
                });
                
                nodeDiv.appendChild(contentDiv);
                levelDiv.appendChild(nodeDiv);
            });
            
            container.appendChild(levelDiv);
        });
    }

    createBTreeLevels() {
        // Simplified B-tree representation
        const levels = [];
        const keysPerNode = 3;
        
        // Create root level (first 3-5 values)
        const rootKeys = this.dataset.slice(0, Math.min(keysPerNode, this.dataset.length));
        levels.push([rootKeys]);
        
        // Create second level (groups of 3)
        if (this.dataset.length > keysPerNode) {
            const secondLevel = [];
            for (let i = keysPerNode; i < Math.min(this.dataset.length, 15); i += keysPerNode) {
                secondLevel.push(this.dataset.slice(i, i + keysPerNode));
            }
            if (secondLevel.length > 0) {
                levels.push(secondLevel);
            }
        }
        
        return levels;
    }

    renderHashTable(container = document.getElementById('hashTable')) {
        if (!container) return;
        
        container.innerHTML = '';
        const hashTable = this.createHashTable();
        
        hashTable.forEach((bucket, index) => {
            const bucketDiv = document.createElement('div');
            bucketDiv.className = 'hash-bucket';
            bucketDiv.dataset.bucket = index;
            
            const bucketLabel = document.createElement('div');
            bucketLabel.className = 'bucket-label';
            bucketLabel.textContent = `Bucket ${index}`;
            bucketDiv.appendChild(bucketLabel);
            
            bucket.forEach(value => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'hash-item';
                itemDiv.textContent = `Key: ${value} → Value: ${value}`;
                bucketDiv.appendChild(itemDiv);
            });
            
            container.appendChild(bucketDiv);
        });
    }

    createHashTable() {
        const bucketCount = 8;
        const hashTable = Array.from({ length: bucketCount }, () => []);
        
        // Distribute values into buckets
        this.dataset.slice(0, 32).forEach(value => {
            const bucketIndex = this.hashFunction(value, bucketCount);
            hashTable[bucketIndex].push(value);
        });
        
        return hashTable;
    }

    hashFunction(value, bucketCount) {
        // Simple hash function
        return value % bucketCount;
    }

    renderSequentialData(container = document.getElementById('scanContainer')) {
        if (!container) return;
        
        container.innerHTML = '';
        
        // Show first 50 values for clarity
        const displayData = this.dataset.slice(0, 50);
        
        displayData.forEach(value => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'data-item';
            itemDiv.textContent = value;
            container.appendChild(itemDiv);
        });
    }

    // Helper Methods
    updateMetric(metric, value) {
        this.metrics[metric] += value;
        
        // Update UI
        const metricElement = document.getElementById(metric === 'steps' ? 'stepCount' : 
                                                     metric === 'comparisons' ? 'comparisons' : 
                                                     metric === 'ioOperations' ? 'ioOperations' : null);
        
        if (metricElement) {
            metricElement.textContent = this.metrics[metric];
            
            // Update progress bars
            if (metric === 'steps') {
                const maxSteps = this.datasetSize;
                const percentage = Math.min((this.metrics.steps / maxSteps) * 100, 100);
                document.getElementById('stepProgress').style.width = `${percentage}%`;
            }
            
            if (metric === 'comparisons') {
                const maxComparisons = this.datasetSize;
                const percentage = Math.min((this.metrics.comparisons / maxComparisons) * 100, 100);
                document.getElementById('comparisonProgress').style.width = `${percentage}%`;
            }
        }
    }

    resetMetrics() {
        this.metrics = {
            steps: 0,
            comparisons: 0,
            ioOperations: 0,
            time: 0
        };
        
        document.getElementById('stepCount').textContent = '0';
        document.getElementById('comparisons').textContent = '0';
        document.getElementById('ioOperations').textContent = '0';
        
        document.getElementById('stepProgress').style.width = '0%';
        document.getElementById('comparisonProgress').style.width = '0%';
    }

    updateMetrics() {
        document.getElementById('stepCount').textContent = this.metrics.steps;
        document.getElementById('comparisons').textContent = this.metrics.comparisons;
        document.getElementById('ioOperations').textContent = this.metrics.ioOperations;
    }

    updateStatus(text, type) {
        this.elements.statusText.textContent = text;
        
        const colors = {
            success: '#6BBF70',
            searching: '#2E86AB',
            warning: '#F18F01',
            danger: '#C73E1D',
            ready: '#6C757D'
        };
        
        this.elements.statusDot.style.backgroundColor = colors[type] || colors.ready;
    }

    showTutorial() {
        setTimeout(() => {
            this.elements.tutorialModal.classList.add('active');
        }, 1000);
    }

    hideTutorial() {
        this.elements.tutorialModal.classList.remove('active');
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async waitForStep() {
        return new Promise(resolve => {
            const stepHandler = () => {
                this.elements.stepBtn.removeEventListener('click', stepHandler);
                resolve();
            };
            this.elements.stepBtn.addEventListener('click', stepHandler);
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new DatabaseIndexVisualizer();
    
    // Make visualizer available globally for debugging
    window.visualizer = visualizer;
});