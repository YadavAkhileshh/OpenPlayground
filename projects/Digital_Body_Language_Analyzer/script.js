
        // State variables
        let sessionActive = true;
        let mouseMovements = [];
        let clicks = [];
        let scrollEvents = [];
        let interactionData = {
            mouseSpeed: 0,
            clickFrequency: 0,
            scrollHesitation: 0,
            behaviorStyle: 'calm',
            calmScore: 70,
            rushedScore: 30,
            hesitantScore: 50
        };
        
        // DOM Elements
        const indicatorCircle = document.getElementById('indicatorCircle');
        const indicatorLabel = document.getElementById('indicatorLabel');
        const mouseSpeedEl = document.getElementById('mouseSpeed');
        const clickFreqEl = document.getElementById('clickFreq');
        const scrollHesitationEl = document.getElementById('scrollHesitation');
        const behaviorTags = document.getElementById('behaviorTags');
        const insightText = document.getElementById('insightText');
        const summaryCard = document.getElementById('summaryCard');
        const calmBar = document.getElementById('calmBar');
        const rushedBar = document.getElementById('rushedBar');
        const hesitantBar = document.getElementById('hesitantBar');
        const summaryText = document.getElementById('summaryText');
        const endSessionBtn = document.getElementById('endSessionBtn');
        const resetBtn = document.getElementById('resetBtn');
        const intensityBars = [
            document.getElementById('bar1'),
            document.getElementById('bar2'),
            document.getElementById('bar3'),
            document.getElementById('bar4'),
            document.getElementById('bar5')
        ];
        
        // Canvas for motion trails
        const canvas = document.getElementById('motionTrail');
        const ctx = canvas.getContext('2d');
        let trails = [];
        
        // Initialize canvas
        function initCanvas() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            
            // Draw initial grid
            drawGrid();
        }
        
        // Draw background grid
        function drawGrid() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw subtle grid
            ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)';
            ctx.lineWidth = 1;
            
            // Vertical lines
            for (let x = 0; x <= canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // Horizontal lines
            for (let y = 0; y <= canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }
        
        // Add a motion trail
        function addTrail(x, y, speed) {
            const now = Date.now();
            const color = getColorForSpeed(speed);
            
            trails.push({
                x, y, 
                color,
                size: Math.min(10, speed / 20 + 3),
                createdAt: now,
                lifespan: 1000 // 1 second
            });
            
            // Keep only recent trails
            trails = trails.filter(trail => now - trail.createdAt < trail.lifespan);
            
            drawTrails();
        }
        
        // Draw all trails
        function drawTrails() {
            drawGrid();
            
            const now = Date.now();
            
            trails.forEach(trail => {
                const age = now - trail.createdAt;
                const opacity = 1 - (age / trail.lifespan);
                
                ctx.beginPath();
                ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
                ctx.fillStyle = trail.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
                ctx.fill();
            });
        }
        
        // Get color based on speed
        function getColorForSpeed(speed) {
            if (speed < 5) return 'rgb(255, 193, 69)'; // Hesitant
            if (speed < 15) return 'rgb(74, 156, 255)'; // Calm
            return 'rgb(255, 107, 107)'; // Rushed
        }
        
        // Calculate mouse speed and smoothness
        function calculateMouseSpeed(x, y, time) {
            if (mouseMovements.length === 0) {
                mouseMovements.push({x, y, time});
                return 0;
            }
            
            const lastMovement = mouseMovements[mouseMovements.length - 1];
            const distance = Math.sqrt(Math.pow(x - lastMovement.x, 2) + Math.pow(y - lastMovement.y, 2));
            const timeDiff = time - lastMovement.time;
            const speed = timeDiff > 0 ? distance / (timeDiff / 1000) : 0;
            
            mouseMovements.push({x, y, time});
            
            // Keep only last 50 movements
            if (mouseMovements.length > 50) {
                mouseMovements.shift();
            }
            
            return speed;
        }
        
        // Track mouse movement
        let lastMouseX = 0;
        let lastMouseY = 0;
        let lastMouseTime = 0;
        
        document.addEventListener('mousemove', (e) => {
            if (!sessionActive) return;
            
            const currentTime = Date.now();
            const speed = calculateMouseSpeed(e.clientX, e.clientY, currentTime);
            
            // Update mouse speed in interaction data
            interactionData.mouseSpeed = speed;
            
            // Add trail if enough time has passed
            if (currentTime - lastMouseTime > 50) {
                addTrail(e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top, speed);
                lastMouseTime = currentTime;
            }
            
            updateUI();
        });
        
        // Track clicks
        document.addEventListener('click', () => {
            if (!sessionActive) return;
            
            const currentTime = Date.now();
            clicks.push(currentTime);
            
            // Keep only clicks from last minute
            const oneMinuteAgo = currentTime - 60000;
            clicks = clicks.filter(clickTime => clickTime > oneMinuteAgo);
            
            // Calculate click frequency (clicks per minute)
            if (clicks.length > 1) {
                const timeSpan = (clicks[clicks.length - 1] - clicks[0]) / 1000; // in seconds
                interactionData.clickFrequency = clicks.length / (timeSpan / 60);
            }
            
            updateUI();
        });
        
        // Track scroll
        let lastScrollTime = 0;
        let scrollPauses = [];
        
        document.addEventListener('scroll', () => {
            if (!sessionActive) return;
            
            const currentTime = Date.now();
            scrollEvents.push(currentTime);
            
            // Calculate time since last scroll
            if (lastScrollTime > 0) {
                const pauseDuration = currentTime - lastScrollTime;
                
                // Only count pauses longer than 100ms
                if (pauseDuration > 100) {
                    scrollPauses.push(pauseDuration);
                    
                    // Keep only last 20 pauses
                    if (scrollPauses.length > 20) {
                        scrollPauses.shift();
                    }
                    
                    // Calculate average scroll hesitation
                    if (scrollPauses.length > 0) {
                        const sum = scrollPauses.reduce((a, b) => a + b, 0);
                        interactionData.scrollHesitation = (sum / scrollPauses.length) / 1000; // Convert to seconds
                    }
                }
            }
            
            lastScrollTime = currentTime;
            updateUI();
        });
        
        // Update UI based on interaction data
        function updateUI() {
            // Update numeric values
            mouseSpeedEl.textContent = interactionData.mouseSpeed.toFixed(1);
            clickFreqEl.textContent = interactionData.clickFrequency.toFixed(1);
            scrollHesitationEl.textContent = interactionData.scrollHesitation.toFixed(1);
            
            // Determine behavior style
            let style = 'calm';
            let calm = 0, rushed = 0, hesitant = 0;
            
            // Calculate scores based on interaction data
            if (interactionData.mouseSpeed > 20) rushed += 40;
            else if (interactionData.mouseSpeed < 5) hesitant += 30;
            else calm += 35;
            
            if (interactionData.clickFrequency > 20) rushed += 30;
            else if (interactionData.clickFrequency < 5) hesitant += 25;
            else calm += 30;
            
            if (interactionData.scrollHesitation > 2) hesitant += 45;
            else if (interactionData.scrollHesitation < 0.5) rushed += 30;
            else calm += 35;
            
            // Determine dominant style
            if (rushed > calm && rushed > hesitant) style = 'rushed';
            else if (hesitant > calm && hesitant > rushed) style = 'hesitant';
            else style = 'calm';
            
            interactionData.behaviorStyle = style;
            
            // Update indicator circle
            let color, label;
            switch(style) {
                case 'calm':
                    color = 'var(--calm-color)';
                    label = 'Calm';
                    break;
                case 'rushed':
                    color = 'var(--rushed-color)';
                    label = 'Rushed';
                    break;
                case 'hesitant':
                    color = 'var(--hesitant-color)';
                    label = 'Hesitant';
                    break;
            }
            
            indicatorCircle.style.background = `radial-gradient(circle at 30% 30%, ${color}40, ${color}10)`;
            indicatorCircle.style.boxShadow = `0 0 40px ${color}40`;
            indicatorLabel.textContent = label;
            
            // Update intensity bars
            const intensity = Math.min(1, interactionData.mouseSpeed / 30);
            intensityBars.forEach((bar, index) => {
                const delay = index * 0.1;
                const height = Math.max(10, intensity * 100 * (0.8 - index * 0.1));
                setTimeout(() => {
                    bar.style.height = '60px';
                    bar.querySelector('::after').style.height = `${height}%`;
                }, delay * 1000);
            });
            
            // Update behavior tags
            behaviorTags.innerHTML = '';
            const tags = ['calm', 'rushed', 'hesitant'];
            tags.forEach(tag => {
                const span = document.createElement('span');
                span.className = `behavior-tag ${tag}`;
                span.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
                
                // Highlight the active tag
                if (tag === style) {
                    span.classList.add('pulse');
                }
                
                behaviorTags.appendChild(span);
            });
            
            // Update insight text
            let insight = '';
            if (style === 'calm') {
                insight = 'Your interaction style appears balanced. You\'re moving at a steady pace with thoughtful pauses between actions.';
            } else if (style === 'rushed') {
                insight = 'You\'re interacting quickly with rapid movements and frequent clicks. This may indicate urgency or efficiency.';
            } else {
                insight = 'You\'re taking time between actions with careful consideration. This suggests a deliberate, thoughtful approach.';
            }
            
            insightText.textContent = insight;
            
            // Update scores for summary
            interactionData.calmScore = Math.min(100, Math.max(10, calm));
            interactionData.rushedScore = Math.min(100, Math.max(10, rushed));
            interactionData.hesitantScore = Math.min(100, Math.max(10, hesitant));
        }
        
        // End session and show summary
        endSessionBtn.addEventListener('click', () => {
            sessionActive = false;
            summaryCard.classList.add('active');
            
            // Update summary chart bars
            calmBar.style.height = `${interactionData.calmScore}%`;
            rushedBar.style.height = `${interactionData.rushedScore}%`;
            hesitantBar.style.height = `${interactionData.hesitantScore}%`;
            
            // Update summary text based on analysis
            let summary = '';
            const maxScore = Math.max(
                interactionData.calmScore, 
                interactionData.rushedScore, 
                interactionData.hesitantScore
            );
            
            if (maxScore === interactionData.calmScore) {
                summary = 'Your session analysis shows a predominantly calm interaction style. You maintain a steady pace, balancing efficiency with consideration. This pattern suggests comfort with digital interfaces and a methodical approach to navigation.';
            } else if (maxScore === interactionData.rushedScore) {
                summary = 'Your interaction pattern shows a rushed approach with rapid movements and frequent actions. This could indicate urgency, familiarity with the interface, or a preference for efficiency over deliberation.';
            } else {
                summary = 'Your session reveals a hesitant interaction style, with careful consideration between actions. This suggests a thoughtful, deliberate approach to digital interfaces, possibly indicating exploration or caution with new content.';
            }
            
            summaryText.innerHTML = `<p>${summary}</p><p style="margin-top: 15px;">Remember: This analysis reflects how you interact, not what you interact with. No personal data has been collected or stored.</p>`;
            
            // Change button text
            endSessionBtn.innerHTML = '<i class="fas fa-check"></i> Session Complete';
            endSessionBtn.disabled = true;
        });
        
        // Reset session
        resetBtn.addEventListener('click', () => {
            sessionActive = true;
            
            // Reset data
            mouseMovements = [];
            clicks = [];
            scrollEvents = [];
            scrollPauses = [];
            trails = [];
            
            interactionData = {
                mouseSpeed: 0,
                clickFrequency: 0,
                scrollHesitation: 0,
                behaviorStyle: 'calm',
                calmScore: 70,
                rushedScore: 30,
                hesitantScore: 50
            };
            
            // Reset UI
            summaryCard.classList.remove('active');
            endSessionBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> End Session & Show Summary';
            endSessionBtn.disabled = false;
            
            // Reset canvas
            drawGrid();
            
            updateUI();
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            initCanvas();
            drawTrails();
        });
        
        // Initialize
        window.addEventListener('load', () => {
            initCanvas();
            updateUI();
            
            // Simulate some initial activity for demo purposes
            setTimeout(() => {
                if (sessionActive) {
                    interactionData.mouseSpeed = 12.5;
                    interactionData.clickFrequency = 8.2;
                    interactionData.scrollHesitation = 1.4;
                    updateUI();
                }
            }, 1000);
        });
    