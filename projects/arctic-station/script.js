        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a1a2a);
        scene.fog = new THREE.FogExp2(0x0a1a2a, 0.003);
        
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        camera.position.set(20, 10, 35);
        
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
        controls.autoRotateSpeed = 0.2;
        controls.maxPolarAngle = Math.PI / 2.2;
        controls.minDistance = 15;
        controls.maxDistance = 80;
        
        // --- Lighting ---
        const ambient = new THREE.AmbientLight(0x304060);
        scene.add(ambient);
        
        // Moonlight
        const moonLight = new THREE.DirectionalLight(0xcce0ff, 0.4);
        moonLight.position.set(-20, 30, -20);
        moonLight.castShadow = true;
        moonLight.shadow.mapSize.width = 1024;
        moonLight.shadow.mapSize.height = 1024;
        const d = 40;
        moonLight.shadow.camera.left = -d;
        moonLight.shadow.camera.right = d;
        moonLight.shadow.camera.top = d;
        moonLight.shadow.camera.bottom = -d;
        moonLight.shadow.camera.near = 1;
        moonLight.shadow.camera.far = 60;
        scene.add(moonLight);
        
        // Station lights (point lights)
        const pointLight1 = new THREE.PointLight(0xffaa55, 1.0, 30);
        pointLight1.position.set(5, 5, 5);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x88aaff, 0.8, 30);
        pointLight2.position.set(-5, 3, -5);
        scene.add(pointLight2);
        
        // --- Ice ground ---
        const iceGeo = new THREE.CircleGeometry(60, 32);
        const iceMat = new THREE.MeshStandardMaterial({ color: 0xaaccff, emissive: 0x112233, roughness: 0.4, metalness: 0.1 });
        const iceGround = new THREE.Mesh(iceGeo, iceMat);
        iceGround.rotation.x = -Math.PI / 2;
        iceGround.position.y = -0.5;
        iceGround.receiveShadow = true;
        scene.add(iceGround);
        
        // --- Icebergs / pressure ridges ---
        for (let i = 0; i < 15; i++) {
            const height = 1 + Math.random() * 4;
            const width = 1 + Math.random() * 3;
            const depth = 1 + Math.random() * 2;
            const icebergGeo = new THREE.ConeGeometry(width, height, 5);
            const icebergMat = new THREE.MeshStandardMaterial({ color: 0xccddff, emissive: 0x112233, transparent: true, opacity: 0.8 });
            const iceberg = new THREE.Mesh(icebergGeo, icebergMat);
            iceberg.position.set(
                (Math.random() - 0.5) * 50,
                -0.5 + height/2,
                (Math.random() - 0.5) * 50
            );
            iceberg.castShadow = true;
            iceberg.receiveShadow = true;
            scene.add(iceberg);
        }
        
        // --- Research station modules ---
        const stationGroup = new THREE.Group();
        stationGroup.position.set(0, -0.5, 0);
        
        // Main hab module
        const habGeo = new THREE.CylinderGeometry(2.5, 2.5, 2, 8);
        const habMat = new THREE.MeshStandardMaterial({ color: 0xdd5533 });
        const hab = new THREE.Mesh(habGeo, habMat);
        hab.position.y = 1;
        hab.castShadow = true;
        hab.receiveShadow = true;
        stationGroup.add(hab);
        
        // Dome
        const domeGeo = new THREE.SphereGeometry(1.5, 8, 4);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0x88aadd, transparent: true, opacity: 0.6 });
        const dome = new THREE.Mesh(domeGeo, domeMat);
        dome.position.y = 2.5;
        dome.scale.set(1, 0.5, 1);
        dome.castShadow = true;
        stationGroup.add(dome);
        
        // Antenna
        const antennaBase = new THREE.CylinderGeometry(0.2, 0.2, 2);
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const antenna = new THREE.Mesh(antennaBase, antennaMat);
        antenna.position.set(1.5, 2, 1.5);
        antenna.castShadow = true;
        stationGroup.add(antenna);
        
        // Solar panels (though not much sun in arctic winter)
        const panelGeo = new THREE.BoxGeometry(3, 0.1, 1.5);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x224466 });
        const panel = new THREE.Mesh(panelGeo, panelMat);
        panel.position.set(-2, 1.8, -1);
        panel.rotation.y = 0.3;
        panel.castShadow = true;
        panel.receiveShadow = true;
        stationGroup.add(panel);
        
        scene.add(stationGroup);
        
        // Station label
        const stationDiv = document.createElement('div');
        stationDiv.textContent = '🏔️ NORDENSKIÖLD STATION';
        stationDiv.style.background = '#1a3a4a';
        stationDiv.style.color = '#e0f0ff';
        stationDiv.style.border = '2px solid #7aa5c0';
        stationDiv.style.borderRadius = '30px';
        stationDiv.style.padding = '4px 18px';
        stationDiv.style.fontWeight = 'bold';
        const stationLabel = new CSS2DObject(stationDiv);
        stationLabel.position.set(0, 5, 0);
        scene.add(stationLabel);
        
        // --- Scientific equipment ---
        // Weather station
        const weatherGeo = new THREE.CylinderGeometry(0.3, 0.3, 2);
        const weatherMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
        const weatherMast = new THREE.Mesh(weatherGeo, weatherMat);
        weatherMast.position.set(4, 1, 3);
        weatherMast.castShadow = true;
        scene.add(weatherMast);
        
        // Anemometer
        const anemometer = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), new THREE.MeshStandardMaterial({ color: 0xdddddd }));
        anemometer.position.set(4, 2.2, 3);
        scene.add(anemometer);
        
        // --- Ice core drill rig ---
        const drillGroup = new THREE.Group();
        drillGroup.position.set(-3, 0, 4);
        
        const drillBase = new THREE.BoxGeometry(1.5, 0.3, 1.5);
        const drillBaseMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
        const base = new THREE.Mesh(drillBase, drillBaseMat);
        base.position.y = 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        drillGroup.add(base);
        
        const drillMast = new THREE.CylinderGeometry(0.2, 0.2, 3);
        const mast = new THREE.Mesh(drillMast, new THREE.MeshStandardMaterial({ color: 0xcccccc }));
        mast.position.y = 1.5;
        drillGroup.add(mast);
        
        scene.add(drillGroup);
        
        // Drill label
        const drillDiv = document.createElement('div');
        drillDiv.textContent = '🪨 ICE CORE DRILL';
        drillDiv.style.background = '#1a2a3a';
        drillDiv.style.color = '#b0d8ff';
        drillDiv.style.border = '1px solid #7aa5c0';
        drillDiv.style.borderRadius = '20px';
        drillDiv.style.padding = '2px 12px';
        drillDiv.style.fontSize = '12px';
        const drillLabel = new CSS2DObject(drillDiv);
        drillLabel.position.set(-3, 3, 4);
        scene.add(drillLabel);
        
        // --- Snow particles (falling) ---
        const snowGeo = new THREE.BufferGeometry();
        const snowCount = 1500;
        const snowPos = new Float32Array(snowCount * 3);
        const snowVel = [];
        for (let i = 0; i < snowCount; i++) {
            snowPos[i*3] = (Math.random() - 0.5) * 100;
            snowPos[i*3+1] = Math.random() * 50;
            snowPos[i*3+2] = (Math.random() - 0.5) * 100;
            snowVel.push(0.02 + Math.random() * 0.03);
        }
        snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
        const snowMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const snow = new THREE.Points(snowGeo, snowMat);
        scene.add(snow);
        
        // --- Aurora borealis (shader-like using particles) ---
        const auroraGeo = new THREE.BufferGeometry();
        const auroraCount = 2000;
        const auroraPos = new Float32Array(auroraCount * 3);
        const auroraColors = new Float32Array(auroraCount * 3);
        for (let i = 0; i < auroraCount; i++) {
            const r = 40 + Math.random() * 30;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            auroraPos[i*3] = Math.sin(phi) * Math.cos(theta) * r;
            auroraPos[i*3+1] = Math.abs(Math.sin(phi) * Math.sin(theta) * r) * 0.8 + 20; // high altitude
            auroraPos[i*3+2] = Math.cos(phi) * r;
            
            // Green/purple aurora colors
            const isGreen = Math.random() > 0.3;
            auroraColors[i*3] = isGreen ? 0.3 + Math.random()*0.5 : 0.6 + Math.random()*0.4;
            auroraColors[i*3+1] = isGreen ? 0.8 + Math.random()*0.5 : 0.2 + Math.random()*0.3;
            auroraColors[i*3+2] = isGreen ? 0.3 + Math.random()*0.4 : 0.8 + Math.random()*0.5;
        }
        auroraGeo.setAttribute('position', new THREE.BufferAttribute(auroraPos, 3));
        auroraGeo.setAttribute('color', new THREE.BufferAttribute(auroraColors, 3));
        const auroraMat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
        const aurora = new THREE.Points(auroraGeo, auroraMat);
        scene.add(aurora);
        
        // --- Animate ---
        let time = 0;
        
        function animate() {
            requestAnimationFrame(animate);
            
            time += 0.005;
            
            // Snow fall
            const positions = snow.geometry.attributes.position.array;
            for (let i = 1; i < positions.length; i += 3) {
                positions[i] -= snowVel[Math.floor(i/3)] * 0.5;
                if (positions[i] < -2) {
                    positions[i] = 30;
                    positions[i-1] = (Math.random() - 0.5) * 100;
                    positions[i+1] = (Math.random() - 0.5) * 100;
                }
            }
            snow.geometry.attributes.position.needsUpdate = true;
            
            // Rotate aurora slowly
            aurora.rotation.y += 0.0002;
            
            // Update displays
            const temp = -32 + Math.sin(time * 0.5) * 2;
            document.getElementById('temp-display').innerText = Math.floor(temp) + '°C';
            document.getElementById('ice-depth').innerText = 247 + Math.floor(Math.sin(time) * 5) + 'm';
            document.getElementById('co2').innerText = (284 + Math.sin(time*2)*2).toFixed(0) + ' ppm';
            document.getElementById('solar-wind').innerText = (412 + Math.sin(time*3)*10).toFixed(0) + ' km/s';
            document.getElementById('kp-index').innerText = 'KP ' + (5 + Math.floor(Math.sin(time*0.8)*2));
            
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