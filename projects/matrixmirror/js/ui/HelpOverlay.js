/**
 * @file HelpOverlay.js
 * @description Renders a terminal-style manual and credits screen.
 */

export class HelpOverlay {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'help-overlay hidden';
        this.container.innerHTML = \`
            <div class="terminal-window">
                <div class="terminal-bar">
                    <span>MANUAL.TXT</span>
                    <button class="close-btn">[X]</button>
                </div>
                <div class="terminal-content">
                    <h1>MATRIX MIRROR OPERATION MANUAL</h1>
                    <p>VERSION 1.0.0</p>
                    <hr>
                    
                    <h2>// CONTROLS</h2>
                    <ul>
                        <li>[H] - Toggle Control Panel</li>
                        <li>[D] - Toggle Debug Monitor</li>
                        <li>[?] - Toggle This Manual</li>
                        <li>[S] - Take Snapshot</li>
                    </ul>

                    <h2>// PARAMETERS</h2>
                    <dl>
                        <dt>DENSITY</dt>
                        <dd>Adjusts the grid size. Lower values = higher resolution, more CPU usage.</dd>
                        
                        <dt>FADE</dt>
                        <dd>Controls phosphor persistence. Higher values create longer trails.</dd>
                        
                        <dt>DIGITAL RAIN</dt>
                        <dd>Toggles the atmospheric background simulation.</dd>
                    </dl>

                    <h2>// SYSTEM ARCHITECTURE</h2>
                    <p>
                        Processing: Real-time Canvas 2D<br>
                        Input: getUserMedia Stream<br>
                        Engine: Custom ASCII Mapper
                    </p>
                    
                    <div class="credits">
                        <p>BUILT WITH VANILLA JS</p>
                        <p>NO LIBRARIES | NO FRAMEWORKS</p>
                    </div>
                </div>
            </div>
        \`;
        
        document.getElementById('ui-layer').appendChild(this.container);
        
        // Events
        this.container.querySelector('.close-btn').onclick = () => this.toggle();
        window.addEventListener('keydown', (e) => {
            if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
                this.toggle();
            }
        });
    }

    toggle() {
        this.container.classList.toggle('hidden');
    }
}
