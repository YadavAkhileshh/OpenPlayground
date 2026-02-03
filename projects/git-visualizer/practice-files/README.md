# Git Practice Project

This folder contains sample files for practicing Git commands.

## Files Included

- `index.html` - Sample HTML file
- `styles.css` - Sample CSS file
- `app.js` - Sample JavaScript file
- `README.md` - This file

## Practice Exercises

### Exercise 1: First Commit

1. Initialize a Git repository in this folder
2. Check the status of your repository
3. Add all files to staging
4. Create your first commit

```bash
git init
git status
git add .
git commit -m "Initial commit"
```

### Exercise 2: Making Changes

1. Open `index.html` and add your name
2. Check what changed
3. Stage and commit the change

```bash
# Make your edit first
git status
git diff index.html
git add index.html
git commit -m "Add my name to index.html"
```

### Exercise 3: Working with Branches

1. Create a new branch called `feature-css`
2. Switch to the new branch
3. Modify `styles.css`
4. Commit your changes
5. Switch back to main
6. Merge your feature branch

```bash
git branch feature-css
git checkout feature-css
# Make your edits
git add styles.css
git commit -m "Update styles"
git checkout main
git merge feature-css
```

### Exercise 4: Viewing History

1. View your commit history
2. See detailed changes
3. View a specific commit

```bash
git log
git log --oneline
git log -p
git show <commit-hash>
```

### Exercise 5: Undoing Changes

1. Make some changes to `app.js`
2. Practice using `git checkout` to discard changes
3. Stage a change and practice unstaging

```bash
# Make changes to app.js
git status
git checkout -- app.js  # Discard changes
# Or with newer syntax
git restore app.js

# Practice unstaging
git add app.js
git restore --staged app.js
```

## Tips

- Run `git status` frequently to see what's happening
- Use `git log --oneline --graph` for a nice visualization
- Create branches for experiments
- Commit often with clear messages

## Next Steps

After mastering these exercises:

1. Try resolving a merge conflict
2. Practice using `git stash`
3. Learn about `git rebase`
4. Explore `git cherry-pick`

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Git Visualizer](../index.html) - Go back to the tutorial

Happy Learning! 🚀
