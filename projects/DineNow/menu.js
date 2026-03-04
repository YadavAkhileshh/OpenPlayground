const menuItems = [
  { id:1, name:"Margherita Pizza", price:8.99, img:"https://images.unsplash.com/photo-1601924582975-4b6d30c4b414?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:2, name:"Cheeseburger", price:6.49, img:"https://images.unsplash.com/photo-1550547660-d9450f859349?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:3, name:"Pasta Alfredo", price:7.99, img:"https://images.unsplash.com/photo-1601050692126-3bcbfcd1f5e1?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:4, name:"Caesar Salad", price:5.99, img:"https://images.unsplash.com/photo-1553621042-f6e147245754?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:5, name:"French Fries", price:3.49, img:"https://images.unsplash.com/photo-1562967916-eb82221dfb35?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:6, name:"Chicken Wings", price:9.99, img:"https://images.unsplash.com/photo-1603079841684-25eab3d49f59?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:7, name:"Sushi Roll", price:12.99, img:"https://images.unsplash.com/photo-1562967916-8011a4d52e6c?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:8, name:"Grilled Salmon", price:14.99, img:"https://images.unsplash.com/photo-1605475120079-63ec61da07a1?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:9, name:"Tacos", price:5.99, img:"https://images.unsplash.com/photo-1600891964972-85d6357b7fa1?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:10, name:"Chocolate Cake", price:4.99, img:"https://images.unsplash.com/photo-1589308078056-5fcd344e4f06?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:11, name:"Ice Cream Sundae", price:3.99, img:"https://images.unsplash.com/photo-1599785209707-62112f96c918?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:12, name:"Avocado Toast", price:6.49, img:"https://images.unsplash.com/photo-1600891964891-bb7f040b0a45?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:13, name:"Pad Thai", price:9.99, img:"https://images.unsplash.com/photo-1598866548577-27d33c0c5b02?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:14, name:"Ramen Noodles", price:8.49, img:"https://images.unsplash.com/photo-1617196039947-3e76a4b1634f?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" },
  { id:15, name:"Veggie Burger", price:7.49, img:"https://images.unsplash.com/photo-1603079790042-9b95f3e0b08d?crop=entropy&cs=tinysrgb&fit=max&w=400&q=80" }
];
const menuContainer = document.getElementById("menu-items");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function updateCartCount() {
  document.getElementById("cart-count").textContent = cart.length;
}

menuItems.forEach(item => {
  const div = document.createElement("div");
  div.classList.add("menu-item");
  div.innerHTML = `<img src="${item.img}" alt="${item.name}"><h3>${item.name}</h3><p>$${item.price.toFixed(2)}</p><button>Add to Cart</button>`;
  div.querySelector("button").addEventListener("click", () => {
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert(`${item.name} added to cart!`);
  });
  menuContainer.appendChild(div);
});

updateCartCount();