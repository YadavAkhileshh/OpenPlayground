
        // Constants for Yantra calculations
        const OBLIQUITY_ECLIPTIC = 23.436; // Obliquity of the Ecliptic in degrees
        const NAVBAR_HEIGHT = 64; // Must match CSS --navbar-height

        // Mapping of Yantra IDs to their formula (derived from Latitude phi)
        const YANTRA_MAP = {
            // Latitude (|phi|) dependent
            'samrat-angle': (lat) => Math.abs(lat),
            'dhruva-angle': (lat) => Math.abs(lat),
            'yantra-samrat-angle': (lat) => Math.abs(lat),
            'golayantra-angle': (lat) => Math.abs(lat),

            // Co-Latitude (90 - |phi|) dependent
            'dakshino-bhitti-angle': (lat) => 90 - Math.abs(lat),
            'bhitti-angle': (lat) => 90 - Math.abs(lat),
            'nadi-valaya-angle': (lat) => 90 - Math.abs(lat),

            // Obliquity (epsilon) dependent (Fixed Angle)
            'rasivalaya-angle': () => OBLIQUITY_ECLIPTIC,

            // Scale/Alignment dependent (No live calculation needed, handled in HTML)
        };
        
        /**
         * Custom smooth scrolling function to account for the fixed navbar height.
         */
        function scrollToSection(event, targetId) {
            event.preventDefault();
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - NAVBAR_HEIGHT;

                window.scrollTo({
                    top: offsetTop,
                    behavior: "smooth"
                });
            }
        }

        /**
         * Formats a number to a string with two decimal places and the degree symbol.
         */
        function formatAngle(value) {
            return `${value.toFixed(2)}&deg;`;
        }

        /**
         * Animates a numeric count-up effect for the angular dimension value.
         */
        function animateCountUp(element, finalValue, duration = 700) {
            if (finalValue === OBLIQUITY_ECLIPTIC) {
                element.innerHTML = formatAngle(finalValue);
                return;
            }

            const startValue = 0;
            let startTime = null;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = timestamp - startTime;
                const percentage = Math.min(progress / duration, 1);
                const currentValue = startValue + (finalValue - startValue) * percentage;

                element.innerHTML = `${currentValue.toFixed(2)}&deg;`;

                if (percentage < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    element.innerHTML = formatAngle(finalValue);
                }
            };

            window.requestAnimationFrame(step);
        }

        /**
         * Helper function to perform fetch with exponential backoff for resilience.
         */
        async function exponentialBackoffFetch(url, options, retries = 5, delay = 1000) {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await fetch(url, options);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    return response;
                } catch (error) {
                    if (i === retries - 1) throw error;
                    // Do not log retries
                    await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
                }
            }
        }

        /**
         * Uses the Google Search tool via the Gemini API to attempt to reverse geocode coordinates to a city name.
         */
        async function reverseGeocodeCoordinates(lat, lon) {
            const userQuery = `Identify the primary city and country name for coordinates latitude ${lat.toFixed(4)} and longitude ${lon.toFixed(4)}. Respond with only the City, Country.`;
            const apiKey = "AIzaSyBtu9MtEkT7X9GZkEryvwz4gUw55SsGUxM"; 
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                tools: [{ "google_search": {} }],
                systemInstruction: {
                    parts: [{ text: "You are a precise geocoding assistant. Always respond with only the City, Country name (e.g., 'Paris, France')." }]
                },
            };

            try {
                const response = await exponentialBackoffFetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text && text.length > 3) {
                    // Clean up and ensure it's a single line
                    return text.replace(/[\n\r]/g, ' ').replace(/\s{2,}/g, ' ').trim();
                }
                
                return "Unknown City (Search Result Empty)";

            } catch (e) {
                console.error("Reverse Geocoding API failed:", e);
                return "Unknown City (API Error)";
            }
        }
        
        // --- Copy Function ---
document.getElementById("copy-button").addEventListener("click", () => {
    // Capture the content you want to copy
    const yantraArea = document.getElementById("yantra-capture-area");
    const locationName = document.getElementById("location-name")?.textContent.trim() || "Unknown Location";
    const yantraDetails = yantraArea ? yantraArea.innerText.trim() : "";

    // Combine location and yantra info
    const finalText = `📍 Location: ${locationName}\n\n🔯 Yantra Calculations:\n${yantraDetails}`;

    if (yantraDetails && yantraDetails !== "") {
        navigator.clipboard.writeText(finalText)
            .then(() => {
                alert("✅ Yantra details copied successfully!");
            })
            .catch(err => {
                console.error("Copy failed: ", err);
                alert("⚠️ Unable to copy text. Please check permissions.");
            });
    } else {
        alert("⚠️ No Yantra details available to copy.");
    }
});

        /**
         * Shares the calculated location and the key Yantra dimensions on X (Twitter).
         */
        function shareOnTwitter() {
            const lat = document.getElementById('latitude').value;
            const locationName = document.getElementById('location-name').textContent;
            
            // Function to safely extract the numeric part of the angle from the display span, ignoring '&deg;'
            const getAngleValue = (id) => {
                const text = document.getElementById(id).textContent;
                // Regex to extract numbers and dot from the text content (e.g., "26.91°")
                const match = text.match(/[\d.]+/); 
                return match ? parseFloat(match[0]).toFixed(2) : '--';
            };

            const polarAxisAngle = getAngleValue('samrat-angle'); // Samrat/Polaris (Latitude)
            const equatorAltitude = getAngleValue('dakshino-bhitti-angle'); // Dakshinottara (Co-Latitude)
            const eclipticTilt = getAngleValue('rasivalaya-angle'); // Rasivalaya (Fixed Obliquity)
            
            // Construct a detailed and engaging tweet
            const tweetText = 
                `Jyotisha Yantra Dimensions for ${locationName} (Lat: ${lat}°):\n\n` +
                `📐 Samrat Yantra (Polar Axis): ${polarAxisAngle}°\n` +
                `🌍 Dakshinottara (Equator Alt): ${equatorAltitude}°\n` +
                `✨ Rasivalaya (Ecliptic Tilt): ${eclipticTilt}°\n\n` +
                `Check out the calculator to find your local astronomical angles!`;
            
            // Get the current URL
            const url = encodeURIComponent(window.location.href);
            
            // Build the Twitter URL
            const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${url}&hashtags=Jyotisha,Yantra,Astronomy,VedicScience`;

            window.open(twitterUrl, '_blank', 'noopener,noreferrer');
        }

        /**
         * Sets up the Intersection Observer for scroll-triggered animations.
         */
        function setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: '0px',
                threshold: 0.1 
            });

            // Observe all sections and cards
            const elementsToAnimate = document.querySelectorAll('.animate-init, #yantra-grid .yantra-card');
            elementsToAnimate.forEach((el, index) => {
                 // Add a slight delay for staggered effect
                 if (el.classList.contains('yantra-card')) {
                     el.style.transitionDelay = `${0.1 + index * 0.05}s`;
                 }
                 observer.observe(el);
            });
        }


        /**
         * Implements the core logic to calculate and display the Yantra dimensions based on latitude.
         */
        async function calculateYantraDimensions() {
            // Fetch all necessary elements early
            const latitudeInput = document.getElementById('latitude');
            const longitudeInput = document.getElementById('longitude');
            const errorMessage = document.getElementById('error-message');
            const shareButton = document.getElementById('share-button');
            
            const displayLatYantra = document.getElementById('display-latitude');
            const displayLatLoc = document.getElementById('display-latitude-loc');
            const displayLonLoc = document.getElementById('display-longitude-loc');
            const mapLink = document.getElementById('map-link');
            const mapBackground = document.getElementById('map-background-image');
            const locationInfoOverlay = document.getElementById('location-info-overlay');
            const locationNameElement = document.getElementById('location-name');


            if (!latitudeInput || !longitudeInput || !errorMessage) {
                console.error("Critical elements missing. Check HTML IDs.");
                if (errorMessage) {
                    errorMessage.textContent = 'Error: Page display elements are missing. Please check the HTML structure.';
                    errorMessage.style.display = 'block';
                }
                return;
            }

            // Clear previous results and errors
            errorMessage.style.display = 'none';
            errorMessage.textContent = '';
            
            let latitude, longitude;
            
            try {
                latitude = parseFloat(latitudeInput.value);
                longitude = parseFloat(longitudeInput.value);
            } catch (e) {
                errorMessage.textContent = 'Please enter a valid numeric value for Latitude and Longitude.';
                errorMessage.style.display = 'block';
                return;
            }

            // Input validation
            if (isNaN(latitude) || latitude < -90 || latitude > 90) {
                errorMessage.textContent = 'Latitude must be a number between -90 and 90 degrees.';
                errorMessage.style.display = 'block';
                return;
            }

            if (isNaN(longitude) || longitude < -180 || longitude > 180) {
                 longitude = 0;
            }

            // --- Location Display and Naming ---
            locationNameElement.innerHTML = '<span class="spinner" style="border-top-color: var(--color-accent);"></span>Fetching location...';
            locationInfoOverlay.innerHTML = 'Loading location...';
            mapBackground.style.backgroundImage = 'none'; 
            shareButton.style.display = 'none';

            let locationName;

            if (latitude.toFixed(4) === "26.9124" && longitude.toFixed(4) === "75.7873") {
                locationName = "Jaipur, Rajasthan, India (Vedic Reference)";
            } else {
                locationName = await reverseGeocodeCoordinates(latitude, longitude);
            }

            locationNameElement.textContent = locationName;
            
            // Update coordinates display
            displayLatLoc.textContent = latitude.toFixed(4);
            displayLonLoc.textContent = longitude.toFixed(4);

            // Generate Map URL
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
            mapLink.href = mapUrl;

            // Update Static Map Background image
            
            // Update Location Info Overlay text (Using HTML entities for phi and lambda)
            locationInfoOverlay.innerHTML = `
                <div class="text-xl sm:text-2xl">${locationName}</div>
                <div class="text-sm sm:text-lg mt-1">(&#981;: ${latitude.toFixed(4)}&deg;, &lambda;: ${longitude.toFixed(4)}&deg;)</div>
            `;
            
            // --- Yantra Dimension Calculation ---
            displayLatYantra.textContent = latitude.toFixed(4);

            // Calculation and display for each Yantra dimension
            for (const id in YANTRA_MAP) {
                if (YANTRA_MAP.hasOwnProperty(id)) {
                    const formula = YANTRA_MAP[id];
                    const angle = formula(latitude);
                    const element = document.getElementById(id);
                    if (element) {
                        animateCountUp(element, angle);
                    }
                }
            }
            
            // Show share button after successful calculation/location fetch
            shareButton.style.display = 'inline-flex';
            
            // Rerender math after content update
            if (window.renderMathInElement) {
                renderMathInElement(document.body, {delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ]});
            }
        }
        

        // Run setup and calculation on load
        window.onload = function() {
            // 1. Initial Calculation with default values
            calculateYantraDimensions(); 
            
            // 2. Setup Scroll Observer for Fade-in animations
            setupIntersectionObserver();
        };

        const descriptionCards = document.querySelectorAll('#yantras-description .yantra-description-card');

const descObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('animate-visible-card');
            }, index * 100); // stagger effect
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

descriptionCards.forEach(card => descObserver.observe(card));


       

    