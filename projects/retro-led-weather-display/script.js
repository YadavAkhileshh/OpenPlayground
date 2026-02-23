const weatherIcons = {
    sun: [
        [0,0,0,1,0,0,0,0],
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,0,1,1,1,0,0,0],
        [0,0,0,1,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ],
    clouds: [
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,0,1,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0]
    ],
    rain: [
        [0,0,1,1,1,0,0,0],
        [0,1,1,1,1,1,0,0],
        [1,1,1,1,1,1,1,0],
        [0,1,1,1,1,1,0,0],
        [0,0,1,1,1,0,0,0],
        [0,0,1,0,1,0,0,0],
        [0,0,0,1,0,0,0,0],
        [0,0,1,0,1,0,0,0]
    ]
};

function createMatrix() {
    const grid = document.getElementById('weatherIcon');
    grid.innerHTML = '';
    
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            const pixel = document.createElement('div');
            pixel.className = 'led-pixel';
            pixel.dataset.row = i;
            pixel.dataset.col = j;
            grid.appendChild(pixel);
        }
    }
}

function drawIcon(iconType) {
    const pixels = document.querySelectorAll('.led-pixel');
    const icon = weatherIcons[iconType];
    
    pixels.forEach(pixel => {
        pixel.className = 'led-pixel';
    });
    
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            if(icon[i][j] === 1) {
                const index = i * 8 + j;
                let colorClass = 'active';
                
                if(iconType === 'sun') colorClass = 'active-yellow';
                else if(iconType === 'clouds') colorClass = 'active-cyan';
                else if(iconType === 'rain') colorClass = 'active-blue';
                
                pixels[index].classList.add(colorClass);
            }
        }
    }
}

function updateTemperature(weatherType) {
    const tempElement = document.getElementById('temperature');
    const temps = {
        sun: Math.floor(Math.random() * 10 + 25) + '°C',
        clouds: Math.floor(Math.random() * 8 + 18) + '°C',
        rain: Math.floor(Math.random() * 5 + 15) + '°C'
    };
    
    tempElement.textContent = temps[weatherType];
    tempElement.style.animation = 'none';
    tempElement.offsetHeight;
    tempElement.style.animation = 'blink 0.5s';
}

function initWeather() {
    const weatherTypes = ['sun', 'clouds', 'rain'];
    let currentIndex = 0;
    
    setInterval(() => {
        currentIndex = (currentIndex + 1) % weatherTypes.length;
        drawIcon(weatherTypes[currentIndex]);
        updateTemperature(weatherTypes[currentIndex]);
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    createMatrix();
    drawIcon('sun');
    updateTemperature('sun');
    initWeather();
    
    document.querySelectorAll('.led-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const weather = e.target.dataset.weather;
            drawIcon(weather);
            updateTemperature(weather);
        });
    });
    
    setInterval(() => {
        const city = document.querySelector('.led-city');
        city.textContent = city.textContent === 'NEW YORK' ? 'SYSTEM' : 'NEW YORK';
    }, 3000);
});