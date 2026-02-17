
        import * as THREE from 'three';
        import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
        import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
        import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
        import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
        import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
        import GUI from 'three/addons/libs/lil-gui.module.min.js';

        let scene, camera, renderer, controls;
        let particles; 
        let sourceGeometry; 
        let asciiTexture; 

        const params = {
            backgroundColor: '#0a0a0a',
            particleColor: '#ff2929',
            particleSize: 4,
            opacity: 1,
            
            backsideOpacity: 0.1,
            depthThreshold: -6, 
            
            density: 50000,
            modelScale: 1.0,
            rotationSpeedX: 0.0,
            rotationSpeedY: 0.002,
            
            animateParticles: true, 
            particleSpeed: 1.0,
            
            asciiMode: true,
            
            modelUrl: '', 

            loadUrl: function() {
                if (!params.modelUrl) {
                    alert('Please enter a URL first');
                    return;
                }
                loadModelFromUrl(params.modelUrl);
            },
            
            loadFile: function() {
                document.getElementById('hidden-file-input').click(); 
            }
        };

        document.fonts.ready.then(() => {
            init();
            animate();
        });

        function init() {
            asciiTexture = createASCIITexture();

            scene = new THREE.Scene();
            scene.background = new THREE.Color(params.backgroundColor);

            camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 0, 10);

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.getElementById('canvas-container').appendChild(renderer.domElement);

            controls = new TrackballControls(camera, renderer.domElement);
            controls.rotateSpeed = 5.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;
            controls.dynamicDampingFactor = 0.1;
            
            const dummyGeo = new THREE.ConeGeometry(2.5, 3, 4);
            dummyGeo.computeBoundingBox();
            dummyGeo.center();
            
            createParticleSystem(dummyGeo);

            setupGUI();

            window.addEventListener('resize', onWindowResize);
            document.getElementById('hidden-file-input').addEventListener('change', handleFileUpload);
        }

        function createASCIITexture() {
            const canvas = document.createElement('canvas');
            const size = 512;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, size, size);
            
            ctx.font = 'bold 70px "Kode Mono", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white'; 
            
            const cols = 6;
            const rows = 6;
            const cellW = size / cols;
            const cellH = size / rows;
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

            for (let i = 0; i < chars.length; i++) {
                const char = chars[i];
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = col * cellW + cellW / 2;
                const y = row * cellH + cellH / 2 + 5; 
                ctx.fillText(char, x, y);
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.flipY = false; 
            return texture;
        }

        function createParticleSystem(geometry) {
            if (particles) {
                scene.remove(particles);
                particles.geometry.dispose();
                particles.material.dispose();
            }

            sourceGeometry = geometry;
            const material = createShaderMaterial();
            const pointsGeometry = sampleGeometry(geometry, params.density);

            pointsGeometry.computeBoundingBox();
            pointsGeometry.center();

            particles = new THREE.Points(pointsGeometry, material);
            particles.scale.set(params.modelScale, params.modelScale, params.modelScale);
            
            scene.add(particles);
        }

        // --- FINAL FIX: RANDOM PROBING FOR ORGANIC NEIGHBORS ---
        function sampleGeometry(geometry, count) {
            const tempMesh = new THREE.Mesh(geometry);
            const sampler = new MeshSurfaceSampler(tempMesh).build();
            
            const positions = new Float32Array(count * 3);
            const sizes = new Float32Array(count); 
            const charIndices = new Float32Array(count); 
            
            const targetA = new Float32Array(count * 3);
            const targetB = new Float32Array(count * 3);
            const randomPhase = new Float32Array(count);

            const tempPosition = new THREE.Vector3();
            const tempProbe = new THREE.Vector3();

            // 1. Generate all base positions first
            for (let i = 0; i < count; i++) {
                sampler.sample(tempPosition);
                
                positions[i * 3] = tempPosition.x;
                positions[i * 3 + 1] = tempPosition.y;
                positions[i * 3 + 2] = tempPosition.z;

                sizes[i] = Math.random() * 0.5 + 0.5; 
                charIndices[i] = Math.floor(Math.random() * 36);
                randomPhase[i] = Math.random() * 100.0;
            }

            // 2. Find neighbors using Random Probing
            // We discarded the Grid approach to remove grid-like artifacts.
            // Since our model is normalized to ~5.0, a radius of 0.5 ensures local neighbors.
            const searchRadius = 0.5; 
            const searchRadiusSq = searchRadius * searchRadius;
            const maxAttempts = 30; // Number of random probes per particle

            const findNeighbor = (selfIndex) => {
                const px = positions[selfIndex * 3];
                const py = positions[selfIndex * 3 + 1];
                const pz = positions[selfIndex * 3 + 2];
                
                for(let attempt = 0; attempt < maxAttempts; attempt++) {
                    // Pick a random other particle
                    const rndIdx = Math.floor(Math.random() * count);
                    if (rndIdx === selfIndex) continue;

                    const tx = positions[rndIdx * 3];
                    const ty = positions[rndIdx * 3 + 1];
                    const tz = positions[rndIdx * 3 + 2];

                    // Check squared distance (faster)
                    const dx = px - tx;
                    const dy = py - ty;
                    const dz = pz - tz;
                    const distSq = dx*dx + dy*dy + dz*dz;

                    // If it's close enough, we found a random local neighbor!
                    if (distSq < searchRadiusSq) {
                        return rndIdx;
                    }
                }
                // Fallback: stay put if no neighbor found (rare)
                return selfIndex;
            };

            for (let i = 0; i < count; i++) {
                const idxA = findNeighbor(i);
                const idxB = findNeighbor(i);

                targetA[i * 3]     = positions[idxA * 3];
                targetA[i * 3 + 1] = positions[idxA * 3 + 1];
                targetA[i * 3 + 2] = positions[idxA * 3 + 2];

                targetB[i * 3]     = positions[idxB * 3];
                targetB[i * 3 + 1] = positions[idxB * 3 + 1];
                targetB[i * 3 + 2] = positions[idxB * 3 + 2];
            }

            const particleGeo = new THREE.BufferGeometry();
            particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particleGeo.setAttribute('targetA', new THREE.BufferAttribute(targetA, 3));
            particleGeo.setAttribute('targetB', new THREE.BufferAttribute(targetB, 3));
            
            particleGeo.setAttribute('aPhase', new THREE.BufferAttribute(randomPhase, 1));
            particleGeo.setAttribute('scale', new THREE.BufferAttribute(sizes, 1));
            particleGeo.setAttribute('charIndex', new THREE.BufferAttribute(charIndices, 1));
            
            return particleGeo;
        }

        function createShaderMaterial() {
            return new THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new THREE.Color(params.particleColor) },
                    size: { value: params.particleSize },
                    opacity: { value: params.opacity },
                    uBacksideOpacity: { value: params.backsideOpacity },
                    uDepthThreshold: { value: params.depthThreshold },
                    useASCII: { value: params.asciiMode ? 1.0 : 0.0 },
                    uTexture: { value: asciiTexture },
                    uTime: { value: 0.0 },
                    uAnimate: { value: params.animateParticles ? 1.0 : 0.0 },
                    uSpeed: { value: params.particleSpeed }
                },
                vertexShader: `
                    attribute float scale;
                    attribute float charIndex;
                    attribute float aPhase; 
                    attribute vec3 targetA;
                    attribute vec3 targetB;
                    
                    uniform float size;
                    uniform float uTime;
                    uniform float uAnimate;
                    uniform float uSpeed;
                    
                    varying float vCharIndex;
                    varying float vViewZ;

                    void main() {
                        vCharIndex = charIndex;
                        vec3 pos = position;

                        if (uAnimate > 0.5) {
                            float t = uTime * uSpeed + aPhase;
                            float weightA = 0.5 + 0.5 * sin(t); 
                            float weightB = 0.5 + 0.5 * cos(t * 0.7);
                            
                            // Interpolate between origin and neighbors found via random probe
                            vec3 p1 = mix(position, targetA, weightA);
                            pos = mix(p1, targetB, weightB * 0.6); 
                        }

                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        vViewZ = mvPosition.z;

                        float pointSize = size * scale * (40.0 / -mvPosition.z);
                        gl_PointSize = clamp(pointSize, 1.0, 100.0);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    uniform float opacity;
                    uniform float uBacksideOpacity; 
                    uniform float uDepthThreshold; 
                    uniform float useASCII;
                    uniform sampler2D uTexture;
                    
                    varying float vCharIndex;
                    varying float vViewZ;

                    void main() {
                        vec4 finalColor = vec4(color, opacity);
                        
                        float fadeStart = uDepthThreshold - 10.0; 
                        float fadeEnd = uDepthThreshold;
                        float depthFactor = smoothstep(fadeStart, fadeEnd, vViewZ);
                        float depthAlpha = mix(uBacksideOpacity, 1.0, depthFactor);
                        finalColor.a *= depthAlpha;

                        if (useASCII > 0.5) {
                            float cols = 6.0;
                            float rows = 6.0;
                            float colIndex = mod(vCharIndex, cols);
                            float rowIndex = floor(vCharIndex / cols);
                            vec2 uv = gl_PointCoord;
                            uv /= vec2(cols, rows);
                            uv += vec2(colIndex / cols, rowIndex / rows);
                            vec4 texColor = texture2D(uTexture, uv);
                            if (texColor.a < 0.1) discard;
                            finalColor.a *= texColor.a;
                        } else {
                            float r = distance(gl_PointCoord, vec2(0.5));
                            if (r > 0.5) discard;
                        }
                        gl_FragColor = finalColor;
                    }
                `,
                transparent: true,
                depthWrite: false,
                blending: THREE.NormalBlending
            });
        }

        function onModelLoaded(object) {
            document.getElementById('loader').style.display = 'none';
            const geometries = [];
            
            object.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    if (child.geometry.index) {
                         child.geometry = child.geometry.toNonIndexed();
                    }
                    
                    child.updateMatrixWorld(true);
                    const clonedGeo = child.geometry.clone();
                    clonedGeo.applyMatrix4(child.matrixWorld);
                    
                    const simplifiedGeo = new THREE.BufferGeometry();
                    if(clonedGeo.attributes.position) {
                        simplifiedGeo.setAttribute('position', clonedGeo.attributes.position);
                        geometries.push(simplifiedGeo);
                    }
                }
            });

            if (geometries.length === 0) {
                alert('No geometry found in file.');
                return;
            }

            let finalGeo = BufferGeometryUtils.mergeGeometries(geometries);
            if (!finalGeo) {
                 finalGeo = geometries[0];
            }

            finalGeo.computeBoundingBox();
            
            const box = finalGeo.boundingBox;
            const size = new THREE.Vector3();
            box.getSize(size);
            
            const maxDimension = Math.max(size.x, size.y, size.z);
            const scaleFactor = 5.0 / maxDimension; 
            
            finalGeo.scale(scaleFactor, scaleFactor, scaleFactor);
            finalGeo.computeBoundingBox();
            finalGeo.center();

            createParticleSystem(finalGeo);
            
            controls.reset();
            controls.target.set(0, 0, 0); 
            
            camera.position.set(0, 0, 10);
            camera.lookAt(0,0,0);
        }

        function loadModelFromUrl(url) {
            const loaderDiv = document.getElementById('loader');
            loaderDiv.style.display = 'block';
            const cleanUrl = url.split('?')[0].toLowerCase();
            const onError = (e) => {
                loaderDiv.style.display = 'none';
                console.error(e);
                alert('Error loading from URL. Check console.');
            };

            if (cleanUrl.endsWith('.fbx')) {
                const loader = new FBXLoader();
                loader.load(url, onModelLoaded, undefined, onError);
            } else if (cleanUrl.endsWith('.obj')) {
                const loader = new OBJLoader();
                loader.load(url, onModelLoaded, undefined, onError);
            } else {
                loaderDiv.style.display = 'none';
                alert('URL must end with .fbx or .obj');
            }
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const url = URL.createObjectURL(file);
            const extension = file.name.split('.').pop().toLowerCase();
            const loaderDiv = document.getElementById('loader');
            loaderDiv.style.display = 'block';

            const onError = (e) => {
                loaderDiv.style.display = 'none';
                console.error(e);
                alert('Error loading file.');
            };

            if (extension === 'fbx') {
                const loader = new FBXLoader();
                loader.load(url, onModelLoaded, undefined, onError);
            } else if (extension === 'obj') {
                const loader = new OBJLoader();
                loader.load(url, onModelLoaded, undefined, onError);
            } else {
                alert('Unsupported format');
                loaderDiv.style.display = 'none';
            }
            event.target.value = '';
        }

        function setupGUI() {
            const gui = new GUI({ title: 'Viewer Settings' });
            
            const folderFile = gui.addFolder('File');
            folderFile.add(params, 'loadFile').name('Upload 3D File OBJ/FBX');
            folderFile.add(params, 'modelUrl').name('Model URL');
            folderFile.add(params, 'loadUrl').name('Load from URL');

            const folderVisuals = gui.addFolder('Appearance');
            folderVisuals.addColor(params, 'backgroundColor').name('Background')
                .onChange(value => scene.background.set(value));
            folderVisuals.addColor(params, 'particleColor').name('Particle Color')
                .onChange(value => { if(particles) particles.material.uniforms.color.value.set(value); });
            folderVisuals.add(params, 'opacity', 0.1, 1.0).name('Opacity')
                .onChange(value => { if(particles) particles.material.uniforms.opacity.value = value; });
            
            folderVisuals.add(params, 'backsideOpacity', 0.0, 1.0).name('Backside Opacity')
                .onChange(value => { if(particles) particles.material.uniforms.uBacksideOpacity.value = value; });
            
            folderVisuals.add(params, 'depthThreshold', -50.0, 10.0).name('Depth Threshold')
                .onChange(value => { if(particles) particles.material.uniforms.uDepthThreshold.value = value; });
            
            folderVisuals.add(params, 'particleSize', 0.1, 10.0).name('Size (px)')
                .onChange(value => { if(particles) particles.material.uniforms.size.value = value; });
            folderVisuals.add(params, 'density', 100, 100000).name('Density').step(100)
                .onFinishChange(value => { if(sourceGeometry) createParticleSystem(sourceGeometry); });
            folderVisuals.add(params, 'modelScale', 0.1, 5.0).name('Model Size')
                .onChange(value => {
                    if (particles) particles.scale.set(value, value, value);
                });

            const folderMode = gui.addFolder('Style & Effects');
            
            folderMode.add(params, 'asciiMode').name('ASCII Mode')
                .onChange(value => {
                    if(particles) {
                        particles.material.uniforms.useASCII.value = value ? 1.0 : 0.0;
                        if (value && params.particleSize < 4.0) {
                             params.particleSize = 5.0; 
                             particles.material.uniforms.size.value = 5.0;
                             gui.controllers.forEach(c => c.updateDisplay());
                        }
                    }
                });
            
            folderMode.add(params, 'animateParticles').name('Animate Particles')
                .onChange(value => {
                    if(particles) particles.material.uniforms.uAnimate.value = value ? 1.0 : 0.0;
                });
            
            folderMode.add(params, 'particleSpeed', 0.1, 5.0).name('Anim Speed')
                .onChange(value => {
                    if(particles) particles.material.uniforms.uSpeed.value = value;
                });

            const folderAnim = gui.addFolder('Global Rotation');
            folderAnim.add(params, 'rotationSpeedX', -0.02, 0.02).name('Rotation Y');
            folderAnim.add(params, 'rotationSpeedY', -0.02, 0.02).name('Rotation X');

            folderFile.open();
            folderVisuals.open();
            folderMode.open();
        }

        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setSize(window.innerWidth, window.innerHeight);
            controls.handleResize(); 
        }

        function animate() {
            requestAnimationFrame(animate);

            if (particles) {
                particles.rotation.x += params.rotationSpeedX;
                particles.rotation.y += params.rotationSpeedY;
                particles.material.uniforms.uTime.value += 0.01;
            }

            

            controls.update(); 
            renderer.render(scene, camera);
        }
