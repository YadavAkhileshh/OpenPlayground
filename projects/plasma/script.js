        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  PLASMA VORTEX
        //  concept: turbulent flow of charged particles in a magnetic field.
        //  particles are influenced by vortex forces, field lines, and mutual
        //  attraction/repulsion. creates a living, breathing plasma sculpture
        //  with dynamic colors and motion.
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x080212);
        scene.fog = new THREE.FogExp2(0x080212, 0.003);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(24, 12, 30);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.4;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.enableZoom = true;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.target.set(0, 0, 0);

        // --- lighting (subtle, particles are self-illuminated) ---
        const ambient = new THREE.AmbientLight(0x302040);
        scene.add(ambient);

        const light1 = new THREE.PointLight(0xff6080, 1.2, 60);
        light1.position.set(12, 8, 15);
        scene.add(light1);

        const light2 = new THREE.PointLight(0x8060ff, 0.9, 60);
        light2.position.set(-12, 5, 18);
        scene.add(light2);

        // distant stars
        const starGeo = new THREE.BufferGeometry();
        const starCount = 2000;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 120 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r;
            starPos[i*3+2] = Math.cos(phi) * r;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xcc99aa, size: 0.25, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- particle system (plasma) ---
        const particleCount = 8192;
        const particles = new THREE.BufferGeometry();

        // positions, colors, velocities
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = [];

        // initialize in a toroidal/vortex distribution
        for (let i = 0; i < particleCount; i++) {
            // torus distribution with random spread
            const R = 12.0;
            const r = 3.5;
            const u = Math.random() * Math.PI * 2;
            const v = Math.random() * Math.PI * 2;
            
            const x = (R + r * Math.cos(v)) * Math.cos(u);
            const y = (R + r * Math.cos(v)) * Math.sin(u) * 0.6; // flatten
            const z = r * Math.sin(v) * 1.5;
            
            // add random perturbation
            const noise = 1.5;
            positions[i*3] = x + (Math.random() - 0.5) * noise;
            positions[i*3+1] = y + (Math.random() - 0.5) * noise;
            positions[i*3+2] = z + (Math.random() - 0.5) * noise;
            
            // color based on position
            const hue = (Math.atan2(y, x) / (Math.PI*2) + 0.5) % 1.0;
            const col = new THREE.Color().setHSL(hue, 1.0, 0.6);
            colors[i*3] = col.r;
            colors[i*3+1] = col.g;
            colors[i*3+2] = col.b;
            
            // random velocity
            velocities.push({
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1
            });
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.25,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const particleSystem = new THREE.Points(particles, particleMaterial);
        scene.add(particleSystem);

        // add some faint field lines (visual guides)
        const fieldLinesGroup = new THREE.Group();
        for (let i = 0; i < 12; i++) {
            const points = [];
            const angle = (i / 12) * Math.PI * 2;
            for (let t = 0; t <= 30; t++) {
                const tt = t / 30 * Math.PI * 2;
                const r = 10 + Math.sin(tt * 3) * 2;
                const x = Math.cos(angle + tt * 0.5) * r;
                const y = Math.sin(tt * 2) * 3;
                const z = Math.sin(angle + tt * 0.7) * r;
                points.push(new THREE.Vector3(x, y, z));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({ color: 0x885588, transparent: true, opacity: 0.12 });
            const line = new THREE.Line(geo, mat);
            fieldLinesGroup.add(line);
        }
        scene.add(fieldLinesGroup);

        // --- vortex parameters ---
        let fieldStrength = 1.0;
        let fieldDirection = 1;
        let pulseMode = false;
        
        document.getElementById('field-flip').addEventListener('click', () => {
            fieldDirection *= -1;
            document.getElementById('field-flip').innerHTML = fieldDirection > 0 ? '⟲ flip field (+)' : '⟲ flip field (-)';
        });
        
        document.getElementById('vortex-pulse').addEventListener('click', () => {
            pulseMode = true;
            setTimeout(() => pulseMode = false, 800);
        });

        // --- simulation ---
        const clock = new THREE.Clock();
        let time = 0;
        const vorticityEl = document.getElementById('vorticity-val');

        function updatePlasma(delta) {
            time += delta;
            
            // vortex center moves slowly
            const centerX = Math.sin(time * 0.2) * 2;
            const centerY = Math.cos(time * 0.3) * 1.5;
            const centerZ = Math.sin(time * 0.25) * 2;
            
            // calculate average vorticity for display
            let totalSpeed = 0;
            
            const posAttr = particleSystem.geometry.attributes.position;
            const posArray = posAttr.array;
            
            for (let i = 0; i < particleCount; i++) {
                const ix = i * 3;
                const px = posArray[ix];
                const py = posArray[ix+1];
                const pz = posArray[ix+2];
                
                // vector from vortex center
                const dx = px - centerX;
                const dy = py - centerY;
                const dz = pz - centerZ;
                
                // distance
                const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.1;
                
                // vortex force (tangential + radial)
                const strength = fieldStrength * fieldDirection * (0.5 + 0.5 * Math.sin(time * 0.5 + i * 0.01));
                
                // tangential component (vortex)
                const tx = -dy * strength / dist;
                const ty = dx * strength / dist;
                const tz = 0; // flat plane vortex
                
                // radial component (attraction/repulsion)
                const radPull = -dx * 0.01 * (pulseMode ? 3 : 1);
                const radPullY = -dy * 0.01;
                const radPullZ = -dz * 0.01;
                
                // add some vertical helicity
                const helicity = Math.sin(dx * 0.5) * 0.02;
                
                // update velocity
                velocities[i].x += (tx + radPull) * delta * 8;
                velocities[i].y += (ty + radPullY + helicity) * delta * 8;
                velocities[i].z += (tz + radPullZ) * delta * 8;
                
                // damping
                velocities[i].x *= 0.99;
                velocities[i].y *= 0.99;
                velocities[i].z *= 0.99;
                
                // update position
                posArray[ix] += velocities[i].x * delta * 15;
                posArray[ix+1] += velocities[i].y * delta * 15;
                posArray[ix+2] += velocities[i].z * delta * 15;
                
                // soft containment (spherical)
                const rad = Math.sqrt(posArray[ix]*posArray[ix] + posArray[ix+1]*posArray[ix+1] + posArray[ix+2]*posArray[ix+2]);
                if (rad > 22) {
                    posArray[ix] *= 0.98;
                    posArray[ix+1] *= 0.98;
                    posArray[ix+2] *= 0.98;
                    velocities[i].x *= -0.5;
                    velocities[i].y *= -0.5;
                    velocities[i].z *= -0.5;
                }
                
                totalSpeed += Math.abs(velocities[i].x) + Math.abs(velocities[i].y) + Math.abs(velocities[i].z);
            }
            
            posAttr.needsUpdate = true;
            
            // update vorticity display
            const avgSpeed = (totalSpeed / particleCount * 10).toFixed(2);
            vorticityEl.textContent = avgSpeed;
        }

        // animation loop
        function animate() {
            const delta = clock.getDelta();
            
            updatePlasma(delta * 0.8);
            
            // rotate field lines
            fieldLinesGroup.rotation.y += 0.0005;
            fieldLinesGroup.rotation.x += 0.0003;
            
            // rotate stars
            stars.rotation.y += 0.0002;
            
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

        // light shifts
        setInterval(() => {
            const t = performance.now() / 2000;
            light1.color.setHSL(0.98 + Math.sin(t)*0.04, 0.9, 0.6);
            light2.color.setHSL(0.72 + Math.cos(t*1.1)*0.05, 0.8, 0.6);
        }, 200);