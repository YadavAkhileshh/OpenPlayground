       // Gesture Recognition System
        const GestureController = {
            // Gesture definitions
            gestures: [
                {
                    id: 'circle',
                    name: 'Circle',
                    description: 'Draw a circle to adjust volume',
                    icon: 'fas fa-volume-up',
                    action: 'adjustVolume',
                    color: '#00dbde',
                    pattern: 'circle'
                },
                {
                    id: 'square',
                    name: 'Square / Rectangle',
                    description: 'Draw a square to adjust brightness',
                    icon: 'fas fa-sun',
                    action: 'adjustBrightness',
                    color: '#ffcc00',
                    pattern: 'square'
                },
                {
                    id: 'arrow-up',
                    name: 'Up Arrow',
                    description: 'Draw upward arrow to increase value',
                    icon: 'fas fa-arrow-up',
                    action: 'increaseValue',
                    color: '#00ff88',
                    pattern: 'arrowUp'
                },
                {
                    id: 'arrow-down',
                    name: 'Down Arrow',
                    description: 'Draw downward arrow to decrease value',
                    icon: 'fas fa-arrow-down',
                    action: 'decreaseValue',
                    color: '#ff3366',
                    pattern: 'arrowDown'
                },
                {
                    id: 'arrow-left',
                    name: 'Left Arrow',
                    description: 'Draw left arrow to go back/previous',
                    icon: 'fas fa-arrow-left',
                    action: 'goBack',
                    color: '#ff9900',
                    pattern: 'arrowLeft'
                },
                {
                    id: 'arrow-right',
                    name: 'Right Arrow',
                    description: 'Draw right arrow to go forward/next',
                    icon: 'fas fa-arrow-right',
                    action: 'goForward',
                    color: '#3366ff',
                    pattern: 'arrowRight'
                },
                {
                    id: 'letter-z',
                    name: 'Letter Z',
                    description: 'Draw letter Z to undo last action',
                    icon: 'fas fa-undo',
                    action: 'undo',
                    color: '#cc66ff',
                    pattern: 'letterZ'
                },
                {
                    id: 'letter-p',
                    name: 'Letter P',
                    description: 'Draw letter P to play/pause media',
                    icon: 'fas fa-play',
                    action: 'playPause',
                    color: '#ff66cc',
                    pattern: 'letterP'
                },
                {
                    id: 'check',
                    name: 'Check Mark',
                    description: 'Draw check mark to confirm/select',
                    icon: 'fas fa-check',
                    action: 'confirm',
                    color: '#00ff00',
                    pattern: 'check'
                },
                {
                    id: 'x-mark',
                    name: 'X Mark',
                    description: 'Draw X to cancel/close',
                    icon: 'fas fa-times',
                    action: 'cancel',
                    color: '#ff0000',
                    pattern: 'xMark'
                }
            ],
            
            // Application state
            state: {
                isDrawing: false,
                points: [],
                currentPath: null,
                sensitivity: 5,
                showTrail: true,
                soundEnabled: true,
                recentGestures: [],
                currentGesture: null,
                volume: 75,
                brightness: 80,
                zoom: 100,
                mode: 'normal',
                colorHue: 300,
                imageIndex: 0,
                isPlaying: false
            },
            
            // DOM Elements
            elements: {
                canvas: null,
                gestureRecognition: null,
                recognizedGesture: null,
                gestureList: null,
                recentGestures: null,
                visualFeedback: null,
                sensitivitySlider: null,
                sensitivityValue: null,
                trailToggle: null,
                soundToggle: null,
                volumeValue: null,
                brightnessValue: null,
                zoomValue: null,
                modeValue: null,
                colorBox: null,
                demoImage: null,
                songTitle: null,
                playBtn: null
            },
            
            // Initialize the application
            init() {
                // Get DOM elements
                this.elements.canvas = document.getElementById('gesture-canvas');
                this.elements.gestureRecognition = document.getElementById('gesture-recognition');
                this.elements.recognizedGesture = document.getElementById('recognized-gesture');
                this.elements.gestureList = document.getElementById('gesture-list');
                this.elements.recentGestures = document.getElementById('recent-gestures');
                this.elements.visualFeedback = document.getElementById('visual-feedback');
                this.elements.sensitivitySlider = document.getElementById('sensitivity-slider');
                this.elements.sensitivityValue = document.getElementById('sensitivity-value');
                this.elements.trailToggle = document.getElementById('trail-toggle');
                this.elements.soundToggle = document.getElementById('sound-toggle');
                this.elements.volumeValue = document.getElementById('volume-value');
                this.elements.brightnessValue = document.getElementById('brightness-value');
                this.elements.zoomValue = document.getElementById('zoom-value');
                this.elements.modeValue = document.getElementById('mode-value');
                this.elements.colorBox = document.getElementById('color-box');
                this.elements.demoImage = document.getElementById('demo-image');
                this.elements.songTitle = document.getElementById('song-title');
                this.elements.playBtn = document.getElementById('play-btn');
                
                // Load saved state from localStorage
                this.loadState();
                
                // Initialize UI
                this.renderGestureList();
                this.setupEventListeners();
                this.updateUIValues();
                
                // Set initial sensitivity display
                this.updateSensitivityDisplay();
            },
            
            // Load state from localStorage
            loadState() {
                const savedState = localStorage.getItem('gestureControllerState');
                if (savedState) {
                    const parsed = JSON.parse(savedState);
                    this.state.volume = parsed.volume || 75;
                    this.state.brightness = parsed.brightness || 80;
                    this.state.zoom = parsed.zoom || 100;
                    this.state.mode = parsed.mode || 'normal';
                    this.state.sensitivity = parsed.sensitivity || 5;
                    this.state.showTrail = parsed.showTrail !== undefined ? parsed.showTrail : true;
                    this.state.soundEnabled = parsed.soundEnabled !== undefined ? parsed.soundEnabled : true;
                    this.state.recentGestures = parsed.recentGestures || [];
                }
            },
            
            // Save state to localStorage
            saveState() {
                const stateToSave = {
                    volume: this.state.volume,
                    brightness: this.state.brightness,
                    zoom: this.state.zoom,
                    mode: this.state.mode,
                    sensitivity: this.state.sensitivity,
                    showTrail: this.state.showTrail,
                    soundEnabled: this.state.soundEnabled,
                    recentGestures: this.state.recentGestures.slice(-5) // Keep only last 5
                };
                localStorage.setItem('gestureControllerState', JSON.stringify(stateToSave));
            },
            
            // Render the gesture list
            renderGestureList() {
                this.elements.gestureList.innerHTML = '';
                
                this.gestures.forEach(gesture => {
                    const gestureItem = document.createElement('div');
                    gestureItem.className = 'gesture-item';
                    gestureItem.dataset.id = gesture.id;
                    
                    gestureItem.innerHTML = `
                        <div class="gesture-icon" style="color: ${gesture.color}">
                            <i class="${gesture.icon}"></i>
                        </div>
                        <div class="gesture-info">
                            <div class="gesture-name">${gesture.name}</div>
                            <div class="gesture-desc">${gesture.description}</div>
                        </div>
                        <div class="gesture-preview" style="color: ${gesture.color}">
                            ${this.getGesturePreview(gesture.pattern)}
                        </div>
                    `;
                    
                    this.elements.gestureList.appendChild(gestureItem);
                });
            },
            
            // Get gesture preview symbol
            getGesturePreview(pattern) {
                switch(pattern) {
                    case 'circle': return '◯';
                    case 'square': return '◼';
                    case 'arrowUp': return '↑';
                    case 'arrowDown': return '↓';
                    case 'arrowLeft': return '←';
                    case 'arrowRight': return '→';
                    case 'letterZ': return 'Z';
                    case 'letterP': return 'P';
                    case 'check': return '✓';
                    case 'xMark': return '✗';
                    default: return '↷';
                }
            },
            
            // Setup event listeners
            setupEventListeners() {
                // Canvas mouse events
                this.elements.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
                this.elements.canvas.addEventListener('mousemove', this.draw.bind(this));
                this.elements.canvas.addEventListener('mouseup', this.endDrawing.bind(this));
                this.elements.canvas.addEventListener('mouseleave', this.cancelDrawing.bind(this));
                
                // Touch events for mobile
                this.elements.canvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousedown', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    this.elements.canvas.dispatchEvent(mouseEvent);
                }, { passive: false });
                
                this.elements.canvas.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const mouseEvent = new MouseEvent('mousemove', {
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    });
                    this.elements.canvas.dispatchEvent(mouseEvent);
                }, { passive: false });
                
                this.elements.canvas.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    const mouseEvent = new MouseEvent('mouseup');
                    this.elements.canvas.dispatchEvent(mouseEvent);
                });
                
                // Settings controls
                this.elements.sensitivitySlider.addEventListener('input', (e) => {
                    this.state.sensitivity = parseInt(e.target.value);
                    this.updateSensitivityDisplay();
                    this.saveState();
                });
                
                this.elements.trailToggle.addEventListener('change', (e) => {
                    this.state.showTrail = e.target.checked;
                    this.saveState();
                });
                
                this.elements.soundToggle.addEventListener('change', (e) => {
                    this.state.soundEnabled = e.target.checked;
                    this.saveState();
                });
                
                // Demo controls
                document.getElementById('prev-btn').addEventListener('click', () => this.prevImage());
                document.getElementById('next-btn').addEventListener('click', () => this.nextImage());
                document.getElementById('play-btn').addEventListener('click', () => this.togglePlayback());
                
                // Keyboard shortcuts for testing
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'c' || e.key === 'C') this.simulateGesture('circle');
                    if (e.key === 's' || e.key === 'S') this.simulateGesture('square');
                    if (e.key === 'ArrowUp') this.simulateGesture('arrow-up');
                    if (e.key === 'ArrowDown') this.simulateGesture('arrow-down');
                });
            },
            
            // Update sensitivity display
            updateSensitivityDisplay() {
                const sensitivityLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
                const index = Math.floor((this.state.sensitivity - 1) / 2);
                this.elements.sensitivityValue.textContent = sensitivityLabels[index] || 'Medium';
            },
            
            // Start drawing gesture
            startDrawing(e) {
                this.state.isDrawing = true;
                this.state.points = [];
                
                const rect = this.elements.canvas.getBoundingClientRect();
                const point = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    time: Date.now()
                };
                
                this.state.points.push(point);
                
                // Create SVG path for drawing trail
                if (this.state.showTrail) {
                    this.state.currentPath = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    this.state.currentPath.classList.add('gesture-path');
                    this.state.currentPath.setAttribute('width', '100%');
                    this.state.currentPath.setAttribute('height', '100%');
                    
                    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    path.classList.add('gesture-path-line');
                    path.setAttribute('stroke', '#00dbde');
                    this.state.currentPath.appendChild(path);
                    
                    this.elements.canvas.appendChild(this.state.currentPath);
                }
                
                // Show visual feedback at start point
                this.showVisualFeedback(point.x, point.y, '#00dbde');
            },
            
            // Draw gesture trail
            draw(e) {
                if (!this.state.isDrawing) return;
                
                const rect = this.elements.canvas.getBoundingClientRect();
                const point = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    time: Date.now()
                };
                
                // Only add point if it's far enough from previous point
                if (this.state.points.length === 0 || 
                    this.distance(point, this.state.points[this.state.points.length - 1]) > 5) {
                    this.state.points.push(point);
                }
                
                // Update drawing trail
                if (this.state.showTrail && this.state.currentPath) {
                    const path = this.state.currentPath.querySelector('path');
                    let d = 'M ' + this.state.points[0].x + ' ' + this.state.points[0].y;
                    
                    for (let i = 1; i < this.state.points.length; i++) {
                        d += ' L ' + this.state.points[i].x + ' ' + this.state.points[i].y;
                    }
                    
                    path.setAttribute('d', d);
                    
                    // Change color based on speed
                    if (this.state.points.length > 1) {
                        const lastPoint = this.state.points[this.state.points.length - 1];
                        const secondLastPoint = this.state.points[this.state.points.length - 2];
                        const distance = this.distance(lastPoint, secondLastPoint);
                        const timeDiff = lastPoint.time - secondLastPoint.time;
                        const speed = distance / (timeDiff || 1);
                        
                        // Faster drawing = brighter color
                        const intensity = Math.min(255, Math.floor(speed * 50));
                        const color = `rgb(${intensity}, 255, 255)`;
                        path.setAttribute('stroke', color);
                    }
                }
            },
            
            // End drawing and recognize gesture
            endDrawing(e) {
                if (!this.state.isDrawing) return;
                
                this.state.isDrawing = false;
                
                // Add final point
                const rect = this.elements.canvas.getBoundingClientRect();
                this.state.points.push({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                    time: Date.now()
                });
                
                // Recognize the gesture
                const gesture = this.recognizeGesture();
                
                // Process the recognized gesture
                if (gesture) {
                    this.processGesture(gesture);
                } else {
                    this.showGestureRecognition('No gesture recognized', '#ff3366');
                }
                
                // Remove drawing trail after a delay
                if (this.state.currentPath) {
                    setTimeout(() => {
                        if (this.state.currentPath && this.state.currentPath.parentNode) {
                            this.state.currentPath.parentNode.removeChild(this.state.currentPath);
                            this.state.currentPath = null;
                        }
                    }, 1000);
                }
                
                // Clear points
                this.state.points = [];
            },
            
            // Cancel drawing
            cancelDrawing() {
                this.state.isDrawing = false;
                this.state.points = [];
                
                // Remove drawing trail
                if (this.state.currentPath) {
                    setTimeout(() => {
                        if (this.state.currentPath && this.state.currentPath.parentNode) {
                            this.state.currentPath.parentNode.removeChild(this.state.currentPath);
                            this.state.currentPath = null;
                        }
                    }, 500);
                }
            },
            
            // Calculate distance between two points
            distance(p1, p2) {
                return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
            },
            
            // Recognize gesture from drawn points
            recognizeGesture() {
                if (this.state.points.length < 10) {
                    return null; // Too few points to recognize
                }
                
                // Simplify the points for analysis
                const simplified = this.simplifyPoints(this.state.points);
                
                // Calculate gesture features
                const bounds = this.getBounds(simplified);
                const width = bounds.maxX - bounds.minX;
                const height = bounds.maxY - bounds.minY;
                const aspectRatio = width / height;
                
                // Calculate circularity
                const center = {
                    x: (bounds.minX + bounds.maxX) / 2,
                    y: (bounds.minY + bounds.maxY) / 2
                };
                
                let totalDistance = 0;
                let variance = 0;
                
                simplified.forEach(point => {
                    const dist = this.distance(point, center);
                    totalDistance += dist;
                });
                
                const avgDistance = totalDistance / simplified.length;
                
                simplified.forEach(point => {
                    const dist = this.distance(point, center);
                    variance += Math.pow(dist - avgDistance, 2);
                });
                
                const circularity = variance / simplified.length;
                
                // Determine gesture based on features
                let matchedGesture = null;
                let bestScore = 0;
                
                // Check for circle (low circularity variance, aspect ratio close to 1)
                if (aspectRatio > 0.7 && aspectRatio < 1.3 && circularity < 1000 * (10 - this.state.sensitivity)) {
                    matchedGesture = this.gestures.find(g => g.id === 'circle');
                    bestScore = 0.8;
                }
                
                // Check for square/rectangle (aspect ratio could vary)
                const isClosedShape = this.distance(simplified[0], simplified[simplified.length - 1]) < 30;
                if (isClosedShape && simplified.length > 15) {
                    // Check for corners (sudden direction changes)
                    let directionChanges = 0;
                    for (let i = 2; i < simplified.length; i++) {
                        const p1 = simplified[i-2];
                        const p2 = simplified[i-1];
                        const p3 = simplified[i];
                        
                        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
                        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
                        const angleDiff = Math.abs(angle1 - angle2);
                        
                        if (angleDiff > Math.PI / 4) { // More than 45 degree change
                            directionChanges++;
                        }
                    }
                    
                    if (directionChanges >= 3 && directionChanges <= 5) {
                        const squareScore = 0.7;
                        if (squareScore > bestScore) {
                            matchedGesture = this.gestures.find(g => g.id === 'square');
                            bestScore = squareScore;
                        }
                    }
                }
                
                // Check for arrows (based on overall direction)
                const startPoint = simplified[0];
                const endPoint = simplified[simplified.length - 1];
                const dx = endPoint.x - startPoint.x;
                const dy = endPoint.y - startPoint.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                
                if (length > 50) { // Minimum arrow length
                    const angle = Math.atan2(dy, dx);
                    
                    // Check for up arrow (mostly vertical, moving upward)
                    if (dy < -length * 0.7 && Math.abs(dx) < length * 0.3) {
                        matchedGesture = this.gestures.find(g => g.id === 'arrow-up');
                        bestScore = 0.9;
                    }
                    
                    // Check for down arrow (mostly vertical, moving downward)
                    if (dy > length * 0.7 && Math.abs(dx) < length * 0.3) {
                        matchedGesture = this.gestures.find(g => g.id === 'arrow-down');
                        bestScore = 0.9;
                    }
                    
                    // Check for left arrow (mostly horizontal, moving left)
                    if (dx < -length * 0.7 && Math.abs(dy) < length * 0.3) {
                        matchedGesture = this.gestures.find(g => g.id === 'arrow-left');
                        bestScore = 0.9;
                    }
                    
                    // Check for right arrow (mostly horizontal, moving right)
                    if (dx > length * 0.7 && Math.abs(dy) < length * 0.3) {
                        matchedGesture = this.gestures.find(g => g.id === 'arrow-right');
                        bestScore = 0.9;
                    }
                }
                
                // Check for letter Z (specific shape)
                if (simplified.length > 20) {
                    // Z shape: horizontal, diagonal, horizontal
                    const segments = this.segmentPoints(simplified, 3);
                    if (segments.length === 3) {
                        const seg1Angle = this.getSegmentAngle(segments[0]);
                        const seg2Angle = this.getSegmentAngle(segments[1]);
                        const seg3Angle = this.getSegmentAngle(segments[2]);
                        
                        // First and last segments should be horizontal, middle diagonal
                        const isHorizontal1 = Math.abs(seg1Angle) < Math.PI/6 || Math.abs(seg1Angle - Math.PI) < Math.PI/6;
                        const isHorizontal3 = Math.abs(seg3Angle) < Math.PI/6 || Math.abs(seg3Angle - Math.PI) < Math.PI/6;
                        const isDiagonal2 = Math.abs(seg2Angle - Math.PI/4) < Math.PI/6 || Math.abs(seg2Angle + Math.PI*3/4) < Math.PI/6;
                        
                        if (isHorizontal1 && isDiagonal2 && isHorizontal3) {
                            matchedGesture = this.gestures.find(g => g.id === 'letter-z');
                            bestScore = 0.7;
                        }
                    }
                }
                
                return matchedGesture;
            },
            
            // Simplify points using Ramer-Douglas-Peucker algorithm
            simplifyPoints(points, epsilon = 2.0) {
                if (points.length <= 2) return points;
                
                // Find the point with the maximum distance
                let maxDistance = 0;
                let maxIndex = 0;
                
                for (let i = 1; i < points.length - 1; i++) {
                    const distance = this.perpendicularDistance(points[i], points[0], points[points.length - 1]);
                    if (distance > maxDistance) {
                        maxDistance = distance;
                        maxIndex = i;
                    }
                }
                
                // If max distance is greater than epsilon, recursively simplify
                if (maxDistance > epsilon) {
                    const left = this.simplifyPoints(points.slice(0, maxIndex + 1), epsilon);
                    const right = this.simplifyPoints(points.slice(maxIndex), epsilon);
                    
                    // Combine results
                    return left.slice(0, left.length - 1).concat(right);
                } else {
                    // Return start and end points
                    return [points[0], points[points.length - 1]];
                }
            },
            
            // Calculate perpendicular distance from point to line
            perpendicularDistance(point, lineStart, lineEnd) {
                const area = Math.abs(
                    (lineEnd.x - lineStart.x) * (lineStart.y - point.y) - 
                    (lineStart.x - point.x) * (lineEnd.y - lineStart.y)
                );
                const lineLength = Math.sqrt(
                    Math.pow(lineEnd.x - lineStart.x, 2) + 
                    Math.pow(lineEnd.y - lineStart.y, 2)
                );
                
                return area / lineLength;
            },
            
            // Get bounding box of points
            getBounds(points) {
                let minX = Infinity, minY = Infinity;
                let maxX = -Infinity, maxY = -Infinity;
                
                points.forEach(point => {
                    minX = Math.min(minX, point.x);
                    minY = Math.min(minY, point.y);
                    maxX = Math.max(maxX, point.x);
                    maxY = Math.max(maxY, point.y);
                });
                
                return { minX, minY, maxX, maxY };
            },
            
            // Segment points based on direction changes
            segmentPoints(points, numSegments) {
                const segments = [];
                const segmentSize = Math.floor(points.length / numSegments);
                
                for (let i = 0; i < numSegments; i++) {
                    const start = i * segmentSize;
                    const end = (i + 1) * segmentSize;
                    segments.push(points.slice(start, end));
                }
                
                return segments;
            },
            
            // Get average angle of a segment
            getSegmentAngle(segment) {
                if (segment.length < 2) return 0;
                
                const start = segment[0];
                const end = segment[segment.length - 1];
                
                return Math.atan2(end.y - start.y, end.x - start.x);
            },
            
            // Process recognized gesture
            processGesture(gesture) {
                this.state.currentGesture = gesture;
                
                // Show recognition feedback
                this.showGestureRecognition(gesture.name, gesture.color);
                
                // Highlight the gesture in the list
                this.highlightGesture(gesture.id);
                
                // Add to recent gestures
                this.addToRecentGestures(gesture);
                
                // Play sound if enabled
                if (this.state.soundEnabled) {
                    this.playGestureSound();
                }
                
                // Execute gesture action
                this.executeGestureAction(gesture.action);
                
                // Save state
                this.saveState();
            },
            
            // Show gesture recognition feedback
            showGestureRecognition(gestureName, color) {
                this.elements.recognizedGesture.textContent = gestureName;
                this.elements.gestureRecognition.style.display = 'block';
                this.elements.gestureRecognition.style.borderColor = color;
                this.elements.gestureRecognition.style.color = color;
                
                // Hide after delay
                setTimeout(() => {
                    this.elements.gestureRecognition.style.display = 'none';
                }, 2000);
            },
            
            // Highlight gesture in the list
            highlightGesture(gestureId) {
                // Remove highlight from all gestures
                document.querySelectorAll('.gesture-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add highlight to the matched gesture
                const gestureItem = document.querySelector(`.gesture-item[data-id="${gestureId}"]`);
                if (gestureItem) {
                    gestureItem.classList.add('active');
                    
                    // Remove highlight after delay
                    setTimeout(() => {
                        gestureItem.classList.remove('active');
                    }, 2000);
                }
            },
            
            // Add gesture to recent gestures list
            addToRecentGestures(gesture) {
                const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                this.state.recentGestures.unshift({
                    gesture: gesture.name,
                    time: timestamp,
                    color: gesture.color
                });
                
                // Keep only last 5
                if (this.state.recentGestures.length > 5) {
                    this.state.recentGestures = this.state.recentGestures.slice(0, 5);
                }
                
                // Update recent gestures display
                this.updateRecentGesturesDisplay();
            },
            
            // Update recent gestures display
            updateRecentGesturesDisplay() {
                if (this.state.recentGestures.length === 0) {
                    this.elements.recentGestures.innerHTML = '<div style="color: #a0a0ff; text-align: center; padding: 20px;">No gestures yet. Draw in the canvas to see them here.</div>';
                    return;
                }
                
                let html = '';
                this.state.recentGestures.forEach(item => {
                    html += `
                        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div style="width: 12px; height: 12px; border-radius: 50%; background: ${item.color};"></div>
                                <span>${item.gesture}</span>
                            </div>
                            <span style="color: #a0a0ff; font-size: 0.9rem;">${item.time}</span>
                        </div>
                    `;
                });
                
                this.elements.recentGestures.innerHTML = html;
            },
            
            // Play gesture sound
            playGestureSound() {
                // Create audio context for sound feedback
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.type = 'sine';
                    
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.2);
                } catch (e) {
                    console.log('Audio not supported');
                }
            },
            
            // Show visual feedback
            showVisualFeedback(x, y, color) {
                this.elements.visualFeedback.style.display = 'block';
                this.elements.visualFeedback.innerHTML = '';
                
                const circle = document.createElement('div');
                circle.className = 'feedback-circle';
                circle.style.left = x + 'px';
                circle.style.top = y + 'px';
                circle.style.borderColor = color;
                
                this.elements.visualFeedback.appendChild(circle);
                
                // Remove after animation
                setTimeout(() => {
                    this.elements.visualFeedback.style.display = 'none';
                }, 500);
            },
            
            // Execute gesture action
            executeGestureAction(action) {
                switch(action) {
                    case 'adjustVolume':
                        // Circle gesture adjusts volume
                        this.state.volume = Math.min(100, this.state.volume + 10);
                        if (this.state.volume > 100) this.state.volume = 0;
                        this.updateUIValues();
                        break;
                        
                    case 'adjustBrightness':
                        // Square gesture adjusts brightness
                        this.state.brightness = Math.min(100, this.state.brightness + 15);
                        if (this.state.brightness > 100) this.state.brightness = 20;
                        this.updateUIValues();
                        break;
                        
                    case 'increaseValue':
                        // Up arrow increases values
                        this.state.volume = Math.min(100, this.state.volume + 15);
                        this.state.brightness = Math.min(100, this.state.brightness + 15);
                        this.updateUIValues();
                        break;
                        
                    case 'decreaseValue':
                        // Down arrow decreases values
                        this.state.volume = Math.max(0, this.state.volume - 15);
                        this.state.brightness = Math.max(20, this.state.brightness - 15);
                        this.updateUIValues();
                        break;
                        
                    case 'goBack':
                        // Left arrow goes back
                        this.prevImage();
                        break;
                        
                    case 'goForward':
                        // Right arrow goes forward
                        this.nextImage();
                        break;
                        
                    case 'undo':
                        // Z gesture undoes last action
                        this.state.volume = 75;
                        this.state.brightness = 80;
                        this.updateUIValues();
                        this.showVisualFeedback(
                            this.elements.canvas.offsetWidth / 2,
                            this.elements.canvas.offsetHeight / 2,
                            '#cc66ff'
                        );
                        break;
                        
                    case 'playPause':
                        // P gesture toggles play/pause
                        this.togglePlayback();
                        break;
                        
                    case 'confirm':
                        // Check mark confirms/selects
                        this.state.mode = this.state.mode === 'normal' ? 'selected' : 'normal';
                        this.updateUIValues();
                        break;
                        
                    case 'cancel':
                        // X mark cancels
                        this.state.mode = 'normal';
                        this.updateUIValues();
                        break;
                }
                
                // Update color based on gestures
                this.updateColor();
            },
            
            // Update UI values display
            updateUIValues() {
                this.elements.volumeValue.textContent = `${this.state.volume}%`;
                this.elements.brightnessValue.textContent = `${this.state.brightness}%`;
                this.elements.zoomValue.textContent = `${this.state.zoom}%`;
                this.elements.modeValue.textContent = this.state.mode.charAt(0).toUpperCase() + this.state.mode.slice(1);
                
                // Update control highlights
                document.querySelectorAll('.ui-control').forEach(control => {
                    control.classList.remove('active');
                });
                
                // Highlight the control that was just adjusted
                if (this.state.currentGesture) {
                    if (this.state.currentGesture.action === 'adjustVolume') {
                        document.getElementById('volume-control').classList.add('active');
                    } else if (this.state.currentGesture.action === 'adjustBrightness') {
                        document.getElementById('brightness-control').classList.add('active');
                    }
                }
            },
            
            // Update color based on gestures
            updateColor() {
                // Change color based on volume and brightness
                const hue = (this.state.volume + this.state.brightness) % 360;
                this.state.colorHue = hue;
                
                const color1 = `hsl(${hue}, 100%, 60%)`;
                const color2 = `hsl(${(hue + 120) % 360}, 100%, 60%)`;
                
                this.elements.colorBox.style.background = `linear-gradient(135deg, ${color1}, ${color2})`;
            },
            
            // Navigate to previous image
            prevImage() {
                const images = [
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
                    'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
                    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e'
                ];
                
                this.state.imageIndex = (this.state.imageIndex - 1 + images.length) % images.length;
                this.elements.demoImage.src = images[this.state.imageIndex];
                
                this.showVisualFeedback(
                    this.elements.canvas.offsetWidth / 2,
                    this.elements.canvas.offsetHeight / 2,
                    '#ff9900'
                );
            },
            
            // Navigate to next image
            nextImage() {
                const images = [
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
                    'https://images.unsplash.com/photo-1519681393784-d120267933ba',
                    'https://images.unsplash.com/photo-1518837695005-2083093ee35b',
                    'https://images.unsplash.com/photo-1493246507139-91e8fad9978e'
                ];
                
                this.state.imageIndex = (this.state.imageIndex + 1) % images.length;
                this.elements.demoImage.src = images[this.state.imageIndex];
                
                this.showVisualFeedback(
                    this.elements.canvas.offsetWidth / 2,
                    this.elements.canvas.offsetHeight / 2,
                    '#3366ff'
                );
            },
            
            // Toggle media playback
            togglePlayback() {
                this.state.isPlaying = !this.state.isPlaying;
                
                if (this.state.isPlaying) {
                    this.elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    this.elements.songTitle.textContent = 'Ambient Dreams (Playing)';
                } else {
                    this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.elements.songTitle.textContent = 'Ambient Dreams (Paused)';
                }
                
                this.showVisualFeedback(
                    this.elements.canvas.offsetWidth / 2,
                    this.elements.canvas.offsetHeight / 2,
                    '#ff66cc'
                );
            },
            
            // Simulate gesture for testing
            simulateGesture(gestureId) {
                const gesture = this.gestures.find(g => g.id === gestureId);
                if (gesture) {
                    this.processGesture(gesture);
                }
            }
        };
        
        // Initialize the gesture controller when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            GestureController.init();
        });