// WanderWise - Destination Discovery & Itinerary Builder Script

// Mock destination data
const destinations = [
    {
        id: 1,
        name: "Bali, Indonesia",
        image: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400",
        description: "Tropical paradise with beautiful beaches, rice terraces, and vibrant culture.",
        interests: ["beach", "culture", "relaxation", "food"],
        duration: { min: 3, max: 14 },
        season: ["any"],
        budget: "moderate"
    },
    {
        id: 2,
        name: "Swiss Alps, Switzerland",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        description: "Majestic mountains, pristine lakes, and world-class skiing and hiking.",
        interests: ["mountain", "adventure", "nature"],
        duration: { min: 5, max: 21 },
        season: ["summer", "winter"],
        budget: "luxury"
    },
    {
        id: 3,
        name: "Tokyo, Japan",
        image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
        description: "Futuristic city with ancient temples, cutting-edge technology, and incredible food.",
        interests: ["city", "culture", "food", "shopping", "nightlife"],
        duration: { min: 4, max: 10 },
        season: ["any"],
        budget: "moderate"
    },
    {
        id: 4,
        name: "Machu Picchu, Peru",
        image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400",
        description: "Ancient Incan citadel set high in the Andes mountains.",
        interests: ["mountain", "culture", "adventure", "nature"],
        duration: { min: 2, max: 7 },
        season: ["any"],
        budget: "moderate"
    },
    {
        id: 5,
        name: "Santorini, Greece",
        image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
        description: "Stunning white-washed buildings, blue domes, and breathtaking sunsets.",
        interests: ["beach", "culture", "relaxation"],
        duration: { min: 3, max: 10 },
        season: ["spring", "summer", "fall"],
        budget: "luxury"
    },
    {
        id: 6,
        name: "Banff National Park, Canada",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        description: "Crystal-clear lakes, towering mountains, and abundant wildlife.",
        interests: ["nature", "adventure", "mountain"],
        duration: { min: 4, max: 14 },
        season: ["summer", "fall"],
        budget: "moderate"
    },
    {
        id: 7,
        name: "Barcelona, Spain",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400",
        description: "Vibrant city with Gaudí architecture, beaches, and Mediterranean culture.",
        interests: ["city", "culture", "beach", "food", "shopping"],
        duration: { min: 3, max: 10 },
        season: ["spring", "summer", "fall"],
        budget: "moderate"
    },
    {
        id: 8,
        name: "New York City, USA",
        image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400",
        description: "The city that never sleeps with iconic landmarks and endless entertainment.",
        interests: ["city", "culture", "shopping", "nightlife", "food"],
        duration: { min: 4, max: 14 },
        season: ["any"],
        budget: "luxury"
    },
    {
        id: 9,
        name: "Great Barrier Reef, Australia",
        image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400",
        description: "World's largest coral reef system with incredible marine life.",
        interests: ["nature", "adventure", "beach"],
        duration: { min: 5, max: 14 },
        season: ["any"],
        budget: "luxury"
    },
    {
        id: 10,
        name: "Kyoto, Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
        description: "Ancient capital with traditional temples, gardens, and tea ceremonies.",
        interests: ["culture", "nature", "relaxation"],
        duration: { min: 3, max: 10 },
        season: ["spring", "fall"],
        budget: "moderate"
    }
];

// Global variables
let selectedDestinations = [];
let currentItinerary = [];

// DOM elements
const form = document.getElementById('travel-form');
const destinationsList = document.getElementById('destinations-list');
const itineraryContainer = document.getElementById('itinerary-container');
const generateItineraryBtn = document.getElementById('generate-itinerary-btn');

// Event listeners
form.addEventListener('submit', handleFormSubmit);
generateItineraryBtn.addEventListener('click', generateDetailedItinerary);

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    const interests = Array.from(document.getElementById('interests').selectedOptions).map(option => option.value);
    const duration = parseInt(document.getElementById('duration').value);
    const budget = document.getElementById('budget').value;
    const season = document.getElementById('season').value;

    const recommendations = getRecommendations(interests, duration, budget, season);
    displayDestinations(recommendations);
}

// Get destination recommendations based on user preferences
function getRecommendations(interests, duration, budget, season) {
    return destinations.filter(dest => {
        // Check interests
        const hasMatchingInterest = interests.length === 0 || interests.some(interest => dest.interests.includes(interest));

        // Check duration
        const durationMatch = duration >= dest.duration.min && duration <= dest.duration.max;

        // Check budget
        const budgetMatch = budget === dest.budget || budget === 'moderate';

        // Check season
        const seasonMatch = season === 'any' || dest.season.includes(season) || dest.season.includes('any');

        return hasMatchingInterest && durationMatch && budgetMatch && seasonMatch;
    });
}

// Display recommended destinations
function displayDestinations(destinations) {
    destinationsList.innerHTML = '';

    if (destinations.length === 0) {
        destinationsList.innerHTML = '<p>No destinations match your preferences. Try adjusting your criteria.</p>';
        return;
    }

    destinations.forEach(dest => {
        const card = createDestinationCard(dest);
        destinationsList.appendChild(card);
    });
}

// Create destination card element
function createDestinationCard(destination) {
    const card = document.createElement('div');
    card.className = 'destination-card';
    card.dataset.id = destination.id;

    const isSelected = selectedDestinations.includes(destination.id);
    if (isSelected) {
        card.classList.add('selected');
    }

    card.innerHTML = `
        <img src="${destination.image}" alt="${destination.name}">
        <div class="content">
            <h3>${destination.name}</h3>
            <p>${destination.description}</p>
            <div class="tags">
                ${destination.interests.map(interest => `<span class="tag">${interest}</span>`).join('')}
            </div>
        </div>
    `;

    card.addEventListener('click', () => toggleDestinationSelection(destination.id));

    return card;
}

// Toggle destination selection
function toggleDestinationSelection(destinationId) {
    const index = selectedDestinations.indexOf(destinationId);

    if (index > -1) {
        selectedDestinations.splice(index, 1);
    } else {
        selectedDestinations.push(destinationId);
    }

    updateDestinationCards();
    updateItinerary();
}

// Update destination card selection states
function updateDestinationCards() {
    const cards = document.querySelectorAll('.destination-card');
    cards.forEach(card => {
        const id = parseInt(card.dataset.id);
        if (selectedDestinations.includes(id)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

// Update itinerary display
function updateItinerary() {
    if (selectedDestinations.length === 0) {
        itineraryContainer.innerHTML = '<p>Select destinations to build your itinerary</p>';
        generateItineraryBtn.disabled = true;
        return;
    }

    const selectedDests = destinations.filter(dest => selectedDestinations.includes(dest.id));

    itineraryContainer.innerHTML = selectedDests.map(dest => `
        <div class="itinerary-item">
            <h4>${dest.name}</h4>
            <button class="remove-btn" onclick="removeFromItinerary(${dest.id})">&times;</button>
        </div>
    `).join('');

    generateItineraryBtn.disabled = false;
}

// Remove destination from itinerary
function removeFromItinerary(destinationId) {
    const index = selectedDestinations.indexOf(destinationId);
    if (index > -1) {
        selectedDestinations.splice(index, 1);
    }
    updateDestinationCards();
    updateItinerary();
}

// Generate detailed itinerary
function generateDetailedItinerary() {
    const selectedDests = destinations.filter(dest => selectedDestinations.includes(dest.id));
    const duration = parseInt(document.getElementById('duration').value);

    // Simple itinerary generation logic
    const itinerary = createItinerary(selectedDests, duration);

    displayDetailedItinerary(itinerary);
}

// Create itinerary based on selected destinations and duration
function createItinerary(selectedDests, totalDuration) {
    const itinerary = [];
    const daysPerDestination = Math.max(1, Math.floor(totalDuration / selectedDests.length));

    selectedDests.forEach((dest, index) => {
        const startDay = index * daysPerDestination + 1;
        const endDay = Math.min(totalDuration, (index + 1) * daysPerDestination);

        itinerary.push({
            destination: dest,
            days: `${startDay}-${endDay}`,
            activities: generateActivities(dest, daysPerDestination)
        });
    });

    return itinerary;
}

// Generate sample activities for a destination
function generateActivities(destination, days) {
    const activities = [];

    if (destination.interests.includes('beach')) {
        activities.push('Relax on pristine beaches', 'Water sports and snorkeling');
    }
    if (destination.interests.includes('mountain')) {
        activities.push('Hiking and trekking', 'Mountain biking');
    }
    if (destination.interests.includes('city')) {
        activities.push('City tours and landmarks', 'Local markets and shopping');
    }
    if (destination.interests.includes('culture')) {
        activities.push('Visit historical sites', 'Cultural experiences and museums');
    }
    if (destination.interests.includes('food')) {
        activities.push('Local cuisine tasting', 'Cooking classes');
    }
    if (destination.interests.includes('adventure')) {
        activities.push('Adventure activities', 'Outdoor excursions');
    }
    if (destination.interests.includes('nature')) {
        activities.push('Nature walks and wildlife viewing', 'Photography tours');
    }
    if (destination.interests.includes('relaxation')) {
        activities.push('Spa treatments', 'Meditation and wellness');
    }

    return activities.slice(0, Math.min(activities.length, days * 2));
}

// Display detailed itinerary
function displayDetailedItinerary(itinerary) {
    const itineraryHtml = `
        <h3>Your ${document.getElementById('duration').value}-Day Itinerary</h3>
        ${itinerary.map(item => `
            <div class="itinerary-day">
                <h4>Days ${item.days}: ${item.destination.name}</h4>
                <ul>
                    ${item.activities.map(activity => `<li>${activity}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
        <div class="itinerary-summary">
            <h4>Trip Summary</h4>
            <p>Destinations: ${itinerary.length}</p>
            <p>Total Duration: ${document.getElementById('duration').value} days</p>
            <p>Budget Level: ${document.getElementById('budget').value}</p>
        </div>
    `;

    itineraryContainer.innerHTML = itineraryHtml;
}

// Initialize the app
function init() {
    // Display all destinations initially
    displayDestinations(destinations);
}

// Start the application
init();