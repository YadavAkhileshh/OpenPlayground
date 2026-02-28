// node.js
class NetworkNode {
    static idCounter = 1;
    
    constructor(x, y, z) {
        this.id = NetworkNode.idCounter++;
        this.x = x;
        this.y = y;
        this.z = z;
        this.originalX = x;
        this.originalY = y;
        this.originalZ = z;
        
        this.capacity = Math.floor(Math.random() * 10) + 5;
        this.bufferSize = this.capacity * 3;
        this.queue = [];
        this.currentLoad = 0;
        this.processedCount = 0;
        this.droppedCount = 0;
        
        this.state = 'normal';
        this.connections = [];
        this.failed = false;
        this.failureTimer = 0;
        
        this.color = '#00f0ff';
        this.radius = 30;
        
        this.isDragging = false;
        this.hovered = false;
        this.selected = false;
        
        this.updateColor();
    }
    
    updateColor() {
        switch(this.state) {
            case 'normal':
                this.color = '#00ff88';
                break;
            case 'congested':
                this.color = '#ffaa00';
                break;
            case 'overloaded':
                this.color = '#ff5500';
                break;
            case 'failed':
                this.color = '#ff0044';
                break;
        }
    }
    
    connectTo(node, link) {
        if (!this.connections.includes(link) && !node.connections.includes(link)) {
            this.connections.push(link);
            node.connections.push(link);
        }
    }
    
    disconnect(link) {
        const index = this.connections.indexOf(link);
        if (index > -1) {
            this.connections.splice(index, 1);
        }
    }
    
    addToQueue(packet) {
        if (this.queue.length >= this.bufferSize) {
            this.droppedCount++;
            return false;
        }
        
        this.queue.push(packet);
        this.updateState();
        return true;
    }
    
    processPackets(deltaTime) {
        if (this.failed) {
            this.failureTimer -= deltaTime;
            if (this.failureTimer <= 0) {
                this.recover();
            }
            return;
        }
        
        const packetsToProcess = Math.min(
            Math.floor(this.capacity * deltaTime / 1000),
            this.queue.length
        );
        
        for (let i = 0; i < packetsToProcess; i++) {
            const packet = this.queue.shift();
            if (packet) {
                this.routePacket(packet);
                this.processedCount++;
            }
        }
        
        this.currentLoad = this.queue.length / this.bufferSize;
        this.updateState();
    }
    
    routePacket(packet) {
        if (packet.target === this.id) {
            packet.deliver();
            return;
        }
        
        const availableLinks = this.connections.filter(link => 
            !link.failed && 
            link.canTransmit() &&
            (link.source === this || link.target === this)
        );
        
        if (availableLinks.length === 0) {
            this.droppedCount++;
            packet.drop();
            return;
        }
        
        const scoredLinks = availableLinks.map(link => {
            const nextNode = link.source === this ? link.target : link.source;
            const congestion = link.getCongestion();
            
            const dx = nextNode.x - packet.source.x;
            const dy = nextNode.y - packet.source.y;
            const dz = nextNode.z - packet.source.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            const score = congestion * 2 + (distance / 1000);
            
            return { link, nextNode, score };
        });
        
        scoredLinks.sort((a, b) => a.score - b.score);
        const bestRoute = scoredLinks[0];
        
        packet.moveTo(bestRoute.nextNode, bestRoute.link);
    }
    
    updateState() {
        if (this.failed) {
            this.state = 'failed';
        } else if (this.currentLoad > 0.9) {
            this.state = 'overloaded';
        } else if (this.currentLoad > 0.6) {
            this.state = 'congested';
        } else {
            this.state = 'normal';
        }
        this.updateColor();
    }
    
    fail(duration = 5000) {
        this.failed = true;
        this.failureTimer = duration;
        this.state = 'failed';
        this.updateColor();
        
        this.connections.forEach(link => {
            if (Math.random() < 0.3) {
                link.fail(3000);
            }
        });
    }
    
    recover() {
        this.failed = false;
        this.failureTimer = 0;
        this.state = 'normal';
        this.updateColor();
    }
    
    getStats() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            z: this.z,
            state: this.state,
            queueLength: this.queue.length,
            capacity: this.capacity,
            processed: this.processedCount,
            dropped: this.droppedCount,
            connections: this.connections.length
        };
    }
    
    reset() {
        this.queue = [];
        this.currentLoad = 0;
        this.processedCount = 0;
        this.droppedCount = 0;
        this.failed = false;
        this.failureTimer = 0;
        this.state = 'normal';
        this.updateColor();
    }
}