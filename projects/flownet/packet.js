// packet.js
class NetworkPacket {
    static idCounter = 1;
    static colors = ['#00f0ff', '#9d4cff', '#00ffcc', '#00ff9d', '#ffcc00', '#ff0099'];
    
    constructor(source, target, size = 1) {
        this.id = NetworkPacket.idCounter++;
        this.source = source;
        this.target = target;
        this.size = size;
        
        this.currentNode = source;
        this.link = null;
        this.progress = 0;
        this.startTime = 0;
        
        this.state = 'queued';
        this.color = NetworkPacket.colors[Math.floor(Math.random() * NetworkPacket.colors.length)];
        this.delivered = false;
        this.dropped = false;
        
        this.path = [];
        this.path.push(source.id);
    }
    
    moveTo(node, link) {
        if (this.delivered || this.dropped) return false;
        
        if (link.transmitPacket(this)) {
            this.currentNode = null;
            this.link = link;
            this.state = 'in_transit';
            this.path.push(node.id);
            return true;
        }
        return false;
    }
    
    deliver() {
        this.delivered = true;
        this.state = 'delivered';
        this.link = null;
        this.currentNode = null;
    }
    
    drop() {
        this.dropped = true;
        this.state = 'dropped';
        this.link = null;
        this.currentNode = null;
    }
    
    update(deltaTime) {
        if (this.delivered || this.dropped) return;
        
        if (this.link) {
            this.progress += deltaTime / this.link.latency;
            if (this.progress >= 1) {
                this.progress = 1;
            }
        }
    }
    
    getPosition() {
        if (this.link) {
            return this.link.getPacketPosition(this);
        } else if (this.currentNode) {
            return {
                x: this.currentNode.x,
                y: this.currentNode.y,
                z: this.currentNode.z
            };
        }
        return null;
    }
    
    getStats() {
        return {
            id: this.id,
            source: this.source.id,
            target: this.target.id,
            state: this.state,
            progress: this.progress,
            path: this.path,
            delivered: this.delivered,
            dropped: this.dropped
        };
    }
}