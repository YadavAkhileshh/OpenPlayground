// Quantum Singularity – Spacetime Curvature Visualizer
// Advanced 3D Visualization with Comprehensive UI Controls
// Version 2.0 - Enhanced Physics Simulation & User Interface

class QuantumSingularityVisualizer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.gui = null;
        this.stats = null;
        this.clock = new THREE.Clock();

        // Physics parameters
        this.physicsParams = {
            singularityMass: 1.0,
            spinParameter: 0.0,
            charge: 0.0,
            cosmologicalConstant: 0.0,
            gridResolution: 100,
            timeScale: 1.0,
            curvatureScale: 2.0,
            waveAmplitude: 0.5,
            waveFrequency: 2.0,
            gravitationalWaves: true,
            quantumEffects: true,
            hawkingRadiation: false,
            eventHorizon: true,
            photonSphere: true,
            ergosphere: false
        };

        // Visualization parameters
        this.visualParams = {
            wireframeMode: true,
            surfaceMode: false,
            particleMode: false,
            fieldLines: true,
            colorMap: 'viridis',
            opacity: 0.8,
            lighting: true,
            shadows: false,
            antiAliasing: true,
            bloom: false,
            postProcessing: true
        };

        // Animation parameters
        this.animationParams = {
            autoRotate: false,
            rotationSpeed: 0.5,
            timeEvolution: true,
            frameRate: 60,
            paused: false,
            recording: false
        };

        // UI state
        this.uiState = {
            controlPanelVisible: true,
            infoPanelVisible: true,
            performanceMonitorVisible: false,
            fullscreenMode: false,
            theme: 'dark'
        };

        this.initialize();
        this.createUI();
        this.setupEventListeners();
        this.animate();
    }

    initialize() {
        this.initThreeJS();
        this.createSceneObjects();
        this.setupLighting();
        this.setupPostProcessing();
        this.initStats();
    }

    initThreeJS() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = new THREE.Fog(0x000011, 10, 50);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            antialias: this.visualParams.antiAliasing,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = this.visualParams.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        document.getElementById('container').appendChild(this.renderer.domElement);

        // Controls setup
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 50;
        this.controls.maxPolarAngle = Math.PI;
    }

    createSceneObjects() {
        this.createSpacetimeGrid();
        this.createSingularity();
        this.createEventHorizon();
        this.createPhotonSphere();
        this.createErgosphere();
        this.createGravitationalFieldLines();
        this.createQuantumEffects();
        this.createParticleSystem();
    }

    createSpacetimeGrid() {
        const geometry = new THREE.PlaneGeometry(20, 20, this.physicsParams.gridResolution, this.physicsParams.gridResolution);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            wireframe: this.visualParams.wireframeMode,
            transparent: true,
            opacity: this.visualParams.opacity,
            side: THREE.DoubleSide
        });

        this.spacetimeGrid = new THREE.Mesh(geometry, material);
        this.spacetimeGrid.rotation.x = -Math.PI / 2;
        this.scene.add(this.spacetimeGrid);

        // Create surface mesh for alternative visualization
        const surfaceGeometry = new THREE.PlaneGeometry(20, 20, this.physicsParams.gridResolution, this.physicsParams.gridResolution);
        const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: this.visualParams.opacity,
            side: THREE.DoubleSide
        });
        this.spacetimeSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        this.spacetimeSurface.rotation.x = -Math.PI / 2;
        this.spacetimeSurface.visible = this.visualParams.surfaceMode;
        this.scene.add(this.spacetimeSurface);
    }

    createSingularity() {
        const geometry = new THREE.SphereGeometry(0.05, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: false
        });

        this.singularity = new THREE.Mesh(geometry, material);
        this.scene.add(this.singularity);

        // Add accretion disk
        const diskGeometry = new THREE.RingGeometry(0.1, 2, 64);
        const diskMaterial = new THREE.MeshBasicMaterial({
            color: 0xff6600,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6
        });
        this.accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
        this.accretionDisk.rotation.x = -Math.PI / 2;
        this.scene.add(this.accretionDisk);
    }

    createEventHorizon() {
        const geometry = new THREE.SphereGeometry(0.08, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3,
            wireframe: true
        });

        this.eventHorizon = new THREE.Mesh(geometry, material);
        this.eventHorizon.visible = this.physicsParams.eventHorizon;
        this.scene.add(this.eventHorizon);
    }

    createPhotonSphere() {
        const geometry = new THREE.SphereGeometry(0.15, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.2,
            wireframe: true
        });

        this.photonSphere = new THREE.Mesh(geometry, material);
        this.photonSphere.visible = this.physicsParams.photonSphere;
        this.scene.add(this.photonSphere);
    }

    createErgosphere() {
        const geometry = new THREE.SphereGeometry(0.12, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.15,
            wireframe: true
        });

        this.ergosphere = new THREE.Mesh(geometry, material);
        this.ergosphere.visible = this.physicsParams.ergosphere;
        this.scene.add(this.ergosphere);
    }

    createGravitationalFieldLines() {
        this.fieldLines = new THREE.Group();

        for (let i = 0; i < 24; i++) {
            const angle = (i / 24) * Math.PI * 2;
            const radius = 0.2 + Math.random() * 0.3;

            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
                new THREE.Vector3(Math.cos(angle) * (radius + 1), 1, Math.sin(angle) * (radius + 1)),
                new THREE.Vector3(Math.cos(angle) * (radius + 2), 2, Math.sin(angle) * (radius + 2)),
                new THREE.Vector3(Math.cos(angle) * (radius + 3), 3, Math.sin(angle) * (radius + 3))
            ]);

            const geometry = new THREE.TubeGeometry(curve, 50, 0.01, 8, false);
            const material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.6
            });

            const line = new THREE.Mesh(geometry, material);
            this.fieldLines.add(line);
        }

        this.fieldLines.visible = this.visualParams.fieldLines;
        this.scene.add(this.fieldLines);
    }

    createQuantumEffects() {
        // Quantum foam visualization
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];

        for (let i = 0; i < 1000; i++) {
            positions.push(
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2,
                (Math.random() - 0.5) * 0.2
            );
            colors.push(Math.random(), Math.random(), Math.random());
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.02,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.quantumFoam = new THREE.Points(geometry, material);
        this.quantumFoam.visible = this.physicsParams.quantumEffects;
        this.scene.add(this.quantumFoam);
    }

    createParticleSystem() {
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const velocities = [];

        for (let i = 0; i < 500; i++) {
            positions.push(
                (Math.random() - 0.5) * 20,
                Math.random() * 10,
                (Math.random() - 0.5) * 20
            );
            velocities.push(
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1,
                (Math.random() - 0.5) * 0.1
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('velocity', new THREE.Float32BufferAttribute(velocities, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.05,
            transparent: true,
            opacity: 0.6
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.particleSystem.visible = this.visualParams.particleMode;
        this.scene.add(this.particleSystem);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = this.visualParams.shadows;
        this.scene.add(directionalLight);

        // Point light at singularity
        const pointLight = new THREE.PointLight(0xff6600, 1, 10);
        pointLight.position.set(0, 0, 0);
        this.scene.add(pointLight);
    }

    setupPostProcessing() {
        // This would require additional post-processing libraries
        // For now, we'll implement basic effects
        this.composer = null;
        if (this.visualParams.postProcessing) {
            // Initialize post-processing if available
        }
    }

    initStats() {
        // Performance monitoring
        this.stats = {
            fps: 0,
            frameTime: 0,
            memory: 0,
            triangles: 0,
            geometries: 0,
            textures: 0
        };
    }

    createUI() {
        this.createControlPanel();
        this.createInfoPanel();
        this.createPerformanceMonitor();
        this.createThemeSelector();
        this.createExportControls();
    }

    createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'control-panel';
        panel.className = 'ui-panel control-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Physics Controls</h3>
                <button class="toggle-btn" onclick="visualizer.toggleControlPanel()">−</button>
            </div>
            <div class="panel-content">
                <div class="control-group">
                    <label>Singularity Mass: <span id="mass-value">1.0</span></label>
                    <input type="range" id="mass-slider" min="0.1" max="10" step="0.1" value="1.0">
                </div>
                <div class="control-group">
                    <label>Spin Parameter: <span id="spin-value">0.0</span></label>
                    <input type="range" id="spin-slider" min="-1" max="1" step="0.01" value="0.0">
                </div>
                <div class="control-group">
                    <label>Charge: <span id="charge-value">0.0</span></label>
                    <input type="range" id="charge-slider" min="-1" max="1" step="0.01" value="0.0">
                </div>
                <div class="control-group">
                    <label>Cosmological Constant: <span id="cosmo-value">0.0</span></label>
                    <input type="range" id="cosmo-slider" min="-1" max="1" step="0.01" value="0.0">
                </div>
                <div class="control-group">
                    <label>Grid Resolution: <span id="grid-value">100</span></label>
                    <input type="range" id="grid-slider" min="50" max="200" step="10" value="100">
                </div>
                <div class="control-group">
                    <label>Time Scale: <span id="time-value">1.0</span></label>
                    <input type="range" id="time-slider" min="0.1" max="5" step="0.1" value="1.0">
                </div>
                <div class="control-group">
                    <label>Curvature Scale: <span id="curve-value">2.0</span></label>
                    <input type="range" id="curve-slider" min="0.1" max="10" step="0.1" value="2.0">
                </div>
                <div class="control-group">
                    <label>Wave Amplitude: <span id="wave-amp-value">0.5</span></label>
                    <input type="range" id="wave-amp-slider" min="0" max="2" step="0.01" value="0.5">
                </div>
                <div class="control-group">
                    <label>Wave Frequency: <span id="wave-freq-value">2.0</span></label>
                    <input type="range" id="wave-freq-slider" min="0.1" max="10" step="0.1" value="2.0">
                </div>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="grav-waves" checked> Gravitational Waves</label>
                    <label><input type="checkbox" id="quantum-effects"> Quantum Effects</label>
                    <label><input type="checkbox" id="hawking-rad"> Hawking Radiation</label>
                    <label><input type="checkbox" id="event-horizon" checked> Event Horizon</label>
                    <label><input type="checkbox" id="photon-sphere" checked> Photon Sphere</label>
                    <label><input type="checkbox" id="ergosphere"> Ergosphere</label>
                </div>
            </div>
            <div class="panel-header">
                <h3>Visualization</h3>
            </div>
            <div class="panel-content">
                <div class="radio-group">
                    <label><input type="radio" name="viz-mode" value="wireframe" checked> Wireframe</label>
                    <label><input type="radio" name="viz-mode" value="surface"> Surface</label>
                    <label><input type="radio" name="viz-mode" value="particles"> Particles</label>
                </div>
                <div class="control-group">
                    <label>Opacity: <span id="opacity-value">0.8</span></label>
                    <input type="range" id="opacity-slider" min="0.1" max="1" step="0.01" value="0.8">
                </div>
                <div class="select-group">
                    <label>Color Map:</label>
                    <select id="color-map">
                        <option value="viridis">Viridis</option>
                        <option value="plasma">Plasma</option>
                        <option value="inferno">Inferno</option>
                        <option value="magma">Magma</option>
                        <option value="cividis">Cividis</option>
                    </select>
                </div>
                <div class="checkbox-group">
                    <label><input type="checkbox" id="field-lines" checked> Field Lines</label>
                    <label><input type="checkbox" id="lighting" checked> Lighting</label>
                    <label><input type="checkbox" id="shadows"> Shadows</label>
                    <label><input type="checkbox" id="anti-aliasing" checked> Anti-aliasing</label>
                    <label><input type="checkbox" id="bloom"> Bloom</label>
                    <label><input type="checkbox" id="post-processing" checked> Post-processing</label>
                </div>
            </div>
            <div class="panel-header">
                <h3>Animation</h3>
            </div>
            <div class="panel-content">
                <div class="checkbox-group">
                    <label><input type="checkbox" id="auto-rotate"> Auto Rotate</label>
                    <label><input type="checkbox" id="time-evolution" checked> Time Evolution</label>
                </div>
                <div class="control-group">
                    <label>Rotation Speed: <span id="rot-speed-value">0.5</span></label>
                    <input type="range" id="rot-speed-slider" min="0" max="2" step="0.01" value="0.5">
                </div>
                <div class="control-group">
                    <label>Frame Rate: <span id="fps-value">60</span></label>
                    <input type="range" id="fps-slider" min="10" max="120" step="5" value="60">
                </div>
                <div class="button-group">
                    <button id="play-pause-btn" class="btn">Pause</button>
                    <button id="reset-btn" class="btn">Reset</button>
                    <button id="record-btn" class="btn">Record</button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.bindControlEvents();
    }

    createInfoPanel() {
        const panel = document.createElement('div');
        panel.id = 'info-panel';
        panel.className = 'ui-panel info-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Information</h3>
                <button class="toggle-btn" onclick="visualizer.toggleInfoPanel()">−</button>
            </div>
            <div class="panel-content">
                <div class="info-section">
                    <h4>Current Parameters</h4>
                    <div id="current-params"></div>
                </div>
                <div class="info-section">
                    <h4>Physics Explanation</h4>
                    <p id="physics-explanation"></p>
                </div>
                <div class="info-section">
                    <h4>Visualization Mode</h4>
                    <p id="viz-mode-info"></p>
                </div>
                <div class="info-section">
                    <h4>Performance</h4>
                    <div id="performance-info"></div>
                </div>
                <div class="info-section">
                    <h4>Controls</h4>
                    <ul>
                        <li><strong>Mouse:</strong> Orbit camera</li>
                        <li><strong>Scroll:</strong> Zoom in/out</li>
                        <li><strong>Right-click:</strong> Pan</li>
                        <li><strong>Space:</strong> Reset camera</li>
                        <li><strong>F:</strong> Toggle fullscreen</li>
                        <li><strong>P:</strong> Toggle performance monitor</li>
                    </ul>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
    }

    createPerformanceMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'performance-monitor';
        monitor.className = 'ui-panel performance-monitor';
        monitor.style.display = 'none';
        monitor.innerHTML = `
            <div class="panel-header">
                <h3>Performance Monitor</h3>
                <button class="toggle-btn" onclick="visualizer.togglePerformanceMonitor()">×</button>
            </div>
            <div class="panel-content">
                <div class="perf-metric">
                    <span>FPS:</span>
                    <span id="fps-display">60</span>
                </div>
                <div class="perf-metric">
                    <span>Frame Time:</span>
                    <span id="frame-time-display">16.7ms</span>
                </div>
                <div class="perf-metric">
                    <span>Memory:</span>
                    <span id="memory-display">0MB</span>
                </div>
                <div class="perf-metric">
                    <span>Triangles:</span>
                    <span id="triangles-display">0</span>
                </div>
                <div class="perf-metric">
                    <span>Geometries:</span>
                    <span id="geometries-display">0</span>
                </div>
                <div class="perf-metric">
                    <span>Textures:</span>
                    <span id="textures-display">0</span>
                </div>
                <canvas id="fps-chart" width="200" height="100"></canvas>
            </div>
        `;
        document.body.appendChild(monitor);
    }

    createThemeSelector() {
        const selector = document.createElement('div');
        selector.id = 'theme-selector';
        selector.className = 'theme-selector';
        selector.innerHTML = `
            <button class="theme-btn active" data-theme="dark">Dark</button>
            <button class="theme-btn" data-theme="light">Light</button>
            <button class="theme-btn" data-theme="neon">Neon</button>
            <button class="theme-btn" data-theme="matrix">Matrix</button>
        `;
        document.body.appendChild(selector);
        this.bindThemeEvents();
    }

    createExportControls() {
        const controls = document.createElement('div');
        controls.id = 'export-controls';
        controls.className = 'export-controls';
        controls.innerHTML = `
            <button id="screenshot-btn" class="export-btn">📷 Screenshot</button>
            <button id="video-btn" class="export-btn">🎥 Video</button>
            <button id="data-btn" class="export-btn">📊 Export Data</button>
            <button id="settings-btn" class="export-btn">⚙️ Settings</button>
        `;
        document.body.appendChild(controls);
        this.bindExportEvents();
    }

    bindControlEvents() {
        // Physics controls
        this.bindSlider('mass-slider', 'singularityMass', 'mass-value');
        this.bindSlider('spin-slider', 'spinParameter', 'spin-value');
        this.bindSlider('charge-slider', 'charge', 'charge-value');
        this.bindSlider('cosmo-slider', 'cosmologicalConstant', 'cosmo-value');
        this.bindSlider('grid-slider', 'gridResolution', 'grid-value', true);
        this.bindSlider('time-slider', 'timeScale', 'time-value');
        this.bindSlider('curve-slider', 'curvatureScale', 'curve-value');
        this.bindSlider('wave-amp-slider', 'waveAmplitude', 'wave-amp-value');
        this.bindSlider('wave-freq-slider', 'waveFrequency', 'wave-freq-value');

        // Checkboxes
        this.bindCheckbox('grav-waves', 'gravitationalWaves');
        this.bindCheckbox('quantum-effects', 'quantumEffects');
        this.bindCheckbox('hawking-rad', 'hawkingRadiation');
        this.bindCheckbox('event-horizon', 'eventHorizon');
        this.bindCheckbox('photon-sphere', 'photonSphere');
        this.bindCheckbox('ergosphere', 'ergosphere');
        this.bindCheckbox('field-lines', 'fieldLines', 'visualParams');
        this.bindCheckbox('lighting', 'lighting', 'visualParams');
        this.bindCheckbox('shadows', 'shadows', 'visualParams');
        this.bindCheckbox('anti-aliasing', 'antiAliasing', 'visualParams');
        this.bindCheckbox('bloom', 'bloom', 'visualParams');
        this.bindCheckbox('post-processing', 'postProcessing', 'visualParams');

        // Visualization mode
        document.querySelectorAll('input[name="viz-mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setVisualizationMode(e.target.value);
            });
        });

        // Opacity
        this.bindSlider('opacity-slider', 'opacity', 'opacity-value', false, 'visualParams');

        // Color map
        document.getElementById('color-map').addEventListener('change', (e) => {
            this.visualParams.colorMap = e.target.value;
            this.updateColorMap();
        });

        // Animation controls
        this.bindCheckbox('auto-rotate', 'autoRotate', 'animationParams');
        this.bindCheckbox('time-evolution', 'timeEvolution', 'animationParams');
        this.bindSlider('rot-speed-slider', 'rotationSpeed', 'rot-speed-value', false, 'animationParams');
        this.bindSlider('fps-slider', 'frameRate', 'fps-value', false, 'animationParams');

        // Buttons
        document.getElementById('play-pause-btn').addEventListener('click', () => this.toggleAnimation());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetSimulation());
        document.getElementById('record-btn').addEventListener('click', () => this.toggleRecording());
    }

    bindSlider(sliderId, param, valueId, needsUpdate = false, paramGroup = 'physicsParams') {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this[paramGroup][param] = value;
            valueDisplay.textContent = value.toFixed(2);

            if (needsUpdate) {
                this.updateGridResolution();
            }

            this.updateVisualization();
        });
    }

    bindCheckbox(checkboxId, param, paramGroup = 'physicsParams') {
        const checkbox = document.getElementById(checkboxId);
        checkbox.addEventListener('change', (e) => {
            this[paramGroup][param] = e.target.checked;
            this.updateVisualization();
        });
    }

    bindThemeEvents() {
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTheme(e.target.dataset.theme);
            });
        });
    }

    bindExportEvents() {
        document.getElementById('screenshot-btn').addEventListener('click', () => this.takeScreenshot());
        document.getElementById('video-btn').addEventListener('click', () => this.exportVideo());
        document.getElementById('data-btn').addEventListener('click', () => this.exportData());
        document.getElementById('settings-btn').addEventListener('click', () => this.exportSettings());
    }

    setVisualizationMode(mode) {
        this.visualParams.wireframeMode = mode === 'wireframe';
        this.visualParams.surfaceMode = mode === 'surface';
        this.visualParams.particleMode = mode === 'particles';

        this.spacetimeGrid.visible = this.visualParams.wireframeMode;
        this.spacetimeSurface.visible = this.visualParams.surfaceMode;
        this.particleSystem.visible = this.visualParams.particleMode;

        this.updateVisualization();
    }

    updateVisualization() {
        // Update materials
        this.spacetimeGrid.material.wireframe = this.visualParams.wireframeMode;
        this.spacetimeGrid.material.transparent = true;
        this.spacetimeGrid.material.opacity = this.visualParams.opacity;

        this.spacetimeSurface.material.transparent = true;
        this.spacetimeSurface.material.opacity = this.visualParams.opacity;

        // Update visibility
        this.eventHorizon.visible = this.physicsParams.eventHorizon;
        this.photonSphere.visible = this.physicsParams.photonSphere;
        this.ergosphere.visible = this.physicsParams.ergosphere;
        this.fieldLines.visible = this.visualParams.fieldLines;
        this.quantumFoam.visible = this.physicsParams.quantumEffects;

        // Update lighting
        this.scene.children.forEach(child => {
            if (child.isLight) {
                child.visible = this.visualParams.lighting;
            }
        });

        // Update renderer settings
        this.renderer.shadowMap.enabled = this.visualParams.shadows;
        if (this.visualParams.antiAliasing !== this.renderer.getPixelRatio() > 1) {
            // Would need to recreate renderer for anti-aliasing change
        }
    }

    updateColorMap() {
        // Update color mapping based on selected colormap
        // This would require implementing different color schemes
    }

    updateGridResolution() {
        // Recreate grid with new resolution
        this.scene.remove(this.spacetimeGrid);
        this.scene.remove(this.spacetimeSurface);

        const geometry = new THREE.PlaneGeometry(20, 20, this.physicsParams.gridResolution, this.physicsParams.gridResolution);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            wireframe: this.visualParams.wireframeMode,
            transparent: true,
            opacity: this.visualParams.opacity,
            side: THREE.DoubleSide
        });

        this.spacetimeGrid = new THREE.Mesh(geometry, material);
        this.spacetimeGrid.rotation.x = -Math.PI / 2;
        this.scene.add(this.spacetimeGrid);

        const surfaceGeometry = new THREE.PlaneGeometry(20, 20, this.physicsParams.gridResolution, this.physicsParams.gridResolution);
        const surfaceMaterial = new THREE.MeshPhongMaterial({
            color: 0x0088ff,
            transparent: true,
            opacity: this.visualParams.opacity,
            side: THREE.DoubleSide
        });
        this.spacetimeSurface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);
        this.spacetimeSurface.rotation.x = -Math.PI / 2;
        this.spacetimeSurface.visible = this.visualParams.surfaceMode;
        this.scene.add(this.spacetimeSurface);
    }

    toggleAnimation() {
        this.animationParams.paused = !this.animationParams.paused;
        const btn = document.getElementById('play-pause-btn');
        btn.textContent = this.animationParams.paused ? 'Play' : 'Pause';
    }

    resetSimulation() {
        // Reset all parameters to defaults
        this.physicsParams = {
            singularityMass: 1.0,
            spinParameter: 0.0,
            charge: 0.0,
            cosmologicalConstant: 0.0,
            gridResolution: 100,
            timeScale: 1.0,
            curvatureScale: 2.0,
            waveAmplitude: 0.5,
            waveFrequency: 2.0,
            gravitationalWaves: true,
            quantumEffects: true,
            hawkingRadiation: false,
            eventHorizon: true,
            photonSphere: true,
            ergosphere: false
        };

        // Update UI
        this.updateUIFromParams();
        this.updateVisualization();
    }

    toggleRecording() {
        this.animationParams.recording = !this.animationParams.recording;
        const btn = document.getElementById('record-btn');
        btn.textContent = this.animationParams.recording ? 'Stop Recording' : 'Record';
        btn.style.backgroundColor = this.animationParams.recording ? '#ff4444' : '';
    }

    updateUIFromParams() {
        // Update all sliders and checkboxes to match current parameters
        document.getElementById('mass-slider').value = this.physicsParams.singularityMass;
        document.getElementById('mass-value').textContent = this.physicsParams.singularityMass.toFixed(2);
        // ... update all other controls
    }

    setTheme(theme) {
        this.uiState.theme = theme;
        document.body.className = `theme-${theme}`;

        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-theme="${theme}"]`).classList.add('active');

        // Update scene background based on theme
        switch(theme) {
            case 'dark':
                this.scene.background = new THREE.Color(0x000011);
                this.scene.fog = new THREE.Fog(0x000011, 10, 50);
                break;
            case 'light':
                this.scene.background = new THREE.Color(0xffffff);
                this.scene.fog = new THREE.Fog(0xffffff, 10, 50);
                break;
            case 'neon':
                this.scene.background = new THREE.Color(0x000000);
                this.scene.fog = new THREE.Fog(0x000000, 10, 50);
                break;
            case 'matrix':
                this.scene.background = new THREE.Color(0x001100);
                this.scene.fog = new THREE.Fog(0x001100, 10, 50);
                break;
        }
    }

    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        const dataURL = this.renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `spacetime-curvature-${Date.now()}.png`;
        link.href = dataURL;
        link.click();
    }

    exportVideo() {
        // Would implement video recording functionality
        alert('Video export functionality would be implemented here');
    }

    exportData() {
        const data = {
            physicsParams: this.physicsParams,
            visualParams: this.visualParams,
            animationParams: this.animationParams,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const link = document.createElement('a');
        link.download = `spacetime-simulation-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
    }

    exportSettings() {
        // Export current settings as a preset
        this.exportData();
    }

    toggleControlPanel() {
        this.uiState.controlPanelVisible = !this.uiState.controlPanelVisible;
        const panel = document.getElementById('control-panel');
        panel.classList.toggle('collapsed');
    }

    toggleInfoPanel() {
        this.uiState.infoPanelVisible = !this.uiState.infoPanelVisible;
        const panel = document.getElementById('info-panel');
        panel.classList.toggle('collapsed');
    }

    togglePerformanceMonitor() {
        this.uiState.performanceMonitorVisible = !this.uiState.performanceMonitorVisible;
        const monitor = document.getElementById('performance-monitor');
        monitor.style.display = this.uiState.performanceMonitorVisible ? 'block' : 'none';
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.controls.reset();
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
                case 'p':
                case 'P':
                    this.togglePerformanceMonitor();
                    break;
                case 'r':
                case 'R':
                    this.resetSimulation();
                    break;
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Fullscreen change
        document.addEventListener('fullscreenchange', () => {
            this.uiState.fullscreenMode = !!document.fullscreenElement;
        });
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    updateCurvature() {
        const time = this.clock.getElapsedTime() * this.physicsParams.timeScale;

        // Update spacetime grid
        if (this.spacetimeGrid.visible) {
            this.updateSpacetimeGeometry(this.spacetimeGrid.geometry, time);
        }

        if (this.spacetimeSurface.visible) {
            this.updateSpacetimeGeometry(this.spacetimeSurface.geometry, time);
        }

        // Update particle system
        if (this.particleSystem.visible) {
            this.updateParticles(time);
        }

        // Update quantum effects
        if (this.quantumFoam.visible) {
            this.updateQuantumFoam(time);
        }

        // Update accretion disk
        this.accretionDisk.rotation.z += 0.01 * this.physicsParams.timeScale;

        // Update field lines
        if (this.fieldLines.visible) {
            this.fieldLines.rotation.y += 0.005 * this.physicsParams.timeScale;
        }
    }

    updateSpacetimeGeometry(geometry, time) {
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color ? geometry.attributes.color.array : null;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const r = Math.sqrt(x * x + y * y);

            if (r > 0.1) {
                // Advanced spacetime curvature calculation
                const mass = this.physicsParams.singularityMass;
                const spin = this.physicsParams.spinParameter;
                const charge = this.physicsParams.charge;
                const lambda = this.physicsParams.cosmologicalConstant;

                // Kerr-Newman metric approximation
                const rho2 = r * r + spin * spin * Math.cos(y) * Math.cos(y);
                const delta = r * r - 2 * mass * r + spin * spin + charge * charge;

                // Curvature calculation
                let curvature = 0;

                if (delta > 0) {
                    curvature = -mass / r + lambda * r * r / 3;
                } else {
                    curvature = -2; // Inside event horizon
                }

                // Add gravitational waves
                if (this.physicsParams.gravitationalWaves) {
                    curvature += this.physicsParams.waveAmplitude *
                        Math.sin(r * this.physicsParams.waveFrequency - time);
                }

                positions[i + 2] = curvature * this.physicsParams.curvatureScale;

                // Update colors based on curvature
                if (colors) {
                    const intensity = Math.abs(curvature) / 5;
                    const hue = (intensity * 240) % 360; // Blue to red
                    const rgb = this.hslToRgb(hue / 360, 0.8, 0.5);
                    colors[i] = rgb[0] / 255;
                    colors[i + 1] = rgb[1] / 255;
                    colors[i + 2] = rgb[2] / 255;
                }
            } else {
                positions[i + 2] = -2; // Deep well at center
                if (colors) {
                    colors[i] = 1;
                    colors[i + 1] = 0;
                    colors[i + 2] = 0; // Red at singularity
                }
            }
        }

        geometry.attributes.position.needsUpdate = true;
        if (colors) {
            geometry.attributes.color.needsUpdate = true;
        }
        geometry.computeVertexNormals();
    }

    updateParticles(time) {
        const positions = this.particleSystem.geometry.attributes.position.array;
        const velocities = this.particleSystem.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];

            const r = Math.sqrt(x * x + z * z);

            // Gravitational acceleration
            if (r > 0.1) {
                const force = -this.physicsParams.singularityMass / (r * r);
                const ax = force * x / r;
                const az = force * z / r;

                velocities[i] += ax * 0.01;
                velocities[i + 2] += az * 0.01;
            }

            // Update positions
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Boundary conditions
            if (Math.abs(positions[i]) > 15 || Math.abs(positions[i + 2]) > 15) {
                // Reset particle
                positions[i] = (Math.random() - 0.5) * 20;
                positions[i + 1] = Math.random() * 10;
                positions[i + 2] = (Math.random() - 0.5) * 20;
                velocities[i] = (Math.random() - 0.5) * 0.1;
                velocities[i + 1] = (Math.random() - 0.5) * 0.1;
                velocities[i + 2] = (Math.random() - 0.5) * 0.1;
            }
        }

        this.particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    updateQuantumFoam(time) {
        const positions = this.quantumFoam.geometry.attributes.position.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Quantum fluctuations
            positions[i] += (Math.random() - 0.5) * 0.001;
            positions[i + 1] += (Math.random() - 0.5) * 0.001;
            positions[i + 2] += (Math.random() - 0.5) * 0.001;

            // Keep within bounds
            const r = Math.sqrt(positions[i] * positions[i] +
                              positions[i + 1] * positions[i + 1] +
                              positions[i + 2] * positions[i + 2]);

            if (r > 0.1) {
                positions[i] *= 0.1 / r;
                positions[i + 1] *= 0.1 / r;
                positions[i + 2] *= 0.1 / r;
            }
        }

        this.quantumFoam.geometry.attributes.position.needsUpdate = true;
    }

    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    updateInfoPanel() {
        const paramsDiv = document.getElementById('current-params');
        paramsDiv.innerHTML = `
            <p><strong>Mass:</strong> ${this.physicsParams.singularityMass.toFixed(2)} M☉</p>
            <p><strong>Spin:</strong> ${this.physicsParams.spinParameter.toFixed(2)}</p>
            <p><strong>Charge:</strong> ${this.physicsParams.charge.toFixed(2)}</p>
            <p><strong>Λ:</strong> ${this.physicsParams.cosmologicalConstant.toFixed(3)}</p>
            <p><strong>Grid:</strong> ${this.physicsParams.gridResolution}×${this.physicsParams.gridResolution}</p>
        `;

        const explanationDiv = document.getElementById('physics-explanation');
        explanationDiv.innerHTML = this.getPhysicsExplanation();

        const vizDiv = document.getElementById('viz-mode-info');
        vizDiv.innerHTML = this.getVisualizationInfo();

        const perfDiv = document.getElementById('performance-info');
        perfDiv.innerHTML = `
            <p><strong>FPS:</strong> ${this.stats.fps}</p>
            <p><strong>Frame Time:</strong> ${this.stats.frameTime.toFixed(1)}ms</p>
            <p><strong>Memory:</strong> ${this.stats.memory}MB</p>
        `;
    }

    getPhysicsExplanation() {
        if (this.physicsParams.spinParameter === 0 && this.physicsParams.charge === 0) {
            return "This is a Schwarzschild black hole - the simplest type with mass only. Spacetime curves due to gravity, creating an event horizon from which nothing can escape.";
        } else if (this.physicsParams.spinParameter !== 0 && this.physicsParams.charge === 0) {
            return "This is a Kerr black hole - rotating spacetime creates frame-dragging effects and an ergosphere where objects must co-rotate with the black hole.";
        } else if (this.physicsParams.charge !== 0) {
            return "This is a Reissner-Nordström black hole - electromagnetic fields modify the spacetime curvature, potentially creating naked singularities.";
        } else {
            return "This is a Kerr-Newman black hole - the most general type combining mass, spin, and charge. Complex spacetime geometry with unique properties.";
        }
    }

    getVisualizationInfo() {
        if (this.visualParams.wireframeMode) {
            return "Wireframe mode shows the grid structure of spacetime curvature. Blue indicates normal curvature, red shows extreme warping near the singularity.";
        } else if (this.visualParams.surfaceMode) {
            return "Surface mode renders spacetime as a continuous manifold. The height represents gravitational potential, with deeper wells indicating stronger curvature.";
        } else {
            return "Particle mode simulates test particles falling through curved spacetime. Their trajectories reveal the geometry of the gravitational field.";
        }
    }

    updatePerformanceStats() {
        const now = performance.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.frameCount++;
        if (this.frameCount >= 60) {
            this.stats.fps = Math.round(1000 / deltaTime);
            this.stats.frameTime = deltaTime;
            this.frameCount = 0;
        }

        // Update memory info if available
        if (performance.memory) {
            this.stats.memory = Math.round(performance.memory.usedJSHeapSize / 1048576);
        }

        // Update render info
        this.stats.triangles = this.renderer.info.render.triangles;
        this.stats.geometries = this.renderer.info.memory.geometries;
        this.stats.textures = this.renderer.info.memory.textures;

        // Update UI
        document.getElementById('fps-display').textContent = this.stats.fps;
        document.getElementById('frame-time-display').textContent = this.stats.frameTime.toFixed(1) + 'ms';
        document.getElementById('memory-display').textContent = this.stats.memory + 'MB';
        document.getElementById('triangles-display').textContent = this.stats.triangles;
        document.getElementById('geometries-display').textContent = this.stats.geometries;
        document.getElementById('textures-display').textContent = this.stats.textures;
    }

    animate() {
        if (!this.animationParams.paused) {
            requestAnimationFrame(() => this.animate());

            const deltaTime = this.clock.getDelta();

            if (this.animationParams.timeEvolution) {
                this.updateCurvature();
            }

            if (this.animationParams.autoRotate) {
                this.controls.autoRotate = true;
                this.controls.autoRotateSpeed = this.animationParams.rotationSpeed;
            } else {
                this.controls.autoRotate = false;
            }

            this.controls.update();
            this.renderer.render(this.scene, this.camera);

            this.updateInfoPanel();
            this.updatePerformanceStats();
        } else {
            requestAnimationFrame(() => this.animate());
        }
    }
}

// Initialize the visualizer
const visualizer = new QuantumSingularityVisualizer();

// Make visualizer globally available for UI callbacks
window.visualizer = visualizer;