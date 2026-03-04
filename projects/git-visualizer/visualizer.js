// Git Visualizer - Interactive Git Command Simulator

class GitVisualizer {
    constructor() {
        this.commits = [];
        this.branches = { main: [] };
        this.currentBranch = 'main';
        this.HEAD = 'main';
        this.workingDir = new Map();
        this.stagingArea = new Map();
        this.commitCounter = 0;
        this.stash = [];
        this.reflog = [];
        
        this.initialize();
    }

    initialize() {
        // Create initial commit
        this.createCommit('Initial commit', true);
        this.render();
    }

    createCommit(message, isInitial = false) {
        const commit = {
            id: `c${this.commitCounter++}`,
            message: message,
            parent: isInitial ? null : this.getLatestCommit(),
            branch: this.currentBranch,
            timestamp: new Date().toLocaleString(),
            files: new Map(this.stagingArea)
        };
        
        this.commits.push(commit);
        this.branches[this.currentBranch].push(commit.id);
        this.stagingArea.clear();
        this.reflog.push({ action: 'commit', commit: commit.id, message });
        
        return commit;
    }

    getLatestCommit() {
        const branchCommits = this.branches[this.currentBranch];
        if (branchCommits.length === 0) return null;
        return branchCommits[branchCommits.length - 1];
    }

    getCommit(id) {
        return this.commits.find(c => c.id === id);
    }

    // Command implementations
    executeCommand(cmdString) {
        const parts = cmdString.trim().split(/\s+/);
        const cmd = parts[1]; // Skip 'git'
        const args = parts.slice(2);

        try {
            if (!cmdString.startsWith('git ')) {
                throw new Error('Commands must start with "git"');
            }

            switch(cmd) {
                case 'add':
                    return this.cmdAdd(args);
                case 'commit':
                    return this.cmdCommit(args);
                case 'branch':
                    return this.cmdBranch(args);
                case 'checkout':
                case 'switch':
                    return this.cmdCheckout(args);
                case 'merge':
                    return this.cmdMerge(args);
                case 'status':
                    return this.cmdStatus();
                case 'log':
                    return this.cmdLog(args);
                case 'reset':
                    return this.cmdReset(args);
                case 'stash':
                    return this.cmdStash(args);
                case 'revert':
                    return this.cmdRevert(args);
                case 'cherry-pick':
                    return this.cmdCherryPick(args);
                default:
                    throw new Error(`Unknown command: ${cmd}`);
            }
        } catch (error) {
            return { success: false, message: error.message, type: 'error' };
        }
    }

    cmdAdd(args) {
        if (args.length === 0) {
            return { success: false, message: 'Nothing specified, nothing added.', type: 'error' };
        }

        const file = args[0];
        
        if (file === '.') {
            // Add all files from working directory
            this.workingDir.forEach((content, filename) => {
                this.stagingArea.set(filename, content);
            });
            return { 
                success: true, 
                message: `Added ${this.workingDir.size} file(s) to staging area`, 
                type: 'success' 
            };
        }

        if (this.workingDir.has(file)) {
            this.stagingArea.set(file, this.workingDir.get(file));
            return { 
                success: true, 
                message: `Staged '${file}'`, 
                type: 'success' 
            };
        } else {
            // Simulate creating a new file
            this.workingDir.set(file, `Content of ${file}`);
            this.stagingArea.set(file, `Content of ${file}`);
            return { 
                success: true, 
                message: `Staged new file '${file}'`, 
                type: 'success' 
            };
        }
    }

    cmdCommit(args) {
        if (this.stagingArea.size === 0) {
            return { 
                success: false, 
                message: 'nothing to commit, working tree clean', 
                type: 'error' 
            };
        }

        let message = 'Update';
        const mIndex = args.indexOf('-m');
        if (mIndex !== -1 && args[mIndex + 1]) {
            message = args.slice(mIndex + 1).join(' ').replace(/['"]/g, '');
        }

        const commit = this.createCommit(message);
        this.render();
        
        return { 
            success: true, 
            message: `[${this.currentBranch} ${commit.id}] ${message}\n ${this.stagingArea.size} file(s) changed`, 
            type: 'success' 
        };
    }

    cmdBranch(args) {
        if (args.length === 0) {
            // List branches
            const branchList = Object.keys(this.branches).map(b => 
                b === this.currentBranch ? `* ${b}` : `  ${b}`
            ).join('\n');
            return { success: true, message: branchList, type: 'info' };
        }

        const branchName = args[0];
        
        if (args.includes('-d') || args.includes('--delete')) {
            const idx = args.findIndex(a => a === '-d' || a === '--delete');
            const delBranch = args[idx + 1];
            if (this.branches[delBranch]) {
                if (delBranch === this.currentBranch) {
                    return { success: false, message: `Cannot delete checked out branch '${delBranch}'`, type: 'error' };
                }
                delete this.branches[delBranch];
                this.render();
                return { success: true, message: `Deleted branch ${delBranch}`, type: 'success' };
            }
            return { success: false, message: `branch '${delBranch}' not found`, type: 'error' };
        }

        if (this.branches[branchName]) {
            return { success: false, message: `A branch named '${branchName}' already exists`, type: 'error' };
        }

        // Create new branch
        this.branches[branchName] = [...this.branches[this.currentBranch]];
        this.reflog.push({ action: 'branch', branch: branchName });
        this.render();
        
        return { 
            success: true, 
            message: `Created branch '${branchName}'`, 
            type: 'success' 
        };
    }

    cmdCheckout(args) {
        if (args.length === 0) {
            return { success: false, message: 'Please specify a branch', type: 'error' };
        }

        const branchName = args[args.length - 1];
        const createBranch = args.includes('-b') || args.includes('-c');

        if (createBranch) {
            if (this.branches[branchName]) {
                return { success: false, message: `Branch '${branchName}' already exists`, type: 'error' };
            }
            this.branches[branchName] = [...this.branches[this.currentBranch]];
        }

        if (!this.branches[branchName]) {
            return { success: false, message: `Branch '${branchName}' does not exist`, type: 'error' };
        }

        this.currentBranch = branchName;
        this.HEAD = branchName;
        this.reflog.push({ action: 'checkout', branch: branchName });
        this.render();
        
        return { 
            success: true, 
            message: `Switched to branch '${branchName}'`, 
            type: 'success' 
        };
    }

    cmdMerge(args) {
        if (args.length === 0) {
            return { success: false, message: 'Please specify a branch to merge', type: 'error' };
        }

        const mergeBranch = args[0];
        
        if (!this.branches[mergeBranch]) {
            return { success: false, message: `Branch '${mergeBranch}' does not exist`, type: 'error' };
        }

        if (mergeBranch === this.currentBranch) {
            return { success: false, message: 'Cannot merge a branch into itself', type: 'error' };
        }

        // Simple fast-forward merge simulation
        const mergeCommits = this.branches[mergeBranch].filter(
            id => !this.branches[this.currentBranch].includes(id)
        );

        if (mergeCommits.length === 0) {
            return { success: true, message: 'Already up to date.', type: 'info' };
        }

        // Create merge commit
        const mergeCommit = this.createCommit(`Merge branch '${mergeBranch}' into ${this.currentBranch}`);
        this.reflog.push({ action: 'merge', from: mergeBranch, to: this.currentBranch });
        this.render();
        
        return { 
            success: true, 
            message: `Merged ${mergeBranch} into ${this.currentBranch}`, 
            type: 'success' 
        };
    }

    cmdStatus() {
        let status = `On branch ${this.currentBranch}\n`;
        
        if (this.stagingArea.size > 0) {
            status += '\nChanges to be committed:\n';
            this.stagingArea.forEach((_, file) => {
                status += `  modified:   ${file}\n`;
            });
        }
        
        if (this.workingDir.size > 0 && this.stagingArea.size === 0) {
            status += '\nChanges not staged for commit:\n';
            this.workingDir.forEach((_, file) => {
                if (!this.stagingArea.has(file)) {
                    status += `  modified:   ${file}\n`;
                }
            });
        }
        
        if (this.stagingArea.size === 0 && this.workingDir.size === 0) {
            status += '\nnothing to commit, working tree clean';
        }
        
        return { success: true, message: status, type: 'info' };
    }

    cmdLog(args) {
        const currentCommits = this.branches[this.currentBranch];
        let log = '';
        
        const limit = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) : 5;
        const oneline = args.includes('--oneline');
        
        const commitsToShow = currentCommits.slice(-limit).reverse();
        
        commitsToShow.forEach(commitId => {
            const commit = this.getCommit(commitId);
            if (oneline) {
                log += `${commit.id} ${commit.message}\n`;
            } else {
                log += `commit ${commit.id}\n`;
                log += `Date: ${commit.timestamp}\n`;
                log += `\n    ${commit.message}\n\n`;
            }
        });
        
        return { success: true, message: log || 'No commits yet', type: 'info' };
    }

    cmdReset(args) {
        if (args.length === 0) {
            return { success: false, message: 'Please specify reset target', type: 'error' };
        }

        const isHard = args.includes('--hard');
        
        if (args.includes('HEAD')) {
            // Reset staging area
            this.stagingArea.clear();
            if (isHard) {
                this.workingDir.clear();
            }
            this.render();
            return { success: true, message: 'Reset staging area', type: 'success' };
        }

        return { success: true, message: 'Reset performed', type: 'success' };
    }

    cmdStash(args) {
        if (args.length === 0 || args[0] === 'save' || args[0] === 'push') {
            // Stash changes
            if (this.workingDir.size === 0 && this.stagingArea.size === 0) {
                return { success: false, message: 'No local changes to stash', type: 'error' };
            }
            
            this.stash.push({
                working: new Map(this.workingDir),
                staging: new Map(this.stagingArea),
                branch: this.currentBranch
            });
            
            this.workingDir.clear();
            this.stagingArea.clear();
            this.render();
            
            return { success: true, message: `Saved working directory and index state`, type: 'success' };
        }
        
        if (args[0] === 'pop' || args[0] === 'apply') {
            if (this.stash.length === 0) {
                return { success: false, message: 'No stash entries found', type: 'error' };
            }
            
            const stashed = args[0] === 'pop' ? this.stash.pop() : this.stash[this.stash.length - 1];
            this.workingDir = new Map(stashed.working);
            this.stagingArea = new Map(stashed.staging);
            this.render();
            
            return { success: true, message: `Applied stash`, type: 'success' };
        }
        
        if (args[0] === 'list') {
            if (this.stash.length === 0) {
                return { success: true, message: 'No stash entries', type: 'info' };
            }
            const list = this.stash.map((s, i) => `stash@{${i}}: On ${s.branch}`).join('\n');
            return { success: true, message: list, type: 'info' };
        }
        
        return { success: false, message: 'Unknown stash command', type: 'error' };
    }

    cmdRevert(args) {
        if (args.length === 0) {
            return { success: false, message: 'Please specify a commit to revert', type: 'error' };
        }
        
        const commitId = args[0];
        const commit = this.getCommit(commitId);
        
        if (!commit) {
            return { success: false, message: `Commit '${commitId}' not found`, type: 'error' };
        }
        
        const revertCommit = this.createCommit(`Revert "${commit.message}"`);
        this.render();
        
        return { success: true, message: `Reverted ${commitId}`, type: 'success' };
    }

    cmdCherryPick(args) {
        if (args.length === 0) {
            return { success: false, message: 'Please specify a commit to cherry-pick', type: 'error' };
        }
        
        const commitId = args[0];
        const commit = this.getCommit(commitId);
        
        if (!commit) {
            return { success: false, message: `Commit '${commitId}' not found`, type: 'error' };
        }
        
        const newCommit = this.createCommit(commit.message);
        this.render();
        
        return { success: true, message: `Cherry-picked ${commitId}`, type: 'success' };
    }

    // Rendering
    render() {
        this.renderGraph();
        this.updateBranchInfo();
    }

    renderGraph() {
        const container = document.getElementById('git-graph');
        if (!container) return;

        let html = '<svg width="800" height="400" class="git-graph-svg">';
        
        const commitSpacing = 80;
        const branchSpacing = 60;
        const branchColors = {
            main: '#f05032',
            develop: '#3eaf7c',
            feature: '#4fc3f7',
            hotfix: '#ff9800'
        };

        // Draw commits for each branch
        Object.keys(this.branches).forEach((branch, branchIndex) => {
            const y = 50 + branchIndex * branchSpacing;
            const color = branchColors[branch] || branchColors.feature;
            const commits = this.branches[branch];
            
            // Draw branch line
            if (commits.length > 1) {
                const startX = 50;
                const endX = 50 + (commits.length - 1) * commitSpacing;
                html += `<line x1="${startX}" y1="${y}" x2="${endX}" y2="${y}" stroke="${color}" stroke-width="3" opacity="0.3"/>`;
            }
            
            // Draw commits
            commits.forEach((commitId, index) => {
                const x = 50 + index * commitSpacing;
                const commit = this.getCommit(commitId);
                const isHEAD = branch === this.HEAD && index === commits.length - 1;
                
                // Commit node
                html += `<circle cx="${x}" cy="${y}" r="12" fill="${color}" stroke="${isHEAD ? '#fff' : color}" stroke-width="${isHEAD ? 4 : 2}" class="commit-node" data-commit="${commitId}"/>`;
                
                // Commit label
                html += `<text x="${x}" y="${y + 35}" text-anchor="middle" fill="#e0e0e0" font-size="11" class="commit-label">${commitId}</text>`;
                
                // HEAD indicator
                if (isHEAD) {
                    html += `<text x="${x}" y="${y - 25}" text-anchor="middle" fill="#f05032" font-size="12" font-weight="bold" class="head-label">HEAD</text>`;
                }
            });
            
            // Branch name
            const lastX = 50 + (commits.length - 1) * commitSpacing;
            html += `<text x="${lastX + 25}" y="${y + 5}" fill="${color}" font-size="13" font-weight="bold" class="branch-label">${branch}</text>`;
        });
        
        html += '</svg>';
        
        // Add commit details
        html += '<div class="commit-details" style="margin-top: 20px; padding: 15px; background: var(--dark-bg); border-radius: 6px;">';
        html += '<h4 style="color: var(--secondary-color); margin-bottom: 10px;">Recent Commits:</h4>';
        
        const recentCommits = this.commits.slice(-5).reverse();
        recentCommits.forEach(commit => {
            html += `<div style="margin-bottom: 10px; padding: 8px; background: var(--card-bg); border-radius: 4px; border-left: 3px solid var(--primary-color);">`;
            html += `<strong style="color: var(--secondary-color);">${commit.id}</strong> `;
            html += `<span style="color: var(--text-secondary);">${commit.message}</span>`;
            html += `</div>`;
        });
        
        html += '</div>';
        
        container.innerHTML = html;
    }

    updateBranchInfo() {
        const currentBranchEl = document.getElementById('current-branch');
        const headPositionEl = document.getElementById('head-position');
        
        if (currentBranchEl) currentBranchEl.textContent = this.currentBranch;
        if (headPositionEl) headPositionEl.textContent = this.HEAD;
    }

    reset() {
        this.commits = [];
        this.branches = { main: [] };
        this.currentBranch = 'main';
        this.HEAD = 'main';
        this.workingDir.clear();
        this.stagingArea.clear();
        this.commitCounter = 0;
        this.stash = [];
        this.reflog = [];
        this.initialize();
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitVisualizer;
}
