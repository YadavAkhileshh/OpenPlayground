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

        // Initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Initialize navbar active tracking
        this.initializeNavActiveTracking();

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
        if (!scrollBtn) return;

        const circle = scrollBtn.querySelector('.progress-ring__circle');
        const radius = circle ? (parseFloat(circle.getAttribute('r')) || 21) : 21;
        const circumference = 2 * Math.PI * radius;

        if (circle) {
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference;
        }

        const updateProgress = () => {
            const scrollCurrent = window.scrollY;
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;

            if (circle && scrollTotal > 0) {
                const scrollPercentage = (scrollCurrent / scrollTotal) * 100;
                const offset = circumference - (Math.min(scrollPercentage, 100) / 100 * circumference);
                circle.style.strokeDashoffset = offset;
            }

            if (scrollCurrent > 100) {
                scrollBtn.classList.add('show');
            } else {
                scrollBtn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', updateProgress);
        updateProgress(); // Initial call

        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

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

    // ===============================
    // NAVBAR ACTIVE TRACKING METHODS
    // ===============================

    initializeNavActiveTracking() {
        // Set active state on page load
        this.setActiveNavLink();
        
        // Update active state on hash change
        window.addEventListener('hashchange', () => this.setActiveNavLink());
        
        // Update active state on scroll (for sections)
        window.addEventListener('scroll', () => this.updateActiveOnScroll());
        
        // Click handler for nav links
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                this.handleNavLinkClick(e.target.closest('.nav-link'));
            }
        });
    }

    setActiveNavLink() {
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const navLinks = document.querySelectorAll('.nav-link');
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Check for hash links (Projects, Contribute)
            if (currentHash) {
                const hashLink = document.querySelector(`.nav-link[href="${currentHash}"]`);
                if (hashLink) {
                    hashLink.classList.add('active');
                    return;
                }
            }
            
            // Check for page links
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                const isCurrentPage = linkHref === currentPath || 
                    (currentPath.endsWith('/') && linkHref === 'index.html') ||
                    (currentPath.includes('about') && linkHref === 'about.html') ||
                    (currentPath.includes('bookmarks') && linkHref === 'bookmarks.html');
                
                if (isCurrentPage) {
                    link.classList.add('active');
                }
                
                // Default active for home page
                if ((currentPath.endsWith('index.html') || currentPath.endsWith('/')) && 
                    !currentHash && 
                    linkHref === '#projects') {
                    link.classList.add('active');
                }
            });
        }, 100);
    }

    updateActiveOnScroll() {
        const sections = document.querySelectorAll('section[id], div[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && 
                window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkHref = link.getAttribute('href');
            if (linkHref === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    handleNavLinkClick(clickedLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
        
        // Close mobile menu if open
        const navLinksContainer = document.getElementById('navLinks');
        const navToggle = document.getElementById('navToggle');
        if (navLinksContainer && navLinksContainer.classList.contains('active')) {
            navLinksContainer.classList.remove('active');
            if (navToggle) {
                navToggle.querySelector('i').className = 'ri-menu-3-line';
            }
            document.body.style.overflow = 'auto';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAllComponents();
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;