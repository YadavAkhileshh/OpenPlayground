const icons = document.querySelectorAll(".icon");
const windows = {
  files: document.getElementById("filesWindow"),
  notes: document.getElementById("notesWindow"),
  calc: document.getElementById("calcWindow")
};

/* Open apps */
icons.forEach(icon=>{
  icon.addEventListener("dblclick",()=>{
    const app = icon.dataset.app;
    windows[app].style.display = "block";
    bringToFront(windows[app]);
  });
});

/* Close buttons */
document.querySelectorAll(".close").forEach(btn=>{
  btn.addEventListener("click",()=>{
    btn.closest(".window").style.display="none";
  });
});

/* Draggable windows */
let zIndex = 10;

function bringToFront(win){
  win.style.zIndex = ++zIndex;
}

document.querySelectorAll(".window").forEach(win=>{
  const bar = win.querySelector(".titlebar");
  let dragging=false, offsetX=0, offsetY=0;

  bar.addEventListener("mousedown",e=>{
    dragging=true;
    bringToFront(win);
    offsetX=e.clientX - win.offsetLeft;
    offsetY=e.clientY - win.offsetTop;
  });

  document.addEventListener("mousemove",e=>{
    if(!dragging) return;
    win.style.left = (e.clientX-offsetX)+"px";
    win.style.top = (e.clientY-offsetY)+"px";
  });

  document.addEventListener("mouseup",()=>{
    dragging=false;
  });
});

/* Calculator */
document.getElementById("calcBtn").addEventListener("click",()=>{
  const input = document.getElementById("calcInput").value;
  const result = document.getElementById("calcResult");

  try{
    result.textContent = "Result: " + eval(input);
  }catch{
    result.textContent = "Result: Error";
  }
});

/* Clock */
function updateClock(){
  document.getElementById("clock").textContent =
    new Date().toLocaleTimeString();
}
setInterval(updateClock,1000);
updateClock();