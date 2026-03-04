const products = [
    {id:1,name:"Headphones",price:50},
    {id:2,name:"Keyboard",price:80},
    {id:3,name:"Mouse",price:40},
    {id:4,name:"Monitor",price:200},
    {id:5,name:"Laptop Stand",price:35},
    {id:6,name:"USB Hub",price:25}
];

const productList = document.getElementById("productList");
const cartItems = document.getElementById("cartItems");
const totalEl = document.getElementById("total");
const cartCount = document.getElementById("cartCount");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
    localStorage.setItem("cart",JSON.stringify(cart));
}

function renderProducts(){
    productList.innerHTML="";
    products.forEach(p=>{
        const div = document.createElement("div");
        div.classList.add("product");
        div.innerHTML=`
            <h3>${p.name}</h3>
            <p>$${p.price}</p>
            <button>Add to Cart</button>
        `;
        div.querySelector("button").onclick=()=>addToCart(p.id);
        productList.appendChild(div);
    });
}

function addToCart(id){
    const item = cart.find(i=>i.id===id);
    if(item){
        item.qty++;
    }else{
        const product = products.find(p=>p.id===id);
        cart.push({...product,qty:1});
    }
    saveCart();
    renderCart();
}

function renderCart(){
    cartItems.innerHTML="";
    let total=0;
    let count=0;

    cart.forEach(item=>{
        total+=item.price*item.qty;
        count+=item.qty;

        const li = document.createElement("li");
        li.innerHTML=`
            ${item.name} x${item.qty}
            <div>
                <button onclick="changeQty(${item.id},1)">+</button>
                <button onclick="changeQty(${item.id},-1)">-</button>
                <button onclick="removeItem(${item.id})">X</button>
            </div>
        `;
        cartItems.appendChild(li);
    });

    totalEl.textContent=total.toFixed(2);
    cartCount.textContent=count;
}

function changeQty(id,delta){
    const item = cart.find(i=>i.id===id);
    if(!item) return;

    item.qty+=delta;
    if(item.qty<=0){
        cart=cart.filter(i=>i.id!==id);
    }

    saveCart();
    renderCart();
}

function removeItem(id){
    cart=cart.filter(i=>i.id!==id);
    saveCart();
    renderCart();
}

document.getElementById("checkoutBtn").onclick=()=>{
    alert("Checkout successful!");
    cart=[];
    saveCart();
    renderCart();
};

renderProducts();
renderCart();
