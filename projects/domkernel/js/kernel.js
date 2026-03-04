/**
 * Kernel Entry Point
 * Initializes all subsystems
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Core Boot Controller
    window.BootApp = new BootManager();

    // 2. Start sequence
    setTimeout(() => {
        window.BootApp.start().catch(err => {
            Logger.error('KERNEL', `Fatal Boot Error: ${err.message}`);
            document.getElementById('boot-logs').innerHTML += `<br><span style="color:red">KERNEL PANIC: ${err.message}</span>`;
            document.getElementById('boot-progress').style.backgroundColor = 'red';
        });
    }, 500); // Small initial delay for aesthetic
});

// Polyfills or global error boundaries
window.addEventListener('error', (e) => {
    Logger.error('SYSTEM', `Uncaught JS Error: ${e.message}`);
});

window.addEventListener('unhandledrejection', (e) => {
    Logger.error('SYSTEM', `Unhandled Promise Rejection: ${e.reason}`);
});
