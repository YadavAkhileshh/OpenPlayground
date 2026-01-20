// ========================================
// Smart Contract Execution Simulator
// ========================================

class SmartContractSimulator {
    constructor() {
        // Constants
        this.DEFAULT_OWNER = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
        
        this.contracts = this.initializeContracts();
        this.currentContract = 'counter';
        this.state = {};
        this.executionSteps = [];
        this.currentStepIndex = 0;
        this.gasUsed = 0;
        this.gasLimit = 100000;
        this.isExecuting = false;
        this.isPaused = false;
        this.executionSpeed = 1000;
        this.executionInterval = null;
        this.stateHistory = [];
        
        this.init();
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadContract(this.currentContract);
        this.logMessage('info', 'System initialized. Ready for execution.');
    }

    setupElements() {
        this.elements = {
            // Contract selector
            contractBtns: document.querySelectorAll('.contract-btn'),
            
            // Code display
            contractCode: document.getElementById('contractCode'),
            
            // State
            stateVariables: document.getElementById('stateVariables'),
            parametersSection: document.getElementById('parametersSection'),
            resetStateBtn: document.getElementById('resetStateBtn'),
            
            // Execution controls
            executeBtn: document.getElementById('executeBtn'),
            stepBtn: document.getElementById('stepBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            stopBtn: document.getElementById('stopBtn'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            
            // Status
            statusIndicator: document.getElementById('statusIndicator'),
            statusText: document.getElementById('statusText'),
            
            // Execution visualization
            currentStep: document.getElementById('currentStep'),
            executionTimeline: document.getElementById('executionTimeline'),
            
            // Gas meter
            gasUsed: document.getElementById('gasUsed'),
            gasLimit: document.getElementById('gasLimit'),
            gasRemaining: document.getElementById('gasRemaining'),
            gasBar: document.getElementById('gasBar'),
            
            // Transaction log
            logContainer: document.getElementById('logContainer'),
            clearLogBtn: document.getElementById('clearLogBtn'),
            
            // State changes
            stateChangesContainer: document.getElementById('stateChangesContainer')
        };
    }

    setupEventListeners() {
        // Contract selection
        this.elements.contractBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.elements.contractBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadContract(btn.dataset.contract);
            });
        });

        // Execution controls
        this.elements.executeBtn.addEventListener('click', () => this.executeContract());
        this.elements.stepBtn.addEventListener('click', () => this.stepThrough());
        this.elements.pauseBtn.addEventListener('click', () => this.pauseExecution());
        this.elements.stopBtn.addEventListener('click', () => this.stopExecution());
        
        // Speed control
        this.elements.speedSlider.addEventListener('input', (e) => {
            this.executionSpeed = parseInt(e.target.value);
            const speed = (1000 / this.executionSpeed).toFixed(1);
            this.elements.speedValue.textContent = `${speed}x`;
        });

        // State reset
        this.elements.resetStateBtn.addEventListener('click', () => this.resetState());
        
        // Clear log
        this.elements.clearLogBtn.addEventListener('click', () => this.clearLog());
    }

    // ========== Contract Definitions ==========
    initializeContracts() {
        return {
            counter: {
                name: 'Counter Contract',
                code: `pragma solidity ^0.8.0;

contract Counter {
    uint256 public count = 0;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function increment() public {
        count = count + 1;
    }
    
    function decrement() public {
        require(count > 0, "Counter cannot go negative");
        count = count - 1;
    }
    
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        count = 0;
    }
}`,
                initialState: {
                    count: 0,
                    owner: this.DEFAULT_OWNER
                },
                functions: {
                    increment: {
                        params: [],
                        steps: [
                            { action: 'read', variable: 'count', gas: 200, desc: 'Read current count value' },
                            { action: 'compute', gas: 50, desc: 'Calculate count + 1' },
                            { action: 'write', variable: 'count', newValue: (state) => state.count + 1, gas: 5000, desc: 'Write new count value' },
                            { action: 'emit', gas: 375, desc: 'Emit state change event' }
                        ]
                    },
                    decrement: {
                        params: [],
                        steps: [
                            { action: 'read', variable: 'count', gas: 200, desc: 'Read current count value' },
                            { action: 'require', condition: (state) => state.count > 0, error: 'Counter cannot go negative', gas: 50, desc: 'Check if count > 0' },
                            { action: 'compute', gas: 50, desc: 'Calculate count - 1' },
                            { action: 'write', variable: 'count', newValue: (state) => state.count - 1, gas: 5000, desc: 'Write new count value' },
                            { action: 'emit', gas: 375, desc: 'Emit state change event' }
                        ]
                    },
                    reset: {
                        params: [],
                        steps: [
                            { action: 'read', variable: 'owner', gas: 200, desc: 'Read owner address' },
                            { action: 'require', condition: (state, params) => params.sender === state.owner, error: 'Only owner can reset', gas: 50, desc: 'Verify sender is owner' },
                            { action: 'write', variable: 'count', newValue: () => 0, gas: 5000, desc: 'Reset count to 0' },
                            { action: 'emit', gas: 375, desc: 'Emit state change event' }
                        ]
                    }
                }
            },
            transfer: {
                name: 'Token Transfer Contract',
                code: `pragma solidity ^0.8.0;

contract TokenTransfer {
    mapping(address => uint256) public balances;
    uint256 public totalSupply = 1000000;
    
    constructor() {
        balances[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) public {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        require(to != address(0), "Invalid recipient");
        
        balances[msg.sender] -= amount;
        balances[to] += amount;
    }
    
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}`,
                initialState: {
                    'balances[sender]': 1000000,
                    'balances[receiver]': 0,
                    totalSupply: 1000000
                },
                functions: {
                    transfer: {
                        params: [
                            { name: 'to', type: 'address', default: '0xRecipient' },
                            { name: 'amount', type: 'uint256', default: 100 }
                        ],
                        steps: [
                            { action: 'read', variable: 'balances[sender]', gas: 200, desc: 'Read sender balance' },
                            { action: 'require', condition: (state, params) => state['balances[sender]'] >= params.amount, error: 'Insufficient balance', gas: 50, desc: 'Check sender has enough tokens' },
                            { action: 'require', condition: (state, params) => params.to !== '0x0', error: 'Invalid recipient', gas: 50, desc: 'Validate recipient address' },
                            { action: 'compute', gas: 100, desc: 'Calculate new balances' },
                            { action: 'write', variable: 'balances[sender]', newValue: (state, params) => state['balances[sender]'] - params.amount, gas: 5000, desc: 'Deduct from sender' },
                            { action: 'write', variable: 'balances[receiver]', newValue: (state, params) => state['balances[receiver]'] + params.amount, gas: 5000, desc: 'Add to receiver' },
                            { action: 'emit', gas: 375, desc: 'Emit Transfer event' }
                        ]
                    }
                }
            },
            conditional: {
                name: 'Conditional Logic Contract',
                code: `pragma solidity ^0.8.0;

contract ConditionalLogic {
    uint256 public value = 50;
    string public status = "neutral";
    uint256 public highCount = 0;
    uint256 public lowCount = 0;
    
    function updateValue(uint256 newValue) public {
        value = newValue;
        
        if (newValue > 75) {
            status = "high";
            highCount += 1;
        } else if (newValue < 25) {
            status = "low";
            lowCount += 1;
        } else {
            status = "medium";
        }
    }
}`,
                initialState: {
                    value: 50,
                    status: 'neutral',
                    highCount: 0,
                    lowCount: 0
                },
                functions: {
                    updateValue: {
                        params: [
                            { name: 'newValue', type: 'uint256', default: 80 }
                        ],
                        steps: [
                            { action: 'write', variable: 'value', newValue: (state, params) => params.newValue, gas: 5000, desc: 'Update value' },
                            { action: 'read', variable: 'value', gas: 200, desc: 'Read new value' },
                            { action: 'conditional', condition: (state, params) => params.newValue > 75, gas: 50, desc: 'Check if value > 75', branch: 'high' },
                            { action: 'conditional', condition: (state, params) => params.newValue < 25, gas: 50, desc: 'Check if value < 25', branch: 'low' },
                            { action: 'write', variable: 'status', newValue: (state, params) => {
                                if (params.newValue > 75) return 'high';
                                if (params.newValue < 25) return 'low';
                                return 'medium';
                            }, gas: 5000, desc: 'Update status based on condition' },
                            { action: 'write', variable: 'highCount', newValue: (state, params) => {
                                return params.newValue > 75 ? state.highCount + 1 : state.highCount;
                            }, gas: 5000, desc: 'Increment counter if applicable' },
                            { action: 'emit', gas: 375, desc: 'Emit ValueUpdated event' }
                        ]
                    }
                }
            },
            storage: {
                name: 'Storage Manager Contract',
                code: `pragma solidity ^0.8.0;

contract StorageManager {
    mapping(uint256 => string) public data;
    uint256 public itemCount = 0;
    uint256 public lastModified;
    
    function store(uint256 id, string memory content) public {
        require(bytes(content).length > 0, "Content cannot be empty");
        
        data[id] = content;
        itemCount += 1;
        lastModified = block.timestamp;
    }
    
    function remove(uint256 id) public {
        require(bytes(data[id]).length > 0, "Item does not exist");
        
        delete data[id];
        itemCount -= 1;
        lastModified = block.timestamp;
    }
}`,
                initialState: {
                    'data[1]': 'Hello World',
                    itemCount: 1,
                    lastModified: 1705593600
                },
                functions: {
                    store: {
                        params: [
                            { name: 'id', type: 'uint256', default: 2 },
                            { name: 'content', type: 'string', default: 'New Data' }
                        ],
                        steps: [
                            { action: 'require', condition: (state, params) => params.content.length > 0, error: 'Content cannot be empty', gas: 50, desc: 'Validate content not empty' },
                            { action: 'write', variable: (state, params) => `data[${params.id}]`, newValue: (state, params) => params.content, gas: 20000, desc: 'Store data in mapping' },
                            { action: 'read', variable: 'itemCount', gas: 200, desc: 'Read current item count' },
                            { action: 'write', variable: 'itemCount', newValue: (state) => state.itemCount + 1, gas: 5000, desc: 'Increment item count' },
                            { action: 'write', variable: 'lastModified', newValue: () => Date.now(), gas: 5000, desc: 'Update timestamp' },
                            { action: 'emit', gas: 375, desc: 'Emit DataStored event' }
                        ]
                    },
                    remove: {
                        params: [
                            { name: 'id', type: 'uint256', default: 1 }
                        ],
                        steps: [
                            { action: 'read', variable: 'data[1]', gas: 200, desc: 'Check if item exists' },
                            { action: 'require', condition: (state, params) => state['data[1]'] && state['data[1]'].length > 0, error: 'Item does not exist', gas: 50, desc: 'Validate item exists' },
                            { action: 'write', variable: 'data[1]', newValue: () => '', gas: 5000, desc: 'Delete data from mapping' },
                            { action: 'read', variable: 'itemCount', gas: 200, desc: 'Read current item count' },
                            { action: 'write', variable: 'itemCount', newValue: (state) => state.itemCount - 1, gas: 5000, desc: 'Decrement item count' },
                            { action: 'write', variable: 'lastModified', newValue: () => Date.now(), gas: 5000, desc: 'Update timestamp' },
                            { action: 'emit', gas: 375, desc: 'Emit DataRemoved event' }
                        ]
                    }
                }
            }
        };
    }

    // ========== Contract Management ==========
    loadContract(contractName) {
        this.currentContract = contractName;
        const contract = this.contracts[contractName];
        
        // Reset state
        this.state = { ...contract.initialState };
        this.gasUsed = 0;
        this.executionSteps = [];
        this.currentStepIndex = 0;
        this.stateHistory = [];
        
        // Display code
        this.displayCode(contract.code);
        
        // Display state
        this.renderState();
        
        // Display function parameters
        this.renderParameters(contractName);
        
        // Clear visualizations
        this.elements.executionTimeline.innerHTML = '';
        this.elements.stateChangesContainer.innerHTML = '<div class="no-changes">No state changes yet. Execute a contract to see changes.</div>';
        this.updateGasMeter();
        this.updateStatus('Ready', 'ready');
        
        this.logMessage('info', `Loaded contract: ${contract.name}`);
    }

    displayCode(code) {
        // Simple syntax highlighting with basic context awareness to avoid
        // highlighting keywords inside string literals or comments.

        // Escape HTML to safely display code.
        let escaped = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Temporarily replace strings and comments with placeholders so that
        // keyword/type/number highlighting does not affect their contents.
        const placeholders = [];
        escaped = escaped.replace(/(["'].*?["'])|(\/\/.*$)/gm, (match, strLit, comment) => {
            const type = strLit ? 'string' : 'comment';
            const index = placeholders.push({ type, value: match }) - 1;
            return `__PLACEHOLDER_${index}__`;
        });

        // Apply syntax highlighting to the remaining code (excluding strings/comments).
        let highlighted = escaped
            .replace(/(pragma|contract|function|public|private|view|pure|require|if|else|return|uint256|string|address|mapping|constructor|memory)\b/g, '<span class="keyword">$1</span>')
            .replace(/(\w+)(\s*\()/g, '<span class="function-name">$1</span>$2')
            .replace(/(uint256|address|string|bool)\b/g, '<span class="type">$1</span>')
            .replace(/(\d+)/g, '<span class="number">$1</span>');

        // Restore string and comment placeholders with appropriate spans.
        highlighted = highlighted.replace(/__PLACEHOLDER_(\d+)__/g, (match, index) => {
            const placeholder = placeholders[Number(index)];
            if (!placeholder) {
                return match;
            }
            return `<span class="${placeholder.type}">${placeholder.value}</span>`;
        });
        
        this.elements.contractCode.innerHTML = highlighted;
    }

    renderState() {
        this.elements.stateVariables.innerHTML = '';
        
        Object.entries(this.state).forEach(([key, value]) => {
            const stateVar = document.createElement('div');
            stateVar.className = 'state-var';
            stateVar.innerHTML = `
                <span class="state-var-name">${key}</span>
                <span class="state-var-value">${this.formatValue(value)}</span>
            `;
            this.elements.stateVariables.appendChild(stateVar);
        });
    }

    renderParameters(contractName) {
        this.elements.parametersSection.innerHTML = '';
        
        const contract = this.contracts[contractName];
        const functionKeys = Object.keys(contract.functions);
        
        if (functionKeys.length === 0) return;
        
        // Function selector
        const funcSelector = document.createElement('div');
        funcSelector.className = 'param-input';
        funcSelector.innerHTML = `
            <label>Select Function:</label>
            <select id="functionSelect">
                ${functionKeys.map(key => `<option value="${key}">${key}()</option>`).join('')}
            </select>
        `;
        this.elements.parametersSection.appendChild(funcSelector);
        
        // Parameter inputs container
        const paramsContainer = document.createElement('div');
        paramsContainer.id = 'functionParams';
        this.elements.parametersSection.appendChild(paramsContainer);
        
        // Initial function parameters
        this.renderFunctionParameters(contractName, functionKeys[0]);
        
        // Function selector change listener
        document.getElementById('functionSelect').addEventListener('change', (e) => {
            this.renderFunctionParameters(contractName, e.target.value);
        });
    }

    renderFunctionParameters(contractName, functionName) {
        const contract = this.contracts[contractName];
        const func = contract.functions[functionName];
        const container = document.getElementById('functionParams');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!func.params || func.params.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-style: italic; margin-top: 10px;">No parameters required</p>';
            return;
        }
        
        func.params.forEach(param => {
            const paramInput = document.createElement('div');
            paramInput.className = 'param-input';
            paramInput.innerHTML = `
                <label>${param.name} (${param.type}):</label>
                <input type="${param.type === 'uint256' ? 'number' : 'text'}" 
                       id="param-${param.name}" 
                       value="${param.default}"
                       placeholder="Enter ${param.name}">
            `;
            container.appendChild(paramInput);
        });
    }

    // ========== Execution Logic ==========
    async executeContract() {
        if (this.isExecuting) return;
        
        const functionSelect = document.getElementById('functionSelect');
        if (!functionSelect) return;
        
        const functionName = functionSelect.value;
        const contract = this.contracts[this.currentContract];
        const func = contract.functions[functionName];
        
        // Gather parameters
        const params = { sender: this.state.owner || this.DEFAULT_OWNER };
        if (func.params) {
            func.params.forEach(param => {
                const input = document.getElementById(`param-${param.name}`);
                if (input) {
                    params[param.name] = param.type === 'uint256' ? parseInt(input.value) : input.value;
                }
            });
        }
        
        this.logMessage('info', `Executing function: ${functionName}(${JSON.stringify(params)})`);
        
        // Prepare execution steps
        this.executionSteps = func.steps;
        this.currentStepIndex = 0;
        this.gasUsed = 21000; // Base transaction gas
        this.isExecuting = true;
        this.isPaused = false;
        
        // Update UI
        this.updateStatus('Executing', 'executing');
        this.elements.executeBtn.disabled = true;
        this.elements.stepBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.stopBtn.disabled = false;
        
        // Render timeline
        this.renderTimeline();
        
        // Execute steps
        await this.executeSteps(params);
    }

    async executeSteps(params) {
        this.executionInterval = setInterval(() => {
            try {
                if (this.isPaused) return;

                if (this.currentStepIndex >= this.executionSteps.length) {
                    this.completeExecution(true);
                    return;
                }

                const step = this.executionSteps[this.currentStepIndex];
                this.executeStep(step, params);
                this.currentStepIndex++;

                this.updateCurrentStepDisplay();
            } catch (error) {
                // Ensure interval is cleared on unexpected errors
                const message = (error && error.message) ? error.message : 'Unexpected execution error';
                this.logMessage('error', `Execution error: ${message}`);
                
                // Only call completeExecution if execution has not already been finalized
                if (this.isExecuting) {
                    this.completeExecution(false, message);
                }
            }

    executeStep(step, params) {
        this.logMessage('info', `Step ${this.currentStepIndex + 1}: ${step.desc}`);
        
        // Add gas
        this.gasUsed += step.gas;
        this.updateGasMeter();
        
        // Mark step as active
        const stepElements = document.querySelectorAll('.execution-step');
        if (stepElements[this.currentStepIndex]) {
            stepElements.forEach(el => el.classList.remove('active'));
            stepElements[this.currentStepIndex].classList.add('active');
        }
        
        // Execute action
        try {
            switch (step.action) {
                case 'read':
                    this.logMessage('info', `Read ${step.variable}: ${this.state[step.variable]}`);
                    break;
                    
                case 'write':
                    const oldValue = this.state[step.variable];
                    const newValue = step.newValue(this.state, params);
                    this.state[step.variable] = newValue;
                    this.renderState();
                    this.addStateChange(step.variable, oldValue, newValue);
                    this.logMessage('success', `Write ${step.variable}: ${oldValue} → ${newValue}`);
                    break;
                    
                case 'require':
                    const condition = step.condition(this.state, params);
                    if (!condition) {
                        this.logMessage('error', `Require failed: ${step.error}`);
                        this.completeExecution(false, step.error);
                        throw new Error(step.error);
                    }
                    this.logMessage('success', `Require passed: ${step.desc}`);
                    break;
                    
                case 'compute':
                    this.logMessage('info', `Computing: ${step.desc}`);
                    break;
                    
                case 'conditional':
                    const condResult = step.condition(this.state, params);
                    this.logMessage('info', `Conditional check (${step.branch}): ${condResult}`);
                    break;
                    
                case 'emit':
                    this.logMessage('success', `Event emitted: ${step.desc}`);
                    break;
            }
            
            // Mark step as completed
            if (stepElements[this.currentStepIndex]) {
                stepElements[this.currentStepIndex].classList.add('completed');
                stepElements[this.currentStepIndex].classList.remove('active');
            }
            
        } catch (error) {
            // Even if a require-style check already reported the problem, log here to aid debugging.
            this.logMessage('error', `Execution error at step ${this.currentStepIndex + 1}${step && step.desc ? ` (${step.desc})` : ''}: ${error && error.message ? error.message : error}`);
            if (typeof console !== 'undefined' && console && typeof console.error === 'function') {
                console.error('SmartContractSimulator execution error:', error);
            }
        }
    }

    stepThrough() {
        // Single step execution
        const functionSelect = document.getElementById('functionSelect');
        if (!functionSelect) return;
        
        if (!this.isExecuting) {
            // Start execution in step mode
            const functionName = functionSelect.value;
            const contract = this.contracts[this.currentContract];
            const func = contract.functions[functionName];
            
            const params = { sender: this.state.owner || this.DEFAULT_OWNER };
            if (func.params) {
                func.params.forEach(param => {
                    const input = document.getElementById(`param-${param.name}`);
                    if (input) {
                        params[param.name] = param.type === 'uint256' ? parseInt(input.value) : input.value;
                    }
                });
            }

            this.executionSteps = func.steps;
            this.currentStepIndex = 0;
            this.gasUsed = 21000;
            this.isExecuting = true;
            this.isPaused = true; // Step mode is paused by default
            
            this.renderTimeline();
            this.updateStatus('Step Mode', 'executing');
            this.elements.executeBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
        }
        
        // Execute next step
        if (this.currentStepIndex < this.executionSteps.length) {
            const params = { sender: this.state.owner || this.DEFAULT_OWNER };
            const step = this.executionSteps[this.currentStepIndex];
            this.executeStep(step, params);
            this.currentStepIndex++;
            this.updateCurrentStepDisplay();
        } else {
            this.completeExecution(true);
        }
    }

    pauseExecution() {
        this.isPaused = !this.isPaused;
        this.elements.pauseBtn.innerHTML = this.isPaused ? '<span>▶️ Resume</span>' : '<span>⏸️ Pause</span>';
        this.updateStatus(this.isPaused ? 'Paused' : 'Executing', 'executing');
        this.logMessage('warning', this.isPaused ? 'Execution paused' : 'Execution resumed');
    }

    stopExecution() {
        clearInterval(this.executionInterval);
        this.isExecuting = false;
        this.isPaused = false;
        
        this.updateStatus('Stopped', 'ready');
        this.elements.executeBtn.disabled = false;
        this.elements.stepBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.stopBtn.disabled = true;
        this.elements.pauseBtn.innerHTML = '<span>⏸️ Pause</span>';
        
        this.logMessage('warning', 'Execution stopped by user');
    }

    completeExecution(success, error = null) {
        clearInterval(this.executionInterval);
        this.isExecuting = false;
        this.isPaused = false;
        
        if (success) {
            this.updateStatus('Success', 'success');
            this.logMessage('success', `Transaction completed successfully. Gas used: ${this.gasUsed}`);
        } else {
            this.updateStatus('Reverted', 'error');
            this.logMessage('error', `Transaction reverted: ${error}. Gas used: ${this.gasUsed}`);
        }
        
        this.elements.executeBtn.disabled = false;
        this.elements.stepBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.stopBtn.disabled = true;
        this.elements.pauseBtn.innerHTML = '<span>⏸️ Pause</span>';
    }

    resetState() {
        const contract = this.contracts[this.currentContract];
        this.state = { ...contract.initialState };
        this.gasUsed = 0;
        this.renderState();
        this.updateGasMeter();
        this.stateHistory = [];
        this.elements.stateChangesContainer.innerHTML = '<div class="no-changes">No state changes yet. Execute a contract to see changes.</div>';
        this.logMessage('info', 'State reset to initial values');
    }

    // ========== UI Updates ==========
    renderTimeline() {
        this.elements.executionTimeline.innerHTML = '';
        
        this.executionSteps.forEach((step, index) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'execution-step';
            stepEl.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <div class="step-title">${step.action.toUpperCase()}</div>
                    <div class="step-description">${step.desc}</div>
                </div>
                <div class="step-gas">${step.gas.toLocaleString()} gas</div>
            `;
            this.elements.executionTimeline.appendChild(stepEl);
        });
    }

    updateCurrentStepDisplay() {
        this.elements.currentStep.textContent = `Step ${this.currentStepIndex} of ${this.executionSteps.length}`;
    }

    updateGasMeter() {
        this.elements.gasUsed.textContent = this.gasUsed.toLocaleString();
        this.elements.gasRemaining.textContent = (this.gasLimit - this.gasUsed).toLocaleString();
        
        const percentage = (this.gasUsed / this.gasLimit) * 100;
        this.elements.gasBar.style.width = `${percentage}%`;
        
        if (percentage > 90) {
            this.elements.gasBar.classList.add('danger');
        } else if (percentage > 80) {
            this.elements.gasBar.classList.add('warning');
        } else {
            this.elements.gasBar.classList.remove('warning', 'danger');
        }
    }

    updateStatus(text, type) {
        this.elements.statusText.textContent = text;
        this.elements.statusIndicator.className = `status-indicator ${type}`;
    }

    addStateChange(variable, oldValue, newValue) {
        if (this.elements.stateChangesContainer.querySelector('.no-changes')) {
            this.elements.stateChangesContainer.innerHTML = '';
        }
        
        const changeEl = document.createElement('div');
        changeEl.className = 'state-change-item';
        changeEl.innerHTML = `
            <div class="change-variable">${variable}</div>
            <div class="change-arrow">→</div>
            <div class="change-old">${this.formatValue(oldValue)}</div>
            <div class="change-arrow">→</div>
            <div class="change-new">${this.formatValue(newValue)}</div>
        `;
        this.elements.stateChangesContainer.appendChild(changeEl);
    }

    formatValue(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'number') return value.toLocaleString();
        return String(value);
    }

    // ========== Logging ==========
    logMessage(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `
            <span class="log-timestamp">${timestamp}</span>
            <span class="log-message">${message}</span>
        `;
        this.elements.logContainer.appendChild(logEntry);
        this.elements.logContainer.scrollTop = this.elements.logContainer.scrollHeight;
    }

    clearLog() {
        this.elements.logContainer.innerHTML = '';
        this.logMessage('info', 'Log cleared');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.simulator = new SmartContractSimulator();
});
