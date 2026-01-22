const generator = new DatasetGenerator();
const canvas = document.getElementById('vizCanvas');
const visualizer = new Visualizer(canvas);

const elements = {
    datasetType: document.getElementById('datasetType'),
    sampleSize: document.getElementById('sampleSize'),
    noiseLevel: document.getElementById('noiseLevel'),
    noiseLevelValue: document.getElementById('noiseLevelValue'),
    noiseDescription: document.getElementById('noiseDescription'),
    numClasses: document.getElementById('numClasses'),
    numClusters: document.getElementById('numClusters'),
    classBalance: document.getElementById('classBalance'),
    classBalanceValue: document.getElementById('classBalanceValue'),
    balanceDescription: document.getElementById('balanceDescription'),
    featureMin: document.getElementById('featureMin'),
    featureMax: document.getElementById('featureMax'),
    randomSeed: document.getElementById('randomSeed'),
    generateBtn: document.getElementById('generateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    exportBtn: document.getElementById('exportBtn'),
    tableHead: document.getElementById('tableHead'),
    tableBody: document.getElementById('tableBody'),
    statsContainer: document.getElementById('statsContainer'),
    previewInfo: document.getElementById('previewInfo'),
    vizOverlay: document.getElementById('vizOverlay'),
    numClassesGroup: document.getElementById('numClassesGroup'),
    numClustersGroup: document.getElementById('numClustersGroup'),
    classBalanceGroup: document.getElementById('classBalanceGroup'),
    featureRangeGroup: document.getElementById('featureRangeGroup')
};

function updateControlVisibility() {
    const type = elements.datasetType.value;
    
    // Show/hide controls based on dataset type
    elements.numClassesGroup.classList.toggle('hidden', type !== 'classification');
    elements.numClustersGroup.classList.toggle('hidden', type !== 'clustering');
    elements.classBalanceGroup.classList.toggle('hidden', type !== 'classification');
    elements.featureRangeGroup.classList.toggle('hidden', type === 'timeseries');
    
    // Update placeholder text for range inputs
    if (type === 'timeseries') {
        elements.featureMin.placeholder = 'Auto';
        elements.featureMax.placeholder = 'Auto';
    } else {
        elements.featureMin.placeholder = '-10';
        elements.featureMax.placeholder = '10';
    }
}

// Real-time feedback for sliders
function updateNoiseDescription(value) {
    const descriptions = {
        '0': 'Perfect pattern',
        '0.05': 'Very tight',
        '0.1': 'Tight',
        '0.2': 'Moderate scatter',
        '0.3': 'Loose',
        '0.5': 'Scattered',
        '0.7': 'Very scattered',
        '1': 'Chaotic'
    };
    return descriptions[value] || `${Math.round(value * 100)}% variation`;
}

function updateBalanceDescription(value) {
    const descriptions = {
        '0.1': 'Highly imbalanced',
        '0.3': 'Imbalanced',
        '0.5': 'Moderately balanced',
        '0.7': 'Mostly balanced',
        '1.0': 'Equal sized groups'
    };
    return descriptions[value] || `Ratio: ${value}`;
}

elements.noiseLevel.addEventListener('input', () => {
    const value = elements.noiseLevel.value;
    elements.noiseLevelValue.textContent = value;
    elements.noiseDescription.textContent = updateNoiseDescription(value);
});

elements.classBalance.addEventListener('input', () => {
    const value = elements.classBalance.value;
    elements.classBalanceValue.textContent = value;
    elements.balanceDescription.textContent = updateBalanceDescription(value);
});

// Validation for inputs
function validateInputs() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    // Validate sample size
    const sampleSize = parseInt(elements.sampleSize.value);
    if (sampleSize < 50 || sampleSize > 5000) {
        showError(elements.sampleSize, 'Must be between 50 and 5000');
        isValid = false;
    }
    
    // Validate range
    const min = parseFloat(elements.featureMin.value);
    const max = parseFloat(elements.featureMax.value);
    if (min >= max) {
        showError(elements.featureMin, 'Min must be less than max');
        showError(elements.featureMax, 'Max must be greater than min');
        isValid = false;
    }
    
    // Validate class/cluster counts
    if (elements.datasetType.value === 'classification') {
        const numClasses = parseInt(elements.numClasses.value);
        if (numClasses < 2 || numClasses > 5) {
            showError(elements.numClasses, 'Must be between 2 and 5');
            isValid = false;
        }
    }
    
    if (elements.datasetType.value === 'clustering') {
        const numClusters = parseInt(elements.numClusters.value);
        if (numClusters < 2 || numClusters > 6) {
            showError(elements.numClusters, 'Must be between 2 and 6');
            isValid = false;
        }
    }
    
    return isValid;
}

function showError(element, message) {
    element.classList.add('error');
    const errorEl = document.createElement('span');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    element.parentNode.appendChild(errorEl);
}

elements.datasetType.addEventListener('change', () => {
    updateControlVisibility();
    // Highlight active section
    document.querySelectorAll('.control-group').forEach(group => {
        group.style.backgroundColor = '';
    });
    event.target.closest('.control-group').style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
});

// Reset button functionality
elements.resetBtn.addEventListener('click', () => {
    if (confirm('Reset all parameters to default values?')) {
        resetParameters();
    }
});

function resetParameters() {
    elements.datasetType.value = 'regression';
    elements.sampleSize.value = 300;
    elements.noiseLevel.value = 0.2;
    elements.numClasses.value = 2;
    elements.numClusters.value = 3;
    elements.classBalance.value = 1.0;
    elements.featureMin.value = -10;
    elements.featureMax.value = 10;
    elements.randomSeed.value = 42;
    
    // Update display values
    elements.noiseLevelValue.textContent = '0.2';
    elements.noiseDescription.textContent = 'Moderate scatter';
    elements.classBalanceValue.textContent = '1.0';
    elements.balanceDescription.textContent = 'Equal sized groups';
    
    updateControlVisibility();
    
    // Clear data displays
    elements.tableHead.innerHTML = '';
    elements.tableBody.innerHTML = '';
    elements.statsContainer.innerHTML = '<div class="stat-placeholder">Dataset statistics will appear here</div>';
    elements.previewInfo.textContent = 'Configure and create a dataset to preview';
    elements.vizOverlay.innerHTML = '<p>Create a dataset to see the visualization</p>';
    document.querySelector('.visualization-container').classList.remove('has-data');
    
    visualizer.clear();
    generator.data = [];
}

elements.generateBtn.addEventListener('click', () => {
    if (validateInputs()) {
        generateData();
    }
});

// Also trigger on Enter key in input fields
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        if (validateInputs()) {
            generateData();
        }
    }
});

function generateData() {
    const startTime = performance.now();
    
    const type = elements.datasetType.value;
    const n = parseInt(elements.sampleSize.value);
    const noise = parseFloat(elements.noiseLevel.value);
    const seed = parseInt(elements.randomSeed.value);
    const rangeMin = parseFloat(elements.featureMin.value);
    const rangeMax = parseFloat(elements.featureMax.value);
    
    // Show loading state
    elements.generateBtn.textContent = 'Creating...';
    elements.generateBtn.disabled = true;
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            generator.rng = new SeededRandom(seed);
            generator.type = type;
            
            if (type === 'regression') {
                generator.generateRegression(n, noise, rangeMin, rangeMax);
            } else if (type === 'classification') {
                const numClasses = parseInt(elements.numClasses.value);
                const balance = parseFloat(elements.classBalance.value);
                generator.generateClassification(n, numClasses, noise, balance, rangeMin, rangeMax);
            } else if (type === 'clustering') {
                const numClusters = parseInt(elements.numClusters.value);
                generator.generateClustering(n, numClusters, noise, rangeMin, rangeMax);
            } else if (type === 'timeseries') {
                generator.generateTimeSeries(n, noise);
            }
            
            // Update UI
            visualizer.draw(generator.data, type, generator.features, generator.labels);
            updatePreview();
            updateStats();
            
            // Show success
            elements.vizOverlay.innerHTML = '<p>Dataset created!</p>';
            document.querySelector('.visualization-container').classList.add('has-data');
            elements.previewInfo.textContent = `Showing ${Math.min(50, generator.data.length)} of ${generator.data.length} rows`;
            
        } catch (error) {
            console.error('Error generating data:', error);
            alert('Error creating dataset. Please check your parameters.');
        } finally {
            // Restore button
            elements.generateBtn.textContent = 'Create Dataset';
            elements.generateBtn.disabled = false;
        }
    }, 50);
}

function updatePreview() {
    const headers = [...generator.features, ...generator.labels];
    const previewRows = generator.data.slice(0, 50);
    
    elements.tableHead.innerHTML = '';
    const headerRow = document.createElement('tr');
    headers.forEach((h, idx) => {
        const th = document.createElement('th');
        const input = document.createElement('input');
        input.type = 'text';
        input.value = h;
        input.className = 'feature-name-input';
        input.dataset.index = idx;
        input.dataset.original = h;
        input.addEventListener('change', updateFeatureName);
        th.appendChild(input);
        headerRow.appendChild(th);
    });
    elements.tableHead.appendChild(headerRow);
    
    elements.tableBody.innerHTML = '';
    previewRows.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(h => {
            const td = document.createElement('td');
            const val = row[h];
            td.textContent = typeof val === 'number' ? val.toFixed(4) : val;
            tr.appendChild(td);
        });
        elements.tableBody.appendChild(tr);
    });
    
    elements.previewInfo.textContent = `Showing ${previewRows.length} of ${generator.data.length} rows`;
}

function updateFeatureName(e) {
    const input = e.target;
    const originalName = input.dataset.original;
    const newName = input.value.trim() || originalName;
    
    const isFeature = generator.features.includes(originalName);
    const isLabel = generator.labels.includes(originalName);
    
    if (isFeature) {
        const idx = generator.features.indexOf(originalName);
        generator.features[idx] = newName;
    } else if (isLabel) {
        const idx = generator.labels.indexOf(originalName);
        generator.labels[idx] = newName;
    }
    
    generator.data.forEach(row => {
        if (row.hasOwnProperty(originalName)) {
            row[newName] = row[originalName];
            if (newName !== originalName) {
                delete row[originalName];
            }
        }
    });
    
    input.dataset.original = newName;
}

function updateStats() {
    const data = generator.data;
    if (data.length === 0) return;
    
    const features = generator.features;
    const labels = generator.labels;
    
    let statsHTML = '';
    
    // Basic info
    statsHTML += `
        <div class="stat-item">
            <div class="stat-label">Total Points</div>
            <div class="stat-value">${data.length}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Features</div>
            <div class="stat-value">${features.length}</div>
        </div>
    `;
    
    // Feature statistics
    features.forEach(feature => {
        const values = data.map(d => d[feature]).filter(v => typeof v === 'number');
        if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
            
            statsHTML += `
                <div class="stat-item">
                    <div class="stat-label">${feature} Range</div>
                    <div class="stat-value">${min.toFixed(1)} to ${max.toFixed(1)}</div>
                </div>
            `;
        }
    });
    
    // Type-specific stats
    if (generator.type === 'classification') {
        const classes = [...new Set(data.map(d => d.class))].sort();
        const classCounts = {};
        classes.forEach(c => {
            classCounts[c] = data.filter(d => d.class === c).length;
        });
        
        statsHTML += `
            <div class="stat-item">
                <div class="stat-label">Groups</div>
                <div class="stat-value">${classes.length}</div>
            </div>
        `;
        
        const counts = Object.values(classCounts);
        const balanceRatio = Math.min(...counts) / Math.max(...counts);
        statsHTML += `
            <div class="stat-item">
                <div class="stat-label">Balance</div>
                <div class="stat-value">${balanceRatio.toFixed(2)}</div>
            </div>
        `;
    } 
    else if (generator.type === 'clustering') {
        const clusters = [...new Set(data.map(d => d.cluster))].sort();
        statsHTML += `
            <div class="stat-item">
                <div class="stat-label">Clusters</div>
                <div class="stat-value">${clusters.length}</div>
            </div>
        `;
    }
    
    elements.statsContainer.innerHTML = statsHTML;
}

elements.exportBtn.addEventListener('click', () => {
    if (generator.data.length === 0) {
        alert('Please generate a dataset first');
        return;
    }
    
    const csv = generator.toCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dataset_${generator.type}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
});

// Mobile device detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Add mobile-specific event listeners
if (isTouchDevice) {
    // Prevent zoom on double tap
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent pinch zoom
    document.addEventListener('gesturestart', (e) => {
        e.preventDefault();
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Skip keyboard shortcuts on mobile
    if (isMobile) return;
    
    // Ctrl+Enter to generate
    if (e.ctrlKey && e.key === 'Enter') {
        if (validateInputs()) {
            generateData();
        }
    }
    // Escape to reset
    if (e.key === 'Escape') {
        resetParameters();
    }
});

// Add educational tooltips
function addEducationalTips() {
    const tips = [
        {
            element: elements.datasetType,
            text: 'Different patterns help you understand how data structure affects machine learning models'
        },
        {
            element: elements.noiseLevel,
            text: 'Higher variation makes patterns harder to detect - like real-world messy data'
        },
        {
            element: elements.sampleSize,
            text: 'More data points reveal true patterns but require more computational resources'
        },
        {
            element: elements.randomSeed,
            text: 'Using the same seed ensures you get identical results for experiments'
        }
    ];
    
    tips.forEach(tip => {
        tip.element.title = tip.text;
    });
}

// Show data quality warnings
function checkDataQuality() {
    const issues = generator.validate();
    if (issues.length > 0) {
        console.warn('Data quality issues:', issues);
        // Could show warning in UI
    }
    
    // Show statistics
    const stats = generator.getStatistics();
    console.log('Dataset Statistics:', stats);
}

// Enhanced updateStats with quality checks
function updateStats() {
    const data = generator.data;
    if (data.length === 0) return;
    
    // Run validation
    checkDataQuality();
    
    const features = generator.features;
    const labels = generator.labels;
    
    let statsHTML = '';
    
    // Basic info
    statsHTML += `
        <div class="stat-item">
            <div class="stat-label">Total Points</div>
            <div class="stat-value">${data.length}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Features</div>
            <div class="stat-value">${features.length}</div>
        </div>
    `;
    
    // Feature statistics with quality indicators
    features.forEach(feature => {
        const values = data.map(d => d[feature]).filter(v => typeof v === 'number');
        if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
            
            // Quality indicator
            let quality = 'good';
            let qualityText = 'Normal range';
            
            if (std === 0) {
                quality = 'warning';
                qualityText = 'No variation';
            } else if (std / Math.abs(mean) > 1) {
                quality = 'warning';
                qualityText = 'High variance';
            }
            
            statsHTML += `
                <div class="stat-item">
                    <div class="stat-label">${feature}</div>
                    <div class="stat-value">${min.toFixed(1)} to ${max.toFixed(1)}</div>
                    <div class="quality-indicator ${quality}">${qualityText}</div>
                </div>
            `;
        }
    });
    
    // Type-specific stats
    if (generator.type === 'classification') {
        const classes = [...new Set(data.map(d => d.group))].sort();
        const classCounts = {};
        classes.forEach(c => {
            classCounts[c] = data.filter(d => d.group === c).length;
        });
        
        statsHTML += `
            <div class="stat-item">
                <div class="stat-label">Groups</div>
                <div class="stat-value">${classes.length}</div>
            </div>
        `;
        
        const counts = Object.values(classCounts);
        const balanceRatio = Math.min(...counts) / Math.max(...counts);
        
        // Balance quality indicator
        let balanceQuality = 'good';
        let balanceText = 'Balanced';
        if (balanceRatio < 0.3) {
            balanceQuality = 'warning';
            balanceText = 'Imbalanced';
        } else if (balanceRatio < 0.7) {
            balanceQuality = 'caution';
            balanceText = 'Slightly imbalanced';
        }
        
        statsHTML += `
            <div class="stat-item">
                <div class="stat-label">Balance</div>
                <div class="stat-value">${balanceRatio.toFixed(2)}</div>
                <div class="quality-indicator ${balanceQuality}">${balanceText}</div>
            </div>
        `;
    } 
    else if (generator.type === 'clustering') {
        const clusters = [...new Set(data.map(d => d.natural_cluster))].sort();
        statsHTML += `
            <div class="stat-item">
                <div class="stat-label">Clusters</div>
                <div class="stat-value">${clusters.length}</div>
            </div>
        `;
    }
    
    elements.statsContainer.innerHTML = statsHTML;
}

// Add quality indicator styles to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    .quality-indicator {
        font-size: 0.7rem;
        padding: 2px 6px;
        border-radius: 10px;
        margin-top: 4px;
    }
    .quality-indicator.good {
        background: #dcfce7;
        color: #166534;
    }
    .quality-indicator.warning {
        background: #fef3c7;
        color: #92400e;
    }
    .quality-indicator.caution {
        background: #dbeafe;
        color: #1e40af;
    }
`;
document.head.appendChild(style);

window.addEventListener('resize', () => {
    visualizer.resize();
    if (generator.data.length > 0) {
        visualizer.draw(generator.data, generator.type, generator.features, generator.labels);
    }
});

// Mobile-specific optimizations
function applyMobileOptimizations() {
    if (isMobile) {
        // Add viewport meta tag if not present
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
            viewport = document.createElement('meta');
            viewport.name = 'viewport';
            document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // Add mobile-specific CSS class
        document.body.classList.add('mobile-device');
        
        // Adjust visualization height for mobile
        const vizContainer = document.querySelector('.visualization-container');
        if (vizContainer) {
            if (window.innerWidth < 768) {
                vizContainer.style.height = '250px';
            } else if (window.innerWidth < 480) {
                vizContainer.style.height = '200px';
            }
        }
        
        // Add touch feedback to buttons
        document.querySelectorAll('button').forEach(button => {
            button.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            button.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
}

// Add touch feedback CSS
const touchStyle = document.createElement('style');
touchStyle.textContent = `
    @media (hover: none) and (pointer: coarse) {
        button.touch-active {
            transform: scale(0.95);
            opacity: 0.8;
        }
        
        .control-group:active {
            background-color: rgba(37, 99, 235, 0.1) !important;
        }
    }
`;
document.head.appendChild(touchStyle);

// Handle orientation changes
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        visualizer.resize();
        if (generator.data.length > 0) {
            visualizer.draw(generator.data, generator.type, generator.features, generator.labels);
        }
    }, 100);
});

// Initialize
updateControlVisibility();
addEducationalTips();
applyMobileOptimizations();