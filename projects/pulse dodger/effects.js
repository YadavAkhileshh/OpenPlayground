setInterval(() => {
  if (!document.body.classList.contains("shake")) {
    arena.classList.add("shake");
    setTimeout(() => arena.classList.remove("shake"), 300);
  }
}, 3000);
