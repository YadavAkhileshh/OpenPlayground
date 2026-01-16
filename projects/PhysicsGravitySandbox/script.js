// Physics Gravity Sandbox Implementation
class PhysicsSandbox {
    constructor() {
        try {
            this.initializeElements();
            this.initializePhysics();
            this.setupEventListeners();
            this.setupScenarios();
            this.initializeCanvas();
            this.startAnimation();
            this.initializeUI();
            console.log("PhysicsSandbox initialized successfully");
        } catch (e) {
            console.error("PhysicsSandbox Initialization Error:", e);
            alert("Error initializing sandbox. Check console.");
        }
    }

    initializeElements() {
        // Canvas elements
        this.canvas = document.getElementById('physicsCanvas');
        this.trailCanvas = document.getElementById('trailCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.trailCtx = this.trailCanvas.getContext('2d');
        this.canvasWrapper = document.querySelector('.canvas-wrapper');

        // Display elements
        this.objectCountEl = document.getElementById('objectCount');
        this.fpsCounterEl = document.getElementById('fpsCounter');

        // Settings Inputs
        this.gravityValueEl = document.getElementById('gravityValue');
        this.airFrictionValueEl = document.getElementById('airFrictionValue');
        this.timeScaleValueEl = document.getElementById('timeScaleValue');

        this.sizeSlider = document.getElementById('sizeSlider');
        this.sizeValueEl = document.getElementById('sizeValue');

        this.densitySlider = document.getElementById('densitySlider');
        this.densityValueEl = document.getElementById('densityValue');
        this.restitutionSlider = document.getElementById('restitutionSlider');
        this.restitutionValueEl = document.getElementById('restitutionValue');
        this.frictionSlider = document.getElementById('frictionSlider');
        this.frictionValueEl = document.getElementById('frictionValue');

        this.gravityStrength = document.getElementById('gravityStrength');
        this.airFriction = document.getElementById('airFriction');
        this.timeScale = document.getElementById('timeScale');

        // Buttons
        this.colorButtons = document.querySelectorAll('.color-btn');
        this.objectTypeButtons = document.querySelectorAll('.object-type-btn');
        this.interactionButtons = document.querySelectorAll('.interaction-btn');
        this.directionButtons = document.querySelectorAll('.direction-btn');
        this.scenarioButtons = document.querySelectorAll('.scenario-pill');

        // Toolbar
        this.clearBtn = document.getElementById('clearBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.playBtn = document.getElementById('playBtn');
        this.randomObjectBtn = document.getElementById('randomObjectBtn');

        // Toggles
        this.toggleGravityBtn = document.getElementById('toggleGravityBtn');
        this.toggleFrictionBtn = document.getElementById('toggleFrictionBtn');
        this.toggleCollisionsBtn = document.getElementById('toggleCollisionsBtn');
        this.showTrailsBtn = document.getElementById('showTrailsBtn');
        this.showGridBtn = document.getElementById('showGridBtn');
        this.showVectorsBtn = document.getElementById('showVectorsBtn');
        this.reverseGravityBtn = document.getElementById('reverseGravityBtn');

        // Inspector
        this.inspectorContent = document.getElementById('inspectorContent');
        this.inspectorPlaceholder = document.getElementById('inspectorPlaceholder');
        this.inspectedName = document.getElementById('inspectedName');
        this.inspectedMass = document.getElementById('inspectedMass');
        this.inspectedSpeed = document.getElementById('inspectedSpeed');
        this.inspectedPosition = document.getElementById('inspectedPosition');
        // Fix: Add inspectedIcon ref if needed, or remove logical dependency.
        // The HTML has id="inspectedIcon", let's use it for color display.
        this.inspectedIcon = document.getElementById('inspectedIcon');
        this.freezeObjectBtn = document.getElementById('freezeObjectBtn');
        this.deleteObjectBtn = document.getElementById('deleteObjectBtn');
        this.inspectorActions = document.getElementById('inspectorActions');

        // Mobile UI Elements
        this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
        this.toggleSettingsBtn = document.getElementById('toggleSettingsBtn');
        this.leftSidebar = document.getElementById('leftSidebar');
        this.rightSidebar = document.getElementById('rightSidebar');
        this.closeLeftSidebar = document.getElementById('closeLeftSidebar');
        this.closeRightSidebar = document.getElementById('closeRightSidebar');

        // Previews
        this.dragPreview = document.getElementById('dragPreview');
        this.velocityPreview = document.getElementById('velocityPreview');

        // Modal
        this.helpModal = document.getElementById('helpModal');
        this.helpBtn = document.getElementById('helpBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.resetAllBtn = document.getElementById('resetAllBtn');
    }

    initializeUI() {
        if (!this.mobileMenuBtn || !this.toggleSettingsBtn) return; // robustness check

        // Close sidebars when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (this.leftSidebar && !this.leftSidebar.contains(e.target) && !this.mobileMenuBtn.contains(e.target) && this.leftSidebar.classList.contains('active')) {
                    this.leftSidebar.classList.remove('active');
                }
                if (this.rightSidebar && !this.rightSidebar.contains(e.target) && !this.toggleSettingsBtn.contains(e.target) && this.rightSidebar.classList.contains('active')) {
                    this.rightSidebar.classList.remove('active');
                }
            }
        });
    }

    initializePhysics() {
        this.objects = [];
        this.constraints = [];
        this.selectedObject = null;
        this.connectStartObject = null;

        this.isPaused = false;
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.lastFpsUpdate = 0;

        // Physics Consts
        this.gravity = { x: 0, y: 9.8 };
        this.enableGravity = true;
        this.enableFriction = true;
        this.enableCollisions = true;
        this.enableBounds = true;

        // Creation Defaults
        this.currentObjectType = 'ball';
        this.currentSize = 30;
        this.currentDensity = 1.0;
        this.currentRestitution = 0.8;
        this.currentFriction = 0.1;
        this.currentColor = '#3b82f6';
        this.currentInteraction = 'create';

        // State
        this.showTrails = true;
        this.showGrid = false;
        this.showVectors = false;
        this.mouse = { x: 0, y: 0, px: 0, py: 0, isDown: false, dragStart: null };
        this.grabbedObject = null;
        this.grabOffset = { x: 0, y: 0 };
        this.dragVelocity = { x: 0, y: 0 };

        this.createInitialObjects();
    }

    initializeCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            // Throttle
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => this.resizeCanvas(), 100);
        });
    }

    resizeCanvas() {
        if (!this.canvasWrapper) return;
        const rect = this.canvasWrapper.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return; // Prevent 0x0 canvas issues

        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.trailCanvas.width = rect.width * dpr;
        this.trailCanvas.height = rect.height * dpr;

        this.ctx.scale(dpr, dpr);
        this.trailCtx.scale(dpr, dpr);

        this.width = rect.width;
        this.height = rect.height;
    }

    createInitialObjects() {
        // Fallback size if resize hasn't run yet
        const w = this.width || 800;
        const h = this.height || 600;
        const cx = w / 2;
        const cy = h / 2;

        this.createBall(cx, cy - 100, 40, 2.0, 0.6, 0.1, '#3b82f6');
        this.createBox(cx - 80, cy + 100, 50, 50, 1.5, 0.7, 0.2, '#f59e0b');
        this.updateObjectCount();
    }

    setupEventListeners() {
        // Canvas Interactions
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Passive false for touch to allow preventDefault preventing scroll
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });

        // UI Inputs
        this.sizeSlider.addEventListener('input', (e) => {
            this.currentSize = parseInt(e.target.value);
            this.sizeValueEl.textContent = this.currentSize;
        });
        this.densitySlider.addEventListener('input', (e) => {
            this.currentDensity = parseFloat(e.target.value);
            this.densityValueEl.textContent = this.currentDensity.toFixed(1);
        });
        this.restitutionSlider.addEventListener('input', (e) => {
            this.currentRestitution = parseFloat(e.target.value);
            this.restitutionValueEl.textContent = this.currentRestitution.toFixed(1);
        });
        this.frictionSlider.addEventListener('input', (e) => {
            this.currentFriction = parseFloat(e.target.value);
            this.frictionValueEl.textContent = this.currentFriction.toFixed(1);
        });

        // Toggles
        this.colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.colorButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentColor = btn.dataset.color;
            });
        });

        this.objectTypeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.objectTypeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentObjectType = btn.dataset.type;
            });
        });

        this.interactionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.interactionButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentInteraction = btn.dataset.mode;
                this.selectedObject = null;
                this.connectStartObject = null;
                this.updateInspector();
            });
        });

        // Physics Settings
        this.gravityStrength.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.gravityValueEl.textContent = val.toFixed(1);
            const currentMag = Math.sqrt(this.gravity.x ** 2 + this.gravity.y ** 2) || 0.1; // avoid divide 0
            this.gravity.x = (this.gravity.x / currentMag) * val;
            this.gravity.y = (this.gravity.y / currentMag) * val;
            if (currentMag < 0.001) this.gravity.y = val;
        });

        this.directionButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const angle = parseInt(btn.dataset.angle) * Math.PI / 180;
                const mag = parseFloat(this.gravityStrength.value);
                this.gravity.x = Math.cos(angle) * mag;
                this.gravity.y = Math.sin(angle) * mag;

                this.directionButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        this.reverseGravityBtn.addEventListener('click', () => {
            this.gravity.x *= -1;
            this.gravity.y *= -1;
        });

        // Sidebar Toggles
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.leftSidebar.classList.toggle('active');
                if (this.rightSidebar) this.rightSidebar.classList.remove('active');
            });
        }
        if (this.toggleSettingsBtn) {
            this.toggleSettingsBtn.addEventListener('click', () => {
                this.rightSidebar.classList.toggle('active');
                if (this.leftSidebar) this.leftSidebar.classList.remove('active');
            });
        }
        if (this.closeLeftSidebar) this.closeLeftSidebar.addEventListener('click', () => this.leftSidebar.classList.remove('active'));
        if (this.closeRightSidebar) this.closeRightSidebar.addEventListener('click', () => this.rightSidebar.classList.remove('active'));

        // Action Buttons
        this.clearBtn.addEventListener('click', () => {
            this.objects = [];
            this.constraints = [];
            this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
            this.updateObjectCount();
            this.selectedObject = null;
            this.updateInspector();
        });

        this.pauseBtn.addEventListener('click', () => {
            this.isPaused = true;
            this.pauseBtn.disabled = true;
            this.playBtn.disabled = false;
        });

        this.playBtn.addEventListener('click', () => {
            this.isPaused = false;
            this.pauseBtn.disabled = false;
            this.playBtn.disabled = true;
        });

        this.randomObjectBtn.addEventListener('click', () => this.createRandomObject());

        this.toggleGravityBtn.addEventListener('click', () => {
            this.enableGravity = !this.enableGravity;
            this.toggleGravityBtn.classList.toggle('active', this.enableGravity);
        });

        this.toggleFrictionBtn.addEventListener('click', () => {
            this.enableFriction = !this.enableFriction;
            this.toggleFrictionBtn.classList.toggle('active', this.enableFriction);
        });

        this.toggleCollisionsBtn.addEventListener('click', () => {
            this.enableCollisions = !this.enableCollisions;
            this.toggleCollisionsBtn.classList.toggle('active', this.enableCollisions);
        });

        this.showTrailsBtn.addEventListener('click', () => {
            this.showTrails = !this.showTrails;
            this.showTrailsBtn.classList.toggle('active', this.showTrails);
            if (!this.showTrails) this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
        });

        this.showGridBtn.addEventListener('click', () => {
            this.showGrid = !this.showGrid;
            this.showGridBtn.classList.toggle('active', this.showGrid);
        });

        this.showVectorsBtn.addEventListener('click', () => {
            this.showVectors = !this.showVectors;
            this.showVectorsBtn.classList.toggle('active', this.showVectors);
        });

        // Scenario Loading
        this.scenarioButtons.forEach(btn => {
            btn.addEventListener('click', () => this.loadScenario(btn.dataset.scenario));
        });

        // Modals & Misc
        this.themeToggle.addEventListener('click', () => document.body.classList.toggle('light-mode'));
        this.helpBtn.addEventListener('click', () => this.helpModal.classList.add('active'));
        if (document.querySelector('.close-modal'))
            document.querySelector('.close-modal').addEventListener('click', () => this.helpModal.classList.remove('active'));
        this.resetAllBtn.addEventListener('click', () => location.reload());

        // Inspector
        this.freezeObjectBtn.addEventListener('click', () => {
            if (this.selectedObject) {
                this.selectedObject.isStatic = !this.selectedObject.isStatic;
                this.selectedObject.velocity = { x: 0, y: 0 };
                this.selectedObject.angularVelocity = 0;
            }
        });

        this.deleteObjectBtn.addEventListener('click', () => {
            if (this.selectedObject) {
                this.objects = this.objects.filter(o => o !== this.selectedObject);
                this.constraints = this.constraints.filter(c => c.bodyA !== this.selectedObject && c.bodyB !== this.selectedObject);
                this.selectedObject = null;
                this.updateInspector();
                this.updateObjectCount();
            }
        });
    }

    setupScenarios() {
        this.scenarios = {
            solar: () => {
                this.enableGravity = false;
                this.createBall(this.width / 2, this.height / 2, 50, 100, 0, 0, '#f59e0b', 0, 0).isStatic = true;
                this.createBall(this.width / 2 + 200, this.height / 2, 20, 1, 0, 0, '#3b82f6', 0, -50);
                this.createBall(this.width / 2 + 350, this.height / 2, 30, 1, 0, 0, '#10b981', 0, -40);
            },
            pendulum: () => {
                this.enableGravity = true;
                this.gravity.y = 9.8;
                const top = this.createBall(this.width / 2, 100, 15, 0, 0, 0, '#94a3b8');
                top.isStatic = true;
                const weight = this.createBall(this.width / 2 + 100, 100, 30, 2, 0.5, 0.1, '#ef4444');
                this.constraints.push({ bodyA: top, bodyB: weight, length: 150, stiffness: 0.1 });
            },
            chain: () => {
                const startX = this.width / 2;
                const startY = 50;
                let prev = this.createBall(startX, startY, 10, 0, 0, 0, '#94a3b8');
                prev.isStatic = true;
                for (let i = 0; i < 8; i++) {
                    const next = this.createBall(startX, startY + (i + 1) * 40, 15, 1, 0.5, 0.1, '#3b82f6');
                    this.constraints.push({ bodyA: prev, bodyB: next, length: 40, stiffness: 1 });
                    prev = next;
                }
            },
            tower: () => {
                this.enableGravity = true;
                const cx = this.width / 2;
                this.createBox(cx, this.height - 10, this.width, 20, 0, 0, 0.5, '#94a3b8').isStatic = true;
                for (let i = 0; i < 6; i++) {
                    this.createBox(cx, this.height - 50 - (i * 60), 60, 60, 1, 0.2, 0.5, `hsl(${i * 40}, 70%, 50%)`);
                }
            },
            collision: () => {
                this.enableGravity = false;
                this.createBall(this.width / 2 - 200, this.height / 2, 40, 5, 1, 0, '#ef4444', 200, 0);
                this.createBall(this.width / 2 + 200, this.height / 2, 40, 5, 1, 0, '#3b82f6', -200, 0);
            },
            chaos: () => {
                this.enableGravity = true;
                for (let i = 0; i < 15; i++) this.createRandomObject();
            }
        };
    }

    loadScenario(name) {
        if (this.scenarios[name]) {
            this.objects = [];
            this.constraints = [];
            this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
            this.enableGravity = true; // Default reset
            this.scenarios[name]();
            this.updateObjectCount();
            this.selectedObject = null;
            this.updateInspector();
        }
    }

    startAnimation() {
        const animate = (timestamp) => {
            const dt = timestamp - this.lastTime;
            this.lastTime = timestamp;

            this.frameCount++;
            if (timestamp - this.lastFpsUpdate >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (timestamp - this.lastFpsUpdate));
                this.fpsCounterEl.textContent = this.fps;
                this.frameCount = 0;
                this.lastFpsUpdate = timestamp;
            }

            if (!this.isPaused) {
                this.updatePhysics(Math.min(dt, 50));
            }

            this.render();
            requestAnimationFrame(animate);
        };
        this.lastTime = performance.now();
        requestAnimationFrame(animate);
    }

    updatePhysics(deltaTime) {
        const steps = 4;
        const subDt = (deltaTime / 1000) * (parseFloat(this.timeScale.value) || 1) / steps;

        for (let s = 0; s < steps; s++) {
            this.objects.forEach(obj => {
                if (obj.isStatic) return;

                if (this.enableGravity) {
                    obj.velocity.x += this.gravity.x * subDt;
                    obj.velocity.y += this.gravity.y * subDt;
                }

                if (this.enableFriction) {
                    const f = 1 - (parseFloat(this.airFriction.value) || 0);
                    obj.velocity.x *= f;
                    obj.velocity.y *= f;
                    obj.angularVelocity *= f;
                }

                obj.x += obj.velocity.x * subDt;
                obj.y += obj.velocity.y * subDt;
                obj.rotation += obj.angularVelocity * subDt;

                if (this.enableBounds) this.handleBounds(obj);
            });

            this.resolveConstraints();

            if (this.enableCollisions) this.resolveCollisions();

            if (this.grabbedObject) {
                const dx = this.mouse.x - this.grabbedObject.x + this.grabOffset.x;
                const dy = this.mouse.y - this.grabbedObject.y + this.grabOffset.y;
                this.grabbedObject.velocity.x = dx * 10;
                this.grabbedObject.velocity.y = dy * 10;
            }
        }
    }

    resolveConstraints() {
        this.constraints.forEach(c => {
            const dx = c.bodyB.x - c.bodyA.x;
            const dy = c.bodyB.y - c.bodyA.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) return;

            const diff = (dist - c.length) / dist;
            const moveX = dx * diff * 0.5 * (c.stiffness || 1);
            const moveY = dy * diff * 0.5 * (c.stiffness || 1);

            if (!c.bodyA.isStatic) {
                c.bodyA.x += moveX;
                c.bodyA.y += moveY;
                c.bodyA.velocity.x += moveX * 10;
                c.bodyA.velocity.y += moveY * 10;
            }
            if (!c.bodyB.isStatic) {
                c.bodyB.x -= moveX;
                c.bodyB.y -= moveY;
                c.bodyB.velocity.x -= moveX * 10;
                c.bodyB.velocity.y -= moveY * 10;
            }
        });
    }

    handleBounds(obj) {
        if (!this.height) return; // robustness
        let bounced = false;

        if (obj.y + obj.radius > this.height) {
            obj.y = this.height - obj.radius;
            obj.velocity.y *= -obj.restitution;
            bounced = true;
        }
        if (obj.y - obj.radius < 0) {
            obj.y = obj.radius;
            obj.velocity.y *= -obj.restitution;
            bounced = true;
        }
        if (obj.x + obj.radius > this.width) {
            obj.x = this.width - obj.radius;
            obj.velocity.x *= -obj.restitution;
            bounced = true;
        }
        if (obj.x - obj.radius < 0) {
            obj.x = obj.radius;
            obj.velocity.x *= -obj.restitution;
            bounced = true;
        }

        if (bounced && this.enableFriction) {
            obj.velocity.x *= (1 - this.currentFriction);
        }
    }

    resolveCollisions() {
        for (let i = 0; i < this.objects.length; i++) {
            for (let j = i + 1; j < this.objects.length; j++) {
                const a = this.objects[i];
                const b = this.objects[j];

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const distSq = dx * dx + dy * dy;
                const radSum = a.radius + b.radius;

                if (distSq < radSum * radSum && distSq > 0) {
                    const dist = Math.sqrt(distSq);
                    const overlap = radSum - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;

                    const totalMass = a.mass + b.mass;
                    const m1 = b.mass / totalMass;
                    const m2 = a.mass / totalMass;

                    if (!a.isStatic) { a.x -= nx * overlap * m1; a.y -= ny * overlap * m1; }
                    if (!b.isStatic) { b.x += nx * overlap * m2; b.y += ny * overlap * m2; }

                    const rvx = b.velocity.x - a.velocity.x;
                    const rvy = b.velocity.y - a.velocity.y;
                    const velAlongNormal = rvx * nx + rvy * ny;

                    if (velAlongNormal > 0) continue;

                    const e = Math.min(a.restitution, b.restitution);
                    let jVal = -(1 + e) * velAlongNormal;
                    jVal /= (1 / a.mass + 1 / b.mass);

                    const impulseX = jVal * nx;
                    const impulseY = jVal * ny;

                    if (!a.isStatic) {
                        a.velocity.x -= impulseX / a.mass;
                        a.velocity.y -= impulseY / a.mass;
                    }
                    if (!b.isStatic) {
                        b.velocity.x += impulseX / b.mass;
                        b.velocity.y += impulseY / b.mass;
                    }
                }
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.showGrid) this.drawGrid();

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#94a3b8';
        this.ctx.lineWidth = 2;
        this.constraints.forEach(c => {
            this.ctx.moveTo(c.bodyA.x, c.bodyA.y);
            this.ctx.lineTo(c.bodyB.x, c.bodyB.y);
        });
        this.ctx.stroke();

        this.objects.forEach(obj => this.drawObject(obj));

        // Connect mode preview
        if (this.currentInteraction === 'connect' && this.connectStartObject) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#fff';
            this.ctx.setLineDash([5, 5]);
            this.ctx.moveTo(this.connectStartObject.x, this.connectStartObject.y);
            this.ctx.lineTo(this.mouse.x, this.mouse.y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Drag Preview
        if (this.mouse.isDown && this.currentInteraction === 'create' && this.mouse.dragStart) {
            this.dragPreview.style.display = 'block';
            this.dragPreview.style.left = (this.mouse.dragStart.x - 50) + 'px';
            this.dragPreview.style.top = (this.mouse.dragStart.y - 50) + 'px';

            const dx = this.mouse.x - this.mouse.dragStart.x;
            const dy = this.mouse.y - this.mouse.dragStart.y;
            if (Math.sqrt(dx * dx + dy * dy) > 10) {
                this.velocityPreview.style.display = 'block';
                this.velocityPreview.style.width = Math.sqrt(dx * dx + dy * dy) + 'px';
                this.velocityPreview.style.transform = `translate(${this.mouse.dragStart.x}px, ${this.mouse.dragStart.y}px) rotate(${Math.atan2(dy, dx)}rad)`;
            } else {
                this.velocityPreview.style.display = 'none';
            }
        } else {
            this.dragPreview.style.display = 'none';
            this.velocityPreview.style.display = 'none';
        }

        if (this.showTrails) {
            this.trailCtx.fillStyle = 'rgba(15, 23, 42, 0.05)';
            if (document.body.classList.contains('light-mode')) this.trailCtx.fillStyle = 'rgba(240, 244, 248, 0.05)';
            this.trailCtx.fillRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
        }
    }

    drawObject(obj) {
        this.ctx.save();
        this.ctx.translate(obj.x, obj.y);
        this.ctx.rotate(obj.rotation);

        this.ctx.shadowBlur = 10;

        // Handle visual gradient
        if (obj.color === 'gradient') {
            const grad = this.ctx.createLinearGradient(-obj.radius, -obj.radius, obj.radius, obj.radius);
            grad.addColorStop(0, '#ef4444');
            grad.addColorStop(0.5, '#f59e0b');
            grad.addColorStop(1, '#3b82f6');
            this.ctx.fillStyle = grad;
            this.ctx.shadowColor = '#f59e0b';
        } else {
            this.ctx.fillStyle = obj.color;
            this.ctx.shadowColor = obj.color;
        }

        if (obj === this.selectedObject || obj === this.connectStartObject) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            if (obj.type === 'box') this.ctx.strokeRect(-obj.width / 2 - 5, -obj.height / 2 - 5, obj.width + 10, obj.height + 10);
            else this.ctx.arc(0, 0, obj.radius + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        switch (obj.type) {
            case 'ball':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
                this.ctx.fill();
                // Shine
                this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
                this.ctx.beginPath();
                this.ctx.arc(-obj.radius * 0.3, -obj.radius * 0.3, obj.radius * 0.2, 0, Math.PI * 2);
                this.ctx.fill();
                break;

            case 'box':
                this.ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
                break;

            case 'polygon':
                this.ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const ang = i * Math.PI / 3;
                    this.ctx.lineTo(Math.cos(ang) * obj.radius, Math.sin(ang) * obj.radius);
                }
                this.ctx.closePath();
                this.ctx.fill();
                break;

            case 'star':
                this.ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const r = i % 2 === 0 ? obj.radius : obj.radius / 2;
                    const ang = i * Math.PI / 5;
                    this.ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
                }
                this.ctx.closePath();
                this.ctx.fill();
                break;
        }

        if (this.showVectors && !obj.isStatic) {
            this.ctx.shadowBlur = 0;
            this.ctx.beginPath();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1;
            this.ctx.moveTo(0, 0);
            this.ctx.lineTo(obj.velocity.x * 0.5, obj.velocity.y * 0.5);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(128,128,128,0.1)';
        this.ctx.lineWidth = 1;
        for (let x = 0; x < this.width; x += 50) {
            this.ctx.beginPath(); this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.height); this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 50) {
            this.ctx.beginPath(); this.ctx.moveTo(0, y); this.ctx.lineTo(this.width, y); this.ctx.stroke();
        }
    }

    getPos(e) {
        if (e.touches) {
            const rect = this.canvasWrapper.getBoundingClientRect();
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        const rect = this.canvasWrapper.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    handleMouseDown(e) {
        this.mouse.isDown = true;
        const pos = this.getPos(e);
        this.mouse.x = pos.x; this.mouse.y = pos.y;
        this.mouse.dragStart = { x: pos.x, y: pos.y };

        const clickedObj = this.getObjectAt(pos.x, pos.y);

        if (this.currentInteraction === 'create') return;

        if (this.currentInteraction === 'grab') {
            if (clickedObj) {
                this.grabbedObject = clickedObj;
                this.grabbedObject.velocity = { x: 0, y: 0 };
                this.grabOffset = { x: this.grabbedObject.x - pos.x, y: this.grabbedObject.y - pos.y };
            }
        } else if (this.currentInteraction === 'delete') {
            if (clickedObj) {
                this.objects = this.objects.filter(o => o !== clickedObj);
                this.constraints = this.constraints.filter(c => c.bodyA !== clickedObj && c.bodyB !== clickedObj);
                this.updateObjectCount();
            }
        } else if (this.currentInteraction === 'connect') {
            if (clickedObj) {
                if (!this.connectStartObject) {
                    this.connectStartObject = clickedObj;
                } else if (this.connectStartObject !== clickedObj) {
                    const dist = Math.sqrt((clickedObj.x - this.connectStartObject.x) ** 2 + (clickedObj.y - this.connectStartObject.y) ** 2);
                    this.constraints.push({
                        bodyA: this.connectStartObject,
                        bodyB: clickedObj,
                        length: dist,
                        stiffness: 0.2
                    });
                    this.connectStartObject = null;
                }
            } else {
                this.connectStartObject = null;
            }
        }

        if (clickedObj && this.currentInteraction !== 'grab') {
            this.selectedObject = clickedObj;
            this.updateInspector();
        }
    }

    handleMouseMove(e) {
        const pos = this.getPos(e);
        this.mouse.x = pos.x; this.mouse.y = pos.y;
    }

    handleMouseUp(e) {
        this.mouse.isDown = false;

        if (this.currentInteraction === 'create' && this.mouse.dragStart) {
            const dx = this.mouse.x - this.mouse.dragStart.x;
            const dy = this.mouse.y - this.mouse.dragStart.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            let vx = 0, vy = 0;
            if (dist > 20) {
                vx = dx * 3;
                vy = dy * 3;
                this.mouse.x = this.mouse.dragStart.x;
                this.mouse.y = this.mouse.dragStart.y;
            }

            this.createObjectAt(this.mouse.x, this.mouse.y, vx, vy);
        }

        this.grabbedObject = null;
        this.mouse.dragStart = null;
    }

    handleTouchStart(e) { if (e.target === this.canvas) e.preventDefault(); this.handleMouseDown(e); }
    handleTouchMove(e) { if (e.target === this.canvas) e.preventDefault(); this.handleMouseMove(e); }
    handleTouchEnd(e) { if (e.target === this.canvas) e.preventDefault(); this.handleMouseUp(e); }

    getObjectAt(x, y) {
        for (let i = this.objects.length - 1; i >= 0; i--) {
            const o = this.objects[i];
            const dist = Math.sqrt((x - o.x) ** 2 + (y - o.y) ** 2);
            if (dist <= o.radius) return o;
        }
        return null;
    }

    createObjectAt(x, y, vx, vy) {
        const props = {
            x, y,
            vx, vy,
            density: this.currentDensity,
            friction: this.currentFriction,
            restitution: this.currentRestitution,
            color: this.currentColor // Store 'gradient' string if selected
        };

        // If random is forced by some legacy logic? No, just user choice.
        // If color is simple string, use it.

        switch (this.currentObjectType) {
            case 'ball': this.createBall(x, y, this.currentSize, props.density, props.restitution, props.friction, props.color, vx, vy); break;
            case 'box': this.createBox(x, y, this.currentSize * 2, this.currentSize * 2, props.density, props.restitution, props.friction, props.color, vx, vy); break;
            case 'polygon':
                const p = this.createBall(x, y, this.currentSize, props.density, props.restitution, props.friction, props.color, vx, vy);
                p.type = 'polygon';
                break;
            case 'star':
                const s = this.createBall(x, y, this.currentSize, props.density, props.restitution, props.friction, props.color, vx, vy);
                s.type = 'star';
                break;
        }
        this.updateObjectCount();
    }

    createBall(x, y, radius, density, restitution, friction, color, vx = 0, vy = 0) {
        const obj = {
            type: 'ball',
            x, y, radius,
            angle: 0, angularVelocity: 0, rotation: 0,
            velocity: { x: vx, y: vy },
            mass: Math.PI * radius * radius * density,
            density, restitution, friction, color,
            isStatic: false
        };
        this.objects.push(obj);
        return obj;
    }

    createBox(x, y, width, height, density, restitution, friction, color, vx = 0, vy = 0) {
        const obj = {
            type: 'box',
            x, y, width, height,
            radius: Math.max(width, height) / 2,
            angle: 0, angularVelocity: 0, rotation: 0,
            velocity: { x: vx, y: vy },
            mass: width * height * density,
            density, restitution, friction, color,
            isStatic: false
        };
        this.objects.push(obj);
        return obj;
    }

    createRandomObject() {
        const x = this.width * 0.1 + Math.random() * this.width * 0.8;
        const y = this.height * 0.1 + Math.random() * this.height * 0.5;
        this.currentObjectType = ['ball', 'box'][Math.floor(Math.random() * 2)];
        this.currentColor = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)];
        this.createObjectAt(x, y, 0, 0);
    }

    getRandomColor() {
        return ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)];
    }

    updateObjectCount() {
        if (this.objectCountEl) this.objectCountEl.textContent = this.objects.length;
    }

    updateInspector() {
        if (!this.selectedObject) {
            this.inspectorContent.querySelectorAll('.inspector-stats p').forEach(el => el.classList.add('hidden'));
            this.inspectorPlaceholder.classList.remove('hidden');
            this.inspectedName.classList.add('hidden');
            this.inspectorActions.classList.add('hidden');
            if (this.inspectedIcon) this.inspectedIcon.style.display = 'none';
            return;
        }

        const o = this.selectedObject;
        this.inspectorPlaceholder.classList.add('hidden');
        this.inspectedName.classList.remove('hidden');
        this.inspectedName.textContent = o.type.toUpperCase();
        this.inspectorActions.classList.remove('hidden');

        this.inspectedMass.parentElement.classList.remove('hidden');
        this.inspectedMass.textContent = Math.round(o.mass);
        this.inspectedSpeed.parentElement.classList.remove('hidden');
        this.inspectedSpeed.textContent = Math.round(Math.sqrt(o.velocity.x ** 2 + o.velocity.y ** 2));
        this.inspectedPosition.parentElement.classList.remove('hidden');
        this.inspectedPosition.textContent = `${Math.round(o.x)}, ${Math.round(o.y)}`;

        if (this.inspectedIcon) {
            this.inspectedIcon.style.display = 'block';
            this.inspectedIcon.style.backgroundColor = o.color === 'gradient' ? 'transparent' : o.color;
            if (o.color === 'gradient') this.inspectedIcon.style.backgroundImage = 'linear-gradient(45deg, #ef4444, #f59e0b, #3b82f6)';
            else this.inspectedIcon.style.backgroundImage = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.game = new PhysicsSandbox();
});