
        // DOM Elements
        const cityInput = document.getElementById('city-input');
        const searchBtn = document.getElementById('search-btn');
        const locationBtn = document.getElementById('location-btn');
        const cityName = document.getElementById('city-name');
        const temperature = document.getElementById('temperature');
        const weatherCondition = document.getElementById('weather-condition');
        const weatherDescription = document.getElementById('weather-description');
        const windSpeed = document.getElementById('wind-speed');
        const humidity = document.getElementById('humidity');
        const feelsLike = document.getElementById('feels-like');
        const cloudiness = document.getElementById('cloudiness');
        const sculptureContainer = document.getElementById('sculpture-container');
        const loading = document.getElementById('loading');

        // API Configuration (Replace with your own API key for real data)
        // For demo, we'll use simulated data
        const API_KEY = 'demo_key'; // Replace with actual OpenWeatherMap API key
        const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

        // Sample weather data for demonstration
        const sampleWeatherData = {
            'New York': {
                name: 'New York, US',
                main: { temp: 24, feels_like: 25, humidity: 65 },
                weather: [{ main: 'Clouds', description: 'partly cloudy' }],
                wind: { speed: 12 },
                clouds: { all: 40 },
                sys: { sunrise: Date.now()/1000 - 5*3600, sunset: Date.now()/1000 + 2*3600 }
            },
            'London': {
                name: 'London, UK',
                main: { temp: 15, feels_like: 14, humidity: 80 },
                weather: [{ main: 'Rain', description: 'light rain' }],
                wind: { speed: 18 },
                clouds: { all: 90 },
                sys: { sunrise: Date.now()/1000 - 2*3600, sunset: Date.now()/1000 + 4*3600 }
            },
            'Tokyo': {
                name: 'Tokyo, Japan',
                main: { temp: 28, feels_like: 30, humidity: 70 },
                weather: [{ main: 'Clear', description: 'clear sky' }],
                wind: { speed: 8 },
                clouds: { all: 10 },
                sys: { sunrise: Date.now()/1000 - 1*3600, sunset: Date.now()/1000 + 6*3600 }
            },
            'Sydney': {
                name: 'Sydney, Australia',
                main: { temp: 22, feels_like: 23, humidity: 55 },
                weather: [{ main: 'Sunny', description: 'sunny' }],
                wind: { speed: 15 },
                clouds: { all: 5 },
                sys: { sunrise: Date.now()/1000 - 3*3600, sunset: Date.now()/1000 + 3*3600 }
            },
            'Moscow': {
                name: 'Moscow, Russia',
                main: { temp: 8, feels_like: 5, humidity: 85 },
                weather: [{ main: 'Snow', description: 'light snow' }],
                wind: { speed: 22 },
                clouds: { all: 100 },
                sys: { sunrise: Date.now()/1000 - 4*3600, sunset: Date.now()/1000 + 1*3600 }
            }
        };

        // Default city
        let currentCity = 'New York';

        // Initialize with default city
        window.addEventListener('DOMContentLoaded', () => {
            getWeatherData(currentCity);
        });

        // Event Listeners
        searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                getWeatherData(city);
                cityInput.value = '';
            }
        });

        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const city = cityInput.value.trim();
                if (city) {
                    getWeatherData(city);
                    cityInput.value = '';
                }
            }
        });

        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    position => {
                        // In a real implementation, you would reverse geocode the coordinates
                        // For demo, we'll use a random city from our sample data
                        const cities = Object.keys(sampleWeatherData);
                        const randomCity = cities[Math.floor(Math.random() * cities.length)];
                        getWeatherData(randomCity);
                    },
                    error => {
                        alert('Unable to retrieve your location. Please search for a city manually.');
                        console.error('Geolocation error:', error);
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });

        // Fetch weather data (simulated for demo)
        async function getWeatherData(city) {
            loading.style.display = 'block';
            
            // Simulate API delay
            setTimeout(() => {
                // Check if city exists in sample data
                const normalizedCity = Object.keys(sampleWeatherData).find(
                    key => key.toLowerCase() === city.toLowerCase()
                ) || 'New York';
                
                const weatherData = sampleWeatherData[normalizedCity];
                currentCity = normalizedCity;
                
                updateWeatherUI(weatherData);
                generateWeatherSculpture(weatherData);
                
                loading.style.display = 'none';
            }, 800);
        }

        // Update weather information UI
        function updateWeatherUI(data) {
            cityName.textContent = data.name;
            temperature.textContent = `${data.main.temp}°C`;
            weatherCondition.textContent = data.weather[0].main;
            weatherDescription.textContent = `Feels like ${data.main.feels_like}°C • Humidity: ${data.main.humidity}%`;
            windSpeed.textContent = `${data.wind.speed} km/h`;
            humidity.textContent = `${data.main.humidity}%`;
            feelsLike.textContent = `${data.main.feels_like}°C`;
            cloudiness.textContent = `${data.clouds.all}%`;
        }

        // Generate the weather sculpture
        function generateWeatherSculpture(data) {
            // Clear previous sculpture
            sculptureContainer.innerHTML = '';
            
            // Add ground
            const ground = document.createElement('div');
            ground.className = 'ground';
            sculptureContainer.appendChild(ground);
            
            // Determine if it's day or night
            const now = Date.now() / 1000;
            const isDay = now > data.sys.sunrise && now < data.sys.sunset;
            
            // Add sun or moon
            if (isDay) {
                const sun = document.createElement('div');
                sun.className = 'sun';
                sculptureContainer.appendChild(sun);
                
                // Adjust sun position based on time
                const dayProgress = (now - data.sys.sunrise) / (data.sys.sunset - data.sys.sunrise);
                const sunLeft = 20 + (dayProgress * 60);
                sun.style.left = `${sunLeft}%`;
            } else {
                const moon = document.createElement('div');
                moon.className = 'moon';
                sculptureContainer.appendChild(moon);
                
                // Adjust moon position based on time
                const nightProgress = (now - data.sys.sunset) / (86400 - (data.sys.sunset - data.sys.sunrise));
                const moonLeft = 20 + (nightProgress * 60);
                moon.style.left = `${moonLeft}%`;
            }
            
            // Set sky color based on time and weather
            const sky = document.createElement('div');
            sky.className = 'sky';
            
            if (isDay) {
                if (data.weather[0].main === 'Clear' || data.weather[0].main === 'Sunny') {
                    sky.style.background = 'linear-gradient(to bottom, #87CEEB, #E0F7FF)';
                } else if (data.weather[0].main === 'Clouds') {
                    sky.style.background = 'linear-gradient(to bottom, #B0C4DE, #D3D3D3)';
                } else if (data.weather[0].main === 'Rain') {
                    sky.style.background = 'linear-gradient(to bottom, #808080, #A9A9A9)';
                }
            } else {
                sky.style.background = 'linear-gradient(to bottom, #0f0c29, #302b63)';
            }
            
            sculptureContainer.appendChild(sky);
            
            // Generate weather elements based on conditions
            const weatherType = data.weather[0].main;
            
            if (weatherType === 'Clouds') {
                generateClouds(data.clouds.all);
            }
            
            if (weatherType === 'Rain') {
                generateRain(data.wind.speed);
                generateClouds(100); // Full cloud cover for rain
            }
            
            if (weatherType === 'Snow') {
                generateSnow(data.wind.speed);
                generateClouds(100); // Full cloud cover for snow
            }
            
            if (weatherType === 'Clear' || weatherType === 'Sunny') {
                // Add a few wispy clouds for clear/sunny days
                if (data.clouds.all > 0) {
                    generateClouds(data.clouds.all);
                }
            }
            
            // Always generate wind lines (strength based on wind speed)
            generateWind(data.wind.speed);
            
            // Add trees (more for calm weather, swaying for windy)
            generateTrees(data.wind.speed);
            
            // Set ground color based on weather
            if (weatherType === 'Snow') {
                ground.style.background = 'linear-gradient(to top, #E6F7FF, #FFFFFF)';
            } else if (weatherType === 'Rain') {
                ground.style.background = 'linear-gradient(to top, #2E4F2E, #3A5F3A)';
            } else {
                ground.style.background = 'linear-gradient(to top, #1a3a27, #2d6a4f)';
            }
        }

        // Generate clouds based on cloud cover percentage
        function generateClouds(cloudCover) {
            const cloudCount = Math.floor(cloudCover / 10); // 0-10 clouds
            
            for (let i = 0; i < cloudCount; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                
                // Randomize cloud properties
                const size = 40 + Math.random() * 60;
                const top = 30 + Math.random() * 40;
                const opacity = 0.6 + Math.random() * 0.4;
                const animationDelay = Math.random() * 20;
                
                cloud.style.width = `${size}px`;
                cloud.style.height = `${size * 0.6}px`;
                cloud.style.top = `${top}%`;
                cloud.style.left = `${-100 - Math.random() * 100}px`;
                cloud.style.opacity = opacity;
                cloud.style.animationDelay = `${animationDelay}s`;
                
                // Create cloud shape with multiple circles
                cloud.innerHTML = `
                    <div style="position: absolute; width: ${size * 0.6}px; height: ${size * 0.6}px; background: inherit; border-radius: 50%; top: -${size * 0.3}px; left: ${size * 0.1}px;"></div>
                    <div style="position: absolute; width: ${size * 0.7}px; height: ${size * 0.7}px; background: inherit; border-radius: 50%; top: -${size * 0.25}px; left: ${size * 0.4}px;"></div>
                    <div style="position: absolute; width: ${size * 0.5}px; height: ${size * 0.5}px; background: inherit; border-radius: 50%; top: -${size * 0.2}px; left: ${size * 0.9}px;"></div>
                `;
                
                sculptureContainer.appendChild(cloud);
            }
        }

        // Generate rain drops
        function generateRain(windSpeed) {
            const rainCount = 100; // Number of raindrops
            
            for (let i = 0; i < rainCount; i++) {
                const rainDrop = document.createElement('div');
                rainDrop.className = 'rain-drop';
                
                const left = Math.random() * 100;
                const animationDelay = Math.random() * 2;
                const animationDuration = 0.5 + Math.random() * 1.5;
                const windInfluence = windSpeed * 0.5;
                
                rainDrop.style.left = `${left}%`;
                rainDrop.style.animationDelay = `${animationDelay}s`;
                rainDrop.style.animationDuration = `${animationDuration}s`;
                rainDrop.style.transform = `translateX(${windInfluence}px)`;
                
                sculptureContainer.appendChild(rainDrop);
            }
        }

        // Generate snow flakes
        function generateSnow(windSpeed) {
            const snowCount = 80; // Number of snowflakes
            
            for (let i = 0; i < snowCount; i++) {
                const snowFlake = document.createElement('div');
                snowFlake.className = 'snow-flake';
                
                const left = Math.random() * 100;
                const size = 3 + Math.random() * 7;
                const animationDelay = Math.random() * 5;
                const animationDuration = 3 + Math.random() * 7;
                const windInfluence = windSpeed * 0.3;
                
                snowFlake.style.left = `${left}%`;
                snowFlake.style.width = `${size}px`;
                snowFlake.style.height = `${size}px`;
                snowFlake.style.animationDelay = `${animationDelay}s`;
                snowFlake.style.animationDuration = `${animationDuration}s`;
                snowFlake.style.transform = `translateX(${windInfluence}px)`;
                
                sculptureContainer.appendChild(snowFlake);
            }
        }

        // Generate wind lines
        function generateWind(windSpeed) {
            const windCount = Math.floor(windSpeed / 5); // More lines for stronger wind
            
            for (let i = 0; i < windCount; i++) {
                const windLine = document.createElement('div');
                windLine.className = 'wind-line';
                
                const top = 20 + Math.random() * 60;
                const width = 50 + Math.random() * 100;
                const opacity = 0.2 + Math.random() * 0.3;
                const animationDelay = Math.random() * 10;
                
                windLine.style.top = `${top}%`;
                windLine.style.width = `${width}px`;
                windLine.style.opacity = opacity;
                windLine.style.animationDelay = `${animationDelay}s`;
                
                // Adjust animation speed based on wind speed
                windLine.style.animationDuration = `${20 - (windSpeed / 5)}s`;
                
                sculptureContainer.appendChild(windLine);
            }
        }

        // Generate trees with sway based on wind
        function generateTrees(windSpeed) {
            const treeCount = 10; // Number of trees
            
            for (let i = 0; i < treeCount; i++) {
                // Create tree trunk
                const trunk = document.createElement('div');
                trunk.className = 'tree-trunk';
                
                const left = 10 + (i * 9);
                const height = 30 + Math.random() * 30;
                
                trunk.style.left = `${left}%`;
                trunk.style.height = `${height}px`;
                
                // Add sway animation if windy
                if (windSpeed > 15) {
                    trunk.style.animation = `sway ${3 + Math.random() * 2}s infinite alternate ease-in-out`;
                    trunk.style.transformOrigin = 'bottom center';
                }
                
                sculptureContainer.appendChild(trunk);
                
                // Create tree foliage
                const tree = document.createElement('div');
                tree.className = 'tree';
                
                tree.style.left = `${left - 1.5}%`;
                tree.style.bottom = `${30 + height}%`;
                tree.style.borderBottomWidth = `${40 + Math.random() * 40}px`;
                tree.style.borderLeftWidth = `${10 + Math.random() * 10}px`;
                tree.style.borderRightWidth = `${10 + Math.random() * 10}px`;
                
                // Adjust color based on season (simulated)
                const greenShade = Math.floor(100 + Math.random() * 100);
                tree.style.borderBottomColor = `rgb(30, ${greenShade}, 50)`;
                
                // Add sway animation if windy
                if (windSpeed > 15) {
                    tree.style.animation = `sway ${3 + Math.random() * 2}s infinite alternate ease-in-out`;
                    tree.style.animationDelay = `${Math.random() * 2}s`;
                    tree.style.transformOrigin = 'bottom center';
                }
                
                sculptureContainer.appendChild(tree);
            }
            
            // Add CSS for sway animation
            if (!document.querySelector('#sway-animation')) {
                const style = document.createElement('style');
                style.id = 'sway-animation';
                style.textContent = `
                    @keyframes sway {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(${Math.min(windSpeed / 10, 5)}deg); }
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Add sample cities for quick testing
        const sampleCities = document.createElement('div');
        sampleCities.style.cssText = `
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
        `;
        
        const cities = ['London', 'Tokyo', 'Sydney', 'Moscow'];
        cities.forEach(city => {
            const btn = document.createElement('button');
            btn.textContent = city;
            btn.style.cssText = `
                padding: 8px 16px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                border-radius: 20px;
                cursor: pointer;
                transition: all 0.3s;
            `;
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.2)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 255, 255, 0.1)';
            });
            btn.addEventListener('click', () => {
                getWeatherData(city);
            });
            sampleCities.appendChild(btn);
        });
        
        document.querySelector('.controls').appendChild(sampleCities);
    