// ===============================
// Component Loader for OpenPlayground
// Dynamically loads HTML components
// ===============================
 
class ComponentLoader {
    constructor() {
        this.components = {
            'header': './components/header.html',
            'hero': './components/hero.html',
            'projects': './components/projects.html',
            'contribute': './components/contribute.html',
            'contributors': './components/contributors.html',
            'footer': './components/footer.html',
            'chatbot': './components/chatbot.html'
        };
        this.loadedComponents = new Set();
    }

    async loadComponent(name, targetSelector) {
        try {
            if (this.loadedComponents.has(name)) {
                console.log(`Component ${name} already loaded`);
                return;
            }

            const response = await fetch(this.components[name]);
            if (!response.ok) {
                throw new Error(`Failed to load component ${name}: ${response.status}`);
            }

            const html = await response.text();
            const target = document.querySelector(targetSelector);

            if (!target) {
                throw new Error(`Target element ${targetSelector} not found`);
            }

            target.innerHTML = html;
            this.loadedComponents.add(name);

            console.log(`✅ Component ${name} loaded successfully`);

            // Trigger custom event for component loaded
            document.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { component: name, target: targetSelector }
            }));

        } catch (error) {
            console.error(`❌ Error loading component ${name}:`, error);

            // Show fallback content
            const target = document.querySelector(targetSelector);
            if (target) {
                target.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: #ef4444; background: #fef2f2; border-radius: 8px; margin: 1rem;">
                        <h3>⚠️ Component Loading Error</h3>
                        <p>Failed to load ${name} component. Please refresh the page.</p>
                    </div>
                `;
            }
        }
    }

    async loadAllComponents() {
        const componentMap = [
            { name: 'header', selector: '#header-placeholder' },
            { name: 'hero', selector: '#hero-placeholder' },
            { name: 'projects', selector: '#projects-placeholder' },
            { name: 'contribute', selector: '#contribute-placeholder' },
            { name: 'footer', selector: '#footer-placeholder' },
            { name: 'chatbot', selector: '#chatbot-placeholder' }
        ];

        // Show loading indicator
        this.showLoadingIndicator();

        try {
            // Load components in parallel for better performance
            const loadPromises = componentMap.map(({ name, selector }) =>
                this.loadComponent(name, selector)
            );

            await Promise.all(loadPromises);

            console.log('🎉 All components loaded successfully');

            // Hide loading indicator
            this.hideLoadingIndicator();

            // Initialize app after all components are loaded
            this.initializeApp();

        } catch (error) {
            console.error('❌ Error loading components:', error);
            this.hideLoadingIndicator();
        }
    }

    showLoadingIndicator() {
        const loader = document.createElement('div');
        loader.id = 'component-loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            ">
                <div style="text-align: center;">
                    <div style="
                        width: 50px;
                        height: 50px;
                        border: 4px solid #e2e8f0;
                        border-top: 4px solid #6366f1;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 1rem;
                    "></div>
                    <p style="color: #64748b; font-weight: 500;">Loading OpenPlayground...</p>
                </div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loader);
    }

    hideLoadingIndicator() {
        const loader = document.getElementById('component-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease';
            setTimeout(() => loader.remove(), 300);
        }
    }

    initializeApp() {
        // Initialize theme
        this.initializeTheme();

        // Initialize mobile navigation
        this.initializeMobileNav();

        // Initialize scroll to top
        this.initializeScrollToTop();

        // Initialize chatbot
        this.initializeChatbot();

        // Initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Initialize project functionality
        if (window.ProjectManager) {
            new window.ProjectManager();
        }

        // Initialize contributors
        if (typeof fetchContributors === 'function') {
            fetchContributors();
        }

        console.log('🚀 OpenPlayground initialized successfully');
    }

    initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const html = document.documentElement;

        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        html.setAttribute('data-theme', savedTheme);

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = html.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';

                html.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);

                // Add animation
                themeToggle.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    themeToggle.style.transform = 'scale(1)';
                }, 150);
            });
        }
    }

    initializeMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');

        if (navToggle && navLinks) {
            navToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                navLinks.classList.toggle('active');

                // Update icon
                const icon = navToggle.querySelector('i');
                if (navLinks.classList.contains('active')) {
                    icon.className = 'ri-close-line';
                    document.body.style.overflow = 'hidden';
                } else {
                    icon.className = 'ri-menu-3-line';
                    document.body.style.overflow = 'auto';
                }
            });

            // Close menu when clicking links
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    navToggle.querySelector('i').className = 'ri-menu-3-line';
                    document.body.style.overflow = 'auto';
                });
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    navToggle.querySelector('i').className = 'ri-menu-3-line';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    }

    initializeScrollToTop() {
        const scrollBtn = document.getElementById('scrollToTopBtn');

        if (scrollBtn) {
            // Show/hide button based on scroll position
            window.addEventListener('scroll', () => {
                if (window.scrollY > 300) {
                    scrollBtn.classList.add('show');
                } else {
                    scrollBtn.classList.remove('show');
                }
            });

            // Scroll to top when clicked
            scrollBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // initializeChatbot() {
    //     // Initialize chatbot functionality
    //     const chatbotBtn = document.querySelector('.chatbot-btn');
    //     const chatbot = document.getElementById('chatbot');
    //     const chatInput = document.getElementById('chatInput');
    //     const chatMessages = document.getElementById('chatMessages');
        
    //     if (chatbotBtn && chatbot) {
    //         // Toggle chatbot
    //         window.toggleChatbot = () => {
    //             const isVisible = chatbot.style.display === 'flex';
    //             chatbot.style.display = isVisible ? 'none' : 'flex';
    //         };
            
    //         // Send message
    //         window.sendChat = () => {
    //             if (!chatInput || !chatMessages) return;
                
    //             const message = chatInput.value.trim();
    //             if (!message) return;
                
    //             // Add user message
    //             const userMsg = document.createElement('div');
    //             userMsg.className = 'user-msg';
    //             userMsg.textContent = message;
    //             chatMessages.appendChild(userMsg);
                
    //             chatInput.value = '';
    //             chatMessages.scrollTop = chatMessages.scrollHeight;
                
    //             // Bot response
    //             setTimeout(() => {
    //                 const botMsg = document.createElement('div');
    //                 botMsg.className = 'bot-msg';
    //                 botMsg.textContent = this.getBotResponse(message);
    //                 chatMessages.appendChild(botMsg);
    //                 chatMessages.scrollTop = chatMessages.scrollHeight;
    //             }, 500);
    //         };
            
    //         // Enter key support
    //         if (chatInput) {
    //             chatInput.addEventListener('keypress', (e) => {
    //                 if (e.key === 'Enter') {
    //                     window.sendChat();
    //                 }
    //             });
    //         }
    //     }
    // }

    // getBotResponse(message) {
    //     const msg = message.toLowerCase();
        
    //     if (msg.includes('project')) {
    //         return '📁 You can explore projects in the Projects section. Use filters to find specific types!';
    //     } else if (msg.includes('contribute')) {
    //         return '🤝 Check out the Contribute section for step-by-step instructions on how to add your projects.';
    //     } else if (msg.includes('github')) {
    //         return '🐙 Visit our GitHub repository to explore the code, open issues, or submit PRs!';
    //     } else if (msg.includes('hello') || msg.includes('hi')) {
    //         return '👋 Hello! I\'m the OpenPlayground AI. How can I help you today?';
    //     } else if (msg.includes('theme')) {
    //         return '🎨 You can toggle between dark and light themes using the toggle in the navigation bar!';
    //     } else if (msg.includes('help')) {
    //         return '🆘 I can help you with: projects, contributing, GitHub, theme, and searching. Just ask!';
    //     } else {
    //         return 'I\'m not sure about that 🤔. Try asking about projects, contributing, or GitHub!';
    //     }
    // }

    initializeSmoothScrolling() {
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const navbarHeight = 75;
                    const targetPosition = target.offsetTop - navbarHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAllComponents();
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;