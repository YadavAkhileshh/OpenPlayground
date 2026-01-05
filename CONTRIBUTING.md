# Contributing to OpenPlayground

Thank you for your interest in contributing to OpenPlayground! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Project Guidelines](#project-guidelines)
- [Submission Process](#submission-process)
- [Code Review Process](#code-review-process)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

Before you begin, ensure you have:
- A GitHub account
- Git installed on your local machine
- A text editor (VS Code, Sublime Text, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Setting Up Your Development Environment

1. **Fork the repository (don’t forget to star it if you like the project)**
   - Click the "Fork" button at the top right of the repository page
   - This creates a copy of the repository in your GitHub account

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/OpenPlayground.git
   cd OpenPlayground
   ```

3. **Create a new branch**
   ```bash
   git checkout -b feature/your-project-name
   ```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

1. **New Projects** - Add your own creative projects
2. **Bug Fixes** - Fix issues in existing projects
3. **Improvements** - Enhance existing projects or the main website
4. **Documentation** - Improve README files or add project documentation
5. **Design** - Improve the visual design of projects or the main site

### Adding a New Project

1. **Create your project folder**
   ```bash
   mkdir projects/your-project-name
   cd projects/your-project-name
   ```

2. **Required files**
   - `index.html` - Main HTML file
   - `style.css` - CSS styles
   - `script.js` - JavaScript functionality
   - `README.md` - Project documentation (optional but recommended)

3. **Update the main website**
   - Add your project card to `index.html`
   - Follow the existing card structure
   - Choose an appropriate icon from RemixIcon

## Project Guidelines

### Technical Requirements

- **Use vanilla HTML, CSS, and JavaScript** (no frameworks unless absolutely necessary)
- **Make it responsive** - Ensure your project works on mobile devices
- **Cross-browser compatibility** - Test in Chrome, Firefox, Safari, and Edge
- **Clean code** - Use proper indentation and meaningful variable names
- **Comments** - Add comments to explain complex logic

### Quality Standards

- **Functionality** - Your project should work as intended without errors
- **User Experience** - Intuitive and easy to use
- **Performance** - Optimize images and minimize file sizes
- **Accessibility** - Follow basic accessibility guidelines
- **Security** - Avoid any security vulnerabilities

### Content Guidelines

- **Original work** - Don't copy projects directly from tutorials or other sources
- **Appropriate content** - No offensive, inappropriate, or harmful content
- **Educational value** - Projects should demonstrate programming concepts or solve problems
- **Documentation** - Include clear descriptions and usage instructions

### File Structure

```
projects/your-project-name/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # JavaScript code
├── README.md           # Project documentation (optional)
└── assets/             # Images, fonts, etc. (if needed)
    ├── image1.jpg
    └── icon.svg
```

## Submission Process

### Step-by-Step Guide

1. **Develop your project**
   - Create your project in the `projects/` directory
   - Test thoroughly on different devices and browsers
   - Ensure all files are properly organized

2. **Update the main website**
   - Open `projects.json` in the root directory.
   - Add a new object to the array with your project details using this template:

   ```bash
   
   {
      "title": "Your Project Name",
      "category": "utility",
      "description": "Brief description of your project.",
      "tech": ["HTML", "CSS", "JS"],
      "link": "./projects/your-project-name/index.html",
      "icon": "ri-your-icon-name",
      "coverClass": "your-project-cover"
   }
     
   ```

   **Note:** _Valid categories include `utility`, `game`, `puzzle`, `productivity`, etc._

3. **Add CSS for your project card**

   - If you used a `coverClass` (e.g., `your-project-cover`) in step 2, add the styling in `css/style.css` :

   ```copy
         .your-project-cover {
         background: linear-gradient(135deg, #color1 0%, #color2 100%);
         color: white; /* Optional: adjust text color if needed */
         }
   ```
   - Alternatively, you can use `"coverStyle"` in `projects.json` for inline styles instead of a class.
   

4. **Test your changes**
   - Open index.html in your browser
   - Verify your project card appears correctly in the list
   - Click on your card to ensure it opens your project
   - Test your project functionality
   

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: Your Project Name - Brief description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-project-name
   ```

7. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "Compare & pull request"
   - Fill out the PR template with details about your project
   - Submit the pull request

### Pull Request Template

When creating a pull request, please include:

```markdown
## Project Description
Brief description of what your project does

## Type of Change
- [ ] New project
- [ ] Bug fix
- [ ] Enhancement
- [ ] Documentation update

## Screenshots
Add screenshots of your project

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] Tested in multiple browsers
- [ ] No console errors

## Checklist
- [ ] My code follows the project guidelines
- [ ] I have tested my changes thoroughly
- [ ] I have added appropriate comments to my code
- [ ] My project is responsive and accessible
- [ ] I have updated the main website with my project card
```

## Code Review Process

### What to Expect

1. **Initial Review** - A maintainer will review your PR within 2-3 days
2. **Feedback** - You may receive suggestions for improvements
3. **Iteration** - Make requested changes and push updates
4. **Approval** - Once approved, your PR will be merged
5. **Deployment** - Your project will appear on the live website

### Review Criteria

- Code quality and organization
- Functionality and user experience
- Responsive design
- Browser compatibility
- Performance optimization
- Security considerations

## Community Guidelines

### Communication

- Be respectful and constructive in all interactions
- Use clear and descriptive commit messages
- Respond to feedback promptly and professionally
- Ask questions if you need clarification

### Getting Help

- **Issues** - Create an issue for bugs or feature requests
- **Discussions** - Use GitHub Discussions for general questions
- **Documentation** - Check the README and this guide first

### Recognition

- All contributors are credited on the main website
- Outstanding contributions may be featured prominently
- Active contributors may be invited to become maintainers

## Project Ideas

Need inspiration? Here are some project ideas:

### Beginner Projects
- Simple calculator
- Digital clock
- Color picker
- Random quote generator
- Unit converter

### Intermediate Projects
- Todo list with local storage
- Weather app (using API)
- Memory card game
- Expense tracker
- Pomodoro timer

### Advanced Projects
- Drawing canvas
- Music player
- Chat application
- Code editor
- Data visualization tool

## Resources

### Learning Resources
- [MDN Web Docs](https://developer.mozilla.org/) - Comprehensive web development documentation
- [JavaScript.info](https://javascript.info/) - Modern JavaScript tutorial
- [CSS Tricks](https://css-tricks.com/) - CSS tips and techniques
- [Web.dev](https://web.dev/) - Modern web development best practices

### Tools and Libraries
- [RemixIcon](https://remixicon.com/) - Icon library used in the project
- [Google Fonts](https://fonts.google.com/) - Web fonts
- [Can I Use](https://caniuse.com/) - Browser compatibility checker

## License

By contributing to OpenPlayground, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have any questions about contributing, please:
1. Check this guide and the README
2. Search existing issues and discussions
3. Create a new issue or discussion
4. Reach out to the maintainers

Thank you for contributing to OpenPlayground! 🎉
