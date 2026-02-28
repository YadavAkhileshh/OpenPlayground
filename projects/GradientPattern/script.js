
        // Initial state
        let gradientState = {
            type: 'linear',
            angle: 45,
            colors: [
                { id: 1, value: '#ff00ff', position: 0 },
                { id: 2, value: '#00ffff', position: 50 },
                { id: 3, value: '#ffff00', position: 100 }
            ],
            patternType: 'dots',
            patternSize: 50,
            patternOpacity: 0.3,
            isAnimated: false
        };

        // Initialize the app
        function initApp() {
            renderColorStops();
            updateGradient();
            updatePattern();
            updateCSSOutput();
        }

        // Set gradient type
        function setGradientType(type) {
            gradientState.type = type;
            
            // Update UI buttons
            document.querySelectorAll('.gradient-type-btn').forEach(btn => {
                btn.classList.remove('bg-purple-600', 'active');
                btn.classList.add('bg-gray-800');
            });
            event.target.classList.add('bg-purple-600', 'active');
            event.target.classList.remove('bg-gray-800');
            
            // Update angle label for radial/conic
            const angleLabel = document.getElementById('angleLabel');
            const angleSlider = document.getElementById('gradientAngle');
            
            if (type === 'radial') {
                angleLabel.innerHTML = 'Size: <span id="angleValue">45%</span>';
                angleSlider.min = 10;
                angleSlider.max = 200;
                angleSlider.value = 45;
            } else if (type === 'conic') {
                angleLabel.innerHTML = 'Starting Angle: <span id="angleValue">45°</span>';
                angleSlider.min = 0;
                angleSlider.max = 360;
                angleSlider.value = 45;
            } else {
                angleLabel.innerHTML = 'Angle: <span id="angleValue">45°</span>';
                angleSlider.min = 0;
                angleSlider.max = 360;
                angleSlider.value = 45;
            }
            
            updateGradient();
        }

        // Set pattern type
        function setPatternType(type) {
            gradientState.patternType = type;
            
            // Update UI buttons
            document.querySelectorAll('.pattern-type-btn').forEach(btn => {
                btn.classList.remove('bg-blue-600', 'active');
                btn.classList.add('bg-gray-800');
            });
            event.target.classList.add('bg-blue-600', 'active');
            event.target.classList.remove('bg-gray-800');
            
            updatePattern();
        }

        // Update gradient based on state
        function updateGradient() {
            const angle = document.getElementById('gradientAngle').value;
            gradientState.angle = parseInt(angle);
            document.getElementById('angleValue').textContent = gradientState.type === 'radial' ? `${angle}%` : `${angle}°`;
            
            const preview = document.getElementById('gradientPreview');
            const colors = gradientState.colors.map(c => `${c.value} ${c.position}%`).join(', ');
            
            let gradientCSS = '';
            
            switch(gradientState.type) {
                case 'linear':
                    gradientCSS = `linear-gradient(${angle}deg, ${colors})`;
                    break;
                case 'radial':
                    gradientCSS = `radial-gradient(circle ${angle}%, ${colors})`;
                    break;
                case 'conic':
                    gradientCSS = `conic-gradient(from ${angle}deg, ${colors})`;
                    break;
                case 'mesh':
                    // Simpler mesh effect
                    gradientCSS = `radial-gradient(circle at 20% 20%, ${gradientState.colors[0].value} 0%, transparent 50%),
                                  radial-gradient(circle at 80% 20%, ${gradientState.colors[1].value} 0%, transparent 50%),
                                  radial-gradient(circle at 20% 80%, ${gradientState.colors[2].value} 0%, transparent 50%)`;
                    break;
            }
            
            preview.style.background = gradientCSS;
            
            // Handle animation
            if (gradientState.isAnimated) {
                preview.classList.add('gradient-animation');
                preview.style.backgroundSize = gradientState.type === 'mesh' ? '100% 100%' : '400% 400%';
            } else {
                preview.classList.remove('gradient-animation');
                preview.style.backgroundSize = '100% 100%';
            }
            
            updateCSSOutput();
        }

        // Update pattern overlay
        function updatePattern() {
            const size = document.getElementById('patternSize').value;
            const opacity = document.getElementById('patternOpacity').value / 100;
            
            gradientState.patternSize = parseInt(size);
            gradientState.patternOpacity = opacity;
            
            document.getElementById('patternSizeValue').textContent = `${size}px`;
            document.getElementById('patternOpacityValue').textContent = opacity.toFixed(2);
            
            const overlay = document.getElementById('patternOverlay');
            overlay.style.opacity = opacity;
            
            // Remove all pattern classes
            overlay.classList.remove('pattern-dots', 'pattern-lines', 'pattern-grid', 'pattern-hex');
            
            if (gradientState.patternType !== 'none') {
                overlay.classList.add(`pattern-${gradientState.patternType}`);
                overlay.style.backgroundSize = `${size}px ${size}px`;
            }
            
            updateCSSOutput();
        }

        // Render color stops
        function renderColorStops() {
            const container = document.getElementById('colorStopsContainer');
            container.innerHTML = '';
            
            gradientState.colors.forEach((color, index) => {
                const colorStopHTML = `
                    <div class="flex items-center gap-4" data-id="${color.id}">
                        <div class="color-picker-thumb" style="background: ${color.value}">
                            <input type="color" value="${color.value}" 
                                   class="absolute opacity-0 w-full h-full cursor-pointer" 
                                   onchange="updateColor(${color.id}, this.value)">
                        </div>
                        <input type="range" min="0" max="100" value="${color.position}" 
                               class="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                               oninput="updatePosition(${color.id}, this.value)">
                        <span class="w-10 text-center">${color.position}%</span>
                        <button onclick="removeColorStop(${color.id})" 
                                class="text-red-400 hover:text-red-300 ${gradientState.colors.length <= 2 ? 'invisible' : ''}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                container.innerHTML += colorStopHTML;
            });
        }

        // Add a new color stop
        function addColorStop() {
            if (gradientState.colors.length >= 6) return;
            
            // Generate a random color
            const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            const newId = gradientState.colors.length > 0 ? 
                Math.max(...gradientState.colors.map(c => c.id)) + 1 : 1;
            
            // Add at a reasonable position
            const lastPosition = gradientState.colors[gradientState.colors.length - 1].position;
            const newPosition = Math.min(lastPosition + 20, 100);
            
            gradientState.colors.push({
                id: newId,
                value: randomColor,
                position: newPosition
            });
            
            renderColorStops();
            updateGradient();
        }

        // Update color value
        function updateColor(id, value) {
            const colorObj = gradientState.colors.find(c => c.id === id);
            if (colorObj) {
                colorObj.value = value;
                updateGradient();
                
                // Update thumb color
                event.target.closest('.color-picker-thumb').style.background = value;
            }
        }

        // Update color position
        function updatePosition(id, value) {
            const colorObj = gradientState.colors.find(c => c.id === id);
            if (colorObj) {
                colorObj.position = parseInt(value);
                
                // Update the displayed percentage
                event.target.nextElementSibling.textContent = `${value}%`;
                
                updateGradient();
            }
        }

        // Remove a color stop
        function removeColorStop(id) {
            if (gradientState.colors.length <= 2) return;
            
            gradientState.colors = gradientState.colors.filter(c => c.id !== id);
            renderColorStops();
            updateGradient();
        }

        // Toggle gradient animation
        function toggleAnimation() {
            gradientState.isAnimated = !gradientState.isAnimated;
            const btn = document.getElementById('animateBtn');
            
            if (gradientState.isAnimated) {
                btn.innerHTML = '<i class="fas fa-pause"></i> Stop Animation';
                btn.classList.remove('bg-purple-600');
                btn.classList.add('bg-red-600');
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i> Animate Gradient';
                btn.classList.remove('bg-red-600');
                btn.classList.add('bg-purple-600');
            }
            
            updateGradient();
        }

        // Randomize all settings
        function randomizeAll() {
            // Random gradient type
            const types = ['linear', 'radial', 'conic', 'mesh'];
            setGradientType(types[Math.floor(Math.random() * types.length)]);
            
            // Random angle/size
            document.getElementById('gradientAngle').value = Math.floor(Math.random() * 360);
            
            // Random colors (3-5 colors)
            const numColors = 3 + Math.floor(Math.random() * 3);
            gradientState.colors = [];
            
            for (let i = 0; i < numColors; i++) {
                const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
                gradientState.colors.push({
                    id: i + 1,
                    value: randomColor,
                    position: Math.floor((i / (numColors - 1)) * 100)
                });
            }
            
            // Random pattern
            const patterns = ['dots', 'lines', 'grid', 'hex', 'none'];
            setPatternType(patterns[Math.floor(Math.random() * patterns.length)]);
            
            // Random pattern size
            document.getElementById('patternSize').value = 20 + Math.floor(Math.random() * 150);
            
            // Random opacity
            document.getElementById('patternOpacity').value = 10 + Math.floor(Math.random() * 70);
            
            // Random animation
            gradientState.isAnimated = Math.random() > 0.5;
            
            // Update UI
            renderColorStops();
            updateGradient();
            updatePattern();
            
            // Update animation button
            const btn = document.getElementById('animateBtn');
            if (gradientState.isAnimated) {
                btn.innerHTML = '<i class="fas fa-pause"></i> Stop Animation';
                btn.classList.remove('bg-purple-600');
                btn.classList.add('bg-red-600');
            } else {
                btn.innerHTML = '<i class="fas fa-play"></i> Animate Gradient';
                btn.classList.remove('bg-red-600');
                btn.classList.add('bg-purple-600');
            }
        }

        // Apply preset
        function applyPreset(presetName) {
            const presets = {
                sunset: {
                    type: 'linear',
                    angle: 135,
                    colors: [
                        { id: 1, value: '#ff6b6b', position: 0 },
                        { id: 2, value: '#ffa726', position: 50 },
                        { id: 3, value: '#5c6bc0', position: 100 }
                    ]
                },
                ocean: {
                    type: 'radial',
                    angle: 70,
                    colors: [
                        { id: 1, value: '#4fc3f7', position: 0 },
                        { id: 2, value: '#29b6f6', position: 50 },
                        { id: 3, value: '#0288d1', position: 100 }
                    ]
                },
                neon: {
                    type: 'conic',
                    angle: 0,
                    colors: [
                        { id: 1, value: '#ff00ff', position: 0 },
                        { id: 2, value: '#00ffff', position: 33 },
                        { id: 3, value: '#ffff00', position: 66 },
                        { id: 4, value: '#ff00ff', position: 100 }
                    ]
                },
                forest: {
                    type: 'linear',
                    angle: 90,
                    colors: [
                        { id: 1, value: '#66bb6a', position: 0 },
                        { id: 2, value: '#388e3c', position: 50 },
                        { id: 3, value: '#1b5e20', position: 100 }
                    ]
                },
                fire: {
                    type: 'linear',
                    angle: 45,
                    colors: [
                        { id: 1, value: '#ff3d00', position: 0 },
                        { id: 2, value: '#ff9100', position: 50 },
                        { id: 3, value: '#ffab00', position: 100 }
                    ]
                }
            };
            
            const preset = presets[presetName];
            if (!preset) return;
            
            gradientState.type = preset.type;
            gradientState.angle = preset.angle;
            gradientState.colors = preset.colors;
            
            // Update UI
            document.querySelectorAll('.gradient-type-btn').forEach(btn => {
                btn.classList.remove('bg-purple-600', 'active');
                btn.classList.add('bg-gray-800');
            });
            
            const typeBtn = Array.from(document.querySelectorAll('.gradient-type-btn'))
                .find(btn => btn.textContent.toLowerCase().includes(preset.type));
            if (typeBtn) {
                typeBtn.classList.add('bg-purple-600', 'active');
                typeBtn.classList.remove('bg-gray-800');
            }
            
            document.getElementById('gradientAngle').value = preset.angle;
            
            renderColorStops();
            updateGradient();
        }

        // Update CSS output display
        function updateCSSOutput() {
            const output = document.getElementById('cssOutput');
            
            // Build gradient CSS
            const colors = gradientState.colors.map(c => `${c.value} ${c.position}%`).join(', ');
            let gradientCSS = '';
            
            switch(gradientState.type) {
                case 'linear':
                    gradientCSS = `background: linear-gradient(${gradientState.angle}deg, ${colors});`;
                    break;
                case 'radial':
                    gradientCSS = `background: radial-gradient(circle ${gradientState.angle}%, ${colors});`;
                    break;
                case 'conic':
                    gradientCSS = `background: conic-gradient(from ${gradientState.angle}deg, ${colors});`;
                    break;
                case 'mesh':
                    gradientCSS = `background: radial-gradient(circle at 20% 20%, ${gradientState.colors[0].value} 0%, transparent 50%),
                                  radial-gradient(circle at 80% 20%, ${gradientState.colors[1].value} 0%, transparent 50%),
                                  radial-gradient(circle at 20% 80%, ${gradientState.colors[2].value} 0%, transparent 50%);`;
                    break;
            }
            
            // Add pattern if enabled
            let patternCSS = '';
            if (gradientState.patternType !== 'none') {
                patternCSS = `\nbackground-image: ${getPatternCSS()};\nbackground-size: ${gradientState.patternSize}px ${gradientState.patternSize}px;\nopacity: ${gradientState.patternOpacity};`;
            }
            
            // Add animation if enabled
            let animationCSS = '';
            if (gradientState.isAnimated) {
                animationCSS = `\nbackground-size: 400% 400%;\nanimation: gradientShift 8s ease infinite;`;
            }
            
            output.textContent = gradientCSS + patternCSS + animationCSS;
        }

        // Get pattern CSS
        function getPatternCSS() {
            switch(gradientState.patternType) {
                case 'dots':
                    return `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 2%)`;
                case 'lines':
                    return `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)`;
                case 'grid':
                    return `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`;
                case 'hex':
                    return `radial-gradient(circle at 100% 150%, rgba(255,255,255,0.1) 24%, transparent 24%), radial-gradient(circle at 0% 150%, rgba(255,255,255,0.1) 24%, transparent 24%), radial-gradient(circle at 50% 100%, rgba(255,255,255,0.1) 24%, transparent 24%)`;
                default:
                    return '';
            }
        }

        // Export as CSS
        function exportAsCSS() {
            const exportDiv = document.getElementById('exportContent');
            const gradientCSS = document.getElementById('cssOutput').textContent;
            
            const fullCSS = `.your-element {\n  ${gradientCSS.replace(/;\n/g, ';\n  ')}\n}`;
            
            if (gradientState.isAnimated) {
                const animationKeyframes = `
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
                exportDiv.textContent = fullCSS + animationKeyframes;
            } else {
                exportDiv.textContent = fullCSS;
            }
            
            showExportModal();
        }

        // Export as SVG
        function exportAsSVG() {
            const exportDiv = document.getElementById('exportContent');
            
            // Create a simple SVG gradient representation
            const colors = gradientState.colors.map(c => 
                `<stop offset="${c.position}%" stop-color="${c.value}" />`
            ).join('\n        ');
            
            const svgCode = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <${gradientState.type}Gradient id="gradient" gradientTransform="rotate(${gradientState.angle})">
      ${colors}
    </${gradientState.type}Gradient>
  </defs>
  <rect width="800" height="600" fill="url(#gradient)" />
  <text x="20" y="30" font-family="Arial" font-size="16" fill="white">
    Gradient Pattern Export
  </text>
</svg>`;
            
            exportDiv.textContent = svgCode;
            showExportModal();
        }

        // Share gradient
        function shareGradient() {
            const exportDiv = document.getElementById('exportContent');
            const gradientData = JSON.stringify(gradientState, null, 2);
            
            exportDiv.textContent = `// Copy this JSON to save/share your gradient:
            
${gradientData}

// Or use this URL (would need backend in real app):
// https://gradientlab.example.com/?gradient=${encodeURIComponent(btoa(gradientData))}`;
            
            showExportModal();
        }

        // Show export modal
        function showExportModal() {
            const modal = document.getElementById('exportModal');
            const modalContent = modal.querySelector('.export-modal');
            
            modal.classList.remove('hidden');
            setTimeout(() => {
                modalContent.classList.add('show');
            }, 10);
        }

        // Close export modal
        function closeExportModal() {
            const modal = document.getElementById('exportModal');
            const modalContent = modal.querySelector('.export-modal');
            
            modalContent.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }

        // Copy to clipboard
        function copyToClipboard() {
            const text = document.getElementById('exportContent').textContent;
            navigator.clipboard.writeText(text).then(() => {
                alert('Copied to clipboard!');
            });
        }

        // Initialize on load
        window.onload = initApp;
    