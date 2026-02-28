/**
 * Modal.js
 * Handles the display of the information overlay.
 */

export class Modal {
    constructor() {
        this.createDOM();
        this.isOpen = false;
        this.initTrigger();
    }

    createDOM() {
        // Create the modal container
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay';
        this.overlay.style.display = 'none';

        this.content = document.createElement('div');
        this.content.className = 'modal-content glass-panel';

        this.content.innerHTML = `
            <h2>Strange Attractors & Chaos</h2>
            <p>
                A strange attractor is a mathematical system that exhibits chaotic behavior. 
                Even though the system is deterministic (calculable), small differences in starting conditions 
                lead to vastly different outcomes over time — the "Butterfly Effect".
            </p>
            <h3>Controls</h3>
            <ul>
                <li><strong>Rotate:</strong> Left Click + Drag</li>
                <li><strong>Zoom:</strong> Mouse Wheel</li>
                <li><strong>Parameters:</strong> Adjust sliders to morph the attractor shape.</li>
                <li><strong>Themes:</strong> Toggle different visual styles.</li>
            </ul>
            <h3>The Math</h3>
            <p>
                We use the Runge-Kutta 4th Order (RK4) method to solve the differential equations 
                defined by each attractor system (Lorenz, Aizawa, etc.) with a timestep of 0.01.
            </p>
            <button id="close-modal" class="btn primary">Close</button>
        `;

        this.overlay.appendChild(this.content);
        document.body.appendChild(this.overlay);

        document.getElementById('close-modal').addEventListener('click', () => this.close());
    }

    initTrigger() {
        // Create a help button in the UI
        const btn = document.createElement('button');
        btn.innerText = '?';
        btn.className = 'icon-btn help-trigger';
        btn.style.position = 'absolute';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.fontSize = '1.5rem';
        btn.style.opacity = '0.5';

        btn.addEventListener('click', () => this.open());
        document.body.appendChild(btn);
    }

    open() {
        this.overlay.style.display = 'flex';
        // Add fade in animation class if desired
        setTimeout(() => this.overlay.classList.add('visible'), 10);
    }

    close() {
        this.overlay.classList.remove('visible');
        setTimeout(() => {
            this.overlay.style.display = 'none';
        }, 300);
    }
}
