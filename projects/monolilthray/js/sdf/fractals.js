/**
 * @file fractals.js
 * @description Advanced recursive SDFs for mythological structures.
 */

const Fractals = {
    /**
     * Menger Sponge / Sierpinski Cross approximation.
     * @param {Vec3} p
     */
    crossMenger: (p) => {
        let d = SDF.box(p, new Vec3(1.0, 1.0, 1.0));
        let s = 1.0;

        for (let m = 0; m < 4; m++) {
            let a = MathUtils.mod(p.x * s, 2.0) - 1.0;
            let b = MathUtils.mod(p.y * s, 2.0) - 1.0;
            let c = MathUtils.mod(p.z * s, 2.0) - 1.0;

            s *= 3.0;

            let r = new Vec3(Math.abs(1.0 - 3.0 * Math.abs(a)), Math.abs(1.0 - 3.0 * Math.abs(b)), Math.abs(1.0 - 3.0 * Math.abs(c)));
            let da = Math.max(r.x, r.y);
            let db = Math.max(r.y, r.z);
            let dc = Math.max(r.z, r.x);

            let c2 = (Math.min(da, Math.min(db, dc)) - 1.0) / s;
            d = Math.max(d, c2);
        }
        return d;
    },

    /**
     * Infinite sphere grid.
     */
    infiniteSpheres: (p) => {
        const c = new Vec3(4, 4, 4);
        const q = Ops.repeat(p, c);
        return SDF.sphere(q, 1.0);
    },

    /**
     * Mandelbulb Power 8 approximation.
     * Expensive, use with caution.
     */
    mandelbulb: (p) => {
        const Power = 8.0;
        let z = p.clone();
        let dr = 1.0;
        let r = 0.0;

        for (let i = 0; i < 4; i++) {
            r = z.length();
            if (r > 2.0) break;

            // Convert to polar coordinates
            let theta = Math.acos(z.z / r);
            let phi = Math.atan2(z.y, z.x);

            dr = Math.pow(r, Power - 1.0) * Power * dr + 1.0;

            // Scale and rotate the point
            let zr = Math.pow(r, Power);
            theta = theta * Power;
            phi = phi * Power;

            // Convert back to cartesian coordinates
            z = new Vec3(
                Math.sin(theta) * Math.cos(phi),
                Math.sin(phi) * Math.sin(theta),
                Math.cos(theta)
            ).mul(zr).add(p);
        }
        return 0.5 * Math.log(r) * r / dr;
    }
};

if (typeof self !== 'undefined') self.Fractals = Fractals;
