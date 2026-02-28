// --- STATE MANAGEMENT ---
let deployedState = []; // What is "actually" running
let currentPlan = [];   // What we intend to do
        
const editor = document.getElementById('code-editor');
const consoleEl = document.getElementById('console');
const applyBtn = document.getElementById('apply-btn');

// --- PARSER ---
function parseConfig(text) {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    const resources = [];

    lines.forEach((line, index) => {
    // Regex to match: type "name" [depends_on "target"]
    const match = line.match(/(\w+)\s+"([\w-]+)"(?:\s+depends_on\s+"([\w-]+)")?/);
        if (match) {
            resources.push({
            type: match[1],
            id: match[2],
            dependsOn: match[3] || null,
            status: 'planned'
        });
        } else {
            log(`Syntax Error on line ${index + 1}`, 'destroy');
        }
    });

    return resources;
}

// --- LOGIC ENGINE ---
function handlePlan() {
    const desiredState = parseConfig(editor.value);
    currentPlan = [];

    // Simple Diff logic
    desiredState.forEach(res => {
        const exists = deployedState.find(s => s.id === res.id);
        if (!exists) {
            currentPlan.push({ ...res, action: 'CREATE' });
        }
    });

    deployedState.forEach(res => {
        const stillExists = desiredState.find(d => d.id === res.id);
        if (!stillExists) {
            currentPlan.push({ ...res, action: 'DESTROY' });
        }
    });

    log(`Plan: ${currentPlan.length} changes required.`, 'plan');
    currentPlan.forEach(p => log(`+ ${p.action}: ${p.type}.${p.id}`));
            
    renderGraph(desiredState);
    applyBtn.disabled = currentPlan.length === 0;
}

async function handleApply() {
    applyBtn.disabled = true;
    log("Applying changes...", "info");

    // Sort by dependency (Basic topological concept: parents first)
    const toCreate = currentPlan.filter(p => p.action === 'CREATE');
            
    // Simulation Loop
    for (const res of toCreate) {
        const node = document.getElementById(`node-${res.id}`);
        node.classList.add('pending');
        log(`Creating ${res.id}...`);
                
        await new Promise(r => setTimeout(r, 1000)); // Simulate latency
                
        node.classList.remove('pending');
        node.classList.add('active');
        deployedState.push(res);
    }

    // Cleanup Destroys
    const toDestroy = currentPlan.filter(p => p.action === 'DESTROY');
    deployedState = deployedState.filter(s => !toDestroy.find(td => td.id === s.id));
            
    log("Apply complete. Infrastructure is up to date.", "success");
    currentPlan = [];
    handlePlan(); // Refresh graph
}

function handleDestroy() {
    log("Destroying all resources...", "destroy");
    editor.value = "";
    handlePlan();
}

// --- VISUALIZER (Vanilla SVG) ---
function renderGraph(resources) {
    const nodesGroup = document.getElementById('nodes-group');
    const edgesGroup = document.getElementById('edges-group');
    nodesGroup.innerHTML = '';
    edgesGroup.innerHTML = '';

    const coords = {};
    resources.forEach((res, i) => {
        // Simple horizontal layout
        coords[res.id] = { x: 100 + (i * 120) % 500, y: 100 + Math.floor(i/4) * 100 };
                
        // Draw Node
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", `node ${deployedState.find(s => s.id === res.id) ? 'active' : ''}`);
        g.setAttribute("id", `node-${res.id}`);
        g.setAttribute("transform", `translate(${coords[res.id].x}, ${coords[res.id].y})`);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", "35");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dy", "5");
        text.textContent = res.id;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });

    // Draw Edges (Dependencies)
    resources.forEach(res => {
        if (res.dependsOn && coords[res.dependsOn]) {
            const start = coords[res.dependsOn];
            const end = coords[res.id];
                        
            const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const d = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            line.setAttribute("d", d);
            line.setAttribute("class", "edge");
            edgesGroup.appendChild(line);
        }
    });
}

function log(msg, type = 'info') {
    const div = document.createElement('div');
    div.className = `log-${type}`;
    div.textContent = `> ${msg}`;
    consoleEl.appendChild(div);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

// Initial Render
handlePlan();