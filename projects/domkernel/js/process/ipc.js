/**
 * Inter-Process Communication
 * Extremely simplified message passing
 */
class IPC {
    constructor() {
        this.channels = new Map();
    }

    createChannel(channelId) {
        if (!this.channels.has(channelId)) {
            this.channels.set(channelId, {
                queue: [],
                listeners: new Set()
            });
        }
    }

    destroyChannel(channelId) {
        this.channels.delete(channelId);
    }

    send(channelId, message, senderPid) {
        if (!this.channels.has(channelId)) this.createChannel(channelId);
        const channel = this.channels.get(channelId);

        const payload = { senderId: senderPid, data: message, timestamp: Date.now() };
        channel.queue.push(payload);

        channel.listeners.forEach(listener => {
            listener(payload);
        });
    }

    listen(channelId, callback) {
        if (!this.channels.has(channelId)) this.createChannel(channelId);
        const channel = this.channels.get(channelId);
        channel.listeners.add(callback);

        // Return unsubscribe function
        return () => {
            channel.listeners.delete(callback);
        };
    }

    read(channelId) {
        if (!this.channels.has(channelId)) return null;
        const channel = this.channels.get(channelId);
        if (channel.queue.length === 0) return null;
        return channel.queue.shift();
    }
}

window.IPC = new IPC();
