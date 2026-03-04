/**
 * physics.js - Pendulum Physics Engine with RK4 integration
 */
class PendulumPhysics {
    constructor(length = 1.0, initialAngle = Math.PI / 4, gravity = 9.8, damping = 0.995) {
        this.length = length;
        this.gravity = gravity;
        this.damping = damping;
        this.angle = initialAngle;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.previousVelocity = 0;
        this.peakDetected = false;
        this.lastPeakTime = 0;
        this.peakDirection = 0;
        this.lastUpdateTime = performance.now();
        this.period = 2 * Math.PI * Math.sqrt(this.length / this.gravity);
    }

    update(currentTime) {
        const dt = Math.min((currentTime - this.lastUpdateTime) / 1000, 0.1);
        this.lastUpdateTime = currentTime;
        this.peakDetected = false;
        this.previousVelocity = this.angularVelocity;

        // RK4 integration
        const k1 = this.derivative(this.angle, this.angularVelocity);
        const k2 = this.derivative(this.angle + k1.dAngle * dt * 0.5, this.angularVelocity + k1.dVelocity * dt * 0.5);
        const k3 = this.derivative(this.angle + k2.dAngle * dt * 0.5, this.angularVelocity + k2.dVelocity * dt * 0.5);
        const k4 = this.derivative(this.angle + k3.dAngle * dt, this.angularVelocity + k3.dVelocity * dt);

        const dAngle = (k1.dAngle + 2 * k2.dAngle + 2 * k3.dAngle + k4.dAngle) / 6;
        const dVelocity = (k1.dVelocity + 2 * k2.dVelocity + 2 * k3.dVelocity + k4.dVelocity) / 6;

        this.angle += dAngle * dt;
        this.angularVelocity += dVelocity * dt;
        this.angularVelocity *= this.damping;
        this.angularAcceleration = -(this.gravity / this.length) * Math.sin(this.angle);

        if (this.detectPeak()) {
            this.peakDetected = true;
            this.lastPeakTime = currentTime;
            return true;
        }
        return false;
    }

    derivative(angle, velocity) {
        return {
            dAngle: velocity,
            dVelocity: -(this.gravity / this.length) * Math.sin(angle)
        };
    }

    detectPeak() {
        const velocitySignChanged =
            (this.previousVelocity > 0 && this.angularVelocity <= 0) ||
            (this.previousVelocity < 0 && this.angularVelocity >= 0);

        if (velocitySignChanged && Math.abs(this.angle) > 0.01) {
            this.peakDirection = this.angle > 0 ? 1 : -1;
            return true;
        }
        return false;
    }

    getPosition(originX, originY, scale = 100) {
        return {
            x: originX + Math.sin(this.angle) * this.length * scale,
            y: originY + Math.cos(this.angle) * this.length * scale
        };
    }

    setLength(length) {
        this.length = Math.max(0.1, Math.min(5.0, length));
        this.period = 2 * Math.PI * Math.sqrt(this.length / this.gravity);
    }

    setGravity(gravity) {
        this.gravity = gravity;
        this.period = 2 * Math.PI * Math.sqrt(this.length / this.gravity);
    }

    setDamping(damping) {
        this.damping = Math.max(0.9, Math.min(1.0, damping));
    }

    reset(angle = Math.PI / 4) {
        this.angle = angle;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.previousVelocity = 0;
        this.peakDetected = false;
        this.lastPeakTime = 0;
        this.lastUpdateTime = performance.now();
    }

    getPeriod() { return this.period; }
    getFrequency() { return 1 / this.period; }
    getNormalizedAmplitude() { return Math.abs(this.angle) / Math.PI; }
    isAtRest() { return Math.abs(this.angularVelocity) < 0.01 && Math.abs(this.angle) < 0.05; }
}
