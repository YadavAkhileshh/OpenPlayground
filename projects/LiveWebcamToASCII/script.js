// Live Webcam ASCII Art Converter

class ASCIIWebcam {
    constructor() {
        // State
        this.state = {
            isWebcamActive: false,
            currentStream: null,
            currentStyle: 'default',
            currentCharset: 'simple',
            resolution: 12,
            brightness: 1.0,
            contrast: 1.0,
            density: 2,
            snapshots: [],
            fps: 0,
            frameCount: 0,
            lastTime: 0
        };
        
        // ASCII Character Sets
        this.charsets = {
            simple: " .:-=+*#%@",
            complex: " ░▒▓█",
            extended: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
            blocks: " ▁▂▃▄▅▆▇█",
            binary: "01",
            emoji: " ▪◼⬛😀😃😄😁😆"
        };
        
        // DOM Elements
        this.elements = {};
        
        // Canvas for processing
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        
        // Initialize
        this.init();
    }
    
    init() {
        // Cache DOM elements
        this.cacheElements();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI
        this.updateUIState();
        
        // Start FPS counter
        this.startFPSCounter();
        
        // Show welcome message
        this.showToast('Ready to transform your webcam into ASCII art!', 'success');
    }
    
    cacheElements() {
        // Video and display
        this.elements.webcamVideo = document.getElementById('webcamVideo');
        this.elements.asciiDisplay = document.getElementById('asciiDisplay');
        this.elements.asciiArt = document.getElementById('asciiArt');
        this.elements.videoWrapper = document.getElementById('videoWrapper');
        this.elements.asciiContainer = document.getElementById('asciiContainer');
        this.elements.videoOverlay = document.getElementById('videoOverlay');
        this.elements.asciiOverlay = document.getElementById('asciiOverlay');
        
        // Buttons
        this.elements.startWebcamBtn = document.getElementById('startWebcamBtn');
        this.elements.stopWebcamBtn = document.getElementById('stopWebcamBtn');
        this.elements.snapshotBtn = document.getElementById('snapshotBtn');
        this.elements.fullscreenBtn = document.getElementById('fullscreenBtn');
        
        // Settings sliders
        this.elements.resolutionSlider = document.getElementById('resolutionSlider');
        this.elements.brightnessSlider = document.getElementById('brightnessSlider');
        this.elements.contrastSlider = document.getElementById('contrastSlider');
        this.elements.densitySlider = document.getElementById('densitySlider');
        
        // Value displays
        this.elements.resolutionValue = document.getElementById('resolutionValue');
        this.elements.brightnessValue = document.getElementById('brightnessValue');
        this.elements.contrastValue = document.getElementById('contrastValue');
        this.elements.densityValue = document.getElementById('densityValue');
        
        // Style toggles
        this.elements.styleOptions = document.querySelectorAll('.style-option');
        this.elements.charsetSelect = document.getElementById('charsetSelect');
        this.elements.charsetPreview = document.getElementById('charsetPreview');
        
        // Status and info
        this.elements.connectionStatus = document.getElementById('connectionStatus');
        this.elements.fpsValue = document.getElementById('fpsValue');
        this.elements.infoMessage = document.getElementById('infoMessage');
        
        // Export
        this.elements.exportTextBtn = document.getElementById('exportTextBtn');
        this.elements.exportImageBtn = document.getElementById('exportImageBtn');
        this.elements.copyTextBtn = document.getElementById('copyTextBtn');
        
        // Snapshots
        this.elements.snapshotGallery = document.getElementById('snapshotGallery');
        this.elements.clearSnapshotsBtn = document.getElementById('clearSnapshotsBtn');
        
        // Modals
        this.elements.snapshotModal = document.getElementById('snapshotModal');
        this.elements.snapshotPreview = document.getElementById('snapshotPreview');
        this.elements.closeSnapshotModal = document.getElementById('closeSnapshotModal');
        this.elements.downloadSnapshotBtn = document.getElementById('downloadSnapshotBtn');
        this.elements.shareSnapshotBtn = document.getElementById('shareSnapshotBtn');
    }
    
    setupEventListeners() {
        // Webcam controls
        this.elements.startWebcamBtn.addEventListener('click', () => this.startWebcam());
        this.elements.stopWebcamBtn.addEventListener('click', () => this.stopWebcam());
        this.elements.snapshotBtn.addEventListener('click', () => this.takeSnapshot());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        
        // Settings sliders
        this.elements.resolutionSlider.addEventListener('input', (e) => this.updateResolution(e.target.value));
        this.elements.brightnessSlider.addEventListener('input', (e) => this.updateBrightness(e.target.value));
        this.elements.contrastSlider.addEventListener('input', (e) => this.updateContrast(e.target.value));
        this.elements.densitySlider.addEventListener('input', (e) => this.updateDensity(e.target.value));
        
        // Style toggles
        this.elements.styleOptions.forEach(option => {
            option.addEventListener('click', (e) => this.setStyle(e.currentTarget.dataset.style));
        });
        
        this.elements.charsetSelect.addEventListener('change', (e) => this.setCharset(e.target.value));
        
        // Export buttons
        this.elements.exportTextBtn.addEventListener('click', () => this.exportAsText());
        this.elements.exportImageBtn.addEventListener('click', () => this.exportAsImage());
        this.elements.copyTextBtn.addEventListener('click', () => this.copyAsciiToClipboard());
        
        // Snapshot management
        this.elements.clearSnapshotsBtn.addEventListener('click', () => this.clearSnapshots());
        this.elements.closeSnapshotModal.addEventListener('click', () => this.hideSnapshotModal());
        this.elements.downloadSnapshotBtn.addEventListener('click', () => this.downloadSnapshot());
        this.elements.shareSnapshotBtn.addEventListener('click', () => this.shareSnapshot());
        
        // Close modal on outside click
        this.elements.snapshotModal.addEventListener('click', (e) => {
            if (e.target === this.elements.snapshotModal) {
                this.hideSnapshotModal();
            }
        });
        
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopWebcam();
            }
        });
    }
    
    async startWebcam() {
        try {
            this.showToast('Requesting camera access...', 'info');
            this.updateInfoMessage('Requesting camera access...');
            
            // Request webcam access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });
            
            // Set video source
            this.elements.webcamVideo.srcObject = stream;
            this.state.currentStream = stream;
            this.state.isWebcamActive = true;
            
            // Start processing frames
            this.startProcessing();
            
            // Update UI
            this.updateUIState();
            this.updateInfoMessage('Camera active. Adjust settings for different ASCII effects.');
            
            // Update connection status
            const statusIndicator = this.elements.connectionStatus.querySelector('.status-indicator');
            const statusText = this.elements.connectionStatus.querySelector('.status-text');
            statusIndicator.className = 'status-indicator online';
            statusText.textContent = 'Webcam Online';
            
            this.showToast('Webcam started successfully!', 'success');
            
        } catch (error) {
            console.error('Error accessing webcam:', error);
            this.showToast(`Failed to access webcam: ${error.message}`, 'error');
            this.updateInfoMessage('Camera access denied or unavailable');
        }
    }
    
    stopWebcam() {
        if (this.state.currentStream) {
            // Stop all tracks
            this.state.currentStream.getTracks().forEach(track => track.stop());
            this.state.currentStream = null;
        }
        
        this.state.isWebcamActive = false;
        
        // Clear video
        this.elements.webcamVideo.srcObject = null;
        
        // Stop animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Update UI
        this.updateUIState();
        this.updateInfoMessage('Camera stopped. Click "Start Webcam" to begin.');
        
        // Update connection status
        const statusIndicator = this.elements.connectionStatus.querySelector('.status-indicator');
        const statusText = this.elements.connectionStatus.querySelector('.status-text');
        statusIndicator.className = 'status-indicator offline';
        statusText.textContent = 'Webcam Offline';
        
        this.showToast('Webcam stopped', 'info');
    }
    
    startProcessing() {
        if (!this.state.isWebcamActive) return;
        
        const processFrame = () => {
            if (!this.state.isWebcamActive) return;
            
            // Calculate FPS
            this.calculateFPS();
            
            // Process video frame
            this.processVideoFrame();
            
            // Continue processing
            this.animationFrame = requestAnimationFrame(processFrame);
        };
        
        // Start processing
        this.animationFrame = requestAnimationFrame(processFrame);
    }
    
    processVideoFrame() {
        const video = this.elements.webcamVideo;
        const asciiElement = this.elements.asciiArt;
        
        if (video.readyState !== video.HAVE_ENOUGH_DATA) return;
        
        // Set canvas dimensions
        const width = Math.floor(video.videoWidth / this.state.resolution);
        const height = Math.floor(video.videoHeight / this.state.resolution);
        
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Draw video frame to canvas
        this.ctx.drawImage(video, 0, 0, width, height);
        
        // Get image data
        const imageData = this.ctx.getImageData(0, 0, width, height);
        
        // Convert to ASCII
        const ascii = this.convertToASCII(imageData);
        
        // Update display
        asciiElement.textContent = ascii;
        
        // Apply current style
        this.applyCurrentStyle();
    }
    
    convertToASCII(imageData) {
        const { data, width, height } = imageData;
        const charset = this.charsets[this.state.currentCharset];
        const charsetLength = charset.length;
        let ascii = '';
        
        // Adjust for density
        const densityMap = [2, 1, 0.5];
        const density = densityMap[this.state.density - 1];
        const step = Math.floor(1 / density);
        
        for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
                const index = (y * width + x) * 4;
                
                // Get RGB values
                let r = data[index];
                let g = data[index + 1];
                let b = data[index + 2];
                
                // Apply brightness and contrast
                r = this.applyBrightnessContrast(r);
                g = this.applyBrightnessContrast(g);
                b = this.applyBrightnessContrast(b);
                
                // Calculate brightness (grayscale)
                const brightness = (r + g + b) / 3;
                
                // Map brightness to character
                const charIndex = Math.floor((brightness / 255) * (charsetLength - 1));
                const char = charset[charIndex] || ' ';
                
                // Add color if style is "color"
                if (this.state.currentStyle === 'color') {
                    ascii += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;
                } else {
                    ascii += char;
                }
            }
            ascii += '\n';
        }
        
        return ascii;
    }
    
    applyBrightnessContrast(value) {
        // Apply brightness
        value = value * this.state.brightness;
        
        // Apply contrast
        value = (value - 128) * this.state.contrast + 128;
        
        // Clamp to 0-255
        return Math.max(0, Math.min(255, value));
    }
    
    applyCurrentStyle() {
        const asciiDisplay = this.elements.asciiDisplay;
        const asciiArt = this.elements.asciiArt;
        
        // Remove all style classes
        asciiDisplay.className = 'ascii-display';
        
        // Apply current style
        if (this.state.currentStyle === 'matrix') {
            asciiDisplay.classList.add('matrix');
            asciiArt.style.color = '#00ff41';
            asciiArt.style.textShadow = '0 0 10px rgba(0, 255, 65, 0.5)';
        } else if (this.state.currentStyle === 'inverted') {
            asciiDisplay.style.backgroundColor = 'white';
            asciiArt.style.color = 'black';
        } else if (this.state.currentStyle === 'color') {
            // Color is applied during conversion
            asciiDisplay.style.backgroundColor = 'transparent';
        } else {
            // Default style
            asciiDisplay.style.backgroundColor = 'transparent';
            asciiArt.style.color = '';
            asciiArt.style.textShadow = '';
        }
    }
    
    takeSnapshot() {
        if (!this.state.isWebcamActive) {
            this.showToast('Start webcam first to take snapshots', 'error');
            return;
        }
        
        const asciiArt = this.elements.asciiArt.textContent;
        const timestamp = new Date().toLocaleTimeString();
        
        // Create snapshot object
        const snapshot = {
            id: Date.now(),
            timestamp: timestamp,
            ascii: asciiArt,
            style: this.state.currentStyle,
            charset: this.state.currentCharset,
            resolution: this.state.resolution
        };
        
        // Add to state
        this.state.snapshots.unshift(snapshot);
        
        // Update gallery
        this.updateSnapshotGallery();
        
        // Show modal
        this.showSnapshotModal(snapshot);
        
        this.showToast('Snapshot saved!', 'success');
    }
    
    updateSnapshotGallery() {
        const gallery = this.elements.snapshotGallery;
        
        if (this.state.snapshots.length === 0) {
            gallery.innerHTML = `
                <div class="empty-snapshots">
                    <i class="fas fa-camera-retro"></i>
                    <p>No snapshots yet</p>
                    <p class="hint">Take snapshots with the camera button</p>
                </div>
            `;
            return;
        }
        
        const snapshotsHTML = this.state.snapshots.map(snapshot => `
            <div class="snapshot-item" data-id="${snapshot.id}">
                <div class="snapshot-preview">
                    <pre>${snapshot.ascii.substring(0, 500)}</pre>
                </div>
                <div class="snapshot-info">
                    ${snapshot.timestamp}
                </div>
            </div>
        `).join('');
        
        gallery.innerHTML = snapshotsHTML;
        
        // Add click listeners to snapshot items
        gallery.querySelectorAll('.snapshot-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                const snapshot = this.state.snapshots.find(s => s.id === id);
                if (snapshot) {
                    this.showSnapshotModal(snapshot);
                }
            });
        });
    }
    
    showSnapshotModal(snapshot) {
        const preview = this.elements.snapshotPreview;
        
        // Set snapshot data on modal for later use
        this.elements.snapshotModal.dataset.currentSnapshot = JSON.stringify(snapshot);
        
        // Create preview
        preview.innerHTML = `
            <pre>${snapshot.ascii}</pre>
        `;
        
        // Apply snapshot style to preview
        const pre = preview.querySelector('pre');
        if (snapshot.style === 'matrix') {
            pre.style.color = '#00ff41';
            pre.style.textShadow = '0 0 10px rgba(0, 255, 65, 0.5)';
        } else if (snapshot.style === 'inverted') {
            preview.style.backgroundColor = 'white';
            pre.style.color = 'black';
        } else {
            preview.style.backgroundColor = 'black';
            pre.style.color = 'white';
        }
        
        // Set font size based on resolution
        pre.style.fontSize = `${Math.max(4, 16 - snapshot.resolution)}px`;
        
        // Show modal
        this.elements.snapshotModal.classList.add('active');
    }
    
    hideSnapshotModal() {
        this.elements.snapshotModal.classList.remove('active');
    }
    
    downloadSnapshot() {
        try {
            const snapshot = JSON.parse(this.elements.snapshotModal.dataset.currentSnapshot);
            
            // Create text file
            const text = `ASCII Art Snapshot - ${snapshot.timestamp}\n\n${snapshot.ascii}`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `ascii-snapshot-${snapshot.timestamp.replace(/:/g, '-')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(url);
            
            this.showToast('Snapshot downloaded as text file', 'success');
        } catch (error) {
            console.error('Error downloading snapshot:', error);
            this.showToast('Failed to download snapshot', 'error');
        }
    }
    
    shareSnapshot() {
        // For demonstration - in a real app, you would use the Web Share API
        this.showToast('Sharing not implemented in this demo', 'info');
        
        // Example of Web Share API implementation:
        /*
        const snapshot = JSON.parse(this.elements.snapshotModal.dataset.currentSnapshot);
        const text = `Check out this ASCII art I made!\n\n${snapshot.ascii.substring(0, 100)}...`;
        
        if (navigator.share) {
            navigator.share({
                title: 'ASCII Art Snapshot',
                text: text,
                url: window.location.href
            });
        }
        */
    }
    
    clearSnapshots() {
        if (this.state.snapshots.length === 0) return;
        
        if (confirm('Delete all snapshots?')) {
            this.state.snapshots = [];
            this.updateSnapshotGallery();
            this.showToast('All snapshots cleared', 'info');
        }
    }
    
    exportAsText() {
        const asciiArt = this.elements.asciiArt.textContent;
        if (!asciiArt || asciiArt === 'Waiting for webcam access...') {
            this.showToast('No ASCII art to export', 'error');
            return;
        }
        
        const text = `ASCII Art Export - ${new Date().toLocaleString()}\n\n${asciiArt}`;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascii-art-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showToast('ASCII art exported as text file', 'success');
    }
    
    exportAsImage() {
        const asciiArt = this.elements.asciiArt.textContent;
        if (!asciiArt || asciiArt === 'Waiting for webcam access...') {
            this.showToast('No ASCII art to export', 'error');
            return;
        }
        
        // Create a canvas to render the ASCII art as an image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Fill background
        ctx.fillStyle = this.state.currentStyle === 'inverted' ? 'white' : 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text properties
        ctx.font = '12px "Source Code Pro", monospace';
        ctx.textBaseline = 'top';
        ctx.fillStyle = this.state.currentStyle === 'inverted' ? 'black' : 
                        this.state.currentStyle === 'matrix' ? '#00ff41' : 'white';
        
        // Draw ASCII art
        const lines = asciiArt.split('\n');
        const lineHeight = 14;
        const maxWidth = canvas.width - 40;
        let x = 20;
        let y = 20;
        
        for (let line of lines) {
            if (y + lineHeight > canvas.height) break;
            ctx.fillText(line, x, y);
            y += lineHeight;
        }
        
        // Convert to data URL and download
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `ascii-art-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        this.showToast('ASCII art exported as PNG image', 'success');
    }
    
    copyAsciiToClipboard() {
        const asciiArt = this.elements.asciiArt.textContent;
        if (!asciiArt || asciiArt === 'Waiting for webcam access...') {
            this.showToast('No ASCII art to copy', 'error');
            return;
        }
        
        navigator.clipboard.writeText(asciiArt).then(() => {
            this.showToast('ASCII art copied to clipboard', 'success');
        }).catch(err => {
            console.error('Failed to copy:', err);
            this.showToast('Failed to copy to clipboard', 'error');
        });
    }
    
    updateResolution(value) {
        this.state.resolution = parseInt(value);
        this.elements.resolutionValue.textContent = `${value}px`;
    }
    
    updateBrightness(value) {
        this.state.brightness = parseFloat(value);
        this.elements.brightnessValue.textContent = value;
    }
    
    updateContrast(value) {
        this.state.contrast = parseFloat(value);
        this.elements.contrastValue.textContent = value;
    }
    
    updateDensity(value) {
        this.state.density = parseInt(value);
        const densityNames = ['Sparse', 'Medium', 'Dense'];
        this.elements.densityValue.textContent = densityNames[value - 1];
    }
    
    setStyle(style) {
        this.state.currentStyle = style;
        
        // Update active style button
        this.elements.styleOptions.forEach(option => {
            option.classList.toggle('active', option.dataset.style === style);
        });
        
        // Apply style to current ASCII
        this.applyCurrentStyle();
    }
    
    setCharset(charset) {
        this.state.currentCharset = charset;
        this.elements.charsetPreview.textContent = `Current: ${this.charsets[charset]}`;
    }
    
    toggleFullscreen() {
        const asciiContainer = this.elements.asciiContainer;
        
        if (!document.fullscreenElement) {
            asciiContainer.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showToast('Fullscreen not supported', 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    updateUIState() {
        const isActive = this.state.isWebcamActive;
        
        // Update buttons
        this.elements.startWebcamBtn.disabled = isActive;
        this.elements.stopWebcamBtn.disabled = !isActive;
        this.elements.snapshotBtn.disabled = !isActive;
        
        // Update export buttons
        const hasAscii = this.elements.asciiArt.textContent !== 'Waiting for webcam access...';
        this.elements.exportTextBtn.disabled = !hasAscii;
        this.elements.exportImageBtn.disabled = !hasAscii;
        this.elements.copyTextBtn.disabled = !hasAscii;
        
        // Show/hide overlays
        this.elements.videoOverlay.style.display = isActive ? 'none' : 'flex';
        this.elements.asciiOverlay.style.display = isActive ? 'none' : 'flex';
    }
    
    updateInfoMessage(message) {
        this.elements.infoMessage.textContent = message;
    }
    
    calculateFPS() {
        const now = performance.now();
        
        if (this.state.lastTime) {
            const delta = now - this.state.lastTime;
            this.state.frameCount++;
            
            if (delta >= 1000) { // Update every second
                this.state.fps = Math.round((this.state.frameCount * 1000) / delta);
                this.state.frameCount = 0;
                this.state.lastTime = now;
                
                // Update display
                this.elements.fpsValue.textContent = this.state.fps;
            }
        } else {
            this.state.lastTime = now;
        }
    }
    
    startFPSCounter() {
        // Initialize FPS calculation
        this.state.lastTime = performance.now();
        this.state.frameCount = 0;
    }
    
    showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Remove toast after 5 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ASCIIWebcam();
    
    // Make app available globally for debugging
    window.asciiWebcam = app;
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const icon = fullscreenBtn.querySelector('i');
    
    if (document.fullscreenElement) {
        icon.className = 'fas fa-compress';
        fullscreenBtn.querySelector('span').textContent = 'Exit Fullscreen';
    } else {
        icon.className = 'fas fa-expand';
        fullscreenBtn.querySelector('span').textContent = 'Fullscreen';
    }
});