let bids = [];
let asks = [];
let trades = [];
let orderId = 0;

function placeOrder() {
    const type = document.getElementById("orderType").value;
    const side = document.getElementById("side").value;
    const price = parseFloat(document.getElementById("price").value);
    const quantity = parseInt(document.getElementById("quantity").value);

    const order = {
        id: orderId++,
        type,
        side,
        price,
        quantity,
        timestamp: Date.now()
    };

    if(type === "market") {
        executeMarketOrder(order);
    } else {
        addLimitOrder(order);
    }

    render();
}

function addLimitOrder(order) {
    if(order.side === "buy") {
        bids.push(order);
        bids.sort((a,b)=>b.price - a.price || a.timestamp - b.timestamp);
    } else {
        asks.push(order);
        asks.sort((a,b)=>a.price - b.price || a.timestamp - b.timestamp);
    }

    matchOrders();
}

function executeMarketOrder(order) {
    if(order.side === "buy") {
        matchWithBook(order, asks);
    } else {
        matchWithBook(order, bids);
    }
}

function matchOrders() {
    while(bids.length && asks.length && bids[0].price >= asks[0].price) {
        executeTrade(bids[0], asks[0]);
    }
}

function matchWithBook(order, book) {
    while(order.quantity > 0 && book.length > 0) {
        executeTrade(order, book[0]);
        if(book[0].quantity === 0) book.shift();
    }
}

function executeTrade(buyOrder, sellOrder) {
    const tradeQty = Math.min(buyOrder.quantity, sellOrder.quantity);
    const tradePrice = sellOrder.price || buyOrder.price;

    buyOrder.quantity -= tradeQty;
    sellOrder.quantity -= tradeQty;

    trades.push({
        price: tradePrice,
        quantity: tradeQty,
        time: new Date().toLocaleTimeString()
    });

    if(buyOrder.quantity === 0) bids.shift();
    if(sellOrder.quantity === 0) asks.shift();
}

function render() {
    document.getElementById("bids").innerHTML =
        bids.map(o=>`<div>${o.quantity} @ ${o.price}</div>`).join("");

    document.getElementById("asks").innerHTML =
        asks.map(o=>`<div>${o.quantity} @ ${o.price}</div>`).join("");

    document.getElementById("tradeLog").innerHTML =
        trades.map(t=>`<div>${t.time} | ${t.quantity} @ ${t.price}</div>`).join("");
}