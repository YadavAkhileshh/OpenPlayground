// Initial menu (same as C++ program)
let menu = [
    { name: "Paneer Roll", price: 50, stock: 10 },
    { name: "Chowmein", price: 40, stock: 8 },
    { name: "Juice", price: 30, stock: 15 },
    { name: "Biriyani", price: 120, stock: 10 },
    { name: "Coffee", price: 10, stock: 15 }
];

let order = [];
let total = 0;

function renderMenu() {
    const container = document.getElementById("menu");
    container.innerHTML = "";
    menu.forEach((item, i) => {
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
      <div>
        <span class="item-name">${i + 1}. ${item.name}</span><br>
        Rs.${item.price} (Available: <span id="stock-${i}">${item.stock}</span>)
      </div>
      <div>
        <input type="number" min="0" value="0" class="qty" data-index="${i}">
      </div>`;
        container.appendChild(div);
    });
}

document.getElementById("placeBtn").addEventListener("click", () => {
    let billText = "===== BILL =====\n";
    total = 0;
    order = [];

    document.querySelectorAll(".qty").forEach(input => {
        const qty = parseInt(input.value) || 0;
        const idx = parseInt(input.dataset.index);
        if (qty > 0) {
            if (qty <= menu[idx].stock) {
                let cost = qty * menu[idx].price;
                total += cost;
                menu[idx].stock -= qty;
                order.push(`${qty} x ${menu[idx].name} = Rs.${cost}`);
                document.getElementById(`stock-${idx}`).textContent = menu[idx].stock;
            } else {
                order.push(`❌ Not enough stock for ${menu[idx].name}`);
            }
        }
        input.value = 0;
    });

    if (order.length === 0) {
        billText += "No items selected.\n";
    } else {
        billText += order.join("\n") + "\n";
        billText += "------------------\n";
        billText += "Total Amount: Rs." + total + "\n";
        billText += "Thank you! Your food will be ready soon.";
    }

    document.getElementById("bill").textContent = billText;
});

// Render menu when page loads
window.addEventListener("DOMContentLoaded", renderMenu);
