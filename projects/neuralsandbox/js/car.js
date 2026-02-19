/**
 * Represents a vehicle in the simulation.
 * Handles physics, movement, sensor data, and brain inputs.
 */
class Car {
    /**
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * @param {number} width - Car width
     * @param {number} height - Car height
     * @param {string} controlType - "AI" or "DUMMY" (Traffic) or "KEYS"
     * @param {number} maxSpeed - Maximum speed of the car
     */
    constructor(x, y, width, height, controlType, maxSpeed = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;

        this.useBrain = controlType == "AI";

        if (controlType != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount, 6, 4] // Input, Hidden, Output
            );
        }

        this.controls = new Controls(controlType);
    }

    /**
     * Updates car state.
     * Moves car, checks sensors, feeds brain, gets controls, checks collision.
     * @param {Array<Array<Object>>} roadBorders 
     * @param {Array<Car>} traffic 
     */
    update(roadBorders, traffic) {
        if (!this.damaged) {
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }

        if (this.sensor) {
            this.sensor.update(roadBorders, traffic);
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            );
            const outputs = NeuralNetwork.feedForward(offsets, this.brain);

            // AI Control Mapping
            if (this.useBrain) {
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }

    /**
     * checks for collision with road borders or traffic.
     * @returns {boolean} True if damaged/crashed
     */
    #assessDamage(roadBorders, traffic) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (Utils.polysIntersect(this.polygon, roadBorders[i])) {
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if (Utils.polysIntersect(this.polygon, traffic[i].polygon)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Creates the polygon representation of the car (rectangle rotated by angle).
     * @returns {Array<Object>} Array of corner points
     */
    #createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        });
        return points;
    }

    /**
     * Handles physics movement logic.
     * Acceleration, friction, turning.
     */
    #move() {
        if (this.controls.forward) {
            this.speed += this.acceleration;
        }
        if (this.controls.reverse) {
            this.speed -= this.acceleration;
        }

        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed;
        }
        if (this.speed < -this.maxSpeed / 2) {
            this.speed = -this.maxSpeed / 2;
        }

        if (this.speed > 0) {
            this.speed -= this.friction;
        }
        if (this.speed < 0) {
            this.speed += this.friction;
        }
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0;
        }

        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1;
            if (this.controls.left) {
                this.angle += 0.03 * flip;
            }
            if (this.controls.right) {
                this.angle -= 0.03 * flip;
            }
        }

        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        // Visual Effects: Particles
        if (Math.abs(this.speed) > this.maxSpeed * 0.8 && particles) {
            // Calculate rear of car
            const rad = Math.hypot(this.width, this.height) / 2;
            const rearX = this.x + Math.sin(this.angle) * rad;
            const rearY = this.y + Math.cos(this.angle) * rad;

            if (Math.random() < 0.3) {
                particles.emit(rearX, rearY, "rgba(50, 50, 50, 0.5)", 1);
            }
        }
    }

    /**
     * Draws the car on the canvas.
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} color 
     * @param {boolean} drawSensor 
     */
    draw(ctx, color = "black", drawSensor = false) {
        if (this.damaged) {
            ctx.fillStyle = "gray";
        } else {
            ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.fill();

        // Headlights
        if (!this.damaged) {
            const rad = Math.hypot(this.width, this.height) / 2;
            const alpha = Math.atan2(this.width, this.height);
            // Assuming polygon[0] and [1] are front
            ctx.beginPath();
            ctx.fillStyle = "yellow";
            ctx.arc(this.polygon[0].x, this.polygon[0].y, 3, 0, Math.PI * 2);
            ctx.arc(this.polygon[1].x, this.polygon[1].y, 3, 0, Math.PI * 2);
            ctx.fill();

            // Tail lights
            if (this.speed < 0 || this.controls.reverse) {
                ctx.beginPath();
                ctx.fillStyle = "red";
                ctx.arc(this.polygon[2].x, this.polygon[2].y, 3, 0, Math.PI * 2);
                ctx.arc(this.polygon[3].x, this.polygon[3].y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        if (this.sensor && drawSensor) {
            this.sensor.draw(ctx);
        }
    }
}

/**
 * Handles input controls for the car.
 * Can be Keyboard driven or Dummy (Always forward).
 */
class Controls {
    constructor(type) {
        this.forward = false;
        this.left = false;
        this.right = false;
        this.reverse = false;

        switch (type) {
            case "KEYS":
                this.#addKeyboardListeners();
                break;
            case "DUMMY":
                this.forward = true;
                break;
        }
    }

    #addKeyboardListeners() {
        document.onkeydown = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = true;
                    break;
                case "ArrowRight":
                    this.right = true;
                    break;
                case "ArrowUp":
                    this.forward = true;
                    break;
                case "ArrowDown":
                    this.reverse = true;
                    break;
            }
        }
        document.onkeyup = (event) => {
            switch (event.key) {
                case "ArrowLeft":
                    this.left = false;
                    break;
                case "ArrowRight":
                    this.right = false;
                    break;
                case "ArrowUp":
                    this.forward = false;
                    break;
                case "ArrowDown":
                    this.reverse = false;
                    break;
            }
        }
    }
}
