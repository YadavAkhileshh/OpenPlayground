document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const iconPreview = document.getElementById('iconPreview');
    const previewBackground = document.getElementById('previewBackground');
    const svgCode = document.getElementById('svgCode');
    const fullSvgCode = document.getElementById('fullSvgCode');
    
    // Preview elements
    const previewRect = document.getElementById('previewRect');
    const previewCircle = document.getElementById('previewCircle');
    const previewPolygon = document.getElementById('previewPolygon');
    
    // Controls
    const shapeButtons = document.querySelectorAll('.shape-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Shape controls
    const shapeSize = document.getElementById('shapeSize');
    const shapeSizeValue = document.getElementById('shapeSizeValue');
    const shapeX = document.getElementById('shapeX');
    const shapeXValue = document.getElementById('shapeXValue');
    const shapeY = document.getElementById('shapeY');
    const shapeYValue = document.getElementById('shapeYValue');
    const cornerRadius = document.getElementById('cornerRadius');
    const cornerRadiusValue = document.getElementById('cornerRadiusValue');
    const points = document.getElementById('points');
    const pointsValue = document.getElementById('pointsValue');
    
    // Style controls
    const fillColor = document.getElementById('fillColor');
    const fillColorText = document.getElementById('fillColorText');
    const strokeColor = document.getElementById('strokeColor');
    const strokeColorText = document.getElementById('strokeColorText');
    const strokeWidth = document.getElementById('strokeWidth');
    const strokeWidthValue = document.getElementById('strokeWidthValue');
    const opacity = document.getElementById('opacity');
    const opacityValue = document.getElementById('opacityValue');
    const gradientType = document.getElementById('gradientType');
    const gradientControls = document.getElementById('gradientControls');
    const gradientStart = document.getElementById('gradientStart');
    const gradientStartText = document.getElementById('gradientStartText');
    const gradientEnd = document.getElementById('gradientEnd');
    const gradientEndText = document.getElementById('gradientEndText');
    
    // Advanced controls
    const viewboxWidth = document.getElementById('viewboxWidth');
    const viewboxHeight = document.getElementById('viewboxHeight');
    const svgId = document.getElementById('svgId');
    const svgClass = document.getElementById('svgClass');
    const rotation = document.getElementById('rotation');
    const rotationValue = document.getElementById('rotationValue');
    const scale = document.getElementById('scale');
    const scaleValue = document.getElementById('scaleValue');
    
    // Export controls
    const exportSize = document.getElementById('exportSize');
    const copySvg = document.getElementById('copySvg');
    const downloadSvg = document.getElementById('downloadSvg');
    const downloadPng = document.getElementById('downloadPng');
    
    // Other buttons
    const refreshPreview = document.getElementById('refreshPreview');
    const centerIcon = document.getElementById('centerIcon');
    const generateCode = document.getElementById('generateCode');
    const copyCode = document.getElementById('copyCode');
    const toggleCode = document.getElementById('toggleCode');
    const resetAll = document.getElementById('resetAll');
    const exportAll = document.getElementById('exportAll');
    
    // Presets
    const presetItems = document.querySelectorAll('.preset-item');
    const presetName = document.getElementById('presetName');
    const savePreset = document.getElementById('savePreset');
    const savedPresets = document.getElementById('savedPresets');
    
    // Modal
    const codeModal = document.getElementById('codeModal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    const modalCopyCode = document.getElementById('modalCopyCode');
    
    // Toast
    const toast = document.getElementById('toast');
    
    // State
    let currentShape = 'rectangle';
    let currentPresets = JSON.parse(localStorage.getItem('svgIconPresets') || '[]');
    let isCodeVisible = true;
    
    // Initialize the app
    function initApp() {
        setupEventListeners();
        updatePreview();
        updateCode();
        loadSavedPresets();
        updateControlVisibility();
        
        // Show initial toast
        showToast('SVG Icon Generator Ready! Customize and export your icons.', 'info');
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Tab switching
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding tab pane
                tabPanes.forEach(pane => pane.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
        
        // Shape selection
        shapeButtons.forEach(button => {
            button.addEventListener('click', function() {
                shapeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentShape = this.dataset.shape;
                updateControlVisibility();
                updatePreview();
                updateCode();
            });
        });
        
        // Shape property controls
        shapeSize.addEventListener('input', function() {
            shapeSizeValue.textContent = this.value;
            updatePreview();
            updateCode();
        });
        
        shapeX.addEventListener('input', function() {
            shapeXValue.textContent = this.value;
            updatePreview();
            updateCode();
        });
        
        shapeY.addEventListener('input', function() {
            shapeYValue.textContent = this.value;
            updatePreview();
            updateCode();
        });
        
        cornerRadius.addEventListener('input', function() {
            cornerRadiusValue.textContent = this.value;
            updatePreview();
            updateCode();
        });
        
        points.addEventListener('input', function() {
            pointsValue.textContent = this.value;
            updatePreview();
            updateCode();
        });
        
        // Style controls
        fillColor.addEventListener('input', function() {
            fillColorText.value = this.value;
            updatePreview();
            updateCode();
        });
        
        fillColorText.addEventListener('input', function() {
            if (this.value.match(/^#[0-9A-F]{6}$/i)) {
                fillColor.value = this.value;
                updatePreview();
                updateCode();
            }
        });
        
        strokeColor.addEventListener('input', function() {
            strokeColorText.value = this.value;
            updatePreview();
            updateCode();
        });
        
        strokeColorText.addEventListener('input', function() {
            if (this.value.match(/^#[0-9A-F]{6}$/i)) {
                strokeColor.value = this.value;
                updatePreview();
                updateCode();
            }
        });
        
        strokeWidth.addEventListener('input', function() {
            strokeWidthValue.textContent = this.value;
            updatePreview();
            updateCode();
        });
        
        opacity.addEventListener('input', function() {
            opacityValue.textContent = parseFloat(this.value).toFixed(1);
            updatePreview();
            updateCode();
        });
        
        gradientType.addEventListener('change', function() {
            gradientControls.style.display = this.value === 'none' ? 'none' : 'block';
            updatePreview();
            updateCode();
        });
        
        gradientStart.addEventListener('input', function() {
            gradientStartText.value = this.value;
            updatePreview();
            updateCode();
        });
        
        gradientStartText.addEventListener('input', function() {
            if (this.value.match(/^#[0-9A-F]{6}$/i)) {
                gradientStart.value = this.value;
                updatePreview();
                updateCode();
            }
        });
        
        gradientEnd.addEventListener('input', function() {
            gradientEndText.value = this.value;
            updatePreview();
            updateCode();
        });
        
        gradientEndText.addEventListener('input', function() {
            if (this.value.match(/^#[0-9A-F]{6}$/i)) {
                gradientEnd.value = this.value;
                updatePreview();
                updateCode();
            }
        });
        
        // Advanced controls
        viewboxWidth.addEventListener('input', updatePreview);
        viewboxHeight.addEventListener('input', updatePreview);
        svgId.addEventListener('input', updateCode);
        svgClass.addEventListener('input', updateCode);
        rotation.addEventListener('input', function() {
            rotationValue.textContent = `${this.value}°`;
            updatePreview();
            updateCode();
        });
        
        scale.addEventListener('input', function() {
            scaleValue.textContent = parseFloat(this.value).toFixed(1);
            updatePreview();
            updateCode();
        });
        
        // Export buttons
        copySvg.addEventListener('click', copySvgToClipboard);
        downloadSvg.addEventListener('click', downloadSvgFile);
        downloadPng.addEventListener('click', downloadPngFile);
        
        // Other buttons
        refreshPreview.addEventListener('click', function() {
            updatePreview();
            showToast('Preview refreshed', 'info');
        });
        
        centerIcon.addEventListener('click', centerIconInViewbox);
        generateCode.addEventListener('click', showCodeModal);
        copyCode.addEventListener('click', copyCodeToClipboard);
        toggleCode.addEventListener('click', toggleCodeVisibility);
        resetAll.addEventListener('click', resetAllSettings);
        exportAll.addEventListener('click', exportAllPresets);
        
        // Presets
        presetItems.forEach(item => {
            item.addEventListener('click', function() {
                applyPreset(this.dataset.preset);
            });
        });
        
        savePreset.addEventListener('click', saveCurrentPreset);
        
        // Modal
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                codeModal.classList.remove('show');
            });
        });
        
        modalCopyCode.addEventListener('click', function() {
            copyToClipboard(fullSvgCode.textContent, 'SVG code');
            codeModal.classList.remove('show');
        });
        
        // Close modal on outside click
        codeModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
            }
        });
    }
    
    // Update control visibility based on selected shape
    function updateControlVisibility() {
        const cornerRadiusControl = document.getElementById('cornerRadiusControl');
        const pointsControl = document.getElementById('pointsControl');
        
        // Show/hide corner radius for rectangle
        cornerRadiusControl.style.display = currentShape === 'rectangle' ? 'block' : 'none';
        
        // Show/hide points for polygon shapes
        pointsControl.style.display = currentShape === 'hexagon' || currentShape === 'star' ? 'block' : 'none';
        
        // Update points range based on shape
        if (currentShape === 'hexagon') {
            points.min = 6;
            points.max = 6;
            points.value = 6;
            pointsValue.textContent = '6';
        } else if (currentShape === 'star') {
            points.min = 5;
            points.max = 10;
            points.value = 5;
            pointsValue.textContent = '5';
        }
    }
    
    // Update the SVG preview
    function updatePreview() {
        const width = parseInt(viewboxWidth.value);
        const height = parseInt(viewboxHeight.value);
        const size = parseInt(shapeSize.value);
        const x = parseInt(shapeX.value);
        const y = parseInt(shapeY.value);
        const radius = parseInt(cornerRadius.value);
        const pointsCount = parseInt(points.value);
        const rot = parseInt(rotation.value);
        const sc = parseFloat(scale.value);
        
        // Update SVG viewBox
        iconPreview.setAttribute('viewBox', `0 0 ${width} ${height}`);
        iconPreview.setAttribute('width', width);
        iconPreview.setAttribute('height', height);
        
        // Update preview info
        document.getElementById('previewSize').textContent = `${width}×${height}px`;
        document.getElementById('previewViewBox').textContent = `0 0 ${width} ${height}`;
        
        // Hide all shapes first
        previewRect.style.display = 'none';
        previewCircle.style.display = 'none';
        previewPolygon.style.display = 'none';
        
        // Get current shape element
        let shapeElement;
        switch(currentShape) {
            case 'rectangle':
                shapeElement = previewRect;
                previewRect.style.display = 'block';
                previewRect.setAttribute('x', x);
                previewRect.setAttribute('y', y);
                previewRect.setAttribute('width', size);
                previewRect.setAttribute('height', size);
                previewRect.setAttribute('rx', radius);
                break;
                
            case 'circle':
                shapeElement = previewCircle;
                previewCircle.style.display = 'block';
                previewCircle.setAttribute('cx', x + size/2);
                previewCircle.setAttribute('cy', y + size/2);
                previewCircle.setAttribute('r', size/2);
                break;
                
            case 'triangle':
                shapeElement = previewPolygon;
                previewPolygon.style.display = 'block';
                const triPoints = `${x + size/2},${y} ${x + size},${y + size} ${x},${y + size}`;
                previewPolygon.setAttribute('points', triPoints);
                break;
                
            case 'hexagon':
                shapeElement = previewPolygon;
                previewPolygon.style.display = 'block';
                const hexPoints = generatePolygonPoints(x + size/2, y + size/2, size/2, 6);
                previewPolygon.setAttribute('points', hexPoints);
                break;
                
            case 'star':
                shapeElement = previewPolygon;
                previewPolygon.style.display = 'block';
                const starPoints = generateStarPoints(x + size/2, y + size/2, size/2, size/4, pointsCount);
                previewPolygon.setAttribute('points', starPoints);
                break;
                
            case 'heart':
                // For simplicity, we'll use a polygon approximation of a heart
                shapeElement = previewPolygon;
                previewPolygon.style.display = 'block';
                const heartPoints = generateHeartPoints(x + size/2, y + size/2, size/2);
                previewPolygon.setAttribute('points', heartPoints);
                break;
        }
        
        // Apply styles
        if (shapeElement) {
            // Apply fill
            if (gradientType.value !== 'none') {
                // Create or update gradient
                let gradientId = 'icon-gradient';
                let gradient = iconPreview.querySelector(`#${gradientId}`);
                
                if (!gradient) {
                    gradient = document.createElementNS('http://www.w3.org/2000/svg', gradientType.value === 'linear' ? 'linearGradient' : 'radialGradient');
                    gradient.id = gradientId;
                    iconPreview.appendChild(gradient);
                    
                    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
                    gradient.appendChild(stop1);
                    gradient.appendChild(stop2);
                }
                
                if (gradientType.value === 'linear') {
                    gradient.setAttribute('x1', '0%');
                    gradient.setAttribute('y1', '0%');
                    gradient.setAttribute('x2', '100%');
                    gradient.setAttribute('y2', '100%');
                } else {
                    gradient.setAttribute('cx', '50%');
                    gradient.setAttribute('cy', '50%');
                    gradient.setAttribute('r', '50%');
                }
                
                gradient.querySelector('stop:first-child').setAttribute('offset', '0%');
                gradient.querySelector('stop:first-child').setAttribute('stop-color', gradientStart.value);
                gradient.querySelector('stop:last-child').setAttribute('offset', '100%');
                gradient.querySelector('stop:last-child').setAttribute('stop-color', gradientEnd.value);
                
                shapeElement.setAttribute('fill', `url(#${gradientId})`);
            } else {
                shapeElement.setAttribute('fill', fillColor.value);
            }
            
            // Apply stroke
            shapeElement.setAttribute('stroke', strokeColor.value);
            shapeElement.setAttribute('stroke-width', strokeWidth.value);
            
            // Apply opacity
            shapeElement.setAttribute('opacity', opacity.value);
            
            // Apply transform
            let transform = '';
            if (rot !== 0) {
                transform += `rotate(${rot} ${x + size/2} ${y + size/2}) `;
            }
            if (sc !== 1) {
                transform += `scale(${sc})`;
            }
            
            if (transform) {
                shapeElement.setAttribute('transform', transform.trim());
            } else {
                shapeElement.removeAttribute('transform');
            }
        }
    }
    
    // Generate polygon points
    function generatePolygonPoints(cx, cy, radius, sides) {
        const points = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }
    
    // Generate star points
    function generateStarPoints(cx, cy, outerRadius, innerRadius, points) {
        const starPoints = [];
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI / points) - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            starPoints.push(`${x},${y}`);
        }
        return starPoints.join(' ');
    }
    
    // Generate heart points
    function generateHeartPoints(cx, cy, size) {
        const points = [];
        for (let i = 0; i < 20; i++) {
            const t = i / 19 * 2 * Math.PI;
            // Heart parametric equation
            const x = 16 * Math.pow(Math.sin(t), 3);
            const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
            
            // Scale and position
            const scaledX = cx + (x / 16) * size;
            const scaledY = cy - (y / 16) * size;
            points.push(`${scaledX},${scaledY}`);
        }
        return points.join(' ');
    }
    
    // Center icon in viewbox
    function centerIconInViewbox() {
        const width = parseInt(viewboxWidth.value);
        const height = parseInt(viewboxHeight.value);
        const size = parseInt(shapeSize.value);
        
        const centerX = (width - size) / 2;
        const centerY = (height - size) / 2;
        
        shapeX.value = Math.max(0, Math.min(width - size, centerX));
        shapeY.value = Math.max(0, Math.min(height - size, centerY));
        
        shapeXValue.textContent = shapeX.value;
        shapeYValue.textContent = shapeY.value;
        
        updatePreview();
        updateCode();
        
        showToast('Icon centered in viewbox', 'info');
    }
    
    // Update the code display
    function updateCode() {
        const width = parseInt(viewboxWidth.value);
        const height = parseInt(viewboxHeight.value);
        const size = parseInt(shapeSize.value);
        const x = parseInt(shapeX.value);
        const y = parseInt(shapeY.value);
        const radius = parseInt(cornerRadius.value);
        
        let shapeCode = '';
        
        switch(currentShape) {
            case 'rectangle':
                shapeCode = `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}"`;
                break;
            case 'circle':
                shapeCode = `<circle cx="${x + size/2}" cy="${y + size/2}" r="${size/2}"`;
                break;
            case 'triangle':
                const triPoints = `${x + size/2},${y} ${x + size},${y + size} ${x},${y + size}`;
                shapeCode = `<polygon points="${triPoints}"`;
                break;
            case 'hexagon':
                const hexPoints = generatePolygonPoints(x + size/2, y + size/2, size/2, 6);
                shapeCode = `<polygon points="${hexPoints}"`;
                break;
            case 'star':
                const starPoints = generateStarPoints(x + size/2, y + size/2, size/2, size/4, parseInt(points.value));
                shapeCode = `<polygon points="${starPoints}"`;
                break;
            case 'heart':
                const heartPoints = generateHeartPoints(x + size/2, y + size/2, size/2);
                shapeCode = `<polygon points="${heartPoints}"`;
                break;
        }
        
        // Add attributes
        let attributes = '';
        
        if (gradientType.value !== 'none') {
            attributes += ` fill="url(#icon-gradient)"`;
        } else {
            attributes += ` fill="${fillColor.value}"`;
        }
        
        attributes += ` stroke="${strokeColor.value}" stroke-width="${strokeWidth.value}" opacity="${opacity.value}"`;
        
        // Add transform if needed
        const rot = parseInt(rotation.value);
        const sc = parseFloat(scale.value);
        
        let transform = '';
        if (rot !== 0) {
            transform += `rotate(${rot} ${x + size/2} ${y + size/2}) `;
        }
        if (sc !== 1) {
            transform += `scale(${sc})`;
        }
        
        if (transform) {
            attributes += ` transform="${transform.trim()}"`;
        }
        
        shapeCode += `${attributes}/>`;
        
        // Generate full SVG code
        const svgCodeString = `<?xml version="1.0" encoding="UTF-8"?>
<svg id="${svgId.value}" class="${svgClass.value}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${gradientType.value !== 'none' ? generateGradientCode() : ''}
  ${shapeCode}
</svg>`;
        
        // Update code display
        const codeElement = svgCode.querySelector('code');
        codeElement.textContent = svgCodeString;
        
        // Update full code for modal
        fullSvgCode.textContent = svgCodeString;
        
        // Syntax highlighting (simple version)
        highlightCode();
    }
    
    // Generate gradient code
    function generateGradientCode() {
        if (gradientType.value === 'linear') {
            return `<linearGradient id="icon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${gradientStart.value}" />
    <stop offset="100%" stop-color="${gradientEnd.value}" />
  </linearGradient>`;
        } else if (gradientType.value === 'radial') {
            return `<radialGradient id="icon-gradient" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${gradientStart.value}" />
    <stop offset="100%" stop-color="${gradientEnd.value}" />
  </radialGradient>`;
        }
        return '';
    }
    
    // Simple syntax highlighting
    function highlightCode() {
        const codeElement = svgCode.querySelector('code');
        let code = codeElement.textContent;
        
        // Highlight tags
        code = code.replace(/&lt;(\/?\w+)/g, '&lt;<span class="tag">$1</span>');
        
        // Highlight attributes
        code = code.replace(/(\w+)=/g, '<span class="attr">$1</span>=');
        
        // Highlight attribute values
        code = code.replace(/="([^"]*)"/g, '="<span class="value">$1</span>"');
        
        // Highlight comments
        code = code.replace(/&lt;!--(.*?)--&gt;/g, '&lt;!--<span class="comment">$1</span>--&gt;');
        
        codeElement.innerHTML = code;
    }
    
    // Copy SVG to clipboard
    async function copySvgToClipboard() {
        const code = fullSvgCode.textContent;
        await copyToClipboard(code, 'SVG code');
    }
    
    // Download SVG file
    function downloadSvgFile() {
        const code = fullSvgCode.textContent;
        const blob = new Blob([code], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon-${svgId.value || 'custom'}-${exportSize.value}px.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`SVG icon downloaded (${exportSize.value}px)`, 'success');
    }
    
    // Download PNG file (simulated - in real app would use canvas)
    function downloadPngFile() {
        // In a real implementation, you would use a library like canvg
        // to convert SVG to canvas and then to PNG
        // For this demo, we'll simulate the download
        showToast('PNG export would convert SVG to raster image. For full implementation, use a server-side converter or canvas library.', 'info');
        
        // Simulation of PNG download
        setTimeout(() => {
            showToast('PNG export requires additional libraries. SVG download is recommended for vector quality.', 'info');
        }, 100);
    }
    
    // Copy code to clipboard
    async function copyCodeToClipboard() {
        const code = fullSvgCode.textContent;
        await copyToClipboard(code, 'SVG code');
    }
    
    // Toggle code visibility
    function toggleCodeVisibility() {
        const codeContainer = document.querySelector('.code-container');
        const icon = toggleCode.querySelector('i');
        
        if (isCodeVisible) {
            codeContainer.style.display = 'none';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            toggleCode.title = 'Show Code';
        } else {
            codeContainer.style.display = 'block';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            toggleCode.title = 'Hide Code';
        }
        
        isCodeVisible = !isCodeVisible;
    }
    
    // Show code modal
    function showCodeModal() {
        updateCode();
        codeModal.classList.add('show');
    }
    
    // Reset all settings
    function resetAllSettings() {
        // Reset shape
        currentShape = 'rectangle';
        shapeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-shape="rectangle"]').classList.add('active');
        
        // Reset controls to defaults
        shapeSize.value = 100;
        shapeSizeValue.textContent = '100';
        shapeX.value = 50;
        shapeXValue.textContent = '50';
        shapeY.value = 50;
        shapeYValue.textContent = '50';
        cornerRadius.value = 15;
        cornerRadiusValue.textContent = '15';
        points.value = 5;
        pointsValue.textContent = '5';
        
        // Reset style
        fillColor.value = '#7e57c2';
        fillColorText.value = '#7e57c2';
        strokeColor.value = '#333333';
        strokeColorText.value = '#333333';
        strokeWidth.value = 2;
        strokeWidthValue.textContent = '2';
        opacity.value = 1;
        opacityValue.textContent = '1.0';
        gradientType.value = 'none';
        gradientControls.style.display = 'none';
        gradientStart.value = '#7e57c2';
        gradientStartText.value = '#7e57c2';
        gradientEnd.value = '#ff7b54';
        gradientEndText.value = '#ff7b54';
        
        // Reset advanced
        viewboxWidth.value = 200;
        viewboxHeight.value = 200;
        svgId.value = 'custom-icon';
        svgClass.value = 'icon';
        rotation.value = 0;
        rotationValue.textContent = '0°';
        scale.value = 1;
        scaleValue.textContent = '1.0';
        
        // Reset export
        exportSize.value = '128';
        
        // Update everything
        updateControlVisibility();
        updatePreview();
        updateCode();
        
        showToast('All settings reset to default', 'info');
    }
    
    // Export all presets
    function exportAllPresets() {
        if (currentPresets.length === 0) {
            showToast('No presets to export', 'info');
            return;
        }
        
        const presetsData = JSON.stringify(currentPresets, null, 2);
        const blob = new Blob([presetsData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'svg-icon-presets.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast(`${currentPresets.length} presets exported`, 'success');
    }
    
    // Apply preset
    function applyPreset(presetName) {
        let preset;
        
        // Check if it's a built-in preset
        switch(presetName) {
            case 'app':
                preset = {
                    fillColor: '#7e57c2',
                    strokeColor: '#333333',
                    strokeWidth: 2,
                    gradientType: 'linear',
                    gradientStart: '#7e57c2',
                    gradientEnd: '#ff7b54'
                };
                break;
            case 'social':
                preset = {
                    fillColor: '#4fc3f7',
                    strokeColor: '#0277bd',
                    strokeWidth: 1,
                    gradientType: 'linear',
                    gradientStart: '#4fc3f7',
                    gradientEnd: '#29b6f6',
                    shape: 'circle'
                };
                break;
            case 'alert':
                preset = {
                    fillColor: '#ffb74d',
                    strokeColor: '#ef6c00',
                    strokeWidth: 2,
                    gradientType: 'none',
                    shape: 'triangle'
                };
                break;
            case 'success':
                preset = {
                    fillColor: '#66bb6a',
                    strokeColor: '#2e7d32',
                    strokeWidth: 1,
                    gradientType: 'linear',
                    gradientStart: '#66bb6a',
                    gradientEnd: '#4caf50',
                    shape: 'hexagon'
                };
                break;
            case 'minimal':
                preset = {
                    fillColor: '#f5f5f5',
                    strokeColor: '#333333',
                    strokeWidth: 2,
                    gradientType: 'none',
                    cornerRadius: 0
                };
                break;
            case 'gradient':
                preset = {
                    fillColor: '#ff7b54',
                    strokeColor: 'none',
                    strokeWidth: 0,
                    gradientType: 'radial',
                    gradientStart: '#ff7b54',
                    gradientEnd: '#7e57c2'
                };
                break;
            default:
                // Check saved presets
                preset = currentPresets.find(p => p.name === presetName);
                if (!preset) return;
                break;
        }
        
        // Apply preset values
        if (preset.fillColor) {
            fillColor.value = preset.fillColor;
            fillColorText.value = preset.fillColor;
        }
        
        if (preset.strokeColor) {
            strokeColor.value = preset.strokeColor;
            strokeColorText.value = preset.strokeColor;
        }
        
        if (preset.strokeWidth !== undefined) {
            strokeWidth.value = preset.strokeWidth;
            strokeWidthValue.textContent = preset.strokeWidth;
        }
        
        if (preset.gradientType) {
            gradientType.value = preset.gradientType;
            gradientControls.style.display = preset.gradientType === 'none' ? 'none' : 'block';
        }
        
        if (preset.gradientStart) {
            gradientStart.value = preset.gradientStart;
            gradientStartText.value = preset.gradientStart;
        }
        
        if (preset.gradientEnd) {
            gradientEnd.value = preset.gradientEnd;
            gradientEndText.value = preset.gradientEnd;
        }
        
        if (preset.shape) {
            currentShape = preset.shape;
            shapeButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-shape="${preset.shape}"]`).classList.add('active');
            updateControlVisibility();
        }
        
        if (preset.cornerRadius !== undefined) {
            cornerRadius.value = preset.cornerRadius;
            cornerRadiusValue.textContent = preset.cornerRadius;
        }
        
        // Update everything
        updatePreview();
        updateCode();
        
        showToast(`Applied "${presetName}" preset`, 'success');
    }
    
    // Save current preset
    function saveCurrentPreset() {
        const name = presetName.value.trim();
        if (!name) {
            showToast('Please enter a name for the preset', 'error');
            return;
        }
        
        // Check if preset already exists
        if (currentPresets.some(p => p.name === name)) {
            showToast('Preset with this name already exists', 'error');
            return;
        }
        
        // Create preset object
        const preset = {
            name: name,
            fillColor: fillColor.value,
            strokeColor: strokeColor.value,
            strokeWidth: parseInt(strokeWidth.value),
            gradientType: gradientType.value,
            gradientStart: gradientStart.value,
            gradientEnd: gradientEnd.value,
            shape: currentShape,
            cornerRadius: parseInt(cornerRadius.value)
        };
        
        // Save to local storage
        currentPresets.push(preset);
        localStorage.setItem('svgIconPresets', JSON.stringify(currentPresets));
        
        // Clear input
        presetName.value = '';
        
        // Update saved presets list
        loadSavedPresets();
        
        showToast(`Preset "${name}" saved`, 'success');
    }
    
    // Load saved presets
    function loadSavedPresets() {
        savedPresets.innerHTML = '';
        
        if (currentPresets.length === 0) {
            savedPresets.innerHTML = '<p class="no-presets">No saved presets yet</p>';
            return;
        }
        
        currentPresets.forEach(preset => {
            const presetElement = document.createElement('div');
            presetElement.className = 'saved-preset';
            presetElement.innerHTML = `
                <span>${preset.name}</span>
                <button class="btn-small" data-preset="${preset.name}">
                    <i class="fas fa-play"></i>
                </button>
            `;
            
            savedPresets.appendChild(presetElement);
            
            // Add click event to apply preset
            presetElement.querySelector('button').addEventListener('click', function() {
                applyPreset(this.dataset.preset);
            });
        });
    }
    
    // Generic copy to clipboard function
    async function copyToClipboard(text, description = 'text') {
        try {
            await navigator.clipboard.writeText(text);
            showToast(`${description} copied to clipboard`, 'success');
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast(`Failed to copy ${description}`, 'error');
        }
    }
    
    // Show toast notification
    function showToast(message, type = 'info') {
        // Clear any existing timeout
        if (toast.timeoutId) {
            clearTimeout(toast.timeoutId);
        }
        
        // Set toast content and style
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        toast.className = `toast ${type}`;
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide after 3 seconds
        toast.timeoutId = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // Add CSS for code highlighting
    const style = document.createElement('style');
    style.textContent = `
        .toast.success {
            background-color: #10b981;
            border-left: 4px solid #059669;
        }
        
        .toast.error {
            background-color: #ef4444;
            border-left: 4px solid #dc2626;
        }
        
        .toast.info {
            background-color: #3b82f6;
            border-left: 4px solid #2563eb;
        }
        
        .toast i {
            color: white;
        }
        
        code .tag {
            color: #e06c75;
        }
        
        code .attr {
            color: #d19a66;
        }
        
        code .value {
            color: #98c379;
        }
        
        code .comment {
            color: #5c6370;
            font-style: italic;
        }
        
        .saved-preset {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            margin-bottom: 8px;
        }
        
        .saved-preset span {
            font-weight: 500;
            color: #4a5568;
        }
        
        .btn-small {
            padding: 5px 10px;
            background-color: #7e57c2;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .btn-small:hover {
            background-color: #6a40b3;
        }
        
        .no-presets {
            text-align: center;
            color: #a0aec0;
            font-style: italic;
            padding: 20px;
        }
    `;
    document.head.appendChild(style);
    
    // Initialize the app
    initApp();
});