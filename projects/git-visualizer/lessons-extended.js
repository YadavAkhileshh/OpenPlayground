// Additional lessons (continuing from lessons.js)

const additionalLessons = {
    clone: {
        title: "git clone",
        content: `
            <h2>📥 git clone - Copying Repositories</h2>
            <p>Clone creates a complete copy of a repository, including all history, branches, and files.</p>

            <h3>Basic Cloning</h3>
            <div class="code-block">
                <code># Clone a repository<br>
                git clone https://github.com/username/repo.git<br><br>
                
                # Clone into a specific folder<br>
                git clone https://github.com/username/repo.git my-folder<br><br>
                
                # Clone a specific branch<br>
                git clone -b develop https://github.com/username/repo.git</code>
            </div>

            <h3>Clone Options</h3>
            <div class="code-block">
                <code># Shallow clone (only recent history)<br>
                git clone --depth 1 https://github.com/username/repo.git<br><br>
                
                # Clone without checking out files<br>
                git clone --no-checkout https://github.com/username/repo.git<br><br>
                
                # Clone with submodules<br>
                git clone --recursive https://github.com/username/repo.git</code>
            </div>

            <div class="info-box">
                <strong>💡 Shallow Clone Benefits:</strong><br>
                • Faster download<br>
                • Less disk space<br>
                • Good for CI/CD pipelines<br>
                • Perfect for quick testing<br><br>
                
                <strong>⚠️ Limitations:</strong><br>
                • No full history<br>
                • Some operations restricted
            </div>

            <h3>What Gets Cloned?</h3>
            <ul>
                <li>All commits and history</li>
                <li>All branches (as remote-tracking branches)</li>
                <li>All tags</li>
                <li>Project files</li>
                <li>Configuration from the remote repository</li>
            </ul>

            <h3>After Cloning</h3>
            <div class="code-block">
                <code># Enter the cloned directory<br>
                cd repo<br><br>
                
                # Check remote configuration<br>
                git remote -v<br><br>
                
                # See all branches (including remote)<br>
                git branch -a<br><br>
                
                # Checkout a remote branch<br>
                git checkout feature-branch</code>
            </div>
        `
    },
    push: {
        title: "git push",
        content: `
            <h2>⬆️ git push - Uploading Changes</h2>
            <p>Push uploads your local commits to a remote repository.</p>

            <h3>Basic Push</h3>
            <div class="code-block">
                <code># Push current branch to remote<br>
                git push<br><br>
                
                # Push and set upstream tracking<br>
                git push -u origin main<br><br>
                
                # Push specific branch<br>
                git push origin feature-branch<br><br>
                
                # Push all branches<br>
                git push --all origin</code>
            </div>

            <h3>Push Options</h3>
            <div class="code-block">
                <code># Force push (dangerous!)<br>
                git push --force<br><br>
                
                # Safer force push<br>
                git push --force-with-lease<br><br>
                
                # Push tags<br>
                git push --tags<br><br>
                
                # Push specific tag<br>
                git push origin v1.0.0<br><br>
                
                # Delete remote branch<br>
                git push origin --delete feature-branch</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Force Push Warning:</strong><br>
                <code>--force</code> can overwrite others' work!<br><br>
                
                <strong>Use <code>--force-with-lease</code> instead:</strong><br>
                • Checks if remote has been updated<br>
                • Fails if someone else pushed<br>
                • Much safer alternative
            </div>

            <h3>Setting Upstream</h3>
            <div class="code-block">
                <code># First push with upstream<br>
                git push -u origin feature-branch<br><br>
                
                # Now you can just use<br>
                git push</code>
            </div>

            <h3>Push Workflow</h3>
            <div class="example-box">
                <strong>1. Make changes and commit</strong><br>
                git add .<br>
                git commit -m "Add new feature"<br><br>
                
                <strong>2. Pull latest changes (avoid conflicts)</strong><br>
                git pull --rebase<br><br>
                
                <strong>3. Push your commits</strong><br>
                git push
            </div>

            <h3>Common Push Errors</h3>
            <div class="info-box">
                <strong>Error: "Updates were rejected"</strong><br>
                Solution: Pull first, then push<br>
                <code>git pull<br>
                git push</code><br><br>
                
                <strong>Error: "Permission denied"</strong><br>
                Solution: Check your credentials and permissions<br><br>
                
                <strong>Error: "fatal: remote origin already exists"</strong><br>
                Solution: Remote is already configured
            </div>
        `
    },
    pull: {
        title: "git pull",
        content: `
            <h2>⬇️ git pull - Downloading Changes</h2>
            <p>Pull fetches changes from a remote repository and merges them into your current branch.</p>

            <h3>What is Pull?</h3>
            <div class="info-box">
                <code>git pull</code> = <code>git fetch</code> + <code>git merge</code><br><br>
                
                It's a combination of two operations!
            </div>

            <h3>Basic Pull</h3>
            <div class="code-block">
                <code># Pull from tracked remote branch<br>
                git pull<br><br>
                
                # Pull from specific remote and branch<br>
                git pull origin main<br><br>
                
                # Pull and rebase instead of merge<br>
                git pull --rebase<br><br>
                
                # Pull with fast-forward only<br>
                git pull --ff-only</code>
            </div>

            <h3>Pull vs Fetch</h3>
            <div class="example-box">
                <strong>git pull:</strong><br>
                • Downloads AND merges changes<br>
                • Automatic merge<br>
                • Can cause conflicts<br>
                • Modifies your working directory<br><br>
                
                <strong>git fetch:</strong><br>
                • Only downloads changes<br>
                • No merge<br>
                • Safe to run anytime<br>
                • Doesn't modify working directory
            </div>

            <h3>Pull with Rebase</h3>
            <div class="code-block">
                <code># Pull and rebase (cleaner history)<br>
                git pull --rebase<br><br>
                
                # Set rebase as default for pull<br>
                git config --global pull.rebase true<br><br>
                
                # Set for specific repository<br>
                git config pull.rebase true</code>
            </div>

            <div class="info-box">
                <strong>💡 Why Pull with Rebase?</strong><br>
                • Cleaner, linear history<br>
                • No unnecessary merge commits<br>
                • Easier to read git log<br>
                • Preferred by many teams
            </div>

            <h3>Handling Conflicts During Pull</h3>
            <div class="code-block">
                <code># If conflicts occur during pull<br>
                # 1. Resolve conflicts in files<br>
                # 2. Stage resolved files<br>
                git add .<br><br>
                
                # 3. Complete the merge<br>
                git commit<br><br>
                
                # Or abort the pull<br>
                git merge --abort</code>
            </div>

            <h3>Best Practices</h3>
            <div class="example-box">
                <strong>Pull Frequently:</strong> Stay up to date with team changes<br>
                <strong>Pull Before Push:</strong> Reduce conflicts<br>
                <strong>Commit First:</strong> Save your work before pulling<br>
                <strong>Use --rebase:</strong> For cleaner history<br>
                <strong>Review Changes:</strong> Check what you're merging
            </div>

            <h3>Advanced Pull Operations</h3>
            <div class="code-block">
                <code># Pull all remotes<br>
                git pull --all<br><br>
                
                # Pull without committing<br>
                git pull --no-commit<br><br>
                
                # Pull and automatically stash/unstash<br>
                git pull --autostash</code>
            </div>
        `
    },
    fetch: {
        title: "git fetch",
        content: `
            <h2>🔄 git fetch - Downloading Without Merging</h2>
            <p>Fetch downloads changes from a remote repository without modifying your working directory.</p>

            <h3>Basic Fetch</h3>
            <div class="code-block">
                <code># Fetch from default remote<br>
                git fetch<br><br>
                
                # Fetch from specific remote<br>
                git fetch origin<br><br>
                
                # Fetch specific branch<br>
                git fetch origin main<br><br>
                
                # Fetch all remotes<br>
                git fetch --all</code>
            </div>

            <h3>Why Use Fetch?</h3>
            <ul>
                <li>Safe way to see what others have done</li>
                <li>Review changes before merging</li>
                <li>Update remote-tracking branches</li>
                <li>No risk of conflicts in working directory</li>
            </ul>

            <h3>Fetch Workflow</h3>
            <div class="code-block">
                <code># 1. Fetch changes<br>
                git fetch origin<br><br>
                
                # 2. See what changed<br>
                git log origin/main..main<br><br>
                
                # 3. Review the changes<br>
                git diff main origin/main<br><br>
                
                # 4. Merge if ready<br>
                git merge origin/main</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Use fetch to safely check for updates before deciding whether to merge. It's like previewing changes before accepting them.
            </div>

            <h3>Fetch Options</h3>
            <div class="code-block">
                <code># Fetch and prune deleted branches<br>
                git fetch --prune<br><br>
                
                # Fetch tags<br>
                git fetch --tags<br><br>
                
                # Fetch without tags<br>
                git fetch --no-tags<br><br>
                
                # Dry run (see what would be fetched)<br>
                git fetch --dry-run</code>
            </div>

            <h3>After Fetching</h3>
            <div class="code-block">
                <code># View remote branches<br>
                git branch -r<br><br>
                
                # View all branches<br>
                git branch -a<br><br>
                
                # Checkout remote branch<br>
                git checkout -b local-branch origin/remote-branch<br><br>
                
                # Compare with remote<br>
                git log HEAD..origin/main</code>
            </div>
        `
    },
    stash: {
        title: "git stash",
        content: `
            <h2>📦 git stash - Temporarily Save Changes</h2>
            <p>Stash saves your uncommitted changes temporarily so you can work on something else.</p>

            <h3>Why Use Stash?</h3>
            <ul>
                <li>Switch branches without committing incomplete work</li>
                <li>Pull changes without conflicts</li>
                <li>Quickly test something on a clean state</li>
                <li>Save work without creating a commit</li>
            </ul>

            <h3>Basic Stash Commands</h3>
            <div class="code-block">
                <code># Stash current changes<br>
                git stash<br><br>
                
                # Stash with a message<br>
                git stash save "Work in progress on feature X"<br><br>
                
                # Stash including untracked files<br>
                git stash -u<br>
                git stash --include-untracked<br><br>
                
                # Stash everything (including ignored files)<br>
                git stash -a<br>
                git stash --all</code>
            </div>

            <h3>Applying Stashes</h3>
            <div class="code-block">
                <code># Apply most recent stash (keeps stash)<br>
                git stash apply<br><br>
                
                # Apply most recent stash (removes stash)<br>
                git stash pop<br><br>
                
                # Apply specific stash<br>
                git stash apply stash@{2}<br><br>
                
                # Apply stash to different branch<br>
                git stash branch new-branch stash@{0}</code>
            </div>

            <h3>Managing Stashes</h3>
            <div class="code-block">
                <code># List all stashes<br>
                git stash list<br><br>
                
                # Show stash contents<br>
                git stash show<br>
                git stash show -p stash@{0}<br><br>
                
                # Delete a stash<br>
                git stash drop stash@{1}<br><br>
                
                # Delete all stashes<br>
                git stash clear</code>
            </div>

            <h3>Stash Workflow Example</h3>
            <div class="example-box">
                <strong>Scenario:</strong> You're working on a feature when an urgent bug needs fixing.<br><br>
                
                <code># Save your current work<br>
                git stash save "WIP: new feature"<br><br>
                
                # Switch to main branch<br>
                git checkout main<br><br>
                
                # Fix the bug and commit<br>
                # ...<br><br>
                
                # Return to feature branch<br>
                git checkout feature<br><br>
                
                # Restore your work<br>
                git stash pop</code>
            </div>

            <div class="info-box">
                <strong>💡 Pop vs Apply:</strong><br>
                • <strong>pop:</strong> Apply and remove stash (default for most cases)<br>
                • <strong>apply:</strong> Apply but keep stash (useful if applying to multiple branches)
            </div>

            <h3>Advanced Stash Usage</h3>
            <div class="code-block">
                <code># Stash specific files<br>
                git stash push -m "message" file1.txt file2.txt<br><br>
                
                # Stash only staged changes<br>
                git stash --staged<br><br>
                
                # Stash only unstaged changes<br>
                git stash --keep-index<br><br>
                
                # Create stash from diff<br>
                git stash show -p | git apply --reverse</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ Stash Gotchas:</strong><br>
                • Stashes are local only (not pushed to remote)<br>
                • Can cause conflicts when applied<br>
                • Easy to forget about old stashes<br>
                • Use descriptive messages!
            </div>
        `
    },
    rebase: {
        title: "git rebase",
        content: `
            <h2>🔄 git rebase - Rewriting History</h2>
            <p>Rebase moves or combines commits to create a cleaner, linear history.</p>

            <h3>What is Rebase?</h3>
            <p>Rebase takes commits from one branch and replays them on top of another branch.</p>

            <div class="info-box">
                <strong>Merge:</strong> Combines branches with a merge commit<br>
                <strong>Rebase:</strong> Moves commits to create linear history<br><br>
                
                Result: Cleaner, easier-to-read history
            </div>

            <h3>Basic Rebase</h3>
            <div class="code-block">
                <code># Rebase current branch onto main<br>
                git checkout feature-branch<br>
                git rebase main<br><br>
                
                # Interactive rebase last 3 commits<br>
                git rebase -i HEAD~3<br><br>
                
                # Continue after resolving conflicts<br>
                git rebase --continue<br><br>
                
                # Abort rebase<br>
                git rebase --abort<br><br>
                
                # Skip current commit<br>
                git rebase --skip</code>
            </div>

            <h3>Interactive Rebase</h3>
            <p>Interactive rebase lets you edit commit history:</p>
            <div class="code-block">
                <code>pick abc1234 Add login feature<br>
                squash def5678 Fix login bug<br>
                reword ghi9012 Update documentation<br>
                edit jkl3456 Add user profile<br>
                drop mno7890 Experimental feature</code>
            </div>

            <div class="info-box">
                <strong>Commands:</strong><br>
                • <strong>pick:</strong> Use commit as-is<br>
                • <strong>reword:</strong> Change commit message<br>
                • <strong>edit:</strong> Stop to amend commit<br>
                • <strong>squash:</strong> Combine with previous commit<br>
                • <strong>fixup:</strong> Squash but discard message<br>
                • <strong>drop:</strong> Remove commit
            </div>

            <h3>Common Rebase Workflows</h3>
            
            <h4>1. Update Feature Branch</h4>
            <div class="code-block">
                <code># Keep feature branch up to date<br>
                git checkout feature-branch<br>
                git rebase main</code>
            </div>

            <h4>2. Squash Commits Before Merging</h4>
            <div class="code-block">
                <code># Combine 5 commits into one<br>
                git rebase -i HEAD~5<br>
                # Change 'pick' to 'squash' for commits to combine</code>
            </div>

            <h4>3. Clean Up Commit Messages</h4>
            <div class="code-block">
                <code># Edit last 3 commit messages<br>
                git rebase -i HEAD~3<br>
                # Change 'pick' to 'reword' for commits to edit</code>
            </div>

            <div class="warning-box">
                <strong>⚠️ GOLDEN RULE OF REBASE:</strong><br>
                <strong>Never rebase commits that have been pushed to a shared repository!</strong><br><br>
                
                Why? Because rebase rewrites history, and if others are using those commits, you'll create massive problems.<br><br>
                
                <strong>Safe to rebase:</strong> Local commits not yet pushed<br>
                <strong>Unsafe to rebase:</strong> Commits already pushed to shared branch
            </div>

            <h3>Handling Rebase Conflicts</h3>
            <div class="code-block">
                <code># When conflict occurs<br>
                # 1. Edit conflicted files<br>
                # 2. Stage resolved files<br>
                git add .<br><br>
                
                # 3. Continue rebase<br>
                git rebase --continue<br><br>
                
                # Or skip this commit<br>
                git rebase --skip<br><br>
                
                # Or abort entirely<br>
                git rebase --abort</code>
            </div>

            <h3>Rebase vs Merge</h3>
            <div class="example-box">
                <strong>Use Rebase When:</strong><br>
                • Working on private feature branches<br>
                • Want clean, linear history<br>
                • Before creating pull request<br>
                • Cleaning up local commits<br><br>
                
                <strong>Use Merge When:</strong><br>
                • Working on public/shared branches<br>
                • Want to preserve exact history<br>
                • Merging feature into main<br>
                • Collaborating with others
            </div>

            <h3>Rebase onto Different Base</h3>
            <div class="code-block">
                <code># Rebase onto different branch<br>
                git rebase --onto main feature-old feature-new<br><br>
                
                # Rebase last N commits onto branch<br>
                git rebase --onto main HEAD~5</code>
            </div>
        `
    },
    reset: {
        title: "git reset",
        content: `
            <h2>↩️ git reset - Undoing Changes</h2>
            <p>Reset moves the branch pointer to a different commit, effectively "undoing" commits.</p>

            <h3>Three Types of Reset</h3>
            
            <h4>1. Soft Reset (Keep Changes Staged)</h4>
            <div class="code-block">
                <code>git reset --soft HEAD~1</code>
            </div>
            <div class="info-box">
                • Moves HEAD back one commit<br>
                • Keeps changes in staging area<br>
                • Files remain modified<br>
                • Use when: You want to redo the commit
            </div>

            <h4>2. Mixed Reset (Keep Changes Unstaged) - Default</h4>
            <div class="code-block">
                <code>git reset HEAD~1<br>
                git reset --mixed HEAD~1</code>
            </div>
            <div class="info-box">
                • Moves HEAD back one commit<br>
                • Unstages changes<br>
                • Files remain modified<br>
                • Use when: You want to re-stage and re-commit
            </div>

            <h4>3. Hard Reset (Discard Changes)</h4>
            <div class="code-block">
                <code>git reset --hard HEAD~1</code>
            </div>
            <div class="warning-box">
                <strong>⚠️ DANGER:</strong><br>
                • Moves HEAD back one commit<br>
                • Deletes all changes<br>
                • Cannot be undone easily<br>
                • Use when: You're absolutely sure you want to discard everything
            </div>

            <h3>Common Reset Commands</h3>
            <div class="code-block">
                <code># Undo last commit, keep changes<br>
                git reset --soft HEAD~1<br><br>
                
                # Undo last 3 commits, keep changes<br>
                git reset HEAD~3<br><br>
                
                # Reset to specific commit<br>
                git reset abc1234<br><br>
                
                # Discard all changes (DANGEROUS!)<br>
                git reset --hard HEAD<br><br>
                
                # Reset to remote state<br>
                git reset --hard origin/main</code>
            </div>

            <h3>Unstaging Files</h3>
            <div class="code-block">
                <code># Unstage specific file<br>
                git reset HEAD filename.txt<br><br>
                
                # Unstage all files<br>
                git reset HEAD .<br><br>
                
                # Modern syntax<br>
                git restore --staged filename.txt</code>
            </div>

            <h3>Reset vs Revert</h3>
            <div class="example-box">
                <strong>git reset:</strong><br>
                • Moves branch pointer<br>
                • Rewrites history<br>
                • Use for local commits<br>
                • NOT safe for shared branches<br><br>
                
                <strong>git revert:</strong><br>
                • Creates new commit<br>
                • Preserves history<br>
                • Safe for any branch<br>
                • Use for public commits
            </div>

            <h3>Finding Lost Commits</h3>
            <div class="code-block">
                <code># View reflog (command history)<br>
                git reflog<br><br>
                
                # Restore to a previous state<br>
                git reset --hard HEAD@{2}<br><br>
                
                # Or restore specific commit<br>
                git reset --hard abc1234</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Git keeps a reflog for about 90 days, so even "lost" commits can usually be recovered with git reflog!
            </div>

            <h3>Safe Reset Workflow</h3>
            <div class="code-block">
                <code># 1. Create backup branch first<br>
                git branch backup<br><br>
                
                # 2. Reset<br>
                git reset --hard HEAD~3<br><br>
                
                # 3. If mistake, restore from backup<br>
                git reset --hard backup<br><br>
                
                # 4. Delete backup when sure<br>
                git branch -d backup</code>
            </div>

            <h3>Reset vs Checkout vs Revert</h3>
            <div class="example-box">
                <strong>git reset:</strong> Undo commits, move branch pointer<br>
                <strong>git checkout:</strong> Switch branches or restore files<br>
                <strong>git revert:</strong> Undo commits by creating new commit<br>
                <strong>git restore:</strong> Restore files (modern, clearer)
            </div>
        `
    },
    revert: {
        title: "git revert",
        content: `
            <h2>↺ git revert - Safe Undo</h2>
            <p>Revert creates a new commit that undoes changes from a previous commit. It's safe for shared branches!</p>

            <h3>Why Use Revert?</h3>
            <ul>
                <li>Undo commits without rewriting history</li>
                <li>Safe for public/shared branches</li>
                <li>Maintains complete history</li>
                <li>Can be pushed without force</li>
            </ul>

            <h3>Basic Revert</h3>
            <div class="code-block">
                <code># Revert most recent commit<br>
                git revert HEAD<br><br>
                
                # Revert specific commit<br>
                git revert abc1234<br><br>
                
                # Revert without auto-commit<br>
                git revert -n HEAD<br>
                git revert --no-commit HEAD<br><br>
                
                # Revert multiple commits<br>
                git revert HEAD~3..HEAD</code>
            </div>

            <h3>How Revert Works</h3>
            <div class="info-box">
                Instead of removing a commit, revert:<br>
                1. Looks at what the commit changed<br>
                2. Creates opposite changes<br>
                3. Makes a new commit with those changes<br><br>
                
                Result: History is preserved, but effect is undone
            </div>

            <h3>Revert Options</h3>
            <div class="code-block">
                <code># Revert with custom message<br>
                git revert abc1234 -m "Revert: causes production bug"<br><br>
                
                # Revert merge commit (specify parent)<br>
                git revert -m 1 merge-commit-hash<br><br>
                
                # Continue after resolving conflicts<br>
                git revert --continue<br><br>
                
                # Abort revert<br>
                git revert --abort</code>
            </div>

            <h3>Revert vs Reset</h3>
            <div class="example-box">
                <strong>Use Reset When:</strong><br>
                • Commits are local only<br>
                • You want to rewrite history<br>
                • Working on private branch<br><br>
                
                <strong>Use Revert When:</strong><br>
                • Commits are pushed to shared repository<br>
                • You want to preserve history<br>
                • Working on public branch<br>
                • Collaborating with others
            </div>

            <h3>Reverting Multiple Commits</h3>
            <div class="code-block">
                <code># Revert last 3 commits individually<br>
                git revert HEAD~2..HEAD<br><br>
                
                # Revert range without auto-commit<br>
                git revert -n HEAD~3..HEAD<br>
                git commit -m "Revert last 3 commits"</code>
            </div>

            <h3>Handling Revert Conflicts</h3>
            <div class="code-block">
                <code># When conflict occurs<br>
                # 1. Edit conflicted files<br>
                # 2. Stage resolved files<br>
                git add .<br><br>
                
                # 3. Continue revert<br>
                git revert --continue<br><br>
                
                # Or abort<br>
                git revert --abort</code>
            </div>

            <h3>Revert Workflow Example</h3>
            <div class="example-box">
                <strong>Scenario:</strong> A bug was introduced in production.<br><br>
                
                <code># Find the bad commit<br>
                git log --oneline<br><br>
                
                # Revert it<br>
                git revert abc1234<br><br>
                
                # Push the fix<br>
                git push origin main</code><br><br>
                
                No force push needed! Safe and clean.
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> When reverting a revert, it's often clearer to just cherry-pick the original commit onto a new branch instead of doing a "revert of a revert."
            </div>
        `
    },
    'cherry-pick': {
        title: "git cherry-pick",
        content: `
            <h2>🍒 git cherry-pick - Selective Commit Application</h2>
            <p>Cherry-pick applies specific commits from one branch to another without merging the entire branch.</p>

            <h3>Why Use Cherry-Pick?</h3>
            <ul>
                <li>Apply bug fix from one branch to another</li>
                <li>Pick specific features without full merge</li>
                <li>Recover specific commits</li>
                <li>Port changes between branches</li>
            </ul>

            <h3>Basic Cherry-Pick</h3>
            <div class="code-block">
                <code># Pick a single commit<br>
                git cherry-pick abc1234<br><br>
                
                # Pick multiple commits<br>
                git cherry-pick abc1234 def5678 ghi9012<br><br>
                
                # Pick a range of commits<br>
                git cherry-pick abc1234..def5678<br><br>
                
                # Pick without auto-commit<br>
                git cherry-pick -n abc1234<br>
                git cherry-pick --no-commit abc1234</code>
            </div>

            <h3>Cherry-Pick Workflow</h3>
            <div class="example-box">
                <strong>Scenario:</strong> Apply a bug fix from develop to main.<br><br>
                
                <code># 1. Find the commit hash<br>
                git log develop --oneline<br><br>
                
                # 2. Switch to target branch<br>
                git checkout main<br><br>
                
                # 3. Cherry-pick the commit<br>
                git cherry-pick abc1234<br><br>
                
                # 4. Push if needed<br>
                git push origin main</code>
            </div>

            <h3>Cherry-Pick Options</h3>
            <div class="code-block">
                <code># Cherry-pick with custom message<br>
                git cherry-pick abc1234 -e<br><br>
                
                # Cherry-pick and sign off<br>
                git cherry-pick -s abc1234<br><br>
                
                # Continue after resolving conflicts<br>
                git cherry-pick --continue<br><br>
                
                # Skip current cherry-pick<br>
                git cherry-pick --skip<br><br>
                
                # Abort cherry-pick<br>
                git cherry-pick --abort</code>
            </div>

            <h3>Handling Conflicts</h3>
            <div class="code-block">
                <code># When conflict occurs<br>
                # 1. Edit conflicted files<br>
                # 2. Stage resolved files<br>
                git add .<br><br>
                
                # 3. Continue cherry-pick<br>
                git cherry-pick --continue</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Cherry-picking creates a new commit with a different hash, even though the content is the same. This means the same change exists as two different commits in history.
            </div>

            <h3>Cherry-Pick vs Merge</h3>
            <div class="example-box">
                <strong>Use Cherry-Pick When:</strong><br>
                • Need specific commits only<br>
                • Don't want entire branch history<br>
                • Applying hotfixes across branches<br>
                • Recovering specific work<br><br>
                
                <strong>Use Merge When:</strong><br>
                • Want all changes from a branch<br>
                • Preserving branch relationships<br>
                • Standard feature integration
            </div>

            <div class="warning-box">
                <strong>⚠️ Cherry-Pick Caution:</strong><br>
                • Creates duplicate commits<br>
                • Can cause confusion in history<br>
                • Doesn't preserve branch relationships<br>
                • Use sparingly for specific cases
            </div>
        `
    },
    log: {
        title: "git log & History",
        content: `
            <h2>📜 git log - Viewing History</h2>
            <p>Git log shows the commit history with various formatting and filtering options.</p>

            <h3>Basic Log Commands</h3>
            <div class="code-block">
                <code># Show commit history<br>
                git log<br><br>
                
                # One line per commit<br>
                git log --oneline<br><br>
                
                # Show last N commits<br>
                git log -5<br><br>
                
                # Show commits with diff<br>
                git log -p<br><br>
                
                # Show stats for each commit<br>
                git log --stat</code>
            </div>

            <h3>Visual Git Log</h3>
            <div class="code-block">
                <code># Graph view of branches<br>
                git log --graph<br><br>
                
                # Beautiful one-line graph<br>
                git log --graph --oneline --all<br><br>
                
                # Detailed graph<br>
                git log --graph --oneline --all --decorate<br><br>
                
                # Custom format<br>
                git log --pretty=format:"%h - %an, %ar : %s"</code>
            </div>

            <h3>Filtering Commits</h3>
            <div class="code-block">
                <code># By author<br>
                git log --author="John Doe"<br><br>
                
                # By date<br>
                git log --since="2 weeks ago"<br>
                git log --after="2024-01-01"<br>
                git log --before="2024-12-31"<br><br>
                
                # By commit message<br>
                git log --grep="fix"<br><br>
                
                # By file<br>
                git log -- filename.txt<br><br>
                
                # By content (code search)<br>
                git log -S"function name"</code>
            </div>

            <h3>Useful Log Formats</h3>
            <div class="code-block">
                <code># Short format with author and date<br>
                git log --pretty=format:"%h %an %ad %s" --date=short<br><br>
                
                # Detailed format<br>
                git log --pretty=format:"%C(yellow)%h%C(reset) %C(blue)%ad%C(reset) %C(green)%an%C(reset) %s" --date=short<br><br>
                
                # Show branch and tag decorations<br>
                git log --oneline --decorate<br><br>
                
                # Show all branches<br>
                git log --oneline --all</code>
            </div>

            <h3>Comparing History</h3>
            <div class="code-block">
                <code># Commits in branch A not in branch B<br>
                git log branchA..branchB<br><br>
                
                # Commits unique to each branch<br>
                git log --left-right branchA...branchB<br><br>
                
                # Commits that changed specific file<br>
                git log --follow filename.txt<br><br>
                
                # Show who changed each line (blame)<br>
                git blame filename.txt</code>
            </div>

            <h3>Advanced History Commands</h3>
            <div class="code-block">
                <code># Show reflog (command history)<br>
                git reflog<br><br>
                
                # Show commits by date (newest first)<br>
                git log --date-order<br><br>
                
                # Show merge commits only<br>
                git log --merges<br><br>
                
                # Show non-merge commits<br>
                git log --no-merges<br><br>
                
                # Show file changes summary<br>
                git log --name-status</code>
            </div>

            <h3>Custom Log Aliases</h3>
            <p>Create shortcuts for complex log commands:</p>
            <div class="code-block">
                <code># Beautiful graph<br>
                git config --global alias.lg "log --graph --pretty=format:'%C(yellow)%h%C(reset) -%C(auto)%d%C(reset) %s %C(green)(%cr) %C(bold blue)<%an>%C(reset)' --abbrev-commit"<br><br>
                
                # Use it<br>
                git lg<br><br>
                
                # Simple list<br>
                git config --global alias.ll "log --oneline --graph --all"</code>
            </div>

            <div class="info-box">
                <strong>💡 Pro Tip:</strong> Create a git log alias that you like and use it daily! A good log view makes understanding your project's history much easier.
            </div>

            <h3>Searching History</h3>
            <div class="code-block">
                <code># Find when a line was added/removed<br>
                git log -S"search text" -p<br><br>
                
                # Find commits with regex in code<br>
                git log -G"regex pattern"<br><br>
                
                # Find commits affecting specific function<br>
                git log -L :functionName:filename.js</code>
            </div>

            <h3>Interactive History Exploration</h3>
            <div class="code-block">
                <code># Interactive commit browser<br>
                git log --all --oneline --graph --decorate<br><br>
                
                # View a specific commit<br>
                git show abc1234<br><br>
                
                # View files in a commit<br>
                git show abc1234 --name-only<br><br>
                
                # View diff of a commit<br>
                git show abc1234 --color-words</code>
            </div>
        `
    }
};

// Merge with main lessons object
if (typeof lessons !== 'undefined') {
    Object.assign(lessons, additionalLessons);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = additionalLessons;
}
