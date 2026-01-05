/**
 * Theme Toggle - Dark/Light Mode Switcher
 * Handles theme persistence and system preference detection
 */

(function () {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);

    // Toggle theme function
    function toggleTheme() {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Update theme
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    // Add event listener to theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Detect system preference
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // If no saved preference, use system preference
    if (!localStorage.getItem('theme')) {
        if (prefersDarkScheme.matches) {
            html.setAttribute('data-theme', 'dark');
        }
    }

    // Listen for system theme changes
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            html.setAttribute('data-theme', newTheme);
        }
    });

    // Add smooth theme transition
    document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
})();
