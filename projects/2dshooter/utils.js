// Utility functions
class Utils {
    // Clamp value between min and max
    static clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    
    // Linear interpolation
    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }
    
    // Smooth rotation towards target angle
    static rotateTowards(currentAngle, targetAngle, rotationSpeed) {
        let difference = targetAngle - currentAngle;
        
        // Normalize difference to [-PI, PI]
        while (difference > Math.PI) difference -= 2 * Math.PI;
        while (difference < -Math.PI) difference += 2 * Math.PI;
        
        // Apply rotation speed
        if (difference > rotationSpeed) return currentAngle + rotationSpeed;
        if (difference < -rotationSpeed) return currentAngle - rotationSpeed;
        return targetAngle;
    }
    
    // Calculate distance between two points
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    // Calculate angle between two points
    static angleTo(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
    
    // Check circle collision
    static circleCollision(x1, y1, r1, x2, y2, r2) {
        const dist = this.distance(x1, y1, x2, y2);
        return dist < r1 + r2;
    }
    
    // Generate random number in range
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    // Format number to fixed decimal places
    static formatNumber(num, decimals = 2) {
        return num.toFixed(decimals);
    }
    
    // Create a circular buffer for position history
    static createCircularBuffer(maxSize) {
        const buffer = new Array(maxSize);
        let start = 0;
        let size = 0;
        
        return {
            push: (item) => {
                const index = (start + size) % maxSize;
                buffer[index] = item;
                if (size < maxSize) {
                    size++;
                } else {
                    start = (start + 1) % maxSize;
                }
            },
            
            get: (index) => {
                if (index < 0 || index >= size) return null;
                return buffer[(start + index) % maxSize];
            },
            
            getLatest: () => {
                if (size === 0) return null;
                return buffer[(start + size - 1) % maxSize];
            },
            
            getSize: () => size,
            
            clear: () => {
                start = 0;
                size = 0;
            },
            
            getAll: () => {
                const result = [];
                for (let i = 0; i < size; i++) {
                    result.push(buffer[(start + i) % maxSize]);
                }
                return result;
            }
        };
    }
}