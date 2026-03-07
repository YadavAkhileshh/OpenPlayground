const type = document.getElementById("type");
const fromUnit = document.getElementById("fromUnit");
const toUnit = document.getElementById("toUnit");

const units = {
temperature: ["Celsius","Fahrenheit","Kelvin"],
length: ["Meter","Kilometer","Centimeter"],
weight: ["Gram","Kilogram","Pound"]
};

function loadUnits(){
let selected = type.value;

fromUnit.innerHTML="";
toUnit.innerHTML="";

units[selected].forEach(unit=>{
let option1=document.createElement("option");
let option2=document.createElement("option");

option1.text=unit;
option2.text=unit;

fromUnit.add(option1);
toUnit.add(option2);
});
}

type.addEventListener("change",loadUnits);
loadUnits();

function convert(){

let value=parseFloat(document.getElementById("inputValue").value);
let from=fromUnit.value;
let to=toUnit.value;
let typeValue=type.value;

let result=value;

if(typeValue==="temperature"){

if(from==="Celsius" && to==="Fahrenheit") result=value*9/5+32;
else if(from==="Fahrenheit" && to==="Celsius") result=(value-32)*5/9;
else if(from==="Celsius" && to==="Kelvin") result=value+273.15;
else if(from==="Kelvin" && to==="Celsius") result=value-273.15;
else result=value;

}

if(typeValue==="length"){

if(from==="Meter" && to==="Kilometer") result=value/1000;
else if(from==="Kilometer" && to==="Meter") result=value*1000;
else if(from==="Meter" && to==="Centimeter") result=value*100;
else if(from==="Centimeter" && to==="Meter") result=value/100;
else result=value;

}

if(typeValue==="weight"){

if(from==="Gram" && to==="Kilogram") result=value/1000;
else if(from==="Kilogram" && to==="Gram") result=value*1000;
else if(from==="Kilogram" && to==="Pound") result=value*2.2046;
else if(from==="Pound" && to==="Kilogram") result=value/2.2046;
else result=value;

}

document.getElementById("result").innerText="Result: "+result;
}