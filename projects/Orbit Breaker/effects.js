document.addEventListener("mousemove", (e) => {
  const dot = document.createElement("div");
  dot.style.position = "fixed";
  dot.style.left = e.clientX + "px";
  dot.style.top = e.clientY + "px";
  dot.style.width = "4px";
  dot.style.height = "4px";
  dot.style.borderRadius = "50%";
  dot.style.background = "rgba(255,255,255,0.4)";
  dot.style.pointerEvents = "none";
  dot.style.zIndex = "9999";
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 300);
});
