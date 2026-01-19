class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    
    gaussian(mean = 0, std = 1) {
        let u1 = this.next();
        let u2 = this.next();
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return mean + std * z0;
    }
}