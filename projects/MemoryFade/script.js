// Memory Fade Interface - Main Script
document.addEventListener('DOMContentLoaded', function() {
    // Initial memories data
    let memories = [
        {
            id: 1,
            title: "First Day at University",
            content: "The excitement of stepping onto campus for the first time, meeting new friends, and the promise of new beginnings.",
            type: "personal",
            importance: 5,
            clarity: 100,
            interactions: 12,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            lastInteraction: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            status: "active"
        },
        {
            id: 2,
            title: "Project Alpha Brainstorm",
            content: "Initial brainstorming session for the new project. Great ideas about user interface and functionality were discussed.",
            type: "work",
            importance: 4,
            clarity: 75,
            interactions: 8,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            status: "fading"
        },
        {
            id: 3,
            title: "Morning Coffee Ritual",
            content: "The perfect way to start the day: fresh ground beans, slow pour-over, and 10 minutes of quiet reflection.",
            type: "personal",
            importance: 3,
            clarity: 60,
            interactions: 5,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            lastInteraction: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            status: "fading"
        },
        {
            id: 4,
            title: "Innovation Workshop Ideas",
            content: "Key takeaways from the innovation workshop: design thinking principles, rapid prototyping techniques, and user testing methods.",
            type: "work",
            importance: 4,
            clarity: 45,
            interactions: 6,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            lastInteraction: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            status: "fading-heavy"
        },
        {
            id: 5,
            title: "Weekend Hiking Trip",
            content: "Beautiful trails through the mountains, breathtaking views from the summit, and the perfect weather for an outdoor adventure.",
            type: "personal",
            importance: 4,
            clarity: 85,
            interactions: 15,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            lastInteraction: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
            status: "active"
        },
        {
            id: 6,
            title: "Creative Writing Inspiration",
            content: "Found an amazing quote about creativity: 'The role of the artist is to ask questions, not answer them.' Planning to use this in my next piece.",
            type: "inspiration",
            importance: 2,
            clarity: 30,
            interactions: 3,
            createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
            lastInteraction: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
            status: "fading-critical"
        },
        {
            id: 7,
            title: "Team Building Exercise",
            content: "The escape room activity really helped our team work better together. Learned about communication and problem-solving under pressure.",
            type: "work",
            importance: 3,
            clarity: 70,
            interactions: 9,
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
            lastInteraction: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
            status: "active"
        },
        {
            id: 8,
            title: "Product Launch Strategy",
            content: "Detailed plan for launching the new product line, including marketing channels, timeline, and key performance indicators.",
            type: "work",
            importance: 5,
            clarity: 95,
            interactions: 18,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            lastInteraction: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            status: "active"
        }
    ];

    // DOM Elements
    const memoriesGrid = document.getElementById('memoriesGrid');
    const addMemoryBtn = document.getElementById('addMemoryBtn');
    const resetAllBtn = document.getElementById('resetAllBtn');
    const fadeSpeedSlider = document.getElementById('fadeSpeed');
    const speedValue = document.getElementById('speedValue');
    const autoFadeToggle = document.getElementById('autoFadeToggle');
    const addMemoryModal = document.getElementById('addMemoryModal');
    const memoryDetailModal = document.getElementById('memoryDetailModal');
    const closeMemoryModal = document.getElementById('closeMemoryModal');
    const closeDetailModal = document.getElementById('closeDetailModal');
    const cancelMemoryBtn = document.getElementById('cancelMemoryBtn');
    const memoryForm = document.getElementById('memoryForm');
    const typeOptions = document.querySelectorAll('.type-option');
    const reviveMemoryBtn = document.getElementById('reviveMemoryBtn');
    const editMemoryBtn = document.getElementById('editMemoryBtn');
    const shareMemoryBtn = document.getElementById('shareMemoryBtn');
    
    // Stats elements
    const activeMemoriesElement = document.getElementById('activeMemories');
    const fadingMemoriesElement = document.getElementById('fadingMemories');
    const totalInteractionsElement = document.getElementById('totalInteractions');
    const totalMemoriesElement = document.getElementById('totalMemories');
    const avgClarityElement = document.getElementById('avgClarity');
    const timeElapsedElement = document.getElementById('timeElapsed');
    
    let currentMemoryId = null;
    let fadeSpeed = 5;
    let autoFadeEnabled = true;
    let totalInteractions = memories.reduce((sum, memory) => sum + memory.interactions, 0);
    let elapsedMinutes = 0;
    
    // Fade speed mapping
    const fadeSpeedMap = {
        1: "Very Slow",
        2: "Slow",
        3: "Slow",
        4: "Slow",
        5: "Medium",
        6: "Medium",
        7: "Fast",
        8: "Fast",
        9: "Very Fast",
        10: "Extreme"
    };

    // Initialize the interface
    function init() {
        renderMemories();
        updateStats();
        startFadeTimer();
        startElapsedTimeCounter();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        addMemoryBtn.addEventListener('click', () => openAddMemoryModal());
        resetAllBtn.addEventListener('click', resetAllMemories);
        fadeSpeedSlider.addEventListener('input', updateFadeSpeed);
        autoFadeToggle.addEventListener('change', toggleAutoFade);
        closeMemoryModal.addEventListener('click', () => addMemoryModal.classList.remove('active'));
        closeDetailModal.addEventListener('click', () => memoryDetailModal.classList.remove('active'));
        cancelMemoryBtn.addEventListener('click', () => addMemoryModal.classList.remove('active'));
        reviveMemoryBtn.addEventListener('click', reviveCurrentMemory);
        editMemoryBtn.addEventListener('click', editCurrentMemory);
        shareMemoryBtn.addEventListener('click', shareCurrentMemory);
        
        memoryForm.addEventListener('submit', saveMemory);
        
        // Type option selection
        typeOptions.forEach(option => {
            option.addEventListener('click', function() {
                typeOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('memoryType').value = this.dataset.type;
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === addMemoryModal) addMemoryModal.classList.remove('active');
            if (e.target === memoryDetailModal) memoryDetailModal.classList.remove('active');
        });
    }

    // Render memories to the grid
    function renderMemories() {
        memoriesGrid.innerHTML = '';
        
        memories.forEach(memory => {
            const memoryCard = createMemoryCard(memory);
            memoriesGrid.appendChild(memoryCard);
        });
        
        updateStats();
    }

    // Create a memory card element
    function createMemoryCard(memory) {
        const card = document.createElement('div');
        card.className = `memory-card ${memory.status}`;
        card.dataset.id = memory.id;
        
        // Calculate time since last interaction
        const timeSinceInteraction = Math.floor((Date.now() - new Date(memory.lastInteraction)) / (1000 * 60)); // in minutes
        const timeText = timeSinceInteraction < 60 
            ? `${timeSinceInteraction}m ago` 
            : timeSinceInteraction < 1440 
                ? `${Math.floor(timeSinceInteraction / 60)}h ago` 
                : `${Math.floor(timeSinceInteraction / 1440)}d ago`;
        
        // Determine clarity bar color
        let clarityColor;
        if (memory.clarity >= 70) clarityColor = 'var(--success-color)';
        else if (memory.clarity >= 40) clarityColor = 'var(--warning-color)';
        else clarityColor = 'var(--danger-color)';
        
        card.innerHTML = `
            <div class="memory-header">
                <h3 class="memory-title">${memory.title}</h3>
                <span class="memory-type">${memory.type}</span>
            </div>
            <p class="memory-content">${memory.content}</p>
            <div class="memory-meta">
                <div class="clarity-indicator">
                    <i class="ri-heart-3-line"></i>
                    <span>${memory.clarity}%</span>
                    <div class="clarity-bar">
                        <div class="clarity-level" style="width: ${memory.clarity}%; background: ${clarityColor};"></div>
                    </div>
                </div>
                <div class="memory-time">
                    <i class="ri-time-line"></i>
                    <span>${timeText}</span>
                </div>
                <div class="memory-interactions">
                    <i class="ri-hand-heart-line"></i>
                    <span>${memory.interactions}</span>
                </div>
            </div>
        `;
        
        // Add interaction event listeners
        card.addEventListener('click', () => viewMemoryDetail(memory.id));
        
        card.addEventListener('mouseenter', function() {
            // Temporarily pause fading while hovering
            this.style.transition = 'opacity 0.5s ease, filter 0.5s ease';
            this.style.opacity = '1';
            this.style.filter = 'blur(0px)';
        });
        
        card.addEventListener('mouseleave', function() {
            // Restore fading state
            this.style.transition = 'opacity 2s ease, filter 2s ease';
            updateCardAppearance(this, memory);
        });
        
        // Set initial appearance based on clarity
        updateCardAppearance(card, memory);
        
        return card;
    }

    // Update card appearance based on clarity
    function updateCardAppearance(card, memory) {
        if (memory.clarity >= 70) {
            card.style.opacity = '1';
            card.style.filter = 'blur(0px)';
            card.className = 'memory-card active';
        } else if (memory.clarity >= 40) {
            card.style.opacity = '0.7';
            card.style.filter = 'blur(1px)';
            card.className = 'memory-card fading';
        } else if (memory.clarity >= 10) {
            card.style.opacity = '0.4';
            card.style.filter = 'blur(2px)';
            card.className = 'memory-card fading-heavy';
        } else {
            card.style.opacity = '0.2';
            card.style.filter = 'blur(3px)';
            card.className = 'memory-card fading-critical';
        }
    }

    // View memory details in modal
    function viewMemoryDetail(id) {
        const memory = memories.find(m => m.id === id);
        if (!memory) return;
        
        currentMemoryId = id;
        
        // Update modal content
        document.getElementById('detailMemoryTitle').textContent = memory.title;
        document.getElementById('detailCreated').textContent = formatDate(memory.createdAt);
        document.getElementById('detailClarity').textContent = `${memory.clarity}%`;
        document.getElementById('detailInteractions').textContent = memory.interactions;
        document.getElementById('detailStatus').textContent = memory.status.replace('-', ' ').toUpperCase();
        document.getElementById('detailContent').textContent = memory.content;
        
        // Record interaction
        interactWithMemory(id);
        
        // Show modal
        memoryDetailModal.classList.add('active');
    }

    // Open add memory modal
    function openAddMemoryModal() {
        // Reset form
        document.getElementById('memoryTitle').value = '';
        document.getElementById('memoryContent').value = '';
        document.getElementById('memoryType').value = 'personal';
        document.getElementById('memoryImportance').value = '3';
        
        // Reset type options
        typeOptions.forEach(opt => opt.classList.remove('active'));
        document.querySelector('.type-option[data-type="personal"]').classList.add('active');
        
        addMemoryModal.classList.add('active');
    }

    // Save new memory
    function saveMemory(e) {
        e.preventDefault();
        
        const title = document.getElementById('memoryTitle').value;
        const content = document.getElementById('memoryContent').value;
        const type = document.getElementById('memoryType').value;
        const importance = parseInt(document.getElementById('memoryImportance').value);
        
        // Create new memory
        const newId = memories.length > 0 ? Math.max(...memories.map(m => m.id)) + 1 : 1;
        const newMemory = {
            id: newId,
            title,
            content,
            type,
            importance,
            clarity: 100,
            interactions: 1,
            createdAt: new Date(),
            lastInteraction: new Date(),
            status: "active"
        };
        
        memories.push(newMemory);
        totalInteractions++;
        
        // Close modal and refresh
        addMemoryModal.classList.remove('active');
        renderMemories();
        
        showNotification(`Memory "${title}" added successfully!`);
    }

    // Revive current memory (increase clarity)
    function reviveCurrentMemory() {
        if (!currentMemoryId) return;
        
        const memoryIndex = memories.findIndex(m => m.id === currentMemoryId);
        if (memoryIndex === -1) return;
        
        // Increase clarity
        memories[memoryIndex].clarity = Math.min(100, memories[memoryIndex].clarity + 50);
        memories[memoryIndex].lastInteraction = new Date();
        memories[memoryIndex].interactions++;
        memories[memoryIndex].status = "active";
        
        totalInteractions++;
        
        // Update display
        renderMemories();
        memoryDetailModal.classList.remove('active');
        
        showNotification(`Memory revived! Clarity increased.`);
    }

    // Edit current memory
    function editCurrentMemory() {
        if (!currentMemoryId) return;
        
        const memory = memories.find(m => m.id === currentMemoryId);
        if (!memory) return;
        
        // For now, just increase clarity as a form of interaction
        memory.clarity = Math.min(100, memory.clarity + 20);
        memory.lastInteraction = new Date();
        memory.interactions++;
        memory.status = "active";
        
        totalInteractions++;
        
        // Update display
        renderMemories();
        
        showNotification(`Memory edited! Clarity refreshed.`);
    }

    // Share current memory
    function shareCurrentMemory() {
        if (!currentMemoryId) return;
        
        const memory = memories.find(m => m.id === currentMemoryId);
        if (!memory) return;
        
        // Sharing increases clarity
        memory.clarity = Math.min(100, memory.clarity + 15);
        memory.lastInteraction = new Date();
        memory.interactions++;
        
        totalInteractions++;
        
        // Update display
        renderMemories();
        
        // Simulate sharing
        const shareText = `Check out this memory: "${memory.title}" - ${memory.content.substring(0, 50)}...`;
        if (navigator.share) {
            navigator.share({
                title: memory.title,
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            navigator.clipboard.writeText(shareText);
            showNotification(`Memory copied to clipboard! Clarity increased.`);
        }
    }

    // Interact with a memory (click, view, etc.)
    function interactWithMemory(id) {
        const memoryIndex = memories.findIndex(m => m.id === id);
        if (memoryIndex === -1) return;
        
        // Increase clarity based on interaction
        memories[memoryIndex].clarity = Math.min(100, memories[memoryIndex].clarity + 10);
        memories[memoryIndex].lastInteraction = new Date();
        memories[memoryIndex].interactions++;
        memories[memoryIndex].status = "active";
        
        totalInteractions++;
        
        // Update display
        const card = document.querySelector(`.memory-card[data-id="${id}"]`);
        if (card) {
            card.style.transition = 'opacity 0.3s ease, filter 0.3s ease';
            updateCardAppearance(card, memories[memoryIndex]);
            
            // Gradually return to normal transition speed
            setTimeout(() => {
                card.style.transition = 'opacity 2s ease, filter 2s ease';
            }, 300);
        }
        
        updateStats();
    }

    // Fade memories over time
    function fadeMemories() {
        if (!autoFadeEnabled) return;
        
        const now = new Date();
        let anyChanged = false;
        
        memories.forEach(memory => {
            // Calculate time since last interaction (in minutes)
            const minutesSinceInteraction = Math.floor((now - new Date(memory.lastInteraction)) / (1000 * 60));
            
            // Calculate fade amount based on time and importance
            // Higher importance = slower fading
            const importanceFactor = 6 - memory.importance; // 5=slowest, 1=fastest
            const fadeAmount = (minutesSinceInteraction * fadeSpeed) / (importanceFactor * 100);
            
            if (fadeAmount > 0) {
                // Apply fading
                memory.clarity = Math.max(0, memory.clarity - fadeAmount);
                
                // Update status based on clarity
                if (memory.clarity >= 70) memory.status = "active";
                else if (memory.clarity >= 40) memory.status = "fading";
                else if (memory.clarity >= 10) memory.status = "fading-heavy";
                else memory.status = "fading-critical";
                
                anyChanged = true;
            }
        });
        
        if (anyChanged) {
            renderMemories();
        }
    }

    // Reset all memories to full clarity
    function resetAllMemories() {
        memories.forEach(memory => {
            memory.clarity = 100;
            memory.lastInteraction = new Date();
            memory.status = "active";
        });
        
        renderMemories();
        showNotification("All memories have been refreshed to full clarity!");
    }

    // Update fade speed
    function updateFadeSpeed() {
        fadeSpeed = parseInt(fadeSpeedSlider.value);
        speedValue.textContent = fadeSpeedMap[fadeSpeed];
    }

    // Toggle auto fade on/off
    function toggleAutoFade() {
        autoFadeEnabled = autoFadeToggle.checked;
        showNotification(`Auto fade ${autoFadeEnabled ? 'enabled' : 'disabled'}`);
    }

    // Update statistics
    function updateStats() {
        const activeCount = memories.filter(m => m.status === "active").length;
        const fadingCount = memories.filter(m => m.status !== "active").length;
        const totalCount = memories.length;
        const avgClarity = memories.length > 0 
            ? Math.round(memories.reduce((sum, m) => sum + m.clarity, 0) / memories.length)
            : 0;
        
        activeMemoriesElement.textContent = activeCount;
        fadingMemoriesElement.textContent = fadingCount;
        totalInteractionsElement.textContent = totalInteractions;
        totalMemoriesElement.textContent = totalCount;
        avgClarityElement.textContent = `${avgClarity}%`;
    }

    // Start the fade timer
    function startFadeTimer() {
        // Fade memories every 10 seconds
        setInterval(fadeMemories, 10000);
    }

    // Start elapsed time counter
    function startElapsedTimeCounter() {
        setInterval(() => {
            elapsedMinutes++;
            const hours = Math.floor(elapsedMinutes / 60);
            const minutes = elapsedMinutes % 60;
            
            if (hours > 0) {
                timeElapsedElement.textContent = `${hours}h ${minutes}m`;
            } else {
                timeElapsedElement.textContent = `${minutes}m`;
            }
        }, 60000); // Update every minute
    }

    // Format date to readable string
    function formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        
        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
        return `${Math.floor(diffMins / 1440)} days ago`;
    }

    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--card-color);
            color: var(--text-primary);
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            border-left: 4px solid var(--primary-color);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation keyframes if not already present
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

    // Initialize the app
    init();
});