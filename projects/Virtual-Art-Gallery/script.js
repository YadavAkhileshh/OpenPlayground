/* =====================
   ARTWORK DATABASE
   ===================== */

const artworkDatabase = {
    modern: [
        {
            id: 'm1',
            title: 'Abstract Harmony',
            artist: 'Elena Rodriguez',
            year: '2023',
            medium: 'Acrylic on Canvas',
            dimensions: '120 x 90 cm',
            description: 'A vibrant exploration of color and form, this piece represents the harmony found in chaos. Bold strokes and dynamic composition create a sense of movement and energy.',
            image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=600&fit=crop'
        },
        {
            id: 'm2',
            title: 'Urban Dreams',
            artist: 'Marcus Chen',
            year: '2022',
            medium: 'Mixed Media',
            dimensions: '150 x 100 cm',
            description: 'This contemporary piece captures the essence of modern city life through layered textures and geometric patterns, exploring themes of connection and isolation.',
            image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop'
        },
        {
            id: 'm3',
            title: 'Neon Reflections',
            artist: 'Sarah Kim',
            year: '2024',
            medium: 'Digital Art on Canvas',
            dimensions: '100 x 100 cm',
            description: 'A fusion of traditional and digital techniques, this work explores the interplay between light and shadow in urban environments.',
            image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=600&fit=crop'
        },
        {
            id: 'm4',
            title: 'Fluid Emotions',
            artist: 'James Wilson',
            year: '2023',
            medium: 'Oil on Canvas',
            dimensions: '130 x 95 cm',
            description: 'Flowing forms and rich colors merge to create an emotional landscape that invites viewers to explore their inner feelings.',
            image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=600&fit=crop'
        },
        {
            id: 'm5',
            title: 'Geometric Symphony',
            artist: 'Anna Kowalski',
            year: '2022',
            medium: 'Acrylic and Gold Leaf',
            dimensions: '110 x 110 cm',
            description: 'Precise geometric shapes dance across the canvas, creating a visual symphony of form and color inspired by mathematical beauty.',
            image: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=600&fit=crop'
        },
        {
            id: 'm6',
            title: 'Chromatic Pulse',
            artist: 'Diego Martinez',
            year: '2024',
            medium: 'Spray Paint on Canvas',
            dimensions: '140 x 100 cm',
            description: 'Vibrant layers of color pulsate with energy, creating a dynamic visual rhythm that captures the spirit of contemporary street art.',
            image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=800&h=600&fit=crop'
        }
    ],
    classical: [
        {
            id: 'c1',
            title: 'Renaissance Portrait',
            artist: 'Isabella Rossi',
            year: '2020',
            medium: 'Oil on Canvas',
            dimensions: '80 x 60 cm',
            description: 'A contemporary interpretation of classical portraiture, combining traditional techniques with modern sensibilities.',
            image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&h=600&fit=crop'
        },
        {
            id: 'c2',
            title: 'Still Life with Flowers',
            artist: 'Thomas Müller',
            year: '2021',
            medium: 'Oil on Linen',
            dimensions: '90 x 70 cm',
            description: 'A masterful study of light and shadow, this still life pays homage to Dutch Golden Age painting while maintaining a fresh perspective.',
            image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop'
        },
        {
            id: 'c3',
            title: 'Pastoral Landscape',
            artist: 'Marie Dubois',
            year: '2019',
            medium: 'Oil on Canvas',
            dimensions: '120 x 80 cm',
            description: 'Serene countryside bathed in golden light, capturing the timeless beauty of nature with classical painting techniques.',
            image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop'
        },
        {
            id: 'c4',
            title: 'Baroque Dreams',
            artist: 'Antonio Verdi',
            year: '2022',
            medium: 'Oil on Canvas',
            dimensions: '150 x 120 cm',
            description: 'Rich, dramatic composition inspired by Baroque masters, featuring intricate details and powerful use of chiaroscuro.',
            image: 'https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=800&h=600&fit=crop'
        },
        {
            id: 'c5',
            title: 'Classical Symphony',
            artist: 'Victoria Sterling',
            year: '2021',
            medium: 'Tempera and Gold Leaf',
            dimensions: '100 x 75 cm',
            description: 'A harmonious composition blending classical techniques with contemporary subjects, creating a bridge between eras.',
            image: 'https://images.unsplash.com/photo-1582561833395-e62c5e5c1e5c?w=800&h=600&fit=crop'
        },
        {
            id: 'c6',
            title: 'The Garden',
            artist: 'Henri Laurent',
            year: '2020',
            medium: 'Oil on Panel',
            dimensions: '85 x 65 cm',
            description: 'An intimate garden scene reminiscent of Impressionist masters, capturing fleeting moments of light and color.',
            image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&h=600&fit=crop'
        }
    ],
    contemporary: [
        {
            id: 'co1',
            title: 'Digital Consciousness',
            artist: 'Alex Zhang',
            year: '2024',
            medium: 'Mixed Media and AR',
            dimensions: '200 x 150 cm',
            description: 'An exploration of human consciousness in the digital age, combining physical and augmented reality elements.',
            image: 'https://images.unsplash.com/photo-1551732998-9f785f2be4b5?w=800&h=600&fit=crop'
        },
        {
            id: 'co2',
            title: 'Sustainable Future',
            artist: 'Maya Patel',
            year: '2023',
            medium: 'Recycled Materials',
            dimensions: '180 x 120 cm',
            description: 'A powerful statement on environmental consciousness, created entirely from recycled and sustainable materials.',
            image: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800&h=600&fit=crop'
        },
        {
            id: 'co3',
            title: 'Identity Fragments',
            artist: 'Jordan Lee',
            year: '2024',
            medium: 'Photography and Collage',
            dimensions: '120 x 90 cm',
            description: 'A thought-provoking exploration of identity in the modern world, using fragmented imagery to represent multiple facets of self.',
            image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&h=600&fit=crop'
        },
        {
            id: 'co4',
            title: 'Urban Intervention',
            artist: 'Sofia Andersson',
            year: '2023',
            medium: 'Installation Art',
            dimensions: 'Variable',
            description: 'An interactive installation that challenges viewers to reconsider their relationship with urban spaces.',
            image: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=800&h=600&fit=crop'
        },
        {
            id: 'co5',
            title: 'Data Streams',
            artist: 'Ryan Morrison',
            year: '2024',
            medium: 'Generative Art',
            dimensions: '160 x 100 cm',
            description: 'Computer-generated patterns based on real-time data, creating a unique intersection of art, technology, and information.',
            image: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=600&fit=crop'
        },
        {
            id: 'co6',
            title: 'Metamorphosis',
            artist: 'Lucia Santos',
            year: '2023',
            medium: 'Video Art',
            dimensions: '16:9 Format',
            description: 'A mesmerizing video installation exploring themes of transformation and change through abstract moving imagery.',
            image: 'https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=600&fit=crop'
        }
    ],
    photography: [
        {
            id: 'p1',
            title: 'City Lights',
            artist: 'Michael Torres',
            year: '2023',
            medium: 'Digital Photography',
            dimensions: '100 x 70 cm',
            description: 'Long exposure captures the vibrant energy of urban nightlife, transforming traffic into rivers of light.',
            image: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?w=800&h=600&fit=crop'
        },
        {
            id: 'p2',
            title: 'Mountain Solitude',
            artist: 'Emma Bergström',
            year: '2024',
            medium: 'Fine Art Photography',
            dimensions: '120 x 80 cm',
            description: 'A breathtaking landscape capturing the serene majesty of alpine peaks at golden hour.',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
        },
        {
            id: 'p3',
            title: 'Street Poetry',
            artist: 'Carlos Mendez',
            year: '2023',
            medium: 'Black and White Photography',
            dimensions: '90 x 60 cm',
            description: 'Candid moments from city streets, capturing the raw beauty and emotion of everyday urban life.',
            image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&h=600&fit=crop'
        },
        {
            id: 'p4',
            title: 'Ocean Depths',
            artist: 'Nina Okeefe',
            year: '2024',
            medium: 'Underwater Photography',
            dimensions: '110 x 75 cm',
            description: 'An ethereal journey beneath the waves, revealing the hidden beauty of marine ecosystems.',
            image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop'
        },
        {
            id: 'p5',
            title: 'Human Connection',
            artist: 'David Park',
            year: '2023',
            medium: 'Portrait Photography',
            dimensions: '80 x 80 cm',
            description: 'Intimate portraits capturing genuine moments of human emotion and connection.',
            image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=600&fit=crop'
        },
        {
            id: 'p6',
            title: 'Abstract Nature',
            artist: 'Olivia Wright',
            year: '2024',
            medium: 'Macro Photography',
            dimensions: '95 x 70 cm',
            description: 'Extreme close-ups reveal abstract patterns in nature, transforming the ordinary into extraordinary.',
            image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&h=600&fit=crop'
        }
    ]
};

/* =====================
   STATE MANAGEMENT
   ===================== */

let currentRoom = 'lobby';
let currentZoom = 1;
let isDragging = false;
let startX, startY;
let translateX = 0;
let translateY = 0;
let tourStep = 0;
let isTourActive = false;

const rooms = ['lobby', 'modern', 'classical', 'contemporary', 'photography'];

const tourSteps = [
    {
        room: 'lobby',
        title: 'Welcome to the Gallery',
        text: 'This is your starting point. From here, you can explore four different galleries, each showcasing unique artistic styles and periods.'
    },
    {
        room: 'modern',
        title: 'Modern Art Gallery',
        text: 'Discover bold and innovative works from contemporary artists. Click on any artwork to view it in detail with zoom functionality.'
    },
    {
        room: 'classical',
        title: 'Classical Gallery',
        text: 'Experience timeless masterpieces inspired by classical techniques and traditions. Each piece tells a story of artistic heritage.'
    },
    {
        room: 'photography',
        title: 'Photography Exhibition',
        text: 'Explore stunning photographs capturing moments from around the world. Use the navigation arrows or menu to move between galleries.'
    }
];

/* =====================
   INITIALIZATION
   ===================== */

document.addEventListener('DOMContentLoaded', () => {
    initializeGallery();
    setupEventListeners();
    loadArtworks();
    simulateLoading();
});

function initializeGallery() {
    // Set initial room
    document.getElementById('lobby').classList.add('active');
    updateNavButtons();
}

function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const room = btn.dataset.room;
            navigateToRoom(room);
        });
    });

    // Room cards
    document.querySelectorAll('.room-card').forEach(card => {
        card.addEventListener('click', () => {
            const room = card.dataset.room;
            navigateToRoom(room);
        });
    });

    // Floating controls
    document.getElementById('prevBtn').addEventListener('click', navigatePrevious);
    document.getElementById('nextBtn').addEventListener('click', navigateNext);

    // Modal controls
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);

    // Zoom controls
    document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
    document.getElementById('zoomResetBtn').addEventListener('click', resetZoom);

    // Tour controls
    document.getElementById('startTourBtn').addEventListener('click', startTour);
    document.getElementById('nextTourBtn').addEventListener('click', nextTourStep);
    document.getElementById('skipTourBtn').addEventListener('click', endTour);

    // Info modal
    document.getElementById('infoBtn').addEventListener('click', openInfoModal);
    document.getElementById('infoClose').addEventListener('click', closeInfoModal);
    document.getElementById('infoOverlay').addEventListener('click', closeInfoModal);

    // Image dragging
    setupImageDragging();

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
}

/* =====================
   ARTWORK LOADING
   ===================== */

function loadArtworks() {
    Object.keys(artworkDatabase).forEach(roomId => {
        const room = document.getElementById(roomId);
        if (room && roomId !== 'lobby') {
            const grid = room.querySelector('.artwork-grid');
            if (grid) {
                grid.innerHTML = '';
                artworkDatabase[roomId].forEach((artwork, index) => {
                    const card = createArtworkCard(artwork, index);
                    grid.appendChild(card);
                });
            }
        }
    });
}

function createArtworkCard(artwork, index) {
    const card = document.createElement('div');
    card.className = 'artwork-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <img src="${artwork.image}" alt="${artwork.title}" class="artwork-image" loading="lazy">
        <div class="artwork-info">
            <h3 class="artwork-title">${artwork.title}</h3>
            <p class="artwork-artist">${artwork.artist}</p>
            <div class="artwork-meta-inline">
                <span>${artwork.year}</span>
                <span>•</span>
                <span>${artwork.medium}</span>
            </div>
        </div>
    `;

    card.addEventListener('click', () => openArtworkModal(artwork));
    return card;
}

/* =====================
   NAVIGATION
   ===================== */

function navigateToRoom(roomId) {
    if (currentRoom === roomId) return;

    const currentRoomEl = document.getElementById(currentRoom);
    const nextRoomEl = document.getElementById(roomId);

    if (currentRoomEl && nextRoomEl) {
        currentRoomEl.classList.remove('active');
        currentRoomEl.classList.add('prev');
        
        setTimeout(() => {
            currentRoomEl.classList.remove('prev');
        }, 600);

        nextRoomEl.classList.add('active');
        currentRoom = roomId;
        updateNavButtons();
    }
}

function navigatePrevious() {
    const currentIndex = rooms.indexOf(currentRoom);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : rooms.length - 1;
    navigateToRoom(rooms[prevIndex]);
}

function navigateNext() {
    const currentIndex = rooms.indexOf(currentRoom);
    const nextIndex = currentIndex < rooms.length - 1 ? currentIndex + 1 : 0;
    navigateToRoom(rooms[nextIndex]);
}

function updateNavButtons() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.room === currentRoom);
    });
}

function handleKeyboard(e) {
    if (e.key === 'ArrowLeft') navigatePrevious();
    if (e.key === 'ArrowRight') navigateNext();
    if (e.key === 'Escape') {
        closeModal();
        closeInfoModal();
        if (isTourActive) endTour();
    }
}

/* =====================
   ARTWORK MODAL
   ===================== */

function openArtworkModal(artwork) {
    const modal = document.getElementById('artworkModal');
    
    document.getElementById('modalImage').src = artwork.image;
    document.getElementById('modalTitle').textContent = artwork.title;
    document.getElementById('modalArtist').textContent = artwork.artist;
    document.getElementById('modalYear').textContent = artwork.year;
    document.getElementById('modalMedium').textContent = artwork.medium;
    document.getElementById('modalDimensions').textContent = artwork.dimensions;
    document.getElementById('modalDescription').textContent = artwork.description;
    
    // Set artist avatar
    const avatar = document.getElementById('modalArtistAvatar');
    avatar.textContent = artwork.artist.charAt(0);
    
    modal.classList.add('active');
    resetZoom();
}

function closeModal() {
    const modal = document.getElementById('artworkModal');
    modal.classList.remove('active');
    resetZoom();
}

/* =====================
   IMAGE ZOOM & PAN
   ===================== */

function zoomIn() {
    currentZoom = Math.min(currentZoom + 0.5, 3);
    updateImageTransform();
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - 0.5, 1);
    updateImageTransform();
}

function resetZoom() {
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
}

function updateImageTransform() {
    const img = document.getElementById('modalImage');
    img.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
}

function setupImageDragging() {
    const img = document.getElementById('modalImage');
    
    img.addEventListener('mousedown', (e) => {
        if (currentZoom <= 1) return;
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        img.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateImageTransform();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        const img = document.getElementById('modalImage');
        img.style.cursor = 'move';
    });
}

/* =====================
   TOUR FUNCTIONALITY
   ===================== */

function startTour() {
    isTourActive = true;
    tourStep = 0;
    showTourStep();
}

function showTourStep() {
    if (tourStep >= tourSteps.length) {
        endTour();
        return;
    }

    const step = tourSteps[tourStep];
    const overlay = document.getElementById('tourOverlay');
    
    document.getElementById('tourStep').textContent = tourStep + 1;
    document.getElementById('tourTotal').textContent = tourSteps.length;
    document.getElementById('tourTitle').textContent = step.title;
    document.getElementById('tourText').textContent = step.text;
    
    overlay.classList.add('active');
    navigateToRoom(step.room);
}

function nextTourStep() {
    tourStep++;
    if (tourStep < tourSteps.length) {
        showTourStep();
    } else {
        endTour();
    }
}

function endTour() {
    isTourActive = false;
    document.getElementById('tourOverlay').classList.remove('active');
    tourStep = 0;
}

/* =====================
   INFO MODAL
   ===================== */

function openInfoModal() {
    document.getElementById('infoModal').classList.add('active');
}

function closeInfoModal() {
    document.getElementById('infoModal').classList.remove('active');
}

/* =====================
   LOADING SIMULATION
   ===================== */

function simulateLoading() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.getElementById('progressFill');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 300);
        }
        progressFill.style.width = `${progress}%`;
    }, 200);
}

/* =====================
   UTILITY FUNCTIONS
   ===================== */

// Add smooth scroll for room containers
document.querySelectorAll('.room').forEach(room => {
    room.style.scrollBehavior = 'smooth';
});

// Log gallery info
console.log('%c🎨 Virtual Art Gallery', 'font-size: 20px; font-weight: bold; color: #f093fb;');
console.log('%cExplore 150+ artworks across 4 galleries', 'font-size: 14px; color: #666;');
console.log('%cCreated for OpenPlayground', 'font-size: 12px; color: #999;');