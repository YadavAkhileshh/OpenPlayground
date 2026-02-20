/**
 * router.js
 * Handles hash-based navigation and active states.
 */

export class Router {
    constructor() {
        this.links = document.querySelectorAll('.main-nav a');
        this.sections = document.querySelectorAll('section');

        window.addEventListener('hashchange', this.onHashChange.bind(this));
        window.addEventListener('load', this.onHashChange.bind(this)); // Handle initial load
    }

    onHashChange() {
        const hash = window.location.hash || '#hero'; // Default to hero/home

        // Update Active Link
        this.links.forEach(link => {
            const href = link.getAttribute('href');
            if (href === hash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Special handling for non-section links (like Init Audio)
        if (hash === '#' || hash.startsWith('#start')) return;

        // Ensure smooth scroll is handled by CSS, but we can do extra logic here if needed.
        console.log(`Navigating to ${hash}`);
    }
}
