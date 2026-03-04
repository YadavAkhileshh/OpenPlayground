/**
 * @file physics.js
 * @description The high-performance calculation engine for WindowPong.
 * It translates logical game coordinates into physical screen coordinates.
 * 
 * COORDINATE MAPPING:
 * The game treats the entire desktop as a Cartesian plane where (0,0)
 * is the top-left corner of the primary screen.
 * 
 * COLLISION GEOMETRY:
 * Uses Axis-Aligned Bounding Box (AABB) intersection tests.
 * Ball: 100x100 square
 * Paddle: User-defined outerWidth/Height window bounds
 */

const PongPhysics = (function () {
    /** 
     * Internal Ball Physics State 
     * ----------------------------------------------------------------------
     */
    let ball = {
        x: 0,
        y: 0,
        vx: 5,
        vy: 5,
        size: 100,
        baseSpeed: 7,
        speedInc: 1.08, // 8% speed increase per hit
        maxSpeed: 25,
        screenW: window.screen.availWidth,
        screenH: window.screen.availHeight
    };

    /**
     * Paddle Tracking Data Store
     * Side '1' is Player 1 (Left), Side '2' is Player 2 (Right)
     */
    let paddles = {
        '1': { x: -1000, y: -1000, w: 0, h: 0 },
        '2': { x: -1000, y: -1000, w: 0, h: 0 }
    };

    /**
     * Private Math Utilities
     * ----------------------------------------------------------------------
     */

    /**
     * Core AABB Intersection Test
     * Checks if two rectangles overlap in 2D space.
     * @param {object} r1 - Rectangle 1 {x, y, w, h}
     * @param {object} r2 - Rectangle 2 {x, y, w, h}
     * @returns {boolean}
     */
    function intersects(r1, r2) {
        return r1.x < r2.x + r2.w &&
            r1.x + r1.w > r2.x &&
            r1.y < r2.y + r2.h &&
            r1.y + r1.h > r2.y;
    }

    return {
        /**
         * Updates the physical ball position and handles screen-edge bounces.
         * @returns {object} The new screen-space {x, y} coordinates.
         */
        updateBall: function () {
            // Update velocity vectors
            ball.x += ball.vx;
            ball.y += ball.vy;

            /**
             * VERTICAL BOUNCE LOGIC
             * Ensures the ball stays within the usable screen height (taskbar aware).
             */
            if (ball.y <= 0) {
                ball.y = 0;
                ball.vy = Math.abs(ball.vy); // Reflect downward
            } else if (ball.y + ball.size >= ball.screenH) {
                ball.y = ball.screenH - ball.size;
                ball.vy = -Math.abs(ball.vy); // Reflect upward
            }

            return { x: ball.x, y: ball.y };
        },

        /**
         * Scans for collisions between the ball and paddles.
         * Also checks for scoring conditions.
         * @returns {string|null} The result of the collision check.
         */
        checkCollisions: function () {
            const ballRect = {
                x: ball.x,
                y: ball.y,
                w: ball.size,
                h: ball.size
            };

            // Player 1 (Left) Intersection
            const p1 = paddles['1'];
            if (intersects(ballRect, p1)) {
                // Ball must be moving towards the paddle to trigger bounce
                if (ball.vx < 0) {
                    ball.vx = Math.min(Math.abs(ball.vx) * ball.speedInc, ball.maxSpeed);

                    /**
                     * Directional Reflection
                     * Add a bit of vertical variance based on where the ball hit the paddle.
                     */
                    const hitCenter = (ball.y + ball.size / 2) - (p1.y + p1.h / 2);
                    ball.vy += (hitCenter / p1.h) * 10;

                    return 'HIT_P1';
                }
            }

            // Player 2 (Right) Intersection
            const p2 = paddles['2'];
            if (intersects(ballRect, p2)) {
                // Ball must be moving towards the paddle to trigger bounce
                if (ball.vx > 0) {
                    ball.vx = -Math.min(Math.abs(ball.vx) * ball.speedInc, ball.maxSpeed);

                    const hitCenter = (ball.y + ball.size / 2) - (p2.y + p2.h / 2);
                    ball.vy += (hitCenter / p2.h) * 10;

                    return 'HIT_P2';
                }
            }

            /**
             * SCORING LOGIC
             * If the ball goes beyond the screen width boundaries.
             */
            if (ball.x <= -ball.size * 1.5) {
                return 'SCORE_P2';
            }
            if (ball.x >= ball.screenW + ball.size * 0.5) {
                return 'SCORE_P1';
            }

            return null;
        },

        /**
         * Updates the internal paddle position cache.
         * @param {string} side - '1' or '2'
         * @param {object} bounds - {x, y, w, h}
         */
        updatePaddle: function (side, bounds) {
            if (paddles[side]) {
                paddles[side] = bounds;
            }
        },

        /**
         * Reinitializes the ball at the center of the screen with a random direction.
         */
        resetBall: function () {
            // Reset to screen center
            ball.x = (ball.screenW / 2) - (ball.size / 2);
            ball.y = (ball.screenH / 2) - (ball.size / 2);

            // Randomize starting velocity
            const dirX = Math.random() > 0.5 ? 1 : -1;
            const dirY = (Math.random() - 0.5) * 2;

            ball.vx = dirX * ball.baseSpeed;
            ball.vy = dirY * ball.baseSpeed;

            console.log("[Physics] Ball reset to:", ball.x, ball.y);
        },

        /**
         * Returns the current state of the ball.
         */
        getBallPos: () => ({ x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy })
    };
})();
