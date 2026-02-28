document.addEventListener('DOMContentLoaded', () => {
    // App state
    const state = {
        currentColor: '#ff4757',
        currentTool: 'pencil',
        gridSize: 16,
        pixelSize: 20,
        showGrid: true,
        frames: [],
        currentFrameIndex: 0,
        isPlaying: false,
        fps: 5,
        animationInterval: null,
        colorPalette: [
            '#ff4757', '#ff6b81', '#ffa502', '#ffd32a',
            '#1e90ff', '#3742fa', '#2ed573', '#7bed9f',
            '#70a1ff', '#5352ed', '#ff6348', '#ffa502',
            '#ffffff', '#dfe4ea', '#747d8c', '#2f3542'
        ]
    };

    // DOM elements
    const pixelCanvas = document.getElementById('pixel-canvas');
    const colorPalette = document.getElementById('color-palette');
    const currentColorEl = document.getElementById('current-color');
    const colorPickerInput = document.getElementById('color-picker-input');
    const gridSizeSelect = document.getElementById('grid-size');
    const pixelSizeSlider = document.getElementById('pixel-size');
    const pixelSizeValue = document.getElementById('pixel-size-value');
    const clearCanvasBtn = document.getElementById('clear-canvas');
    const toggleGridBtn = document.getElementById('toggle-grid');
    const framesContainer = document.getElementById('frames-container');
    const addFrameBtn = document.getElementById('add-frame');
    const duplicateFrameBtn = document.getElementById('duplicate-frame');
    const deleteFrameBtn = document.getElementById('delete-frame');
    const prevFrameBtn = document.getElementById('prev-frame');
    const playPauseBtn = document.getElementById('play-pause');
    const nextFrameBtn = document.getElementById('next-frame');
    const fpsSlider = document.getElementById('fps');
    const fpsValue = document.getElementById('fps-value');
    const currentFrameEl = document.getElementById('current-frame');
    const totalFramesEl = document.getElementById('total-frames');
    const animationStatus = document.getElementById('animation-status');
    const exportGifBtn = document.getElementById('export-gif');
    const exportPngBtn = document.getElementById('export-png');
    const exportModal = document.getElementById('export-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const closeExportBtn = document.getElementById('close-export');
    const exportStatus = document.getElementById('export-status');
    const exportResult = document.getElementById('export-result');
    const coordX = document.getElementById('coord-x');
    const coordY = document.getElementById('coord-y');
    
    // Tool buttons
    const toolButtons = {
        pencil: document.getElementById('pencil'),
        eraser: document.getElementById('eraser'),
        fill: document.getElementById('fill'),
        colorPicker: document.getElementById('color-picker')
    };

    // Initialize the app
    function init() {
        createColorPalette();
        initializeFirstFrame();
        setupEventListeners();
        updateUI();
        renderCanvas();
    }

    // Create color palette
    function createColorPalette() {
        colorPalette.innerHTML = '';
        state.colorPalette.forEach(color => {
            const colorCell = document.createElement('div');
            colorCell.className = 'color-cell';
            colorCell.style.backgroundColor = color;
            colorCell.dataset.color = color;
            
            if (color === state.currentColor) {
                colorCell.classList.add('selected');
            }
            
            colorCell.addEventListener('click', () => {
                setCurrentColor(color);
                document.querySelectorAll('.color-cell').forEach(cell => {
                    cell.classList.remove('selected');
                });
                colorCell.classList.add('selected');
            });
            
            colorPalette.appendChild(colorCell);
        });
        
        currentColorEl.style.backgroundColor = state.currentColor;
        colorPickerInput.value = state.currentColor;
    }

    // Set current color
    function setCurrentColor(color) {
        state.currentColor = color;
        currentColorEl.style.backgroundColor = color;
        colorPickerInput.value = color;
    }

    // Initialize first frame
    function initializeFirstFrame() {
        const firstFrame = createEmptyFrame();
        state.frames.push(firstFrame);
        state.currentFrameIndex = 0;
        renderFrames();
    }

    // Create empty frame data
    function createEmptyFrame() {
        const frame = {
            id: Date.now() + Math.random(),
            pixels: []
        };
        
        for (let i = 0; i < state.gridSize * state.gridSize; i++) {
            frame.pixels.push('#ffffff'); // White pixels
        }
        
        return frame;
    }

    // Render the canvas based on current frame
    function renderCanvas() {
        pixelCanvas.innerHTML = '';
        pixelCanvas.style.gridTemplateColumns = `repeat(${state.gridSize}, ${state.pixelSize}px)`;
        pixelCanvas.style.width = `${state.gridSize * state.pixelSize}px`;
        
        const currentFrame = state.frames[state.currentFrameIndex];
        
        for (let i = 0; i < state.gridSize * state.gridSize; i++) {
            const pixel = document.createElement('div');
            pixel.className = `pixel ${state.showGrid ? 'with-border' : ''}`;
            pixel.style.width = `${state.pixelSize}px`;
            pixel.style.height = `${state.pixelSize}px`;
            pixel.style.backgroundColor = currentFrame.pixels[i];
            pixel.dataset.index = i;
            
            // Mouse events for drawing
            let isDrawing = false;
            
            pixel.addEventListener('mousedown', (e) => {
                isDrawing = true;
                handlePixelClick(i, e);
            });
            
            pixel.addEventListener('mouseover', (e) => {
                if (isDrawing) {
                    handlePixelClick(i, e);
                }
                
                // Update coordinates display
                const x = i % state.gridSize;
                const y = Math.floor(i / state.gridSize);
                coordX.textContent = x;
                coordY.textContent = y;
            });
            
            pixel.addEventListener('mouseup', () => {
                isDrawing = false;
            });
            
            pixelCanvas.appendChild(pixel);
        }
        
        // Handle mouseup outside the canvas
        document.addEventListener('mouseup', () => {
            isDrawing = false;
        });
    }

    // Handle pixel click based on current tool
    function handlePixelClick(index, event) {
        const currentFrame = state.frames[state.currentFrameIndex];
        
        switch (state.currentTool) {
            case 'pencil':
                currentFrame.pixels[index] = state.currentColor;
                break;
            case 'eraser':
                currentFrame.pixels[index] = '#ffffff';
                break;
            case 'fill':
                floodFill(index, currentFrame.pixels[index], state.currentColor, currentFrame.pixels);
                break;
            case 'color-picker':
                setCurrentColor(currentFrame.pixels[index]);
                break;
        }
        
        renderCanvas();
        updateFramePreview(state.currentFrameIndex);
    }

    // Flood fill algorithm
    function floodFill(index, targetColor, replacementColor, pixels) {
        if (targetColor === replacementColor) return;
        
        const stack = [index];
        const visited = new Set();
        const gridSize = state.gridSize;
        
        while (stack.length > 0) {
            const currentIndex = stack.pop();
            
            if (visited.has(currentIndex)) continue;
            if (pixels[currentIndex] !== targetColor) continue;
            
            pixels[currentIndex] = replacementColor;
            visited.add(currentIndex);
            
            // Check neighbors
            const x = currentIndex % gridSize;
            const y = Math.floor(currentIndex / gridSize);
            
            if (x > 0) stack.push(currentIndex - 1); // Left
            if (x < gridSize - 1) stack.push(currentIndex + 1); // Right
            if (y > 0) stack.push(currentIndex - gridSize); // Up
            if (y < gridSize - 1) stack.push(currentIndex + gridSize); // Down
        }
    }

    // Render frame thumbnails
    function renderFrames() {
        framesContainer.innerHTML = '';
        
        state.frames.forEach((frame, index) => {
            const frameEl = document.createElement('div');
            frameEl.className = `frame ${index === state.currentFrameIndex ? 'active' : ''}`;
            frameEl.dataset.index = index;
            
            // Create a small preview of the frame
            const previewSize = 10;
            const previewScale = 100 / state.gridSize;
            
            frameEl.style.backgroundImage = `linear-gradient(to right, ${frame.pixels.join(', ')})`;
            frameEl.style.backgroundSize = `${state.gridSize * previewScale}% ${state.gridSize * previewScale}%`;
            
            const frameNumber = document.createElement('div');
            frameNumber.className = 'frame-number';
            frameNumber.textContent = index + 1;
            
            frameEl.appendChild(frameNumber);
            frameEl.addEventListener('click', () => {
                state.currentFrameIndex = index;
                renderCanvas();
                renderFrames();
                updateUI();
            });
            
            framesContainer.appendChild(frameEl);
        });
        
        updateUI();
    }

    // Update frame preview
    function updateFramePreview(frameIndex) {
        const frameEl = document.querySelector(`.frame[data-index="${frameIndex}"]`);
        if (frameEl) {
            const frame = state.frames[frameIndex];
            const previewScale = 100 / state.gridSize;
            frameEl.style.backgroundImage = `linear-gradient(to right, ${frame.pixels.join(', ')})`;
            frameEl.style.backgroundSize = `${state.gridSize * previewScale}% ${state.gridSize * previewScale}%`;
        }
    }

    // Update UI elements
    function updateUI() {
        // Update tool buttons
        Object.keys(toolButtons).forEach(tool => {
            if (tool === state.currentTool) {
                toolButtons[tool].classList.add('active');
            } else {
                toolButtons[tool].classList.remove('active');
            }
        });
        
        // Update frame info
        currentFrameEl.textContent = state.currentFrameIndex + 1;
        totalFramesEl.textContent = state.frames.length;
        
        // Update delete button state
        deleteFrameBtn.disabled = state.frames.length <= 1;
        
        // Update play/pause button
        if (state.isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            animationStatus.textContent = 'Playing';
            animationStatus.style.color = '#1dd1a1';
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            animationStatus.textContent = 'Stopped';
            animationStatus.style.color = '#ff6b6b';
        }
        
        // Update grid button
        toggleGridBtn.innerHTML = `<i class="fas fa-border-all"></i> Grid: ${state.showGrid ? 'On' : 'Off'}`;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Color picker
        colorPickerInput.addEventListener('input', (e) => {
            setCurrentColor(e.target.value);
            document.querySelectorAll('.color-cell').forEach(cell => {
                cell.classList.remove('selected');
            });
        });

        // Tool selection
        Object.keys(toolButtons).forEach(tool => {
            toolButtons[tool].addEventListener('click', () => {
                state.currentTool = tool;
                updateUI();
            });
        });

        // Grid size
        gridSizeSelect.addEventListener('change', (e) => {
            state.gridSize = parseInt(e.target.value);
            
            // Resize all frames
            state.frames.forEach(frame => {
                const newPixels = [];
                const oldGridSize = Math.sqrt(frame.pixels.length);
                
                // Create new empty frame
                for (let i = 0; i < state.gridSize * state.gridSize; i++) {
                    newPixels.push('#ffffff');
                }
                
                // Copy overlapping pixels
                const copySize = Math.min(oldGridSize, state.gridSize);
                for (let y = 0; y < copySize; y++) {
                    for (let x = 0; x < copySize; x++) {
                        const oldIndex = y * oldGridSize + x;
                        const newIndex = y * state.gridSize + x;
                        newPixels[newIndex] = frame.pixels[oldIndex];
                    }
                }
                
                frame.pixels = newPixels;
            });
            
            renderCanvas();
            renderFrames();
        });

        // Pixel size
        pixelSizeSlider.addEventListener('input', (e) => {
            state.pixelSize = parseInt(e.target.value);
            pixelSizeValue.textContent = `${state.pixelSize}px`;
            renderCanvas();
        });

        // Clear canvas
        clearCanvasBtn.addEventListener('click', () => {
            state.frames[state.currentFrameIndex].pixels = state.frames[state.currentFrameIndex].pixels.map(() => '#ffffff');
            renderCanvas();
            updateFramePreview(state.currentFrameIndex);
        });

        // Toggle grid
        toggleGridBtn.addEventListener('click', () => {
            state.showGrid = !state.showGrid;
            renderCanvas();
            updateUI();
        });

        // Frame controls
        addFrameBtn.addEventListener('click', () => {
            const newFrame = createEmptyFrame();
            state.frames.splice(state.currentFrameIndex + 1, 0, newFrame);
            state.currentFrameIndex++;
            renderFrames();
            renderCanvas();
        });

        duplicateFrameBtn.addEventListener('click', () => {
            const currentFrame = state.frames[state.currentFrameIndex];
            const duplicatedFrame = {
                id: Date.now() + Math.random(),
                pixels: [...currentFrame.pixels]
            };
            
            state.frames.splice(state.currentFrameIndex + 1, 0, duplicatedFrame);
            state.currentFrameIndex++;
            renderFrames();
            renderCanvas();
        });

        deleteFrameBtn.addEventListener('click', () => {
            if (state.frames.length <= 1) return;
            
            state.frames.splice(state.currentFrameIndex, 1);
            
            if (state.currentFrameIndex >= state.frames.length) {
                state.currentFrameIndex = state.frames.length - 1;
            }
            
            renderFrames();
            renderCanvas();
        });

        // Playback controls
        prevFrameBtn.addEventListener('click', () => {
            if (state.currentFrameIndex > 0) {
                state.currentFrameIndex--;
                renderCanvas();
                renderFrames();
                updateUI();
            }
        });

        nextFrameBtn.addEventListener('click', () => {
            if (state.currentFrameIndex < state.frames.length - 1) {
                state.currentFrameIndex++;
                renderCanvas();
                renderFrames();
                updateUI();
            }
        });

        playPauseBtn.addEventListener('click', () => {
            state.isPlaying = !state.isPlaying;
            
            if (state.isPlaying) {
                startAnimation();
            } else {
                stopAnimation();
            }
            
            updateUI();
        });

        // FPS control
        fpsSlider.addEventListener('input', (e) => {
            state.fps = parseInt(e.target.value);
            fpsValue.textContent = state.fps;
            
            if (state.isPlaying) {
                stopAnimation();
                startAnimation();
            }
        });

        // Export buttons
        exportGifBtn.addEventListener('click', exportAsGif);
        exportPngBtn.addEventListener('click', exportAsPng);

        // Modal controls
        closeModalBtn.addEventListener('click', () => {
            exportModal.classList.remove('active');
        });

        closeExportBtn.addEventListener('click', () => {
            exportModal.classList.remove('active');
        });

        // Close modal when clicking outside
        exportModal.addEventListener('click', (e) => {
            if (e.target === exportModal) {
                exportModal.classList.remove('active');
            }
        });
    }

    // Animation playback
    function startAnimation() {
        const frameInterval = 1000 / state.fps;
        
        state.animationInterval = setInterval(() => {
            state.currentFrameIndex = (state.currentFrameIndex + 1) % state.frames.length;
            renderCanvas();
            renderFrames();
            updateUI();
        }, frameInterval);
    }

    function stopAnimation() {
        if (state.animationInterval) {
            clearInterval(state.animationInterval);
            state.animationInterval = null;
        }
    }

    // Export as GIF
    async function exportAsGif() {
        exportModal.classList.add('active');
        exportStatus.textContent = 'Generating GIF... This may take a moment.';
        exportResult.innerHTML = '';
        
        try {
            // Create a GIF instance
            const gif = new GIF({
                workers: 4,
                quality: 10,
                width: state.gridSize * state.pixelSize,
                height: state.gridSize * state.pixelSize,
                workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
            });
            
            // Create canvas for drawing frames
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = state.gridSize * state.pixelSize;
            tempCanvas.height = state.gridSize * state.pixelSize;
            const ctx = tempCanvas.getContext('2d');
            
            // Add each frame to the GIF
            for (let i = 0; i < state.frames.length; i++) {
                // Draw frame on temp canvas
                const frame = state.frames[i];
                
                // Clear canvas
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                
                // Draw pixels
                for (let j = 0; j < frame.pixels.length; j++) {
                    const x = (j % state.gridSize) * state.pixelSize;
                    const y = Math.floor(j / state.gridSize) * state.pixelSize;
                    
                    ctx.fillStyle = frame.pixels[j];
                    ctx.fillRect(x, y, state.pixelSize, state.pixelSize);
                    
                    // Draw grid if enabled
                    if (state.showGrid) {
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                        ctx.strokeRect(x, y, state.pixelSize, state.pixelSize);
                    }
                }
                
                // Add frame to GIF
                gif.addFrame(tempCanvas, { delay: 1000 / state.fps });
                
                // Update status
                exportStatus.textContent = `Processing frame ${i + 1} of ${state.frames.length}...`;
            }
            
            // Render the GIF
            gif.on('finished', (blob) => {
                const url = URL.createObjectURL(blob);
                exportStatus.textContent = 'GIF generated successfully!';
                exportResult.innerHTML = `
                    <div style="text-align: center;">
                        <img src="${url}" alt="Exported GIF" style="max-width: 100%; border-radius: 8px;">
                        <p style="margin-top: 15px;">
                            <a href="${url}" download="pixel-animation.gif" class="btn-success" style="display: inline-block; text-decoration: none;">
                                <i class="fas fa-download"></i> Download GIF
                            </a>
                        </p>
                    </div>
                `;
            });
            
            gif.render();
        } catch (error) {
            console.error('Error generating GIF:', error);
            exportStatus.textContent = 'Error generating GIF. Please try again.';
            exportResult.innerHTML = `<p style="color: #ff6b6b;">${error.message}</p>`;
        }
    }

    // Export as PNG
    function exportAsPng() {
        exportModal.classList.add('active');
        exportStatus.textContent = 'Preparing PNG files...';
        exportResult.innerHTML = '';
        
        try {
            // Create a canvas for drawing
            const canvas = document.createElement('canvas');
            canvas.width = state.gridSize * state.pixelSize;
            canvas.height = state.gridSize * state.pixelSize;
            const ctx = canvas.getContext('2d');
            
            let downloadLinks = '';
            
            // Create a PNG for each frame
            state.frames.forEach((frame, index) => {
                // Clear canvas
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw pixels
                for (let j = 0; j < frame.pixels.length; j++) {
                    const x = (j % state.gridSize) * state.pixelSize;
                    const y = Math.floor(j / state.gridSize) * state.pixelSize;
                    
                    ctx.fillStyle = frame.pixels[j];
                    ctx.fillRect(x, y, state.pixelSize, state.pixelSize);
                    
                    // Draw grid if enabled
                    if (state.showGrid) {
                        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                        ctx.strokeRect(x, y, state.pixelSize, state.pixelSize);
                    }
                }
                
                // Create download link
                const dataUrl = canvas.toDataURL('image/png');
                downloadLinks += `
                    <div style="margin-bottom: 15px;">
                        <p><strong>Frame ${index + 1}:</strong></p>
                        <img src="${dataUrl}" alt="Frame ${index + 1}" style="max-width: 150px; border-radius: 5px; margin: 5px 0;">
                        <br>
                        <a href="${dataUrl}" download="frame-${index + 1}.png" class="btn-secondary" style="display: inline-block; text-decoration: none; padding: 5px 10px;">
                            <i class="fas fa-download"></i> Download
                        </a>
                    </div>
                `;
            });
            
            exportStatus.textContent = `Generated ${state.frames.length} PNG files`;
            exportResult.innerHTML = `
                <div style="max-height: 300px; overflow-y: auto;">
                    ${downloadLinks}
                </div>
                <p style="margin-top: 15px;">
                    <button id="download-all" class="btn-success" style="width: auto;">
                        <i class="fas fa-file-archive"></i> Download All as ZIP (Simulated)
                    </button>
                </p>
            `;
            
            // Add event listener for download all button
            document.getElementById('download-all')?.addEventListener('click', () => {
                alert('In a real implementation, this would create and download a ZIP file with all PNGs. For now, please download each frame individually.');
            });
        } catch (error) {
            console.error('Error generating PNGs:', error);
            exportStatus.textContent = 'Error generating PNG files.';
            exportResult.innerHTML = `<p style="color: #ff6b6b;">${error.message}</p>`;
        }
    }

    // Initialize the app
    init();
});