// Physics Sandbox Playground - Main Script
// Using Matter.js physics engine

// Matter.js module aliases
const { Engine, Render, Runner, Bodies, Body, Composite, Mouse, MouseConstraint, Events, Vector, Vertices, Common } = Matter;

// Global variables
let engine, render, runner;
let canvas, ctx;
let currentTool = 'circle';
let isPaused = false;
let showGrid = false;
let showVectors = false;
let objectColor = '#3b82f6';
let isStatic = false;
let polygonVertices = [];
let isCreatingPolygon = false;

// DOM Elements
const elements = {
    canvas: null,
    objectCount: document.getElementById('objectCount'),
    fpsCounter: document.getElementById('fpsCounter'),
    gravitySlider: document.getElementById('gravitySlider'),
    gravityValue: document.getElementById('gravityValue'),
    frictionSlider: document.getElementById('frictionSlider'),
    frictionValue: document.getElementById('frictionValue'),
    restitutionSlider: document.getElementById('restitutionSlider'),
    restitutionValue: document.getElementById('restitutionValue'),
    timeScaleSlider: document.getElementById('timeScaleSlider'),
    timeScaleValue: document.getElementById('timeScaleValue'),
    densitySlider: document.getElementById('densitySlider'),
    densityValue: document.getElementById('densityValue'),
    colorPicker: document.getElementById('colorPicker'),
    staticCheckbox: document.getElementById('staticCheckbox'),
    toolButtons: document.querySelectorAll('.tool-btn'),
    helpModal: document.getElementById('helpModal'),
    closeBtn: document.querySelector('.close')
};

// Initialize the physics simulation
function init() {
    canvas = document.getElementById('physicsCanvas');
    const container = canvas.parentElement;
    
    // Set canvas size
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Create engine
    engine = Engine.create({
        gravity: { x: 0, y: 1 }
    });
    
    // Create renderer
    render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,
            background: 'transparent',
            pixelRatio: window.devicePixelRatio
        }
    });
    
    // Create walls (ground, left, right walls)
    createWalls();
    
    // Add mouse control
    addMouseControl();
    
    // Start the simulation
    runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);
    
    // Set up rendering for grid and vectors
    Events.on(render, 'afterRender', customRender);
    
    // Set up event listeners
    setupEventListeners();
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Update stats
    updateStats();
    setInterval(updateStats, 500);
}

// Create boundary walls
function createWalls() {
    const wallThickness = 60;
    const width = canvas.width;
    const height = canvas.height;
    
    const walls = [
        // Ground
        Bodies.rectangle(width / 2, height + wallThickness / 2 - 10, width + 200, wallThickness, { 
            isStatic: true,
            render: { fillStyle: '#334155' },
            label: 'wall'
        }),
        // Left wall
        Bodies.rectangle(-wallThickness / 2, height / 2, wallThickness, height + 200, { 
            isStatic: true,
            render: { fillStyle: '#334155' },
            label: 'wall'
        }),
        // Right wall
        Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height + 200, { 
            isStatic: true,
            render: { fillStyle: '#334155' },
            label: 'wall'
        })
    ];
    
    Composite.add(engine.world, walls);
}

// Add mouse control for dragging objects
function addMouseControl() {
    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: {
                visible: false
            }
        }
    });
    
    Composite.add(engine.world, mouseConstraint);
    
    // Track mouse events for object creation
    let isDragging = false;
    let startPoint = null;
    let previewBody = null;
    
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0 && !mouseConstraint.body) {
            isDragging = true;
            startPoint = { x: e.offsetX, y: e.offsetY };
            
            if (currentTool === 'polygon') {
                handlePolygonClick(e);
            } else if (currentTool === 'random') {
                createRandomObject(e.offsetX, e.offsetY);
            }
        }
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (isDragging && startPoint && currentTool !== 'polygon' && currentTool !== 'random') {
            // Preview object while dragging
            const endPoint = { x: e.offsetX, y: e.offsetY };
            if (previewBody) {
                Composite.remove(engine.world, previewBody);
            }
            previewBody = createPreviewObject(startPoint, endPoint, currentTool);
            if (previewBody) {
                Composite.add(engine.world, previewBody);
            }
        }
    });
    
    canvas.addEventListener('mouseup', (e) => {
        if (isDragging && startPoint && currentTool !== 'polygon' && currentTool !== 'random') {
            const endPoint = { x: e.offsetX, y: e.offsetY };
            
            // Remove preview
            if (previewBody) {
                Composite.remove(engine.world, previewBody);
                previewBody = null;
            }
            
            // Create the actual object
            createObject(startPoint, endPoint, currentTool);
        }
        isDragging = false;
        startPoint = null;
    });
    
    // Right click to delete
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const bodies = Composite.allBodies(engine.world);
        const mousePos = { x: e.offsetX, y: e.offsetY };
        
        for (const body of bodies) {
            if (body.label !== 'wall' && Matter.Bounds.contains(body.bounds, mousePos)) {
                if (Matter.Vertices.contains(body.vertices, mousePos)) {
                    Composite.remove(engine.world, body);
                    break;
                }
            }
        }
    });
}

// Handle polygon creation clicks
function handlePolygonClick(e) {
    const point = { x: e.offsetX, y: e.offsetY };
    
    if (e.detail === 2) {
        // Double click - complete polygon
        if (polygonVertices.length >= 3) {
            createPolygon(polygonVertices);
        }
        polygonVertices = [];
        isCreatingPolygon = false;
    } else {
        // Single click - add vertex
        polygonVertices.push(point);
        isCreatingPolygon = true;
    }
}

// Create preview object while dragging
function createPreviewObject(start, end, tool) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const size = Math.max(width, height);
    
    let body;
    const options = {
        isStatic: isStatic,
        render: {
            fillStyle: objectColor + '80',
            strokeStyle: objectColor,
            lineWidth: 2
        }
    };
    
    if (tool === 'circle') {
        body = Bodies.circle(centerX, centerY, size / 2, options);
    } else if (tool === 'rectangle') {
        body = Bodies.rectangle(centerX, centerY, width, height, options);
    }
    
    if (body) {
        body.isPreview = true;
    }
    
    return body;
}

// Create object from drag
function createObject(start, end, tool) {
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    const size = Math.max(width, height, 20);
    
    const options = {
        isStatic: isStatic,
        friction: parseFloat(elements.frictionSlider.value),
        restitution: parseFloat(elements.restitutionSlider.value),
        density: parseFloat(elements.densitySlider.value),
        render: {
            fillStyle: objectColor
        }
    };
    
    let body;
    
    if (tool === 'circle') {
        body = Bodies.circle(centerX, centerY, size / 2, options);
    } else if (tool === 'rectangle') {
        body = Bodies.rectangle(centerX, centerY, Math.max(width, 20), Math.max(height, 20), options);
    }
    
    if (body) {
        Composite.add(engine.world, body);
    }
}

// Create polygon from vertices
function createPolygon(vertices) {
    if (vertices.length < 3) return;
    
    const center = Matter.Vertices.centre(vertices);
    
    const options = {
        isStatic: isStatic,
        friction: parseFloat(elements.frictionSlider.value),
        restitution: parseFloat(elements.restitutionSlider.value),
        density: parseFloat(elements.densitySlider.value),
        render: {
            fillStyle: objectColor
        }
    };
    
    const body = Bodies.fromVertices(center.x, center.y, [vertices], options);
    
    if (body) {
        Composite.add(engine.world, body);
    }
}

// Create random object
function createRandomObject(x, y) {
    const types = ['circle', 'rectangle', 'polygon'];
    const type = types[Math.floor(Math.random() * types.length)];
    const size = 20 + Math.random() * 40;
    const color = getRandomColor();
    
    const options = {
        isStatic: isStatic,
        friction: parseFloat(elements.frictionSlider.value),
        restitution: parseFloat(elements.restitutionSlider.value),
        density: parseFloat(elements.densitySlider.value),
        render: {
            fillStyle: color
        }
    };
    
    let body;
    
    if (type === 'circle') {
        body = Bodies.circle(x, y, size / 2, options);
    } else if (type === 'rectangle') {
        body = Bodies.rectangle(x, y, size, size * 0.8, options);
    } else {
        // Create random polygon
        const sides = 5 + Math.floor(Math.random() * 4);
        const vertices = [];
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const radius = size / 2 * (0.7 + Math.random() * 0.3);
            vertices.push({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius
            });
        }
        body = Bodies.fromVertices(x, y, [vertices], options);
    }
    
    if (body) {
        Composite.add(engine.world, body);
    }
}

// Get random bright color
function getRandomColor() {
    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Custom render (grid, vectors, polygon preview)
function customRender() {
    ctx = render.context;
    
    // Draw grid
    if (showGrid) {
        drawGrid();
    }
    
    // Draw velocity vectors
    if (showVectors) {
        drawVelocityVectors();
    }
    
    // Draw polygon preview
    if (isCreatingPolygon && polygonVertices.length > 0) {
        drawPolygonPreview();
    }
}

// Draw grid
function drawGrid() {
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Draw velocity vectors
function drawVelocityVectors() {
    const bodies = Composite.allBodies(engine.world);
    
    for (const body of bodies) {
        if (body.label === 'wall' || body.isStatic) continue;
        
        const scale = 5;
        const startX = body.position.x;
        const startY = body.position.y;
        const endX = startX + body.velocity.x * scale;
        const endY = startY + body.velocity.y * scale;
        
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(body.velocity.y, body.velocity.x);
        const arrowSize = 8;
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle - Math.PI / 6),
            endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
            endX - arrowSize * Math.cos(angle + Math.PI / 6),
            endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }
}

// Draw polygon preview
function drawPolygonPreview() {
    ctx.strokeStyle = objectColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    if (polygonVertices.length > 0) {
        ctx.moveTo(polygonVertices[0].x, polygonVertices[0].y);
        for (let i = 1; i < polygonVertices.length; i++) {
            ctx.lineTo(polygonVertices[i].x, polygonVertices[i].y);
        }
        ctx.lineTo(polygonVertices[0].x, polygonVertices[0].y);
    }
    ctx.stroke();
    
    // Draw vertices
    ctx.setLineDash([]);
    ctx.fillStyle = objectColor;
    for (const vertex of polygonVertices) {
        ctx.beginPath();
        ctx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Demo: Create stack of boxes
function createStackDemo() {
    clearScene();
    const boxSize = 40;
    const startX = canvas.width / 2 - 100;
    const startY = canvas.height - 100;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 5; col++) {
            const box = Bodies.rectangle(
                startX + col * boxSize,
                startY - row * boxSize,
                boxSize - 2,
                boxSize - 2,
                {
                    friction: parseFloat(elements.frictionSlider.value),
                    restitution: parseFloat(elements.restitutionSlider.value),
                    render: { fillStyle: objectColor }
                }
            );
            Composite.add(engine.world, box);
        }
    }
}

// Demo: Create pyramid
function createPyramidDemo() {
    clearScene();
    const boxSize = 35;
    const startX = canvas.width / 2;
    const startY = canvas.height - 100;
    
    for (let row = 0; row < 10; row++) {
        for (let col = 0; col <= row; col++) {
            const box = Bodies.rectangle(
                startX + (col - row / 2) * boxSize,
                startY - row * boxSize,
                boxSize - 2,
                boxSize - 2,
                {
                    friction: parseFloat(elements.frictionSlider.value),
                    restitution: parseFloat(elements.restitutionSlider.value),
                    render: { fillStyle: getRandomColor() }
                }
            );
            Composite.add(engine.world, box);
        }
    }
}

// Demo: Create chain
function createChainDemo() {
    clearScene();
    const linkSize = 30;
    const numLinks = 15;
    const startX = canvas.width / 2;
    const startY = 100;
    
    let prevBody = null;
    
    for (let i = 0; i < numLinks; i++) {
        const body = Bodies.circle(startX, startY + i * linkSize, linkSize / 2, {
            friction: parseFloat(elements.frictionSlider.value),
            restitution: parseFloat(elements.restitutionSlider.value),
            render: { fillStyle: i === 0 ? '#ef4444' : objectColor }
        });
        
        if (prevBody) {
            const constraint = Matter.Constraint.create({
                bodyA: prevBody,
                bodyB: body,
                length: linkSize,
                stiffness: 0.9,
                render: {
                    strokeStyle: '#64748b',
                    lineWidth: 3
                }
            });
            Composite.add(engine.world, constraint);
        } else {
            // First link is static
            Body.setStatic(body, true);
        }
        
        Composite.add(engine.world, body);
        prevBody = body;
    }
}

// Demo: Create bridge
function createBridgeDemo() {
    clearScene();
    const segmentWidth = 50;
    const segmentHeight = 15;
    const numSegments = 12;
    const startX = canvas.width / 2 - (numSegments * segmentWidth) / 2;
    const startY = 200;
    
    // Create anchor points
    const anchors = [
        Bodies.rectangle(startX, startY, 20, 60, { isStatic: true, render: { fillStyle: '#64748b' } }),
        Bodies.rectangle(startX + numSegments * segmentWidth, startY, 20, 60, { isStatic: true, render: { fillStyle: '#64748b' } })
    ];
    Composite.add(engine.world, anchors);
    
    // Create bridge segments
    let prevBody = null;
    const firstBody = Bodies.rectangle(startX + segmentWidth / 2, startY + 30, segmentWidth, segmentHeight, {
        friction: parseFloat(elements.frictionSlider.value),
        restitution: parseFloat(elements.restitutionSlider.value),
        render: { fillStyle: objectColor }
    });
    Composite.add(engine.world, firstBody);
    
    // Connect first segment to left anchor
    const firstConstraint = Matter.Constraint.create({
        bodyA: anchors[0],
        bodyB: firstBody,
        pointA: { x: 0, y: -30 },
        pointB: { x: -segmentWidth / 2, y: 0 },
        length: 0,
        stiffness: 0.9
    });
    Composite.add(engine.world, firstConstraint);
    
    prevBody = firstBody;
    
    for (let i = 1; i < numSegments; i++) {
        const body = Bodies.rectangle(
            startX + (i + 0.5) * segmentWidth,
            startY + 30,
            segmentWidth,
            segmentHeight,
            {
                friction: parseFloat(elements.frictionSlider.value),
                restitution: parseFloat(elements.restitutionSlider.value),
                render: { fillStyle: objectColor }
            }
        );
        
        const constraint = Matter.Constraint.create({
            bodyA: prevBody,
            bodyB: body,
            pointA: { x: segmentWidth / 2, y: 0 },
            pointB: { x: -segmentWidth / 2, y: 0 },
            length: 0,
            stiffness: 0.9
        });
        
        Composite.add(engine.world, body);
        Composite.add(engine.world, constraint);
        prevBody = body;
    }
    
    // Connect last segment to right anchor
    const lastConstraint = Matter.Constraint.create({
        bodyA: prevBody,
        bodyB: anchors[1],
        pointA: { x: segmentWidth / 2, y: 0 },
        pointB: { x: 0, y: -30 },
        length: 0,
        stiffness: 0.9
    });
    Composite.add(engine.world, lastConstraint);
    
    // Add some weight to the bridge
    for (let i = 0; i < 5; i++) {
        const weight = Bodies.rectangle(
            startX + (i + 1) * segmentWidth * 2,
            startY + 80,
            30,
            30,
            {
                friction: parseFloat(elements.frictionSlider.value),
                restitution: parseFloat(elements.restitutionSlider.value),
                render: { fillStyle: '#ef4444' }
            }
        );
        Composite.add(engine.world, weight);
    }
}

// Clear all objects (keep walls)
function clearScene() {
    const bodies = Composite.allBodies(engine.world);
    for (const body of bodies) {
        if (body.label !== 'wall') {
            Composite.remove(engine.world, body);
        }
    }
    
    // Also remove constraints
    const constraints = Composite.allConstraints(engine.world);
    for (const constraint of constraints) {
        Composite.remove(engine.world, constraint);
    }
    
    polygonVertices = [];
}

// Save scene to JSON
function saveScene() {
    const bodies = Composite.allBodies(engine.world).filter(b => b.label !== 'wall');
    const constraints = Composite.allConstraints(engine.world);
    
    const sceneData = {
        bodies: bodies.map(body => ({
            type: body.label,
            x: body.position.x,
            y: body.position.y,
            angle: body.angle,
            isStatic: body.isStatic,
            friction: body.friction,
            restitution: body.restitution,
            density: body.density,
            vertices: body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y })),
            render: body.render
        })),
        constraints: constraints.map(c => ({
            bodyA: c.bodyA ? Composite.allBodies(engine.world).indexOf(c.bodyA) : null,
            bodyB: c.bodyB ? Composite.allBodies(engine.world).indexOf(c.bodyB) : null,
            length: c.length,
            stiffness: c.stiffness
        })),
        settings: {
            gravity: engine.gravity.y,
            friction: elements.frictionSlider.value,
            restitution: elements.restitutionSlider.value
        }
    };
    
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'physics-scene.json';
    a.click();
    URL.revokeObjectURL(url);
}

// Load scene from JSON file
function loadScene(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const sceneData = JSON.parse(e.target.result);
            clearScene();
            
            // Apply settings
            if (sceneData.settings) {
                if (sceneData.settings.gravity !== undefined) {
                    engine.gravity.y = sceneData.settings.gravity;
                    elements.gravitySlider.value = sceneData.settings.gravity;
                    elements.gravityValue.textContent = sceneData.settings.gravity.toFixed(1);
                }
            }
            
            // Create bodies
            const newBodies = sceneData.bodies.map(b => {
                const body = Bodies.fromVertices(b.x, b.y, [b.vertices], {
                    isStatic: b.isStatic,
                    friction: b.friction,
                    restitution: b.restitution,
                    density: b.density,
                    render: b.render
                });
                Body.setAngle(body, b.angle);
                return body;
            });
            
            Composite.add(engine.world, newBodies);
            
            // Recreate constraints
            if (sceneData.constraints) {
                for (const c of sceneData.constraints) {
                    if (c.bodyA !== null && c.bodyB !== null) {
                        const bodyA = Composite.allBodies(engine.world)[c.bodyA];
                        const bodyB = Composite.allBodies(engine.world)[c.bodyB];
                        if (bodyA && bodyB) {
                            const constraint = Matter.Constraint.create({
                                bodyA: bodyA,
                                bodyB: bodyB,
                                length: c.length,
                                stiffness: c.stiffness
                            });
                            Composite.add(engine.world, constraint);
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error loading scene:', err);
            alert('Error loading scene file');
        }
    };
    reader.readAsText(file);
}

// Update stats display
function updateStats() {
    const bodies = Composite.allBodies(engine.world).filter(b => b.label !== 'wall');
    elements.objectCount.textContent = `Objects: ${bodies.length}`;
    
    // Simple FPS calculation
    if (runner) {
        elements.fpsCounter.textContent = `FPS: ${Math.round(runner.delta / 16.67 * 60) || 60}`;
    }
}

// Handle window resize
function handleResize() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    render.options.width = canvas.width;
    render.options.height = canvas.height;
    
    // Update walls
    const walls = Composite.allBodies(engine.world).filter(b => b.label === 'wall');
    walls.forEach(wall => Composite.remove(engine.world, wall));
    createWalls();
}

// Setup event listeners
function setupEventListeners() {
    // Tool buttons
    elements.toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.toolButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
            
            if (currentTool !== 'polygon') {
                polygonVertices = [];
                isCreatingPolygon = false;
            }
        });
    });
    
    // Physics sliders
    elements.gravitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        engine.gravity.y = value;
        elements.gravityValue.textContent = value.toFixed(1);
    });
    
    elements.frictionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        elements.frictionValue.textContent = value.toFixed(2);
    });
    
    elements.restitutionSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        elements.restitutionValue.textContent = value.toFixed(2);
    });
    
    elements.timeScaleSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        engine.timing.timeScale = value;
        elements.timeScaleValue.textContent = value.toFixed(1) + 'x';
    });
    
    elements.densitySlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        elements.densityValue.textContent = value.toFixed(3);
    });
    
    // Color picker
    elements.colorPicker.addEventListener('input', (e) => {
        objectColor = e.target.value;
    });
    
    // Static checkbox
    elements.staticCheckbox.addEventListener('change', (e) => {
        isStatic = e.target.checked;
    });
    
    // Toggle buttons
    document.getElementById('toggleGrid').addEventListener('click', (e) => {
        showGrid = !showGrid;
        e.currentTarget.classList.toggle('active', showGrid);
        canvas.classList.toggle('grid-bg', showGrid);
    });
    
    document.getElementById('toggleVectors').addEventListener('click', (e) => {
        showVectors = !showVectors;
        e.currentTarget.classList.toggle('active', showVectors);
    });
    
    // Scene management
    document.getElementById('saveScene').addEventListener('click', saveScene);
    
    document.getElementById('loadScene').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            loadScene(e.target.files[0]);
        }
    });
    
    document.getElementById('clearScene').addEventListener('click', clearScene);
    
    // Demo buttons
    document.getElementById('demoStack').addEventListener('click', createStackDemo);
    document.getElementById('demoPyramid').addEventListener('click', createPyramidDemo);
    document.getElementById('demoChain').addEventListener('click', createChainDemo);
    document.getElementById('demoBridge').addEventListener('click', createBridgeDemo);
    
    // Help modal
    document.getElementById('helpBtn').addEventListener('click', () => {
        elements.helpModal.style.display = 'block';
    });
    
    elements.closeBtn.addEventListener('click', () => {
        elements.helpModal.style.display = 'none';
    });
    
    elements.helpModal.addEventListener('click', (e) => {
        if (e.target === elements.helpModal) {
            elements.helpModal.style.display = 'none';
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            isPaused = !isPaused;
            if (isPaused) {
                Runner.stop(runner);
            } else {
                Runner.run(runner, engine);
            }
        }
    });
}

// Initialize on load
window.addEventListener('load', init);
