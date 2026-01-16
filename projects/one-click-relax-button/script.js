document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const container = document.getElementById('app-container');
    const circle = document.getElementById('guide-circle');
    const text = document.getElementById('guide-text');
    const subText = document.getElementById('sub-text');

    // State lock
    let hasStarted = false;

    // Durations (must align with CSS transitions)
    const INHALE_TIME = 4000;
    const EXHALE_TIME = 4000;

    circle.addEventListener('click', () => {
        if (hasStarted) return;
        hasStarted = true;

        // 1. Enter Focus / Inhale
        startInhale();

        // 2. Schedule Exhale
        setTimeout(() => {
            startExhale();
        }, INHALE_TIME);

        // 3. Schedule Complete
        setTimeout(() => {
            completeSession();
        }, INHALE_TIME + EXHALE_TIME);
    });

    function startInhale() {
        // Apply classes
        container.classList.add('inhale');
        circle.classList.remove('exhale'); // clear any reset
        circle.classList.add('inhale');

        // Update Text
        text.style.opacity = 0;
        
        // Small delay for text swap to feel organic
        setTimeout(() => {
            text.textContent = "Breathe In";
            text.style.opacity = 1;
            subText.classList.add('fade-out');
        }, 300);
    }

    function startExhale() {
        // Apply classes
        container.classList.remove('inhale');
        container.classList.add('exhale');
        
        circle.classList.remove('inhale');
        circle.classList.add('exhale');

        // Update Text
        text.style.opacity = 0;
        
        setTimeout(() => {
            text.textContent = "Breathe Out";
            text.style.opacity = 1;
        }, 300);
    }

    function completeSession() {
        // Apply classes
        container.classList.remove('exhale');
        circle.classList.remove('exhale');
        circle.classList.add('complete');

        // Final Text update
        text.style.opacity = 0;
        
        setTimeout(() => {
            text.textContent = "Welcome Back";
            text.style.opacity = 1;
        }, 500);
    }
});