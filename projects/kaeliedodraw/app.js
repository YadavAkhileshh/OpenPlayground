let kaleidoCanvas;
let uiController;

function initApp() {
    const canvasElement = document.getElementById('drawingCanvas');
    
    if (!canvasElement) {
        console.error('Canvas element not found');
        return;
    }
    
    kaleidoCanvas = new KaleidoCanvas(canvasElement);
    uiController = new UIController(kaleidoCanvas);
    
    console.log('KaleidoDraw initialized successfully');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
