const card = document.getElementById("card");
const glow = document.getElementById("glow");

const sens = document.getElementById("sens");
const sensVal = document.getElementById("sensVal");
const flip = document.getElementById("flip");
const reset = document.getElementById("reset");

let sx=0, sy=0;

sens.oninput=()=>{
sensVal.textContent=sens.value;
};

document.addEventListener("mousemove",e=>{

const rect=card.getBoundingClientRect();
const x=e.clientX-rect.left;
const y=e.clientY-rect.top;

glow.style.setProperty("--x",x+"px");
glow.style.setProperty("--y",y+"px");

if(x<0||y<0||x>rect.width||y>rect.height) return;

const cx=rect.width/2;
const cy=rect.height/2;

const dx=(x-cx)/sens.value;
const dy=(y-cy)/sens.value;

sx+=(-dy-sx)*.2;
sy+=(dx-sy)*.2;

if(!flip.checked){
card.style.transform=`rotateX(${sx}deg) rotateY(${sy}deg)`;
}

glow.style.opacity=1;
});

card.onmouseleave=()=>{
sx=0; sy=0;
card.style.transform=flip.checked?"rotateY(180deg)":"rotateX(0) rotateY(0)";
glow.style.opacity=0;
};

flip.onchange=()=>{
card.style.transform=flip.checked?"rotateY(180deg)":"rotateX(0) rotateY(0)";
};

reset.onclick=()=>{
sens.value=15;
sensVal.textContent=15;
flip.checked=false;
card.style.transform="rotateX(0) rotateY(0)";
glow.style.opacity=0;
};
