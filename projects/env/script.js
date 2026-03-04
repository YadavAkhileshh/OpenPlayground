        // DOM Elements
        const mobileSidebar = document.getElementById('mobileSidebar');
        const mobileOverlay = document.getElementById('mobileOverlay');
        const mobileToggle = document.getElementById('mobileToggle');
        const navLinks = document.querySelectorAll('.nav-link');
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        const pageContent = document.getElementById('pageContent');
        const pages = document.querySelectorAll('.page');
        
        // Buttons
        const refreshBtn = document.getElementById('refreshBtn');
        const addVariableBtn = document.getElementById('addVariableBtn');
        const addGroupBtn = document.getElementById('addGroupBtn');
        const addNewGroupBtn = document.getElementById('addNewGroupBtn');
        const filterBtn = document.getElementById('filterBtn');
        
        // Modals
        const addVariableModal = document.getElementById('addVariableModal');
        const editVariableModal = document.getElementById('editVariableModal');
        const closeAddModal = document.getElementById('closeAddModal');
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelAddBtn = document.getElementById('cancelAddBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const saveVariableBtn = document.getElementById('saveVariableBtn');
        const saveEditBtn = document.getElementById('saveEditBtn');
        
        // Forms
        const addVariableForm = document.getElementById('addVariableForm');
        const editVariableForm = document.getElementById('editVariableForm');
        
        // Search inputs
        const searchRecent = document.getElementById('searchRecent');
        const searchAllVariables = document.getElementById('searchAllVariables');
        const searchGroups = document.getElementById('searchGroups');
        
        // Tables
        const recentVariablesTable = document.getElementById('recentVariablesTable');
        const groupsTable = document.getElementById('groupsTable');
        const allVariablesTableContainer = document.getElementById('allVariablesTableContainer');
        const groupsListContainer = document.getElementById('groupsListContainer');
        
        // Dashboard stats
        const envCount = document.getElementById('envCount');
        const mobileEnvCount = document.getElementById('mobileEnvCount');
        const totalVariables = document.getElementById('totalVariables');
        const secretVariables = document.getElementById('secretVariables');
        const totalGroups = document.getElementById('totalGroups');
        const securityScore = document.getElementById('securityScore');
        
        // Copy notification
        const copySuccess = document.getElementById('copySuccess');
        
        // Application State
        let environmentVariables = [];
        let variableGroups = [];
        let currentPage = 'dashboard';
        let editingVariableId = null;
        
        // Sample data for demonstration
        const sampleVariables = [
            {
                id: 1,
                name: 'DATABASE_URL',
                value: 'postgresql://user:password@localhost:5432/mydb',
                displayValue: 'postgresql://user:********@localhost:5432/mydb',
                type: 'secret',
                group: 'database',
                description: 'PostgreSQL connection string',
                required: true,
                lastUpdated: '2023-10-15 14:30',
                masked: true
            },
            {
                id: 2,
                name: 'API_KEY',
                value: 'sk_live_1234567890abcdef',
                displayValue: 'sk_live_*************',
                type: 'secret',
                group: 'api',
                description: 'Stripe API key',
                required: true,
                lastUpdated: '2023-10-14 09:15',
                masked: true
            },
            {
                id: 3,
                name: 'NODE_ENV',
                value: 'production',
                displayValue: 'production',
                type: 'string',
                group: '',
                description: 'Node.js environment',
                required: true,
                lastUpdated: '2023-10-10 11:20',
                masked: false
            },
            {
                id: 4,
                name: 'PORT',
                value: '3000',
                displayValue: '3000',
                type: 'number',
                group: '',
                description: 'Server port',
                required: false,
                lastUpdated: '2023-10-12 16:45',
                masked: false
            },
            {
                id: 5,
                name: 'LOG_LEVEL',
                value: 'info',
                displayValue: 'info',
                type: 'string',
                group: 'logging',
                description: 'Application log level',
                required: false,
                lastUpdated: '2023-10-11 10:10',
                masked: false
            },
            {
                id: 6,
                name: 'REDIS_URL',
                value: 'redis://localhost:6379',
                displayValue: 'redis://localhost:6379',
                type: 'string',
                group: 'database',
                description: 'Redis connection URL',
                required: false,
                lastUpdated: '2023-10-09 13:25',
                masked: false
            },
            {
                id: 7,
                name: 'JWT_SECRET',
                value: 'mySuperSecretJWTKey123!',
                displayValue: '***********************',
                type: 'secret',
                group: 'auth',
                description: 'JWT signing secret',
                required: true,
                lastUpdated: '2023-10-08 08:50',
                masked: true
            },
            {
                id: 8,
                name: 'AWS_ACCESS_KEY_ID',
                value: 'AKIAIOSFODNN7EXAMPLE',
                displayValue: 'AKIAIOSFODNN7EXAMPLE',
                type: 'secret',
                group: 'api',
                description: 'AWS access key ID',
                required: true,
                lastUpdated: '2023-10-07 15:30',
                masked: true
            }
        ];
        
        const sampleGroups = [
            {
                id: 1,
                name: 'database',
                displayName: 'Database',
                description: 'Database connection variables',
                variableCount: 2,
                environment: 'Production'
            },
            {
                id: 2,
                name: 'api',
                displayName: 'API',
                description: 'External API keys and endpoints',
                variableCount: 2,
                environment: 'All'
            },
            {
                id: 3,
                name: 'auth',
                displayName: 'Authentication',
                description: 'Authentication and authorization variables',
                variableCount: 1,
                environment: 'Production'
            },
            {
                id: 4,
                name: 'logging',
                displayName: 'Logging',
                description: 'Logging configuration variables',
                variableCount: 1,
                environment: 'Development'
            }
        ];
        
        // Initialize the application
        function initApp() {
            // Load sample data
            loadSampleData();
            
            // Set up event listeners
            setupEventListeners();
            
            // Initialize dashboard
            updateDashboard();
            
            // Load initial page
            loadPage(currentPage);
        }
        
        // Load sample data
        function loadSampleData() {
            // Try to load from localStorage first
            const savedVariables = localStorage.getItem('envManagerVariables');
            const savedGroups = localStorage.getItem('envManagerGroups');
            
            if (savedVariables && savedGroups) {
                environmentVariables = JSON.parse(savedVariables);
                variableGroups = JSON.parse(savedGroups);
            } else {
                environmentVariables = [...sampleVariables];
                variableGroups = [...sampleGroups];
                saveToLocalStorage();
            }
        }
        
        // Save data to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('envManagerVariables', JSON.stringify(environmentVariables));
            localStorage.setItem('envManagerGroups', JSON.stringify(variableGroups));
        }
        
        // Set up event listeners
        function setupEventListeners() {
            // Mobile sidebar toggle
            mobileToggle.addEventListener('click', toggleMobileSidebar);
            mobileOverlay.addEventListener('click', toggleMobileSidebar);
            
            // Navigation
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = link.dataset.page;
                    loadPage(page);
                    
                    // Update active nav link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    
                    // Close mobile sidebar if open
                    if (mobileSidebar.classList.contains('active')) {
                        toggleMobileSidebar();
                    }
                });
            });
            
            // Refresh button
            refreshBtn.addEventListener('click', refreshData);
            
            // Add variable button
            addVariableBtn.addEventListener('click', () => {
                openAddVariableModal();
            });
            
            // Add group buttons
            addGroupBtn.addEventListener('click', () => {
                // In a real app, this would open a group creation modal
                showAlert('Group Creation', 'This would open a group creation form in a full implementation.');
            });
            
            addNewGroupBtn.addEventListener('click', () => {
                showAlert('Group Creation', 'This would open a group creation form in a full implementation.');
            });
            
            // Filter button
            filterBtn.addEventListener('click', () => {
                showAlert('Filter Variables', 'This would open a filter dialog in a full implementation.');
            });
            
            // Modal close buttons
            closeAddModal.addEventListener('click', () => {
                addVariableModal.classList.remove('active');
            });
            
            closeEditModal.addEventListener('click', () => {
                editVariableModal.classList.remove('active');
            });
            
            cancelAddBtn.addEventListener('click', () => {
                addVariableModal.classList.remove('active');
            });
            
            cancelEditBtn.addEventListener('click', () => {
                editVariableModal.classList.remove('active');
            });
            
            // Save variable buttons
            saveVariableBtn.addEventListener('click', saveNewVariable);
            saveEditBtn.addEventListener('click', saveEditedVariable);
            
            // Search functionality
            searchRecent.addEventListener('input', filterRecentVariables);
            searchAllVariables.addEventListener('input', filterAllVariables);
            searchGroups.addEventListener('input', filterGroups);
            
            // Close modals when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === addVariableModal) {
                    addVariableModal.classList.remove('active');
                }
                if (e.target === editVariableModal) {
                    editVariableModal.classList.remove('active');
                }
            });
            
            // Toggle edit value visibility
            document.getElementById('toggleEditValue').addEventListener('change', function() {
                const valueField = document.getElementById('editVarValue');
                if (this.checked) {
                    valueField.type = 'text';
                } else {
                    valueField.type = 'password';
                }
            });
        }
        
        // Toggle mobile sidebar
        function toggleMobileSidebar() {
            mobileSidebar.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
        }
        
        // Load a page
        function loadPage(pageName) {
            currentPage = pageName;
            
            // Hide all pages
            pages.forEach(page => {
                page.style.display = 'none';
            });
            
            // Show the selected page
            const pageElement = document.getElementById(`${pageName}Page`);
            if (pageElement) {
                pageElement.style.display = 'block';
            }
            
            // Update page title and subtitle
            updatePageTitle(pageName);
            
            // Load page content
            switch(pageName) {
                case 'dashboard':
                    updateDashboard();
                    break;
                case 'variables':
                    loadAllVariables();
                    break;
                case 'groups':
                    loadGroupsPage();
                    break;
                case 'secrets':
                    loadSecretsPage();
                    break;
                default:
                    // For other pages, show a placeholder
                    pageElement.innerHTML = `<div class="empty-state">
                        <i class="fas fa-cogs"></i>
                        <h3>${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page</h3>
                        <p>This page would contain ${pageName} management functionality in a full implementation.</p>
                    </div>`;
            }
        }
        
        // Update page title based on current page
        function updatePageTitle(pageName) {
            const titles = {
                dashboard: 'Environment Dashboard',
                variables: 'All Environment Variables',
                groups: 'Environment Groups',
                secrets: 'Secret Management',
                import: 'Import Variables',
                export: 'Export Variables',
                validation: 'Validation',
                backup: 'Backup & Restore',
                security: 'Security Settings',
                users: 'User Management',
                api: 'API Configuration'
            };
            
            const subtitles = {
                dashboard: 'Manage your environment variables securely',
                variables: 'View and edit all environment variables',
                groups: 'Organize variables into logical groups',
                secrets: 'Manage sensitive credentials and secrets',
                import: 'Import variables from files or other sources',
                export: 'Export variables to different formats',
                validation: 'Validate variable syntax and requirements',
                backup: 'Backup and restore your environment configuration',
                security: 'Configure security settings and access controls',
                users: 'Manage user accounts and permissions',
                api: 'Configure API access and integrations'
            };
            
            pageTitle.textContent = titles[pageName] || pageName.charAt(0).toUpperCase() + pageName.slice(1);
            pageSubtitle.textContent = subtitles[pageName] || `Manage ${pageName} settings`;
        }
        
        // Update dashboard with current data
        function updateDashboard() {
            // Update stats
            const totalVars = environmentVariables.length;
            const secretVars = environmentVariables.filter(v => v.type === 'secret').length;
            const groupsCount = variableGroups.length;
            
            // Calculate security score (simplified)
            const score = Math.min(100, 70 + (secretVars * 5) + (groupsCount * 3));
            
            // Update display
            envCount.textContent = totalVars;
            mobileEnvCount.textContent = totalVars;
            totalVariables.textContent = totalVars;
            secretVariables.textContent = secretVars;
            totalGroups.textContent = groupsCount;
            securityScore.textContent = `${score}%`;
            
            // Update recent variables table
            updateRecentVariablesTable();
            
            // Update groups table
            updateGroupsTable();
        }
        
        // Update recent variables table
        function updateRecentVariablesTable() {
            recentVariablesTable.innerHTML = '';
            
            // Sort by last updated (most recent first)
            const recentVars = [...environmentVariables]
                .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
                .slice(0, 5);
            
            if (recentVars.length === 0) {
                recentVariablesTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px;">
                            <div class="empty-state" style="padding: 0;">
                                <i class="fas fa-list"></i>
                                <h3>No Variables Yet</h3>
                                <p>Add your first environment variable to get started</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            recentVars.forEach(variable => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="env-name">${variable.name}</div>
                    </td>
                    <td>
                        <div class="env-value ${variable.masked ? 'masked' : ''}">
                            ${variable.displayValue}
                        </div>
                    </td>
                    <td>
                        <span class="env-type type-${variable.type}">${variable.type}</span>
                    </td>
                    <td>
                        ${variable.group ? `<span class="env-group-badge">${variable.group}</span>` : '-'}
                    </td>
                    <td>${variable.lastUpdated}</td>
                    <td>
                        <div class="env-actions">
                            <button class="action-btn edit-btn" data-id="${variable.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn copy-btn" data-value="${variable.value}">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="action-btn delete-btn delete" data-id="${variable.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                recentVariablesTable.appendChild(row);
            });
            
            // Add event listeners to buttons in the table
            addTableButtonListeners();
        }
        
        // Update groups table
        function updateGroupsTable() {
            groupsTable.innerHTML = '';
            
            if (variableGroups.length === 0) {
                groupsTable.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px;">
                            <div class="empty-state" style="padding: 0;">
                                <i class="fas fa-folder"></i>
                                <h3>No Groups Yet</h3>
                                <p>Create your first group to organize variables</p>
                            </div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            variableGroups.forEach(group => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="env-name">${group.displayName}</div>
                    </td>
                    <td>${group.description}</td>
                    <td>${group.variableCount} variables</td>
                    <td>${group.environment}</td>
                    <td>
                        <div class="env-actions">
                            <button class="action-btn view-group-btn" data-id="${group.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="action-btn edit-group-btn" data-id="${group.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-group-btn delete" data-id="${group.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                groupsTable.appendChild(row);
            });
            
            // Add event listeners to group buttons
            addGroupButtonListeners();
        }
        
        // Load all variables page
        function loadAllVariables() {
            allVariablesTableContainer.innerHTML = '';
            
            if (environmentVariables.length === 0) {
                allVariablesTableContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-list"></i>
                        <h3>No Environment Variables</h3>
                        <p>Add your first environment variable to get started</p>
                        <button class="btn btn-primary" style="margin-top: 20px;" id="addFirstVariableBtn">
                            <i class="fas fa-plus"></i>
                            Add Variable
                        </button>
                    </div>
                `;
                
                document.getElementById('addFirstVariableBtn')?.addEventListener('click', () => {
                    openAddVariableModal();
                });
                return;
            }
            
            const table = document.createElement('table');
            table.className = 'env-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Type</th>
                        <th>Group</th>
                        <th>Required</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="allVariablesTableBody"></tbody>
            `;
            
            allVariablesTableContainer.appendChild(table);
            
            updateAllVariablesTable();
        }
        
        // Update all variables table
        function updateAllVariablesTable() {
            const tableBody = document.getElementById('allVariablesTableBody');
            if (!tableBody) return;
            
            tableBody.innerHTML = '';
            
            environmentVariables.forEach(variable => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="env-name">${variable.name}</div>
                        ${variable.description ? `<div style="font-size: 0.85rem; color: var(--gray); margin-top: 5px;">${variable.description}</div>` : ''}
                    </td>
                    <td>
                        <div class="env-value ${variable.masked ? 'masked' : ''}">
                            ${variable.displayValue}
                        </div>
                    </td>
                    <td>
                        <span class="env-type type-${variable.type}">${variable.type}</span>
                    </td>
                    <td>
                        ${variable.group ? `<span class="env-group-badge">${variable.group}</span>` : '-'}
                    </td>
                    <td>
                        ${variable.required ? 
                            '<i class="fas fa-check-circle" style="color: var(--success);"></i>' : 
                            '<i class="fas fa-times-circle" style="color: var(--gray);"></i>'}
                    </td>
                    <td>${variable.lastUpdated}</td>
                    <td>
                        <div class="env-actions">
                            <button class="action-btn edit-btn" data-id="${variable.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn copy-btn" data-value="${variable.value}">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="action-btn delete-btn delete" data-id="${variable.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            addTableButtonListeners();
        }
        
        // Load groups page
        function loadGroupsPage() {
            groupsListContainer.innerHTML = '';
            
            if (variableGroups.length === 0) {
                groupsListContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-folder"></i>
                        <h3>No Groups Yet</h3>
                        <p>Create your first group to organize variables</p>
                        <button class="btn btn-primary" style="margin-top: 20px;" id="addFirstGroupBtn">
                            <i class="fas fa-plus"></i>
                            Add Group
                        </button>
                    </div>
                `;
                return;
            }
            
            variableGroups.forEach(group => {
                const groupCard = document.createElement('div');
                groupCard.className = 'dashboard-card';
                groupCard.style.cursor = 'pointer';
                groupCard.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div class="card-title" style="margin: 0;">
                            <i class="fas fa-folder"></i>
                            ${group.displayName}
                        </div>
                        <div class="env-actions">
                            <button class="action-btn edit-group-btn" data-id="${group.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-group-btn delete" data-id="${group.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p style="color: var(--gray); margin-bottom: 15px;">${group.description}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.9rem; color: var(--gray);">Variables</div>
                            <div style="font-size: 1.5rem; font-weight: 600; color: var(--dark);">${group.variableCount}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; color: var(--gray);">Environment</div>
                            <div style="font-size: 1rem; font-weight: 600; color: var(--primary);">${group.environment}</div>
                        </div>
                    </div>
                `;
                
                groupCard.addEventListener('click', () => {
                    showGroupDetails(group.id);
                });
                
                groupsListContainer.appendChild(groupCard);
            });
            
            addGroupButtonListeners();
        }
        
        // Load secrets page (placeholder)
        function loadSecretsPage() {
            const pageElement = document.getElementById('secretsPage');
            pageElement.innerHTML = `
                <div class="env-section">
                    <div class="section-header">
                        <h2 class="section-title">Secret Variables</h2>
                        <div style="display: flex; gap: 15px;">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" placeholder="Search secrets...">
                            </div>
                            <button class="btn btn-primary">
                                <i class="fas fa-plus"></i>
                                Add Secret
                            </button>
                        </div>
                    </div>
                    
                    <div class="env-table-container">
                        <table class="env-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Group</th>
                                    <th>Last Rotated</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${environmentVariables.filter(v => v.type === 'secret').map(variable => `
                                    <tr>
                                        <td>
                                            <div class="env-name">${variable.name}</div>
                                            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 5px;">${variable.description}</div>
                                        </td>
                                        <td>
                                            <span class="env-type type-secret">Secret</span>
                                        </td>
                                        <td>
                                            ${variable.group ? `<span class="env-group-badge">${variable.group}</span>` : '-'}
                                        </td>
                                        <td>${variable.lastUpdated}</td>
                                        <td>
                                            <span style="color: var(--success);">
                                                <i class="fas fa-check-circle"></i> Active
                                            </span>
                                        </td>
                                        <td>
                                            <div class="env-actions">
                                                <button class="action-btn" onclick="rotateSecret(${variable.id})">
                                                    <i class="fas fa-redo"></i>
                                                </button>
                                                <button class="action-btn" onclick="viewSecret(${variable.id})">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Security Notice:</strong> Secret values are masked in the interface. 
                        Use the eye icon to temporarily reveal a secret value when needed.
                    </div>
                </div>
            `;
        }
        
        // Add event listeners to table buttons
        function addTableButtonListeners() {
            // Edit buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    editVariable(id);
                });
            });
            
            // Copy buttons
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const value = btn.dataset.value;
                    copyToClipboard(value);
                });
            });
            
            // Delete buttons
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    deleteVariable(id);
                });
            });
        }
        
        // Add event listeners to group buttons
        function addGroupButtonListeners() {
            // View group buttons
            document.querySelectorAll('.view-group-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    showGroupDetails(id);
                });
            });
            
            // Edit group buttons
            document.querySelectorAll('.edit-group-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    editGroup(id);
                });
            });
            
            // Delete group buttons
            document.querySelectorAll('.delete-group-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const id = parseInt(btn.dataset.id);
                    deleteGroup(id);
                });
            });
        }
        
        // Open add variable modal
        function openAddVariableModal() {
            // Reset form
            addVariableForm.reset();
            
            // Open modal
            addVariableModal.classList.add('active');
        }
        
        // Save new variable
        function saveNewVariable() {
            const name = document.getElementById('varName').value.trim();
            const value = document.getElementById('varValue').value.trim();
            const type = document.getElementById('varType').value;
            const group = document.getElementById('varGroup').value;
            const description = document.getElementById('varDescription').value.trim();
            const required = document.getElementById('varRequired').checked;
            
            if (!name || !value) {
                showAlert('Validation Error', 'Variable name and value are required.');
                return;
            }
            
            // Check if variable already exists
            if (environmentVariables.some(v => v.name === name)) {
                showAlert('Duplicate Variable', `A variable named "${name}" already exists.`);
                return;
            }
            
            // Create new variable
            const newVariable = {
                id: environmentVariables.length > 0 ? Math.max(...environmentVariables.map(v => v.id)) + 1 : 1,
                name: name,
                value: value,
                displayValue: type === 'secret' ? '*'.repeat(Math.min(value.length, 20)) : value,
                type: type,
                group: group,
                description: description,
                required: required,
                lastUpdated: getCurrentDateTime(),
                masked: type === 'secret'
            };
            
            // Add to array
            environmentVariables.push(newVariable);
            
            // Update groups count
            if (group) {
                const groupIndex = variableGroups.findIndex(g => g.name === group);
                if (groupIndex !== -1) {
                    variableGroups[groupIndex].variableCount++;
                }
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update UI
            updateDashboard();
            
            if (currentPage === 'variables') {
                updateAllVariablesTable();
            }
            
            // Close modal
            addVariableModal.classList.remove('active');
            
            // Show success message
            showAlert('Variable Added', `Environment variable "${name}" has been added successfully.`, 'success');
        }
        
        // Edit variable
        function editVariable(id) {
            const variable = environmentVariables.find(v => v.id === id);
            if (!variable) return;
            
            editingVariableId = id;
            
            // Populate form
            document.getElementById('editVarId').value = variable.id;
            document.getElementById('editVarName').value = variable.name;
            document.getElementById('editVarValue').value = variable.value;
            document.getElementById('editVarType').value = variable.type;
            document.getElementById('editVarGroup').value = variable.group;
            document.getElementById('editVarDescription').value = variable.description || '';
            document.getElementById('editVarRequired').checked = variable.required;
            
            // Set value field type based on variable type
            const valueField = document.getElementById('editVarValue');
            const toggleCheckbox = document.getElementById('toggleEditValue');
            
            if (variable.type === 'secret') {
                valueField.type = 'password';
                toggleCheckbox.checked = false;
            } else {
                valueField.type = 'text';
                toggleCheckbox.checked = true;
            }
            
            // Open modal
            editVariableModal.classList.add('active');
        }
        
        // Save edited variable
        function saveEditedVariable() {
            const id = parseInt(document.getElementById('editVarId').value);
            const name = document.getElementById('editVarName').value.trim();
            const value = document.getElementById('editVarValue').value.trim();
            const type = document.getElementById('editVarType').value;
            const group = document.getElementById('editVarGroup').value;
            const description = document.getElementById('editVarDescription').value.trim();
            const required = document.getElementById('editVarRequired').checked;
            
            if (!name || !value) {
                showAlert('Validation Error', 'Variable name and value are required.');
                return;
            }
            
            // Find variable
            const variableIndex = environmentVariables.findIndex(v => v.id === id);
            if (variableIndex === -1) {
                showAlert('Error', 'Variable not found.');
                return;
            }
            
            // Check if name changed and conflicts with another variable
            const originalVariable = environmentVariables[variableIndex];
            if (originalVariable.name !== name && environmentVariables.some(v => v.name === name && v.id !== id)) {
                showAlert('Duplicate Variable', `A variable named "${name}" already exists.`);
                return;
            }
            
            // Check if group changed
            const oldGroup = originalVariable.group;
            
            // Update variable
            environmentVariables[variableIndex] = {
                ...originalVariable,
                name: name,
                value: value,
                displayValue: type === 'secret' ? '*'.repeat(Math.min(value.length, 20)) : value,
                type: type,
                group: group,
                description: description,
                required: required,
                lastUpdated: getCurrentDateTime(),
                masked: type === 'secret'
            };
            
            // Update groups counts if group changed
            if (oldGroup !== group) {
                if (oldGroup) {
                    const oldGroupIndex = variableGroups.findIndex(g => g.name === oldGroup);
                    if (oldGroupIndex !== -1) {
                        variableGroups[oldGroupIndex].variableCount = Math.max(0, variableGroups[oldGroupIndex].variableCount - 1);
                    }
                }
                
                if (group) {
                    const newGroupIndex = variableGroups.findIndex(g => g.name === group);
                    if (newGroupIndex !== -1) {
                        variableGroups[newGroupIndex].variableCount++;
                    }
                }
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update UI
            updateDashboard();
            
            if (currentPage === 'variables') {
                updateAllVariablesTable();
            }
            
            // Close modal
            editVariableModal.classList.remove('active');
            
            // Show success message
            showAlert('Variable Updated', `Environment variable "${name}" has been updated successfully.`, 'success');
        }
        
        // Delete variable
        function deleteVariable(id) {
            if (!confirm('Are you sure you want to delete this environment variable? This action cannot be undone.')) {
                return;
            }
            
            const variableIndex = environmentVariables.findIndex(v => v.id === id);
            if (variableIndex === -1) return;
            
            const variable = environmentVariables[variableIndex];
            
            // Remove from array
            environmentVariables.splice(variableIndex, 1);
            
            // Update group count if variable was in a group
            if (variable.group) {
                const groupIndex = variableGroups.findIndex(g => g.name === variable.group);
                if (groupIndex !== -1) {
                    variableGroups[groupIndex].variableCount = Math.max(0, variableGroups[groupIndex].variableCount - 1);
                }
            }
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update UI
            updateDashboard();
            
            if (currentPage === 'variables') {
                updateAllVariablesTable();
            }
            
            // Show success message
            showAlert('Variable Deleted', `Environment variable "${variable.name}" has been deleted.`, 'success');
        }
        
        // Show group details
        function showGroupDetails(groupId) {
            const group = variableGroups.find(g => g.id === groupId);
            if (!group) return;
            
            const groupVariables = environmentVariables.filter(v => v.group === group.name);
            
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 class="modal-title">
                            <i class="fas fa-folder"></i>
                            ${group.displayName} Group
                        </h2>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="margin-bottom: 25px;">
                            <p>${group.description}</p>
                            <div style="display: flex; gap: 30px; margin-top: 20px;">
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--gray);">Variables</div>
                                    <div style="font-size: 2rem; font-weight: 600; color: var(--dark);">${group.variableCount}</div>
                                </div>
                                <div>
                                    <div style="font-size: 0.9rem; color: var(--gray);">Environment</div>
                                    <div style="font-size: 1.2rem; font-weight: 600; color: var(--primary);">${group.environment}</div>
                                </div>
                            </div>
                        </div>
                        
                        <h3 style="margin-bottom: 15px; color: var(--dark);">Variables in this Group</h3>
                        
                        ${groupVariables.length > 0 ? `
                            <div class="env-table-container">
                                <table class="env-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Type</th>
                                            <th>Required</th>
                                            <th>Last Updated</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${groupVariables.map(v => `
                                            <tr>
                                                <td>
                                                    <div class="env-name">${v.name}</div>
                                                    ${v.description ? `<div style="font-size: 0.85rem; color: var(--gray); margin-top: 5px;">${v.description}</div>` : ''}
                                                </td>
                                                <td>
                                                    <span class="env-type type-${v.type}">${v.type}</span>
                                                </td>
                                                <td>
                                                    ${v.required ? 
                                                        '<i class="fas fa-check-circle" style="color: var(--success);"></i>' : 
                                                        '<i class="fas fa-times-circle" style="color: var(--gray);"></i>'}
                                                </td>
                                                <td>${v.lastUpdated}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="empty-state" style="padding: 30px;">
                                <i class="fas fa-inbox"></i>
                                <p>No variables in this group yet.</p>
                            </div>
                        `}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Close</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }
        
        // Edit group (placeholder)
        function editGroup(id) {
            showAlert('Edit Group', 'This would open a group editing form in a full implementation.');
        }
        
        // Delete group
        function deleteGroup(id) {
            if (!confirm('Are you sure you want to delete this group? Variables in this group will not be deleted, but will no longer be grouped.')) {
                return;
            }
            
            const groupIndex = variableGroups.findIndex(g => g.id === id);
            if (groupIndex === -1) return;
            
            const group = variableGroups[groupIndex];
            
            // Remove group from array
            variableGroups.splice(groupIndex, 1);
            
            // Update variables that were in this group
            environmentVariables.forEach(v => {
                if (v.group === group.name) {
                    v.group = '';
                }
            });
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update UI
            updateDashboard();
            
            if (currentPage === 'groups') {
                loadGroupsPage();
            }
            
            // Show success message
            showAlert('Group Deleted', `Group "${group.displayName}" has been deleted.`, 'success');
        }
        
        // Filter recent variables
        function filterRecentVariables() {
            const searchTerm = searchRecent.value.toLowerCase();
            const rows = recentVariablesTable.querySelectorAll('tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Filter all variables
        function filterAllVariables() {
            const searchTerm = searchAllVariables.value.toLowerCase();
            const rows = document.querySelectorAll('#allVariablesTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Filter groups
        function filterGroups() {
            const searchTerm = searchGroups.value.toLowerCase();
            const cards = groupsListContainer.querySelectorAll('.dashboard-card');
            
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }
        
        // Refresh data
        function refreshData() {
            // In a real app, this would fetch fresh data from a server
            showAlert('Data Refreshed', 'Environment data has been refreshed.', 'success');
            updateDashboard();
        }
        
        // Copy to clipboard
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text)
                .then(() => {
                    // Show success notification
                    copySuccess.classList.add('active');
                    setTimeout(() => {
                        copySuccess.classList.remove('active');
                    }, 3000);
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    showAlert('Copy Failed', 'Failed to copy value to clipboard.', 'danger');
                });
        }
        
        // Show alert
        function showAlert(title, message, type = 'warning') {
            const alert = document.createElement('div');
            alert.className = `alert alert-${type}`;
            alert.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}"></i>
                <div>
                    <strong>${title}:</strong> ${message}
                </div>
                <button style="margin-left: auto; background: none; border: none; color: inherit; cursor: pointer;" onclick="this.parentElement.remove()">
                    &times;
                </button>
            `;
            
            // Add to page content
            const page = document.querySelector('.page[style*="block"]');
            if (page) {
                page.insertBefore(alert, page.firstChild);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (alert.parentElement) {
                        alert.remove();
                    }
                }, 5000);
            }
        }
        
        // Get current date/time string
        function getCurrentDateTime() {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hours}:${minutes}`;
        }
        
        // Secret management functions (for secrets page)
        window.rotateSecret = function(id) {
            showAlert('Rotate Secret', 'This would rotate the secret key in a full implementation.');
        };
        
        window.viewSecret = function(id) {
            showAlert('View Secret', 'This would temporarily reveal the secret value in a full implementation.');
        };
        
        // Initialize the application
        window.addEventListener('load', initApp);
