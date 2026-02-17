/**
 * Simulates a LIDAR-like sensor for the car.
 * Casts rays in spread out directions to detect road borders and traffic.
 */
class Sensor {
    /**
     * @param {Car} car - The car this sensor is attached to.
     */
    constructor(car) {
        this.car = car;
        this.rayCount = 5;
        this.rayLength = 150;
        this.raySpread = Math.PI / 2; // 90 degrees

        this.rays = [];
        this.readings = [];
    }

    /**
     * Updates sensor readings based on current car position and environment.
     * @param {Array<Array<Object>>} roadBorders - Array of road border segments
     * @param {Array<Car>} traffic - Array of other cars
     */
    update(roadBorders, traffic) {
        this.#castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.#getReading(
                    this.rays[i],
                    roadBorders,
                    traffic
                )
            );
        }
    }

    /**
     * Calcualtes the closest intersection for a specific ray.
     * @param {Array<Object>} ray - [start, end] points
     * @param {Array<Array<Object>>} roadBorders 
     * @param {Array<Car>} traffic 
     * @returns {Object|null} Closest intersection point or null
     */
    #getReading(ray, roadBorders, traffic) {
        let touches = [];

        // Check road borders
        for (let i = 0; i < roadBorders.length; i++) {
            const touch = Utils.getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        // Check traffic
        for (let i = 0; i < traffic.length; i++) {
            const poly = traffic[i].polygon;
            for (let j = 0; j < poly.length; j++) {
                const value = Utils.getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j + 1) % poly.length]
                );
                if (value) {
                    touches.push(value);
                }
            }
        }

        if (touches.length == 0) {
            return null;
        }

        // Find closest touch
        const offsets = touches.map(e => e.offset);
        const minOffset = Math.min(...offsets);
        return touches.find(e => e.offset == minOffset);
    }

    /**
     * Calculates the start and end points of each ray.
     */
    #castRays() {
        this.rays = [];
        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = Utils.lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            const start = { x: this.car.x, y: this.car.y };
            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            };
            this.rays.push([start, end]);
        }
    }

    /**
     * Draws the sensor rays on the canvas.
     * Yellow = Beam, Black = Connection to impact point (if any)
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];
            if (this.readings[i]) {
                end = this.readings[i];
            }

            // Draw ray
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "yellow";
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            // Draw continuation if reading exists (for debugging visual)
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "black";
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }
}
