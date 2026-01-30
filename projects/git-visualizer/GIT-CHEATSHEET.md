# Git Command Cheat Sheet

Quick reference guide for the most commonly used Git commands.

## 📦 Setup & Configuration

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email
git config --global user.email "your.email@example.com"

# Set default editor
git config --global core.editor "code --wait"

# Set default branch name
git config --global init.defaultBranch main

# View all settings
git config --list

# Get help
git help <command>
```

## 🚀 Creating & Cloning

```bash
# Create a new repository
git init

# Clone an existing repository
git clone <url>

# Clone a specific branch
git clone -b <branch> <url>
```

## 📝 Basic Snapshotting

```bash
# Check status
git status
git status -s  # Short format

# Add files to staging
git add <file>
git add .              # Add all files
git add *.js           # Add all JS files
git add -p             # Interactive staging

# Commit changes
git commit -m "message"
git commit -am "message"  # Add and commit in one step
git commit --amend        # Modify last commit

# View differences
git diff                  # Unstaged changes
git diff --staged         # Staged changes
git diff <commit>         # Compare with commit

# Remove/Move files
git rm <file>
git mv <old> <new>
```

## 🌿 Branching & Merging

```bash
# List branches
git branch              # Local branches
git branch -a           # All branches
git branch -r           # Remote branches

# Create branch
git branch <name>

# Switch branch
git checkout <branch>
git switch <branch>     # Newer syntax

# Create and switch
git checkout -b <branch>
git switch -c <branch>

# Delete branch
git branch -d <branch>
git branch -D <branch>  # Force delete

# Merge branch
git merge <branch>
git merge --no-ff <branch>  # No fast-forward

# Abort merge
git merge --abort
```

## 🔄 Sharing & Updating

```bash
# Add remote
git remote add origin <url>

# List remotes
git remote -v

# Fetch changes
git fetch
git fetch origin

# Pull changes
git pull
git pull --rebase

# Push changes
git push
git push origin <branch>
git push -u origin <branch>  # Set upstream

# Push tags
git push --tags
```

## ↩️ Undoing Changes

```bash
# Discard changes in working directory
git checkout -- <file>
git restore <file>      # Newer syntax

# Unstage file
git reset HEAD <file>
git restore --staged <file>

# Reset to previous commit
git reset HEAD~1        # Keep changes
git reset --soft HEAD~1 # Keep changes staged
git reset --hard HEAD~1 # Discard changes

# Revert a commit
git revert <commit>

# Reset to remote state
git reset --hard origin/main
```

## 📦 Stashing

```bash
# Stash changes
git stash
git stash save "message"
git stash -u            # Include untracked

# List stashes
git stash list

# Apply stash
git stash apply
git stash pop           # Apply and remove

# Drop stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

## 📜 Inspection & Comparison

```bash
# View commit history
git log
git log --oneline
git log --graph
git log --all --graph --oneline

# View file history
git log -- <file>
git log -p <file>

# Show commit details
git show <commit>

# View who changed each line
git blame <file>

# Search commits
git log --grep="search"
git log -S"code"

# View reflog
git reflog
```

## 🔄 Rebasing

```bash
# Rebase current branch
git rebase <branch>

# Interactive rebase
git rebase -i HEAD~3

# Continue/Skip/Abort
git rebase --continue
git rebase --skip
git rebase --abort

# Rebase and update branch
git pull --rebase
```

## 🍒 Cherry-picking

```bash
# Cherry-pick a commit
git cherry-pick <commit>

# Cherry-pick multiple commits
git cherry-pick <commit1> <commit2>

# Cherry-pick without committing
git cherry-pick -n <commit>
```

## 🏷️ Tags

```bash
# List tags
git tag

# Create tag
git tag <name>
git tag -a v1.0 -m "Version 1.0"

# Tag specific commit
git tag <name> <commit>

# Push tags
git push origin <tag>
git push --tags

# Delete tag
git tag -d <name>
git push origin --delete <tag>
```

## 🔍 Searching

```bash
# Search in files
git grep "search term"

# Search with line numbers
git grep -n "search"

# Search in specific file types
git grep "search" -- "*.js"
```

## 🛠️ Maintenance

```bash
# Clean untracked files
git clean -n            # Dry run
git clean -f            # Remove files
git clean -fd           # Remove files and directories

# Optimize repository
git gc

# Verify repository
git fsck
```

## 🔄 Workflow Examples

### Feature Branch Workflow

```bash
# Start new feature
git checkout main
git pull
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Update with main
git checkout main
git pull
git checkout feature/new-feature
git rebase main

# Push feature
git push -u origin feature/new-feature

# Merge feature (via PR or locally)
git checkout main
git merge feature/new-feature
git push

# Cleanup
git branch -d feature/new-feature
```

### Hotfix Workflow

```bash
# Create hotfix branch
git checkout main
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "Fix critical bug"

# Merge to main
git checkout main
git merge hotfix/critical-bug
git push

# Merge to develop
git checkout develop
git merge hotfix/critical-bug
git push

# Cleanup
git branch -d hotfix/critical-bug
```

### Undoing Last Commit (Not Pushed)

```bash
# Keep changes
git reset --soft HEAD~1

# Discard changes
git reset --hard HEAD~1
```

### Undoing Last Commit (Already Pushed)

```bash
# Create revert commit
git revert HEAD
git push
```

## 🎯 Aliases

Set up useful aliases:

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
```

## 💡 Pro Tips

1. **Always pull before push**: `git pull && git push`
2. **Use branches for features**: Never commit directly to main
3. **Write good commit messages**: Clear and descriptive
4. **Commit often**: Small, logical commits are better
5. **Review before committing**: Use `git diff` first
6. **Use .gitignore**: Don't commit unnecessary files
7. **Learn interactive rebase**: Clean up commits before pushing
8. **Use git stash**: Save work without committing

## 🚫 Common Mistakes to Avoid

- Don't force push to shared branches
- Don't commit sensitive data (passwords, keys)
- Don't commit large binary files
- Don't rewrite public history
- Don't use `git add .` blindly

## 📚 Additional Resources

- [Official Git Documentation](https://git-scm.com/doc)
- [Pro Git Book](https://git-scm.com/book)
- [GitHub Guides](https://guides.github.com)
- [Git Visualizer](./index.html) - Interactive tutorial

---

**Print this cheat sheet and keep it handy while learning Git!** 🎉
