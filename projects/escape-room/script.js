let hasKey = false;
let bookRead = false;

function readBook(){
  bookRead = true;
  document.getElementById("message").innerText =
    "📖 The book says: 'The key opens the door...'";
}

function takeKey(){
  if(bookRead){
    hasKey = true;
    document.getElementById("inventory").innerText = "Inventory: 🗝️ Key";
    document.getElementById("message").innerText = "You picked up the key!";
    document.getElementById("key").style.display = "none";
  } else {
    document.getElementById("message").innerText =
      "Maybe read the book first...";
  }
}

function openDoor(){
  if(hasKey){
    document.getElementById("message").innerText =
      "🎉 You escaped the room!";
    document.getElementById("room").style.background = "green";
  } else {
    document.getElementById("message").innerText =
      "🚫 Door is locked. Find the key!";
  }
}