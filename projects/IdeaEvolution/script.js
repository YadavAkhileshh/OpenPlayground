// Idea Evolution Board - Main Script
document.addEventListener('DOMContentLoaded', function() {
    // Initial ideas data
    let ideas = [
        {
            id: 1,
            title: "Interactive Art Installation",
            description: "A public art piece that changes based on weather patterns and viewer interaction using sensors and projection mapping.",
            category: "art",
            createdAt: new Date(2024, 0, 15),
            lastEdited: new Date(2024, 2, 10),
            edits: 5,
            vitality: 85,
            status: "growing",
            evolution: [
                { date: "Jan 15, 2024", text: "Initial concept sketched" },
                { date: "Feb 2, 2024", text: "Added weather interaction element" },
                { date: "Feb 28, 2024", text: "Researched sensor technology" },
                { date: "Mar 10, 2024", text: "Created digital prototype" }
            ]
        },
        {
            id: 2,
            title: "Sustainable Packaging Solution",
            description: "Biodegradable packaging material made from agricultural waste that decomposes within 30 days.",
            category: "science",
            createdAt: new Date(2023, 10, 5),
            lastEdited: new Date(2024, 0, 20),
            edits: 8,
            vitality: 45,
            status: "decaying",
            evolution: [
                { date: "Nov 5, 2023", text: "Initial research on materials" },
                { date: "Nov 20, 2023", text: "First prototype created" },
                { date: "Dec 15, 2023", text: "Tested decomposition rate" },
                { date: "Jan 20, 2024", text: "Needs more research on durability" }
            ]
        },
        {
            id: 3,
            title: "AI-Powered Learning Assistant",
            description: "An adaptive learning platform that customizes educational content based on student performance and engagement.",
            category: "technology",
            createdAt: new Date(2024, 1, 1),
            lastEdited: new Date(2024, 2, 15),
            edits: 12,
            vitality: 95,
            status: "growing",
            evolution: [
                { date: "Feb 1, 2024", text: "Concept development" },
                { date: "Feb 15, 2024", text: "AI algorithm research" },
                { date: "Mar 1, 2024", text: "UI/UX design started" },
                { date: "Mar 15, 2024", text: "First prototype completed" }
            ]
        },
        {
            id: 4,
            title: "Urban Vertical Farming System",
            description: "Modular vertical farming units for urban environments with automated irrigation and nutrient delivery.",
            category: "design",
            createdAt: new Date(2023, 8, 10),
            lastEdited: new Date(2023, 11, 5),
            edits: 6,
            vitality: 25,
            status: "dormant",
            evolution: [
                { date: "Sep 10, 2023", text: "Initial concept" },
                { date: "Oct 5, 2023", text: "Designed modular system" },
                { date: "Nov 12, 2023", text: "Created 3D model" },
                { date: "Dec 5, 2023", text: "Project put on hold" }
            ]
        },
        {
            id: 5,
            title: "Community Time-Banking Platform",
            description: "A digital platform where community members can exchange services using time as currency rather than money.",
            category: "business",
            createdAt: new Date(2024, 0, 30),
            lastEdited: new Date(2024, 2, 5),
            edits: 7,
            vitality: 75,
            status: "maturing",
            evolution: [
                { date: "Jan 30, 2024", text: "Initial concept" },
                { date: "Feb 10, 2024", text: "Market research completed" },
                { date: "Feb 25, 2024", text: "Platform architecture designed" },
                { date: "Mar 5, 2024", text: "Beta testing phase started" }
            ]
        },
        {
            id: 6,
            title: "AR Historical City Guide",
            description: "Augmented reality app that overlays historical images and information onto current cityscapes through smartphone cameras.",
            category: "technology",
            createdAt: new Date(2023, 11, 15),
            lastEdited: new Date(2024, 1, 28),
            edits: 9,
            vitality: 60,
            status: "maturing",
            evolution: [
                { date: "Dec 15, 2023", text: "Concept development" },
                { date: "Jan 5, 2024", text: "AR technology research" },
                { date: "Jan 20, 2024", text: "Historical data collection" },
                { date: "Feb 28, 2024", text: "Prototype development" }
            ]
        }
    ];

    // DOM Elements
    const ideasBoard = document.getElementById('ideasBoard');
    const addIdeaBtn = document.getElementById('addIdeaBtn');
    const simulateTimeBtn = document.getElementById('simulateTimeBtn');
    const filterStatus = document.getElementById('filterStatus');
    const sortBy = document.getElementById('sortBy');
    const ideaModal = document.getElementById('ideaModal');
    const editModal = document.getElementById('editModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const ideaForm = document.getElementById('ideaForm');
    const editIdeaBtn = document.getElementById('editIdeaBtn');
    const reviveIdeaBtn = document.getElementById('reviveIdeaBtn');
    const vitalitySlider = document.getElementById('ideaVitality');
    const vitalityValue = document.getElementById('vitalityValue');
    
    // Stats elements
    const totalIdeasElement = document.getElementById('totalIdeas');
    const growingIdeasElement = document.getElementById('growingIdeas');
    const decayingIdeasElement = document.getElementById('decayingIdeas');
    const avgVitalityElement = document.getElementById('avgVitality');
    
    let currentIdeaId = null;
    let editingIdeaId = null;

    // Initialize the board
    function init() {
        renderIdeas();
        updateStats();
        setupEventListeners();
    }

    // Set up event listeners
    function setupEventListeners() {
        addIdeaBtn.addEventListener('click', () => openEditModal());
        simulateTimeBtn.addEventListener('click', simulateTimePassing);
        filterStatus.addEventListener('change', renderIdeas);
        sortBy.addEventListener('change', renderIdeas);
        closeModalBtn.addEventListener('click', () => ideaModal.classList.remove('active'));
        closeEditModalBtn.addEventListener('click', () => editModal.classList.remove('active'));
        cancelEditBtn.addEventListener('click', () => editModal.classList.remove('active'));
        editIdeaBtn.addEventListener('click', () => {
            ideaModal.classList.remove('active');
            openEditModal(currentIdeaId);
        });
        reviveIdeaBtn.addEventListener('click', reviveIdea);
        
        ideaForm.addEventListener('submit', saveIdea);
        
        vitalitySlider.addEventListener('input', function() {
            vitalityValue.textContent = `${this.value}%`;
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === ideaModal) ideaModal.classList.remove('active');
            if (e.target === editModal) editModal.classList.remove('active');
        });
    }

    // Render ideas to the board
    function renderIdeas() {
        ideasBoard.innerHTML = '';
        
        // Filter ideas
        let filteredIdeas = ideas;
        if (filterStatus.value !== 'all') {
            filteredIdeas = ideas.filter(idea => idea.status === filterStatus.value);
        }
        
        // Sort ideas
        filteredIdeas = sortIdeas(filteredIdeas, sortBy.value);
        
        // Create idea cards
        filteredIdeas.forEach(idea => {
            const ideaCard = createIdeaCard(idea);
            ideasBoard.appendChild(ideaCard);
        });
        
        updateStats();
    }

    // Sort ideas based on selected criteria
    function sortIdeas(ideasArray, criteria) {
        const sorted = [...ideasArray];
        
        switch(criteria) {
            case 'vitality':
                return sorted.sort((a, b) => b.vitality - a.vitality);
            case 'recent':
                return sorted.sort((a, b) => new Date(b.lastEdited) - new Date(a.lastEdited));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.lastEdited) - new Date(b.lastEdited));
            case 'edits':
                return sorted.sort((a, b) => b.edits - a.edits);
            default:
                return sorted;
        }
    }

    // Create an idea card element
    function createIdeaCard(idea) {
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.dataset.id = idea.id;
        
        // Determine status class
        const statusClass = `status-${idea.status}`;
        
        // Calculate days since last edit
        const daysSinceEdit = Math.floor((new Date() - new Date(idea.lastEdited)) / (1000 * 60 * 60 * 24));
        
        // Determine vitality color
        let vitalityColor;
        if (idea.vitality >= 70) vitalityColor = '#a8d8ea';
        else if (idea.vitality >= 40) vitalityColor = '#ffd8b8';
        else vitalityColor = '#f8c8c8';
        
        card.innerHTML = `
            <div class="idea-header">
                <h3 class="idea-title">${idea.title}</h3>
                <span class="idea-status ${statusClass}">${idea.status}</span>
            </div>
            <p class="idea-description">${idea.description}</p>
            <div class="idea-meta">
                <div class="meta-item">
                    <i class="fas fa-heartbeat"></i>
                    <span>Vitality: <strong>${idea.vitality}%</strong></span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-history"></i>
                    <span>Age: <strong>${Math.floor((new Date() - new Date(idea.createdAt)) / (1000 * 60 * 60 * 24))} days</strong></span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-edit"></i>
                    <span>Edits: <strong>${idea.edits}</strong></span>
                </div>
            </div>
            <div class="vitality-bar">
                <div class="vitality-level" style="width: ${idea.vitality}%; background: ${vitalityColor};"></div>
            </div>
            <div class="idea-footer">
                <div class="idea-category">
                    <i class="fas fa-tag"></i> ${idea.category}
                </div>
                <div class="idea-actions">
                    <button class="btn-view" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-edit" title="Edit Idea">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to card buttons
        card.querySelector('.btn-view').addEventListener('click', (e) => {
            e.stopPropagation();
            viewIdea(idea.id);
        });
        
        card.querySelector('.btn-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(idea.id);
        });
        
        // Make the whole card clickable to view details
        card.addEventListener('click', () => viewIdea(idea.id));
        
        return card;
    }

    // View idea details in modal
    function viewIdea(id) {
        const idea = ideas.find(i => i.id === id);
        if (!idea) return;
        
        currentIdeaId = id;
        
        // Update modal content
        document.getElementById('modalIdeaTitle').textContent = idea.title;
        document.getElementById('modalVitality').textContent = `${idea.vitality}%`;
        document.getElementById('modalAge').textContent = `${Math.floor((new Date() - new Date(idea.createdAt)) / (1000 * 60 * 60 * 24))} days`;
        document.getElementById('modalEdits').textContent = idea.edits;
        document.getElementById('modalLastActive').textContent = formatDate(idea.lastEdited);
        document.getElementById('modalDescription').textContent = idea.description;
        
        // Update timeline
        const timeline = document.getElementById('modalTimeline');
        timeline.innerHTML = '';
        
        idea.evolution.forEach(event => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.innerHTML = `
                <div class="timeline-date">${event.date}</div>
                <div class="timeline-text">${event.text}</div>
            `;
            timeline.appendChild(item);
        });
        
        // Show modal
        ideaModal.classList.add('active');
    }

    // Open edit modal for new or existing idea
    function openEditModal(id = null) {
        editingIdeaId = id;
        
        if (id) {
            // Editing existing idea
            const idea = ideas.find(i => i.id === id);
            document.getElementById('editModalTitle').textContent = 'Edit Idea';
            document.getElementById('ideaTitle').value = idea.title;
            document.getElementById('ideaDescription').value = idea.description;
            document.getElementById('ideaCategory').value = idea.category;
            document.getElementById('ideaVitality').value = idea.vitality;
            vitalityValue.textContent = `${idea.vitality}%`;
        } else {
            // Adding new idea
            document.getElementById('editModalTitle').textContent = 'Add New Idea';
            document.getElementById('ideaTitle').value = '';
            document.getElementById('ideaDescription').value = '';
            document.getElementById('ideaCategory').value = 'technology';
            document.getElementById('ideaVitality').value = 80;
            vitalityValue.textContent = '80%';
        }
        
        editModal.classList.add('active');
    }

    // Save idea (new or edited)
    function saveIdea(e) {
        e.preventDefault();
        
        const title = document.getElementById('ideaTitle').value;
        const description = document.getElementById('ideaDescription').value;
        const category = document.getElementById('ideaCategory').value;
        const vitality = parseInt(document.getElementById('ideaVitality').value);
        
        if (editingIdeaId) {
            // Update existing idea
            const ideaIndex = ideas.findIndex(i => i.id === editingIdeaId);
            if (ideaIndex !== -1) {
                ideas[ideaIndex].title = title;
                ideas[ideaIndex].description = description;
                ideas[ideaIndex].category = category;
                ideas[ideaIndex].vitality = vitality;
                ideas[ideaIndex].lastEdited = new Date();
                ideas[ideaIndex].edits += 1;
                
                // Add to evolution timeline
                ideas[ideaIndex].evolution.push({
                    date: formatDate(new Date()),
                    text: "Idea edited and updated"
                });
                
                // Update status based on vitality
                updateIdeaStatus(ideas[ideaIndex]);
            }
        } else {
            // Create new idea
            const newId = ideas.length > 0 ? Math.max(...ideas.map(i => i.id)) + 1 : 1;
            const newIdea = {
                id: newId,
                title,
                description,
                category,
                createdAt: new Date(),
                lastEdited: new Date(),
                edits: 1,
                vitality,
                status: vitality >= 70 ? 'growing' : vitality >= 40 ? 'maturing' : 'decaying',
                evolution: [
                    { date: formatDate(new Date()), text: "Idea created" }
                ]
            };
            ideas.push(newIdea);
        }
        
        // Close modal and refresh display
        editModal.classList.remove('active');
        renderIdeas();
    }

    // Revive an idea (increase vitality)
    function reviveIdea() {
        if (!currentIdeaId) return;
        
        const ideaIndex = ideas.findIndex(i => i.id === currentIdeaId);
        if (ideaIndex === -1) return;
        
        // Increase vitality
        ideas[ideaIndex].vitality = Math.min(100, ideas[ideaIndex].vitality + 30);
        ideas[ideaIndex].lastEdited = new Date();
        ideas[ideaIndex].edits += 1;
        
        // Add to evolution timeline
        ideas[ideaIndex].evolution.push({
            date: formatDate(new Date()),
            text: "Idea revived - vitality increased"
        });
        
        // Update status
        updateIdeaStatus(ideas[ideaIndex]);
        
        // Close modal and refresh
        ideaModal.classList.remove('active');
        renderIdeas();
    }

    // Simulate time passing (decrease vitality of older ideas)
    function simulateTimePassing() {
        const daysToAdvance = 7; // Simulate one week passing
        
        ideas.forEach(idea => {
            // Calculate how many days since last edit
            const daysSinceEdit = Math.floor((new Date() - new Date(idea.lastEdited)) / (1000 * 60 * 60 * 24));
            
            // Decrease vitality based on inactivity
            let vitalityDecrease = 0;
            if (daysSinceEdit > 60) vitalityDecrease = 15;
            else if (daysSinceEdit > 30) vitalityDecrease = 10;
            else if (daysSinceEdit > 14) vitalityDecrease = 5;
            else vitalityDecrease = 2;
            
            // Apply vitality decrease
            idea.vitality = Math.max(0, idea.vitality - vitalityDecrease);
            
            // Update status
            updateIdeaStatus(idea);
            
            // Add to evolution timeline if vitality changed significantly
            if (vitalityDecrease >= 5) {
                idea.evolution.push({
                    date: formatDate(new Date()),
                    text: `Time passed - vitality decreased by ${vitalityDecrease}%`
                });
            }
        });
        
        renderIdeas();
        
        // Show notification
        showNotification(`Simulated ${daysToAdvance} days passing. Ideas have evolved.`);
    }

    // Update idea status based on vitality
    function updateIdeaStatus(idea) {
        if (idea.vitality >= 70) idea.status = 'growing';
        else if (idea.vitality >= 40) idea.status = 'maturing';
        else if (idea.vitality >= 10) idea.status = 'decaying';
        else idea.status = 'dormant';
    }

    // Update statistics
    function updateStats() {
        totalIdeasElement.textContent = ideas.length;
        
        const growing = ideas.filter(i => i.status === 'growing').length;
        growingIdeasElement.textContent = growing;
        
        const decaying = ideas.filter(i => i.status === 'decaying' || i.status === 'dormant').length;
        decayingIdeasElement.textContent = decaying;
        
        const avgVitality = ideas.length > 0 
            ? Math.round(ideas.reduce((sum, idea) => sum + idea.vitality, 0) / ideas.length)
            : 0;
        avgVitalityElement.textContent = `${avgVitality}%`;
    }

    // Format date to readable string
    function formatDate(date) {
        const d = new Date(date);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    }

    // Show notification
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            border-left: 5px solid #a8d8ea;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        // Add animation keyframes
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
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