class NetworkSimulator {
    constructor() {
        this.baseJitter = 2.0;    // ms
        this.packetLoss = 0.001;  // 0.1% baseline
        this.congestion = 0.0;    // 0 to 1 scale
    }

    calculateRouteDelay(tps) {
        // High TPS causes congestion
        if (tps > 5000) {
            this.congestion = Math.min(1.0, this.congestion + 0.05);
        } else {
            this.congestion = Math.max(0.0, this.congestion - 0.02);
        }

        // Delay scales non-linearly with congestion
        const congestionDelay = Math.pow(this.congestion, 2) * 100; // up to 100ms extra
        const randomJitter = (Math.random() * 2 - 1) * this.baseJitter;

        return congestionDelay + randomJitter;
    }

    shouldDropPacket() {
        // Packet loss scales with congestion drastically
        const currentLossRate = this.packetLoss + (this.congestion * 0.05);
        return Math.random() < currentLossRate;
    }
}

window.NetworkSimulator = NetworkSimulator;
