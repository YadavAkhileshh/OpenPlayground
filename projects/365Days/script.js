
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const yearDotsContainer = document.getElementById('yearDots');
            const daysCompletedElement = document.getElementById('daysCompleted');
            const daysLeftElement = document.getElementById('daysLeft');
            const percentageElement = document.getElementById('percentage');
            const circlePercentageElement = document.getElementById('circlePercentage');
            const circleProgressElement = document.querySelector('.circle-progress');
            const currentDateElement = document.getElementById('currentDate');
            const themeButtons = document.querySelectorAll('.theme-btn');
            
            // Themes configuration
            const themes = {
                sage: {
                    primary: '#7C9D8E',
                    secondary: '#D4C9B8',
                    accent: '#A67B5B',
                    background: '#FAF7F2',
                    text: '#4A4A4A',
                    textLight: '#8B8B8B'
                },
                sand: {
                    primary: '#D4C9B8',
                    secondary: '#A67B5B',
                    accent: '#7C9D8E',
                    background: '#FBF9F5',
                    text: '#5A5A5A',
                    textLight: '#9B8B7A'
                },
                ocean: {
                    primary: '#6A9FB5',
                    secondary: '#A6C1D9',
                    accent: '#5A8C7A',
                    background: '#F5FAFC',
                    text: '#4A6A7A',
                    textLight: '#7A9FB5'
                },
                forest: {
                    primary: '#5A8C7A',
                    secondary: '#A6C1B6',
                    accent: '#7C9D8E',
                    background: '#F5F9F7',
                    text: '#3A5A4A',
                    textLight: '#7A9B8A'
                },
                berry: {
                    primary: '#B87C8C',
                    secondary: '#D9A6B3',
                    accent: '#8C6A9F',
                    background: '#FBF5F7',
                    text: '#5A4A5A',
                    textLight: '#9B7A8A'
                }
            };
            
            // Current theme
            let currentTheme = 'sage';
            
            // Initialize the dots for the year
            function initializeYearDots() {
    yearGrid.innerHTML = '';

    const now = new Date();
    const year = now.getFullYear();
    const isLeapYear =
        (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

    const months = [
        { name: 'Jan', days: 31 },
        { name: 'Feb', days: isLeapYear ? 29 : 28 },
        { name: 'Mar', days: 31 },
        { name: 'Apr', days: 30 },
        { name: 'May', days: 31 },
        { name: 'Jun', days: 30 },
        { name: 'Jul', days: 31 },
        { name: 'Aug', days: 31 },
        { name: 'Sep', days: 30 },
        { name: 'Oct', days: 31 },
        { name: 'Nov', days: 30 },
        { name: 'Dec', days: 31 }
    ];

    months.forEach((month, monthIndex) => {
        const column = document.createElement('div');
        column.className = 'month-column';

        const label = document.createElement('div');
        label.className = 'month-label';
        label.textContent = month.name;

        const dots = document.createElement('div');
        dots.className = 'month-dots';

        for (let day = 1; day <= month.days; day++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.dataset.month = monthIndex;
            dot.dataset.day = day;
            dots.appendChild(dot);
        }

        column.appendChild(label);
        column.appendChild(dots);
        yearGrid.appendChild(column);
    });

    updateProgress();
}

            
            // Update progress based on current date
            function updateProgress() {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                
                // Calculate days completed and left
                const timeDiff = now - startOfYear;
                const daysCompleted = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1; // +1 to include today
                
                const totalDays = Math.floor((endOfYear - startOfYear) / (1000 * 60 * 60 * 24)) + 1;
                const daysLeft = totalDays - daysCompleted;
                const percentage = ((daysCompleted / totalDays) * 100).toFixed(1);
                
                // Update statistics
                daysCompletedElement.textContent = daysCompleted;
                daysLeftElement.textContent = daysLeft;
                percentageElement.textContent = `${percentage}%`;
                circlePercentageElement.textContent = `${percentage}%`;
                
                // Update progress circle
                const circleCircumference = 2 * Math.PI * 45; // r=45
                const offset = circleCircumference - (daysCompleted / totalDays) * circleCircumference;
                circleProgressElement.style.strokeDashoffset = offset;
                
                // Update current date display
                const monthName = now.toLocaleDateString('en-US', { month: 'long' });
                const day = now.getDate();
                const year = now.getFullYear();
                const daySuffix = getDaySuffix(day);
                const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
                
                currentDateElement.textContent = `${weekday}, ${monthName} ${day}${daySuffix}, ${year}`;
                
                // Update dots
                const dots = document.querySelectorAll('.dot');
                let dotIndex = 0;
                
                // Days in each month (considering leap year)
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
                
                dots.forEach(dot => {
                    const month = parseInt(dot.dataset.month);
                    const day = parseInt(dot.dataset.day);
                    
                    // Calculate day of year
                    let dayOfYear = day;
                    for (let i = 0; i < month; i++) {
                        dayOfYear += daysInMonth[i];
                    }
                    
                    // Update dot appearance based on progress
                    if (dayOfYear < daysCompleted) {
                        dot.className = 'dot filled';
                        dot.title = `${getMonthName(month)} ${day} - Completed`;
                    } else if (dayOfYear === daysCompleted) {
                        dot.className = 'dot filled current';
                        dot.title = `${getMonthName(month)} ${day} - Today`;
                    } else {
                        dot.className = 'dot future';
                        dot.title = `${getMonthName(month)} ${day} - Future`;
                    }
                    
                    dotIndex++;
                });
            }
            
            // Helper function to get day suffix
            function getDaySuffix(day) {
                if (day >= 11 && day <= 13) return 'th';
                switch (day % 10) {
                    case 1: return 'st';
                    case 2: return 'nd';
                    case 3: return 'rd';
                    default: return 'th';
                }
            }
            
            // Helper function to get month name
            function getMonthName(monthIndex) {
                const months = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];
                return months[monthIndex];
            }
            
            // Theme switching functionality
            function setTheme(themeName) {
                currentTheme = themeName;
                const theme = themes[themeName];
                
                // Update CSS variables
                document.documentElement.style.setProperty('--color-primary', theme.primary);
                document.documentElement.style.setProperty('--color-secondary', theme.secondary);
                document.documentElement.style.setProperty('--color-accent', theme.accent);
                document.documentElement.style.setProperty('--color-background', theme.background);
                document.documentElement.style.setProperty('--color-text', theme.text);
                document.documentElement.style.setProperty('--color-text-light', theme.textLight);
                
                // Update floating elements
                document.querySelector('.floating-1').style.background = theme.primary;
                document.querySelector('.floating-2').style.background = theme.accent;
                
                // Update active theme button
                themeButtons.forEach(btn => {
                    if (btn.dataset.theme === themeName) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            }
            
            // Event listeners for theme buttons
            themeButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const themeName = this.dataset.theme;
                    setTheme(themeName);
                    
                    // Add click animation
                    this.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        this.style.transform = '';
                    }, 200);
                });
            });
            
            // Auto-update at midnight
            function scheduleMidnightUpdate() {
                const now = new Date();
                const midnight = new Date();
                midnight.setHours(24, 0, 0, 0);
                
                const timeUntilMidnight = midnight - now;
                
                setTimeout(() => {
                    updateProgress();
                    scheduleMidnightUpdate();
                    
                    // Add a subtle animation to indicate update
                    document.querySelector('.progress-circle').style.transform = 'scale(1.05)';
                    setTimeout(() => {
                        document.querySelector('.progress-circle').style.transform = 'scale(1)';
                    }, 300);
                }, timeUntilMidnight);
            }
            
            // Initialize the page
            initializeYearDots();
            updateProgress();
            scheduleMidnightUpdate();
            
            // Update every minute for edge cases
            setInterval(updateProgress, 60000);
            
            // Handle window resize
            window.addEventListener('resize', initializeYearDots);
            
            // Trigger entrance animations
            setTimeout(() => {
                document.querySelectorAll('.animate-in').forEach(el => {
                    el.style.animationPlayState = 'running';
                });
            }, 100);
            
            // Add a subtle parallax effect on mouse move
            document.addEventListener('mousemove', (e) => {
                const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
                const yAxis = (window.innerHeight / 2 - e.pageY) / 50;
                
                document.querySelector('.floating-1').style.transform = `translate(${xAxis}px, ${yAxis}px)`;
                document.querySelector('.floating-2').style.transform = `translate(${-xAxis}px, ${-yAxis}px)`;
            });
        });
    