let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartContainer = document.getElementById("cart-items");
const totalEl = document.getElementById("total");

function updateCart() {
  cartContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item,index)=>{
    total += item.price;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src="${item.img}" alt="${item.name}" style="width:100px; border-radius:8px; margin-bottom:10px;"><h3>${item.name}</h3><p>$${item.price.toFixed(2)}</p><button>Remove</button>`;
    div.querySelector("button").addEventListener("click",()=>{
      cart.splice(index,1);
      localStorage.setItem("cart",JSON.stringify(cart));
      updateCart();
    });
    cartContainer.appendChild(div);
  });
  totalEl.textContent = total.toFixed(2);
  document.getElementById("cart-count").textContent = cart.length;
}

document.getElementById("checkout-btn").addEventListener("click",()=>{
  localStorage.removeItem("cart");
});

updateCart();