/* ============================================
   THE SPIDER - SPIDER & LEG CLASSES
   Main spider entity and leg controllers
   ============================================ */

/**
 * Leg - Individual spider leg with IK control
 */
class Leg {
    constructor(spider, index, baseAngle) {
        this.spider = spider;
        this.index = index;
        this.baseAngle = baseAngle; // Angle from body center

        // Leg segments
        this.femurLength = 35; // Upper leg segment
        this.tibiaLength = 35; // Lower leg segment

        // Positions
        this.shoulderPos = { x: 0, y: 0 }; // Attachment point on body
        this.currentPos = { x: 0, y: 0 }; // Current foot position
        this.targetPos = { x: 0, y: 0 }; // Target foot position
        this.elbowPos = { x: 0, y: 0 }; // Elbow/knee position

        // IK angles
        this.angle1 = 0;
        this.angle2 = 0;

        // Animation state
        this.isLifted = false;
        this.liftProgress = 0; // 0 to 1
        this.stepHeight = 25;

        // Gait group (for alternating movement)
        this.group = index % 2; // 0 or 1

        // Step timing
        this.stepDuration = 0.3; // seconds
        this.stepTimer = 0;

        // Initialize positions
        this.updateShoulderPosition();
        this.calculateIdealFootPosition();
        this.currentPos = { ...this.targetPos };
    }

    /**
     * Update shoulder position based on body rotation
     */
    updateShoulderPosition() {
        const bodyRadius = this.spider.bodyRadius;
        const shoulderOffset = bodyRadius * 0.7;

        const angle = this.spider.rotation + this.baseAngle;
        this.shoulderPos.x = this.spider.x + Math.cos(angle) * shoulderOffset;
        this.shoulderPos.y = this.spider.y + Math.sin(angle) * shoulderOffset;
    }

    /**
     * Calculate ideal foot position when grounded
     */
    calculateIdealFootPosition() {
        const legReach = (this.femurLength + this.tibiaLength) * 0.8;
        const angle = this.spider.rotation + this.baseAngle;

        // Offset slightly forward in direction of movement
        const forwardOffset = this.spider.isMoving ? 15 : 0;
        const forwardAngle = this.spider.rotation;

        this.targetPos.x = this.shoulderPos.x +
            Math.cos(angle) * legReach +
            Math.cos(forwardAngle) * forwardOffset;
        this.targetPos.y = this.shoulderPos.y +
            Math.sin(angle) * legReach +
            Math.sin(forwardAngle) * forwardOffset;
    }

    /**
     * Check if leg needs to step
     */
    needsStep() {
        if (this.isLifted) return false;

        // Check distance from current to ideal position
        const dx = this.currentPos.x - this.targetPos.x;
        const dy = this.currentPos.y - this.targetPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Step if too far from ideal position
        const stepThreshold = 30;
        return distance > stepThreshold;
    }

    /**
     * Start stepping motion
     */
    startStep() {
        if (this.isLifted) return;

        this.isLifted = true;
        this.stepTimer = 0;
        this.calculateIdealFootPosition();
    }

    /**
     * Update leg state
     */
    update(deltaTime) {
        this.updateShoulderPosition();

        if (this.isLifted) {
            // Animate step
            this.stepTimer += deltaTime;
            this.liftProgress = Math.min(this.stepTimer / this.stepDuration, 1);

            // Use smooth easing
            const t = Easing.easeInOutCubic(this.liftProgress);

            // Interpolate position
            const startX = this.currentPos.x;
            const startY = this.currentPos.y;

            this.currentPos.x = MathUtils.lerp(startX, this.targetPos.x, t);
            this.currentPos.y = MathUtils.lerp(startY, this.targetPos.y, t);

            // Add arc to step (lift foot up)
            const arcHeight = Math.sin(this.liftProgress * Math.PI) * this.stepHeight;
            this.currentPos.y -= arcHeight;

            // Complete step
            if (this.liftProgress >= 1) {
                this.isLifted = false;
                this.liftProgress = 0;
                this.currentPos.x = this.targetPos.x;
                this.currentPos.y = this.targetPos.y;
            }
        } else {
            // Gradually adjust position when grounded
            this.calculateIdealFootPosition();

            const dx = this.targetPos.x - this.currentPos.x;
            const dy = this.targetPos.y - this.currentPos.y;

            // Smooth follow
            this.currentPos.x += dx * 0.1;
            this.currentPos.y += dy * 0.1;
        }

        // Solve IK
        this.solveIK();
    }

    /**
     * Solve inverse kinematics for leg
     */
    solveIK() {
        const result = IKSolver.solve(
            this.currentPos,
            this.shoulderPos,
            this.femurLength,
            this.tibiaLength
        );

        this.angle1 = result.angle1;
        this.angle2 = result.angle2;
        this.elbowPos = result.elbow;
    }

    /**
     * Render leg
     */
    render(ctx) {
        // Leg styling
        const legWidth = 3;
        const jointRadius = 4;

        // Draw femur (shoulder to elbow)
        ctx.strokeStyle = '#16213e';
        ctx.lineWidth = legWidth;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(this.shoulderPos.x, this.shoulderPos.y);
        ctx.lineTo(this.elbowPos.x, this.elbowPos.y);
        ctx.stroke();

        // Draw tibia (elbow to foot)
        ctx.beginPath();
        ctx.moveTo(this.elbowPos.x, this.elbowPos.y);
        ctx.lineTo(this.currentPos.x, this.currentPos.y);
        ctx.stroke();

        // Draw joints
        ctx.fillStyle = '#0f3460';

        // Shoulder joint
        ctx.beginPath();
        ctx.arc(this.shoulderPos.x, this.shoulderPos.y, jointRadius, 0, Math.PI * 2);
        ctx.fill();

        // Elbow joint
        ctx.beginPath();
        ctx.arc(this.elbowPos.x, this.elbowPos.y, jointRadius, 0, Math.PI * 2);
        ctx.fill();

        // Foot
        ctx.fillStyle = this.isLifted ? '#00d4ff' : '#0f3460';
        ctx.beginPath();
        ctx.arc(this.currentPos.x, this.currentPos.y, jointRadius * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect when lifted
        if (this.isLifted) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00d4ff';
            ctx.beginPath();
            ctx.arc(this.currentPos.x, this.currentPos.y, jointRadius * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

/**
 * Spider - Main spider entity with 8 legs
 */
class Spider {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.targetRotation = 0;

        // Body properties
        this.bodyRadius = 30;
        this.bodyColor = '#1a1a2e';

        // Movement
        this.targetX = x;
        this.targetY = y;
        this.speed = 1.5;
        this.isMoving = false;
        this.arrivalThreshold = 5;

        // Legs (8 legs)
        this.legs = [];
        this.initializeLegs();

        // Gait control
        this.gaitTimer = 0;
        this.gaitCycleDuration = 0.4; // seconds
        this.currentGaitGroup = 0;
    }

    /**
     * Initialize 8 legs around the body
     */
    initializeLegs() {
        const legCount = 8;
        const angleStep = (Math.PI * 2) / legCount;

        for (let i = 0; i < legCount; i++) {
            // Distribute legs evenly around body
            // Offset to make them more spider-like (front/back bias)
            let baseAngle = angleStep * i;

            // Adjust angles for more natural spider leg placement
            if (i < 4) {
                // Front legs - spread forward
                baseAngle = MathUtils.degToRad(-90 + (i * 30));
            } else {
                // Back legs - spread backward
                baseAngle = MathUtils.degToRad(90 + ((i - 4) * 30));
            }

            const leg = new Leg(this, i, baseAngle);
            this.legs.push(leg);
        }
    }

    /**
     * Set movement target
     */
    setTarget(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.isMoving = true;

        // Calculate target rotation
        const dx = x - this.x;
        const dy = y - this.y;
        this.targetRotation = Math.atan2(dy, dx);
    }

    /**
     * Update spider state
     */
    update(deltaTime) {
        // Update rotation
        this.updateRotation(deltaTime);

        // Update position
        this.updatePosition(deltaTime);

        // Update gait
        this.updateGait(deltaTime);

        // Update all legs
        for (const leg of this.legs) {
            leg.update(deltaTime);
        }
    }

    /**
     * Update body rotation toward target
     */
    updateRotation(deltaTime) {
        const angleDiff = MathUtils.angleDifference(this.rotation, this.targetRotation);
        const rotationSpeed = 3; // radians per second

        if (Math.abs(angleDiff) > 0.01) {
            const rotationStep = rotationSpeed * deltaTime;
            const rotationAmount = Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationStep);
            this.rotation += rotationAmount;
            this.rotation = MathUtils.normalizeAngle(this.rotation);
        }
    }

    /**
     * Update body position toward target
     */
    updatePosition(deltaTime) {
        if (!this.isMoving) return;

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Check if arrived
        if (distance < this.arrivalThreshold) {
            this.isMoving = false;
            return;
        }

        // Move toward target
        const moveDistance = this.speed * deltaTime * 60; // Normalize to 60fps
        const moveRatio = Math.min(moveDistance / distance, 1);

        this.x += dx * moveRatio;
        this.y += dy * moveRatio;
    }

    /**
     * Update gait pattern (alternating leg groups)
     */
    updateGait(deltaTime) {
        if (!this.isMoving) return;

        this.gaitTimer += deltaTime;

        // Check if it's time to switch gait group
        if (this.gaitTimer >= this.gaitCycleDuration) {
            this.gaitTimer = 0;
            this.currentGaitGroup = 1 - this.currentGaitGroup; // Toggle between 0 and 1

            // Trigger steps for current group
            for (const leg of this.legs) {
                if (leg.group === this.currentGaitGroup && leg.needsStep()) {
                    leg.startStep();
                }
            }
        }
    }

    /**
     * Get count of active (lifted) legs
     */
    getActiveLegCount() {
        return this.legs.filter(leg => leg.isLifted).length;
    }

    /**
     * Get distance to target
     */
    getDistanceToTarget() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Render spider
     */
    render(ctx) {
        // Render legs (back legs first)
        for (let i = this.legs.length - 1; i >= this.legs.length / 2; i--) {
            this.legs[i].render(ctx);
        }

        // Render body shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(this.x + 2, this.y + 4, this.bodyRadius * 1.1, this.bodyRadius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Render body
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = '#0f3460';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.bodyRadius, this.bodyRadius * 0.85, this.rotation, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Body highlight
        const gradient = ctx.createRadialGradient(
            this.x - 10, this.y - 10, 0,
            this.x, this.y, this.bodyRadius
        );
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.bodyRadius, this.bodyRadius * 0.85, this.rotation, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        const eyeOffset = 12;
        const eyeSize = 4;

        ctx.fillStyle = '#00d4ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00d4ff';

        // Left eye
        const leftEyeX = this.x + Math.cos(this.rotation - 0.3) * eyeOffset;
        const leftEyeY = this.y + Math.sin(this.rotation - 0.3) * eyeOffset;
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        // Right eye
        const rightEyeX = this.x + Math.cos(this.rotation + 0.3) * eyeOffset;
        const rightEyeY = this.y + Math.sin(this.rotation + 0.3) * eyeOffset;
        ctx.beginPath();
        ctx.arc(rightEyeX, rightEyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Render front legs
        for (let i = 0; i < this.legs.length / 2; i++) {
            this.legs[i].render(ctx);
        }

        // Debug: Draw target indicator
        if (this.isMoving) {
            ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetX, this.targetY);
            ctx.stroke();
            ctx.setLineDash([]);

            // Target marker
            ctx.fillStyle = 'rgba(0, 212, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(this.targetX, this.targetY, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Update leg parameters
     */
    updateLegParameters(legLength, stepHeight) {
        const segmentLength = legLength / 2;
        for (const leg of this.legs) {
            leg.femurLength = segmentLength;
            leg.tibiaLength = segmentLength;
            leg.stepHeight = stepHeight;
        }
    }

    /**
     * Update movement speed
     */
    updateSpeed(speed) {
        this.speed = speed;
    }
}
