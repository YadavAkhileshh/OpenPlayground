// Main VIRTUFS Application
class VirtualFileSystem {
    constructor() {
        this.currentUser = 'admin';
        this.adminMode = false;
        this.currentPath = '/';
        this.selectedItem = null;
        this.clipboard = null;
        this.snapshots = [];
        this.logs = [];
        this.db = null;
        this.fileSystem = null;
        
        // Initial log entry
        this.logs.push({
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            message: 'VIRTUFS initialized. Welcome to the virtual filesystem simulator.',
            type: 'info'
        });
        
        this.init();
    }
    
    async init() {
        await this.initIndexedDB();
        await this.loadFileSystem();
        this.initEventListeners();
        this.renderFileExplorer();
        this.updateUI();
        this.updateUserDisplay();
    }
    
    // Initialize IndexedDB for persistence
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('VIRTUFS_v2', 1);
            
            request.onerror = () => {
                console.error('IndexedDB error:', request.error);
                reject(request.error);
            };
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                
                if (!this.db.objectStoreNames.contains('filesystem')) {
                    this.db.createObjectStore('filesystem', { keyPath: 'id' });
                }
                
                if (!this.db.objectStoreNames.contains('snapshots')) {
                    this.db.createObjectStore('snapshots', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
        });
    }
    
    // Load or create initial file system
    async loadFileSystem() {
        return new Promise((resolve) => {
            if (!this.db) {
                this.fileSystem = this.createDefaultFileSystem();
                resolve();
                return;
            }
            
            const transaction = this.db.transaction(['filesystem'], 'readonly');
            const store = transaction.objectStore('filesystem');
            const request = store.get('root');
            
            request.onsuccess = () => {
                if (request.result) {
                    this.fileSystem = request.result.data;
                } else {
                    this.fileSystem = this.createDefaultFileSystem();
                    this.saveFileSystem();
                }
                resolve();
            };
            
            request.onerror = () => {
                console.error('Failed to load file system');
                this.fileSystem = this.createDefaultFileSystem();
                resolve();
            };
        });
    }
    
    // Create default file system structure
    createDefaultFileSystem() {
        const root = {
            id: 'root',
            name: '/',
            type: 'folder',
            owner: 'admin',
            permissions: { owner: 'rwx', group: 'r-x', others: 'r--' },
            size: 0,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            corrupted: false,
            children: []
        };
        
        // Create default folders
        const home = this.createNode('home', 'folder', 'admin', { owner: 'rwx', group: 'r-x', others: 'r--' });
        const documents = this.createNode('documents', 'folder', 'admin', { owner: 'rwx', group: 'r-x', others: 'r--' });
        const downloads = this.createNode('downloads', 'folder', 'admin', { owner: 'rwx', group: 'r-x', others: 'r--' });
        const system = this.createNode('system', 'folder', 'admin', { owner: 'rwx', group: 'r--', others: 'r--' });
        const bin = this.createNode('bin', 'folder', 'admin', { owner: 'rwx', group: 'r-x', others: 'r-x' });
        
        // Add some default files
        const readme = this.createNode('README.md', 'file', 'admin', { owner: 'rw-', group: 'r--', others: 'r--' });
        readme.content = '# VIRTUFS - Virtual File System Simulator\n\nWelcome to VIRTUFS! This is a browser-based file system simulator that demonstrates OS file management concepts.\n\n## Features\n- Linux-like permission system\n- Multi-user simulation\n- File corruption and recovery\n- Terminal emulation\n- Drag and drop operations';
        readme.size = this.calculateSize(readme.content);
        
        const logFile = this.createNode('system.log', 'file', 'admin', { owner: 'rw-', group: 'r--', others: 'r--' });
        logFile.content = 'System initialized\nVirtual disk mounted\nFile system ready\nUsers: admin, user, guest loaded\nPermissions initialized';
        logFile.size = this.calculateSize(logFile.content);
        
        const config = this.createNode('config.json', 'file', 'admin', { owner: 'rw-', group: 'r--', others: '---' });
        config.content = JSON.stringify({
            version: '2.0',
            maxDiskSize: '10MB',
            defaultPermissions: {
                folder: 'rwxr-xr--',
                file: 'rw-r--r--'
            },
            users: ['admin', 'user', 'guest']
        }, null, 2);
        config.size = this.calculateSize(config.content);
        
        const script = this.createNode('hello.sh', 'file', 'admin', { owner: 'rwx', group: 'r-x', others: 'r-x' });
        script.content = '#!/bin/bash\necho "Hello from VIRTUFS!"\n# This is a sample script';
        script.size = this.calculateSize(script.content);
        
        // Build the tree
        system.children.push(logFile, config);
        bin.children.push(script);
        documents.children.push(readme);
        home.children.push(documents, downloads);
        root.children.push(home, system, bin);
        
        // Update sizes
        this.updateFolderSize(system);
        this.updateFolderSize(bin);
        this.updateFolderSize(documents);
        this.updateFolderSize(downloads);
        this.updateFolderSize(home);
        this.updateFolderSize(root);
        
        return root;
    }
    
    // Create a new file system node
    createNode(name, type, owner, permissions) {
        const node = {
            id: this.generateId(),
            name,
            type,
            owner,
            permissions,
            size: type === 'folder' ? 0 : 100,
            createdAt: Date.now(),
            modifiedAt: Date.now(),
            corrupted: false
        };
        
        if (type === 'folder') {
            node.children = [];
        } else {
            node.content = '';
        }
        
        return node;
    }
    
    // Generate unique ID
    generateId() {
        return 'node_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Calculate size of content in bytes
    calculateSize(content) {
        if (!content) return 0;
        return new Blob([content]).size;
    }
    
    // Update folder size recursively
    updateFolderSize(node) {
        if (node.type !== 'folder') return node.size;
        
        let totalSize = 0;
        for (const child of node.children) {
            if (child.type === 'folder') {
                totalSize += this.updateFolderSize(child);
            } else {
                totalSize += child.size;
            }
        }
        
        node.size = totalSize;
        return totalSize;
    }
    
    // Get node by path
    getNodeByPath(path) {
        if (path === '/') return this.fileSystem;
        
        const parts = path.split('/').filter(p => p);
        let currentNode = this.fileSystem;
        
        for (const part of parts) {
            const child = currentNode.children?.find(c => c.name === part);
            if (!child) return null;
            currentNode = child;
        }
        
        return currentNode;
    }
    
    // Get current directory
    getCurrentDirectory() {
        return this.getNodeByPath(this.currentPath);
    }
    
    // Check if user has permission for operation
    checkPermission(node, operation) {
        if (this.adminMode) return true;
        
        const { permissions, owner } = node;
        const currentUser = this.currentUser;
        
        let permissionSet;
        if (currentUser === owner) {
            permissionSet = permissions.owner;
        } else if (currentUser === 'admin' || currentUser === 'user') {
            permissionSet = permissions.group;
        } else {
            permissionSet = permissions.others;
        }
        
        switch(operation) {
            case 'read': return permissionSet.includes('r');
            case 'write': return permissionSet.includes('w');
            case 'execute': return permissionSet.includes('x');
            default: return false;
        }
    }
    
    // Add log entry with enhanced styling
    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const logEntry = {
            id: Date.now(),
            timestamp,
            message,
            type
        };
        
        this.logs.unshift(logEntry);
        
        if (this.logs.length > 100) {
            this.logs.pop();
        }
        
        this.renderLogs();
    }
    
    // Update user display
    updateUserDisplay() {
        const avatar = document.getElementById('user-avatar');
        const name = document.getElementById('user-name');
        const role = document.getElementById('user-role');
        const currentUserDisplay = document.getElementById('current-user-display');
        
        let displayName, userRole, avatarText;
        
        switch(this.currentUser) {
            case 'admin':
                displayName = 'Admin';
                userRole = 'Root User';
                avatarText = 'A';
                avatar.style.background = 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
                break;
            case 'user':
                displayName = 'User';
                userRole = 'Standard User';
                avatarText = 'U';
                avatar.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
                break;
            case 'guest':
                displayName = 'Guest';
                userRole = 'Limited Access';
                avatarText = 'G';
                avatar.style.background = 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)';
                break;
        }
        
        avatar.textContent = avatarText;
        name.textContent = displayName;
        role.textContent = userRole;
        currentUserDisplay.textContent = this.currentUser;
    }
    
    // Initialize event listeners
    initEventListeners() {
        // User switching
        document.querySelector('.user-badge').addEventListener('click', () => {
            this.cycleUser();
        });
        
        document.getElementById('admin-mode').addEventListener('change', (e) => {
            this.adminMode = e.target.checked;
            this.addLog(`Admin mode ${this.adminMode ? 'enabled' : 'disabled'}`, 'warning');
            this.renderFileExplorer();
            this.updateUI();
        });
        
        // File operations
        document.getElementById('btn-new-file').addEventListener('click', () => {
            this.showModal('modal-new-file');
        });
        
        document.getElementById('btn-new-folder').addEventListener('click', () => {
            this.showModal('modal-new-folder');
        });
        
        document.getElementById('btn-rename').addEventListener('click', () => {
            if (this.selectedItem) {
                this.showModal('modal-rename');
            } else {
                this.showToast('Please select an item to rename', 'warning');
            }
        });
        
        document.getElementById('btn-delete').addEventListener('click', () => {
            if (this.selectedItem) {
                this.deleteItem(this.selectedItem);
            } else {
                this.showToast('Please select an item to delete', 'warning');
            }
        });
        
        document.getElementById('btn-permissions').addEventListener('click', () => {
            if (this.selectedItem) {
                this.showPermissionsModal();
            } else {
                this.showToast('Please select an item to change permissions', 'warning');
            }
        });
        
        document.getElementById('btn-copy').addEventListener('click', () => {
            if (this.selectedItem) {
                this.copyItem(this.selectedItem);
                this.showToast('Item copied to clipboard', 'success');
            } else {
                this.showToast('Please select an item to copy', 'warning');
            }
        });
        
        document.getElementById('btn-move').addEventListener('click', () => {
            if (this.selectedItem) {
                this.moveItem(this.selectedItem);
                this.showToast('Select destination folder and drop', 'info');
            } else {
                this.showToast('Please select an item to move', 'warning');
            }
        });
        
        // System tools
        document.getElementById('btn-corrupt-random').addEventListener('click', () => {
            this.corruptRandomItems();
        });
        
        document.getElementById('btn-repair').addEventListener('click', () => {
            this.showModal('modal-repair');
        });
        
        document.getElementById('btn-snapshot').addEventListener('click', () => {
            this.createSnapshot();
        });
        
        document.getElementById('btn-restore').addEventListener('click', () => {
            this.restoreSnapshot();
        });
        
        // Terminal
        document.getElementById('toggle-terminal').addEventListener('click', () => {
            this.toggleTerminal();
        });
        
        document.getElementById('close-terminal').addEventListener('click', () => {
            this.toggleTerminal(false);
        });
        
        document.getElementById('terminal-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processTerminalCommand(e.target.value);
                e.target.value = '';
            }
        });
        
        // Clear logs
        document.getElementById('btn-clear-logs').addEventListener('click', () => {
            this.logs = [{
                id: Date.now(),
                timestamp: new Date().toLocaleTimeString(),
                message: 'Logs cleared',
                type: 'info'
            }];
            this.renderLogs();
        });
        
        // Modal close buttons
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-modal');
                this.hideModal(modalId);
            });
        });
        
        // Modal actions
        document.getElementById('btn-create-file').addEventListener('click', () => {
            this.createNewFile();
        });
        
        document.getElementById('btn-create-folder').addEventListener('click', () => {
            this.createNewFolder();
        });
        
        document.getElementById('btn-rename-item').addEventListener('click', () => {
            this.renameSelectedItem();
        });
        
        document.getElementById('btn-set-permissions').addEventListener('click', () => {
            this.updatePermissions();
        });
        
        document.getElementById('btn-start-repair').addEventListener('click', () => {
            this.startRepair();
        });
        
        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
        // Initialize drag and drop
        this.initDragAndDrop();
    }
    
    // Cycle through users
    cycleUser() {
        const users = ['admin', 'user', 'guest'];
        const currentIndex = users.indexOf(this.currentUser);
        const nextIndex = (currentIndex + 1) % users.length;
        this.currentUser = users[nextIndex];
        
        this.addLog(`User switched to: ${this.currentUser}`, 'info');
        this.updateUserDisplay();
        this.renderFileExplorer();
        this.updateUI();
    }
    
    // Show toast notification
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    // Show modal with animation
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'flex';
        
        // Populate modal fields if needed
        if (modalId === 'modal-rename' && this.selectedItem) {
            const node = this.getNodeByPath(this.selectedItem);
            if (node) {
                document.getElementById('rename-name').value = node.name;
            }
        }
        
        if (modalId === 'modal-permissions' && this.selectedItem) {
            const node = this.getNodeByPath(this.selectedItem);
            if (node) {
                document.getElementById('permission-owner').value = node.owner;
                
                const { owner, group, others } = node.permissions;
                
                document.getElementById('owner-read').checked = owner.includes('r');
                document.getElementById('owner-write').checked = owner.includes('w');
                document.getElementById('owner-execute').checked = owner.includes('x');
                
                document.getElementById('group-read').checked = group.includes('r');
                document.getElementById('group-write').checked = group.includes('w');
                document.getElementById('group-execute').checked = group.includes('x');
                
                document.getElementById('others-read').checked = others.includes('r');
                document.getElementById('others-write').checked = others.includes('w');
                document.getElementById('others-execute').checked = others.includes('x');
            }
        }
    }
    
    // Hide modal
    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'none';
    }
    
    // Create new file
    async createNewFile() {
        const name = document.getElementById('file-name').value.trim();
        const content = document.getElementById('file-content').value;
        
        if (!name) {
            this.showToast('File name cannot be empty', 'error');
            return;
        }
        
        const currentDir = this.getCurrentDirectory();
        
        if (currentDir.children.some(child => child.name === name)) {
            this.showToast(`File "${name}" already exists`, 'error');
            return;
        }
        
        if (!this.checkPermission(currentDir, 'write')) {
            this.showToast('Permission denied: Cannot create file in this directory', 'error');
            return;
        }
        
        const file = this.createNode(name, 'file', this.currentUser, { 
            owner: 'rw-', 
            group: 'r--', 
            others: 'r--' 
        });
        
        if (content) {
            file.content = content;
            file.size = this.calculateSize(content);
        }
        
        currentDir.children.push(file);
        currentDir.modifiedAt = Date.now();
        
        this.updateFolderSize(currentDir);
        await this.saveFileSystem();
        
        this.showToast(`File "${name}" created`, 'success');
        this.addLog(`Created file: ${name}`, 'success');
        this.renderFileExplorer();
        this.updateUI();
        this.hideModal('modal-new-file');
        
        // Clear modal fields
        document.getElementById('file-name').value = '';
        document.getElementById('file-content').value = '';
    }
    
    // Create new folder
    async createNewFolder() {
        const name = document.getElementById('folder-name').value.trim();
        
        if (!name) {
            this.showToast('Folder name cannot be empty', 'error');
            return;
        }
        
        const currentDir = this.getCurrentDirectory();
        
        if (currentDir.children.some(child => child.name === name)) {
            this.showToast(`Folder "${name}" already exists`, 'error');
            return;
        }
        
        if (!this.checkPermission(currentDir, 'write')) {
            this.showToast('Permission denied: Cannot create folder in this directory', 'error');
            return;
        }
        
        const folder = this.createNode(name, 'folder', this.currentUser, { 
            owner: 'rwx', 
            group: 'r-x', 
            others: 'r--' 
        });
        
        currentDir.children.push(folder);
        currentDir.modifiedAt = Date.now();
        
        this.updateFolderSize(currentDir);
        await this.saveFileSystem();
        
        this.showToast(`Folder "${name}" created`, 'success');
        this.addLog(`Created folder: ${name}`, 'success');
        this.renderFileExplorer();
        this.updateUI();
        this.hideModal('modal-new-folder');
        
        // Clear modal field
        document.getElementById('folder-name').value = '';
    }
    
    // Rename selected item
    async renameSelectedItem() {
        const newName = document.getElementById('rename-name').value.trim();
        
        if (!newName) {
            this.showToast('Name cannot be empty', 'error');
            return;
        }
        
        if (!this.selectedItem) return;
        
        const node = this.getNodeByPath(this.selectedItem);
        const parent = this.getNodeByPath(this.selectedItem.substring(0, this.selectedItem.lastIndexOf('/')));
        
        if (!node || !parent) return;
        
        if (!this.checkPermission(node, 'write')) {
            this.showToast('Permission denied: Cannot rename this item', 'error');
            return;
        }
        
        if (parent.children.some(child => child.name === newName && child.id !== node.id)) {
            this.showToast(`"${newName}" already exists in this directory`, 'error');
            return;
        }
        
        const oldName = node.name;
        node.name = newName;
        node.modifiedAt = Date.now();
        
        await this.saveFileSystem();
        
        this.showToast(`Renamed "${oldName}" to "${newName}"`, 'success');
        this.addLog(`Renamed: ${oldName} → ${newName}`, 'success');
        this.renderFileExplorer();
        this.updateUI();
        this.hideModal('modal-rename');
    }
    
    // Delete item
    async deleteItem(path) {
        const node = this.getNodeByPath(path);
        if (!node) return;
        
        if (node.id === 'root') {
            this.showToast('Cannot delete root directory', 'error');
            return;
        }
        
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const parent = this.getNodeByPath(parentPath);
        
        if (!parent || !this.checkPermission(parent, 'write')) {
            this.showToast('Permission denied: Cannot delete this item', 'error');
            return;
        }
        
        // Show confirmation dialog
        if (confirm(`Are you sure you want to delete "${node.name}"?${node.type === 'folder' ? '\nThis folder and all its contents will be permanently deleted.' : ''}`)) {
            const index = parent.children.findIndex(child => child.id === node.id);
            if (index !== -1) {
                parent.children.splice(index, 1);
                parent.modifiedAt = Date.now();
                
                this.updateFolderSize(parent);
                await this.saveFileSystem();
                
                this.showToast(`Deleted "${node.name}"`, 'success');
                this.addLog(`Deleted: ${node.name}`, 'success');
                this.selectedItem = null;
                this.renderFileExplorer();
                this.updateUI();
            }
        }
    }
    
    // Update permissions
    async updatePermissions() {
        if (!this.selectedItem) return;
        
        const node = this.getNodeByPath(this.selectedItem);
        if (!node) return;
        
        if (node.owner !== this.currentUser && !this.adminMode) {
            this.showToast('Permission denied: Only owner or admin can change permissions', 'error');
            this.hideModal('modal-permissions');
            return;
        }
        
        const owner = document.getElementById('permission-owner').value;
        const ownerPerms = [
            document.getElementById('owner-read').checked ? 'r' : '',
            document.getElementById('owner-write').checked ? 'w' : '',
            document.getElementById('owner-execute').checked ? 'x' : ''
        ].join('');
        
        const groupPerms = [
            document.getElementById('group-read').checked ? 'r' : '',
            document.getElementById('group-write').checked ? 'w' : '',
            document.getElementById('group-execute').checked ? 'x' : ''
        ].join('');
        
        const othersPerms = [
            document.getElementById('others-read').checked ? 'r' : '',
            document.getElementById('others-write').checked ? 'w' : '',
            document.getElementById('others-execute').checked ? 'x' : ''
        ].join('');
        
        node.owner = owner;
        node.permissions = {
            owner: ownerPerms.padEnd(3, '-'),
            group: groupPerms.padEnd(3, '-'),
            others: othersPerms.padEnd(3, '-')
        };
        
        node.modifiedAt = Date.now();
        
        await this.saveFileSystem();
        
        this.showToast(`Permissions updated for "${node.name}"`, 'success');
        this.addLog(`Updated permissions for: ${node.name}`, 'success');
        this.renderFileExplorer();
        this.hideModal('modal-permissions');
    }
    
    // Copy item
    copyItem(path) {
        const node = this.getNodeByPath(path);
        if (!node) return;
        
        if (!this.checkPermission(node, 'read')) {
            this.showToast('Permission denied: Cannot copy this item', 'error');
            return;
        }
        
        this.clipboard = {
            action: 'copy',
            node: JSON.parse(JSON.stringify(node)),
            sourcePath: path
        };
    }
    
    // Move item
    moveItem(path) {
        const node = this.getNodeByPath(path);
        if (!node) return;
        
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const parent = this.getNodeByPath(parentPath);
        
        if (!parent || !this.checkPermission(parent, 'write')) {
            this.showToast('Permission denied: Cannot move this item', 'error');
            return;
        }
        
        this.clipboard = {
            action: 'move',
            node: node,
            sourcePath: path
        };
    }
    
    // Paste item to destination
    async pasteItem(destinationPath) {
        if (!this.clipboard) return;
        
        const destNode = this.getNodeByPath(destinationPath);
        if (!destNode || destNode.type !== 'folder') return;
        
        if (!this.checkPermission(destNode, 'write')) {
            this.showToast('Permission denied: Cannot paste to this directory', 'error');
            return;
        }
        
        if (this.clipboard.action === 'copy') {
            const newNode = JSON.parse(JSON.stringify(this.clipboard.node));
            newNode.id = this.generateId();
            newNode.name = this.generateUniqueName(destNode, newNode.name);
            
            destNode.children.push(newNode);
            destNode.modifiedAt = Date.now();
            
            this.updateFolderSize(destNode);
            await this.saveFileSystem();
            
            this.showToast(`"${newNode.name}" copied`, 'success');
            this.addLog(`Copied: ${this.clipboard.node.name} → ${destNode.name}`, 'success');
            
        } else if (this.clipboard.action === 'move') {
            const sourcePath = this.clipboard.sourcePath;
            const sourceParentPath = sourcePath.substring(0, sourcePath.lastIndexOf('/'));
            const sourceParent = this.getNodeByPath(sourceParentPath);
            
            if (sourceParent) {
                const index = sourceParent.children.findIndex(child => child.id === this.clipboard.node.id);
                if (index !== -1) {
                    sourceParent.children.splice(index, 1);
                    sourceParent.modifiedAt = Date.now();
                    this.updateFolderSize(sourceParent);
                }
            }
            
            this.clipboard.node.name = this.generateUniqueName(destNode, this.clipboard.node.name);
            destNode.children.push(this.clipboard.node);
            destNode.modifiedAt = Date.now();
            
            this.updateFolderSize(destNode);
            await this.saveFileSystem();
            
            this.showToast(`"${this.clipboard.node.name}" moved`, 'success');
            this.addLog(`Moved: ${this.clipboard.node.name} → ${destNode.name}`, 'success');
            
            if (this.selectedItem === sourcePath) {
                this.selectedItem = destinationPath + '/' + this.clipboard.node.name;
            }
        }
        
        this.clipboard = null;
        this.renderFileExplorer();
        this.updateUI();
    }
    
    // Generate unique name in destination
    generateUniqueName(destNode, baseName) {
        let name = baseName;
        let counter = 1;
        
        while (destNode.children.some(child => child.name === name)) {
            const dotIndex = baseName.lastIndexOf('.');
            if (dotIndex !== -1) {
                name = baseName.substring(0, dotIndex) + ` (${counter})` + baseName.substring(dotIndex);
            } else {
                name = baseName + ` (${counter})`;
            }
            counter++;
        }
        
        return name;
    }
    
    // Corrupt random items
    async corruptRandomItems() {
        const allNodes = this.getAllNodes(this.fileSystem);
        const fileNodes = allNodes.filter(node => node.type === 'file' && !node.corrupted);
        
        if (fileNodes.length === 0) {
            this.showToast('No uncorrupted files found', 'warning');
            return;
        }
        
        const numToCorrupt = Math.min(Math.floor(Math.random() * 3) + 1, fileNodes.length);
        const corrupted = [];
        
        for (let i = 0; i < numToCorrupt; i++) {
            const randomIndex = Math.floor(Math.random() * fileNodes.length);
            const node = fileNodes[randomIndex];
            
            node.corrupted = true;
            
            if (node.content) {
                const corruptionLevel = 0.2 + Math.random() * 0.3;
                const contentArray = node.content.split('');
                const numToCorrupt = Math.floor(contentArray.length * corruptionLevel);
                
                for (let j = 0; j < numToCorrupt; j++) {
                    const pos = Math.floor(Math.random() * contentArray.length);
                    contentArray[pos] = String.fromCharCode(Math.floor(Math.random() * 256));
                }
                
                node.content = contentArray.join('');
            }
            
            corrupted.push(node.name);
            fileNodes.splice(randomIndex, 1);
        }
        
        if (corrupted.length > 0) {
            await this.saveFileSystem();
            this.showToast(`Corrupted ${corrupted.length} file(s)`, 'error');
            this.addLog(`Corrupted files: ${corrupted.join(', ')}`, 'error');
            this.renderFileExplorer();
            this.updateUI();
        }
    }
    
    // Get all nodes recursively
    getAllNodes(node, result = []) {
        result.push(node);
        
        if (node.children) {
            for (const child of node.children) {
                this.getAllNodes(child, result);
            }
        }
        
        return result;
    }
    
    // Start filesystem repair
    async startRepair() {
        const resultsDiv = document.getElementById('repair-results');
        resultsDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                <div class="loading"></div>
                <span>Scanning filesystem for corruption...</span>
            </div>
        `;
        
        // Simulate scanning with animation
        setTimeout(async () => {
            const allNodes = this.getAllNodes(this.fileSystem);
            const corruptedNodes = allNodes.filter(node => node.corrupted);
            
            if (corruptedNodes.length === 0) {
                resultsDiv.innerHTML = `
                    <div class="repair-item">
                        <div class="repair-icon success">
                            <i class="fas fa-check"></i>
                        </div>
                        <div>
                            <strong>No corruption found</strong><br>
                            <small>Filesystem is healthy</small>
                        </div>
                    </div>
                `;
                this.addLog('Filesystem repair: No corruption found', 'success');
                return;
            }
            
            let repairedCount = 0;
            let removedCount = 0;
            let resultsHTML = '<h4 style="margin-bottom: 1rem;">Repair Results:</h4>';
            
            for (const node of corruptedNodes) {
                if (Math.random() < 0.7 && node.type === 'file') {
                    node.corrupted = false;
                    
                    if (node.content) {
                        node.content = node.content.replace(/[^\x20-\x7E\n\r\t]/g, '█');
                    }
                    
                    repairedCount++;
                    resultsHTML += `
                        <div class="repair-item">
                            <div class="repair-icon success">
                                <i class="fas fa-check"></i>
                            </div>
                            <div>
                                <strong>Repaired:</strong> ${node.name}<br>
                                <small>File restored successfully</small>
                            </div>
                        </div>
                    `;
                    this.addLog(`Repaired: ${node.name}`, 'success');
                } else {
                    const parent = this.findParent(this.fileSystem, node.id);
                    if (parent) {
                        const index = parent.children.findIndex(child => child.id === node.id);
                        if (index !== -1) {
                            parent.children.splice(index, 1);
                            removedCount++;
                            resultsHTML += `
                                <div class="repair-item">
                                    <div class="repair-icon warning">
                                        <i class="fas fa-trash"></i>
                                    </div>
                                    <div>
                                        <strong>Removed:</strong> ${node.name}<br>
                                        <small>File was irreparably corrupted</small>
                                    </div>
                                </div>
                            `;
                            this.addLog(`Removed corrupted: ${node.name}`, 'warning');
                        }
                    }
                }
            }
            
            this.updateFolderSize(this.fileSystem);
            await this.saveFileSystem();
            
            resultsHTML += `
                <div class="repair-item" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border);">
                    <div class="repair-icon success">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div>
                        <strong>Summary:</strong><br>
                        <small>Repaired: ${repairedCount} | Removed: ${removedCount} | Total: ${repairedCount + removedCount}</small>
                    </div>
                </div>
            `;
            
            resultsDiv.innerHTML = resultsHTML;
            this.renderFileExplorer();
            this.updateUI();
        }, 1500);
    }
    
    // Find parent of a node
    findParent(root, nodeId, parent = null) {
        if (root.id === nodeId) return parent;
        
        if (root.children) {
            for (const child of root.children) {
                const result = this.findParent(child, nodeId, root);
                if (result) return result;
            }
        }
        
        return null;
    }
    
    // Create snapshot
    async createSnapshot() {
        const snapshot = {
            id: Date.now(),
            name: `Snapshot_${new Date().toLocaleString()}`,
            timestamp: Date.now(),
            data: JSON.parse(JSON.stringify(this.fileSystem))
        };
        
        this.snapshots.unshift(snapshot);
        
        if (this.snapshots.length > 5) {
            this.snapshots.pop();
        }
        
        if (this.db) {
            const transaction = this.db.transaction(['snapshots'], 'readwrite');
            const store = transaction.objectStore('snapshots');
            store.put(snapshot);
        }
        
        this.showToast('Snapshot created successfully', 'success');
        this.addLog(`Snapshot created: ${snapshot.name}`, 'success');
    }
    
    // Restore snapshot
    async restoreSnapshot() {
        if (this.snapshots.length === 0) {
            this.showToast('No snapshots available', 'warning');
            return;
        }
        
        const snapshot = this.snapshots[0];
        
        if (confirm(`Restore filesystem to snapshot: ${snapshot.name}? All current changes will be lost.`)) {
            this.fileSystem = JSON.parse(JSON.stringify(snapshot.data));
            await this.saveFileSystem();
            
            this.showToast('Filesystem restored from snapshot', 'success');
            this.addLog(`Filesystem restored from snapshot: ${snapshot.name}`, 'success');
            this.renderFileExplorer();
            this.updateUI();
        }
    }
    
    // Initialize drag and drop
    initDragAndDrop() {
        const explorer = document.getElementById('file-explorer');
        
        explorer.addEventListener('dragover', (e) => {
            e.preventDefault();
            const item = e.target.closest('.file-item');
            if (item && item.dataset.type === 'folder') {
                item.classList.add('drag-over');
            }
        });
        
        explorer.addEventListener('dragleave', (e) => {
            const item = e.target.closest('.file-item');
            if (item) {
                item.classList.remove('drag-over');
            }
        });
        
        explorer.addEventListener('drop', (e) => {
            e.preventDefault();
            
            const item = e.target.closest('.file-item');
            if (item && item.dataset.type === 'folder' && this.clipboard) {
                item.classList.remove('drag-over');
                const destinationPath = item.dataset.path;
                this.pasteItem(destinationPath);
            }
        });
    }
    
    // Toggle terminal
    toggleTerminal(show = null) {
        const terminal = document.getElementById('terminal');
        const isVisible = terminal.style.display === 'flex';
        
        if (show === null) {
            show = !isVisible;
        }
        
        terminal.style.display = show ? 'flex' : 'none';
        
        if (show) {
            document.getElementById('terminal-input').focus();
            document.getElementById('terminal-status').textContent = '● Active';
        } else {
            document.getElementById('terminal-status').textContent = '● Ready';
        }
    }
    
    // Process terminal command
    processTerminalCommand(command) {
        const output = document.getElementById('terminal-output');
        const prompt = document.getElementById('terminal-prompt');
        
        // Add command to output
        const commandDiv = document.createElement('div');
        commandDiv.className = 'terminal-output prompt';
        commandDiv.textContent = `$ ${command}`;
        output.appendChild(commandDiv);
        
        // Process command
        const args = command.trim().split(/\s+/);
        const cmd = args[0].toLowerCase();
        
        let response = '';
        
        switch(cmd) {
            case 'ls': response = this.terminalLS(); break;
            case 'cd': response = this.terminalCD(args[1]); break;
            case 'pwd': response = this.currentPath; break;
            case 'cat': response = this.terminalCAT(args[1]); break;
            case 'mkdir': response = this.terminalMKDIR(args[1]); break;
            case 'touch': response = this.terminalTOUCH(args[1]); break;
            case 'rm': response = this.terminalRM(args[1]); break;
            case 'chmod': response = this.terminalCHMOD(args[1], args[2]); break;
            case 'whoami': response = this.currentUser + (this.adminMode ? ' (admin)' : ''); break;
            case 'help': response = this.terminalHELP(); break;
            case 'clear': output.innerHTML = '<div class="terminal-output prompt">VIRTUFS Terminal v2.0 - Type \'help\' for available commands</div>'; return;
            case '': return;
            default: response = `virtufs: command not found: ${cmd}`;
        }
        
        // Add response to output
        if (response) {
            const responseDiv = document.createElement('div');
            responseDiv.className = 'terminal-output';
            responseDiv.textContent = response;
            output.appendChild(responseDiv);
        }
        
        // Add new prompt
        const newPrompt = document.createElement('div');
        newPrompt.className = 'terminal-output prompt';
        newPrompt.textContent = '$';
        output.appendChild(newPrompt);
        
        // Scroll to bottom
        output.scrollTop = output.scrollHeight;
    }
    
    // Terminal: ls command
    terminalLS() {
        const currentDir = this.getCurrentDirectory();
        if (!currentDir) return 'Error: Directory not found';
        
        if (!this.checkPermission(currentDir, 'read')) {
            return 'ls: Permission denied';
        }
        
        let output = '';
        for (const child of currentDir.children) {
            if (this.checkPermission(child, 'read')) {
                const type = child.type === 'folder' ? 'd' : '-';
                const perms = child.permissions.owner + child.permissions.group + child.permissions.others;
                const owner = child.owner.padEnd(8);
                const size = child.size.toString().padStart(8);
                const name = child.name + (child.type === 'folder' ? '/' : '');
                
                output += `${type}${perms} ${owner} ${size} ${name}\n`;
            }
        }
        
        return output || 'Directory is empty';
    }
    
    // Terminal: cd command
    terminalCD(path) {
        if (!path) return 'Usage: cd <directory>';
        
        let newPath = '';
        
        if (path === '/') {
            newPath = '/';
        } else if (path === '..') {
            if (this.currentPath === '/') {
                newPath = '/';
            } else {
                const parts = this.currentPath.split('/').filter(p => p);
                parts.pop();
                newPath = '/' + parts.join('/');
            }
        } else if (path.startsWith('/')) {
            newPath = path;
        } else {
            newPath = this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
        }
        
        const node = this.getNodeByPath(newPath);
        if (!node) {
            return `cd: ${path}: No such directory`;
        }
        
        if (node.type !== 'folder') {
            return `cd: ${path}: Not a directory`;
        }
        
        if (!this.checkPermission(node, 'execute')) {
            return `cd: ${path}: Permission denied`;
        }
        
        this.currentPath = newPath;
        this.renderFileExplorer();
        this.updateUI();
        
        return '';
    }
    
    // Terminal: cat command
    terminalCAT(path) {
        if (!path) return 'Usage: cat <file>';
        
        let filePath = '';
        if (path.startsWith('/')) {
            filePath = path;
        } else {
            filePath = this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
        }
        
        const node = this.getNodeByPath(filePath);
        if (!node) {
            return `cat: ${path}: No such file`;
        }
        
        if (node.type !== 'file') {
            return `cat: ${path}: Is a directory`;
        }
        
        if (!this.checkPermission(node, 'read')) {
            return `cat: ${path}: Permission denied`;
        }
        
        if (node.corrupted) {
            return `cat: ${path}: File is corrupted\n\n${node.content || ''}`;
        }
        
        return node.content || '(empty file)';
    }
    
    // Terminal: mkdir command
    terminalMKDIR(path) {
        if (!path) return 'Usage: mkdir <directory>';
        
        const currentDir = this.getCurrentDirectory();
        if (!this.checkPermission(currentDir, 'write')) {
            return 'mkdir: Permission denied';
        }
        
        if (currentDir.children.some(child => child.name === path)) {
            return `mkdir: ${path}: File exists`;
        }
        
        const folder = this.createNode(path, 'folder', this.currentUser, { 
            owner: 'rwx', 
            group: 'r-x', 
            others: 'r--' 
        });
        
        currentDir.children.push(folder);
        currentDir.modifiedAt = Date.now();
        this.updateFolderSize(currentDir);
        this.saveFileSystem();
        
        this.addLog(`Directory "${path}" created via terminal`, 'success');
        this.renderFileExplorer();
        
        return '';
    }
    
    // Terminal: touch command
    terminalTOUCH(path) {
        if (!path) return 'Usage: touch <file>';
        
        const currentDir = this.getCurrentDirectory();
        if (!this.checkPermission(currentDir, 'write')) {
            return 'touch: Permission denied';
        }
        
        const existingFile = currentDir.children.find(child => child.name === path);
        
        if (existingFile) {
            existingFile.modifiedAt = Date.now();
            this.saveFileSystem();
            return '';
        } else {
            const file = this.createNode(path, 'file', this.currentUser, { 
                owner: 'rw-', 
                group: 'r--', 
                others: 'r--' 
            });
            
            currentDir.children.push(file);
            currentDir.modifiedAt = Date.now();
            this.updateFolderSize(currentDir);
            this.saveFileSystem();
            
            this.addLog(`File "${path}" created via terminal`, 'success');
            this.renderFileExplorer();
            
            return '';
        }
    }
    
    // Terminal: rm command
    terminalRM(path) {
        if (!path) return 'Usage: rm <file>';
        
        let filePath = '';
        if (path.startsWith('/')) {
            filePath = path;
        } else {
            filePath = this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
        }
        
        const node = this.getNodeByPath(filePath);
        if (!node) {
            return `rm: ${path}: No such file or directory`;
        }
        
        const parentPath = filePath.substring(0, filePath.lastIndexOf('/'));
        const parent = this.getNodeByPath(parentPath);
        
        if (!parent || !this.checkPermission(parent, 'write')) {
            return `rm: ${path}: Permission denied`;
        }
        
        const index = parent.children.findIndex(child => child.id === node.id);
        if (index !== -1) {
            parent.children.splice(index, 1);
            parent.modifiedAt = Date.now();
            this.updateFolderSize(parent);
            this.saveFileSystem();
            
            this.addLog(`"${node.name}" deleted via terminal`, 'success');
            this.renderFileExplorer();
            return '';
        }
        
        return `rm: ${path}: Cannot remove`;
    }
    
    // Terminal: chmod command
    terminalCHMOD(mode, path) {
        if (!mode || !path) return 'Usage: chmod <mode> <file>';
        
        let filePath = '';
        if (path.startsWith('/')) {
            filePath = path;
        } else {
            filePath = this.currentPath === '/' ? `/${path}` : `${this.currentPath}/${path}`;
        }
        
        const node = this.getNodeByPath(filePath);
        if (!node) {
            return `chmod: ${path}: No such file or directory`;
        }
        
        if (node.owner !== this.currentUser && !this.adminMode) {
            return `chmod: ${path}: Permission denied`;
        }
        
        if (/^[0-7]{3}$/.test(mode)) {
            const owner = this.parseModeDigit(mode[0]);
            const group = this.parseModeDigit(mode[1]);
            const others = this.parseModeDigit(mode[2]);
            
            node.permissions = { owner, group, others };
            node.modifiedAt = Date.now();
            this.saveFileSystem();
            
            this.addLog(`Permissions for "${node.name}" changed to ${mode} via terminal`, 'success');
            this.renderFileExplorer();
            return '';
        } else {
            return `chmod: Invalid mode: ${mode}`;
        }
    }
    
    // Terminal: help command
    terminalHELP() {
        return `Available commands:
  ls           - List directory contents
  cd <dir>     - Change directory
  pwd          - Print working directory
  cat <file>   - Display file contents
  mkdir <dir>  - Create directory
  touch <file> - Create or update file
  rm <file>    - Remove file
  chmod <mode> <file> - Change file permissions
  whoami       - Show current user
  clear        - Clear terminal
  help         - Show this help message`;
    }
    
    // Parse mode digit to rwx string
    parseModeDigit(digit) {
        const num = parseInt(digit, 8);
        let result = '';
        
        result += (num & 4) ? 'r' : '-';
        result += (num & 2) ? 'w' : '-';
        result += (num & 1) ? 'x' : '-';
        
        return result;
    }
    
    // Render file explorer
    renderFileExplorer() {
        const explorer = document.getElementById('file-explorer');
        const breadcrumbs = document.getElementById('breadcrumbs');
        
        // Clear explorer
        explorer.innerHTML = '';
        
        // Update breadcrumbs
        this.renderBreadcrumbs();
        
        // Get current directory
        const currentDir = this.getCurrentDirectory();
        if (!currentDir) return;
        
        // Check if we can read this directory
        if (!this.checkPermission(currentDir, 'read')) {
            explorer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-ban"></i>
                    <h3>Permission Denied</h3>
                    <p>You don't have permission to view this directory</p>
                </div>
            `;
            return;
        }
        
        // Display items
        let hasVisibleItems = false;
        for (const child of currentDir.children) {
            if (!this.checkPermission(child, 'read')) {
                continue;
            }
            
            hasVisibleItems = true;
            const item = document.createElement('div');
            item.className = 'file-item';
            item.dataset.path = this.currentPath === '/' ? `/${child.name}` : `${this.currentPath}/${child.name}`;
            item.dataset.type = child.type;
            
            if (this.selectedItem === item.dataset.path) {
                item.classList.add('selected');
            }
            
            if (child.corrupted) {
                item.classList.add('corrupted');
            }
            
            // Icon
            const icon = document.createElement('div');
            icon.className = `file-icon ${child.type} ${child.corrupted ? 'corrupted' : ''}`;
            
            if (child.type === 'folder') {
                icon.innerHTML = '<i class="fas fa-folder"></i>';
            } else {
                if (child.name.endsWith('.txt') || child.name.endsWith('.log') || child.name.endsWith('.md')) {
                    icon.innerHTML = '<i class="fas fa-file-alt"></i>';
                } else if (child.name.endsWith('.js') || child.name.endsWith('.py') || child.name.endsWith('.sh')) {
                    icon.innerHTML = '<i class="fas fa-file-code"></i>';
                } else if (child.name.endsWith('.json')) {
                    icon.innerHTML = '<i class="fas fa-file-code"></i>';
                } else {
                    icon.innerHTML = '<i class="fas fa-file"></i>';
                }
            }
            
            // Name
            const name = document.createElement('div');
            name.className = 'file-name';
            name.textContent = child.name;
            
            // Details
            const details = document.createElement('div');
            details.className = 'file-details';
            
            const size = document.createElement('div');
            size.className = 'file-size';
            size.textContent = this.formatSize(child.size);
            
            const permissions = document.createElement('div');
            permissions.className = 'permission-badge';
            permissions.textContent = child.permissions.owner + child.permissions.group + child.permissions.others;
            
            details.appendChild(size);
            details.appendChild(permissions);
            
            // Corruption badge
            if (child.corrupted) {
                const corruptionBadge = document.createElement('div');
                corruptionBadge.className = 'corruption-badge';
                corruptionBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
                item.appendChild(corruptionBadge);
            }
            
            // Assemble
            item.appendChild(icon);
            item.appendChild(name);
            item.appendChild(details);
            
            // Event listeners
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                document.querySelectorAll('.file-item').forEach(el => {
                    el.classList.remove('selected');
                });
                
                item.classList.add('selected');
                this.selectedItem = item.dataset.path;
            });
            
            item.addEventListener('dblclick', () => {
                if (child.type === 'folder') {
                    if (!this.checkPermission(child, 'execute')) {
                        this.showToast(`Permission denied: Cannot open "${child.name}"`, 'error');
                        return;
                    }
                    
                    this.currentPath = this.currentPath === '/' ? `/${child.name}` : `${this.currentPath}/${child.name}`;
                    this.selectedItem = null;
                    this.renderFileExplorer();
                    this.updateUI();
                } else {
                    // Show file content in alert (could be enhanced with a modal)
                    const content = child.corrupted ? 
                        `⚠️ CORRUPTED FILE ⚠️\n\n${child.content || 'No content'}` : 
                        child.content || 'File is empty';
                    alert(`File: ${child.name}\n\n${content}`);
                }
            });
            
            // Drag and drop
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.path);
                e.dataTransfer.effectAllowed = 'move';
            });
            
            explorer.appendChild(item);
        }
        
        // Add empty state if no items
        if (!hasVisibleItems) {
            explorer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Empty Directory</h3>
                    <p>This folder is empty. Create a new file or folder to get started.</p>
                </div>
            `;
        }
        
        // Add drop zone for current directory
        if (this.currentPath !== '/' && this.clipboard) {
            const dropZone = document.createElement('div');
            dropZone.className = 'drop-zone';
            dropZone.innerHTML = `
                <i class="fas fa-arrow-up"></i>
                <div>Drop here to move to parent directory</div>
            `;
            
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--primary)';
            });
            
            dropZone.addEventListener('dragleave', () => {
                dropZone.style.borderColor = 'var(--border)';
            });
            
            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.style.borderColor = 'var(--border)';
                
                if (this.clipboard) {
                    const parentPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/'));
                    if (parentPath === '') {
                        this.pasteItem('/');
                    } else {
                        this.pasteItem(parentPath);
                    }
                }
            });
            
            explorer.appendChild(dropZone);
        }
    }
    
    // Render breadcrumbs
    renderBreadcrumbs() {
        const breadcrumbs = document.getElementById('breadcrumbs');
        breadcrumbs.innerHTML = '';
        
        const parts = this.currentPath.split('/').filter(p => p);
        
        // Root breadcrumb
        const rootCrumb = document.createElement('div');
        rootCrumb.className = 'breadcrumb-item active';
        rootCrumb.dataset.path = '/';
        rootCrumb.innerHTML = '<i class="fas fa-home"></i><span>Root</span>';
        
        rootCrumb.addEventListener('click', () => {
            this.currentPath = '/';
            this.selectedItem = null;
            this.renderFileExplorer();
            this.updateUI();
        });
        
        breadcrumbs.appendChild(rootCrumb);
        
        // Build path breadcrumbs
        let currentPath = '';
        for (let i = 0; i < parts.length; i++) {
            const separator = document.createElement('div');
            separator.className = 'breadcrumb-separator';
            separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
            breadcrumbs.appendChild(separator);
            
            currentPath += '/' + parts[i];
            
            const crumb = document.createElement('div');
            crumb.className = 'breadcrumb-item';
            if (i === parts.length - 1) {
                crumb.classList.add('active');
            }
            crumb.dataset.path = currentPath;
            crumb.innerHTML = `<span>${parts[i]}</span>`;
            
            crumb.addEventListener('click', () => {
                this.currentPath = currentPath;
                this.selectedItem = null;
                this.renderFileExplorer();
                this.updateUI();
            });
            
            breadcrumbs.appendChild(crumb);
        }
    }
    
    // Render logs
    renderLogs() {
        const logsList = document.getElementById('logs-list');
        logsList.innerHTML = '';
        
        for (const log of this.logs) {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.type}`;
            
            const time = document.createElement('div');
            time.className = 'log-time';
            time.textContent = log.timestamp;
            
            const message = document.createElement('div');
            message.className = 'log-message';
            message.textContent = log.message;
            
            logEntry.appendChild(time);
            logEntry.appendChild(message);
            logsList.appendChild(logEntry);
        }
    }
    
    // Update UI elements
    updateUI() {
        // Update disk usage
        const totalSize = this.fileSystem.size;
        const totalNodes = this.getAllNodes(this.fileSystem).length;
        const corruptedNodes = this.getAllNodes(this.fileSystem).filter(node => node.corrupted).length;
        
        document.getElementById('disk-usage').textContent = 
            `${this.formatSize(totalSize)} / 10 MB`;
        
        document.getElementById('item-count').textContent = 
            `${totalNodes}`;
        
        document.getElementById('corruption-count').textContent = 
            `${corruptedNodes}`;
        
        // Update terminal prompt
        const prompt = document.getElementById('terminal-prompt');
        const path = this.currentPath === '/' ? '~' : this.currentPath;
        prompt.textContent = `${this.currentUser}@virtufs:${path}$`;
    }
    
    // Format size in human-readable format
    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Save file system to IndexedDB
    async saveFileSystem() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            
            const transaction = this.db.transaction(['filesystem'], 'readwrite');
            const store = transaction.objectStore('filesystem');
            const request = store.put({
                id: 'root',
                data: this.fileSystem,
                updatedAt: Date.now()
            });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Mobile-specific enhancements
function initializeMobileFeatures() {
    // Handle mobile touch events for better UX
    const fileItems = document.querySelectorAll('.file-item');
    
    fileItems.forEach(item => {
        // Add touch-friendly long press for context menu
        let pressTimer;
        
        item.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                // Long press detected - show context menu or highlight
                item.classList.add('long-press-active');
                // You can add context menu logic here
            }, 500);
        });
        
        item.addEventListener('touchend', (e) => {
            clearTimeout(pressTimer);
            item.classList.remove('long-press-active');
        });
        
        item.addEventListener('touchmove', (e) => {
            clearTimeout(pressTimer);
            item.classList.remove('long-press-active');
        });
    });
    
    // Handle mobile orientation changes
    window.addEventListener('orientationchange', () => {
        // Small delay to let the browser finish rotating
        setTimeout(() => {
            // Re-render file explorer to adjust grid
            if (window.virtufs) {
                window.virtufs.renderFileExplorer();
            }
        }, 100);
    });
    
    // Prevent zoom on double tap for better mobile experience
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Handle mobile keyboard for terminal
    const terminalInput = document.getElementById('terminal-input');
    if (terminalInput) {
        terminalInput.addEventListener('focus', () => {
            // Scroll terminal into view when focused on mobile
            const terminal = document.getElementById('terminal');
            if (terminal) {
                terminal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
    
    // Add swipe gestures for navigation
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipeGesture();
    });
    
    function handleSwipeGesture() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        // Only trigger if we're in file explorer area
        const explorerContainer = document.querySelector('.explorer-container');
        if (!explorerContainer) return;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - could navigate forward in history
                console.log('Swipe left detected');
            } else {
                // Swipe right - could navigate back in history
                console.log('Swipe right detected');
            }
        }
    }
    
    // Optimize for mobile performance
    const optimizeForMobile = () => {
        // Reduce animations on mobile for better performance
        if ('matchMedia' in window && window.matchMedia('(max-width: 768px)').matches) {
            document.body.classList.add('mobile-optimized');
        }
    };
    
    optimizeForMobile();
    window.addEventListener('resize', optimizeForMobile);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.virtufs = new VirtualFileSystem();
    initializeMobileFeatures();
});