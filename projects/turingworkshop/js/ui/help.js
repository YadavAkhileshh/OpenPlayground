/**
 * Help and Tutorial System.
 * Provides interactive guidance and explanation of the simulation.
 * @module UI/Help
 */

export const HELP_CONTENT = {
    intro: {
        title: "Welcome to TuringWorkshop",
        body: `
            <p>This is a real-time simulation of the <strong>Gray-Scott Reaction-Diffusion</strong> model.</p>
            <p>It demonstrates how complex, organic-looking patterns can emerge from simple chemical rules.</p>
            <p>Two virtual chemicals, <em>A</em> and <em>B</em>, diffuse through a grid and react with each other.</p>
            <ul>
                <li><strong>Feed (f):</strong> The rate at which chemical A is added to the system.</li>
                <li><strong>Kill (k):</strong> The rate at which chemical B is removed from the system.</li>
            </ul>
        `
    },
    controls: {
        title: "Controls Guide",
        body: `
            <p><strong>Feed & Kill Sliders:</strong> Adjust these to change the fundamental rules of the universe. Small changes can have drastic effects!</p>
            <p><strong>Brush:</strong> Click and drag on the canvas to add different amounts of chemical B. This "seeds" the reaction.</p>
            <p><strong>Presets:</strong> Use the dropdown to jump to known interesting configurations like "Solitons" or "Worms".</p>
            <p><strong>Play/Pause:</strong> Stop time to inspect a pattern or paint without it evolving.</p>
        `
    },
    science: {
        title: "The Science Behind It",
        body: `
            <p>The model simulates two substances, U and V (or A and B), which diffuse at different rates.</p>
            <p>The equations are:</p>
            <code>
            ∂A/∂t = D_A ∇²A - AB² + f(1-A)<br>
            ∂B/∂t = D_B ∇²B + AB² - (k+f)B
            </code>
            <p>The term <em>AB²</em> represents the reaction where two particles of B convert a particle of A into more B (autocatalysis).</p>
        `
    }
};

export class HelpSystem {
    constructor() {
        this.isVisible = false;
        this.currentSection = 'intro';
        this.createOverlay();
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'help-overlay hidden';

        this.contentBox = document.createElement('div');
        this.contentBox.className = 'help-content';

        this.closeBtn = document.createElement('button');
        this.closeBtn.className = 'help-close';
        this.closeBtn.innerHTML = '&times;';
        this.closeBtn.onclick = () => this.hide();

        this.titleEl = document.createElement('h2');
        this.bodyEl = document.createElement('div');

        this.nav = document.createElement('div');
        this.nav.className = 'help-nav';

        Object.keys(HELP_CONTENT).forEach(key => {
            const btn = document.createElement('button');
            btn.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            btn.onclick = () => this.showSection(key);
            this.nav.appendChild(btn);
        });

        this.contentBox.appendChild(this.closeBtn);
        this.contentBox.appendChild(this.titleEl);
        this.contentBox.appendChild(this.bodyEl);
        this.contentBox.appendChild(this.nav);
        this.overlay.appendChild(this.contentBox);

        document.body.appendChild(this.overlay);
    }

    show() {
        this.isVisible = true;
        this.overlay.classList.remove('hidden');
        this.showSection(this.currentSection);
    }

    hide() {
        this.isVisible = false;
        this.overlay.classList.add('hidden');
    }

    toggle() {
        if (this.isVisible) this.hide();
        else this.show();
    }

    showSection(key) {
        this.currentSection = key;
        const content = HELP_CONTENT[key];
        this.titleEl.textContent = content.title;
        this.bodyEl.innerHTML = content.body;

        // Update nav active state
        Array.from(this.nav.children).forEach(btn => {
            if (btn.textContent.toLowerCase().includes(key)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}
