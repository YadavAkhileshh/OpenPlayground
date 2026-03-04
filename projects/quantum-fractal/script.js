        (function() {
            // ---------- QUANTUM FRACTAL FORGE ----------
            // Infinite navigable fractals with quantum superposition
            
            const mandelCanvas = document.getElementById('mandelbrotCanvas');
            const juliaCanvas = document.getElementById('juliaCanvas');
            const quantumCanvas = document.getElementById('quantumCanvas');
            
            const ctxMandel = mandelCanvas.getContext('2d');
            const ctxJulia = juliaCanvas.getContext('2d');
            const ctxQuantum = quantumCanvas.getContext('2d');

            let width, height;
            
            // fractal parameters
            let centerX = -0.726;
            let centerY = 0.244;
            let zoom = 2.0; // 1/zoom
            let quantumSuperposition = 0.5; // blend between mandelbrot and julia
            
            let juliaX = -0.8;
            let juliaY = 0.156;
            
            const MAX_ITER = 256;
            
            // UI elements
            const realVal = document.getElementById('realVal');
            const imagVal = document.getElementById('imagVal');
            const zoomDisplay = document.getElementById('zoomDisplay');
            const quantumDisplay = document.getElementById('quantumDisplay');
            const coordDisplay = document.getElementById('coordDisplay');
            const juliaState = document.getElementById('juliaState');
            
            // sliders
            const zoomSlider = document.getElementById('zoomSlider');
            const zoomHandle = document.getElementById('zoomHandle');
            const zoomFill = document.getElementById('zoomFill');
            
            const quantumSlider = document.getElementById('quantumSlider');
            const quantumHandle = document.getElementById('quantumHandle');
            const quantumFill = document.getElementById('quantumFill');

            // navigation state
            let isDragging = false;
            let lastMouseX, lastMouseY;

            // resize handler
            function resizeCanvases() {
                width = window.innerWidth;
                height = window.innerHeight;
                mandelCanvas.width = width;
                mandelCanvas.height = height;
                juliaCanvas.width = width;
                juliaCanvas.height = height;
                quantumCanvas.width = width;
                quantumCanvas.height = height;
                
                renderFractal();
            }
            window.addEventListener('resize', resizeCanvases);
            resizeCanvases();

            // slider interactions
            function setupSliders() {
                // zoom slider (logarithmic)
                function updateZoomFromEvent(e) {
                    const rect = zoomSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    // map to zoom range: 1e-6 to 2.0 (log scale)
                    let logZoom = -6 * (1 - val); // -6 to 0
                    zoom = Math.pow(10, logZoom);
                    
                    let displayVal = zoom < 1 ? (1/zoom).toFixed(0) : zoom.toFixed(2);
                    zoomDisplay.innerText = zoom < 1 ? '1e' + Math.round(Math.log10(1/zoom)) : displayVal;
                    
                    zoomFill.style.width = (val * 100) + '%';
                    zoomHandle.style.left = (val * 100) + '%';
                    
                    renderFractal();
                }
                
                zoomHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateZoomFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                zoomSlider.addEventListener('click', (e) => {
                    updateZoomFromEvent(e);
                });
                
                // quantum slider
                function updateQuantumFromEvent(e) {
                    const rect = quantumSlider.getBoundingClientRect();
                    let x = e.clientX - rect.left;
                    x = Math.max(0, Math.min(rect.width, x));
                    let val = x / rect.width;
                    
                    quantumSuperposition = val;
                    quantumDisplay.innerText = val.toFixed(2);
                    quantumFill.style.width = (val * 100) + '%';
                    quantumHandle.style.left = (val * 100) + '%';
                    
                    juliaState.innerText = val > 0.7 ? '⚛️ JULIA: COLLAPSED' : 
                                          val > 0.3 ? '⚛️ JULIA: SUPERPOSITION' : 
                                          '⚛️ JULIA: MANDELBROOT';
                    
                    renderFractal();
                }
                
                quantumHandle.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    const onMove = (e) => updateQuantumFromEvent(e);
                    const onUp = () => {
                        document.removeEventListener('mousemove', onMove);
                        document.removeEventListener('mouseup', onUp);
                    };
                    document.addEventListener('mousemove', onMove);
                    document.addEventListener('mouseup', onUp);
                });
                
                quantumSlider.addEventListener('click', (e) => {
                    updateQuantumFromEvent(e);
                });
            }
            setupSliders();

            // mouse navigation
            mandelCanvas.addEventListener('mousedown', (e) => {
                isDragging = true;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                
                let dx = e.clientX - lastMouseX;
                let dy = e.clientY - lastMouseY;
                
                // convert to fractal coordinates
                let aspect = width / height;
                let xRange = 4.0 * zoom * aspect;
                let yRange = 4.0 * zoom;
                
                centerX -= dx * xRange / width;
                centerY -= dy * yRange / height;
                
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                
                realVal.innerText = centerX.toFixed(4);
                imagVal.innerText = centerY.toFixed(4);
                
                renderFractal();
            });

            window.addEventListener('mouseup', () => {
                isDragging = false;
            });

            // zoom with wheel
            mandelCanvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                
                let zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
                zoom *= zoomFactor;
                zoom = Math.max(1e-10, Math.min(2.0, zoom));
                
                // update slider
                let logZoom = Math.log10(zoom);
                let sliderPos = 1 - (logZoom + 6) / 6; // -6 to 0 -> 0 to 1
                zoomFill.style.width = (sliderPos * 100) + '%';
                zoomHandle.style.left = (sliderPos * 100) + '%';
                
                let displayVal = zoom < 1 ? (1/zoom).toFixed(0) : zoom.toFixed(2);
                zoomDisplay.innerText = zoom < 1 ? '1e' + Math.round(Math.log10(1/zoom)) : displayVal;
                
                renderFractal();
            });

            // compute mandelbrot
            function mandelbrot(cr, ci) {
                let zr = 0;
                let zi = 0;
                
                for (let n = 0; n < MAX_ITER; n++) {
                    let zr2 = zr * zr;
                    let zi2 = zi * zi;
                    
                    if (zr2 + zi2 > 4.0) {
                        return n;
                    }
                    
                    zi = 2 * zr * zi + ci;
                    zr = zr2 - zi2 + cr;
                }
                
                return MAX_ITER;
            }

            // compute julia
            function julia(zr, zi, cr, ci) {
                for (let n = 0; n < MAX_ITER; n++) {
                    let zr2 = zr * zr;
                    let zi2 = zi * zi;
                    
                    if (zr2 + zi2 > 4.0) {
                        return n;
                    }
                    
                    zi = 2 * zr * zi + ci;
                    zr = zr2 - zi2 + cr;
                }
                
                return MAX_ITER;
            }

            // get color based on iteration and quantum state
            function getColor(iter, maxIter, quantum) {
                if (iter >= maxIter) return '#000000';
                
                let t = iter / maxIter;
                
                // quantum color mixing
                let r, g, b;
                
                if (quantum < 0.33) {
                    // cold palette
                    r = Math.sin(t * Math.PI * 2) * 127 + 128;
                    g = Math.sin(t * Math.PI * 2 + 2) * 127 + 128;
                    b = Math.sin(t * Math.PI * 2 + 4) * 127 + 128;
                } else if (quantum < 0.66) {
                    // fire palette
                    r = 255 * Math.pow(t, 0.5);
                    g = 255 * Math.pow(t, 2);
                    b = 255 * Math.pow(t, 3);
                } else {
                    // quantum palette
                    r = 255 * Math.sin(t * Math.PI * 2) * Math.sin(quantum * 10);
                    g = 255 * Math.cos(t * Math.PI * 2) * Math.cos(quantum * 10);
                    b = 255 * Math.sin(t * Math.PI * 3) * Math.sin(quantum * 15);
                }
                
                return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
            }

            // render fractal
            function renderFractal() {
                if (!width || !height) return;
                
                let aspect = width / height;
                let xMin = centerX - 2.0 * zoom * aspect;
                let xMax = centerX + 2.0 * zoom * aspect;
                let yMin = centerY - 2.0 * zoom;
                let yMax = centerY + 2.0 * zoom;
                
                let mandelImage = ctxMandel.createImageData(width, height);
                let juliaImage = ctxJulia.createImageData(width, height);
                
                // update julia parameters based on mouse? or use center
                juliaX = centerX;
                juliaY = centerY;
                
                // render mandelbrot
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        let cr = xMin + (x / width) * (xMax - xMin);
                        let ci = yMin + (y / height) * (yMax - yMin);
                        
                        let iter = mandelbrot(cr, ci);
                        let color = getColor(iter, MAX_ITER, quantumSuperposition);
                        
                        let idx = (y * width + x) * 4;
                        let rgb = color.match(/\d+/g);
                        
                        mandelImage.data[idx] = parseInt(rgb[0]);
                        mandelImage.data[idx+1] = parseInt(rgb[1]);
                        mandelImage.data[idx+2] = parseInt(rgb[2]);
                        mandelImage.data[idx+3] = 255;
                        
                        // julia at same point but with fixed c = juliaX, juliaY
                        let jIter = julia(cr, ci, juliaX, juliaY);
                        let jColor = getColor(jIter, MAX_ITER, 1 - quantumSuperposition);
                        let jRgb = jColor.match(/\d+/g);
                        
                        juliaImage.data[idx] = parseInt(jRgb[0]);
                        juliaImage.data[idx+1] = parseInt(jRgb[1]);
                        juliaImage.data[idx+2] = parseInt(jRgb[2]);
                        juliaImage.data[idx+3] = 200; // semi-transparent
                    }
                }
                
                ctxMandel.putImageData(mandelImage, 0, 0);
                ctxJulia.putImageData(juliaImage, 0, 0);
                
                // draw quantum interference pattern
                ctxQuantum.clearRect(0, 0, width, height);
                ctxQuantum.beginPath();
                for (let i = 0; i < 20; i++) {
                    let t = time + i * 0.5;
                    let x = width/2 + Math.sin(t) * 200 * quantumSuperposition;
                    let y = height/2 + Math.cos(t) * 200 * quantumSuperposition;
                    
                    ctxQuantum.beginPath();
                    ctxQuantum.arc(x, y, 100 + 50 * Math.sin(t*2), 0, 2*Math.PI);
                    ctxQuantum.strokeStyle = `rgba(255, 100, 255, ${0.1 * quantumSuperposition})`;
                    ctxQuantum.lineWidth = 2;
                    ctxQuantum.stroke();
                }
                
                coordDisplay.innerHTML = `⚡ MANDELBROT · DEPTH ${MAX_ITER} · ZOOM ${(1/zoom).toFixed(2)}x`;
            }

            // animation for quantum effects
            let time = 0;
            function animate() {
                time += 0.02;
                
                // subtle julia parameter drift
                if (quantumSuperposition > 0.3) {
                    juliaX = centerX + Math.sin(time * 0.5) * 0.1 * quantumSuperposition;
                    juliaY = centerY + Math.cos(time * 0.3) * 0.1 * quantumSuperposition;
                    renderFractal();
                }
                
                requestAnimationFrame(animate);
            }
            animate();

            // initial render
            renderFractal();
        })();