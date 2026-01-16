// --- SETTINGS ---
    const HOOP_POS = { x: 0, y: 12.0, z: 5.0 }; 
    
    // UPDATE 1: Tight Ring Radius (Ball is 0.5)
    // 0.7 gives 0.2 clearance total diameter-wise, very pro-like.
    const RING_RADIUS = 0.75; 
    const BALL_RADIUS = 0.5;
    
    const PRAISE_PHRASES = ["Perfect!", "Swish!", "On Fire!", "Master!", "Bucket!", "Clean!", "Wow!"];

    // Global variables
    let scene, camera, renderer, world, controls;
    let currentBall = null;
    let activeBalls = [];
    let aimLine;
    let netParticles = [];
    let netLinesGeo;
    let score = 0; 
    
    // Timer
    let startTime;
    let timerInterval;
    
    // Input state
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Camera Animation
    let isCameraAnimating = false;
    const cameraTargetPos = new THREE.Vector3();
    const controlsTargetPos = new THREE.Vector3();

    let physMaterial, netMaterial;

    init();
    animate();
    startTimer();

    function init() {
        // 1. SCENE & FOG
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x202020);
        scene.fog = new THREE.Fog(0x202020, 20, 60);

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 10, 25); 

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(renderer.domElement);

        // 2. CONTROLS
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5;
        controls.maxDistance = 50;
        controls.maxPolarAngle = Math.PI / 2 - 0.05; 
        controls.enablePan = false; 
        controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN, 
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };

        // 3. LIGHTS
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
        scene.add(hemiLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(10, 25, 20); 
        dirLight.castShadow = true; 
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.camera.left = -30;
        dirLight.shadow.camera.right = 30;
        dirLight.shadow.camera.top = 30;
        dirLight.shadow.camera.bottom = -30;
        scene.add(dirLight);

        // 4. PHYSICS
        world = new CANNON.World();
        world.gravity.set(0, -20, 0);
        world.broadphase = new CANNON.SAPBroadphase(world);
        world.solver.iterations = 50; 

        physMaterial = new CANNON.Material("phys");
        netMaterial = new CANNON.Material("net");
        
        const contactMat = new CANNON.ContactMaterial(physMaterial, physMaterial, {
            friction: 0.1,
            restitution: 0.6
        });
        
        const netContact = new CANNON.ContactMaterial(physMaterial, netMaterial, {
            friction: 0.01,
            restitution: 0.0
        });
        
        world.addContactMaterial(contactMat);
        world.addContactMaterial(netContact);

        // 5. OBJECTS
        
        // Infinite Floor
        const floorGeo = new THREE.PlaneGeometry(2000, 2000); 
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.8 });
        const floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        const floorBody = new CANNON.Body({ mass: 0, material: physMaterial });
        floorBody.addShape(new CANNON.Plane());
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);
        world.addBody(floorBody);

        // Backboard
        const boardW = 3.6;
        const boardH = 2.6;
        const boardD = 0.1;
        const boardMesh = new THREE.Mesh(
            new THREE.BoxGeometry(boardW, boardH, boardD),
            new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 })
        );
        boardMesh.position.set(0, HOOP_POS.y + 1.3, HOOP_POS.z - 1.2);
        boardMesh.castShadow = true;
        boardMesh.receiveShadow = true; 
        scene.add(boardMesh);

        const boardBody = new CANNON.Body({ mass: 0, material: physMaterial });
        boardBody.addShape(new CANNON.Box(new CANNON.Vec3(boardW/2, boardH/2, boardD/2)));
        boardBody.position.copy(boardMesh.position);
        world.addBody(boardBody);

        // Ring
        const ringMesh = new THREE.Mesh(
            new THREE.TorusGeometry(RING_RADIUS, 0.05, 16, 32),
            new THREE.MeshStandardMaterial({ color: 0xff0000 })
        );
        ringMesh.position.set(0, HOOP_POS.y, HOOP_POS.z);
        ringMesh.rotation.x = Math.PI / 2;
        ringMesh.castShadow = true;
        ringMesh.receiveShadow = true;
        scene.add(ringMesh);

        createPhysicalRing(HOOP_POS.y, HOOP_POS.z, RING_RADIUS, physMaterial);
        createNet(0, HOOP_POS.y, HOOP_POS.z, RING_RADIUS);

        // Aim Line
        const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
        aimLine = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ 
            color: 0xffff00, 
            linewidth: 4,
            depthTest: false,
            depthWrite: false
        }));
        aimLine.renderOrder = 999;
        scene.add(aimLine);

        spawnNewBall();

        // Listeners
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('resize', onResize);
        window.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    // --- TIMER LOGIC ---
    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - startTime) / 1000);
            
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            
            const mStr = minutes.toString().padStart(2, '0');
            const sStr = seconds.toString().padStart(2, '0');
            
            document.getElementById('timer').innerText = `${mStr}:${sStr}`;
        }, 1000);
    }

    // --- GAME LOGIC ---

    function spawnNewBall() {
        const randX = (Math.random() - 0.5) * 12; 
        const randY = 8 + Math.random() * 4; 
        const randZ = 8 + Math.random() * 6; 
        const spawnPos = new THREE.Vector3(randX, randY, randZ);

        // Visual
        const ballGeo = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
        const ballMat = new THREE.MeshStandardMaterial({ color: 0xff8800, roughness: 0.4 });
        const mesh = new THREE.Mesh(ballGeo, ballMat);
        mesh.castShadow = true; 
        
        // Lines
        const wire = new THREE.Mesh(
            new THREE.SphereGeometry(BALL_RADIUS + 0.01, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true, transparent: true, opacity: 0.2 })
        );
        mesh.add(wire);
        
        // Hitbox
        const hitGeo = new THREE.SphereGeometry(BALL_RADIUS * 3.0, 16, 16);
        const hitMat = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.0 });
        const hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData.isHitbox = true; 
        mesh.add(hitMesh);

        scene.add(mesh);

        // Physics
        const body = new CANNON.Body({
            mass: 0.6,
            shape: new CANNON.Sphere(BALL_RADIUS),
            material: physMaterial
        });
        body.linearDamping = 0.1;
        body.position.copy(spawnPos);
        body.type = CANNON.Body.STATIC; 
        
        body.collisionFilterGroup = 1;
        body.collisionFilterMask = 1 | 2; 

        mesh.position.copy(body.position);
        world.addBody(body);

        currentBall = { 
            mesh: mesh, 
            body: body, 
            scored: false, 
            enteredRim: false 
        };

        setCameraTarget(spawnPos);
    }

    function setCameraTarget(ballPos) {
        const hoopPosXZ = new THREE.Vector3(HOOP_POS.x, 0, HOOP_POS.z);
        const ballPosXZ = new THREE.Vector3(ballPos.x, 0, ballPos.z);
        const direction = new THREE.Vector3().subVectors(ballPosXZ, hoopPosXZ).normalize();
        
        const cameraDistance = 11; 
        cameraTargetPos.copy(ballPos).add(direction.multiplyScalar(cameraDistance));
        cameraTargetPos.y = ballPos.y + 1.5; 

        controlsTargetPos.set(HOOP_POS.x, HOOP_POS.y - 4, HOOP_POS.z);
        isCameraAnimating = true;
    }

    function throwBall(dragVector) {
        if (!currentBall) return;
        const b = currentBall;
        
        b.body.type = CANNON.Body.DYNAMIC;
        b.body.wakeUp();

        const camDir = new THREE.Vector3();
        camera.getWorldDirection(camDir);
        camDir.y = 0; 
        camDir.normalize();
        const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

const forwardForce = 6 + (dragVector.y * 0.025); 

const upForce = 11 + (dragVector.y * 0.030);
        const sideForce = dragVector.x * 0.04; 

        const velocity = new THREE.Vector3()
            .add(camDir.multiplyScalar(forwardForce))
            .add(camRight.multiplyScalar(sideForce));
            
        b.body.velocity.set(velocity.x, upForce, velocity.z);
        b.body.angularVelocity.set(-Math.random()*10, 0, (Math.random()-0.5)*5);

        activeBalls.push(b);
        currentBall = null; 
        
        controls.enabled = true; 
        
        setTimeout(() => {
            spawnNewBall();
        }, 2000);
    }

    function updateScoreDisplay() {
        document.getElementById('scoreboard').innerText = "TOTAL: " + score;
    }

    function showPraise() {
        const el = document.getElementById('score-msg');
        el.innerText = PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
        el.classList.add('pop-up');
        setTimeout(() => { el.classList.remove('pop-up'); }, 1500);
    }

    function checkGoals() {
        for (let ball of activeBalls) {
            if (ball.scored) continue; 

            const bPos = ball.mesh.position;
            const dist = Math.sqrt(Math.pow(bPos.x - HOOP_POS.x, 2) + Math.pow(bPos.z - HOOP_POS.z, 2));

            // Stricter check: RING_RADIUS is 0.7, so we check < 0.65 to ensure it's "in"
            if (dist < RING_RADIUS * 0.9) {
                if (bPos.y > HOOP_POS.y) {
                    ball.enteredRim = true;
                }
                
                if (bPos.y < HOOP_POS.y && bPos.y > HOOP_POS.y - 1.0 && ball.enteredRim) {
                    ball.scored = true;
                    score += 3;
                    updateScoreDisplay();
                    
                    setTimeout(() => {
                        showPraise();
                    }, 1000);
                }
            }
        }
    }

    // --- PHYSICS SETUP ---

    function createPhysicalRing(y, z, radius, mat) {
        const segments = 16;
        const step = (Math.PI * 2) / segments;
        for(let i=0; i<segments; i++) {
            const angle = step * i;
            const x = Math.cos(angle) * radius;
            const localZ = Math.sin(angle) * radius;
            const b = new CANNON.Body({ mass: 0, material: mat });
            b.addShape(new CANNON.Box(new CANNON.Vec3(0.04, 0.04, 0.1))); 
            b.position.set(x, y, z + localZ);
            b.quaternion.setFromAxisAngle(new CANNON.Vec3(0,1,0), -angle);
            world.addBody(b);
        }
    }

    function createNet(cx, cy, cz, radius) {
        const cols = 14; 
        const rows = 6;
        netParticles = [];
        
        // UPDATE 2: Tighter Net
        // Ring is 0.7 radius. Ball is 0.5 radius.
        const startRad = radius * 0.95; // ~0.665 at top
        
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const angle = (c/cols) * Math.PI * 2;
                
                // Taper Logic:
                // Row 0: ~0.665
                // Row 5: 0.665 - (5 * 0.02) = 0.565
                // Ball is 0.5. Clearance is tiny (~0.06). Realism!
                const curRad = startRad - (r * 0.065); 
                
                const px = cx + Math.cos(angle) * curRad;
                const py = cy - (r * 0.25); 
                const pz = cz + Math.sin(angle) * curRad;

                const mass = (r === 0) ? 0 : 0.03; 
                const shape = new CANNON.Sphere(0.08); 
                const b = new CANNON.Body({ 
                    mass: mass, 
                    shape: shape, 
                    material: netMaterial, 
                    linearDamping: 0.05 
                });
                b.position.set(px, py, pz);
                b.collisionFilterGroup = 2; 
                b.collisionFilterMask = 1; 
                world.addBody(b);
                netParticles.push(b);
            }
        }

        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const idx = r*cols + c;
                const body = netParticles[idx];
                const nextCol = (c+1)%cols;
                const rightBody = netParticles[r*cols + nextCol];
                world.addConstraint(new CANNON.DistanceConstraint(body, rightBody, body.position.distanceTo(rightBody.position)));
                if(r < rows-1) {
                    const downBody = netParticles[(r+1)*cols + c];
                    world.addConstraint(new CANNON.DistanceConstraint(body, downBody, body.position.distanceTo(downBody.position)));
                }
            }
        }
        
        const positions = new Float32Array(rows * cols * 2 * 2 * 3);
        netLinesGeo = new THREE.BufferGeometry();
        netLinesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const netMesh = new THREE.LineSegments(
            netLinesGeo, 
            new THREE.LineBasicMaterial({ color: 0xeeeeee, opacity: 0.7, transparent: true })
        );
        scene.add(netMesh);
    }

    function updateNet() {
        if(!netLinesGeo) return;
        const pos = netLinesGeo.attributes.position.array;
        const cols = 14; const rows = 6;
        let ptr = 0;
        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const b = netParticles[r*cols + c];
                const rb = netParticles[r*cols + ((c+1)%cols)];
                pos[ptr++] = b.position.x; pos[ptr++] = b.position.y; pos[ptr++] = b.position.z;
                pos[ptr++] = rb.position.x; pos[ptr++] = rb.position.y; pos[ptr++] = rb.position.z;
                if(r < rows-1) {
                    const db = netParticles[(r+1)*cols + c];
                    pos[ptr++] = b.position.x; pos[ptr++] = b.position.y; pos[ptr++] = b.position.z;
                    pos[ptr++] = db.position.x; pos[ptr++] = db.position.y; pos[ptr++] = db.position.z;
                }
            }
        }
        netLinesGeo.attributes.position.needsUpdate = true;
    }

    // --- INPUT HANDLING ---

    function onMove(e) {
        if (!currentBall) return;
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        if (isDragging) {
            const dx = (e.clientX - dragStart.x);
            const dy = (e.clientY - dragStart.y);
            const start = currentBall.mesh.position;
            const endX = start.x + dx * 0.01;
            const endY = start.y - dy * 0.01;
            const pos = aimLine.geometry.attributes.position.array;
            pos[0] = start.x; pos[1] = start.y; pos[2] = start.z;
            pos[3] = endX;    pos[4] = endY;    pos[5] = start.z; 
            aimLine.geometry.attributes.position.needsUpdate = true;
            aimLine.visible = true;
        } else {
            const intersects = raycaster.intersectObject(currentBall.mesh, true);
            if (intersects.length > 0) {
                document.body.style.cursor = 'pointer';
                controls.enabled = false; 
            } else {
                document.body.style.cursor = 'default';
                if (!isDragging) {
                    controls.enabled = true;
                }
            }
        }
    }

    function onDown(e) {
        if (e.button !== 0) return; 
        
        if (controls.enabled === false && currentBall) {
            isDragging = true;
            dragStart.x = e.clientX;
            dragStart.y = e.clientY;
            document.body.style.cursor = 'grabbing';
        }
    }

    function onUp(e) {
        if (isDragging && e.button === 0) {
            isDragging = false;
            aimLine.visible = false;
            document.body.style.cursor = 'default';

            const dy = e.clientY - dragStart.y;
            const dx = dragStart.x - e.clientX; 
            
            if (dy > 0) {
                throwBall({ x: dx, y: dy });
            } else {
                controls.enabled = true; 
            }
        }
    }

    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        world.step(1/60);
        
        if (isCameraAnimating) {
            camera.position.lerp(cameraTargetPos, 0.05);
            controls.target.lerp(controlsTargetPos, 0.05);
            controls.update();
            if (camera.position.distanceTo(cameraTargetPos) < 0.1) {
                isCameraAnimating = false;
            }
        } else {
            controls.update();
        }

        if (currentBall) {
            currentBall.mesh.position.copy(currentBall.body.position);
        }

        for (let i = activeBalls.length - 1; i >= 0; i--) {
            const b = activeBalls[i];
            b.mesh.position.copy(b.body.position);
            b.mesh.quaternion.copy(b.body.quaternion);
            if (b.mesh.position.y < -15) {
                scene.remove(b.mesh);
                world.removeBody(b.body);
                activeBalls.splice(i, 1);
            }
        }

        checkGoals(); 
        updateNet();  
        renderer.render(scene, camera);
    }