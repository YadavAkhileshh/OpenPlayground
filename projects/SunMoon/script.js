
        const themeToggle = document.getElementById('themeToggle');
        const body = document.body;
        const rays = document.getElementById('rays');
        const themeCountElement = document.getElementById('themeCount');
        const currentThemeElement = document.getElementById('currentTheme');
        
        let themeCount = 0;
        let isDarkTheme = false;

        // Create sun rays
        for (let i = 0; i < 12; i++) {
            const ray = document.createElement('div');
            ray.className = 'ray';
            ray.style.transform = `rotate(${i * 30}deg)`;
            rays.appendChild(ray);
        }

        // Initialize from localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            enableDarkTheme();
        }
        
        // Load theme count
        const savedCount = localStorage.getItem('themeCount');
        if (savedCount) {
            themeCount = parseInt(savedCount);
            themeCountElement.textContent = themeCount;
        }

        themeToggle.addEventListener('click', toggleTheme);

        function toggleTheme() {
            if (isDarkTheme) {
                disableDarkTheme();
            } else {
                enableDarkTheme();
            }
            
            // Update count
            themeCount++;
            themeCountElement.textContent = themeCount;
            localStorage.setItem('themeCount', themeCount);
        }

        function enableDarkTheme() {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            isDarkTheme = true;
            currentThemeElement.textContent = 'Dark';
            localStorage.setItem('theme', 'dark');
        }

        function disableDarkTheme() {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            isDarkTheme = false;
            currentThemeElement.textContent = 'Light';
            localStorage.setItem('theme', 'light');
        }

        // Add click animation
        themeToggle.addEventListener('mousedown', () => {
            themeToggle.style.transform = 'scale(0.95)';
        });

        themeToggle.addEventListener('mouseup', () => {
            themeToggle.style.transform = 'scale(1.05)';
        });

        themeToggle.addEventListener('mouseleave', () => {
            themeToggle.style.transform = 'scale(1)';
        });
