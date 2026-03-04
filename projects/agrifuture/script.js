        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87c0a0);
        scene.fog = new THREE.Fog(0x87c0a0, 30, 100);
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(20, 12, 30);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);
        
        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(window.innerWidth, window.innerHeight);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.left = '0';
        labelRenderer.domElement.style.pointerEvents = 'none';
        document.body.appendChild(labelRenderer.domElement);
        
        // --- Controls ---
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.3;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.minDistance = 15;
        controls.maxDistance = 60;
        
        // --- Lighting ---
        const ambient = new THREE.AmbientLight(0x406040);
        scene.add(ambient);
        
        const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.2);
        sunLight.position.set(30, 40, 20);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 1024;
        sunLight.shadow.mapSize.height = 1024;
        const d = 50;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 80;
        scene.add(sunLight);
        
        // --- Ground (fertile soil) ---
        const groundGeo = new THREE.CircleGeometry(60, 32);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x5a7a4a, roughness: 0.7 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = true;
        scene.add(ground);
        
        // --- Crop rows (green rectangles) ---
        function createCropRow(x, z, length, color) {
            const group = new THREE.Group();
            
            for (let i = 0; i < length; i++) {
                const plantGeo = new THREE.BoxGeometry(0.2, 0.5, 0.2);
                const plantMat = new THREE.MeshStandardMaterial({ color: color });
                const plant = new THREE.Mesh(plantGeo, plantMat);
                plant.position.set(i * 0.8 - length * 0.4, 0, 0);
                plant.castShadow = true;
                plant.receiveShadow = true;
                group.add(plant);
            }
            
            group.position.set(x, -0.25, z);
            return group;
        }
        
        // Grid of crop rows
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 6; j++) {
                const x = (i - 4) * 3;
                const z = (j - 3) * 4;
                const colors = [0x88aa44, 0x66aa33, 0xaacc55, 0x88cc44];
                const row = createCropRow(x, z, 8, colors[Math.floor(Math.random() * colors.length)]);
                scene.add(row);
            }
        }
        
        // --- Vertical farming towers ---
        function createTower(x, z) {
            const group = new THREE.Group();
            
            for (let level = 0; level < 5; level++) {
                const trayGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 6);
                const trayMat = new THREE.MeshStandardMaterial({ color: 0x88aadd });
                const tray = new THREE.Mesh(trayGeo, trayMat);
                tray.position.y = level * 1.5;
                tray.castShadow = true;
                tray.receiveShadow = true;
                group.add(tray);
                
                // Plants on tray
                for (let p = 0; p < 4; p++) {
                    const plantGeo = new THREE.ConeGeometry(0.3, 0.5, 4);
                    const plantMat = new THREE.MeshStandardMaterial({ color: 0x88dd88 });
                    const plant = new THREE.Mesh(plantGeo, plantMat);
                    const angle = (p / 4) * Math.PI * 2;
                    plant.position.set(
                        Math.cos(angle) * 0.8,
                        level * 1.5 + 0.3,
                        Math.sin(angle) * 0.8
                    );
                    plant.castShadow = true;
                    group.add(plant);
                }
            }
            
            group.position.set(x, -0.5, z);
            return group;
        }
        
        // Place towers
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 2; j++) {
                const x = -8 + i * 8;
                const z = -5 + j * 15;
                const tower = createTower(x, z);
                scene.add(tower);
            }
        }
        
        // --- Farm buildings (automated facility) ---
        const facilityGroup = new THREE.Group();
        facilityGroup.position.set(10, -0.5, 8);
        
        const mainGeo = new THREE.BoxGeometry(4, 2.5, 4);
        const mainMat = new THREE.MeshStandardMaterial({ color: 0x88aadd });
        const main = new THREE.Mesh(mainGeo, mainMat);
        main.position.y = 1.25;
        main.castShadow = true;
        main.receiveShadow = true;
        facilityGroup.add(main);
        
        const roofGeo = new THREE.ConeGeometry(2.5, 1, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x3366aa });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 2.8;
        roof.castShadow = true;
        facilityGroup.add(roof);
        
        scene.add(facilityGroup);
        
        // Facility label
        const facilityDiv = document.createElement('div');
        facilityDiv.textContent = '🏭 HARVEST CONTROL';
        facilityDiv.style.background = '#1a4a3a';
        facilityDiv.style.color = '#aaffaa';
        facilityDiv.style.border = '2px solid #88dd88';
        facilityDiv.style.borderRadius = '30px';
        facilityDiv.style.padding = '4px 16px';
        const facilityLabel = new CSS2DObject(facilityDiv);
        facilityLabel.position.set(10, 3.5, 8);
        scene.add(facilityLabel);
        
        // --- Autonomous drones (flying robots) ---
        const drones = [];
        function createDrone() {
            const group = new THREE.Group();
            
            const bodyGeo = new THREE.BoxGeometry(0.6, 0.2, 0.8);
            const bodyMat = new THREE.MeshStandardMaterial({ color: 0x88aaff });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.castShadow = true;
            group.add(body);
            
            const rotorGeo = new THREE.BoxGeometry(0.2, 0.1, 1.2);
            const rotorMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            for (let i = 0; i < 4; i++) {
                const rotor = new THREE.Mesh(rotorGeo, rotorMat);
                rotor.position.set(
                    (i % 2 === 0 ? 0.5 : -0.5),
                    0.1,
                    (i < 2 ? 0.5 : -0.5)
                );
                group.add(rotor);
            }
            
            return group;
        }
        
        for (let i = 0; i < 12; i++) {
            const drone = createDrone();
            drone.position.set(
                (Math.random() - 0.5) * 30,
                3 + Math.random() * 8,
                (Math.random() - 0.5) * 30
            );
            
            drone.userData = {
                angle: Math.random() * Math.PI * 2,
                speed: 0.01 + Math.random() * 0.02,
                radius: 2 + Math.random() * 5,
                height: drone.position.y
            };
            
            scene.add(drone);
            drones.push(drone);
        }
        
        // --- Solar panels ---
        for (let i = 0; i < 6; i++) {
            const panelGroup = new THREE.Group();
            const panelGeo = new THREE.BoxGeometry(2, 0.1, 1);
            const panelMat = new THREE.MeshStandardMaterial({ color: 0x3366aa });
            const panel = new THREE.Mesh(panelGeo, panelMat);
            panel.rotation.x = -0.5;
            panel.castShadow = true;
            panel.receiveShadow = true;
            panelGroup.add(panel);
            
            panelGroup.position.set(
                -12 + i * 4,
                1,
                12
            );
            scene.add(panelGroup);
        }
        
        // --- Irrigation system (water particles) ---
        const waterGeo = new THREE.BufferGeometry();
        const waterCount = 400;
        const waterPos = new Float32Array(waterCount * 3);
        for (let i = 0; i < waterCount; i++) {
            waterPos[i*3] = (Math.random() - 0.5) * 30;
            waterPos[i*3+1] = Math.random() * 8;
            waterPos[i*3+2] = (Math.random() - 0.5) * 30;
        }
        waterGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
        const waterMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.1, transparent: true, blending: THREE.AdditiveBlending });
        const waterParticles = new THREE.Points(waterGeo, waterMat);
        scene.add(waterParticles);
        
        // --- Animate ---
        let time = 0;
        
        function animate() {
            requestAnimationFrame(animate);
            
            time += 0.01;
            
            // Move drones
            drones.forEach(d => {
                d.userData.angle += d.userData.speed;
                d.position.x += Math.cos(d.userData.angle) * 0.02;
                d.position.z += Math.sin(d.userData.angle) * 0.02;
                d.position.y = d.userData.height + Math.sin(time * 2 + d.userData.angle) * 1;
            });
            
            // Water particles fall
            const positions = waterParticles.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i+=3) {
                positions[i] -= 0.01;
                if (positions[i] < 0) {
                    positions[i] = 8;
                    positions[i-1] = (Math.random() - 0.5) * 30;
                    positions[i+1] = (Math.random() - 0.5) * 30;
                }
            }
            waterParticles.geometry.attributes.position.needsUpdate = true;
            
            // Update displays
            document.getElementById('drone-count').innerText = 24 + Math.floor(Math.sin(time)*2);
            document.getElementById('yield').innerText = (98 + Math.sin(time*2)*1).toFixed(0) + '%';
            document.getElementById('growth').innerText = (83 + Math.sin(time*3)*2).toFixed(0) + '%';
            document.getElementById('ph').innerText = (6.8 + Math.sin(time*4)*0.1).toFixed(1);
            document.getElementById('water').innerText = (342 + Math.sin(time*5)*10).toFixed(0) + ' L/day';
            document.getElementById('energy').innerText = (1.2 + Math.sin(time*6)*0.1).toFixed(1) + ' kWh';
            document.getElementById('total-crops').innerText = (12847 + Math.floor(Math.sin(time)*50)).toLocaleString() + ' kg';
            
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        }
        
        animate();
        
        // Resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });