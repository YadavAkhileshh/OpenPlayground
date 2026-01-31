        // Blob Generator Class
        class BlobGenerator {
            constructor() {
                this.blobPath = document.getElementById('blobPath');
                this.animation = this.blobPath.querySelector('animate');
                
                // Default values
                this.state = {
                    complexity: 5,      // Number of points
                    smoothness: 50,     // How smooth the curves are
                    irregularity: 30,   // How irregular the shape is
                    speed: 3,           // Animation speed (1-5)
                    motion: 50,         // Amount of animation motion
                    color1: '#A8D8B9',
                    color2: '#86C7B6',
                    isAnimating: true
                };

                this.points = [];
                this.init();
            }

            init() {
                this.setupEventListeners();
                this.generateBlob();
                this.createPreviewBlobs();
                this.startAnimation();
            }

            setupEventListeners() {
                // Shape sliders
                document.getElementById('complexitySlider').addEventListener('input', (e) => {
                    this.state.complexity = parseInt(e.target.value);
                    document.getElementById('complexityValue').textContent = this.state.complexity;
                    this.generateBlob();
                });

                document.getElementById('smoothnessSlider').addEventListener('input', (e) => {
                    this.state.smoothness = parseInt(e.target.value);
                    document.getElementById('smoothnessValue').textContent = this.state.smoothness;
                    this.generateBlob();
                });

                document.getElementById('irregularitySlider').addEventListener('input', (e) => {
                    this.state.irregularity = parseInt(e.target.value);
                    document.getElementById('irregularityValue').textContent = this.state.irregularity;
                    this.generateBlob();
                });

                // Animation sliders
                document.getElementById('speedSlider').addEventListener('input', (e) => {
                    this.state.speed = parseInt(e.target.value);
                    const speedLabels = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
                    document.getElementById('speedValue').textContent = speedLabels[this.state.speed - 1];
                    this.updateAnimation();
                });

                document.getElementById('motionSlider').addEventListener('input', (e) => {
                    this.state.motion = parseInt(e.target.value);
                    document.getElementById('motionValue').textContent = this.state.motion;
                    this.updateAnimation();
                });

                // Control buttons
                document.getElementById('playBtn').addEventListener('click', () => {
                    this.startAnimation();
                });

                document.getElementById('pauseBtn').addEventListener('click', () => {
                    this.pauseAnimation();
                });

                document.getElementById('randomBtn').addEventListener('click', () => {
                    this.generateRandomBlob();
                });

                document.getElementById('downloadBtn').addEventListener('click', () => {
                    this.downloadSVG();
                });

                // Color options
                document.querySelectorAll('.color-option').forEach(option => {
                    option.addEventListener('click', (e) => {
                        document.querySelectorAll('.color-option').forEach(opt => {
                            opt.classList.remove('selected');
                        });
                        e.currentTarget.classList.add('selected');
                        
                        this.state.color1 = e.currentTarget.dataset.color1;
                        this.state.color2 = e.currentTarget.dataset.color2;
                        this.updateColors();
                    });
                });

                // Footer links
                document.getElementById('copySvg').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.copySVG();
                });

                document.getElementById('viewCode').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.viewSVGCode();
                });

                document.getElementById('resetAll').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.resetToDefaults();
                });
            }

            generateBlob() {
                const centerX = 100;
                const centerY = 100;
                const radius = 80;
                const complexity = this.state.complexity;
                const irregularity = this.state.irregularity / 100;
                const smoothness = this.state.smoothness / 100;

                this.points = [];

                // Generate points around a circle
                for (let i = 0; i < complexity; i++) {
                    const angle = (i / complexity) * Math.PI * 2;
                    
                    // Add some irregularity to the radius
                    const irregularRadius = radius * (1 - irregularity + Math.random() * irregularity * 2);
                    
                    const x = centerX + Math.cos(angle) * irregularRadius;
                    const y = centerY + Math.sin(angle) * irregularRadius;
                    
                    this.points.push({ x, y });
                }

                // Create smooth curve through points
                let pathData = 'M ';
                
                for (let i = 0; i < this.points.length; i++) {
                    const point = this.points[i];
                    const nextPoint = this.points[(i + 1) % this.points.length];
                    
                    if (i === 0) {
                        pathData += `${point.x},${point.y} `;
                    }
                    
                    // Calculate control points for smooth curve
                    const cp1x = point.x + (nextPoint.x - point.x) * smoothness;
                    const cp1y = point.y + (nextPoint.y - point.y) * smoothness;
                    
                    const cp2x = nextPoint.x - (nextPoint.x - point.x) * smoothness;
                    const cp2y = nextPoint.y - (nextPoint.y - point.y) * smoothness;
                    
                    pathData += `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${nextPoint.x},${nextPoint.y} `;
                }
                
                pathData += 'Z';
                
                this.blobPath.setAttribute('d', pathData);
                this.updateAnimation();
            }

            generateRandomBlob() {
                // Randomize all parameters
                this.state.complexity = Math.floor(Math.random() * 7) + 3; // 3-10
                this.state.smoothness = Math.floor(Math.random() * 90) + 10; // 10-100
                this.state.irregularity = Math.floor(Math.random() * 80) + 10; // 10-90
                this.state.motion = Math.floor(Math.random() * 100); // 0-100
                this.state.speed = Math.floor(Math.random() * 5) + 1; // 1-5

                // Update sliders
                document.getElementById('complexitySlider').value = this.state.complexity;
                document.getElementById('smoothnessSlider').value = this.state.smoothness;
                document.getElementById('irregularitySlider').value = this.state.irregularity;
                document.getElementById('motionSlider').value = this.state.motion;
                document.getElementById('speedSlider').value = this.state.speed;

                // Update display values
                document.getElementById('complexityValue').textContent = this.state.complexity;
                document.getElementById('smoothnessValue').textContent = this.state.smoothness;
                document.getElementById('irregularityValue').textContent = this.state.irregularity;
                document.getElementById('motionValue').textContent = this.state.motion;
                
                const speedLabels = ['Very Slow', 'Slow', 'Normal', 'Fast', 'Very Fast'];
                document.getElementById('speedValue').textContent = speedLabels[this.state.speed - 1];

                // Random color
                const colors = [
                    ['#A8D8B9', '#86C7B6'],
                    ['#F9C0C0', '#F8A5A5'],
                    ['#B5B8E2', '#9A9FD8'],
                    ['#FFE4A7', '#FFD97D'],
                    ['#C7B8E4', '#B0A0D6'],
                    ['#A8E6CF', '#8DD7B9']
                ];
                
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                this.state.color1 = randomColor[0];
                this.state.color2 = randomColor[1];
                
                // Update color selection
                document.querySelectorAll('.color-option').forEach((option, index) => {
                    option.classList.remove('selected');
                    if (option.dataset.color1 === this.state.color1) {
                        option.classList.add('selected');
                    }
                });

                this.updateColors();
                this.generateBlob();
            }

            updateAnimation() {
                if (!this.state.isAnimating) return;

                const speedMultiplier = [0.5, 0.75, 1, 1.5, 2][this.state.speed - 1];
                const motionAmount = this.state.motion / 100;
                
                // Create two blob states for animation
                const path1 = this.blobPath.getAttribute('d');
                
                // Generate a slightly different blob for animation
                const tempState = { ...this.state };
                tempState.irregularity = this.state.irregularity + 20 * motionAmount;
                this.state = tempState;
                this.generateBlob();
                const path2 = this.blobPath.getAttribute('d');
                this.state = tempState;
                
                // Update animation
                const duration = 8000 / speedMultiplier;
                
                this.animation.setAttribute('dur', `${duration}ms`);
                this.animation.setAttribute('values', `${path1};${path2};${path1}`);
                this.animation.setAttribute('keyTimes', '0;0.5;1');
                this.animation.setAttribute('calcMode', 'spline');
                this.animation.setAttribute('keySplines', '0.42 0 0.58 1;0.42 0 0.58 1');
                
                // Restart animation
                this.animation.beginElement();
            }

            updateColors() {
                const gradient = document.querySelector('#blobGradient');
                gradient.innerHTML = `
                    <stop offset="0%" style="stop-color:${this.state.color1}; stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${this.state.color2}; stop-opacity:1" />
                `;
            }

            startAnimation() {
                this.state.isAnimating = true;
                this.updateAnimation();
                document.getElementById('blobSvg').classList.remove('paused');
                document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Playing';
                document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pause';
            }

            pauseAnimation() {
                this.state.isAnimating = false;
                this.animation.endElement();
                document.getElementById('blobSvg').classList.add('paused');
                document.getElementById('playBtn').innerHTML = '<i class="fas fa-play"></i> Play';
                document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Paused';
            }

            createPreviewBlobs() {
                const previewContainer = document.getElementById('previewBlobs');
                previewContainer.innerHTML = '';
                
                const presets = [
                    { complexity: 4, smoothness: 30, irregularity: 20, color1: '#A8D8B9', color2: '#86C7B6' },
                    { complexity: 6, smoothness: 70, irregularity: 40, color1: '#F9C0C0', color2: '#F8A5A5' },
                    { complexity: 8, smoothness: 50, irregularity: 60, color1: '#B5B8E2', color2: '#9A9FD8' },
                    { complexity: 5, smoothness: 80, irregularity: 10, color1: '#FFE4A7', color2: '#FFD97D' },
                    { complexity: 7, smoothness: 40, irregularity: 70, color1: '#C7B8E4', color2: '#B0A0D6' },
                    { complexity: 3, smoothness: 90, irregularity: 30, color1: '#A8E6CF', color2: '#8DD7B9' }
                ];
                
                presets.forEach((preset, index) => {
                    const previewDiv = document.createElement('div');
                    previewDiv.className = 'preview-blob';
                    previewDiv.innerHTML = `
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <linearGradient id="previewGradient${index}" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style="stop-color:${preset.color1}; stop-opacity:1" />
                                    <stop offset="100%" style="stop-color:${preset.color2}; stop-opacity:1" />
                                </linearGradient>
                            </defs>
                            <path fill="url(#previewGradient${index})"></path>
                        </svg>
                    `;
                    
                    // Generate blob for preview
                    const tempState = { ...this.state, ...preset };
                    const originalState = { ...this.state };
                    this.state = tempState;
                    this.generateBlob();
                    const pathData = this.blobPath.getAttribute('d');
                    this.state = originalState;
                    
                    previewDiv.querySelector('path').setAttribute('d', pathData);
                    
                    previewDiv.addEventListener('click', () => {
                        this.applyPreset(preset);
                    });
                    
                    previewContainer.appendChild(previewDiv);
                });
                
                // Regenerate main blob
                this.generateBlob();
            }

            applyPreset(preset) {
                // Update state
                this.state.complexity = preset.complexity;
                this.state.smoothness = preset.smoothness;
                this.state.irregularity = preset.irregularity;
                this.state.color1 = preset.color1;
                this.state.color2 = preset.color2;

                // Update sliders
                document.getElementById('complexitySlider').value = this.state.complexity;
                document.getElementById('smoothnessSlider').value = this.state.smoothness;
                document.getElementById('irregularitySlider').value = this.state.irregularity;

                // Update display values
                document.getElementById('complexityValue').textContent = this.state.complexity;
                document.getElementById('smoothnessValue').textContent = this.state.smoothness;
                document.getElementById('irregularityValue').textContent = this.state.irregularity;

                // Update color selection
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color1 === this.state.color1) {
                        option.classList.add('selected');
                    }
                });

                this.updateColors();
                this.generateBlob();
            }

            downloadSVG() {
                const svgElement = document.getElementById('blobSvg');
                const serializer = new XMLSerializer();
                let source = serializer.serializeToString(svgElement);
                
                // Add namespace
                if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
                    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                }
                
                source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
                
                const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = `blob-${Date.now()}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
            }

            copySVG() {
                const svgElement = document.getElementById('blobSvg');
                const serializer = new XMLSerializer();
                let source = serializer.serializeToString(svgElement);
                
                // Clean up for copying
                source = source.replace(/^\s+|\s+$/g, '');
                
                navigator.clipboard.writeText(source).then(() => {
                    const originalText = document.getElementById('copySvg').textContent;
                    document.getElementById('copySvg').textContent = 'Copied!';
                    setTimeout(() => {
                        document.getElementById('copySvg').textContent = originalText;
                    }, 2000);
                });
            }

            viewSVGCode() {
                const svgElement = document.getElementById('blobSvg');
                const serializer = new XMLSerializer();
                let source = serializer.serializeToString(svgElement);
                
                // Format the code
                source = source
                    .replace(/></g, '>\n<')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                
                alert('SVG Code:\n\n' + source);
            }

            resetToDefaults() {
                this.state = {
                    complexity: 5,
                    smoothness: 50,
                    irregularity: 30,
                    speed: 3,
                    motion: 50,
                    color1: '#A8D8B9',
                    color2: '#86C7B6',
                    isAnimating: true
                };

                // Reset sliders
                document.getElementById('complexitySlider').value = 5;
                document.getElementById('smoothnessSlider').value = 50;
                document.getElementById('irregularitySlider').value = 30;
                document.getElementById('speedSlider').value = 3;
                document.getElementById('motionSlider').value = 50;

                // Reset display values
                document.getElementById('complexityValue').textContent = '5';
                document.getElementById('smoothnessValue').textContent = '50';
                document.getElementById('irregularityValue').textContent = '30';
                document.getElementById('speedValue').textContent = 'Normal';
                document.getElementById('motionValue').textContent = '50';

                // Reset color selection
                document.querySelectorAll('.color-option').forEach(option => {
                    option.classList.remove('selected');
                    if (option.dataset.color1 === '#A8D8B9') {
                        option.classList.add('selected');
                    }
                });

                this.updateColors();
                this.generateBlob();
                this.startAnimation();
            }
        }

        // Initialize the blob generator
        const blobGenerator = new BlobGenerator();

        // Add some visual effects
        document.addEventListener('DOMContentLoaded', () => {
            // Add float animation to main blob
            const blobContainer = document.querySelector('.blob-container');
            blobContainer.classList.add('float-animation');
            
            // Add subtle hover effect to controls
            const controls = document.querySelectorAll('.control-group');
            controls.forEach(control => {
                control.addEventListener('mouseenter', () => {
                    control.style.transform = 'translateY(-2px)';
                });
                
                control.addEventListener('mouseleave', () => {
                    control.style.transform = 'translateY(0)';
                });
            });
        });
