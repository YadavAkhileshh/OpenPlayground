/**
 * Serializer Module.
 * Handles import/export of simulation state (grids) and parameters.
 * @module Utils/Serializer
 */

export class Serializer {
    /**
     * Export the full simulation state to a JSON string.
     * Note: We compress the Float32Arrays to base64 for size efficiency in JSON.
     * @param {SimulationEngine} simulation 
     */
    static exportState(simulation) {
        const state = {
            width: simulation.width,
            height: simulation.height,
            f: simulation.f,
            k: simulation.k,
            gridA: Serializer.float32ToBase64(simulation.gridA),
            gridB: Serializer.float32ToBase64(simulation.gridB)
        };

        return JSON.stringify(state);
    }

    /**
     * Import a state into the simulation.
     * @param {SimulationEngine} simulation 
     * @param {string} jsonString 
     */
    static importState(simulation, jsonString) {
        try {
            const state = JSON.parse(jsonString);

            if (state.width !== simulation.width || state.height !== simulation.height) {
                console.warn("Dimension mismatch on import. Resizing not supported in this version.");
                return false;
            }

            simulation.f = state.f;
            simulation.k = state.k;

            const arrA = Serializer.base64ToFloat32(state.gridA);
            const arrB = Serializer.base64ToFloat32(state.gridB);

            simulation.gridA.set(arrA);
            simulation.gridB.set(arrB);

            // Sync buffers
            simulation.nextA.set(arrA);
            simulation.nextB.set(arrB);

            return true;
        } catch (err) {
            console.error("Failed to import state:", err);
            return false;
        }
    }

    static float32ToBase64(float32Arr) {
        const uint8 = new Uint8Array(float32Arr.buffer);
        let binary = '';
        const len = uint8.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        return btoa(binary);
    }

    static base64ToFloat32(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return new Float32Array(bytes.buffer);
    }

    /**
     * Download state as a .json file.
     */
    static downloadState(simulation) {
        const json = Serializer.exportState(simulation);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'turing-state.json';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }
}
