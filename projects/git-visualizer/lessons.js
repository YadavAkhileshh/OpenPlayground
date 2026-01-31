// Lessons Data
const lessons = {
    intro: {
        title: "What is Git?",
        content: `
            <h2>🎯 What is Git?</h2>
            <p>Git is a distributed version control system that helps you track changes in your code over time. Think of it as a time machine for your code!</p>
            
            <h3>Why Use Git?</h3>
            <ul>
                <li><strong>Track Changes:</strong> See what changed, when, and who made the change</li>
                <li><strong>Collaboration:</strong> Multiple developers can work on the same project simultaneously</li>
                <li><strong>Backup:</strong> Your code is safely stored and can be recovered</li>
                <li><strong>Experimentation:</strong> Try new features without breaking working code</li>
                <li><strong>History:</strong> Travel back in time to any previous version</li>
            </ul>

            <h3>Key Concepts</h3>
            <div class="info-box">
                <strong>Repository (Repo):</strong> A folder containing your project and its entire history<br>
                <strong>Commit:</strong> A snapshot of your project at a specific point in time<br>
                <strong>Branch:</strong> A parallel version of your code for developing features<br>
                <strong>Remote:</strong> A version of your repository hosted on the internet (like GitHub)
            </div>

            <h3>The Git Workflow</h3>
            <ol>
                <li><strong>Working Directory:</strong> Where you edit files</li>
                <li><strong>Staging Area:</strong> Where you prepare files for commit</li>
                <li><strong>Repository:</strong> Where commits are permanently stored</li>
            </ol>

            <div class="example-box">
                <strong>Real-World Analogy:</strong><br>
                Think of Git like taking photos:<br>
                • Working Directory = Setting up your scene<br>
                • Staging Area = Choosing what's in the frame<br>
                • Commit = Taking the photo<br>
                • Repository = Your photo album
            </div>
        `
    },
    setup: {
        title: "Initial Setup",
        content: `
            <h2>⚙️ Initial Setup</h2>
            <p>Before using Git, you need to configure your identity. This information will be attached to your commits.</p>

            <h3>Configure Your Name and Email</h3>
            <div class="code-block">
                <code>git config --global user.name "Your Name"<br>
                git config --global user.email "your.email@example.com"</code>
            </div>

            <h3>Verify Your Configuration</h3>
            <div class="code-block">
                <code>git config --list</code>
            </div>

            <h3>Useful Configuration Options</h3>
            <div class="code-block">
                <code># Set default branch name to 'main'<br>
                git config --global init.defaultBranch main<br><br>
                
                # Set default editor (e.g., VS Code)<br>
                git config --global core.editor "code --wait"<br><br>
                
                # Enable colored output<br>
                git config --global color.ui auto</code>
            </div>

            <div class="info-box">
                <strong>Global vs Local Configuration:</strong><br>
                • <code>--global</code>: Applies to all repositories on your computer<br>
                • <code>--local</code>: Applies only to the current repository
            </div>

            <h3>Getting Help</h3>
            <div class="code-block">
                <code># Get help for any command<br>
                git help &lt;command&gt;<br>
                git &lt;command&gt; --help<br><br>
                
                # Quick reference<br>
                git &lt;command&gt; -h</code>
            </div>
        `
    },
    init: {
        title: "git init",
        content: `
            <h2>🚀 git init - Creating a Repository</h2>
            <p>The <code>git init</code> command creates a new Git repository. It's the first command you run when starting a new project.</p>

            <h3>Creating a New Repository</h3>
            <div class="code-block">
                <code># Navigate to your project folder<br>
                cd my-project<br><br>
                
                # Initialize Git repository<br>
                git init</code>
            </div>

            <h3>What Happens?</h3>
            <p>Git creates a hidden <code>.git</code> folder that contains:</p>
            <ul>
                <li>Repository metadata</li>
                <li>Object database (commits, trees, blobs)</li>
                <li>Configuration files</li>
                <li>Branch information</li>
            </ul>

            <div class="warning-box">
                <strong>⚠️ Warning:</strong> Never manually edit files inside the <code>.git</code> folder unless you know exactly what you're doing!
            </div>

            <h3>Initialize with a Branch Name</h3>
            <div class="code-block">
                <code>git init --initial-branch=main<br>
                # or<br>
                git init -b main</code>
            </div>

            <h3>Cloning vs Initializing</h3>
            <div class="example-box">
                <strong>Use git init when:</strong> Starting a brand new project from scratch<br>
                <strong>Use git clone when:</strong> Copying an existing repository from somewhere else
            </div>

            <h3>Try It Yourself!</h3>
            <p>Go to the Practice tab and complete Challenge 1 to create your first repository!</p>
        `
    },
    add: {
        title: "git add",
        content: `
            <h2>➕ git add - Staging Changes</h2>
            <p>The <code>git add</code> command adds files to the staging area, preparing them for commit.</p>

            <h3>Basic Usage</h3>
            <div class="code-block">
                <code># Stage a specific file<br>
                git add filename.txt<br><br>
                
                # Stage all files in current directory<br>
                git add .<br><br>
                
                # Stage all files in repository<br>
                git add --all<br>
                git add -A<br><br>
                
                # Stage multiple specific files<br>
                git add file1.txt file2.txt file3.txt</code>
            </div>

            <h3>The Staging Area</h3>
            <p>The staging area (also called "index") is like a preview of your next commit. It lets you:</p>
            <ul>
                <li>Choose exactly which changes to commit</li>
                <li>Review changes before committing</li>
                <li>Create logical, organized commits</li>
            </ul>

            <h3>Advanced Options</h3>
            <div class="code-block">
                <code># Stage only modified and deleted files (not new files)<br>
                git add -u<br><br>
                
                # Interactive staging (choose what to stage)<br>
                git add -i<br><br>
                
                # Stage specific parts of a file<br>
                git add -p filename.txt</code>
            </div>

            <div class="info-box">
                <strong>💡 Best Practice:</strong> Use <code>git add -p</code> for patch staging. It lets you review and stage changes chunk by chunk, creating cleaner commits.
            </div>

            <h3>Staging Patterns</h3>
            <div class="code-block">
                <code># Stage all JavaScript files<br>
                git add *.js<br><br>
                
                # Stage all files in a directory<br>
                git add src/<br><br>
                
                # Stage all CSS files in any directory<br>
                git add "**/*.css"</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Common Mistake:</strong> Don't forget to stage files after making changes! A common error is committing without staging new changes.
            </div>

            <h3>Unstaging Files</h3>
            <div class="code-block">
                <code># Unstage a file (keep changes in working directory)<br>
                git restore --staged filename.txt<br><br>
                
                # Old syntax (still works)<br>
                git reset HEAD filename.txt</code>
            </div>
        `
    },
    commit: {
        title: "git commit",
        content: `
            <h2>💾 git commit - Saving Changes</h2>
            <p>The <code>git commit</code> command creates a snapshot of your staged changes and saves it to the repository history.</p>

            <h3>Basic Commit</h3>
            <div class="code-block">
                <code># Commit with a message<br>
                git commit -m "Add user authentication feature"<br><br>
                
                # Commit with a detailed message (opens editor)<br>
                git commit</code>
            </div>

            <h3>Commit Message Best Practices</h3>
            <div class="example-box">
                <strong>Good Commit Messages:</strong><br>
                ✅ "Add login validation for email format"<br>
                ✅ "Fix navbar overflow on mobile devices"<br>
                ✅ "Update README with installation instructions"<br><br>
                
                <strong>Bad Commit Messages:</strong><br>
                ❌ "fix stuff"<br>
                ❌ "asdf"<br>
                ❌ "updated files"
            </div>

            <h3>Commit Message Format</h3>
            <div class="code-block">
                <code># Single line (recommended for small changes)<br>
                git commit -m "Add feature: user profile page"<br><br>
                
                # Multi-line (for complex changes)<br>
                git commit -m "Add user profile page" -m "- Added profile component
- Implemented edit functionality
- Added avatar upload
- Created profile API endpoints"</code>
            </div>

            <h3>Useful Commit Options</h3>
            <div class="code-block">
                <code># Stage all modified files and commit<br>
                git commit -am "Update configuration files"<br><br>
                
                # Amend the last commit (add more changes or fix message)<br>
                git commit --amend -m "Corrected commit message"<br><br>
                
                # Commit with all tracked files (skip staging)<br>
                git commit -a -m "Quick fix for typo"</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> <code>git commit --amend</code> rewrites history! Only use it on commits that haven't been pushed to a shared repository.
            </div>

            <h3>Conventional Commits</h3>
            <p>Many teams use a standardized format:</p>
            <div class="code-block">
                <code>feat: Add new feature<br>
                fix: Fix a bug<br>
                docs: Update documentation<br>
                style: Format code (no logic change)<br>
                refactor: Restructure code<br>
                test: Add or update tests<br>
                chore: Maintenance tasks</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Each commit should represent a single logical change. If you find yourself using "and" in your commit message, consider splitting it into multiple commits.
            </div>

            <h3>Viewing Commits</h3>
            <div class="code-block">
                <code># Show commit history<br>
                git log<br><br>
                
                # Show last 5 commits<br>
                git log -5<br><br>
                
                # Show commits in one line each<br>
                git log --oneline</code>
            </div>
        `
    },
    status: {
        title: "git status",
        content: `
            <h2>📊 git status - Check Repository State</h2>
            <p>The <code>git status</code> command shows the current state of your working directory and staging area.</p>

            <h3>Basic Usage</h3>
            <div class="code-block">
                <code>git status</code>
            </div>

            <h3>What It Shows</h3>
            <ul>
                <li>Current branch name</li>
                <li>Staged changes (ready to commit)</li>
                <li>Unstaged changes (modified but not staged)</li>
                <li>Untracked files (new files Git doesn't know about)</li>
                <li>Relationship with remote branch</li>
            </ul>

            <h3>Example Output</h3>
            <div class="code-block">
                <code>On branch main<br>
                Your branch is up to date with 'origin/main'.<br><br>
                
                Changes to be committed:<br>
                &nbsp;&nbsp;(use "git restore --staged &lt;file&gt;..." to unstage)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;modified:   index.html<br><br>
                
                Changes not staged for commit:<br>
                &nbsp;&nbsp;(use "git add &lt;file&gt;..." to update what will be committed)<br>
                &nbsp;&nbsp;(use "git restore &lt;file&gt;..." to discard changes)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;modified:   style.css<br><br>
                
                Untracked files:<br>
                &nbsp;&nbsp;(use "git add &lt;file&gt;..." to include in what will be committed)<br>
                &nbsp;&nbsp;&nbsp;&nbsp;script.js</code>
            </div>

            <h3>Short Status</h3>
            <div class="code-block">
                <code># Compact output<br>
                git status -s<br>
                git status --short<br><br>
                
                # Example output:<br>
                # M  index.html    (staged)<br>
                # &nbsp;M style.css     (not staged)<br>
                # ?? script.js     (untracked)</code>
            </div>

            <h3>Status Symbols Explained</h3>
            <div class="info-box">
                <strong>M</strong> = Modified<br>
                <strong>A</strong> = Added (new file staged)<br>
                <strong>D</strong> = Deleted<br>
                <strong>R</strong> = Renamed<br>
                <strong>C</strong> = Copied<br>
                <strong>U</strong> = Updated but unmerged<br>
                <strong>??</strong> = Untracked
            </div>

            <h3>Ignoring Files</h3>
            <p>Create a <code>.gitignore</code> file to tell Git which files to ignore:</p>
            <div class="code-block">
                <code># .gitignore example<br>
                node_modules/<br>
                *.log<br>
                .env<br>
                dist/<br>
                .DS_Store<br>
                *.swp</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Run <code>git status</code> frequently! It's one of the most useful commands for understanding your repository's current state.
            </div>

            <h3>Branch Information</h3>
            <div class="code-block">
                <code># Show branch information<br>
                git status -b<br>
                git status --branch</code>
            </div>

            <div class="example-box">
                <strong>Workflow Tip:</strong> Many developers run <code>git status</code> before and after every other Git command to verify the expected changes occurred.
            </div>
        `
    },
    branch: {
        title: "git branch",
        content: `
            <h2>🌿 git branch - Managing Branches</h2>
            <p>Branches allow you to develop features, fix bugs, or experiment with new ideas in isolated environments.</p>

            <h3>Why Use Branches?</h3>
            <ul>
                <li>Work on features without affecting the main codebase</li>
                <li>Multiple team members can work simultaneously</li>
                <li>Easy to experiment and discard if needed</li>
                <li>Organize work by feature, bug fix, or release</li>
            </ul>

            <h3>Branch Commands</h3>
            <div class="code-block">
                <code># List all branches<br>
                git branch<br><br>
                
                # List all branches (including remote)<br>
                git branch -a<br><br>
                
                # Create a new branch<br>
                git branch feature-login<br><br>
                
                # Delete a branch<br>
                git branch -d feature-login<br><br>
                
                # Force delete a branch (even if not merged)<br>
                git branch -D feature-login<br><br>
                
                # Rename current branch<br>
                git branch -m new-branch-name</code>
            </div>

            <h3>Branch Naming Conventions</h3>
            <div class="example-box">
                <strong>Common Patterns:</strong><br>
                • feature/user-authentication<br>
                • bugfix/login-error<br>
                • hotfix/security-patch<br>
                • release/v1.2.0<br>
                • docs/update-readme<br><br>
                
                <strong>Best Practices:</strong><br>
                ✅ Use descriptive names<br>
                ✅ Use hyphens or slashes<br>
                ✅ Keep names lowercase<br>
                ❌ Avoid spaces<br>
                ❌ Don't use special characters
            </div>

            <h3>Viewing Branch Information</h3>
            <div class="code-block">
                <code># Show last commit on each branch<br>
                git branch -v<br><br>
                
                # Show merged branches<br>
                git branch --merged<br><br>
                
                # Show unmerged branches<br>
                git branch --no-merged<br><br>
                
                # Show remote branches<br>
                git branch -r</code>
            </div>

            <h3>Common Branching Strategies</h3>
            <div class="info-box">
                <strong>Git Flow:</strong><br>
                • main: Production-ready code<br>
                • develop: Integration branch for features<br>
                • feature/*: New features<br>
                • release/*: Preparing new releases<br>
                • hotfix/*: Emergency fixes<br><br>
                
                <strong>GitHub Flow:</strong><br>
                • main: Always deployable<br>
                • feature/*: Branch for each feature<br>
                • Merge via pull requests
            </div>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> Always make sure you're on the correct branch before starting work! Use <code>git status</code> or <code>git branch</code> to check.
            </div>

            <h3>Tracking Remote Branches</h3>
            <div class="code-block">
                <code># Create and track a remote branch<br>
                git branch --track feature-login origin/feature-login<br><br>
                
                # Set upstream for current branch<br>
                git branch --set-upstream-to=origin/main main</code>
            </div>
        `
    },
    checkout: {
        title: "git checkout",
        content: `
            <h2>🔄 git checkout / git switch - Switching Branches</h2>
            <p>Navigate between branches and restore files with checkout (or the newer switch command).</p>

            <h3>Switching Branches</h3>
            <div class="code-block">
                <code># Switch to existing branch (old syntax)<br>
                git checkout feature-login<br><br>
                
                # Switch to existing branch (new syntax - recommended)<br>
                git switch feature-login<br><br>
                
                # Create and switch to new branch (old)<br>
                git checkout -b new-feature<br><br>
                
                # Create and switch to new branch (new)<br>
                git switch -c new-feature</code>
            </div>

            <h3>Why Two Commands?</h3>
            <p>Git introduced <code>git switch</code> and <code>git restore</code> to make Git more intuitive:</p>
            <div class="info-box">
                <strong>git switch:</strong> For switching branches<br>
                <strong>git restore:</strong> For restoring files<br>
                <strong>git checkout:</strong> Can do both (but confusing!)
            </div>

            <h3>Working with Detached HEAD</h3>
            <div class="code-block">
                <code># Checkout a specific commit<br>
                git checkout abc1234<br><br>
                
                # Create a branch from detached HEAD<br>
                git switch -c new-branch-from-commit</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Detached HEAD Warning:</strong> When you checkout a commit directly, you're in "detached HEAD" state. Any commits you make won't belong to any branch unless you create a new branch!
            </div>

            <h3>Restoring Files</h3>
            <div class="code-block">
                <code># Discard changes in working directory (new)<br>
                git restore filename.txt<br><br>
                
                # Discard changes in working directory (old)<br>
                git checkout -- filename.txt<br><br>
                
                # Restore file from specific commit<br>
                git restore --source=abc1234 filename.txt<br><br>
                
                # Unstage a file<br>
                git restore --staged filename.txt</code>
            </div>

            <h3>Switching with Uncommitted Changes</h3>
            <div class="example-box">
                <strong>Scenario:</strong> You have uncommitted changes and want to switch branches.<br><br>
                
                <strong>Options:</strong><br>
                1. Commit your changes first<br>
                2. Stash your changes: <code>git stash</code><br>
                3. Force switch (discard changes): <code>git switch -f branch-name</code>
            </div>

            <h3>Checkout Remote Branch</h3>
            <div class="code-block">
                <code># Checkout remote branch (creates local copy)<br>
                git checkout -b feature-login origin/feature-login<br><br>
                
                # Newer syntax<br>
                git switch -c feature-login origin/feature-login<br><br>
                
                # Even simpler (if branch doesn't exist locally)<br>
                git switch feature-login</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Use <code>git switch</code> for changing branches and <code>git restore</code> for file operations. They're clearer and less error-prone than <code>git checkout</code>.
            </div>

            <h3>Checkout Previous Branch</h3>
            <div class="code-block">
                <code># Switch to previous branch<br>
                git checkout -<br>
                git switch -</code>
            </div>
        `
    },
    merge: {
        title: "git merge",
        content: `
            <h2>🔀 git merge - Combining Branches</h2>
            <p>Merge integrates changes from one branch into another, combining their histories.</p>

            <h3>Basic Merge</h3>
            <div class="code-block">
                <code># Switch to the branch you want to merge INTO<br>
                git checkout main<br><br>
                
                # Merge feature branch into current branch<br>
                git merge feature-login</code>
            </div>

            <h3>Types of Merges</h3>
            
            <h4>1. Fast-Forward Merge</h4>
            <div class="info-box">
                Occurs when there are no new commits on the target branch. Git simply moves the pointer forward.<br><br>
                
                <strong>Before:</strong> main (A) ← feature (B → C)<br>
                <strong>After:</strong> main, feature (A → B → C)
            </div>
            <div class="code-block">
                <code># Regular merge (fast-forward if possible)<br>
                git merge feature-branch<br><br>
                
                # Force create merge commit (no fast-forward)<br>
                git merge --no-ff feature-branch</code>
            </div>

            <h4>2. Three-Way Merge</h4>
            <div class="info-box">
                Occurs when both branches have new commits. Git creates a new merge commit that has two parents.<br><br>
                
                <strong>Creates a merge commit combining both histories</strong>
            </div>

            <h3>Merge Options</h3>
            <div class="code-block">
                <code># Merge with custom commit message<br>
                git merge feature-login -m "Merge feature: user login"<br><br>
                
                # Squash merge (combine all commits into one)<br>
                git merge --squash feature-login<br><br>
                
                # Abort a merge in progress<br>
                git merge --abort<br><br>
                
                # Continue merge after resolving conflicts<br>
                git merge --continue</code>
            </div>

            <h3>Merge Strategies</h3>
            <div class="example-box">
                <strong>--ff (default):</strong> Fast-forward if possible, otherwise create merge commit<br>
                <strong>--no-ff:</strong> Always create a merge commit (preserves branch history)<br>
                <strong>--ff-only:</strong> Only merge if fast-forward is possible, otherwise fail<br>
                <strong>--squash:</strong> Combine all commits into one (loses individual commit history)
            </div>

            <h3>Merge Workflow</h3>
            <div class="code-block">
                <code># 1. Update your main branch<br>
                git checkout main<br>
                git pull origin main<br><br>
                
                # 2. Switch to feature branch<br>
                git checkout feature-login<br><br>
                
                # 3. Rebase on main (optional, but recommended)<br>
                git rebase main<br><br>
                
                # 4. Switch back to main<br>
                git checkout main<br><br>
                
                # 5. Merge feature branch<br>
                git merge feature-login<br><br>
                
                # 6. Push changes<br>
                git push origin main<br><br>
                
                # 7. Delete feature branch<br>
                git branch -d feature-login</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Before Merging:</strong><br>
                • Make sure you're on the correct branch<br>
                • Ensure your branch is up to date<br>
                • Commit or stash any uncommitted changes<br>
                • Consider testing the feature branch first
            </div>

            <h3>Viewing Merge History</h3>
            <div class="code-block">
                <code># Show merge commits<br>
                git log --merges<br><br>
                
                # Show commit graph<br>
                git log --graph --oneline --all<br><br>
                
                # See what would be merged<br>
                git log main..feature-branch</code>
            </div>

            <div class="info-box">
                <strong>💡 Best Practice:</strong> Use <code>--no-ff</code> for feature branches to preserve the context that changes were made in a separate branch. Use fast-forward for simple hotfixes.
            </div>
        `
    },
    conflict: {
        title: "Merge Conflicts",
        content: `
            <h2>⚔️ Resolving Merge Conflicts</h2>
            <p>Conflicts occur when Git can't automatically merge changes because the same lines were modified in both branches.</p>

            <h3>When Do Conflicts Occur?</h3>
            <ul>
                <li>Two branches modify the same line in a file</li>
                <li>One branch deletes a file while another modifies it</li>
                <li>Two branches create files with the same name</li>
            </ul>

            <h3>Conflict Markers</h3>
            <p>When a conflict occurs, Git adds markers to the file:</p>
            <div class="code-block">
                <code><<<<<<< HEAD<br>
                console.log("Version from current branch");<br>
                =======<br>
                console.log("Version from merging branch");<br>
                >>>>>>> feature-branch</code>
            </div>

            <div class="info-box">
                <strong><<<<<<< HEAD:</strong> Start of your current branch's version<br>
                <strong>=======:</strong> Separator between versions<br>
                <strong>>>>>>>> branch-name:</strong> End of the merging branch's version
            </div>

            <h3>Resolution Steps</h3>
            <div class="code-block">
                <code># 1. See which files have conflicts<br>
                git status<br><br>
                
                # 2. Open conflicted files and edit them<br>
                # Remove conflict markers and choose correct code<br><br>
                
                # 3. Stage resolved files<br>
                git add filename.txt<br><br>
                
                # 4. Complete the merge<br>
                git commit<br><br>
                
                # Or abort the merge<br>
                git merge --abort</code>
            </div>

            <h3>Resolving the Conflict</h3>
            <p>You have three main options:</p>
            
            <h4>1. Keep Current Branch Version</h4>
            <div class="code-block">
                <code>console.log("Version from current branch");</code>
            </div>

            <h4>2. Keep Incoming Branch Version</h4>
            <div class="code-block">
                <code>console.log("Version from merging branch");</code>
            </div>

            <h4>3. Keep Both (or Create New Solution)</h4>
            <div class="code-block">
                <code>console.log("Version from current branch");<br>
                console.log("Version from merging branch");</code>
            </div>

            <h3>Conflict Resolution Tools</h3>
            <div class="code-block">
                <code># Use default merge tool<br>
                git mergetool<br><br>
                
                # Accept current branch's version for all conflicts<br>
                git checkout --ours .<br><br>
                
                # Accept incoming branch's version for all conflicts<br>
                git checkout --theirs .<br><br>
                
                # For specific file<br>
                git checkout --ours filename.txt<br>
                git checkout --theirs filename.txt</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Important:</strong> After resolving conflicts:<br>
                1. Always test your code<br>
                2. Remove ALL conflict markers<br>
                3. Stage the resolved files with <code>git add</code><br>
                4. Complete the merge with <code>git commit</code>
            </div>

            <h3>Preventing Conflicts</h3>
            <div class="example-box">
                <strong>Best Practices:</strong><br>
                • Pull changes frequently<br>
                • Keep branches short-lived<br>
                • Make small, focused commits<br>
                • Communicate with your team<br>
                • Use feature branches<br>
                • Rebase before merging
            </div>

            <h3>Advanced Conflict Resolution</h3>
            <div class="code-block">
                <code># Show conflicts in diff format<br>
                git diff<br><br>
                
                # Show three-way diff<br>
                git diff --merge<br><br>
                
                # List conflicted files<br>
                git diff --name-only --diff-filter=U<br><br>
                
                # See the common ancestor version<br>
                git show :1:filename.txt<br><br>
                
                # See current branch version<br>
                git show :2:filename.txt<br><br>
                
                # See merging branch version<br>
                git show :3:filename.txt</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Modern editors like VS Code have excellent built-in merge conflict resolution tools. They show conflicts visually and provide buttons to accept changes.
            </div>
        `
    },
    remote: {
        title: "git remote",
        content: `
            <h2>🌐 git remote - Managing Remote Repositories</h2>
            <p>Remote repositories are versions of your project hosted on the internet or network. They enable collaboration.</p>

            <h3>What is a Remote?</h3>
            <p>A remote is a connection to another repository, typically hosted on services like:</p>
            <ul>
                <li>GitHub</li>
                <li>GitLab</li>
                <li>Bitbucket</li>
                <li>Your own server</li>
            </ul>

            <h3>Working with Remotes</h3>
            <div class="code-block">
                <code># List all remotes<br>
                git remote<br><br>
                
                # List remotes with URLs<br>
                git remote -v<br><br>
                
                # Add a new remote<br>
                git remote add origin https://github.com/user/repo.git<br><br>
                
                # Remove a remote<br>
                git remote remove origin<br><br>
                
                # Rename a remote<br>
                git remote rename origin upstream</code>
            </div>

            <h3>Remote Details</h3>
            <div class="code-block">
                <code># Show information about a remote<br>
                git remote show origin<br><br>
                
                # Change remote URL<br>
                git remote set-url origin https://github.com/user/new-repo.git<br><br>
                
                # Verify remote URL<br>
                git remote get-url origin</code>
            </div>

            <h3>Common Remote Names</h3>
            <div class="info-box">
                <strong>origin:</strong> Default name for your main remote repository<br>
                <strong>upstream:</strong> Common name for the original repository you forked from<br>
                <strong>heroku:</strong> Used when deploying to Heroku<br><br>
                
                You can have multiple remotes!
            </div>

            <h3>Setting Up Origin</h3>
            <div class="code-block">
                <code># After creating a repo on GitHub<br>
                git remote add origin https://github.com/username/repo.git<br><br>
                
                # Push and set upstream<br>
                git push -u origin main<br><br>
                
                # Now you can just use<br>
                git push</code>
            </div>

            <h3>HTTPS vs SSH</h3>
            <div class="example-box">
                <strong>HTTPS URL:</strong><br>
                https://github.com/username/repo.git<br>
                • Easy to set up<br>
                • Requires password/token each time<br><br>
                
                <strong>SSH URL:</strong><br>
                git@github.com:username/repo.git<br>
                • Requires SSH key setup<br>
                • No password needed after setup<br>
                • More secure
            </div>

            <h3>Multiple Remotes Workflow</h3>
            <div class="code-block">
                <code># Fork workflow example<br>
                # Your fork<br>
                git remote add origin git@github.com:you/repo.git<br><br>
                
                # Original repository<br>
                git remote add upstream git@github.com:original/repo.git<br><br>
                
                # Fetch from original<br>
                git fetch upstream<br><br>
                
                # Merge original's changes<br>
                git merge upstream/main<br><br>
                
                # Push to your fork<br>
                git push origin main</code>
            </div>

            <h3>Tracking Branches</h3>
            <div class="code-block">
                <code># See tracking relationships<br>
                git branch -vv<br><br>
                
                # Set tracking for current branch<br>
                git branch --set-upstream-to=origin/main<br><br>
                
                # Push and set tracking<br>
                git push -u origin feature-branch</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Security Note:</strong> Never commit sensitive information like passwords or API keys. If you do, they're in Git's history even if you delete them later!
            </div>

            <h3>Pruning Remotes</h3>
            <div class="code-block">
                <code># Remove stale remote-tracking branches<br>
                git remote prune origin<br><br>
                
                # Remove stale branches during fetch<br>
                git fetch --prune<br><br>
                
                # Set automatic pruning<br>
                git config --global fetch.prune true</code>
            </div>
        `
    },
    // Additional lessons continue...
    // (I'll add the remaining lessons in the next part)
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = lessons;
}
