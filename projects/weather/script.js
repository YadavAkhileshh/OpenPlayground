const apiKey = "YOUR_API_KEY"; // from openweathermap.org

async function getWeather() {
  let city = document.getElementById("cityInput").value;
  if(city === "") return;

  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  let res = await fetch(url);
  let data = await res.json();

  document.getElementById("city").innerText = data.name;
  document.getElementById("temp").innerText = data.main.temp + " °C";
  document.getElementById("condition").innerText = data.weather[0].main;
  document.getElementById("humidity").innerText = "Humidity: " + data.main.humidity + "%";
  document.getElementById("wind").innerText = "Wind: " + data.wind.speed + " km/h";

  changeBackground(data.weather[0].main);
}

function changeBackground(condition) {
  if(condition === "Clear") {
    document.body.style.background = "linear-gradient(135deg,#f7971e,#ffd200)";
  } else if(condition === "Clouds") {
    document.body.style.background = "linear-gradient(135deg,#bdc3c7,#2c3e50)";
  } else if(condition === "Rain") {
    document.body.style.background = "linear-gradient(135deg,#4b79a1,#283e51)";
  } else {
    document.body.style.background = "linear-gradient(135deg,#74ebd5,#acb6e5)";
  }
}