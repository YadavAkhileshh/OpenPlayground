const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const adviceEl = document.getElementById("advice");

// Modal & Toast
const apiBtn = document.getElementById("apiBtn");
const apiModal = document.getElementById("apiModal");
const apiInput = document.getElementById("apiInput");
const saveApi = document.getElementById("saveApi");
const closeApi = document.getElementById("closeApi");
const toast = document.getElementById("toast");

function getApiKey() {
  return localStorage.getItem("weather_api_key");
}

function showToast(msg, clickable = false) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  if (!clickable) {
    setTimeout(() => toast.classList.add("hidden"), 3000);
  }
}

function checkApiOnLoad() {
  if (!getApiKey()) {
    showToast("API key not set. Click here to add it.", true);

    // Only open modal on click
    toast.onclick = () => {
      apiModal.classList.remove("hidden");
    };
  }
}


apiBtn.onclick = () => {
  apiInput.value = getApiKey() || "";
  apiModal.classList.remove("hidden");
};

closeApi.onclick = () => {
  apiModal.classList.add("hidden");
};

saveApi.onclick = () => {
  const key = apiInput.value.trim();
  if (!key) {
    alert("Please enter a valid API key.");
    return;
  }

  localStorage.setItem("weather_api_key", key);
  apiModal.classList.add("hidden");
  showToast("API key saved successfully!");
};

searchBtn.onclick = fetchWeather;

async function fetchWeather() {
  const city = cityInput.value.trim();
  const apiKey = getApiKey();

  if (!apiKey) {
    showToast("Please set your API key first.", true);
    apiModal.classList.remove("hidden");
    return;
  }

  if (!city) {
    showToast("Enter a city name.");
    return;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.cod !== 200) {
      showToast("City not found.");
      return;
    }

    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;
    const desc = data.weather[0].description;

    cityNameEl.textContent = data.name;
    tempEl.textContent = temp;
    conditionEl.textContent = desc;
    humidityEl.textContent = data.main.humidity;
    windEl.textContent = Math.round(data.wind.speed);

    adviceEl.textContent = generateAdvice(temp, condition);
    applyTheme(condition);
  } catch {
    showToast("Error fetching weather.");
  }
}

function generateAdvice(temp, condition) {
  if (condition === "Rain") return "🌧️ It's raining – carry an umbrella!";
  if (temp > 35) return "🔥 Very hot – stay hydrated.";
  if (temp < 15) return "🧣 Cold outside – wear warm clothes.";
  if (condition === "Clouds") return "☁️ Calm weather – perfect for a walk.";
  return "😊 Weather looks great – enjoy your day!";
}

function applyTheme(condition) {
  const hour = new Date().getHours();
  if (hour >= 19 || hour <= 5) {
    document.body.className = "night";
    return;
  }

  if (condition === "Rain") document.body.className = "rain";
  else if (condition === "Clouds") document.body.className = "clouds";
  else document.body.className = "clear";
}

checkApiOnLoad();