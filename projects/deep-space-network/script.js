        import * as THREE from 'three';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
        import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
        
        // --- Scene setup (dark, deep space) ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x010314);
        
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(25, 8, 35);
        
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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
        controls.autoRotate = false;
        controls.enableZoom = true;
        controls.maxDistance = 70;
        controls.minDistance = 15;
        
        // --- Lighting (subtle) ---
        const ambient = new THREE.AmbientLight(0x202040);
        scene.add(ambient);
        
        const sunLight = new THREE.DirectionalLight(0xffeedd, 1.0);
        sunLight.position.set(15, 20, 10);
        scene.add(sunLight);
        
        const backLight = new THREE.DirectionalLight(0x446688, 0.3);
        backLight.position.set(-15, -5, -15);
        scene.add(backLight);
        
        // --- Starfield (dense) ---
        const starsGeo = new THREE.BufferGeometry();
        const starsCount = 6000;
        const starsPos = new Float32Array(starsCount * 3);
        for (let i = 0; i < starsCount*3; i+=3) {
            const r = 150 + Math.random()*100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2*Math.random() - 1);
            starsPos[i] = Math.sin(phi) * Math.cos(theta) * r;
            starsPos[i+1] = Math.sin(phi) * Math.sin(theta) * r;
            starsPos[i+2] = Math.cos(phi) * r;
        }
        starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.25, transparent: true, opacity: 0.8 });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);
        
        // --- Sun (glowing far away) ---
        const sunGeo = new THREE.SphereGeometry(1.2, 32, 32);
        const sunMat = new THREE.MeshStandardMaterial({ color: 0xffaa55, emissive: 0xff5500, emissiveIntensity: 1.5 });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(-20, 5, 15);
        scene.add(sun);
        
        // Sun glow sprite
        const spriteMap = new THREE.CanvasTexture(generateSprite());
        const spriteMat = new THREE.SpriteMaterial({ map: spriteMap, color: 0xffaa33, blending: THREE.AdditiveBlending });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(4, 4, 1);
        sprite.position.copy(sun.position);
        scene.add(sprite);
        
        function generateSprite() {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            gradient.addColorStop(0, 'rgba(255,200,100,1)');
            gradient.addColorStop(0.4, 'rgba(255,120,30,0.8)');
            gradient.addColorStop(0.6, 'rgba(255,60,0,0.3)');
            gradient.addColorStop(1, 'rgba(255,0,0,0)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 64, 64);
            return canvas;
        }
        
        // --- Earth ---
        const texLoader = new THREE.TextureLoader();
        const earthMap = texLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg');
        const earthSpec = texLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg');
        const earthNorm = texLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg');
        
        const earthGeo = new THREE.SphereGeometry(3, 64, 64);
        const earthMat = new THREE.MeshPhongMaterial({ map: earthMap, specularMap: earthSpec, specular: 0x333333, normalMap: earthNorm });
        const earth = new THREE.Mesh(earthGeo, earthMat);
        earth.position.set(0, 0, 0);
        scene.add(earth);
        
        // Earth cloud layer
        const cloudMap = texLoader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png');
        const cloudGeo = new THREE.SphereGeometry(3.03, 64, 64);
        const cloudMat = new THREE.MeshPhongMaterial({ map: cloudMap, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
        const clouds = new THREE.Mesh(cloudGeo, cloudMat);
        earth.add(clouds); // make child so it moves with earth
        
        // --- Mars (smaller, reddish) ---
        const marsGeo = new THREE.SphereGeometry(1.8, 48, 48);
        const marsMat = new THREE.MeshStandardMaterial({ color: 0xc47e5a, emissive: 0x331100 });
        const mars = new THREE.Mesh(marsGeo, marsMat);
        // Place Mars in orbit position (will be animated)
        scene.add(mars);
        
        // Mars texture (simple color, no map to avoid extra loading)
        
        // --- Probe (spacecraft) ---
        const probeGroup = new THREE.Group();
        
        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.8, 8);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xccccdd, emissive: 0x224466 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI/2;
        probeGroup.add(body);
        
        // Dish antenna
        const dishGeo = new THREE.ConeGeometry(0.8, 0.2, 16);
        const dishMat = new THREE.MeshStandardMaterial({ color: 0xaaaaff, emissive: 0x112233 });
        const dish = new THREE.Mesh(dishGeo, dishMat);
        dish.rotation.x = Math.PI/2;
        dish.position.set(0, 0, 0.6);
        probeGroup.add(dish);
        
        // Solar panels
        const panelGeo = new THREE.BoxGeometry(1.5, 0.1, 0.3);
        const panelMat = new THREE.MeshStandardMaterial({ color: 0x222244 });
        const panelLeft = new THREE.Mesh(panelGeo, panelMat);
        panelLeft.position.set(-1.0, 0, 0);
        probeGroup.add(panelLeft);
        const panelRight = new THREE.Mesh(panelGeo, panelMat);
        panelRight.position.set(1.0, 0, 0);
        probeGroup.add(panelRight);
        
        scene.add(probeGroup);
        
        // Probe label
        const probeDiv = document.createElement('div');
        probeDiv.textContent = '🚀 ODYSSEY-6';
        probeDiv.style.background = '#1a2639';
        probeDiv.style.color = '#ffcc88';
        probeDiv.style.border = '2px solid #ffaa33';
        probeDiv.style.borderRadius = '40px';
        probeDiv.style.padding = '4px 18px';
        probeDiv.style.fontWeight = 'bold';
        probeDiv.style.fontSize = '16px';
        probeDiv.style.boxShadow = '0 0 30px #ffaa33';
        const probeLabel = new CSS2DObject(probeDiv);
        probeLabel.position.set(0, 1.2, 0);
        probeGroup.add(probeLabel);
        
        // --- Trajectory line (Earth to Mars) ---
        const trajectoryPoints = [];
        const steps = 120;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            // Simple elliptical arc for visualization
            const angle = t * Math.PI * 1.3; // goes about 234°
            const r = 7 + 3 * Math.sin(angle * 1.2); // varying radius
            const x = 10 * Math.cos(angle) - 2;
            const z = 8 * Math.sin(angle) + 2;
            const y = 1.5 * Math.sin(angle * 2);
            trajectoryPoints.push(new THREE.Vector3(x, y, z));
        }
        const trajGeo = new THREE.BufferGeometry().setFromPoints(trajectoryPoints);
        const trajMat = new THREE.LineBasicMaterial({ color: 0x88aaff, transparent: true, opacity: 0.25 });
        const trajectoryLine = new THREE.Line(trajGeo, trajMat);
        scene.add(trajectoryLine);
        
        // --- DSN communication link (line from probe to Earth) ---
        const linkGeo = new THREE.BufferGeometry();
        const linkMat = new THREE.LineBasicMaterial({ color: 0xffaa33, transparent: true, opacity: 0.5 });
        const linkLine = new THREE.Line(linkGeo, linkMat);
        scene.add(linkLine);
        
        // --- Asteroid belt / dots for effect? Optional ---
        
        // --- Animation parameters ---
        let t = 0.3; // probe progress along trajectory (0 at Earth, 1 at Mars)
        const speed = 0.0015;
        
        // Mars orbit (circular around sun? But we keep relative to Earth for simplicity)
        let marsAngle = 0;
        
        function updatePositions() {
            t += speed;
            if (t > 1.0) t = 0.0; // loop
            
            // Probe position along trajectory
            const index = Math.floor(t * steps);
            const frac = (t * steps) - index;
            
            let p1, p2;
            if (index < steps) {
                p1 = trajectoryPoints[index];
                p2 = trajectoryPoints[index+1];
            } else {
                p1 = trajectoryPoints[steps-1];
                p2 = trajectoryPoints[steps];
            }
            
            if (p1 && p2) {
                const pos = new THREE.Vector3().lerpVectors(p1, p2, frac);
                probeGroup.position.copy(pos);
            }
            
            // Mars position (simple orbit)
            marsAngle += 0.002;
            const marsOrbitRadius = 12;
            mars.position.set(
                marsOrbitRadius * Math.cos(marsAngle + 2.0),
                1.2 * Math.sin(marsAngle * 1.3),
                marsOrbitRadius * Math.sin(marsAngle + 1.5)
            );
            
            // Update DSN link line (from probe to Earth)
            const points = [probeGroup.position.clone(), earth.position.clone()];
            linkLine.geometry.dispose();
            linkLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            // Update distance display
            const dist = probeGroup.position.distanceTo(earth.position) * 5.0; // scale for dramatic effect
            const distMillions = (dist * 10).toFixed(1);
            document.getElementById('distance-display').innerText = distMillions;
            
            // Light time (approx 3.3 min per million km? Actually light travels 300k km/s, so 1M km = 3.33s)
            const lightSeconds = dist * 5.56; // rough scaling
            const mins = Math.floor(lightSeconds / 60);
            const secs = Math.floor(lightSeconds % 60);
            document.getElementById('light-time').innerText = `${mins}m ${secs}s`;
        }
        
        // --- Animate ---
        function animate() {
            requestAnimationFrame(animate);
            
            updatePositions();
            
            // Rotate Earth and clouds
            earth.rotation.y += 0.001;
            
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        }
        
        animate();
        
        // --- Resize ---
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            labelRenderer.setSize(window.innerWidth, window.innerHeight);
        });