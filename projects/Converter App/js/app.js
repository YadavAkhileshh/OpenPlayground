function showSection(id,el){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  document.querySelectorAll(".sidebar li").forEach(li=>li.classList.remove("active"));
  el.classList.add("active");
}

const units={
  length:{ meter:1, kilometer:1000, mile:1609.34 },
  weight:{ kilogram:1, gram:0.001, pound:0.453592 }
};

function populateUnits(){
  const category=document.getElementById("category").value;
  const from=document.getElementById("fromUnit");
  const to=document.getElementById("toUnit");

  document.getElementById("selectedCategory").innerText=category;

  from.innerHTML="";
  to.innerHTML="";

  if(category==="temperature"){
    ["celsius","fahrenheit","kelvin"].forEach(u=>{
      from.innerHTML+=`<option>${u}</option>`;
      to.innerHTML+=`<option>${u}</option>`;
    });
  }else{
    Object.keys(units[category]).forEach(u=>{
      from.innerHTML+=`<option>${u}</option>`;
      to.innerHTML+=`<option>${u}</option>`;
    });
  }
}

document.getElementById("category").addEventListener("change",populateUnits);
populateUnits();

function convert(){
  const category=document.getElementById("category").value;
  const value=parseFloat(document.getElementById("inputValue").value);
  const from=document.getElementById("fromUnit").value;
  const to=document.getElementById("toUnit").value;

  if(isNaN(value)) return;

  let result;

  if(category==="temperature"){
    result=convertTemp(value,from,to);
  }else{
    result=value*units[category][from]/units[category][to];
  }

  const output=`${value} ${from} → ${result.toFixed(4)} ${to}`;
  document.getElementById("result").innerText=output;
  document.getElementById("latestResult").innerText=output;

  addHistory(output);
}

function convertTemp(val,from,to){
  if(from===to) return val;
  if(from==="celsius"){
    if(to==="fahrenheit") return val*9/5+32;
    if(to==="kelvin") return val+273.15;
  }
  if(from==="fahrenheit"){
    if(to==="celsius") return (val-32)*5/9;
    if(to==="kelvin") return (val-32)*5/9+273.15;
  }
  if(from==="kelvin"){
    if(to==="celsius") return val-273.15;
    if(to==="fahrenheit") return (val-273.15)*9/5+32;
  }
}

function addHistory(text){
  const li=document.createElement("li");
  li.innerText=text;
  document.getElementById("historyList").appendChild(li);
}

function clearHistory(){
  document.getElementById("historyList").innerHTML="";
}