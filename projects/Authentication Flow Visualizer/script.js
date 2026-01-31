/**
 * Authentication Flow Visualizer
 * Core Logic Engine
 */

// --- Configuration & Constants ---
const SPEEDS = {
    packet: 1500, // ms to travel
    stepDelay: 500 // ms between auto-steps
};

const NODES_CONFIG = {
    client: { label: 'User / Client', icon: 'ri-computer-line', x: 15, y: 50 },
    lb: { label: 'Load Balancer', icon: 'ri-server-line', x: 35, y: 50 },
    server: { label: 'Web Server', icon: 'ri-hard-drive-2-line', x: 50, y: 50 },
    auth: { label: 'Auth Provider', icon: 'ri-shield-keyhole-line', x: 50, y: 15 },
    db: { label: 'Database', icon: 'ri-database-2-line', x: 85, y: 50 },
    api: { label: 'Resource API', icon: 'ri-cloud-line', x: 85, y: 85 },
    attacker: { label: 'Attacker', icon: 'ri-spy-line', x: 50, y: 85, hidden: true }
};

// --- State Management ---
const state = {
    currentFlow: 'session', // session, jwt, oauth
    currentStepIndex: -1,
    isAttackMode: false,
    attackType: null, // replay, expiry, tamper
    isPlaying: false
};

// --- Visualizer Engine ---
class Visualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer-canvas');
        this.nodes = {};
    }

    /**
     * Clear canvas and spawn initial nodes based on flow
     */
    setupScene(flowType, attackType = null) {
        this.canvas.innerHTML = '';
        this.nodes = {};

        // Determine which nodes are needed
        const requiredNodes = ['client', 'server', 'db'];
        if (flowType === 'oauth') {
            requiredNodes.push('auth', 'api');
            // Adjust server position for oauth to make room? 
            // Current layout x=50 should be fine if DB is at 85
        }
        if (attackType) requiredNodes.push('attacker');

        requiredNodes.forEach(key => this.spawnNode(key));
    }

    spawnNode(key) {
        const config = NODES_CONFIG[key];
        const el = document.createElement('div');
        el.className = `node ${key === 'attacker' ? 'danger' : ''}`;
        el.id = `node-${key}`;
        el.style.left = `${config.x}%`;
        el.style.top = `${config.y}%`;
        el.innerHTML = `
            <div class="node-icon"><i class="${config.icon}"></i></div>
            <div class="node-label">${config.label}</div>
            <div class="node-storage" id="storage-${key}">Empty</div>
        `;
        this.canvas.appendChild(el);
        this.nodes[key] = { el, config };
    }

    updateStorage(nodeKey, text, isDanger = false) {
        const storeEl = document.getElementById(`storage-${nodeKey}`);
        if (storeEl) {
            storeEl.innerText = text;
            storeEl.style.color = isDanger ? 'var(--color-danger)' : 'var(--color-text-muted)';
            storeEl.parentElement.classList.add('active');
            setTimeout(() => storeEl.parentElement.classList.remove('active'), 1000);
        }
    }

    /**
     * Animate a packet traveling from Source to Target
     * @returns {Promise} resolves when animation completes
     */
    async sendPacket(from, to, label, data, isMalicious = false) {
        return new Promise(resolve => {
            const startNode = this.nodes[from];
            const endNode = this.nodes[to];

            if (!startNode || !endNode) {
                console.warn(`Missing node: ${from} or ${to}`);
                resolve();
                return;
            }

            // Create Packet
            const packet = document.createElement('div');
            packet.className = 'packet';
            if (isMalicious) packet.style.backgroundColor = 'var(--color-danger)';
            packet.style.left = startNode.el.style.left;
            packet.style.top = startNode.el.style.top;

            packet.innerHTML = `<div class="packet-label" style="${isMalicious ? 'color:var(--color-danger)' : ''}">${label}</div>`;

            this.canvas.appendChild(packet);

            // Log it
            ui.logFlow(`[${from.toUpperCase()} -> ${to.toUpperCase()}] ${label}`, isMalicious ? 'error' : 'step');
            ui.showPacketData(data);

            // Animate
            // Force reflow
            packet.getBoundingClientRect();

            packet.style.transition = `all ${SPEEDS.packet}ms linear`;
            packet.style.left = endNode.el.style.left;
            packet.style.top = endNode.el.style.top;

            // Wait for travel
            setTimeout(() => {
                packet.remove();
                // Flash target node
                endNode.el.classList.add('active');
                setTimeout(() => endNode.el.classList.remove('active'), 500);
                resolve();
            }, SPEEDS.packet);
        });
    }
}

// --- UI Controller ---
const ui = {
    logFlow(msg, type = 'info') {
        const date = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.innerHTML = `<span class="log-time">${date}</span> ${msg}`;

        // Find or create the log container inside
        let logContainer = document.getElementById('log-container');
        if (!logContainer) {
            logContainer = document.createElement('div');
            logContainer.id = 'log-container';
            document.getElementById('info-content').appendChild(logContainer);
        }

        // Ensure visibility if tab is active
        if (document.querySelector('.tab[data-tab="flow-log"]').classList.contains('active')) {
            logContainer.style.display = 'block';
            const jsonContainer = document.getElementById('json-container');
            if (jsonContainer) jsonContainer.style.display = 'none';
        }

        logContainer.prepend(entry);
    },

    showPacketData(data) {
        let jsonContainer = document.getElementById('json-container');
        if (!jsonContainer) {
            jsonContainer = document.createElement('pre');
            jsonContainer.id = 'json-container';
            jsonContainer.style.display = 'none'; // Default hidden
            jsonContainer.style.background = 'rgba(0,0,0,0.3)';
            jsonContainer.style.padding = '10px';
            jsonContainer.style.borderRadius = '6px';
            document.getElementById('info-content').appendChild(jsonContainer);
        }
        jsonContainer.innerText = JSON.stringify(data, null, 2);

        // Auto-switch if user wants live packet view? No, let's keep user preference.
        if (document.querySelector('.tab[data-tab="packet-data"]').classList.contains('active')) {
            const logContainer = document.getElementById('log-container');
            if (logContainer) logContainer.style.display = 'none';
            jsonContainer.style.display = 'block';
        }
    },

    setProgressBar(stepIndex, totalSteps) {
        const pct = ((stepIndex + 1) / totalSteps) * 100;
        document.getElementById('progress-bar').style.width = `${pct}%`;
    },

    reset() {
        document.getElementById('info-content').innerHTML = '<div id="log-container"></div>';
        document.getElementById('progress-bar').style.width = '0%';
    }
};

// --- Flows Definitions ---

const FLOWS = {
    session: {
        title: "Session Based Authentication",
        desc: "The server creates a session ID, stores it in a DB, and sends it to the client as a Cookie.",
        steps: [
            {
                label: "Login Request",
                action: async (v) => await v.sendPacket('client', 'server', 'POST /login', { username: 'user', password: '***' })
            },
            {
                label: "Verify Credentials",
                action: async (v) => {
                    await v.sendPacket('server', 'db', 'Query User', { sql: 'SELECT * FROM users WHERE...' });
                    await v.sendPacket('db', 'server', 'User Found', { id: 1, role: 'user' });
                }
            },
            {
                label: "Create Session",
                action: async (v) => {
                    ui.logFlow("Server generates SessionID: sess_123abc");
                    v.updateStorage('server', 'Mem: sess_123abc');
                    await v.sendPacket('server', 'db', 'Store Session', { sid: 'sess_123abc', uid: 1 });
                }
            },
            {
                label: "Set-Cookie",
                action: async (v) => {
                    await v.sendPacket('server', 'client', '200 OK', { 'Set-Cookie': 'sid=sess_123abc; HttpOnly' });
                    v.updateStorage('client', 'Cookie: sess_123abc');
                }
            },
            {
                label: "Authenticated Request",
                action: async (v) => {
                    await v.sendPacket('client', 'server', 'GET /dashboard', { headers: { Cookie: 'sid=sess_123abc' } });
                    // Server checks DB
                    await v.sendPacket('server', 'db', 'Validate Session', { sid: 'sess_123abc' });
                    await v.sendPacket('db', 'server', 'Valid', { uid: 1 });
                    await v.sendPacket('server', 'client', '200 OK (Data)', { data: 'Dashboard Content' });
                }
            }
        ]
    },
    jwt: {
        title: "JWT Authentication (Stateless)",
        desc: "Server signs a JSON Web Token. No server-side storage required. Token contains user data.",
        steps: [
            {
                label: "Login Request",
                action: async (v) => await v.sendPacket('client', 'server', 'POST /login', { user: 'alice', pass: '***' })
            },
            {
                label: "Verify & Sign",
                action: async (v) => {
                    await v.sendPacket('server', 'db', 'Check Creds', { sql: 'SELECT...' });
                    await v.sendPacket('db', 'server', 'OK', { id: 45 });
                    ui.logFlow("Server signs JWT using Private Secret.");
                }
            },
            {
                label: "Issue Token",
                action: async (v) => {
                    const token = "eyJhbG..sig";
                    await v.sendPacket('server', 'client', '200 OK', { token: token });
                    v.updateStorage('client', `LocStore: ${token.substring(0, 10)}...`);
                }
            },
            {
                label: "API Request",
                action: async (v) => {
                    const token = "eyJhbG..sig";
                    await v.sendPacket('client', 'server', 'GET /api/orders', { Authorization: `Bearer ${token}` });
                    ui.logFlow("Server verifies signature (No DB Needed).");
                    await v.sendPacket('server', 'client', '200 OK', { orders: [1, 2, 3] });
                }
            }
        ]
    },
    oauth: {
        title: "OAuth 2.0 (Authorization Code)",
        desc: "User authorizes App to access Resource Server via an Auth Server.",
        steps: [
            {
                label: "Click 'Login with Google'",
                action: async (v) => ui.logFlow("User clicks Login button on Client.")
            },
            {
                label: "Redirect to Auth/Auth",
                action: async (v) => {
                    await v.sendPacket('client', 'auth', 'Redirect /authorize', { client_id: 'app_1', scope: 'email' });
                }
            },
            {
                label: "User Consents",
                action: async (v) => {
                    ui.logFlow("User sees consent screen on Auth Provider.");
                    await v.sendPacket('auth', 'client', 'Callback /cb', { code: 'auth_code_xyz' });
                }
            },
            {
                label: "Exchange Code",
                action: async (v) => {
                    await v.sendPacket('client', 'auth', 'POST /token', { code: 'auth_code_xyz', client_secret: '***' });
                    // Auth server validates
                }
            },
            {
                label: "Receive Access Token",
                action: async (v) => {
                    await v.sendPacket('auth', 'client', '200 OK', { access_token: 'mw_token_007' });
                    v.updateStorage('client', 'Token: mw_token_007');
                }
            },
            {
                label: "Access Resource",
                action: async (v) => {
                    await v.sendPacket('client', 'api', 'GET /mails', { Authorization: 'Bearer mw_token_007' });
                    await v.sendPacket('api', 'client', '200 OK', { mails: [] });
                }
            }
        ]
    }
};

const ATTACK_SCENARIOS = {
    replay: {
        title: "Replay Attack",
        flow: 'session',
        injectStepsAt: 4,
        steps: [
            {
                label: "Attacker Intercepts",
                action: async (v) => {
                    ui.logFlow("Attacker sniffs the network traffic.", "error");
                    v.spawnNode('attacker');
                    v.updateStorage('attacker', 'Stolen: sess_123abc', true);
                }
            },
            {
                label: "Replay Request",
                action: async (v) => {
                    await v.sendPacket('attacker', 'server', 'GET /dashboard', { Cookie: 'sid=sess_123abc' }, true);
                    ui.logFlow("Server cannot distinguish attacker from user caused by lack of CSRF/Rotation.", "error");
                    await v.sendPacket('server', 'attacker', '200 OK', "SENSITIVE DATA", true);
                }
            }
        ]
    },
    expiry: {
        title: "Token Expiration",
        flow: 'jwt',
        steps: [
            // Standard login first
            {
                label: "Login Request",
                action: async (v) => await v.sendPacket('client', 'server', 'POST /login', { user: 'alice' })
            },
            {
                label: "Issue Short-Lived Token",
                action: async (v) => {
                    await v.sendPacket('server', 'client', '200 OK', { token: 'jwt_exp_5min' });
                    v.updateStorage('client', 'Token (5m)', false);
                }
            },
            {
                label: "Time Passes...",
                action: async (v) => {
                    ui.logFlow("⏳ 10 Minutes Later...");
                    v.updateStorage('client', 'Token (Expired)', true);
                }
            },
            {
                label: "Use Expired Token",
                action: async (v) => {
                    await v.sendPacket('client', 'server', 'GET /api', { Auth: 'Bearer jwt_exp_5min' });
                    ui.logFlow("Server checks 'exp' claim: Past.", "error");
                    await v.sendPacket('server', 'client', '401 Unauthorized', { error: 'Token Expired' }, true);
                }
            }
        ]
    },
    tamper: {
        title: "JWT Tampering",
        flow: 'jwt',
        steps: [
            {
                label: "Get Valid Token",
                action: async (v) => {
                    // Fast forward login
                    v.spawnNode('attacker');
                    await v.sendPacket('server', 'client', '200 OK', { token: 'eyJ.user.sig' });
                    v.updateStorage('client', 'Token: user', false);
                }
            },
            {
                label: "Attacker Modifies",
                action: async (v) => {
                    ui.logFlow("Attacker changes payload: role='admin'", "error");
                    // In reality, they can decode payload but cannot sign it without secret
                    v.updateStorage('attacker', 'Forged: admin', true);
                    await v.sendPacket('attacker', 'server', 'GET /admin', { Auth: 'Bearer eyJ.admin.sig_OLD' }, true);
                }
            },
            {
                label: "Signature Verification",
                action: async (v) => {
                    ui.logFlow("Server recalculates hash of payload.", "info");
                    ui.logFlow("Hash Mismatch! Signature invalid.", "error");
                    await v.sendPacket('server', 'attacker', '403 Forbidden', { error: 'Invalid Signature' }, true);
                }
            }
        ]
    }
    // Can add more
};

// --- Initialization ---

const viz = new Visualizer();
let currentFlowSteps = [];

function loadScenario(key, attackKey = null) {
    state.isPlaying = false;
    state.currentFlow = key;
    state.currentStepIndex = -1;
    state.isAttackMode = !!attackKey;
    state.attackType = attackKey;

    ui.reset();

    const flowDef = FLOWS[key];
    let steps = [...flowDef.steps];
    let title = flowDef.title;
    let desc = flowDef.desc;

    if (attackKey && ATTACK_SCENARIOS[attackKey]) {
        const attack = ATTACK_SCENARIOS[attackKey];
        title += ` (${attack.title})`;
        // splice attack steps into the flow
        // For simplicity in this demo, we'll just append them or replace if specific logic
        // But let's just use the attack definition if it matches the flow
        if (attack.flow === key) {
            steps.push(...attack.steps);
        }
    }

    currentFlowSteps = steps;

    document.getElementById('current-scenario-title').innerText = title;
    document.getElementById('current-scenario-desc').innerText = desc;

    // UI Visuals
    document.querySelectorAll('.menu-item').forEach(b => b.classList.remove('active'));
    if (!attackKey) {
        document.querySelector(`[data-flow="${key}"]`)?.classList.add('active');
    } else {
        document.querySelector(`[data-attack="${attackKey}"]`)?.classList.add('active');
    }

    viz.setupScene(key, attackKey);
    renderStepIndicators();
}

function renderStepIndicators() {
    const container = document.getElementById('steps-labels');
    container.innerHTML = '';
    currentFlowSteps.forEach((s, i) => {
        // Optional: show limited labels to avoid crowding
        // if(i % 2 !== 0) return; 
        // For now simple count
    });
}

function nextStep() {
    if (state.currentStepIndex >= currentFlowSteps.length - 1) return;

    state.currentStepIndex++;
    const step = currentFlowSteps[state.currentStepIndex];

    ui.setProgressBar(state.currentStepIndex, currentFlowSteps.length);
    step.action(viz);
}

// --- Event Listeners ---

document.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', () => {
        const flow = btn.dataset.flow;
        const attack = btn.dataset.attack;
        if (flow) loadScenario(flow);
        if (attack) {
            const scenario = ATTACK_SCENARIOS[attack];
            if (scenario) loadScenario(scenario.flow, attack);
        }
    });
});

document.getElementById('btn-next').addEventListener('click', nextStep);

document.getElementById('btn-reset').addEventListener('click', () => {
    loadScenario(state.currentFlow, state.attackType);
});

// Inspector Tabs
document.querySelectorAll('.tab').forEach(t => {
    t.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');

        const mode = t.dataset.tab;
        const log = document.getElementById('log-container');
        const json = document.getElementById('json-container');

        if (mode === 'flow-log') {
            if (log) log.style.display = 'block';
            if (json) json.style.display = 'none';
        } else {
            if (log) log.style.display = 'none';
            if (json) json.style.display = 'block';
        }
    });
});

// Init
loadScenario('session');
