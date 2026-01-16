// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Initialize controls
    initializeControls();
    initializePresets();
    initializeLayers();
    
    // Event listeners
    setupEventListeners();
    
    // Update preview initially
    updatePreview();
});

// Shadow layers array
let shadowLayers = [
    {
        id: 1,
        offsetX: 10,
        offsetY: 10,
        blurRadius: 20,
        spreadRadius: 0,
        color: '#000000',
        opacity: 0.3,
        inset: false
    }
];

let activeLayerIndex = 0;

// DOM Elements
let offsetXSlider, offsetYSlider, blurRadiusSlider, spreadRadiusSlider, opacitySlider;
let shadowColorPicker, boxColorPicker, bgColorPicker;
let offsetXValue, offsetYValue, blurRadiusValue, spreadRadiusValue, opacityValue;
let shadowColorValue, boxColorValue, bgColorValue;
let previewBox, cssCode, layersList, shadowLayersDisplay;

function initializeControls() {
    // Get slider elements
    offsetXSlider = document.getElementById('offsetX');
    offsetYSlider = document.getElementById('offsetY');
    blurRadiusSlider = document.getElementById('blurRadius');
    spreadRadiusSlider = document.getElementById('spreadRadius');
    opacitySlider = document.getElementById('opacity');
    
    // Get color pickers
    shadowColorPicker = document.getElementById('shadowColor');
    boxColorPicker = document.getElementById('boxColor');
    bgColorPicker = document.getElementById('bgColor');
    
    // Get value displays
    offsetXValue = document.getElementById('offsetXValue');
    offsetYValue = document.getElementById('offsetYValue');
    blurRadiusValue = document.getElementById('blurRadiusValue');
    spreadRadiusValue = document.getElementById('spreadRadiusValue');
    opacityValue = document.getElementById('opacityValue');
    
    shadowColorValue = document.getElementById('shadowColorValue');
    boxColorValue = document.getElementById('boxColorValue');
    bgColorValue = document.getElementById('bgColorValue');
    
    // Get other elements
    previewBox = document.getElementById('previewBox');
    cssCode = document.getElementById('cssCode');
    layersList = document.getElementById('layersList');
    shadowLayersDisplay = document.getElementById('shadowLayersDisplay');
    
    // Set initial values
    updateValueDisplays();
}

function updateValueDisplays() {
    const activeLayer = shadowLayers[activeLayerIndex];
    
    offsetXValue.textContent = `${activeLayer.offsetX}px`;
    offsetYValue.textContent = `${activeLayer.offsetY}px`;
    blurRadiusValue.textContent = `${activeLayer.blurRadius}px`;
    spreadRadiusValue.textContent = `${activeLayer.spreadRadius}px`;
    opacityValue.textContent = activeLayer.opacity.toFixed(2);
    
    shadowColorValue.textContent = activeLayer.color;
    boxColorValue.textContent = boxColorPicker.value;
    bgColorValue.textContent = bgColorPicker.value;
    
    // Update sliders and color pickers
    offsetXSlider.value = activeLayer.offsetX;
    offsetYSlider.value = activeLayer.offsetY;
    blurRadiusSlider.value = activeLayer.blurRadius;
    spreadRadiusSlider.value = activeLayer.spreadRadius;
    opacitySlider.value = activeLayer.opacity;
    shadowColorPicker.value = activeLayer.color;
}

function updatePreview() {
    const activeLayer = shadowLayers[activeLayerIndex];
    
    // Update box color
    previewBox.style.backgroundColor = boxColorPicker.value;
    
    // Update background color
    document.querySelector('.preview-container').style.backgroundColor = bgColorPicker.value;
    
    // Generate CSS shadow
    const shadowCSS = generateShadowCSS();
    previewBox.style.boxShadow = shadowCSS;
    
    // Update code display
    cssCode.textContent = `box-shadow: ${shadowCSS};`;
    
    // Update layers display
    updateLayersDisplay();
    updateLayersList();
}

function generateShadowCSS() {
    return shadowLayers.map(layer => {
        const rgbaColor = hexToRgba(layer.color, layer.opacity);
        const inset = layer.inset ? 'inset ' : '';
        return `${inset}${layer.offsetX}px ${layer.offsetY}px ${layer.blurRadius}px ${layer.spreadRadius}px ${rgbaColor}`;
    }).join(', ');
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function updateLayersDisplay() {
    shadowLayersDisplay.innerHTML = '';
    
    shadowLayers.forEach((layer, index) => {
        if (index === activeLayerIndex) return; // Skip active layer (already shown)
        
        const layerDiv = document.createElement('div');
        layerDiv.className = 'shadow-layer';
        layerDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 15px;
            background-color: ${hexToRgba(layer.color, layer.opacity)};
            filter: blur(${layer.blurRadius}px);
            transform: translate(${layer.offsetX}px, ${layer.offsetY}px) scale(${1 + layer.spreadRadius/100});
            z-index: ${index};
        `;
        shadowLayersDisplay.appendChild(layerDiv);
    });
}

function updateLayersList() {
    layersList.innerHTML = '';
    
    shadowLayers.forEach((layer, index) => {
        const layerItem = document.createElement('div');
        layerItem.className = `layer-item ${index === activeLayerIndex ? 'active' : ''}`;
        layerItem.innerHTML = `
            <div class="layer-info">
                <div class="layer-color" style="background-color: ${layer.color};"></div>
                <span>Layer ${index + 1}: ${layer.offsetX}px ${layer.offsetY}px ${layer.blurRadius}px</span>
            </div>
            <div class="layer-actions">
                <button class="layer-btn edit-layer" data-index="${index}" title="Edit">
                    <i class="ri-edit-line"></i>
                </button>
                <button class="layer-btn delete-layer" data-index="${index}" title="Delete">
                    <i class="ri-delete-bin-line"></i>
                </button>
                <button class="layer-btn ${layer.inset ? 'inset-active' : ''}" data-index="${index}" title="Toggle Inset">
                    <i class="ri-square-line"></i>
                </button>
            </div>
        `;
        layersList.appendChild(layerItem);
    });
    
    // Add event listeners to layer buttons
    document.querySelectorAll('.edit-layer').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            setActiveLayer(index);
        });
    });
    
    document.querySelectorAll('.delete-layer').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            deleteLayer(index);
        });
    });
    
    document.querySelectorAll('.layer-btn[title="Toggle Inset"]').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            toggleInset(index);
        });
    });
}

function setActiveLayer(index) {
    activeLayerIndex = index;
    updateValueDisplays();
    updateLayersList();
    updatePreview();
}

function deleteLayer(index) {
    if (shadowLayers.length <= 1) {
        showNotification('Cannot delete the last layer');
        return;
    }
    
    shadowLayers.splice(index, 1);
    
    if (activeLayerIndex >= shadowLayers.length) {
        activeLayerIndex = shadowLayers.length - 1;
    }
    
    updateValueDisplays();
    updatePreview();
}

function toggleInset(index) {
    shadowLayers[index].inset = !shadowLayers[index].inset;
    updatePreview();
}

function addNewLayer() {
    const newLayer = {
        id: Date.now(),
        offsetX: 5,
        offsetY: 5,
        blurRadius: 15,
        spreadRadius: 0,
        color: '#000000',
        opacity: 0.2,
        inset: false
    };
    
    shadowLayers.push(newLayer);
    setActiveLayer(shadowLayers.length - 1);
}

function initializePresets() {
    const presets = {
        soft: { offsetX: 10, offsetY: 10, blurRadius: 30, spreadRadius: 0, opacity: 0.1 },
        hard: { offsetX: 5, offsetY: 5, blurRadius: 0, spreadRadius: 0, opacity: 0.5 },
        spread: { offsetX: 0, offsetY: 0, blurRadius: 20, spreadRadius: 10, opacity: 0.2 },
        inset: { offsetX: 0, offsetY: 0, blurRadius: 20, spreadRadius: -10, opacity: 0.2, inset: true },
        neon: { offsetX: 0, offsetY: 0, blurRadius: 20, spreadRadius: 0, opacity: 0.8, color: '#00ff88' },
        material: { offsetX: 0, offsetY: 2, blurRadius: 4, spreadRadius: 0, opacity: 0.1 },
        floating: { offsetX: 0, offsetY: 20, blurRadius: 50, spreadRadius: 0, opacity: 0.2 },
        layered: () => {
            shadowLayers = [
                { offsetX: 0, offsetY: 1, blurRadius: 2, spreadRadius: 0, color: '#000000', opacity: 0.1, inset: false },
                { offsetX: 0, offsetY: 2, blurRadius: 4, spreadRadius: 0, color: '#000000', opacity: 0.06, inset: false },
                { offsetX: 0, offsetY: 4, blurRadius: 6, spreadRadius: 0, color: '#000000', opacity: 0.04, inset: false }
            ];
            setActiveLayer(0);
            updatePreview();
        }
    };
    
    document.querySelectorAll('.preset-btn').forEach(button => {
        button.addEventListener('click', function() {
            const presetName = this.dataset.preset;
            
            if (presetName === 'layered') {
                presets.layered();
                return;
            }
            
            const preset = presets[presetName];
            
            shadowLayers[activeLayerIndex] = {
                ...shadowLayers[activeLayerIndex],
                ...preset
            };
            
            if (preset.color) {
                shadowLayers[activeLayerIndex].color = preset.color;
                shadowColorPicker.value = preset.color;
                shadowColorValue.textContent = preset.color;
            }
            
            updateValueDisplays();
            updatePreview();
            
            showNotification(`Applied ${presetName} preset`);
        });
    });
}

function initializeLayers() {
    updateLayersList();
}

function setupEventListeners() {
    // Slider events
    const sliders = [offsetXSlider, offsetYSlider, blurRadiusSlider, spreadRadiusSlider, opacitySlider];
    sliders.forEach(slider => {
        slider.addEventListener('input', function() {
            const value = this.id === 'opacity' ? parseFloat(this.value) : parseInt(this.value);
            shadowLayers[activeLayerIndex][this.id] = value;
            updateValueDisplays();
            updatePreview();
        });
    });
    
    // Color picker events
    shadowColorPicker.addEventListener('input', function() {
        shadowLayers[activeLayerIndex].color = this.value;
        shadowColorValue.textContent = this.value;
        updatePreview();
    });
    
    boxColorPicker.addEventListener('input', function() {
        boxColorValue.textContent = this.value;
        updatePreview();
    });
    
    bgColorPicker.addEventListener('input', function() {
        bgColorValue.textContent = this.value;
        updatePreview();
    });
    
    // Add layer button
    document.getElementById('addLayer').addEventListener('click', addNewLayer);
    
    // Copy CSS button
    document.getElementById('copyCSS').addEventListener('click', copyCSSToClipboard);
    
    // Reset button
    document.getElementById('resetAll').addEventListener('click', resetAll);
}

function copyCSSToClipboard() {
    const cssText = cssCode.textContent;
    
    navigator.clipboard.writeText(cssText).then(() => {
        showNotification('CSS copied to clipboard!');
        
        // Visual feedback
        const copyBtn = document.getElementById('copyCSS');
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="ri-check-line"></i> Copied!';
        copyBtn.style.background = '#00b894';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        showNotification('Failed to copy CSS');
    });
}

function resetAll() {
    shadowLayers = [{
        id: 1,
        offsetX: 10,
        offsetY: 10,
        blurRadius: 20,
        spreadRadius: 0,
        color: '#000000',
        opacity: 0.3,
        inset: false
    }];
    
    activeLayerIndex = 0;
    
    boxColorPicker.value = '#667eea';
    bgColorPicker.value = '#ffffff';
    
    updateValueDisplays();
    updatePreview();
    showNotification('All settings reset');
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #00b894;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;
    
    notification.innerHTML = `<i class="ri-check-line"></i> ${message}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .layer-item.active {
        border: 2px solid #667eea;
        background: #f8f9ff;
    }
    
    .inset-active {
        color: #667eea !important;
    }
`;
document.head.appendChild(style);