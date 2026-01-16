// Sample Data
const restaurants = [
    {
        id: 1,
        name: "Burger Palace",
        cuisine: "American, Fast Food",
        rating: 4.5,
        deliveryTime: "25-35",
        deliveryFee: "Free",
        image: "burger",
        category: "burger",
        menu: [
            { id: 101, name: "Classic Burger", description: "Juicy beef patty with lettuce, tomato, and special sauce", price: 12.99, category: "burgers" },
            { id: 102, name: "Cheese Burger", description: "Double cheese with crispy bacon", price: 14.99, category: "burgers" },
            { id: 103, name: "Veggie Burger", description: "Plant-based patty with fresh vegetables", price: 11.99, category: "burgers" },
            { id: 104, name: "French Fries", description: "Crispy golden fries with sea salt", price: 4.99, category: "sides" },
            { id: 105, name: "Onion Rings", description: "Crispy battered onion rings", price: 5.99, category: "sides" }
        ]
    },
    {
        id: 2,
        name: "Pizza Express",
        cuisine: "Italian, Pizza",
        rating: 4.7,
        deliveryTime: "30-40",
        deliveryFee: "$2.99",
        image: "pizza",
        category: "pizza",
        menu: [
            { id: 201, name: "Margherita Pizza", description: "Fresh mozzarella, tomato, and basil", price: 15.99, category: "pizza" },
            { id: 202, name: "Pepperoni Pizza", description: "Classic pepperoni with extra cheese", price: 17.99, category: "pizza" },
            { id: 203, name: "Veggie Supreme", description: "Bell peppers, mushrooms, olives, and onions", price: 16.99, category: "pizza" },
            { id: 204, name: "Garlic Bread", description: "Toasted bread with garlic butter and herbs", price: 6.99, category: "sides" },
            { id: 205, name: "Caesar Salad", description: "Romaine lettuce with parmesan and croutons", price: 8.99, category: "salads" }
        ]
    },
    {
        id: 3,
        name: "Sushi Master",
        cuisine: "Japanese, Sushi",
        rating: 4.8,
        deliveryTime: "35-45",
        deliveryFee: "$3.99",
        image: "sushi",
        category: "sushi",
        menu: [
            { id: 301, name: "California Roll", description: "Crab, avocado, and cucumber", price: 12.99, category: "rolls" },
            { id: 302, name: "Salmon Nigiri", description: "Fresh salmon over seasoned rice", price: 14.99, category: "nigiri" },
            { id: 303, name: "Tuna Sashimi", description: "Premium tuna slices", price: 18.99, category: "sashimi" },
            { id: 304, name: "Miso Soup", description: "Traditional soybean paste soup", price: 4.99, category: "soup" },
            { id: 305, name: "Edamame", description: "Steamed soybeans with sea salt", price: 3.99, category: "appetizers" }
        ]
    },
    {
        id: 4,
        name: "Spice Garden",
        cuisine: "Indian, Curry",
        rating: 4.6,
        deliveryTime: "40-50",
        deliveryFee: "$2.49",
        image: "indian",
        category: "indian",
        menu: [
            { id: 401, name: "Butter Chicken", description: "Tender chicken in creamy tomato sauce", price: 16.99, category: "curry" },
            { id: 402, name: "Palak Paneer", description: "Cottage cheese in spinach gravy", price: 14.99, category: "curry" },
            { id: 403, name: "Biryani", description: "Fragrant rice with spices and meat", price: 15.99, category: "rice" },
            { id: 404, name: "Naan Bread", description: "Freshly baked Indian flatbread", price: 3.99, category: "bread" },
            { id: 405, name: "Samosas", description: "Crispy pastry with potato filling", price: 5.99, category: "appetizers" }
        ]
    },
    {
        id: 5,
        name: "Dragon Wok",
        cuisine: "Chinese, Asian",
        rating: 4.4,
        deliveryTime: "30-40",
        deliveryFee: "$1.99",
        image: "chinese",
        category: "chinese",
        menu: [
            { id: 501, name: "Sweet & Sour Chicken", description: "Crispy chicken with tangy sauce", price: 13.99, category: "main" },
            { id: 502, name: "Beef Chow Mein", description: "Stir-fried noodles with beef", price: 12.99, category: "noodles" },
            { id: 503, name: "Fried Rice", description: "Wok-fried rice with vegetables", price: 10.99, category: "rice" },
            { id: 504, name: "Spring Rolls", description: "Crispy vegetable rolls", price: 4.99, category: "appetizers" },
            { id: 505, name: "Hot & Sour Soup", description: "Spicy and tangy vegetable soup", price: 5.99, category: "soup" }
        ]
    },
    {
        id: 6,
        name: "Green Bowl",
        cuisine: "Healthy, Salads",
        rating: 4.5,
        deliveryTime: "20-30",
        deliveryFee: "Free",
        image: "healthy",
        category: "healthy",
        menu: [
            { id: 601, name: "Greek Salad", description: "Fresh vegetables with feta cheese", price: 10.99, category: "salads" },
            { id: 602, name: "Quinoa Bowl", description: "Nutritious quinoa with roasted vegetables", price: 12.99, category: "bowls" },
            { id: 603, name: "Acai Bowl", description: "Berry smoothie bowl with granola", price: 11.99, category: "bowls" },
            { id: 604, name: "Green Smoothie", description: "Spinach, banana, and apple smoothie", price: 7.99, category: "drinks" },
            { id: 605, name: "Protein Wrap", description: "Grilled chicken with vegetables", price: 9.99, category: "wraps" }
        ]
    }
];

// Global Variables
let cart = [];
let currentRestaurant = null;
let currentCategory = 'all';

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromStorage();
    displayRestaurants();
    updateCartUI();
});

// Display Restaurants
function displayRestaurants(filteredRestaurants = restaurants) {
    const grid = document.getElementById('restaurantsGrid');
    grid.innerHTML = '';

    filteredRestaurants.forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.onclick = () => showMenu(restaurant);
        
        card.innerHTML = `
            <img src="https://picsum.photos/seed/${restaurant.image}/400/200" alt="${restaurant.name}" class="restaurant-image">
            <div class="restaurant-info">
                <div class="restaurant-header">
                    <h3 class="restaurant-name">${restaurant.name}</h3>
                    <div class="restaurant-rating">
                        ⭐ ${restaurant.rating}
                    </div>
                </div>
                <p class="restaurant-cuisine">${restaurant.cuisine}</p>
                <div class="restaurant-meta">
                    <span class="delivery-time">🕐 ${restaurant.deliveryTime} min</span>
                    <span class="delivery-fee">${restaurant.deliveryFee}</span>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Show Menu
function showMenu(restaurant) {
    currentRestaurant = restaurant;
    const menuSection = document.getElementById('menuSection');
    const restaurantsGrid = document.getElementById('restaurantsGrid');
    const orderTracking = document.getElementById('orderTracking');
    
    restaurantsGrid.style.display = 'none';
    orderTracking.style.display = 'none';
    menuSection.style.display = 'block';

    // Get unique categories from menu
    const categories = [...new Set(restaurant.menu.map(item => item.category))];
    
    menuSection.innerHTML = `
        <div class="menu-header">
            <button class="back-button" onclick="showHome()">← Back</button>
            <div>
                <h2>${restaurant.name}</h2>
                <p>${restaurant.cuisine} • ⭐ ${restaurant.rating} • 🕐 ${restaurant.deliveryTime} min</p>
            </div>
        </div>
        
        <div class="menu-categories">
            <button class="category-button active" onclick="filterMenu('all')">All</button>
            ${categories.map(cat => `
                <button class="category-button" onclick="filterMenu('${cat}')">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
            `).join('')}
        </div>
        
        <div class="menu-items" id="menuItems">
            ${restaurant.menu.map(item => `
                <div class="menu-item" data-category="${item.category}">
                    <img src="https://picsum.photos/seed/${item.name}/120/120" alt="${item.name}" class="menu-item-image">
                    <div class="menu-item-info">
                        <div>
                            <h3 class="menu-item-name">${item.name}</h3>
                            <p class="menu-item-description">${item.description}</p>
                        </div>
                        <div class="menu-item-footer">
                            <span class="menu-item-price">$${item.price.toFixed(2)}</span>
                            <button class="add-to-cart-button" onclick="addToCart(${JSON.stringify(item).replace(/"/g, '&quot;')})">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Filter Menu
function filterMenu(category) {
    const buttons = document.querySelectorAll('.category-button');
    const items = document.querySelectorAll('.menu-item');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === category || (category === 'all' && btn.textContent === 'All')) {
            btn.classList.add('active');
        }
    });
    
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add to Cart
function addToCart(item) {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    saveCartToStorage();
    updateCartUI();
    showToast(`${item.name} added to cart!`);
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <p class="empty-state-text">Your cart is empty</p>
                <p>Add some delicious food!</p>
            </div>
        `;
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="https://picsum.photos/seed/${item.name}/60/60" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                </div>
                <div class="quantity-controls">
                    <button class="quantity-button" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-button" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

// Update Quantity
function updateQuantity(itemId, change) {
    const item = cart.find(item => item.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(item => item.id !== itemId);
        }
        saveCartToStorage();
        updateCartUI();
    }
}

// Toggle Cart
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    cartSidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    toggleCart();
    
    // Generate random order ID
    const orderId = 'QB' + Math.floor(10000 + Math.random() * 90000);
    document.getElementById('orderId').textContent = `Order #${orderId}`;
    
    // Show order tracking
    document.getElementById('restaurantsGrid').style.display = 'none';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('orderTracking').style.display = 'block';
    
    // Clear cart
    cart = [];
    saveCartToStorage();
    updateCartUI();
    
    // Simulate order tracking
    simulateOrderTracking();
}

// Simulate Order Tracking
function simulateOrderTracking() {
    let currentStep = 1;
    const steps = ['step1', 'step2', 'step3', 'step4'];
    
    const interval = setInterval(() => {
        if (currentStep < steps.length) {
            document.getElementById(steps[currentStep]).classList.add('active');
            currentStep++;
        } else {
            clearInterval(interval);
            showToast('Order delivered! Enjoy your meal! 🎉');
        }
    }, 3000);
}

// Search Restaurants
function searchRestaurants() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        displayRestaurants();
        return;
    }
    
    const filtered = restaurants.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm) ||
        restaurant.cuisine.toLowerCase().includes(searchTerm)
    );
    
    displayRestaurants(filtered);
}

// Filter by Category
function filterByCategory(element, category) {
    // Update active state
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    element.classList.add('active');
    
    // Filter restaurants
    if (category === 'all') {
        displayRestaurants();
    } else {
        const filtered = restaurants.filter(restaurant => restaurant.category === category);
        displayRestaurants(filtered);
    }
}

// Show Home
function showHome() {
    document.getElementById('restaurantsGrid').style.display = 'grid';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('orderTracking').style.display = 'none';
}

// Show Restaurants
function showRestaurants() {
    showHome();
}

// Show Orders
function showOrders() {
    document.getElementById('restaurantsGrid').style.display = 'none';
    document.getElementById('menuSection').style.display = 'none';
    document.getElementById('orderTracking').style.display = 'block';
}

// Local Storage Functions
function saveCartToStorage() {
    localStorage.setItem('quickbite_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('quickbite_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Search on Enter key
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchRestaurants();
    }
});