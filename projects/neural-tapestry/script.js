        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x080614);
        scene.fog = new THREE.FogExp2(0x080614, 0.015);

        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(18, 8, 28);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.3;
        document.body.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = true;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.target.set(0, 0, 2);

        // --- lighting ---
        const ambient = new THREE.AmbientLight(0x404064);
        scene.add(ambient);

        const light1 = new THREE.PointLight(0x7a4dff, 1.2, 40);
        light1.position.set(8, 6, 10);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff5f8c, 0.9, 40);
        light2.position.set(-8, 5, 12);
        scene.add(light2);

        const backLight = new THREE.PointLight(0x3c70b0, 0.8, 50);
        backLight.position.set(0, 0, -20);
        scene.add(backLight);

        // starfield
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 2000;
        const starsPos = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount; i++) {
            const r = 70 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starsPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starsPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r;
            starsPos[i*3+2] = Math.cos(phi) * r;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xa8a0dd, size: 0.18, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);

        // ─── MAIN DATA: TAPESTRY THREADS ───
        const threadCount = 42;          // number of individual threads
        const nodesPerThread = 18;        // points per thread
        const totalNodes = threadCount * nodesPerThread;

        // containers for lines and points
        const threadLines = [];            // Line objects
        const nodePoints = [];             // Points (instanced or individual? use individual for fine control)
        
        // We'll create a group to hold everything
        const tapestryGroup = new THREE.Group();
        scene.add(tapestryGroup);

        // store dynamic data for animation: positions, velocities, etc.
        // base positions (woven pattern)
        const basePositions = new Float32Array(totalNodes * 3);
        const currentPositions = new Float32Array(totalNodes * 3);
        const velocities = new Float32Array(totalNodes * 3);
        
        // thread colors based on position
        const threadColors = [];

        // generate a woven pattern: threads interlace in a 3D lattice with curvature
        function generateWovenPositions(offset = 0) {
            const radius = 11.0;
            for (let t = 0; t < threadCount; t++) {
                const u = t / threadCount; // 0..1
                // angle around main axis varies per thread
                const baseAngle = u * Math.PI * 2 + offset;
                
                for (let n = 0; n < nodesPerThread; n++) {
                    const v = n / (nodesPerThread - 1); // 0..1
                    
                    // We create a torus-knot-like weave but simpler: 
                    // each thread goes around a twisted loop
                    const twist = v * Math.PI * 6; // multiple rotations
                    
                    // main path: combination of circle and figure-8
                    const r = 7.0 + Math.sin(v * Math.PI * 4) * 2.5;
                    
                    // x = (R + r * cos(twist)) * cos(baseAngle)
                    // y = r * sin(twist) * 1.2
                    // z = (R + r * cos(twist)) * sin(baseAngle)
                    
                    const R = 6.0;
                    const rSmall = 2.0 + Math.sin(v * Math.PI * 3) * 1.5;
                    
                    const x = (R + rSmall * Math.cos(twist + baseAngle)) * Math.cos(baseAngle * 0.8 + v*2);
                    const y = rSmall * Math.sin(twist + baseAngle*0.5) * 1.8 + Math.sin(v * Math.PI * 5) * 2.0;
                    const z = (R + rSmall * Math.cos(twist + baseAngle*1.2)) * Math.sin(baseAngle * 0.9 + v);
                    
                    const idx = (t * nodesPerThread + n) * 3;
                    basePositions[idx] = x;
                    basePositions[idx+1] = y * 1.2;
                    basePositions[idx+2] = z;
                    
                    // initialize current positions to base
                    currentPositions[idx] = x;
                    currentPositions[idx+1] = y * 1.2;
                    currentPositions[idx+2] = z;
                    
                    // small random velocity offset
                    velocities[idx] = (Math.random() - 0.5) * 0.02;
                    velocities[idx+1] = (Math.random() - 0.5) * 0.02;
                    velocities[idx+2] = (Math.random() - 0.5) * 0.02;
                }
                
                // pick a color for this thread
                const hue = (t / threadCount) * 0.8 + 0.2;
                threadColors.push(new THREE.Color().setHSL(hue, 0.9, 0.6));
            }
        }
        generateWovenPositions(0);

        // build visual elements: lines and nodes
        function buildTapestry() {
            // clear previous
            while(tapestryGroup.children.length) tapestryGroup.remove(tapestryGroup.children[0]);
            
            // create line segments for each thread
            for (let t = 0; t < threadCount; t++) {
                const points = [];
                for (let n = 0; n < nodesPerThread; n++) {
                    const idx = (t * nodesPerThread + n) * 3;
                    points.push(new THREE.Vector3(
                        currentPositions[idx],
                        currentPositions[idx+1],
                        currentPositions[idx+2]
                    ));
                }
                
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ 
                    color: threadColors[t],
                    transparent: true,
                    opacity: 0.3,
                    blending: THREE.AdditiveBlending
                });
                const line = new THREE.Line(geometry, material);
                line.userData.threadIndex = t;
                tapestryGroup.add(line);
                threadLines.push(line);
            }
            
            // create glowing node points (instanced for performance, but we want per-node color)
            // using many small spheres with emissive material
            for (let i = 0; i < totalNodes; i++) {
                const idx = i * 3;
                const t = Math.floor(i / nodesPerThread);
                const color = threadColors[t].clone().multiplyScalar(1.2);
                
                const sphereGeo = new THREE.SphereGeometry(0.14, 8, 8);
                const sphereMat = new THREE.MeshStandardMaterial({
                    color: color,
                    emissive: color.clone().multiplyScalar(0.7),
                    roughness: 0.2,
                    metalness: 0.1
                });
                const sphere = new THREE.Mesh(sphereGeo, sphereMat);
                sphere.position.set(
                    currentPositions[idx],
                    currentPositions[idx+1],
                    currentPositions[idx+2]
                );
                sphere.userData.nodeIndex = i;
                tapestryGroup.add(sphere);
                nodePoints.push(sphere);
            }
        }
        
        buildTapestry();

        // animation state
        let windEnabled = true;
        let time = 0;

        // UI
        document.getElementById('reweave').addEventListener('click', () => {
            // generate new base pattern with random offset
            generateWovenPositions(Math.random() * Math.PI * 2);
            // update line geometries and node positions
            updateVisualsFromCurrent();
        });

        document.getElementById('toggle-wind').addEventListener('click', (e) => {
            windEnabled = !windEnabled;
            e.target.innerHTML = windEnabled ? '🜁 wind on' : '🜂 wind off';
        });

        // helper: update line vertices and node positions from currentPositions array
        function updateVisualsFromCurrent() {
            // update lines
            threadLines.forEach((line, t) => {
                const points = [];
                for (let n = 0; n < nodesPerThread; n++) {
                    const idx = (t * nodesPerThread + n) * 3;
                    points.push(new THREE.Vector3(
                        currentPositions[idx],
                        currentPositions[idx+1],
                        currentPositions[idx+2]
                    ));
                }
                line.geometry.dispose();
                line.geometry = new THREE.BufferGeometry().setFromPoints(points);
            });
            
            // update node spheres
            nodePoints.forEach((sphere, i) => {
                const idx = i * 3;
                sphere.position.set(
                    currentPositions[idx],
                    currentPositions[idx+1],
                    currentPositions[idx+2]
                );
            });
        }

        // physics-like gentle flow: wind and magnetic attraction
        function animateFlow(delta) {
            if (!windEnabled) return;
            
            const dt = Math.min(delta, 0.1) * 0.8;
            time += delta;
            
            // wind vector oscillates
            const windX = Math.sin(time * 0.5) * 0.06;
            const windY = Math.cos(time * 0.7) * 0.04;
            const windZ = Math.sin(time * 0.3) * 0.05;
            
            for (let i = 0; i < totalNodes; i++) {
                const idx = i * 3;
                
                // apply wind
                velocities[idx] += windX * dt;
                velocities[idx+1] += windY * dt;
                velocities[idx+2] += windZ * dt;
                
                // slight pull toward base
                velocities[idx] += (basePositions[idx] - currentPositions[idx]) * 0.002;
                velocities[idx+1] += (basePositions[idx+1] - currentPositions[idx+1]) * 0.002;
                velocities[idx+2] += (basePositions[idx+2] - currentPositions[idx+2]) * 0.002;
                
                // damping
                velocities[idx] *= 0.99;
                velocities[idx+1] *= 0.99;
                velocities[idx+2] *= 0.99;
                
                // update position
                currentPositions[idx] += velocities[idx];
                currentPositions[idx+1] += velocities[idx+1];
                currentPositions[idx+2] += velocities[idx+2];
            }
            
            // small magnetic interaction between nearby nodes (very subtle)
            for (let iter = 0; iter < 1; iter++) {
                for (let i = 0; i < totalNodes; i+=3) { // sparse sampling for perf
                    const idx = i * 3;
                    for (let j = i+1; j < Math.min(totalNodes, i+50); j+=7) {
                        const jdx = j * 3;
                        const dx = currentPositions[jdx] - currentPositions[idx];
                        const dy = currentPositions[jdx+1] - currentPositions[idx+1];
                        const dz = currentPositions[jdx+2] - currentPositions[idx+2];
                        const distSq = dx*dx + dy*dy + dz*dz;
                        if (distSq < 4.0 && distSq > 0.01) {
                            const f = 0.0001 / distSq;
                            velocities[idx] += dx * f;
                            velocities[idx+1] += dy * f;
                            velocities[idx+2] += dz * f;
                            velocities[jdx] -= dx * f;
                            velocities[jdx+1] -= dy * f;
                            velocities[jdx+2] -= dz * f;
                        }
                    }
                }
            }
            
            updateVisualsFromCurrent();
        }

        // additional glow lines (optional) – we can add faint connections between threads? keep clean.

        // floating particles around
        const extraParticlesGeo = new THREE.BufferGeometry();
        const extraCount = 600;
        const extraPos = new Float32Array(extraCount * 3);
        for (let i = 0; i < extraCount; i++) {
            extraPos[i*3] = (Math.random() - 0.5) * 35;
            extraPos[i*3+1] = (Math.random() - 0.5) * 20;
            extraPos[i*3+2] = (Math.random() - 0.5) * 30;
        }
        extraParticlesGeo.setAttribute('position', new THREE.BufferAttribute(extraPos, 3));
        const extraMat = new THREE.PointsMaterial({ color: 0xaabbff, size: 0.1, transparent: true, blending: THREE.AdditiveBlending });
        const extraParticles = new THREE.Points(extraParticlesGeo, extraMat);
        scene.add(extraParticles);

        // animation loop
        const clock = new THREE.Clock();
        
        function animate() {
            const delta = clock.getDelta();
            
            if (windEnabled) {
                animateFlow(delta * 0.8);
            } else {
                // gentle return to base
                for (let i = 0; i < totalNodes; i++) {
                    const idx = i * 3;
                    velocities[idx] += (basePositions[idx] - currentPositions[idx]) * 0.001;
                    velocities[idx+1] += (basePositions[idx+1] - currentPositions[idx+1]) * 0.001;
                    velocities[idx+2] += (basePositions[idx+2] - currentPositions[idx+2]) * 0.001;
                    velocities[idx] *= 0.98;
                    velocities[idx+1] *= 0.98;
                    velocities[idx+2] *= 0.98;
                    currentPositions[idx] += velocities[idx];
                    currentPositions[idx+1] += velocities[idx+1];
                    currentPositions[idx+2] += velocities[idx+2];
                }
                updateVisualsFromCurrent();
            }
            
            // animate stars
            stars.rotation.y += 0.0002;
            extraParticles.rotation.y += 0.0003;
            
            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }
        
        animate();

        // resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // subtle light shift
        setInterval(() => {
            const t = performance.now() / 2000;
            light1.color.setHSL(0.68 + Math.sin(t)*0.05, 0.8, 0.6);
            light2.color.setHSL(0.92 + Math.cos(t*1.2)*0.04, 0.9, 0.6);
        }, 200);