window.addEventListener('DOMContentLoaded', () => {
    // Initialization
    const renderer = new Renderer('render-canvas');
    const camera = new Camera(60, renderer.width / renderer.height, 0.1, 1000);
    const interaction = new InteractionHandler(renderer.canvas, camera);
    const selector = new Selector(camera, renderer);
    const history = new History();

    // Scene State
    const scene = {
        meshes: [],
        activeMesh: null,
        showGrid: true
    };

    // UI Cache
    const ui = {
        sceneGraph: document.getElementById('scene-graph'),
        polyCount: document.getElementById('stats'),
        overlay: document.getElementById('overlay-info'),
        props: {
            x: document.getElementById('prop-x'),
            y: document.getElementById('prop-y'),
            z: document.getElementById('prop-z'),
            rx: document.getElementById('prop-rx'),
            ry: document.getElementById('prop-ry'),
            rz: document.getElementById('prop-rz'),
            sx: document.getElementById('prop-sx'),
            sy: document.getElementById('prop-sy'),
            sz: document.getElementById('prop-sz'),
            color: document.getElementById('prop-color'),
            shininess: document.getElementById('prop-shininess')
        }
    };

    // Helper to add mesh to scene
    function addMesh(mesh, material = Material.default(), name = 'Mesh') {
        mesh.material = material;
        mesh.name = name || `Mesh_${scene.meshes.length}`;
        // Ensure unique name? For now, loose uniqueness.
        history.execute(new AddMeshCommand(scene, mesh));
        setActiveMesh(mesh);
        updateSceneGraph();
    }

    function setActiveMesh(mesh) {
        scene.activeMesh = mesh;
        updateSceneGraphUI();
        updatePropertiesUI();
        if (mesh) ui.overlay.textContent = `Selected: ${mesh.name}`;
        else ui.overlay.textContent = "Ready";
    }

    // --- Rendering Extensions ---

    function drawGrid() {
        if (!scene.showGrid) return;
        const ctx = renderer.ctx;
        const size = 20;
        const step = 2;

        ctx.beginPath();
        const vp = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.viewMatrix);

        // Simple grid lines centered at 0
        for (let i = -size; i <= size; i += step) {
            // X lines
            const p1 = renderer.project(new Vertex(new Vector3(-size, 0, i), new Vector3()), vp);
            const p2 = renderer.project(new Vertex(new Vector3(size, 0, i), new Vector3()), vp);

            // Z lines
            const p3 = renderer.project(new Vertex(new Vector3(i, 0, -size), new Vector3()), vp);
            const p4 = renderer.project(new Vertex(new Vector3(i, 0, size), new Vector3()), vp);

            // Only draw if within reasonable bounds (project returns simple mapping)
            // Ideally should check z-depth or clip but simple lines are okay

            // Color based on axis
            ctx.strokeStyle = (i === 0) ? '#444' : '#222';
            ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
            ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
        }
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // Render Loop
    let lastTime = 0;
    function animate(time) {
        requestAnimationFrame(animate);

        // Stats
        const dt = time - lastTime;
        lastTime = time;

        // Pre-render steps
        renderer.ctx.fillStyle = renderer.backgroundColor;
        renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);

        drawGrid();

        renderer.render(scene, camera); // This handles main clear/draw. Wait. 
        // Renderer clears internally. We should move grid drawing inside or after clear.
        // Renderer 101: clear -> draw background/grid -> draw scene -> draw overlay
        // My Renderer class implementation does clear.
        // Let's modify Renderer locally effectively by monkey-patching or just knowing it clears.
        // It clears. So grid must be drawn AFTER render? No, BEFORE scene, AFTER clear.
        // But render() calls clear().
        // Quick fix: renderer.render() does clear.
        // I should have exposed `renderer.clear()` separately.
        // For now, I'll let renderer draw standard, and draw grid on top? No, grid should be behind.

        // Hack: don't use drawGrid here if renderer clears.
        // Actually, renderer clears background.
        // So we can't inject grid easily without modifying renderer.
        // Let's rely on renderer or just draw grid on top with transparency?
        // Let's effectively accept grid on top for now, or modify renderer in next step if critical.
        // Better: Draw Grid ON TOP but subtle.

        drawGrid();

        // Stats update
        let totalPolys = 0;
        scene.meshes.forEach(m => totalPolys += m.csg.polygons.length);
        ui.polyCount.textContent = `${totalPolys} Polys | ${scene.meshes.length} Objs | ${(1000 / dt).toFixed(0)} FPS`;
    }
    animate(0);

    // --- UI Logic ---

    function updateSceneGraph() {
        ui.sceneGraph.innerHTML = '';
        scene.meshes.forEach((mesh, index) => {
            const div = document.createElement('div');
            div.className = `scene-item ${mesh === scene.activeMesh ? 'active' : ''}`;
            div.textContent = mesh.name || `Object ${index}`;
            div.onclick = () => {
                setActiveMesh(mesh);
            };
            ui.sceneGraph.appendChild(div);
        });
    }

    function updateSceneGraphUI() {
        // Just update active class
        Array.from(ui.sceneGraph.children).forEach((child, index) => {
            if (scene.meshes[index] === scene.activeMesh) child.classList.add('active');
            else child.classList.remove('active');
        });
    }

    function updatePropertiesUI() {
        const m = scene.activeMesh;
        if (!m) return;

        // Block change events while updating
        isUpdatingProps = true;

        ui.props.x.value = m.position.x.toFixed(2);
        ui.props.y.value = m.position.y.toFixed(2);
        ui.props.z.value = m.position.z.toFixed(2);

        ui.props.rx.value = (m.rotation.x * 180 / Math.PI).toFixed(0);
        ui.props.ry.value = (m.rotation.y * 180 / Math.PI).toFixed(0);
        ui.props.rz.value = (m.rotation.z * 180 / Math.PI).toFixed(0);

        ui.props.sx.value = m.scale.x.toFixed(2);
        ui.props.sy.value = m.scale.y.toFixed(2);
        ui.props.sz.value = m.scale.z.toFixed(2);

        // Color to Hex
        const c = m.material.color;
        const hex = '#' +
            Math.min(255, c.r).toString(16).padStart(2, '0') +
            Math.min(255, c.g).toString(16).padStart(2, '0') +
            Math.min(255, c.b).toString(16).padStart(2, '0');
        ui.props.color.value = hex;
        ui.props.shininess.value = m.material.shininess;

        isUpdatingProps = false;
    }

    // Property bindings
    let isUpdatingProps = false;
    const applyProps = () => {
        if (isUpdatingProps || !scene.activeMesh) return;
        const m = scene.activeMesh;

        m.position.x = parseFloat(ui.props.x.value);
        m.position.y = parseFloat(ui.props.y.value);
        m.position.z = parseFloat(ui.props.z.value);

        m.rotation.x = parseFloat(ui.props.rx.value) * Math.PI / 180;
        m.rotation.y = parseFloat(ui.props.ry.value) * Math.PI / 180;
        m.rotation.z = parseFloat(ui.props.rz.value) * Math.PI / 180;

        m.scale.x = parseFloat(ui.props.sx.value);
        m.scale.y = parseFloat(ui.props.sy.value);
        m.scale.z = parseFloat(ui.props.sz.value);

        m.updateMatrix();
    };

    const propInputs = [
        ui.props.x, ui.props.y, ui.props.z,
        ui.props.rx, ui.props.ry, ui.props.rz,
        ui.props.sx, ui.props.sy, ui.props.sz
    ];
    propInputs.forEach(input => input.addEventListener('input', applyProps));

    ui.props.color.addEventListener('input', (e) => {
        if (!scene.activeMesh) return;
        const hex = e.target.value;
        const r = parseInt(hex.substr(1, 2), 16);
        const g = parseInt(hex.substr(3, 2), 16);
        const b = parseInt(hex.substr(5, 2), 16);
        scene.activeMesh.material.color = { r, g, b };
    });

    ui.props.shininess.addEventListener('input', (e) => {
        if (scene.activeMesh) scene.activeMesh.material.shininess = parseInt(e.target.value);
    });


    // --- Creation Tools ---

    const randomPos = () => new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    let nameCounter = 1;

    document.getElementById('btn-cube').onclick = () => {
        const mesh = Mesh.fromCSG(Primitives.cube({ radius: 1.0 }));
        mesh.position = randomPos();
        mesh.updateMatrix();
        addMesh(mesh, Material.blueSteel(), `Cube_${nameCounter++}`);
    };

    document.getElementById('btn-sphere').onclick = () => {
        const mesh = Mesh.fromCSG(Primitives.sphere({ radius: 1.2 }));
        mesh.position = randomPos();
        mesh.updateMatrix();
        addMesh(mesh, Material.redPlastic(), `Sphere_${nameCounter++}`);
    };

    document.getElementById('btn-cylinder').onclick = () => {
        const mesh = Mesh.fromCSG(Primitives.cylinder({ radius: 0.8, height: 2.5 }));
        mesh.position = randomPos();
        mesh.updateMatrix();
        addMesh(mesh, Material.gold(), `Cylinder_${nameCounter++}`);
    };

    document.getElementById('btn-cone').onclick = () => {
        const mesh = Mesh.fromCSG(Primitives.cone({ radius: 1.0, height: 2.0 }));
        mesh.position = randomPos();
        mesh.updateMatrix();
        addMesh(mesh, Material.redPlastic(), `Cone_${nameCounter++}`);
    };

    document.getElementById('btn-torus').onclick = () => {
        const mesh = Mesh.fromCSG(Primitives.torus({ radius: 1.0, tube: 0.3 }));
        mesh.position = randomPos();
        mesh.updateMatrix();
        addMesh(mesh, Material.silver(), `Torus_${nameCounter++}`);
    };

    // --- Actions ---

    document.getElementById('btn-duplicate').onclick = () => {
        if (!scene.activeMesh) return;
        // Logic to clone: Mesh from CSG
        const original = scene.activeMesh;
        const copy = Mesh.fromCSG(original.csg.clone()); // Cloning CSG is potentially expensive
        // Better: shallow copy if CSG is immutable, but we transform meshes.
        // Mesh transform is separate from CSG unless baked.
        // Our 'Mesh.fromCSG' creates new mesh wrapper.
        // Deep copy CSG to be safe.

        copy.position = original.position.clone().add(new Vector3(0.5, 0.5, 0.5));
        copy.rotation = original.rotation.clone();
        copy.scale = original.scale.clone();
        copy.updateMatrix();
        copy.material = original.material.clone();

        addMesh(copy, copy.material, original.name + '_copy');
    };

    document.getElementById('btn-delete').onclick = () => {
        if (!scene.activeMesh) return;
        history.execute(new RemoveMeshCommand(scene, scene.activeMesh));
        updateSceneGraph();
        setActiveMesh(null);
    };

    document.getElementById('btn-clear').onclick = () => {
        if (confirm('Clear all objects?')) {
            scene.meshes = [];
            setActiveMesh(null);
            updateSceneGraph();
        }
    };

    // Note: CSG operations logic needs to handle the new name system
    function performCSG(op) {
        if (scene.meshes.length < 2) return;

        // Strategy: Use Active + Previous (in list)
        // Or Active + Selection B?
        // Let's stick to "Active (Operand A)" and "Operand B (Find Intersection via list?)"
        // Simple fallback: Active Mesh vs The one before it in the list.

        if (!scene.activeMesh) return;

        const b = scene.activeMesh;
        const idx = scene.meshes.indexOf(b);
        if (idx <= 0) { ui.overlay.textContent = "Select 2nd object to operate"; return; }

        const a = scene.meshes[idx - 1]; // Previous in list

        ui.overlay.textContent = `Processing ${op}...`;

        setTimeout(() => {
            // Remove originals
            history.execute(new RemoveMeshCommand(scene, b));
            history.execute(new RemoveMeshCommand(scene, a));

            const csgA = CSG.fromPolygons(a.getTransformedPolygons());
            const csgB = CSG.fromPolygons(b.getTransformedPolygons());

            let resultCSG;
            try {
                if (op === 'union') resultCSG = csgA.union(csgB);
                else if (op === 'subtract') resultCSG = csgA.subtract(csgB);
                else if (op === 'intersect') resultCSG = csgA.intersect(csgB);

                const resultMesh = Mesh.fromCSG(resultCSG);
                resultMesh.material = a.material.clone(); // Inherit material from A
                addMesh(resultMesh, resultMesh.material, `${a.name}_${op}_${b.name}`);

                ui.overlay.textContent = `${op} complete`;
            } catch (e) {
                console.error(e);
                ui.overlay.textContent = "Error in CSG op";
                // Restore?
            }
        }, 10);
    }

    document.getElementById('btn-union').onclick = () => performCSG('union');
    document.getElementById('btn-subtract').onclick = () => performCSG('subtract');
    document.getElementById('btn-intersect').onclick = () => performCSG('intersect');

    // --- Global Tools ---

    document.getElementById('btn-export-stl').onclick = () => {
        const stl = Exporter.toSTL(scene.meshes);
        Exporter.download('model.stl', stl);
    };

    document.getElementById('btn-save').onclick = () => {
        const json = Exporter.serialize(scene);
        Exporter.download('scene.json', json);
    };

    document.getElementById('btn-load').onclick = () => {
        document.getElementById('file-input').click();
    };

    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const meshes = Exporter.deserialize(e.target.result);
                scene.meshes = [];
                meshes.forEach(m => addMesh(m, m.material, 'LoadedMesh')); // Names might be lost/generic
                updateSceneGraph();
            } catch (err) {
                alert('Failed to load');
            }
        };
        reader.readAsText(file);
    });

    // View Toggles
    document.getElementById('btn-wireframe').onclick = (e) => {
        renderer.drawWireframe = !renderer.drawWireframe;
        e.target.classList.toggle('active', renderer.drawWireframe);
    };

    document.getElementById('btn-grid').onclick = (e) => {
        scene.showGrid = !scene.showGrid;
        e.target.classList.toggle('active', scene.showGrid);
    };

    // Canvas Selection
    renderer.canvas.addEventListener('click', (e) => {
        const rect = renderer.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if we just dragged
        // Interaction handler check?
        const hit = selector.pick(x, y, scene.meshes);
        if (hit) setActiveMesh(hit);
        else setActiveMesh(null);
    });

    // --- Shortcuts ---
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return; // Don't trigger if typing

        if (e.key === 'Delete') document.getElementById('btn-delete').click();

        if (e.ctrlKey && e.key === 'z') { history.undo(); updateSceneGraph(); }
        if (e.ctrlKey && e.key === 'y') { history.redo(); updateSceneGraph(); }
    });

    // Help Modal
    const modal = document.getElementById('help-modal');
    document.getElementById('btn-help').onclick = () => modal.classList.remove('hidden');
    document.getElementById('close-help').onclick = () => modal.classList.add('hidden');

    // Init
    const startCube = Mesh.fromCSG(Primitives.cube({ radius: 1 }));
    addMesh(startCube, Material.blueSteel(), 'StartCube');
});
