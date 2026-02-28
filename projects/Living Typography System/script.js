const textElements = document.querySelectorAll('.living-text');
const scrollSpeedEl = document.getElementById('scroll-speed');
const hoverTimeEl = document.getElementById('hover-time');
const readProgressEl = document.getElementById('read-progress');

let lastScrollTop = 0;
let scrollSpeed = 0;
let hoverStartTime = 0;
let totalHoverTime = 0;
let readProgress = 0;

// Scroll speed detection
window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const delta = Math.abs(scrollTop - lastScrollTop);
    scrollSpeed = delta / 0.1; // Rough speed
    scrollSpeedEl.textContent = `Scroll Speed: ${Math.round(scrollSpeed)} px/s`;
    lastScrollTop = scrollTop;

    // Apply fast scroll animation
    if (scrollSpeed > 100) {
        textElements.forEach(el => {
            el.classList.add('fast-scroll');
            setTimeout(() => el.classList.remove('fast-scroll'), 500);
        });
    }

    // Update read progress
    const totalHeight = document.body.scrollHeight - window.innerHeight;
    readProgress = Math.min((scrollTop / totalHeight) * 100, 100);
    readProgressEl.textContent = `Read Progress: ${Math.round(readProgress)}%`;
});

// Hover time detection
textElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        hoverStartTime = Date.now();
        el.classList.add('animated');
    });

    el.addEventListener('mouseleave', () => {
        if (hoverStartTime) {
            const hoverDuration = (Date.now() - hoverStartTime) / 1000;
            totalHoverTime += hoverDuration;
            hoverTimeEl.textContent = `Hover Time: ${Math.round(totalHoverTime)}s`;
        }
        el.classList.remove('animated');
    });
});

// Intersection Observer for in-view animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        } else {
            entry.target.style.opacity = '0.5';
            entry.target.style.transform = 'translateY(20px)';
        }
    });
}, { threshold: 0.5 });

textElements.forEach(el => {
    el.style.opacity = '0.5';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
});

// Simulate reading behavior: slow down animation based on hover time
setInterval(() => {
    textElements.forEach(el => {
        if (totalHoverTime > 10) { // If hovered more than 10s total
            el.classList.add('slow-read');
        } else {
            el.classList.remove('slow-read');
        }
    });
}, 1000);

// Dark mode toggle
const toggleDark = document.getElementById('toggle-dark');
const body = document.body;
toggleDark.addEventListener('click', () => {
    body.classList.toggle('dark');
    const icon = document.getElementById('toggle-dark-icon');
    icon.textContent = body.classList.contains('dark') ? 'light_mode' : 'dark_mode';
});