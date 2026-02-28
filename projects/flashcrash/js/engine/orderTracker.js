/**
 * Advanced Order struct extensions mapping for FIX protocol style representation
 */
const OrderStateTransitions = {
    [CONSTANTS.ORDER_STATUS.NEW]: [CONSTANTS.ORDER_STATUS.OPEN, CONSTANTS.ORDER_STATUS.REJECTED],
    [CONSTANTS.ORDER_STATUS.OPEN]: [CONSTANTS.ORDER_STATUS.PARTIAL, CONSTANTS.ORDER_STATUS.FILLED, CONSTANTS.ORDER_STATUS.CANCELED],
    [CONSTANTS.ORDER_STATUS.PARTIAL]: [CONSTANTS.ORDER_STATUS.PARTIAL, CONSTANTS.ORDER_STATUS.FILLED, CONSTANTS.ORDER_STATUS.CANCELED],
    [CONSTANTS.ORDER_STATUS.FILLED]: [],
    [CONSTANTS.ORDER_STATUS.CANCELED]: [],
    [CONSTANTS.ORDER_STATUS.REJECTED]: []
};

class OrderTracker {
    constructor() {
        this.activeOrders = new Set();
        this.terminalOrders = new Set();
    }

    validateTransition(current, target) {
        const allowed = OrderStateTransitions[current];
        if (!allowed) return false;
        return allowed.includes(target);
    }

    register(orderId) {
        this.activeOrders.add(orderId);
    }

    markTerminal(orderId) {
        if (this.activeOrders.has(orderId)) {
            this.activeOrders.delete(orderId);
            this.terminalOrders.add(orderId);
        }
    }

    getActiveCount() {
        return this.activeOrders.size;
    }

    getTerminalCount() {
        return this.terminalOrders.size;
    }
}

window.OrderTracker = OrderTracker;
