function save(){
  const w = document.getElementById("word").value;
  if(w){
    const li = document.createElement("li");
    li.textContent = w;
    list.appendChild(li);
  }
}