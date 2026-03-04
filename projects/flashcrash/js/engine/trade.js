class Trade {
    constructor(makerOrderId, takerOrderId, price, size, takerSide) {
        this.id = uid();
        this.makerOrderId = makerOrderId;
        this.takerOrderId = takerOrderId;
        this.price = price;
        this.size = size;
        this.takerSide = takerSide; // Which side initiated the market trade
        this.timestamp = window.TimeClass ? window.TimeClass.now() : Date.now();
    }
}

window.Trade = Trade;
