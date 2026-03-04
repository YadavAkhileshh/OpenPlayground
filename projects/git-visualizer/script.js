// Main Application Script
document.addEventListener('DOMContentLoaded', () => {
    // Initialize
    const visualizer = new GitVisualizer();
    let currentLesson = 'intro';
    
    // Tab Navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Update buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            
            // Load content if needed
            if (tabId === 'best-practices') {
                loadBestPractices();
            }
        });
    });
    
    // Lesson Navigation
    const lessonButtons = document.querySelectorAll('.lesson-btn');
    const lessonDisplay = document.getElementById('lesson-display');
    
    lessonButtons.forEach(button => {
        button.addEventListener('click', () => {
            const lessonId = button.dataset.lesson;
            
            // Update buttons
            lessonButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Load lesson
            loadLesson(lessonId);
        });
    });
    
    function loadLesson(lessonId) {
        currentLesson = lessonId;
        const lesson = lessons[lessonId] || additionalLessons[lessonId];
        
        if (lesson) {
            lessonDisplay.innerHTML = lesson.content;
        } else {
            lessonDisplay.innerHTML = '<h2>Lesson not found</h2><p>This lesson is coming soon!</p>';
        }
        
        // Scroll to top
        lessonDisplay.scrollTop = 0;
    }
    
    // Load first lesson
    loadLesson('intro');
    
    // Visualizer Commands
    const gitCommandInput = document.getElementById('git-command');
    const executeBtn = document.getElementById('execute-cmd');
    const commandOutput = document.getElementById('command-output');
    
    function addOutputLine(message, type = 'info') {
        const line = document.createElement('p');
        line.className = `output-line ${type}`;
        line.textContent = `> ${message}`;
        commandOutput.appendChild(line);
        commandOutput.scrollTop = commandOutput.scrollHeight;
    }
    
    function executeGitCommand() {
        const command = gitCommandInput.value.trim();
        
        if (!command) return;
        
        // Display command
        addOutputLine(command, 'info');
        
        // Execute command
        const result = visualizer.executeCommand(command);
        
        // Display result
        if (result.success) {
            result.message.split('\n').forEach(line => {
                if (line.trim()) addOutputLine(line, result.type);
            });
        } else {
            addOutputLine(`Error: ${result.message}`, 'error');
        }
        
        // Clear input
        gitCommandInput.value = '';
    }
    
    executeBtn.addEventListener('click', executeGitCommand);
    
    gitCommandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            executeGitCommand();
        }
    });
    
    // Quick Commands
    const quickCmdButtons = document.querySelectorAll('.quick-cmd');
    
    quickCmdButtons.forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.cmd;
            gitCommandInput.value = command;
            executeGitCommand();
        });
    });
    
    // Visualizer Controls
    const resetVisBtn = document.getElementById('reset-vis');
    const undoCmdBtn = document.getElementById('undo-cmd');
    
    if (resetVisBtn) {
        resetVisBtn.addEventListener('click', () => {
            visualizer.reset();
            commandOutput.innerHTML = '<p class="output-line welcome">Visualization reset. Ready for new commands!</p>';
        });
    }
    
    if (undoCmdBtn) {
        undoCmdBtn.addEventListener('click', () => {
            addOutputLine('Undo functionality coming soon!', 'info');
        });
    }
    
    // Practice Challenges
    const challengeButtons = document.querySelectorAll('.btn-start-challenge');
    const challengeModal = document.getElementById('challenge-modal');
    const closeModal = document.querySelector('.close-modal');
    
    challengeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const challengeId = button.dataset.challenge;
            startChallenge(challengeId);
        });
    });
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            challengeModal.classList.remove('active');
        });
    }
    
    if (challengeModal) {
        challengeModal.addEventListener('click', (e) => {
            if (e.target === challengeModal) {
                challengeModal.classList.remove('active');
            }
        });
    }
    
    function startChallenge(challengeId) {
        const challenges = {
            '1': {
                title: 'Challenge 1: First Commit',
                description: 'Let\'s create your first Git repository and make a commit!',
                tasks: [
                    'Initialize a Git repository',
                    'Create a file called index.html',
                    'Stage the file',
                    'Create a commit with message "Initial commit"'
                ],
                files: ['index.html'],
                hints: [
                    'Use: git init',
                    'Use: git add index.html',
                    'Use: git commit -m "Initial commit"'
                ]
            },
            '2': {
                title: 'Challenge 2: Branch Management',
                description: 'Practice creating and merging branches.',
                tasks: [
                    'Create a new branch called "feature"',
                    'Switch to the feature branch',
                    'Make some changes and commit',
                    'Switch back to main',
                    'Merge feature into main'
                ],
                files: ['feature.js'],
                hints: [
                    'Use: git branch feature',
                    'Use: git checkout feature',
                    'Use: git add . && git commit -m "Add feature"',
                    'Use: git checkout main',
                    'Use: git merge feature'
                ]
            },
            '3': {
                title: 'Challenge 3: Conflict Resolution',
                description: 'Learn to resolve merge conflicts.',
                tasks: [
                    'Create two branches with conflicting changes',
                    'Attempt to merge them',
                    'Resolve the conflicts',
                    'Complete the merge'
                ],
                files: ['config.js'],
                hints: [
                    'Edit the conflicted files',
                    'Remove conflict markers (<<<<<<, =======, >>>>>>)',
                    'Stage the resolved files',
                    'Complete the merge with git commit'
                ]
            },
            '4': {
                title: 'Challenge 4: Rewriting History',
                description: 'Master advanced Git commands.',
                tasks: [
                    'Make several commits',
                    'Use git stash to save work',
                    'Use git reset to undo commits',
                    'Apply your stashed work'
                ],
                files: ['app.js', 'utils.js'],
                hints: [
                    'Use: git stash',
                    'Use: git reset HEAD~1',
                    'Use: git stash pop'
                ]
            }
        };
        
        const challenge = challenges[challengeId];
        
        if (!challenge) return;
        
        const workspace = document.getElementById('challenge-workspace');
        
        let html = `
            <h2>${challenge.title}</h2>
            <p class="challenge-description">${challenge.description}</p>
            
            <div class="challenge-tasks">
                <h3>Tasks:</h3>
                <ul>
                    ${challenge.tasks.map(task => `<li>${task}</li>`).join('')}
                </ul>
            </div>
            
            <div class="challenge-hints">
                <h3>Hints:</h3>
                <ul>
                    ${challenge.hints.map(hint => `<li><code>${hint}</code></li>`).join('')}
                </ul>
            </div>
            
            <div class="challenge-files">
                <h3>Practice Files:</h3>
                <div class="file-list">
                    ${challenge.files.map(file => `
                        <div class="file-item">
                            <span class="file-icon">📄</span>
                            <span class="file-name">${file}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="challenge-actions" style="margin-top: 30px;">
                <button class="btn-primary" onclick="window.open('https://github.com', '_blank')">
                    Open Practice Repository
                </button>
                <button class="btn-control" onclick="document.getElementById('challenge-modal').classList.remove('active')">
                    Close
                </button>
            </div>
        `;
        
        workspace.innerHTML = html;
        challengeModal.classList.add('active');
    }
    
    function loadBestPractices() {
        const container = document.querySelector('.best-practices-content');
        
        fetch('best-practices.html')
            .then(response => response.text())
            .then(html => {
                container.innerHTML = html;
            })
            .catch(() => {
                // If file doesn't exist, load inline content
                container.innerHTML = generateBestPracticesContent();
            });
    }
    
    function generateBestPracticesContent() {
        return `
            <h2>⭐ Git Best Practices Guide</h2>
            <p class="intro-text">Follow these best practices to maintain a clean, professional Git workflow.</p>
            
            <div class="practice-section">
                <h3>📝 Commit Messages</h3>
                <div class="practice-content">
                    <h4>Write Clear, Descriptive Messages</h4>
                    <ul>
                        <li>Use present tense: "Add feature" not "Added feature"</li>
                        <li>Keep first line under 50 characters</li>
                        <li>Add detailed description after blank line if needed</li>
                        <li>Reference issue numbers when applicable</li>
                    </ul>
                    
                    <div class="example-box">
                        <strong>Good Examples:</strong><br>
                        ✅ Add user authentication with JWT<br>
                        ✅ Fix navbar overflow on mobile devices<br>
                        ✅ Update dependencies to latest versions<br>
                        ✅ Refactor database connection logic<br><br>
                        
                        <strong>Bad Examples:</strong><br>
                        ❌ fix stuff<br>
                        ❌ WIP<br>
                        ❌ asdfasdf<br>
                        ❌ more changes
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>🌿 Branch Management</h3>
                <div class="practice-content">
                    <h4>Keep Branches Organized</h4>
                    <ul>
                        <li>Use descriptive branch names: feature/user-auth, bugfix/login-error</li>
                        <li>Keep branches short-lived (delete after merging)</li>
                        <li>Regularly sync with main branch</li>
                        <li>One feature/fix per branch</li>
                    </ul>
                    
                    <h4>Common Branch Naming Conventions:</h4>
                    <div class="code-block">
                        <code>feature/feature-name<br>
                        bugfix/bug-description<br>
                        hotfix/urgent-fix<br>
                        release/version-number<br>
                        docs/documentation-updates</code>
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>💾 Committing Best Practices</h3>
                <div class="practice-content">
                    <h4>Commit Early and Often</h4>
                    <ul>
                        <li>Make small, logical commits</li>
                        <li>Each commit should represent one logical change</li>
                        <li>Commit working code (don't break the build)</li>
                        <li>Review changes before committing</li>
                    </ul>
                    
                    <h4>What to Commit:</h4>
                    <div class="info-box">
                        <strong>✅ DO commit:</strong><br>
                        • Source code<br>
                        • Configuration files<br>
                        • Documentation<br>
                        • Tests<br>
                        • Build scripts<br><br>
                        
                        <strong>❌ DON'T commit:</strong><br>
                        • Build artifacts (dist/, build/)<br>
                        • Dependencies (node_modules/)<br>
                        • IDE-specific files (.vscode/, .idea/)<br>
                        • Sensitive data (passwords, API keys)<br>
                        • OS files (.DS_Store, Thumbs.db)
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>🔄 Syncing and Collaboration</h3>
                <div class="practice-content">
                    <h4>Stay in Sync</h4>
                    <ul>
                        <li>Pull before you start working</li>
                        <li>Pull before you push</li>
                        <li>Communicate with your team about changes</li>
                        <li>Use pull requests for code review</li>
                    </ul>
                    
                    <h4>Recommended Workflow:</h4>
                    <div class="code-block">
                        <code># Start of day<br>
                        git checkout main<br>
                        git pull origin main<br>
                        git checkout -b feature/new-feature<br><br>
                        
                        # Make changes...<br>
                        git add .<br>
                        git commit -m "Add new feature"<br><br>
                        
                        # Before pushing<br>
                        git checkout main<br>
                        git pull origin main<br>
                        git checkout feature/new-feature<br>
                        git rebase main<br><br>
                        
                        # Push changes<br>
                        git push origin feature/new-feature</code>
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>🔒 Security Best Practices</h3>
                <div class="practice-content">
                    <h4>Protect Sensitive Information</h4>
                    <ul>
                        <li>Never commit passwords, API keys, or secrets</li>
                        <li>Use environment variables for sensitive data</li>
                        <li>Add .env files to .gitignore</li>
                        <li>Rotate credentials if accidentally committed</li>
                    </ul>
                    
                    <div class="warning-box">
                        <strong>⚠️ If you accidentally commit secrets:</strong><br>
                        1. Rotate the credentials immediately<br>
                        2. Remove them from history using git-filter-branch or BFG<br>
                        3. Force push to update remote<br>
                        4. Notify your team<br><br>
                        
                        Remember: Once committed, secrets are in Git history forever unless explicitly removed!
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>📊 .gitignore Best Practices</h3>
                <div class="practice-content">
                    <h4>Essential .gitignore Patterns</h4>
                    <div class="code-block">
                        <code># Dependencies<br>
                        node_modules/<br>
                        vendor/<br>
                        bower_components/<br><br>
                        
                        # Build outputs<br>
                        dist/<br>
                        build/<br>
                        *.min.js<br>
                        *.min.css<br><br>
                        
                        # Environment variables<br>
                        .env<br>
                        .env.local<br>
                        .env.*.local<br><br>
                        
                        # IDE files<br>
                        .vscode/<br>
                        .idea/<br>
                        *.swp<br>
                        *.swo<br><br>
                        
                        # OS files<br>
                        .DS_Store<br>
                        Thumbs.db<br>
                        desktop.ini<br><br>
                        
                        # Logs<br>
                        *.log<br>
                        npm-debug.log*<br>
                        yarn-debug.log*<br><br>
                        
                        # Testing<br>
                        coverage/<br>
                        .nyc_output/</code>
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>🎯 Pull Request Best Practices</h3>
                <div class="practice-content">
                    <h4>Creating Quality Pull Requests</h4>
                    <ul>
                        <li>Write clear PR descriptions</li>
                        <li>Reference related issues</li>
                        <li>Keep PRs focused and small</li>
                        <li>Request reviews from relevant team members</li>
                        <li>Respond to feedback promptly</li>
                        <li>Update your branch before merging</li>
                    </ul>
                    
                    <div class="example-box">
                        <strong>Good PR Description Template:</strong><br><br>
                        
                        <strong>What:</strong> Brief description of changes<br>
                        <strong>Why:</strong> Reason for the changes<br>
                        <strong>How:</strong> Implementation approach<br>
                        <strong>Testing:</strong> How to test the changes<br>
                        <strong>Screenshots:</strong> If UI changes<br>
                        <strong>Related Issues:</strong> Fixes #123
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>🚫 What to Avoid</h3>
                <div class="practice-content">
                    <div class="warning-box">
                        <strong>Don't:</strong><br>
                        • Force push to shared branches<br>
                        • Rewrite public history<br>
                        • Commit directly to main/master<br>
                        • Push unfinished work to shared branches<br>
                        • Ignore merge conflicts<br>
                        • Use git add . without reviewing changes<br>
                        • Create massive commits with unrelated changes
                    </div>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>🎓 Learning Resources</h3>
                <div class="practice-content">
                    <ul>
                        <li><strong>Git Documentation:</strong> <a href="https://git-scm.com/doc" target="_blank">git-scm.com/doc</a></li>
                        <li><strong>GitHub Guides:</strong> <a href="https://guides.github.com" target="_blank">guides.github.com</a></li>
                        <li><strong>Pro Git Book:</strong> Free online at <a href="https://git-scm.com/book" target="_blank">git-scm.com/book</a></li>
                        <li><strong>Git Cheat Sheet:</strong> Quick reference for common commands</li>
                        <li><strong>Interactive Learning:</strong> Try this visualizer and practice regularly!</li>
                    </ul>
                </div>
            </div>
            
            <div class="practice-section">
                <h3>💡 Pro Tips</h3>
                <div class="practice-content">
                    <div class="info-box">
                        <strong>1. Use Git Aliases</strong><br>
                        Create shortcuts for common commands:<br>
                        <code>git config --global alias.st status</code><br>
                        <code>git config --global alias.co checkout</code><br>
                        <code>git config --global alias.br branch</code><br><br>
                        
                        <strong>2. Review Before Committing</strong><br>
                        Always run <code>git diff</code> before <code>git add</code><br><br>
                        
                        <strong>3. Write Commit Messages in an Editor</strong><br>
                        Use <code>git commit</code> without -m for longer messages<br><br>
                        
                        <strong>4. Use Interactive Rebase</strong><br>
                        Clean up your commits before pushing: <code>git rebase -i</code><br><br>
                        
                        <strong>5. Learn to Read Git Log</strong><br>
                        Understanding history helps avoid mistakes
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize some demo files in visualizer
    visualizer.workingDir.set('README.md', '# My Project');
    visualizer.workingDir.set('index.html', '<!DOCTYPE html>');
    visualizer.workingDir.set('style.css', 'body { margin: 0; }');
});
