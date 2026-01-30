(function () {
  if ("ontouchstart" in window) return;

  const MAX = 8;
  const dots = [];

  document.addEventListener("mousemove", (e) => {
    if (!document.getElementById("cursorTrail")?.checked) return;

    const d = document.createElement("div");
    d.className = "cursor-dot";
    d.style.left = e.clientX + "px";
    d.style.top = e.clientY + "px";

    document.body.appendChild(d);
    dots.push(d);

    if (dots.length > MAX) dots.shift().remove();

    setTimeout(() => d.remove(), 600);
  });
})();
