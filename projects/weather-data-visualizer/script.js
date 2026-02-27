document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location-input');
    const fetchWeatherBtn = document.getElementById('fetch-weather');
    const weatherInfo = document.getElementById('weather-info');
    const locationName = document.getElementById('location-name');
    const temperature = document.getElementById('temperature');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('wind-speed');
    const weatherChartCanvas = document.getElementById('weather-chart');

    let weatherChart;

    // Mock weather data for demonstration
    const mockWeatherData = {
        'London': {
            name: 'London',
            temp: 15,
            humidity: 65,
            wind: 12,
            forecast: [
                { day: 'Today', temp: 15, humidity: 65 },
                { day: 'Tomorrow', temp: 17, humidity: 60 },
                { day: 'Day 3', temp: 14, humidity: 70 },
                { day: 'Day 4', temp: 16, humidity: 55 },
                { day: 'Day 5', temp: 18, humidity: 50 }
            ]
        },
        'New York': {
            name: 'New York',
            temp: 22,
            humidity: 70,
            wind: 8,
            forecast: [
                { day: 'Today', temp: 22, humidity: 70 },
                { day: 'Tomorrow', temp: 24, humidity: 65 },
                { day: 'Day 3', temp: 20, humidity: 75 },
                { day: 'Day 4', temp: 23, humidity: 60 },
                { day: 'Day 5', temp: 25, humidity: 55 }
            ]
        },
        'Tokyo': {
            name: 'Tokyo',
            temp: 18,
            humidity: 75,
            wind: 15,
            forecast: [
                { day: 'Today', temp: 18, humidity: 75 },
                { day: 'Tomorrow', temp: 20, humidity: 70 },
                { day: 'Day 3', temp: 17, humidity: 80 },
                { day: 'Day 4', temp: 19, humidity: 65 },
                { day: 'Day 5', temp: 21, humidity: 60 }
            ]
        },
        'Sydney': {
            name: 'Sydney',
            temp: 25,
            humidity: 60,
            wind: 10,
            forecast: [
                { day: 'Today', temp: 25, humidity: 60 },
                { day: 'Tomorrow', temp: 27, humidity: 55 },
                { day: 'Day 3', temp: 24, humidity: 65 },
                { day: 'Day 4', temp: 26, humidity: 50 },
                { day: 'Day 5', temp: 28, humidity: 45 }
            ]
        }
    };

    fetchWeatherBtn.addEventListener('click', () => {
        const location = locationInput.value.trim();
        if (!location) {
            alert('Please enter a location');
            return;
        }

        // Simulate API call delay
        fetchWeatherBtn.disabled = true;
        fetchWeatherBtn.textContent = 'Fetching...';

        setTimeout(() => {
            fetchWeather(location);
            fetchWeatherBtn.disabled = false;
            fetchWeatherBtn.textContent = 'Get Weather';
        }, 1000);
    });

    function fetchWeather(location) {
        // Use mock data instead of real API
        const data = mockWeatherData[location] || mockWeatherData['London']; // Default to London if not found

        displayWeather(data);
        updateChart(data.forecast);
    }

    function displayWeather(data) {
        locationName.textContent = data.name;
        temperature.textContent = `Temperature: ${data.temp}°C`;
        humidity.textContent = `Humidity: ${data.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${data.wind} km/h`;

        weatherInfo.style.display = 'block';
    }

    function updateChart(forecast) {
        const labels = forecast.map(day => day.day);
        const tempData = forecast.map(day => day.temp);
        const humidityData = forecast.map(day => day.humidity);

        if (weatherChart) {
            weatherChart.destroy();
        }

        weatherChart = new Chart(weatherChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Temperature (°C)',
                        data: tempData,
                        borderColor: 'rgba(102, 126, 234, 1)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        yAxisID: 'y',
                        tension: 0.4
                    },
                    {
                        label: 'Humidity (%)',
                        data: humidityData,
                        borderColor: 'rgba(118, 75, 162, 1)',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        yAxisID: 'y1',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                stacked: false,
                plugins: {
                    title: {
                        display: true,
                        text: '5-Day Weather Forecast'
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        }
                    },
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
                    },
                }
            }
        });
    }

    // Initialize with default data
    fetchWeather('London');
});
