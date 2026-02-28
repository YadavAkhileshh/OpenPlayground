/* ============================================
   THE SPIDER - INVERSE KINEMATICS SOLVER
   Mathematical IK calculations for leg joints
   ============================================ */

/**
 * IKSolver - Inverse Kinematics calculation engine
 * Solves 2-joint leg positioning using geometric methods
 */
class IKSolver {
    /**
     * Solve inverse kinematics for a 2-joint leg
     * @param {Object} target - Target position {x, y}
     * @param {Object} origin - Origin position (shoulder) {x, y}
     * @param {number} length1 - Length of first segment (femur)
     * @param {number} length2 - Length of second segment (tibia)
     * @returns {Object} Joint angles {angle1, angle2, elbow}
     */
    static solve(target, origin, length1, length2) {
        // Calculate distance from origin to target
        const dx = target.x - origin.x;
        const dy = target.y - origin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if target is reachable
        const maxReach = length1 + length2;
        const minReach = Math.abs(length1 - length2);
        
        // Clamp distance to reachable range
        let reachableDistance = distance;
        if (distance > maxReach) {
            reachableDistance = maxReach * 0.95; // Slight margin for stability
        } else if (distance < minReach) {
            reachableDistance = minReach * 1.05;
        }
        
        // Calculate angle to target
        const targetAngle = Math.atan2(dy, dx);
        
        // Use law of cosines to find joint angles
        // cos(C) = (a² + b² - c²) / (2ab)
        
        // Angle at first joint (shoulder)
        const cosAngle1 = (length1 * length1 + reachableDistance * reachableDistance - length2 * length2) / 
                         (2 * length1 * reachableDistance);
        const angle1Offset = Math.acos(this.clamp(cosAngle1, -1, 1));
        const angle1 = targetAngle - angle1Offset;
        
        // Angle at second joint (elbow)
        const cosAngle2 = (length1 * length1 + length2 * length2 - reachableDistance * reachableDistance) / 
                         (2 * length1 * length2);
        const angle2 = Math.acos(this.clamp(cosAngle2, -1, 1));
        
        // Calculate elbow position
        const elbowX = origin.x + length1 * Math.cos(angle1);
        const elbowY = origin.y + length1 * Math.sin(angle1);
        
        return {
            angle1: angle1,
            angle2: angle2,
            elbow: { x: elbowX, y: elbowY },
            reachable: distance <= maxReach && distance >= minReach
        };
    }
    
    /**
     * Calculate forward kinematics (joint angles to position)
     * @param {Object} origin - Origin position
     * @param {number} angle1 - First joint angle
     * @param {number} angle2 - Second joint angle
     * @param {number} length1 - First segment length
     * @param {number} length2 - Second segment length
     * @returns {Object} End effector position and elbow position
     */
    static forward(origin, angle1, angle2, length1, length2) {
        // Calculate elbow position
        const elbowX = origin.x + length1 * Math.cos(angle1);
        const elbowY = origin.y + length1 * Math.sin(angle1);
        
        // Calculate end effector position
        const endAngle = angle1 + angle2 - Math.PI;
        const endX = elbowX + length2 * Math.cos(endAngle);
        const endY = elbowY + length2 * Math.sin(endAngle);
        
        return {
            elbow: { x: elbowX, y: elbowY },
            end: { x: endX, y: endY }
        };
    }
    
    /**
     * Clamp a value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}

/**
 * Vector2D - 2D vector math utilities
 */
class Vector2D {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
    
    /**
     * Add two vectors
     */
    static add(v1, v2) {
        return new Vector2D(v1.x + v2.x, v1.y + v2.y);
    }
    
    /**
     * Subtract two vectors
     */
    static subtract(v1, v2) {
        return new Vector2D(v1.x - v2.x, v1.y - v2.y);
    }
    
    /**
     * Multiply vector by scalar
     */
    static multiply(v, scalar) {
        return new Vector2D(v.x * scalar, v.y * scalar);
    }
    
    /**
     * Calculate distance between two points
     */
    static distance(v1, v2) {
        const dx = v2.x - v1.x;
        const dy = v2.y - v1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    /**
     * Calculate magnitude (length) of vector
     */
    static magnitude(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }
    
    /**
     * Normalize vector to unit length
     */
    static normalize(v) {
        const mag = Vector2D.magnitude(v);
        if (mag === 0) return new Vector2D(0, 0);
        return new Vector2D(v.x / mag, v.y / mag);
    }
    
    /**
     * Rotate vector by angle (radians)
     */
    static rotate(v, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector2D(
            v.x * cos - v.y * sin,
            v.x * sin + v.y * cos
        );
    }
    
    /**
     * Calculate angle of vector
     */
    static angle(v) {
        return Math.atan2(v.y, v.x);
    }
    
    /**
     * Linear interpolation between two vectors
     */
    static lerp(v1, v2, t) {
        return new Vector2D(
            v1.x + (v2.x - v1.x) * t,
            v1.y + (v2.y - v1.y) * t
        );
    }
    
    /**
     * Dot product of two vectors
     */
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    
    /**
     * Calculate angle between two vectors
     */
    static angleBetween(v1, v2) {
        const dot = Vector2D.dot(v1, v2);
        const mag1 = Vector2D.magnitude(v1);
        const mag2 = Vector2D.magnitude(v2);
        return Math.acos(dot / (mag1 * mag2));
    }
}

/**
 * MathUtils - Additional mathematical utilities
 */
class MathUtils {
    /**
     * Linear interpolation
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }
    
    /**
     * Clamp value between min and max
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    /**
     * Map value from one range to another
     */
    static map(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    
    /**
     * Normalize angle to -PI to PI range
     */
    static normalizeAngle(angle) {
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;
        return angle;
    }
    
    /**
     * Calculate shortest angle difference
     */
    static angleDifference(angle1, angle2) {
        let diff = angle2 - angle1;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        return diff;
    }
    
    /**
     * Smooth step interpolation (ease in/out)
     */
    static smoothStep(t) {
        return t * t * (3 - 2 * t);
    }
    
    /**
     * Smoother step interpolation
     */
    static smootherStep(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    /**
     * Ease in quadratic
     */
    static easeInQuad(t) {
        return t * t;
    }
    
    /**
     * Ease out quadratic
     */
    static easeOutQuad(t) {
        return t * (2 - t);
    }
    
    /**
     * Ease in/out quadratic
     */
    static easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    /**
     * Ease in cubic
     */
    static easeInCubic(t) {
        return t * t * t;
    }
    
    /**
     * Ease out cubic
     */
    static easeOutCubic(t) {
        return (--t) * t * t + 1;
    }
    
    /**
     * Ease in/out cubic
     */
    static easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }
    
    /**
     * Random number between min and max
     */
    static random(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    /**
     * Random integer between min and max (inclusive)
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * Convert degrees to radians
     */
    static degToRad(degrees) {
        return degrees * Math.PI / 180;
    }
    
    /**
     * Convert radians to degrees
     */
    static radToDeg(radians) {
        return radians * 180 / Math.PI;
    }
    
    /**
     * Check if value is approximately equal (within epsilon)
     */
    static approximately(a, b, epsilon = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }
    
    /**
     * Snap value to grid
     */
    static snapToGrid(value, gridSize) {
        return Math.round(value / gridSize) * gridSize;
    }
}

/**
 * Easing - Collection of easing functions
 */
class Easing {
    static linear(t) {
        return t;
    }
    
    static easeInSine(t) {
        return 1 - Math.cos((t * Math.PI) / 2);
    }
    
    static easeOutSine(t) {
        return Math.sin((t * Math.PI) / 2);
    }
    
    static easeInOutSine(t) {
        return -(Math.cos(Math.PI * t) - 1) / 2;
    }
    
    static easeInExpo(t) {
        return t === 0 ? 0 : Math.pow(2, 10 * t - 10);
    }
    
    static easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }
    
    static easeInOutExpo(t) {
        return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 
            ? Math.pow(2, 20 * t - 10) / 2
            : (2 - Math.pow(2, -20 * t + 10)) / 2;
    }
    
    static easeInElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 
            : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }
    
    static easeOutElastic(t) {
        const c4 = (2 * Math.PI) / 3;
        return t === 0 ? 0 : t === 1 ? 1 
            : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }
    
    static easeInBounce(t) {
        return 1 - Easing.easeOutBounce(1 - t);
    }
    
    static easeOutBounce(t) {
        const n1 = 7.5625;
        const d1 = 2.75;
        
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
            return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
    }
}
