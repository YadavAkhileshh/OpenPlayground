const chat = document.getElementById("chat");

function send() {
  const msg = document.getElementById("msg").value;
  if (!msg) return;
  const p = document.createElement("p");
  p.textContent = msg;
  chat.appendChild(p);
  document.getElementById("msg").value = "";
}
