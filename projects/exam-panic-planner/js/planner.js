const user = JSON.parse(localStorage.getItem("user"));
const plan = JSON.parse(localStorage.getItem("plan"));
const syllabus =
  JSON.parse(localStorage.getItem("syllabus"));


if(!user || !plan){
  window.location.href="setup.html";
}

const today = new Date().toISOString().split("T")[0];

document.getElementById("title").innerText =
  `Today's Plan for ${user.name}`;

const taskList = document.getElementById("taskList");

let todayPlan = plan.find(p=>p.date===today);

if(!todayPlan){
  taskList.innerHTML="<p>No tasks for today</p>";
}
else{
  todayPlan.tasks.forEach((task,i)=>{
    if(task.completed===undefined){
      task.completed=false;
    }

    const div=document.createElement("div");
    div.classList.add("card");

    div.innerHTML=`
      <label>
        <input type="checkbox" ${task.completed?"checked":""}>
        ${task.subject} - ${task.unit} (${task.hours}h)
      </label>
    `;

    const checkbox=div.querySelector("input");

    checkbox.addEventListener("change",()=>{
      task.completed=checkbox.checked;
    });

    taskList.appendChild(div);
  });
}

document.getElementById("saveBtn").addEventListener("click",()=>{
  localStorage.setItem("plan",JSON.stringify(plan));
  alert("Progress saved");
});

const progress = calculateProgress(plan);

document.getElementById("progressBox")
.innerText = `Progress: ${progress}%`;

if (typeof checkPanic !== 'undefined') {
const panic = checkPanic(user, syllabus);

if(panic){
  const banner=document.getElementById("panicBanner");
  banner.innerText="🚨 Panic Mode: You are falling behind!";
  banner.style.color="red";
}
}