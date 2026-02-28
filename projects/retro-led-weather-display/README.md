# 🟥 Retro LED Matrix Weather Display

A retro-styled LED matrix weather display that brings back the 80s aesthetic with modern web technology. Watch weather icons come to life on a simulated 8x8 LED panel with authentic glow effects and dot-matrix characters.

## ✨ Features

- **8x8 LED Matrix Grid** - Individual LED pixels with authentic glow effects
- **Weather Icons** - Sun, clouds, and rain rendered in dot-matrix style
- **Dynamic Temperature** - Realistic temperature display for each weather type
- **LED Color Coding** - Yellow for sun, cyan for clouds, blue for rain
- **Auto-Cycling** - Automatically rotates through weather conditions every 5 seconds
- **Manual Control** - Retro-styled buttons to select weather manually
- **Blinking Effects** - Authentic cursor blink and LED animations
- **Responsive Design** - Works perfectly on all devices
- **No Dependencies** - Pure HTML, CSS, and JavaScript


🎯 How It Works
LED Matrix
The display uses a CSS Grid to create an 8x8 matrix of LED pixels. Each pixel is a div that lights up with CSS box-shadow effects to simulate real LED glow.

Weather Icons
Weather patterns are stored as 8x8 matrices (arrays of 0s and 1s). When activated, the corresponding pixels light up with weather-appropriate colors.

Temperature
Temperature values are dynamically generated based on weather type:

☀️ Sunny: 25-35°C

☁️ Cloudy: 18-26°C

🌧️ Rainy: 15-20°C

🛠️ Technologies Used
HTML5 - Structure and grid layout

CSS3 - LED effects, animations, responsive design

Vanilla JavaScript - Matrix manipulation, weather logic, interactions

📁 Project Structure
text
retro-led-matrix-weather/
├── index.html          
├── styles.css         
├── script.js        
├── README.md                