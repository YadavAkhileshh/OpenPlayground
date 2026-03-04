let mix = [];

function addIngredient(item){
  if(mix.length < 2){
    mix.push(item);
    document.getElementById("cauldron").classList.add("glow");
  }

  if(mix.length === 2){
    createPotion();
  }
}

function createPotion(){
  let result = document.getElementById("result");
  let combo = mix.sort().join("-");

  if(combo === "fire-water"){
    result.innerText = "🌫 Steam Potion Created!";
  }
  else if(combo === "leaf-water"){
    result.innerText = "💚 Healing Potion Created!";
  }
  else if(combo === "fire-leaf"){
    result.innerText = "☠ Poison Potion Created!";
  }
  else if(combo === "energy-fire"){
    result.innerText = "💥 Power Potion Created!";
  }
  else{
    result.innerText = "❓ Strange Potion... Try again!";
  }
}

function resetMix(){
  mix = [];
  document.getElementById("result").innerText = "";
  document.getElementById("cauldron").classList.remove("glow");
}