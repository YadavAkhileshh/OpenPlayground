        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

        // --- setup scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0720);
        scene.fog = new THREE.FogExp2(0x0a0720, 0.008);

        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(18, 12, 24);
        camera.lookAt(4, 4, 4);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.3;
        document.getElementById('canvas-container').appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.enableZoom = true;
        controls.target.set(4, 4, 4);

        // --- lighting ---
        const ambient = new THREE.AmbientLight(0x40406b);
        scene.add(ambient);

        const light1 = new THREE.PointLight(0x9f7aff, 1.4, 40);
        light1.position.set(8, 10, 8);
        scene.add(light1);

        const light2 = new THREE.PointLight(0xff7a9f, 1.0, 40);
        light2.position.set(0, 5, 15);
        scene.add(light2);

        const backLight = new THREE.PointLight(0x6a8cff, 0.8, 50);
        backLight.position.set(-5, 0, -10);
        scene.add(backLight);

        // distant stars
        const starGeo = new THREE.BufferGeometry();
        const starCount = 1800;
        const starPos = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            const r = 80 + Math.random() * 70;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            starPos[i*3+1] = Math.sin(phi) * Math.sin(theta) * r;
            starPos[i*3+2] = Math.cos(phi) * r;
        }
        starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
        const starMat = new THREE.PointsMaterial({ color: 0xaa99ee, size: 0.2, transparent: true, blending: THREE.AdditiveBlending });
        const stars = new THREE.Points(starGeo, starMat);
        scene.add(stars);

        // --- lattice parameters ---
        const size = 8; // 8x8x8 grid
        const totalCells = size * size * size;
        const cellSize = 1.2;
        const offset = (size - 1) * cellSize / 2;

        // state arrays: 0 = dead, 1-10 = alive with age
        let grid = new Uint8Array(totalCells);
        let nextGrid = new Uint8Array(totalCells);

        // three.js objects
        const cellGroup = new THREE.Group();
        const cellMeshes = [];

        // initialize with random seed
        function seedLattice(density = 0.15) {
            for (let i = 0; i < totalCells; i++) {
                grid[i] = Math.random() < density ? 1 + Math.floor(Math.random() * 3) : 0;
            }
            updateMeshesFromGrid();
        }

        // create all cubes (instanced would be more efficient, but we need per-cube color/opacity)
        function buildLattice() {
            while(cellGroup.children.length) cellGroup.remove(cellGroup.children[0]);
            cellMeshes.length = 0;
            
            const geo = new THREE.BoxGeometry(cellSize * 0.9, cellSize * 0.9, cellSize * 0.9);
            
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    for (let z = 0; z < size; z++) {
                        const idx = x * size * size + y * size + z;
                        
                        const mat = new THREE.MeshStandardMaterial({
                            color: 0xaa88ff,
                            emissive: 0x221133,
                            transparent: true,
                            opacity: 0.0,
                            roughness: 0.3,
                            metalness: 0.2
                        });
                        
                        const cube = new THREE.Mesh(geo, mat);
                        cube.position.set(
                            x * cellSize - offset,
                            y * cellSize - offset,
                            z * cellSize - offset
                        );
                        
                        cube.userData = { x, y, z, idx };
                        cellGroup.add(cube);
                        cellMeshes.push(cube);
                    }
                }
            }
            scene.add(cellGroup);
        }

        // update cube appearances based on grid state
        function updateMeshesFromGrid() {
            for (let i = 0; i < totalCells; i++) {
                const state = grid[i];
                const cube = cellMeshes[i];
                if (!cube) continue;
                
                if (state > 0) {
                    // age affects color and opacity
                    const age = Math.min(state, 10) / 10;
                    const hue = 0.7 + age * 0.2; // purple to pink
                    const color = new THREE.Color().setHSL(hue, 0.9, 0.5 + age * 0.2);
                    cube.material.color.set(color);
                    cube.material.emissive.setHSL(hue, 0.8, 0.2);
                    cube.material.opacity = 0.5 + age * 0.3;
                    cube.scale.set(1, 1, 1);
                } else {
                    cube.material.opacity = 0;
                    cube.scale.set(0, 0, 0); // hide
                }
            }
        }

        // cellular automaton rule: count live neighbors, with birth/survival
        function countNeighbors(x, y, z) {
            let count = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        if (dx === 0 && dy === 0 && dz === 0) continue;
                        const nx = x + dx;
                        const ny = y + dy;
                        const nz = z + dz;
                        if (nx < 0 || nx >= size || ny < 0 || ny >= size || nz < 0 || nz >= size) continue;
                        const idx = nx * size * size + ny * size + nz;
                        if (grid[idx] > 0) count++;
                    }
                }
            }
            return count;
        }

        // evolve one generation
        function evolve() {
            for (let x = 0; x < size; x++) {
                for (let y = 0; y < size; y++) {
                    for (let z = 0; z < size; z++) {
                        const idx = x * size * size + y * size + z;
                        const state = grid[idx];
                        const neighbors = countNeighbors(x, y, z);
                        
                        if (state > 0) {
                            // live cell: survive if 4-6 neighbors (crystal growth rule)
                            if (neighbors >= 4 && neighbors <= 6) {
                                nextGrid[idx] = Math.min(state + 1, 10); // age
                            } else {
                                nextGrid[idx] = 0;
                            }
                        } else {
                            // dead cell: birth if exactly 5 neighbors
                            if (neighbors === 5) {
                                nextGrid[idx] = 1;
                            } else {
                                nextGrid[idx] = 0;
                            }
                        }
                    }
                }
            }
            
            // swap
            const tmp = grid;
            grid = nextGrid;
            nextGrid = tmp;
            
            updateMeshesFromGrid();
            
            // update growth display (average activity)
            let sum = 0;
            for (let i = 0; i < totalCells; i+=10) sum += grid[i];
            const avg = (sum / (totalCells/10) * 0.3).toFixed(2);
            document.getElementById('growth-val').innerText = avg;
        }

        // initialize
        buildLattice();
        seedLattice(0.12);

        // UI controls
        let growing = true;
        document.getElementById('seed').addEventListener('click', () => {
            seedLattice(0.15);
        });
        
        document.getElementById('toggle-grow').addEventListener('click', (e) => {
            growing = !growing;
            e.target.innerHTML = growing ? '◍ pause' : '◍ play';
        });

        // animation loop
        const clock = new THREE.Clock();
        let evolutionTimer = 0;

        function animate() {
            const delta = clock.getDelta();
            
            if (growing) {
                evolutionTimer += delta;
                if (evolutionTimer > 0.3) { // evolve every 0.3 sec
                    evolve();
                    evolutionTimer = 0;
                }
            }
            
            // rotate stars
            stars.rotation.y += 0.0002;
            
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

        // light shifts
        setInterval(() => {
            const t = performance.now() / 2000;
            light1.color.setHSL(0.68 + Math.sin(t)*0.06, 0.8, 0.6);
            light2.color.setHSL(0.92 + Math.cos(t*1.2)*0.05, 0.9, 0.6);
        }, 200);