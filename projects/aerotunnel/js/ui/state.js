/**
 * @file state.js
 * @description Manages saving and loading of simulation states (Obstacles, Settings).
 */

export class StateManager {
    constructor(solver, controls) {
        this.solver = solver;
        this.controls = controls;
    }

    saveState() {
        const state = {
            width: this.solver.width,
            height: this.solver.height,
            obstacles: Array.from(this.solver.obstacles), // Convert TypedArray
            settings: {
                viscosity: this.solver.viscosity,
                speed: window.SIM_SPEED
            },
            timestamp: Date.now()
        };

        const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `aerotunnel_state_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        return state;
    }

    loadState(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const state = JSON.parse(e.target.result);
                this.restore(state);
            } catch (err) {
                console.error("Failed to load state", err);
                alert("Invalid save file.");
            }
        };
        reader.readAsText(file);
    }

    restore(state) {
        if (state.width !== this.solver.width || state.height !== this.solver.height) {
            alert("Grid dimensions do not match current simulation.");
            return;
        }

        // Restore Obstacles
        for (let i = 0; i < this.solver.size; i++) {
            this.solver.obstacles[i] = state.obstacles[i];
            // Clear velocity in obstacles
            if (state.obstacles[i]) {
                this.solver.ux[i] = 0;
                this.solver.uy[i] = 0;
            }
        }

        // Restore Settings
        if (state.settings) {
            this.solver.setViscosity(state.settings.viscosity);
            window.SIM_SPEED = state.settings.speed;

            // Update UI
            document.getElementById('input-viscosity').value = state.settings.viscosity;
            document.getElementById('val-viscosity').textContent = state.settings.viscosity.toFixed(3);
            document.getElementById('input-speed').value = state.settings.speed;
            document.getElementById('val-speed').textContent = state.settings.speed.toFixed(3);
        }
    }
}
