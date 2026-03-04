        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  QUANTUM ORCHID – recursive fractal blossom
        //  concept: nested pentagonal symmetry + golden ratio harmonics
        //  each "orchid" is a L-system-like recursive structure with
        //  petal matrices transformed by φ and complex rotation.
        //  no basic shapes – every petal is a custom double-curved surface.
        //  with audio-reactive pulse option (uses oscillator if no mic).
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup scene with dark mystical background ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0715);
        
        // subtle fog for depth
        scene.fog = new THREE.FogExp2(0x0a0715, 0.012);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(18, 10, 28);
        camera.lookAt(0, 2, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = false; // elegance without shadows
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.2;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        // controls – allow orbiting, autoRotate for meditative feel
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.8;
        controls.enableZoom = true;
        controls.enablePan = false;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.target.set(0, 2, 0);

        // --- lighting: volumetric, colored, mystical ---
        const ambient = new THREE.AmbientLight(0x40406b);
        scene.add(ambient);

        const keyLight1 = new THREE.PointLight(0x9f6eff, 1.2, 40);
        keyLight1.position.set(5, 10, 10);
        scene.add(keyLight1);

        const keyLight2 = new THREE.PointLight(0xff7b9c, 0.9, 40);
        keyLight2.position.set(-8, 4, 12);
        scene.add(keyLight2);

        const backLight = new THREE.PointLight(0x4a80e0, 0.8, 50);
        backLight.position.set(0, 0, -15);
        scene.add(backLight);

        // fill with subtle rim light
        const rimLight = new THREE.DirectionalLight(0xcba6ff, 0.6);
        rimLight.position.set(-1, 2, 5);
        scene.add(rimLight);

        // tiny glitter stars (distant)
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1800;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 60 + Math.random() * 50;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r;
            starPos[i*3+2] = Math.cos(phi) * r;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xbbaaff, size: 0.2, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // ─── CORE DATA STRUCTURE: recursive orchid group ───
        const orchidGroup = new THREE.Group();
        scene.add(orchidGroup);

        // golden ratio and its relatives
        const PHI = 1.618033988749895;
        const PHI2 = PHI * PHI;
        const PHI_INV = 1 / PHI;

        // parameters for current bloom
        let generationCount = 6;        // recursion depth
        let petalCount = 0;             // total petals (for info)
        
        // material cache for efficiency
        const materials = [];

        // generate a single "petal" as a curved double-sided surface
        function createPetal(colorBase, index, total) {
            // custom geometry: a curved petal shape (like an orchid labellum)
            const width = 0.9;
            const length = 2.2;
            const heightCurve = 0.5;
            
            // define shape with 8x8 grid for smooth curvature
            const segments = 12;
            const vertices = [];
            const indices = [];
            const normals = [];
            const uvs = [];

            for (let i = 0; i <= segments; i++) {
                const u = i / segments; // 0..1 along length
                // curve profile: wider at base, tip narrow, slight s-shape
                const rScale = Math.sin(u * Math.PI) * 0.3 + 0.7; 
                const w = width * (0.4 + 0.8 * u - 0.3 * u * u); // shape taper
                
                for (let j = 0; j <= segments; j++) {
                    const v = j / segments; // 0..1 across width
                    
                    // angle across: from -45deg to +45deg, curved
                    const theta = (v - 0.5) * Math.PI * 0.6; 
                    
                    // x,y,z of petal in local space
                    // length direction = y, width = x, height = z
                    const x = Math.sin(theta) * w * 0.8;
                    const y = (u - 0.5) * length * 1.2; // centered
                    const z = (Math.cos(theta) * w * 0.5 + 0.2) * (0.8 + 0.5 * Math.sin(u * Math.PI)) 
                                + heightCurve * Math.sin(u * Math.PI) * 0.8;
                    
                    // subtle twist near tip
                    const twist = u * 0.4 * Math.sin(v * Math.PI);
                    const xRot = x * Math.cos(twist) - z * Math.sin(twist);
                    const zRot = x * Math.sin(twist) + z * Math.cos(twist);
                    
                    vertices.push(xRot, y, zRot + 0.3); // lift base slightly
                    
                    // approximate normal (will recompute later, but we set smooth)
                    normals.push(0, 0, 1); // placeholder
                    uvs.push(u, v);
                }
            }

            // indices for triangles
            for (let i = 0; i < segments; i++) {
                for (let j = 0; j < segments; j++) {
                    const a = i * (segments + 1) + j;
                    const b = i * (segments + 1) + j + 1;
                    const c = (i + 1) * (segments + 1) + j;
                    const d = (i + 1) * (segments + 1) + j + 1;

                    indices.push(a, b, c);
                    indices.push(b, d, c);
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
            geometry.setIndex(indices);
            geometry.computeVertexNormals(); // smooth normals

            // color gradient based on index and recursion depth
            const hue = (colorBase + index * 0.03) % 1.0;
            const color = new THREE.Color().setHSL(hue, 0.85, 0.6);
            
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: new THREE.Color().setHSL(hue, 0.8, 0.1),
                roughness: 0.25,
                metalness: 0.1,
                emissiveIntensity: 0.4,
                side: THREE.DoubleSide,
                flatShading: false,
                transparent: true,
                opacity: 0.95
            });
            
            materials.push(material); // keep reference for possible updates
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            
            // store base color for animation
            mesh.userData = { baseHue: hue, speed: 0.2 + Math.random() * 0.3 };
            
            return mesh;
        }

        // recursive function to build orchid colony
        function buildOrchid(parentGroup, pos, scale, rotation, depth, colorBase, branchId) {
            if (depth > generationCount) return;

            const petalsPerNode = 5; // pentagonal symmetry
            
            // at each node, create ring of petals
            for (let i = 0; i < petalsPerNode; i++) {
                const angle = (i / petalsPerNode) * Math.PI * 2 + rotation.z * 0.5;
                
                // petal orientation: slightly outward and rotated
                const petal = createPetal(colorBase + depth * 0.05, i, petalsPerNode);
                
                // local transformations
                petal.position.x = Math.cos(angle) * 0.8 * scale;
                petal.position.z = Math.sin(angle) * 0.8 * scale;
                petal.position.y = 0.3 * scale; // upward tilt
                
                // rotate petal to face outward
                petal.rotation.y = angle;
                petal.rotation.x = 0.2 + Math.sin(angle * 2) * 0.2;
                petal.rotation.z = 0.3 * Math.sin(angle);
                
                // scale
                const petalScale = scale * (0.9 - depth * 0.1);
                petal.scale.set(petalScale, petalScale, petalScale);
                
                parentGroup.add(petal);
                petalCount++;
            }

            // recurse: add next generation buds, positioned using golden angle
            const childCount = 3; // trifurcating
            for (let j = 0; j < childCount; j++) {
                const childAngle = (j / childCount) * Math.PI * 2 + depth * PHI * 2;
                const childPos = new THREE.Vector3(
                    Math.cos(childAngle) * 1.5 * scale,
                    0.8 * scale,
                    Math.sin(childAngle) * 1.5 * scale
                );
                
                // create a group for this branch level (optional, but adds transform)
                const childGroup = new THREE.Group();
                childGroup.position.copy(childPos);
                
                // recursive rotation: incorporate golden ratio
                const childRot = new THREE.Euler(
                    rotation.x + 0.2,
                    rotation.y + childAngle * PHI_INV,
                    rotation.z + 0.4
                );
                childGroup.rotation.copy(childRot);
                
                parentGroup.add(childGroup);
                
                buildOrchid(
                    childGroup, 
                    childPos, 
                    scale * 0.65, 
                    childRot, 
                    depth + 1, 
                    (colorBase + 0.13 * j) % 1.0,
                    branchId * 10 + j
                );
            }
        }

        // clear previous and generate new orchid
        function regenerateOrchid() {
            // remove old
            while(orchidGroup.children.length) {
                orchidGroup.remove(orchidGroup.children[0]);
            }
            // clear material cache (optional, but avoid memory leak)
            materials.length = 0;
            
            petalCount = 0;
            
            // main trunk group
            const rootGroup = new THREE.Group();
            rootGroup.position.set(0, 0, 0);
            orchidGroup.add(rootGroup);
            
            // start recursion
            buildOrchid(
                rootGroup, 
                new THREE.Vector3(0, 0, 0), 
                1.2,                // scale
                new THREE.Euler(0.2, 0.5, 0.3), 
                0,                  // depth
                0.65,               // base hue
                1
            );
            
            // update status panel (optional)
            document.querySelector('.hint').innerHTML = `⚘ ${petalCount} petals · ${generationCount} gen`;
        }

        // initial build
        regenerateOrchid();

        // --- animation variables ---
        const clock = new THREE.Clock();
        let pulseMode = false;
        let pulseStrength = 0.0;

        // UI buttons
        document.getElementById('regen-btn').addEventListener('click', () => {
            generationCount = 5 + Math.floor(Math.random() * 3); // 5-7
            regenerateOrchid();
        });
        
        const toggleBtn = document.getElementById('toggle-btn');
        toggleBtn.addEventListener('click', () => {
            pulseMode = !pulseMode;
            toggleBtn.innerHTML = pulseMode ? '♢ pulse on' : '❖ pulse';
        });

        // subtle background audio pulse (optional, using Web Audio oscillator for low-frequency vibe)
        let audioCtx = null;
        let audioAnalyser = null;
        let audioData = null;
        let audioSource = null;

        function initAudioPulse() {
            try {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.value = 60; // low drone
                gain.gain.value = 0.15;
                
                // create analyser to get amplitude
                audioAnalyser = audioCtx.createAnalyser();
                audioAnalyser.fftSize = 64;
                oscillator.connect(gain);
                gain.connect(audioAnalyser);
                // no output to speakers (uncomment next line if you want silence)
                // gain.connect(audioCtx.destination); 
                
                oscillator.start();
                
                audioData = new Uint8Array(audioAnalyser.frequencyBinCount);
                
                // subtle random modulation
                setInterval(() => {
                    if (!pulseMode) return;
                    oscillator.frequency.value = 50 + Math.random() * 30;
                }, 400);
                
            } catch(e) {
                console.log('audio pulse not available, proceed without');
            }
        }
        
        // start audio on first user interaction (polite)
        window.addEventListener('click', () => {
            if (!audioCtx) initAudioPulse();
        }, { once: true });

        // --- animation loop ---
        function animate() {
            const delta = clock.getDelta();
            const time = performance.now() / 1000;

            // gentle floating motion for the whole orchid
            orchidGroup.rotation.y += 0.0008;
            orchidGroup.position.y = Math.sin(time * 0.3) * 0.5;

            // update stars
            stars.rotation.y += 0.0001;

            // if pulseMode and analyser, update materials
            if (pulseMode && audioAnalyser && audioData) {
                audioAnalyser.getByteFrequencyData(audioData);
                // average of first few bins as intensity
                let sum = 0;
                for (let i = 0; i < 4; i++) sum += audioData[i];
                pulseStrength = sum / (4 * 255); // 0..1
            } else {
                // gentle idle pulse using sine
                pulseStrength = 0.5 + 0.5 * Math.sin(time * 2.0);
            }

            // apply subtle pulse to petal materials (emissive and scale)
            orchidGroup.traverse((obj) => {
                if (obj.isMesh && obj.material) {
                    // handle single or multi materials
                    const mat = obj.material;
                    if (Array.isArray(mat)) {
                        mat.forEach(m => {
                            if (m.emissive) {
                                const baseHue = obj.userData?.baseHue || 0.6;
                                m.emissive.setHSL(baseHue, 0.9, 0.1 + pulseStrength * 0.2);
                            }
                        });
                    } else {
                        if (mat.emissive) {
                            const baseHue = obj.userData?.baseHue || 0.6;
                            mat.emissive.setHSL(baseHue, 0.9, 0.1 + pulseStrength * 0.2);
                        }
                    }
                    
                    // very slight scale modification (only if not recursed? just a touch)
                    // we skip scaling to preserve structure, but we could add a tiny wiggle.
                }
            });

            controls.update();
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        }

        animate();

        // resize handler
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // extra ambient touch: subtle light color shift
        setInterval(() => {
            const t = performance.now() / 2000;
            keyLight1.color.setHSL(0.72 + Math.sin(t)*0.05, 0.8, 0.6);
            keyLight2.color.setHSL(0.92 + Math.cos(t*1.3)*0.03, 0.9, 0.6);
        }, 200);