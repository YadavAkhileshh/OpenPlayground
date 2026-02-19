/**
 * script.js
 * Handles scroll-based animations using the Intersection Observer API.
 */

document.addEventListener("DOMContentLoaded", () => {

    // --- 1. Hero Section Animation (Runs once when the page loads) ---
    const heroContent = document.querySelector('.hero-content');

    if (heroContent) {
        // We use a small timeout to ensure the CSS transition is recognized 
        // after the DOM loads and the initial state is rendered.
        setTimeout(() => {
            heroContent.classList.add('animate-visible');
        }, 500); 
    }

    // --- 2. Scroll-Based Card Animation ---

    // Define the options for the Intersection Observer
    const observerOptions = {
        // When 10% of the element is visible, trigger the callback
        rootMargin: '1px',
        threshold: 0.4
    };

    // Create a new Intersection Observer instance
    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if the element is currently intersecting (visible)
            if (entry.isIntersecting) {
                // Add the visible class to trigger the CSS animation
                entry.target.classList.add('animate-visible');
                
                // Stop observing the element once it's visible to save resources
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    // Get all the project cards
    const projectCards = document.querySelectorAll('.project-card');

    // Attach the observer to each card
    projectCards.forEach(card => {
        cardObserver.observe(card);
    });
});