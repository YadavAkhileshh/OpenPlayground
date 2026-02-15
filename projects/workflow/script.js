
        const componentsList = document.getElementById('components-list');
        const workflowCanvas = document.getElementById('workflow-canvas');
        const emptyCanvas = document.getElementById('empty-canvas');
        const propertiesForm = document.getElementById('properties-form');
        const emptyProperties = document.getElementById('empty-properties');
        const nodeProperties = document.getElementById('node-properties');
        const nodeCount = document.getElementById('node-count');
        const contextMenu = document.getElementById('context-menu');
        const notification = document.getElementById('notification');
        const notificationText = document.getElementById('notification-text');
        
        // Buttons
        const saveWorkflowBtn = document.getElementById('save-workflow-btn');
        const loadWorkflowBtn = document.getElementById('load-workflow-btn');
        const clearCanvasBtn = document.getElementById('clear-canvas-btn');
        const exportWorkflowBtn = document.getElementById('export-workflow-btn');
        
        // Workflow info elements
        const workflowNameEl = document.getElementById('workflow-name');
        const lastSavedEl = document.getElementById('last-saved');
        const workflowStatusEl = document.getElementById('workflow-status');
        
        // State variables
        let workflow = {
            name: "Untitled Workflow",
            nodes: [],
            connections: [],
            lastModified: null
        };
        
        let selectedNode = null;
        let isDragging = false;
        let isConnecting = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let currentNodeOffsetX = 0;
        let currentNodeOffsetY = 0;
        let currentConnection = null;
        let contextMenuNode = null;
        
        // Component templates
        const componentTemplates = {
            'webhook': {
                type: 'trigger',
                name: 'Webhook Trigger',
                icon: 'fa-bolt',
                description: 'Start workflow on HTTP request',
                properties: {
                    url: { type: 'text', label: 'Webhook URL', value: '', placeholder: 'https://example.com/webhook' },
                    method: { type: 'select', label: 'HTTP Method', value: 'POST', options: ['GET', 'POST', 'PUT', 'DELETE'] },
                    auth: { type: 'checkbox', label: 'Require Authentication', value: false }
                }
            },
            'schedule': {
                type: 'trigger',
                name: 'Schedule Trigger',
                icon: 'fa-clock',
                description: 'Run at specific time or interval',
                properties: {
                    scheduleType: { type: 'select', label: 'Schedule Type', value: 'interval', options: ['Interval', 'Specific Time', 'Cron'] },
                    interval: { type: 'text', label: 'Interval (seconds)', value: '3600', placeholder: '3600' },
                    time: { type: 'time', label: 'Specific Time', value: '09:00' }
                }
            },
            'email': {
                type: 'action',
                name: 'Send Email',
                icon: 'fa-envelope',
                description: 'Send email to recipients',
                properties: {
                    to: { type: 'text', label: 'To', value: '', placeholder: 'recipient@example.com' },
                    subject: { type: 'text', label: 'Subject', value: '', placeholder: 'Email subject' },
                    body: { type: 'textarea', label: 'Body', value: '', placeholder: 'Email content' }
                }
            },
            'database': {
                type: 'action',
                name: 'Database Query',
                icon: 'fa-database',
                description: 'Run SQL or NoSQL query',
                properties: {
                    dbType: { type: 'select', label: 'Database Type', value: 'mysql', options: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'] },
                    query: { type: 'textarea', label: 'Query', value: '', placeholder: 'SELECT * FROM users' },
                    connection: { type: 'text', label: 'Connection String', value: '', placeholder: 'mysql://user:pass@localhost/db' }
                }
            },
            'if-else': {
                type: 'condition',
                name: 'If/Else Condition',
                icon: 'fa-code-branch',
                description: 'Branch workflow based on condition',
                properties: {
                    condition: { type: 'textarea', label: 'Condition', value: '', placeholder: 'data.value > 10' },
                    trueLabel: { type: 'text', label: 'True Branch Label', value: 'Yes', placeholder: 'Condition met' },
                    falseLabel: { type: 'text', label: 'False Branch Label', value: 'No', placeholder: 'Condition not met' }
                }
            },
            'switch': {
                type: 'condition',
                name: 'Switch Condition',
                icon: 'fa-random',
                description: 'Multiple path branching',
                properties: {
                    cases: { type: 'textarea', label: 'Cases (one per line)', value: '', placeholder: 'case1: value == 1\ncase2: value == 2\ndefault: otherwise' }
                }
            },
            'transform': {
                type: 'data',
                name: 'Data Transform',
                icon: 'fa-exchange-alt',
                description: 'Convert or manipulate data',
                properties: {
                    transformation: { type: 'select', label: 'Transformation Type', value: 'map', options: ['Map', 'Filter', 'Reduce', 'Custom'] },
                    script: { type: 'textarea', label: 'Transformation Script', value: '', placeholder: 'return data.map(item => item.name)' }
                }
            },
            'api': {
                type: 'data',
                name: 'API Call',
                icon: 'fa-cloud',
                description: 'Call external REST API',
                properties: {
                    url: { type: 'text', label: 'API URL', value: '', placeholder: 'https://api.example.com/data' },
                    method: { type: 'select', label: 'HTTP Method', value: 'GET', options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
                    headers: { type: 'textarea', label: 'Headers (JSON)', value: '{\n  "Content-Type": "application/json"\n}', placeholder: 'JSON format' }
                }
            },
            'notification': {
                type: 'output',
                name: 'Send Notification',
                icon: 'fa-bell',
                description: 'Push or in-app notification',
                properties: {
                    type: { type: 'select', label: 'Notification Type', value: 'push', options: ['Push', 'Email', 'SMS', 'In-app'] },
                    title: { type: 'text', label: 'Title', value: '', placeholder: 'Notification title' },
                    message: { type: 'textarea', label: 'Message', value: '', placeholder: 'Notification content' }
                }
            },
            'webhook-out': {
                type: 'output',
                name: 'Webhook Output',
                icon: 'fa-external-link-alt',
                description: 'Send data to external URL',
                properties: {
                    url: { type: 'text', label: 'Target URL', value: '', placeholder: 'https://example.com/webhook' },
                    method: { type: 'select', label: 'HTTP Method', value: 'POST', options: ['POST', 'PUT', 'PATCH'] },
                    dataFormat: { type: 'select', label: 'Data Format', value: 'json', options: ['JSON', 'XML', 'Form Data'] }
                }
            }
        };
        
        // Initialize the app
        function init() {
            // Load saved workflow if exists
            loadSavedWorkflow();
            
            // Set up event listeners
            setupEventListeners();
            
            // Render initial workflow
            renderWorkflow();
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Component drag and drop
            componentsList.addEventListener('mousedown', startComponentDrag);
            
            // Canvas events
            workflowCanvas.addEventListener('dragover', handleDragOver);
            workflowCanvas.addEventListener('drop', handleDrop);
            workflowCanvas.addEventListener('mouseup', handleCanvasMouseUp);
            workflowCanvas.addEventListener('mousemove', handleCanvasMouseMove);
            
            // Context menu
            document.addEventListener('click', hideContextMenu);
            
            // Context menu actions
            document.getElementById('context-edit').addEventListener('click', () => {
                if (contextMenuNode) {
                    selectNode(contextMenuNode);
                    hideContextMenu();
                }
            });
            
            document.getElementById('context-duplicate').addEventListener('click', () => {
                if (contextMenuNode) {
                    duplicateNode(contextMenuNode);
                    hideContextMenu();
                }
            });
            
            document.getElementById('context-delete').addEventListener('click', () => {
                if (contextMenuNode) {
                    deleteNode(contextMenuNode);
                    hideContextMenu();
                }
            });
            
            // Button events
            saveWorkflowBtn.addEventListener('click', saveWorkflow);
            loadWorkflowBtn.addEventListener('click', loadWorkflow);
            clearCanvasBtn.addEventListener('click', clearCanvas);
            exportWorkflowBtn.addEventListener('click', exportWorkflow);
            
            // Keyboard shortcuts
            document.addEventListener('keydown', handleKeyDown);
        }
        
        // Start dragging a component from the components list
        function startComponentDrag(e) {
            const componentItem = e.target.closest('.component-item');
            if (!componentItem) return;
            
            e.preventDefault();
            
            // Add dragging class
            componentItem.classList.add('dragging');
            
            // Get component type
            const componentType = componentItem.dataset.component;
            
            // Create a ghost image for dragging
            const ghost = componentItem.cloneNode(true);
            ghost.style.position = 'absolute';
            ghost.style.opacity = '0.7';
            ghost.style.pointerEvents = 'none';
            ghost.style.zIndex = '1000';
            ghost.style.width = componentItem.offsetWidth + 'px';
            ghost.style.height = componentItem.offsetHeight + 'px';
            ghost.style.left = e.pageX + 'px';
            ghost.style.top = e.pageY + 'px';
            document.body.appendChild(ghost);
            
            // Track mouse movement
            function onMouseMove(e) {
                ghost.style.left = e.pageX + 'px';
                ghost.style.top = e.pageY + 'px';
            }
            
            function onMouseUp(e) {
                // Remove ghost
                document.body.removeChild(ghost);
                componentItem.classList.remove('dragging');
                
                // Remove event listeners
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                // Check if dropped on canvas
                const canvasRect = workflowCanvas.getBoundingClientRect();
                if (
                    e.clientX >= canvasRect.left &&
                    e.clientX <= canvasRect.right &&
                    e.clientY >= canvasRect.top &&
                    e.clientY <= canvasRect.bottom
                ) {
                    // Add node to canvas
                    const x = e.clientX - canvasRect.left;
                    const y = e.clientY - canvasRect.top;
                    addNode(componentType, x, y);
                }
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
        
        // Handle drag over canvas
        function handleDragOver(e) {
            e.preventDefault();
            workflowCanvas.classList.add('drag-over');
        }
        
        // Handle drop on canvas
        function handleDrop(e) {
            e.preventDefault();
            workflowCanvas.classList.remove('drag-over');
            
            // This is handled by the component drag system
        }
        
        // Add a node to the workflow
        function addNode(componentType, x, y) {
            const template = componentTemplates[componentType];
            if (!template) return;
            
            const nodeId = 'node-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            
            const node = {
                id: nodeId,
                type: template.type,
                component: componentType,
                name: template.name,
                x: x - 90, // Center the node
                y: y - 60,
                properties: JSON.parse(JSON.stringify(template.properties))
            };
            
            // Set default values
            Object.keys(node.properties).forEach(key => {
                if (node.properties[key].value === '') {
                    // Set some sensible defaults based on property type
                    if (node.properties[key].type === 'text') {
                        node.properties[key].value = '';
                    } else if (node.properties[key].type === 'textarea') {
                        node.properties[key].value = '';
                    }
                }
            });
            
            workflow.nodes.push(node);
            renderWorkflow();
            updateNodeCount();
            
            // Select the new node
            selectNode(nodeId);
            
            showNotification(`Added ${template.name} to workflow`);
        }
        
        // Render the workflow canvas
        function renderWorkflow() {
            // Clear canvas
            workflowCanvas.innerHTML = '';
            
            // Show/hide empty canvas message
            if (workflow.nodes.length === 0) {
                emptyCanvas.style.display = 'flex';
            } else {
                emptyCanvas.style.display = 'none';
                
                // Render connections first (so they appear behind nodes)
                renderConnections();
                
                // Render nodes
                workflow.nodes.forEach(node => {
                    renderNode(node);
                });
            }
        }
        
        // Render a single node
        function renderNode(node) {
            const template = componentTemplates[node.component];
            if (!template) return;
            
            const nodeEl = document.createElement('div');
            nodeEl.className = `workflow-node ${node.type}-node ${selectedNode === node.id ? 'selected' : ''}`;
            nodeEl.id = node.id;
            nodeEl.style.left = node.x + 'px';
            nodeEl.style.top = node.y + 'px';
            
            // Node header
            const header = document.createElement('div');
            header.className = 'node-header';
            
            const icon = document.createElement('div');
            icon.className = 'node-icon';
            icon.innerHTML = `<i class="fas ${template.icon}"></i>`;
            
            const title = document.createElement('div');
            title.className = 'node-title';
            title.textContent = template.name;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'node-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteNode(node.id);
            });
            
            header.appendChild(icon);
            header.appendChild(title);
            header.appendChild(removeBtn);
            
            // Node content
            const content = document.createElement('div');
            content.className = 'node-content';
            
            // Add some sample inputs/outputs based on node type
            const inputs = [];
            const outputs = [];
            
            if (node.type === 'trigger') {
                outputs.push('Trigger Output');
            } else if (node.type === 'action') {
                inputs.push('Input Data');
                outputs.push('Action Result');
            } else if (node.type === 'condition') {
                inputs.push('Condition Input');
                outputs.push('True');
                outputs.push('False');
            } else if (node.type === 'data') {
                inputs.push('Data Input');
                outputs.push('Transformed Data');
            } else if (node.type === 'output') {
                inputs.push('Final Data');
            }
            
            inputs.forEach(input => {
                const inputEl = document.createElement('div');
                inputEl.className = 'node-input';
                inputEl.innerHTML = `<i class="fas fa-arrow-right"></i> ${input}`;
                content.appendChild(inputEl);
            });
            
            outputs.forEach(output => {
                const outputEl = document.createElement('div');
                outputEl.className = 'node-input';
                outputEl.innerHTML = `${output} <i class="fas fa-arrow-right"></i>`;
                content.appendChild(outputEl);
            });
            
            // Connectors
            const inputConnector = document.createElement('div');
            inputConnector.className = 'node-connector input';
            inputConnector.dataset.node = node.id;
            inputConnector.dataset.type = 'input';
            
            const outputConnector = document.createElement('div');
            outputConnector.className = 'node-connector output';
            outputConnector.dataset.node = node.id;
            outputConnector.dataset.type = 'output';
            
            // Add event listeners
            nodeEl.addEventListener('mousedown', startNodeDrag);
            nodeEl.addEventListener('click', (e) => {
                e.stopPropagation();
                selectNode(node.id);
            });
            nodeEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                showContextMenu(e, node.id);
            });
            
            inputConnector.addEventListener('mousedown', startConnection);
            outputConnector.addEventListener('mousedown', startConnection);
            
            // Assemble node
            nodeEl.appendChild(header);
            nodeEl.appendChild(content);
            nodeEl.appendChild(inputConnector);
            nodeEl.appendChild(outputConnector);
            
            workflowCanvas.appendChild(nodeEl);
        }
        
        // Render connections between nodes
        function renderConnections() {
            // For now, we'll just show sample connections
            // In a full implementation, this would render actual connections from workflow.connections
            
            // Clear existing connections
            document.querySelectorAll('.workflow-connection').forEach(el => el.remove());
            
            // Create sample connections between first few nodes
            for (let i = 0; i < workflow.nodes.length - 1; i++) {
                const node1 = workflow.nodes[i];
                const node2 = workflow.nodes[i + 1];
                
                // Create connection element
                const connectionEl = document.createElement('div');
                connectionEl.className = 'workflow-connection';
                
                // Create SVG line
                const svgNS = "http://www.w3.org/2000/svg";
                const svg = document.createElementNS(svgNS, "svg");
                svg.setAttribute('width', '100%');
                svg.setAttribute('height', '100%');
                svg.style.position = 'absolute';
                svg.style.top = '0';
                svg.style.left = '0';
                
                const line = document.createElementNS(svgNS, "path");
                line.setAttribute('class', 'connection-line');
                
                // Calculate positions
                const x1 = node1.x + 180; // Right side of node1
                const y1 = node1.y + 80;  // Middle of node1
                const x2 = node2.x;       // Left side of node2
                const y2 = node2.y + 80;  // Middle of node2
                
                // Create curved path
                const path = `M ${x1} ${y1} C ${x1 + 50} ${y1}, ${x2 - 50} ${y2}, ${x2} ${y2}`;
                line.setAttribute('d', path);
                
                svg.appendChild(line);
                connectionEl.appendChild(svg);
                workflowCanvas.appendChild(connectionEl);
            }
        }
        
        // Start dragging a node
        function startNodeDrag(e) {
            if (e.target.classList.contains('node-connector') || 
                e.target.classList.contains('node-remove')) {
                return;
            }
            
            e.preventDefault();
            isDragging = true;
            
            const nodeEl = e.currentTarget;
            const nodeId = nodeEl.id;
            const node = workflow.nodes.find(n => n.id === nodeId);
            
            if (!node) return;
            
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            currentNodeOffsetX = node.x;
            currentNodeOffsetY = node.y;
            
            function onMouseMove(e) {
                if (!isDragging) return;
                
                const deltaX = e.clientX - dragStartX;
                const deltaY = e.clientY - dragStartY;
                
                node.x = currentNodeOffsetX + deltaX;
                node.y = currentNodeOffsetY + deltaY;
                
                nodeEl.style.left = node.x + 'px';
                nodeEl.style.top = node.y + 'px';
                
                // Update connections
                renderConnections();
            }
            
            function onMouseUp() {
                isDragging = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                // Update workflow
                updateWorkflowStatus();
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
        
        // Start creating a connection
        function startConnection(e) {
            e.stopPropagation();
            e.preventDefault();
            
            isConnecting = true;
            const connector = e.currentTarget;
            const nodeId = connector.dataset.node;
            const connectorType = connector.dataset.type;
            
            // Create connection line
            currentConnection = {
                startNode: nodeId,
                startType: connectorType,
                startX: e.clientX,
                startY: e.clientY
            };
            
            // Create temporary connection line
            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.position = 'absolute';
            svg.style.top = '0';
            svg.style.left = '0';
            svg.style.pointerEvents = 'none';
            svg.id = 'temp-connection';
            
            const line = document.createElementNS(svgNS, "path");
            line.setAttribute('class', 'connection-line active');
            line.setAttribute('id', 'temp-line');
            
            svg.appendChild(line);
            workflowCanvas.appendChild(svg);
            
            function onMouseMove(e) {
                if (!isConnecting) return;
                
                // Update temp line
                const canvasRect = workflowCanvas.getBoundingClientRect();
                const startX = currentConnection.startX - canvasRect.left;
                const startY = currentConnection.startY - canvasRect.top;
                const endX = e.clientX - canvasRect.left;
                const endY = e.clientY - canvasRect.top;
                
                const path = `M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`;
                line.setAttribute('d', path);
            }
            
            function onMouseUp(e) {
                isConnecting = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                
                // Remove temp line
                const tempSvg = document.getElementById('temp-connection');
                if (tempSvg) {
                    tempSvg.remove();
                }
                
                // Check if we connected to another connector
                const targetEl = document.elementFromPoint(e.clientX, e.clientY);
                if (targetEl && targetEl.classList.contains('node-connector')) {
                    const targetNodeId = targetEl.dataset.node;
                    const targetType = targetEl.dataset.type;
                    
                    // Can't connect input to input or output to output
                    if (connectorType !== targetType) {
                        // Create connection
                        const connection = {
                            id: 'conn-' + Date.now(),
                            from: connectorType === 'output' ? nodeId : targetNodeId,
                            to: connectorType === 'output' ? targetNodeId : nodeId,
                            fromType: connectorType === 'output' ? 'output' : 'input',
                            toType: connectorType === 'output' ? 'input' : 'output'
                        };
                        
                        workflow.connections.push(connection);
                        renderConnections();
                        showNotification('Connected nodes');
                    }
                }
                
                currentConnection = null;
            }
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
        
        // Handle canvas mouse events
        function handleCanvasMouseUp(e) {
            if (e.button === 0) { // Left click
                // Deselect node if clicking on empty canvas
                if (e.target === workflowCanvas || e.target.classList.contains('workflow-canvas')) {
                    selectNode(null);
                }
            }
        }
        
        function handleCanvasMouseMove(e) {
            // Handle connection drawing
            if (isConnecting && currentConnection) {
                // This is handled by the connection system
            }
        }
        
        // Select a node
        function selectNode(nodeId) {
            // Deselect previously selected node
            if (selectedNode) {
                const prevNodeEl = document.getElementById(selectedNode);
                if (prevNodeEl) {
                    prevNodeEl.classList.remove('selected');
                }
            }
            
            // Select new node
            selectedNode = nodeId;
            
            if (nodeId) {
                const nodeEl = document.getElementById(nodeId);
                if (nodeEl) {
                    nodeEl.classList.add('selected');
                }
                
                // Show node properties
                showNodeProperties(nodeId);
            } else {
                // Show empty properties
                showEmptyProperties();
            }
        }
        
        // Show node properties in the properties panel
        function showNodeProperties(nodeId) {
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node) return;
            
            const template = componentTemplates[node.component];
            if (!template) return;
            
            // Hide empty properties, show node properties
            emptyProperties.style.display = 'none';
            nodeProperties.style.display = 'block';
            
            // Populate properties form
            let html = `
                <div class="form-group">
                    <label>Node Name</label>
                    <input type="text" id="node-name" value="${template.name}" disabled>
                </div>
                
                <div class="form-group">
                    <label>Node Type</label>
                    <input type="text" value="${node.type}" disabled>
                </div>
            `;
            
            // Add properties based on template
            Object.keys(node.properties).forEach(key => {
                const prop = node.properties[key];
                html += `<div class="form-group">`;
                html += `<label>${prop.label}</label>`;
                
                if (prop.type === 'text') {
                    html += `<input type="text" class="node-property" data-property="${key}" value="${prop.value}" placeholder="${prop.placeholder || ''}">`;
                } else if (prop.type === 'textarea') {
                    html += `<textarea class="node-property" data-property="${key}" placeholder="${prop.placeholder || ''}" rows="3">${prop.value}</textarea>`;
                } else if (prop.type === 'select') {
                    html += `<select class="node-property" data-property="${key}">`;
                    prop.options.forEach(option => {
                        const selected = option === prop.value ? 'selected' : '';
                        html += `<option value="${option}" ${selected}>${option}</option>`;
                    });
                    html += `</select>`;
                } else if (prop.type === 'checkbox') {
                    const checked = prop.value ? 'checked' : '';
                    html += `<div style="margin-top: 8px;">
                        <input type="checkbox" class="node-property" data-property="${key}" ${checked} id="prop-${key}">
                        <label for="prop-${key}" style="display: inline; margin-left: 8px;">${prop.label}</label>
                    </div>`;
                } else if (prop.type === 'time') {
                    html += `<input type="time" class="node-property" data-property="${key}" value="${prop.value}">`;
                }
                
                html += `</div>`;
            });
            
            // Add update button
            html += `<button class="btn btn-primary" id="update-node-btn">
                <i class="fas fa-save"></i> Update Node
            </button>`;
            
            nodeProperties.innerHTML = html;
            
            // Add event listener to update button
            document.getElementById('update-node-btn').addEventListener('click', () => {
                updateNodeProperties(nodeId);
            });
            
            // Add event listeners to property inputs
            document.querySelectorAll('.node-property').forEach(input => {
                input.addEventListener('change', () => {
                    updateWorkflowStatus();
                });
            });
        }
        
        // Show empty properties panel
        function showEmptyProperties() {
            emptyProperties.style.display = 'block';
            nodeProperties.style.display = 'none';
        }
        
        // Update node properties
        function updateNodeProperties(nodeId) {
            const node = workflow.nodes.find(n => n.id === nodeId);
            if (!node) return;
            
            // Update properties from form
            document.querySelectorAll('.node-property').forEach(input => {
                const property = input.dataset.property;
                if (property in node.properties) {
                    if (node.properties[property].type === 'checkbox') {
                        node.properties[property].value = input.checked;
                    } else {
                        node.properties[property].value = input.value;
                    }
                }
            });
            
            showNotification('Node properties updated');
            updateWorkflowStatus();
        }
        
        // Delete a node
        function deleteNode(nodeId) {
            if (confirm('Are you sure you want to delete this node?')) {
                // Remove node
                workflow.nodes = workflow.nodes.filter(n => n.id !== nodeId);
                
                // Remove connections involving this node
                workflow.connections = workflow.connections.filter(conn => 
                    conn.from !== nodeId && conn.to !== nodeId
                );
                
                // If deleted node was selected, deselect it
                if (selectedNode === nodeId) {
                    selectNode(null);
                }
                
                renderWorkflow();
                updateNodeCount();
                updateWorkflowStatus();
                
                showNotification('Node deleted');
            }
        }
        
        // Duplicate a node
        function duplicateNode(nodeId) {
            const originalNode = workflow.nodes.find(n => n.id === nodeId);
            if (!originalNode) return;
            
            // Create a copy with new ID
            const newNode = JSON.parse(JSON.stringify(originalNode));
            newNode.id = 'node-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            newNode.x = originalNode.x + 30;
            newNode.y = originalNode.y + 30;
            
            workflow.nodes.push(newNode);
            renderWorkflow();
            updateNodeCount();
            selectNode(newNode.id);
            
            showNotification('Node duplicated');
        }
        
        // Show context menu
        function showContextMenu(e, nodeId) {
            e.preventDefault();
            
            contextMenuNode = nodeId;
            
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.style.display = 'block';
        }
        
        // Hide context menu
        function hideContextMenu() {
            contextMenu.style.display = 'none';
            contextMenuNode = null;
        }
        
        // Update node count display
        function updateNodeCount() {
            const count = workflow.nodes.length;
            nodeCount.textContent = `${count} node${count !== 1 ? 's' : ''}`;
        }
        
        // Save workflow
        function saveWorkflow() {
            const name = prompt('Enter workflow name:', workflow.name);
            if (name === null) return; // User cancelled
            
            workflow.name = name || 'Untitled Workflow';
            workflow.lastModified = new Date().toISOString();
            
            // Save to localStorage
            localStorage.setItem('workflowBuilder_current', JSON.stringify(workflow));
            
            // Also save to named storage
            const savedWorkflows = JSON.parse(localStorage.getItem('workflowBuilder_saved') || '[]');
            const existingIndex = savedWorkflows.findIndex(w => w.name === workflow.name);
            
            if (existingIndex >= 0) {
                savedWorkflows[existingIndex] = workflow;
            } else {
                savedWorkflows.push(workflow);
            }
            
            localStorage.setItem('workflowBuilder_saved', JSON.stringify(savedWorkflows));
            
            // Update UI
            workflowNameEl.textContent = workflow.name;
            lastSavedEl.textContent = new Date().toLocaleString();
            workflowStatusEl.textContent = 'Saved';
            workflowStatusEl.style.color = '#10b981';
            
            showNotification(`Workflow "${workflow.name}" saved successfully`);
        }
        
        // Load saved workflow
        function loadWorkflow() {
            const savedWorkflows = JSON.parse(localStorage.getItem('workflowBuilder_saved') || '[]');
            
            if (savedWorkflows.length === 0) {
                alert('No saved workflows found');
                return;
            }
            
            const workflowNames = savedWorkflows.map(w => w.name);
            const selectedName = prompt(
                'Enter workflow name to load:\n\n' + workflowNames.join('\n'),
                workflowNames[0]
            );
            
            if (selectedName === null) return;
            
            const workflowToLoad = savedWorkflows.find(w => w.name === selectedName);
            if (!workflowToLoad) {
                alert(`Workflow "${selectedName}" not found`);
                return;
            }
            
            // Load workflow
            workflow = JSON.parse(JSON.stringify(workflowToLoad));
            
            // Update UI
            renderWorkflow();
            selectNode(null);
            updateNodeCount();
            
            workflowNameEl.textContent = workflow.name;
            lastSavedEl.textContent = workflow.lastModified ? new Date(workflow.lastModified).toLocaleString() : 'Never';
            workflowStatusEl.textContent = 'Loaded';
            workflowStatusEl.style.color = '#0ea5e9';
            
            showNotification(`Workflow "${workflow.name}" loaded`);
        }
        
        // Load saved workflow on init
        function loadSavedWorkflow() {
            const saved = localStorage.getItem('workflowBuilder_current');
            if (saved) {
                try {
                    workflow = JSON.parse(saved);
                    
                    // Update UI
                    workflowNameEl.textContent = workflow.name;
                    lastSavedEl.textContent = workflow.lastModified ? new Date(workflow.lastModified).toLocaleString() : 'Never';
                    workflowStatusEl.textContent = 'Loaded';
                    workflowStatusEl.style.color = '#0ea5e9';
                } catch (e) {
                    console.error('Error loading saved workflow:', e);
                }
            }
        }
        
        // Clear canvas
        function clearCanvas() {
            if (confirm('Are you sure you want to clear the canvas? This will remove all nodes and connections.')) {
                workflow.nodes = [];
                workflow.connections = [];
                
                renderWorkflow();
                selectNode(null);
                updateNodeCount();
                updateWorkflowStatus();
                
                showNotification('Canvas cleared');
            }
        }
        
        // Export workflow
        function exportWorkflow() {
            const exportData = {
                ...workflow,
                exportDate: new Date().toISOString(),
                exportTool: 'Workflow Builder'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `${workflow.name.replace(/\s+/g, '_')}_workflow.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showNotification('Workflow exported');
        }
        
        // Update workflow status
        function updateWorkflowStatus() {
            workflowStatusEl.textContent = 'Unsaved changes';
            workflowStatusEl.style.color = '#f59e0b';
        }
        
        // Handle keyboard shortcuts
        function handleKeyDown(e) {
            // Delete key to delete selected node
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (selectedNode) {
                    e.preventDefault();
                    deleteNode(selectedNode);
                }
            }
            
            // Escape to deselect
            if (e.key === 'Escape') {
                selectNode(null);
            }
            
            // Ctrl/Cmd + S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveWorkflow();
            }
        }
        
        // Show notification
        function showNotification(message) {
            notificationText.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }
        
        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);
    