let red = document.getElementById("red");
let yellow = document.getElementById("yellow");
let green = document.getElementById("green");
let statusText = document.getElementById("status");
let timerText = document.getElementById("timer");
let countText = document.getElementById("count");
let road = document.getElementById("road");
let carBtn = document.getElementById("carBtn");
let particlesContainer = document.getElementById("particles");

let carCount = 0;
let cycleRunning = false;

function resetLights() {
    red.classList.remove("active");
    yellow.classList.remove("active");
    green.classList.remove("active");
}

function createParticles() {
    for(let i = 0; i < 5; i++) {
        let particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 15 + "s";
        particle.style.animationDuration = (12 + Math.random() * 8) + "s";
        particlesContainer.appendChild(particle);
        setTimeout(() => particle.remove(), 25000);
    }
}

function carDetected() {
    carCount++;
    countText.innerText = carCount;
    
    let carDiv = document.createElement("div");
    carDiv.className = "car";
    road.appendChild(carDiv);

    carBtn.style.background = "linear-gradient(145deg, #4a5568, #718096)";
    setTimeout(() => {
        carBtn.style.background = "linear-gradient(145deg, #2d3748, #4a5568)";
    }, 200);

    createParticles();

    if (!cycleRunning && statusText.innerText === "Waiting for car...") {
        cycleRunning = true;
        startCycle();
    }
}

function startCycle() {
    resetLights();
    red.classList.add("active");
    statusText.innerText = "STOP 🚫";
    statusText.style.color = "#ff4757";
    createParticles();
    
    startCountdown(4, () => {
        resetLights();
        green.classList.add("active");
        statusText.innerText = "GO ✅";
        statusText.style.color = "#2ed573";
        createParticles();
        
        setTimeout(() => {
            let cars = road.querySelectorAll('.car');
            cars.forEach((car, index) => {
                setTimeout(() => {
                    car.style.animation = 'carBounce 0.5s ease-out forwards, driveAway 1s ease-out forwards';
                }, index * 200);
            });
            
            setTimeout(() => {
                road.innerHTML = ""; 
                carCount = 0;
                countText.innerText = carCount;
                
                setTimeout(() => {
                    resetLights();
                    yellow.classList.add("active");
                    statusText.innerText = "WAIT ⚠️";
                    statusText.style.color = "#ffa502";
                    createParticles();
                    
                    setTimeout(() => {
                        resetLights();
                        statusText.innerText = "Waiting for car...";
                        statusText.style.color = "#ffeb3b";
                        timerText.innerText = "";
                        cycleRunning = false;
                    }, 2500);
                }, 3000);
            }, 2500);
        }, 2000);
    });
}

function startCountdown(seconds, nextStep) {
    let timeLeft = seconds;
    timerText.innerText = `Changing in: ${timeLeft}s`;

    let interval = setInterval(() => {
        timeLeft--;
        timerText.innerText = `Changing in: ${timeLeft}s`;
        createParticles();
        
        if (timeLeft <= 0) {
            clearInterval(interval);
            timerText.innerText = "";
            nextStep();
        }
    }, 1000);
}

const driveAwayStyle = document.createElement('style');
driveAwayStyle.textContent = `
    @keyframes driveAway {
        to { transform: translateX(100vw) scale(0.5); opacity: 0; }
    }
`;
document.head.appendChild(driveAwayStyle);

setInterval(createParticles, 3000);
