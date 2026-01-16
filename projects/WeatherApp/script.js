// DOM Elements
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const weatherData = document.getElementById('weatherData');
const errorMsg = document.getElementById('errorMsg');
const loader = document.getElementById('loader');
const darkModeToggle = document.getElementById('darkModeToggle');
const useLocationBtn = document.getElementById('useLocationBtn');
const alertsBtn = document.getElementById('alertsBtn');
const alertModal = document.getElementById('alertModal');
const alertBadge = document.getElementById('alertBadge');
const alertContent = document.getElementById('alertContent');
const closeModal = document.querySelector('.close-modal');
const closeAlert = document.getElementById('closeAlert');
const enableNotifications = document.getElementById('enableNotifications');
const autocompleteResults = document.getElementById('autocompleteResults');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');
const forecastContainer = document.getElementById('forecastContainer');
const hourlyContainer = document.getElementById('hourlyContainer');
const weatherChart = document.getElementById('weatherChart');
const historyDate = document.getElementById('historyDate');
const chartType = document.getElementById('chartType');
const currentTime = document.getElementById('currentTime');
const lastUpdateTime = document.getElementById('lastUpdateTime');

let currentWeatherData = null;
let currentLocation = null;
let chartInstance = null;
let activeAlerts = [];

document.addEventListener('DOMContentLoaded', () => {
    historyDate.value = new Date().toISOString().split('T')[0];
    
    const savedCity = localStorage.getItem('lastCity') || 'New York';
    cityInput.value = savedCity;
    
    setTimeout(() => getCityCoordinates(savedCity), 500);
    
    setupEventListeners();
});

function setupEventListeners() {
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('light-mode', darkModeToggle.checked);
        localStorage.setItem('darkMode', darkModeToggle.checked);
    });

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    darkModeToggle.checked = savedDarkMode;
    document.body.classList.toggle('light-mode', savedDarkMode);

    searchBtn.addEventListener('click', () => {
        const city = cityInput.value.trim();
        if (city) getCityCoordinates(city);
    });

    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = cityInput.value.trim();
            if (city) getCityCoordinates(city);
        }
    });

    cityInput.addEventListener('input', debounce(handleAutocomplete, 300));

    useLocationBtn.addEventListener('click', getCurrentLocation);

    alertsBtn.addEventListener('click', () => {
        showAlerts();
        alertModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => alertModal.classList.add('hidden'));
    closeAlert.addEventListener('click', () => alertModal.classList.add('hidden'));
    
    enableNotifications.addEventListener('click', requestNotificationPermission);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });

    historyDate.addEventListener('change', updateChart);
    chartType.addEventListener('change', updateChart);

    alertModal.addEventListener('click', (e) => {
        if (e.target === alertModal) {
            alertModal.classList.add('hidden');
        }
    });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function handleAutocomplete() {
    const query = cityInput.value.trim();
    if (query.length < 2) {
        autocompleteResults.classList.add('hidden');
        return;
    }

    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`
        );
        const data = await response.json();

        if (!data.results) {
            autocompleteResults.classList.add('hidden');
            return;
        }

        autocompleteResults.innerHTML = '';
        data.results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            item.textContent = `${result.name}, ${result.country}`;
            item.addEventListener('click', () => {
                cityInput.value = result.name;
                autocompleteResults.classList.add('hidden');
                getCityCoordinates(result.name);
            });
            autocompleteResults.appendChild(item);
        });

        autocompleteResults.classList.remove('hidden');
    } catch (error) {
        console.error('Autocomplete error:', error);
    }
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser');
        return;
    }

    loader.style.display = 'block';
    errorMsg.style.display = 'none';
    weatherData.classList.add('hidden');

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&count=1&language=en`;
                const response = await fetch(geoUrl);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const { name, country } = data.results[0];
                    cityInput.value = name;
                    getWeather(latitude, longitude, name, country);
                } else {
                    getWeather(latitude, longitude, 'Your Location', '');
                }
            } catch (error) {
                getWeather(latitude, longitude, 'Your Location', '');
            }
        },
        (error) => {
            loader.style.display = 'none';
            showError('Unable to retrieve your location');
        }
    );
}

async function getCityCoordinates(city) {
    // UI Reset
    weatherData.classList.add('hidden');
    errorMsg.style.display = 'none';
    loader.style.display = 'block';
    autocompleteResults.classList.add('hidden');

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results) {
            throw new Error("City not found");
        }

        const { latitude, longitude, name, country } = geoData.results[0];
        currentLocation = { latitude, longitude, name, country };
        
        localStorage.setItem('lastCity', name);
        
        await getWeather(latitude, longitude, name, country);
        
        await getWeatherAlerts(latitude, longitude);

    } catch (error) {
        loader.style.display = 'none';
        showError("City not found. Try again.");
    }
}

async function getWeather(lat, lon, name, country) {
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,weathercode&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;
        const response = await fetch(weatherUrl);
        const data = await response.json();

        currentWeatherData = data;
        
        updateCurrentWeather(data, name, country);
        updateForecast(data.daily);
        updateHourly(data.hourly);
        updateChart();
        
        updateTime();
        
        loader.style.display = 'none';
        weatherData.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        loader.style.display = 'none';
        showError("Error fetching weather data.");
    }
}

function updateCurrentWeather(data, name, country) {
    const current = data.current_weather;
    const currentHour = new Date().toISOString().slice(0, 13) + ":00";
    const hourIndex = data.hourly.time.indexOf(currentHour);
    
    const currentTemp = current.temperature;
    const currentHumidity = hourIndex !== -1 ? data.hourly.relativehumidity_2m[hourIndex] : 50;
    const currentFeelsLike = hourIndex !== -1 ? data.hourly.apparent_temperature[hourIndex] : currentTemp;
    
    cityName.textContent = `${name}, ${country}`;
    temperature.textContent = Math.round(currentTemp);
    windSpeed.textContent = `${current.windspeed} km/h`;
    humidity.textContent = `${currentHumidity}%`;
    feelsLike.textContent = `${Math.round(currentFeelsLike)}°C`;
    uvIndex.textContent = current.uv_index || 'N/A';
    
    const weatherInfo = getWeatherInfo(current.weathercode);
    condition.textContent = weatherInfo.description;
    weatherIcon.innerHTML = weatherInfo.icon;
}

function updateForecast(dailyData) {
    forecastContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const date = new Date(dailyData.time[i]);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const maxTemp = Math.round(dailyData.temperature_2m_max[i]);
        const minTemp = Math.round(dailyData.temperature_2m_min[i]);
        const weatherInfo = getWeatherInfo(dailyData.weathercode[i]);
        
        const forecastDay = document.createElement('div');
        forecastDay.className = 'forecast-day';
        forecastDay.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <div class="forecast-icon">${weatherInfo.icon}</div>
            <div class="forecast-temp">${maxTemp}° / ${minTemp}°</div>
            <div class="forecast-condition">${weatherInfo.description}</div>
        `;
        
        forecastContainer.appendChild(forecastDay);
    }
}

function updateHourly(hourlyData) {
    hourlyContainer.innerHTML = '';
    
    const now = new Date();
    const currentHour = now.getHours();
    
    for (let i = 0; i < 12; i++) {
        const hourIndex = (currentHour + i) % 24;
        const time = `${hourIndex}:00`;
        const temp = Math.round(hourlyData.temperature_2m[hourIndex]);
        const weatherInfo = getWeatherInfo(hourlyData.weathercode[hourIndex]);
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="hourly-time">${time}</div>
            <div class="hourly-icon">${weatherInfo.icon}</div>
            <div class="hourly-temp">${temp}°</div>
        `;
        
        hourlyContainer.appendChild(hourlyItem);
    }
}

function updateChart() {
    if (!currentWeatherData) return;
    
    const ctx = weatherChart.getContext('2d');
    const selectedDate = historyDate.value;
    const hourlyData = currentWeatherData.hourly;
    
    const startTime = selectedDate + 'T00:00';
    const endTime = selectedDate + 'T23:59';
    
    const timeLabels = [];
    const tempData = [];
    const humidityData = [];
    
    hourlyData.time.forEach((time, index) => {
        if (time >= startTime && time <= endTime) {
            const hour = new Date(time).getHours();
            timeLabels.push(`${hour}:00`);
            tempData.push(hourlyData.temperature_2m[index]);
            humidityData.push(hourlyData.relativehumidity_2m[index]);
        }
    });
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const chartTypeValue = chartType.value;
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                ...(chartTypeValue === 'temperature' || chartTypeValue === 'both' ? [{
                    label: 'Temperature (°C)',
                    data: tempData,
                    borderColor: '#4361ee',
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    tension: 0.4,
                    fill: true
                }] : []),
                ...(chartTypeValue === 'humidity' || chartTypeValue === 'both' ? [{
                    label: 'Humidity (%)',
                    data: humidityData,
                    borderColor: '#4cc9f0',
                    backgroundColor: 'rgba(76, 201, 240, 0.1)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }] : [])
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Weather History for ${selectedDate}`
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Temperature (°C)'
                    }
                },
                ...(chartTypeValue === 'both' ? {
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Humidity (%)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                } : {})
            }
        }
    });
}

async function getWeatherAlerts(lat, lon) {
    try {
        activeAlerts = getMockAlerts();
        
        if (activeAlerts.length > 0) {
            alertBadge.textContent = activeAlerts.length;
            alertBadge.classList.remove('hidden');
            
            const severeAlerts = activeAlerts.filter(alert => alert.severity === 'severe');
            if (severeAlerts.length > 0 && Notification.permission === 'granted') {
                showBrowserNotification(severeAlerts[0]);
            }
        } else {
            alertBadge.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error fetching alerts:', error);
    }
}

function showAlerts() {
    alertContent.innerHTML = '';
    
    if (activeAlerts.length === 0) {
        alertContent.innerHTML = '<p>No active weather alerts for your location.</p>';
        return;
    }
    
    activeAlerts.forEach(alert => {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alert.severity}`;
        alertItem.innerHTML = `
            <h4>${alert.title}</h4>
            <p>${alert.description}</p>
            <small>Issued: ${new Date(alert.issued).toLocaleString()}</small>
        `;
        alertContent.appendChild(alertItem);
    });
}

function requestNotificationPermission() {
    if (!("Notification" in window)) {
        alert("This browser does not support notifications");
        return;
    }
    
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            alert("Notifications enabled! You'll receive alerts for severe weather.");
        }
    });
}

function showBrowserNotification(alert) {
    if (Notification.permission === "granted") {
        new Notification("Weather Alert: " + alert.title, {
            body: alert.description,
            icon: "/weather-icon.png"
        });
    }
}

function getMockAlerts() {
    return [
        {
            title: "Heat Advisory",
            description: "High temperatures expected. Stay hydrated and avoid prolonged sun exposure.",
            severity: "moderate",
            issued: new Date().toISOString()
        },
        {
            title: "Thunderstorm Watch",
            description: "Severe thunderstorms possible in your area. Stay indoors if possible.",
            severity: "severe",
            issued: new Date().toISOString()
        }
    ];
}

function switchTab(tabId) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    tabPanes.forEach(pane => pane.classList.remove('active'));
    document.getElementById(`${tabId}Tab`).classList.add('active');
    
    if (tabId === 'charts') {
        setTimeout(updateChart, 100);
    }
}

function updateTime() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdateTime.textContent = now.toLocaleTimeString();
}

function showError(message) {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
}

function getWeatherInfo(code) {
    const weatherCodes = {
        0: { description: "Clear Sky", icon: "<i class='fas fa-sun'></i>" },
        1: { description: "Mainly Clear", icon: "<i class='fas fa-cloud-sun'></i>" },
        2: { description: "Partly Cloudy", icon: "<i class='fas fa-cloud-sun'></i>" },
        3: { description: "Overcast", icon: "<i class='fas fa-cloud'></i>" },
        45: { description: "Fog", icon: "<i class='fas fa-smog'></i>" },
        48: { description: "Rime Fog", icon: "<i class='fas fa-smog'></i>" },
        51: { description: "Light Drizzle", icon: "<i class='fas fa-cloud-rain'></i>" },
        53: { description: "Moderate Drizzle", icon: "<i class='fas fa-cloud-rain'></i>" },
        55: { description: "Heavy Drizzle", icon: "<i class='fas fa-cloud-showers-heavy'></i>" },
        56: { description: "Freezing Drizzle", icon: "<i class='fas fa-icicles'></i>" },
        57: { description: "Heavy Freezing Drizzle", icon: "<i class='fas fa-icicles'></i>" },
        61: { description: "Slight Rain", icon: "<i class='fas fa-cloud-rain'></i>" },
        63: { description: "Moderate Rain", icon: "<i class='fas fa-cloud-showers-heavy'></i>" },
        65: { description: "Heavy Rain", icon: "<i class='fas fa-cloud-showers-heavy'></i>" },
        66: { description: "Freezing Rain", icon: "<i class='fas fa-icicles'></i>" },
        67: { description: "Heavy Freezing Rain", icon: "<i class='fas fa-icicles'></i>" },
        71: { description: "Slight Snow", icon: "<i class='fas fa-snowflake'></i>" },
        73: { description: "Moderate Snow", icon: "<i class='fas fa-snowflake'></i>" },
        75: { description: "Heavy Snow", icon: "<i class='fas fa-snowflake'></i>" },
        77: { description: "Snow Grains", icon: "<i class='fas fa-snowflake'></i>" },
        80: { description: "Slight Rain Showers", icon: "<i class='fas fa-cloud-sun-rain'></i>" },
        81: { description: "Moderate Rain Showers", icon: "<i class='fas fa-cloud-sun-rain'></i>" },
        82: { description: "Violent Rain Showers", icon: "<i class='fas fa-cloud-showers-heavy'></i>" },
        85: { description: "Slight Snow Showers", icon: "<i class='fas fa-snowflake'></i>" },
        86: { description: "Heavy Snow Showers", icon: "<i class='fas fa-snowflake'></i>" },
        95: { description: "Thunderstorm", icon: "<i class='fas fa-bolt'></i>" },
        96: { description: "Thunderstorm with Hail", icon: "<i class='fas fa-bolt'></i>" },
        99: { description: "Heavy Thunderstorm with Hail", icon: "<i class='fas fa-bolt'></i>" }
    };
    
    return weatherCodes[code] || { description: "Unknown", icon: "<i class='fas fa-question'></i>" };
}