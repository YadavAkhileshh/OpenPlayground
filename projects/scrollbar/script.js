        // DOM Elements
        const container = document.getElementById('container');
        const scrollWrapper = document.getElementById('scrollWrapper');
        const navDots = document.getElementById('navDots');
        const dots = document.querySelectorAll('.dot');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const mobilePrevBtn = document.getElementById('mobilePrevBtn');
        const mobileNextBtn = document.getElementById('mobileNextBtn');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const scrollHint = document.getElementById('scrollHint');
        const smoothToggle = document.getElementById('smoothToggle');
        const modeIndicator = document.getElementById('modeIndicator');
        const demoBtn = document.getElementById('demoBtn');
        const scrollEffect = document.getElementById('scrollEffect');
        const scrollLine = document.getElementById('scrollLine');

        // State variables
        let currentSection = 0;
        let totalSections = 5;
        let isAnimating = false;
        let isSmooth = true;
        let scrollTimeout = null;
        let touchStartY = 0;
        let touchEndY = 0;
        let scrollDirection = 0; // 0 = none, 1 = down, -1 = up

        // Initialize
        function init() {
            // Set initial state
            updateNavigation();
            
            // Event listeners for navigation buttons
            prevBtn.addEventListener('click', goToPrevSection);
            nextBtn.addEventListener('click', goToNextSection);
            mobilePrevBtn.addEventListener('click', goToPrevSection);
            mobileNextBtn.addEventListener('click', goToNextSection);
            
            // Event listeners for navigation dots
            dots.forEach(dot => {
                dot.addEventListener('click', function() {
                    const sectionIndex = parseInt(this.getAttribute('data-section'));
                    goToSection(sectionIndex);
                });
            });
            
            // Event listener for smooth toggle
            smoothToggle.addEventListener('change', function() {
                isSmooth = this.checked;
                modeIndicator.textContent = isSmooth ? 'Smooth Scroll' : 'Instant Scroll';
            });
            
            // Event listener for demo button
            demoBtn.addEventListener('click', function() {
                goToSection((currentSection + 1) % totalSections);
            });
            
            // Keyboard navigation
            document.addEventListener('keydown', handleKeyDown);
            
            // Mouse wheel navigation
            document.addEventListener('wheel', handleWheel, { passive: false });
            
            // Touch events for mobile
            document.addEventListener('touchstart', handleTouchStart, { passive: false });
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
            
            // Hide scroll hint after first interaction
            let hasInteracted = false;
            const interactionEvents = ['wheel', 'keydown', 'click', 'touchstart'];
            
            interactionEvents.forEach(event => {
                document.addEventListener(event, function() {
                    if (!hasInteracted) {
                        hasInteracted = true;
                        scrollHint.style.opacity = '0';
                        setTimeout(() => {
                            scrollHint.style.display = 'none';
                        }, 500);
                    }
                }, { once: true });
            });
            
            // Animation for elements on scroll
            setupScrollAnimations();
        }

        // Handle keyboard navigation
        function handleKeyDown(e) {
            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    e.preventDefault();
                    goToNextSection();
                    break;
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    goToPrevSection();
                    break;
                case 'Home':
                    e.preventDefault();
                    goToSection(0);
                    break;
                case 'End':
                    e.preventDefault();
                    goToSection(totalSections - 1);
                    break;
            }
        }

        // Handle mouse wheel
        function handleWheel(e) {
            e.preventDefault();
            
            // Prevent rapid scrolling
            if (isAnimating) return;
            
            // Determine direction
            if (e.deltaY > 0) {
                goToNextSection();
                scrollDirection = 1;
            } else if (e.deltaY < 0) {
                goToPrevSection();
                scrollDirection = -1;
            }
            
            // Show scroll effect
            showScrollEffect(scrollDirection);
        }

        // Handle touch start
        function handleTouchStart(e) {
            touchStartY = e.touches[0].clientY;
        }

        // Handle touch move
        function handleTouchMove(e) {
            e.preventDefault();
            touchEndY = e.touches[0].clientY;
        }

        // Handle touch end
        function handleTouchEnd() {
            // Calculate swipe distance
            const swipeDistance = touchStartY - touchEndY;
            
            // Only react to significant swipes
            if (Math.abs(swipeDistance) < 50) return;
            
            if (swipeDistance > 0 && currentSection < totalSections - 1) {
                // Swipe up - go to next section
                goToNextSection();
                scrollDirection = 1;
            } else if (swipeDistance < 0 && currentSection > 0) {
                // Swipe down - go to previous section
                goToPrevSection();
                scrollDirection = -1;
            }
            
            // Show scroll effect
            showScrollEffect(scrollDirection);
        }

        // Go to specific section
        function goToSection(sectionIndex) {
            if (isAnimating || sectionIndex < 0 || sectionIndex >= totalSections) return;
            
            isAnimating = true;
            currentSection = sectionIndex;
            
            // Calculate transform value
            const translateY = -currentSection * 100;
            
            // Apply transition
            if (isSmooth) {
                scrollWrapper.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1)';
            } else {
                scrollWrapper.style.transition = 'transform 0.3s ease';
            }
            
            // Apply transform
            scrollWrapper.style.transform = `translateY(${translateY}vh)`;
            
            // Update navigation
            updateNavigation();
            
            // Reset animation flag after transition
            setTimeout(() => {
                isAnimating = false;
                scrollWrapper.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.1)';
            }, isSmooth ? 800 : 300);
        }

        // Go to next section
        function goToNextSection() {
            if (currentSection < totalSections - 1) {
                goToSection(currentSection + 1);
            }
        }

        // Go to previous section
        function goToPrevSection() {
            if (currentSection > 0) {
                goToSection(currentSection - 1);
            }
        }

        // Update navigation state
        function updateNavigation() {
            // Update dots
            dots.forEach((dot, index) => {
                if (index === currentSection) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
            
            // Update button states
            prevBtn.classList.toggle('disabled', currentSection === 0);
            nextBtn.classList.toggle('disabled', currentSection === totalSections - 1);
            mobilePrevBtn.classList.toggle('disabled', currentSection === 0);
            mobileNextBtn.classList.toggle('disabled', currentSection === totalSections - 1);
            
            // Update progress bar
            const progressPercentage = ((currentSection + 1) / totalSections) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            
            // Update progress text
            progressText.textContent = `Section ${currentSection + 1} of ${totalSections}`;
            
            // Animate content in current section
            animateCurrentSection();
        }

        // Show scroll effect visualization
        function showScrollEffect(direction) {
            // Reset scroll line
            scrollLine.style.height = '0';
            scrollLine.style.top = direction === 1 ? '0%' : '100%';
            
            // Show effect container
            scrollEffect.style.opacity = '1';
            
            // Animate scroll line
            setTimeout(() => {
                scrollLine.style.height = '100%';
                scrollLine.style.transition = 'height 0.5s ease';
            }, 10);
            
            // Hide effect after animation
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                scrollEffect.style.opacity = '0';
                scrollLine.style.transition = 'none';
            }, 800);
        }

        // Animate elements in current section
        function animateCurrentSection() {
            const currentContent = document.querySelectorAll('.section')[currentSection].querySelector('.content');
            const elements = currentContent.querySelectorAll('h1, h2, p, .feature, .demo-card');
            
            elements.forEach((element, index) => {
                // Reset animation
                element.classList.remove('animate-in');
                
                // Apply animation with delay
                setTimeout(() => {
                    element.classList.add('animate-in');
                }, index * 100);
            });
        }

        // Setup scroll animations for all sections
        function setupScrollAnimations() {
            const sections = document.querySelectorAll('.section');
            
            sections.forEach(section => {
                const content = section.querySelector('.content');
                const elements = content.querySelectorAll('h1, h2, p, .feature, .demo-card');
                
                elements.forEach(element => {
                    element.classList.add('animate-in');
                });
            });
            
            // Initial animation for first section
            animateCurrentSection();
        }

        // Initialize the application
        init();