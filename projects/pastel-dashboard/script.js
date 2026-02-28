const tasks = document.getElementById("tasks");
const hours = document.getElementById("hours");
const goals = document.getElementById("goals");
const btn = document.getElementById("updateBtn");

function animateValue(element, start, end, duration){
    let startTime = null;

    function animation(currentTime){
        if(!startTime) startTime = currentTime;
        const progress = Math.min((currentTime - startTime)/duration,1);
        element.textContent = Math.floor(progress*(end-start)+start);
        if(progress < 1){
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

btn.addEventListener("click", ()=>{
    animateValue(tasks,0,Math.floor(Math.random()*100),1000);
    animateValue(hours,0,Math.floor(Math.random()*50),1000);
    animateValue(goals,0,Math.floor(Math.random()*20),1000);
});
