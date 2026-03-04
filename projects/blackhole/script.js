        class BlackHoleSimulator {
            constructor() {
                this.scene = new THREE.Scene();
                this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('blackhole-canvas'), antialias: true });
                
                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                
                // Black hole parameters
                this.mass = 10; // Solar masses
                this.spin = 0;
                this.angle = 45;
                this.intensity = 1;
                this.showPhotonSphere = false;
                this.showAccretion = true;
                
                // Physical constants (scaled for visualization)
                this.rs = 2; // Schwarzschild radius in visualization units
                this.rPhoton = 1.5 * this.rs; // Photon sphere
                this.rInnermostStable = 3 * this.rs; // ISCO
                
                this.initScene();
                this.createBlackHole();
                this.createAccretionDisk();
                this.createStarfield();
                this.createPhotonSphere();
                
                this.camera.position.set(15, 5, 15);
                this.camera.lookAt(0, 0, 0);
                
                this.orbitingParticles = [];
                this.createOrbitingParticles();
                
                this.animate();
                this.setupControls();
            }

            initScene() {
                // Ambient light
                const ambientLight = new THREE.AmbientLight(0x404060);
                this.scene.add(ambientLight);
                
                // Point lights for accretion disk glow
                const light1 = new THREE.PointLight(0xff6b6b, 1, 30);
                light1.position.set(5, 0, 5);
                this.scene.add(light1);
                
                const light2 = new THREE.PointLight(0xffb8b8, 0.5, 30);
                light2.position.set(-5, 2, -5);
                this.scene.add(light2);
            }

            createBlackHole() {
                // Event horizon sphere
                const horizonGeometry = new THREE.SphereGeometry(this.rs, 64, 64);
                const horizonMaterial = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    emissive: 0x330000,
                    shininess: 30,
                    transparent: true,
                    opacity: 0.95
                });
                this.horizon = new THREE.Mesh(horizonGeometry, horizonMaterial);
                this.scene.add(this.horizon);
                
                // Inner glow (ergosphere for spinning black holes)
                const glowGeometry = new THREE.SphereGeometry(this.rs * 1.1, 64, 64);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff3300,
                    transparent: true,
                    opacity: 0.1,
                    side: THREE.BackSide
                });
                this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
                this.scene.add(this.glow);
                
                // Gravitational lensing effect (surrounding glow)
                const lensGeometry = new THREE.SphereGeometry(this.rs * 1.5, 64, 64);
                const lensMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff6666,
                    transparent: true,
                    opacity: 0.05,
                    side: THREE.BackSide,
                    wireframe: true
                });
                this.lens = new THREE.Mesh(lensGeometry, lensMaterial);
                this.scene.add(this.lens);
            }

            createAccretionDisk() {
                const diskParticles = 10000;
                const geometry = new THREE.BufferGeometry();
                const positions = new Float32Array(diskParticles * 3);
                const colors = new Float32Array(diskParticles * 3);
                
                for (let i = 0; i < diskParticles; i++) {
                    // Random position in disk
                    const radius = this.rs * (3 + Math.random() * 10);
                    const angle = Math.random() * Math.PI * 2;
                    const height = (Math.random() - 0.5) * this.rs * 0.5 * Math.sin(angle * 2);
                    
                    const x = Math.cos(angle) * radius;
                    const y = height;
                    const z = Math.sin(angle) * radius;
                    
                    positions[i * 3] = x;
                    positions[i * 3 + 1] = y;
                    positions[i * 3 + 2] = z;
                    
                    // Color based on distance and temperature
                    const temperature = 1 - (radius - this.rs * 3) / (this.rs * 10);
                    const r = 1.0;
                    const g = 0.5 + temperature * 0.5;
                    const b = 0.2 + temperature * 0.3;
                    
                    colors[i * 3] = r;
                    colors[i * 3 + 1] = g;
                    colors[i * 3 + 2] = b;
                }
                
                geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                
                const material = new THREE.PointsMaterial({
                    size: 0.1,
                    vertexColors: true,
                    transparent: true,
                    blending: THREE.AdditiveBlending
                });
                
                this.accretionDisk = new THREE.Points(geometry, material);
                this.scene.add(this.accretionDisk);
            }

            createStarfield() {
                const starsGeometry = new THREE.BufferGeometry();
                const starsCount = 5000;
                const starsPositions = new Float32Array(starsCount * 3);
                
                for (let i = 0; i < starsCount * 3; i += 3) {
                    // Distribute stars in a large sphere
                    const r = 80 + Math.random() * 40;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos(2 * Math.random() - 1);
                    
                    starsPositions[i] = Math.sin(phi) * Math.cos(theta) * r;
                    starsPositions[i + 1] = Math.sin(phi) * Math.sin(theta) * r;
                    starsPositions[i + 2] = Math.cos(phi) * r;
                }
                
                starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
                
                const starsMaterial = new THREE.PointsMaterial({
                    color: 0xffffff,
                    size: 0.1,
                    transparent: true
                });
                
                this.stars = new THREE.Points(starsGeometry, starsMaterial);
                this.scene.add(this.stars);
            }

            createPhotonSphere() {
                const sphereGeometry = new THREE.SphereGeometry(this.rPhoton, 32, 32);
                const sphereMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffaa00,
                    wireframe: true,
                    transparent: true,
                    opacity: 0.3
                });
                this.photonSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                this.photonSphere.visible = this.showPhotonSphere;
                this.scene.add(this.photonSphere);
            }

            createOrbitingParticles() {
                // Create particles that orbit near the black hole to show lensing
                const particleCount = 50;
                
                for (let i = 0; i < particleCount; i++) {
                    const radius = this.rs * (2.5 + Math.random() * 3);
                    const angle = (i / particleCount) * Math.PI * 2;
                    const speed = 0.01 / Math.sqrt(radius / this.rs);
                    
                    const geometry = new THREE.SphereGeometry(0.05, 8, 8);
                    const material = new THREE.MeshBasicMaterial({ color: 0xffaa66 });
                    const particle = new THREE.Mesh(geometry, material);
                    
                    this.orbitingParticles.push({
                        mesh: particle,
                        radius: radius,
                        angle: angle,
                        speed: speed
                    });
                    
                    this.scene.add(particle);
                }
            }

            updateBlackHoleParameters() {
                // Update Schwarzschild radius based on mass
                const newRs = this.mass / 5; // Scaled for visualization
                
                // Scale horizon
                this.horizon.scale.set(newRs / this.rs, newRs / this.rs, newRs / this.rs);
                this.glow.scale.set(newRs / this.rs * 1.1, newRs / this.rs * 1.1, newRs / this.rs * 1.1);
                this.lens.scale.set(newRs / this.rs * 1.5, newRs / this.rs * 1.5, newRs / this.rs * 1.5);
                
                // Update photon sphere
                this.rPhoton = 1.5 * newRs;
                this.photonSphere.scale.set(newRs / this.rs * 1.5, newRs / this.rs * 1.5, newRs / this.rs * 1.5);
                
                // Update colors based on spin
                if (this.spin > 0) {
                    this.horizon.material.emissive.setHSL(0.05 + this.spin * 0.1, 1, 0.2);
                    this.glow.material.color.setHSL(0.05 + this.spin * 0.1, 1, 0.5);
                }
                
                this.rs = newRs;
                
                // Update info display
                document.getElementById('mass-display').textContent = this.mass + ' M☉';
                document.getElementById('radius-display').textContent = 
                    Math.round(this.rs * 15) + ' km';
                document.getElementById('time-dilation').textContent = 
                    this.rs > 0 ? '∞' : '1.0';
            }

            updateParticles() {
                this.orbitingParticles.forEach(p => {
                    p.angle += p.speed * (this.rs / 2);
                    
                    // Apply gravitational lensing effect
                    const r = p.radius;
                    const distortion = 1 + (this.rs / r) ** 2; // Simplified lensing
                    
                    const x = Math.cos(p.angle) * r;
                    const z = Math.sin(p.angle) * r;
                    
                    // Bend light paths near event horizon
                    if (r < this.rs * 3) {
                        p.mesh.position.x = x * distortion;
                        p.mesh.position.z = z * distortion;
                        p.mesh.position.y = Math.sin(p.angle * 2) * this.rs * 0.5;
                        
                        // Redshift effect
                        const redshift = 1 - (this.rs / r) * 0.5;
                        p.mesh.material.color.setHSL(0.05, 1, 0.5 * redshift);
                    } else {
                        p.mesh.position.x = x;
                        p.mesh.position.z = z;
                        p.mesh.position.y = Math.sin(p.angle) * this.rs * 0.2;
                        p.mesh.material.color.setHSL(0.1, 1, 0.6);
                    }
                });
            }

            updateAccretionDisk() {
                if (this.accretionDisk) {
                    // Rotate disk
                    this.accretionDisk.rotation.y += 0.001;
                    
                    // Update colors based on spin
                    if (this.spin > 0) {
                        const positions = this.accretionDisk.geometry.attributes.position.array;
                        const colors = this.accretionDisk.geometry.attributes.color.array;
                        
                        for (let i = 0; i < positions.length; i += 3) {
                            const x = positions[i];
                            const z = positions[i + 2];
                            const r = Math.sqrt(x * x + z * z);
                            
                            // Relativistic beaming effect for spinning black hole
                            const angle = Math.atan2(z, x);
                            const beaming = 1 + this.spin * 0.5 * Math.sin(angle - performance.now() * 0.001);
                            
                            colors[i] = 1.0 * beaming;
                            colors[i + 1] = 0.5 * beaming;
                            colors[i + 2] = 0.2 * beaming;
                        }
                        
                        this.accretionDisk.geometry.attributes.color.needsUpdate = true;
                    }
                }
            }

            updateGravitationalLensing() {
                // Warp the stars near the black hole
                if (this.stars) {
                    // Simple gravitational lensing effect
                    this.stars.children.forEach(star => {
                        // In a real implementation, we'd ray-trace through the curved spacetime
                        // This is a simplified visual effect
                    });
                }
            }

            animate() {
                requestAnimationFrame(() => this.animate());
                
                this.updateBlackHoleParameters();
                this.updateParticles();
                this.updateAccretionDisk();
                
                // Rotate camera based on angle
                const rad = this.angle * Math.PI / 180;
                const distance = 20;
                this.camera.position.x = Math.sin(rad) * distance;
                this.camera.position.y = Math.cos(rad) * distance * 0.5;
                this.camera.position.z = Math.cos(rad) * distance;
                this.camera.lookAt(0, 0, 0);
                
                // Rotate stars for parallax effect
                if (this.stars) {
                    this.stars.rotation.y += 0.0001;
                }
                
                this.renderer.render(this.scene, this.camera);
                
                // Update status
                const distToHorizon = this.camera.position.length() / this.rs;
                document.getElementById('status').innerHTML = 
                    `🚀 Observer at ${distToHorizon.toFixed(1)} Rs`;
            }

            setupControls() {
                document.getElementById('mass').addEventListener('input', (e) => {
                    this.mass = parseInt(e.target.value);
                    document.getElementById('mass-val').textContent = this.mass;
                });
                
                document.getElementById('spin').addEventListener('input', (e) => {
                    this.spin = parseFloat(e.target.value);
                    document.getElementById('spin-val').textContent = this.spin.toFixed(2);
                });
                
                document.getElementById('angle').addEventListener('input', (e) => {
                    this.angle = parseInt(e.target.value);
                    document.getElementById('angle-val').textContent = this.angle + '°';
                });
                
                document.getElementById('intensity').addEventListener('input', (e) => {
                    this.intensity = parseFloat(e.target.value);
                    document.getElementById('intensity-val').textContent = this.intensity.toFixed(1);
                    
                    // Adjust light intensity
                    this.scene.children.forEach(child => {
                        if (child instanceof THREE.PointLight) {
                            child.intensity = this.intensity;
                        }
                    });
                });
            }

            togglePhotonSphere() {
                this.showPhotonSphere = !this.showPhotonSphere;
                this.photonSphere.visible = this.showPhotonSphere;
                document.getElementById('photon-btn').textContent = 
                    this.showPhotonSphere ? '🔴 Hide Photon Sphere' : '✨ Show Photon Sphere';
            }

            toggleAccretionDisk() {
                this.showAccretion = !this.showAccretion;
                this.accretionDisk.visible = this.showAccretion;
                document.getElementById('accretion-btn').textContent = 
                    this.showAccretion ? '💫 Hide Disk' : '💫 Show Disk';
            }

            resetView() {
                this.angle = 45;
                document.getElementById('angle').value = '45';
                document.getElementById('angle-val').textContent = '45°';
            }

            captureImage() {
                // Save current view as image
                const dataURL = this.renderer.domElement.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `blackhole-${new Date().getTime()}.png`;
                link.href = dataURL;
                link.click();
            }
        }

        // Initialize simulator
        const simulator = new BlackHoleSimulator();

        // Global control functions
        function togglePhotonOrbit() {
            simulator.togglePhotonSphere();
        }

        function toggleAccretion() {
            simulator.toggleAccretionDisk();
        }

        function resetView() {
            simulator.resetView();
        }

        function captureImage() {
            simulator.captureImage();
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            simulator.camera.aspect = window.innerWidth / window.innerHeight;
            simulator.camera.updateProjectionMatrix();
            simulator.renderer.setSize(window.innerWidth, window.innerHeight);
        });