const usersEl = document.getElementById("usersCount");
const salesEl = document.getElementById("salesCount");
const ordersEl = document.getElementById("ordersCount");
const themeToggle = document.getElementById("themeToggle");

const canvas = document.getElementById("chart");
const ctx = canvas.getContext("2d");

let users = 1200;
let sales = 54000;
let orders = 320;

function animateCounter(element, target){
    let start = 0;
    const increment = target / 100;

    const interval = setInterval(()=>{
        start += increment;
        if(start >= target){
            element.textContent = target;
            clearInterval(interval);
        }else{
            element.textContent = Math.floor(start);
        }
    },20);
}

animateCounter(usersEl, users);
animateCounter(salesEl, sales);
animateCounter(ordersEl, orders);

let chartData = [100,200,150,300,250,400,350];

function drawChart(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const max = Math.max(...chartData);

    chartData.forEach((value,index)=>{
        const height = (value/max)*250;
        ctx.fillStyle="#4e73df";
        ctx.fillRect(index*90+40,280-height,50,height);
    });
}

drawChart();

// Simulate live updates
setInterval(()=>{
    chartData.shift();
    chartData.push(Math.floor(Math.random()*500+100));
    drawChart();
},2000);

themeToggle.addEventListener("click",()=>{
    document.body.classList.toggle("dark");
});
