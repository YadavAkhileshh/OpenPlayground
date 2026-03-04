        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

        // --- setup scene, cameras, renderers ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x03050b);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 30, 60);
        camera.lookAt(0, 0, 0);

        // WebGL renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = false; // not needed
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        document.getElementById('universe').appendChild(renderer.domElement);

        // CSS2 renderer for labels
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0px';
        labelRenderer.domElement.style.left = '0px';
        labelRenderer.domElement.style.pointerEvents = 'none'; // let clicks pass through to canvas
        document.getElementById('universe').appendChild(labelRenderer.domElement);

        // controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.maxDistance = 150;
        controls.minDistance = 15;
        controls.enablePan = true;
        controls.target.set(0, 0, 0);

        // --- lighting ---
        const ambientLight = new THREE.AmbientLight(0x404060);
        scene.add(ambientLight);

        // central point light (sun light)
        const sunLight = new THREE.PointLight(0xffeedd, 2.5, 0, 0);
        sunLight.position.set(0, 0, 0);
        scene.add(sunLight);

        // additional directional light to see details
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(10, 20, 5);
        scene.add(dirLight);

        // back light
        const backLight = new THREE.DirectionalLight(0x446688, 0.4);
        backLight.position.set(-10, -5, -20);
        scene.add(backLight);

        // --- starfield background (particle system) ---
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 4000;
        const starPositions = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount * 3; i += 3) {
            // random sphere distribution
            const r = 150 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            starPositions[i] = Math.sin(phi) * Math.cos(theta) * r;
            starPositions[i+1] = Math.sin(phi) * Math.sin(theta) * r;
            starPositions[i+2] = Math.cos(phi) * r;
        }
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        const starsMaterial = new THREE.PointsMaterial({color: 0xffffff, size: 0.3, transparent: true});
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);

        // --- planet data ---
        const planetsInfo = [
            { name: 'Mercury', color: 0x9a9a9a, size: 0.8, distance: 6,  speed: 0.02, desc: 'The smallest & fastest planet. Scorching days, freezing nights.', distStat: '58 million km', orbitStat: '88 days', moons: 0 },
            { name: 'Venus',   color: 0xe6b856, size: 0.95, distance: 9,  speed: 0.015, desc: 'Similar size to Earth, but atmosphere of CO₂, hottest planet.', distStat: '108 million km', orbitStat: '225 days', moons: 0 },
            { name: 'Earth',   color: 0x2e86c1, size: 1.0, distance: 12, speed: 0.01, desc: 'Our home — the only known world with life.', distStat: '150 million km', orbitStat: '365 days', moons: 1 },
            { name: 'Mars',    color: 0xc1440e, size: 0.85, distance: 15, speed: 0.008, desc: 'The red planet. Olympus Mons — tallest volcano.', distStat: '228 million km', orbitStat: '687 days', moons: 2 },
            { name: 'Jupiter', color: 0xd8a27a, size: 2.2, distance: 20, speed: 0.005, desc: 'Gas giant, king of planets. Great Red Spot.', distStat: '778 million km', orbitStat: '12 years', moons: 79 },
            { name: 'Saturn',  color: 0xe0c080, size: 1.9, distance: 26, speed: 0.003, desc: 'Magnificent rings made of ice and rock.', distStat: '1.4 billion km', orbitStat: '29 years', moons: 83 },
            { name: 'Uranus',  color: 0x7ec8e0, size: 1.6, distance: 32, speed: 0.002, desc: 'Ice giant, rotates on its side.', distStat: '2.9 billion km', orbitStat: '84 years', moons: 27 },
            { name: 'Neptune', color: 0x4b70dd, size: 1.6, distance: 38, speed: 0.0015, desc: 'Deep blue, fierce supersonic winds.', distStat: '4.5 billion km', orbitStat: '165 years', moons: 14 }
        ];

        // store planet objects for animation and interaction
        const planets = [];

        // --- helper to create label (CSS2D) ---
        function createLabel(text, color = '#ffffff', bgOpacity = 0.3) {
            const div = document.createElement('div');
            div.textContent = text;
            div.style.color = '#fff';
            div.style.fontFamily = 'Segoe UI, system-ui, sans-serif';
            div.style.fontSize = '18px';
            div.style.fontWeight = '500';
            div.style.textShadow = '1px 1px 3px black';
            div.style.background = `rgba(10, 20, 30, ${bgOpacity})`;
            div.style.padding = '4px 12px';
            div.style.borderRadius = '30px';
            div.style.border = '1px solid rgba(255,240,180,0.4)';
            div.style.backdropFilter = 'blur(4px)';
            div.style.letterSpacing = '0.5px';
            div.style.pointerEvents = 'none'; // label not clickable
            return new CSS2DObject(div);
        }

        // --- create the Sun (center) ---
        const sunGeometry = new THREE.SphereGeometry(3.5, 64, 64);
        const sunMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffaa33, 
            emissive: 0xff5500, 
            emissiveIntensity: 2.5,
            roughness: 0.3
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        // add slight glow via pointlight already added
        // sun label
        const sunLabelDiv = document.createElement('div');
        sunLabelDiv.textContent = '☀️ SUN';
        sunLabelDiv.style.color = '#ffdd44';
        sunLabelDiv.style.fontWeight = 'bold';
        sunLabelDiv.style.fontSize = '22px';
        sunLabelDiv.style.background = 'rgba(80,30,0,0.5)';
        sunLabelDiv.style.padding = '4px 16px';
        sunLabelDiv.style.borderRadius = '40px';
        sunLabelDiv.style.border = '2px solid #ffaa33';
        const sunLabel = new CSS2DObject(sunLabelDiv);
        sunLabel.position.set(0, 5, 0);
        sun.add(sunLabel);

        // --- create planets and orbits ---
        planetsInfo.forEach((info, index) => {
            // planet mesh
            const geometry = new THREE.SphereGeometry(info.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({ color: info.color, roughness: 0.4, metalness: 0.1 });
            const planet = new THREE.Mesh(geometry, material);
            
            // initial position at distance on X axis, later animation will rotate around sun
            planet.position.x = info.distance;
            
            // store extra data on the object itself (for click detection and UI)
            planet.userData = { 
                name: info.name, 
                desc: info.desc, 
                distStat: info.distStat, 
                orbitStat: info.orbitStat, 
                moons: info.moons,
                color: info.color,
                distance: info.distance,
                speed: info.speed,
                angle: Math.random() * Math.PI * 2 // random start position
            };
            
            scene.add(planet);
            
            // add label (CSS2D) as child of planet (so it moves with it)
            const label = createLabel(info.name, '#fff', 0.3);
            label.position.set(0, info.size + 1.2, 0);
            planet.add(label);
            
            // add ring for Saturn (special)
            if (info.name === 'Saturn') {
                const ringGeo = new THREE.TorusGeometry(info.size * 1.8, 0.3, 16, 100);
                const ringMat = new THREE.MeshStandardMaterial({ color: 0xc0b0a0, emissive: 0x111111, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = Math.PI / 2;
                ring.rotation.z = 0.3;
                planet.add(ring);
            }

            // add a tiny specular for earth? optional — just for fun: add a small moon for earth?
            if (info.name === 'Earth') {
                const moonGeo = new THREE.SphereGeometry(0.2, 8);
                const moonMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
                const moon = new THREE.Mesh(moonGeo, moonMat);
                moon.position.set(1.2, 0.1, 0.5);
                planet.add(moon);
            }

            // create orbit line (circle)
            const points = [];
            const radius = info.distance;
            for (let i = 0; i <= 64; i++) {
                const angle = (i / 64) * Math.PI * 2;
                points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
            }
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x446688, transparent: true, opacity: 0.2 });
            const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);
            scene.add(orbitLine);

            // store for animation
            planets.push(planet);
        });

        // --- extra decorative asteroid belt hint (optional small dots) not necessary but nice
        const asteroidParticles = new THREE.BufferGeometry();
        const count = 800;
        const positions = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 18 + Math.random() * 3;
            const angle = Math.random() * Math.PI * 2;
            const y = (Math.random() - 0.5) * 1.5;
            positions[i*3] = Math.cos(angle) * r;
            positions[i*3+1] = y;
            positions[i*3+2] = Math.sin(angle) * r;
        }
        asteroidParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const asteroidMat = new THREE.PointsMaterial({ color: 0x886644, size: 0.08 });
        const asteroids = new THREE.Points(asteroidParticles, asteroidMat);
        scene.add(asteroids);

        // --- UI update & raycasting for clicks ---
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        renderer.domElement.style.cursor = 'pointer';
        renderer.domElement.addEventListener('click', (event) => {
            // calculate mouse position in normalized device coordinates
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            // collect all planets + sun (to show sun fact)
            const clickableObjects = [sun, ...planets];
            const intersects = raycaster.intersectObjects(clickableObjects);

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                updateFactPanel(hit);
            } else {
                // reset to default solar system view
                resetFactPanel();
            }
        });

        // update fact panel based on clicked object
        function updateFactPanel(obj) {
            const nameEl = document.getElementById('planetName');
            const descEl = document.getElementById('planetDesc');
            const distEl = document.getElementById('statDist');
            const orbitEl = document.getElementById('statOrbit');
            const moonsEl = document.getElementById('statMoons');

            if (obj === sun) {
                nameEl.textContent = '☀️ Sun';
                descEl.textContent = 'The heart of our solar system. Contains 99.8% of the solar system\'s mass.';
                distEl.textContent = '—';
                orbitEl.textContent = '—';
                moonsEl.textContent = '—';
                return;
            }

            const data = obj.userData;
            if (data) {
                nameEl.textContent = data.name;
                descEl.textContent = data.desc;
                distEl.textContent = data.distStat;
                orbitEl.textContent = data.orbitStat;
                moonsEl.textContent = data.moons.toString();
            }
        }

        function resetFactPanel() {
            document.getElementById('planetName').textContent = 'Solar system';
            document.getElementById('planetDesc').textContent = 'Our cosmic neighborhood — 8 planets, 1 star. Click any planet to explore.';
            document.getElementById('statDist').textContent = '—';
            document.getElementById('statOrbit').textContent = '—';
            document.getElementById('statMoons').textContent = '—';
        }

        // --- animation loop ---
        let clock = new THREE.Clock();

        function animate() {
            const delta = clock.getDelta();
            const elapsedTime = performance.now() / 1000; // seconds

            // rotate planets around sun
            planets.forEach(planet => {
                const data = planet.userData;
                // increase angle based on speed
                data.angle += data.speed * delta * 4; // scale speed for reasonable visual
                // compute position
                planet.position.x = Math.cos(data.angle) * data.distance;
                planet.position.z = Math.sin(data.angle) * data.distance;
            });

            // rotate stars slowly for ambiance
            stars.rotation.y += 0.0001;

            controls.update(); // for damping & auto-rotate

            // render main view
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);

            requestAnimationFrame(animate);
        }

        animate();

        // --- resize handler ---
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        }

        // set initial fact panel
        resetFactPanel();

        // little extra: show sun info if clicked far but we already have reset.

        console.log('Solar system ready!');