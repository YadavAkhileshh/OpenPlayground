const weatherData = [
    {city:"Paris",temp:"18°",condition:"Cloudy"},
    {city:"Tokyo",temp:"27°",condition:"Rainy"},
    {city:"Sydney",temp:"22°",condition:"Windy"},
    {city:"Dubai",temp:"35°",condition:"Hot"}
];

const btn = document.getElementById("changeBtn");
const city = document.querySelector("h1");
const temp = document.querySelector(".temp");
const condition = document.querySelector("p");

btn.addEventListener("click",()=>{
    const random = weatherData[Math.floor(Math.random()*weatherData.length)];
    city.textContent = random.city;
    temp.textContent = random.temp;
    condition.textContent = random.condition;
});
