
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Inspirational quotes
        const inspirationalQuotes = [
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
            { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
            { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
            { text: "All our dreams can come true, if we have the courage to pursue them.", author: "Walt Disney" },
            { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
            { text: "Imagine your life the way you want it, then make it happen.", author: "Unknown" },
            { text: "Create the highest, grandest vision possible for your life, because you become what you believe.", author: "Oprah Winfrey" }
        ];

        // Sample vision items
        let visionItems = [
            {
                id: 1,
                title: "Bali Digital Nomad",
                category: "career",
                color: "pastel-blue",
                description: "Working remotely from a beach villa in Bali, surrounded by nature and inspiration.",
                icon: "fas fa-laptop",
                position: { x: 1, y: 1 }
            },
            {
                id: 2,
                title: "Meditate Daily",
                category: "health",
                color: "pastel-mint",
                description: "Establish a consistent meditation practice for mental clarity and peace.",
                icon: "fas fa-spa",
                position: { x: 2, y: 1 }
            },
            {
                id: 3,
                title: "Learn French",
                category: "education",
                color: "pastel-lavender",
                description: "Become conversational in French for travel and cultural enrichment.",
                icon: "fas fa-language",
                position: { x: 3, y: 1 }
            },
            {
                id: 4,
                title: "Financial Freedom",
                category: "finance",
                color: "pastel-peach",
                description: "Build passive income streams to achieve financial independence.",
                icon: "fas fa-chart-line",
                position: { x: 1, y: 2 }
            },
            {
                id: 5,
                title: "Japanese Cherry Blossoms",
                category: "travel",
                color: "pastel-pink",
                description: "Experience hanami season in Kyoto, surrounded by blooming sakura.",
                icon: "fas fa-plane",
                position: { x: 2, y: 2 }
            },
            {
                id: 6,
                title: "Publish a Book",
                category: "personal",
                color: "pastel-cream",
                description: "Write and publish a novel that inspires and entertains readers.",
                icon: "fas fa-book-open",
                position: { x: 3, y: 2 }
            }
        ];

        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Set random inspirational quote
            setRandomQuote();
            
            // Load vision items from localStorage if available
            const savedItems = localStorage.getItem('visionBoardItems');
            if (savedItems) {
                visionItems = JSON.parse(savedItems);
            }
            
            // Initialize category selection
            initCategorySelection();
            
            // Initialize color selection
            initColorSelection();
            
            // Load the vision board
            renderVisionBoard();
            
            // Set up event listeners
            setupEventListeners();
            
            // Set up layout options
            setupLayoutOptions();
            
            // Initialize drag and drop
            initDragAndDrop();
        });

        // Set random inspirational quote
        function setRandomQuote() {
            const randomIndex = Math.floor(Math.random() * inspirationalQuotes.length);
            const quote = inspirationalQuotes[randomIndex];
            document.getElementById('quoteText').textContent = quote.text;
            document.getElementById('quoteAuthor').textContent = quote.author;
        }

        // Initialize category selection in the form
        function initCategorySelection() {
            const categoryOptions = document.querySelectorAll('.category-option');
            const categoryInput = document.getElementById('visionCategory');
            
            categoryOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected class from all options
                    categoryOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    // Update the hidden input value
                    categoryInput.value = this.dataset.category;
                });
                
                // Set the first option as selected by default
                if (option.dataset.category === categoryInput.value) {
                    option.classList.add('selected');
                }
            });
        }

        // Initialize color selection in the form
        function initColorSelection() {
            const colorOptions = document.querySelectorAll('.color-option');
            const colorInput = document.getElementById('visionColor');
            
            colorOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove selected class from all options
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    
                    // Add selected class to clicked option
                    this.classList.add('selected');
                    
                    // Update the hidden input value
                    colorInput.value = this.dataset.color;
                });
                
                // Set the first option as selected by default
                if (option.dataset.color === colorInput.value) {
                    option.classList.add('selected');
                }
            });
        }

        // Set up event listeners
        function setupEventListeners() {
            // Form submission
            const form = document.getElementById('visionForm');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                addVisionItem();
            });
            
            // Generate board button
            document.getElementById('generateBoardBtn').addEventListener('click', generateSampleBoard);
            
            // Save board button
            document.getElementById('saveBoardBtn').addEventListener('click', saveBoard);
            
            // Export board button
            document.getElementById('exportBoardBtn').addEventListener('click', exportBoard);
            
            // Clear board button
            document.getElementById('clearBoardBtn').addEventListener('click', clearBoard);
        }

        // Set up layout options
        function setupLayoutOptions() {
            const layoutOptions = document.querySelectorAll('.layout-option');
            
            layoutOptions.forEach(option => {
                option.addEventListener('click', function() {
                    // Remove active class from all options
                    layoutOptions.forEach(opt => opt.classList.remove('active'));
                    
                    // Add active class to clicked option
                    this.classList.add('active');
                    
                    // Get the layout type
                    const layout = this.dataset.layout;
                    
                    // Apply the layout (in a full implementation, this would change the layout)
                    // For now, we'll just show a notification
                    showNotification(`Switched to ${layout} layout`, 'info');
                });
            });
        }

        // Initialize drag and drop
        function initDragAndDrop() {
            const visionBoard = document.getElementById('visionBoard');
            
            let draggedItem = null;
            
            // Add event listeners for drag and drop
            visionBoard.addEventListener('dragstart', function(e) {
                if (e.target.classList.contains('vision-item')) {
                    draggedItem = e.target;
                    e.target.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', e.target.dataset.id);
                }
            });
            
            visionBoard.addEventListener('dragend', function(e) {
                if (draggedItem) {
                    draggedItem.classList.remove('dragging');
                    draggedItem = null;
                }
            });
            
            visionBoard.addEventListener('dragover', function(e) {
                e.preventDefault();
                visionBoard.classList.add('drop-zone');
            });
            
            visionBoard.addEventListener('dragleave', function(e) {
                visionBoard.classList.remove('drop-zone');
            });
            
            visionBoard.addEventListener('drop', function(e) {
                e.preventDefault();
                visionBoard.classList.remove('drop-zone');
                
                if (draggedItem) {
                    // In a full implementation, we would update the position of the item
                    showNotification('Vision item moved', 'info');
                }
            });
        }

        // Add a vision item
        function addVisionItem() {
            const title = document.getElementById('visionTitle').value;
            const category = document.getElementById('visionCategory').value;
            const color = document.getElementById('visionColor').value;
            const description = document.getElementById('visionDescription').value;
            
            // Get icon based on category
            const icon = getCategoryIcon(category);
            
            // Create new vision item object
            const newVisionItem = {
                id: Date.now(), // Simple ID generation
                title: title,
                category: category,
                color: color,
                description: description,
                icon: icon,
                position: getNextAvailablePosition()
            };
            
            // Add to vision items array
            visionItems.push(newVisionItem);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Clear the form
            document.getElementById('visionForm').reset();
            
            // Reset category selection
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.category-option[data-category="career"]').classList.add('selected');
            document.getElementById('visionCategory').value = 'career';
            
            // Reset color selection
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.color-option[data-color="pastel-pink"]').classList.add('selected');
            document.getElementById('visionColor').value = 'pastel-pink';
            
            // Update the vision board
            renderVisionBoard();
            
            // Show success message
            showNotification('Vision added to your board! ✨', 'success');
        }

        // Get icon based on category
        function getCategoryIcon(category) {
            const icons = {
                career: 'fas fa-briefcase',
                personal: 'fas fa-heart',
                health: 'fas fa-spa',
                finance: 'fas fa-piggy-bank',
                travel: 'fas fa-plane',
                education: 'fas fa-graduation-cap'
            };
            
            return icons[category] || 'fas fa-star';
        }

        // Get next available position on the board
        function getNextAvailablePosition() {
            // Simple grid positioning - in a full implementation, this would be more sophisticated
            const positions = visionItems.map(item => `${item.position.x},${item.position.y}`);
            
            for (let y = 1; y <= 3; y++) {
                for (let x = 1; x <= 3; x++) {
                    if (!positions.includes(`${x},${y}`)) {
                        return { x, y };
                    }
                }
            }
            
            // If all positions are taken, use a random one
            return { x: Math.floor(Math.random() * 3) + 1, y: Math.floor(Math.random() * 3) + 1 };
        }

        // Edit a vision item
        function editVisionItem(id) {
            const item = visionItems.find(v => v.id === id);
            if (!item) return;
            
            // Populate the form with item data
            document.getElementById('visionTitle').value = item.title;
            document.getElementById('visionDescription').value = item.description;
            
            // Set the category
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector(`.category-option[data-category="${item.category}"]`).classList.add('selected');
            document.getElementById('visionCategory').value = item.category;
            
            // Set the color
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector(`.color-option[data-color="${item.color}"]`).classList.add('selected');
            document.getElementById('visionColor').value = item.color;
            
            // Change form button to "Update"
            const formButton = document.querySelector('.btn-add');
            formButton.innerHTML = '<i class="fas fa-save"></i> Update Vision';
            formButton.onclick = function(e) {
                e.preventDefault();
                updateVisionItem(id);
            };
            
            // Scroll to form
            document.querySelector('.sidebar').scrollIntoView({ behavior: 'smooth' });
            
            showNotification('Editing vision item...', 'info');
        }

        // Update a vision item
        function updateVisionItem(id) {
            const index = visionItems.findIndex(v => v.id === id);
            if (index === -1) return;
            
            // Update item data
            visionItems[index].title = document.getElementById('visionTitle').value;
            visionItems[index].category = document.getElementById('visionCategory').value;
            visionItems[index].color = document.getElementById('visionColor').value;
            visionItems[index].description = document.getElementById('visionDescription').value;
            visionItems[index].icon = getCategoryIcon(visionItems[index].category);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Reset form
            document.getElementById('visionForm').reset();
            
            // Reset category selection
            const categoryOptions = document.querySelectorAll('.category-option');
            categoryOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.category-option[data-category="career"]').classList.add('selected');
            document.getElementById('visionCategory').value = 'career';
            
            // Reset color selection
            const colorOptions = document.querySelectorAll('.color-option');
            colorOptions.forEach(opt => opt.classList.remove('selected'));
            document.querySelector('.color-option[data-color="pastel-pink"]').classList.add('selected');
            document.getElementById('visionColor').value = 'pastel-pink';
            
            // Change form button back to "Add"
            const formButton = document.querySelector('.btn-add');
            formButton.innerHTML = '<i class="fas fa-plus-circle"></i> Add to Vision Board';
            formButton.onclick = function(e) {
                e.preventDefault();
                addVisionItem();
            };
            
            // Update the vision board
            renderVisionBoard();
            
            showNotification('Vision updated successfully!', 'success');
        }

        // Delete a vision item
        function deleteVisionItem(id) {
            if (!confirm('Are you sure you want to remove this vision from your board?')) return;
            
            // Remove item from array
            visionItems = visionItems.filter(v => v.id !== id);
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update the vision board
            renderVisionBoard();
            
            showNotification('Vision removed from board', 'info');
        }

        // Generate a sample vision board
        function generateSampleBoard() {
            if (visionItems.length > 0 && !confirm('This will replace your current vision board with a sample. Continue?')) {
                return;
            }
            
            // Reset to sample items
            visionItems = [
                {
                    id: 1,
                    title: "Bali Digital Nomad",
                    category: "career",
                    color: "pastel-blue",
                    description: "Working remotely from a beach villa in Bali, surrounded by nature and inspiration.",
                    icon: "fas fa-laptop",
                    position: { x: 1, y: 1 }
                },
                {
                    id: 2,
                    title: "Meditate Daily",
                    category: "health",
                    color: "pastel-mint",
                    description: "Establish a consistent meditation practice for mental clarity and peace.",
                    icon: "fas fa-spa",
                    position: { x: 2, y: 1 }
                },
                {
                    id: 3,
                    title: "Learn French",
                    category: "education",
                    color: "pastel-lavender",
                    description: "Become conversational in French for travel and cultural enrichment.",
                    icon: "fas fa-language",
                    position: { x: 3, y: 1 }
                },
                {
                    id: 4,
                    title: "Financial Freedom",
                    category: "finance",
                    color: "pastel-peach",
                    description: "Build passive income streams to achieve financial independence.",
                    icon: "fas fa-chart-line",
                    position: { x: 1, y: 2 }
                },
                {
                    id: 5,
                    title: "Japanese Cherry Blossoms",
                    category: "travel",
                    color: "pastel-pink",
                    description: "Experience hanami season in Kyoto, surrounded by blooming sakura.",
                    icon: "fas fa-plane",
                    position: { x: 2, y: 2 }
                },
                {
                    id: 6,
                    title: "Publish a Book",
                    category: "personal",
                    color: "pastel-cream",
                    description: "Write and publish a novel that inspires and entertains readers.",
                    icon: "fas fa-book-open",
                    position: { x: 3, y: 2 }
                }
            ];
            
            // Save to localStorage
            saveToLocalStorage();
            
            // Update the vision board
            renderVisionBoard();
            
            showNotification('Sample vision board generated! ✨', 'success');
        }

        // Save vision board
        function saveBoard() {
            saveToLocalStorage();
            showNotification('Vision board saved successfully!', 'success');
        }

        // Export vision board
        function exportBoard() {
            // In a full implementation, this would export the board as an image
            // For this demo, we'll export as JSON
            const dataStr = JSON.stringify(visionItems, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `vision-board-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            showNotification('Vision board exported as JSON', 'info');
        }

        // Clear vision board
        function clearBoard() {
            if (!confirm('Are you sure you want to clear your entire vision board? This cannot be undone.')) return;
            
            visionItems = [];
            saveToLocalStorage();
            renderVisionBoard();
            
            showNotification('Vision board cleared', 'info');
        }

        // Save vision items to localStorage
        function saveToLocalStorage() {
            localStorage.setItem('visionBoardItems', JSON.stringify(visionItems));
        }

        // Render the vision board
        function renderVisionBoard() {
            const visionBoard = document.getElementById('visionBoard');
            const emptyBoard = document.getElementById('emptyBoard');
            
            // Clear the vision board
            visionBoard.innerHTML = '';
            
            // If no vision items, show empty state
            if (visionItems.length === 0) {
                emptyBoard.style.display = 'flex';
                visionBoard.appendChild(emptyBoard);
                return;
            }
            
            // Hide empty state
            emptyBoard.style.display = 'none';
            
            // Create vision items
            visionItems.forEach(item => {
                const visionItem = document.createElement('div');
                visionItem.className = `vision-item ${item.category} ${item.color}`;
                visionItem.dataset.id = item.id;
                visionItem.draggable = true;
                
                // Get category name with first letter capitalized
                const categoryName = item.category.charAt(0).toUpperCase() + item.category.slice(1);
                
                // Create the vision item HTML
                visionItem.innerHTML = `
                    <div class="vision-item-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="vision-item-title">${item.title}</div>
                    <div class="vision-item-description">${item.description}</div>
                    <div class="vision-item-category">${categoryName}</div>
                    <div class="vision-item-actions">
                        <button class="vision-item-action-btn" onclick="editVisionItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="vision-item-action-btn" onclick="deleteVisionItem(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                // Apply grid position (simplified for this demo)
                const gridColumn = item.position.x;
                const gridRow = item.position.y;
                visionItem.style.gridColumn = gridColumn;
                visionItem.style.gridRow = gridRow;
                
                visionBoard.appendChild(visionItem);
            });
        }

        // Show notification
        function showNotification(message, type) {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i> ${message}`;
            notification.style.cssText = `
                position: fixed;
                top: 30px;
                right: 30px;
                padding: 18px 25px;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                z-index: 1000;
                box-shadow: var(--shadow-medium);
                animation: slideInRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 350px;
            `;
            
            // Set background color based on type
            if (type === 'success') {
                notification.style.backgroundColor = 'var(--accent)';
            } else if (type === 'error') {
                notification.style.backgroundColor = 'var(--primary)';
            } else {
                notification.style.backgroundColor = 'var(--secondary)';
            }
            
            // Add to page
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutRight 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 500);
            }, 3000);
            
            // Add CSS for animations
            if (!document.querySelector('#notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes slideOutRight {
                        from { transform: translateX(0); opacity: 1; }
                        to { transform: translateX(100%); opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
        }