/**
 * Boot Sequence Module
 * 
 * Simulates a retro computer boot-up sequence.
 * - Displays scrolling text logs.
 * - Simulates hardware checks.
 * - Transitions to main UI.
 */

export class BootSequence {
    constructor(uiManager, onComplete) {
        this.uiManager = uiManager;
        this.onComplete = onComplete;
        this.logs = [
            "BIOS DATE 01/01/85 14:22:52 VER 1.02",
            "CPU: NEC V20, SPEED: 8 MHz",
            "640K RAM SYSTEM... OK",
            "VIDEO ADAPTER... INITIALIZED",
            "LOADING KERNEL...",
            "MOUNTING FILE SYSTEM...",
            "CHECKING PERIPHERALS...",
            "  - KEYBOARD... DETECTED",
            "  - MOUSE... DETECTED",
            "  - CAMERA... SEARCHING...",
            "LOADING ATKINSON.SYS...",
            "EXEC MAIN.EXE"
        ];
    }

    start() {
        const overlay = document.createElement('div');
        overlay.id = 'boot-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = '#000';
        overlay.style.zIndex = '9999';
        overlay.style.color = '#ffb703'; // Amber
        overlay.style.fontFamily = "'VT323', monospace";
        overlay.style.fontSize = '1.5rem';
        overlay.style.padding = '40px';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'flex-start';
        overlay.style.overflow = 'hidden';

        document.body.appendChild(overlay);

        let index = 0;

        const interval = setInterval(() => {
            if (index >= this.logs.length) {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.style.transition = 'opacity 1s ease';
                    overlay.style.opacity = '0';
                    setTimeout(() => {
                        overlay.remove();
                        if (this.onComplete) this.onComplete();
                    }, 1000);
                }, 500);
                return;
            }

            const p = document.createElement('div');
            p.textContent = this.logs[index];
            overlay.appendChild(p);

            // Random beep sound? (Requires user interaction usually, so maybe skip)

            index++;

            // Randomize delay for next line?
            // SetInterval is fixed. For random, we'd use recursive setTimeout.
            // This is good enough.
        }, 150);
    }
}
