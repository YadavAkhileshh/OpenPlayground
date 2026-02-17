const gradientPreview = document.getElementById('gradientPreview');
const cssCode = document.getElementById('cssCode');
const angleSlider = document.getElementById('angleSlider');
const angleValue = document.getElementById('angleValue');
const randomBtn = document.getElementById('randomBtn');
const exportCssBtn = document.getElementById('exportCssBtn');
const exportImageBtn = document.getElementById('exportImageBtn');
const copyCssBtn = document.getElementById('copyCssBtn');
const addColorStopBtn = document.getElementById('addColorStop');
const colorStopsContainer = document.getElementById('colorStopsContainer');
const presetsContainer = document.getElementById('presetsContainer');
const typeOptions = document.querySelectorAll('.type-option');
const notification = document.getElementById('notification');
const currentYear = document.getElementById('currentYear');


let gradientData = {
    type: 'linear',
    angle: 90,
    colorStops: [
        { color: '#ff9a9e', position: 0 },
        { color: '#fad0c4', position: 100 }
    ]
};


const gradientPresets = [
    { name: 'Sunset', colors: ['#ff9a9e', '#fad0c4'], type: 'linear' },
    { name: 'Ocean', colors: ['#a1c4fd', '#c2e9fb'], type: 'linear' },
    { name: 'Emerald', colors: ['#43e97b', '#38f9d7'], type: 'linear' },
    { name: 'Purple Dream', colors: ['#fa709a', '#fee140'], type: 'linear' },
    { name: 'Midnight', colors: ['#4facfe', '#00f2fe'], type: 'linear' },
    { name: 'Cotton Candy', colors: ['#ff9a9e', '#fecfef'], type: 'radial' },
    { name: 'Radial Blue', colors: ['#4facfe', '#00f2fe'], type: 'radial' },
    { name: 'Conic Rainbow', colors: ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ff0000'], type: 'conic' },
    { name: 'Warm Flame', colors: ['#ff9a9e', '#fad0c4', '#fad0c4'], type: 'linear' },
    { name: 'Cool Blues', colors: ['#a1c4fd', '#c2e9fb', '#c2e9fb'], type: 'linear' },
    { name: 'Spring Warmth', colors: ['#fad0c4', '#ffd1ff'], type: 'linear' },
    { name: 'Deep Space', colors: ['#3a1c71', '#d76d77', '#ffaf7b'], type: 'radial' }
];


function init() {
    
    currentYear.textContent = new Date().getFullYear();
    
    renderColorStops();
    
    renderPresets();
    
    setupEventListeners();
    
    updateGradient();
}


function renderColorStops() {
    colorStopsContainer.innerHTML = '';
    
    gradientData.colorStops.forEach((stop, index) => {
        const colorStopElement = document.createElement('div');
        colorStopElement.className = 'color-stop';
        colorStopElement.innerHTML = `
            <div class="color-preview" style="background-color: ${stop.color};" data-index="${index}"></div>
            <input type="color" class="color-input" value="${stop.color}" data-index="${index}">
            <div class="position-control">
                <input type="range" class="position-slider" min="0" max="100" value="${stop.position}" data-index="${index}">
                <span class="position-value">${stop.position}%</span>
            </div>
            <button class="remove-stop" data-index="${index}" ${gradientData.colorStops.length <= 2 ? 'disabled' : ''}>
                <i class="fas fa-times"></i>
            </button>
        `;
        
        colorStopsContainer.appendChild(colorStopElement);
    });
    
    
    document.querySelectorAll('.color-preview').forEach(preview => {
        preview.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            document.querySelector(`.color-input[data-index="${index}"]`).click();
        });
    });
    
    document.querySelectorAll('.color-input').forEach(input => {
        input.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            gradientData.colorStops[index].color = this.value;
            updateGradient();
        });
    });
    
    document.querySelectorAll('.position-slider').forEach(slider => {
        slider.addEventListener('input', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const value = parseInt(this.value);
            gradientData.colorStops[index].position = value;
            this.parentElement.querySelector('.position-value').textContent = `${value}%`;
            updateGradient();
        });
    });
    
    document.querySelectorAll('.remove-stop').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            if (gradientData.colorStops.length > 2) {
                gradientData.colorStops.splice(index, 1);
                renderColorStops();
                updateGradient();
            }
        });
    });
}


function renderPresets() {
    presetsContainer.innerHTML = '';
    
    gradientPresets.forEach((preset, index) => {
        const presetElement = document.createElement('div');
        presetElement.className = 'preset';
        presetElement.setAttribute('data-index', index);
        
        
        let gradientString;
        if (preset.type === 'linear') {
            gradientString = `linear-gradient(90deg, ${preset.colors.join(', ')})`;
        } else if (preset.type === 'radial') {
            gradientString = `radial-gradient(circle, ${preset.colors.join(', ')})`;
        } else {
            gradientString = `conic-gradient(${preset.colors.join(', ')})`;
        }
        
        presetElement.style.background = gradientString;
        presetsContainer.appendChild(presetElement);
    });
}


function setupEventListeners() {
    
    angleSlider.addEventListener('input', function() {
        gradientData.angle = parseInt(this.value);
        angleValue.textContent = `${this.value}°`;
        updateGradient();
    });
    
    
    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            typeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            gradientData.type = this.getAttribute('data-type');
            updateGradient();
        });
    });
    
    
    addColorStopBtn.addEventListener('click', function() {
        
        const lastStop = gradientData.colorStops[gradientData.colorStops.length - 1];
        const newPosition = Math.floor((lastStop.position + 50) / 2);
        
        
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        
        gradientData.colorStops.push({
            color: randomColor,
            position: newPosition
        });
        
        
        gradientData.colorStops.sort((a, b) => a.position - b.position);
        
        renderColorStops();
        updateGradient();
    });
    
    
    randomBtn.addEventListener('click', generateRandomGradient);
    
    
    exportCssBtn.addEventListener('click', function() {
        const textArea = document.createElement('textarea');
        textArea.value = cssCode.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('CSS copied to clipboard!');
    });
    
    
    copyCssBtn.addEventListener('click', function() {
        const textArea = document.createElement('textarea');
        textArea.value = cssCode.textContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('CSS copied to clipboard!');
    });
    
    
    exportImageBtn.addEventListener('click', exportAsImage);
    
    
    presetsContainer.addEventListener('click', function(e) {
        const presetElement = e.target.closest('.preset');
        if (presetElement) {
            const index = parseInt(presetElement.getAttribute('data-index'));
            applyPreset(index);
            
            
            document.querySelectorAll('.preset').forEach(p => p.classList.remove('active'));
            presetElement.classList.add('active');
        }
    });
}


function updateGradient() {
    let gradientString;
    const colorsString = gradientData.colorStops
        .map(stop => `${stop.color} ${stop.position}%`)
        .join(', ');
    
    if (gradientData.type === 'linear') {
        gradientString = `linear-gradient(${gradientData.angle}deg, ${colorsString})`;
    } else if (gradientData.type === 'radial') {
        gradientString = `radial-gradient(circle, ${colorsString})`;
    } else {
        gradientString = `conic-gradient(from ${gradientData.angle}deg, ${colorsString})`;
    }
    
    
    gradientPreview.style.background = gradientString;
    
    
    cssCode.textContent = `background: ${gradientString};`;
}


function generateRandomGradient() {
    
    const types = ['linear', 'radial', 'conic'];
    gradientData.type = types[Math.floor(Math.random() * types.length)];
    
    
    typeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-type') === gradientData.type) {
            option.classList.add('active');
        }
    });
    
    
    gradientData.angle = Math.floor(Math.random() * 360);
    angleSlider.value = gradientData.angle;
    angleValue.textContent = `${gradientData.angle}°`;
    
    
    const numStops = Math.floor(Math.random() * 4) + 2;
    gradientData.colorStops = [];
    
    
    for (let i = 0; i < numStops; i++) {
        const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
        const position = Math.floor((i / (numStops - 1)) * 100);
        
        gradientData.colorStops.push({
            color: randomColor,
            position: position
        });
    }
    
    renderColorStops();
    updateGradient();
    
    showNotification('Random gradient generated!');
}


function applyPreset(index) {
    const preset = gradientPresets[index];
    
    
    gradientData.type = preset.type;
    typeOptions.forEach(option => {
        option.classList.remove('active');
        if (option.getAttribute('data-type') === preset.type) {
            option.classList.add('active');
        }
    });
    
    
    if (preset.type !== 'linear') {
        gradientData.angle = 0;
        angleSlider.value = 0;
        angleValue.textContent = '0°';
    }
    
    
    gradientData.colorStops = preset.colors.map((color, i) => ({
        color: color,
        position: Math.floor((i / (preset.colors.length - 1)) * 100)
    }));
    
    renderColorStops();
    updateGradient();
    
    showNotification(`"${preset.name}" preset applied!`);
}


function exportAsImage() {
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    
    canvas.width = 1200;
    canvas.height = 800;
    
    
    let gradient;
    if (gradientData.type === 'linear') {
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    } else if (gradientData.type === 'radial') {
        gradient = ctx.createRadialGradient(
            canvas.width/2, canvas.height/2, 0,
            canvas.width/2, canvas.height/2, Math.min(canvas.width, canvas.height)/2
        );
    } else {
        
        gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    }
    
    
    gradientData.colorStops.forEach(stop => {
        gradient.addColorStop(stop.position / 100, stop.color);
    });
    
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    
    const link = document.createElement('a');
    link.download = `gradient-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showNotification('Gradient image downloaded!');
}


function showNotification(message) {
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}


document.addEventListener('DOMContentLoaded', init);