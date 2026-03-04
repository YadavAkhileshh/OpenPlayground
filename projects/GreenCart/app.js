// GreenCart Main JavaScript

const searchForm = document.getElementById('searchForm');
const resultDiv = document.getElementById('result');
const productsSection = document.getElementById('productsSection');
const productsList = document.getElementById('productsList');
const cartSection = document.getElementById('cartSection');
const cartList = document.getElementById('cartList');
const clearCartBtn = document.getElementById('clearCart');

const products = [
  {
    name: 'Reusable Water Bottle',
    description: 'Eco-friendly stainless steel bottle.',
    carbon: 0.2
  },
  {
    name: 'Organic Soap',
    description: 'Made from natural ingredients.',
    carbon: 0.1
  },
  {
    name: 'Bamboo Toothbrush',
    description: 'Biodegradable and sustainable.',
    carbon: 0.05
  },
  {
    name: 'Solar Charger',
    description: 'Portable solar-powered charger.',
    carbon: 0.3
  },
  {
    name: 'Compostable Bags',
    description: 'Made from plant-based materials.',
    carbon: 0.08
  },
  {
    name: 'LED Light Bulb',
    description: 'Energy-efficient lighting.',
    carbon: 0.12
  },
  {
    name: 'Recycled Notebook',
    description: 'Made from recycled paper.',
    carbon: 0.07
  }
];

let cart = JSON.parse(localStorage.getItem('greenCart') || '[]');

function saveCart() {
  localStorage.setItem('greenCart', JSON.stringify(cart));
}

function renderCart() {
  cartList.innerHTML = '';
  if (cart.length === 0) {
    cartList.innerHTML = '<li>Your cart is empty.</li>';
    return;
  }
  cart.slice(-20).reverse().forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.name}</strong> - ${item.description} | Carbon: ${item.carbon} kg CO₂`;
    cartList.appendChild(li);
  });
}

function addToCart(product) {
  cart.push(product);
  if (cart.length > 100) cart = cart.slice(-100);
  saveCart();
  renderCart();
}

function filterProducts(query) {
  query = query.trim().toLowerCase();
  if (!query) return products;
  return products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description.toLowerCase().includes(query)
  );
}

function renderProducts(filteredProducts) {
  productsList.innerHTML = '';
  if (filteredProducts.length === 0) {
    productsList.innerHTML = '<li>No products found.</li>';
    return;
  }
  filteredProducts.forEach(product => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${product.name}</strong> - ${product.description} | Carbon: ${product.carbon} kg CO₂ <button onclick='addToCartHandler("${product.name}")'>Add to Cart</button>`;
    productsList.appendChild(li);
  });
}

window.addToCartHandler = function(name) {
  const product = products.find(p => p.name === name);
  if (product) addToCart(product);
};

searchForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const query = document.getElementById('search').value;
  const filtered = filterProducts(query);
  renderProducts(filtered);
  resultDiv.style.display = 'block';
  resultDiv.innerHTML = `<strong>${filtered.length}</strong> product(s) found.`;
});

clearCartBtn.addEventListener('click', function() {
  cart = [];
  saveCart();
  renderCart();
});

// Initial render
renderProducts(products);
renderCart();
