// Initialize Chart
let dataChart;
const chartColors = {
    vibrant: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'],
    pastel: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFDFBA', '#E0BBE4', '#FEC8D8', '#D5E5D5'],
    mono: ['#6C757D', '#868E96', '#ADB5BD', '#CED4DA', '#DEE2E6', '#E9ECEF', '#F8F9FA', '#FFFFFF'],
    earth: ['#8D6E63', '#A1887F', '#BCAAA4', '#D7CCC8', '#3E2723', '#5D4037', '#795548', '#A1887F']
};

const uploadedDatasets = new Map();

let isFileDialogOpen = false;

// Datasets
const datasets = {
    sales: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [450, 620, 750, 430, 520, 680, 810, 950, 600, 720, 850, 920],
        description: 'Monthly sales data for the current year. Shows seasonal trends with peaks in summer and end of year.'
    },
    expenses: {
        labels: ['Rent', 'Salaries', 'Marketing', 'Utilities', 'Software', 'Travel', 'Supplies', 'Training'],
        data: [12000, 45000, 8500, 3200, 2400, 5600, 1800, 4200],
        description: 'Company expense breakdown for the last quarter. Salaries represent the largest portion of expenses.'
    },
    population: {
        labels: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'],
        data: [8398748, 3990456, 2705994, 2325502, 1680992, 1584064, 1547253, 1425976],
        description: 'Population of major US cities based on latest census data. New York has the highest population.'
    },
    performance: {
        labels: ['Alex', 'Jamie', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Jordan', 'Quinn'],
        data: [85, 92, 78, 95, 88, 76, 90, 82],
        description: 'Team performance scores based on quarterly evaluation. Morgan has the highest performance score.'
    },
    custom: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        data: [450, 620, 750, 430, 520, 680, 810, 950, 600, 720, 850, 920],
        description: 'Custom data entered by the user. Update the values in the customization section below.'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeChart();
    setupEventListeners();
    updateDataTable();
    updateChartInfo();
});

// Initialize the chart with default data
function initializeChart() {
    const ctx = document.getElementById('data-chart').getContext('2d');
    const chartType = document.getElementById('chart-type').value;
    const dataset = document.getElementById('dataset').value;
    const colorScheme = document.getElementById('color-scheme').value;
    
    let currentData;
    if (uploadedDatasets.has(dataset)) {
        currentData = uploadedDatasets.get(dataset);
    } else {
        currentData = datasets[dataset];
    }
    
    // Destroy existing chart if it exists
    if (dataChart) {
        dataChart.destroy();
    }
    
    dataChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: currentData.labels,
            datasets: [{
                label: 'Data Values',
                data: currentData.data,
                backgroundColor: getChartColors(colorScheme, currentData.data.length),
                borderColor: chartColors.vibrant[0],
                borderWidth: chartType === 'bar' || chartType === 'line' ? 2 : 1,
                fill: chartType === 'line',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: parseInt(document.getElementById('animation-speed').value)
            },
            plugins: {
                legend: {
                    display: document.getElementById('show-legend').checked,
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: chartType === 'bar' || chartType === 'line' ? {
                x: {
                    grid: {
                        display: document.getElementById('show-grid').checked
                    },
                    ticks: {
                        display: document.getElementById('show-labels').checked
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        display: document.getElementById('show-grid').checked
                    },
                    ticks: {
                        display: document.getElementById('show-labels').checked
                    }
                }
            } : {},
            elements: {
                point: {
                    radius: chartType === 'line' ? 4 : 3
                }
            }
        }
    });
}

// Get colors based on selected scheme
function getChartColors(scheme, count) {
    const colors = chartColors[scheme];
    const result = [];
    
    for (let i = 0; i < count; i++) {
        result.push(colors[i % colors.length]);
    }
    
    return result;
}

function parseCSV(text) {
    const lines = text.trim().split('\n');
    const labels = [];
    const data = [];
    
    lines.forEach((line, index) => {
        if (line.trim() === '') return;
        
        const parts = line.split(',').map(part => part.trim());
        
        if (parts.length >= 2) {
            const label = parts[0];
            const value = parseFloat(parts[1]);
            
            if (!isNaN(value)) {
                labels.push(label);
                data.push(value);
            } else if (index === 0) {
                return;
            }
        }
    });
    
    return { labels, data };
}

function parseJSON(text) {
    try {
        const json = JSON.parse(text);
        const labels = [];
        const data = [];
        
        if (Array.isArray(json)) {
            json.forEach(item => {
                if (item.label && typeof item.value === 'number') {
                    labels.push(item.label);
                    data.push(item.value);
                } else if (Object.keys(item).length >= 2) {
                    const keys = Object.keys(item);
                    const label = item[keys[0]];
                    const value = parseFloat(item[keys[1]]);
                    
                    if (!isNaN(value)) {
                        labels.push(String(label));
                        data.push(value);
                    }
                }
            });
        } else if (typeof json === 'object') {
            if (json.labels && json.data && Array.isArray(json.labels) && Array.isArray(json.data)) {
                json.labels.forEach((label, index) => {
                    if (json.data[index] !== undefined) {
                        const value = parseFloat(json.data[index]);
                        if (!isNaN(value)) {
                            labels.push(String(label));
                            data.push(value);
                        }
                    }
                });
            } else {
                Object.entries(json).forEach(([key, value]) => {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        labels.push(key);
                        data.push(numValue);
                    }
                });
            }
        }
        
        return { labels, data };
    } catch (error) {
        throw new Error('Invalid JSON format: ' + error.message);
    }
}

function addUploadedDataset(name, data) {
    const datasetSelect = document.getElementById('dataset');
    const datasetId = 'uploaded_' + Date.now();
    
    uploadedDatasets.set(datasetId, {
        labels: data.labels,
        data: data.data,
        description: `Uploaded dataset: ${name}. Contains ${data.labels.length} data points.`
    });
    
    const option = document.createElement('option');
    option.value = datasetId;
    option.textContent = `📁 ${name}`;
    datasetSelect.appendChild(option);
    
    datasetSelect.value = datasetId;
    
    return datasetId;
}

function showUploadStatus(message, type = 'info') {
    const statusDiv = document.getElementById('upload-status');
    statusDiv.textContent = message;
    statusDiv.className = 'upload-status ' + type;
    
    setTimeout(() => {
        if (statusDiv.textContent === message) {
            statusDiv.textContent = '';
            statusDiv.className = 'upload-status';
        }
    }, 5000);
}

function handleFileUpload(file, type) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            let parsedData;
            
            if (type === 'csv') {
                parsedData = parseCSV(content);
                if (parsedData.labels.length === 0) {
                    throw new Error('CSV must contain label and value columns');
                }
            } else {
                parsedData = parseJSON(content);
            }
            
            if (parsedData.labels.length === 0 || parsedData.data.length === 0) {
                throw new Error('No valid data found in file');
            }
            
            if (parsedData.labels.length !== parsedData.data.length) {
                throw new Error('Number of labels and values must match');
            }
            
            const datasetId = addUploadedDataset(file.name, parsedData);
            
            initializeChart();
            updateDataTable();
            updateChartInfo();
            
            showUploadStatus(`Successfully uploaded ${file.name} with ${parsedData.labels.length} data points`, 'success');
            
        } catch (error) {
            showUploadStatus(`Error parsing ${file.name}: ${error.message}`, 'error');
            console.error('File parsing error:', error);
        }
    };
    
    reader.onerror = function() {
        showUploadStatus(`Error reading file: ${file.name}`, 'error');
    };
    
    reader.readAsText(file);
}

function setupFileInputHandler(fileInputId, buttonId, fileType) {
    const fileInput = document.getElementById(fileInputId);
    const button = document.getElementById(buttonId);
    
    let isProcessing = false;
    
    button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (isProcessing || isFileDialogOpen) {
            return;
        }
        
        isProcessing = true;
        isFileDialogOpen = true;
        
        fileInput.value = '';
        
        fileInput.click();
        
        setTimeout(() => {
            isProcessing = false;
        }, 300);
    });
    
    fileInput.addEventListener('change', function(e) {
        isFileDialogOpen = false;
        const file = e.target.files[0];
        if (file) {
            if (fileType === 'csv') {
                if (file.type !== 'text/csv' && !file.name.toLowerCase().endsWith('.csv')) {
                    showUploadStatus('Please select a valid CSV file', 'error');
                    return;
                }
            } else {
                if (file.type !== 'application/json' && !file.name.toLowerCase().endsWith('.json')) {
                    showUploadStatus('Please select a valid JSON file', 'error');
                    return;
                }
            }
            handleFileUpload(file, fileType);
        }
    });
    
    window.addEventListener('focus', function() {
        setTimeout(() => {
            isFileDialogOpen = false;
        }, 300);
    });
}

// Set up event listeners for controls
function setupEventListeners() {
    // Update chart button
    document.getElementById('update-chart').addEventListener('click', function() {
        initializeChart();
        updateDataTable();
        updateChartInfo();
    });
    
    // Export chart button
    document.getElementById('export-chart').addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = 'data-visualization.png';
        link.href = document.getElementById('data-chart').toDataURL('image/png');
        link.click();
    });
    
    // Randomize data button
    document.getElementById('random-data').addEventListener('click', function() {
        const dataset = document.getElementById('dataset').value;
        let currentData;
        
        if (uploadedDatasets.has(dataset)) {
            currentData = uploadedDatasets.get(dataset);
        } else {
            currentData = datasets[dataset];
        }
        
        // Generate random data
        for (let i = 0; i < currentData.data.length; i++) {
            currentData.data[i] = Math.floor(Math.random() * 1000) + 100;
        }
        
        // If custom dataset, update the input field
        if (dataset === 'custom') {
            document.getElementById('custom-values').value = currentData.data.join(', ');
        }
        
        initializeChart();
        updateDataTable();
        updateChartInfo();
    });
    
    // Apply custom data button
    document.getElementById('apply-custom-data').addEventListener('click', function() {
        const labels = document.getElementById('custom-labels').value.split(',').map(label => label.trim());
        const values = document.getElementById('custom-values').value.split(',').map(value => parseFloat(value.trim())).filter(value => !isNaN(value));
        
        // Ensure we have the same number of labels and values
        const minLength = Math.min(labels.length, values.length);
        datasets.custom.labels = labels.slice(0, minLength);
        datasets.custom.data = values.slice(0, minLength);
        
        // Switch to custom dataset
        document.getElementById('dataset').value = 'custom';
        
        initializeChart();
        updateDataTable();
        updateChartInfo();
    });
    
    // Animation speed slider
    document.getElementById('animation-speed').addEventListener('input', function() {
        document.querySelector('.range-value').textContent = this.value + 'ms';
    });
    
    // Dataset selector - update custom data fields when custom is selected
    document.getElementById('dataset').addEventListener('change', function() {
        const dataset = this.value;
        
        if (uploadedDatasets.has(dataset)) {
            const currentData = uploadedDatasets.get(dataset);
            document.getElementById('custom-labels').value = currentData.labels.join(', ');
            document.getElementById('custom-values').value = currentData.data.join(', ');
        } else if (dataset === 'custom') {
            const currentData = datasets[dataset];
            document.getElementById('custom-labels').value = currentData.labels.join(', ');
            document.getElementById('custom-values').value = currentData.data.join(', ');
        }
    });
    
    setupFileInputHandler('csv-upload', 'csv-upload-btn', 'csv');
    setupFileInputHandler('json-upload', 'json-upload-btn', 'json');
    
    document.getElementById('csv-upload').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    document.getElementById('json-upload').addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// Update the data table
function updateDataTable() {
    const dataset = document.getElementById('dataset').value;
    let currentData;
    
    if (uploadedDatasets.has(dataset)) {
        currentData = uploadedDatasets.get(dataset);
    } else {
        currentData = datasets[dataset];
    }
    
    const tableBody = document.querySelector('#data-table tbody');
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Add new rows
    for (let i = 0; i < currentData.labels.length; i++) {
        const row = document.createElement('tr');
        
        // Calculate change from previous value (if available)
        let change = '';
        if (i > 0) {
            const diff = currentData.data[i] - currentData.data[i-1];
            const percentChange = ((diff / currentData.data[i-1]) * 100).toFixed(1);
            
            if (diff > 0) {
                change = `<span style="color: #2ecc71;"><i class="fas fa-arrow-up"></i> ${percentChange}%</span>`;
            } else if (diff < 0) {
                change = `<span style="color: #e74c3c;"><i class="fas fa-arrow-down"></i> ${Math.abs(percentChange)}%</span>`;
            } else {
                change = `<span style="color: #7f8c8d;"><i class="fas fa-minus"></i> 0%</span>`;
            }
        } else {
            change = '<span style="color: #7f8c8d;">-</span>';
        }
        
        row.innerHTML = `
            <td>${currentData.labels[i]}</td>
            <td>${typeof currentData.data[i] === 'number' ? currentData.data[i].toLocaleString() : currentData.data[i]}</td>
            <td>${change}</td>
        `;
        
        tableBody.appendChild(row);
    }
}

// Update chart info panel
function updateChartInfo() {
    const dataset = document.getElementById('dataset').value;
    const chartType = document.getElementById('chart-type').value;
    let currentData;
    
    if (uploadedDatasets.has(dataset)) {
        currentData = uploadedDatasets.get(dataset);
    } else {
        currentData = datasets[dataset];
    }
    
    // Update description
    document.getElementById('chart-description').textContent = currentData.description;
    
    // Calculate stats
    const dataPoints = currentData.data.length;
    const maxValue = Math.max(...currentData.data);
    const minValue = Math.min(...currentData.data);
    const averageValue = (currentData.data.reduce((a, b) => a + b, 0) / dataPoints).toFixed(1);
    
    // Update stat values
    document.getElementById('data-points').textContent = dataPoints;
    document.getElementById('max-value').textContent = maxValue.toLocaleString();
    document.getElementById('min-value').textContent = minValue.toLocaleString();
    document.getElementById('average-value').textContent = averageValue.toLocaleString();
    
    // Update chart type description
    let typeDescription = '';
    switch(chartType) {
        case 'bar':
            typeDescription = 'Bar charts are used to compare data across categories. Each bar\'s length is proportional to the value it represents.';
            break;
        case 'line':
            typeDescription = 'Line charts are ideal for showing trends over time. They connect individual data points to show continuity.';
            break;
        case 'pie':
            typeDescription = 'Pie charts show parts of a whole. Each slice represents a proportion of the total value.';
            break;
        case 'doughnut':
            typeDescription = 'Doughnut charts are similar to pie charts but with a hole in the center, making them useful for comparing multiple datasets.';
            break;
        case 'radar':
            typeDescription = 'Radar charts display multivariate data on axes starting from the same point. Useful for comparing multiple quantitative variables.';
            break;
        case 'polar':
            typeDescription = 'Polar area charts are similar to pie charts but each segment has equal angles, with the radius showing the value.';
            break;
    }
    
    document.getElementById('chart-description').textContent = typeDescription + ' ' + currentData.description;
}