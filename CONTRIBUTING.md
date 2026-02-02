# Contributing to OpenPlayground

Thank you for your interest in contributing to OpenPlayground! This document provides guidelines and instructions for contributing to this project.

## ⚡ Quick Contribution Summary

| ✅ DO | ❌ DON'T |
|-------|----------|
| Create `project.json` in YOUR project folder | Modify any centralized JSON file |
| Add projects via `projects/your-name/` | Modify `index.html` directly |
| UI/styling changes → `components/` and `css/` | Touch unrelated files |
| Include screenshots in PRs | Submit without testing |

## ⚠️ CRITICAL RULES - READ FIRST

### 🆕 NEW: Individual project.json System

Each project now has its **own `project.json` file** inside its folder. This prevents merge conflicts!

```
projects/your-project-name/
├── index.html          # Your main HTML file
├── project.json        # YOUR PROJECT METADATA ⭐
├── style.css           # Your CSS styles
├── script.js           # Your JavaScript code
└── README.md           # Documentation (optional)
```

### 🚀 NEW: Full Stack / Backend Projects

We now support complex projects in various languages and frameworks! Full-stack projects are stored in the `full-stack/` folder, organized by category. These do not appear in the main UI but are accessible directly in the repository.

**Directory Structure:**
```
full-stack/
├── [category]/         # e.g., mern, python, go, rust
│   └── your-project/
│       ├── client/     # Frontend code (if any)
│       ├── server/     # Backend code
│       └── README.md   # README WITH SETUP INSTRUCTIONS ⭐
```

**Requirements:**
- **Categorization:** Place your project in the correct language/framework folder (create one if it doesn't exist).
- **Structure:** Use separate `client` and `server` folders where applicable.
- **Detailed README:** Include:
  - Project description & features.
  - Full setup and run instructions.
  - Author name and social links (for credits).
- **Environment Variables:** Provide `.env.example`. **DO NOT commit `.env` files.**

**Categories:** `mern` | `python` (Flask, Django, FastAPI) | `go` | `rust` | `java` | `php` | `experimental`



### ❌ DO NOT MODIFY These Files

- `index.html` (root) - Auto-generated from components
- `project-manifest.json` - Auto-generated from project folders
- Any files outside your project folder

### 📸 MANDATORY: Add Screenshots

- ✅ **ALWAYS** include screenshots showing your changes in the PR
- ✅ Show before/after screenshots if fixing a bug
- ❌ PRs without screenshots may be rejected

---

## Getting Started

### Prerequisites

- GitHub account
- Git installed locally
- Text editor (VS Code recommended)
- Basic HTML, CSS, JavaScript knowledge

### Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/OpenPlayground.git
   cd OpenPlayground
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-project-name
   ```

3. **Start local server**
   ```bash
   npx live-server --port=8080
   ```

---

## Adding a New Project

### Step 1: Create Your Project Folder

```bash
mkdir projects/your-project-name
cd projects/your-project-name
```

### Step 2: Add Required Files

Create these files in your project folder:

**index.html** - Your main HTML file
**style.css** - Your CSS styles  
**script.js** - Your JavaScript code

### Step 3: Create project.json ⭐

Create `projects/your-project-name/project.json`:

```json
{
  "title": "Your Project Name",
  "category": "utility",
  "difficulty": "Beginner",
  "description": "Brief description of your project (max 100 characters).",
  "tech": ["HTML", "CSS", "JavaScript"],
  "icon": "ri-code-s-slash-line",
  "coverStyle": "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
}
```

**Categories:** `utility` | `game` | `puzzle` | `productivity` | `fun` | `educational` | `communication`

**Difficulty:** `Beginner` | `Intermediate` | `Advanced`

**Icons:** Browse [RemixIcon](https://remixicon.com/) for icon names

### Step 4: Test Locally

1. Open http://localhost:8080 in your browser
2. Navigate to the Projects section
3. Your project should appear automatically
4. Click to verify it opens correctly
5. Check browser console for errors

### Step 5: Commit & Push

```bash
git add projects/your-project-name/
git commit -m "Add: Your Project Name - Brief description"
git push origin feature/your-project-name
```

### Step 6: Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the template with screenshots
4. Submit!

---

## Project Guidelines

### Technical Requirements

- ✅ Use vanilla HTML, CSS, JavaScript (no frameworks)
- ✅ Make it responsive (mobile-friendly)
- ✅ Test in Chrome, Firefox, Safari, Edge
- ✅ Clean, commented code

### Quality Standards

- ✅ Works without errors
- ✅ Intuitive user experience
- ✅ Optimized images (< 200KB each)
- ✅ Accessible (proper alt tags, contrast)

### Content Guidelines

- ✅ Original work (not copied from tutorials)
- ✅ Appropriate content only
- ✅ Educational or entertaining value
- ❌ No offensive or harmful content

---

## Pull Request Template

```markdown
## Project Description
Brief description of what your project does

## Type of Change
- [ ] New project
- [ ] Bug fix
- [ ] Enhancement
- [ ] Documentation update

## Screenshots
[Add screenshots here]

## Checklist
- [ ] My code follows the project guidelines
- [ ] I tested on desktop and mobile
- [ ] No console errors
- [ ] I created `project.json` in MY folder (not root)
- [ ] I included screenshots
- [ ] I only modified files in my project folder
```

---

## Repository Structure

```
OpenPlayground/
├── index.html              # Main page (DO NOT EDIT)
├── project-manifest.json   # Auto-generated project list
├── about.html              # About page
├── bookmarks.html          # Bookmarks page
│
├── components/             # Reusable UI components
│   ├── header.html
│   ├── hero.html
│   ├── projects.html
│   ├── footer.html
│   └── ...
│
├── css/                    # Stylesheets
│   ├── style.css
│   ├── footer.css
│   └── ...
│
├── js/                     # JavaScript modules
│   ├── app.js
│   ├── components.js
│   └── core/
│
├── scripts/                # Build utilities
│   ├── generate-manifest.js
│   └── validate-links.js
│
└── projects/               # ALL PROJECTS GO HERE
    ├── calculator/
    │   ├── index.html
    │   ├── project.json    ⭐
    │   ├── style.css
    │   └── script.js
    ├── snake-game/
    │   ├── index.html
    │   ├── project.json    ⭐
    │   └── ...
    └── your-project/
        ├── index.html
        ├── project.json    ⭐
        └── ...
```

---

## Need Help?

1. Check this guide and README
2. Search existing issues
3. Create a new issue with details
4. Ask in GitHub Discussions

---

## Project Ideas

### Beginner
- Calculator, Digital clock, Color picker, Quote generator, Unit converter

### Intermediate  
- Todo list, Weather app, Memory game, Expense tracker, Pomodoro timer

### Advanced
- Drawing canvas, Music player, Code editor, Data visualization

---

## Resources

- [RemixIcon](https://remixicon.com/) - Icons
- [MDN Web Docs](https://developer.mozilla.org/) - Documentation
- [Can I Use](https://caniuse.com/) - Browser compatibility

---

## License

By contributing, you agree your code will be licensed under the MIT License.

**Thank you for contributing to OpenPlayground! 🎉**
