        // DOM Elements
        const canvas = document.getElementById('staircaseCanvas');
        const ctx = canvas.getContext('2d');
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const sizeSlider = document.getElementById('sizeSlider');
        const sizeValue = document.getElementById('sizeValue');
        const stairsSlider = document.getElementById('stairsSlider');
        const stairsValue = document.getElementById('stairsValue');
        const depthToggle = document.getElementById('depthToggle');
        const shadowsToggle = document.getElementById('shadowsToggle');
        const texturesToggle = document.getElementById('texturesToggle');
        const autoRotateBtn = document.getElementById('autoRotateBtn');
        const resetViewBtn = document.getElementById('resetViewBtn');
        const perspectiveBtns = document.querySelectorAll('.perspective-btn');
        const overlayText = document.getElementById('overlayText');

        // Canvas setup
        let canvasWidth, canvasHeight;
        let centerX, centerY;

        // Animation variables
        let animationSpeed = 0.5;
        let rotationAngle = 0;
        let autoRotate = true;
        let mouseDown = false;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let cameraAngleX = 30;
        let cameraAngleY = 45;
        let cameraDistance = 400;

        // Staircase parameters
        let staircaseSize = 1.0;
        let numStairs = 16;
        let showDepth = true;
        let showShadows = true;
        let showTextures = true;
        let currentView = 'top';

        // Initialize canvas size
        function initCanvas() {
            const container = canvas.parentElement;
            canvasWidth = container.clientWidth;
            canvasHeight = container.clientHeight;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
            
            centerX = canvasWidth / 2;
            centerY = canvasHeight / 2;
        }

        // Draw the infinite staircase
        function drawStaircase() {
            // Clear canvas with gradient background
            const gradient = ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, Math.max(canvasWidth, canvasHeight) / 2
            );
            gradient.addColorStop(0, '#0a0a1a');
            gradient.addColorStop(1, '#1a1a2e');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            
            // Set up transformation for 3D effect
            ctx.save();
            ctx.translate(centerX, centerY);
            
            // Apply rotation based on mouse or auto-rotate
            if (autoRotate) {
                rotationAngle += animationSpeed * 0.01;
            }
            
            // Rotate based on camera angles
            ctx.rotateX = function(angle) {
                // Simulate 3D rotation using 2D transforms
                // In a real 3D context, we would use WebGL
                // For 2D canvas, we simulate with perspective projection
            };
            
            // Draw the staircase
            drawStairs();
            
            ctx.restore();
        }

        // Draw the individual stairs
        function drawStairs() {
            const stairHeight = 20 * staircaseSize;
            const stairDepth = 40 * staircaseSize;
            const stairWidth = 80 * staircaseSize;
            const radius = 150 * staircaseSize;
            
            // Calculate perspective projection
            const perspective = 400;
            
            for (let i = 0; i < numStairs; i++) {
                // Calculate position in circular pattern
                const angle = (i / numStairs) * Math.PI * 2 + rotationAngle;
                const nextAngle = ((i + 1) / numStairs) * Math.PI * 2 + rotationAngle;
                
                // Calculate 3D positions
                const x1 = Math.cos(angle) * radius;
                const y1 = Math.sin(angle) * radius;
                const z1 = i * stairHeight;
                
                const x2 = Math.cos(nextAngle) * radius;
                const y2 = Math.sin(nextAngle) * radius;
                const z2 = (i + 1) * stairHeight;
                
                // Apply camera rotation
                const camX1 = rotateX(x1, z1, cameraAngleX);
                const camZ1 = rotateZ(x1, z1, cameraAngleX);
                const camX2 = rotateX(x2, z2, cameraAngleX);
                const camZ2 = rotateZ(x2, z2, cameraAngleX);
                
                // Apply perspective projection
                const scale1 = perspective / (perspective + camZ1 + cameraDistance);
                const scale2 = perspective / (perspective + camZ2 + cameraDistance);
                
                const projX1 = camX1 * scale1;
                const projY1 = y1 * scale1 - i * stairHeight * 0.3;
                const projX2 = camX2 * scale2;
                const projY2 = y2 * scale2 - (i + 1) * stairHeight * 0.3;
                
                // Draw stair top (platform)
                ctx.fillStyle = showTextures ? getStairColor(i, 'top') : '#8a6d3b';
                ctx.beginPath();
                ctx.moveTo(projX1, projY1);
                ctx.lineTo(projX2, projY2);
                ctx.lineTo(projX2, projY2 + stairDepth * scale2);
                ctx.lineTo(projX1, projY1 + stairDepth * scale1);
                ctx.closePath();
                ctx.fill();
                
                // Draw stair front (riser)
                if (showDepth) {
                    ctx.fillStyle = showTextures ? getStairColor(i, 'front') : '#6d4c41';
                    ctx.beginPath();
                    ctx.moveTo(projX1, projY1 + stairDepth * scale1);
                    ctx.lineTo(projX2, projY2 + stairDepth * scale2);
                    ctx.lineTo(projX2, projY2 + stairDepth * scale2 + stairHeight * scale2);
                    ctx.lineTo(projX1, projY1 + stairDepth * scale1 + stairHeight * scale1);
                    ctx.closePath();
                    ctx.fill();
                }
                
                // Draw stair side
                if (showDepth) {
                    ctx.fillStyle = showTextures ? getStairColor(i, 'side') : '#5d4037';
                    ctx.beginPath();
                    ctx.moveTo(projX2, projY2);
                    ctx.lineTo(projX2, projY2 + stairDepth * scale2);
                    ctx.lineTo(projX2, projY2 + stairDepth * scale2 + stairHeight * scale2);
                    ctx.lineTo(projX2, projY2 + stairHeight * scale2);
                    ctx.closePath();
                    ctx.fill();
                }
                
                // Draw shadows
                if (showShadows) {
                    drawStairShadow(projX1, projY1, projX2, projY2, stairDepth, scale1, scale2, i);
                }
            }
            
            // Draw connecting lines to complete the loop
            ctx.strokeStyle = 'rgba(255, 154, 0, 0.3)';
            ctx.lineWidth = 2;
            
            for (let i = 0; i < numStairs; i += 2) {
                const angle = (i / numStairs) * Math.PI * 2 + rotationAngle;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const z = i * stairHeight;
                
                const camX = rotateX(x, z, cameraAngleX);
                const camZ = rotateZ(x, z, cameraAngleX);
                const scale = perspective / (perspective + camZ + cameraDistance);
                
                const projX = camX * scale;
                const projY = y * scale - i * stairHeight * 0.3;
                
                if (i > 0) {
                    const prevAngle = ((i-2) / numStairs) * Math.PI * 2 + rotationAngle;
                    const prevX = Math.cos(prevAngle) * radius;
                    const prevY = Math.sin(prevAngle) * radius;
                    const prevZ = (i-2) * stairHeight;
                    
                    const prevCamX = rotateX(prevX, prevZ, cameraAngleX);
                    const prevCamZ = rotateZ(prevX, prevZ, cameraAngleX);
                    const prevScale = perspective / (perspective + prevCamZ + cameraDistance);
                    
                    const prevProjX = prevCamX * prevScale;
                    const prevProjY = prevY * prevScale - (i-2) * stairHeight * 0.3;
                    
                    ctx.beginPath();
                    ctx.moveTo(prevProjX, prevProjY);
                    ctx.lineTo(projX, projY);
                    ctx.stroke();
                }
            }
        }

        // Helper function for 3D rotation around X axis
        function rotateX(x, z, angle) {
            const rad = angle * Math.PI / 180;
            return x * Math.cos(rad) - z * Math.sin(rad);
        }

        // Helper function for 3D rotation around Z axis
        function rotateZ(x, z, angle) {
            const rad = angle * Math.PI / 180;
            return x * Math.sin(rad) + z * Math.cos(rad);
        }

        // Get color for stair based on position and face
        function getStairColor(stairIndex, face) {
            const colors = {
                top: ['#c19a6b', '#b68d5c', '#ab804d', '#a0733e'],
                front: ['#8d6e63', '#7d5e53', '#6d4e43', '#5d3e33'],
                side: ['#795548', '#694538', '#593528', '#492518']
            };
            
            const colorSet = colors[face] || colors.top;
            return colorSet[stairIndex % colorSet.length];
        }

        // Draw shadow for a stair
        function drawStairShadow(x1, y1, x2, y2, depth, scale1, scale2, index) {
            const shadowAlpha = 0.2 - (index / numStairs) * 0.15;
            
            // Shadow under stair
            ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1 + depth * scale1);
            ctx.lineTo(x2, y2 + depth * scale2);
            ctx.lineTo(x2, y2 + depth * scale2 + 10 * scale2);
            ctx.lineTo(x1, y1 + depth * scale1 + 10 * scale1);
            ctx.closePath();
            ctx.fill();
            
            // Shadow on side
            ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha * 0.7})`;
            ctx.beginPath();
            ctx.moveTo(x2, y2);
            ctx.lineTo(x2, y2 + depth * scale2);
            ctx.lineTo(x2 + 10 * scale2, y2 + depth * scale2);
            ctx.lineTo(x2 + 10 * scale2, y2);
            ctx.closePath();
            ctx.fill();
        }

        // Animation loop
        function animate() {
            drawStaircase();
            requestAnimationFrame(animate);
        }

        // Update slider values display
        function updateSliderValues() {
            speedValue.textContent = speedSlider.value;
            sizeValue.textContent = sizeSlider.value;
            stairsValue.textContent = stairsSlider.value;
            
            animationSpeed = parseInt(speedSlider.value) / 10;
            staircaseSize = parseInt(sizeSlider.value) / 50;
            numStairs = parseInt(stairsSlider.value);
        }

        // Set camera view based on selected perspective
        function setCameraView(view) {
            currentView = view;
            
            switch(view) {
                case 'top':
                    cameraAngleX = 30;
                    cameraAngleY = 45;
                    cameraDistance = 400;
                    break;
                case 'side':
                    cameraAngleX = 10;
                    cameraAngleY = 90;
                    cameraDistance = 500;
                    break;
                case 'corner':
                    cameraAngleX = 45;
                    cameraAngleY = 45;
                    cameraDistance = 350;
                    break;
                case 'first-person':
                    cameraAngleX = 15;
                    cameraAngleY = 0;
                    cameraDistance = 200;
                    break;
            }
            
            // Update active button
            perspectiveBtns.forEach(btn => {
                if (btn.dataset.view === view) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }

        // Show temporary overlay message
        function showOverlayMessage(message, duration = 3000) {
            overlayText.textContent = message;
            overlayText.classList.add('show');
            
            setTimeout(() => {
                overlayText.classList.remove('show');
            }, duration);
        }

        // Event Listeners
        speedSlider.addEventListener('input', updateSliderValues);
        sizeSlider.addEventListener('input', updateSliderValues);
        stairsSlider.addEventListener('input', updateSliderValues);

        depthToggle.addEventListener('change', () => {
            showDepth = depthToggle.checked;
        });

        shadowsToggle.addEventListener('change', () => {
            showShadows = shadowsToggle.checked;
        });

        texturesToggle.addEventListener('change', () => {
            showTextures = texturesToggle.checked;
        });

        autoRotateBtn.addEventListener('click', () => {
            autoRotate = !autoRotate;
            autoRotateBtn.innerHTML = autoRotate ? 
                '<i class="fas fa-pause"></i> Pause Rotation' : 
                '<i class="fas fa-sync-alt"></i> Auto-Rotate';
            
            showOverlayMessage(autoRotate ? 'Auto-rotation enabled' : 'Auto-rotation paused');
        });

        resetViewBtn.addEventListener('click', () => {
            cameraAngleX = 30;
            cameraAngleY = 45;
            cameraDistance = 400;
            rotationAngle = 0;
            setCameraView('top');
            showOverlayMessage('View reset to default');
        });

        perspectiveBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setCameraView(btn.dataset.view);
                showOverlayMessage(`Switched to ${btn.dataset.view} view`);
            });
        });

        // Mouse interaction for manual rotation
        canvas.addEventListener('mousedown', (e) => {
            mouseDown = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            canvas.style.cursor = 'grabbing';
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!mouseDown) return;
            
            const deltaX = e.clientX - lastMouseX;
            const deltaY = e.clientY - lastMouseY;
            
            // Rotate based on mouse movement
            cameraAngleY += deltaX * 0.5;
            cameraAngleX = Math.max(10, Math.min(80, cameraAngleX - deltaY * 0.3));
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            
            // Disable auto-rotate while manually rotating
            autoRotate = false;
            autoRotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-Rotate';
        });

        canvas.addEventListener('mouseup', () => {
            mouseDown = false;
            canvas.style.cursor = 'grab';
        });

        canvas.addEventListener('mouseleave', () => {
            mouseDown = false;
            canvas.style.cursor = 'default';
        });

        canvas.addEventListener('mouseenter', () => {
            canvas.style.cursor = 'grab';
        });

        // Touch support for mobile devices
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mouseDown = true;
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!mouseDown) return;
            
            const deltaX = e.touches[0].clientX - lastMouseX;
            const deltaY = e.touches[0].clientY - lastMouseY;
            
            cameraAngleY += deltaX * 0.5;
            cameraAngleX = Math.max(10, Math.min(80, cameraAngleX - deltaY * 0.3));
            
            lastMouseX = e.touches[0].clientX;
            lastMouseY = e.touches[0].clientY;
            
            autoRotate = false;
            autoRotateBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Auto-Rotate';
        });

        canvas.addEventListener('touchend', () => {
            mouseDown = false;
        });

        // Initialize and start animation
        window.addEventListener('load', () => {
            initCanvas();
            updateSliderValues();
            setCameraView('top');
            animate();
            
            // Show initial instruction
            setTimeout(() => {
                showOverlayMessage('Click and drag to rotate the staircase', 5000);
            }, 1000);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            initCanvas();
        });
