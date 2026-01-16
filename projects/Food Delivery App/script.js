        // Category-specific images (added from attachments)
        const categoryImages = {
            Pizza: "images/pizza.jpg",
            Burger: "images/burger.jpg",
            Sushi: "images/sushi.jpg",
            Asian: "images/asian.jpg",
            Healthy: "images/healthy.jpg"
        };

        const restaurants = [
            { id: 1, name: "Burger Palace", 
                category: "Burger", time: "25 - 35 min", fee: "Free", rating: 4.8, image:"https://cdn.pixabay.com/photo/2022/08/29/17/44/burger-7419420_1280.jpg", price: 12.99 },
            { id: 2, name: "Pizza Express", category: "Pizza", time: "30 - 40 min", fee: "$2.99", rating: 4.5, image:"https://cdn.pixabay.com/photo/2020/05/17/04/22/pizza-5179939_1280.jpg", price: 15.50 },
            { id: 3, name: "Sushi Master", category: "Sushi", time: "35 - 45 min", fee: "$3.99", rating: 4.9, image:"http://culinarydestinations.net/wp-content/uploads/2015/07/japan-sushi.jpeg", price: 22.00 },
            { id: 4, name: "Green Bowl", category: "Healthy", time: "20 - 30 min", fee: "Free", rating: 4.6, image:"https://tse2.mm.bing.net/th/id/OIP.yuQtkcWsIfQufwrfgEIKagHaEJ?pid=Api&P=0&h=180", price: 10.99 },
            { id: 5, name: "Wok N Roll", category: "Asian", time: "40 - 50 min", fee: "$1.99", rating: 4.3, image:"https://tse2.mm.bing.net/th/id/OIP.PVlSrrV3bsXE3-mcCpMc8QHaFj?pid=Api&P=0&h=180", price: 14.50 }
        ];

        // Status Descriptions for Order Tracking
        const statusDescriptions = {
            0: "Initializing order...",
            1: "Our chef is carefully preparing your delicious meal.",
            2: "Your food is packed and the driver is on the way!",
            3: "The driver is just around the corner. Please be ready.",
            4: "Enjoy your meal! Bon appétit."
        };

        // --- Application Logic ---
        const app = {
            state: {
                cart: [],
                currentCategory: 'All',
                searchQuery: ''
            },

            init: () => {
                app.renderRestaurants();
                app.updateCartUI();
            },

            // Navigation
            navigate: (viewId) => {
                document.querySelectorAll('nav a').forEach(el => el.classList.remove('active'));
                const navLink = document.getElementById(`nav-${viewId}`);
                if(navLink) navLink.classList.add('active');

                document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
                document.getElementById(`view-${viewId}`).classList.add('active');

                if (viewId === 'cart') app.renderCart();
            },

            // Render Restaurants
            renderRestaurants: () => {
                const list = document.getElementById('restaurant-list');
                list.innerHTML = '';

                const filtered = restaurants.filter(r => {
                    const matchesCat = app.state.currentCategory === 'All' || r.category === app.state.currentCategory;
                    const matchesSearch = r.name.toLowerCase().includes(app.state.searchQuery.toLowerCase());
                    return matchesCat && matchesSearch;
                });

                if (filtered.length === 0) {
                    list.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777;">No restaurants found.</p>`;
                    return;
                }

                filtered.forEach(r => {
                    const feeClass = r.fee === 'Free' ? 'free' : 'fee';
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <img src="${r.image}" alt="${r.name}" class="card-img">
                        <div class="card-body">
                            <div class="card-header">
                                <div class="res-name">${r.name}</div>
                                <div class="rating">${r.rating} ★</div>
                            </div>
                            <div class="res-meta">
                                <span>${r.category}</span> • <span>${r.time}</span> • 
                                <span class="delivery-tag ${feeClass}">${r.fee} Delivery</span>
                            </div>
                            <button class="btn-add" onclick="app.addToCart(${r.id})">
                                Add Signature Dish ($${r.price.toFixed(2)})
                            </button>
                        </div>
                    `;
                    list.appendChild(card);
                });
            },

            filterCategory: (cat, btnElement) => {
                app.state.currentCategory = cat;
                document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
                btnElement.classList.add('active');
                app.renderRestaurants();
            },

            handleSearch: (val) => {
                app.state.searchQuery = val;
                app.renderRestaurants();
            },

            // Cart Logic
            addToCart: (id) => {
                const item = restaurants.find(r => r.id === id);
                app.state.cart.push({ ...item, cartId: Date.now() });
                app.updateCartUI();
                app.showToast(`Added ${item.name} to cart`);
            },

            removeFromCart: (cartId) => {
                app.state.cart = app.state.cart.filter(item => item.cartId !== cartId);
                app.renderCart();
                app.updateCartUI();
            },

            updateCartUI: () => {
                document.getElementById('cart-count').innerText = app.state.cart.length;
            },

            renderCart: () => {
                const container = document.getElementById('cart-content');
                const cart = app.state.cart;
                
                if (cart.length === 0) {
                    container.innerHTML = `
                        <div class="empty-cart-msg">
                            <h3>Your cart is empty</h3>
                            <p>Add some delicious food!</p>
                            <br>
                            <button class="btn-checkout" onclick="app.navigate('home')">Browse Restaurants</button>
                        </div>`;
                    return;
                }

                let total = 0;
                let html = '';
                cart.forEach(item => {
                    total += item.price;
                    html += `
                        <div class="cart-item">
                            <div class="cart-item-info">
                                <h4>${item.name}</h4>
                                <p>${item.category} • Signature Dish</p>
                                <p>$${item.price.toFixed(2)}</p>
                            </div>
                            <button class="btn-remove" onclick="app.removeFromCart(${item.cartId})">Remove</button>
                        </div>`;
                });

                html += `<div class="cart-summary">
                    <div class="total-row">Total: $${total.toFixed(2)}</div>
                    <button class="btn-checkout" onclick="app.checkout()">Proceed to Checkout</button>
                </div>`;
                container.innerHTML = html;
            },

            checkout: () => {
                const id = 'QB' + Math.floor(10000 + Math.random() * 90000);
                document.getElementById('order-id-display').innerText = `Order #${id}`;
                app.state.cart = [];
                app.updateCartUI();

                document.querySelectorAll('.progress-step').forEach(el => el.classList.remove('active'));
                app.navigate('orders');
                
                // Start description text
                document.getElementById('status-text').innerText = statusDescriptions[0];
                
                app.animateProgress();
            },

            // Profile Logic
            saveProfile: (e) => {
                e.preventDefault();
                app.showToast("Profile updated successfully!");
            },

            // Progress Animation with Description
            animateProgress: () => {
                const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
                let currentStep = 0;

                const nextStep = () => {
                    if (currentStep < steps.length) {
                        // Activate circle
                        document.getElementById(steps[currentStep]).classList.add('active');
                        // Update text description (using currentStep + 1 because 1-based index in object)
                        document.getElementById('status-text').innerText = statusDescriptions[currentStep + 1];
                        
                        currentStep++;
                        setTimeout(nextStep, 2500);
                    }
                };
                setTimeout(nextStep, 500);
            },

            showToast: (message) => {
                const toast = document.getElementById("toast");
                toast.innerText = message;
                toast.className = "show";
                setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
            }
        };

        // --- Chatbot Logic ---
        const chatbot = {
            isOpen: false,
            
            toggle: () => {
                const win = document.getElementById('chat-window');
                chatbot.isOpen = !chatbot.isOpen;
                if(chatbot.isOpen) win.classList.add('open');
                else win.classList.remove('open');
            },

            handleEnter: (e) => {
                if(e.key === 'Enter') chatbot.send();
            },

            send: () => {
                const input = document.getElementById('chat-input');
                const text = input.value.trim();
                if(!text) return;

                // Add User Message
                chatbot.appendMessage(text, 'user');
                input.value = '';

                // Simulate Bot Response
                setTimeout(() => {
                    const response = chatbot.getResponse(text);
                    chatbot.appendMessage(response, 'bot');
                }, 1000);
            },

            appendMessage: (text, sender) => {
                const container = document.getElementById('chat-messages');
                const div = document.createElement('div');
                div.className = `message ${sender}`;
                div.innerText = text;
                container.appendChild(div);
                container.scrollTop = container.scrollHeight;
            },

            getResponse: (input) => {
                const lower = input.toLowerCase();
                if(lower.includes('hello') || lower.includes('hi')) return "Hi there! How can I assist you with your order?";
                if(lower.includes('order')) return "You can view your active orders in the 'Orders' tab. Is there a specific issue?";
                if(lower.includes('menu') || lower.includes('pizza') || lower.includes('burger')) return "We have a great selection! Check the Home page to see all restaurants.";
                if(lower.includes('price') || lower.includes('cost')) return "Prices are listed on each restaurant card. Delivery fees vary by location.";
                return "I'm a simple demo bot. Try asking about your 'order', 'menu', or 'prices'.";
            }
        };

        document.addEventListener('DOMContentLoaded', app.init);