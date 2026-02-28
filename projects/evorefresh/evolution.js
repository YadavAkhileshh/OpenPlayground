// ============================================
// EVOLUTION.JS - Evolution System Manager
// ============================================

class EvolutionSystem {
    constructor() {
        this.currentGeneration = 1;
        this.maxGeneration = 10;
        this.changeLog = [];
        this.init();
    }

    init() {
        // Load saved generation from localStorage
        const saved = localStorage.getItem('evo-generation');
        if (saved) {
            this.currentGeneration = Math.min(parseInt(saved), this.maxGeneration);
        }

        // On page load, increment generation (unless it's the first visit)
        if (saved) {
            this.evolve();
        } else {
            // First visit - start at generation 1
            this.applyGeneration(1);
            this.saveGeneration();
        }
    }

    evolve() {
        if (this.currentGeneration < this.maxGeneration) {
            this.currentGeneration++;
        }
        this.applyGeneration(this.currentGeneration);
        this.saveGeneration();
    }

    applyGeneration(gen) {
        // Apply the generation class to body
        document.body.className = `gen-${gen}`;
        
        // Determine what changed
        this.changeLog = this.getChangesForGeneration(gen);
    }

    saveGeneration() {
        localStorage.setItem('evo-generation', this.currentGeneration);
    }

    reset() {
        this.currentGeneration = 1;
        localStorage.removeItem('evo-generation');
        this.applyGeneration(1);
        this.saveGeneration();
    }

    getChangesForGeneration(gen) {
        const changes = {
            1: {
                stage: 'Generation 1 - Base (Very Bad UI)',
                improvements: [
                    '⚠️ Baseline established',
                    '• Flat grey background',
                    '• Old, dull appearance',
                    '• Poor spacing and alignment',
                    '• Default system font',
                    '• Hard edges, no effects'
                ]
            },
            2: {
                stage: 'Generation 2 - Background Improvement',
                improvements: [
                    '✓ Background colors refined',
                    '• Less dull grey tones',
                    '• Better contrast with content',
                    '• Cleaner environment',
                    '• Foundation for future improvements'
                ]
            },
            3: {
                stage: 'Generation 3 - Component Alignment & Shape',
                improvements: [
                    '✓ Component alignment improved',
                    '• Consistent padding across cards',
                    '• Border-radius introduced (4px)',
                    '• Centered hero section',
                    '• Better visual balance'
                ]
            },
            4: {
                stage: 'Generation 4 - Component Refinement',
                improvements: [
                    '✓ Component proportions enhanced',
                    '• Cleaner edges on all elements',
                    '• Improved spacing inside cards',
                    '• Better button sizing',
                    '• UI feels more stable'
                ]
            },
            5: {
                stage: 'Generation 5 - Font & Typography Upgrade',
                improvements: [
                    '✓ Modern typography system applied',
                    '• Segoe UI font family',
                    '• Clear hierarchy (titles → text)',
                    '• Improved line height',
                    '• Better letter spacing',
                    '• Enhanced readability'
                ]
            },
            6: {
                stage: 'Generation 6 - Layout & Color Palette Evolution',
                improvements: [
                    '✓ MAJOR TRANSFORMATION',
                    '• Modern color palette introduced',
                    '• Accent color (#5a7fd6) added',
                    '• Gradient backgrounds applied',
                    '• Layout spacing optimized',
                    '• Professional color harmony',
                    '• White sections for clarity'
                ]
            },
            7: {
                stage: 'Generation 7 - Glassmorphism Introduction',
                improvements: [
                    '✓ Premium glass effects added',
                    '• Semi-transparent cards',
                    '• Backdrop blur (10px)',
                    '• Soft shadows for depth',
                    '• Layered visual hierarchy',
                    '• UI feels premium'
                ]
            },
            8: {
                stage: 'Generation 8 - Glow & Hover Interactions',
                improvements: [
                    '✓ Interactive UI established',
                    '• Soft glow on buttons',
                    '• Smooth hover transitions',
                    '• Cards lift on hover',
                    '• Icon scale animations',
                    '• UI feels responsive and alive'
                ]
            },
            9: {
                stage: 'Generation 9 - Layout Cleanup & Polish',
                improvements: [
                    '✓ Professional refinement applied',
                    '• Increased whitespace',
                    '• Perfect alignment achieved',
                    '• Visual clutter removed',
                    '• Content width optimized',
                    '• UI feels calm and confident'
                ]
            },
            10: {
                stage: 'Generation 10 - Animated Text & Living UI',
                improvements: [
                    '🎉 LIVING UI ACTIVATED',
                    '✓ Glowing text on hero title',
                    '✓ Animated section title emphasis',
                    '✓ Floating card animations',
                    '✓ Icon glow effects',
                    '✓ Button pulse glow',
                    '✓ Staggered journey stage entrance',
                    '✓ Navbar shimmer effect',
                    '✓ Panel breathing animation',
                    '✓ Smooth background gradient flow',
                    '',
                    '🌟 UI FEELS ALIVE & CONTROLLED'
                ]
            }
        };

        // If generation exceeds defined changes, show final state
        if (gen > 10) {
            return changes[10];
        }

        return changes[gen] || changes[1];
    }

    getCurrentGeneration() {
        return this.currentGeneration;
    }

    getChangeLog() {
        return this.changeLog;
    }
}

// Initialize the evolution system
const evolutionSystem = new EvolutionSystem();

// Export for use in ui.js
window.evolutionSystem = evolutionSystem;
