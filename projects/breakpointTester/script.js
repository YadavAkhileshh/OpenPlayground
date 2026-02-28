
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const previewFrame = document.getElementById('previewFrame');
            const currentSize = document.getElementById('currentSize');
            const dimensions = document.getElementById('dimensions');
            const viewportSize = document.getElementById('viewportSize');
            const currentBreakpoint = document.getElementById('currentBreakpoint');
            const breakpointList = document.getElementById('breakpointList');
            const pixelRatio = document.getElementById('pixelRatio');
            const orientation = document.getElementById('orientation');
            const gridOverlay = document.getElementById('gridOverlay');
            
            // Control elements
            const presetsGrid = document.getElementById('presetsGrid');
            const devicePresets = document.querySelectorAll('.device-btn');
            const customWidth = document.getElementById('customWidth');
            const customHeight = document.getElementById('customHeight');
            const applySize = document.getElementById('applySize');
            const testUrl = document.getElementById('testUrl');
            const loadUrl = document.getElementById('loadUrl');
            const toggleGrid = document.getElementById('toggleGrid');
            const fullscreen = document.getElementById('fullscreen');
            const reset = document.getElementById('reset');
            
            // Configuration
            const breakpoints = [
                { name: 'xs', min: 0, max: 575, label: 'Extra Small (<576px)' },
                { name: 'sm', min: 576, max: 767, label: 'Small (576-767px)' },
                { name: 'md', min: 768, max: 991, label: 'Medium (768-991px)' },
                { name: 'lg', min: 992, max: 1199, label: 'Large (992-1199px)' },
                { name: 'xl', min: 1200, max: 1399, label: 'Extra Large (1200-1399px)' },
                { name: 'xxl', min: 1400, max: 9999, label: 'XXL (≥1400px)' }
            ];
            
            const sizePresets = [
                { width: 320, height: 568, label: 'iPhone SE' },
                { width: 375, height: 667, label: 'iPhone 8' },
                { width: 390, height: 844, label: 'iPhone 12' },
                { width: 412, height: 915, label: 'Galaxy S21' },
                { width: 768, height: 1024, label: 'iPad' },
                { width: 1024, height: 1366, label: 'iPad Pro' },
                { width: 1280, height: 720, label: 'HD' },
                { width: 1366, height: 768, label: 'Laptop' },
                { width: 1440, height: 900, label: 'MacBook' },
                { width: 1920, height: 1080, label: 'Full HD' },
                { width: 2560, height: 1440, label: '2K' },
                { width: 3840, height: 2160, label: '4K' }
            ];
            
            // State
            let currentWidth = 1000;
            let currentHeight = 600;
            let isGridVisible = false;
            let activeBreakpoints = [];
            
            // Initialize
            function init() {
                generatePresetButtons();
                updatePreview();
                updateInfo();
                setupEventListeners();
                setupResizeObserver();
                
                // Set initial custom size inputs
                customWidth.value = currentWidth;
                customHeight.value = currentHeight;
                
                // Update pixel ratio
                pixelRatio.textContent = window.devicePixelRatio.toFixed(1);
                
                // Update orientation
                updateOrientation();
                window.addEventListener('resize', updateOrientation);
            }
            
            // Generate preset buttons
            function generatePresetButtons() {
                presetsGrid.innerHTML = '';
                
                sizePresets.forEach(preset => {
                    const button = document.createElement('button');
                    button.className = 'preset-btn';
                    button.innerHTML = `
                        <div class="preset-size">${preset.width}×${preset.height}</div>
                        <div class="preset-name">${preset.label}</div>
                    `;
                    
                    button.addEventListener('click', () => {
                        setSize(preset.width, preset.height);
                        highlightPreset(button);
                    });
                    
                    presetsGrid.appendChild(button);
                });
                
                // Highlight first preset initially
                if (presetsGrid.firstChild) {
                    highlightPreset(presetsGrid.firstChild);
                }
            }
            
            // Set size and update preview
            function setSize(width, height) {
                currentWidth = width;
                currentHeight = height;
                updatePreview();
                updateInfo();
                
                // Update custom inputs
                customWidth.value = width;
                customHeight.value = height;
            }
            
            // Update preview frame
            function updatePreview() {
                previewFrame.style.width = `${currentWidth}px`;
                previewFrame.style.height = `${currentHeight}px`;
                currentSize.textContent = `${currentWidth} × ${currentHeight}`;
                dimensions.textContent = `${currentWidth} × ${currentHeight}`;
            }
            
            // Update info panel
            function updateInfo() {
                viewportSize.textContent = `${currentWidth} × ${currentHeight}px`;
                
                // Update breakpoints
                activeBreakpoints = breakpoints.filter(bp => 
                    currentWidth >= bp.min && currentWidth <= bp.max
                );
                
                // Update current breakpoint
                if (activeBreakpoints.length > 0) {
                    const mainBreakpoint = activeBreakpoints[0];
                    currentBreakpoint.textContent = mainBreakpoint.label;
                    
                    // Update breakpoint list
                    breakpointList.innerHTML = '';
                    breakpoints.forEach(bp => {
                        const span = document.createElement('span');
                        span.className = 'breakpoint-tag';
                        span.textContent = bp.name;
                        
                        if (bp.name === mainBreakpoint.name) {
                            span.classList.add('active');
                        }
                        
                        breakpointList.appendChild(span);
                    });
                }
            }
            
            // Update orientation
            function updateOrientation() {
                orientation.textContent = currentWidth >= currentHeight ? 'Landscape' : 'Portrait';
            }
            
            // Highlight active preset
            function highlightPreset(activeButton) {
                document.querySelectorAll('.preset-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                activeButton.classList.add('active');
            }
            
            // Highlight active device
            function highlightDevice(activeDevice) {
                devicePresets.forEach(device => {
                    device.classList.remove('active');
                });
                activeDevice.classList.add('active');
            }
            
            // Setup event listeners
            function setupEventListeners() {
                // Device preset buttons
                devicePresets.forEach(device => {
                    device.addEventListener('click', () => {
                        const width = parseInt(device.dataset.width);
                        const height = parseInt(device.dataset.height);
                        setSize(width, height);
                        highlightDevice(device);
                    });
                });
                
                // Apply custom size
                applySize.addEventListener('click', () => {
                    const width = parseInt(customWidth.value) || 1000;
                    const height = parseInt(customHeight.value) || 600;
                    setSize(width, height);
                    
                    // Remove highlights from presets
                    document.querySelectorAll('.preset-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    devicePresets.forEach(device => {
                        device.classList.remove('active');
                    });
                });
                
                // Load URL
                loadUrl.addEventListener('click', () => {
                    let url = testUrl.value.trim();
                    if (!url.startsWith('http')) {
                        url = 'https://' + url;
                    }
                    previewFrame.src = url;
                });
                
                testUrl.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        loadUrl.click();
                    }
                });
                
                // Toggle grid
                toggleGrid.addEventListener('click', () => {
                    isGridVisible = !isGridVisible;
                    gridOverlay.style.opacity = isGridVisible ? '1' : '0';
                    toggleGrid.classList.toggle('active', isGridVisible);
                });
                
                // Fullscreen
                fullscreen.addEventListener('click', () => {
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                });
                
                // Reset
                reset.addEventListener('click', () => {
                    setSize(1000, 600);
                    testUrl.value = 'https://example.com';
                    previewFrame.src = 'https://example.com';
                    gridOverlay.style.opacity = '0';
                    isGridVisible = false;
                    toggleGrid.classList.remove('active');
                    
                    // Remove highlights
                    document.querySelectorAll('.preset-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    devicePresets.forEach(device => {
                        device.classList.remove('active');
                    });
                    
                    // Highlight first preset
                    if (presetsGrid.firstChild) {
                        highlightPreset(presetsGrid.firstChild);
                    }
                });
                
                // Handle fullscreen changes
                document.addEventListener('fullscreenchange', () => {
                    fullscreen.innerHTML = document.fullscreenElement ? 
                        '<i class="fas fa-compress"></i> Exit' : 
                        '<i class="fas fa-expand"></i> Full';
                });
                
                // Handle keyboard shortcuts
                document.addEventListener('keydown', (e) => {
                    // Ctrl/Cmd + G to toggle grid
                    if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
                        e.preventDefault();
                        toggleGrid.click();
                    }
                    
                    // Ctrl/Cmd + F for fullscreen
                    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                        e.preventDefault();
                        fullscreen.click();
                    }
                    
                    // Ctrl/Cmd + R to reset
                    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                        e.preventDefault();
                        reset.click();
                    }
                    
                    // Escape to exit fullscreen
                    if (e.key === 'Escape' && document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                });
                
                // Allow manual resizing by dragging
                setupResizeHandles();
            }
            
            // Setup resize handles for the preview
            function setupResizeHandles() {
                const container = document.querySelector('.preview-container');
                
                // Create resize handle
                const handle = document.createElement('div');
                handle.style.position = 'absolute';
                handle.style.bottom = '0';
                handle.style.right = '0';
                handle.style.width = '20px';
                handle.style.height = '20px';
                handle.style.backgroundColor = '#667eea';
                handle.style.cursor = 'se-resize';
                handle.style.zIndex = '100';
                handle.style.borderRadius = '0 0 4px 0';
                
                container.appendChild(handle);
                
                // Resize functionality
                let isResizing = false;
                
                handle.addEventListener('mousedown', startResize);
                
                function startResize(e) {
                    e.preventDefault();
                    isResizing = true;
                    
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = currentWidth;
                    const startHeight = currentHeight;
                    
                    function doResize(e) {
                        if (!isResizing) return;
                        
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        
                        const newWidth = Math.max(100, startWidth + deltaX);
                        const newHeight = Math.max(100, startHeight + deltaY);
                        
                        setSize(newWidth, newHeight);
                    }
                    
                    function stopResize() {
                        isResizing = false;
                        document.removeEventListener('mousemove', doResize);
                        document.removeEventListener('mouseup', stopResize);
                    }
                    
                    document.addEventListener('mousemove', doResize);
                    document.addEventListener('mouseup', stopResize);
                }
            }
            
            // Setup resize observer for iframe content
            function setupResizeObserver() {
                if (window.ResizeObserver) {
                    const resizeObserver = new ResizeObserver(entries => {
                        for (let entry of entries) {
                            // Update dimensions if iframe content resizes
                            if (entry.target === previewFrame) {
                                updateInfo();
                            }
                        }
                    });
                    
                    resizeObserver.observe(previewFrame);
                }
            }
            
            // Initialize the app
            init();
        });
    