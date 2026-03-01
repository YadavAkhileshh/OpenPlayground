const canvas = document.getElementById("canvas");
const clearBtn = document.getElementById("clearBtn");

let selectedType = "text";
let elements = [];

document.querySelectorAll("[data-type]").forEach(btn=>{
  btn.addEventListener("click",()=>{
    selectedType = btn.dataset.type;
  });
});

/* Add element on canvas click */
canvas.addEventListener("click", e=>{
  if(e.target !== canvas) return;

  const el = createElement(selectedType);
  el.style.left = `${e.offsetX}px`;
  el.style.top = `${e.offsetY}px`;

  makeDraggable(el);

  canvas.appendChild(el);
  elements.push(el);
});

function createElement(type){
  let el;

  if(type==="heading"){
    el = document.createElement("div");
    el.className = "element heading";
    el.textContent = "Heading";
  }

  if(type==="text"){
    el = document.createElement("div");
    el.className = "element text";
    el.textContent = "Sample text";
  }

  if(type==="button"){
    el = document.createElement("button");
    el.className = "element custom-btn";
    el.textContent = "Button";
  }

  if(type==="image"){
    el = document.createElement("img");
    el.className = "element image";
    el.src = "https://picsum.photos/200/120";
  }

  /* edit content */
  el.addEventListener("dblclick",()=>{
    if(type==="image"){
      const url = prompt("Enter image URL:", el.src);
      if(url) el.src = url;
    } else {
      const txt = prompt("Edit text:", el.textContent);
      if(txt) el.textContent = txt;
    }
  });

  return el;
}

/* Drag system */
function makeDraggable(el){
  let dragging=false, offsetX=0, offsetY=0;

  el.addEventListener("mousedown",e=>{
    dragging=true;
    offsetX=e.offsetX;
    offsetY=e.offsetY;
  });

  document.addEventListener("mousemove",e=>{
    if(!dragging) return;

    const rect = canvas.getBoundingClientRect();
    el.style.left = `${e.clientX-rect.left-offsetX}px`;
    el.style.top = `${e.clientY-rect.top-offsetY}px`;
  });

  document.addEventListener("mouseup",()=>{
    dragging=false;
  });
}

/* Clear canvas */
clearBtn.addEventListener("click",()=>{
  elements.forEach(el=>el.remove());
  elements=[];
});