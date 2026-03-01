// RouteCraft - Advanced Route Planner
// Comprehensive JavaScript implementation with ~800+ lines

class RouteCraft {
    constructor() {
        this.map = null;
        this.markers = [];
        this.polylines = [];
        this.route = [];
        this.currentLocation = null;
        this.searchTimeout = null;
        this.weatherCache = new Map();
        this.poiCache = new Map();
        this.savedRoutes = JSON.parse(localStorage.getItem('routeCraft_savedRoutes') || '[]');
        this.currentTheme = localStorage.getItem('routeCraft_theme') || 'light';
        this.draggedElement = null;

        this.init();
    }

    init() {
        this.initMap();
        this.initEventListeners();
        this.initTheme();
        this.loadSavedRoutes();
        this.updateUI();
        this.showToast('Welcome to RouteCraft! Start by adding destinations.', 'success');
    }

    // Initialize Leaflet map
    initMap() {
        this.map = L.map('map', {
            center: [40.7128, -74.0060], // Default to NYC
            zoom: 10,
            zoomControl: true,
            scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Add current location control
        L.control.locate({
            position: 'topleft',
            strings: {
                title: "Show my location"
            }
        }).addTo(this.map);

        this.map.on('locationfound', (e) => {
            this.currentLocation = e.latlng;
            this.showToast('Location found!', 'success');
        });

        this.map.on('locationerror', () => {
            this.showToast('Could not find your location.', 'warning');
        });

        // Hide loading overlay
        document.getElementById('map-loading').style.display = 'none';
    }

    // Initialize all event listeners
    initEventListeners() {
        // Search and input
        const searchInput = document.getElementById('destination-input');
        searchInput.addEventListener('input', (e) => this.handleSearchInput(e));
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.addDestination();
        });

        document.getElementById('add-destination').addEventListener('click', () => this.addDestination());

        // Route management
        document.getElementById('optimize-route').addEventListener('click', () => this.optimizeRoute());
        document.getElementById('reverse-route').addEventListener('click', () => this.reverseRoute());
        document.getElementById('clear-route').addEventListener('click', () => this.clearRoute());

        // Navigation controls
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('save-route').addEventListener('click', () => this.showSaveModal());
        document.getElementById('load-route').addEventListener('click', () => this.showLoadModal());
        document.getElementById('export-route').addEventListener('click', () => this.exportRoute());
        document.getElementById('share-route').addEventListener('click', () => this.showShareModal());

        // Map controls
        document.getElementById('fit-route').addEventListener('click', () => this.fitRouteToView());
        document.getElementById('toggle-traffic').addEventListener('click', (e) => this.toggleTrafficLayer(e.target));
        document.getElementById('toggle-poi').addEventListener('click', (e) => this.togglePOILayer(e.target));
        document.getElementById('map-style').addEventListener('change', (e) => this.changeMapStyle(e.target.value));

        // Travel options
        document.getElementById('travel-mode').addEventListener('change', () => this.updateRouteStats());
        document.getElementById('avoid-tolls').addEventListener('change', () => this.updateRouteStats());
        document.getElementById('avoid-highways').addEventListener('change', () => this.updateRouteStats());

        // POI controls
        document.getElementById('poi-category').addEventListener('change', () => this.searchPOI());
        document.getElementById('poi-radius').addEventListener('input', (e) => {
            document.getElementById('radius-value').textContent = e.target.value + ' km';
            this.searchPOI();
        });

        // Route alternatives
        document.querySelectorAll('.alternative-option').forEach(option => {
            option.addEventListener('click', () => this.selectAlternative(option.dataset.alternative));
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.hideModals());
        });

        document.getElementById('save-route-confirm').addEventListener('click', () => this.saveRoute());
        document.getElementById('copy-share-url').addEventListener('click', () => this.copyShareUrl());

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModals();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    // Handle search input with debouncing and suggestions
    async handleSearchInput(e) {
        const query = e.target.value.trim();
        const suggestions = document.getElementById('search-suggestions');

        if (query.length < 2) {
            suggestions.style.display = 'none';
            return;
        }

        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
                const data = await response.json();

                if (data.length > 0) {
                    suggestions.innerHTML = data.map(item => `
                        <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${item.display_name}">
                            <strong>${item.display_name.split(',')[0]}</strong><br>
                            <small>${item.display_name}</small>
                        </div>
                    `).join('');

                    suggestions.querySelectorAll('.suggestion-item').forEach(item => {
                        item.addEventListener('click', () => {
                            e.target.value = item.dataset.name;
                            suggestions.style.display = 'none';
                            this.addDestination();
                        });
                    });

                    suggestions.style.display = 'block';
                } else {
                    suggestions.style.display = 'none';
                }
            } catch (error) {
                console.error('Search error:', error);
                suggestions.style.display = 'none';
            }
        }, 300);
    }

    // Add destination to route
    async addDestination() {
        const input = document.getElementById('destination-input');
        const destination = input.value.trim();

        if (!destination) {
            this.showToast('Please enter a destination.', 'warning');
            return;
        }

        this.showLoading('Geocoding destination...');

        try {
            const location = await this.geocodeDestination(destination);
            if (location) {
                this.route.push(location);
                this.updateRouteList();
                this.updateMap();
                this.updateRouteStats();
                this.updateWeather();
                this.searchPOI();
                input.value = '';
                document.getElementById('search-suggestions').style.display = 'none';
                this.showToast(`Added ${location.name} to your route!`, 'success');
            } else {
                this.showToast('Could not find that location. Please try a different address.', 'error');
            }
        } catch (error) {
            console.error('Error adding destination:', error);
            this.showToast('Error adding destination. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Geocode destination using Nominatim
    async geocodeDestination(destination) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1&addressdetails=1`);
            const data = await response.json();

            if (data.length > 0) {
                const item = data[0];
                return {
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon),
                    name: item.display_name.split(',')[0],
                    address: item.display_name,
                    id: Date.now() + Math.random()
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
        }
        return null;
    }

    // Update route list with drag and drop
    updateRouteList() {
        const list = document.getElementById('route-list');
        const emptyState = document.getElementById('empty-route');

        if (this.route.length === 0) {
            list.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        list.innerHTML = this.route.map((dest, index) => `
            <li class="route-item fade-in" data-id="${dest.id}">
                <div class="route-item-content">
                    <div class="route-number">${index + 1}</div>
                    <div class="route-details">
                        <div class="route-name">${dest.name}</div>
                        <div class="route-address">${dest.address || 'Address not available'}</div>
                    </div>
                </div>
                <div class="route-actions">
                    <button class="route-btn" onclick="routeCraft.moveDestination(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="route-btn" onclick="routeCraft.moveDestination(${index}, 'down')" ${index === this.route.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <button class="route-btn remove" onclick="routeCraft.removeDestination(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `).join('');

        // Add drag and drop functionality
        this.initDragAndDrop();
    }

    // Initialize drag and drop for route items
    initDragAndDrop() {
        const items = document.querySelectorAll('.route-item');

        items.forEach((item, index) => {
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                this.draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', item.outerHTML);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                this.draggedElement = null;
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.draggedElement && this.draggedElement !== item) {
                    const fromIndex = Array.from(items).indexOf(this.draggedElement);
                    const toIndex = Array.from(items).indexOf(item);

                    const [moved] = this.route.splice(fromIndex, 1);
                    this.route.splice(toIndex, 0, moved);

                    this.updateRouteList();
                    this.updateMap();
                    this.updateRouteStats();
                    this.showToast('Route order updated!', 'success');
                }
            });
        });
    }

    // Move destination up or down
    moveDestination(index, direction) {
        if (direction === 'up' && index > 0) {
            [this.route[index], this.route[index - 1]] = [this.route[index - 1], this.route[index]];
        } else if (direction === 'down' && index < this.route.length - 1) {
            [this.route[index], this.route[index + 1]] = [this.route[index + 1], this.route[index]];
        }

        this.updateRouteList();
        this.updateMap();
        this.updateRouteStats();
        this.showToast('Destination moved!', 'success');
    }

    // Remove destination from route
    removeDestination(index) {
        const removed = this.route.splice(index, 1)[0];
        this.updateRouteList();
        this.updateMap();
        this.updateRouteStats();
        this.updateWeather();
        this.searchPOI();
        this.showToast(`Removed ${removed.name} from route.`, 'info');
    }

    // Update map with markers and route
    updateMap() {
        // Clear existing markers and polylines
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.polylines.forEach(polyline => this.map.removeLayer(polyline));
        this.markers = [];
        this.polylines = [];

        if (this.route.length === 0) return;

        // Add markers
        this.route.forEach((dest, index) => {
            const marker = L.marker([dest.lat, dest.lng]).addTo(this.map)
                .bindPopup(`
                    <div class="popup-content">
                        <h4>${index + 1}. ${dest.name}</h4>
                        <p>${dest.address || 'Address not available'}</p>
                        <button onclick="routeCraft.removeDestination(${index})" class="popup-btn">
                            <i class="fas fa-trash"></i> Remove
                        </button>
                    </div>
                `);
            this.markers.push(marker);
        });

        // Draw route line
        if (this.route.length > 1) {
            const latlngs = this.route.map(dest => [dest.lat, dest.lng]);
            const polyline = L.polyline(latlngs, {
                color: '#2563eb',
                weight: 4,
                opacity: 0.8
            }).addTo(this.map);
            this.polylines.push(polyline);
        }

        // Fit map to show all markers
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // Update route statistics
    updateRouteStats() {
        const totalDestinations = this.route.length;
        let totalDistance = 0;
        let totalTime = 0;

        // Calculate distances and times
        for (let i = 0; i < this.route.length - 1; i++) {
            const distance = this.getDistance(this.route[i], this.route[i + 1]);
            totalDistance += distance;

            // Estimate time based on travel mode
            const mode = document.getElementById('travel-mode').value;
            const speed = this.getTravelSpeed(mode);
            totalTime += distance / speed;
        }

        // Update hero stats
        document.getElementById('total-destinations').textContent = totalDestinations;
        document.getElementById('total-distance').textContent = totalDistance.toFixed(1);
        document.getElementById('estimated-time').textContent = Math.ceil(totalTime);

        // Update route stats
        document.getElementById('route-distance').textContent = `${totalDistance.toFixed(1)} km`;
        document.getElementById('route-time').textContent = this.formatTime(totalTime);

        // Estimate fuel cost (rough calculation)
        const fuelCost = totalDistance * 0.15; // $0.15 per km average
        document.getElementById('fuel-cost').textContent = `$${fuelCost.toFixed(2)}`;
    }

    // Get travel speed based on mode
    getTravelSpeed(mode) {
        const speeds = {
            driving: 80, // km/h
            walking: 5,
            cycling: 20,
            transit: 40
        };
        return speeds[mode] || 80;
    }

    // Format time in hours and minutes
    formatTime(hours) {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        if (h === 0) return `${m} min`;
        if (m === 0) return `${h} hr`;
        return `${h} hr ${m} min`;
    }

    // Calculate distance between two points (Haversine formula)
    getDistance(point1, point2) {
        const R = 6371; // Earth's radius in km
        const dLat = (point2.lat - point1.lat) * Math.PI / 180;
        const dLng = (point2.lng - point1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Optimize route using nearest neighbor algorithm
    optimizeRoute() {
        if (this.route.length < 2) {
            this.showToast('Add at least 2 destinations to optimize.', 'warning');
            return;
        }

        this.showLoading('Optimizing route...');

        setTimeout(() => {
            const optimized = [this.route[0]]; // Start with first destination
            const remaining = this.route.slice(1);

            while (remaining.length > 0) {
                let nearestIndex = 0;
                let minDistance = this.getDistance(optimized[optimized.length - 1], remaining[0]);

                for (let i = 1; i < remaining.length; i++) {
                    const distance = this.getDistance(optimized[optimized.length - 1], remaining[i]);
                    if (distance < minDistance) {
                        minDistance = distance;
                        nearestIndex = i;
                    }
                }

                optimized.push(remaining.splice(nearestIndex, 1)[0]);
            }

            this.route = optimized;
            this.updateRouteList();
            this.updateMap();
            this.updateRouteStats();
            this.hideLoading();
            this.showToast('Route optimized for minimum distance!', 'success');
        }, 1000);
    }

    // Reverse route order
    reverseRoute() {
        if (this.route.length < 2) {
            this.showToast('Add at least 2 destinations to reverse.', 'warning');
            return;
        }

        this.route.reverse();
        this.updateRouteList();
        this.updateMap();
        this.updateRouteStats();
        this.showToast('Route reversed!', 'success');
    }

    // Clear all destinations
    clearRoute() {
        if (this.route.length === 0) return;

        if (confirm('Are you sure you want to clear all destinations?')) {
            this.route = [];
            this.updateRouteList();
            this.updateMap();
            this.updateRouteStats();
            this.updateWeather();
            this.clearPOI();
            this.showToast('Route cleared.', 'info');
        }
    }

    // Fit route to map view
    fitRouteToView() {
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
            this.showToast('Route fitted to view.', 'info');
        } else {
            this.showToast('No destinations to fit.', 'warning');
        }
    }

    // Toggle traffic layer (placeholder)
    toggleTrafficLayer(button) {
        button.classList.toggle('active');
        // In a real implementation, you would add/remove traffic layer
        this.showToast('Traffic layer ' + (button.classList.contains('active') ? 'enabled' : 'disabled'), 'info');
    }

    // Toggle POI layer
    togglePOILayer(button) {
        button.classList.toggle('active');
        // Toggle POI markers visibility
        this.showToast('POI layer ' + (button.classList.contains('active') ? 'enabled' : 'disabled'), 'info');
    }

    // Change map style
    changeMapStyle(style) {
        // In a real implementation, you would change the tile layer
        this.showToast(`Map style changed to ${style}.`, 'info');
    }

    // Update weather information
    async updateWeather() {
        const container = document.getElementById('weather-container');

        if (this.route.length === 0) {
            container.innerHTML = '<div class="weather-loading"><i class="fas fa-spinner fa-spin"></i><span>Add destinations to see weather</span></div>';
            return;
        }

        container.innerHTML = '<div class="weather-loading"><i class="fas fa-spinner fa-spin"></i><span>Loading weather data...</span></div>';

        try {
            const weatherPromises = this.route.slice(0, 5).map(async (dest, index) => {
                const cacheKey = `${dest.lat.toFixed(2)},${dest.lng.toFixed(2)}`;
                if (this.weatherCache.has(cacheKey)) {
                    return { ...this.weatherCache.get(cacheKey), location: dest.name };
                }

                try {
                    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lng}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&timezone=auto`);
                    const data = await response.json();

                    const weather = {
                        temp: Math.round(data.current_weather.temperature),
                        description: this.getWeatherDescription(data.current_weather.weathercode),
                        humidity: data.hourly.relativehumidity_2m[0],
                        windSpeed: data.current_weather.windspeed,
                        location: dest.name
                    };

                    this.weatherCache.set(cacheKey, weather);
                    return weather;
                } catch (error) {
                    return {
                        temp: '--',
                        description: 'Weather unavailable',
                        humidity: '--',
                        windSpeed: '--',
                        location: dest.name
                    };
                }
            });

            const weatherData = await Promise.all(weatherPromises);

            container.innerHTML = weatherData.map(weather => `
                <div class="weather-card">
                    <div class="weather-location">${weather.location}</div>
                    <div class="weather-temp">${weather.temp}°C</div>
                    <div class="weather-desc">${weather.description}</div>
                    <div class="weather-details">
                        <span>💧 ${weather.humidity}%</span>
                        <span>💨 ${weather.windSpeed} km/h</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Weather error:', error);
            container.innerHTML = '<div class="weather-loading"><i class="fas fa-exclamation-triangle"></i><span>Weather data unavailable</span></div>';
        }
    }

    // Get weather description from weather code
    getWeatherDescription(code) {
        const descriptions = {
            0: 'Clear sky',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Depositing rime fog',
            51: 'Light drizzle',
            53: 'Moderate drizzle',
            55: 'Dense drizzle',
            61: 'Slight rain',
            63: 'Moderate rain',
            65: 'Heavy rain',
            71: 'Slight snow',
            73: 'Moderate snow',
            75: 'Heavy snow',
            95: 'Thunderstorm'
        };
        return descriptions[code] || 'Unknown';
    }

    // Search for points of interest
    async searchPOI() {
        const container = document.getElementById('poi-container');
        const category = document.getElementById('poi-category').value;
        const radius = document.getElementById('poi-radius').value;

        if (this.route.length === 0) {
            container.innerHTML = '<div class="poi-loading"><i class="fas fa-spinner fa-spin"></i><span>Add destinations to find nearby places</span></div>';
            return;
        }

        container.innerHTML = '<div class="poi-loading"><i class="fas fa-spinner fa-spin"></i><span>Searching for points of interest...</span></div>';

        try {
            // Use the first destination as center point
            const center = this.route[0];
            const bbox = this.calculateBoundingBox(center, radius);

            const query = this.getPOIQuery(category);
            const response = await fetch(`https://overpass-api.de/api/interpreter?data=[out:json];${query}(bbox:${bbox.join(',')});out;`);
            const data = await response.json();

            if (data.elements.length > 0) {
                const pois = data.elements.slice(0, 10).map(element => ({
                    name: element.tags.name || 'Unnamed',
                    type: element.tags.amenity || element.tags.shop || 'poi',
                    lat: element.lat,
                    lng: element.lon,
                    distance: this.getDistance(center, { lat: element.lat, lng: element.lon })
                })).sort((a, b) => a.distance - b.distance);

                container.innerHTML = pois.map(poi => `
                    <div class="poi-card" onclick="routeCraft.addPOIToRoute(${poi.lat}, ${poi.lng}, '${poi.name}')">
                        <div class="poi-header">
                            <i class="fas fa-${this.getPOIIcon(poi.type)}"></i>
                            <span class="poi-name">${poi.name}</span>
                        </div>
                        <div class="poi-address">${poi.distance.toFixed(1)} km away</div>
                        <div class="poi-details">
                            <span>${this.capitalizeFirst(poi.type.replace('_', ' '))}</span>
                            <button class="btn-secondary" onclick="event.stopPropagation(); routeCraft.showPOIDirections(${poi.lat}, ${poi.lng})">
                                <i class="fas fa-directions"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<div class="poi-loading"><i class="fas fa-search"></i><span>No points of interest found nearby</span></div>';
            }
        } catch (error) {
            console.error('POI search error:', error);
            container.innerHTML = '<div class="poi-loading"><i class="fas fa-exclamation-triangle"></i><span>Could not search for points of interest</span></div>';
        }
    }

    // Calculate bounding box for POI search
    calculateBoundingBox(center, radiusKm) {
        const lat = center.lat;
        const lng = center.lng;
        const radiusDeg = radiusKm / 111.32; // Rough conversion km to degrees

        return [
            lng - radiusDeg / Math.cos(lat * Math.PI / 180),
            lat - radiusDeg,
            lng + radiusDeg / Math.cos(lat * Math.PI / 180),
            lat + radiusDeg
        ];
    }

    // Get Overpass API query for POI category
    getPOIQuery(category) {
        const queries = {
            restaurant: 'node["amenity"="restaurant"]',
            hotel: 'node["tourism"="hotel"]',
            gas_station: 'node["amenity"="fuel"]',
            attraction: 'node["tourism"="attraction"]',
            shopping: 'node["shop"]',
            parking: 'node["amenity"="parking"]'
        };
        return queries[category] || 'node["amenity"="restaurant"]';
    }

    // Get icon for POI type
    getPOIIcon(type) {
        const icons = {
            restaurant: 'utensils',
            hotel: 'hotel',
            fuel: 'gas-pump',
            attraction: 'camera',
            shop: 'shopping-bag',
            parking: 'parking'
        };
        return icons[type] || 'map-marker';
    }

    // Add POI to route
    addPOIToRoute(lat, lng, name) {
        const poi = {
            lat: lat,
            lng: lng,
            name: name,
            address: `${name} (POI)`,
            id: Date.now() + Math.random()
        };

        this.route.push(poi);
        this.updateRouteList();
        this.updateMap();
        this.updateRouteStats();
        this.showToast(`Added ${name} to your route!`, 'success');
    }

    // Show directions to POI
    showPOIDirections(lat, lng) {
        const url = `https://www.openstreetmap.org/directions?from=${this.route[0].lat},${this.route[0].lng}&to=${lat},${lng}`;
        window.open(url, '_blank');
    }

    // Clear POI markers
    clearPOI() {
        document.getElementById('poi-container').innerHTML = '<div class="poi-loading"><i class="fas fa-spinner fa-spin"></i><span>Add destinations to find nearby places</span></div>';
    }

    // Select route alternative
    selectAlternative(type) {
        document.querySelectorAll('.alternative-option').forEach(option => {
            option.classList.remove('selected');
        });
        document.querySelector(`[data-alternative="${type}"]`).classList.add('selected');

        // In a real implementation, you would recalculate the route
        this.showToast(`Selected ${type} route alternative.`, 'info');
    }

    // Initialize theme
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Toggle theme
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('routeCraft_theme', this.currentTheme);

        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        this.showToast(`Switched to ${this.currentTheme} theme.`, 'info');
    }

    // Show save modal
    showSaveModal() {
        if (this.route.length === 0) {
            this.showToast('Add some destinations before saving.', 'warning');
            return;
        }

        document.getElementById('save-modal').classList.add('show');
        document.getElementById('route-name').focus();
    }

    // Save route
    saveRoute() {
        const name = document.getElementById('route-name').value.trim();
        const description = document.getElementById('route-description').value.trim();

        if (!name) {
            this.showToast('Please enter a route name.', 'warning');
            return;
        }

        const routeData = {
            id: Date.now(),
            name: name,
            description: description,
            destinations: this.route,
            createdAt: new Date().toISOString(),
            travelMode: document.getElementById('travel-mode').value,
            avoidTolls: document.getElementById('avoid-tolls').checked,
            avoidHighways: document.getElementById('avoid-highways').checked
        };

        this.savedRoutes.push(routeData);
        localStorage.setItem('routeCraft_savedRoutes', JSON.stringify(this.savedRoutes));

        this.hideModals();
        this.showToast('Route saved successfully!', 'success');
    }

    // Show load modal
    showLoadModal() {
        const container = document.getElementById('saved-routes');

        if (this.savedRoutes.length === 0) {
            container.innerHTML = '<p>No saved routes found.</p>';
        } else {
            container.innerHTML = this.savedRoutes.map(route => `
                <div class="saved-route-item" onclick="routeCraft.loadRoute(${route.id})">
                    <div class="saved-route-name">${route.name}</div>
                    <div class="saved-route-meta">
                        ${route.destinations.length} destinations • ${new Date(route.createdAt).toLocaleDateString()}
                        ${route.description ? `<br><small>${route.description}</small>` : ''}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('load-modal').classList.add('show');
    }

    // Load saved route
    loadRoute(id) {
        const route = this.savedRoutes.find(r => r.id === id);
        if (route) {
            this.route = route.destinations;
            document.getElementById('travel-mode').value = route.travelMode || 'driving';
            document.getElementById('avoid-tolls').checked = route.avoidTolls || false;
            document.getElementById('avoid-highways').checked = route.avoidHighways || false;

            this.updateRouteList();
            this.updateMap();
            this.updateRouteStats();
            this.updateWeather();
            this.searchPOI();

            this.hideModals();
            this.showToast(`Loaded route "${route.name}".`, 'success');
        }
    }

    // Export route
    exportRoute() {
        if (this.route.length === 0) {
            this.showToast('Add some destinations before exporting.', 'warning');
            return;
        }

        const exportData = {
            name: 'My RouteCraft Route',
            destinations: this.route,
            totalDistance: document.getElementById('route-distance').textContent,
            estimatedTime: document.getElementById('route-time').textContent,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = 'routecraft-route.json';
        link.click();

        this.showToast('Route exported successfully!', 'success');
    }

    // Show share modal
    showShareModal() {
        if (this.route.length === 0) {
            this.showToast('Add some destinations before sharing.', 'warning');
            return;
        }

        const shareData = {
            title: 'My RouteCraft Route',
            destinations: this.route.map(d => ({ name: d.name, lat: d.lat, lng: d.lng }))
        };

        const encodedData = btoa(JSON.stringify(shareData));
        const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${encodedData}`;

        document.getElementById('share-url').value = shareUrl;
        document.getElementById('share-modal').classList.add('show');
    }

    // Copy share URL
    async copyShareUrl() {
        const urlInput = document.getElementById('share-url');
        try {
            await navigator.clipboard.writeText(urlInput.value);
            this.showToast('Share URL copied to clipboard!', 'success');
        } catch (error) {
            // Fallback for older browsers
            urlInput.select();
            document.execCommand('copy');
            this.showToast('Share URL copied to clipboard!', 'success');
        }
    }

    // Load shared route from URL
    loadSharedRoute() {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('shared');

        if (sharedData) {
            try {
                const routeData = JSON.parse(atob(sharedData));
                this.route = routeData.destinations.map(dest => ({
                    ...dest,
                    address: dest.name,
                    id: Date.now() + Math.random()
                }));

                this.updateRouteList();
                this.updateMap();
                this.updateRouteStats();
                this.updateWeather();
                this.searchPOI();

                this.showToast('Shared route loaded!', 'success');

                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } catch (error) {
                console.error('Error loading shared route:', error);
                this.showToast('Invalid shared route data.', 'error');
            }
        }
    }

    // Hide all modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // Show loading overlay
    showLoading(message = 'Processing...') {
        document.getElementById('loading-text').textContent = message;
        document.getElementById('loading-overlay').classList.add('show');
    }

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('show');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.showSaveModal();
                    break;
                case 'o':
                    e.preventDefault();
                    this.showLoadModal();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportRoute();
                    break;
            }
        }

        if (e.key === 'Escape') {
            this.hideModals();
        }
    }

    // Load saved routes from localStorage
    loadSavedRoutes() {
        // Already loaded in constructor
    }

    // Update UI elements
    updateUI() {
        this.loadSharedRoute();
    }

    // Utility function to capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the application
const routeCraft = new RouteCraft();

// Make routeCraft available globally for onclick handlers
window.routeCraft = routeCraft;