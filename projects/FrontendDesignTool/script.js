const canvas = document.getElementById("canvas");
const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clearBtn");

let selectedType="text";
let elements=[];

/* select tool */
document.querySelectorAll("[data-type]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedType=btn.dataset.type;
  });
});

/* create elements */
function createElement(type){
  let el;

  if(type==="heading"){
    el=document.createElement("div");
    el.className="element heading";
    el.textContent="Heading";
  }

  if(type==="text"){
    el=document.createElement("div");
    el.className="element text";
    el.textContent="Sample text";
  }

  if(type==="button"){
    el=document.createElement("button");
    el.className="element ui-btn";
    el.textContent="Button";
  }

  if(type==="card"){
    el=document.createElement("div");
    el.className="element card";
    el.textContent="Card";
  }

  /* edit text */
  el.addEventListener("dblclick",()=>{
    const txt=prompt("Edit content:",el.textContent);
    if(txt) el.textContent=txt;
  });

  /* color change */
  el.addEventListener("click",(e)=>{
    e.stopPropagation();
    el.style.background=colorPicker.value;
  });

  makeDraggable(el);
  return el;
}

/* add to canvas */
canvas.addEventListener("click",e=>{
  if(e.target!==canvas) return;

  const el=createElement(selectedType);
  el.style.left=e.offsetX+"px";
  el.style.top=e.offsetY+"px";

  canvas.appendChild(el);
  elements.push(el);
});

/* drag system */
function makeDraggable(el){
  let dragging=false,offX=0,offY=0;

  el.addEventListener("mousedown",e=>{
    dragging=true;
    offX=e.offsetX;
    offY=e.offsetY;
  });

  document.addEventListener("mousemove",e=>{
    if(!dragging) return;
    const rect=canvas.getBoundingClientRect();
    el.style.left=(e.clientX-rect.left-offX)+"px";
    el.style.top=(e.clientY-rect.top-offY)+"px";
  });

  document.addEventListener("mouseup",()=>{
    dragging=false;
  });
}

/* clear */
clearBtn.addEventListener("click",()=>{
  elements.forEach(el=>el.remove());
  elements=[];
});