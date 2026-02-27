/**
 * Canvas - Viewport Interaction Controller
 * Handles panning and zooming of the art container.
 */

const Canvas = (() => {

    const viewport = document.getElementById('viewport');
    const container = document.getElementById('art-container');

    let isDragging = false;
    let startX, startY;
    let translateX = 0, translateY = 0;
    let scale = 1;

    /**
     * Initialize interaction events
     */
    const init = () => {
        if (!viewport || !container) return;

        // Mouse Events
        viewport.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', endDrag);

        // Scroll Zoom
        viewport.addEventListener('wheel', handleZoom, { passive: false });

        // Touch Events
        viewport.addEventListener('touchstart', handleTouchStart, { passive: false });
        viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
        viewport.addEventListener('touchend', endDrag);

        console.log("Canvas Interaction Initialized");
    };

    const startDrag = (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    };

    const drag = (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    };

    const endDrag = () => {
        isDragging = false;
    };

    const handleZoom = (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const zoomSpeed = 0.001;
        scale -= delta * zoomSpeed;
        scale = Math.max(0.1, Math.min(scale, 10));
        updateTransform();
    };

    const updateTransform = () => {
        container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    // Touch support placeholders
    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            startX = touch.clientX - translateX;
            startY = touch.clientY - translateY;
            isDragging = true;
        }
    };

    const handleTouchMove = (e) => {
        if (!isDragging || e.touches.length !== 1) return;
        e.preventDefault();
        const touch = e.touches[0];
        translateX = touch.clientX - startX;
        translateY = touch.clientY - startY;
        updateTransform();
    };

    /**
     * Reset viewport to default
     */
    const reset = () => {
        translateX = 0;
        translateY = 0;
        scale = 1;
        updateTransform();
    };

    return {
        init,
        reset
    };

})();

window.Canvas = Canvas;
