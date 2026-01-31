document.addEventListener('DOMContentLoaded', function() {
    // Canvas and Context
    const canvas = document.getElementById('fractalCanvas');
    const ctx = canvas.getContext('2d');
    
    // Stats Elements
    const zoomLevel = document.getElementById('zoomLevel');
    const iterationCount = document.getElementById('iterationCount');
    const renderTime = document.getElementById('renderTime');
    const canvasSize = document.getElementById('canvasSize');
    const viewportRange = document.getElementById('viewportRange');
    const pixelScale = document.getElementById('pixelScale');
    const setPoints = document.getElementById('setPoints');
    const coordX = document.getElementById('coordX');
    const coordY = document.getElementById('coordY');
    const zoomValue = document.getElementById('zoomValue');
    
    // Control Elements
    const fractalButtons = document.querySelectorAll('.fractal-btn');
    const colorPresets = document.querySelectorAll('.color-preset');
    const hueShift = document.getElementById('hueShift');
    const saturation = document.getElementById('saturation');
    const brightness = document.getElementById('brightness');
    const hueValue = document.getElementById('hueValue');
    const saturationValue = document.getElementById('saturationValue');
    const brightnessValue = document.getElementById('brightnessValue');
    const iterations = document.getElementById('iterations');
    const escapeRadius = document.getElementById('escapeRadius');
    const renderQuality = document.getElementById('renderQuality');
    const iterationsValue = document.getElementById('iterationsValue');
    const escapeRadiusValue = document.getElementById('escapeRadiusValue');
    const qualityValue = document.getElementById('qualityValue');
    
    // Navigation Elements
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const resetViewBtn = document.getElementById('resetViewBtn');
    const centerViewBtn = document.getElementById('centerViewBtn');
    const renderBtn = document.getElementById('renderBtn');
    const saveImageBtn = document.getElementById('saveImageBtn');
    const randomExploreBtn = document.getElementById('randomExploreBtn');
    const smoothColoring = document.getElementById('smoothColoring');
    
    // Info Elements
    const currentFractal = document.getElementById('currentFractal');
    const fractalFormula = document.getElementById('fractalFormula');
    const fractalYear = document.getElementById('fractalYear');
    const fractalDescription = document.getElementById('fractalDescription');
    const historyList = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const totalPoints = document.getElementById('totalPoints');
    const iterationsPerSec = document.getElementById('iterationsPerSec');
    
    // Modal Elements
    const helpBtn = document.getElementById('helpBtn');
    const closeHelpModal = document.getElementById('closeHelpModal');
    const helpModal = document.getElementById('helpModal');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Canvas Overlay
    const zoomRectangle = document.getElementById('zoomRectangle');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Fractal State
    let state = {
        currentFractal: 'mandelbrot',
        colorPreset: 'rainbow',
        hueShift: 0,
        saturation: 80,
        brightness: 70,
        maxIterations: 100,
        escapeRadius: 4,
        renderQuality: 2,
        smoothColoring: true,
        
        // Viewport State
        centerX: -0.5,
        centerY: 0,
        zoom: 1,
        width: 4,
        height: 3,
        
        // Mouse State
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragEndX: 0,
        dragEndY: 0,
        
        // History
        history: [],
        maxHistory: 10,
        
        // Performance
        lastRenderTime: 0,
        isRendering: false
    };
    
    // Color Palettes
    const colorPalettes = {
        rainbow: [
            [0, 7, 100],    // Dark Blue
            [200, 100, 50], // Blue
            [240, 100, 50], // Light Blue
            [280, 100, 50], // Purple
            [320, 100, 50], // Pink
            [0, 100, 50]    // Red
        ],
        fire: [
            [0, 0, 0],      // Black
            [0, 100, 50],   // Dark Red
            [15, 100, 50],  // Red
            [30, 100, 50],  // Orange
            [50, 100, 50],  // Yellow
            [60, 100, 100]  // White
        ],
        ocean: [
            [210, 100, 10], // Dark Blue
            [200, 100, 30], // Blue
            [190, 100, 50], // Light Blue
            [180, 100, 70], // Cyan
            [170, 100, 90]  // Light Cyan
        ],
        forest: [
            [120, 100, 10], // Dark Green
            [140, 100, 30], // Green
            [160, 100, 50], // Light Green
            [180, 100, 70], // Teal
            [200, 100, 90]  // Light Teal
        ],
        neon: [
            [270, 100, 10], // Dark Purple
            [280, 100, 30], // Purple
            [290, 100, 50], // Light Purple
            [300, 100, 70], // Pink
            [310, 100, 90]  // Light Pink
        ],
        monochrome: [
            [0, 0, 0],      // Black
            [0, 0, 25],     // Dark Gray
            [0, 0, 50],     // Gray
            [0, 0, 75],     // Light Gray
            [0, 0, 100]     // White
        ]
    };
    
    // Fractal Information
    const fractalInfo = {
        mandelbrot: {
            name: 'Mandelbrot Set',
            formula: 'zₙ₊₁ = zₙ² + c',
            year: '1980',
            description: 'The Mandelbrot set is the set of complex numbers c for which the function f(z) = z² + c does not diverge when iterated from z = 0. Its boundary reveals an infinitely complex fractal pattern that repeats at every scale.',
            complexity: 95
        },
        julia: {
            name: 'Julia Set',
            formula: 'zₙ₊₁ = zₙ² + c (c fixed)',
            year: '1918',
            description: 'Julia sets are closely related to the Mandelbrot set. Each point in the Mandelbrot set corresponds to a different Julia set. They exhibit beautiful, intricate patterns that vary dramatically with different c values.',
            complexity: 90
        },
        burningship: {
            name: 'Burning Ship',
            formula: 'zₙ₊₁ = (|Re(zₙ)| + i|Im(zₙ)|)² + c',
            year: '1992',
            description: 'The Burning Ship fractal is created by taking the absolute value of both the real and imaginary parts before squaring. This creates a fractal that resembles a ship on fire, with intricate details and symmetry.',
            complexity: 85
        },
        newton: {
            name: 'Newton Fractal',
            formula: 'zₙ₊₁ = zₙ - (zₙ³ - 1)/(3zₙ²)',
            year: '1870',
            description: 'Newton fractals arise from applying Newton\'s method to find roots of complex polynomials. Different initial points converge to different roots, creating beautiful basin boundaries.',
            complexity: 80
        }
    };
    
    // Initialize
    init();
    
    // Event Listeners
    fractalButtons.forEach(button => {
        button.addEventListener('click', function() {
            fractalButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            state.currentFractal = this.dataset.type;
            updateFractalInfo();
            renderFractal();
        });
    });
    
    colorPresets.forEach(preset => {
        preset.addEventListener('click', function() {
            colorPresets.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            state.colorPreset = this.dataset.preset;
            renderFractal();
        });
    });
    
    hueShift.addEventListener('input', function() {
        state.hueShift = parseInt(this.value);
        hueValue.textContent = `${state.hueShift}°`;
        renderFractal();
    });
    
    saturation.addEventListener('input', function() {
        state.saturation = parseInt(this.value);
        saturationValue.textContent = `${state.saturation}%`;
        renderFractal();
    });
    
    brightness.addEventListener('input', function() {
        state.brightness = parseInt(this.value);
        brightnessValue.textContent = `${state.brightness}%`;
        renderFractal();
    });
    
    iterations.addEventListener('input', function() {
        state.maxIterations = parseInt(this.value);
        iterationsValue.textContent = state.maxIterations;
        iterationCount.textContent = state.maxIterations;
    });
    
    escapeRadius.addEventListener('input', function() {
        state.escapeRadius = parseFloat(this.value);
        escapeRadiusValue.textContent = state.escapeRadius.toFixed(1);
    });
    
    renderQuality.addEventListener('input', function() {
        state.renderQuality = parseInt(this.value);
        const qualities = ['Low', 'Medium', 'High', 'Ultra'];
        qualityValue.textContent = qualities[state.renderQuality - 1] || 'Medium';
    });
    
    smoothColoring.addEventListener('change', function() {
        state.smoothColoring = this.checked;
        renderFractal();
    });
    
    // Navigation Events
    zoomInBtn.addEventListener('click', () => zoom(2));
    zoomOutBtn.addEventListener('click', () => zoom(0.5));
    resetViewBtn.addEventListener('click', resetView);
    centerViewBtn.addEventListener('click', centerView);
    renderBtn.addEventListener('click', renderFractal);
    saveImageBtn.addEventListener('click', saveImage);
    randomExploreBtn.addEventListener('click', randomExplore);
    
    // Canvas Events
    canvas.addEventListener('mousedown', startDrag);
    canvas.addEventListener('mousemove', updateDrag);
    canvas.addEventListener('mouseup', endDrag);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('contextmenu', handleRightClick);
    canvas.addEventListener('wheel', handleWheel);
    
    // Info Events
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Modal Events
    helpBtn.addEventListener('click', () => helpModal.style.display = 'flex');
    closeHelpModal.addEventListener('click', () => helpModal.style.display = 'none');
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Functions
    function init() {
        // Set canvas size
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Initialize color controls
        updateColorControls();
        
        // Initialize fractal info
        updateFractalInfo();
        
        // Initial render
        renderFractal();
        
        // Add to history
        addToHistory();
    }
    
    function resizeCanvas() {
        const container = canvas.parentElement;
        const width = container.clientWidth;
        const height = Math.max(400, container.clientHeight);
        
        canvas.width = width;
        canvas.height = height;
        canvasSize.textContent = `${width}×${height}`;
        
        // Update aspect ratio
        state.height = state.width * (height / width);
        
        // Re-render
        renderFractal();
    }
    
    function updateFractalInfo() {
        const info = fractalInfo[state.currentFractal];
        currentFractal.textContent = info.name;
        fractalFormula.textContent = info.formula;
        fractalYear.textContent = info.year;
        fractalDescription.textContent = info.description;
        
        // Update complexity bar
        const complexityBar = document.querySelector('.complexity-fill');
        complexityBar.style.width = `${info.complexity}%`;
        
        const complexityText = document.querySelector('.complexity-text');
        complexityText.textContent = info.complexity > 90 ? 'Very High' :
                                   info.complexity > 70 ? 'High' :
                                   info.complexity > 50 ? 'Medium' : 'Low';
    }
    
    function updateColorControls() {
        hueShift.value = state.hueShift;
        saturation.value = state.saturation;
        brightness.value = state.brightness;
        
        hueValue.textContent = `${state.hueShift}°`;
        saturationValue.textContent = `${state.saturation}%`;
                brightnessValue.textContent = `${state.brightness}%`;
        
        // Set active color preset button
        colorPresets.forEach(preset => {
            preset.classList.remove('active');
            if (preset.dataset.preset === state.colorPreset) {
                preset.classList.add('active');
            }
        });
    }
    
    function renderFractal() {
        if (state.isRendering) return;
        state.isRendering = true;
        
        const startTime = performance.now();
        
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Calculate pixel size based on quality
        const qualityFactor = Math.pow(2, 4 - state.renderQuality);
        const pixelSize = Math.max(1, Math.floor(qualityFactor));
        
        // Calculate complex plane bounds
        const aspectRatio = canvas.height / canvas.width;
        const realRange = state.width / state.zoom;
        const imagRange = realRange * aspectRatio;
        
        const realMin = state.centerX - realRange / 2;
        const realMax = state.centerX + realRange / 2;
        const imagMin = state.centerY - imagRange / 2;
        const imagMax = state.centerY + imagRange / 2;
        
        // Update stats
        updateStats(realRange, imagRange);
        
        // Create ImageData for faster pixel manipulation
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;
        
        let pointsInSet = 0;
        let totalIterations = 0;
        
        // Render each pixel
        for (let y = 0; y < canvas.height; y += pixelSize) {
            for (let x = 0; x < canvas.width; x += pixelSize) {
                // Map pixel to complex plane
                const c_re = realMin + (x / canvas.width) * realRange;
                const c_im = imagMin + ((canvas.height - y) / canvas.height) * imagRange;
                
                let iterations = 0;
                
                // Different fractal formulas
                switch (state.currentFractal) {
                    case 'mandelbrot':
                        iterations = mandelbrotIterations(c_re, c_im);
                        break;
                    case 'julia':
                        const julia_c_re = -0.7;
                        const julia_c_im = 0.27015;
                        iterations = juliaIterations(c_re, c_im, julia_c_re, julia_c_im);
                        break;
                    case 'burningship':
                        iterations = burningShipIterations(c_re, c_im);
                        break;
                    case 'newton':
                        iterations = newtonIterations(c_re, c_im);
                        break;
                }
                
                totalIterations += iterations;
                
                // Color the pixel
                let color;
                if (iterations === state.maxIterations) {
                    color = [0, 0, 0]; // Black for points in the set
                    pointsInSet++;
                } else {
                    color = getColor(iterations);
                }
                
                // Draw pixel block based on quality
                for (let dy = 0; dy < pixelSize && y + dy < canvas.height; dy++) {
                    for (let dx = 0; dx < pixelSize && x + dx < canvas.width; dx++) {
                        const idx = ((y + dy) * canvas.width + (x + dx)) * 4;
                        data[idx] = color[0];     // R
                        data[idx + 1] = color[1]; // G
                        data[idx + 2] = color[2]; // B
                        data[idx + 3] = 255;      // A
                    }
                }
            }
            
            // Allow UI updates during long renders
            if (y % 50 === 0) {
                updateProgress(y / canvas.height * 100);
            }
        }
        
        // Put image data to canvas
        ctx.putImageData(imageData, 0, 0);
        
        // Draw zoom rectangle if dragging
        if (state.isDragging) {
            drawZoomRectangle();
        }
        
        const endTime = performance.now();
        state.lastRenderTime = endTime - startTime;
        
        // Update stats
        updateFinalStats(pointsInSet, totalIterations, state.lastRenderTime);
        setPoints.textContent = pointsInSet.toLocaleString();
        totalPoints.textContent = (canvas.width * canvas.height).toLocaleString();
        
        if (state.lastRenderTime > 0) {
            iterationsPerSec.textContent = Math.round(totalIterations / (state.lastRenderTime / 1000)).toLocaleString();
        }
        
        state.isRendering = false;
        hideLoading();
    }
    
    function mandelbrotIterations(c_re, c_im) {
        let z_re = 0;
        let z_im = 0;
        let z_re2 = 0;
        let z_im2 = 0;
        
        for (let i = 0; i < state.maxIterations; i++) {
            // Check if escaped
            if (z_re2 + z_im2 > state.escapeRadius * state.escapeRadius) {
                if (state.smoothColoring) {
                    return i + 1 - Math.log(Math.log(z_re2 + z_im2) / 2) / Math.log(2);
                }
                return i;
            }
            
            // z = z² + c
            z_im = 2 * z_re * z_im + c_im;
            z_re = z_re2 - z_im2 + c_re;
            
            z_re2 = z_re * z_re;
            z_im2 = z_im * z_im;
        }
        
        return state.maxIterations;
    }
    
    function juliaIterations(z_re, z_im, c_re, c_im) {
        for (let i = 0; i < state.maxIterations; i++) {
            const z_re2 = z_re * z_re;
            const z_im2 = z_im * z_im;
            
            if (z_re2 + z_im2 > state.escapeRadius * state.escapeRadius) {
                if (state.smoothColoring) {
                    return i + 1 - Math.log(Math.log(z_re2 + z_im2) / 2) / Math.log(2);
                }
                return i;
            }
            
            const new_z_im = 2 * z_re * z_im + c_im;
            z_re = z_re2 - z_im2 + c_re;
            z_im = new_z_im;
        }
        
        return state.maxIterations;
    }
    
    function burningShipIterations(c_re, c_im) {
        let z_re = 0;
        let z_im = 0;
        let z_re2 = 0;
        let z_im2 = 0;
        
        for (let i = 0; i < state.maxIterations; i++) {
            if (z_re2 + z_im2 > state.escapeRadius * state.escapeRadius) {
                if (state.smoothColoring) {
                    return i + 1 - Math.log(Math.log(z_re2 + z_im2) / 2) / Math.log(2);
                }
                return i;
            }
            
            // Burning Ship: take absolute value before squaring
            z_re = Math.abs(z_re);
            z_im = Math.abs(z_im);
            
            const new_z_re = z_re2 - z_im2 + c_re;
            z_im = 2 * z_re * z_im + c_im;
            z_re = new_z_re;
            
            z_re2 = z_re * z_re;
            z_im2 = z_im * z_im;
        }
        
        return state.maxIterations;
    }
    
    function newtonIterations(z_re, z_im) {
        // Newton's method for z³ - 1 = 0
        for (let i = 0; i < state.maxIterations; i++) {
            const z2 = z_re * z_re + z_im * z_im;
            
            if (z2 < 0.000001) {
                // Avoid division by zero
                return state.maxIterations;
            }
            
            const z3_re = z_re * z_re * z_re - 3 * z_re * z_im * z_im;
            const z3_im = 3 * z_re * z_re * z_im - z_im * z_im * z_im;
            
            // f(z) = z³ - 1
            // f'(z) = 3z²
            const f_re = z3_re - 1;
            const f_im = z3_im;
            const df_re = 3 * (z_re * z_re - z_im * z_im);
            const df_im = 6 * z_re * z_im;
            
            const denominator = df_re * df_re + df_im * df_im;
            const delta_re = (f_re * df_re + f_im * df_im) / denominator;
            const delta_im = (f_im * df_re - f_re * df_im) / denominator;
            
            z_re -= delta_re;
            z_im -= delta_im;
            
            // Check convergence
            if (delta_re * delta_re + delta_im * delta_im < 0.000001) {
                // Color based on which root it converged to
                const angle = Math.atan2(z_im, z_re);
                return Math.floor((angle + Math.PI) / (2 * Math.PI) * 6);
            }
        }
        
        return state.maxIterations;
    }
    
    function getColor(iterations) {
        const palette = colorPalettes[state.colorPreset];
        
        if (state.smoothColoring && iterations < state.maxIterations) {
            // Smooth coloring
            const t = iterations / state.maxIterations;
            const colorIndex = t * (palette.length - 1);
            const index1 = Math.floor(colorIndex);
            const index2 = Math.min(index1 + 1, palette.length - 1);
            const blend = colorIndex - index1;
            
            const [h1, s1, v1] = palette[index1];
            const [h2, s2, v2] = palette[index2];
            
            let h = (h1 + (h2 - h1) * blend + state.hueShift) % 360;
            if (h < 0) h += 360;
            const s = (s1 + (s2 - s1) * blend) * (state.saturation / 100);
            const v = (v1 + (v2 - v1) * blend) * (state.brightness / 100);
            
            return hsvToRgb(h, s, v);
        } else {
            // Discrete coloring
            const colorIndex = Math.floor(iterations / 10) % palette.length;
            const [h, s, v] = palette[colorIndex];
            
            const shiftedH = (h + state.hueShift) % 360;
            const adjustedS = s * (state.saturation / 100);
            const adjustedV = v * (state.brightness / 100);
            
            return hsvToRgb(shiftedH, adjustedS, adjustedV);
        }
    }
    
    function hsvToRgb(h, s, v) {
        h /= 60;
        s /= 100;
        v /= 100;
        
        const i = Math.floor(h);
        const f = h - i;
        const p = v * (1 - s);
        const q = v * (1 - s * f);
        const t = v * (1 - s * (1 - f));
        
        let r, g, b;
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return [
            Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)
        ];
    }
    
    function updateStats(realRange, imagRange) {
        const aspectRatio = canvas.height / canvas.width;
        const imagRangeCalculated = realRange * aspectRatio;
        
        zoomLevel.textContent = `1:${Math.pow(10, Math.floor(Math.log10(state.zoom))).toLocaleString()}`;
        zoomValue.textContent = state.zoom.toFixed(2);
        
        const realMin = state.centerX - realRange / 2;
        const realMax = state.centerX + realRange / 2;
        const imagMin = state.centerY - imagRangeCalculated / 2;
        const imagMax = state.centerY + imagRangeCalculated / 2;
        
        viewportRange.textContent = `${realRange.toExponential(2)} × ${imagRangeCalculated.toExponential(2)}`;
        pixelScale.textContent = (realRange / canvas.width).toExponential(2);
        
        coordX.textContent = state.centerX.toFixed(6);
        coordY.textContent = state.centerY.toFixed(6);
        
        iterationCount.textContent = state.maxIterations;
    }
    
    function updateFinalStats(pointsInSet, totalIterations, renderTimeMs) {
        renderTime.textContent = `${renderTimeMs.toFixed(0)}ms`;
        
        const percentageInSet = ((pointsInSet / (canvas.width * canvas.height)) * 100).toFixed(2);
        document.querySelector('.in-set-percentage').textContent = `${percentageInSet}%`;
        
        if (renderTimeMs > 0) {
            const iterationsPerSec = Math.round(totalIterations / (renderTimeMs / 1000));
            document.querySelector('.iterations-per-sec').textContent = iterationsPerSec.toLocaleString();
        }
    }
    
    function updateProgress(percentage) {
        loadingIndicator.style.width = `${percentage}%`;
        if (percentage < 100) {
            loadingIndicator.style.display = 'block';
        }
    }
    
    function hideLoading() {
        loadingIndicator.style.display = 'none';
    }
    
    // Navigation Functions
    function zoom(factor) {
        state.zoom *= factor;
        addToHistory();
        renderFractal();
    }
    
    function resetView() {
        state.centerX = -0.5;
        state.centerY = 0;
        state.zoom = 1;
        state.width = 4;
        addToHistory();
        renderFractal();
    }
    
    function centerView() {
        // Center on the current view
        const aspectRatio = canvas.height / canvas.width;
        state.width = 4 / state.zoom;
        state.height = state.width * aspectRatio;
        addToHistory();
        renderFractal();
    }
    
    function randomExplore() {
        // Randomly choose an interesting location
        const locations = [
            { x: -0.743643887037151, y: 0.13182590420533, zoom: 100000 }, // Seahorse valley
            { x: -1.25066, y: 0.02012, zoom: 10000 }, // Elephant valley
            { x: -0.1011, y: 0.9563, zoom: 1000 }, // Triple spiral
            { x: 0.275, y: 0, zoom: 100 }, // Mini mandelbrot
            { x: -1.543, y: 0, zoom: 50 }, // Satellite
        ];
        
        const location = locations[Math.floor(Math.random() * locations.length)];
        state.centerX = location.x + (Math.random() - 0.5) * 0.1;
        state.centerY = location.y + (Math.random() - 0.5) * 0.1;
        state.zoom = location.zoom * (0.5 + Math.random());
        
        addToHistory();
        renderFractal();
    }
    
    // Canvas Interaction Functions
    function startDrag(event) {
        const rect = canvas.getBoundingClientRect();
        state.isDragging = true;
        state.dragStartX = event.clientX - rect.left;
        state.dragStartY = event.clientY - rect.top;
        state.dragEndX = state.dragStartX;
        state.dragEndY = state.dragStartY;
    }
    
    function updateDrag(event) {
        if (!state.isDragging) return;
        
        const rect = canvas.getBoundingClientRect();
        state.dragEndX = event.clientX - rect.left;
        state.dragEndY = event.clientY - rect.top;
        
        // Redraw to show zoom rectangle
        renderFractal();
    }
    
    function endDrag(event) {
        if (!state.isDragging) return;
        
        state.isDragging = false;
        
        const rect = canvas.getBoundingClientRect();
        const endX = event.clientX - rect.left;
        const endY = event.clientY - rect.top;
        
        const width = Math.abs(endX - state.dragStartX);
        const height = Math.abs(endY - state.dragStartY);
        
        // Only zoom if rectangle is big enough
        if (width > 10 && height > 10) {
            zoomToRectangle(state.dragStartX, state.dragStartY, endX, endY);
        }
        
        // Clear zoom rectangle
        renderFractal();
    }
    
    function zoomToRectangle(x1, y1, x2, y2) {
        // Convert screen coordinates to complex plane
        const aspectRatio = canvas.height / canvas.width;
        const realRange = state.width / state.zoom;
        const imagRange = realRange * aspectRatio;
        
        const realMin = state.centerX - realRange / 2;
        const imagMax = state.centerY + imagRange / 2;
        
        const newRealMin = realMin + (Math.min(x1, x2) / canvas.width) * realRange;
        const newRealMax = realMin + (Math.max(x1, x2) / canvas.width) * realRange;
        const newImagMax = imagMax - (Math.min(y1, y2) / canvas.height) * imagRange;
        const newImagMin = imagMax - (Math.max(y1, y2) / canvas.height) * imagRange;
        
        // Calculate new center and zoom
        state.centerX = (newRealMin + newRealMax) / 2;
        state.centerY = (newImagMin + newImagMax) / 2;
        state.zoom *= realRange / (newRealMax - newRealMin);
        
        addToHistory();
        renderFractal();
    }
    
    function drawZoomRectangle() {
        const x = Math.min(state.dragStartX, state.dragEndX);
        const y = Math.min(state.dragStartY, state.dragEndY);
        const width = Math.abs(state.dragEndX - state.dragStartX);
        const height = Math.abs(state.dragEndY - state.dragStartY);
        
        // Draw rectangle on canvas
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        // Also update overlay
        zoomRectangle.style.left = `${x}px`;
        zoomRectangle.style.top = `${y}px`;
        zoomRectangle.style.width = `${width}px`;
        zoomRectangle.style.height = `${height}px`;
        zoomRectangle.style.display = 'block';
    }
    
    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to complex coordinates
        const aspectRatio = canvas.height / canvas.width;
        const realRange = state.width / state.zoom;
        const imagRange = realRange * aspectRatio;
        
        const realMin = state.centerX - realRange / 2;
        const imagMax = state.centerY + imagRange / 2;
        
        const clickedX = realMin + (x / canvas.width) * realRange;
        const clickedY = imagMax - (y / canvas.height) * imagRange;
        
        // Update coordinates display
        coordX.textContent = clickedX.toFixed(6);
        coordY.textContent = clickedY.toFixed(6);
    }
    
    function handleRightClick(event) {
        event.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to complex coordinates and center there
        const aspectRatio = canvas.height / canvas.width;
        const realRange = state.width / state.zoom;
        const imagRange = realRange * aspectRatio;
        
        const realMin = state.centerX - realRange / 2;
        const imagMax = state.centerY + imagRange / 2;
        
        state.centerX = realMin + (x / canvas.width) * realRange;
        state.centerY = imagMax - (y / canvas.height) * imagRange;
        
        addToHistory();
        renderFractal();
    }
    
    function handleWheel(event) {
        event.preventDefault();
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to complex coordinates
        const aspectRatio = canvas.height / canvas.width;
        const realRange = state.width / state.zoom;
        const imagRange = realRange * aspectRatio;
        
        const realMin = state.centerX - realRange / 2;
        const imagMax = state.centerY + imagRange / 2;
        
        const pointX = realMin + (x / canvas.width) * realRange;
        const pointY = imagMax - (y / canvas.height) * imagRange;
        
        // Zoom factor
        const zoomFactor = event.deltaY > 0 ? 1/1.2 : 1.2;
        
        // Zoom towards cursor
        state.centerX = pointX + (state.centerX - pointX) * zoomFactor;
        state.centerY = pointY + (state.centerY - pointY) * zoomFactor;
        state.zoom *= zoomFactor;
        
        addToHistory();
        renderFractal();
    }
    
    function saveImage() {
        const link = document.createElement('a');
        link.download = `fractal-${state.currentFractal}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        addNotification('Image saved successfully!', 'success');
    }
    
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            canvas.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // History Functions
    function addToHistory() {
        const historyEntry = {
            fractal: state.currentFractal,
            centerX: state.centerX,
            centerY: state.centerY,
            zoom: state.zoom,
            timestamp: new Date().toLocaleTimeString()
        };
        
        state.history.unshift(historyEntry);
        
        // Limit history size
        if (state.history.length > state.maxHistory) {
            state.history.pop();
        }
        
        updateHistoryDisplay();
    }
    
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        state.history.forEach((entry, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="history-fractal">${fractalInfo[entry.fractal].name}</span>
                <span class="history-coords">(${entry.centerX.toFixed(3)}, ${entry.centerY.toFixed(3)})</span>
                <span class="history-zoom">Zoom: ${entry.zoom.toFixed(2)}</span>
                <span class="history-time">${entry.timestamp}</span>
                <button class="history-restore-btn" data-index="${index}">↺</button>
            `;
            
            historyList.appendChild(li);
        });
        
        // Add event listeners to restore buttons
        document.querySelectorAll('.history-restore-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                restoreFromHistory(index);
            });
        });
    }
    
    function restoreFromHistory(index) {
        if (index >= 0 && index < state.history.length) {
            const entry = state.history[index];
            
            // Switch fractal if different
            if (entry.fractal !== state.currentFractal) {
                state.currentFractal = entry.fractal;
                updateFractalInfo();
                
                // Update active fractal button
                fractalButtons.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.type === state.currentFractal) {
                        btn.classList.add('active');
                    }
                });
            }
            
            state.centerX = entry.centerX;
            state.centerY = entry.centerY;
            state.zoom = entry.zoom;
            
            renderFractal();
            addNotification('View restored from history', 'info');
        }
    }
    
    function clearHistory() {
        state.history = [];
        updateHistoryDisplay();
        addNotification('History cleared', 'info');
    }
    
    // Notification system
    function addNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
            <span class="notification-text">${message}</span>
        `;
        
        document.querySelector('.notification-area').appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('notification-fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Add CSS for notifications
    const notificationStyles = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: #2c3e50;
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .notification-success {
            background: #27ae60;
        }
        
        .notification-error {
            background: #e74c3c;
        }
        
        .notification-info {
            background: #3498db;
        }
        
        .notification-icon {
            font-weight: bold;
        }
        
        .notification-fade-out {
            animation: slideOutRight 0.3s ease forwards;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = notificationStyles;
    document.head.appendChild(styleSheet);
});