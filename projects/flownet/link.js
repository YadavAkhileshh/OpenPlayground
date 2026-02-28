// link.js
class NetworkLink {
    static idCounter = 1;
    
    constructor(source, target) {
        this.id = NetworkLink.idCounter++;
        this.source = source;
        this.target = target;
        
        this.bandwidth = Math.floor(Math.random() * 8) + 3;
        this.latency = Math.floor(Math.random() * 80) + 30;
        this.congestion = 0;
        this.packetsInTransit = [];
        this.failed = false;
        this.failureTimer = 0;
        
        this.color = '#00f0ff';
        this.width = 2;
        
        this.updateAppearance();
    }
    
    updateAppearance() {
        if (this.failed) {
            this.color = '#ff0044';
            this.width = 1;
        } else if (this.congestion > 0.8) {
            this.color = '#ff5500';
            this.width = 5;
        } else if (this.congestion > 0.5) {
            this.color = '#ffaa00';
            this.width = 4;
        } else if (this.congestion > 0.2) {
            this.color = '#00f0ff';
            this.width = 3;
        } else {
            this.color = '#00ff9d';
            this.width = 2;
        }
    }
    
    canTransmit() {
        return !this.failed && this.packetsInTransit.length < this.bandwidth * 2;
    }
    
    getCongestion() {
        return this.packetsInTransit.length / (this.bandwidth * 2);
    }
    
    transmitPacket(packet) {
        if (!this.canTransmit()) {
            return false;
        }
        
        packet.startTime = Date.now();
        packet.link = this;
        packet.progress = 0;
        
        this.packetsInTransit.push(packet);
        this.updateCongestion();
        return true;
    }
    
    update(deltaTime) {
        if (this.failed) {
            this.failureTimer -= deltaTime;
            if (this.failureTimer <= 0) {
                this.recover();
            }
            return;
        }
        
        const completedPackets = [];
        
        this.packetsInTransit.forEach((packet, index) => {
            const progressDelta = deltaTime / this.latency;
            packet.progress += progressDelta;
            
            if (packet.progress >= 1) {
                completedPackets.push(index);
                packet.progress = 1;
                packet.link = null;
                
                const nextNode = this.target;
                if (nextNode) {
                    nextNode.addToQueue(packet);
                    packet.currentNode = nextNode;
                }
            }
        });
        
        for (let i = completedPackets.length - 1; i >= 0; i--) {
            this.packetsInTransit.splice(completedPackets[i], 1);
        }
        
        this.updateCongestion();
    }
    
    updateCongestion() {
        this.congestion = this.packetsInTransit.length / (this.bandwidth * 2);
        this.updateAppearance();
    }
    
    fail(duration = 3000) {
        this.failed = true;
        this.failureTimer = duration;
        this.updateAppearance();
        
        this.packetsInTransit.forEach(packet => {
            packet.drop();
        });
        this.packetsInTransit = [];
    }
    
    recover() {
        this.failed = false;
        this.failureTimer = 0;
        this.updateAppearance();
    }
    
    getPacketPosition(packet) {
        const t = Math.max(0, Math.min(1, packet.progress));
        const easeT = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        
        const arcHeight = Math.sqrt(
            Math.pow(this.target.x - this.source.x, 2) +
            Math.pow(this.target.y - this.source.y, 2) +
            Math.pow(this.target.z - this.source.z, 2)
        ) * 0.15;
        
        return {
            x: this.source.x + (this.target.x - this.source.x) * easeT,
            y: this.source.y + (this.target.y - this.source.y) * easeT,
            z: this.source.z + (this.target.z - this.source.z) * easeT + Math.sin(easeT * Math.PI) * arcHeight
        };
    }
    
    getStats() {
        return {
            id: this.id,
            source: this.source.id,
            target: this.target.id,
            bandwidth: this.bandwidth,
            latency: this.latency,
            congestion: this.congestion,
            packetsInTransit: this.packetsInTransit.length,
            failed: this.failed
        };
    }
    
    reset() {
        this.packetsInTransit = [];
        this.failed = false;
        this.failureTimer = 0;
        this.congestion = 0;
        this.updateAppearance();
    }
}