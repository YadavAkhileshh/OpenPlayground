AOS.init({duration:800});

function showPage(page){

document.querySelectorAll(".page").forEach(p=>{
p.classList.remove("active")
})

document.getElementById(page).classList.add("active")

}

function calculateBMI(){

let height=document.getElementById("height").value/100
let weight=document.getElementById("weight").value

let bmi=weight/(height*height)

document.getElementById("bmiResult").innerText="BMI: "+bmi.toFixed(2)

}

function calculateCalories(){

let age=document.getElementById("age").value
let weight=document.getElementById("weight2").value
let height=document.getElementById("height2").value
let activity=document.getElementById("activity").value

let bmr=10*weight + 6.25*height - 5*age + 5
let calories=bmr*activity

document.getElementById("calorieResult").innerText="Daily Calories: "+Math.round(calories)

}