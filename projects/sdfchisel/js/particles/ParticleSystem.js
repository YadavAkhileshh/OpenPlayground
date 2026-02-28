/**
 * ParticleSystem.js – Top-level particle simulation orchestrator.
 * Coordinates ParticlePool, GradientDescent, CollisionSolver, and SpatialHash.
 */

const ParticleSystem = (() => {
    'use strict';

    const {
        ParticlePool, ParticleEmitter, GradientDescent,
        CollisionSolver, SpatialHash, ParticleState,
        Particle, Config, EventBus
    } = window.SDFChisel;

    let _particles = [];
    let _canvasW = 0;
    let _canvasH = 0;
    let _speed = Config.PARTICLE.CONVERGENCE_SPEED;
    let _radius = Config.PARTICLE.COLLISION_RADIUS;
    let _scatter = false;
    let _count = Config.PARTICLE.COUNT;

    /**
     * Initialize the system – preallocate pool and spatial hash.
     */
    function init(canvasW, canvasH, count, speed, radius) {
        _canvasW = canvasW;
        _canvasH = canvasH;
        _count = count;
        _speed = speed;
        _radius = radius;

        ParticlePool.preallocate(Config.PARTICLE.MAX_COUNT);
        _particles = ParticleEmitter.emit(count, canvasW, canvasH);
        SpatialHash.init(count, radius);
        ParticleState.reset();
    }

    /**
     * Update for one frame. Called by AnimationLoop.
     * @param {number} dt – delta time in seconds
     */
    function update(dt) {
        if (!_particles.length) return;

        // 1. Tick particle ages
        for (let i = 0; i < _particles.length; i++) {
            if (_particles[i].active) Particle.tick(_particles[i]);
        }

        // 2. Rebuild spatial hash
        SpatialHash.rebuild(_particles);

        // 3. Collision avoidance
        CollisionSolver.resolveAll(_particles, _radius, 0.4);

        // 4. Gradient descent step
        const result = GradientDescent.stepAll(
            _particles, dt, _speed, _canvasW, _canvasH, _scatter
        );

        // 5. Update state
        ParticleState.update(result, _particles);
    }

    function scatter() {
        GradientDescent.scatterAll(_particles, _canvasW, _canvasH);
        ParticleState.setScattering(true);
        setTimeout(() => ParticleState.setScattering(false), 2000);
    }

    function reset(canvasW, canvasH) {
        _canvasW = canvasW; _canvasH = canvasH;
        ParticleEmitter.scatter(_particles, canvasW, canvasH);
        ParticleState.reset();
    }

    function setCount(n, canvasW, canvasH) {
        _count = n;
        ParticlePool.setCount(n, canvasW, canvasH);
        SpatialHash.init(n, _radius);
    }

    function setSpeed(s) { _speed = s; }
    function setRadius(r) { _radius = r; SpatialHash.init(_particles.length, r); }
    function resize(w, h) { _canvasW = w; _canvasH = h; }
    function getParticles() { return _particles; }

    function getStats() {
        return {
            fps: ParticleState.getFPS(),
            converged: ParticleState.getConvergedPercent(),
            total: ParticleState.getTotal(),
            avgForce: ParticleState.getAvgForce(),
            avgGrad: ParticleState.getAvgSdf(),
        };
    }

    return {
        init, update, scatter, reset,
        setCount, setSpeed, setRadius, resize,
        getParticles, getStats,
    };
})();

window.SDFChisel = window.SDFChisel || {};
window.SDFChisel.ParticleSystem = ParticleSystem;
