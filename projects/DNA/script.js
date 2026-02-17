function analyzeDNA() {
    const input = document.getElementById('dnaInput').value.toUpperCase().replace(/\s/g, '');
    
    if (!input) {
        alert('Please enter a DNA sequence!');
        return;
    }
    
    if (!/^[ATGC]+$/.test(input)) {
        alert('Invalid DNA sequence! Only A, T, G, C are allowed.');
        return;
    }
    
    // Count bases
    const counts = {
        A: (input.match(/A/g) || []).length,
        T: (input.match(/T/g) || []).length,
        G: (input.match(/G/g) || []).length,
        C: (input.match(/C/g) || []).length
    };
    
    // Update stats
    document.getElementById('length').textContent = input.length;
    document.getElementById('adenine').textContent = counts.A;
    document.getElementById('thymine').textContent = counts.T;
    document.getElementById('guanine').textContent = counts.G;
    document.getElementById('cytosine').textContent = counts.C;
    
    // Calculate GC content
    const gcContent = ((counts.G + counts.C) / input.length * 100).toFixed(1);
    document.getElementById('gcContent').textContent = gcContent + '%';
    
    // Show results
    document.getElementById('resultsSection').classList.add('active');
    
    // Create chart
    createChart(counts);
    
    // Generate complement
    generateComplement(input);
    
    // Detect patterns
    detectPatterns(input);
}

function createChart(counts) {
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = '';
    
    const maxCount = Math.max(counts.A, counts.T, counts.G, counts.C);
    const colors = {
        A: '#e74c3c',
        T: '#3498db',
        G: '#2ecc71',
        C: '#f39c12'
    };
    
    for (const [base, count] of Object.entries(counts)) {
        const height = (count / maxCount) * 100;
        const bar = document.createElement('div');
        bar.className = 'chart-bar';
        bar.style.height = height + '%';
        bar.style.background = `linear-gradient(to top, ${colors[base]}, ${colors[base]}dd)`;
        
        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = base;
        
        const value = document.createElement('div');
        value.className = 'chart-value';
        value.textContent = count;
        
        bar.appendChild(label);
        bar.appendChild(value);
        chartContainer.appendChild(bar);
    }
}

function generateComplement(sequence) {
    const complement = {
        'A': 'T',
        'T': 'A',
        'G': 'C',
        'C': 'G'
    };
    
    let complementStrand = '';
    for (let base of sequence) {
        const complementBase = complement[base];
        complementStrand += `<span class="base-${base.toLowerCase()}">${complementBase}</span>`;
    }
    
    document.getElementById('complementStrand').innerHTML = complementStrand;
}

function detectPatterns(sequence) {
    const container = document.getElementById('mutationsContainer');
    const patterns = [];
    
    // Check for repeats
    const repeatMatch = sequence.match(/(.{3,})\1+/g);
    if (repeatMatch) {
        patterns.push(`🔁 Tandem repeats detected: ${repeatMatch.join(', ')}`);
    }
    
    // Check for palindromes
    for (let i = 0; i < sequence.length - 5; i++) {
        const segment = sequence.substr(i, 6);
        const reversed = segment.split('').reverse().join('');
        if (segment === reversed) {
            patterns.push(`🔄 Palindrome found at position ${i + 1}: ${segment}`);
        }
    }
    
    // Check for high GC regions
    for (let i = 0; i < sequence.length - 9; i++) {
        const window = sequence.substr(i, 10);
        const gc = (window.match(/[GC]/g) || []).length;
        if (gc >= 8) {
            patterns.push(`⚡ High GC region (${gc * 10}%) at position ${i + 1}: ${window}`);
        }
    }
    
    if (patterns.length === 0) {
        container.innerHTML = '<div class="no-mutations">✓ No unusual patterns detected</div>';
    } else {
        container.innerHTML = patterns.map(p => `<div class="mutation-item">${p}</div>`).join('');
    }
}

function generateRandomDNA() {
    const bases = ['A', 'T', 'G', 'C'];
    const length = Math.floor(Math.random() * 50) + 50;
    let sequence = '';
    
    for (let i = 0; i < length; i++) {
        sequence += bases[Math.floor(Math.random() * 4)];
    }
    
    document.getElementById('dnaInput').value = sequence;
}

function clearAll() {
    document.getElementById('dnaInput').value = '';
    document.getElementById('resultsSection').classList.remove('active');
}
