/**
 * Components.js
 * 
 * Helper factories for creating components.
 * Returns plain objects to be attached to entities.
 */

export const Components = {
    Physics: () => ({
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        friction: 0.9,
        drag: 0.0,
        mass: 1
    }),

    Render: (color = '#fff', shape = 'circle', layer = 'main') => ({
        color,
        shape,
        layer,
        effect: null,
        visible: true
    }),

    Health: (max = 100) => ({
        current: max,
        max: max
    }),

    Combat: (damage = 10) => ({
        damage,
        attackCooldown: 0,
        isAttacking: false,
        invulnerable: false
    }),

    AI: (type = 'chase') => ({
        type, // chase, patrol, flee
        targetId: null,
        state: 'IDLE',
        detectionRadius: 200,
        attackRange: 50,
        timer: 0
    }),

    Lifetime: (frames) => ({
        frames
    })
};
