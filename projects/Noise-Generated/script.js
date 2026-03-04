// Noise-Generated UI Layout Generator
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Simplex Noise
    const simplex = new SimplexNoise();
    
    // DOM Elements
    const noiseCanvas = document.getElementById('noiseCanvas');
    const noisePreview = document.getElementById('noisePreview');
    const layoutArea = document.getElementById('layoutArea');
    const uiElementsContainer = document.getElementById('uiElements');
    const floatingElements = document.getElementById('floatingElements');
    
    // Control Elements
    const frequencySlider = document.getElementById('frequency');
    const amplitudeSlider = document.getElementById('amplitude');
    const octavesSlider = document.getElementById('octaves');
    const seedSlider = document.getElementById('seed');
    const freqValue = document.getElementById('freqValue');
    const ampValue = document.getElementById('ampValue');
    const octValue = document.getElementById('octValue');
    const seedValue = document.getElementById('seedValue');
    
    // Color Controls
    const primaryColor = document.getElementById('primaryColor');
    const secondaryColor = document.getElementById('secondaryColor');
    const bgColor = document.getElementById('bgColor');
    const colorPresets = document.querySelectorAll('.preset');
    
    // Buttons
    const randomizeBtn = document.getElementById('randomize');
    const regenerateBtn = document.getElementById('regenerate');
    const exportBtn = document.getElementById('exportLayout');
    const toggleNoiseBtn = document.getElementById('toggleNoise');
    const toggleWireframeBtn = document.getElementById('toggleWireframe');
    
    // Stats Elements
    const elementCount = document.getElementById('elementCount');
    const complexity = document.getElementById('complexity');
    const organicScore = document.getElementById('organicScore');
    const genTime = document.getElementById('genTime');
    
    // State Variables
    let state = {
        frequency: 0.05,
        amplitude: 50,
        octaves: 4,
        seed: 12345,
        colorPrimary: '#4a7c3a',
        colorSecondary: '#2d5016',
        colorBackground: '#1a1f2e',
        isAnimating: false,
        showWireframe: false,
        generatedElements: [],
        noiseOffset: 0
    };
    
    // UI Element Templates
    const elementTemplates = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: 'fas fa-tachometer-alt',
            content: 'Real-time metrics and analytics dashboard',
            size: 'medium',
            category: 'analytics'
        },
        {
            id: 'user-profile',
            title: 'User Profile',
            icon: 'fas fa-user-circle',
            content: 'User information and activity feed',
            size: 'small',
            category: 'user'
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: 'fas fa-cog',
            content: 'System configuration and preferences',
            size: 'medium',
            category: 'system'
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: 'fas fa-bell',
            content: 'Alerts and notification center',
            size: 'small',
            category: 'communication'
        },
        {
            id: 'messages',
            title: 'Messages',
            icon: 'fas fa-comments',
            content: 'Chat and messaging interface',
            size: 'large',
            category: 'communication'
        },
        {
            id: 'calendar',
            title: 'Calendar',
            icon: 'fas fa-calendar-alt',
            content: 'Event scheduling and calendar',
            size: 'medium',
            category: 'productivity'
        },
        {
            id: 'files',
            title: 'File Manager',
            icon: 'fas fa-folder',
            content: 'Document storage and management',
            size: 'large',
            category: 'storage'
        },
        {
            id: 'analytics',
            title: 'Analytics',
            icon: 'fas fa-chart-bar',
            content: 'Data visualization and reports',
            size: 'large',
            category: 'analytics'
        },
        {
            id: 'tasks',
            title: 'Task Manager',
            icon: 'fas fa-tasks',
            content: 'To-do list and task management',
            size: 'medium',
            category: 'productivity'
        },
        {
            id: 'media',
            title: 'Media Gallery',
            icon: 'fas fa-images',
            content: 'Photo and video gallery',
            size: 'medium',
            category: 'media'
        }
    ];
    
    // Initialize the application
    function init() {
        setupCanvas();
        setupEventListeners();
        updateUIFromState();
        generateLayout();
        createFloatingElements();
        updateNoisePreview();
        animateNoiseBackground();
        
        console.log('Noise-Generated UI Layout initialized');
    }
    
    // Setup canvas contexts
    function setupCanvas() {
        noiseCanvas.width = window.innerWidth;
        noiseCanvas.height = window.innerHeight;
        
        noisePreview.width = noisePreview.offsetWidth;
        noisePreview.height = noisePreview.offsetHeight;
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Slider events
        frequencySlider.addEventListener('input', (e) => {
            state.frequency = parseFloat(e.target.value);
            freqValue.textContent = state.frequency.toFixed(3);
            generateLayout();
        });
        
        amplitudeSlider.addEventListener('input', (e) => {
            state.amplitude = parseInt(e.target.value);
            ampValue.textContent = state.amplitude;
            generateLayout();
        });
        
        octavesSlider.addEventListener('input', (e) => {
            state.octaves = parseInt(e.target.value);
            octValue.textContent = state.octaves;
            generateLayout();
        });
        
        seedSlider.addEventListener('input', (e) => {
            state.seed = parseInt(e.target.value);
            seedValue.textContent = state.seed;
            generateLayout();
        });
        
        // Color events
        primaryColor.addEventListener('input', (e) => {
            state.colorPrimary = e.target.value;
            updateColors();
        });
        
        secondaryColor.addEventListener('input', (e) => {
            state.colorSecondary = e.target.value;
            updateColors();
        });
        
        bgColor.addEventListener('input', (e) => {
            state.colorBackground = e.target.value;
            updateColors();
        });
        
        // Preset events
        colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const presetName = preset.dataset.preset;
                applyColorPreset(presetName);
            });
        });
        
        // Button events
        randomizeBtn.addEventListener('click', randomizeParameters);
        regenerateBtn.addEventListener('click', generateLayout);
        exportBtn.addEventListener('click', exportLayout);
        toggleNoiseBtn.addEventListener('click', toggleNoiseAnimation);
        toggleWireframeBtn.addEventListener('click', toggleWireframe);
        
        // Window resize
        window.addEventListener('resize', () => {
            noiseCanvas.width = window.innerWidth;
            noiseCanvas.height = window.innerHeight;
            noisePreview.width = noisePreview.offsetWidth;
            noisePreview.height = noisePreview.offsetHeight;
            generateLayout();
        });
    }
    
    // Update UI from state
    function updateUIFromState() {
        frequencySlider.value = state.frequency;
        amplitudeSlider.value = state.amplitude;
        octavesSlider.value = state.octaves;
        seedSlider.value = state.seed;
        
        freqValue.textContent = state.frequency.toFixed(3);
        ampValue.textContent = state.amplitude;
        octValue.textContent = state.octaves;
        seedValue.textContent = state.seed;
        
        primaryColor.value = state.colorPrimary;
        secondaryColor.value = state.colorSecondary;
        bgColor.value = state.colorBackground;
    }
    
    // Generate noise value at coordinates
    function getNoiseValue(x, y, frequency, amplitude, octaves, seed) {
        let value = 0;
        let maxValue = 0;
        let freq = frequency;
        let amp = 1;
        
        for (let i = 0; i < octaves; i++) {
            value += simplex.noise3D(x * freq + seed, y * freq + seed, state.noiseOffset) * amp;
            maxValue += amp;
            freq *= 2;
            amp *= 0.5;
        }
        
        return value / maxValue * amplitude;
    }
    
    // Generate organic layout
    function generateLayout() {
        const startTime = performance.now();
        
        // Clear existing elements
        uiElementsContainer.innerHTML = '';
        state.generatedElements = [];
        
        // Get container dimensions
        const containerWidth = uiElementsContainer.offsetWidth;
        const containerHeight = uiElementsContainer.offsetHeight;
        
        // Calculate element count based on noise parameters
        const elementCountValue = Math.floor((state.frequency * 100) + (state.octaves * 2));
        const actualCount = Math.min(Math.max(elementCountValue, 5), 12);
        
        // Generate positions using noise
        const positions = [];
        const spacing = 150;
        
        for (let i = 0; i < actualCount; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;
            
            while (!validPosition && attempts < 100) {
                // Generate base position
                x = Math.random() * (containerWidth - 200) + 100;
                y = Math.random() * (containerHeight - 150) + 75;
                
                // Apply noise offset
                const noiseX = getNoiseValue(x * 0.01, y * 0.01, state.frequency, state.amplitude, state.octaves, state.seed);
                const noiseY = getNoiseValue(y * 0.01, x * 0.01, state.frequency, state.amplitude, state.octaves, state.seed + 1000);
                
                x += noiseX;
                y += noiseY;
                
                // Check boundaries
                if (x < 20 || x > containerWidth - 180 || y < 20 || y > containerHeight - 130) {
                    attempts++;
                    continue;
                }
                
                // Check overlap with existing positions
                validPosition = true;
                for (const pos of positions) {
                    const dx = x - pos.x;
                    const dy = y - pos.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < spacing) {
                        validPosition = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (validPosition) {
                positions.push({ x, y });
                
                // Get random template
                const template = elementTemplates[i % elementTemplates.length];
                
                // Create element
                createUIElement(template, x, y, i);
                state.generatedElements.push({ x, y, template });
            }
        }
        
        // Update statistics
        updateStatistics(actualCount, startTime);
        updateNoisePreview();
    }
    
    // Create a UI element
    function createUIElement(template, x, y, index) {
        const element = document.createElement('div');
        element.className = 'ui-element';
        element.dataset.id = template.id;
        
        // Add noise-based rotation
        const rotation = getNoiseValue(x * 0.02, y * 0.02, state.frequency * 2, 15, 2, state.seed + 500);
        element.style.transform = `rotate(${rotation}deg)`;
        
        // Set position
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        
        // Set size based on template
        let width, height;
        switch (template.size) {
            case 'small':
                width = 180;
                height = 120;
                break;
            case 'large':
                width = 280;
                height = 200;
                break;
            default: // medium
                width = 220;
                height = 160;
        }
        
        // Add slight size variation based on noise
        const sizeVariation = getNoiseValue(x * 0.03, y * 0.03, state.frequency * 3, 0.2, 1, state.seed + 100);
        element.style.width = `${width * (1 + sizeVariation)}px`;
        element.style.height = `${height * (1 + sizeVariation)}px`;
        
        // Set background color with gradient based on noise
        const colorVariation = getNoiseValue(x * 0.05, y * 0.05, state.frequency, 0.3, 1, state.seed + 200);
        const color1 = adjustColor(state.colorPrimary, colorVariation * 20);
        const color2 = adjustColor(state.colorSecondary, colorVariation * -20);
        
        element.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
        
        // Create element content
        element.innerHTML = `
            <div class="element-header">
                <i class="element-icon ${template.icon}"></i>
                <span class="element-title">${template.title}</span>
            </div>
            <div class="element-content">${template.content}</div>
            <div class="element-stats">
                <div class="stat">
                    <span class="stat-value">${Math.floor(Math.random() * 100)}</span>
                    <span class="stat-label">Score</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${Math.floor(Math.random() * 24)}h</span>
                    <span class="stat-label">Active</span>
                </div>
                <div class="stat">
                    <span class="stat-value">${Math.floor(Math.random() * 1000)}</span>
                    <span class="stat-label">Items</span>
                </div>
            </div>
        `;
        
        // Add drag functionality
        makeDraggable(element);
        
        // Add to container
        uiElementsContainer.appendChild(element);
        
        // Add animation delay
        element.style.animationDelay = `${index * 0.1}s`;
    }
    
    // Make element draggable
    function makeDraggable(element) {
        let isDragging = false;
        let offsetX, offsetY;
        
        element.addEventListener('mousedown', startDrag);
        element.addEventListener('touchstart', startDragTouch);
        
        function startDrag(e) {
            isDragging = true;
            offsetX = e.offsetX;
            offsetY = e.offsetY;
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            e.preventDefault();
        }
        
        function startDragTouch(e) {
            isDragging = true;
            const touch = e.touches[0];
            const rect = element.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            document.addEventListener('touchmove', dragTouch);
            document.addEventListener('touchend', stopDrag);
            e.preventDefault();
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const containerRect = uiElementsContainer.getBoundingClientRect();
            const x = e.clientX - containerRect.left - offsetX;
            const y = e.clientY - containerRect.top - offsetY;
            
            // Keep element within bounds
            const maxX = containerRect.width - element.offsetWidth;
            const maxY = containerRect.height - element.offsetHeight;
            
            element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        }
        
        function dragTouch(e) {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const containerRect = uiElementsContainer.getBoundingClientRect();
            const x = touch.clientX - containerRect.left - offsetX;
            const y = touch.clientY - containerRect.top - offsetY;
            
            // Keep element within bounds
            const maxX = containerRect.width - element.offsetWidth;
            const maxY = containerRect.height - element.offsetHeight;
            
            element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', dragTouch);
            document.removeEventListener('touchend', stopDrag);
        }
    }
    
    // Update statistics
    function updateStatistics(count, startTime) {
        const endTime = performance.now();
        const generationTime = Math.round(endTime - startTime);
        
        elementCount.textContent = count;
        genTime.textContent = `${generationTime}ms`;
        
        // Calculate complexity based on noise parameters
        const complexityValue = Math.round((state.frequency * 1000 + state.amplitude + state.octaves * 25) / 3);
        complexity.textContent = `${Math.min(complexityValue, 100)}%`;
        
        // Calculate organic score
        const organicValue = Math.round((state.frequency * 500 + state.octaves * 12.5) / 2);
        organicScore.textContent = `${Math.min(organicValue, 100)}%`;
    }
    
    // Update colors throughout the UI
    function updateColors() {
        // Update CSS variables or directly set styles
        document.documentElement.style.setProperty('--color-primary', state.colorPrimary);
        document.documentElement.style.setProperty('--color-secondary', state.colorSecondary);
        
        // Update button gradients
        document.querySelectorAll('.btn-organic').forEach(btn => {
            btn.style.background = `linear-gradient(45deg, ${state.colorSecondary}, ${state.colorPrimary})`;
        });
        
        // Update slider colors
        document.querySelectorAll('.param-slider input[type="range"]').forEach(slider => {
            slider.style.background = `linear-gradient(90deg, ${state.colorSecondary}, ${state.colorPrimary})`;
        });
        
        // Update generated elements
        state.generatedElements.forEach((elem, index) => {
            const element = document.querySelector(`.ui-element[data-id="${elem.template.id}"]`);
            if (element) {
                const x = parseInt(element.style.left);
                const y = parseInt(element.style.top);
                const colorVariation = getNoiseValue(x * 0.05, y * 0.05, state.frequency, 0.3, 1, state.seed + 200);
                const color1 = adjustColor(state.colorPrimary, colorVariation * 20);
                const color2 = adjustColor(state.colorSecondary, colorVariation * -20);
                
                element.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
            }
        });
    }
    
    // Apply color preset
    function applyColorPreset(presetName) {
        switch (presetName) {
            case 'forest':
                state.colorPrimary = '#4a7c3a';
                state.colorSecondary = '#2d5016';
                state.colorBackground = '#1a1f2e';
                break;
            case 'ocean':
                state.colorPrimary = '#3a86ff';
                state.colorSecondary = '#0d3b66';
                state.colorBackground = '#0a2540';
                break;
            case 'desert':
                state.colorPrimary = '#e09f3e';
                state.colorSecondary = '#9e2a2b';
                state.colorBackground = '#2d1b1b';
                break;
            case 'aurora':
                state.colorPrimary = '#00b4d8';
                state.colorSecondary = '#2d00f7';
                state.colorBackground = '#0a0a2a';
                break;
        }
        
        updateUIFromState();
        updateColors();
        document.body.style.background = `linear-gradient(135deg, ${state.colorBackground} 0%, ${adjustColor(state.colorBackground, -20)} 100%)`;
    }
    
    // Randomize all parameters
    function randomizeParameters() {
        state.frequency = Math.random() * 0.15 + 0.01;
        state.amplitude = Math.floor(Math.random() * 150 + 20);
        state.octaves = Math.floor(Math.random() * 6 + 2);
        state.seed = Math.floor(Math.random() * 90000 + 10000);
        
        updateUIFromState();
        generateLayout();
    }
    
    // Update noise preview
    function updateNoisePreview() {
        const ctx = noisePreview.getContext('2d');
        const width = noisePreview.width;
        const height = noisePreview.height;
        
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const noise = getNoiseValue(
                    x * 0.05, 
                    y * 0.05, 
                    state.frequency, 
                    1, 
                    state.octaves, 
                    state.seed
                );
                
                const index = (y * width + x) * 4;
                const value = Math.floor((noise + 1) * 128);
                
                // Create color based on noise value
                const r = Math.floor(value * 0.3);
                const g = Math.floor(value * 0.7);
                const b = Math.floor(value * 0.5);
                
                data[index] = r;     // Red
                data[index + 1] = g; // Green
                data[index + 2] = b; // Blue
                data[index + 3] = 255; // Alpha
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Add wireframe if enabled
        if (state.showWireframe) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            
            const step = 20;
            for (let y = 0; y < height; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
            
            for (let x = 0; x < width; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }
    }
    
    // Animate noise background
    function animateNoiseBackground() {
        if (!state.isAnimating) return;
        
        state.noiseOffset += 0.01;
        
        const ctx = noiseCanvas.getContext('2d');
        const width = noiseCanvas.width;
        const height = noiseCanvas.height;
        
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;
        
        for (let y = 0; y < height; y += 2) {
            for (let x = 0; x < width; x += 2) {
                const noise = getNoiseValue(
                    x * 0.005, 
                    y * 0.005, 
                    0.02, 
                    1, 
                    2, 
                    state.seed + state.noiseOffset * 100
                );
                
                const index = (y * width + x) * 4;
                const alpha = Math.floor((noise + 1) * 20);
                
                data[index] = 100;     // Red
                data[index + 1] = 150; // Green
                data[index + 2] = 255; // Blue
                data[index + 3] = alpha; // Alpha
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        requestAnimationFrame(animateNoiseBackground);
    }
    
    // Create floating background elements
    function createFloatingElements() {
        const count = 15;
        
        for (let i = 0; i < count; i++) {
            const element = document.createElement('div');
            element.className = 'floating-element floating-shape';
            
            // Random size and position
            const size = Math.random() * 80 + 20;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            
            element.style.left = `${Math.random() * 100}vw`;
            element.style.top = `${Math.random() * 100}vh`;
            
            // Random animation delay
            element.style.animationDelay = `${Math.random() * 5}s`;
            element.style.animationDuration = `${15 + Math.random() * 20}s`;
            
            floatingElements.appendChild(element);
        }
    }
    
    // Toggle noise animation
    function toggleNoiseAnimation() {
        state.isAnimating = !state.isAnimating;
        
        if (state.isAnimating) {
            toggleNoiseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            animateNoiseBackground();
        } else {
            toggleNoiseBtn.innerHTML = '<i class="fas fa-play"></i> Animate';
        }
    }
    
    // Toggle wireframe
    function toggleWireframe() {
        state.showWireframe = !state.showWireframe;
        
        if (state.showWireframe) {
            toggleWireframeBtn.innerHTML = '<i class="fas fa-th-large"></i> Grid';
        } else {
            toggleWireframeBtn.innerHTML = '<i class="fas fa-th"></i> Wireframe';
        }
        
        updateNoisePreview();
    }
    
    // Export layout as JSON
    function exportLayout() {
        const exportData = {
            parameters: {
                frequency: state.frequency,
                amplitude: state.amplitude,
                octaves: state.octaves,
                seed: state.seed,
                colors: {
                    primary: state.colorPrimary,
                    secondary: state.colorSecondary,
                    background: state.colorBackground
                }
            },
            elements: state.generatedElements.map(elem => ({
                id: elem.template.id,
                title: elem.template.title,
                position: { x: elem.x, y: elem.y },
                size: elem.template.size,
                category: elem.template.category
            })),
            metadata: {
                generated: new Date().toISOString(),
                elementCount: state.generatedElements.length,
                complexity: complexity.textContent,
                organicScore: organicScore.textContent
            }
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `noise-layout-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        // Show export confirmation
        const confirmation = document.createElement('div');
        confirmation.textContent = 'Layout exported successfully!';
        confirmation.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${state.colorPrimary};
            color: white;
            padding: 12px 20px;
            border-radius: 10px;
            z-index: 1000;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 3000);
    }
    
    // Utility function to adjust color brightness
    function adjustColor(color, amount) {
        let usePound = false;
        
        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }
        
        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let b = ((num >> 8) & 0x00FF) + amount;
        let g = (num & 0x0000FF) + amount;
        
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
    }
    
    // Initialize the application
    init();
});