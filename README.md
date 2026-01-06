# 🎮 OpenPlayground

> **Build. Share. Explore.** A community-driven platform where developers showcase their creativity through interactive web projects.

[![ECWOC 2026](https://img.shields.io/badge/ECWOC-2026-orange?style=for-the-badge&logo=opensourceinitiative)](https://ecwoc.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/github/contributors/YadavAkhileshh/OpenPlayground)](https://github.com/YadavAkhileshh/OpenPlayground/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/YadavAkhileshh/OpenPlayground?style=social)](https://github.com/YadavAkhileshh/OpenPlayground/stargazers)

**🌐 [View Live Website](https://open-playground-seven.vercel.app/) | 📖 [Contributing Guide](CONTRIBUTING.md) | 💬 [Discussions](https://github.com/YadavAkhileshh/OpenPlayground/discussions)**



## 🚀 What is OpenPlayground?

OpenPlayground is where creativity meets code! Whether you're building your first calculator or crafting an innovative game, this is your space to share and discover amazing projects. From beginners taking their first steps to experienced developers experimenting with new ideas - everyone is welcome here.

### ✨ Why Choose OpenPlayground?

- 🎯 **Learn by Building** - Practice your skills with real-world projects  
- 🌟 **Get Discovered** - Showcase your work to the global developer community  
- 💡 **Inspire Others** - Your project might spark someone's next breakthrough  
- 🤝 **Beginner Friendly** - Perfect for developers at any skill level  
- 🔓 **Open Source** - Contribute to something meaningful and lasting

**⭐ Love what we're building? [Star this repository](https://github.com/YadavAkhileshh/OpenPlayground) to show your support!**

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🎨 Featured Projects

Our amazing community has built some incredible projects:

| Project | Description | Tech Stack | Live Demo |
|---------|-------------|------------|-----------|
| 🧮 **Calculator** | Clean, functional calculator with keyboard support | HTML, CSS, JS | [Try it →](https://yadavakhileshh.github.io/OpenPlayground/projects/calculator/) |
| 🎯 **Tic Tac Toe** | Classic strategy game with smooth animations | HTML, CSS, JS | [Play →](https://yadavakhileshh.github.io/OpenPlayground/projects/tic-tac-toe/) |
| ✅ **Todo List** | Task manager with local storage persistence | HTML, CSS, JS | [Organize →](https://yadavakhileshh.github.io/OpenPlayground/projects/todo-list/) |
| 🧠 **Quiz Game** | Interactive quiz with multiple categories | HTML, CSS, JS | [Test yourself →](https://yadavAkhileshh.github.io/OpenPlayground/projects/quiz-game/) |
| 🕐 **Digital Clock** | Real-time clock with customizable themes | HTML, CSS, JS | [Check time →](https://yadavAkhileshh.github.io/OpenPlayground/projects/digital-clock/) |
| 📱 **QR Code Generator** | Simple and interactive QR Code Generator | HTML, CSS, JS | [Generate →](https://yadavAkhileshh.github.io/OpenPlayground/projects/qr-generator/) |
| 📅 **Monthly Calendar** | Event management with local storage | HTML, CSS, JS | [Plan →](https://yadavAkhileshh.github.io/OpenPlayground/projects/monthly-calendar/) |

**🌐 [Explore All Projects →](https://github.com/YadavAkhileshh/OpenPlayground/tree/main/projects)**

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🚀 Quick Start Guide

### 👀 For Visitors
Simply visit our [live website](https://open-playground-seven.vercel.app/) and start exploring! Click on any project card to interact with it directly.

### 👨‍💻 For Contributors
Ready to add your project? Follow these steps:

#### 1️⃣ **Fork & Clone**
```bash
# Fork this repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/OpenPlayground.git
cd OpenPlayground
```

#### 2️⃣ **Create Your Project**
```bash
# Create a new folder for your project
mkdir projects/my-awesome-project
cd projects/my-awesome-project

# Create the required files
touch index.html style.css script.js
```

#### 3️⃣ **Build Your Project**
Create your project with these files:
- `index.html` - Your main project file
- `style.css` - Your styles  
- `script.js` - Your JavaScript logic

#### 4️⃣ **Add to Main Website** ⚠️ **IMPORTANT STEP**
**Don't forget this step!** Add your project card to the main `index.html` file so it appears on the website:

```html
<!-- Add this inside the projects-container div in index.html -->
<a href="./projects/your-project-name/index.html" class="card" data-category="utility">
    <div class="card-cover" style="background:#your-color;display:flex;align-items:center;justify-content:center">
        <i class="ri-your-icon" style="font-size:3rem;color:white"></i>
    </div>
    <div class="card-content">
        <div class="card-header-flex">
            <h3 class="card-heading">Your Project Name</h3>
            <span class="category-tag">Category</span>
        </div>
        <p class="card-description">Brief description of your project.</p>
        <div class="card-tech"><span>HTML</span><span>CSS</span><span>JS</span></div>
    </div>
</a>
```

#### 5️⃣ **Submit Your Contribution**
```bash
# Add your changes
git add .

# Commit with a descriptive message
git commit -m "Add: Your Project Name - Brief description"

# Push to your fork
git push origin main

# Create a Pull Request on GitHub
```

**🎉 That's it! Your project will be reviewed and merged into the main website.**

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 📁 Project Structure

```
OpenPlayground/
├── 📂 projects/              # 🎯 All community projects live here
│   ├── 📂 calculator/        # Example: Calculator project
│   │   ├── index.html        # Main HTML file
│   │   ├── style.css         # Styling
│   │   └── script.js         # JavaScript logic
│   ├── 📂 tic-tac-toe/       # Example: Tic Tac Toe game
│   └── 📂 your-project/      # 🚀 Your amazing project goes here!
├── 📂 css/                   # Global website styles
├── 📂 js/                    # Global website scripts  
├── 📄 index.html             # 🏠 Main website (add your project here!)
├── 📄 README.md              # This file
└── 📄 CONTRIBUTING.md        # Detailed contribution guidelines
```

> **💡 Pro Tip:** After creating your project folder, don't forget to add your project card to the main `index.html` file!

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🤝 Contributing Guidelines

### Project Requirements
- Use vanilla HTML, CSS, and JS
- Include all three files (`index.html`, `style.css`, `script.js`)
- Make it responsive and accessible
- Add project card to main `index.html`
- Test across browsers
- Keep it family-friendly

### Best Practices
- Add meaningful comments
- Use semantic HTML
- Follow consistent naming conventions
- Optimize performance
- Include error handling where appropriate

### Categories
- 🎮 Action
- 🧠 Strategy
- 🧩 Puzzle
- 🛠️ Utility

### Review Process
1. Automated Checks
2. Manual Review
3. Community Feedback
4. Merge

**📖 [Read the detailed contributing guide →](CONTRIBUTING.md)**

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🏆 Our Amazing Contributors

A huge thank you to all the talented developers who have contributed to OpenPlayground! 

<div >

### 🌟 Hall of Fame

<a href="https://github.com/YadavAkhileshh/OpenPlayground/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YadavAkhileshh/OpenPlayground&max=300" />
</a>

**Want to see your avatar here? [Make your first contribution today!](CONTRIBUTING.md)**

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 🌟 Community & Support
- **Code of Conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)  
- **Bug Reports:** [Create an Issue](https://github.com/YadavAkhileshh/OpenPlayground/issues/new)  
- **Feature Requests / Questions:** [Discussions](https://github.com/YadavAkhileshh/OpenPlayground/discussions)  
- **Pull Requests / Code Review:** [Pull Requests](https://github.com/YadavAkhileshh/OpenPlayground/pulls)  

---

## 💡 Project Ideas
- **Beginner:** Random quote generator, color palette tool, countdown timer, drawing app, password generator  
- **Intermediate:** Weather dashboard, expense tracker, memory game, markdown previewer, image gallery  
- **Advanced:** Code editor, music visualizer, real-time chat, mini social network, multiplayer games  

---

## 🛠 Tech Stack
- HTML5, CSS3, JS (ES6+)
- RemixIcon, Google Fonts (Poppins)
- GitHub Pages for hosting

<!--line-->
<img src="https://www.animatedimages.org/data/media/562/animated-line-image-0184.gif" width="1920" />

## 📄 License
This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

---

**Made with ❤️ by the OpenPlayground Community**  
*Building the future of web development, one project at a time.*
