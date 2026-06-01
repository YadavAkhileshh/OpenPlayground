# 🎮 OpenPlayground

> **Build. Share. Explore.** A community-driven platform where developers showcase their creativity through interactive web projects.

[![ECWOC 2026](https://img.shields.io/badge/ECWOC-2026-orange?style=for-the-badge&logo=opensourceinitiative)](https://ecwoc.tech)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Contributors](https://img.shields.io/github/contributors/YadavAkhileshh/OpenPlayground)](https://github.com/YadavAkhileshh/OpenPlayground/graphs/contributors)
[![Stars](https://img.shields.io/github/stars/YadavAkhileshh/OpenPlayground?style=social)](https://github.com/YadavAkhileshh/OpenPlayground/stargazers)

**🌐 [View Live Website](https://open-playground-sage.vercel.app/) | 📖 [Contributing Guide](CONTRIBUTING.md) | 🐛 [Debugging Guide](DEBUGGING_GUIDE.md) | 💬 [Discussions](https://github.com/YadavAkhileshh/OpenPlayground/discussions)**

• Project spotlight: Recipe – [Landing Page Preview](./projects/Recipe/landing.html)

---

## 🚀 What is OpenPlayground?

OpenPlayground is where creativity meets code! Whether you're building your first calculator or crafting an innovative game, this is your space to share and discover amazing projects. From beginners taking their first steps to experienced developers experimenting with new ideas - everyone is welcome here.

### ✨ Why Choose OpenPlayground?

| Feature                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| 🎯 **Learn by Building** | Practice your skills with real-world projects        |
| 🌟 **Get Discovered**    | Showcase your work to the global developer community |
| 💡 **Inspire Others**    | Your project might spark someone's next breakthrough |
| 🤝 **Beginner Friendly** | Perfect for developers at any skill level            |
| 🔓 **Open Source**       | Contribute to something meaningful and lasting       |

**⭐ Love what we're building? [Star this repository](https://github.com/YadavAkhileshh/OpenPlayground) to show your support!**

---

## 🎨 Features

- 🔍 **Smart Search** - Find projects by name, description, or technology
- 🏷️ **Category Filters** - Browse by Utility, Game, Puzzle, Fun, and more
- 📋 **Dual View Modes** - Switch between Card and List view
- 🔖 **Bookmarks** - Save your favorite projects for quick access
- 📅 **Deadline Tracking** - Mark project deadlines and importance levels ⭐ NEW
- 🎲 **Random Project** - Discover something new with one click
- 🚀 **Full-Stack Section** - Unique projects in MERN, Python, Go, Rust & more (GitHub only)
- 🌙 **Dark Mode** - Easy on the eyes, day or night
- 📱 **Fully Responsive** - Works beautifully on all devices



---

## 🚀 Quick Start Guide
⚠️ Important:
Do not open index.html directly using the file:// protocol.
Please run the project using a local development server,
otherwise some components may fail to load.

### 👀 For Visitors

Simply visit our [live website](https://open-playground-sage.vercel.app/) and start exploring!

### 👨‍💻 For Contributors

Ready to add your project? Follow these simple steps:

#### 1️⃣ **Fork & Clone**

```bash
git clone https://github.com/YOUR_USERNAME/OpenPlayground.git
cd OpenPlayground
```

#### 2️⃣ **Create Your Project Folder**

```bash
mkdir projects/my-awesome-project
cd projects/my-awesome-project
```

#### 3️⃣ **Build Your Project**

Create these files in your project folder:

- `index.html` - Your main project file
- `style.css` - Your styles
- `script.js` - Your JavaScript logic

#### 4️⃣ **Add to project-manifest.json** ⚠️ **IMPORTANT!**

Open `project-manifest.json` in the root folder and add your project entry:

```json
{
  "title": "Your Project Name",
  "category": "utility",
  "description": "A brief description of what your project does.",
  "tech": ["HTML", "CSS", "JavaScript"],
  "link": "./projects/my-awesome-project/index.html",
  "icon": "ri-code-s-slash-line",
  "coverStyle": "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
}
```

**Available Categories:** `utility`, `game`, `puzzle`, `fun`, `productivity`, `experimental`

**Icons:** Use any icon from [RemixIcon](https://remixicon.com/) (e.g., `ri-gamepad-line`, `ri-calculator-line`)

#### 5️⃣ **Submit Your Contribution**

```bash
git add .
git commit -m "Add: Your Project Name - Brief description"
git push origin your-branch-name
```

Then create a Pull Request on GitHub!

---

## 📁 Project Structure

```
OpenPlayground/
├── 📂 projects/              # 🎯 All community projects live here
│   ├── 📂 calculator/
│   ├── 📂 tic-tac-toe/
│   └── 📂 your-project/      # 🚀 Your project goes here!
├── 📂 components/            # Reusable HTML components
├── 📂 css/                   # Global website styles
├── 📂 js/                    # Global website scripts
├── 📄 index.html             # Main website entry
├── 📄 project-manifest.json  # ⭐ Project registry (add your project here!)
├── 📄 README.md              # This file
└── 📄 CONTRIBUTING.md        # Detailed contribution guidelines
```

---

## 🎯 Project Categories

| Category         | Icon | Description                         |
| ---------------- | ---- | ----------------------------------- |
| **Utility**      | 🛠️   | Tools, calculators, converters      |
| **Game**         | 🎮   | Interactive games and entertainment |
| **Puzzle**       | 🧩   | Brain teasers and logic games       |
| **Fun**          | 🎉   | Jokes, quotes, creative projects    |
| **Productivity** | 📊   | Planners, trackers, organizers      |
| **MERN Stack**   | 🚀   | Full-Stack projects (GitHub only)   |
| **Experimental** | 🔬   | Unique concepts and demos           |

---

## 🤝 Contributing Guidelines

### ✅ Project Requirements

- Use vanilla HTML, CSS, and JavaScript
- Include `index.html` as the entry point
- Make it responsive and accessible
- Add your project to `project-manifest.json`
- Test across different browsers
- Keep content family-friendly

### 💡 Best Practices

- Add meaningful comments to your code
- Use semantic HTML elements
- Follow consistent naming conventions
- Optimize for performance
- Include error handling where appropriate

**📖 [Read the full contributing guide →](CONTRIBUTING.md)**

**🐛 Running into issues? [Check the debugging guide →](DEBUGGING_GUIDE.md)**

---

## 🏆 Our Amazing Contributors

A huge thank you to all the talented developers who have contributed!

<a href="https://github.com/YadavAkhileshh/OpenPlayground/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=YadavAkhileshh/OpenPlayground&max=300" />
</a>

**Want to see your avatar here? [Make your first contribution today!](CONTRIBUTING.md)**

---

## 💡 Project Ideas

| Difficulty       | Ideas                                                              |
| ---------------- | ------------------------------------------------------------------ |
| **Beginner**     | Quote generator, color picker, countdown timer, password generator |
| **Intermediate** | Weather app, expense tracker, memory game, markdown editor         |
| **Advanced**     | Code editor, music visualizer, real-time chat, multiplayer game    |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Icons:** [RemixIcon](https://remixicon.com/)
- **Fonts:** [Inter](https://fonts.google.com/specimen/Inter)
- **Hosting:** Vercel / GitHub Pages

---

## 🌟 Community & Support

- 📜 **Code of Conduct:** [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- 🐛 **Bug Reports:** [Create an Issue](https://github.com/YadavAkhileshh/OpenPlayground/issues/new)
- 💡 **Feature Requests:** [Discussions](https://github.com/YadavAkhileshh/OpenPlayground/discussions)
- 🔄 **Pull Requests:** [View PRs](https://github.com/YadavAkhileshh/OpenPlayground/pulls)

---

## 🗎 LICENSE

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Made with ❤️ by the OpenPlayground Community**

_Building the future of web development, one project at a time._

⭐ **Don't forget to star this repo if you found it helpful!** ⭐

</div>
