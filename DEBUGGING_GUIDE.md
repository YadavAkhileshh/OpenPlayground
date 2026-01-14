# 🐛 Contributor Debugging Playground

> **Don't Quit! Debug It.** A practical guide to help new contributors troubleshoot common issues when contributing to OpenPlayground.

---

## 🎯 Purpose

New to open source? Running into errors? **You're not alone!** This guide helps you debug common issues so you can successfully contribute without frustration.

---

## 📋 Table of Contents

- [Before You Start](#before-you-start)
- [Common Git Issues](#common-git-issues)
- [Project Setup Issues](#project-setup-issues)
- [projects.json Errors](#projectsjson-errors)
- [File Path Issues](#file-path-issues)
- [Browser Testing Issues](#browser-testing-issues)
- [Pull Request Issues](#pull-request-issues)
- [Getting Help](#getting-help)

---

## 🚀 Before You Start

### Quick Checklist
- [ ] Git is installed (`git --version`)
- [ ] You have a GitHub account
- [ ] You've forked the repository
- [ ] You've read [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 🔧 Common Git Issues

### ❌ Issue: "fatal: not a git repository"

**What it means:** You're not in the project directory.

**Solution:**
```bash
cd OpenPlayground
git status
```

---

### ❌ Issue: "Permission denied (publickey)"

**What it means:** SSH key not configured.

**Solution:**
```bash
# Use HTTPS instead
git clone https://github.com/YOUR_USERNAME/OpenPlayground.git

# Or set up SSH keys: https://docs.github.com/en/authentication
```

---

### ❌ Issue: "Your branch is behind 'origin/main'"

**What it means:** Your fork is outdated.

**Solution:**
```bash
# Add upstream remote (only once)
git remote add upstream https://github.com/YadavAkhileshh/OpenPlayground.git

# Update your fork
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

### ❌ Issue: "Merge conflict"

**What it means:** Your changes conflict with someone else's.

**Solution:**
```bash
# 1. Open the conflicting file
# 2. Look for markers: <<<<<<< HEAD, =======, >>>>>>>
# 3. Keep the correct code, remove markers
# 4. Save and commit
git add .
git commit -m "Resolve merge conflict"
```

---

### ❌ Issue: "fatal: refusing to merge unrelated histories"

**What it means:** Git can't merge branches with different histories.

**Solution:**
```bash
git pull origin main --allow-unrelated-histories
```

---

## 📁 Project Setup Issues

### ❌ Issue: "My project doesn't show up on the website"

**Checklist:**
- [ ] Did you add your project to `projects.json`? (NOT `index.html`)
- [ ] Is your `projects.json` valid JSON? (Check for missing commas, quotes)
- [ ] Is the `link` path correct? (`./projects/your-project/index.html`)
- [ ] Did you refresh the browser with Ctrl+F5 (hard refresh)?

**Test your JSON:**
```bash
# Use an online JSON validator
# Copy your projects.json content to: https://jsonlint.com/
```

---

### ❌ Issue: "404 - File not found when clicking my project"

**What it means:** The file path in `projects.json` is wrong.

**Solution:**
```bash
# Check your folder structure
ls projects/your-project-name/

# Should show: index.html, style.css, script.js

# Verify your projects.json link:
"link": "./projects/your-project-name/index.html"
```

---

### ❌ Issue: "My CSS/JS isn't loading"

**Checklist:**
- [ ] Are file names correct? (case-sensitive on Linux/Mac)
- [ ] Are paths relative? (`./style.css` not `/style.css`)
- [ ] Check browser console (F12) for errors

**Example correct structure:**
```html
<!-- In your index.html -->
<link rel="stylesheet" href="./style.css">
<script src="./script.js"></script>
```

---

## 📝 projects.json Errors

### ❌ Issue: "Unexpected token" or "JSON parse error"

**Common mistakes:**

**Missing comma:**
```json
{
  "title": "Project 1",
  "category": "utility"
} // ❌ Missing comma here
{
  "title": "Project 2"
}
```

**Fix:**
```json
{
  "title": "Project 1",
  "category": "utility"
}, // ✅ Added comma
{
  "title": "Project 2"
}
```

**Trailing comma:**
```json
{
  "title": "Project",
  "category": "utility",
  "tech": ["HTML", "CSS"], // ❌ Trailing comma
}
```

**Fix:**
```json
{
  "title": "Project",
  "category": "utility",
  "tech": ["HTML", "CSS"] // ✅ No trailing comma
}
```

---

### ❌ Issue: "My project card looks broken"

**Checklist:**
- [ ] Did you choose a valid category? (`utility`, `game`, `puzzle`, `fun`, `productivity`, `experimental`)
- [ ] Is your icon from [RemixIcon](https://remixicon.com/)? (e.g., `ri-calculator-line`)
- [ ] Is your description under 100 characters?

**Valid entry example:**
```json
{
  "title": "Calculator",
  "category": "utility",
  "description": "A simple calculator for basic math operations.",
  "tech": ["HTML", "CSS", "JavaScript"],
  "link": "./projects/calculator/index.html",
  "icon": "ri-calculator-line",
  "coverStyle": "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
}
```

---

## 🗂️ File Path Issues

### ❌ Issue: "Images not loading"

**Problem:** Absolute paths don't work.

**Wrong:**
```html
<img src="/projects/my-project/assets/image.jpg">
<img src="C:/Users/Me/OpenPlayground/projects/my-project/assets/image.jpg">
```

**Correct:**
```html
<img src="./assets/image.jpg">
<img src="assets/image.jpg">
```

---

### ❌ Issue: "Works locally but not on GitHub Pages"

**Problem:** Case sensitivity.

**Example:**
- File: `Style.css`
- HTML: `<link href="style.css">` ❌

**Solution:** Match case exactly or use lowercase for all files.

---

## 🌐 Browser Testing Issues

### ❌ Issue: "Changes not showing in browser"

**Solutions:**
1. **Hard refresh:** Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache:** Browser settings → Clear browsing data
3. **Disable cache:** Open DevTools (F12) → Network tab → Check "Disable cache"

---

### ❌ Issue: "Console errors"

**How to check:**
1. Press F12 to open DevTools
2. Click "Console" tab
3. Look for red error messages

**Common errors:**

**"Uncaught ReferenceError: X is not defined"**
- Variable/function doesn't exist
- Check spelling and scope

**"Failed to load resource: 404"**
- File path is wrong
- Check file exists and path is correct

**"Uncaught SyntaxError"**
- Code has syntax error
- Check for missing brackets, quotes, semicolons

---

## 🔍 Pull Request Issues

### ❌ Issue: "PR rejected - modified index.html"

**What happened:** You edited `index.html` directly.

**Solution:**
```bash
# Undo changes to index.html
git checkout HEAD -- index.html

# Only modify projects.json
# Then commit again
git add projects.json projects/your-project/
git commit -m "Add: Your Project Name"
git push
```

---

### ❌ Issue: "PR rejected - no screenshots"

**Solution:**
1. Take screenshots of your project
2. Add them to your PR description
3. Show desktop and mobile views

**How to add screenshots to PR:**
- Drag and drop images into the PR comment box
- Or use: `![Screenshot](image-url)`

---

### ❌ Issue: "PR rejected - modified unrelated files"

**What happened:** You accidentally changed files you shouldn't have.

**Check what changed:**
```bash
git status
git diff
```

**Fix:**
```bash
# Undo changes to specific file
git checkout HEAD -- path/to/unwanted-file

# Or reset to last commit (careful!)
git reset --hard HEAD
```

---

## 🧪 Testing Your Project

### Local Testing Checklist

- [ ] Open `index.html` in browser (or use Live Server)
- [ ] Your project card appears in the projects section
- [ ] Clicking the card opens your project
- [ ] All features work as expected
- [ ] No console errors (F12 → Console)
- [ ] Responsive on mobile (F12 → Toggle device toolbar)
- [ ] Works in Chrome, Firefox, Edge

### Validation Tools

**Validate JSON:**
```bash
node validate-links.js
```

**Or use online tools:**
- JSON: https://jsonlint.com/
- HTML: https://validator.w3.org/
- CSS: https://jigsaw.w3.org/css-validator/

---

## 🆘 Getting Help

### Still Stuck?

1. **Search existing issues:** [GitHub Issues](https://github.com/YadavAkhileshh/OpenPlayground/issues)
2. **Ask in discussions:** [GitHub Discussions](https://github.com/YadavAkhileshh/OpenPlayground/discussions)
3. **Create a new issue:** Include:
   - What you're trying to do
   - What error you're getting
   - What you've already tried
   - Screenshots if applicable

### Useful Commands

```bash
# Check Git status
git status

# See what changed
git diff

# View commit history
git log --oneline

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes (careful!)
git reset --hard HEAD

# Update from main repository
git fetch upstream
git merge upstream/main
```

---

## 💡 Pro Tips

1. **Always create a new branch** for each contribution
2. **Test locally** before pushing
3. **Read error messages carefully** - they usually tell you what's wrong
4. **Use git status and git diff** before committing
5. **Ask for help early** - don't struggle alone
6. **Keep your fork updated** to avoid conflicts
7. **Start small** - fix a typo or add a simple project first

---

## 🎓 Learning Resources

- **Git Basics:** https://git-scm.com/book/en/v2
- **GitHub Docs:** https://docs.github.com/en
- **JSON Tutorial:** https://www.w3schools.com/js/js_json_intro.asp
- **DevTools Guide:** https://developer.chrome.com/docs/devtools/

---

## ✅ Success Checklist

Before submitting your PR, verify:

- [ ] Project works locally
- [ ] Added to `projects.json` (NOT `index.html`)
- [ ] Valid JSON (no syntax errors)
- [ ] Correct file paths
- [ ] No console errors
- [ ] Responsive design
- [ ] Screenshots included in PR
- [ ] Only modified relevant files
- [ ] Tested in multiple browsers

---

## 🎉 You Got This!

Remember: **Every expert was once a beginner.** Errors are part of learning. Don't give up!

If you're stuck, reach out to the community. We're here to help! 🤝

---

**Made with ❤️ by the OpenPlayground Community**

*Happy Debugging! 🐛→✨*
