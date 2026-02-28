document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const inputValue = document.getElementById('inputValue');
    const inputUnit = document.getElementById('inputUnit');
    const outputValue = document.getElementById('outputValue');
    const outputUnit = document.getElementById('outputUnit');
    const swapBtn = document.getElementById('swapBtn');
    const quickButtons = document.querySelectorAll('.quick-btn');
    const conversionTable = document.getElementById('conversionTable');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Conversion factors (base is KB)
    const conversionFactors = {
        'KB': 1,
        'MB': 1024,
        'GB': 1024 * 1024,
        'TB': 1024 * 1024 * 1024
    };

    // Unit labels
    const unitLabels = {
        'KB': 'Kilobyte',
        'MB': 'Megabyte',
        'GB': 'Gigabyte',
        'TB': 'Terabyte'
    };

    // State
    let history = [];
    const MAX_HISTORY = 10;

    // Initialize
    init();

    // Event Listeners
    inputValue.addEventListener('input', convert);
    inputUnit.addEventListener('change', convert);
    outputUnit.addEventListener('change', convert);
    
    swapBtn.addEventListener('click', swapUnits);
    clearHistoryBtn.addEventListener('click', clearHistory);
    resetBtn.addEventListener('click', resetAll);
    
    quickButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fromUnit = this.dataset.from;
            const toUnit = this.dataset.to;
            
            inputUnit.value = fromUnit;
            outputUnit.value = toUnit;
            
            convert();
        });
    });

    // Functions
    function init() {
        // Load history from localStorage
        loadHistory();
        
        // Initial conversion
        convert();
        
        // Populate conversion table
        updateConversionTable();
    }

    function convert() {
        const input = parseFloat(inputValue.value) || 0;
        const fromUnit = inputUnit.value;
        const toUnit = outputUnit.value;
        
        if (input < 0) {
            inputValue.value = 0;
            outputValue.value = '0';
            return;
        }
        
        // Convert to base unit (KB) first
        const valueInKB = input * conversionFactors[fromUnit];
        
        // Convert from base unit to target unit
        const result = valueInKB / conversionFactors[toUnit];
        
        // Format the result
        const formattedResult = formatNumber(result);
        
        // Update output
        outputValue.value = formattedResult;
        
        // Add to history
        addToHistory(input, fromUnit, result, toUnit);
        
        // Update conversion table
        updateConversionTable(input, fromUnit);
    }

    function formatNumber(num) {
        if (num === 0) return '0';
        
        // Format based on size
        if (num >= 1000000) {
            return num.toExponential(4);
        } else if (num >= 1000) {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });
        } else if (num >= 1) {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
            }).replace(/\.?0+$/, '');
        } else {
            // For very small numbers
            return num.toPrecision(6).replace(/\.?0+$/, '');
        }
    }

    function swapUnits() {
        const tempUnit = inputUnit.value;
        inputUnit.value = outputUnit.value;
        outputUnit.value = tempUnit;
        
        convert();
        
        // Add animation effect
        swapBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            swapBtn.style.transform = 'rotate(0deg)';
        }, 300);
    }

    function addToHistory(input, fromUnit, output, toUnit) {
        const historyItem = {
            id: Date.now(),
            input: input,
            fromUnit: fromUnit,
            output: output,
            toUnit: toUnit,
            time: new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
        
        history.unshift(historyItem);
        
        // Keep only last MAX_HISTORY items
        if (history.length > MAX_HISTORY) {
            history.pop();
        }
        
        updateHistoryDisplay();
        saveHistory();
    }

    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = `
                <div class="history-empty">
                    <i class="fas fa-clock"></i>
                    <p>No conversions yet</p>
                </div>
            `;
            return;
        }
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-conversion">
                    ${formatNumber(item.input)} ${item.fromUnit} → ${formatNumber(item.output)} ${item.toUnit}
                </div>
                <div class="history-time">${item.time}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    function updateConversionTable(baseValue = 1, baseUnit = 'GB') {
        conversionTable.innerHTML = '';
        
        const units = ['KB', 'MB', 'GB', 'TB'];
        
        units.forEach(unit => {
            const row = document.createElement('tr');
            
            // Calculate conversions
            const conversions = units.map(targetUnit => {
                if (unit === targetUnit) {
                    return formatNumber(baseValue);
                }
                
                const valueInKB = baseValue * conversionFactors[baseUnit];
                const result = valueInKB / conversionFactors[targetUnit];
                return formatNumber(result);
            });
            
            row.innerHTML = `
                <td>${unitLabels[unit]} (${unit})</td>
                <td>${conversions[0]}</td>
                <td>${conversions[1]}</td>
                <td>${conversions[2]}</td>
                <td>${conversions[3]}</td>
            `;
            
            // Highlight current unit row
            if (unit === baseUnit) {
                row.style.backgroundColor = 'rgba(42, 157, 143, 0.1)';
                row.style.fontWeight = '600';
            }
            
            conversionTable.appendChild(row);
        });
    }

    function clearHistory() {
        if (confirm('Clear all conversion history?')) {
            history = [];
            updateHistoryDisplay();
            saveHistory();
        }
    }

    function resetAll() {
        inputValue.value = '1';
        inputUnit.value = 'GB';
        outputUnit.value = 'MB';
        convert();
    }

    function saveHistory() {
        localStorage.setItem('fileSizeConverterHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const saved = localStorage.getItem('fileSizeConverterHistory');
        if (saved) {
            try {
                history = JSON.parse(saved);
                updateHistoryDisplay();
            } catch (e) {
                console.error('Error loading history:', e);
            }
        }
    }

    // Helper function for large number formatting
    function formatLargeNumber(num) {
        if (num >= 1e12) {
            return (num / 1e12).toFixed(2) + 'T';
        } else if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        }
        return num.toString();
    }
});