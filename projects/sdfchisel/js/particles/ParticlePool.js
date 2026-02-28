/**
 * ParticlePool.js – Pool allocator for Particle objects.
 * Pre-allocates MAX_COUNT particles to avoid GC during the simulation.
 */

const ParticlePool = (() => {
    'use strict';

    const { Particle, MathUtils, Config } = window.SDFChisel;

    let _pool = [];
    let _active = 0;
    let _maxN = 0;

    /**
     * Pre-allocate up to maxN particle slots.
     */
    function preallocate(maxN) {
        _maxN = maxN;
        _pool = new Array(maxN);
        for (let i = 0; i < maxN; i++) {
            _pool[i] = Particle.create(0, 0);
            _pool[i].active = false;
        }
        _active = 0;
    }

    /**
     * Activate n particles, scattered randomly across the canvas.
     */
    function spawn(n, canvasW, canvasH) {
        const count = Math.min(n, _maxN);
        _active = count;
        const cx = canvasW / 2, cy = canvasH / 2;
        const r = Math.min(canvasW, canvasH) * Config.PARTICLE.SCATTER_RADIUS;
        for (let i = 0; i < _maxN; i++) {
            if (i < count) {
                const pos = MathUtils.randomInCircle(r);
                Particle.reset(_pool[i], cx + pos.x, cy + pos.y);
            } else {
                _pool[i].active = false;
            }
        }
        return _pool;
    }

    /**
     * Set the active count, deactivating/activating as needed.
     */
    function setCount(n, canvasW, canvasH) {
        if (n > _maxN) n = _maxN;
        const old = _active;
        _active = n;
        const cx = canvasW / 2, cy = canvasH / 2;
        const r = Math.min(canvasW, canvasH) * Config.PARTICLE.SCATTER_RADIUS;
        for (let i = old; i < n; i++) {
            const pos = MathUtils.randomInCircle(r);
            Particle.reset(_pool[i], cx + pos.x, cy + pos.y);
        }
        for (let i = n; i < old; i++) _pool[i].active = false;
    }

    function getPool() { return _pool; }
    function getActive() { return _active; }
    function getMax() { return _maxN; }

    function reset(canvasW, canvasH) {
        spawn(_active, canvasW, canvasH);
    }

    return { preallocate, spawn, setCount, getPool, getActive, getMax, reset };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.ParticlePool = ParticlePool;
