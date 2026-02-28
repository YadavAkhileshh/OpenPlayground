/**
 * js/math/BlochMath.js
 * Conversions from Complex State Vector probabilities to
 * 3D spherical coordinates (Theta, Phi) for rendering the Bloch Sphere.
 * 
 * |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
 * 
 * Note: The Bloch sphere can ONLY perfectly represent single unentangled qubits.
 * In a multi-qubit system, we calculate the "Reduced Density Matrix" representation
 * to project entangled states as mixed states inside the sphere, 
 * however for simplicity in this simulator, we will compute pure probabilities 
 * relative to the targeted qubit by tracing out the rest.
 */

class BlochMath {
    /**
     * Converts a generic target qubit's state out of a 2^N system into [theta, phi]
     * WARNING: Extremely high level math approximation.
     * We map the probability of measuring 0 vs 1 on this specific qubit to Theta.
     * We estimate Phi based on phase differences of the largest amplitudes.
     * 
     * @param {Vector} systemState Global State Vector
     * @param {number} totalQubits N
     * @param {number} targetQubit Wire index
     * @returns {Object} { theta: Number, phi: Number, purity: Number }
     * Theta: 0 = |0> (top pole), Math.PI = |1> (bottom pole)
     * Phi: 0 = +X axis, Math.PI/2 = +Y axis.
     */
    static calculateCoordinates(systemState, totalQubits, targetQubit) {
        const numStates = systemState.size();
        let prob0 = 0;
        let prob1 = 0;

        let largestAmp0 = window.Complex.ZERO.clone();
        let largestAmp1 = window.Complex.ZERO.clone();

        // 1. Partial Trace simulation
        // Iterate over all state basis (e.g. 0000, 0001, 0010...)
        for (let i = 0; i < numStates; i++) {
            // Check the bit representing our target qubit
            // The bit index from left (as displayed in standard Qiskit format)
            // Leftmost wire is qubit 0 (MSB).

            // To find if qubit T is 1 in basis `i`:
            // We shift right by (totalQubits - 1 - targetQubit) and check lowest bit
            let shiftAmount = totalQubits - 1 - targetQubit;
            let bitValue = (i >> shiftAmount) & 1;

            let amp = systemState.get(i);
            let magSq = amp.magSquared();

            if (bitValue === 0) {
                prob0 += magSq;
                // Tracking the dominating phase for visual approximation
                if (magSq > largestAmp0.magSquared()) {
                    largestAmp0 = amp.clone();
                }
            } else {
                prob1 += magSq;
                if (magSq > largestAmp1.magSquared()) {
                    largestAmp1 = amp.clone();
                }
            }
        }

        // Safety bounds
        prob0 = window.MathUtils.clamp(prob0, 0.0, 1.0);
        prob1 = window.MathUtils.clamp(prob1, 0.0, 1.0);

        // 2. Calculate Theta (Latitude)
        // |ψ⟩ = cos(θ/2)|0⟩ + ...
        // Pr(0) = cos^2(θ/2)
        // cos(θ/2) = sqrt(Pr(0))
        // θ/2 = acos(sqrt(Pr(0)))
        // θ = 2 * acos(sqrt(Pr(0)))
        let theta = 2 * Math.acos(Math.sqrt(prob0));

        if (isNaN(theta)) theta = 0;

        // 3. Calculate Phi (Longitude)
        // Phase difference between the largest representative |1> and |0> bases
        // e^(iφ) = amp1 / amp0 / |amp1/amp0|
        let phi = 0;

        // If entirely |0> or |1>, phase is undefined / visual doesn't matter, default to 0
        if (prob0 > 0.001 && prob1 > 0.001) {
            // Phase of |1> component minus phase of |0> component
            let phase0 = largestAmp0.phase();
            let phase1 = largestAmp1.phase();
            phi = phase1 - phase0;

            // Wrap to -PI .. PI
            while (phi <= -Math.PI) phi += 2 * Math.PI;
            while (phi > Math.PI) phi -= 2 * Math.PI;
        }

        // 4. Calculate Purity (Radius)
        // For a perfectly pure unentangled state, radius is 1.0 (surface of sphere).
        // If entangled, it becomes a mixed state for the single qubit, radius < 1.0 (inside sphere).
        // We calculate Purity (Tr(p^2)) of the reduced density matrix.
        // Approx: r^2 = (2*Purity) - 1 => Purity = Pr(0)^2 + Pr(1)^2 in diagonal dominant bases
        let purityApprox = (prob0 * prob0) + (prob1 * prob1);
        // Real purity requires full RDM trace, this is simplified for performance
        let radiusLength = Math.sqrt(Math.max(0, 2 * purityApprox - 1));
        radiusLength = window.MathUtils.clamp(radiusLength, 0.0, 1.0);

        // Clean float drift
        theta = window.MathUtils.roundToZero(theta);
        phi = window.MathUtils.roundToZero(phi);

        return { theta, phi, radius: radiusLength };
    }
}

window.BlochMath = BlochMath;
